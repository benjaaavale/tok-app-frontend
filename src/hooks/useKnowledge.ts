"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { KnowledgeDocument } from "@/types/api";

export function useKnowledgeDocuments() {
  const { getToken } = useAuth();
  return useQuery<KnowledgeDocument[]>({
    queryKey: ["knowledgeDocuments"],
    queryFn: async () => {
      const res = await authFetch("/knowledge/documents", {}, () => getToken());
      return res.json();
    },
  });
}

export function useUploadDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tok-ai.cl";
      const res = await fetch(`${API_URL}/knowledge/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error subiendo documento" }));
        throw new Error(err.error || "Error subiendo documento");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
  });
}

export function useAddKnowledgeText() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, name }: { text: string; name?: string }) => {
      const res = await authFetch(
        "/knowledge/text",
        { method: "POST", body: JSON.stringify({ text, name }) },
        () => getToken()
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
  });
}

export function useImportWebsite() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      const res = await authFetch(
        "/knowledge/website",
        { method: "POST", body: JSON.stringify({ url }) },
        () => getToken()
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
  });
}

export function useDeleteDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await authFetch(
        `/knowledge/documents/${id}`,
        { method: "DELETE" },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
  });
}
