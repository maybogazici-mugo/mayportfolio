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
	mux.HandleFunc("/api/contact", contactHandler(cfg))
	mux.HandleFunc("/api/appointments", appointmentHandler(cfg))
	mux.Handle("/", http.FileServer(http.Dir(".")))

	addr := ":" + cfg.Port
	log.Printf("server listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func loadConfig() (config, error) {
	smtpPort, err := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	if err != nil {
		return config{}, fmt.Errorf("SMTP_PORT must be a number: %w", err)
	}

	cfg := config{
		Port:                   getEnv("PORT", "8080"),
		SMTPHost:               os.Getenv("SMTP_HOST"),
		SMTPPort:               smtpPort,
		SMTPUsername:           os.Getenv("SMTP_USERNAME"),
		SMTPPassword:           os.Getenv("SMTP_PASSWORD"),
		ToEmail:                os.Getenv("CONTACT_TO_EMAIL"),
		FromEmail:              os.Getenv("CONTACT_FROM_EMAIL"),
		AllowedOrigin:          os.Getenv("ALLOWED_ORIGIN"),
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
		return time.Time{}, time.Time{}, "", errors.New("invalid timezone")
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
		return errors.New("calendar availability returned an error")
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
	origin := "*"
	if allowedOrigin != "" {
		origin = allowedOrigin
	}

	if r.Header.Get("Origin") != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
