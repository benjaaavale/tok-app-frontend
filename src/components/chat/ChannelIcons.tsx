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
      <path
        d="M16.75 13.96c.25.13.42.2.48.31.07.11.05.56-.16 1.02-.21.46-1.03.91-1.4.94-.41.04-.43.33-2.7-.72-1.91-.88-3.14-2.86-3.23-2.99-.1-.13-.76-1.03-.76-1.97 0-.94.49-1.4.66-1.59.17-.19.37-.24.5-.24.15 0 .24 0 .35.01.11 0 .25-.02.4.31.13.3.43 1.04.47 1.12.04.08.06.17.01.28-.05.11-.08.17-.16.28-.08.11-.17.22-.24.3-.08.08-.16.17-.07.34.08.17.38.67.83 1.08.58.52 1.07.68 1.22.76.15.08.24.07.33-.04.09-.11.38-.44.48-.59.1-.15.2-.13.34-.08.15.05.94.44 1.1.52z"
        fill="white"
      />
      <path
        d="M12 2.18C6.58 2.18 2.18 6.58 2.18 12c0 1.86.52 3.65 1.5 5.22l-1 3.61 3.72-.97A9.8 9.8 0 0012 21.82c5.42 0 9.82-4.4 9.82-9.82S17.42 2.18 12 2.18zM12 0C18.63 0 24 5.37 24 12s-5.37 12-12 12a11.9 11.9 0 01-5.83-1.62L0 24l1.6-5.83A11.9 11.9 0 010 12C0 5.37 5.37 0 12 0z"
        fill="#25D366"
      />
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
