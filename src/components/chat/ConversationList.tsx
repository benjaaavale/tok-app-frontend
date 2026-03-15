"use client";

import { useState, useMemo } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatStore } from "@/stores/chat-store";
import { cn, getInitials, timeAgo } from "@/lib/utils";
import { ETAPA_COLORS, ETAPA_LABELS } from "@/lib/constants";
import { Search, X, Filter } from "lucide-react";
import { AnimatedSelect } from "@/components/ui/animated-select";

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterEtapa, setFilterEtapa] = useState("");

  const filtered = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter((c) => {
      const name = (c.nombre_real || c.nombre_whatsapp || "").toLowerCase();
      const phone = c.telefono || "";
      const matchSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        phone.includes(search);
      const matchEstado =
        !filterEstado ||
        (filterEstado === "bot"
          ? c.etiqueta === "Bot"
          : c.etiqueta === "Necesita ayuda humana");
      const matchEtapa = !filterEtapa || c.etapa === filterEtapa;
      return matchSearch && matchEstado && matchEtapa;
    });
  }, [conversations, search, filterEstado, filterEtapa]);

  const hasFilters = !!search || !!filterEstado || !!filterEtapa;

  return (
    <div className="flex flex-col h-full border-r border-border-separator bg-bg-secondary">
      {/* Search */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5">
          <AnimatedSelect
            value={filterEstado}
            onChange={setFilterEstado}
            options={[
              { value: "bot", label: "Bot" },
              { value: "human", label: "Ayuda humana" },
            ]}
            placeholder="Estado"
            size="sm"
            className="flex-1"
          />
          <AnimatedSelect
            value={filterEtapa}
            onChange={setFilterEtapa}
            options={[
              { value: "frio", label: "Frío 🧊" },
              { value: "interesado", label: "Interesado 🤔" },
              { value: "calificado", label: "Calificado ✅" },
              { value: "alta_intencion", label: "Alta intención 🔥" },
              { value: "agendado", label: "Agendado 🗓️" },
              { value: "no_encaja", label: "No encaja ⛔" },
              { value: "pausado", label: "Pausado ⏸️" },
            ]}
            placeholder="Etapa"
            size="sm"
            className="flex-1"
          />
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterEstado("");
                setFilterEtapa("");
              }}
              className="px-2 rounded-lg bg-bg-primary border border-border-secondary text-text-muted hover:text-text-primary"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[56px] bg-bg-primary rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-text-muted">
            No hay conversaciones
          </div>
        ) : (
          filtered.map((conv) => {
            const name = conv.nombre_real || conv.nombre_whatsapp || conv.telefono;
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() =>
                  setActiveConversation(conv.id, conv.telefono, name)
                }
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-100",
                  isActive
                    ? "bg-accent/10"
                    : "hover:bg-bg-hover"
                )}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                  {getInitials(name)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text-primary truncate">
                      {name}
                    </span>
                    <span className="text-[10px] text-text-muted flex-shrink-0 ml-2">
                      {conv.ultimo_mensaje_timestamp
                        ? timeAgo(conv.ultimo_mensaje_timestamp)
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-text-muted truncate flex-1">
                      {conv.ultimo_mensaje || "Sin mensajes"}
                    </span>
                    {conv.etapa && (
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${ETAPA_COLORS[conv.etapa] || "#94A3B8"}20`,
                          color: ETAPA_COLORS[conv.etapa] || "#94A3B8",
                        }}
                      >
                        {ETAPA_LABELS[conv.etapa] || conv.etapa}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
