"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  SettingsSection,
  FieldRow,
  InputField,
} from "./SettingsSection";
import { Save } from "lucide-react";

const DIAS = [
  { key: "lunes", label: "Lun" },
  { key: "martes", label: "Mar" },
  { key: "miercoles", label: "Mié" },
  { key: "jueves", label: "Jue" },
  { key: "viernes", label: "Vie" },
  { key: "sabado", label: "Sáb" },
  { key: "domingo", label: "Dom" },
];

function parseDiasLaborales(str: string): string[] {
  if (!str) return [];
  // Support formats: "lunes,martes,miercoles" or "lunes a viernes"
  const lower = str.toLowerCase().trim();
  if (lower.includes(" a ")) {
    const parts = lower.split(" a ").map((s) => s.trim());
    const startIdx = DIAS.findIndex((d) => d.key === parts[0]);
    const endIdx = DIAS.findIndex((d) => d.key === parts[1]);
    if (startIdx >= 0 && endIdx >= 0) {
      return DIAS.slice(startIdx, endIdx + 1).map((d) => d.key);
    }
  }
  return lower.split(",").map((s) => s.trim()).filter(Boolean);
}

function serializeDiasLaborales(selected: string[]): string {
  return selected.join(",");
}

export function CompanySettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [nombre, setNombre] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [selectedDias, setSelectedDias] = useState<string[]>([]);

  useEffect(() => {
    if (settings) {
      setNombre(settings.company_nombre || "");
      setHorarioInicio(settings.horario_inicio || "");
      setHorarioFin(settings.horario_fin || "");
      setSelectedDias(parseDiasLaborales(settings.dias_laborales || ""));
    }
  }, [settings]);

  const toggleDia = (dia: string) => {
    setSelectedDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const save = useMutation({
    mutationFn: async () => {
      await authFetch(
        "/company/settings",
        {
          method: "PUT",
          body: JSON.stringify({
            nombre,
            horario_inicio: horarioInicio,
            horario_fin: horarioFin,
            dias_laborales: serializeDiasLaborales(selectedDias),
          }),
        },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      toast.success("Configuración guardada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-[200px] bg-bg-secondary rounded-2xl" />
      </div>
    );
  }

  return (
    <SettingsSection
      title="Empresa"
      description="Nombre y horarios de atención"
    >
      <div className="space-y-1">
        <FieldRow label="Nombre" htmlFor="company-name">
          <InputField
            id="company-name"
            value={nombre}
            onChange={setNombre}
            placeholder="Mi empresa"
          />
        </FieldRow>

        <FieldRow label="Horario inicio" htmlFor="horario-inicio">
          <InputField
            id="horario-inicio"
            value={horarioInicio}
            onChange={setHorarioInicio}
            type="time"
          />
        </FieldRow>

        <FieldRow label="Horario fin" htmlFor="horario-fin">
          <InputField
            id="horario-fin"
            value={horarioFin}
            onChange={setHorarioFin}
            type="time"
          />
        </FieldRow>

        <FieldRow label="Días laborales" htmlFor="dias-laborales">
          <div className="grid grid-cols-7 gap-1.5 w-full">
            {DIAS.map((dia) => {
              const isActive = selectedDias.includes(dia.key);
              return (
                <button
                  key={dia.key}
                  type="button"
                  onClick={() => toggleDia(dia.key)}
                  className={`py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "bg-bg-primary border border-border-secondary text-text-muted hover:border-accent/40 hover:text-text-secondary"
                  }`}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
        </FieldRow>
      </div>

      <div className="pt-3 border-t border-border-secondary mt-3">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium disabled:opacity-50"
        >
          <Save size={13} />
          {save.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </SettingsSection>
  );
}
