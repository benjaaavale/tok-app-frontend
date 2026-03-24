"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateTemplate, useEditTemplate } from "@/hooks/useTemplates";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import type { WhatsAppTemplate } from "@/types/api";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

interface TemplateFormProps {
  open: boolean;
  onClose: () => void;
  template?: WhatsAppTemplate;
}

function renderPreview(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return parts.map((part, i) => {
    if (/^\{\{\d+\}\}$/.test(part)) {
      return (
        <span key={i} className="text-[var(--accent)] font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function TemplateForm({ open, onClose, template }: TemplateFormProps) {
  const isEdit = !!template;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [body, setBody] = useState("");

  const createTemplate = useCreateTemplate();
  const editTemplate = useEditTemplate();
  const isPending = createTemplate.isPending || editTemplate.isPending;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      const bodyComponent = template.components.find((c) => c.type === "BODY");
      setBody(bodyComponent?.text || "");
    } else {
      setName("");
      setCategory("MARKETING");
      setBody("");
    }
  }, [template, open]);

  const handleNameChange = (value: string) => {
    // Only allow lowercase letters, digits, and underscores
    setName(value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      toast.error("El nombre y el cuerpo son obligatorios");
      return;
    }

    const components = [
      { type: "BODY" as const, text: body },
    ];

    try {
      if (isEdit && template) {
        await editTemplate.mutateAsync({ name: template.name, language: template.language, components });
        toast.success("Plantilla actualizada");
      } else {
        await createTemplate.mutateAsync({ name, category, language: "es", components });
        toast.success("Plantilla creada");
      }
      onClose();
    } catch {
      toast.error(isEdit ? "Error al actualizar la plantilla" : "Error al crear la plantilla");
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
            className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-secondary)]">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {isEdit ? "Editar plantilla" : "Crear plantilla"}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Nombre de la plantilla
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isEdit}
                  placeholder="ej: bienvenida_cliente"
                  className="w-full px-3 py-2 text-[13px] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Solo letras minúsculas, números y guiones bajos
                </p>
              </div>

              {/* Category */}
              {!isEdit && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Categoría
                  </label>
                  <AnimatedSelect
                    value={category}
                    onChange={setCategory}
                    options={TEMPLATE_CATEGORIES}
                    allowEmpty={false}
                    placeholder="Seleccionar categoría..."
                  />
                </div>
              )}

              {/* Body */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Cuerpo del mensaje
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Hola {{1}}, te contactamos de..."
                  className="w-full px-3 py-2 text-[13px] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40 resize-none"
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Usa {"{{1}}"}, {"{{2}}"} para variables personalizables
                </p>
              </div>

              {/* Live Preview */}
              {body && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Vista previa
                  </label>
                  <div className="px-3 py-3 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg text-[13px] text-[var(--text-primary)] leading-relaxed min-h-[60px]">
                    {renderPreview(body)}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {isEdit ? "Guardar cambios" : "Crear plantilla"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
