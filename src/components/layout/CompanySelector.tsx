"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthStore } from "@/stores/auth-store";
import { authFetch } from "@/lib/api";
import { Search, Building2, X } from "lucide-react";

interface Company {
  id: number;
  nombre: string;
  plan: string;
  subscription_status: string;
  user_count: number;
  conversation_count: number;
}

export function CompanySelector() {
  const { isSuperadmin, impersonatingCompanyId, setImpersonating } = useAuthStore();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!isSuperadmin) return null;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch companies on open or search change
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/admin/companies?q=${encodeURIComponent(search)}`, {}, getToken);
        const data = await res.json();
        setCompanies(data);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, search, getToken]);

  return (
    <div ref={ref} className="px-3 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] font-medium text-red-500 hover:bg-red-500/20 transition-all"
      >
        <Building2 size={13} />
        <span className="truncate flex-1 text-left">
          {impersonatingCompanyId ? "Cambiar empresa" : "Seleccionar empresa"}
        </span>
      </button>

      {open && (
        <div className="mt-1.5 bg-bg-primary border border-border-secondary rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-secondary">
            <Search size={13} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted outline-none"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-text-muted hover:text-text-primary">
                <X size={12} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[250px] overflow-y-auto">
            {loading ? (
              <p className="text-center text-[11px] text-text-muted py-4">Cargando...</p>
            ) : companies.length === 0 ? (
              <p className="text-center text-[11px] text-text-muted py-4">Sin resultados</p>
            ) : (
              companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setImpersonating(c.id, c.nombre);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2.5 text-[12px] transition-colors border-b border-border-secondary last:border-0 ${
                    impersonatingCompanyId === c.id
                      ? "bg-red-500/5 text-red-500"
                      : "text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.nombre}</span>
                    <span className="text-[9px] text-text-muted">{c.plan || "free"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-text-muted">{c.user_count} usuarios</span>
                    <span className="text-[10px] text-text-muted">{c.conversation_count} conversaciones</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
