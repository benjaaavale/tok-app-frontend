"use client";

import { Bot, User } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";

// TODO: conectar endpoint real que retorne mensajes_bot vs mensajes_humano
// Por ahora usa datos mock
const MOCK = { mensajes_bot: 72, mensajes_humano: 28 };

export function RatioBotHumanoWidget(_props: WidgetProps) {
  const total = MOCK.mensajes_bot + MOCK.mensajes_humano;
  const pctBot = total > 0 ? Math.round((MOCK.mensajes_bot / total) * 100) : 0;

  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl p-4 shadow-sm">
      <p className="text-[11px] text-text-muted font-medium mb-3">Ratio Bot / Humano</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="h-2 bg-border-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${pctBot}%` }}
            />
          </div>
        </div>
        <span className="text-[12px] font-semibold text-text-primary w-10 text-right">{pctBot}%</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot size={12} className="text-accent" />
          <span className="text-[11px] text-text-muted">Bot: <b className="text-text-primary">{MOCK.mensajes_bot}</b> msgs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-blue-500" />
          <span className="text-[11px] text-text-muted">Humano: <b className="text-text-primary">{MOCK.mensajes_humano}</b> msgs</span>
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-2 italic">Datos mock — conectar endpoint real</p>
    </div>
  );
}
