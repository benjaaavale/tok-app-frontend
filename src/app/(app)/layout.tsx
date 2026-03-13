"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/stores/auth-store";
import { authFetch } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SocketProvider } from "@/providers/socket-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const { synced, setAuth } = useAuthStore();

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
          email: user.emailAddresses[0]?.emailAddress,
          role: meData.role || "admin",
          workerId: meData.worker_id || null,
        });
      } catch (err) {
        console.error("[Auth Sync Error]", err);
      }
    };

    syncUser();
  }, [isLoaded, user, synced, getToken, setAuth]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen bg-bg-sidebar">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0 bg-bg-primary lg:rounded-tl-2xl lg:border-l lg:border-t lg:border-border-secondary">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </SocketProvider>
  );
}
