"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

export interface AgentTemplate {
  id: string;
  icon: string;
  name: string;
  category: "ventas" | "agendamiento" | "soporte" | "vertical";
  short_description: string;
  long_description: string;
  defaults: {
    name: string;
    description: string;
    instructions: string;
    can_schedule: boolean;
    use_knowledge: boolean;
  };
}

export function useAgentTemplates() {
  const { getToken } = useAuth();
  return useQuery<AgentTemplate[]>({
    queryKey: ["agentTemplates"],
    queryFn: async () => {
      const res = await authFetch("/agents/templates", {}, () => getToken());
      return res.json();
    },
    staleTime: Infinity,
  });
}
