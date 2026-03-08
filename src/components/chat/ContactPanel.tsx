"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContact } from "@/hooks/useContact";
import { useChatStore } from "@/stores/chat-store";
import { authFetch } from "@/lib/api";
import { ETAPA_COLORS, ETAPA_LABELS, LEAD_OPTIONS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  CalendarDays,
  History,
  Trash2,
  Bot,
} from "lucide-react";

export function ContactPanel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { activePhone, showContactPanel, setActiveConversation } = useChatStore();
  const { data: contact, isLoading } = useContact(activePhone);

  const botToggle = useMutation({
    mutationFn: async () => {
      await authFetch(
        `/contacts/${encodeURIComponent(activePhone!)}/bot-toggle`,
        { method: "PUT" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", activePhone] });
      toast.success("Bot actualizado");
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
    <div className="w-[300px] border-l border-border-secondary bg-bg-sidebar h-full overflow-y-auto hidden lg:block">
      {isLoading ? (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-16 w-16 rounded-full bg-bg-primary mx-auto" />
          <div className="h-4 bg-bg-primary rounded w-3/4 mx-auto" />
          <div className="h-3 bg-bg-primary rounded w-1/2 mx-auto" />
        </div>
      ) : contact ? (
        <div className="p-5 space-y-5">
          {/* Avatar + Name */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center text-lg font-semibold mx-auto">
              {getInitials(contact.nombre_real || contact.nombre_whatsapp || "?")}
            </div>
            <p className="text-[14px] font-medium text-text-primary mt-2">
              {contact.nombre_real || contact.nombre_whatsapp}
            </p>
            <p className="text-[11px] text-text-muted">{contact.telefono}</p>
          </div>

          {/* Bot Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-bg-primary rounded-xl border border-border-secondary">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-accent" />
              <span className="text-[12px] text-text-primary font-medium">
                Agente IA
              </span>
            </div>
            <button
              onClick={() => botToggle.mutate()}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                contact.bot_desactivado ? "bg-border-primary" : "bg-success"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  contact.bot_desactivado ? "left-0.5" : "left-[18px]"
                }`}
              />
            </button>
          </div>

          {/* Contact Info */}
          <Section title="Contacto">
            <InfoRow icon={<Phone size={13} />} value={contact.telefono} />
            {contact.correo && (
              <InfoRow icon={<Mail size={13} />} value={contact.correo} />
            )}
          </Section>

          {/* Lead Qualification */}
          <Section title="Calificaci\u00f3n">
            <select
              value={contact.etapa || ""}
              onChange={(e) => updateEtapa.mutate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              style={{
                borderLeftColor: ETAPA_COLORS[contact.etapa || ""] || undefined,
                borderLeftWidth: contact.etapa ? "3px" : undefined,
              }}
            >
              <option value="">Sin calificar</option>
              {LEAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Section>

          {/* Next Appointment */}
          {contact.next_appointment && (
            <Section title="Pr\u00f3xima cita">
              <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary rounded-xl border border-border-secondary">
                <CalendarDays size={13} className="text-accent" />
                <div>
                  <p className="text-[12px] text-text-primary">
                    {contact.next_appointment.event_type}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {contact.next_appointment.fecha}{" "}
                    {contact.next_appointment.hora}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* History */}
          {contact.history && contact.history.length > 0 && (
            <Section title="Historial">
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {contact.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-2 text-[11px]"
                  >
                    <History size={10} className="text-text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-text-primary">{h.evento}</span>
                      <span className="text-text-muted block">
                        {new Date(h.fecha).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm("\u00bfEliminar este contacto y toda su informaci\u00f3n?")) {
                deleteContact.mutate();
              }
            }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[12px] text-danger hover:bg-danger/10 transition-all"
          >
            <Trash2 size={13} />
            Eliminar contacto
          </button>
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
      <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-text-secondary py-1">
      <span className="text-text-muted">{icon}</span>
      {value}
    </div>
  );
}
