export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tok-ai.cl";

export const ETAPA_COLORS: Record<string, string> = {
  frio: "#94A3B8",
  interesado: "#3B82F6",
  calificado: "#8B5CF6",
  alta_intencion: "#F59E0B",
  no_encaja: "#EF4444",
  pausado: "#6B7280",
  agendado: "#10B981",
};

export const ETAPA_LABELS: Record<string, string> = {
  frio: "Frío",
  interesado: "Interesado",
  calificado: "Calificado",
  alta_intencion: "Alta intención",
  no_encaja: "No encaja",
  pausado: "Pausado",
  agendado: "Agendado",
};

export const LEAD_OPTIONS = [
  { value: "frio", label: "Frío" },
  { value: "interesado", label: "Interesado" },
  { value: "calificado", label: "Calificado" },
  { value: "alta_intencion", label: "Alta intención" },
  { value: "no_encaja", label: "No encaja" },
  { value: "pausado", label: "Pausado" },
  { value: "agendado", label: "Agendado" },
];

export const WORKER_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#E11D48",
];

export const TIMES = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});
