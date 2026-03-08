"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Contact } from "@/types/api";

export function useContact(phone: string | null) {
  const { getToken } = useAuth();

  return useQuery<Contact>({
    queryKey: ["contact", phone],
    queryFn: async () => {
      const res = await authFetch(
        `/contacts/${encodeURIComponent(phone!)}`,
        {},
        () => getToken()
      );
      return res.json();
    },
    enabled: !!phone,
  });
}
