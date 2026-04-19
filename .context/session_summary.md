---
name: Session Summary — actualizado 2026-04-18
description: Sesión de Meta OAuth, Instagram, rediseño UI estructural (fases 1-2), planes de precios y más
type: project
---

# Full Session Summary — 2026-04-18

## Sesión anterior (2026-03-26) — ver historial completo arriba

## Cambios en sesiones recientes (2026-04 en adelante)

---

### 1. Dashboard — InfoTooltips + UsageCard (Frontend)
- `InfoTooltip.tsx` nuevo componente: tooltip CSS-only con ícono ℹ️, onDark/onLight props
- `KPICard.tsx`: prop `description?`, overflow-visible, InfoTooltip en title
- `ServiciosChart.tsx`: ChartCard acepta `description?`, InfoTooltip
- `dashboard/page.tsx`: MiniStat tiene `description?`, UsageCard importado aquí desde Settings
- `CompanySettings.tsx`: removido UsageCard
- `UsageCard.tsx`: removido texto de cargo por overage

### 2. Planes de precios (Frontend + Backend)
**Frontend (`plans/page.tsx`):**
- Reescritura completa con toggle mensual/anual
- `annualPrice()` helper: `monthly * (1 - discountPct/100)` redondeado a múltiplo de 10
- Precios: Starter $119.990/mes, Pro $254.990/mes, Enterprise $499.990/mes
- Descuentos: Starter 15%, Pro 20%, Enterprise 23% → anuales derivados automáticamente
- `PLAN_BASE` array con `discountPct` canonical (si cambia mensual, anual se actualiza solo)
- IDs VentiPay anuales hardcodeados: Starter pl_y0hxx..., Pro pl_SrPol..., Enterprise pl_bABRQ...
- Nota overage: ⚡ "$300 c/u se cobran en la próxima mensualidad"
- Toggle muestra "Ahorra hasta 23%"

**Backend (server.js):**
- PLANS: Pro $254.990, Enterprise $499.990 mensual
- `price_annual`, `discount_pct`, `overage_price_clp`, `ventipay_plan_id_annual` en PLANS
- `/subscriptions/create` acepta `billing: "monthly" | "annual"`, usa plan ID correcto, guarda `billing_cycle`
- Migration: `billing_cycle TEXT DEFAULT 'monthly'`

### 3. Meta OAuth — múltiples fixes (Backend)
**`server.js`:**
- `/auth/meta/url`: scopes expandidos: `pages_manage_metadata`, `pages_read_engagement`, `business_management`, `instagram_basic`, `instagram_manage_messages`
- `/auth/meta/callback`: todos los `res.redirect()` usan `frontendUrl` (antes eran rutas relativas → bug "Cannot GET /settings")
- Logging detallado: permisos otorgados, token debug info, pages response, Instagram lookup
- Instagram lookup: prueba `instagram_business_account` luego `connected_instagram_account` fallback
- Webhook Messenger: `/{pageId}/subscribed_apps` con `messages,messaging_postbacks`
- App-level Instagram webhook: `POST /{appId}/subscriptions?object=instagram` con app token (esto funcionó: `{"success":true}`)
- Disconnect Meta: ahora llama `DELETE /{pageId}/subscribed_apps` + `DELETE /{userId}/permissions` antes de limpiar DB
- Migration: `facebook_user_id TEXT` en companies
- Webhook handler: log completo para eventos `object=instagram`, fallback lookup por `facebook_page_id`

