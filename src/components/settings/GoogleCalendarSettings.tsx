"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWorkers } from "@/hooks/useWorkers";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import {
  Calendar,
  Link2,
  Link2Off,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
} from "lucide-react";

export function GoogleCalendarSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useCompanySettings();
  const { data: workers } = useWorkers();

  const isConnected = settings?.google_connected ?? false;

  const connectGoogle = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/auth/google/url", {}, () => getToken());
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo obtener URL de autorización");
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disconnectGoogle = useMutation({
    mutationFn: async () => {
      await authFetch(
        "/auth/google/disconnect",
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Google Calendar desconectado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [creatingCalFor, setCreatingCalFor] = useState<number | null>(null);

  const createCalendar = useMutation({
    mutationFn: async (workerId: number) => {
      setCreatingCalFor(workerId);
      const res = await authFetch(
        `/workers/${workerId}/create-calendar`,
        { method: "POST" },
        () => getToken()
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error creando calendario");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Calendario creado en Google Calendar");
      setCreatingCalFor(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setCreatingCalFor(null);
    },
  });

  return (
    <SettingsSection
      title="Google Calendar"
      description="Conecta tu cuenta de Google para sincronizar calendarios"
    >
      {/* Connection status */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-secondary">
        <Calendar size={18} className={isConnected ? "text-success" : "text-text-muted"} />
        <div className="flex-1">
          <p className="text-[12px] font-medium text-text-primary">
            {isConnected ? "Google Calendar conectado" : "No conectado"}
          </p>
          <p className="text-[10px] text-text-muted">
            {isConnected
              ? "Los calendarios de tus trabajadores se sincronizan automáticamente"
              : "Conecta tu cuenta de Google para crear calendarios por trabajador"}
          </p>
        </div>
        {isConnected ? (
          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
        ) : (
          <XCircle size={16} className="text-text-muted flex-shrink-0" />
        )}
      </div>

      {/* Connect/Disconnect button */}
      <div className="mt-3">
        {isConnected ? (
          <button
            onClick={() => {
              if (confirm("¿Desconectar Google Calendar? Los calendarios existentes no se eliminarán.")) {
                disconnectGoogle.mutate();
              }
            }}
            disabled={disconnectGoogle.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
          >
            <Link2Off size={13} />
            {disconnectGoogle.isPending ? "Desconectando..." : "Desconectar"}
          </button>
        ) : (
          <button
            onClick={() => connectGoogle.mutate()}
            disabled={connectGoogle.isPending}
            className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
          >
            <Link2 size={13} />
            {connectGoogle.isPending ? "Conectando..." : "Conectar Google Calendar"}
          </button>
        )}
      </div>

      {/* Worker calendars */}
      {isConnected && workers && workers.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Calendarios por trabajador
          </p>
          {workers.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 px-3 py-2 bg-bg-primary rounded-xl border border-border-secondary"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: w.color }}
              />
              <p className="text-[12px] font-medium text-text-primary flex-1">
                {w.nombre}
              </p>
              {w.google_calendar_id ? (
                <span className="flex items-center gap-1 text-[10px] text-success px-2 py-0.5 rounded-full bg-success/10">
                  <CheckCircle2 size={10} />
                  Sincronizado
                </span>
              ) : (
                <button
                  onClick={() => createCalendar.mutate(w.id)}
                  disabled={creatingCalFor === w.id}
                  className="flex items-center gap-1 text-[10px] text-accent px-2 py-0.5 rounded-full bg-accent/10 hover:bg-accent/20 transition-all disabled:opacity-50"
                >
                  {creatingCalFor === w.id ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Plus size={10} />
                  )}
                  Crear calendario
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
