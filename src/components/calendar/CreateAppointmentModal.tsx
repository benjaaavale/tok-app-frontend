"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useConversations } from "@/hooks/useConversations";
import { useWorkers } from "@/hooks/useWorkers";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useAvailability } from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";
import { DatePicker } from "@/components/ui/date-picker";
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
  const { data: serviceTypes } = useServiceTypes();
  const createAppointment = useCreateAppointment();

  const [contactId, setContactId] = useState<number | "">("");
  const [workerId, setWorkerId] = useState<number | "">("");
  const [serviceTypeId, setServiceTypeId] = useState<number | "">("");
  const [fecha, setFecha] = useState<Date | undefined>(
    defaultDate ? new Date(defaultDate + "T12:00:00") : new Date()
  );
  const [hora, setHora] = useState(defaultTime || "");
  const [eventType, setEventType] = useState("");
  const [duracion, setDuracion] = useState(30);
  const [clientEmail, setClientEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [searchContact, setSearchContact] = useState("");

  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : "";

  const { data: availability, isLoading: loadingSlots } = useAvailability(
    workerId ? Number(workerId) : null,
    fechaStr
  );

  // Service types filtered by selected worker
  const availableServiceTypes = useMemo(() => {
    if (!serviceTypes) return [];
    if (!workerId) return serviceTypes;
    return serviceTypes.filter(
      (st) => !st.worker_ids || st.worker_ids.length === 0 || st.worker_ids.includes(Number(workerId))
    );
  }, [serviceTypes, workerId]);

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

  const handleSelectWorker = (id: number | "") => {
    setWorkerId(id);
    setHora("");
    // Reset service type if it's no longer compatible with new worker
    if (id && serviceTypeId) {
      const st = serviceTypes?.find((s) => s.id === Number(serviceTypeId));
      if (st && st.worker_ids && st.worker_ids.length > 0 && !st.worker_ids.includes(Number(id))) {
        setServiceTypeId("");
        setEventType("");
        setDuracion(30);
      }
    }
  };

  const handleSelectServiceType = (id: number | "") => {
    setServiceTypeId(id);
    if (id) {
      const st = serviceTypes?.find((s) => s.id === Number(id));
      if (st) {
        setEventType(st.nombre);
        setDuracion(st.duracion);
      }
    } else {
      setEventType("");
      setDuracion(30);
    }
  };

  const handleSubmit = () => {
    if (!contactId || !workerId || !fechaStr || !hora) {
      toast.error("Completa los campos requeridos: contacto, trabajador, fecha y hora");
      return;
    }
    if (!clientEmail) {
      toast.error("El email del cliente es obligatorio para enviar la confirmación");
      return;
    }
    if (!eventType) {
      toast.error("El tipo de servicio es obligatorio");
      return;
    }
    createAppointment.mutate(
      {
        contact_id: Number(contactId),
        worker_id: Number(workerId),
        event_type: eventType,
        fecha: fechaStr,
        hora: hora + ":00",
        duracion,
        notas: notas || undefined,
        client_email: clientEmail,
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

        <div className="px-5 py-4 space-y-4">
          {/* 1. Contacto */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Contacto *
            </label>
            <input
              type="text"
              value={searchContact}
              onChange={(e) => { setSearchContact(e.target.value); setContactId(""); }}
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
                    <span className="text-text-primary font-medium">{c.nombre_real || c.nombre_whatsapp}</span>
                    <span className="text-text-muted ml-2">{c.telefono}</span>
                  </button>
                ))}
              </div>
            )}
            {contactId && (
              <button onClick={() => { setContactId(""); setSearchContact(""); }} className="text-[10px] text-accent mt-1 hover:underline">
                Cambiar contacto
              </button>
            )}
          </div>

          {/* 2. Trabajador */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Trabajador *
            </label>
            <select
              value={workerId}
              onChange={(e) => handleSelectWorker(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Seleccionar trabajador</option>
              {workers?.map((w) => (
                <option key={w.id} value={w.id}>{w.nombre}</option>
              ))}
            </select>
          </div>

          {/* 3. Tipo de servicio */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Tipo de servicio *
            </label>
            {serviceTypes && serviceTypes.length > 0 ? (
              <>
                <select
                  value={serviceTypeId}
                  onChange={(e) => handleSelectServiceType(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">
                    {workerId
                      ? availableServiceTypes.length === 0
                        ? "Este trabajador no tiene servicios asignados"
                        : "Seleccionar tipo de servicio"
                      : "Seleccionar tipo de servicio"}
                  </option>
                  {availableServiceTypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nombre} — {st.duracion} min
                    </option>
                  ))}
                </select>
                {/* Editable name + duration after selection */}
                {serviceTypeId && (
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="text-[11px] font-medium text-text-muted mb-1 block">
                        Nombre (editable)
                      </label>
                      <input
                        type="text"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-text-muted mb-1 block">
                        Duración (editable)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDuracion(d)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                              duracion === d
                                ? "bg-accent text-white"
                                : "bg-bg-primary border border-border-secondary text-text-primary hover:bg-bg-hover"
                            }`}
                          >
                            <Clock size={10} />
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="Ej: Consulta, Evaluación, Control..."
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            )}
          </div>

          {/* 4. Fecha */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Fecha *
            </label>
            <DatePicker
              date={fecha}
              onDateChange={(d) => { setFecha(d); setHora(""); }}
              placeholder="Seleccionar fecha"
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>

          {/* 5. Hora */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Hora disponible *
            </label>
            {!workerId || !fechaStr ? (
              <p className="text-[11px] text-text-muted py-2">Selecciona un trabajador y fecha para ver horarios disponibles</p>
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
              <p className="text-[11px] text-text-muted py-2">{availability?.message || "No hay horarios disponibles para esta fecha"}</p>
            )}
          </div>

          {/* 6. Email */}
          <div>
            <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 block">
              Email del cliente * <span className="text-text-muted normal-case font-normal">(para confirmación)</span>
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* 7. Notas */}
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
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-secondary hover:bg-bg-hover transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={createAppointment.isPending || !contactId || !workerId || !hora || !clientEmail || !eventType}
            className="btn-gradient px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
          >
            {createAppointment.isPending ? "Creando..." : "Crear cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
