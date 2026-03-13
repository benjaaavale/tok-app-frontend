import { create } from "zustand";

interface AuthState {
  companyToken: string | null;
  companyNombre: string | null;
  userAvatarUrl: string | null;
  userInitials: string;
  role: "admin" | "worker" | null;
  workerId: number | null;
  synced: boolean;

  setAuth: (data: {
    companyToken: string;
    companyNombre: string;
    avatarUrl?: string | null;
    email?: string;
    role?: "admin" | "worker";
    workerId?: number | null;
  }) => void;
  setAvatarUrl: (url: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  companyToken: null,
  companyNombre: null,
  userAvatarUrl: null,
  userInitials: "",
  role: null,
  workerId: null,
  synced: false,

  setAuth: ({ companyToken, companyNombre, avatarUrl, email, role, workerId }) => {
    const initials = email
      ? email.split("@")[0].slice(0, 2).toUpperCase()
      : "TK";
    set({
      companyToken,
      companyNombre,
      userAvatarUrl: avatarUrl || null,
      userInitials: initials,
      role: role || "admin",
      workerId: workerId || null,
      synced: true,
    });
  },

  setAvatarUrl: (url) => set({ userAvatarUrl: url }),

  reset: () =>
    set({
      companyToken: null,
      companyNombre: null,
      userAvatarUrl: null,
      userInitials: "",
      role: null,
      workerId: null,
      synced: false,
    }),
}));
