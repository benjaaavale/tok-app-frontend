"use client";

import { useState } from "react";
import {
  useKnowledgeSections,
  useCreateKnowledgeSection,
  useUpdateKnowledgeSection,
  useDeleteKnowledgeSection,
  type KnowledgeSection,
  type KnowledgeSectionCategory,
} from "@/hooks/useKnowledgeSections";
import { SettingsSection } from "./SettingsSection";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Pin } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30";
const labelCls = "text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1 block";

const KNOWLEDGE_CATEGORIES: { value: KnowledgeSectionCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "precios", label: "Precios" },
  { value: "catalogo", label: "Catálogo" },
  { value: "horarios", label: "Horarios" },
  { value: "faq", label: "FAQ" },
  { value: "politicas", label: "Políticas" },
  { value: "servicios", label: "Servicios" },
];

const CATEGORY_BADGE: Record<KnowledgeSectionCategory, string> = {
  general:   "bg-gray-100    text-gray-600    dark:bg-gray-800    dark:text-gray-400",
  precios:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  catalogo:  "bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-400",
  horarios:  "bg-violet-100  text-violet-700  dark:bg-violet-900/40  dark:text-violet-400",
  faq:       "bg-amber-100   text-amber-700   dark:bg-amber-900/40   dark:text-amber-400",
  politicas: "bg-rose-100    text-rose-700    dark:bg-rose-900/40    dark:text-rose-400",
  servicios: "bg-cyan-100    text-cyan-700    dark:bg-cyan-900/40    dark:text-cyan-400",
};

type SectionTemplate = {
  title: string;
  description: string;
  category: KnowledgeSectionCategory;
  content: string;
  always_include?: boolean;
};

const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    title: "Información General",
    description: "Nombre del negocio, dirección, contacto e introducción",
    category: "general",
    always_include: true,
    content: `Nombre del negocio: [nombre de tu empresa]
Descripción breve: [1-2 líneas explicando qué hace tu negocio]
Dirección: [calle, comuna, ciudad]
Teléfono de contacto: [+56 9 ...]
Email: [contacto@tu-empresa.cl]
Sitio web: [www.tu-empresa.cl]
Redes sociales: [@instagram, @tiktok, etc.]`,
  },
  {
    title: "Servicios y Precios",
    description: "Lista de servicios con precios y duraciones",
    category: "precios",
    content: `Servicio: [nombre del servicio 1]
Descripción: [breve explicación]
Precio: [valor en CLP]
Duración: [minutos / horas]

Servicio: [nombre del servicio 2]
Descripción: [breve explicación]
Precio: [valor en CLP]
Duración: [minutos / horas]

Servicio: [nombre del servicio 3]
Descripción: [breve explicación]
Precio: [valor en CLP]
Duración: [minutos / horas]

Formas de pago aceptadas: [efectivo, transferencia, tarjetas, etc.]
Descuentos: [si aplican — ej: 10% primera visita]`,
  },
  {
    title: "Horarios de Atención",
    description: "Días y horas en que el negocio atiende",
    category: "horarios",
    content: `Lunes a viernes: [09:00 - 18:00]
Sábado: [10:00 - 14:00]
Domingo: [cerrado]
Feriados: [cerrado / horario especial]

Horario especial para: [festividades, verano, etc.]
Última reserva del día: [ej: 17:30]`,
  },
  {
    title: "Ubicación y Acceso",
    description: "Dirección, cómo llegar, estacionamiento",
    category: "general",
    content: `Dirección exacta: [calle + número, comuna, ciudad]
Referencia: [punto conocido cercano]

Transporte público: [metro / micro más cercana]
Estacionamiento: [sí / no / paga / gratis]
Accesibilidad: [rampa, ascensor, etc.]

Google Maps: [link o cómo buscarlo]`,
  },
  {
    title: "Reservas y Citas",
    description: "Cómo agendar, políticas de reserva y cancelación",
    category: "servicios",
    content: `Cómo agendar: [WhatsApp, web, teléfono]
Confirmación: [el cliente recibe confirmación por WhatsApp / email]
Tiempo de anticipación mínima: [ej: 24 horas]

Política de cancelación: [ej: hasta 12 horas antes sin cargo]
Política de no-show: [qué pasa si el cliente no se presenta]
Reprogramación: [condiciones]

Abono o seña: [sí / no, monto]`,
  },
  {
    title: "Preguntas Frecuentes",
    description: "Preguntas y respuestas comunes de los clientes",
    category: "faq",
    content: `P: [pregunta frecuente 1]
R: [respuesta clara y completa]

P: [pregunta frecuente 2]
R: [respuesta clara y completa]

P: [pregunta frecuente 3]
R: [respuesta clara y completa]

P: [pregunta frecuente 4]
R: [respuesta clara y completa]`,
  },
  {
    title: "Catálogo de Productos",
    description: "Productos en venta con precio, stock y detalles",
    category: "catalogo",
    content: `Producto: [nombre del producto 1]
Descripción: [qué es, para qué sirve]
Precio: [valor CLP]
Stock: [disponible / agotado / unidades]
Variantes: [colores, tallas, modelos]

Producto: [nombre del producto 2]
Descripción: [qué es]
Precio: [valor CLP]
Stock: [disponible]
Variantes: [opciones]

Producto: [nombre del producto 3]
Descripción: [qué es]
Precio: [valor CLP]
Stock: [disponible]
Variantes: [opciones]`,
  },
  {
    title: "Políticas y Garantías",
    description: "Devoluciones, garantías, términos y condiciones",
    category: "politicas",
    content: `Garantía: [duración y cobertura]
Devoluciones: [plazo, condiciones, qué productos aplican]
Cambios: [condiciones para cambiar producto o servicio]

Facturación: [boleta / factura — requisitos]
Envíos: [zonas, costo, tiempos]
Privacidad: [breve política de uso de datos]`,
  },
];

