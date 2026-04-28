"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, Calendar, ArrowUpRight, XCircle, Loader2 } from "lucide-react";
import { useSubscription, useCancelSubscription } from "@/hooks/useSubscription";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { UsageCard } from "./UsageCard";
import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Activa", className: "bg-emerald-500/10 text-emerald-500" },
  trialing: { label: "Periodo de prueba", className: "bg-blue-500/10 text-blue-500" },
  past_due: { label: "Pago pendiente", className: "bg-amber-500/10 text-amber-500" },
  unpaid: { label: "Impaga", className: "bg-red-500/10 text-red-500" },
  canceled: { label: "Cancelada", className: "bg-text-muted/10 text-text-muted" },
  suspended: { label: "Suspendida", className: "bg-red-500/10 text-red-500" },
  incomplete: { label: "Pendiente de pago", className: "bg-amber-500/10 text-amber-500" },
  none: { label: "Sin plan", className: "bg-text-muted/10 text-text-muted" },
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function BillingSettings() {
  const { data: sub, isLoading } = useSubscription();
  const cancelMut = useCancelSubscription();
  const confirm = useConfirm();

  if (isLoading || !sub) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-text-muted" />
      </div>
    );
  }

  const status = sub.subscription_status || "none";
  const badge = STATUS_BADGE[status] || STATUS_BADGE.none;
  const planLabel = sub.plan ? PLAN_LABELS[sub.plan] || sub.plan : "Sin plan";
  const daysLeft = daysUntil(sub.current_period_end);
  const canCancel = status === "active" || status === "trialing" || status === "past_due";

  const handleCancel = async () => {
    const ok = await confirm({
      title: "Cancelar suscripción",
      description: "¿Seguro? Mantendrás acceso hasta el final del período actual y luego perderás el acceso a la app.",
      confirmText: "Sí, cancelar",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await cancelMut.mutateAsync();
      toast.success("Suscripción cancelada. Mantienes acceso hasta el final del período.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cancelando");
    }
  };

  return (
    <div className="space-y-4">
      {/* Plan card */}
      <div className="p-5 rounded-2xl bg-bg-secondary border border-border-secondary">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <CreditCard size={18} className="text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-text-primary">Plan {planLabel}</h3>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", badge.className)}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[12px] text-text-muted mt-0.5">
                {status === "trialing"
                  ? "Periodo de prueba activo"
                  : status === "active"
                  ? "Suscripción activa"
                  : status === "canceled"
                  ? "Suscripción cancelada"
                  : "Sin plan activo"}
              </p>
            </div>
          </div>

          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            Cambiar plan
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Period info */}
        {(sub.current_period_start || sub.current_period_end) && (
          <div className="mt-4 pt-4 border-t border-border-secondary grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-text-muted flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Inicio</p>
                <p className="text-[12px] font-medium text-text-primary">
                  {formatDate(sub.current_period_start)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-text-muted flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  {status === "trialing" ? "Trial termina" : "Próximo cobro"}
                </p>
                <p className="text-[12px] font-medium text-text-primary">
                  {formatDate(sub.current_period_end)}
                </p>
              </div>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Restantes</p>
                  <p className="text-[12px] font-medium text-text-primary">
                    {daysLeft} día{daysLeft === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage + history */}
      <UsageCard />

      {/* Cancel zone */}
      {canCancel && (
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-secondary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-[13px] font-semibold text-text-primary">Cancelar suscripción</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Conservas acceso hasta el final del período actual.
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelMut.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
            >
              {cancelMut.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <XCircle size={13} />
              )}
              Cancelar suscripción
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
