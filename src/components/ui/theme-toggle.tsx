"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  /** When sidebar is collapsed, show compact version */
  compact?: boolean
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={cn(
        "flex p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark
          ? "bg-zinc-950 border border-zinc-800"
          : "bg-white border border-zinc-200",
        compact ? "w-10 h-6" : "w-16 h-8",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="button"
      tabIndex={0}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center rounded-full transition-transform duration-300",
            compact ? "w-4 h-4" : "w-6 h-6",
            isDark
              ? "transform translate-x-0 bg-zinc-800"
              : compact
                ? "transform translate-x-4 bg-gray-200"
                : "transform translate-x-8 bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon
              className={cn(
                "text-white",
                compact ? "w-2.5 h-2.5" : "w-4 h-4"
              )}
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className={cn(
                "text-gray-700",
                compact ? "w-2.5 h-2.5" : "w-4 h-4"
              )}
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center rounded-full transition-transform duration-300",
            compact ? "w-4 h-4" : "w-6 h-6",
            isDark
              ? "bg-transparent"
              : compact
                ? "transform -translate-x-4"
                : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun
              className={cn(
                "text-gray-500",
                compact ? "w-2.5 h-2.5" : "w-4 h-4"
              )}
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className={cn(
                "text-black",
                compact ? "w-2.5 h-2.5" : "w-4 h-4"
              )}
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
