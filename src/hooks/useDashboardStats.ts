"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { DashboardStats } from "@/types/api";

export function useDashboardStats(from: string, to: string) {
  const { getToken } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", from, to],
    queryFn: async () => {
      const res = await authFetch(
        `/stats/dashboard?from=${from}&to=${to}`,
        {},
        () => getToken()
      );
      return res.json();
    },
    enabled: !!from && !!to,
  });
}
