"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-[13px] font-semibold text-text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 rounded-lg border border-border-secondary hover:bg-bg-hover transition-all flex items-center justify-center text-text-muted hover:text-text-primary"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-text-muted rounded-md w-9 font-medium text-[11px] text-center",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-[12px] p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-lg hover:bg-bg-hover transition-all text-text-primary text-[12px]",
          "aria-selected:opacity-100"
        ),
        day_selected: "bg-accent text-white hover:bg-accent-hover hover:text-white focus:bg-accent focus:text-white rounded-lg",
        day_today: "bg-accent/10 text-accent font-semibold",
        day_outside: "text-text-muted opacity-40 aria-selected:bg-accent/50 aria-selected:text-white",
        day_disabled: "text-text-muted opacity-30 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className: cls, ...p }) => <ChevronLeft className={cn("h-4 w-4", cls)} {...p} />,
        IconRight: ({ className: cls, ...p }) => <ChevronRight className={cn("h-4 w-4", cls)} {...p} />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
