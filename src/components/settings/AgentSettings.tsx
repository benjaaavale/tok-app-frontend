"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Bot, Save } from "lucide-react";

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
    mutationFn: async () => {
      await authFetch(
        "/company/settings",
        {
          method: "PUT",
          body: JSON.stringify({ bot_auto_desactivar: botAutoDesactivar }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Configuración del agente guardada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
          onClick={() => setBotAutoDesactivar(!botAutoDesactivar)}
          className={`relative w-[40px] h-[22px] rounded-full transition-colors duration-250 flex-shrink-0 ${
            botAutoDesactivar ? "bg-accent" : "bg-border-primary"
          }`}
        >
          <div
            className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-250 ${
              botAutoDesactivar ? "left-[20px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>

      <div className="pt-3 mt-3">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
        >
          <Save size={13} />
          {save.isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </SettingsSection>
  );
}
