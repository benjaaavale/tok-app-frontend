"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { AgentConfig } from "@/types/api";

export function useAgentConfig() {
  const { getToken } = useAuth();
  return useQuery<AgentConfig>({
    queryKey: ["agentConfig"],
    queryFn: async () => {
      const res = await authFetch("/agent/config", {}, () => getToken());
      return res.json();
    },
  });
}

export function useUpdateAgentConfig() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AgentConfig>) => {
      await authFetch(
        "/agent/config",
        { method: "PUT", body: JSON.stringify(data) },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentConfig"] });
    },
  });
}
