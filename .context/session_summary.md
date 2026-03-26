---
name: Session Summary 2026-03-26
description: Complete conversation summary covering multi-phone YCloud, security audit, templates feature, and mobile fixes — for session continuity
type: project
---

# Full Session Summary — 2026-03-26

## What was COMPLETED (all committed + pushed)

### 1. Mobile UI Fixes (Frontend)
- **Removed mobile hamburger menu** — BottomNav already has all nav items, MobileSidebar was redundant
- **Fixed tutorial on mobile** — driver.js now targets BottomNav elements (data-tour attrs) with `side: "top"` on mobile
- **Fixed KPI delta overflow** — DeltaBadge uses plain text on mobile (no border/padding), badges only on `sm:`
- **Fixed MiniStat overflow** — Grid changed from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
- **Fixed ContactPanel on mobile** — Full-screen overlay `fixed inset-0 z-[90]` with close button
- **Removed settings "Configuración" header** — Redundant with bottom nav
- **Added MobileHeader** — Small ToK logo at top, `lg:hidden`
- **Fixed sidebar animation** — Rewrote from framer-motion to pure CSS transitions (no layout jumps)
- **Fixed funnel chart labels** — YAxis width 100→120px + `whiteSpace: nowrap` so labels don't wrap

### 2. Filter & Dialog Fixes (Frontend)
- **Filter dropdowns** — "Estado"/"Etapa" titles replaced with "Sin estado"/"Sin etapa" as clearable options
- **Custom ConfirmDialog** — Replaced ALL native `confirm()` dialogs with styled `useConfirm()` in:
  - ContactPanel (delete contact, desktop + mobile)
  - AppointmentModal (cancel appointment)
  - GoogleCalendarSettings (disconnect calendar)
  - WorkerManager (delete team member)

### 3. Multi-Phone YCloud Support (Backend + Frontend)
**Full feature implemented.** Max 2 phones per company.

**Backend (server.js):**
- DB migrations: `phone_1_number`, `phone_1_label`, `phone_1_preset`, `phone_2_number`, `phone_2_label`, `phone_2_preset` on `companies`
- `conversations.phone_slot` (SMALLINT 1 or 2)
- `agent_config.phone_slot` with unique index `(company_id, phone_slot)`
- Webhook lookup: `WHERE phone_1_number OR phone_2_number`, determines phoneSlot
- Fallback lookup: also tries `ycloud_phone_number` (legacy) + auto-registers to empty slot
- AI pipeline: routes by preset (`ventas` = discriminator→scheduler/RAG, `soporte` = always RAG)
- New prompt: `buildSupportPrompt()` for support preset
- `GET/PUT /company/settings` — returns/accepts phone_1/2 fields
- `GET/PUT /agent/config` — parameterized by `?phone_slot=`
- `GET /conversations` — returns phone_slot + phone_label, supports `?phone_slot=` filter
- `DELETE /company/phone/:slot` — clears a phone slot
- `POST /company/detect-phones` — calls YCloud API to auto-detect phone numbers

**Frontend:**
- Types updated: `Conversation.phone_slot/phone_label`, `CompanySettings.phone_1_*/phone_2_*`
- `useAgentConfig(phoneSlot)` — parameterized hook
- ConversationList: phone filter dropdown + phone label badges (only when 2 phones configured)
- Settings tab: "Agentes IA" (renamed from "Agente IA"), phone cards + per-phone agent config

### 4. Security Audit Fixes (Backend)
**All committed + pushed (commit 23eab45):**
- **webhookAuth**: rejects if WEBHOOK_SECRET not configured (was allowing all)
- **RLS webhook endpoints**: 3 endpoints now JOIN companies.token for ownership validation
- **RLS /contacts/:phone**: appointment + history queries now filter by company_id
- **RLS POST /appointments**: validates contact_id and worker_id belong to company
- **Rate limit AI pipeline**: 20 calls/min per company (in-memory counter)
- **Rate limit bulk send**: 5/min via express-rate-limit
- **Rate limit auth**: 30/15min on POST /auth/sync
- **API key masking**: returns only `'••••••••'` (no partial chars)
- **Webhook rate limit**: reduced from 100 to 60/min
- **Bulk send validation**: max 100 contacts per request

### 5. Templates Feature — PARTIALLY COMPLETE

