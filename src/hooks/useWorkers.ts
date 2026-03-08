"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Worker } from "@/types/api";

export function useWorkers() {
  const { getToken } = useAuth();

  return useQuery<Worker[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await authFetch("/workers", {}, () => getToken());
      return res.json();
    },
  });
}
