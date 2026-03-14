import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import type { ServiceType } from "@/types/api";

export function useServiceTypes() {
  const { getToken } = useAuth();
  return useQuery<ServiceType[]>({
    queryKey: ["service-types"],
    queryFn: async () => {
      const res = await authFetch("/service-types", {}, getToken);
      return res.json();
    },
  });
}

export function useCreateServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { nombre: string; duracion: number; worker_ids: number[] }) => {
      const res = await authFetch("/service-types", { method: "POST", body: JSON.stringify(data) }, getToken);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}

export function useUpdateServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; nombre: string; duracion: number; worker_ids: number[] }) => {
      const res = await authFetch(`/service-types/${id}`, { method: "PUT", body: JSON.stringify(data) }, getToken);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}

export function useDeleteServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`/service-types/${id}`, { method: "DELETE" }, getToken);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}
