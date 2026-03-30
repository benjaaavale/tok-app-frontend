import { create } from "zustand";

interface AuthState {
  companyToken: string | null;
  companyNombre: string | null;
  userAvatarUrl: string | null;
  userInitials: string;
  role: "admin" | "worker" | null;
  workerId: number | null;
  canRespondChats: boolean;
  synced: boolean;
  hasSeenTutorial: boolean;

  setAuth: (data: {
    companyToken: string;
    companyNombre: string;
    avatarUrl?: string | null;
    email?: string;
    role?: "admin" | "worker";
    workerId?: number | null;
    canRespondChats?: boolean;
    hasSeenTutorial?: boolean;
  }) => void;
  setAvatarUrl: (url: string) => void;
  setTutorialSeen: (seen: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  companyToken: null,
  companyNombre: null,
  userAvatarUrl: null,
  userInitials: "",
  role: null,
  workerId: null,
  canRespondChats: true,
  synced: false,
  hasSeenTutorial: false,

  setAuth: ({ companyToken, companyNombre, avatarUrl, email, role, workerId, canRespondChats, hasSeenTutorial }) => {
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
      canRespondChats: canRespondChats ?? true,
      hasSeenTutorial: hasSeenTutorial || false,
      synced: true,
    });
  },

  setAvatarUrl: (url) => set({ userAvatarUrl: url }),
  setTutorialSeen: (seen) => set({ hasSeenTutorial: seen }),

  reset: () =>
    set({
      companyToken: null,
      companyNombre: null,
      userAvatarUrl: null,
      userInitials: "",
      role: null,
      workerId: null,
      canRespondChats: true,
      synced: false,
      hasSeenTutorial: false,
    }),
}));
