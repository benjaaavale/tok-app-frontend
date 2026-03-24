"use client";

import { useState } from "react";
import { useTemplates, useDeleteTemplate } from "@/hooks/useTemplates";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { TemplateForm } from "./TemplateForm";
import { TEMPLATE_STATUS_COLORS, TEMPLATE_STATUS_LABELS } from "@/lib/constants";
import type { WhatsAppTemplate } from "@/types/api";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, FileText, Loader2 } from "lucide-react";

function getBodyText(template: WhatsAppTemplate): string {
  const body = template.components.find((c) => c.type === "BODY");
  return body?.text || "";
}

function formatName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function TemplateList() {
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const confirm = useConfirm();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | undefined>(undefined);

  const handleDelete = async (template: WhatsAppTemplate) => {
    const ok = await confirm({
      title: "Eliminar plantilla",
      description: `¿Estás seguro de que quieres eliminar la plantilla "${formatName(template.name)}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteTemplate.mutateAsync(template.name);
      toast.success("Plantilla eliminada");
    } catch {
      toast.error("Error al eliminar la plantilla");
    }
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingTemplate(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Plantillas de WhatsApp</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Gestiona tus plantillas aprobadas por Meta
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[var(--accent)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Crear plantilla
        </button>
      </div>

      {/* Grid */}
      {!templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={40} className="text-[var(--text-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">No hay plantillas creadas</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Crea tu primera plantilla para empezar a enviar mensajes masivos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const statusColor = TEMPLATE_STATUS_COLORS[template.status] || "#94A3B8";
            const statusLabel = TEMPLATE_STATUS_LABELS[template.status] || template.status;
            const bodyText = getBodyText(template);

            return (
              <div
                key={`${template.name}-${template.language}`}
                className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl p-5 flex flex-col gap-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                      {formatName(template.name)}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{template.language}</p>
                  </div>
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusColor}26`,
                        color: statusColor,
                      }}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                      {template.category}
                    </span>
                  </div>
                </div>

                {/* Body preview */}
                {bodyText && (
                  <p className="text-[12px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {bodyText}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border-secondary)]">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    <Pencil size={13} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    disabled={deleteTemplate.isPending}
                    className="flex items-center gap-1.5 text-[11px] text-red-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <TemplateForm
        open={formOpen}
        onClose={handleClose}
        template={editingTemplate}
      />
    </div>
  );
}
