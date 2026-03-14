import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import type { ServiceType } from "@/types/api";

export function useServiceTypes() {
  const { getToken } = useAuth();
  return useQuery<ServiceType[]>({
    queryKey: ["service-types"],
    queryFn: () => authFetch("/service-types", {}, getToken),
  });
}

export function useCreateServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; duracion: number; worker_ids: number[] }) =>
      authFetch("/service-types", { method: "POST", body: JSON.stringify(data) }, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}

export function useUpdateServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; nombre: string; duracion: number; worker_ids: number[] }) =>
      authFetch(`/service-types/${id}`, { method: "PUT", body: JSON.stringify(data) }, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}

export function useDeleteServiceType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      authFetch(`/service-types/${id}`, { method: "DELETE" }, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-types"] }),
  });
}
