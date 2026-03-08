"use client";

import { useState } from "react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { Bot, User, Smartphone } from "lucide-react";
import type { Message } from "@/types/api";

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (url: string) => void;
}

export function MessageBubble({ message, onImageClick }: MessageBubbleProps) {
  const isOutbound = message.direccion === "outbound";
  const time = new Date(message.timestamp).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const senderIcon =
    message.sender_type === "bot" ? (
      <Bot size={10} />
    ) : message.sender_type === "whatsapp" ? (
      <Smartphone size={10} />
    ) : message.sender_type === "human" ? (
      <User size={10} />
    ) : null;

  return (
    <div
      className={cn("flex mb-2", isOutbound ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm",
          isOutbound
            ? "bg-accent text-white rounded-br-md"
            : "bg-bg-secondary border border-border-secondary text-text-primary rounded-bl-md"
        )}
      >
        {/* Content by type */}
        {message.tipo === "imagen" ? (
          <img
            src={resolveMediaUrl(message.contenido)}
            alt=""
            className="rounded-xl max-w-full max-h-[300px] object-cover cursor-pointer"
            onClick={() => onImageClick?.(resolveMediaUrl(message.contenido))}
          />
        ) : message.tipo === "video" ? (
          <video
            src={resolveMediaUrl(message.contenido)}
            controls
            className="rounded-xl max-w-full max-h-[300px]"
          />
        ) : message.tipo === "audio" ? (
          <audio
            src={resolveMediaUrl(message.contenido)}
            controls
            className="max-w-[250px]"
          />
        ) : message.tipo === "documento" ? (
          <a
            href={resolveMediaUrl(message.contenido)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 underline",
              isOutbound ? "text-white/90" : "text-accent"
            )}
          >
            📄 Documento
          </a>
        ) : (
          <span className="whitespace-pre-wrap break-words">
            {message.contenido}
          </span>
        )}

        {/* Time + sender */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[10px]",
            isOutbound ? "text-white/50 justify-end" : "text-text-muted"
          )}
        >
          {senderIcon}
          {time}
        </div>
      </div>
    </div>
  );
}
