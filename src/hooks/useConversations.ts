"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Conversation } from "@/types/api";

export function useConversations() {
  const { getToken } = useAuth();

  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await authFetch("/conversations", {}, () => getToken());
      return res.json();
    },
  });
}
