import { create } from "zustand";

interface CalendarState {
  weekOffset: number;
  activeWorkerFilters: number[]; // empty = show all

  changeWeek: (delta: number) => void;
  goToday: () => void;
  toggleWorkerFilter: (workerId: number) => void;
  resetFilters: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  weekOffset: 0,
  activeWorkerFilters: [],

  changeWeek: (delta) =>
    set((state) => ({ weekOffset: state.weekOffset + delta })),

  goToday: () => set({ weekOffset: 0 }),

  toggleWorkerFilter: (workerId) =>
    set((state) => ({
      activeWorkerFilters: state.activeWorkerFilters.includes(workerId)
        ? state.activeWorkerFilters.filter((id) => id !== workerId)
        : [...state.activeWorkerFilters, workerId],
    })),

  resetFilters: () => set({ activeWorkerFilters: [] }),
}));
