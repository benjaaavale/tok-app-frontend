"use client";

import { useEffect, useMemo, useState } from "react";
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

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekRange(offset: number) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    from: toLocalDateStr(monday),
    to: toLocalDateStr(sunday),
    label: `${monday.getDate()} ${monday.toLocaleDateString("es-CL", { month: "short" })} – ${sunday.getDate()} ${sunday.toLocaleDateString("es-CL", { month: "short", year: "numeric" })}`,
  };
}

export default function CalendarPage() {
  const { weekOffset, changeWeek, goToday, pendingAppointment, setPendingAppointment } = useCalendarStore();
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

  useEffect(() => {
    if (!pendingAppointment || !appointments) return;
    const found = appointments.find(
      (a) => a.id === (pendingAppointment as Record<string, unknown>).id
    );
    if (found) {
      setSelectedAppointment(found);
      setPendingAppointment(null);
    }
  }, [appointments, pendingAppointment]);

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
          {isGoogleConnected && (
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
                <rect width="22" height="22" x="13" y="13" fill="#fff"/>
                <polygon fill="#1e88e5" points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"/>
                <path fill="#1e88e5" d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368C24.24,25.281,23.736,24.363,22.943,23.745z"/>
                <polygon fill="#fbc02d" points="34,42 14,42 13,38 14,34 34,34 35,38"/>
                <polygon fill="#4caf50" points="38,35 42,34 42,14 38,13 34,14 34,34"/>
                <path fill="#1e88e5" d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"/>
                <polygon fill="#e53935" points="34,34 34,42 42,34"/>
                <path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"/>
                <path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"/>
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
