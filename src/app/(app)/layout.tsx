"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authFetch } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { SocketProvider } from "@/providers/socket-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppTutorial } from "@/components/AppTutorial";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const { synced, subscriptionStatus, setAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Sync Clerk user with backend on first load
  useEffect(() => {
    if (!isLoaded || !user || synced) return;

    const syncUser = async () => {
      try {
        const tokenGetter = () => getToken();

        // Sync clerk user with backend
        await authFetch("/auth/sync", { method: "POST" }, tokenGetter);

        // Get user profile
        const meRes = await authFetch("/auth/me", {}, tokenGetter);
        const meData = await meRes.json();

        setAuth({
          companyToken: meData.company_token,
          companyNombre: meData.company_nombre,
          avatarUrl: meData.avatar_url,
          email: user.primaryEmailAddress?.emailAddress,
          role: meData.role || "admin",
          workerId: meData.worker_id || null,
          canRespondChats: meData.can_respond_chats ?? true,
          canViewAllCalendar: meData.can_view_all_calendar ?? false,
          hasSeenTutorial: meData.has_seen_tutorial || false,
          plan: meData.plan || null,
          subscriptionStatus: meData.subscription_status || "none",
          planLimits: meData.plan_limits || null,
          conversationsThisPeriod: meData.conversations_this_period || 0,
        });
      } catch (err) {
        console.error("[Auth Sync Error]", err);
      }
    };

    syncUser();
  }, [isLoaded, user, synced, getToken, setAuth]);

  // Gate: redirect to /plans if no active subscription
  useEffect(() => {
    if (!synced) return;
    const needsPlan = subscriptionStatus !== "active";
    const isOnPlansPage = pathname === "/plans";

    if (needsPlan && !isOnPlansPage) {
      router.replace("/plans");
    }
  }, [synced, subscriptionStatus, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent" />
      </div>
    );
  }

  // Show plans page without sidebar/nav
  if (pathname === "/plans") {
    return (
      <ErrorBoundary>{children}</ErrorBoundary>
    );
  }

  return (
    <SocketProvider>
      <ConfirmProvider>
        <div className="flex flex-col lg:flex-row h-dvh bg-bg-sidebar">
          <Sidebar />
          <MobileHeader />
          <main className="flex-1 min-h-0 overflow-auto pb-16 lg:pb-0 bg-bg-primary lg:rounded-tl-2xl lg:border-l lg:border-t lg:border-border-secondary">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <BottomNav />
          <AppTutorial />
        </div>
      </ConfirmProvider>
    </SocketProvider>
  );
}
