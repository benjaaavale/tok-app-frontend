"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, ExternalLink, Loader2, RefreshCw, User, Clock } from "lucide-react";
import { ShopifyLogo } from "./ShopifyIntegration";
import {
  useShopifyStatus,
  useShopifyAbandonedCheckouts,
  useConnectShopify,
} from "@/hooks/useShopify";
import { SettingsSection } from "./SettingsSection";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function formatPrice(amount: string | number, currency = "CLP") {
  const n = parseFloat(String(amount));
  return new Intl.NumberFormat("es-CL", { style: "currency", currency }).format(n);
}

function NotConnectedOverlay() {
  const [shopDomain, setShopDomain] = useState("");
  const connectShopify = useConnectShopify();

  const handleConnect = () => {
    const domain = shopDomain.trim();
    if (!domain) {
      toast.error("Ingresa el dominio de tu tienda Shopify");
      return;
    }
    connectShopify.mutate(domain, {
      onError: (err: Error) => toast.error(err.message),
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-bg-secondary/80 backdrop-blur-sm border border-border-secondary">
      <div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#008060]/10 border border-[#008060]/20 flex items-center justify-center">
          <ShopifyLogo size={32} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-text-primary">Conecta Shopify para ver tus carritos</p>
          <p className="text-[12px] text-text-muted mt-1">Recupera ventas perdidas enviando recordatorios automáticos por WhatsApp</p>
        </div>
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="mi-tienda.myshopify.com"
            className="flex-1 px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#008060]/50 focus:ring-1 focus:ring-[#008060]/20 transition-all"
          />
          <button
            onClick={handleConnect}
            disabled={connectShopify.isPending || !shopDomain.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium text-white bg-[#008060] hover:bg-[#006e52] transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {connectShopify.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ShopifyLogo size={14} />
            )}
            {connectShopify.isPending ? "Conectando..." : "Conectar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AbandonedCheckouts() {
  const { data: status, isLoading: statusLoading } = useShopifyStatus();
  const isConnected = status?.connected ?? false;

  const {
    data,
    isLoading: checkoutsLoading,
    refetch,
    isFetching,
  } = useShopifyAbandonedCheckouts();

  const checkouts: any[] = data ?? [];

  return (
    <SettingsSection
      title="Carritos abandonados"
      description="Clientes que iniciaron un checkout pero no completaron su compra"
    >
      <div className="relative min-h-[220px]">
        {/* Overlay when not connected */}
        {!statusLoading && !isConnected && <NotConnectedOverlay />}

        {/* Content (blurred when not connected) */}
        <div className={!isConnected ? "pointer-events-none select-none blur-[2px]" : ""}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-text-muted">
              {isConnected
                ? `${checkouts.length} carrito${checkouts.length !== 1 ? "s" : ""} abandonado${checkouts.length !== 1 ? "s" : ""}`
                : "— carritos abandonados"}
            </p>
            {isConnected && (
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary transition-colors"
              >
                <RefreshCw size={11} className={isFetching ? "animate-spin" : ""} />
                Actualizar
              </button>
            )}
          </div>

          {/* Checkout list */}
          {checkoutsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-bg-primary animate-pulse" />
              ))}
            </div>
          ) : checkouts.length === 0 && isConnected ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingCart size={28} className="text-text-muted mb-2 opacity-40" />
              <p className="text-[12px] text-text-muted">No hay carritos abandonados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Placeholder rows when not connected */}
              {!isConnected &&
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-bg-primary border border-border-secondary" />
                ))}

              {/* Real rows */}
              {isConnected &&
                checkouts.map((checkout: any) => {
                  const name =
                    checkout.billing_address?.name ||
                    checkout.email ||
                    checkout.phone ||
                    "Cliente desconocido";
                  const total = checkout.total_price;
                  const currency = checkout.currency;
                  const itemCount = checkout.line_items?.length ?? 0;
                  const abandonedUrl = checkout.abandoned_checkout_url;
                  const createdAt = checkout.created_at;

                  return (
                    <div
                      key={checkout.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-secondary hover:border-[#008060]/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#008060]/10 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-[#008060]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-text-primary truncate">{name}</p>
                        <p className="text-[11px] text-text-muted">
                          {itemCount} producto{itemCount !== 1 ? "s" : ""} ·{" "}
                          <span className="text-[#008060] font-medium">
                            {formatPrice(total, currency)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <Clock size={9} />
                          {timeAgo(createdAt)}
                        </span>
                        {abandonedUrl && (
                          <a
                            href={abandonedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#008060] px-2 py-0.5 rounded-lg bg-[#008060]/10 hover:bg-[#008060]/20 transition-colors"
                          >
                            <ExternalLink size={9} />
                            Ver
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
