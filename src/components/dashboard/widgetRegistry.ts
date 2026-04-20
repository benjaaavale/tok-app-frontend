import type { WidgetDefinition } from "@/types/dashboard";

// Importaciones lazy para evitar ciclos — los componentes se registran en un archivo separado
// para mantener widgetRegistry.ts libre de JSX y compatible con import puro de tipos.
// Ver widgetRegistryComponents.tsx para los componentes reales.

// Este archivo exporta solo los metadatos (sin components).
// widgetRegistryComponents.tsx exporta el registry completo con components.

export type { WidgetDefinition };

export const WIDGET_METADATA: Omit<WidgetDefinition, "component">[] = [
  // ── GENERAL ──────────────────────────────────────────────────────
  {
    id: "kpi-conversaciones",
    title: "Conversaciones totales",
    description: "KPI principal con total de conversaciones recibidas y delta vs período anterior.",
    category: "general",
    size: "sm",
    requiresDateRange: true,
  },
  {
    id: "funnel-etapas",
    title: "Funnel de etapas",
    description: "Barra horizontal con cuántos contactos hay en cada etapa del pipeline de ventas.",
    category: "general",
    size: "md",
    requiresDateRange: true,
  },
  {
    id: "leads-por-dia",
    title: "Leads por etapa (donut)",
    description: "Distribución de contactos por etapa del pipeline visualizada como gráfico de dona.",
    category: "general",
    size: "md",
    requiresDateRange: true,
  },
  {
    id: "servicios-solicitados",
    title: "Servicios más solicitados",
    description: "Ranking de servicios o productos más mencionados en conversaciones.",
    category: "general",
    size: "md",
    requiresDateRange: true,
  },

  // ── CONVERSIÓN ────────────────────────────────────────────────────
  {
    id: "tasa-conversion",
    title: "Tasa de conversion",
    description: "Porcentaje de conversaciones que terminan en cita, con sparkline de 7 días y comparativa.",
    category: "conversion",
    size: "md",
    requiresDateRange: true,
  },
  {
    id: "tasa-agendamiento",
    title: "Tasa de agendamiento",
    description: "Ratio de leads con alta intención que efectivamente agendan una cita.",
    category: "conversion",
    size: "sm",
    requiresDateRange: true,
  },
  {
    id: "ratio-bot-humano",
    title: "Ratio Bot / Humano",
    description: "Porcentaje de mensajes respondidos por el bot versus intervencion humana directa.",
    category: "conversion",
    size: "sm",
  },

  // ── EQUIPO ────────────────────────────────────────────────────────
  {
    id: "citas-por-worker",
    title: "Citas por worker",
    description: "Barras horizontales con el número de citas asignadas a cada worker activo.",
    category: "equipo",
    size: "md",
    requiresDateRange: true,
  },

  // ── TIEMPOS ───────────────────────────────────────────────────────
  {
    id: "tiempo-respuesta",
    title: "Tiempo de primera respuesta",
    description: "Tiempo promedio que tarda en llegar la primera respuesta al cliente, con P50 y P90.",
    category: "tiempos",
    size: "md",
    requiresDateRange: true,
  },
  {
    id: "horas-pico",
    title: "Horas pico de actividad",
    description: "Distribución de mensajes recibidos por hora del día para identificar momentos peak.",
    category: "tiempos",
    size: "md",
    requiresDateRange: true,
  },

  // ── IA ────────────────────────────────────────────────────────────
  {
    id: "mensajes-ia",
    title: "Mensajes procesados por IA",
    description: "Total de mensajes entrantes analizados por el agente IA en el período.",
    category: "ia",
    size: "sm",
    requiresDateRange: true,
  },
  {
    id: "tasa-escalacion-ia",
    title: "Escalacion IA → humano",
    description: "Donut con el porcentaje de conversaciones resueltas por IA vs las escaladas a un humano.",
    category: "ia",
    size: "md",
  },
];
