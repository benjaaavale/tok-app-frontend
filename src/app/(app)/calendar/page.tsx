"use client";

import { useMemo, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useCalendarStore } from "@/stores/calendar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { WeeklyGrid } from "@/components/calendar/WeeklyGrid";
import { WorkerFilter } from "@/components/calendar/WorkerFilter";
import { AppointmentModal } from "@/components/calendar/AppointmentModal";
import { CreateAppointmentModal } from "@/components/calendar/CreateAppointmentModal";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Settings } from "lucide-react";
import Link from "next/link";
import type { Appointment } from "@/types/api";

function getWeekRange(offset: number) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    from: monday.toISOString().split("T")[0],
    to: sunday.toISOString().split("T")[0],
    label: `${monday.getDate()} ${monday.toLocaleDateString("es-CL", { month: "short" })} – ${sunday.getDate()} ${sunday.toLocaleDateString("es-CL", { month: "short", year: "numeric" })}`,
  };
}

export default function CalendarPage() {
  const { weekOffset, changeWeek, goToday } = useCalendarStore();
  const { role } = useAuthStore();
  const isAdmin = role !== "worker";
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useCompanySettings();
  const isGoogleConnected = settings?.google_connected ?? false;

  const range = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const { data: appointments, isLoading } = useAppointments(
    range.from,
    range.to
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border-secondary bg-bg-secondary">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-accent" />
          <h1 className="text-[18px] font-semibold text-text-primary">
            Agenda
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && isGoogleConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gradient flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            >
              <Plus size={14} />
              Nueva cita
            </button>
          )}
          <button
            onClick={() => goToday()}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-bg-primary border border-border-secondary text-text-primary hover:bg-bg-hover transition-all"
          >
            Hoy
          </button>
          <button
            onClick={() => changeWeek(-1)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-medium text-text-primary min-w-[180px] text-center">
            {range.label}
          </span>
          <button
            onClick={() => changeWeek(1)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Worker filters */}
      <div className="px-6 py-3 border-b border-border-secondary bg-bg-secondary">
        <WorkerFilter />
      </div>

      {/* Not connected state */}
      {!settingsLoading && !isGoogleConnected ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
            {/* Google Calendar icon */}
            <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border-secondary flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="10" width="38" height="32" rx="2" fill="white" stroke="#dadce0" strokeWidth="1.5"/>
                <path d="M5 12a2 2 0 012-2h34a2 2 0 012 2v8H5v-8z" fill="#1a73e8"/>
                <rect x="15" y="5" width="4" height="10" rx="2" fill="#5f6368"/>
                <rect x="29" y="5" width="4" height="10" rx="2" fill="#5f6368"/>
                <text x="24" y="38" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1a73e8" fontFamily="Arial,sans-serif">31</text>
              </svg>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary mb-1">
                Conecta Google Calendar
              </h3>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Para ver y gestionar la agenda, primero debes conectar tu cuenta de Google Calendar desde la configuración.
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/settings"
                className="btn-gradient flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium"
              >
                <Settings size={13} />
                Ir a Configuración
              </Link>
            )}
            {!isAdmin && (
              <p className="text-[11px] text-text-muted bg-bg-secondary border border-border-secondary rounded-xl px-4 py-2">
                Contacta al administrador para conectar Google Calendar
              </p>
            )}
          </div>
        </div>
      ) : isLoading || settingsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent" />
        </div>
      ) : (
        <WeeklyGrid
          appointments={appointments || []}
          onAppointmentClick={setSelectedAppointment}
        />
      )}

      {/* Appointment detail modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Create appointment modal */}
      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
