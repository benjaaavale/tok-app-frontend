"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

export interface KnowledgeSection {
  id: number;
  title: string;
  description: string;
  content: string;
  always_include: boolean;
  display_order: number;
  created_at: string;
}

export function useKnowledgeSections() {
  const { getToken } = useAuth();
  return useQuery<KnowledgeSection[]>({
    queryKey: ["knowledgeSections"],
    queryFn: async () => {
      const res = await authFetch("/knowledge/sections", {}, () => getToken());
      return res.json();
    },
  });
}

export function useCreateKnowledgeSection() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<KnowledgeSection, "id" | "created_at">) => {
      const res = await authFetch(
        "/knowledge/sections",
        { method: "POST", body: JSON.stringify(data) },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creando sección");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledgeSections"] }),
  });
}

export function useUpdateKnowledgeSection() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<KnowledgeSection> & { id: number }) => {
      const res = await authFetch(
        `/knowledge/sections/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        () => getToken()
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error actualizando sección");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledgeSections"] }),
  });
}

export function useDeleteKnowledgeSection() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await authFetch(`/knowledge/sections/${id}`, { method: "DELETE" }, () => getToken());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledgeSections"] }),
  });
}
