"use client";

import { useState } from "react";
import { useMetaStatus, useConnectMeta, useDisconnectMeta, useMetaBotSettings, useConnectInstagram, useDisconnectInstagram } from "@/hooks/useMeta";
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
  instagram_only?: boolean;
}

// Messenger logo — gradient "M"
function MessengerLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msg_grad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B2FF"/>
          <stop offset="100%" stopColor="#006AFF"/>
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill="url(#msg_grad)"/>
      <path d="M14 4C8.477 4 4 8.198 4 13.385c0 2.965 1.487 5.61 3.813 7.35V24l3.469-1.904A10.3 10.3 0 0014 22.77c5.523 0 10-4.198 10-9.385C24 8.198 19.523 4 14 4zm1.012 12.637L12.4 13.97l-5.097 2.667 5.6-5.942 2.653 2.667 5.065-2.667-5.61 5.942z" fill="white"/>
    </svg>
  );
}

// Instagram logo — gradient camera
function InstagramLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig_radial" cx="30%" cy="107%" r="150%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect width="28" height="28" rx="7" fill="url(#ig_radial)"/>
      <rect x="7" y="7" width="14" height="14" rx="4" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="14" cy="14" r="3.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="19" cy="9" r="1" fill="white"/>
    </svg>
  );
}

// Official Meta infinity-loop symbol (solo el símbolo)
function MetaLogo({ size = 20, color }: { size?: number; color?: string }) {
  const h = Math.round((size * 191) / 287.56);
  const useColor = color === "white";
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 287.56 191"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" fill={useColor ? "white" : "#0081fb"}/>
      <path d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" fill={useColor ? "white" : "url(#meta_a)"}/>
      <path d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3,38.73,15.35,59.28,0,82.85,0Z" fill={useColor ? "white" : "url(#meta_b)"}/>
      {!useColor && (
        <defs>
          <linearGradient id="meta_a" x1="62" y1="101.87" x2="260" y2="101.87" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0064e1"/>
            <stop offset="0.4" stopColor="#0064e1"/>
            <stop offset="0.83" stopColor="#0073ee"/>
            <stop offset="1" stopColor="#0082fb"/>
          </linearGradient>
          <linearGradient id="meta_b" x1="41.42" y1="138.32" x2="41.42" y2="65.42" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0082fb"/>
            <stop offset="1" stopColor="#0064e0"/>
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

// Wordmark completo: símbolo + texto "Meta" (para botón de conectar)
function MetaWordmark({ size = 18, color = "white" }: { size?: number; color?: "white" | "blue" }) {
  const isWhite = color === "white";
  const textColor = isWhite ? "white" : "#1c2b33";
  const symbolColor = isWhite ? "white" : undefined;
  return (
    <span className="flex items-center gap-[6px]">
      <MetaLogo size={size} color={symbolColor} />
      <span
        style={{
          fontFamily: "Optimistic Display, Inter, sans-serif",
          fontWeight: 700,
          fontSize: size * 1.1,
          color: textColor,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        Meta
      </span>
    </span>
  );
}

export { MetaLogo, MetaWordmark, MessengerLogo, InstagramLogo };

export function MetaIntegration() {
  const { data: status, isLoading } = useMetaStatus() as { data: MetaStatus | undefined; isLoading: boolean };
  const connectMeta = useConnectMeta();
  const disconnectMeta = useDisconnectMeta();
  const connectInstagram = useConnectInstagram();
  const disconnectInstagram = useDisconnectInstagram();
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
    const isIgOnly = status?.instagram_only;
    const ok = await confirm({
      title: isIgOnly ? "Desconectar Instagram" : "Desconectar Meta",
      description: isIgOnly
        ? "Se desconectara Instagram. Las conversaciones existentes se mantendran."
        : "Se desconectaran Messenger e Instagram. Las conversaciones existentes se mantendran.",
      confirmText: "Desconectar",
      cancelText: "Cancelar",
    });
    if (ok) {
      if (isIgOnly) disconnectInstagram.mutate();
      else disconnectMeta.mutate();
    }
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
        <div className="w-9 h-9 rounded-lg bg-[#0081FB]/10 flex items-center justify-center overflow-visible">
          <MetaLogo size={22} />
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
            {!status.instagram_only && status.facebook_page_name && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Pagina de Facebook</span>
                <span className="text-[12px] font-medium text-text-primary">{status.facebook_page_name}</span>
              </div>
            )}
            {!status.instagram_only && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessengerLogo size={15} />
                  <span className="text-[11px] text-text-muted">Messenger</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Conectado</span>
              </div>
            )}
            {status.instagram_connected && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <InstagramLogo size={15} />
                  <span className="text-[11px] text-text-muted">Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {status.instagram_username && <span className="text-[12px] text-text-primary">@{status.instagram_username}</span>}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Conectado</span>
                </div>
              </div>
            )}
          </div>

          {/* Agent IA toggles per channel */}
          <div className="px-3 py-3 bg-bg-primary rounded-xl border border-border-secondary space-y-3">
            <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Agente IA por canal</p>
            {!status.instagram_only && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessengerLogo size={14} />
                  <span className="text-[12px] text-text-primary">Agente IA en Messenger</span>
                </div>
                <Switch checked={messengerBot} onCheckedChange={handleToggleMessengerBot} />
              </div>
            )}
            {status.instagram_connected && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <InstagramLogo size={14} />
                  <span className="text-[12px] text-text-primary">Agente IA en Instagram</span>
                </div>
                <Switch checked={instagramBot} onCheckedChange={handleToggleInstagramBot} />
              </div>
            )}
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnectMeta.isPending || disconnectInstagram.isPending}
            className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {(status.instagram_only ? disconnectInstagram.isPending : disconnectMeta.isPending)
              ? "Desconectando..."
              : status.instagram_only
                ? "Desconectar Instagram"
                : "Desconectar Meta"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-text-muted text-center">Elige cómo conectar tus canales</p>
          <button
            onClick={() => connectMeta.mutate()}
            disabled={connectMeta.isPending || connectInstagram.isPending}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#0081FB] text-white text-[13px] font-medium hover:bg-[#0064E0] transition-all disabled:opacity-50"
          >
            {connectMeta.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <span className="text-white font-medium">Conectar con</span>
                <MetaWordmark size={16} color="white" />
              </>
            )}
          </button>
          <button
            onClick={() => connectInstagram.mutate()}
            disabled={connectMeta.isPending || connectInstagram.isPending}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-gradient-to-tr from-[#fdf497] via-[#d6249f] to-[#285AEB] text-white text-[13px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            {connectInstagram.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <InstagramLogo size={16} />
                <span className="text-white font-medium">Conectar solo Instagram</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
