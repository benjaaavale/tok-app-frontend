"use client";

import { useState, useRef } from "react";
import {
  useKnowledgeDocuments,
  useUploadDocument,
  useAddKnowledgeText,
  useImportWebsite,
  useDeleteDocument,
} from "@/hooks/useKnowledge";
import { SettingsSection } from "./SettingsSection";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Globe,
  Trash2,
  Plus,
  Loader2,
  FileUp,
  Type,
  X,
} from "lucide-react";

type AddMode = null | "file" | "text" | "website";

export function KnowledgeBase() {
  const { data: documents, isLoading } = useKnowledgeDocuments();
  const uploadDoc = useUploadDocument();
  const addText = useAddKnowledgeText();
  const importWeb = useImportWebsite();
  const deleteDoc = useDeleteDocument();

  const [addMode, setAddMode] = useState<AddMode>(null);
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing =
    uploadDoc.isPending || addText.isPending || importWeb.isPending;

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
      onSuccess: (data) => {
        toast.success(
          `Documento procesado: ${data.chunksCreated} fragmentos creados`,
          {
            style: { background: "#10B981", color: "white", border: "none" },
          }
        );
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
        onSuccess: (data) => {
          toast.success(
            `Texto procesado: ${data.chunksCreated} fragmentos creados`,
            {
              style: { background: "#10B981", color: "white", border: "none" },
            }
          );
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
      onSuccess: (data) => {
        toast.success(
          `Sitio importado: ${data.chunksCreated} fragmentos creados`,
          {
            style: { background: "#10B981", color: "white", border: "none" },
          }
        );
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
        toast.success("Documento eliminado", {
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

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "pdf":
        return "📄";
      case "docx":
        return "📝";
      case "txt":
        return "📋";
      case "text":
        return "✏️";
      case "website":
        return "🌐";
      default:
        return "📎";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
      description="Informacion que el agente usa para responder consultas"
    >
      <div className="space-y-4">
        {/* ── Document List ── */}
        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
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
              Agrega informacion para que el agente pueda responder consultas
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
                Procesando documento...
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
                <Plus size={14} />
              )}
              Agregar a la base de conocimiento
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
