"use client";

import { useWorkers } from "@/hooks/useWorkers";
import { useCalendarStore } from "@/stores/calendar-store";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export function WorkerFilter() {
  const { data: workers } = useWorkers();
  const { activeWorkerFilters, toggleWorkerFilter, resetFilters } =
    useCalendarStore();

  if (!workers || workers.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          <Users size={12} />
          Equipo
        </div>
        {activeWorkerFilters.length > 0 && (
          <button
            onClick={resetFilters}
            className="text-[10px] text-accent hover:underline"
          >
            Todos
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {workers.map((w) => {
          const isActive =
            activeWorkerFilters.length === 0 ||
            activeWorkerFilters.includes(w.id);
          return (
            <button
              key={w.id}
              onClick={() => toggleWorkerFilter(w.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border",
                isActive
                  ? "bg-bg-primary border-border-secondary text-text-primary"
                  : "bg-transparent border-transparent text-text-muted opacity-50"
              )}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: w.color }}
              />
              {w.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
