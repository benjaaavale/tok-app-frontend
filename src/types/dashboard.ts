import type { ComponentType } from "react";
import type { DashboardStats } from "./api";

export type WidgetCategory = "general" | "conversion" | "equipo" | "tiempos" | "ia";
export type WidgetSize = "sm" | "md" | "lg";

export interface WidgetProps {
  stats?: DashboardStats;
  dateRange?: { from: string; to: string };
}

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  size: WidgetSize;
  component: ComponentType<WidgetProps>;
  requiresDateRange?: boolean;
}

export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  general: "General",
  conversion: "Conversion",
  equipo: "Equipo",
  tiempos: "Tiempos",
  ia: "Inteligencia Artificial",
};

export const CATEGORY_DESCRIPTIONS: Record<WidgetCategory, string> = {
  general: "Metricas generales de conversaciones y contactos",
  conversion: "Tasas y ratios de conversion del embudo",
  equipo: "Rendimiento y ocupacion de tus workers",
  tiempos: "Velocidad de respuesta y horarios de actividad",
  ia: "Metricas del agente IA y escalaciones",
};

// El dashboard ya tiene una sección "clásica" fija arriba (KPIs + consumo + charts).
// DEFAULT_WIDGET_IDS son widgets EXTRA que el usuario puede agregar abajo,
// vacío por defecto para que la vista se vea limpia y packed.
export const DEFAULT_WIDGET_IDS: string[] = [];

// v2: se resetea el storage cuando el layout cambia de estructura
// (fixed + extras en vez de todo-widgets).
export const STORAGE_KEY = "tok-dashboard-widgets-v2";
