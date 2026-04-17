"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSubscription } from "@/hooks/useSubscription";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Check, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanKey } from "@/types/api";

// ─── Descuentos anuales canónicos ───────────────────────────────────────────
// Starter 15% · Pro 20% · Enterprise 23%
// priceAnnual se DERIVA de priceMonthly × (1 − discountPct/100), redondeado a
// la decena más cercana. Si cambias priceMonthly, el precio anual se recalcula
// automáticamente manteniendo el mismo porcentaje de descuento.
// ────────────────────────────────────────────────────────────────────────────
function annualPrice(monthly: number, discountPct: number) {
  return Math.round(monthly * (1 - discountPct / 100) / 10) * 10;
}

const PLAN_BASE: {
  id: PlanKey;
  name: string;
  priceMonthly: number;
  discountPct: number;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 119990,
    discountPct: 15,
    description: "Ideal para pequeños negocios y startups que buscan empezar con IA.",
    features: [
      "Acceso al Agente IA",
      "Conecta 1 número de WhatsApp",
      "Alimentación manual de documentos",
      "Hasta 500 conversaciones/mes",
    ],
    cta: "Comenzar",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 254990,
    discountPct: 20,
    description: "El mejor valor para negocios listos para escalar sus ventas.",
    popular: true,
    features: [
      "Todo lo de Starter, más:",
      "Conecta hasta 2 números de WhatsApp",
      "Sincronización con Google Calendar",
      "Agendamiento y Reagendamiento Automático",
      "Calendarios para Múltiples Trabajadores",
      "Hasta 2.000 conversaciones/mes",
    ],
    cta: "Comenzar",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 499990,
    discountPct: 23,
    description: "Plan avanzado con límites extendidos y soporte prioritario.",
    features: [
      "Todo lo de Pro, más:",
      "Hasta 5.000 conversaciones/mes",
      "Integraciones Personalizadas (CRMs)",
      "Ejecutivo de Cuenta Dedicado",
      "Soporte Prioritario 24/7",
    ],
    cta: "Comenzar",
  },
];

const PLAN_DETAILS = PLAN_BASE.map((p) => ({
  ...p,
  priceAnnual: annualPrice(p.priceMonthly, p.discountPct),
}));

function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

export default function PlansPage() {
  const createSubscription = useCreateSubscription();
  const { subscriptionStatus } = useAuthStore();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const isActive = subscriptionStatus === "active";

  const handleSelectPlan = async (planId: PlanKey) => {
    setLoadingPlan(planId);
    try {
      const data = await createSubscription.mutateAsync(planId);
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No se obtuvo URL de pago");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear suscripción");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-bg-primary">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="flex items-center justify-center mb-4">
          <img src="/favicon.png" alt="ToK" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-text-primary">
          Elige tu plan
        </h1>
        <p className="text-sm text-text-muted">
          Automatiza tus ventas por WhatsApp con agentes IA. Todos los planes incluyen acceso completo al Agente IA.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-border-secondary bg-bg-secondary mb-8">
        <button
          onClick={() => setBilling("monthly")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all",
            billing === "monthly"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          Mensual
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5",
            billing === "annual"
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          Anual
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              billing === "annual"
                ? "bg-white/20 text-white"
                : "bg-emerald-500/15 text-emerald-500"
            )}
          >
            Ahorra hasta 23%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {PLAN_DETAILS.map((plan) => {
          const displayPrice = billing === "annual" ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg",
                plan.popular ? "border-[var(--accent)] border-2" : "border-border-secondary"
              )}
              style={{ background: "var(--bg-primary)" }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wider"
                  style={{ background: "var(--accent)" }}
                >
                  Más Popular
                </div>
              )}

              {/* Plan name */}
              <h2 className="text-lg font-semibold mb-1 text-text-primary">
                {plan.name}
              </h2>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">
                    {formatCLP(displayPrice)}
                  </span>
                  <span className="text-sm text-text-muted">/mes + IVA</span>
                </div>
                {billing === "annual" && plan.discountPct > 0 && (
                  <span className="mb-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                    −{plan.discountPct}%
                  </span>
                )}
              </div>

              {/* Annual billing note */}
              {billing === "annual" ? (
                <p className="text-[11px] text-text-muted mb-3">
                  Facturado anualmente ({formatCLP(displayPrice * 12)}/año)
                </p>
              ) : (
                <p className="text-[11px] text-text-muted mb-3">
                  Facturado mensualmente
                </p>
              )}

              {/* Description */}
              <p className="text-xs text-text-muted mb-5">
                {plan.description}
              </p>

              {/* Divider */}
              <div className="h-px mb-4 bg-border-secondary" />

              {/* Features header */}
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-text-primary">
                Incluye:
              </p>

              {/* Features list */}
              <ul className="space-y-2.5 flex-1 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: "var(--accent)" }}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Overage note */}
              <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary mb-5">
                <Zap size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-muted leading-snug">
                  Conversaciones extra sobre el límite:{" "}
                  <span className="font-semibold text-text-primary">$300 c/u</span>
                  {" "}se cobran en la próxima mensualidad.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingPlan !== null}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                  plan.popular
                    ? "text-white"
                    : "border border-border-secondary text-text-primary hover:bg-bg-secondary"
                )}
                style={plan.popular ? { background: "var(--accent)" } : undefined}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Already subscribed */}
      {isActive && (
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 text-sm font-medium underline"
          style={{ color: "var(--accent)" }}
        >
          Ya tengo un plan activo, ir al inicio
        </button>
      )}
    </div>
  );
}
