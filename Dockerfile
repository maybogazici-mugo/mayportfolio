# syntax=docker/dockerfile:1

FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/server .

FROM alpine:3.21
WORKDIR /app

RUN adduser -D -H -u 10001 appuser

COPY --from=builder /app/server /app/server
COPY index.html /app/index.html
COPY assets /app/assets

ENV PORT=8080
EXPOSE 8080

USER appuser
CMD ["/app/server"]
