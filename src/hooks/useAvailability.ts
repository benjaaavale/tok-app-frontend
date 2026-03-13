"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

interface AvailabilityResponse {
  slots: string[];
  worker_id: string;
  fecha: string;
  message?: string;
}

export function useAvailability(workerId: number | null, fecha: string | null) {
  const { getToken } = useAuth();

  return useQuery<AvailabilityResponse>({
    queryKey: ["availability", workerId, fecha],
    queryFn: async () => {
      const res = await authFetch(
        `/availability?worker_id=${workerId}&fecha=${fecha}`,
        {},
        () => getToken()
      );
      return res.json();
    },
    enabled: !!workerId && !!fecha,
  });
}
