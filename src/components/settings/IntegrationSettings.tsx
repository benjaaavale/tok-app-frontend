"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection, FieldRow, InputField } from "./SettingsSection";
import { Save } from "lucide-react";

export function IntegrationSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [n8nUrl, setN8nUrl] = useState("");
  const [ycloudKey, setYcloudKey] = useState("");

  useEffect(() => {
    if (settings) {
      setN8nUrl(settings.n8n_webhook_url || "");
      setYcloudKey(settings.ycloud_apikey || "");
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      await authFetch(
        "/company/settings",
        {
          method: "PUT",
          body: JSON.stringify({
            n8n_webhook_url: n8nUrl,
            ycloud_apikey: ycloudKey,
          }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Integraciones guardadas");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />
    );
  }

  return (
    <SettingsSection
      title="Integraciones"
      description="API keys y URLs de servicios conectados"
    >
      <div className="space-y-1">
        <FieldRow label="n8n Webhook URL" htmlFor="n8n-url">
          <InputField
            id="n8n-url"
            value={n8nUrl}
            onChange={setN8nUrl}
            placeholder="https://n8n.example.com/webhook/..."
          />
        </FieldRow>

        <FieldRow label="YCloud API Key" htmlFor="ycloud-key">
          <InputField
            id="ycloud-key"
            value={ycloudKey}
            onChange={setYcloudKey}
            placeholder="ycl_..."
          />
        </FieldRow>
      </div>

      <p className="text-[10px] text-text-muted mt-2">
        Las API keys se muestran enmascaradas. Ingresa una nueva para
        reemplazar la actual.
      </p>

      <div className="pt-3 border-t border-border-secondary mt-3">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
        >
          <Save size={13} />
          {save.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </SettingsSection>
  );
}
