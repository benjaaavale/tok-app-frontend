"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center bg-transparent p-0",
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-[12px] font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
      "disabled:pointer-events-none disabled:opacity-50",
      "relative overflow-hidden border-r border-border-secondary last:border-r-0",
      "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
      "data-[state=active]:bg-bg-secondary data-[state=active]:text-text-primary data-[state=active]:after:bg-accent",
      "data-[state=inactive]:bg-bg-primary data-[state=inactive]:text-text-muted data-[state=inactive]:hover:text-text-secondary data-[state=inactive]:hover:bg-bg-hover",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
