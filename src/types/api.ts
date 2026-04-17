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
  phone_slot: number | null;
  phone_label: string | null;
  assigned_worker_id: number | null;
  assigned_worker_nombre: string | null;
  assigned_worker_color: string | null;
  bot_desactivado: boolean;
  unread_count: number;
  last_inbound_at: string | null;
  channel: 'whatsapp' | 'messenger' | 'instagram';
  platform: string | null;
  platform_id: string | null;
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
  can_respond_chats: boolean;
  can_view_all_calendar: boolean;
  is_active: boolean;
}

export interface CompanySettings {
  nombre: string;
  horario_inicio: string;
  horario_fin: string;
  dias_laborales: string;
  ycloud_apikey: string;
  bot_auto_desactivar: boolean;
  google_connected: boolean;
  google_email?: string | null;
  reminder_enabled: boolean;
  reminder_hours_before: number;
  use_internal_agent?: boolean;
  phone_1_number: string | null;
  phone_1_label: string;
  phone_1_preset: 'ventas' | 'soporte';
  phone_2_number: string | null;
  phone_2_label: string;
  phone_2_preset: 'ventas' | 'soporte';
  worker_assignment_mode: 'ask_client' | 'round_robin';
  messenger_connected: boolean;
  instagram_connected: boolean;
  facebook_page_name: string | null;
  instagram_username: string | null;
  meta_bot_enabled_messenger: boolean;
  meta_bot_enabled_instagram: boolean;
}

export interface AgentConfig {
  tone: string;
  examples: string;
  response_structure: string;
  system_prompt_custom: string;
  agent_type: "informativo" | "soporte" | null;
  user_description: string;
  generated_scheduler_prompt: string | null;
  generated_rag_prompt: string | null;
  generated_support_prompt: string | null;
  generated_at: string | null;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  instructions: string;
  can_schedule: boolean;
  use_knowledge: boolean;
  is_active: boolean;
  generated_prompt: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: number;
  tipo: string;
  nombre: string;
  created_at: string;
}

export interface KnowledgeCompiled {
  compiled_text: string | null;
  compiled_at: string | null;
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

export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: string;
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  text?: string;
  format?: string;
}

export interface StaleLead {
  contact_id: number;
  nombre_whatsapp: string;
  nombre_real: string | null;
  telefono: string;
  etapa: string | null;
  last_message_at: string;
  last_message: string;
  conversation_id: number;
  phone_slot: number;
  channel?: 'whatsapp' | 'messenger' | 'instagram';
}

export interface BulkSendResult {
  sent: number;
  failed: number;
  errors: string[];
}

export type PlanKey = "starter" | "pro" | "enterprise";

export interface Plan {
  id: PlanKey;
  name: string;
  price: number;
  max_phone_slots: number;
  max_conversations_per_month: number;
}

export interface SubscriptionInfo {
  plan: PlanKey | null;
  subscription_status: "none" | "incomplete" | "active" | "past_due" | "unpaid" | "canceled" | "suspended";
  current_period_start: string | null;
  current_period_end: string | null;
  plan_limits: {
    max_phone_slots: number;
    max_conversations_per_month: number;
  } | null;
  conversations_this_period: number;
  overage_price_clp: number;
  current_overage_count: number;
  current_overage_amount_clp: number;
}

export interface BillingOverage {
  id: number;
  period_start: string;
  period_end: string | null;
  plan: string;
  conversations_count: number;
  plan_limit: number;
  overage_count: number;
  amount_clp: number;
  status: "pending" | "charged" | "failed";
  ventipay_charge_id: string | null;
  created_at: string;
  charged_at: string | null;
  error_message: string | null;
}
