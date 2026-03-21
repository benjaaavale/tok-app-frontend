"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContact } from "@/hooks/useContact";
import { useChatStore } from "@/stores/chat-store";
import { authFetch } from "@/lib/api";
import { ETAPA_COLORS, ETAPA_LABELS, LEAD_OPTIONS } from "@/lib/constants";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { getInitials } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  User,
  MessageCircle,
  CalendarDays,
  Clock,
  History,
  Trash2,
  Bot,
  Tag,
  Sparkles,
  Info,
} from "lucide-react";

export function ContactPanel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { activePhone, activeName, showContactPanel, setActiveConversation } =
    useChatStore();
  const { data: contact, isLoading } = useContact(activePhone);

  const botToggle = useMutation({
    mutationFn: async () => {
      await authFetch(
        `/contacts/${encodeURIComponent(activePhone!)}/bot-toggle`,
        { method: "PUT" },
        () => getToken()
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["contact", activePhone] });
      const prev = queryClient.getQueryData(["contact", activePhone]);
      queryClient.setQueryData(["contact", activePhone], (old: any) =>
        old ? { ...old, bot_desactivado: !old.bot_desactivado } : old
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["contact", activePhone], context.prev);
      toast.error("Error actualizando bot");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", activePhone] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const updateEtapa = useMutation({
    mutationFn: async (etapa: string) => {
      await authFetch(
        "/contacts/update-etapa",
        {
          method: "PUT",
          body: JSON.stringify({ phone: activePhone, etapa }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", activePhone] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Etapa actualizada");
    },
  });

  const deleteContact = useMutation({
    mutationFn: async () => {
      await authFetch(
        `/contacts/${encodeURIComponent(activePhone!)}`,
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      setActiveConversation(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Contacto eliminado");
    },
  });

  if (!showContactPanel || !activePhone) return null;

  return (
    <div className="w-[300px] border-l border-border-separator bg-bg-secondary h-full overflow-y-auto hidden lg:block">
      {isLoading ? (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-16 w-16 rounded-full bg-bg-primary mx-auto" />
          <div className="h-4 bg-bg-primary rounded w-3/4 mx-auto" />
          <div className="h-3 bg-bg-primary rounded w-1/2 mx-auto" />
          <div className="h-20 bg-bg-primary rounded-xl" />
          <div className="h-20 bg-bg-primary rounded-xl" />
        </div>
      ) : contact ? (
        <div className="p-5 space-y-5">
          {/* ── Avatar + Name ── */}
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mx-auto shadow-md"
              style={{ background: "var(--gradient-accent)" }}
            >
              {getInitials(
                contact.nombre_real || contact.nombre_whatsapp || "?"
              )}
            </div>
            <p className="text-[15px] font-semibold text-text-primary mt-3">
              {contact.nombre_real || contact.nombre_whatsapp || "Sin nombre"}
            </p>
            {contact.nombre_real && contact.nombre_whatsapp && (
              <p className="text-[11px] text-text-muted mt-0.5">
                {contact.nombre_whatsapp}
              </p>
            )}
          </div>

          {/* ── Agente IA (Bot Toggle) ── */}
          <div className="flex items-center justify-between px-3 py-3 bg-bg-primary rounded-xl border border-border-secondary">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot size={15} className="text-accent" />
              </div>
              <span className={`text-[12px] font-medium transition-colors duration-200 ${
                contact.bot_desactivado ? "text-text-muted" : "text-text-primary"
              }`}>
                Agente IA
              </span>
            </div>
            <Switch
              checked={!contact.bot_desactivado}
              onCheckedChange={() => botToggle.mutate()}
              size="sm"
            />
          </div>

          {/* ── Datos del contacto ── */}
          <Section title="Datos del contacto">
            <div className="space-y-1">
              <InfoRow
                icon={<Phone size={13} />}
                label="Teléfono"
                value={contact.telefono}
              />
              {contact.correo && (
                <InfoRow
                  icon={<Mail size={13} />}
                  label="Correo"
                  value={contact.correo}
                />
              )}
              {contact.nombre_whatsapp && (
                <InfoRow
                  icon={<MessageCircle size={13} />}
                  label="WhatsApp"
                  value={contact.nombre_whatsapp}
                />
              )}
              {contact.nombre_real && (
                <InfoRow
                  icon={<User size={13} />}
                  label="Nombre real"
                  value={contact.nombre_real}
                />
              )}
            </div>
          </Section>

          {/* ── Calificación / Etapa ── */}
          <Section title="Calificación">
            <div className="space-y-2">
              {!contact.bot_desactivado && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/15 mb-1">
                  <Sparkles size={13} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-[10.5px] text-text-secondary leading-relaxed">
                    El agente IA califica automáticamente este lead. Puedes cambiarlo manualmente si no estás de acuerdo.
                  </p>
                </div>
              )}
              <AnimatedSelect
                value={contact.etapa || ""}
                onChange={(v) => updateEtapa.mutate(v)}
                options={LEAD_OPTIONS}
                placeholder="Sin calificar"
                dotColor={ETAPA_COLORS[contact.etapa || ""] || undefined}
              />
              {contact.etapa && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: ETAPA_COLORS[contact.etapa] || "#94A3B8",
                    }}
                  />
                  <span className="text-[11px] text-text-secondary font-medium">
                    {ETAPA_LABELS[contact.etapa] || contact.etapa}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* ── Próxima cita ── */}
          {contact.next_appointment && (
            <Section title="Próxima cita">
              <div className="px-3 py-3 bg-accent-light rounded-xl border border-accent-muted">
                <div className="flex items-start gap-2.5">
                  <CalendarDays size={15} className="text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-text-primary">
                      {contact.next_appointment.event_type}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-text-secondary flex items-center gap-1">
                        <CalendarDays size={10} />
                        {new Date(
                          contact.next_appointment.fecha + "T12:00:00"
                        ).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-[11px] text-text-secondary flex items-center gap-1">
                        <Clock size={10} />
                        {contact.next_appointment.hora?.slice(0, 5)}
                      </span>
                    </div>
                    <span
                      className="inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                    >
                      {contact.next_appointment.estado}
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* ── Historial ── */}
          {contact.history && contact.history.length > 0 && (
            <Section title="Historial">
              <div className="space-y-0 max-h-[220px] overflow-y-auto relative">
                {/* Timeline line */}
                <div className="absolute left-[6px] top-2 bottom-2 w-px bg-border-secondary" />
                {contact.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 py-1.5 relative"
                  >
                    <div className="w-[13px] h-[13px] rounded-full bg-bg-secondary border-2 border-accent flex-shrink-0 z-10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-text-primary leading-snug">
                        {h.evento}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {new Date(h.fecha).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Eliminar ── */}
          <div className="pt-2 border-t border-border-secondary">
            <button
              onClick={() => {
                if (
                  confirm(
                    "¿Eliminar este contacto y toda su información?"
                  )
                ) {
                  deleteContact.mutate();
                }
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[12px] text-danger hover:bg-danger-light transition-all"
            >
              <Trash2 size={13} />
              Eliminar contacto
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[1.2px] mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="text-text-muted">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-text-muted">{label}</p>
        <p className="text-[12px] text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
