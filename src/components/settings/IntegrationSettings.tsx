"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection, FieldRow, InputField } from "./SettingsSection";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Paso a paso YCloud ────────────────────────────────────────────────────────
// Coloca las imágenes en /public/guides/ycloud/paso-1.png, paso-2.png, etc.
// Si no existe la imagen, se muestra un placeholder gris.
const YCLOUD_STEPS = [
  {
    title: "Crea tu cuenta en YCloud",
    description:
      'Ve a ycloud.com y regístrate. Una vez dentro, accede al panel de administración.',
    image: "/guides/ycloud/paso-1.png",
  },
  {
    title: "Obtén tu API Key",
    description:
      'En el menú lateral ve a Configuración → API Keys. Haz click en "Crear API Key", asígnale un nombre y cópiala.',
    image: "/guides/ycloud/paso-2.png",
  },
  {
    title: "Conecta tu número de WhatsApp",
    description:
      'En YCloud ve a WhatsApp → Números de teléfono y conecta tu número de WhatsApp Business. Sigue el proceso de verificación de Meta.',
    image: "/guides/ycloud/paso-3.png",
  },
  {
    title: "Configura el Webhook",
    description:
      'En YCloud ve a Configuración → Webhooks. Agrega la URL de ToK como webhook endpoint para recibir mensajes.',
    image: "/guides/ycloud/paso-4.png",
  },
  {
    title: "Pega tu API Key en ToK",
    description:
      'Vuelve aquí, pega la API Key en el campo de arriba, guarda y haz click en "Probar conexión" para verificar.',
    image: "/guides/ycloud/paso-5.png",
  },
];

function YCloudGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border-secondary overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-hover transition-colors text-left"
      >
        <span className="text-[12px] font-medium text-text-primary">
          ¿Cómo obtengo mi API Key de YCloud?
        </span>
        {open ? (
          <ChevronUp size={14} className="text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-text-muted flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-border-secondary">
          {YCLOUD_STEPS.map((step, i) => (
            <div key={i} className="p-4 flex gap-4 bg-bg-primary">
              {/* Step number */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">
                    {step.title}
                  </p>
                  <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Image slot */}
                <div className="rounded-lg overflow-hidden border border-border-secondary bg-bg-secondary">
                  <img
                    src={step.image}
                    alt={`Paso ${i + 1}`}
                    className="w-full object-cover"
                    onError={(e) => {
                      // Si no hay imagen todavía, muestra placeholder
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden py-8 text-center text-[11px] text-text-muted">
                    Imagen del paso {i + 1} próximamente
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Botón de prueba de conexión ───────────────────────────────────────────────
function YCloudTestButton({ hasKey }: { hasKey: boolean }) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTest = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await authFetch("/company/ycloud/test", { method: "POST" }, () => getToken());
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        toast.success("Conexión con YCloud exitosa ✓");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Error desconocido");
        toast.error(data.error || "Error al conectar con YCloud");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Error de red");
      toast.error("Error de red al probar YCloud");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleTest}
        disabled={!hasKey || status === "loading"}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-40",
          "border border-border-secondary bg-bg-secondary hover:bg-bg-hover text-text-primary"
        )}
      >
        {status === "loading" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : status === "ok" ? (
          <CheckCircle2 size={12} className="text-emerald-500" />
        ) : status === "error" ? (
          <XCircle size={12} className="text-red-500" />
        ) : null}
        Probar conexión
      </button>
      {status === "ok" && (
        <span className="text-[11px] text-emerald-500 font-medium">Conectado</span>
      )}
      {status === "error" && (
        <span className="text-[11px] text-red-500">{errorMsg}</span>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
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
          body: JSON.stringify({ ycloud_apikey: ycloudKey }),
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
    return <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />;
  }

  const hasKey = !!(settings?.ycloud_apikey);

  return (
    <SettingsSection
      title="Integraciones"
      description="API keys de servicios conectados"
    >
      <div className="space-y-3">
        <FieldRow label="YCloud API Key" htmlFor="ycloud-key">
          <InputField
            id="ycloud-key"
            value={ycloudKey}
            onChange={setYcloudKey}
            placeholder="ycl_..."
          />
        </FieldRow>

        <div className="flex items-center justify-between pl-[120px]">
          <p className="text-[10px] text-text-muted">
            Por seguridad las API keys nunca se muestran. Ingresa una nueva para reemplazar.
          </p>
          <YCloudTestButton hasKey={hasKey && !isDirty} />
        </div>

        <YCloudGuide />
      </div>
    </SettingsSection>
  );
}
