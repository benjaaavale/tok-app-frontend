"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIDGET_REGISTRY } from "./widgetRegistryComponents";
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, DEFAULT_WIDGET_IDS } from "@/types/dashboard";
import type { WidgetCategory } from "@/types/dashboard";

const CATEGORY_ORDER: WidgetCategory[] = ["general", "conversion", "equipo", "tiempos", "ia"];

interface DashboardCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onSave: (ids: string[]) => void;
}

export function DashboardCustomizerModal({
  open,
  onClose,
  selected,
  onSave,
}: DashboardCustomizerModalProps) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [activeCategory, setActiveCategory] = useState<WidgetCategory>("general");

  const toggleWidget = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft([...DEFAULT_WIDGET_IDS]);
  };

  const widgetsForCategory = WIDGET_REGISTRY.filter(
    (w) => w.category === activeCategory
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="bg-bg-primary border border-border-secondary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <SlidersHorizontal size={15} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-text-primary">Personalizar dashboard</h2>
                  <p className="text-[11px] text-text-muted">
                    {draft.length} widgets seleccionados
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 px-5 py-3 border-b border-border-secondary overflow-x-auto flex-shrink-0 scrollbar-none">
              {CATEGORY_ORDER.map((cat) => {
                const count = WIDGET_REGISTRY.filter(
                  (w) => w.category === cat && draft.includes(w.id)
                ).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                      activeCategory === cat
                        ? "bg-accent text-white"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
                    )}
                  >
                    {CATEGORY_LABELS[cat]}
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center",
                          activeCategory === cat
                            ? "bg-white/20 text-white"
                            : "bg-accent/15 text-accent"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Widget list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-[11px] text-text-muted mb-4">
                {CATEGORY_DESCRIPTIONS[activeCategory]}
              </p>

              {widgetsForCategory.length === 0 && (
                <p className="text-[13px] text-text-muted text-center py-8">
                  No hay widgets en esta categoría aún.
                </p>
              )}

              {widgetsForCategory.map((widget) => {
                const isSelected = draft.includes(widget.id);
                return (
                  <motion.button
                    key={widget.id}
                    onClick={() => toggleWidget(widget.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border-secondary bg-bg-secondary hover:border-border-primary"
                    )}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        isSelected
                          ? "border-accent bg-accent"
                          : "border-border-primary bg-bg-primary"
                      )}
                    >
                      {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-medium text-text-primary">{widget.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-primary border border-border-secondary text-text-muted">
                          {widget.size === "sm" ? "pequeño" : widget.size === "md" ? "mediano" : "grande"}
                        </span>
                        {widget.requiresDateRange && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                            rango de fechas
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                        {widget.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border-secondary flex-shrink-0">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors"
              >
                <RotateCcw size={13} />
                Restablecer predeterminado
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-secondary transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="btn-gradient px-4 py-2 rounded-xl text-[12px] font-medium"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