**Backend (server.js) — DONE + pushed:**
- DB migration: `waba_id` column on companies
- Capture wabaId in detect-phones endpoint
- `GET /templates` — proxy to YCloud list
- `POST /templates` — proxy to YCloud create (validates name, category, waba_id)
- `PATCH /templates/:name/:language` — proxy to YCloud edit
- `DELETE /templates/:name` — proxy to YCloud delete
- `GET /leads/stale` — SQL query with LATERAL join for contacts with no response 24h+, excluding agendado/no_encaja/pausado
- `POST /templates/send` — bulk send with 150ms delay, saves to messages table, emits socket events, supports personalize flag

**Frontend — DONE + pushed:**
- Types: WhatsAppTemplate, TemplateComponent, StaleLead, BulkSendResult
- Hooks: `useTemplates.ts` (CRUD), `useStaleLeads.ts`
- Constants: TEMPLATE_STATUS_COLORS, TEMPLATE_STATUS_LABELS, TEMPLATE_CATEGORIES (3: Marketing, Utilidad, Autenticación)
- Navigation: FileText icon in Sidebar + BottomNav (adminOnly)
- Page: `/templates` with 2 tabs (Plantillas + Leads sin respuesta)
- TemplateList: card grid with status badges, edit/delete buttons
- TemplateForm: modal with name, category (radio with info tooltips), body textarea
  - Category warning: amber text about Meta rejection/ban risk
  - 24h info banner explaining WhatsApp template window rule
- StaleLeadsList: table with checkboxes, select all, etapa badges, relative time
- BulkSendModal: template selector, phone slot selector, personalize toggle, send with confirm

**Latest change on TemplateForm:** Added amber warning text below category selector:
> "Elegir la categoría correcta es importante. Meta puede rechazar la plantilla o suspender tu cuenta si no coincide con el contenido del mensaje."

---

### 6. Login Redesign (Frontend) — 2026-03-26
- **Theme toggle on login** — Animated Sun/Moon button (top-right corner) with AnimatePresence rotation transitions
- **Card glassmorphism container** — Form wrapped in rounded card with `backdrop-blur-md`, semi-transparent bg adapting to theme
- **Inputs adapt to theme** — Light: `bg-bg-secondary`, Dark: `bg-bg-primary/60` (semi-transparent)
- **Auto system theme detection** — Already configured via `next-themes` with `defaultTheme="system"`, user can override with toggle
- **Typography adjusted** — Titles `text-2xl`, subtitles `text-sm` for better card proportions
- **Footer** — Subtle "Potenciado por ToK" at bottom
- **Three.js removed** — Confirmed not used anywhere in the project, can be uninstalled (`npm uninstall three @react-three/fiber @types/three`)

---

## What is PENDING / TODO

### Templates — User requested changes (NOT YET DONE):
1. **Remove personalized variables** — Remove {{1}}, {{2}} variable support from TemplateForm and BulkSendModal. Keep it simple, no variables for now.
2. **3 categories with tooltips** — Verify there are 3 categories (MARKETING, UTILITY, AUTHENTICATION). Each should have an info icon with hover tooltip explaining what the category is for:
   - Marketing: ofertas, promociones, newsletters, re-engagement
   - Utility: confirmaciones de citas, actualizaciones de pedidos, alertas de cuenta
   - Authentication: códigos de verificación, OTPs, confirmaciones de login
3. **Info icon tooltip on hover** — Each category option should have a small info circle (ℹ️) icon next to it, and hovering shows the description above/beside it

### Clerk email change issue:
- User gets 403 "you need to provide additional verification" when changing email (Clerk reverification)
- `@clerk/nextjs` v7.0.1 — need to implement reverification flow or handle the error
- Left as TODO for now

### General pre-beta:
- Test all new features end-to-end
- Verify backend deploys correctly with all new migrations
- Test multi-phone webhook flow with real YCloud messages

---

## Key Technical Decisions
- **Max 2 phones**: Simple columns on companies table instead of separate table (user decision)
- **Agent presets**: `ventas` (discriminator→scheduler/RAG) vs `soporte` (always RAG, no scheduling)
- **Templates not cached locally**: Always fetched fresh from YCloud since status changes server-side
- **Stale leads**: LATERAL join for last message per conversation, 24h threshold, excludes terminal stages
- **Security**: RLS on all endpoints, rate limiting per-company for AI, masked API keys

## User Preferences
- Execute plans with Sonnet 4.6, plan with Opus 4.6
- Always commit + push after changes (unless told otherwise)
- Spanish UI, code comments in English/neutral
- Prefers simple solutions (e.g., 2 columns vs separate table)
- Wants admin-only access for Templates section
- Templates should be simple (no variables for now)