interface SectionFormProps {
  initial?: Partial<KnowledgeSection>;
  onSave: (data: Omit<KnowledgeSection, "id" | "created_at">) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function SectionForm({ initial, onSave, onCancel, isSaving }: SectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [alwaysInclude, setAlwaysInclude] = useState(initial?.always_include ?? false);
  const [category, setCategory] = useState<KnowledgeSectionCategory>(initial?.category ?? "general");

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!content.trim()) { toast.error("El contenido es obligatorio"); return; }
    onSave({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      always_include: alwaysInclude,
      display_order: initial?.display_order ?? 0,
      category,
    });
  };

  return (
    <div className="space-y-3 p-4 bg-bg-primary rounded-xl border border-border-secondary">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls}>Título de la sección *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej: Servicios y Precios" className={inputCls} />
        </div>
        <div className="w-36 flex-shrink-0">
          <label className={labelCls}>Categoría</label>
          <AnimatedSelect
            value={category}
            onChange={(v) => setCategory(v as KnowledgeSectionCategory)}
            options={KNOWLEDGE_CATEGORIES}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>
          Descripción{" "}
          <span className="normal-case font-normal text-text-muted">(el router IA lee esto para decidir si inyectar esta sección)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej: Lista de servicios con precios y duraciones"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Contenido *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe la información que el agente debe conocer en esta sección..."
          rows={6}
          className={`${inputCls} resize-none`}
        />
        <p className="text-[10px] text-text-muted mt-1">{content.length} caracteres · ~{Math.round(content.length / 4)} tokens</p>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => setAlwaysInclude(!alwaysInclude)}
          className={cn(
            "w-8 h-4 rounded-full transition-colors flex-shrink-0 relative",
            alwaysInclude ? "bg-accent" : "bg-border-secondary"
          )}
        >
          <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all", alwaysInclude ? "left-4.5" : "left-0.5")} style={{ left: alwaysInclude ? "calc(100% - 14px)" : "2px" }} />
        </div>
        <span className="text-[12px] text-text-primary">
          Incluir siempre{" "}
          <span className="text-text-muted font-normal">(sin importar el mensaje — ideal para el bloque general del negocio)</span>
        </span>
      </label>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar sección"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary text-[12px] hover:bg-bg-hover transition-all">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category?: KnowledgeSectionCategory }) {
  const cat = category ?? "general";
  const label = KNOWLEDGE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0", CATEGORY_BADGE[cat])}>
      {label}
    </span>
  );
}

