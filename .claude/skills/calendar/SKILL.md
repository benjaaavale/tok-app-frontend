---
description: "Expert skill for the ToK Calendar/Agenda section. TRIGGER when the user mentions: calendar, agenda, appointments, citas, weekly grid, worker filter, appointment modal, create appointment, reschedule, availability, time slots, Google Calendar, or any work on the /calendar page."
---

# ToK Calendar/Agenda Expert

You are an expert on the ToK Calendar & Appointments section.

## Architecture

**Page**: `tok-frontend/src/app/(app)/calendar/page.tsx`
- Weekly view with navigation (prev/next week, "Hoy" button)
- Worker color-coded filter chips
- Google Calendar integration required — shows "Connect" prompt if not connected
- Admin can create appointments; worker role sees only their own

**Components** (in `tok-frontend/src/components/calendar/`):
- `WeeklyGrid.tsx` — 7-column grid (Mon-Sun) showing appointments by time slots
- `AppointmentCard.tsx` — Individual appointment block in the grid (color-coded by worker)
- `AppointmentModal.tsx` — Detail view when clicking an appointment (view/edit/cancel/reschedule)
- `CreateAppointmentModal.tsx` — Form to create new appointment (contact, worker, service, date, time)
- `WorkerFilter.tsx` — Horizontal chips to filter by worker (multi-select)

**Hooks**:
- `useAppointments.ts` — `GET /appointments?from=&to=`, query key `["appointments", from, to]`, refreshes every 60s
- `useAvailability.ts` — `GET /availability?worker_id=&fecha=`, returns available time slots
- `useCreateAppointment.ts` — `POST /appointments`, creates appointment + Google Calendar event
- `useWorkers.ts` — `GET /workers`, query key `["workers"]`
- `useServiceTypes.ts` — `GET /service-types`, query key `["service-types"]`

**Store**: `tok-frontend/src/stores/calendar-store.ts` (Zustand)
```typescript
interface CalendarState {
  weekOffset: number;
  activeWorkerFilters: number[]; // empty = show all
  changeWeek(delta): void;
  goToday(): void;
  toggleWorkerFilter(workerId): void;
  resetFilters(): void;
}
```

**Types**:
```typescript
interface Appointment {
  id: number; contact_id: number; worker_id: number | null;
  event_type: string; fecha: string; hora: string; estado: string;
  google_event_id: string | null; nombre_real: string | null;
  telefono: string; correo: string | null;
  worker_nombre: string | null; worker_color: string | null;
  client_email: string | null; notas: string | null;
  duracion: number; reminder_sent: boolean; confirmation_sent: boolean;
}
interface Worker {
  id: number; nombre: string; email: string | null; color: string;
  google_calendar_id: string | null; user_id: number | null;
}
interface ServiceType {
  id: number; company_id: number; nombre: string;
  duracion: number; worker_ids: number[];
}
```

**Backend endpoints**:
- `POST /appointments` (line 1006) — Create appointment + Google Calendar event + confirmation email
- `GET /appointments?from=&to=` — List appointments in date range
- `GET /availability?worker_id=&fecha=` (line 1079) — Get available slots checking Google Calendar
- `POST /appointments/:id/reschedule` (line 1143) — Reschedule in DB + Google Calendar
- `DELETE /appointments/:id` (line 1202) — Cancel appointment + delete from Google Calendar
- `POST /workers/:id/create-calendar` (line 1680) — Create sub-calendar for worker in Google
- Reminder system (line 1905) — Automatic reminders via Resend email

## UI Patterns
- Week navigation: `getWeekRange(offset)` computes Mon-Sun range
- Date labels: Spanish format "15 mar – 21 mar 2026"
- Worker colors: each worker has a hex color used for filter chips and appointment cards
- Not connected state: centered prompt with Google Calendar icon + "Ir a Configuración" link
- Appointments positioned in grid by `fecha` (column) and `hora` (row)
- "Nueva cita" button: only visible for admin + Google connected
- Duration: service types define duration (default 30 min)
