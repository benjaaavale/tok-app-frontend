"use client";

import { useAuthStore } from "@/stores/auth-store";
import { X } from "lucide-react";

export function ImpersonationBanner() {
  const { impersonatingCompanyId, impersonatingCompanyName, setImpersonating } =
    useAuthStore();

  if (!impersonatingCompanyId) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-red-500 text-white text-[12px] font-medium z-50">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>
          Modo soporte — viendo{" "}
          <strong>{impersonatingCompanyName || `Empresa #${impersonatingCompanyId}`}</strong>
        </span>
      </div>
      <button
        onClick={() => {
          setImpersonating(null, null);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 100);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
      >
        <X size={12} />
        Salir
      </button>
    </div>
  );
}
