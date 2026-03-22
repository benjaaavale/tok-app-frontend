"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Appointment } from "@/types/api";

export function useAppointments(from?: string, to?: string) {
  const { getToken } = useAuth();

  return useQuery<Appointment[]>({
    queryKey: ["appointments", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      const res = await authFetch(
        `/appointments${qs ? `?${qs}` : ""}`,
        {},
        () => getToken()
      );
      return res.json();
    },
    // Real-time updates via Socket.IO (appointment_update event)
  });
}
