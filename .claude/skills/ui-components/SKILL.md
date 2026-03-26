---
description: "Expert skill for ToK UI Components and Design System. TRIGGER when the user mentions: UI, UX, design, components, styling, theme, dark mode, light mode, sidebar, bottom nav, button styles, AnimatedSelect, tabs, popover, scroll area, date picker, calendar component, CSS variables, colors, fonts, responsive, mobile, layout, or any visual/component work."
---

# ToK UI Components & Design System Expert

You are an expert on the ToK design system and reusable components.

## Design System (`tok-frontend/src/app/globals.css`)

### Color Tokens (CSS Variables)
**Light mode:**
- Backgrounds: `--bg-primary: #FFFFFF`, `--bg-secondary: #F4F7FB`, `--bg-sidebar: #E5E7EB`, `--bg-hover: #EDF1F7`
- Text: `--text-primary: #1B2559`, `--text-secondary: #475569`, `--text-muted: #8F9BBA`
- Borders: `--border-primary: #E2E8F0`, `--border-secondary: #E2E8F0`
- Accent: `--accent: #2563EB`, `--accent-hover: #1D4ED8`, `--accent-light: #EFF6FF`
- Status: `--success: #10B981`, `--danger: #EF4444`, `--warning: #F59E0B`, `--info: #06B6D4`

**Dark mode** (`.dark` class via next-themes):
- Backgrounds: `--bg-primary: #0F172A`, `--bg-secondary: #1E293B`, `--bg-sidebar: #111318`
- Accent shifts to: `--accent: #60A5FA`

### Gradients
- `--gradient-accent: linear-gradient(135deg, #2563EB, #3B82F6)`
- `.btn-gradient` class: gradient bg + hover shadow + translateY animation

### Typography
- Font: Inter via `next/font/google`
- Sizes used: 11px (labels), 12px (body small), 13px (body), 14px-16px (values), 18px (headings), 22px (page titles)

### Tailwind v4 Integration
All CSS vars mapped via `@theme inline` block to Tailwind utilities:
- `bg-bg-primary`, `text-text-primary`, `border-border-secondary`, etc.
- `bg-accent`, `text-accent`, `bg-accent-light`, etc.

## Reusable Components

### `AnimatedSelect` (`components/ui/animated-select.tsx`)
- **ALWAYS use this instead of native `<select>`**
- Props: `value, onChange, options, placeholder, allowEmpty, disabled, className, size ('sm'|'md'), dotColor, leftIcon`
- Features: portal-based dropdown (escapes overflow), framer-motion animations, staggered options, chevron rotation
- Closes on: outside click, scroll

### `Tabs` (`components/ui/tabs.tsx`)
- Radix UI `@radix-ui/react-tabs` adapted
- Components: `Tabs, TabsList, TabsTrigger, TabsContent`

### `Button` (`components/ui/button.tsx`)
- Standard button component

### `Popover` (`components/ui/popover.tsx`)
- Radix UI popover wrapper

### `ScrollArea` (`components/ui/scroll-area.tsx`)
- Radix UI scroll area with custom scrollbar

### `Calendar` (`components/ui/calendar.tsx`)
- Date picker calendar component

### `DatePicker` (`components/ui/date-picker.tsx`)
- Combined calendar + popover date picker

### `ErrorBoundary` (`components/ErrorBoundary.tsx`)
- React error boundary wrapper

## Layout Components

### `Sidebar` (`components/layout/Sidebar.tsx`)
- Desktop: collapsible on hover (68px → 220px), framer-motion animated
- Items: Dashboard, Mensajes, Agenda + Settings (admin only) + theme toggle + user profile
- Mobile: separate `MobileSidebar` full-screen overlay

### `BottomNav` (`components/layout/BottomNav.tsx`)
- Mobile-only bottom navigation bar (visible below lg breakpoint)

### App Layout (`app/(app)/layout.tsx`)
- Clerk auth sync → SocketProvider → Sidebar + main + BottomNav
- Main area: `flex-1 overflow-auto pb-16 lg:pb-0 bg-bg-primary lg:rounded-tl-2xl`

## Common Patterns
- Cards: `bg-bg-secondary border border-border-secondary rounded-xl shadow-sm`
- Buttons primary: `.btn-gradient` class
- Buttons secondary: `bg-bg-primary border border-border-secondary text-text-primary hover:bg-bg-hover rounded-lg`
- Icon containers: `w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center`
- Loading spinner: `h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent`
- Skeleton: `animate-pulse` with `bg-bg-secondary rounded-xl border border-border-secondary`
- Section headers: icon + title (18px semibold) + subtitle (11px muted)
- Icons: Lucide React (`lucide-react`), typically size 14-20, strokeWidth 1.5 (2 when active)
- Animations: framer-motion for modals, sidebars, selects; CSS transitions for hover states
- Responsive: `lg:` breakpoint for desktop/mobile split
- Toast notifications: `sonner` library
