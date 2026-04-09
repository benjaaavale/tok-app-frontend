"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ShoppingCart,
  ExternalLink,
  Loader2,
  RefreshCw,
  User,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ShopifyLogo } from "@/components/settings/ShopifyIntegration";
import {
  useShopifyStatus,
  useShopifyAbandonedCheckouts,
  useConnectShopify,
} from "@/hooks/useShopify";

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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-bg-secondary/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 text-center px-8 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#008060]/10 border border-[#008060]/20 flex items-center justify-center">
          <ShopifyLogo size={36} />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-text-primary">Conecta tu tienda Shopify</p>
          <p className="text-[12px] text-text-muted mt-1.5 leading-relaxed">
            Recupera ventas perdidas enviando recordatorios automáticos por WhatsApp a clientes con carritos abandonados
          </p>
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

export default function ShopifyPage() {
  const { data: status, isLoading: statusLoading } = useShopifyStatus();
  const isConnected = status?.connected ?? false;
  const shopName = status?.shop_name ?? null;

  const {
    data,
    isLoading: checkoutsLoading,
    refetch,
    isFetching,
  } = useShopifyAbandonedCheckouts();

  const checkouts: any[] = data?.checkouts ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <ShopifyLogo size={22} />
          <div>
            <h1 className="text-[15px] font-semibold text-text-primary">
              {isConnected && shopName ? shopName : "Shopify"}
            </h1>
            <p className="text-[11px] text-text-muted">
              {isConnected ? "Carritos abandonados" : "No conectado"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all border border-border-secondary"
            >
              <RefreshCw size={11} className={isFetching ? "animate-spin" : ""} />
              Actualizar
            </button>
          )}
          <Link
            href="/settings?tab=integraciones"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all border border-border-secondary"
          >
            <Settings size={11} />
            Configurar
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="relative min-h-[300px]">
          {/* Overlay when not connected */}
          {!statusLoading && !isConnected && <NotConnectedOverlay />}

          {/* Blurred placeholder when not connected */}
          {!isConnected && (
            <div className="blur-[3px] pointer-events-none select-none space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[68px] rounded-xl bg-bg-primary border border-border-secondary" />
              ))}
            </div>
          )}

          {/* Real content when connected */}
          {isConnected && (
            <>
              {/* Stats bar */}
              <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-bg-primary border border-border-secondary">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-[#008060]" />
                  <span className="text-[12px] font-medium text-text-primary">
                    {checkouts.length} carrito{checkouts.length !== 1 ? "s" : ""} abandonado{checkouts.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {checkouts.length > 0 && (
                  <span className="text-[11px] text-text-muted">
                    Total:{" "}
                    <span className="text-[#008060] font-medium">
                      {formatPrice(
                        checkouts.reduce((s, c) => s + parseFloat(c.total_price || "0"), 0),
                        checkouts[0]?.currency
                      )}
                    </span>
                  </span>
                )}
              </div>

              {/* List */}
              {checkoutsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[68px] rounded-xl bg-bg-primary border border-border-secondary animate-pulse" />
                  ))}
                </div>
              ) : checkouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart size={32} className="text-text-muted mb-3 opacity-30" />
                  <p className="text-[13px] font-medium text-text-primary">Sin carritos abandonados</p>
                  <p className="text-[11px] text-text-muted mt-1">Todos los checkouts se completaron</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checkouts.map((checkout: any) => {
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
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-secondary hover:border-[#008060]/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#008060]/10 flex items-center justify-center flex-shrink-0">
                          <User size={15} className="text-[#008060]" />
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
                              className="flex items-center gap-1 text-[10px] text-[#008060] px-2 py-1 rounded-lg bg-[#008060]/10 hover:bg-[#008060]/20 transition-colors"
                            >
                              <ExternalLink size={9} />
                              Ver carrito
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
