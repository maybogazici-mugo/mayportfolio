# NexGen Automations Website + Go Contact API

This repository now includes:

- Static frontend (`index.html`, `assets/*`)
- Go backend with `/api/contact` endpoint (`main.go`)
- SMTP-based server-side email sending
- Google Meet appointment endpoint (`/api/appointments`) via Google Calendar API

## 1. Configure Environment Variables

Set these before running:

```bash
export PORT=8080
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-smtp-username
export SMTP_PASSWORD=your-smtp-password
export CONTACT_TO_EMAIL=you@yourdomain.com
export CONTACT_FROM_EMAIL=you@yourdomain.com
# Optional (for cross-origin frontend calls):
export ALLOWED_ORIGIN=https://your-frontend-domain.com
export GOOGLE_CALENDAR_ID=primary_or_calendar_id@group.calendar.google.com
export GOOGLE_SERVICE_ACCOUNT_FILE=/absolute/path/to/service-account.json
# Alternative:
# export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
export DEFAULT_MEETING_TIMEZONE=Europe/Istanbul
export WORKING_DAYS=1,2,3,4,5
export WORKING_HOUR_START=9
export WORKING_HOUR_END=18
```

Notes:

- `CONTACT_FROM_EMAIL` defaults to `SMTP_USERNAME` if omitted.
- Alternate env names are also accepted for deployments that use different keys:
  - `MAIL_HOST` for `SMTP_HOST`
  - `MAIL_PORT` for `SMTP_PORT`
  - `SMTP_USER` / `MAIL_USERNAME` / `MAIL_USER` for `SMTP_USERNAME`
  - `SMTP_PASS` / `MAIL_PASSWORD` / `MAIL_PASS` for `SMTP_PASSWORD`
  - `CONTACT_EMAIL` / `TO_EMAIL` for `CONTACT_TO_EMAIL`
  - `FROM_EMAIL` for `CONTACT_FROM_EMAIL`
  - `CORS_ALLOWED_ORIGIN` for `ALLOWED_ORIGIN`
- Use SMTP app passwords/API keys where your provider requires them.
- For Google Meet scheduling, share Muhammed's Google Calendar with the service account email as "Make changes to events".
- `WORKING_DAYS` uses weekday numbers (`0=Sunday ... 6=Saturday`).
- `WORKING_HOUR_START` and `WORKING_HOUR_END` are local hours in `DEFAULT_MEETING_TIMEZONE`.

## 2. Run the Server

```bash
go run .
```

Then open:

- `http://localhost:8080` (frontend)
- `POST http://localhost:8080/api/contact` (backend endpoint)
- `POST http://localhost:8080/api/appointments` (Google Meet appointment endpoint)

## Frontend API Routing (Important)

If your frontend is deployed separately from the Go API, the form requests will 404 unless the API base is configured.

Set one of these:

1. `index.html` meta tag:

```html
<meta name="api-base-url" content="https://api.nexgenautomations.net">
```

2. Global window override before loading the main JS:

```html
<script>window.__API_BASE_URL__ = "https://api.nexgenautomations.net";</script>
```

Fallback behavior:

- The frontend first uses configured API base (if set).
- It then tries `https://api.<current-hostname>` automatically.
- Finally it falls back to same-origin paths (`/api/contact`, `/contact`, etc.).

## 3. API Contract

`POST /api/contact`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "service": "Smart Chatbots",
  "message": "I want to automate lead handling."
}
```

Response:

- `200 OK` with `{ "message": "Message sent" }` on success
- `400` for invalid payload
- `500` if SMTP send fails

## 4. Appointment API Contract

`POST /api/appointments`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "startAt": "2026-03-20T14:30",
  "durationMinutes": 30,
  "timezone": "Europe/Istanbul",
  "notes": "I want to discuss automation setup."
}
```

Response:

- `200 OK` with `meetLink` and event details
- `400` for invalid payload/date/time/working-hours violations
- `409` if selected time is already booked
- `500` if Google Calendar event creation fails

## 5. Deploy on Northflank (Non-Serverless)

This project is ready for container deployment using the included [Dockerfile](/home/berk/may-softworks/mayportfolio/Dockerfile).

### Northflank Setup

1. Push this repository to GitHub/GitLab.
2. In Northflank, create a new service from your repository.
3. Build settings:
   - Build type: Dockerfile
   - Dockerfile path: `Dockerfile`
4. Networking:
   - Expose port `8080`
   - Public endpoint enabled
5. Health check:
   - Path: `/healthz`
   - Protocol: HTTP
6. Add environment variables:
   - `PORT=8080`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `ALLOWED_ORIGIN` (your production domain)
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (full service account JSON as one env var)
   - `DEFAULT_MEETING_TIMEZONE` (example: `Europe/Istanbul`)
   - `WORKING_DAYS` (example: `1,2,3,4,5`)
   - `WORKING_HOUR_START` (example: `9`)
   - `WORKING_HOUR_END` (example: `18`)
   - Important: these must be set as runtime service environment variables (not only build-time variables).
7. Deploy service.
8. Attach your custom domain in Northflank.

### Google Calendar Permission Checklist

1. Google Calendar API enabled in Google Cloud.
2. Service account created.
3. Muhammed's calendar shared with service account email.
4. Permission level: make changes to events.
5. Bookings are created as private busy events where guests cannot modify/invite others; Muhammed can fully edit/reschedule/cancel from Google Calendar.

### Post-Deploy Tests

1. Open your domain and submit the contact form.
2. Book a meeting from the appointment form.
3. Confirm:
   - Google Meet link is returned on the page.
   - Event appears in Muhammed's calendar.
   - Invite email arrives to the attendee.
