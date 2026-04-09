"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2Off, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SettingsSection } from "./SettingsSection";
import {
  useShopifyStatus,
  useConnectShopify,
  useDisconnectShopify,
} from "@/hooks/useShopify";

function ShopifyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 109 124"
      fill="currentColor"
      style={{ flexShrink: 0, color: "#008060" }}
      aria-label="Shopify"
    >
      <path d="M74.7 14.8s-.3 0-.8.2c-.5-1.4-1.3-2.7-2.3-3.7-3.4-3.7-8.4-5.4-13.1-5.4-.3 0-.7 0-1 .1-.1-.2-.3-.4-.5-.5-2-2.2-4.6-3.2-7.7-3.1-6 .2-12 4.5-16.8 12.2-3.4 5.4-6 12.2-6.8 17.5-6.9 2.1-11.7 3.6-11.8 3.7-3.5 1.1-3.6 1.2-4 4.5C9.6 42.7 0 117.6 0 117.6l75.7 13.1V14.6c-.3 0-.7.1-1 .2zM57 20.2c-4 1.2-8.4 2.6-12.7 3.9 1.2-4.7 3.6-9.4 6.4-12.5 1.1-1.1 2.6-2.4 4.3-3.2 1.7 3.4 2.1 8.2 2 11.8zM49.6 8.2c1.4 0 2.6.3 3.6.9-1.6.8-3.2 2.1-4.6 3.6-3.7 4-6.5 10.2-7.7 16.1-3.5 1.1-7 2.1-10.2 3.1C32.6 21.2 40.6 8.4 49.6 8.2zM42.4 61.3c.3 5.2 14 6.3 14.8 18.5.6 9.6-5.1 16.1-13.2 16.6-9.8.6-15.2-5.2-15.2-5.2l2.1-8.8s5.4 4.1 9.7 3.8c2.8-.2 3.8-2.5 3.7-4.1-.4-6.8-11.5-6.4-12.3-17.5-.6-9.4 5.5-18.8 19.1-19.7 5.2-.3 7.9.9 7.9.9l-3.1 11.7s-3.4-1.6-7.5-1.3c-5.9.4-6 4.1-6 5.1zM60.7 19.5c0-3.2-.4-7.8-2-11.6 5.1 1 7.6 6.8 8.6 10.3-2 .6-4.2 1.2-6.6 1.3z" />
    </svg>
  );
}

export function ShopifyIntegration() {
  const confirm = useConfirm();
  const { data: status, isLoading } = useShopifyStatus();

  const [shopDomain, setShopDomain] = useState("");

  const connectShopify = useConnectShopify();
  const disconnectShopify = useDisconnectShopify();

  const isConnected = status?.connected ?? false;
  const shopName = status?.shopName ?? null;
  const shopifyDomain = status?.domain ?? null;

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

  const handleDisconnect = async () => {
    const ok = await confirm({
      title: "Desconectar Shopify",
      description: "¿Desconectar tu tienda Shopify? Perderás acceso a productos y carritos abandonados.",
      confirmText: "Desconectar",
      variant: "warning",
    });
    if (!ok) return;
    disconnectShopify.mutate(undefined, {
      onSuccess: () => toast.success("Shopify desconectado"),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  if (isLoading) {
    return (
      <SettingsSection
        title="Shopify"
        description="Conecta tu tienda Shopify para acceder a productos y carritos abandonados"
      >
        <div className="h-[80px] bg-bg-primary rounded-xl animate-pulse" />
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Shopify"
      description="Conecta tu tienda Shopify para acceder a productos y carritos abandonados"
    >
      {/* Connection status card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-secondary">
        <ShopifyIcon size={18} />
        <div className="flex-1">
          <p className="text-[12px] font-medium text-text-primary">
            {isConnected ? shopName || "Shopify conectado" : "No conectado"}
          </p>
          {isConnected && shopifyDomain && (
            <p className="text-[11px] text-[#008060] font-medium">
              {shopifyDomain}
            </p>
          )}
          <p className="text-[10px] text-text-muted">
            {isConnected
              ? "Tu tienda está sincronizada con ToK"
              : "Conecta tu tienda para gestionar productos y recuperar carritos abandonados"}
          </p>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1 text-[10px] text-[#008060] px-2 py-0.5 rounded-full bg-[#008060]/10 border border-[#008060]/20 font-medium">
            <CheckCircle2 size={10} />
            Conectado
          </span>
        ) : (
          <XCircle size={16} className="text-text-muted flex-shrink-0" />
        )}
      </div>

      {/* Connect form / Disconnect button */}
      <div className="mt-3">
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={disconnectShopify.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-danger hover:bg-danger/10 transition-all disabled:opacity-50"
          >
            {disconnectShopify.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Link2Off size={13} />
            )}
            {disconnectShopify.isPending ? "Desconectando..." : "Desconectar"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
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
                <ShopifyIcon size={13} />
              )}
              {connectShopify.isPending ? "Conectando..." : "Conectar Shopify"}
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
