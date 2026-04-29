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

// Hidratar impersonación desde localStorage para que persista entre reloads
function getStoredImpersonation(): { id: number | null; name: string | null } {
  if (typeof window === "undefined") return { id: null, name: null };
  try {
    const raw = localStorage.getItem("tok-impersonate");
    if (!raw) return { id: null, name: null };
    const parsed = JSON.parse(raw);
    return { id: parsed.id ?? null, name: parsed.name ?? null };
  } catch {
    return { id: null, name: null };
  }
}

const storedImpersonation = getStoredImpersonation();

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
  impersonatingCompanyId: storedImpersonation.id,
  impersonatingCompanyName: storedImpersonation.name,

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
  setImpersonating: (companyId, companyName) => {
    if (typeof window !== "undefined") {
      if (companyId) {
        localStorage.setItem(
          "tok-impersonate",
          JSON.stringify({ id: companyId, name: companyName })
        );
      } else {
        localStorage.removeItem("tok-impersonate");
      }
    }
    set({ impersonatingCompanyId: companyId, impersonatingCompanyName: companyName });
  },

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
