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

export function ShopifyLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 292 / 256)}
      viewBox="0 0 256 292"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="Shopify"
    >
      <path
        d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 95.806.038 260.235.038 260.235l165.678 31.042 89.77-19.42S223.973 58.8 223.775 57.34zM156.49 40.848l-14.019 4.339c.005-.988.01-1.96.01-3.023 0-9.264-1.286-16.723-3.349-22.636 8.287 1.04 13.806 10.469 17.358 21.32zm-27.638-19.483c2.304 5.773 3.802 14.058 3.802 25.238 0 .572-.005 1.095-.01 1.624-9.117 2.824-19.024 5.89-28.953 8.966 5.575-21.516 16.025-31.908 25.161-35.828zm-11.131-10.537c1.617 0 3.246.549 4.805 1.622-12.007 5.65-24.877 19.88-30.312 48.297l-22.886 7.088C75.694 46.16 90.81 10.828 117.72 10.828z"
        fill="#95BF46"
      />
      <path
        d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.959-2.394-1.099l-12.527 256.233 89.762-19.418S223.972 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357"
        fill="#5E8E3E"
      />
      <path
        d="M135.242 104.585l-11.069 32.926s-9.698-5.176-21.586-5.176c-17.428 0-18.305 10.937-18.305 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.491-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.627 4.338 22.627 4.338"
        fill="#FFF"
      />
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
  const shopName = status?.shop_name ?? null;
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
        <ShopifyLogo size={22} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-text-primary">
            {isConnected ? shopName || "Shopify conectado" : "No conectado"}
          </p>
          {isConnected && shopifyDomain && (
            <p className="text-[11px] text-[#008060] font-medium truncate">
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
          <span className="flex items-center gap-1 text-[10px] text-[#008060] px-2 py-0.5 rounded-full bg-[#008060]/10 border border-[#008060]/20 font-medium whitespace-nowrap">
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
                <ShopifyLogo size={14} />
              )}
              {connectShopify.isPending ? "Conectando..." : "Conectar Shopify"}
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
