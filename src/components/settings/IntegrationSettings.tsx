"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection, FieldRow, InputField } from "./SettingsSection";

interface IntegrationSettingsProps {
  onDirtyChange?: (dirty: boolean, save: () => void, discard: () => void) => void;
}

export function IntegrationSettings({ onDirtyChange }: IntegrationSettingsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [ycloudKey, setYcloudKey] = useState("");

  useEffect(() => {
    if (settings) {
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

  // ── Dirty tracking ──
  const isDirty = useMemo(() => {
    if (!settings) return false;
    return ycloudKey !== (settings.ycloud_apikey || "");
  }, [ycloudKey, settings]);

  const saveRef = useRef(save);
  saveRef.current = save;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const handleSave = useCallback(() => saveRef.current.mutate(), []);
  const handleDiscard = useCallback(() => {
    const s = settingsRef.current;
    if (!s) return;
    setYcloudKey(s.ycloud_apikey || "");
  }, []);

  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;

  useEffect(() => {
    onDirtyChangeRef.current?.(isDirty, handleSave, handleDiscard);
  }, [isDirty, handleSave, handleDiscard]);

  useEffect(() => {
    return () => { onDirtyChangeRef.current?.(false, () => {}, () => {}); };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />
    );
  }

  return (
    <SettingsSection
      title="Integraciones"
      description="API keys de servicios conectados"
    >
      <div className="space-y-1">
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
        Por seguridad, las API keys nunca se muestran. Ingresa una nueva para
        reemplazar la actual.
      </p>
    </SettingsSection>
  );
}
