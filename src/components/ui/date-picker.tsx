"use client"
import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: (date: Date) => boolean
}

export function DatePicker({ date, onDateChange, placeholder = "Seleccionar fecha", className, disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-border-secondary",
            "text-[12px] text-left transition-all focus:outline-none focus:ring-2 focus:ring-accent/30",
            !date && "text-text-muted",
            date && "text-text-primary",
            className
          )}
        >
          <CalendarIcon size={14} className="text-text-muted shrink-0" />
          {date ? format(date, "EEEE d 'de' MMMM, yyyy", { locale: es }) : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
