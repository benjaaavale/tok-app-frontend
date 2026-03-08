import { create } from "zustand";

interface AuthState {
  companyToken: string | null;
  companyNombre: string | null;
  userAvatarUrl: string | null;
  userInitials: string;
  synced: boolean;

  setAuth: (data: {
    companyToken: string;
    companyNombre: string;
    avatarUrl?: string | null;
    email?: string;
  }) => void;
  setAvatarUrl: (url: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  companyToken: null,
  companyNombre: null,
  userAvatarUrl: null,
  userInitials: "",
  synced: false,

  setAuth: ({ companyToken, companyNombre, avatarUrl, email }) => {
    const initials = email
      ? email.split("@")[0].slice(0, 2).toUpperCase()
      : "TK";
    set({
      companyToken,
      companyNombre,
      userAvatarUrl: avatarUrl || null,
      userInitials: initials,
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
      synced: false,
    }),
}));
