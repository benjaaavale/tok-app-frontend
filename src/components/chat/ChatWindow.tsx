"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";

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
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <p className="text-[14px] text-text-secondary">
            Selecciona una conversaci&oacute;n
          </p>
          <p className="text-[12px] text-text-muted mt-1">
            Elige un chat de la lista para ver los mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-primary h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-secondary bg-bg-sidebar">
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
          <p className="text-[11px] text-text-muted">{activePhone}</p>
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
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onImageClick={setOverlayImage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-10 text-[13px] text-text-muted">
            No hay mensajes a&uacute;n
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput />

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
