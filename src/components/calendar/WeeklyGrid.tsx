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

const SLOT_HEIGHT = 48; // px per 30 min
const GRID_START = 7 * 60; // 07:00 in minutes

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const day = today.getDay();
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

function timeToMinutes(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Detect overlap groups and assign columns within each group */
function layoutAppointments(appts: Appointment[]): { appt: Appointment; col: number; totalCols: number }[] {
  if (appts.length === 0) return [];

  const items = appts.map((appt) => {
    const start = timeToMinutes(appt.hora?.slice(0, 5) || "09:00");
    const end = start + (appt.duracion || 30);
    return { appt, start, end };
  }).sort((a, b) => a.start - b.start || a.end - b.end);

  // Assign columns using a greedy algorithm
  const result: { appt: Appointment; col: number; totalCols: number; start: number; end: number }[] = [];
  const columns: number[] = []; // tracks end time of each column

  for (const item of items) {
    // Find first column where this appointment fits (no overlap)
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c] <= item.start) {
        columns[c] = item.end;
        result.push({ ...item, col: c, totalCols: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.push({ ...item, col: columns.length, totalCols: 0 });
      columns.push(item.end);
    }
  }

  // Now determine totalCols for each overlap group
  // Group items that overlap with each other
  const groups: number[][] = [];
  for (let i = 0; i < result.length; i++) {
    let added = false;
    for (const group of groups) {
      const overlaps = group.some((gi) => {
        const a = result[gi];
        const b = result[i];
        return a.start < b.end && b.start < a.end;
      });
      if (overlaps) {
        group.push(i);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([i]);
    }
  }

  // Merge groups that share overlapping members
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const overlaps = groups[i].some((ai) =>
          groups[j].some((bj) => {
            const a = result[ai];
            const b = result[bj];
            return a.start < b.end && b.start < a.end;
          })
        );
        if (overlaps) {
          groups[i].push(...groups[j]);
          groups.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  for (const group of groups) {
    const maxCol = Math.max(...group.map((i) => result[i].col)) + 1;
    for (const i of group) {
      result[i].totalCols = maxCol;
    }
  }

  // Items with no overlap
  for (const r of result) {
    if (r.totalCols === 0) r.totalCols = 1;
  }

  return result.map(({ appt, col, totalCols }) => ({ appt, col, totalCols }));
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
      const fechaKey = appt.fecha?.split("T")[0] ?? appt.fecha;
      if (!map[fechaKey]) map[fechaKey] = [];
      map[fechaKey].push(appt);
    }
    return map;
  }, [appointments, activeWorkerFilters]);

  // Layout appointments with overlap detection per day
  const layouts = useMemo(() => {
    const map: Record<string, ReturnType<typeof layoutAppointments>> = {};
    for (const [dateKey, appts] of Object.entries(grouped)) {
      map[dateKey] = layoutAppointments(appts);
    }
    return map;
  }, [grouped]);

  const totalHeight = TIMES.length * SLOT_HEIGHT;

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
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time labels column */}
          <div className="relative" style={{ height: totalHeight }}>
            {TIMES.map((time, i) => (
              <div
                key={time}
                className="absolute text-[10px] text-text-muted text-right pr-2 w-full"
                style={{ top: i * SLOT_HEIGHT + 1 }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day columns with absolute-positioned appointments */}
          {weekDays.map((d) => {
            const dateKey = formatDateKey(d);
            const dayLayout = layouts[dateKey] || [];

            return (
              <div
                key={dateKey}
                className="relative border-l border-border-secondary/50"
                style={{ height: totalHeight }}
              >
                {/* Slot grid lines */}
                {TIMES.map((time, i) => (
                  <div
                    key={time}
                    className="absolute w-full border-b border-border-secondary/50"
                    style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  />
                ))}

                {/* Appointments */}
                {dayLayout.map(({ appt, col, totalCols }) => {
                  const startMin = timeToMinutes(appt.hora?.slice(0, 5) || "09:00");
                  const duration = appt.duracion || 30;
                  const top = ((startMin - GRID_START) / 30) * SLOT_HEIGHT;
                  const height = (duration / 30) * SLOT_HEIGHT;
                  const widthPercent = 100 / totalCols;
                  const leftPercent = col * widthPercent;

                  return (
                    <div
                      key={appt.id}
                      className="absolute px-0.5"
                      style={{
                        top,
                        height,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      <AppointmentCard
                        appointment={appt}
                        onClick={onAppointmentClick}
                        compact={duration <= 30}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
