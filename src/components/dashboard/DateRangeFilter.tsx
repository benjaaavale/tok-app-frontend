"use client";

import { useState, useMemo } from "react";

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
    <div className="flex items-center gap-2 flex-wrap">
      {(["week", "month", "lastmonth", "custom"] as Preset[]).map((p) => (
        <button
          key={p}
          onClick={() => setPreset(p)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
            preset === p
              ? "bg-accent text-white shadow-sm"
              : "bg-bg-secondary text-text-secondary hover:bg-bg-hover border border-border-secondary"
          }`}
        >
          {p === "week" && "Semana"}
          {p === "month" && "Mes"}
          {p === "lastmonth" && "Mes anterior"}
          {p === "custom" && "Personalizado"}
        </button>
      ))}

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-[12px] bg-bg-secondary border border-border-secondary text-text-primary"
          />
          <span className="text-text-muted text-[12px]">a</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-[12px] bg-bg-secondary border border-border-secondary text-text-primary"
          />
          <button
            onClick={handleCustomApply}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-accent text-white hover:bg-accent-hover"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
