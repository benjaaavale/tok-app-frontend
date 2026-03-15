"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

interface CreateAppointmentData {
  contact_id: number;
  worker_id: number;
  event_type?: string;
  fecha: string;
  hora: string;
  duracion?: number;
  notas?: string;
  client_email?: string;
}

export function useCreateAppointment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const res = await authFetch(
        "/appointments",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        () => getToken()
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creando cita");
      }
      return res.json();
    },
    onSuccess: () => {
      // Force immediate refetch of all active appointment queries
      queryClient.refetchQueries({ queryKey: ["appointments"], type: "active" });
    },
  });
}
