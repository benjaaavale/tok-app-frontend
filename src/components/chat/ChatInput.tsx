"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { useChatStore } from "@/stores/chat-store";
import { formatFileSize, resolveMediaUrl } from "@/lib/utils";
import { Send, Paperclip, X, Image, Video, FileText } from "lucide-react";
import { toast } from "sonner";

export function ChatInput() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { activeConversationId, activePhone } = useChatStore();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMutation = useMutation({
    mutationFn: async (mensaje: string) => {
      await authFetch(
        "/messages/send",
        {
          method: "POST",
          body: JSON.stringify({
            whatsappMessage: { to: activePhone, text: { body: mensaje } },
          }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast.error("Error al enviar mensaje");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const uploadRes = await authFetch(
        "/upload",
        { method: "POST", body: formData },
        () => getToken()
      );
      const uploadData = await uploadRes.json();

      const absoluteUrl = resolveMediaUrl(uploadData.url);
      let mediaPayload: Record<string, unknown>;
      if (uploadData.tipo === "video") {
        mediaPayload = { video: { link: absoluteUrl } };
      } else if (uploadData.tipo === "documento") {
        mediaPayload = { document: { link: absoluteUrl, filename: uploadData.filename } };
      } else {
        // imagen (default)
        mediaPayload = { image: { link: absoluteUrl } };
      }

      await authFetch(
        "/messages/send",
        {
          method: "POST",
          body: JSON.stringify({
            whatsappMessage: { to: activePhone, ...mediaPayload },
          }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast.error("Error al enviar archivo");
    },
  });

  const handleSend = () => {
    if (file) {
      uploadMutation.mutate(file);
      return;
    }
    const msg = text.trim();
    if (!msg || !activePhone) return;
    sendMutation.mutate(msg);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triggerFile = (accept: string) => {
    setShowAttach(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const isSending = sendMutation.isPending || uploadMutation.isPending;

  return (
    <div className="border-t border-border-secondary bg-bg-sidebar p-3">
      {/* File preview */}
      {file && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-bg-primary rounded-xl border border-border-secondary">
          <FileText size={14} className="text-accent flex-shrink-0" />
          <span className="text-[12px] text-text-primary truncate flex-1">
            {file.name}
          </span>
          <span className="text-[10px] text-text-muted">
            {formatFileSize(file.size)}
          </span>
          <button
            onClick={() => setFile(null)}
            className="text-text-muted hover:text-danger"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach */}
        <div className="relative">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
          >
            <Paperclip size={18} />
          </button>

          {showAttach && (
            <div className="absolute bottom-12 left-0 bg-bg-secondary border border-border-secondary rounded-xl shadow-lg p-1.5 space-y-0.5 z-10 min-w-[140px]">
              <button
                onClick={() => triggerFile("image/*")}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-text-secondary hover:bg-bg-hover"
              >
                <Image size={14} /> Foto
              </button>
              <button
                onClick={() => triggerFile("video/*")}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-text-secondary hover:bg-bg-hover"
              >
                <Video size={14} /> Video
              </button>
              <button
                onClick={() => triggerFile(".pdf,.doc,.docx,.xlsx,.txt")}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-text-secondary hover:bg-bg-hover"
              >
                <FileText size={14} /> Documento
              </button>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 resize-none rounded-xl bg-bg-primary border border-border-secondary px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all max-h-[120px]"
          style={{ minHeight: "40px" }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !file)}
          className="btn-gradient w-[44px] h-[44px] flex items-center justify-center rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