export function KnowledgeSections() {
  const { data: sections, isLoading } = useKnowledgeSections();
  const create = useCreateKnowledgeSection();
  const update = useUpdateKnowledgeSection();
  const remove = useDeleteKnowledgeSection();
  const confirm = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateInitial, setTemplateInitial] = useState<Partial<KnowledgeSection> | null>(null);

  if (isLoading) return <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />;

  const handleCreate = (data: Omit<KnowledgeSection, "id" | "created_at">) => {
    create.mutate(data, {
      onSuccess: () => { toast.success("Sección creada"); setShowForm(false); setShowTemplates(false); setTemplateInitial(null); },
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const handleUpdate = (id: number, data: Omit<KnowledgeSection, "id" | "created_at">) => {
    update.mutate({ id, ...data }, {
      onSuccess: () => { toast.success("Sección actualizada"); setEditingId(null); },
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const handleDelete = async (s: KnowledgeSection) => {
    const ok = await confirm({ title: "Eliminar sección", description: `¿Eliminar "${s.title}"?`, confirmText: "Eliminar", variant: "danger" });
    if (!ok) return;
    remove.mutate(s.id, { onSuccess: () => toast.success("Sección eliminada"), onError: (err: Error) => toast.error(err.message) });
  };

  return (
    <SettingsSection title="Base de Conocimiento" description="Define las secciones de información que el agente puede usar para responder">
      <div className="space-y-2">
        {/* Section list */}
        {sections && sections.length > 0 ? (
          sections.map((s) => (
            <div key={s.id} className="rounded-xl border border-border-secondary overflow-hidden">
              {editingId === s.id ? (
                <SectionForm
                  initial={s}
                  onSave={(data) => handleUpdate(s.id, data)}
                  onCancel={() => setEditingId(null)}
                  isSaving={update.isPending}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-bg-primary">
                    {s.always_include && (
                      <Pin size={11} className="text-accent flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[12px] font-medium text-text-primary truncate">{s.title}</p>
                        <CategoryBadge category={s.category} />
                      </div>
                      {s.description && (
                        <p className="text-[10px] text-text-muted truncate">{s.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted flex-shrink-0">
                      ~{Math.round(s.content.length / 4)} tokens
                    </span>
                    <button onClick={() => setEditingId(s.id)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
                      <Trash2 size={12} />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
                    >
                      {expandedId === s.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                  {expandedId === s.id && (
                    <div className="px-4 py-3 border-t border-border-secondary bg-bg-secondary">
                      <pre className="text-[11px] text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                        {s.content}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-text-muted">
            <p className="text-[12px]">No hay secciones de conocimiento</p>
            <p className="text-[11px] mt-0.5">Agrega secciones para que el agente pueda responder consultas específicas</p>
          </div>
        )}

        {/* Add section form */}
        {showForm && !showTemplates && (
          <SectionForm
            initial={templateInitial ?? undefined}
            onSave={handleCreate}
            onCancel={() => { setShowForm(false); setTemplateInitial(null); }}
            isSaving={create.isPending}
          />
        )}

        {/* Templates picker */}
        {showTemplates && (
          <div className="p-3 bg-bg-primary rounded-xl border border-border-secondary space-y-2">
            <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Plantillas sugeridas</p>
            {SECTION_TEMPLATES.map((t) => {
              const exists = sections?.some((s) => s.title === t.title);
              return (
                <button
                  key={t.title}
                  disabled={exists}
                  onClick={() => {
                    setTemplateInitial({
                      title: t.title,
                      description: t.description,
                      category: t.category,
                      content: t.content,
                      always_include: t.always_include ?? false,
                    });
                    setShowTemplates(false);
                    setShowForm(true);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg border text-[12px] transition-all",
                    exists
                      ? "border-border-secondary text-text-muted opacity-40 cursor-not-allowed"
                      : "border-border-secondary hover:bg-bg-hover text-text-primary cursor-pointer"
                  )}
                >
                  <span className="font-medium">{t.title}</span>
                  {t.always_include && <span className="ml-2 text-[10px] text-accent">siempre incluida</span>}
                  {exists && <span className="ml-2 text-[10px] text-text-muted">ya existe</span>}
                  <p className="text-[10px] text-text-muted mt-0.5">{t.description}</p>
                </button>
              );
            })}
            <button onClick={() => setShowTemplates(false)} className="text-[11px] text-text-muted hover:text-text-primary transition-all">
              Cancelar
            </button>
          </div>
        )}

        {/* Add buttons */}
        {!showForm && !showTemplates && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-primary hover:bg-bg-hover transition-all"
            >
              <Plus size={13} />
              Nueva sección
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-[12px] font-medium text-accent hover:bg-accent/20 transition-all"
            >
              Usar plantillas
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
