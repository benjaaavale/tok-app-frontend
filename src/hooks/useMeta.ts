"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

export function useMetaStatus() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["meta-status"],
    queryFn: async () => {
      const res = await authFetch("/meta/status", {}, () => getToken());
      return res.json();
    },
  });
}

export function useConnectMeta() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch("/auth/meta/url", {}, () => getToken());
      const data = await res.json();
      window.location.href = data.url;
    },
  });
}

export function useDisconnectMeta() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authFetch("/auth/meta/disconnect", { method: "DELETE" }, () => getToken());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meta-status"] }),
  });
}

export function useConnectInstagram() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch("/auth/instagram/url", {}, () => getToken());
      const data = await res.json();
      window.location.href = data.url;
    },
  });
}

export function useDisconnectInstagram() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authFetch("/auth/instagram/disconnect", { method: "DELETE" }, () => getToken());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meta-status"] }),
  });
}

export function useMetaBotSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { bot_enabled_messenger?: boolean; bot_enabled_instagram?: boolean }) => {
      await authFetch("/meta/bot-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      }, () => getToken());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meta-status"] }),
  });
}
