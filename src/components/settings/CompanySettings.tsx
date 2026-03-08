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
  const [botAutoDesactivar, setBotAutoDesactivar] = useState(false);

  useEffect(() => {
    if (settings) {
      setNombre(settings.company_nombre || "");
      setHorarioInicio(settings.horario_inicio || "");
      setHorarioFin(settings.horario_fin || "");
      setDiasLaborales(settings.dias_laborales || "");
      setBotAutoDesactivar(settings.bot_auto_desactivar || false);
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
            bot_auto_desactivar: botAutoDesactivar,
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
      description="Nombre, horarios y comportamiento del bot"
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

        <FieldRow label="Bot auto-desactivar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBotAutoDesactivar(!botAutoDesactivar)}
              className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                botAutoDesactivar ? "bg-accent" : "bg-border-primary"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  botAutoDesactivar ? "left-[20px]" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-[11px] text-text-muted">
              Desactivar bot al responder manualmente
            </span>
          </div>
        </FieldRow>
      </div>

      <div className="pt-3 border-t border-border-secondary mt-3">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
        >
          <Save size={13} />
          {save.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </SettingsSection>
  );
}
