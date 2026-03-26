---
description: "Expert skill for the ToK Backend. TRIGGER when the user mentions: backend, server, API, endpoint, route, database, DB, PostgreSQL, webhook, n8n webhook, YCloud, Socket.IO, Google Calendar API, Resend email, migrations, server.js, middleware, authentication, or any backend/server-side work."
---

# ToK Backend Expert

You are an expert on the ToK Backend (Express + PostgreSQL).

## Architecture

**Single file**: `tok-backend/server.js` (~2028 lines)
**Stack**: Express, pg (PostgreSQL), Socket.IO, Clerk auth, Google APIs, Resend, Multer

## Route Map (line numbers)

### Auth & Users
- `POST /auth/sync` (177) — Sync Clerk user with local DB
- `GET /auth/me` (204) — Get authenticated user profile
- `POST /admin/create-user` (236) — Create user in company
- `POST /admin/invite-worker` (253) — Create worker + user + Clerk invitation

### Webhooks (from n8n)
- `POST /webhook/n8n` (294) — Receive messages from n8n, save to DB, emit socket, download media
- `POST /webhook/booking` (503) — Receive booking from n8n, create appointment + Google Calendar event
- `POST /contacts/history` (964) — Add contact history entry

### Messages
- `POST /messages/send` (440) — Proxy frontend → n8n for WhatsApp messages

### Contacts
- `GET /contacts/:phone` (874) — Get contact with next appointment + history
- `POST /contacts/create` (898) — Create contact manually
- `PUT /contacts/:phone/bot-toggle` (930) — Toggle bot on/off
- `DELETE /contacts/:phone` (948) — Delete contact
- `PUT /contacts/update-etapa` (841) — Update funnel stage

### Conversations
- `PUT /conversations/update-etiqueta` (823) — Update conversation label
- `PUT /conversations/etiqueta/by-phone` (856) — Update label by phone

### Appointments
- `POST /appointments` (1006) — Create appointment + Google Calendar + email
- `GET /appointments?from=&to=` — List appointments in range
- `GET /availability` (1079) — Check available slots via Google Calendar
- `POST /appointments/:id/reschedule` (1143) — Reschedule + Google Calendar
- `DELETE /appointments/:id` (1202) — Cancel + remove from Google Calendar

### Stats
- `GET /stats/dashboard` (1247) — Dashboard analytics with deltas

### Google Calendar
- `GET /auth/google/url` (1608) — Generate OAuth URL
- `GET /auth/google/callback` (1628) — OAuth callback handler
- `DELETE /auth/google/disconnect` (1666) — Disconnect Google
- `POST /workers/:id/create-calendar` (1680) — Create sub-calendar

### Settings
- `GET /company/settings` (1706) — Get company settings
- `PUT /company/settings` (1728) — Update company settings
- `PUT /user/profile` (1758) — Update user profile
- `POST /user/avatar` (1792) — Upload avatar

### Workers & Service Types
- `GET/POST/DELETE /workers` (1812-1841)
- `GET/POST/PUT/DELETE /service-types` (1854-1876)

### System
- `GET /health` (157) — Health check
- `GET /debug/routes` (162) — Debug deployment info

## Database Tables

### companies
id, nombre, token, ycloud_apikey, n8n_webhook_url, horario_inicio, horario_fin, dias_laborales, bot_auto_desactivar, google_refresh_token, google_access_token, google_token_expiry, google_connected, google_email, reminder_enabled, reminder_hours_before

### users
id, email, company_id, clerk_id (UNIQUE), avatar_url, role (admin|worker), worker_id, password (nullable, legacy)

### workers
id, company_id, nombre, email, color, calcom_email (legacy), google_calendar_id, user_id

### contacts
id, company_id, nombre_whatsapp, nombre_real, telefono, correo, ycloud_id, etapa, bot_desactivado, created_at, updated_at

### conversations
id, company_id, contact_id, estado (abierta|cerrada), etiqueta, created_at

### messages
id, conversation_id, direccion (inbound|outbound), tipo (texto|imagen|video|audio|documento), contenido, sender_type (bot|human|whatsapp), timestamp

### appointments
id, company_id, contact_id, worker_id, event_type, fecha, hora, estado, google_event_id, calcom_uid (legacy), calcom_booking_id (legacy), nombre_real, telefono, correo, client_email, notas, duracion, reminder_sent, confirmation_sent

### contact_history
id, contact_id, evento, fecha

### email_log
id, company_id, appointment_id, tipo, destinatario, estado, error_msg, created_at

### service_types
id, company_id, nombre, duracion, worker_ids (integer[]), created_at

## Middleware
- `authMiddleware` (line 1408) — Clerk JWT verification, resolves user from DB
- `webhookAuth` (line 1445) — Validates x-webhook-secret header
- `adminOnly` (line 1453) — Checks user.role === 'admin'
- Rate limiters: API (200/min), webhooks (100/min), uploads (30/min custom)

## Socket.IO
- Auth: company_token in handshake
- Rooms: each company has a room by token
- Events emitted: `nuevo_mensaje`, `bot_status_changed`, `appointment_update`

## Key Patterns
- Auth flow: Clerk JWT → authMiddleware → req.user = { user_id, company_id, company_token, role }
- Google Calendar: OAuth tokens stored in companies table, refreshed via `getGoogleClient()` helper (line 1573)
- Email: Resend for appointment confirmations + reminders (line 1477)
- Media: Downloaded from YCloud URLs to local `/uploads/`, served statically
- Migrations: AUTO ALTER TABLE on startup (line 1939+)
- File cleanup: cron deletes uploads older than 90 days (line 1852)
- Reminder cron: checks appointments hourly, sends email reminders (line 1905)