### 4. Instagram standalone Login (sin Facebook Page) (Backend + Frontend)
**Backend:**
- `GET /auth/instagram/url`: OAuth via `instagram.com/oauth/authorize`, scopes `instagram_business_basic,instagram_business_manage_messages`
- `GET /auth/instagram/callback`: token exchange via `api.instagram.com`, long-lived token via `graph.instagram.com`, guarda `instagram_access_token` y `instagram_only=TRUE`
- `DELETE /auth/instagram/disconnect`: limpia IG, intenta unsub webhook
- `/meta/status` retorna `instagram_only`, `instagram_has_token`
- Migrations: `instagram_access_token TEXT`, `instagram_only BOOLEAN DEFAULT FALSE`
- Webhook handler: usa `instagram_access_token` cuando `instagram_only=true`
- **Requiere env vars**: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`

**Frontend:**
- `useMeta.ts`: nuevos hooks `useConnectInstagram`, `useDisconnectInstagram`
- `MetaIntegration.tsx`: botón "Conectar solo Instagram" con gradiente IG, oculta Messenger UI cuando `instagram_only=true`, disconnect dinámico por tipo
- `settings/page.tsx`: handler URL param `?instagram=connected|error`

### 5. YCloud — test + guía paso a paso (Frontend)
- `IntegrationSettings.tsx` reescrito: `YCloudTestButton` (idle/loading/ok/error), `YCloudGuide` colapsable con 5 pasos + slots de imagen
- Imágenes: `/public/guides/ycloud/paso-1.png` ... `paso-5.png` (Benjamin las pondrá)
- Backend: `POST /company/ycloud/test` endpoint

### 6. MetaIntegration — logos y renombrado (Frontend)
- `MetaLogo`, `MetaWordmark`, `MessengerLogo`, `InstagramLogo` SVG components en `MetaIntegration.tsx`
- "Bot" → "Agente IA" en todos los labels de Meta
- Logos Messenger (gradiente azul) e Instagram (gradiente multicolor) en status y toggles

### 7. Rediseño estructural UI — Fases 1 y 2 (Frontend)
**Fase 1 — Sidebar más delgado (commit 88a78a3):**
- Ancho: 72/220 → 60/208 px colapsado/expandido
- Item height: 42→38px, text 13→12.5px, íconos 19→18px
- Header 64→60px, paddings ajustados
- Mobile: sin cambios (usa BottomNav separado)

**Fase 2 — Channel badges mejorados (commit bcd725d):**
- `ChannelIcons.tsx` nuevo archivo compartido: `MessengerIcon`, `InstagramIcon`, `WhatsAppIcon`, `ChannelBadge`
- Avatar conversación: 36→40px, badge canal 16→18px con `ring-2 shadow-sm`
- Indicador bot/human: movido a top-left (era bottom-left, chocaba con badge de canal)
- `ChatWindow.tsx`: también muestra channel badge en el header de la conversación abierta
- IG con radial gradient oficial, WhatsApp con ícono de burbuja más limpio

---

### 8. WhatsApp icon invertido (Frontend) — v1.9.2
- `ChannelIcons.tsx`: WhatsAppIcon ahora usa estilo del filtro pero invertido — fondo verde sólido (#25D366) + handset blanco con stroke de círculo blanco
- Antes era fondo verde con líneas verdes (se veía mal en el badge del avatar)

### 9. Fase 3 — ContactPanel colapsable (Frontend) — v1.10.0
- `ContactPanel.tsx` reescrito: extraído `ContactPanelBody` compartido desktop + mobile (elimina ~190 líneas duplicadas)
- `CollapsibleSection` component: chevron animado, border + bg-primary/40
- Secciones: **Información** (datos contacto), **Asignación** (Agente IA toggle + subtitle), **Ciclo de vida** (etapa + próxima cita + historial unificados), **Notas** (placeholder "próximamente")
- Revertir: `git revert b9536a2`

### 10. Fase 4 — Inbox sidebar bonito (Frontend) — v1.11.0
- `ConversationList.tsx`: chips rápidos de ciclo de vida arriba (Todos / No leídos / Ayuda humana / Sin asignar) con badges numéricos
- 3 AnimatedSelects (Estado / Etapa / Agente) colapsados detrás de botón `SlidersHorizontal`, se expanden con animate-in
- Chip activo: fondo accent sólido con badge blanco semi-transparente
- Botón X limpia todo incluyendo quickFilter + showMoreFilters

### 11. Agentes Claude Code (`.claude/agents/`)
- `tok-backend.md`: especialista server.js, migraciones, webhooks, Meta OAuth, RLS obligatorio, push solo a dev
- `tok-frontend.md`: especialista Next.js, Tailwind v4, TanStack Query, bump APP_VERSION obligatorio, push solo a dev

## APP_VERSION actual: 1.11.0

---

## Pendiente / TODO

### Meta / Instagram:
- Instagram DMs aún no llegan aunque app-level webhook está suscrito → debug en curso
- Posible causa: "Allow access to messages" en configuración IG, o app en modo desarrollo
- Falta agregar `INSTAGRAM_APP_ID/SECRET/REDIRECT_URI` en env de producción (Easypanel)
- Agregar producto Instagram en Meta App Dashboard para flujo standalone

### UI Rediseño (próximas fases):
- **Fase 3**: Contact panel con secciones colapsables (Info / Asignación / Lifecycle / Notas)
- **Fase 4**: Inbox sidebar (lifecycle + filtros) más bonito
- **Fase 5**: Settings como "Workspace Settings" con panel secundario jerárquico

### Anteriores pendientes:
- Templates: quitar variables {{1}}/{{2}}, verificar 3 categorías con tooltips de info
- Clerk email reverification (403 al cambiar email)
- Testing end-to-end pre-beta

---

## Cómo revertir cambios recientes:
- Fase 1 sidebar: `git revert 88a78a3`
- Fase 2 badges: `git revert bcd725d`
- Instagram standalone: `git revert 0a5c640` (backend), `git revert 6868268` (frontend)
