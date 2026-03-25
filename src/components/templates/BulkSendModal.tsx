"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useTemplates } from "@/hooks/useTemplates";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { authFetch } from "@/lib/api";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { X, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { StaleLead, BulkSendResult } from "@/types/api";

interface BulkSendModalProps {
  open: boolean;
  onClose: () => void;
  selectedLeads: StaleLead[];
}

export function BulkSendModal({ open, onClose, selectedLeads }: BulkSendModalProps) {
  const { getToken } = useAuth();
  const { data: templates } = useTemplates();
  const { data: settings } = useCompanySettings();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [templateName, setTemplateName] = useState("");
  const [phoneSlot, setPhoneSlot] = useState("1");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BulkSendResult | null>(null);

  const approvedTemplates = templates?.filter((t) => t.status === "APPROVED") || [];

  const selectedTemplate = approvedTemplates.find((t) => t.name === templateName);
  const bodyPreview = selectedTemplate?.components?.find((c) => c.type === "BODY")?.text;

  const phoneOptions = [
    ...(settings?.phone_1_number ? [{ value: "1", label: settings.phone_1_label || settings.phone_1_number }] : []),
    ...(settings?.phone_2_number ? [{ value: "2", label: settings.phone_2_label || settings.phone_2_number }] : []),
  ];

  const templateOptions = approvedTemplates.map((t) => ({
    value: t.name,
    label: t.name.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
  }));

  const handleSend = async () => {
    if (!templateName) { toast.error("Selecciona una plantilla"); return; }

    const ok = await confirm({
      title: "Enviar plantilla",
      description: `¿Enviar "${templateName.replace(/_/g, " ")}" a ${selectedLeads.length} contacto(s)?`,
      confirmText: "Enviar",
    });
    if (!ok) return;

    setSending(true);
    try {
      const res = await authFetch("/templates/send", {
        method: "POST",
        body: JSON.stringify({
          templateName,
          language: selectedTemplate?.language || "es",
          contactIds: selectedLeads.map((l) => l.contact_id),
          phoneSlot: parseInt(phoneSlot),
        }),
      }, () => getToken());

      const data: BulkSendResult = await res.json();
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["stale-leads"] });

      if (data.sent > 0 && data.failed === 0) {
        toast.success(`${data.sent} mensaje(s) enviado(s)`);
      } else if (data.sent > 0 && data.failed > 0) {
        toast.warning(`${data.sent} enviado(s), ${data.failed} fallido(s)`);
      } else {
        toast.error(`Todos los envíos fallaron`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setTemplateName("");
    setPhoneSlot("1");
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-md rounded-2xl border shadow-xl overflow-hidden"
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-secondary)" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Enviar a {selectedLeads.length} contacto(s)
              </h3>
              <button onClick={handleClose} className="p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {result ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                    {result.failed === 0 ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {result.sent} enviado(s), {result.failed} fallido(s)
                      </p>
                      {result.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {result.errors.slice(0, 5).map((e, i) => (
                            <p key={i} className="text-[11px] text-red-500">{e}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Plantilla
                    </label>
                    {approvedTemplates.length === 0 ? (
                      <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>
                        No tienes plantillas aprobadas. Crea una en la pestaña Plantillas.
                      </p>
                    ) : (
                      <AnimatedSelect
                        value={templateName}
                        onChange={setTemplateName}
                        options={templateOptions}
                        placeholder="Seleccionar plantilla"
                      />
                    )}
                  </div>

                  {phoneOptions.length > 1 && (
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Enviar desde
                      </label>
                      <AnimatedSelect
                        value={phoneSlot}
                        onChange={setPhoneSlot}
                        options={phoneOptions}
                        placeholder="Seleccionar teléfono"
                      />
                    </div>
                  )}

                  {bodyPreview && (
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Vista previa
                      </label>
                      <div className="px-3 py-2.5 rounded-lg text-sm whitespace-pre-wrap" style={{ background: "#DCF8C6", color: "#1a1a1a" }}>
                        {bodyPreview}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!result && (
              <div className="flex items-center justify-end gap-3 p-5 border-t" style={{ borderColor: "var(--border-secondary)" }}>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: "var(--border-secondary)", color: "var(--text-secondary)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !templateName}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: "var(--accent)" }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
