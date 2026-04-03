"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSubscription } from "@/hooks/useSubscription";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import type { PlanKey } from "@/types/api";

const PLAN_DETAILS: {
  id: PlanKey;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$119.990",
    description: "Ideal para pequenos negocios y startups que buscan empezar con IA.",
    features: [
      "Acceso al Agente IA",
      "Conecta 1 numero de WhatsApp",
      "Alimentacion manual de documentos",
      "Hasta 500 conversaciones/mes",
    ],
    cta: "Comenzar",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$309.990",
    description: "El mejor valor para negocios listos para escalar sus ventas.",
    popular: true,
    features: [
      "Todo lo de Starter, mas:",
      "Conecta hasta 2 numeros de WhatsApp",
      "Sincronizacion con Google Calendar",
      "Agendamiento y Reagendamiento Automatico",
      "Calendarios para Multiples Trabajadores",
      "Hasta 2.000 conversaciones/mes",
    ],
    cta: "Comenzar",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$544.990",
    description: "Plan avanzado con limites personalizados y soporte prioritario.",
    features: [
      "Todo lo de Pro, mas:",
      "Hasta 5.000 conversaciones/mes",
      "Integraciones Personalizadas (CRMs)",
      "Manager de Cuenta Dedicado",
      "Soporte Prioritario 24/7",
    ],
    cta: "Comenzar",
  },
];

export default function PlansPage() {
  const createSubscription = useCreateSubscription();
  const { subscriptionStatus } = useAuthStore();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  // If user already has active subscription, let them go to dashboard
  const isActive = subscriptionStatus === "active";

  const handleSelectPlan = async (planId: PlanKey) => {
    setLoadingPlan(planId);
    try {
      const data = await createSubscription.mutateAsync(planId);
      if (data.url) {
        // Redirect to VentiPay checkout
        window.location.href = data.url;
      } else {
        toast.error("No se obtuvo URL de pago");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear suscripcion");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-bg-primary">
      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="flex items-center justify-center mb-4">
          <img src="/favicon.png" alt="ToK" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Elige tu plan
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Automatiza tus ventas por WhatsApp con agentes IA. Todos los planes incluyen acceso completo al Agente IA.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {PLAN_DETAILS.map((plan) => (
          <div
            key={plan.id}
            className="relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg"
            style={{
              background: "var(--bg-primary)",
              borderColor: plan.popular ? "var(--accent)" : "var(--border-secondary)",
              borderWidth: plan.popular ? 2 : 1,
            }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wider"
                style={{ background: "var(--accent)" }}
              >
                Mas Popular
              </div>
            )}

            {/* Plan name */}
            <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {plan.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                {plan.price}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mes + IVA</span>
            </div>

            {/* Description */}
            <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
              {plan.description}
            </p>

            {/* Divider */}
            <div className="h-px mb-4" style={{ background: "var(--border-secondary)" }} />

            {/* Features header */}
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>
              Incluye:
            </p>

            {/* Features list */}
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: "var(--accent)" }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: plan.popular ? "var(--accent)" : "transparent",
                color: plan.popular ? "#fff" : "var(--text-primary)",
                border: plan.popular ? "none" : "1px solid var(--border-secondary)",
              }}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Already subscribed */}
      {isActive && (
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 text-sm font-medium underline"
          style={{ color: "var(--accent)" }}
        >
          Ya tengo un plan activo, ir al dashboard
        </button>
      )}
    </div>
  );
}
