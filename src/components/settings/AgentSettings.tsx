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
  Plus,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { useConfirm } from "@/components/ui/confirm-dialog";

const PRESET_OPTIONS = [
  { value: "ventas", label: "Ventas + Agendador" },
  { value: "soporte", label: "Soporte al cliente" },
];

/* ── Phone Card ── */
function PhoneCard({
  slot,
  number,
  label,
  preset,
  onNumberChange,
  onLabelChange,
  onPresetChange,
  onAdd,
  onRemove,
  isEmpty,
  disabled,
}: {
  slot: 1 | 2;
  number: string;
  label: string;
  preset: string;
  onNumberChange: (v: string) => void;
  onLabelChange: (v: string) => void;
  onPresetChange: (v: string) => void;
  onAdd?: () => void;
  onRemove?: () => void;
  isEmpty: boolean;
  disabled?: boolean;
}) {
  if (slot === 2 && isEmpty) {
    return (
      <button
        onClick={onAdd}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border-secondary text-text-muted hover:border-accent/50 hover:text-accent transition-all text-[12px] font-medium"
      >
        <Plus size={14} />
        Agregar segundo teléfono
      </button>
    );
  }

  return (
    <div className="p-4 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Phone size={13} className="text-accent" />
          </div>
          <span className="text-[12px] font-semibold text-text-primary">
            Teléfono {slot}
            {slot === 1 && (
              <span className="ml-1.5 text-[10px] font-normal text-text-muted">
                (principal)
              </span>
            )}
          </span>
        </div>
        {slot === 2 && onRemove && (
          <button
            onClick={onRemove}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={11} />
            Quitar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-text-muted block mb-1">
            Número
          </label>
          <input
            type="text"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
            placeholder="+56912345678"
            disabled={disabled}
            className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all disabled:opacity-50"
          />
        </div>
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

  // Phone config state
  const [phone1Number, setPhone1Number] = useState("");
  const [phone1Label, setPhone1Label] = useState("");
  const [phone1Preset, setPhone1Preset] = useState("ventas");
  const [phone2Number, setPhone2Number] = useState("");
  const [phone2Label, setPhone2Label] = useState("");
  const [phone2Preset, setPhone2Preset] = useState("ventas");
  const [showPhone2, setShowPhone2] = useState(false);

  // Which phone slot to configure personality for
  const [activePhoneSlot, setActivePhoneSlot] = useState(1);

  useEffect(() => {
    if (settings) {
      setUseInternalAgent(settings.use_internal_agent || false);
      setPhone1Number(settings.phone_1_number || "");
      setPhone1Label(settings.phone_1_label || "");
      setPhone1Preset(settings.phone_1_preset || "ventas");
      setPhone2Number(settings.phone_2_number || "");
      setPhone2Label(settings.phone_2_label || "");
      setPhone2Preset(settings.phone_2_preset || "ventas");
      setShowPhone2(!!(settings.phone_2_number));
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
      phone_1_number: phone1Number,
      phone_1_label: phone1Label,
      phone_1_preset: phone1Preset,
      phone_2_number: showPhone2 ? phone2Number : null,
      phone_2_label: showPhone2 ? phone2Label : "",
      phone_2_preset: showPhone2 ? phone2Preset : "ventas",
    });
  };

  const handleRemovePhone2 = async () => {
    const ok = await confirm({
      title: "Quitar segundo teléfono",
      description:
        "Se eliminará la configuración del segundo teléfono. Las conversaciones existentes no se borrarán, pero ya no se podrá filtrar por este número.",
      confirmText: "Quitar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!ok) return;
    setShowPhone2(false);
    setPhone2Number("");
    setPhone2Label("");
    setPhone2Preset("ventas");
    if (activePhoneSlot === 2) setActivePhoneSlot(1);
  };

  const hasTwoPhones = showPhone2 && !!phone2Number;

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
          description="Configura los números de WhatsApp y el tipo de agente para cada uno"
        >
          <div className="space-y-3">
            <PhoneCard
              slot={1}
              number={phone1Number}
              label={phone1Label}
              preset={phone1Preset}
              onNumberChange={setPhone1Number}
              onLabelChange={setPhone1Label}
              onPresetChange={setPhone1Preset}
              isEmpty={false}
              disabled={saveCompanySetting.isPending}
            />

            {showPhone2 ? (
              <PhoneCard
                slot={2}
                number={phone2Number}
                label={phone2Label}
                preset={phone2Preset}
                onNumberChange={setPhone2Number}
                onLabelChange={setPhone2Label}
                onPresetChange={setPhone2Preset}
                onRemove={handleRemovePhone2}
                isEmpty={false}
                disabled={saveCompanySetting.isPending}
              />
            ) : (
              <PhoneCard
                slot={2}
                number=""
                label=""
                preset="ventas"
                onNumberChange={() => {}}
                onLabelChange={() => {}}
                onPresetChange={() => {}}
                onAdd={() => setShowPhone2(true)}
                isEmpty={true}
                disabled={saveCompanySetting.isPending}
              />
            )}

            <button
              onClick={handleSavePhoneConfig}
              disabled={saveCompanySetting.isPending}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saveCompanySetting.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Phone size={14} />
              )}
              Guardar teléfonos
            </button>
          </div>
        </SettingsSection>
      )}

      {/* ── Agent Personality ── */}
      {useInternalAgent && (
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
