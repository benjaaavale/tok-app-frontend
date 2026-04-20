"use client";

import type { WidgetDefinition } from "@/types/dashboard";
import { WIDGET_METADATA } from "./widgetRegistry";

// Widget components
import { KPIConversacionesWidget } from "./widgets/KPIConversacionesWidget";
import { FunnelEtapasWidget } from "./widgets/FunnelEtapasWidget";
import { LeadsPorDiaWidget } from "./widgets/LeadsPorDiaWidget";
import { ServiciosSolicitadosWidget } from "./widgets/ServiciosSolicitadosWidget";
import { TasaConversionWidget } from "./widgets/TasaConversionWidget";
import { TasaAgendamientoWidget } from "./widgets/TasaAgendamientoWidget";
import { RatioBotHumanoWidget } from "./widgets/RatioBotHumanoWidget";
import { CitasPorWorkerWidget } from "./widgets/CitasPorWorkerWidget";
import { TiempoRespuestaPorWorkerWidget } from "./widgets/TiempoRespuestaPorWorkerWidget";
import { TiempoRespuestaWidget } from "./widgets/TiempoRespuestaWidget";
import { HorasPicoWidget } from "./widgets/HorasPicoWidget";
import { MensajesProcesadosIAWidget } from "./widgets/MensajesProcesadosIAWidget";
import { TasaEscalacionIAWidget } from "./widgets/TasaEscalacionIAWidget";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  "kpi-conversaciones": KPIConversacionesWidget,
  "funnel-etapas": FunnelEtapasWidget,
  "leads-por-dia": LeadsPorDiaWidget,
  "servicios-solicitados": ServiciosSolicitadosWidget,
  "tasa-conversion": TasaConversionWidget,
  "tasa-agendamiento": TasaAgendamientoWidget,
  "ratio-bot-humano": RatioBotHumanoWidget,
  "citas-por-worker": CitasPorWorkerWidget,
  "tiempo-respuesta-worker": TiempoRespuestaPorWorkerWidget,
  "tiempo-respuesta": TiempoRespuestaWidget,
  "horas-pico": HorasPicoWidget,
  "mensajes-ia": MensajesProcesadosIAWidget,
  "tasa-escalacion-ia": TasaEscalacionIAWidget,
};

export const WIDGET_REGISTRY: WidgetDefinition[] = WIDGET_METADATA.map((meta) => ({
  ...meta,
  component: COMPONENT_MAP[meta.id],
}));

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}
