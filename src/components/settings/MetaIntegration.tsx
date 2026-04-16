"use client";

import { useState } from "react";
import { useMetaStatus, useConnectMeta, useDisconnectMeta, useMetaBotSettings } from "@/hooks/useMeta";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface MetaStatus {
  connected: boolean;
  messenger_connected: boolean;
  instagram_connected: boolean;
  facebook_page_name: string | null;
  instagram_username: string | null;
  bot_enabled_messenger: boolean;
  bot_enabled_instagram: boolean;
}

// Official Meta logo
function MetaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.68 18c0-3.47 1.34-6.81 3.28-8.9C11.62 7.28 13.62 6 15.8 6c1.73 0 3.28.78 4.68 2.34C21.46 9.5 22.7 11.5 24 14c1.3-2.5 2.54-4.5 3.52-5.66C28.92 6.78 30.47 6 32.2 6c2.18 0 4.18 1.28 5.84 3.1C39.98 11.19 41.32 14.53 41.32 18c0 6.63-4.17 12-9.12 12-1.73 0-3.28-.78-4.68-2.34-.98-1.16-2.22-3.16-3.52-5.66-1.3 2.5-2.54 4.5-3.52 5.66C19.08 29.22 17.53 30 15.8 30 10.85 30 6.68 24.63 6.68 18z" fill="url(#meta_grad)"/>
      <defs>
        <linearGradient id="meta_grad" x1="6.68" y1="6" x2="41.32" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0081FB"/>
          <stop offset="0.5" stopColor="#0064E0"/>
          <stop offset="1" stopColor="#0052CC"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export { MetaLogo };

export function MetaIntegration() {
  const { data: status, isLoading } = useMetaStatus() as { data: MetaStatus | undefined; isLoading: boolean };
  const connectMeta = useConnectMeta();
  const disconnectMeta = useDisconnectMeta();
  const botSettings = useMetaBotSettings();
  const confirm = useConfirm();
  const [messengerBot, setMessengerBot] = useState(true);
  const [instagramBot, setInstagramBot] = useState(true);

  // Sync local state with fetched data
  if (status && messengerBot !== status.bot_enabled_messenger) {
    setMessengerBot(status.bot_enabled_messenger);
  }
  if (status && instagramBot !== status.bot_enabled_instagram) {
    setInstagramBot(status.bot_enabled_instagram);
  }

  const handleDisconnect = async () => {
    const ok = await confirm({
      title: "Desconectar Meta",
      description: "Se desconectaran Messenger e Instagram. Las conversaciones existentes se mantendran.",
      confirmText: "Desconectar",
      cancelText: "Cancelar",
    });
    if (ok) disconnectMeta.mutate();
  };

  const handleToggleMessengerBot = (checked: boolean) => {
    setMessengerBot(checked);
    botSettings.mutate({ bot_enabled_messenger: checked });
  };

  const handleToggleInstagramBot = (checked: boolean) => {
    setInstagramBot(checked);
    botSettings.mutate({ bot_enabled_instagram: checked });
  };

  const isConnected = status?.messenger_connected || status?.instagram_connected;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0081FB]/10 flex items-center justify-center">
          <MetaLogo size={18} />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">Meta</h3>
          <p className="text-[11px] text-text-muted">Messenger e Instagram Direct</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-3">
          <Loader2 size={14} className="animate-spin text-text-muted" />
          <span className="text-[12px] text-text-muted">Cargando...</span>
        </div>
      ) : isConnected ? (
        <div className="space-y-3">
          {/* Connected info */}
          <div className="px-3 py-3 bg-bg-primary rounded-xl border border-border-secondary space-y-2">
            {status.facebook_page_name && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Pagina de Facebook</span>
                <span className="text-[12px] font-medium text-text-primary">{status.facebook_page_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Messenger</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Conectado</span>
            </div>
            {status.instagram_connected && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Instagram</span>
                <div className="flex items-center gap-1.5">
                  {status.instagram_username && <span className="text-[12px] text-text-primary">@{status.instagram_username}</span>}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Conectado</span>
                </div>
              </div>
            )}
          </div>

          {/* Bot toggles per channel */}
          <div className="px-3 py-3 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
            <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Bot por canal</p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-primary">Bot en Messenger</span>
              <Switch checked={messengerBot} onCheckedChange={handleToggleMessengerBot} />
            </div>
            {status.instagram_connected && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-primary">Bot en Instagram</span>
                <Switch checked={instagramBot} onCheckedChange={handleToggleInstagramBot} />
              </div>
            )}
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnectMeta.isPending}
            className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {disconnectMeta.isPending ? "Desconectando..." : "Desconectar Meta"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => connectMeta.mutate()}
          disabled={connectMeta.isPending}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#0081FB] text-white text-[13px] font-medium hover:bg-[#0064E0] transition-all disabled:opacity-50"
        >
          {connectMeta.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              Conectar <MetaLogo size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
