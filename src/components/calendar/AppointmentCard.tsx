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
      className="w-full h-full text-left rounded-lg px-2 py-1 cursor-pointer border border-transparent hover:border-border-secondary overflow-hidden"
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
          <p className="text-[11px] font-semibold truncate" style={{ color: bgColor }}>
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
    </button>
  );
}
