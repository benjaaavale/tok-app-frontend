"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsProps {
  onDirtyChange?: (dirty: boolean, save: () => void, discard: () => void) => void;
}

export function NotificationSettings({ onDirtyChange }: NotificationSettingsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);

  useEffect(() => {
    if (settings) {
      setReminderEnabled(settings.reminder_enabled ?? true);
      setReminderHours(settings.reminder_hours_before ?? 24);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      await authFetch(
        "/company/settings",
        {
          method: "PUT",
          body: JSON.stringify({
            reminder_enabled: reminderEnabled,
            reminder_hours_before: reminderHours,
          }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Configuración de notificaciones guardada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Dirty tracking ──
  const isDirty = useMemo(() => {
    if (!settings) return false;
    return (
      reminderEnabled !== (settings.reminder_enabled ?? true) ||
      reminderHours !== (settings.reminder_hours_before ?? 24)
    );
  }, [reminderEnabled, reminderHours, settings]);

  const saveRef = useRef(save);
  saveRef.current = save;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const handleSave = useCallback(() => saveRef.current.mutate(), []);
  const handleDiscard = useCallback(() => {
    const s = settingsRef.current;
    if (!s) return;
    setReminderEnabled(s.reminder_enabled ?? true);
    setReminderHours(s.reminder_hours_before ?? 24);
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
    return <div className="h-[120px] bg-bg-secondary rounded-2xl animate-pulse" />;
  }

  return (
    <SettingsSection
      title="Notificaciones"
      description="Configura los recordatorios automáticos de citas"
    >
      <div className="space-y-3">
        {/* Toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-bg-primary rounded-xl border border-border-secondary">
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-text-muted" />
            <div>
              <p className={`text-[12px] font-medium transition-colors duration-200 ${
                reminderEnabled ? "text-text-primary" : "text-text-muted"
              }`}>
                Recordatorios automáticos
              </p>
              <p className="text-[10px] text-text-muted">
                Enviar email de recordatorio antes de cada cita
              </p>
            </div>
          </div>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={(v) => setReminderEnabled(v)}
          />
        </div>

        {/* Hours before */}
        {reminderEnabled && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-bg-primary rounded-xl border border-border-secondary">
            <p className="text-[12px] text-text-primary flex-1">
              Horas antes de la cita
            </p>
            <AnimatedSelect
              value={reminderHours}
              onChange={(v) => setReminderHours(Number(v))}
              options={[
                { value: 1, label: "1 hora" },
                { value: 2, label: "2 horas" },
                { value: 6, label: "6 horas" },
                { value: 12, label: "12 horas" },
                { value: 24, label: "24 horas" },
                { value: 48, label: "48 horas" },
              ]}
              allowEmpty={false}
              className="w-32"
            />
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
