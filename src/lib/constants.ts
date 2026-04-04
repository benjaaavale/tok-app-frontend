export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tok-ai.cl";

export const APP_VERSION = "1.1.5";

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
  frio: "Frío 🧊",
  interesado: "Interesado 🤔",
  calificado: "Calificado ✅",
  alta_intencion: "Alta intención 🔥",
  no_encaja: "No encaja ⛔",
  pausado: "Pausado ⏸️",
  agendado: "Agendado 🗓️",
};

export const LEAD_OPTIONS = [
  { value: "frio", label: "Frío 🧊" },
  { value: "interesado", label: "Interesado 🤔" },
  { value: "calificado", label: "Calificado ✅" },
  { value: "alta_intencion", label: "Alta intención 🔥" },
  { value: "no_encaja", label: "No encaja ⛔" },
  { value: "pausado", label: "Pausado ⏸️" },
  { value: "agendado", label: "Agendado 🗓️" },
];

export const WORKER_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#E11D48",
];

// 07:00 to 20:30 in 30-min increments (28 slots)
export const TIMES = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export const TEMPLATE_STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10B981",
  PENDING: "#F59E0B",
  REJECTED: "#EF4444",
};

export const TEMPLATE_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprobada",
  PENDING: "Pendiente",
  REJECTED: "Rechazada",
};

export const TEMPLATE_CATEGORIES = [
  { value: "MARKETING", label: "Marketing", description: "Mensajes promocionales como ofertas, descuentos, novedades de productos o boletines. Requiere opt-in del destinatario." },
  { value: "UTILITY", label: "Utilidad", description: "Mensajes transaccionales como confirmaciones de citas, recordatorios, actualizaciones de estado o seguimiento de pedidos." },
  { value: "AUTHENTICATION", label: "Autenticación", description: "Códigos de verificación, contraseñas temporales o confirmaciones de inicio de sesión." },
];
