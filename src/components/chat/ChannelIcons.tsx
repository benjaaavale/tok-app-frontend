export function MessengerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="url(#msg_bg_ci)" />
      <path d="M12 4C7.582 4 4 7.376 4 11.527c0 2.236 1.012 4.235 2.621 5.625V20l2.41-1.327c.644.178 1.326.274 2.034.274 4.418 0 7.935-3.376 7.935-7.42C19.936 7.376 16.418 4 12 4zm.79 9.988l-2.02-2.155-3.946 2.155 4.338-4.609 2.072 2.155 3.893-2.155-4.337 4.61z" fill="white" />
      <defs>
        <linearGradient id="msg_bg_ci" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B2FF" />
          <stop offset="1" stopColor="#006AFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig_bg_ci" cx="28%" cy="108%" r="140%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig_bg_ci)" />
      <rect x="6" y="6" width="12" height="12" rx="3.5" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="16.3" cy="7.7" r="1" fill="white" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      {/* Handset scaled down ~70% and recentered */}
      <g transform="translate(3.6 3.6) scale(0.7)">
        <path
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
          fill="white"
        />
        <path
          d="M12 2.5A9.5 9.5 0 002.5 12c0 1.67.43 3.24 1.19 4.6L2.5 21.5l4.97-1.17A9.5 9.5 0 1012 2.5z"
          stroke="white"
          strokeWidth="1.8"
          fill="none"
        />
      </g>
    </svg>
  );
}

type ChannelType = "whatsapp" | "messenger" | "instagram" | null | undefined;

export function ChannelBadge({ channel, size = 15 }: { channel: ChannelType; size?: number }) {
  if (channel === "messenger") return <MessengerIcon size={size} />;
  if (channel === "instagram") return <InstagramIcon size={size} />;
  // Default: WhatsApp (including null/undefined for backward compat)
  return <WhatsAppIcon size={size} />;
}
