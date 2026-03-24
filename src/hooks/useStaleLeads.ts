"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { StaleLead } from "@/types/api";

export function useStaleLeads() {
  const { getToken } = useAuth();
  return useQuery<StaleLead[]>({
    queryKey: ["stale-leads"],
    queryFn: async () => {
      const res = await authFetch("/leads/stale", {}, () => getToken());
      return res.json();
    },
    refetchInterval: 60000,
  });
}
