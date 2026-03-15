"use client";

import { useMemo } from "react";
import { useCalendarStore } from "@/stores/calendar-store";
import { TIMES } from "@/lib/constants";
import { AppointmentCard } from "./AppointmentCard";
import type { Appointment } from "@/types/api";

interface WeeklyGridProps {
  appointments: Appointment[];
  onAppointmentClick: (appt: Appointment) => void;
}

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const day = today.getDay();
  // Monday = 0 offset
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function WeeklyGrid({
  appointments,
  onAppointmentClick,
}: WeeklyGridProps) {
  const { weekOffset, activeWorkerFilters } = useCalendarStore();

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const todayKey = formatDateKey(new Date());

  // Group appointments by date
  const grouped = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    const filtered =
      activeWorkerFilters.length === 0
        ? appointments
        : appointments.filter(
            (a) => a.worker_id && activeWorkerFilters.includes(a.worker_id)
          );

    for (const appt of filtered) {
      if (!map[appt.fecha]) map[appt.fecha] = [];
      map[appt.fecha].push(appt);
    }
    return map;
  }, [appointments, activeWorkerFilters]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-10 bg-bg-secondary border-b border-border-secondary">
          <div className="p-2" />
          {weekDays.map((d, i) => {
            const key = formatDateKey(d);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className="p-2 text-center border-l border-border-secondary"
              >
                <p className="text-[10px] text-text-muted font-medium">
                  {DAY_NAMES[i]}
                </p>
                <p
                  className={`text-[14px] font-semibold mt-0.5 ${
                    isToday
                      ? "text-white bg-accent w-7 h-7 rounded-full flex items-center justify-center mx-auto"
                      : "text-text-primary"
                  }`}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          {TIMES.map((time) => (
            <div
              key={time}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-secondary/50"
              style={{ minHeight: "48px" }}
            >
              <div className="p-1 text-[10px] text-text-muted text-right pr-2 pt-1">
                {time}
              </div>
              {weekDays.map((d) => {
                const dateKey = formatDateKey(d);
                const dayAppts = grouped[dateKey] || [];
                const slotAppts = dayAppts.filter((a) => {
                  const h = a.hora?.slice(0, 5);
                  return h === time;
                });

                return (
                  <div
                    key={`${dateKey}-${time}`}
                    className="border-l border-border-secondary/50 p-0.5 min-h-[48px]"
                  >
                    {slotAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        onClick={onAppointmentClick}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
