"use client";

import { useSubscription, useBillingOverages } from "@/hooks/useSubscription";
import { AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function UsageCard() {
  const { data: sub, isLoading } = useSubscription();
  const { data: overages } = useBillingOverages();

  if (isLoading || !sub) return null;

  const limit = sub.plan_limits?.max_conversations_per_month ?? 0;
  const used = sub.conversations_this_period ?? 0;
  const overageCount = sub.current_overage_count ?? 0;
  const overagePrice = sub.overage_price_clp ?? 300;
  const overageAmount = sub.current_overage_amount_clp ?? 0;

  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isOver = overageCount > 0;
  const isNear = !isOver && pct >= 80;

  return (
    <div className="space-y-4">
      {/* Usage card */}
      <div className="p-4 rounded-2xl bg-bg-secondary border border-border-secondary space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h3 className="text-[14px] font-semibold text-text-primary">Consumo del mes</h3>
          </div>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full",
              isOver
                ? "bg-red-500/10 text-red-500"
                : isNear
                ? "bg-amber-500/10 text-amber-500"
                : "bg-emerald-500/10 text-emerald-500",
            )}
          >
            {isOver ? "Pasaste el límite" : isNear ? "Cerca del límite" : "Dentro del límite"}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="text-text-muted">
              <span className="font-semibold text-text-primary text-[14px]">{used.toLocaleString("es-CL")}</span>
              {" / "}
              {limit.toLocaleString("es-CL")} conversaciones
            </span>
            <span className={cn("font-medium", isOver ? "text-red-500" : "text-text-muted")}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-bg-hover overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOver ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-accent",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

      </div>

      {/* Overage alert (active period) */}
      {isOver && (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-red-500">
              Llevas {overageCount.toLocaleString("es-CL")} conversación{overageCount === 1 ? "" : "es"} extra este mes
            </p>
            <p className="text-[12px] text-text-secondary">
              Se agregará un cobro estimado de{" "}
              <span className="font-semibold text-text-primary">{formatCLP(overageAmount)}</span>{" "}
              a tu próxima mensualidad.
            </p>
          </div>
        </div>
      )}

      {/* Overage history */}
      {overages && overages.length > 0 && (
        <div className="p-4 rounded-2xl bg-bg-secondary border border-border-secondary">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3">Historial de cobros extra</h3>
          <div className="space-y-2">
            {overages.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-[12px] py-1.5 border-b border-border-secondary last:border-0">
                <div className="flex flex-col">
                  <span className="text-text-primary font-medium">{formatDate(o.period_start)}</span>
                  <span className="text-[10px] text-text-muted">
                    {o.overage_count} extra · {o.conversations_count} / {o.plan_limit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-semibold">{formatCLP(o.amount_clp)}</span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      o.status === "charged"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : o.status === "pending"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {o.status === "charged" ? "Cobrado" : o.status === "pending" ? "Pendiente" : "Falló"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
