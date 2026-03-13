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
  Link2Off,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
} from "lucide-react";

function GoogleCalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" width={size} height={size} style={{ flexShrink: 0 }}>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

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
        <GoogleCalendarIcon size={18} />
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm transition-all disabled:opacity-50"
          >
            <GoogleCalendarIcon size={14} />
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
