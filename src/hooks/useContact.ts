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
      const data = await res.json();
      // Backend returns { contact, next_appointment, history }
      // Flatten into a single Contact object
      return {
        ...data.contact,
        next_appointment: data.next_appointment ?? null,
        history: data.history ?? [],
      } as Contact;
    },
    enabled: !!phone,
  });
}
