"use client";

import { useMemo, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useCalendarStore } from "@/stores/calendar-store";
import { WeeklyGrid } from "@/components/calendar/WeeklyGrid";
import { WorkerFilter } from "@/components/calendar/WorkerFilter";
import { AppointmentModal } from "@/components/calendar/AppointmentModal";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
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
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

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

      {/* Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent" />
        </div>
      ) : (
        <WeeklyGrid
          appointments={appointments || []}
          onAppointmentClick={setSelectedAppointment}
        />
      )}

      {/* Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
