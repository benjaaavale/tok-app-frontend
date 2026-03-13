"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Bell, Save } from "lucide-react";

export function NotificationSettings() {
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
              <p className="text-[12px] font-medium text-text-primary">
                Recordatorios automáticos
              </p>
              <p className="text-[10px] text-text-muted">
                Enviar email de recordatorio antes de cada cita
              </p>
            </div>
          </div>
          <button
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className={`relative w-10 h-[22px] rounded-full transition-all ${
              reminderEnabled ? "bg-accent" : "bg-bg-hover"
            }`}
          >
            <div
              className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all ${
                reminderEnabled ? "left-[22px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>

        {/* Hours before */}
        {reminderEnabled && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-bg-primary rounded-xl border border-border-secondary">
            <p className="text-[12px] text-text-primary flex-1">
              Horas antes de la cita
            </p>
            <select
              value={reminderHours}
              onChange={(e) => setReminderHours(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
            </select>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border-secondary mt-3">
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
