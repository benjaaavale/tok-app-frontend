"use client";

import type { Appointment } from "@/types/api";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appt: Appointment) => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, compact }: AppointmentCardProps) {
  const bgColor = appointment.worker_color || "#3B82F6";

  return (
    <button
      onClick={() => onClick(appointment)}
      className="group w-full h-full text-left rounded-lg px-2 py-1 transition-all hover:opacity-80 cursor-pointer border border-transparent hover:border-border-secondary overflow-hidden relative"
      style={{
        backgroundColor: `${bgColor}18`,
        borderLeftWidth: "3px",
        borderLeftColor: bgColor,
      }}
    >
      {compact ? (
        <p className="text-[10px] text-text-primary font-medium truncate">
          <span className="font-semibold" style={{ color: bgColor }}>
            {appointment.hora?.slice(0, 5)}
          </span>
          {" "}
          {appointment.nombre_real || appointment.telefono}
        </p>
      ) : (
        <>
          <p
            className="text-[11px] font-semibold truncate"
            style={{ color: bgColor }}
          >
            {appointment.hora?.slice(0, 5)}
          </p>
          <p className="text-[10px] text-text-primary font-medium truncate">
            {appointment.nombre_real || appointment.telefono}
          </p>
          <p className="text-[9px] text-text-muted truncate">
            {appointment.event_type}
          </p>
          {appointment.worker_nombre && (
            <p className="text-[9px] text-text-muted truncate mt-0.5">
              {appointment.worker_nombre}
            </p>
          )}
        </>
      )}

      {/* Expanded tooltip on hover */}
      <div
        className="absolute left-0 top-full mt-1 z-50 rounded-xl px-3 py-2.5 shadow-lg border border-border-secondary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 min-w-[180px] whitespace-nowrap"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p className="text-[12px] font-semibold" style={{ color: bgColor }}>
          {appointment.hora?.slice(0, 5)} — {appointment.duracion || 30} min
        </p>
        <p className="text-[12px] text-text-primary font-medium mt-1">
          {appointment.nombre_real || appointment.telefono}
        </p>
        <p className="text-[11px] text-text-muted">
          {appointment.event_type}
        </p>
        {appointment.worker_nombre && (
          <p className="text-[11px] text-text-muted mt-0.5">
            {appointment.worker_nombre}
          </p>
        )}
        {appointment.notas && (
          <p className="text-[10px] text-text-muted mt-1 italic whitespace-normal max-w-[220px]">
            {appointment.notas}
          </p>
        )}
      </div>
    </button>
  );
}
