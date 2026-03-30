"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { AgentConfig } from "@/types/api";

export function useAgentConfig(phoneSlot: number = 1) {
  const { getToken } = useAuth();
  return useQuery<AgentConfig>({
    queryKey: ["agent-config", phoneSlot],
    queryFn: async () => {
      const res = await authFetch(
        `/agent/config?phone_slot=${phoneSlot}`,
        {},
        () => getToken()
      );
      return res.json();
    },
  });
}

export function useUpdateAgentConfig(phoneSlot: number = 1) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AgentConfig>) => {
      await authFetch(
        "/agent/config",
        { method: "PUT", body: JSON.stringify({ ...data, phone_slot: phoneSlot }) },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-config", phoneSlot] });
    },
  });
}

export function useGenerateAgent(phoneSlot: number = 1) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user_description,
      agent_type,
    }: {
      user_description: string;
      agent_type: "informativo" | "soporte";
    }) => {
      const res = await authFetch(
        "/agent/generate",
        {
          method: "POST",
          body: JSON.stringify({ user_description, agent_type, phone_slot: phoneSlot }),
        },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error generando agente" }));
        throw new Error(err.error || "Error generando agente");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-config", phoneSlot] });
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
    },
  });
}
