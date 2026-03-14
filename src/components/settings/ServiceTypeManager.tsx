"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { useWorkers } from "@/hooks/useWorkers";
import {
  useServiceTypes,
  useCreateServiceType,
  useUpdateServiceType,
  useDeleteServiceType,
} from "@/hooks/useServiceTypes";
import { Trash2, Plus, Pencil, Clock, Check, X } from "lucide-react";
import type { ServiceType } from "@/types/api";

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

function ServiceTypeForm({
  initial,
  workerOptions,
  onSave,
  onCancel,
  loading,
}: {
  initial?: Partial<ServiceType>;
  workerOptions: { id: number; nombre: string }[];
  onSave: (data: { nombre: string; duracion: number; worker_ids: number[] }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [duracion, setDuracion] = useState(initial?.duracion || 30);
  const [workerIds, setWorkerIds] = useState<number[]>(initial?.worker_ids || []);

  const toggleWorker = (id: number) =>
    setWorkerIds((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));

  return (
    <div className="bg-bg-primary border border-border-secondary rounded-xl p-4 space-y-3">
      <div>
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
          Nombre del servicio *
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Consulta inicial, Control, Evaluación..."
          className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
          Duración
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuracion(d)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                duracion === d
                  ? "bg-accent text-white"
                  : "bg-bg-secondary border border-border-secondary text-text-primary hover:bg-bg-hover"
              }`}
            >
              <Clock size={10} />
              {d} min
            </button>
          ))}
        </div>
      </div>
      {workerOptions.length > 0 && (
        <div>
          <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
            Trabajadores que pueden realizar este servicio
          </label>
          <div className="flex flex-wrap gap-1.5">
            {workerOptions.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWorker(w.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  workerIds.includes(w.id)
                    ? "bg-accent text-white"
                    : "bg-bg-secondary border border-border-secondary text-text-primary hover:bg-bg-hover"
                }`}
              >
                {workerIds.includes(w.id) && <Check size={10} />}
                {w.nombre}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            Si no seleccionas ninguno, el servicio estará disponible para todos.
          </p>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            if (!nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
            onSave({ nombre: nombre.trim(), duracion, worker_ids: workerIds });
          }}
          disabled={loading}
          className="btn-gradient px-4 py-2 rounded-lg text-[12px] font-medium disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-bg-secondary border border-border-secondary text-[12px] text-text-secondary hover:bg-bg-hover transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function ServiceTypeManager() {
  const { data: serviceTypes, isLoading } = useServiceTypes();
  const { data: workers } = useWorkers();
  const createST = useCreateServiceType();
  const updateST = useUpdateServiceType();
  const deleteST = useDeleteServiceType();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const workerOptions = workers?.map((w) => ({ id: w.id, nombre: w.nombre })) || [];

  const workerName = (id: number) => workers?.find((w) => w.id === id)?.nombre || `#${id}`;

  return (
    <SettingsSection title="Tipos de servicio" description="Define los servicios que ofreces, su duración y qué trabajadores los realizan.">
      <div className="space-y-3">
        {isLoading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-primary border-t-accent mx-auto" />
        ) : serviceTypes && serviceTypes.length > 0 ? (
          serviceTypes.map((st) =>
            editingId === st.id ? (
              <ServiceTypeForm
                key={st.id}
                initial={st}
                workerOptions={workerOptions}
                loading={updateST.isPending}
                onCancel={() => setEditingId(null)}
                onSave={(data) => {
                  updateST.mutate(
                    { id: st.id, ...data },
                    {
                      onSuccess: () => { toast.success("Servicio actualizado"); setEditingId(null); },
                      onError: () => toast.error("Error al actualizar"),
                    }
                  );
                }}
              />
            ) : (
              <div
                key={st.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-primary border border-border-secondary"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text-primary">{st.nombre}</span>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock size={10} />
                      {st.duracion} min
                    </span>
                  </div>
                  {st.worker_ids && st.worker_ids.length > 0 && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {st.worker_ids.map(workerName).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <button
                    onClick={() => setEditingId(st.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      deleteST.mutate(st.id, {
                        onSuccess: () => toast.success("Servicio eliminado"),
                        onError: () => toast.error("Error al eliminar"),
                      });
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          )
        ) : (
          <p className="text-[12px] text-text-muted">No hay tipos de servicio creados aún.</p>
        )}

        {showForm ? (
          <ServiceTypeForm
            workerOptions={workerOptions}
            loading={createST.isPending}
            onCancel={() => setShowForm(false)}
            onSave={(data) => {
              createST.mutate(data, {
                onSuccess: () => { toast.success("Servicio creado"); setShowForm(false); },
                onError: () => toast.error("Error al crear servicio"),
              });
            }}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border-secondary text-[12px] text-text-muted hover:text-accent hover:border-accent hover:bg-accent/5 transition-all w-full justify-center"
          >
            <Plus size={14} />
            Agregar servicio
          </button>
        )}
      </div>
    </SettingsSection>
  );
}
