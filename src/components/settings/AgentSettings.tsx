"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAgentConfig, useUpdateAgentConfig } from "@/hooks/useAgentConfig";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import {
  Bot,
  Sparkles,
  MessageSquareText,
  ListChecks,
  Zap,
  Phone,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { useConfirm } from "@/components/ui/confirm-dialog";

const PRESET_OPTIONS = [
  { value: "ventas", label: "Ventas + Agendador" },
  { value: "soporte", label: "Soporte al cliente" },
];

/* ── Phone Card (read-only number, editable label + preset) ── */
function PhoneCard({
  slot,
  number,
  label,
  preset,
  onLabelChange,
  onPresetChange,
  onDelete,
  disabled,
}: {
  slot: 1 | 2;
  number: string;
  label: string;
  preset: string;
  onLabelChange: (v: string) => void;
  onPresetChange: (v: string) => void;
  onDelete?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="p-4 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Phone size={13} className="text-accent" />
          </div>
          <div>
            <span className="text-[12px] font-semibold text-text-primary">
              Teléfono {slot}
            </span>
            <p className="text-[12px] font-mono text-text-secondary mt-0.5">
              {number}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={11} />
            Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-text-muted block mb-1">
            Etiqueta
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder={slot === 1 ? "Principal" : "Soporte"}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-text-muted block mb-1">
            Tipo de agente
          </label>
          <AnimatedSelect
            value={preset}
            onChange={onPresetChange}
            options={PRESET_OPTIONS}
            placeholder="Seleccionar..."
            allowEmpty={false}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Agent Personality Section ── */
function AgentPersonality({
  phoneSlot,
  disabled,
}: {
  phoneSlot: number;
  disabled?: boolean;
}) {
  const { data: agentConfig, isLoading } = useAgentConfig(phoneSlot);
  const updateConfig = useUpdateAgentConfig(phoneSlot);

  const [tone, setTone] = useState("");
  const [examples, setExamples] = useState("");
  const [responseStructure, setResponseStructure] = useState("");
  const [systemPromptCustom, setSystemPromptCustom] = useState("");

  useEffect(() => {
    if (agentConfig) {
      setTone(agentConfig.tone || "");
      setExamples(agentConfig.examples || "");
      setResponseStructure(agentConfig.response_structure || "");
      setSystemPromptCustom(agentConfig.system_prompt_custom || "");
    }
  }, [agentConfig]);

  const handleSave = () => {
    updateConfig.mutate(
      {
        tone,
        examples,
        response_structure: responseStructure,
        system_prompt_custom: systemPromptCustom,
      },
      {
        onSuccess: () => {
          toast.success("Configuración del agente guardada", {
            style: { background: "#10B981", color: "white", border: "none" },
            duration: 2000,
          });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-[200px] bg-bg-primary rounded-xl animate-pulse" />
    );
  }

  return (
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
          disabled={disabled}
          className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-50"
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
          disabled={disabled}
          className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-50"
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
          disabled={disabled}
          className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary mb-1.5">
          <Bot size={13} className="text-text-muted" />
          Prompt personalizado (avanzado)
        </label>
        <textarea
          value={systemPromptCustom}
          onChange={(e) => setSystemPromptCustom(e.target.value)}
          placeholder="Instrucciones adicionales para el sistema. Se agregan al final del prompt base."
          rows={3}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-50"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={updateConfig.isPending || disabled}
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
  );
}

/* ── Main Component ── */
export function AgentSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useCompanySettings();
  const confirm = useConfirm();

  const [useInternalAgent, setUseInternalAgent] = useState(false);

  // Phone config state (labels + presets only — numbers are read-only from backend)
  const [phone1Label, setPhone1Label] = useState("");
  const [phone1Preset, setPhone1Preset] = useState("ventas");
  const [phone2Label, setPhone2Label] = useState("");
  const [phone2Preset, setPhone2Preset] = useState("ventas");

  // Which phone slot to configure personality for
  const [activePhoneSlot, setActivePhoneSlot] = useState(1);
  const [detecting, setDetecting] = useState(false);

  const phone1Number = settings?.phone_1_number || "";
  const phone2Number = settings?.phone_2_number || "";

  useEffect(() => {
    if (settings) {
      setUseInternalAgent(settings.use_internal_agent || false);
      setPhone1Label(settings.phone_1_label || "");
      setPhone1Preset(settings.phone_1_preset || "ventas");
      setPhone2Label(settings.phone_2_label || "");
      setPhone2Preset(settings.phone_2_preset || "ventas");
    }
  }, [settings]);

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

  const handleToggleAgent = () => {
    const newValue = !useInternalAgent;
    setUseInternalAgent(newValue);
    saveCompanySetting.mutate(
      { use_internal_agent: newValue },
      { onError: () => setUseInternalAgent(!newValue) }
    );
  };

  const handleSavePhoneConfig = () => {
    saveCompanySetting.mutate({
      phone_1_label: phone1Label,
      phone_1_preset: phone1Preset,
      ...(phone2Number
        ? { phone_2_label: phone2Label, phone_2_preset: phone2Preset }
        : {}),
    });
  };

  const handleDetectPhones = async () => {
    setDetecting(true);
    try {
      const res = await authFetch(
        "/company/detect-phones",
        { method: "POST" },
        () => getToken()
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error detectando");
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success(data.message || "Números detectados");
    } catch (err: any) {
      toast.error(err.message || "Error detectando números");
    } finally {
      setDetecting(false);
    }
  };

  const handleDeletePhone = async (slot: 1 | 2) => {
    const ok = await confirm({
      title: `Eliminar teléfono ${slot}`,
      description:
        "Se liberará este número. Las conversaciones existentes se mantendrán. El sistema podrá detectar un nuevo número automáticamente.",
      confirmText: "Eliminar",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const res = await authFetch(
        `/company/phone/${slot}`,
        { method: "DELETE" },
        () => getToken()
      );
      if (!res.ok) throw new Error("Error eliminando teléfono");
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      if (activePhoneSlot === slot) setActivePhoneSlot(1);
      toast.success("Teléfono eliminado");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const hasTwoPhones = !!phone1Number && !!phone2Number;
  const hasAnyPhone = !!phone1Number || !!phone2Number;

  const phoneSlotOptions = [
    { value: "1", label: phone1Label || "Teléfono 1" },
    { value: "2", label: phone2Label || "Teléfono 2" },
  ];

  if (settingsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[120px] bg-bg-secondary rounded-2xl animate-pulse" />
        <div className="h-[300px] bg-bg-secondary rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Toggle global ── */}
      <SettingsSection
        title="Comportamiento del Agente"
        description="Activa el motor de IA integrado de ToK"
      >
        <ToggleRow
          icon={Zap}
          label="Agente IA integrado"
          sublabel="Procesa mensajes con IA directamente en la app"
          checked={useInternalAgent}
          onToggle={handleToggleAgent}
          disabled={saveCompanySetting.isPending}
        />
      </SettingsSection>

      {/* ── Phone config (only when agent is active) ── */}
      {useInternalAgent && (
        <SettingsSection
          title="Teléfonos configurados"
          description="Los números se detectan automáticamente desde tu cuenta de YCloud"
        >
          <div className="space-y-3">
            {/* Detected phones */}
            {phone1Number && (
              <PhoneCard
                slot={1}
                number={phone1Number}
                label={phone1Label}
                preset={phone1Preset}
                onLabelChange={setPhone1Label}
                onPresetChange={setPhone1Preset}
                onDelete={() => handleDeletePhone(1)}
                disabled={saveCompanySetting.isPending}
              />
            )}

            {phone2Number && (
              <PhoneCard
                slot={2}
                number={phone2Number}
                label={phone2Label}
                preset={phone2Preset}
                onLabelChange={setPhone2Label}
                onPresetChange={setPhone2Preset}
                onDelete={() => handleDeletePhone(2)}
                disabled={saveCompanySetting.isPending}
              />
            )}

            {/* No phones detected */}
            {!hasAnyPhone && (
              <div className="p-4 rounded-xl border border-dashed border-border-secondary text-center">
                <p className="text-[12px] text-text-muted">
                  No hay números detectados. Haz clic en "Detectar números" para buscar en tu cuenta de YCloud.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDetectPhones}
                disabled={detecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-primary hover:bg-bg-hover transition-all disabled:opacity-50"
              >
                {detecting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                {detecting ? "Detectando..." : "Detectar números"}
              </button>

              {hasAnyPhone && (
                <button
                  onClick={handleSavePhoneConfig}
                  disabled={saveCompanySetting.isPending}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saveCompanySetting.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Phone size={13} />
                  )}
                  Guardar configuración
                </button>
              )}
            </div>
          </div>
        </SettingsSection>
      )}

      {/* ── Agent Personality ── */}
      {useInternalAgent && hasAnyPhone && (
        <SettingsSection
          title="Personalidad del agente"
          description="Define cómo responde el bot a tus clientes"
        >
          <div className="space-y-4">
            {hasTwoPhones && (
              <div>
                <label className="text-[11px] font-medium text-text-muted block mb-1.5">
                  Configurar personalidad para
                </label>
                <AnimatedSelect
                  value={String(activePhoneSlot)}
                  onChange={(v) => setActivePhoneSlot(Number(v))}
                  options={phoneSlotOptions}
                  placeholder="Seleccionar teléfono..."
                  allowEmpty={false}
                />
              </div>
            )}

            <AgentPersonality
              key={activePhoneSlot}
              phoneSlot={activePhoneSlot}
            />
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
      <Switch
        checked={checked}
        onCheckedChange={() => onToggle()}
        disabled={disabled}
      />
    </div>
  );
}
