"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const EASE = "0.25s cubic-bezier(0.4, 0, 0.2, 1)";

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const width = compact ? 40 : 64;
  const height = compact ? 24 : 32;
  const knobSize = compact ? 16 : 24;
  const iconSize = compact ? 10 : 16;
  const travel = width - knobSize - 8; // 8 = 2*padding

  return (
    <div
      className={cn(
        "flex p-1 rounded-full cursor-pointer",
        isDark ? "bg-zinc-950 border border-zinc-800" : "bg-white border border-zinc-200",
        className
      )}
      style={{
        width,
        height,
        transition: `width ${EASE}, height ${EASE}, background-color 0.2s ease`,
      }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="button"
      tabIndex={0}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <div className="relative flex items-center w-full h-full">
        {/* Moving knob */}
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full",
            isDark ? "bg-zinc-800" : "bg-gray-200"
          )}
          style={{
            width: knobSize,
            height: knobSize,
            transform: isDark ? "translateX(0)" : `translateX(${travel}px)`,
            transition: `transform 0.25s ease, width ${EASE}, height ${EASE}`,
          }}
        >
          {isDark ? (
            <Moon style={{ width: iconSize, height: iconSize }} className="text-white" strokeWidth={1.5} />
          ) : (
            <Sun style={{ width: iconSize, height: iconSize }} className="text-gray-700" strokeWidth={1.5} />
          )}
        </div>

        {/* Static secondary icon */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: knobSize,
            height: knobSize,
            left: isDark ? "auto" : 4,
            right: isDark ? 4 : "auto",
          }}
        >
          {isDark ? (
            <Sun style={{ width: iconSize, height: iconSize }} className="text-gray-500" strokeWidth={1.5} />
          ) : (
            <Moon style={{ width: iconSize, height: iconSize }} className="text-black" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
