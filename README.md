# NexGen Automations

Production-ready marketing site and API for contact collection and Google Meet appointment booking.

## Overview

This repository contains:

- Static frontend (`index.html`, `assets/*`)
- Go backend (`main.go`) with endpoints:
  - `POST /api/contact`
  - `POST /api/appointments`
- SMTP-based outbound email flow
- Google Calendar + Google Meet event creation

## Architecture

Recommended production architecture:

- Frontend: Vercel (`https://nexgenautomations.net`)
- Backend: Northflank public service
- Routing: Vercel rewrites `/api/*` to Northflank (see `vercel.json`)

This avoids browser CORS complexity because frontend calls same-origin paths (`/api/...`) and Vercel proxies server-side.

## Local Development

### 1) Environment variables

Set required variables before starting:

```bash
export PORT=8080

export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-smtp-username
export SMTP_PASSWORD=your-smtp-password
export CONTACT_TO_EMAIL=you@yourdomain.com
export CONTACT_FROM_EMAIL=you@yourdomain.com

export ALLOWED_ORIGIN=http://localhost:8080

export GOOGLE_CALENDAR_ID=maybogazici@gmail.com
# Preferred in deployments:
# export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
# Optional local alternative:
export GOOGLE_SERVICE_ACCOUNT_FILE=/absolute/path/to/service-account.json

export DEFAULT_MEETING_TIMEZONE=Europe/Istanbul
export WORKING_DAYS=1,2,3,4,5
export WORKING_HOUR_START=9
export WORKING_HOUR_END=18
```

### 2) Run

```bash
go run .
```

Open:

- `http://localhost:8080`
- `POST http://localhost:8080/api/contact`
- `POST http://localhost:8080/api/appointments`

## Deployment

### Vercel (Frontend)

1. Connect repo to Vercel.
2. Set production branch to `main`.
3. Ensure `vercel.json` is deployed from root.
4. Verify homepage source includes:
   - `<meta name="api-base-url" content="https://nexgenautomations.net">`

### Northflank (Backend)

1. Create service from this repo.
2. Build using `Dockerfile`.
3. Expose port `8080` and enable public endpoint.
4. Set health check path to `/healthz`.
5. Configure runtime environment variables:
   - `PORT=8080`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `ALLOWED_ORIGIN=https://nexgenautomations.net,https://www.nexgenautomations.net`
   - `GOOGLE_CALENDAR_ID=maybogazici@gmail.com`
   - `GOOGLE_SERVICE_ACCOUNT_JSON=<full JSON>`
   - `DEFAULT_MEETING_TIMEZONE=Europe/Istanbul`
   - `WORKING_DAYS=1,2,3,4,5`
   - `WORKING_HOUR_START=9`
   - `WORKING_HOUR_END=18`
6. Redeploy after every env change.

## Google Calendar Setup

1. Enable Google Calendar API in Google Cloud.
2. Create a service account.
3. Create/download service account JSON.
4. In Google Calendar (`maybogazici@gmail.com`), open **Settings and sharing**.
5. Under **Share with specific people or groups**, add service account `client_email`.
6. Grant **Make changes to events**.
7. Use calendar ID `maybogazici@gmail.com` (or exact ID from Integrate calendar).

## API Contracts

### `POST /api/contact`

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "service": "Smart Chatbots",
  "message": "I want to automate lead handling."
}
```

Responses:

- `200` success
- `400` validation error
- `500` SMTP failure

### `POST /api/appointments`

Request:

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

Responses:

- `200` success with `meetLink` + event details
- `400` invalid request / schedule constraints
- `409` time slot already booked
- `502` calendar availability provider error
- `503` meeting service unavailable

## Security Notes

- Never commit service account JSON files to git.
- Store credentials in deployment environment variables.
- If a private key is exposed, rotate immediately in Google Cloud and delete old key.
- Keep `.env` out of version control.

## Troubleshooting

### Contact form returns 404

Symptoms:

- `POST https://nexgenautomations.net/api/contact 404`

Checks:

- Confirm `vercel.json` rewrites are deployed.
- Confirm frontend uses `api-base-url` as `https://nexgenautomations.net`.

### CORS errors to `api.nexgenautomations.net`

Symptoms:

- Browser shows preflight blocked and `No 'Access-Control-Allow-Origin'`.

Cause:

- API subdomain points to wrong host (commonly Vercel), or backend CORS is misconfigured.

Fix:

- Prefer same-origin `/api/*` via Vercel rewrite.
- Ensure backend `ALLOWED_ORIGIN` matches production origins.

### Appointment returns `meeting service is unavailable`

Cause:

- Missing/invalid `GOOGLE_SERVICE_ACCOUNT_JSON` and/or `GOOGLE_CALENDAR_ID`.

Fix:

- Set both env vars in Northflank runtime and redeploy.

### Appointment returns `calendar availability error: global:notFound`

Cause:

- Wrong `GOOGLE_CALENDAR_ID`.

Fix:

- Use exact calendar ID from Google Calendar settings.

### Appointment returns `calendar availability error: global:forbidden`

Cause:

- Service account has no access to calendar.

Fix:

- Share calendar with service account `client_email` and grant **Make changes to events**.

## Quick Production Verification

```bash
# frontend source includes expected api-base-url
curl -sS https://nexgenautomations.net/ | grep api-base-url

# preflight should return 204 and Access-Control-Allow-Origin
curl -i -X OPTIONS 'https://nexgenautomations.net/api/contact' \
  -H 'Origin: https://nexgenautomations.net' \
  -H 'Access-Control-Request-Method: POST'

# health check directly on Northflank backend
curl -i https://p01--mayportfolio--87ypb67yghg9.code.run/healthz
```

## File Reference

- Backend entry: `main.go`
- Frontend HTML: `index.html`
- Frontend JS: `assets/index-D0EcsKkB.js`
- Vercel routing: `vercel.json`
- Container build: `Dockerfile`
