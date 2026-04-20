"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Conversation } from "@/types/api";

export function useConversations(filter?: "support") {
  const { getToken } = useAuth();

  return useQuery<Conversation[]>({
    queryKey: ["conversations", filter ?? "all"],
    queryFn: async () => {
      const url = filter ? `/conversations?filter=${filter}` : "/conversations";
      const res = await authFetch(url, {}, () => getToken());
      return res.json();
    },
  });
}
