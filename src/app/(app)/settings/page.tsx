"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { AgentSettings } from "@/components/settings/AgentSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { GoogleCalendarSettings } from "@/components/settings/GoogleCalendarSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { WorkerManager } from "@/components/settings/WorkerManager";
import { UserProfileSettings } from "@/components/settings/UserProfileSettings";
import { Settings, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();

  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "connected") {
      toast.success("Google Calendar conectado exitosamente");
      window.history.replaceState({}, "", "/settings");
    } else if (googleStatus === "error") {
      toast.error("Error conectando Google Calendar");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={20} className="text-accent" />
        <h1 className="text-[18px] font-semibold text-text-primary">
          Configuración
        </h1>
      </div>

      {/* Sections */}
      <UserProfileSettings />
      <CompanySettings />
      <AgentSettings />
      <WorkerManager />
      <GoogleCalendarSettings />
      <NotificationSettings />
      <IntegrationSettings />

      {/* Cerrar sesión */}
      <div className="pt-2 pb-8">
        <button
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-150 w-full justify-center dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
