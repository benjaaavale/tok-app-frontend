"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTemplates } from "@/hooks/useTemplates";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { StaleLead, BulkSendResult, WhatsAppTemplate } from "@/types/api";
import { toast } from "sonner";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";

interface BulkSendModalProps {
  open: boolean;
  onClose: () => void;
  selectedLeads: StaleLead[];
}

function extractVariables(text: string): number[] {
  const matches = text.match(/\{\{(\d+)\}\}/g) || [];
  return [...new Set(matches.map((m) => parseInt(m.replace(/[{}]/g, ""))))].sort(
    (a, b) => a - b
  );
}

function renderPreview(text: string, params: Record<number, string>, personalize: boolean, sampleName: string): React.ReactNode[] {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{\{(\d+)\}\}$/);
    if (match) {
      const varNum = parseInt(match[1]);
      if (varNum === 1 && personalize) {
        return (
          <span key={i} className="text-[var(--accent)] font-medium">
            {sampleName || "{{nombre}}"}
          </span>
        );
      }
      const val = params[varNum];
      return (
        <span key={i} className={val ? "text-[var(--accent)] font-medium" : "text-red-400 font-medium"}>
          {val || part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function BulkSendModal({ open, onClose, selectedLeads }: BulkSendModalProps) {
  const { data: templates } = useTemplates();
  const { data: settings } = useCompanySettings();
  const { getToken } = useAuth();
  const confirm = useConfirm();

  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [phoneSlot, setPhoneSlot] = useState("1");
  const [personalize, setPersonalize] = useState(true);
  const [params, setParams] = useState<Record<number, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<BulkSendResult | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedTemplateName("");
      setPhoneSlot("1");
      setPersonalize(true);
      setParams({});
      setResult(null);
    }
  }, [open]);

  // Approved templates only
  const approvedTemplates = templates?.filter((t) => t.status === "APPROVED") || [];
  const templateOptions = approvedTemplates.map((t) => ({
    value: `${t.name}::${t.language}`,
    label: t.name.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
  }));

  const selectedTemplate: WhatsAppTemplate | undefined = approvedTemplates.find(
    (t) => `${t.name}::${t.language}` === selectedTemplateName
  );

  const bodyText =
    selectedTemplate?.components.find((c) => c.type === "BODY")?.text || "";
  const allVars = extractVariables(bodyText);
  const nonNameVars = personalize ? allVars.filter((v) => v !== 1) : allVars;

  // Phone slot options
  const phoneOptions = [
    ...(settings?.phone_1_number ? [{ value: "1", label: settings.phone_1_label || "Teléfono 1" }] : []),
    ...(settings?.phone_2_number ? [{ value: "2", label: settings.phone_2_label || "Teléfono 2" }] : []),
  ];
  if (phoneOptions.length === 0) {
    phoneOptions.push({ value: "1", label: "Teléfono 1" });
  }

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error("Selecciona una plantilla");
      return;
    }

    const ok = await confirm({
      title: `Enviar a ${selectedLeads.length} contactos`,
      description: `¿Estás seguro de que quieres enviar la plantilla "${selectedTemplate.name}" a ${selectedLeads.length} contactos?`,
      confirmText: "Enviar",
      cancelText: "Cancelar",
      variant: "warning",
    });
    if (!ok) return;

    setIsSending(true);
    try {
      const bodyParams: Record<number, string> = { ...params };
      const res = await authFetch(
        "/templates/send",
        {
          method: "POST",
          body: JSON.stringify({
            templateName: selectedTemplate.name,
            language: selectedTemplate.language,
            contactIds: selectedLeads.map((l) => l.contact_id),
            phoneSlot: parseInt(phoneSlot),
            parameters: bodyParams,
            personalize,
          }),
        },
        () => getToken()
      );
      const data: BulkSendResult = await res.json();
      setResult(data);
      if (data.sent > 0) {
        toast.success(`Enviado a ${data.sent} contacto${data.sent !== 1 ? "s" : ""}`);
      }
      if (data.failed > 0) {
        toast.error(`Falló en ${data.failed} contacto${data.failed !== 1 ? "s" : ""}`);
      }
    } catch {
      toast.error("Error al enviar la plantilla");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-secondary)] flex-shrink-0">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Enviar a {selectedLeads.length} contacto{selectedLeads.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {result ? (
                /* Results view */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                        Envío completado
                      </p>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                        {result.sent} enviado{result.sent !== 1 ? "s" : ""}
                        {result.failed > 0 && `, ${result.failed} fallido${result.failed !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[12px] font-medium text-[var(--text-secondary)]">Errores:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.map((err, i) => (
                          <p key={i} className="text-[11px] text-red-500 bg-red-500/10 rounded-lg px-3 py-1.5">
                            {err}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                /* Form view */
                <>
                  {/* Template selector */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Plantilla
                    </label>
                    <AnimatedSelect
                      value={selectedTemplateName}
                      onChange={setSelectedTemplateName}
                      options={templateOptions}
                      placeholder="Seleccionar plantilla aprobada..."
                      allowEmpty={false}
                    />
                    {approvedTemplates.length === 0 && (
                      <p className="text-[11px] text-amber-500">
                        No hay plantillas aprobadas. Crea y espera la aprobación de Meta.
                      </p>
                    )}
                  </div>

                  {/* Phone slot */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Enviar desde
                    </label>
                    <AnimatedSelect
                      value={phoneSlot}
                      onChange={setPhoneSlot}
                      options={phoneOptions}
                      allowEmpty={false}
                      placeholder="Seleccionar teléfono..."
                    />
                  </div>

                  {/* Personalize toggle */}
                  {selectedTemplate && allVars.includes(1) && (
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-secondary)] hover:border-[var(--accent)]/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={personalize}
                        onChange={(e) => setPersonalize(e.target.checked)}
                        className="mt-0.5 rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                          Personalizar por contacto ({"{{1}}"} = nombre)
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Se reemplaza {"{{1}}"} automáticamente con el nombre de cada contacto
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Variable inputs */}
                  {selectedTemplate && nonNameVars.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Variables del mensaje
                      </label>
                      {nonNameVars.map((varNum) => (
                        <div key={varNum} className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg flex-shrink-0 w-10 text-center">
                            {`{{${varNum}}}`}
                          </span>
                          <input
                            type="text"
                            value={params[varNum] || ""}
                            onChange={(e) =>
                              setParams((prev) => ({ ...prev, [varNum]: e.target.value }))
                            }
                            placeholder={`Variable ${varNum}`}
                            className="flex-1 px-3 py-1.5 text-[12px] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview */}
                  {selectedTemplate && bodyText && (
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Vista previa
                      </label>
                      <div className="px-3 py-3 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg text-[13px] text-[var(--text-primary)] leading-relaxed min-h-[60px]">
                        {renderPreview(bodyText, params, personalize, selectedLeads[0]?.nombre_real || selectedLeads[0]?.nombre_whatsapp || "Juan")}
                      </div>
                      {personalize && (
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Vista previa con el primer contacto seleccionado
                        </p>
                      )}
                    </div>
                  )}

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={isSending || !selectedTemplateName}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {isSending ? "Enviando..." : `Enviar a ${selectedLeads.length} contacto${selectedLeads.length !== 1 ? "s" : ""}`}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
