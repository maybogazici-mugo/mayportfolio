package main

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type config struct {
	Port                   string
	SMTPHost               string
	SMTPPort               int
	SMTPUsername           string
	SMTPPassword           string
	ToEmail                string
	FromEmail              string
	AllowedOrigin          string
	RequestTimeout         time.Duration
	GoogleCalendarID       string
	GoogleCredentialsJSON  string
	GoogleCredentialsFile  string
	DefaultMeetingTimezone string
	WorkingDays            map[time.Weekday]bool
	WorkingHourStart       int
	WorkingHourEnd         int
}

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Service string `json:"service"`
	Message string `json:"message"`
}

type apiResponse struct {
	Message string `json:"message"`
}

type appointmentRequest struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	StartAt         string `json:"startAt"`
	DurationMinutes int    `json:"durationMinutes"`
	Timezone        string `json:"timezone"`
	Notes           string `json:"notes"`
}

type appointmentResponse struct {
	Message      string `json:"message"`
	MeetLink     string `json:"meetLink"`
	EventLink    string `json:"eventLink"`
	EventID      string `json:"eventId"`
	StartRFC3339 string `json:"start"`
	EndRFC3339   string `json:"end"`
}

var errSlotUnavailable = errors.New("selected time is already booked")

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthHandler)
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/healths", healthHandler)
	mux.HandleFunc("/api/contact", contactHandler(cfg))
	mux.HandleFunc("/contact", contactHandler(cfg))
	mux.HandleFunc("/api/appointments", appointmentHandler(cfg))
	mux.HandleFunc("/appointments", appointmentHandler(cfg))
	mux.Handle("/", http.FileServer(http.Dir(".")))

	handler := withCORS(mux, cfg.AllowedOrigin)

	addr := ":" + cfg.Port
	log.Printf("server listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func loadConfig() (config, error) {
	smtpPortRaw := getEnvFromKeys([]string{"SMTP_PORT", "MAIL_PORT"}, "587")
	smtpPort, err := strconv.Atoi(smtpPortRaw)
	if err != nil {
		return config{}, fmt.Errorf("SMTP_PORT must be a number: %w", err)
	}

	cfg := config{
		Port:                   getEnv("PORT", "8080"),
		SMTPHost:               firstNonEmptyEnv("SMTP_HOST", "MAIL_HOST"),
		SMTPPort:               smtpPort,
		SMTPUsername:           firstNonEmptyEnv("SMTP_USERNAME", "SMTP_USER", "MAIL_USERNAME", "MAIL_USER"),
		SMTPPassword:           firstNonEmptyEnv("SMTP_PASSWORD", "SMTP_PASS", "MAIL_PASSWORD", "MAIL_PASS"),
		ToEmail:                firstNonEmptyEnv("CONTACT_TO_EMAIL", "CONTACT_EMAIL", "TO_EMAIL"),
		FromEmail:              firstNonEmptyEnv("CONTACT_FROM_EMAIL", "FROM_EMAIL"),
		AllowedOrigin:          firstNonEmptyEnv("ALLOWED_ORIGIN", "CORS_ALLOWED_ORIGIN"),
		RequestTimeout:         10 * time.Second,
		GoogleCalendarID:       os.Getenv("GOOGLE_CALENDAR_ID"),
		GoogleCredentialsJSON:  os.Getenv("GOOGLE_SERVICE_ACCOUNT_JSON"),
		GoogleCredentialsFile:  os.Getenv("GOOGLE_SERVICE_ACCOUNT_FILE"),
		DefaultMeetingTimezone: getEnv("DEFAULT_MEETING_TIMEZONE", "Europe/Istanbul"),
		WorkingHourStart:       9,
		WorkingHourEnd:         18,
	}
	cfg.WorkingDays = parseWorkingDays(getEnv("WORKING_DAYS", "1,2,3,4,5"))

	startHour, err := strconv.Atoi(getEnv("WORKING_HOUR_START", "9"))
	if err != nil || startHour < 0 || startHour > 23 {
		return config{}, errors.New("WORKING_HOUR_START must be an integer between 0 and 23")
	}
	endHour, err := strconv.Atoi(getEnv("WORKING_HOUR_END", "18"))
	if err != nil || endHour < 1 || endHour > 24 {
		return config{}, errors.New("WORKING_HOUR_END must be an integer between 1 and 24")
	}
	if endHour <= startHour {
		return config{}, errors.New("WORKING_HOUR_END must be greater than WORKING_HOUR_START")
	}
	cfg.WorkingHourStart = startHour
	cfg.WorkingHourEnd = endHour

	if cfg.FromEmail == "" {
		cfg.FromEmail = cfg.SMTPUsername
	}

	missing := make([]string, 0, 7)
	if cfg.SMTPHost == "" {
		missing = append(missing, "SMTP_HOST")
	}
	if cfg.SMTPUsername == "" {
		missing = append(missing, "SMTP_USERNAME")
	}
	if cfg.SMTPPassword == "" {
		missing = append(missing, "SMTP_PASSWORD")
	}
	if cfg.ToEmail == "" {
		missing = append(missing, "CONTACT_TO_EMAIL")
	}
	if cfg.FromEmail == "" {
		missing = append(missing, "CONTACT_FROM_EMAIL or SMTP_USERNAME")
	}
	if len(missing) > 0 {
		return config{}, fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}

	return cfg, nil
}

