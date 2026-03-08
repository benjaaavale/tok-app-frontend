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

export function CompanySettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();

  const [nombre, setNombre] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [diasLaborales, setDiasLaborales] = useState("");

  useEffect(() => {
    if (settings) {
      setNombre(settings.company_nombre || "");
      setHorarioInicio(settings.horario_inicio || "");
      setHorarioFin(settings.horario_fin || "");
      setDiasLaborales(settings.dias_laborales || "");
    }
  }, [settings]);

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
            dias_laborales: diasLaborales,
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
          <InputField
            id="dias-laborales"
            value={diasLaborales}
            onChange={setDiasLaborales}
            placeholder="lunes a viernes"
          />
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
