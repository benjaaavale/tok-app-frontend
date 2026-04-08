"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024; // lg breakpoint
}

export function AppTutorial() {
  const { synced, hasSeenTutorial, setTutorialSeen, role, companyToken } = useAuthStore();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role !== "worker";

  const startTutorial = useCallback(() => {
    const mobile = isMobile();

    const steps = [
      {
        popover: {
          title: "Bienvenido a ToK! 👋",
          description:
            "Te mostraremos las principales secciones de la app para que puedas sacarle el maximo provecho. Toma menos de 1 minuto.",
        },
      },
      {
        element: '[data-tour="nav-dashboard"]',
        popover: {
          title: "Dashboard",
          description:
            "Aqui veras las metricas clave de tu negocio: citas del dia, mensajes recibidos, leads nuevos y un embudo de conversion. Todo en tiempo real.",
          side: mobile ? "top" as const : "right" as const,
        },
      },
      {
        element: '[data-tour="nav-conversations"]',
        popover: {
          title: "Mensajes",
          description:
            "Tu bandeja de WhatsApp. Aqui llegan todos los mensajes de tus clientes. Puedes responder manualmente o dejar que el agente IA se encargue.",
          side: mobile ? "top" as const : "right" as const,
        },
      },
      {
        element: '[data-tour="nav-calendar"]',
        popover: {
          title: "Agenda",
          description:
            "Calendario semanal con todas las citas. Las citas que agende el agente IA por WhatsApp tambien se reflejan aqui automaticamente. Puedes crear, reprogramar o cancelar citas, y sincronizar con Google Calendar.",
          side: mobile ? "top" as const : "right" as const,
        },
      },
    ];

    // Solo agregar secciones admin
    if (isAdmin) {
      steps.push({
        element: '[data-tour="nav-templates"]',
        popover: {
          title: "Plantillas",
          description:
            "Envia mensajes masivos con plantillas aprobadas por Meta. Tambien puedes ver los leads que llevan mas de 24 horas sin responder y recontactarlos.",
          side: mobile ? "top" as const : "right" as const,
        },
      });
      steps.push({
        element: '[data-tour="nav-settings"]',
        popover: {
          title: "Configuracion",
          description:
            "Aqui configuras tu empresa, equipo, servicios, el agente IA y las integraciones con Google Calendar y WhatsApp. En la seccion de Agentes IA podras crear tu agente personalizado con inteligencia artificial: elige el tipo, describe como quieres que se comporte y la IA generara los prompts optimizados.",
          side: mobile ? "top" as const : "right" as const,
        },
      });
    }

    const webhookUrl = `https://api.tok-ai.cl/webhook/inbound?secret=${companyToken || ""}`;

    steps.push({
      popover: {
        title: "Conecta tu WhatsApp",
        description: `
          <div class="tok-tutorial-steps">
            <div class="tok-tutorial-step">
              <span class="tok-tutorial-step-num">1</span>
              <div>
                <p class="tok-tutorial-step-title">Crea tu cuenta en YCloud</p>
                <p class="tok-tutorial-step-desc">Registrate en la plataforma para obtener acceso a la API de WhatsApp Business.</p>
                <a href="https://www.ycloud.com/console/#/entry/register" target="_blank" rel="noopener noreferrer" class="tok-tutorial-btn">
                  Crear cuenta en YCloud ↗
                </a>
              </div>
            </div>
            <div class="tok-tutorial-step">
              <span class="tok-tutorial-step-num">2</span>
              <div>
                <p class="tok-tutorial-step-title">Configura el Webhook en YCloud</p>
                <p class="tok-tutorial-step-desc">En YCloud ve a <strong>Settings → Webhooks</strong> y pega esta URL:</p>
                <div class="tok-tutorial-url-box">
                  <code class="tok-tutorial-url">${webhookUrl}</code>
                  <button onclick="navigator.clipboard.writeText('${webhookUrl}');this.textContent='Copiado!';setTimeout(()=>this.textContent='Copiar',2000)" class="tok-tutorial-copy-btn">Copiar</button>
                </div>
                <p class="tok-tutorial-step-desc" style="margin-top:6px">Marca estas casillas de eventos:</p>
                <ul class="tok-tutorial-events">
                  <li>whatsapp.inbound_message.received</li>
                  <li>whatsapp.smb.message.echoes</li>
                </ul>
              </div>
            </div>
            <div class="tok-tutorial-step">
              <span class="tok-tutorial-step-num">3</span>
              <div>
                <p class="tok-tutorial-step-title">Copia tu API Key</p>
                <p class="tok-tutorial-step-desc">En YCloud ve a <strong>Settings → API Keys</strong>, copia tu key y pegala en ToK en <strong>Configuracion → Integraciones</strong>.</p>
              </div>
            </div>
          </div>
        `,
        side: "top" as const,
      },
    } as typeof steps[0]);

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: mobile ? 4 : 8,
      stageRadius: 12,
      popoverClass: "tok-tutorial-popover",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Entendido",
      progressText: "{{current}} de {{total}}",
      steps,
      onDestroyed: async () => {
        // Marcar tutorial como completado
        try {
          const tokenGetter = () => getToken();
          await authFetch("/user/tutorial-complete", { method: "PUT" }, tokenGetter);
          setTutorialSeen(true);
        } catch (err) {
          console.error("[Tutorial] Error marking as complete:", err);
        }
      },
    });

    // Pequeño delay para asegurar que el DOM esta listo
    setTimeout(() => driverObj.drive(), 800);
  }, [getToken, setTutorialSeen, isAdmin]);

  // Auto-iniciar tutorial para usuarios nuevos
  useEffect(() => {
    if (synced && !hasSeenTutorial && pathname === "/dashboard") {
      startTutorial();
    }
  }, [synced, hasSeenTutorial, pathname, startTutorial]);

  return null;
}

// Hook para iniciar el tutorial manualmente desde cualquier lugar
export function useTutorial() {
  const { setTutorialSeen } = useAuthStore();
  const { getToken } = useAuth();
  const router = useRouter();

  const resetAndStart = async () => {
    try {
      const tokenGetter = () => getToken();
      await authFetch("/user/tutorial-reset", { method: "PUT" }, tokenGetter);
      setTutorialSeen(false);
      // Navegar al dashboard y recargar para que el tutorial se active
      router.push("/dashboard");
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      console.error("[Tutorial] Error resetting:", err);
    }
  };

  return { resetAndStart };
}
