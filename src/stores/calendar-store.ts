import { create } from "zustand";

interface CalendarState {
  weekOffset: number;
  activeWorkerFilters: number[]; // empty = show all
  pendingAppointment: Record<string, unknown> | null;

  changeWeek: (delta: number) => void;
  goToday: () => void;
  setWeekOffset: (offset: number) => void;
  toggleWorkerFilter: (workerId: number) => void;
  resetFilters: () => void;
  setPendingAppointment: (appt: Record<string, unknown> | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  weekOffset: 0,
  activeWorkerFilters: [],
  pendingAppointment: null,

  changeWeek: (delta) =>
    set((state) => ({ weekOffset: state.weekOffset + delta })),

  goToday: () => set({ weekOffset: 0 }),

  setWeekOffset: (offset) => set({ weekOffset: offset }),

  toggleWorkerFilter: (workerId) =>
    set((state) => ({
      activeWorkerFilters: state.activeWorkerFilters.includes(workerId)
        ? state.activeWorkerFilters.filter((id) => id !== workerId)
        : [...state.activeWorkerFilters, workerId],
    })),

  resetFilters: () => set({ activeWorkerFilters: [] }),

  setPendingAppointment: (appt) => set({ pendingAppointment: appt }),
}));
