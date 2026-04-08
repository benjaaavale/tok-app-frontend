"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWorkers } from "@/hooks/useWorkers";
import { useChatStore } from "@/stores/chat-store";
import { cn, getInitials, timeAgo } from "@/lib/utils";
import { ETAPA_COLORS, ETAPA_LABELS } from "@/lib/constants";
import { Search, X, ChevronDown, Bot, User } from "lucide-react";
import { AnimatedSelect } from "@/components/ui/animated-select";

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const { data: companySettings } = useCompanySettings();
  const { data: workers } = useWorkers();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterEtapa, setFilterEtapa] = useState("");
  const [filterWorker, setFilterWorker] = useState("");
  const [filterPhone, setFilterPhone] = useState("");

  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  const hasTwoPhones = !!(companySettings?.phone_2_number);

  const phoneItems = useMemo(() => {
    if (!companySettings) return [];
    const items: { slot: string; number: string; label: string }[] = [];
    if (companySettings.phone_1_number) {
      items.push({ slot: "1", number: companySettings.phone_1_number, label: companySettings.phone_1_label || "" });
    }
    if (companySettings.phone_2_number) {
      items.push({ slot: "2", number: companySettings.phone_2_number, label: companySettings.phone_2_label || "" });
    }
    return items;
  }, [companySettings]);

  // Close phone dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setShowPhoneDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedPhoneItem = phoneItems.find((p) => p.slot === filterPhone);
  const phoneDisplayText = selectedPhoneItem
    ? selectedPhoneItem.number
    : "Todos los números";

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
      const matchWorker =
        !filterWorker ||
        (filterWorker === "unassigned"
          ? !c.assigned_worker_id
          : String(c.assigned_worker_id) === filterWorker);
      const matchPhone =
        !filterPhone || String(c.phone_slot) === filterPhone;
      return matchSearch && matchEstado && matchEtapa && matchWorker && matchPhone;
    });
  }, [conversations, search, filterEstado, filterEtapa, filterWorker, filterPhone]);

  const workerOptions = useMemo(() => {
    if (!workers) return [];
    return [
      { value: "unassigned", label: "Sin asignar" },
      ...workers.map((w) => ({ value: String(w.id), label: w.nombre })),
    ];
  }, [workers]);

  const hasFilters = !!search || !!filterEstado || !!filterEtapa || !!filterWorker || !!filterPhone;

  return (
    <div className="flex flex-col h-full border-r border-border-separator bg-bg-secondary">
      {/* Phone selector (above search, only if 2 phones) */}
      {hasTwoPhones && (
        <div className="px-3 pt-3 pb-0" ref={phoneDropdownRef}>
          <div className="relative">
            <button
              onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
              className="flex items-center gap-1.5 text-[13px] text-text-primary hover:text-accent transition-colors"
            >
              <span className={filterPhone ? "font-medium" : "text-text-muted"}>
                {phoneDisplayText}
              </span>
              <ChevronDown
                size={13}
                className={cn(
                  "text-text-muted transition-transform duration-200",
                  showPhoneDropdown && "rotate-180"
                )}
              />
            </button>
            {showPhoneDropdown && (
              <div className="absolute top-full left-0 mt-1.5 bg-bg-primary border border-border-secondary rounded-xl shadow-lg z-20 min-w-[220px] py-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setFilterPhone("");
                    setShowPhoneDropdown(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[12px] transition-colors",
                    !filterPhone
                      ? "text-accent font-medium bg-accent/5"
                      : "text-text-primary hover:bg-bg-hover"
                  )}
                >
                  Todos los números
                </button>
                {phoneItems.map((item) => (
                  <button
                    key={item.slot}
                    onClick={() => {
                      setFilterPhone(item.slot);
                      setShowPhoneDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[12px] transition-colors",
                      filterPhone === item.slot
                        ? "text-accent font-medium bg-accent/5"
                        : "text-text-primary hover:bg-bg-hover"
                    )}
                  >
                    <span>{item.number}</span>
                    {item.label && (
                      <span className="ml-2 text-[10px] text-text-muted">
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
            placeholder="Sin estado"
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
            placeholder="Sin etapa"
            size="sm"
            className="flex-1"
          />
          <AnimatedSelect
            value={filterWorker}
            onChange={setFilterWorker}
            options={workerOptions}
            placeholder="Trabajador"
            size="sm"
            className="flex-1"
          />
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterEstado("");
                setFilterEtapa("");
                setFilterWorker("");
                setFilterPhone("");
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
            const needsHuman = conv.etiqueta === 'Necesita ayuda humana' && !conv.assigned_worker_id;
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
                    : needsHuman
                    ? "bg-amber-500/5 border-l-2 border-amber-500"
                    : "hover:bg-bg-hover"
                )}
              >
                {/* Avatar */}
                <div className="relative w-9 h-9 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold">
                    {getInitials(name)}
                  </div>
                  {/* Bot / Human indicator */}
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -left-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-bg-secondary",
                      conv.etiqueta === "Bot"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    )}
                  >
                    {conv.etiqueta === "Bot" ? (
                      <Bot size={8} className="text-white" />
                    ) : (
                      <User size={8} className="text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text-primary truncate">
                      {name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-text-muted">
                        {conv.ultimo_mensaje_timestamp
                          ? timeAgo(conv.ultimo_mensaje_timestamp)
                          : ""}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                          {conv.unread_count > 99 ? "99+" : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-text-muted truncate flex-1">
                      {conv.ultimo_mensaje || "Sin mensajes"}
                    </span>
                    {conv.assigned_worker_nombre && (
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${conv.assigned_worker_color || "#6B7280"}20`,
                          color: conv.assigned_worker_color || "#6B7280",
                        }}
                      >
                        {conv.assigned_worker_nombre}
                      </span>
                    )}
                    {needsHuman && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Ayuda humana
                      </span>
                    )}
                    {hasTwoPhones && conv.phone_label && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 bg-accent/10 text-accent">
                        {conv.phone_label}
                      </span>
                    )}
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
