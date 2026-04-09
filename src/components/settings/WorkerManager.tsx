"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkers } from "@/hooks/useWorkers";
import { authFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SettingsSection } from "./SettingsSection";
import { WORKER_COLORS } from "@/lib/constants";
import { Trash2, UserPlus, Mail, Check, MessageCircle, CalendarDays } from "lucide-react";

export function WorkerManager() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: workers, isLoading } = useWorkers();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newColor, setNewColor] = useState(WORKER_COLORS[0]);

  const inviteWorker = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error("Nombre requerido");
      if (!newEmail.trim()) throw new Error("Email requerido");
      const res = await authFetch(
        "/admin/invite-worker",
        {
          method: "POST",
          body: JSON.stringify({
            nombre: newName.trim(),
            email: newEmail.trim(),
            color: newColor,
          }),
        },
        () => getToken()
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error invitando worker");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      setNewName("");
      setNewEmail("");
      setNewColor(WORKER_COLORS[0]);
      setShowForm(false);
      toast.success("Trabajador invitado. Se envió un email de invitación.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleCalendarPermission = useMutation({
    mutationFn: async ({ id, canViewAll }: { id: number; canViewAll: boolean }) => {
      const res = await authFetch(
        `/workers/${id}/calendar-permission`,
        {
          method: "PUT",
          body: JSON.stringify({ can_view_all_calendar: canViewAll }),
        },
        () => getToken()
      );
      if (!res.ok) throw new Error("Error actualizando permiso de calendario");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleChatPermission = useMutation({
    mutationFn: async ({ id, canRespond }: { id: number; canRespond: boolean }) => {
      const res = await authFetch(
        `/workers/${id}/chat-permission`,
        {
          method: "PUT",
          body: JSON.stringify({ can_respond_chats: canRespond }),
        },
        () => getToken()
      );
      if (!res.ok) throw new Error("Error actualizando permiso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteWorker = useMutation({
    mutationFn: async (id: number) => {
      await authFetch(`/workers/${id}`, { method: "DELETE" }, () => getToken());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Trabajador eliminado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="h-[200px] bg-bg-secondary rounded-2xl animate-pulse" />
    );
  }

  return (
    <SettingsSection
      title="Equipo"
      description="Gestiona los trabajadores y asignación de citas"
    >
      {/* Worker list */}
      <div className="space-y-2">
        {workers && workers.length > 0 ? (
          workers.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-bg-primary rounded-xl border border-border-secondary"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: w.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-text-primary">
                  {w.nombre}
                </p>
                <p className="text-[10px] text-text-muted truncate">
                  {w.email || w.calcom_email || "Sin email"}
                </p>
              </div>
              {w.user_id ? (
                <span className="flex items-center gap-1 text-[10px] text-success px-2 py-0.5 rounded-full bg-success/10">
                  <Check size={10} />
                  Cuenta activa
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-bg-secondary">
                  <Mail size={10} />
                  Invitado
                </span>
              )}
              <button
                onClick={() => toggleChatPermission.mutate({ id: w.id, canRespond: !w.can_respond_chats })}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-all",
                  w.can_respond_chats
                    ? "text-accent bg-accent/10"
                    : "text-text-muted bg-bg-secondary"
                )}
                title={w.can_respond_chats ? "Puede responder chats" : "Sin acceso a chats"}
              >
                <MessageCircle size={10} />
                {w.can_respond_chats ? "Chats" : "Sin chats"}
              </button>
              <button
                onClick={() => toggleCalendarPermission.mutate({ id: w.id, canViewAll: !w.can_view_all_calendar })}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-all",
                  w.can_view_all_calendar
                    ? "text-emerald-600 bg-emerald-500/10"
                    : "text-text-muted bg-bg-secondary"
                )}
                title={w.can_view_all_calendar ? "Ve todas las agendas" : "Solo su agenda"}
              >
                <CalendarDays size={10} />
                {w.can_view_all_calendar ? "Agenda global" : "Solo suya"}
              </button>
              <button
                onClick={async () => {
                  const ok = await confirm({
                    title: "Eliminar miembro",
                    description: `¿Eliminar a ${w.nombre} del equipo?`,
                    confirmText: "Eliminar",
                    variant: "danger",
                  });
                  if (ok) deleteWorker.mutate(w.id);
                }}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-[12px] text-text-muted text-center py-4">
            No hay trabajadores registrados
          </p>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <div className="mt-3 p-3 bg-bg-primary rounded-xl border border-border-secondary space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del trabajador"
            className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email del trabajador"
            className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <div className="flex gap-1.5 flex-wrap">
            {WORKER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${
                  newColor === c
                    ? "ring-2 ring-offset-2 ring-offset-bg-primary ring-accent scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <p className="text-[10px] text-text-muted">
            Se enviará un email de invitación para que el trabajador cree su cuenta.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => inviteWorker.mutate()}
              disabled={inviteWorker.isPending}
              className="flex-1 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {inviteWorker.isPending ? "Invitando..." : "Invitar trabajador"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary text-[12px] hover:bg-bg-hover transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-bg-primary border border-border-secondary text-[12px] font-medium text-text-primary hover:bg-bg-hover transition-all"
        >
          <UserPlus size={13} />
          Invitar trabajador
        </button>
      )}
    </SettingsSection>
  );
}
