"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { WhatsAppTemplate, TemplateComponent } from "@/types/api";

export function useTemplates() {
  const { getToken } = useAuth();
  return useQuery<WhatsAppTemplate[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await authFetch("/templates", {}, () => getToken());
      const data = await res.json();
      return data.items || data || [];
    },
  });
}

export function useCreateTemplate() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      category: string;
      language: string;
      components: TemplateComponent[];
    }) => {
      const res = await authFetch(
        "/templates",
        { method: "POST", body: JSON.stringify(payload) },
        () => getToken()
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useEditTemplate() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      language,
      components,
    }: {
      name: string;
      language: string;
      components: TemplateComponent[];
    }) => {
      const res = await authFetch(
        `/templates/${name}/${language}`,
        { method: "PATCH", body: JSON.stringify({ components }) },
        () => getToken()
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await authFetch(
        `/templates/${name}`,
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
