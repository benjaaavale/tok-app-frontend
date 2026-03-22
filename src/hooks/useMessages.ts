"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Message } from "@/types/api";

export function useMessages(conversationId: number | null) {
  const { getToken } = useAuth();

  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await authFetch(
        `/conversations/${conversationId}/messages`,
        {},
        () => getToken()
      );
      return res.json();
    },
    enabled: !!conversationId,
  });
}
