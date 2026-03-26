---
description: "Expert skill for the ToK Settings section. TRIGGER when the user mentions: settings, configuración, profile, team, workers, service types, agent IA, integrations, Google Calendar connection, notifications, reminders, company settings, n8n webhook, YCloud API key, or any work on the /settings page."
---

# ToK Settings Expert

You are an expert on the ToK Settings section.

## Architecture

**Page**: `tok-frontend/src/app/(app)/settings/page.tsx`
- 5 tabs: Perfil, Equipo, Calendario, Agente IA, Integraciones
- Dirty state tracking with floating "Cambios sin guardar" bar
- Shake animation when trying to switch tabs with unsaved changes
- Google Calendar redirect handler (`?google=connected|error`)

**Tabs & Components** (in `tok-frontend/src/components/settings/`):

### Tab: Perfil
- `UserProfileSettings.tsx` — Edit name, avatar upload, email display
- Sign out button (Clerk `signOut`)

### Tab: Equipo
- `CompanySettings.tsx` — Company name, business hours (horario_inicio/fin), working days (dias_laborales), bot auto-disable toggle
- `WorkerManager.tsx` — CRUD workers (nombre, email, color), invite via Clerk, create Google sub-calendar
- `ServiceTypeManager.tsx` — CRUD service types (nombre, duracion, assigned worker_ids)

### Tab: Calendario
- `GoogleCalendarSettings.tsx` — Connect/disconnect Google Calendar OAuth, shows connected email
- `NotificationSettings.tsx` — Enable/disable reminders, set hours_before

### Tab: Agente IA
- `AgentSettings.tsx` — n8n webhook URL configuration

### Tab: Integraciones
- `IntegrationSettings.tsx` — YCloud API key, webhook secret

**Hooks used**:
- `useCompanySettings.ts` — `GET /company/settings`, query key `["companySettings"]`
- `useWorkers.ts` — `GET /workers`
- `useServiceTypes.ts` — CRUD hooks for service types

**Backend endpoints**:
- `GET /company/settings` (line 1706) — Get all company settings
- `PUT /company/settings` (line 1728) — Update company settings
- `PUT /user/profile` (line 1758) — Update user profile
- `POST /user/avatar` (line 1792) — Upload avatar image
- `GET /workers` (line 1812), `POST /workers` (line 1825), `DELETE /workers/:id` (line 1841)
- `GET/POST/PUT/DELETE /service-types` (lines 1854-1876)
- `POST /admin/invite-worker` (line 253) — Create worker + user + Clerk invitation
- `GET /auth/google/url` (line 1608) — Get Google OAuth URL
- `GET /auth/google/callback` (line 1628) — Handle OAuth callback
- `DELETE /auth/google/disconnect` (line 1666) — Disconnect Google

## UI Patterns
- Tab navigation: Radix `Tabs` with scroll area for mobile
- Dirty state: `makeDirtyHandler(key)` pattern — each section registers save/discard callbacks
- Floating bar: framer-motion animated, has pulsing dot, discard + save buttons
- Save button glow: `shadow-[0_0_16px_rgba(37,99,235,0.4)]`
- Settings layout: `max-w-3xl mx-auto px-6 py-6`
- `SettingsSection.tsx` — Reusable card wrapper with title/description
- Admin-only: Settings page hidden from workers in sidebar
- Use `AnimatedSelect` for all dropdowns (not native select)
