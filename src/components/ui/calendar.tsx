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
        // Layout
        root: "w-full",
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label: "text-[13px] font-semibold text-text-primary",
        nav: "flex items-center justify-between absolute inset-x-1 top-0",
        button_previous: cn(
          "h-7 w-7 rounded-lg border border-border-secondary bg-transparent",
          "flex items-center justify-center text-text-muted",
          "hover:bg-bg-hover hover:text-text-primary transition-all"
        ),
        button_next: cn(
          "h-7 w-7 rounded-lg border border-border-secondary bg-transparent",
          "flex items-center justify-center text-text-muted",
          "hover:bg-bg-hover hover:text-text-primary transition-all"
        ),
        // Grid
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-text-muted w-9 font-medium text-[11px] text-center pb-1",
        weeks: "",
        week: "flex w-full mt-0.5",
        // Day cell & button (v9 separates cell from button)
        day: "h-9 w-9 flex items-center justify-center p-0 relative",
        day_button: cn(
          "h-8 w-8 p-0 font-normal rounded-lg transition-all text-[12px]",
          "text-text-primary hover:bg-bg-hover",
          "focus:outline-none focus:ring-2 focus:ring-accent/30"
        ),
        // States
        selected: "[&>button]:bg-accent [&>button]:text-white [&>button]:hover:bg-accent-hover",
        today: "[&>button]:bg-accent/10 [&>button]:text-accent [&>button]:font-semibold",
        outside: "[&>button]:text-text-muted [&>button]:opacity-40",
        disabled: "[&>button]:text-text-muted [&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        hidden: "invisible",
        focused: "[&>button]:ring-2 [&>button]:ring-accent/30",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
