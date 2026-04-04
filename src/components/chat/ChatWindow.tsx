"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, MessageCircle, PanelRightOpen, PanelRightClose, Clock, FileText, Hourglass } from "lucide-react";
import Link from "next/link";

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Hoy";
  if (isSameDay(date, yesterday)) return "Ayer";

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ChatWindow() {
  const {
    activeConversationId,
    activeName,
    activePhone,
    showContactPanel,
    setActiveConversation,
    toggleContactPanel,
  } = useChatStore();
  const { data: messages, isLoading } = useMessages(activeConversationId);
  const { data: conversations } = useConversations();
  const activeConv = useMemo(
    () => conversations?.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  // Auto scroll on new messages
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-0 h-full">
        <div className="text-center px-6 max-w-[280px]">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--gradient-accent)" }}>
            <MessageCircle size={36} className="text-white" />
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary">
            Selecciona una conversación
          </h2>
          <p className="text-[13px] text-text-muted mt-2 leading-relaxed">
            Elige un chat de la lista para ver los mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-primary h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-secondary bg-bg-secondary">
        <button
          onClick={() => setActiveConversation(null)}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-bg-hover"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold">
          {getInitials(activeName || "?")}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary truncate">
            {activeName}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-text-muted">{activePhone}</p>
            {activeConv?.assigned_worker_nombre && (
              <span className="text-[10px] font-medium" style={{ color: activeConv.assigned_worker_color || "var(--accent)" }}>
                Asignado a {activeConv.assigned_worker_nombre}
              </span>
            )}
            {activeConv?.etiqueta === 'Necesita ayuda humana' && !activeConv?.assigned_worker_id && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Esperando asignación
              </span>
            )}
          </div>
        </div>

        <button
          onClick={toggleContactPanel}
          className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover transition-all"
        >
          {showContactPanel ? (
            <PanelRightClose size={18} />
          ) : (
            <PanelRightOpen size={18} />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-10 w-[60%] rounded-2xl bg-bg-secondary animate-pulse ${i % 2 ? "ml-auto" : ""}`}
              />
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg, i) => {
              const currentKey = getDateKey(msg.timestamp);
              const prevKey = i > 0 ? getDateKey(messages[i - 1].created_at) : null;
              const showSeparator = currentKey !== prevKey;
              return (
                <div key={msg.id}>
                  {showSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-medium"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-secondary)",
                        }}
                      >
                        {getDateLabel(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    onImageClick={setOverlayImage}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-10 text-[13px] text-text-muted">
            No hay mensajes aún
          </div>
        )}
      </div>

      {/* Input or 24h block */}
      {(() => {
        const windowExpired = activeConv?.last_inbound_at &&
          Date.now() - new Date(activeConv.last_inbound_at).getTime() > 24 * 60 * 60 * 1000;

        if (!windowExpired) return <ChatInput />;

        const lastMsg = messages?.[messages.length - 1];
        const weSentLast = lastMsg?.direccion === "outbound";

        return (
          <div className="border-t border-border-secondary bg-bg-sidebar px-4 py-4">
            {weSentLast ? (
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Hourglass size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary">
                    Esperando respuesta del contacto
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">
                    Ya enviaste un mensaje a este contacto. La ventana de conversación se habilitará cuando te responda.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary">
                    Ventana de 24 horas expirada
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">
                    Han pasado más de 24 horas desde el último mensaje de este contacto.
                    Para volver a escribirle, envíale una plantilla aprobada por WhatsApp desde la sección{" "}
                    <Link href="/templates" className="text-accent font-medium hover:underline">
                      Plantillas
                    </Link>.
                  </p>
                </div>
                <Link
                  href="/templates"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-colors flex-shrink-0"
                >
                  <FileText size={13} />
                  Ir a Plantillas
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Image overlay */}
      {overlayImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setOverlayImage(null)}
        >
          <img
            src={overlayImage}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
