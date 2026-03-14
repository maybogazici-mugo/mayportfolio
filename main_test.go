package main

import (
	"testing"
	"time"
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
	if got := event.ConferenceData.CreateRequest.ConferenceSolutionKey.Type; got != "hangoutsMeet" {
		t.Fatalf("expected hangoutsMeet conference, got %q", got)
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
