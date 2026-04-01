"use client";

import { useState } from "react";
import { useStaleLeads } from "@/hooks/useStaleLeads";
import { ETAPA_COLORS, ETAPA_LABELS } from "@/lib/constants";
import type { StaleLead } from "@/types/api";
import { BulkSendModal } from "./BulkSendModal";
import { Send, Users, Loader2 } from "lucide-react";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function StaleLeadsList() {
  const { data: leads, isLoading } = useStaleLeads();
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const allIds = leads?.map((l) => l.contact_id) || [];
  const allSelected = allIds.length > 0 && selected.length === allIds.length;
  const someSelected = selected.length > 0 && selected.length < allIds.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(allIds);
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedLeads: StaleLead[] = leads?.filter((l) => selected.includes(l.contact_id)) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Leads sin respuesta</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Contactos que no han respondido nuestros mensajes en más de 24 horas
          </p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--accent)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Send size={15} />
            Enviar plantilla ({selected.length})
          </button>
        )}
      </div>

      {/* Empty state */}
      {!leads || leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-[var(--text-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">No hay leads sin respuesta</p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Todos tus contactos han respondido a tus mensajes
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-secondary)]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="rounded border-[var(--border-secondary)] accent-[var(--accent)] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                  Etapa
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Último mensaje
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                  Slot
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isChecked = selected.includes(lead.contact_id);
                const etapaColor = lead.etapa ? ETAPA_COLORS[lead.etapa] : "#94A3B8";
                const etapaLabel = lead.etapa ? (ETAPA_LABELS[lead.etapa] || lead.etapa) : "—";

                return (
                  <tr
                    key={lead.contact_id}
                    className={`border-b border-[var(--border-secondary)] last:border-b-0 hover:bg-[var(--bg-primary)] transition-colors cursor-pointer ${isChecked ? "bg-[var(--accent)]/5" : ""}`}
                    onClick={() => toggleOne(lead.contact_id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(lead.contact_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-[var(--border-secondary)] accent-[var(--accent)] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                          {lead.nombre_real || lead.nombre_whatsapp}
                        </p>
                        {lead.nombre_real && (
                          <p className="text-[11px] text-[var(--text-muted)]">{lead.nombre_whatsapp}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[12px] text-[var(--text-secondary)]">{lead.telefono}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {lead.etapa ? (
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${etapaColor}26`,
                            color: etapaColor,
                          }}
                        >
                          {etapaLabel}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[12px] text-[var(--text-secondary)]">
                          {timeAgo(lead.last_message_at)}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[140px]">
                          {lead.last_message}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        Slot {lead.phone_slot}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Send Modal */}
      <BulkSendModal
        open={bulkModalOpen}
        onClose={() => {
          setBulkModalOpen(false);
          setSelected([]);
        }}
        selectedLeads={selectedLeads}
      />
    </div>
  );
}
