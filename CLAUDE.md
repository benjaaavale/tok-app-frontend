# ToK Project — Claude Instructions

## ⚡ Regla obligatoria: commit + push después de cada cambio

Después de **cualquier cambio en el código**, hacer siempre:

```bash
# Frontend (rama dev — desarrollo)
cd tok-frontend
git add <archivos modificados>
git commit -m "descripción del cambio"
git push origin dev

# Backend (rama dev — desarrollo)
cd tok-backend
git add <archivos modificados>
git commit -m "descripción del cambio"
git push origin dev
```

**Repos:**
- Frontend → `https://github.com/benjaaavale/tok-app-frontend`
- Backend  → `https://github.com/benjaaavale/tok-app-backend`

**Ramas:**
- `dev` → rama de desarrollo (donde se pushea normalmente)
- `master` (frontend) / `main` (backend) → rama de producción (solo merge cuando esté probado)

**⚠️ NUNCA pushear directo a master/main.** Para deployar a producción:
1. El usuario prueba los cambios en dev
2. Cuando aprueba, merge dev → master/main
3. Actualizar `APP_VERSION` en `src/lib/constants.ts` y crear git tag

No hacer commit solo si el usuario dice explícitamente "no hagas commit" o "no pushees".

---

## 🧠 Memoria y continuidad

- **Guardar progreso**: Después de terminar una tarea importante, actualizar `memory/session_summary.md` con lo que se hizo y lo que queda pendiente.
- **Leer memoria al inicio**: Si es una nueva sesión, revisar `memory/MEMORY.md` y `memory/session_summary.md` para entender el contexto actual del proyecto.
- **Decisiones importantes**: Guardar en `memory/` cualquier decisión arquitectónica o preferencia del usuario que no sea obvia del código.

---

## 🏗️ Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4, Clerk (auth), TanStack Query (data fetching), Zustand (state), framer-motion (animations)
- **Backend**: Node.js/Express monolito (`tok-backend/server.js`, ~2500+ líneas)
- **DB**: PostgreSQL con auto-migraciones al iniciar
- **Integraciones**: YCloud (WhatsApp), n8n (AI agent), Google Calendar, Resend (emails)
- **Deploy**: Easypanel VPS, Docker standalone builds
- **API URL**: `https://api.tok-ai.cl`

---

## 🎨 Diseño

- Colores: variables CSS `--bg-primary`, `--bg-secondary`, `--accent`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-primary`, `--border-secondary` (ver `globals.css`)
- Fuente: Inter (via `next/font/google`)
- Tema: dark/light via `next-themes`
- Dropdowns: usar siempre `AnimatedSelect` (`components/ui/animated-select.tsx`)
- Tabs: usar `components/ui/tabs.tsx` (Radix UI adaptado)
- Confirmaciones: usar `useConfirm()` de `components/ui/confirm-dialog.tsx` — NUNCA `window.confirm()`
- Toasts: `import { toast } from "sonner"`
- Modales: framer-motion AnimatePresence, z-[100], backdrop blur
- Iconos: `lucide-react`

---

## 📁 Estructura clave

```
tok-frontend/
  src/
    app/(app)/           # Páginas autenticadas
      dashboard/         # KPIs, charts
      conversations/     # Chat WhatsApp
      calendar/          # Agenda semanal
      settings/          # 5 tabs de configuración
      templates/         # Plantillas WhatsApp + leads fríos
    components/          # Componentes por sección
      layout/            # Sidebar, BottomNav, MobileHeader
      ui/                # AnimatedSelect, Tabs, ConfirmDialog
      dashboard/         # KPICard, FunnelChart, etc.
      chat/              # ConversationList, ContactPanel
      calendar/          # WeekGrid, AppointmentModal
      settings/          # AgentSettings, WorkerManager
      templates/         # TemplateList, TemplateForm, StaleLeadsList, BulkSendModal
    hooks/               # TanStack Query hooks (useConversations, useTemplates, etc.)
    types/api.ts         # Interfaces TypeScript
    lib/constants.ts     # ETAPA_LABELS, TEMPLATE_CATEGORIES, etc.
    lib/api.ts           # authFetch helper
    stores/              # Zustand stores