func contactHandler(cfg config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w, r, cfg.AllowedOrigin)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req contactRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON body", http.StatusBadRequest)
			return
		}

		if err := validateContactRequest(req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), cfg.RequestTimeout)
		defer cancel()

		if err := sendContactEmail(ctx, cfg, req); err != nil {
			log.Printf("email send failed: %v", err)
			http.Error(w, "failed to send message", http.StatusInternalServerError)
			return
		}
		if err := sendContactAcknowledgementEmail(ctx, cfg, req); err != nil {
			log.Printf("contact acknowledgement send failed: %v", err)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(apiResponse{Message: "Message sent"})
	}
}

func appointmentHandler(cfg config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w, r, cfg.AllowedOrigin)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if cfg.GoogleCalendarID == "" || (cfg.GoogleCredentialsJSON == "" && cfg.GoogleCredentialsFile == "") {
			http.Error(w, "meeting service is not configured", http.StatusServiceUnavailable)
			return
		}

		var req appointmentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON body", http.StatusBadRequest)
			return
		}

		startAt, endAt, tz, err := validateAppointmentRequest(cfg, req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), cfg.RequestTimeout)
		defer cancel()

			if err := ensureAppointmentAvailability(ctx, cfg, startAt, endAt); err != nil {
				if errors.Is(err, errSlotUnavailable) {
					http.Error(w, err.Error(), http.StatusConflict)
				} else if err.Error() == "meeting service is unavailable" {
					log.Printf("availability check failed: %v", err)
					http.Error(w, err.Error(), http.StatusServiceUnavailable)
				} else if err.Error() == "calendar availability could not be verified" || strings.HasPrefix(err.Error(), "calendar availability error:") {
					log.Printf("availability check failed: %v", err)
					http.Error(w, err.Error(), http.StatusBadGateway)
				} else {
					log.Printf("availability check failed: %v", err)
					http.Error(w, "failed to verify appointment availability", http.StatusInternalServerError)
				}
				return
		}

		createdEvent, err := createMeetEvent(ctx, cfg, req, startAt, endAt, tz)
		if err != nil {
			log.Printf("appointment create failed: %v", err)
			http.Error(w, "failed to create meeting", http.StatusInternalServerError)
			return
		}
		if err := sendAppointmentConfirmationEmail(ctx, cfg, req, createdEvent); err != nil {
			log.Printf("appointment confirmation send failed: %v", err)
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(appointmentResponse{
			Message:      "Meeting created",
			MeetLink:     createdEvent.HangoutLink,
			EventLink:    createdEvent.HtmlLink,
			EventID:      createdEvent.Id,
			StartRFC3339: createdEvent.Start.DateTime,
			EndRFC3339:   createdEvent.End.DateTime,
		})
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(apiResponse{Message: "ok"})
}

func validateContactRequest(req contactRequest) error {
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Service = strings.TrimSpace(req.Service)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Email == "" || req.Service == "" || req.Message == "" {
		return errors.New("all fields are required")
	}

	if _, err := mail.ParseAddress(req.Email); err != nil {
		return errors.New("invalid email address")
	}

	if len(req.Message) > 4000 {
		return errors.New("message is too long")
	}

	return nil
}

