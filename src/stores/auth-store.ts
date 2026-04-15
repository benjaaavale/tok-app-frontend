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
  canViewAllCalendar: boolean;
  synced: boolean;
  hasSeenTutorial: boolean;
  plan: PlanKey | null;
  subscriptionStatus: string;
  planLimits: { max_phone_slots: number; max_conversations_per_month: number } | null;
  conversationsThisPeriod: number;
  shopifyConnected: boolean;
  shopifyShopName: string | null;
  shopifyDomain: string | null;
  isSuperadmin: boolean;
  impersonatingCompanyId: number | null;
  impersonatingCompanyName: string | null;

  setAuth: (data: {
    companyToken: string;
    companyNombre: string;
    avatarUrl?: string | null;
    email?: string;
    role?: "admin" | "worker";
    workerId?: number | null;
    canRespondChats?: boolean;
    canViewAllCalendar?: boolean;
    hasSeenTutorial?: boolean;
    plan?: PlanKey | null;
    subscriptionStatus?: string;
    planLimits?: { max_phone_slots: number; max_conversations_per_month: number } | null;
    conversationsThisPeriod?: number;
    shopifyConnected?: boolean;
    shopifyShopName?: string | null;
    shopifyDomain?: string | null;
    is_superadmin?: boolean;
  }) => void;
  setAvatarUrl: (url: string) => void;
  setTutorialSeen: (seen: boolean) => void;
  setImpersonating: (companyId: number | null, companyName: string | null) => void;
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
  canViewAllCalendar: false,
  synced: false,
  hasSeenTutorial: false,
  plan: null,
  subscriptionStatus: "none",
  planLimits: null,
  conversationsThisPeriod: 0,
  shopifyConnected: false,
  shopifyShopName: null,
  shopifyDomain: null,
  isSuperadmin: false,
  impersonatingCompanyId: null,
  impersonatingCompanyName: null,

  setAuth: ({ companyToken, companyNombre, avatarUrl, email, role, workerId, canRespondChats, canViewAllCalendar, hasSeenTutorial, plan, subscriptionStatus, planLimits, conversationsThisPeriod, shopifyConnected, shopifyShopName, shopifyDomain, is_superadmin }) => {
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
      canViewAllCalendar: canViewAllCalendar ?? false,
      hasSeenTutorial: hasSeenTutorial || false,
      plan: plan || null,
      subscriptionStatus: subscriptionStatus || "none",
      planLimits: planLimits || null,
      conversationsThisPeriod: conversationsThisPeriod || 0,
      shopifyConnected: shopifyConnected || false,
      shopifyShopName: shopifyShopName || null,
      shopifyDomain: shopifyDomain || null,
      isSuperadmin: is_superadmin || false,
      synced: true,
    });
  },

  setAvatarUrl: (url) => set({ userAvatarUrl: url }),
  setTutorialSeen: (seen) => set({ hasSeenTutorial: seen }),
  setImpersonating: (companyId, companyName) => set({ impersonatingCompanyId: companyId, impersonatingCompanyName: companyName }),

  reset: () =>
    set({
      companyToken: null,
      companyNombre: null,
      userAvatarUrl: null,
      userInitials: "",
      role: null,
      workerId: null,
      canRespondChats: true,
      canViewAllCalendar: false,
      synced: false,
      hasSeenTutorial: false,
      plan: null,
      subscriptionStatus: "none",
      planLimits: null,
      conversationsThisPeriod: 0,
      shopifyConnected: false,
      shopifyShopName: null,
      shopifyDomain: null,
      isSuperadmin: false,
      impersonatingCompanyId: null,
      impersonatingCompanyName: null,
    }),
}));
