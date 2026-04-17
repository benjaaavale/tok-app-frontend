"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  onDark?: boolean;
  className?: string;
}

/**
 * Pequeño icono de información con tooltip al hacer hover.
 * Implementación CSS-only usando group-hover + absolute.
 */
export function InfoTooltip({ text, onDark, className }: InfoTooltipProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center group/info cursor-help align-middle",
        className
      )}
      tabIndex={0}
      aria-label={text}
    >
      <Info
        size={12}
        className={cn(
          "transition-opacity",
          onDark
            ? "text-white/50 group-hover/info:text-white/90"
            : "text-text-muted/70 group-hover/info:text-text-secondary"
        )}
      />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50",
          "whitespace-normal text-[11px] leading-snug font-medium",
          "px-2.5 py-1.5 rounded-lg shadow-lg",
          "bg-[var(--bg-primary)] text-text-primary border border-border-secondary",
          "w-[200px] text-left",
          "opacity-0 translate-y-1 scale-95",
          "group-hover/info:opacity-100 group-hover/info:translate-y-0 group-hover/info:scale-100",
          "group-focus/info:opacity-100 group-focus/info:translate-y-0 group-focus/info:scale-100",
          "transition-all duration-150 ease-out"
        )}
      >
        {text}
      </span>
    </span>
  );
}
