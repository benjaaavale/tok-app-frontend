"use client";

import { CompanySettings } from "@/components/settings/CompanySettings";
import { AgentSettings } from "@/components/settings/AgentSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { WorkerManager } from "@/components/settings/WorkerManager";
import { UserProfileSettings } from "@/components/settings/UserProfileSettings";
import { Settings } from "lucide-react";

export default function SettingsPage() {
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
      <IntegrationSettings />
    </div>
  );
}
