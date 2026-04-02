"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { Users, RefreshCw } from "lucide-react";

export function WorkerAssignmentSettings() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useCompanySettings();

  const [mode, setMode] = useState<"ask_client" | "round_robin">("ask_client");

  useEffect(() => {
    if (settings?.worker_assignment_mode) {
      setMode(settings.worker_assignment_mode as "ask_client" | "round_robin");
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async (newMode: "ask_client" | "round_robin") => {
      await authFetch(
        "/company/settings",
        { method: "PUT", body: JSON.stringify({ worker_assignment_mode: newMode }) },
        () => getToken()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSelect = (newMode: "ask_client" | "round_robin") => {
    setMode(newMode);
    save.mutate(newMode);
  };

  const options = [
    {
      value: "ask_client" as const,
      icon: Users,
      label: "El cliente elige",
      description: "El agente pregunta al cliente con quien prefiere atenderse",
    },
    {
      value: "round_robin" as const,
      icon: RefreshCw,
      label: "Asignacion automatica",
      description: "Se asigna al profesional con menos citas ese dia (round robin)",
    },
  ];

  return (
    <SettingsSection
      title="Asignacion de profesional"
      description="Define como se asigna el profesional al agendar una cita"
    >
      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = mode === opt.value;
          return (
            <label
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                selected
                  ? "border-accent bg-accent/5"
                  : "border-border-secondary bg-bg-primary hover:bg-bg-hover"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? "border-accent" : "border-border-secondary"
                }`}
              >
                {selected && <div className="w-2 h-2 rounded-full bg-accent" />}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{opt.label}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{opt.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </SettingsSection>
  );
}
