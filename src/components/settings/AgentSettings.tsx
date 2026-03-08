"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Bot } from "lucide-react";

export function AgentSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [botAutoDesactivar, setBotAutoDesactivar] = useState(false);

  useEffect(() => {
    if (settings) {
      setBotAutoDesactivar(settings.bot_auto_desactivar || false);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async (newValue: boolean) => {
      await authFetch(
        "/company/settings",
        {
          method: "PUT",
          body: JSON.stringify({ bot_auto_desactivar: newValue }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Cambios guardados", {
        style: { background: "#10B981", color: "white", border: "none" },
        duration: 2000,
      });
    },
    onError: (err: Error) => {
      // Revert on error
      setBotAutoDesactivar((prev) => !prev);
      toast.error(err.message);
    },
  });

  const handleToggle = () => {
    const newValue = !botAutoDesactivar;
    setBotAutoDesactivar(newValue);
    save.mutate(newValue);
  };

  if (isLoading) {
    return (
      <div className="h-[120px] bg-bg-secondary rounded-2xl animate-pulse" />
    );
  }

  return (
    <SettingsSection
      title="Agente IA"
      description="Comportamiento del bot de WhatsApp"
    >
      <div className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-border-secondary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bot size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-text-primary">
              Auto-desactivar al responder
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Desactiva el bot cuando un agente humano responde manualmente
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={save.isPending}
          className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-60 ${
            botAutoDesactivar ? "bg-accent" : "bg-border-primary"
          }`}
        >
          <div
            className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
              botAutoDesactivar ? "left-[22px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>
    </SettingsSection>
  );
}
