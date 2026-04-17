"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Plan, PlanKey, SubscriptionInfo, BillingOverage } from "@/types/api";

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.tok-ai.cl"}/plans`);
      return res.json();
    },
  });
}

export function useCreateSubscription() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ plan, billing }: { plan: PlanKey; billing: "monthly" | "annual" }) => {
      const res = await authFetch(
        "/subscriptions/create",
        { method: "POST", body: JSON.stringify({ plan, billing }) },
        () => getToken()
      );
      return res.json();
    },
  });
}

export function useSubscription() {
  const { getToken } = useAuth();
  return useQuery<SubscriptionInfo>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await authFetch("/subscription", {}, () => getToken());
      return res.json();
    },
  });
}

export function useBillingOverages() {
  const { getToken } = useAuth();
  return useQuery<BillingOverage[]>({
    queryKey: ["billing-overages"],
    queryFn: async () => {
      const res = await authFetch("/billing/overages", {}, () => getToken());
      return res.json();
    },
  });
}
