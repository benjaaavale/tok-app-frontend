"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/hooks/useAgents";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import {
  Bot,
  Phone,
  Trash2,
  RefreshCw,
  Loader2,
  Plus,
  Calendar,
  BookOpen,
  Zap,
  Pencil,
  Power,
  X,
  Sparkles,
} from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AnimatePresence, motion } from "framer-motion";
import type { Agent } from "@/types/api";
import { AgentTemplatePicker } from "./AgentTemplatePicker";
import type { AgentTemplate } from "@/hooks/useAgentTemplates";

/* ── Agent Card ── */
function AgentCard({
  agent,
  onEdit,
  onDelete,
  onToggle,
}: {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        agent.is_active
          ? "border-accent/30 bg-accent/5"
          : "border-border-secondary bg-bg-primary opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              agent.is_active ? "bg-accent/15" : "bg-bg-secondary"
            }`}
          >
            <Bot
              size={16}
              className={agent.is_active ? "text-accent" : "text-text-muted"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-text-primary truncate">
                {agent.name}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {agent.can_schedule && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                    <Calendar size={8} className="inline mr-0.5" />
                    Agenda
                  </span>
                )}
                {agent.use_knowledge && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <BookOpen size={8} className="inline mr-0.5" />
                    Conocimiento
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">
              {agent.description}
            </p>
            {agent.instructions && (
              <p className="text-[10px] text-text-muted/70 mt-1 italic truncate">
                {agent.instructions}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-all ${
              agent.is_active
                ? "text-accent hover:text-accent/70 hover:bg-accent/10"
                : "text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"
            }`}
            title={agent.is_active ? "Desactivar" : "Activar"}
          >
            <Power size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Generation status */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-secondary">
        {agent.generated_at ? (
          <div className="flex items-center gap-1.5 flex-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-text-muted">
              Generado{" "}
              {new Date(agent.generated_at).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-[10px] text-accent hover:underline ml-1"
            >
              {showPrompt ? "Ocultar" : "Ver prompt"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-1">
            <Loader2 size={10} className="animate-spin text-accent" />
            <span className="text-[10px] text-text-muted">
              Generando prompt con IA...
            </span>
          </div>
        )}
      </div>

      {/* Show generated prompt */}
      <AnimatePresence>
        {showPrompt && agent.generated_prompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-3"
          >
            <textarea
              readOnly
              value={agent.generated_prompt}
              rows={6}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[10px] text-text-secondary font-mono resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Create / Edit Agent Modal ── */
function AgentFormModal({
  agent,
  onSave,
  onClose,
  isSaving,
}: {
  agent: Partial<Agent> | null;
  onSave: (data: Partial<Agent>) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const { getToken } = useAuth();
  const isEditing = !!agent?.id;
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [instructions, setInstructions] = useState(agent?.instructions || "");
  const [canSchedule, setCanSchedule] = useState(agent?.can_schedule || false);
  const [useKnowledge, setUseKnowledge] = useState(
    agent?.use_knowledge !== false
  );
  const [optimizing, setOptimizing] = useState<null | "description" | "instructions" | "saving">(null);

  const optimizeText = async (field: "description" | "instructions", raw: string): Promise<string> => {
    try {
      const res = await authFetch(
        "/agents/optimize-prompt",
        {
          method: "POST",
          body: JSON.stringify({ raw_text: raw, agent_name: name, field }),
        },
        () => getToken()
      );
      if (!res.ok) return raw;
      const data = await res.json();
      return data.optimized_text || raw;
    } catch {
      return raw;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Nombre y descripcion son requeridos");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("La descripcion debe tener al menos 10 caracteres");
      return;
    }

    // Auto-optimizar SIEMPRE con IA antes de guardar
    let finalDescription = description.trim();
    let finalInstructions = instructions.trim();

    try {
      setOptimizing("description");
      finalDescription = await optimizeText("description", finalDescription);
      setDescription(finalDescription);

      if (finalInstructions.length >= 20) {
        setOptimizing("instructions");
        finalInstructions = await optimizeText("instructions", finalInstructions);
        setInstructions(finalInstructions);
      }
    } finally {
      setOptimizing("saving");
    }

    onSave({
      ...(agent?.id ? { id: agent.id } : {}),
      name: name.trim(),
      description: finalDescription,
      instructions: finalInstructions,
      can_schedule: canSchedule,
      use_knowledge: useKnowledge,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative bg-bg-primary border border-border-secondary rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary">
            {isEditing ? "Editar agente" : "Crear nuevo agente"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover text-text-muted"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-text-secondary block mb-1">
              Nombre del agente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Agente de Ventas"
              maxLength={100}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-text-secondary block mb-1">
              Descripcion (el sistema la usa para decidir cuando usar este
              agente)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Atiende consultas de ventas, califica leads interesados y agenda reuniones con el equipo comercial"
              rows={3}
              maxLength={500}
              disabled={optimizing !== null}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-60"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <Sparkles size={10} className="text-accent" />
                Se optimiza con IA al guardar
              </p>
              <p className="text-[10px] text-text-muted">{description.length}/500</p>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-text-secondary block mb-1">
              Instrucciones adicionales (opcional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej: Tutea al cliente, usa un tono cercano. Siempre ofrece el servicio premium primero..."
              rows={3}
              maxLength={2000}
              disabled={optimizing !== null}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none disabled:opacity-60"
            />
            <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Sparkles size={10} className="text-accent" />
              Se optimiza con IA al guardar (si tiene 20+ caracteres)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCanSchedule(!canSchedule)}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                canSchedule
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-border-secondary bg-bg-secondary"
              }`}
            >
              <Calendar
                size={14}
                className={canSchedule ? "text-blue-500" : "text-text-muted"}
              />
              <div>
                <p className="text-[12px] font-medium text-text-primary">
                  Puede agendar
                </p>
                <p className="text-[10px] text-text-muted">
                  Crea y gestiona citas
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setUseKnowledge(!useKnowledge)}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                useKnowledge
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border-secondary bg-bg-secondary"
              }`}
            >
              <BookOpen
                size={14}
                className={
                  useKnowledge ? "text-emerald-500" : "text-text-muted"
                }
              />
              <div>
                <p className="text-[12px] font-medium text-text-primary">
                  Usa base de conocimiento
                </p>
                <p className="text-[10px] text-text-muted">
                  Consulta base de datos
                </p>
              </div>
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={optimizing !== null}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium bg-bg-secondary border border-border-secondary text-text-secondary hover:bg-bg-hover transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || optimizing !== null || !name.trim() || description.trim().length < 10}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {(isSaving || optimizing !== null) && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {optimizing === "description"
                ? "Optimizando descripcion..."
                : optimizing === "instructions"
                ? "Optimizando instrucciones..."
                : optimizing === "saving"
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear agente"}
            </button>
          </div>
        </form>

        {/* Optimizing overlay */}
        <AnimatePresence>
          {optimizing && optimizing !== "saving" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-bg-primary/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles size={22} className="text-accent" />
                </div>
                <Loader2 size={48} className="animate-spin text-accent absolute inset-0" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-text-primary">
                  Optimizando tus textos con IA
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {optimizing === "description"
                    ? "Afinando la descripcion para el router..."
                    : "Afinando las instrucciones del agente..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ── Phone Card (simplified) ── */
function PhoneCard({
  slot,
  number,
  label,
  onLabelChange,
  onDelete,
  disabled,
}: {
  slot: 1 | 2;
  number: string;
  label: string;
  onLabelChange: (v: string) => void;
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
              Telefono {slot}
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
  );
}

/* ── Main Component ── */
export function AgentSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useCompanySettings();
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const confirm = useConfirm();

  const [useInternalAgent, setUseInternalAgent] = useState(false);
  const [phone1Label, setPhone1Label] = useState("");
  const [phone2Label, setPhone2Label] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [formAgent, setFormAgent] = useState<Partial<Agent> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const phone1Number = settings?.phone_1_number || "";
  const phone2Number = settings?.phone_2_number || "";
  const hasAnyPhone = !!phone1Number || !!phone2Number;

  useEffect(() => {
    if (settings) {
      setUseInternalAgent(settings.use_internal_agent || false);
      setPhone1Label(settings.phone_1_label || "");
      setPhone2Label(settings.phone_2_label || "");
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
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleToggleAgent = () => {
    const newValue = !useInternalAgent;
    if (newValue && !hasAnyPhone) {
      toast.error("Detecta al menos un numero de telefono primero");
      return;
    }
    if (newValue && (!agents || agents.length === 0)) {
      toast.error("Crea al menos un agente primero");
      return;
    }
    setUseInternalAgent(newValue);
    saveCompanySetting.mutate(
      { use_internal_agent: newValue },
      {
        onSuccess: () =>
          toast.success(newValue ? "Agentes activados" : "Agentes desactivados"),
        onError: () => setUseInternalAgent(!newValue),
      }
    );
  };

  const handleDetectPhones = async () => {
    setDetecting(true);
    try {
      const res = await authFetch("/company/detect-phones", { method: "POST" }, () => getToken());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error detectando");
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success(data.message || "Numeros detectados");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error detectando numeros");
    } finally {
      setDetecting(false);
    }
  };

  const handleDeletePhone = async (slot: 1 | 2) => {
    const ok = await confirm({
      title: `Eliminar telefono ${slot}`,
      description: "Se liberara este numero. Las conversaciones existentes se mantendran.",
      confirmText: "Eliminar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res = await authFetch(`/company/phone/${slot}`, { method: "DELETE" }, () => getToken());
      if (!res.ok) throw new Error("Error eliminando telefono");
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Telefono eliminado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleSavePhoneConfig = () => {
    saveCompanySetting.mutate(
      { phone_1_label: phone1Label, ...(phone2Number ? { phone_2_label: phone2Label } : {}) },
      { onSuccess: () => toast.success("Configuracion guardada") }
    );
  };

  const handleSaveAgent = (data: Partial<Agent>) => {
    if (data.id) {
      updateAgent.mutate(data as Agent, {
        onSuccess: () => {
          toast.success("Agente actualizado, regenerando prompt...");
          setShowForm(false);
          setFormAgent(null);
          // Poll for regenerated prompt
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ["agents"] }), 5000);
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ["agents"] }), 12000);
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createAgent.mutate(data, {
        onSuccess: () => {
          toast.success("Agente creado, generando prompt con IA...");
          setShowForm(false);
          setFormAgent(null);
          // Poll for generated prompt (takes ~5-10s)
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ["agents"] }), 5000);
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ["agents"] }), 12000);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    const ok = await confirm({
      title: `Eliminar "${agent.name}"`,
      description: "Este agente se eliminara permanentemente.",
      confirmText: "Eliminar",
      variant: "danger",
    });
    if (!ok) return;
    deleteAgent.mutate(agent.id, { onError: (err) => toast.error(err.message) });
  };

  const handleToggleAgentActive = (agent: Agent) => {
    updateAgent.mutate({ id: agent.id, is_active: !agent.is_active });
  };

  if (settingsLoading || agentsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[80px] bg-bg-secondary rounded-2xl animate-pulse" />
        <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner: agents inactive */}
      {!useInternalAgent && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30">
          <Zap size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-[12px] text-amber-700 dark:text-amber-400">
            Los agentes IA no estan activos. Activalos para que procesen
            mensajes automaticamente.
          </p>
        </div>
      )}

      {/* Global toggle */}
      <div
        className="rounded-2xl border-2 p-1 transition-colors"
        style={{
          borderColor: useInternalAgent
            ? "var(--accent)"
            : "var(--border-secondary)",
        }}
      >
        <button
          onClick={handleToggleAgent}
          disabled={saveCompanySetting.isPending}
          className="flex items-center justify-between w-full p-4 rounded-xl transition-colors"
          style={{
            background: useInternalAgent
              ? "var(--accent)"
              : "var(--bg-secondary)",
          }}
        >
          <div className="flex items-center gap-3">
            <Zap
              size={20}
              className={
                useInternalAgent ? "text-white" : "text-text-muted"
              }
            />
            <span
              className="text-[14px] font-semibold"
              style={{
                color: useInternalAgent ? "#fff" : "var(--text-primary)",
              }}
            >
              {useInternalAgent
                ? "Agentes IA activados"
                : "Activar Agentes IA"}
            </span>
          </div>
          <div
            className="w-12 h-7 rounded-full p-0.5 transition-colors"
            style={{
              background: useInternalAgent
                ? "rgba(255,255,255,0.3)"
                : "var(--border-secondary)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full shadow-sm transition-transform"
              style={{
                background: useInternalAgent ? "#fff" : "var(--bg-primary)",
                transform: useInternalAgent
                  ? "translateX(20px)"
                  : "translateX(0)",
              }}
            />
          </div>
        </button>
      </div>

      {/* Phone config — siempre visible para poder crear/detectar antes de activar */}
      {(
        <SettingsSection
          title="Telefonos configurados"
          description="Los numeros se detectan automaticamente desde tu cuenta de YCloud"
        >
          <div className="space-y-3">
            {phone1Number && (
              <PhoneCard
                slot={1}
                number={phone1Number}
                label={phone1Label}
                onLabelChange={setPhone1Label}
                onDelete={() => handleDeletePhone(1)}
                disabled={saveCompanySetting.isPending}
              />
            )}
            {phone2Number && (
              <PhoneCard
                slot={2}
                number={phone2Number}
                label={phone2Label}
                onLabelChange={setPhone2Label}
                onDelete={() => handleDeletePhone(2)}
                disabled={saveCompanySetting.isPending}
              />
            )}
            {!hasAnyPhone && (
              <div className="p-4 rounded-xl border border-dashed border-border-secondary text-center">
                <p className="text-[12px] text-text-muted">
                  No hay numeros detectados. Haz clic en &quot;Detectar
                  numeros&quot; para buscar en tu cuenta de YCloud.
                </p>
              </div>
            )}
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
                {detecting ? "Detectando..." : "Detectar numeros"}
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
                  Guardar configuracion
                </button>
              )}
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Agents list — siempre visible si hay teléfono, para poder crear antes de activar */}
      {hasAnyPhone && (
        <SettingsSection
          title="Agentes"
          description="Crea multiples agentes con diferentes roles. El sistema elige automaticamente cual usar segun el mensaje del cliente."
        >
          <div className="space-y-3">
            {agents && agents.length > 0 ? (
              agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={() => {
                    setFormAgent(agent);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteAgent(agent)}
                  onToggle={() => handleToggleAgentActive(agent)}
                />
              ))
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border-secondary text-center">
                <Bot size={24} className="mx-auto text-text-muted mb-2" />
                <p className="text-[13px] font-medium text-text-primary">
                  No hay agentes creados
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  Crea tu primer agente para empezar a atender clientes
                  automaticamente
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowPicker(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-accent/30 text-[12px] font-medium text-accent hover:bg-accent/5 transition-all"
            >
              <Plus size={14} />
              Crear nuevo agente
            </button>
          </div>
        </SettingsSection>
      )}

      {/* Template picker */}
      <AgentTemplatePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(template: AgentTemplate) => {
          setFormAgent({ ...template.defaults });
          setShowPicker(false);
          setShowForm(true);
        }}
      />

      {/* Agent form modal */}
      <AnimatePresence>
        {showForm && (
          <AgentFormModal
            agent={formAgent}
            onSave={handleSaveAgent}
            onClose={() => {
              setShowForm(false);
              setFormAgent(null);
            }}
            isSaving={createAgent.isPending || updateAgent.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
