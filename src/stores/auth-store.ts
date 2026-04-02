import { create } from "zustand";
import type { PlanKey } from "@/types/api";

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
  plan: PlanKey | null;
  subscriptionStatus: string;
  planLimits: { max_phone_slots: number; max_conversations_per_month: number } | null;
  conversationsThisPeriod: number;

  setAuth: (data: {
    companyToken: string;
    companyNombre: string;
    avatarUrl?: string | null;
    email?: string;
    role?: "admin" | "worker";
    workerId?: number | null;
    canRespondChats?: boolean;
    hasSeenTutorial?: boolean;
    plan?: PlanKey | null;
    subscriptionStatus?: string;
    planLimits?: { max_phone_slots: number; max_conversations_per_month: number } | null;
    conversationsThisPeriod?: number;
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
  plan: null,
  subscriptionStatus: "none",
  planLimits: null,
  conversationsThisPeriod: 0,

  setAuth: ({ companyToken, companyNombre, avatarUrl, email, role, workerId, canRespondChats, hasSeenTutorial, plan, subscriptionStatus, planLimits, conversationsThisPeriod }) => {
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
      plan: plan || null,
      subscriptionStatus: subscriptionStatus || "none",
      planLimits: planLimits || null,
      conversationsThisPeriod: conversationsThisPeriod || 0,
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
      plan: null,
      subscriptionStatus: "none",
      planLimits: null,
      conversationsThisPeriod: 0,
    }),
}));
