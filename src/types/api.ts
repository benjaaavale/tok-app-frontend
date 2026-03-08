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
  nombre_real: string | null;
  telefono: string;
  correo: string | null;
  worker_nombre: string | null;
  worker_color: string | null;
}

export interface Worker {
  id: number;
  nombre: string;
  calcom_email: string | null;
  color: string;
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
}

export interface DashboardStats {
  total_conversations: number;
  qualified_leads: number;
  scheduled_appointments: number;
  conversion_rate: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  off_hours_leads: number;
  servicios: { name: string; value: number }[];
  horarios: { hour: string; count: number }[];
  funnel: { stage: string; count: number }[];
  leads: { etapa: string; count: number }[];
}

export interface UserProfile {
  user_id: number;
  company_id: number;
  company_token: string;
  company_nombre: string;
  email: string;
  avatar_url: string | null;
}