func sendContactEmail(ctx context.Context, cfg config, req contactRequest) error {
	subject := fmt.Sprintf("New contact form lead: %s", req.Name)
	body := fmt.Sprintf(
		"You received a new contact form submission.\r\n\r\nName: %s\r\nEmail: %s\r\nService: %s\r\n\r\nMessage:\r\n%s\r\n",
		req.Name,
		req.Email,
		req.Service,
		req.Message,
	)

	msg := strings.Join([]string{
		fmt.Sprintf("From: %s", cfg.FromEmail),
		fmt.Sprintf("To: %s", cfg.ToEmail),
		fmt.Sprintf("Reply-To: %s", req.Email),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")

	errChan := make(chan error, 1)
	go func() {
		errChan <- sendSMTP(cfg, []byte(msg))
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	}
}

func sendContactAcknowledgementEmail(ctx context.Context, cfg config, req contactRequest) error {
	subject := "We received your message"
	body := fmt.Sprintf(
		"Hi %s,\r\n\r\nThanks for contacting us. We received your request and will get back to you shortly.\r\n\r\nService: %s\r\nMessage:\r\n%s\r\n",
		req.Name,
		req.Service,
		req.Message,
	)

	msg := strings.Join([]string{
		fmt.Sprintf("From: %s", cfg.FromEmail),
		fmt.Sprintf("To: %s", req.Email),
		fmt.Sprintf("Reply-To: %s", cfg.ToEmail),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")

	errChan := make(chan error, 1)
	go func() {
		errChan <- sendSMTP(cfg, []byte(msg))
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	}
}

func validateAppointmentRequest(cfg config, req appointmentRequest) (time.Time, time.Time, string, error) {
	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(req.Email)
	startAtRaw := strings.TrimSpace(req.StartAt)
	timezone := strings.TrimSpace(req.Timezone)

	if timezone == "" {
		timezone = cfg.DefaultMeetingTimezone
	}

	if name == "" || email == "" || startAtRaw == "" {
		return time.Time{}, time.Time{}, "", errors.New("name, email and startAt are required")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return time.Time{}, time.Time{}, "", errors.New("invalid email address")
	}

	location, err := time.LoadLocation(timezone)
	if err != nil {
		fallback := strings.TrimSpace(cfg.DefaultMeetingTimezone)
		if fallback == "" {
			fallback = "UTC"
		}
		location, err = time.LoadLocation(fallback)
		if err != nil {
			location = time.UTC
			fallback = "UTC"
		}
		timezone = fallback
	}

	startAt, err := time.ParseInLocation("2006-01-02T15:04", startAtRaw, location)
	if err != nil {
		return time.Time{}, time.Time{}, "", errors.New("invalid startAt format")
	}

	if req.DurationMinutes <= 0 {
		req.DurationMinutes = 30
	}
	if req.DurationMinutes < 15 || req.DurationMinutes > 120 {
		return time.Time{}, time.Time{}, "", errors.New("durationMinutes must be between 15 and 120")
	}

	if startAt.Before(time.Now().Add(10 * time.Minute)) {
		return time.Time{}, time.Time{}, "", errors.New("startAt must be at least 10 minutes in the future")
	}

	endAt := startAt.Add(time.Duration(req.DurationMinutes) * time.Minute)
	if !cfg.WorkingDays[startAt.Weekday()] {
		return time.Time{}, time.Time{}, "", errors.New("appointments are only available on working days")
	}
	startMinutes := startAt.Hour()*60 + startAt.Minute()
	endMinutes := endAt.Hour()*60 + endAt.Minute()
	if endAt.Day() != startAt.Day() ||
		startMinutes < cfg.WorkingHourStart*60 ||
		endMinutes > cfg.WorkingHourEnd*60 {
		return time.Time{}, time.Time{}, "", fmt.Errorf(
			"appointments are only available between %02d:00 and %02d:00",
			cfg.WorkingHourStart,
			cfg.WorkingHourEnd,
		)
	}

	return startAt, endAt, timezone, nil
}

func ensureAppointmentAvailability(ctx context.Context, cfg config, startAt, endAt time.Time) error {
	svc, err := newCalendarService(ctx, cfg)
	if err != nil {
		return errors.New("meeting service is unavailable")
	}

	query := &calendar.FreeBusyRequest{
		TimeMin: startAt.Format(time.RFC3339),
		TimeMax: endAt.Format(time.RFC3339),
		Items: []*calendar.FreeBusyRequestItem{
			{Id: cfg.GoogleCalendarID},
		},
	}

	resp, err := svc.Freebusy.Query(query).Do()
	if err != nil {
		log.Printf("freebusy check failed: %v", err)
		return errors.New("failed to verify appointment availability")
	}

	cal, ok := resp.Calendars[cfg.GoogleCalendarID]
	if !ok {
		return errors.New("calendar availability could not be verified")
	}
	if len(cal.Errors) > 0 {
		details := make([]string, 0, len(cal.Errors))
		for _, apiErr := range cal.Errors {
			if apiErr == nil {
				continue
			}
			reason := strings.TrimSpace(apiErr.Reason)
			domain := strings.TrimSpace(apiErr.Domain)
			if reason == "" && domain == "" {
				continue
			}
			if domain == "" {
				details = append(details, reason)
			} else {
				details = append(details, fmt.Sprintf("%s:%s", domain, reason))
			}
		}
		if len(details) == 0 {
			return errors.New("calendar availability error: unknown")
		}
		return fmt.Errorf("calendar availability error: %s", strings.Join(details, ", "))
	}
	if len(cal.Busy) > 0 {
		return errSlotUnavailable
	}

	return nil
}

func createMeetEvent(
	ctx context.Context,
	cfg config,
	req appointmentRequest,
	startAt time.Time,
	endAt time.Time,
	timezone string,
) (*calendar.Event, error) {
	svc, err := newCalendarService(ctx, cfg)
	if err != nil {
		return nil, err
	}

	notes := strings.TrimSpace(req.Notes)
	if notes == "" {
		notes = "No additional notes."
	}

	event := &calendar.Event{
		Summary:     fmt.Sprintf("Google Meet appointment with %s", req.Name),
		Description: fmt.Sprintf("Booked from website.\n\nName: %s\nEmail: %s\n\nNotes:\n%s", req.Name, req.Email, notes),
		Start: &calendar.EventDateTime{
			DateTime: startAt.Format(time.RFC3339),
			TimeZone: timezone,
		},
		End: &calendar.EventDateTime{
			DateTime: endAt.Format(time.RFC3339),
			TimeZone: timezone,
		},
		Attendees: []*calendar.EventAttendee{
			{Email: req.Email},
		},
		GuestsCanModify:         false,
		GuestsCanInviteOthers:   boolPtr(false),
		GuestsCanSeeOtherGuests: boolPtr(false),
		Transparency:            "opaque",
		Visibility:              "private",
		ConferenceData: &calendar.ConferenceData{
			CreateRequest: &calendar.CreateConferenceRequest{
				RequestId: conferenceRequestID(),
				ConferenceSolutionKey: &calendar.ConferenceSolutionKey{
					Type: "hangoutsMeet",
				},
			},
		},
	}

	return svc.Events.
		Insert(cfg.GoogleCalendarID, event).
		ConferenceDataVersion(1).
		SendUpdates("all").
		Do()
}

func sendAppointmentConfirmationEmail(
	ctx context.Context,
	cfg config,
	req appointmentRequest,
	event *calendar.Event,
) error {
	if event == nil {
		return errors.New("appointment confirmation requires event details")
	}

	meetLink := strings.TrimSpace(event.HangoutLink)
	if meetLink == "" && event.ConferenceData != nil && len(event.ConferenceData.EntryPoints) > 0 {
		for _, entry := range event.ConferenceData.EntryPoints {
			if entry == nil {
				continue
			}
			if entry.EntryPointType == "video" && strings.TrimSpace(entry.Uri) != "" {
				meetLink = entry.Uri
				break
			}
		}
	}

	startAt := ""
	if event.Start != nil {
		startAt = strings.TrimSpace(event.Start.DateTime)
	}
	endAt := ""
	if event.End != nil {
		endAt = strings.TrimSpace(event.End.DateTime)
	}

	subject := "Your appointment is confirmed"
	body := fmt.Sprintf(
		"Hi %s,\r\n\r\nYour appointment is confirmed.\r\n\r\nStart: %s\r\nEnd: %s\r\nMeet Link: %s\r\n\r\nIf you need changes, reply to this email.\r\n",
		strings.TrimSpace(req.Name),
		startAt,
		endAt,
		meetLink,
	)

	msg := strings.Join([]string{
		fmt.Sprintf("From: %s", cfg.FromEmail),
		fmt.Sprintf("To: %s", strings.TrimSpace(req.Email)),
		fmt.Sprintf("Reply-To: %s", cfg.ToEmail),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")

	errChan := make(chan error, 1)
	go func() {
		errChan <- sendSMTP(cfg, []byte(msg))
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	}
}

func newCalendarService(ctx context.Context, cfg config) (*calendar.Service, error) {
	credsJSON := []byte(cfg.GoogleCredentialsJSON)
	if len(credsJSON) == 0 {
		fileBytes, err := os.ReadFile(cfg.GoogleCredentialsFile)
		if err != nil {
			return nil, fmt.Errorf("failed to read google credentials file: %w", err)
		}
		credsJSON = fileBytes
	}

	creds, err := google.CredentialsFromJSON(ctx, credsJSON, calendar.CalendarScope)
	if err != nil {
		return nil, fmt.Errorf("invalid google credentials: %w", err)
	}

	return calendar.NewService(ctx, option.WithTokenSource(creds.TokenSource))
}

func parseWorkingDays(raw string) map[time.Weekday]bool {
	result := make(map[time.Weekday]bool, 7)
	parts := strings.Split(raw, ",")
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}
		day, err := strconv.Atoi(trimmed)
		if err != nil || day < 0 || day > 6 {
			continue
		}
		result[time.Weekday(day)] = true
	}
	if len(result) == 0 {
		result[time.Monday] = true
		result[time.Tuesday] = true
		result[time.Wednesday] = true
		result[time.Thursday] = true
		result[time.Friday] = true
	}
	return result
}

func boolPtr(v bool) *bool {
	return &v
}

func conferenceRequestID() string {
	buffer := make([]byte, 12)
	if _, err := rand.Read(buffer); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 10)
	}
	return "meet-" + base64.RawURLEncoding.EncodeToString(buffer)
}

func sendSMTP(cfg config, msg []byte) error {
	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort)
	auth := smtp.PlainAuth("", cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPHost)

	if cfg.SMTPPort == 465 {
		tlsConn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: cfg.SMTPHost})
		if err != nil {
			return err
		}
		defer tlsConn.Close()

		client, err := smtp.NewClient(tlsConn, cfg.SMTPHost)
		if err != nil {
			return err
		}
		defer client.Close()

		if err := client.Auth(auth); err != nil {
			return err
		}
		if err := client.Mail(cfg.FromEmail); err != nil {
			return err
		}
		if err := client.Rcpt(cfg.ToEmail); err != nil {
			return err
		}

		wc, err := client.Data()
		if err != nil {
			return err
		}
		if _, err := wc.Write(msg); err != nil {
			wc.Close()
			return err
		}
		if err := wc.Close(); err != nil {
			return err
		}

		return client.Quit()
	}

	return smtp.SendMail(addr, auth, cfg.FromEmail, []string{cfg.ToEmail}, msg)
}

func setCORSHeaders(w http.ResponseWriter, r *http.Request, allowedOrigin string) {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	allowed := resolveAllowedOrigin(origin, allowedOrigin)
	if allowed != "" {
		w.Header().Set("Access-Control-Allow-Origin", allowed)
		w.Header().Set("Vary", "Origin")
	}
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func withCORS(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w, r, allowedOrigin)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func resolveAllowedOrigin(requestOrigin, allowedOriginEnv string) string {
	requestOrigin = strings.TrimSpace(requestOrigin)
	if requestOrigin == "" {
		return ""
	}

	allowedOriginEnv = strings.TrimSpace(allowedOriginEnv)
	if allowedOriginEnv == "" || allowedOriginEnv == "*" {
		return "*"
	}

	for _, candidate := range strings.Split(allowedOriginEnv, ",") {
		if strings.EqualFold(strings.TrimSpace(candidate), requestOrigin) {
			return requestOrigin
		}
	}

	return ""
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getEnvFromKeys(keys []string, fallback string) string {
	if value := firstNonEmptyEnv(keys...); value != "" {
		return value
	}
	return fallback
}

func firstNonEmptyEnv(keys ...string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value
		}
	}
	return ""
}
