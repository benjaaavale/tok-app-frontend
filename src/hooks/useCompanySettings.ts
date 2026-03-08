"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import type { CompanySettings } from "@/types/api";

interface SettingsResponse extends CompanySettings {
  company_nombre: string;
  email: string;
}

export function useCompanySettings() {
  const { getToken } = useAuth();

  return useQuery<SettingsResponse>({
    queryKey: ["companySettings"],
    queryFn: async () => {
      const res = await authFetch("/company/settings", {}, () => getToken());
      return res.json();
    },
  });
}
