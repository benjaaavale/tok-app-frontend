"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContact } from "@/hooks/useContact";
import { useChatStore } from "@/stores/chat-store";
import { useCalendarStore } from "@/stores/calendar-store";
import { authFetch } from "@/lib/api";
import { ETAPA_COLORS, ETAPA_LABELS, LEAD_OPTIONS } from "@/lib/constants";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { getInitials } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Phone,
  Mail,
  User,
  MessageCircle,
  CalendarDays,
  Clock,
  Trash2,
  Bot,
  Sparkles,
  X,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

export function ContactPanel() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const {
    activePhone,
    showContactPanel,
    setActiveConversation,
    setShowContactPanel,
  } = useChatStore();
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

  const loader = (
    <div className="p-5 space-y-4 animate-pulse">
      <div className="h-16 w-16 rounded-full bg-bg-primary mx-auto" />
      <div className="h-4 bg-bg-primary rounded w-3/4 mx-auto" />
      <div className="h-3 bg-bg-primary rounded w-1/2 mx-auto" />
      <div className="h-20 bg-bg-primary rounded-xl" />
      <div className="h-20 bg-bg-primary rounded-xl" />
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar panel */}
      <div className="w-[300px] border-l border-border-separator bg-bg-secondary h-full overflow-y-auto hidden lg:block">
        {isLoading
          ? loader
          : contact && (
              <ContactPanelBody
                contact={contact}
                botToggle={botToggle}
                updateEtapa={updateEtapa}
                deleteContact={deleteContact}
              />
            )}
      </div>

      {/* Mobile: full-screen overlay */}
      <div className="fixed inset-0 z-[90] bg-bg-primary lg:hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-secondary bg-bg-secondary flex-shrink-0">
          <h3 className="text-[14px] font-semibold text-text-primary">Detalles del contacto</h3>
          <button
            onClick={() => setShowContactPanel(false)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            loader
          ) : contact ? (
            <ContactPanelBody
              contact={contact}
              botToggle={botToggle}
              updateEtapa={updateEtapa}
              deleteContact={deleteContact}
              mobile
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ── Shared body (desktop + mobile) ── */
function ContactPanelBody({
  contact,
  botToggle,
  updateEtapa,
  deleteContact,
  mobile = false,
}: {
  contact: any;
  botToggle: any;
  updateEtapa: any;
  deleteContact: any;
  mobile?: boolean;
}) {
  const confirm = useConfirm();
  const router = useRouter();
  const { setPendingAppointment, setWeekOffset } = useCalendarStore();

  const handleOpenAppointment = (appt: Record<string, unknown>) => {
    const dateStr = String(appt.fecha).slice(0, 10);
    const today = new Date();
    const target = new Date(dateStr + "T12:00:00");
    const todayDay = today.getDay();
    const todayMonday = new Date(today);
    todayMonday.setDate(today.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
    todayMonday.setHours(0, 0, 0, 0);
    const targetDay = target.getDay();
    const targetMonday = new Date(target);
    targetMonday.setDate(target.getDate() - (targetDay === 0 ? 6 : targetDay - 1));
    targetMonday.setHours(0, 0, 0, 0);
    const weekOffset = Math.round(
      (targetMonday.getTime() - todayMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    setWeekOffset(weekOffset);
    setPendingAppointment(appt);
    router.push("/calendar");
  };

  return (
    <div className={`p-5 space-y-4 ${mobile ? "pb-24" : ""}`}>
      {/* ── Header: Avatar + Name ── */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mx-auto shadow-md"
          style={{ background: "var(--gradient-accent)" }}
        >
          {getInitials(contact.nombre_real || contact.nombre_whatsapp || "?")}
        </div>
        <p className="text-[15px] font-semibold text-text-primary mt-3">
          {contact.nombre_real || contact.nombre_whatsapp || "Sin nombre"}
        </p>
        {contact.nombre_real && contact.nombre_whatsapp && (
          <p className="text-[11px] text-text-muted mt-0.5">{contact.nombre_whatsapp}</p>
        )}
      </div>

      {/* ── Información (colapsable — tiene múltiples filas) ── */}
      <CollapsibleSection title="Información" defaultOpen>
        <div className="space-y-0.5">
          <InfoRow icon={<Phone size={13} />} label="Teléfono" value={contact.telefono} />
          {contact.correo && <InfoRow icon={<Mail size={13} />} label="Correo" value={contact.correo} />}
          {contact.nombre_whatsapp && <InfoRow icon={<MessageCircle size={13} />} label="WhatsApp" value={contact.nombre_whatsapp} />}
          {contact.nombre_real && <InfoRow icon={<User size={13} />} label="Nombre real" value={contact.nombre_real} />}
        </div>
      </CollapsibleSection>

      {/* ── Asignación (Agente IA toggle) — flat, una sola función ── */}
      <FlatSection title="Asignación">
        <div className="flex items-center justify-between px-3 py-3 bg-bg-primary rounded-xl border border-border-secondary">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Bot size={15} className="text-accent" />
            </div>
            <div>
              <p className={`text-[12px] font-medium transition-colors duration-200 ${
                contact.bot_desactivado ? "text-text-muted" : "text-text-primary"
              }`}>
                Agente IA
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {contact.bot_desactivado ? "Respondes manualmente" : "Responde automáticamente"}
              </p>
            </div>
          </div>
          <Switch
            checked={!contact.bot_desactivado}
            onCheckedChange={() => botToggle.mutate()}
            size="sm"
          />
        </div>
      </FlatSection>

      {/* ── Ciclo de vida (etapa + próxima cita + historial) — flat ── */}
      <FlatSection title="Ciclo de vida">
        <div className="space-y-3">
          {!contact.bot_desactivado && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/15">
              <Sparkles size={13} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                El agente IA califica automáticamente este lead. Puedes cambiarlo si no estás de acuerdo.
              </p>
            </div>
          )}
          <AnimatedSelect
            value={contact.etapa || ""}
            onChange={(v: string) => updateEtapa.mutate(v)}
            options={LEAD_OPTIONS}
            placeholder="Sin calificar"
            dotColor={ETAPA_COLORS[contact.etapa || ""] || undefined}
          />

          {contact.next_appointment && (
            <button
              onClick={() => handleOpenAppointment(contact.next_appointment as Record<string, unknown>)}
              className="w-full text-left px-3 py-3 bg-accent-light rounded-xl border border-accent-muted hover:border-accent/40 hover:bg-accent/10 transition-all group"
            >
              <div className="flex items-start gap-2.5">
                <CalendarDays size={15} className="text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-1">
                    Próxima cita
                  </p>
                  <p className="text-[12px] font-medium text-text-primary">
                    {contact.next_appointment.event_type}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-text-secondary flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(contact.next_appointment.fecha.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-1">
                      <Clock size={10} />
                      {contact.next_appointment.hora?.slice(0, 5)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={13} className="text-accent opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5" />
              </div>
            </button>
          )}

          {contact.history && contact.history.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Historial</p>
              <div className="space-y-0 max-h-[220px] overflow-y-auto relative pl-0.5">
                <div className="absolute left-[6px] top-2 bottom-2 w-px bg-border-secondary" />
                {contact.history.map((h: any) => (
                  <div key={h.id} className="flex items-start gap-3 py-1.5 relative">
                    <div className="w-[13px] h-[13px] rounded-full bg-bg-secondary border-2 border-accent flex-shrink-0 z-10 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-text-primary leading-snug">{h.evento}</p>
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
            </div>
          )}
        </div>
      </FlatSection>

      {/* ── Notas (placeholder) — flat ── */}
      <FlatSection title="Notas">
        <div className="px-3 py-4 rounded-xl border border-dashed border-border-secondary bg-bg-primary/40 text-center">
          <p className="text-[11px] text-text-muted">
            Próximamente: agrega notas internas sobre este contacto.
          </p>
        </div>
      </FlatSection>

      {/* ── Eliminar ── */}
      <div className="pt-2 border-t border-border-secondary">
        <button
          onClick={async () => {
            const ok1 = await confirm({
              title: "Eliminar contacto",
              description: "¿Eliminar este contacto y toda su información?",
              confirmText: "Sí, eliminar",
              variant: "danger",
            });
            if (!ok1) return;
            const ok2 = await confirm({
              title: "¿Estás completamente seguro?",
              description: "Esta acción es irreversible. Se eliminará el contacto, su conversación y todos sus mensajes.",
              confirmText: "Confirmar eliminación",
              variant: "danger",
            });
            if (ok2) deleteContact.mutate();
          }}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[12px] text-danger hover:bg-danger-light transition-all"
        >
          <Trash2 size={13} />
          Eliminar contacto
        </button>
      </div>
    </div>
  );
}

/* ── Flat Section (no collapse, solo heading) ── */
function FlatSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="px-1 mb-2 text-[11px] font-bold text-text-secondary uppercase tracking-[1.1px]">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── Collapsible Section ── */
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-secondary rounded-xl overflow-hidden bg-bg-primary/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-bg-hover transition-colors"
      >
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-[1.1px]">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-border-secondary">
          {children}
        </div>
      )}
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
