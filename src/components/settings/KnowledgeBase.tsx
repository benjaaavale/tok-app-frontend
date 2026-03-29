"use client";

import { useState, useRef } from "react";
import {
  useKnowledgeDocuments,
  useUploadDocument,
  useAddKnowledgeText,
  useImportWebsite,
  useDeleteDocument,
  useCompiledKnowledge,
  useCompileKnowledge,
} from "@/hooks/useKnowledge";
import { SettingsSection } from "./SettingsSection";
import { toast } from "sonner";
import {
  FileText,
  Globe,
  Trash2,
  Loader2,
  FileUp,
  Type,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AddMode = null | "file" | "text" | "website";

export function KnowledgeBase() {
  const { data: documents, isLoading } = useKnowledgeDocuments();
  const { data: compiled } = useCompiledKnowledge();
  const uploadDoc = useUploadDocument();
  const addText = useAddKnowledgeText();
  const importWeb = useImportWebsite();
  const deleteDoc = useDeleteDocument();
  const compileKnowledge = useCompileKnowledge();

  const [addMode, setAddMode] = useState<AddMode>(null);
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCompiledPreview, setShowCompiledPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing =
    uploadDoc.isPending || addText.isPending || importWeb.isPending;

  // Filter out the "compiled" type document from the displayed list
  const sourceDocuments = documents?.filter((d) => d.tipo !== "compiled") || [];

  // Check if compilation is needed (docs changed after last compile)
  const hasDocuments = sourceDocuments.length > 0;
  const isCompiled = !!compiled?.compiled_at;
  const needsCompilation = hasDocuments && (!isCompiled ||
    sourceDocuments.some((d) => new Date(d.created_at) > new Date(compiled?.compiled_at || 0))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [".pdf", ".txt", ".docx"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!validTypes.includes(ext)) {
      toast.error("Solo se aceptan archivos PDF, TXT o DOCX");
      return;
    }

    uploadDoc.mutate(file, {
      onSuccess: () => {
        toast.success("Documento subido. Compila para actualizar el agente.", {
          style: { background: "#10B981", color: "white", border: "none" },
        });
        setAddMode(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleAddText = () => {
    if (!textContent.trim() || textContent.trim().length < 10) {
      toast.error("El texto debe tener al menos 10 caracteres");
      return;
    }
    addText.mutate(
      { text: textContent, name: textName || undefined },
      {
        onSuccess: () => {
          toast.success("Texto agregado. Compila para actualizar el agente.", {
            style: { background: "#10B981", color: "white", border: "none" },
          });
          setTextContent("");
          setTextName("");
          setAddMode(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleImportWebsite = () => {
    if (!websiteUrl.trim()) {
      toast.error("Ingresa una URL valida");
      return;
    }
    importWeb.mutate(websiteUrl, {
      onSuccess: () => {
        toast.success("Sitio importado. Compila para actualizar el agente.", {
          style: { background: "#10B981", color: "white", border: "none" },
        });
        setWebsiteUrl("");
        setAddMode(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteDoc.mutate(id, {
      onSuccess: () => {
        toast.success("Documento eliminado. Compila para actualizar el agente.", {
          style: { background: "#10B981", color: "white", border: "none" },
        });
        setDeletingId(null);
      },
      onError: (err) => {
        toast.error(err.message);
        setDeletingId(null);
      },
    });
  };

  const handleCompile = () => {
    compileKnowledge.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          `Base compilada: ${data.documentsProcessed} docs → ${data.chunksCreated} fragmentos`,
          {
            style: { background: "#10B981", color: "white", border: "none" },
            duration: 4000,
          }
        );
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "pdf": return "📄";
      case "docx": return "📝";
      case "txt": return "📋";
      case "text": return "✏️";
      case "website": return "🌐";
      default: return "📎";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />
    );
  }

  return (
    <SettingsSection
      title="Base de Conocimiento"
      description="Sube documentos y compila para que el agente los use"
    >
      <div className="space-y-4">
        {/* ── Compilation Status Banner ── */}
        {hasDocuments && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              compileKnowledge.isPending
                ? "border-accent/30 bg-accent/5"
                : needsCompilation
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-green-500/30 bg-green-500/5"
            }`}
          >
            {compileKnowledge.isPending ? (
              <Loader2 size={16} className="text-accent animate-spin flex-shrink-0" />
            ) : needsCompilation ? (
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-text-primary">
                {compileKnowledge.isPending
                  ? "Compilando base de conocimiento..."
                  : needsCompilation
                  ? "Base de conocimiento desactualizada"
                  : "Base de conocimiento actualizada"}
              </p>
              <p className="text-[10px] text-text-muted">
                {compileKnowledge.isPending
                  ? "La IA esta organizando toda la informacion. Esto puede tardar unos segundos..."
                  : needsCompilation
                  ? "Hay cambios sin compilar. El agente aun no tiene la informacion actualizada."
                  : compiled?.compiled_at
                  ? `Ultima compilacion: ${formatDate(compiled.compiled_at)}`
                  : ""}
              </p>
            </div>
            {!compileKnowledge.isPending && (
              <button
                onClick={handleCompile}
                disabled={compileKnowledge.isPending || !hasDocuments}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Sparkles size={12} />
                {needsCompilation ? "Compilar" : "Recompilar"}
              </button>
            )}
          </div>
        )}

        {/* ── Compiled Preview (collapsible) ── */}
        {isCompiled && compiled?.compiled_text && (
          <div className="rounded-xl border border-border-secondary overflow-hidden">
            <button
              onClick={() => setShowCompiledPreview(!showCompiledPreview)}
              className="w-full flex items-center justify-between p-3 bg-bg-primary hover:bg-bg-hover transition-all"
            >
              <span className="text-[12px] font-medium text-text-primary flex items-center gap-2">
                <FileText size={14} className="text-accent" />
                Ver documento compilado
              </span>
              {showCompiledPreview ? (
                <ChevronUp size={14} className="text-text-muted" />
              ) : (
                <ChevronDown size={14} className="text-text-muted" />
              )}
            </button>
            {showCompiledPreview && (
              <div className="p-3 border-t border-border-secondary bg-bg-secondary max-h-[300px] overflow-y-auto">
                <pre className="text-[11px] text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                  {compiled.compiled_text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ── Document List (source documents) ── */}
        {sourceDocuments.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">
              Documentos fuente ({sourceDocuments.length})
            </p>
            {sourceDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-bg-primary rounded-xl border border-border-secondary group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[16px] flex-shrink-0">
                    {getTypeIcon(doc.tipo)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-text-primary truncate">
                      {doc.nombre}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {doc.tipo.toUpperCase()} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
                >
                  {deletingId === doc.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-[12px]">
              No hay documentos en la base de conocimiento
            </p>
            <p className="text-[11px] mt-0.5">
              Agrega informacion y compila para que el agente pueda responder consultas
            </p>
          </div>
        )}

        {/* ── Add Buttons ── */}
        {!addMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setAddMode("file")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium border border-border-secondary bg-bg-primary text-text-primary hover:bg-bg-hover transition-all"
            >
              <FileUp size={14} />
              Subir archivo
            </button>
            <button
              onClick={() => setAddMode("text")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium border border-border-secondary bg-bg-primary text-text-primary hover:bg-bg-hover transition-all"
            >
              <Type size={14} />
              Escribir texto
            </button>
            <button
              onClick={() => setAddMode("website")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium border border-border-secondary bg-bg-primary text-text-primary hover:bg-bg-hover transition-all"
            >
              <Globe size={14} />
              Sitio web
            </button>
          </div>
        )}

        {/* ── File Upload Form ── */}
        {addMode === "file" && (
          <div className="p-4 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-text-primary">
                Subir documento
              </p>
              <button
                onClick={() => setAddMode(null)}
                className="p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={14} className="text-text-muted" />
              </button>
            </div>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="w-full text-[12px] text-text-primary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[12px] file:font-medium file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer file:transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-text-muted">
              Formatos aceptados: PDF, TXT, DOCX
            </p>
            {uploadDoc.isPending && (
              <div className="flex items-center gap-2 text-[12px] text-accent">
                <Loader2 size={14} className="animate-spin" />
                Subiendo documento...
              </div>
            )}
          </div>
        )}

        {/* ── Text Input Form ── */}
        {addMode === "text" && (
          <div className="p-4 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-text-primary">
                Agregar informacion
              </p>
              <button
                onClick={() => setAddMode(null)}
                className="p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={14} className="text-text-muted" />
              </button>
            </div>
            <input
              type="text"
              value={textName}
              onChange={(e) => setTextName(e.target.value)}
              placeholder="Nombre (opcional, ej: Precios 2026)"
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Pega aqui la informacion de tu negocio (precios, servicios, FAQ, etc.)"
              rows={6}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
            <button
              onClick={handleAddText}
              disabled={isProcessing || textContent.trim().length < 10}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addText.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileUp size={14} />
              )}
              Agregar documento
            </button>
          </div>
        )}

        {/* ── Website Import Form ── */}
        {addMode === "website" && (
          <div className="p-4 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-text-primary">
                Importar sitio web
              </p>
              <button
                onClick={() => setAddMode(null)}
                className="p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={14} className="text-text-muted" />
              </button>
            </div>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://tu-negocio.cl"
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            <p className="text-[10px] text-text-muted">
              Se extraera el contenido principal de la pagina
            </p>
            <button
              onClick={handleImportWebsite}
              disabled={isProcessing || !websiteUrl.trim()}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold bg-accent text-white hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importWeb.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Globe size={14} />
              )}
              Importar contenido
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
