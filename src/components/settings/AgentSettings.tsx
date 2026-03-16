"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAgentConfig, useUpdateAgentConfig } from "@/hooks/useAgentConfig";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Bot, Sparkles, MessageSquareText, ListChecks, Zap } from "lucide-react";

export function AgentSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useCompanySettings();
  const { data: agentConfig, isLoading: configLoading } = useAgentConfig();
  const updateConfig = useUpdateAgentConfig();

  const [botAutoDesactivar, setBotAutoDesactivar] = useState(false);
  const [useInternalAgent, setUseInternalAgent] = useState(false);

  // Agent config fields
  const [tone, setTone] = useState("");
  const [examples, setExamples] = useState("");
  const [responseStructure, setResponseStructure] = useState("");

  useEffect(() => {
    if (settings) {
      setBotAutoDesactivar(settings.bot_auto_desactivar || false);
      setUseInternalAgent(settings.use_internal_agent || false);
    }
  }, [settings]);

  useEffect(() => {
    if (agentConfig) {
      setTone(agentConfig.tone || "");
      setExamples(agentConfig.examples || "");
      setResponseStructure(agentConfig.response_structure || "");
    }
  }, [agentConfig]);

  const saveCompanySetting = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await authFetch(
        "/company/settings",
        { method: "PUT", body: JSON.stringify(data) },
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
      toast.error(err.message);
    },
  });

  const handleToggle = (
    current: boolean,
    setter: (v: boolean) => void,
    field: string
  ) => {
    const newValue = !current;
    setter(newValue);
    saveCompanySetting.mutate(
      { [field]: newValue },
      { onError: () => setter(current) }
    );
  };

  const handleSaveAgentConfig = () => {
    updateConfig.mutate(
      { tone, examples, response_structure: responseStructure },
      {
        onSuccess: () => {
          toast.success("Configuracion del agente guardada", {
            style: { background: "#10B981", color: "white", border: "none" },
            duration: 2000,
          });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (settingsLoading || configLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[120px] bg-bg-secondary rounded-2xl animate-pulse" />
        <div className="h-[300px] bg-bg-secondary rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toggles Section ── */}
      <SettingsSection
        title="Comportamiento del Agente"
        description="Controla como funciona el bot de WhatsApp"
      >
        <div className="space-y-3">
          <ToggleRow
            icon={Bot}
            label="Auto-desactivar al responder"
            sublabel="Desactiva el bot cuando un agente humano responde manualmente"
            checked={botAutoDesactivar}
            onToggle={() =>
              handleToggle(
                botAutoDesactivar,
                setBotAutoDesactivar,
                "bot_auto_desactivar"
              )
            }
            disabled={saveCompanySetting.isPending}
          />
          <ToggleRow
            icon={Zap}
            label="Agente IA integrado"
            sublabel="Procesa mensajes con IA directamente en la app (sin n8n)"
            checked={useInternalAgent}
            onToggle={() =>
              handleToggle(
                useInternalAgent,
                setUseInternalAgent,
                "use_internal_agent"
              )
            }
            disabled={saveCompanySetting.isPending}
          />
        </div>
      </SettingsSection>

      {/* ── Prompt Customization (only when internal agent is active) ── */}
      {useInternalAgent && (
        <SettingsSection
          title="Personalidad del Agente"
          description="Define como responde el bot a tus clientes"
        >
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary mb-1.5">
                <Sparkles size={13} className="text-text-muted" />
                Tono de respuesta
              </label>
              <textarea
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ej: Amigable, profesional, con emojis moderados. Tutea al cliente."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary mb-1.5">
                <MessageSquareText size={13} className="text-text-muted" />
                Ejemplos de respuesta importantes
              </label>
              <textarea
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                placeholder={`Ej:\nCliente: "Cuanto sale un corte?"\nBot: "Hola! Un corte vale $8.000. Quieres agendar una hora? 😊"`}
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary mb-1.5">
                <ListChecks size={13} className="text-text-muted" />
                Estructura de respuesta
              </label>
              <textarea
                value={responseStructure}
                onChange={(e) => setResponseStructure(e.target.value)}
                placeholder="Ej: Siempre saluda primero, responde la pregunta, y termina ofreciendo agendar una cita si corresponde."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSaveAgentConfig}
              disabled={updateConfig.isPending}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {updateConfig.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Guardar personalidad
            </button>
          </div>
        </SettingsSection>
      )}
    </div>
  );
}

/* ── Toggle Row Component ── */
function ToggleRow({
  icon: Icon,
  label,
  sublabel,
  checked,
  onToggle,
  disabled,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  sublabel: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-border-secondary">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon size={20} className="text-accent" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-text-primary">{label}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{sublabel}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-60 ${
          checked ? "bg-accent" : "bg-border-primary"
        }`}
      >
        <div
          className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "left-[22px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
