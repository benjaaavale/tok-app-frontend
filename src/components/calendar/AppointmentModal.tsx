"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Appointment } from "@/types/api";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface AppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentModal({
  appointment,
  onClose,
}: AppointmentModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);

  const reschedule = useMutation({
    mutationFn: async () => {
      if (!rescheduleDate || !rescheduleTime) {
        throw new Error("Selecciona fecha y hora");
      }
      const start = `${rescheduleDate}T${rescheduleTime}:00`;
      await authFetch(
        `/appointments/${appointment.id}/reschedule`,
        { method: "POST", body: JSON.stringify({ start }) },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cita reagendada");
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al reagendar");
    },
  });

  const cancel = useMutation({
    mutationFn: async () => {
      await authFetch(
        `/appointments/${appointment.id}`,
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cita cancelada");
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al cancelar");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-secondary w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary">
          <h3 className="text-[15px] font-semibold text-text-primary">
            Detalle de cita
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Service */}
          <div className="px-4 py-3 bg-bg-primary rounded-xl border border-border-secondary">
            <p className="text-[13px] font-semibold text-text-primary">
              {appointment.event_type}
            </p>
            <span
              className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${appointment.worker_color || "#3B82F6"}20`,
                color: appointment.worker_color || "#3B82F6",
              }}
            >
              {appointment.estado}
            </span>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5">
            <InfoRow
              icon={<Calendar size={14} />}
              label="Fecha"
              value={new Date(appointment.fecha.split("T")[0] + "T12:00:00").toLocaleDateString(
                "es-CL",
                { weekday: "long", day: "numeric", month: "long" }
              )}
            />
            <InfoRow
              icon={<Clock size={14} />}
              label="Hora"
              value={appointment.hora?.slice(0, 5)}
            />
            <InfoRow
              icon={<User size={14} />}
              label="Contacto"
              value={appointment.nombre_real || "Sin nombre"}
            />
            <InfoRow
              icon={<Phone size={14} />}
              label="Teléfono"
              value={appointment.telefono}
            />
            {appointment.worker_nombre && (
              <InfoRow
                icon={
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: appointment.worker_color || "#3B82F6",
                    }}
                  />
                }
                label="Asignado"
                value={appointment.worker_nombre}
              />
            )}
          </div>

          {/* Reschedule form */}
          {showReschedule && (
            <div className="p-3 bg-bg-primary rounded-xl border border-border-secondary space-y-2">
              <p className="text-[12px] font-medium text-text-primary">
                Nueva fecha y hora
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => reschedule.mutate()}
                  disabled={reschedule.isPending}
                  className="flex-1 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  {reschedule.isPending ? "Reagendando..." : "Confirmar"}
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary text-[12px] hover:bg-bg-hover transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-border-secondary">
          <button
            onClick={() => setShowReschedule(!showReschedule)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-primary hover:bg-bg-hover transition-all"
          >
            <RefreshCw size={13} />
            Reagendar
          </button>
          <button
            onClick={async () => {
              const ok = await confirm({
                title: "Cancelar cita",
                description: "¿Cancelar esta cita? Se eliminará del Google Calendar.",
                confirmText: "Cancelar cita",
                variant: "danger",
              });
              if (ok) cancel.mutate();
            }}
            disabled={cancel.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
          >
            <Trash2 size={13} />
            {cancel.isPending ? "Cancelando..." : "Cancelar cita"}
          </button>
        </div>
      </div>
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
    <div className="flex items-center gap-3">
      <span className="text-text-muted">{icon}</span>
      <div>
        <p className="text-[10px] text-text-muted">{label}</p>
        <p className="text-[12px] text-text-primary">{value}</p>
      </div>
    </div>
  );
}
