"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Send, Loader2, Users, Sparkles } from "lucide-react";
import { ResendLogo } from "@/components/ui/BrandLogos";
import { SettingsSection } from "@/components/settings/SettingsSection";
import {
  useShopifyStatus,
  useShopifyAbandonedCheckouts,
  useSendCartRecoveryEmail,
  type ShopifyAbandonedCheckout,
} from "@/hooks/useShopify";

const DEFAULT_SUBJECT = "¿Olvidaste algo en tu carrito? 🛒";
const DEFAULT_MESSAGE = `¡Hola!

Vimos que dejaste algunos productos en tu carrito. Sabemos que a veces las compras quedan pendientes, así que te guardamos todo listo para que retomes cuando quieras.

Si tienes alguna duda, puedes responder este email y te ayudamos al tiro.

¡Gracias por preferirnos!`;

function checkoutDisplayName(c: ShopifyAbandonedCheckout): string {
  const anyC = c as unknown as { customer?: { first_name?: string; last_name?: string }; billing_address?: { first_name?: string } };
  const first = anyC.customer?.first_name || anyC.billing_address?.first_name || "";
  const last = anyC.customer?.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || c.email || "Cliente";
}

function formatMoney(v: string | number) {
  const n = parseFloat(String(v ?? 0));
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
}

export function CartEmailMarketing() {
  const { data: status } = useShopifyStatus();
  const isConnected = status?.connected ?? false;
  const { data: checkouts = [] } = useShopifyAbandonedCheckouts();
  const sendEmail = useSendCartRecoveryEmail();

  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sendingProgress, setSendingProgress] = useState<{ sent: number; total: number } | null>(null);

  const withEmail = useMemo(
    () => (checkouts as ShopifyAbandonedCheckout[]).filter((c) => c.email && c.email.includes("@")),
    [checkouts]
  );

  const allSelected = selected.size > 0 && selected.size === withEmail.length;

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(withEmail.map((c) => c.id)));
  };

  const handleSend = async () => {
    if (!isConnected) {
      toast.error("Conecta Shopify primero");
      return;
    }
    if (selected.size === 0) {
      toast.error("Selecciona al menos un carrito");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error("Asunto y mensaje son obligatorios");
      return;
    }

    const targets = withEmail.filter((c) => selected.has(c.id));
    setSendingProgress({ sent: 0, total: targets.length });
    let sent = 0;
    let failed = 0;

    for (const c of targets) {
      try {
        const anyC = c as unknown as { abandoned_checkout_url?: string };
        await sendEmail.mutateAsync({
          to: c.email,
          subject: subject.trim(),
          message: message.trim(),
          checkout_url: anyC.abandoned_checkout_url,
          customer_name: checkoutDisplayName(c),
        });
        sent += 1;
      } catch {
        failed += 1;
      }
      setSendingProgress({ sent: sent + failed, total: targets.length });
    }

    setSendingProgress(null);
    setSelected(new Set());
    if (failed === 0) toast.success(`${sent} email${sent === 1 ? "" : "s"} enviado${sent === 1 ? "" : "s"}`);
    else toast.warning(`${sent} enviados, ${failed} fallaron`);
  };

  const isSending = sendingProgress !== null;

  return (
    <SettingsSection
      title="Email marketing"
      description="Recupera carritos abandonados enviando emails personalizados vía Resend"
    >
      <div className="relative">
        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-bg-secondary/80 backdrop-blur-sm border border-border-secondary">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <Mail size={28} className="text-text-muted" />
              <p className="text-[13px] font-medium text-text-primary">
                Conecta Shopify para enviar emails de recuperación
              </p>
            </div>
          </div>
        )}

        <div className={!isConnected ? "pointer-events-none select-none blur-[2px]" : ""}>
          {/* Email template */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <ResendLogo size={14} />
              <span>Enviado vía Resend desde tu dominio configurado</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1.5">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[13px] text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="Asunto del email"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1.5">Mensaje</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={1500}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[13px] text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                placeholder="Escribe el mensaje que verán tus clientes..."
              />
              <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                <Sparkles size={10} />
                Se incluirá automáticamente un botón &quot;Completar mi compra&quot; con el link del carrito.
              </p>
            </div>
          </div>

          {/* Recipient list */}
          <div className="mt-5 border-t border-border-secondary pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-text-muted" />
                <p className="text-[12px] font-medium text-text-primary">
                  Destinatarios ({withEmail.length})
                </p>
              </div>
              {withEmail.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="text-[11px] text-accent hover:underline"
                  disabled={isSending}
                >
                  {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                </button>
              )}
            </div>

            {withEmail.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-text-muted">
                No hay carritos abandonados con email registrado
              </div>
            ) : (
              <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                {withEmail.map((c) => {
                  const isSel = selected.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        isSel
                          ? "bg-accent/5 border-accent/30"
                          : "bg-bg-primary border-border-secondary hover:border-border-primary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleOne(c.id)}
                        disabled={isSending}
                        className="w-4 h-4 accent-accent flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-text-primary truncate">
                          {checkoutDisplayName(c)}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">{c.email}</p>
                      </div>
                      <p className="text-[12px] font-semibold text-text-primary whitespace-nowrap">
                        {formatMoney(c.total_price)}
                      </p>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send button */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[11px] text-text-muted">
              {isSending && sendingProgress
                ? `Enviando ${sendingProgress.sent} / ${sendingProgress.total}...`
                : `${selected.size} seleccionado${selected.size === 1 ? "" : "s"}`}
            </p>
            <button
              onClick={handleSend}
              disabled={isSending || selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-accent hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {isSending ? "Enviando..." : `Enviar a ${selected.size || 0}`}
            </button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
