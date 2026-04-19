"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import {
  useAgentTemplates,
  type AgentTemplate,
} from "@/hooks/useAgentTemplates";

interface AgentTemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: AgentTemplate) => void;
}

const FALLBACK_TEMPLATES: AgentTemplate[] = [
  {
    id: "ventas-general",
    icon: "💼",
    name: "Ventas general",
    category: "ventas",
    short_description: "Califica leads y presenta productos o servicios",
    long_description: "",
    defaults: {
      name: "Agente de Ventas",
      description:
        "Atiende consultas de potenciales clientes, presenta los productos/servicios y califica si hay interes real de compra.",
      instructions:
        "Se amable y directo. Pregunta sobre las necesidades del cliente antes de ofrecer.",
      can_schedule: false,
      use_knowledge: true,
    },
  },
  {
    id: "ventas-con-agenda",
    icon: "📅",
    name: "Ventas + agenda reunion",
    category: "ventas",
    short_description: "Vende y agenda citas con el equipo comercial",
    long_description: "",
    defaults: {
      name: "Agente Comercial",
      description:
        "Califica leads interesados y agenda reuniones con el equipo de ventas cuando el cliente quiere avanzar.",
      instructions:
        "Identifica el nivel de interes antes de proponer agendar. Si hay interes, ofrece una reunion de 30 minutos.",
      can_schedule: true,
      use_knowledge: true,
    },
  },
  {
    id: "soporte-cliente",
    icon: "🎧",
    name: "Soporte al cliente",
    category: "soporte",
    short_description: "Resuelve dudas y problemas post-venta",
    long_description: "",
    defaults: {
      name: "Agente de Soporte",
      description:
        "Atiende consultas de clientes existentes sobre el uso del producto, problemas tecnicos y solicitudes de servicio.",
      instructions:
        "Sé paciente y detallado. Si no puedes resolver el problema, deriva al equipo humano.",
      can_schedule: false,
      use_knowledge: true,
    },
  },
  {
    id: "agendamiento-puro",
    icon: "🗓️",
    name: "Agendamiento puro",
    category: "agendamiento",
    short_description: "Solo gestiona citas y reservas",
    long_description: "",
    defaults: {
      name: "Agente de Agenda",
      description:
        "Gestiona reservas y citas. Confirma disponibilidad, agenda, modifica o cancela segun lo pida el cliente.",
      instructions:
        "Pregunta siempre nombre y telefono de contacto. Confirma todos los detalles antes de agendar.",
      can_schedule: true,
      use_knowledge: false,
    },
  },
  {
    id: "inmobiliaria",
    icon: "🏠",
    name: "Inmobiliaria",
    category: "vertical",
    short_description: "Capta leads de compra/arriendo de propiedades",
    long_description: "",
    defaults: {
      name: "Agente Inmobiliario",
      description:
        "Atiende consultas sobre propiedades en venta o arriendo, califica el interes y agenda visitas con el corredor.",
      instructions:
        "Pregunta presupuesto, ubicacion preferida y si es para compra o arriendo. Ofrece agendar una visita a la propiedad.",
      can_schedule: true,
      use_knowledge: true,
    },
  },
  {
    id: "restaurante",
    icon: "🍽️",
    name: "Restaurante / comida",
    category: "vertical",
    short_description: "Toma reservas y responde sobre el menu",
    long_description: "",
    defaults: {
      name: "Agente de Reservas",
      description:
        "Gestiona reservas de mesa, responde preguntas sobre el menu, horarios y ubicacion del local.",
      instructions:
        "Solicita numero de personas, fecha y hora para la reserva. Menciona opciones vegetarianas si preguntan.",
      can_schedule: true,
      use_knowledge: true,
    },
  },
  {
    id: "salud",
    icon: "🏥",
    name: "Salud / clinica",
    category: "vertical",
    short_description: "Agenda horas medicas y resuelve dudas clinicas",
    long_description: "",
    defaults: {
      name: "Agente Clinico",
      description:
        "Agenda horas con profesionales de la salud, informa sobre servicios disponibles y responde consultas generales del paciente.",
      instructions:
        "No des diagnosticos medicos. Para urgencias, deriva siempre al servicio de urgencias. Solicita RUT y nombre completo para agendar.",
      can_schedule: true,
      use_knowledge: true,
    },
  },
  {
    id: "desde-cero",
    icon: "✏️",
    name: "Desde cero",
    category: "ventas",
    short_description: "Configura tu agente completamente a tu medida",
    long_description: "",
    defaults: {
      name: "",
      description: "",
      instructions: "",
      can_schedule: false,
      use_knowledge: true,
    },
  },
];

export function AgentTemplatePicker({
  open,
  onClose,
  onSelect,
}: AgentTemplatePickerProps) {
  const { data: serverTemplates, isLoading } = useAgentTemplates();

  const templates =
    serverTemplates && serverTemplates.length > 0
      ? serverTemplates
      : FALLBACK_TEMPLATES;

  const main = templates.filter((t) => t.id !== "desde-cero");
  const scratch = templates.find((t) => t.id === "desde-cero");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative bg-bg-primary border border-border-secondary rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 flex-shrink-0">
              <div>
                <h2 className="text-[16px] font-semibold text-text-primary">
                  Elige un punto de partida
                </h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  Plantillas probadas que puedes personalizar
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto px-6 pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-accent" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {main.map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        template={tpl}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>

                  {scratch && (
                    <div className="grid grid-cols-1">
                      <ScratchCard template={scratch} onSelect={onSelect} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: AgentTemplate;
  onSelect: (t: AgentTemplate) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="bg-bg-secondary border border-border-secondary rounded-xl p-4 text-left hover:border-accent cursor-pointer transition-all hover:scale-[1.02] group"
    >
      <span className="text-3xl block mb-3">{template.icon}</span>
      <p className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors">
        {template.name}
      </p>
      <p className="text-[12px] text-text-muted mt-1 leading-snug">
        {template.short_description}
      </p>
    </button>
  );
}

function ScratchCard({
  template,
  onSelect,
}: {
  template: AgentTemplate;
  onSelect: (t: AgentTemplate) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full border border-dashed border-border-secondary rounded-xl p-4 text-left hover:border-accent cursor-pointer transition-all group flex items-center gap-4"
    >
      <span className="text-3xl flex-shrink-0">{template.icon}</span>
      <div>
        <p className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors">
          {template.name}
        </p>
        <p className="text-[12px] text-text-muted mt-0.5">
          {template.short_description}
        </p>
      </div>
    </button>
  );
}
