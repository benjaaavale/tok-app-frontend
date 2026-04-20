"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWorkers } from "@/hooks/useWorkers";
import { useChatStore } from "@/stores/chat-store";
import { cn, getInitials, timeAgo } from "@/lib/utils";
import { ETAPA_COLORS, ETAPA_LABELS } from "@/lib/constants";
import { Search, X, ChevronDown, Bot, User, SlidersHorizontal, Inbox, Circle, AlertCircle, UserX } from "lucide-react";
import { AnimatedSelect } from "@/components/ui/animated-select";
import type { Conversation } from "@/types/api";
import { MessengerIcon, InstagramIcon, ChannelBadge } from "./ChannelIcons";

type ChannelOption = "whatsapp" | "messenger" | "instagram";
type TabOption = "all" | "support";

export function ConversationList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") === "support" ? "support" : "all") as TabOption;

  const { data: conversations, isLoading } = useConversations(activeTab === "support" ? "support" : undefined);
  const { data: allConversations } = useConversations(undefined);
  const { data: companySettings } = useCompanySettings();
  const { data: workers } = useWorkers();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterEtapa, setFilterEtapa] = useState("");
  const [filterWorker, setFilterWorker] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterChannels, setFilterChannels] = useState<Set<ChannelOption>>(new Set());
  const [quickFilter, setQuickFilter] = useState<"all" | "unread" | "human" | "unassigned">("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

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

  const hasPhones = phoneItems.length > 0;

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

  // Reset phone filter when channels no longer include only WhatsApp
  useEffect(() => {
    const whatsappOnly = filterChannels.size === 1 && filterChannels.has("whatsapp");
    if (!whatsappOnly && filterPhone) setFilterPhone("");
  }, [filterChannels, filterPhone]);

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
      const matchChannel =
        filterChannels.size === 0 ||
        filterChannels.has((c.channel || "whatsapp") as ChannelOption);
      const matchQuick =
        quickFilter === "all" ||
        (quickFilter === "unread" && c.unread_count > 0) ||
        (quickFilter === "human" &&
          (c.etiqueta === "Necesita ayuda humana" || !!c.assigned_worker_id)) ||
        (quickFilter === "unassigned" && !c.assigned_worker_id);
      return matchSearch && matchEstado && matchEtapa && matchWorker && matchPhone && matchChannel && matchQuick;
    });
  }, [conversations, search, filterEstado, filterEtapa, filterWorker, filterPhone, filterChannels, quickFilter]);

  const workerOptions = useMemo(() => {
    if (!workers) return [];
    return [
      { value: "unassigned", label: "Sin asignar" },
      ...workers.map((w) => ({ value: String(w.id), label: w.nombre })),
    ];
  }, [workers]);

  const hasAdvancedFilters = !!filterEstado || !!filterEtapa || !!filterWorker;
  const hasFilters = !!search || hasAdvancedFilters || !!filterPhone || filterChannels.size > 0 || quickFilter !== "all";

  const unreadCount = conversations?.filter((c) => c.unread_count > 0).length ?? 0;
  const humanCount =
    conversations?.filter(
      (c) => c.etiqueta === "Necesita ayuda humana" || !!c.assigned_worker_id
    ).length ?? 0;
  const unassignedCount = conversations?.filter((c) => !c.assigned_worker_id).length ?? 0;
  const supportCount = allConversations?.filter((c) => c.is_support).length ?? 0;

  const handleTabChange = (tab: TabOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    router.push(`/conversations?${params.toString()}`);
  };

  const showPhoneSelector =
    hasPhones && filterChannels.size === 1 && filterChannels.has("whatsapp");

  const quickChips: { id: typeof quickFilter; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "all", label: "Todos", icon: <Inbox size={11} /> },
    { id: "unread", label: "No leídos", icon: <Circle size={8} className="fill-current" />, badge: unreadCount },
    { id: "human", label: "Ayuda humana", icon: <AlertCircle size={11} />, badge: humanCount },
    { id: "unassigned", label: "Sin asignar", icon: <UserX size={11} />, badge: unassignedCount },
  ];

  return (
    <div className="flex flex-col h-full border-r border-border-separator bg-bg-secondary">
      {/* Tab switcher: Todas / Soporte */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-1">
        <button
          onClick={() => handleTabChange("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
            activeTab === "all"
              ? "bg-accent text-white shadow-sm"
              : "bg-bg-primary border border-border-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover"
          )}
        >
          Todas
        </button>
        <button
          onClick={() => handleTabChange("support")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
            activeTab === "support"
              ? "bg-accent text-white shadow-sm"
              : "bg-bg-primary border border-border-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover"
          )}
        >
          Soporte
          {supportCount > 0 && (
            <span
              className={cn(
                "min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold px-1",
                activeTab === "support"
                  ? "bg-white/25 text-white"
                  : "bg-red-500 text-white"
              )}
            >
              {supportCount > 99 ? "99+" : supportCount}
            </span>
          )}
        </button>
      </div>

      {/* Phone selector — solo cuando WhatsApp está seleccionado específicamente */}
      {showPhoneSelector && (
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

        {/* Channel filter buttons — multi-select, ninguno = todos. Filtros avanzados al final. */}
        <div
          className="flex items-center gap-1 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {(["whatsapp", "messenger", "instagram"] as ChannelOption[]).map((ch) => {
            const active = filterChannels.has(ch);
            const toggle = () => {
              setFilterChannels((prev) => {
                const next = new Set(prev);
                if (next.has(ch)) next.delete(ch);
                else next.add(ch);
                return next;
              });
            };
            return (
              <button
                key={ch}
                onClick={toggle}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border flex-shrink-0",
                  active
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-bg-primary border-border-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover"
                )}
              >
                {ch === "whatsapp" && (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.386A9.944 9.944 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#25D366" strokeWidth="1.5" fill="none"/>
                    </svg>
                    <span>WhatsApp</span>
                  </>
                )}
                {ch === "messenger" && (
                  <>
                    <MessengerIcon size={11} />
                    <span>Messenger</span>
                  </>
                )}
                {ch === "instagram" && (
                  <>
                    <InstagramIcon size={11} />
                    <span>Instagram</span>
                  </>
                )}
              </button>
            );
          })}
          {/* Filtros avanzados — al final del row de canales para evitar scroll */}
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border flex-shrink-0 ml-auto",
              hasAdvancedFilters || showMoreFilters
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-bg-primary border-border-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover"
            )}
            title="Más filtros"
          >
            <SlidersHorizontal size={11} />
            {hasAdvancedFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </button>
        </div>

        {/* Quick lifecycle chips */}
        <div
          className="flex items-center gap-1 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {quickChips.map((chip) => {
            const active = quickFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setQuickFilter(chip.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all border flex-shrink-0",
                  active
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-bg-primary border-border-secondary text-text-muted hover:text-text-primary hover:bg-bg-hover"
                )}
              >
                <span className={active ? "text-white" : ""}>{chip.icon}</span>
                <span>{chip.label}</span>
                {chip.badge !== undefined && chip.badge > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 min-w-[16px] px-1 h-[15px] inline-flex items-center justify-center rounded-full text-[9px] font-bold",
                      active
                        ? "bg-white/25 text-white"
                        : "bg-bg-hover text-text-secondary"
                    )}
                  >
                    {chip.badge > 99 ? "99+" : chip.badge}
                  </span>
                )}
              </button>
            );
          })}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterEstado("");
                setFilterEtapa("");
                setFilterWorker("");
                setFilterPhone("");
                setFilterChannels(new Set());
                setQuickFilter("all");
                setShowMoreFilters(false);
              }}
              className="px-2 py-1 rounded-lg bg-bg-primary border border-border-secondary text-text-muted hover:text-text-primary flex-shrink-0 ml-auto"
              title="Limpiar filtros"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Advanced filters (collapsible) */}
        {showMoreFilters && (
          <div className="flex gap-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
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
            <AnimatedSelect
              value={filterWorker}
              onChange={setFilterWorker}
              options={workerOptions}
              placeholder="Agente"
              size="sm"
              className="flex-1"
            />
          </div>
        )}
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
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold">
                    {getInitials(name)}
                  </div>
                  {/* Bot / Human indicator — top-left */}
                  <div
                    className={cn(
                      "absolute -top-1 -left-1 w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-bg-secondary shadow-sm",
                      conv.bot_desactivado ? "bg-emerald-500" : "bg-blue-500"
                    )}
                  >
                    {conv.bot_desactivado ? (
                      <User size={10} strokeWidth={2.5} className="text-white" />
                    ) : (
                      <Bot size={10} strokeWidth={2.5} className="text-white" />
                    )}
                  </div>
                  {/* Channel badge — bottom-right, más prominente */}
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-bg-secondary shadow-sm overflow-hidden flex items-center justify-center">
                    <ChannelBadge channel={conv.channel} size={13} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[13px] font-medium text-text-primary truncate">
                        {name}
                      </span>
                      {hasPhones && conv.phone_label && (
                        <span className="text-[9px] font-medium flex-shrink-0 text-accent">
                          {conv.phone_label}
                        </span>
                      )}
                    </div>
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
