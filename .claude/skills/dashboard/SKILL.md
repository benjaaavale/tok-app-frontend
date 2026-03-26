---
description: "Expert skill for the ToK Dashboard section. TRIGGER when the user mentions: dashboard, KPIs, stats, analytics, metrics, charts, funnel, conversion, leads chart, horarios chart, servicios chart, date range filter, or any data visualization work on the /dashboard page."
---

# ToK Dashboard Expert

You are an expert on the ToK Dashboard section. Apply this context when working on dashboard-related tasks.

## Architecture

**Page**: `tok-frontend/src/app/(app)/dashboard/page.tsx`
**Components** (in `tok-frontend/src/components/dashboard/`):
- `KPICard.tsx` — Grid of 4 main KPI cards (conversations, leads, appointments, conversion rate) with delta indicators
- `DateRangeFilter.tsx` — Date range selector (from/to) for filtering dashboard data
- `ServiciosChart.tsx` — Bar chart showing most requested service types
- `HorariosChart.tsx` — Chart showing peak activity hours
- `FunnelChart.tsx` — Conversion funnel visualization (etapa stages)
- `LeadsChart.tsx` — Leads distribution chart by funnel stage

**Hook**: `tok-frontend/src/hooks/useDashboardStats.ts`
- Uses TanStack Query with key `["dashboard-stats", from, to]`
- Fetches `GET /stats/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Returns `DashboardStats` type

**Types** (`tok-frontend/src/types/api.ts`):
```typescript
interface DashboardStats {
  conversaciones_recibidas: number;
  leads_calificados: number;
  citas_generadas: number;
  conversion_a_cita: number;
  mensajes_totales: number;
  promedio_mensajes: number;
  leads_fuera_de_horario: number;
  deltas: DashboardDeltas;
  previous: { conversaciones, leads, citas, conversion, mensajes, promedio, fuera_horario };
  servicios_mas_solicitados: { nombre: string; cantidad: number }[];
  horarios_mas_actividad: { hora: number; cantidad: number }[];
  funnel: { etapa: string; cantidad: number }[];
}
```

**Backend endpoint**: `server.js:1247` — `GET /stats/dashboard`
- Queries conversations, messages, contacts, appointments in the date range
- Computes deltas vs previous period of same length
- Returns servicios, horarios, funnel data

## UI Patterns
- Default date range: current month (1st to last day)
- KPI grid: 2 cols mobile, 4 cols desktop
- MiniStat row: 3 cols (total messages, avg messages/conv, leads outside hours)
- Charts grid: 1 col mobile, 2 cols desktop
- Loading state: `DashboardSkeleton` with pulse animation
- Empty state: centered text "No hay datos para el período seleccionado"
- Delta indicators: green up arrow (positive), red down arrow (negative), gray right arrow (zero)

## Design Tokens
- Card bg: `bg-bg-secondary border border-border-secondary rounded-xl`
- Icon containers: `w-7 h-7 rounded-lg bg-accent/10 text-accent`
- Text sizes: title 22px, subtitle 13px, labels 11px, values 16px
- Max width: `max-w-[1400px]`
- Spacing: `p-6 lg:p-8 space-y-6`
