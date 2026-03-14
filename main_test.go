package main

import (
	"strings"
	"testing"
	"time"

	"google.golang.org/api/calendar/v3"
)

func TestBuildCalendarEventOmitsAttendees(t *testing.T) {
	startAt := time.Date(2026, time.March, 20, 14, 30, 0, 0, time.UTC)
	endAt := startAt.Add(30 * time.Minute)

	event := buildCalendarEvent(appointmentRequest{
		Name:     "Jane Doe",
		Email:    "jane@example.com",
		Notes:    "Discuss automation setup",
		Timezone: "Europe/Istanbul",
	}, startAt, endAt, "Europe/Istanbul")

	if event == nil {
		t.Fatal("expected event")
	}
	if len(event.Attendees) != 0 {
		t.Fatalf("expected no attendees, got %d", len(event.Attendees))
	}
	if event.ConferenceData == nil || event.ConferenceData.CreateRequest == nil {
		t.Fatal("expected conference data create request")
	}
	if event.ConferenceData.CreateRequest.ConferenceSolutionKey != nil {
		t.Fatal("expected conference type to be omitted so Google can pick a supported provider")
	}
	if got := event.Start.TimeZone; got != "Europe/Istanbul" {
		t.Fatalf("expected timezone to be preserved, got %q", got)
	}
}

func TestCompactEmailsDropsEmptyValues(t *testing.T) {
	got := compactEmails([]string{" admin@example.com ", "", "   ", "user@example.com"})

	if len(got) != 2 {
		t.Fatalf("expected 2 emails, got %d", len(got))
	}
	if got[0] != "admin@example.com" || got[1] != "user@example.com" {
		t.Fatalf("unexpected emails: %#v", got)
	}
}

func TestBuildAppointmentConfirmationBodyUsesReadableTimesAndFallbackEventLink(t *testing.T) {
	cfg := config{DefaultMeetingTimezone: "Europe/Istanbul"}
	req := appointmentRequest{
		Name:     "Jane Doe",
		Email:    "jane@example.com",
		Timezone: "Europe/Istanbul",
	}
	event := &calendar.Event{
		HtmlLink: "https://calendar.google.com/event?eid=123",
		Start: &calendar.EventDateTime{
			DateTime: "2026-03-20T14:30:00+03:00",
			TimeZone: "Europe/Istanbul",
		},
		End: &calendar.EventDateTime{
			DateTime: "2026-03-20T15:00:00+03:00",
			TimeZone: "Europe/Istanbul",
		},
	}

	body := buildAppointmentConfirmationBody(cfg, req, event)

	for _, snippet := range []string{
		"Hi Jane Doe,",
		"Date: Friday, 20 March 2026",
		"Time: 14:30 - 15:00",
		"Timezone: Europe/Istanbul",
		"Calendar event: https://calendar.google.com/event?eid=123",
	} {
		if !strings.Contains(body, snippet) {
			t.Fatalf("expected body to contain %q, got %q", snippet, body)
		}
	}

	if strings.Contains(body, "Google Meet:") {
		t.Fatalf("did not expect a Google Meet line when no meet link is available: %q", body)
	}
}

func TestBuildAvailabilityDaysFiltersBusyAndPastSlots(t *testing.T) {
	cfg := config{
		WorkingDays:      parseWorkingDays("1,2,3,4,5"),
		WorkingHourStart: 9,
		WorkingHourEnd:   12,
	}
	location := time.FixedZone("UTC+3", 3*60*60)
	startDate := time.Date(2026, time.March, 16, 0, 0, 0, 0, location)
	now := time.Date(2026, time.March, 16, 8, 55, 0, 0, location)
	busy := []timeInterval{
		{
			Start: time.Date(2026, time.March, 16, 9, 30, 0, 0, location),
			End:   time.Date(2026, time.March, 16, 10, 0, 0, 0, location),
		},
	}

	days := buildAvailabilityDays(cfg, startDate, 1, 30, location, busy, now)
	if len(days) != 1 {
		t.Fatalf("expected 1 day, got %d", len(days))
	}

	got := make([]string, 0, len(days[0].Slots))
	for _, slot := range days[0].Slots {
		got = append(got, slot.StartAt)
	}

	want := []string{
		"2026-03-16T10:00",
		"2026-03-16T10:30",
		"2026-03-16T11:00",
		"2026-03-16T11:30",
	}
	if strings.Join(got, ",") != strings.Join(want, ",") {
		t.Fatalf("unexpected slots: got %v want %v", got, want)
	}
}
