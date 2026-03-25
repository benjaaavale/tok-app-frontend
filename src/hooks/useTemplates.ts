"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { WhatsAppTemplate } from "@/types/api";

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
    mutationFn: async (body: { name: string; category: string; language?: string; components: Array<{ type: string; text: string }> }) => {
      const res = await authFetch("/templates", {
        method: "POST",
        body: JSON.stringify(body),
      }, () => getToken());
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error creando plantilla" }));
        throw new Error(err.error || "Error creando plantilla");
      }
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
    mutationFn: async ({ name, language, components }: { name: string; language: string; components: Array<{ type: string; text: string }> }) => {
      const res = await authFetch(`/templates/${name}/${language}`, {
        method: "PATCH",
        body: JSON.stringify({ components }),
      }, () => getToken());
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error editando plantilla" }));
        throw new Error(err.error || "Error editando plantilla");
      }
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
      const res = await authFetch(`/templates/${name}`, {
        method: "DELETE",
      }, () => getToken());
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error eliminando plantilla" }));
        throw new Error(err.error || "Error eliminando plantilla");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
