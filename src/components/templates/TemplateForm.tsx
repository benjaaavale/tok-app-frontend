"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateTemplate, useEditTemplate } from "@/hooks/useTemplates";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { X, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { WhatsAppTemplate } from "@/types/api";

interface TemplateFormProps {
  open: boolean;
  onClose: () => void;
  template?: WhatsAppTemplate | null;
}

function CategoryTooltip({ description }: { description: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        className="p-0.5 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Info className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
      </button>
      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs max-w-[240px] z-50 shadow-lg"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-secondary)",
          }}
        >
          {description}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1"
            style={{
              background: "var(--bg-primary)",
              borderRight: "1px solid var(--border-secondary)",
              borderBottom: "1px solid var(--border-secondary)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function TemplateForm({ open, onClose, template }: TemplateFormProps) {
  const isEdit = !!template;
  const createTemplate = useCreateTemplate();
  const editTemplate = useEditTemplate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [bodyText, setBodyText] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setCategory(template.category);
        const body = template.components?.find((c) => c.type === "BODY");
        setBodyText(body?.text || "");
      } else {
        setName("");
        setCategory("MARKETING");
        setBodyText("");
      }
      setNameError("");
    }
  }, [open, template]);

  const validateName = (v: string) => {
    if (!v) { setNameError("El nombre es requerido"); return false; }
    if (!/^[a-z0-9_]+$/.test(v)) { setNameError("Solo minúsculas, números y _"); return false; }
    if (v.length > 50) { setNameError("Máximo 50 caracteres"); return false; }
    setNameError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!isEdit && !validateName(name)) return;
    if (!bodyText.trim()) { toast.error("El cuerpo del mensaje es requerido"); return; }

    const components = [{ type: "BODY", text: bodyText.trim() }];

    try {
      if (isEdit) {
        await editTemplate.mutateAsync({ name: template!.name, language: template!.language, components });
        toast.success("Plantilla actualizada");
      } else {
        await createTemplate.mutateAsync({ name, category, components });
        toast.success("Plantilla creada. Se enviará a Meta para aprobación.");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  const isLoading = createTemplate.isPending || editTemplate.isPending;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden"
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-secondary)" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {isEdit ? "Editar plantilla" : "Crear plantilla"}
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setNameError(""); }}
                  disabled={isEdit}
                  placeholder="oferta_bienvenida"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors disabled:opacity-50"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: nameError ? "#EF4444" : "var(--border-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
                {nameError && <p className="text-[11px] text-red-500 mt-1">{nameError}</p>}
              </div>

              {/* Category with info tooltips */}
              {!isEdit && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Categoría
                  </label>
                  <div className="flex flex-col gap-2">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors"
                        style={{
                          background: category === cat.value ? `var(--accent)10` : "var(--bg-secondary)",
                          borderColor: category === cat.value ? "var(--accent)" : "var(--border-secondary)",
                        }}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={(e) => setCategory(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: category === cat.value ? "var(--accent)" : "var(--border-primary)" }}
                        >
                          {category === cat.value && (
                            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                          )}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {cat.label}
                        </span>
                        <CategoryTooltip description={cat.description} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Cuerpo del mensaje
                </label>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Escribe el contenido de tu plantilla..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                  {bodyText.length} / 1024 caracteres
                </p>
              </div>

              {/* Preview */}
              {bodyText.trim() && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Vista previa
                  </label>
                  <div
                    className="px-3 py-2.5 rounded-lg text-sm whitespace-pre-wrap"
                    style={{
                      background: "#DCF8C6",
                      color: "#1a1a1a",
                    }}
                  >
                    {bodyText}
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center justify-end gap-3 p-5 border-t"
              style={{ borderColor: "var(--border-secondary)" }}
            >
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ borderColor: "var(--border-secondary)", color: "var(--text-secondary)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Guardar cambios" : "Crear plantilla"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
