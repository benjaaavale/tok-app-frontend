"use client";

import { useState, useMemo } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useWorkers } from "@/hooks/useWorkers";
import { useAvailability } from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";
import { toast } from "sonner";
import { X, Clock, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
}

export function CreateAppointmentModal({ onClose, defaultDate, defaultTime }: Props) {
  const { data: conversations } = useConversations();
  const { data: workers } = useWorkers();
  const createAppointment = useCreateAppointment();

  const [contactId, setContactId] = useState<number | "">("");
  const [workerId, setWorkerId] = useState<number | "">("");
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState(defaultTime || "");
  const [eventType, setEventType] = useState("");
  const [duracion, setDuracion] = useState(30);
  const [clientEmail, setClientEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [searchContact, setSearchContact] = useState("");

  const { data: availability, isLoading: loadingSlots } = useAvailability(
    workerId ? Number(workerId) : null,
    fecha
  );

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!conversations) return [];
    const q = searchContact.toLowerCase();
    return conversations
      .filter(
        (c) =>
          !q ||
          c.nombre_whatsapp?.toLowerCase().includes(q) ||
          c.nombre_real?.toLowerCase().includes(q) ||
          c.telefono?.includes(q)
      )
      .slice(0, 20);
  }, [conversations, searchContact]);

  const handleSubmit = () => {
    if (!contactId || !workerId || !fecha || !hora) {
      toast.error("Completa los campos requeridos: contacto, trabajador, fecha y hora");
      return;
    }
    createAppointment.mutate(
      {
        contact_id: Number(contactId),
        worker_id: Number(workerId),
        event_type: eventType || "Cita",
        fecha,
        hora: hora + ":00",
        duracion,
        notas: notas || undefined,
        client_email: clientEmail || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Cita creada exitosamente");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border-secondary">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary">
          <h2 className="text-[15px] font-semibold text-text-primary">Nueva cita</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Contact selector */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Contacto *
            </label>
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Buscar contacto por nombre o teléfono..."
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {searchContact && filteredContacts.length > 0 && !contactId && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-border-secondary bg-bg-primary">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setContactId(c.contact_id);
                      setSearchContact(c.nombre_real || c.nombre_whatsapp || c.telefono);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-bg-hover transition-all border-b border-border-secondary last:border-0"
                  >
                    <span className="text-text-primary font-medium">
                      {c.nombre_real || c.nombre_whatsapp}
                    </span>
                    <span className="text-text-muted ml-2">{c.telefono}</span>
                  </button>
                ))}
              </div>
            )}
            {contactId && (
              <button
                onClick={() => {
                  setContactId("");
                  setSearchContact("");
                }}
                className="text-[10px] text-accent mt-1 hover:underline"
              >
                Cambiar contacto
              </button>
            )}
          </div>

          {/* Worker selector */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Trabajador *
            </label>
            <select
              value={workerId}
              onChange={(e) => {
                setWorkerId(e.target.value ? Number(e.target.value) : "");
                setHora("");
              }}
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Seleccionar trabajador</option>
              {workers?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHora("");
                }}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
                Duración
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Hora disponible *
            </label>
            {!workerId || !fecha ? (
              <p className="text-[11px] text-text-muted py-2">
                Selecciona un trabajador y fecha para ver horarios disponibles
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-text-muted" />
                <span className="text-[11px] text-text-muted">Cargando horarios...</span>
              </div>
            ) : availability?.slots && availability.slots.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {availability.slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setHora(slot)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      hora === slot
                        ? "bg-accent text-white"
                        : "bg-bg-primary border border-border-secondary text-text-primary hover:bg-bg-hover"
                    }`}
                  >
                    <Clock size={10} />
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-text-muted py-2">
                {availability?.message || "No hay horarios disponibles para esta fecha"}
              </p>
            )}
          </div>

          {/* Event type */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Tipo de cita
            </label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Ej: Consulta, Evaluación, Control..."
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Client email */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Email del cliente (para confirmación)
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Notas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border-secondary">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-secondary hover:bg-bg-hover transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={createAppointment.isPending || !contactId || !workerId || !hora}
            className="btn-gradient px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
          >
            {createAppointment.isPending ? "Creando..." : "Crear cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
