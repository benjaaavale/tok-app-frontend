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
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="22" height="22" x="13" y="13" fill="#fff"/>
      <polygon fill="#1e88e5" points="25.68,20.92 26.688,22.36 28.272,21.208 28.272,29.56 30,29.56 30,18.616 28.56,18.616"/>
      <path fill="#1e88e5" d="M22.943,23.745c0.625-0.574,1.013-1.37,1.013-2.249c0-1.747-1.533-3.168-3.417-3.168c-1.602,0-2.972,1.009-3.33,2.453l1.657,0.421c0.165-0.664,0.868-1.146,1.673-1.146c0.942,0,1.709,0.646,1.709,1.44c0,0.794-0.767,1.44-1.709,1.44h-0.997v1.728h0.997c1.081,0,1.993,0.751,1.993,1.64c0,0.904-0.866,1.64-1.931,1.64c-0.962,0-1.784-0.61-1.914-1.418L17,26.802c0.262,1.636,1.81,2.87,3.6,2.87c2.007,0,3.64-1.511,3.64-3.368C24.24,25.281,23.736,24.363,22.943,23.745z"/>
      <polygon fill="#fbc02d" points="34,42 14,42 13,38 14,34 34,34 35,38"/>
      <polygon fill="#4caf50" points="38,35 42,34 42,14 38,13 34,14 34,34"/>
      <path fill="#1e88e5" d="M34,14l1-4l-1-4H9C7.343,6,6,7.343,6,9v25l4,1l4-1V14H34z"/>
      <polygon fill="#e53935" points="34,34 34,42 42,34"/>
      <path fill="#1565c0" d="M39,6h-5v8h8V9C42,7.343,40.657,6,39,6z"/>
      <path fill="#1565c0" d="M9,42h5v-8H6v5C6,40.657,7.343,42,9,42z"/>
    </svg>
  );
}

export function GoogleCalendarSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useCompanySettings();
  const { data: workers } = useWorkers();

  const isConnected = settings?.google_connected ?? false;
  const googleEmail = settings?.google_email;

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
          {isConnected && googleEmail && (
            <p className="text-[11px] text-accent font-medium">
              {googleEmail}
            </p>
          )}
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
