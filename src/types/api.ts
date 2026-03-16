export interface Conversation {
  id: number;
  contact_id: number;
  estado: string;
  etiqueta: string | null;
  nombre_whatsapp: string;
  nombre_real: string | null;
  telefono: string;
  etapa: string | null;
  ultimo_mensaje: string | null;
  ultimo_mensaje_timestamp: string | null;
  last_activity: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  direccion: "inbound" | "outbound";
  tipo: "texto" | "imagen" | "video" | "audio" | "documento";
  contenido: string;
  sender_type: "bot" | "human" | "whatsapp" | null;
  timestamp: string;
}

export interface Contact {
  id: number;
  nombre_whatsapp: string;
  nombre_real: string | null;
  telefono: string;
  correo: string | null;
  etapa: string | null;
  bot_desactivado: boolean;
  next_appointment?: {
    fecha: string;
    hora: string;
    event_type: string;
    estado: string;
  } | null;
  history?: ContactHistoryItem[];
}

export interface ContactHistoryItem {
  id: number;
  evento: string;
  fecha: string;
}

export interface Appointment {
  id: number;
  contact_id: number;
  worker_id: number | null;
  event_type: string;
  fecha: string;
  hora: string;
  estado: string;
  calcom_uid: string | null;
  calcom_booking_id: number | null;
  google_event_id: string | null;
  nombre_real: string | null;
  telefono: string;
  correo: string | null;
  worker_nombre: string | null;
  worker_color: string | null;
  client_email: string | null;
  notas: string | null;
  duracion: number;
  reminder_sent: boolean;
  confirmation_sent: boolean;
}

export interface Worker {
  id: number;
  nombre: string;
  calcom_email: string | null;
  email: string | null;
  color: string;
  google_calendar_id: string | null;
  user_id: number | null;
}

export interface CompanySettings {
  nombre: string;
  horario_inicio: string;
  horario_fin: string;
  dias_laborales: string;
  n8n_webhook_url: string;
  calcom_api_key: string;
  ycloud_apikey: string;
  bot_auto_desactivar: boolean;
  google_connected: boolean;
  google_email?: string | null;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  use_internal_agent?: boolean;
}

export interface AgentConfig {
  tone: string;
  examples: string;
  response_structure: string;
  system_prompt_custom: string;
}

export interface KnowledgeDocument {
  id: number;
  tipo: string;
  nombre: string;
  created_at: string;
}

export interface DashboardDeltas {
  conversaciones: number;
  leads: number;
  citas: number;
  conversion: number;
  mensajes: number;
  promedio: number;
  fuera_horario: number;
}

export interface DashboardStats {
  conversaciones_recibidas: number;
  leads_calificados: number;
  citas_generadas: number;
  conversion_a_cita: number;
  mensajes_totales: number;
  promedio_mensajes: number;
  leads_fuera_de_horario: number;
  deltas: DashboardDeltas;
  previous: {
    conversaciones: number;
    leads: number;
    citas: number;
    conversion: number;
    mensajes: number;
    promedio: number;
    fuera_horario: number;
  };
  servicios_mas_solicitados: { nombre: string; cantidad: number }[];
  horarios_mas_actividad: { hora: number; cantidad: number }[];
  funnel: { etapa: string; cantidad: number }[];
}

export interface UserProfile {
  user_id: number;
  company_id: number;
  company_token: string;
  company_nombre: string;
  email: string;
  avatar_url: string | null;
  role: "admin" | "worker";
  worker_id: number | null;
}


export interface ServiceType {
  id: number;
  company_id: number;
  nombre: string;
  duracion: number;
  worker_ids: number[];
  created_at: string;
}
