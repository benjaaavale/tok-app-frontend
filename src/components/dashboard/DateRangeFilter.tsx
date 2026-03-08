"use client";

import { useState, useMemo } from "react";
import { CalendarDays } from "lucide-react";

type Preset = "week" | "month" | "lastmonth" | "custom";

interface DateRangeFilterProps {
  onChange: (from: string, to: string) => void;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function DateRangeFilter({ onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo(() => {
    const now = new Date();
    let from: Date, to: Date;

    switch (preset) {
      case "week":
        from = new Date(now);
        from.setDate(now.getDate() - now.getDay() + 1);
        to = new Date(from);
        to.setDate(from.getDate() + 6);
        break;
      case "month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastmonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "custom":
        return null;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { from: formatDate(from), to: formatDate(to) };
  }, [preset]);

  // Trigger onChange when range changes
  useMemo(() => {
    if (range) onChange(range.from, range.to);
  }, [range, onChange]);

  const handleCustomApply = () => {
    if (customFrom && customTo) onChange(customFrom, customTo);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <CalendarDays
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as Preset)}
          className="pl-8 pr-8 py-2 rounded-xl text-[12px] font-medium bg-bg-secondary border border-border-secondary text-text-primary appearance-none cursor-pointer hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        >
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="lastmonth">Mes anterior</option>
          <option value="custom">Personalizado</option>
        </select>
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-3 py-2 rounded-xl text-[12px] bg-bg-secondary border border-border-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          <span className="text-text-muted text-[12px]">a</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-3 py-2 rounded-xl text-[12px] bg-bg-secondary border border-border-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          <button
            onClick={handleCustomApply}
            className="btn-gradient px-4 py-2 rounded-xl text-[12px] font-medium"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