tok-backend/
  server.js              # TODO: rutas, migraciones, webhooks, socket
  ai/
    index.js             # Pipeline IA principal
    sender.js            # Envío WhatsApp via YCloud
    prompt-builder.js    # System prompts (ventas + soporte)
    agent-rag.js         # Agente RAG
    agent-scheduler.js   # Agente agendador
    lead-classifier.js   # Clasificador de leads
```

---

## 🔧 Patrones de código

### Hooks (TanStack Query)
```typescript
// Patrón estándar — ver useKnowledge.ts como referencia
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

export function useXxx() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["xxx"],
    queryFn: async () => {
      const res = await authFetch("/xxx", {}, () => getToken());
      return res.json();
    },
  });
}
```

### Backend endpoints
```javascript
// Patrón estándar — authMiddleware provee req.user.company_id
app.get('/ruta', authMiddleware, async (req, res) => {
  const companyID = req.user.company_id;
  // SIEMPRE filtrar por company_id (RLS)
  const result = await pool.query('SELECT ... WHERE company_id = $1', [companyID]);
  res.json(result.rows);
});
```

---

## 🛡️ Seguridad (reglas estrictas)

- **RLS obligatorio**: TODA query debe filtrar por `company_id`. Verificar ownership de contact_id, worker_id, etc.
- **Rate limiting**: Endpoints sensibles deben tener rate limiter (AI pipeline: 20/min por company, bulk send: 5/min, auth: 30/15min)
- **API keys**: NUNCA retornar chars reales. Solo `'••••••••'` como indicador.
- **webhookAuth**: DEBE rechazar si WEBHOOK_SECRET no está configurado.
- **Input validation**: Validar tipos, rangos, y ownership antes de INSERT/UPDATE.
- **No window.confirm()**: Siempre usar `useConfirm()` del ConfirmDialog.

---

## 🤖 Agentes y ejecución

- **Planificar con Opus 4.6** — Diseñar planes y arquitectura
- **Ejecutar con Sonnet 4.6** — Implementar código (model: "sonnet" en Agent tool)
- **Paralelizar**: Backend y frontend en agentes separados cuando sea posible
- **TypeScript check**: Siempre `npx tsc --noEmit` después de cambios significativos

---

## 📱 Multi-teléfono YCloud

- Máximo 2 teléfonos por empresa (phone_1, phone_2 en tabla companies)
- `conversations.phone_slot` (1 o 2) indica qué teléfono recibió el mensaje
- `agent_config.phone_slot` — configuración de agente IA por teléfono
- Presets: `ventas` (discriminador → scheduler/RAG) o `soporte` (siempre RAG)
- Webhook auto-detecta segundo teléfono si el primero ya está registrado
- `POST /company/detect-phones` detecta teléfonos via YCloud API y guarda waba_id

---

## 📋 Skills disponibles

El proyecto tiene skills especializadas en `.claude/skills/`:

| Skill | Cuándo se activa |
|-------|-----------------|
| `backend` | server.js, API, DB, webhooks, migrations |
| `dashboard` | KPIs, charts, analytics, /dashboard |
| `conversations` | Chat, WhatsApp, mensajes, /conversations |
| `calendar` | Agenda, citas, Google Calendar, /calendar |
| `settings` | Configuración, workers, integraciones, /settings |
| `ui-components` | Componentes, diseño, sidebar, temas |
| `ui-styling` | Tailwind, shadcn, estilos CSS |
| `ui-ux-pro-max` | Diseño avanzado, paletas, UX guidelines |
| `security` | Auth, OWASP, XSS, SQL injection, validación |
| `systematic-debugging` | Investigar root cause antes de arreglar |
| `verification-before-completion` | Verificar con evidencia antes de decir "listo" |
| `scalability` | Performance, caching, DB scaling |
| `cost-reducer` | Optimizar costos de cloud/DB/APIs |
| `researcher` | Investigación profunda con web search |
| `self-healing` | Auto-mejora, guardar patrones, crear skills |

---

## 🚧 Estado actual del proyecto (2026-03-26)

**Beta casi lista.** Ver `memory/session_summary.md` para el detalle completo de lo implementado y lo pendiente.

### Pendiente:
1. **Templates — simplificar**: quitar variables {{1}}/{{2}}, verificar 3 categorías con tooltips de info
2. **Clerk email reverification**: 403 al cambiar email, necesita implementar flujo de reverificación
3. **Testing end-to-end**: probar todo antes del lanzamiento beta
