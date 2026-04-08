"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { Agent } from "@/types/api";

export function useAgents() {
  const { getToken } = useAuth();
  return useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await authFetch("/agents", {}, () => getToken());
      return res.json();
    },
  });
}

export function useCreateAgent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Agent>) => {
      const res = await authFetch(
        "/agents",
        { method: "POST", body: JSON.stringify(data) },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creando agente");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Agent> & { id: number }) => {
      const res = await authFetch(
        `/agents/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error actualizando agente");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useDeleteAgent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(
        `/agents/${id}`,
        { method: "DELETE" },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error eliminando agente");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useGenerateAgentPrompt() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: number) => {
      const res = await authFetch(
        `/agents/${agentId}/generate`,
        { method: "POST" },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error generando prompt");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
