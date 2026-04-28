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
  const {
    synced,
    hasSeenTutorial,
    setTutorialSeen,
    role,
    companyToken,
    subscriptionStatus,
  } = useAuthStore();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role !== "worker";

  const startTutorial = useCallback(() => {
    const mobile = isMobile();

    type Step = {
      element?: string;
      popover: {
        title: string;
        description: string;
        side?: "top" | "bottom" | "left" | "right";
      };
    };

    // ── Welcome ───────────────────────────────────────────────
    const steps: Step[] = [
      {
        popover: {
          title: "Bienvenido a ToK 👋",
          description: `
            <div class="tok-tut-welcome">
              <p class="tok-tut-welcome-lead">
                Tu plan está activo. Te mostramos un recorrido rápido por la app — toma menos de 1 minuto.
              </p>
              <ul class="tok-tut-welcome-list">
                <li><span>📊</span> Dashboard con métricas en vivo</li>
                <li><span>💬</span> Bandeja unificada de WhatsApp, Messenger e Instagram</li>
                <li><span>📅</span> Agenda sincronizada con Google Calendar</li>
                <li><span>🤖</span> Agente IA personalizado para tu negocio</li>
              </ul>
            </div>
          `,
        },
      },
      // ── Dashboard ─────────────────────────────────────────────
      {
        element: '[data-tour="nav-dashboard"]',
        popover: {
          title: "Dashboard",
          description:
            "Métricas en vivo: citas del día, conversaciones, leads nuevos y embudo de conversión. Todo en un vistazo.",
          side: mobile ? "top" : "right",
        },
      },
      // ── Mensajes ──────────────────────────────────────────────
      {
        element: '[data-tour="nav-conversations"]',
        popover: {
          title: "Mensajes",
          description:
            "Bandeja unificada de WhatsApp, Messenger e Instagram. Responde manualmente o deja que el agente IA conteste y agende automáticamente.",
          side: mobile ? "top" : "right",
        },
      },
      // ── Agenda ────────────────────────────────────────────────
      {
        element: '[data-tour="nav-calendar"]',
        popover: {
          title: "Agenda",
          description:
            "Vista semanal con todas las citas. Las que agende el agente IA por chat aparecen aquí automáticamente y se sincronizan con Google Calendar.",
          side: mobile ? "top" : "right",
        },
      },
    ];

    // ── Secciones admin ───────────────────────────────────────
    if (isAdmin) {
      steps.push({
        element: '[data-tour="nav-agents"]',
        popover: {
          title: "Agentes IA",
          description:
            "Crea y configura tu agente personalizado. Define cómo responde, qué tono usa y entrégale tu base de conocimiento — la IA optimiza los prompts por ti.",
          side: mobile ? "top" : "right",
        },
      });
      steps.push({
        element: '[data-tour="nav-templates"]',
        popover: {
          title: "Plantillas",
          description:
            "Envía mensajes masivos con plantillas aprobadas por Meta. También recontacta automáticamente leads inactivos con más de 24h sin responder.",
          side: mobile ? "top" : "right",
        },
      });
      steps.push({
        element: '[data-tour="nav-abandoned-carts"]',
        popover: {
          title: "Carritos",
          description:
            "Si conectas Shopify, recuperamos los carritos abandonados de tu tienda. Envíales emails de recuperación con un click usando tu dominio configurado.",
          side: mobile ? "top" : "right",
        },
      });
      steps.push({
        element: '[data-tour="nav-settings"]',
        popover: {
          title: "Configuración",
          description:
            "Datos de tu empresa, equipo, servicios, integraciones (WhatsApp, Meta, Shopify, Google Calendar), notificaciones y la sección de <strong>Pagos</strong> para gestionar tu plan y consumo.",
          side: mobile ? "top" : "right",
        },
      });
    }

    // ── Conexión WhatsApp (último paso, solo admin) ───────────
    const webhookUrl = `https://api.tok-ai.cl/webhook/inbound?secret=${
      companyToken || ""
    }`;

    if (isAdmin) {
      steps.push({
        popover: {
          title: "Conecta tu WhatsApp",
          description: `
            <div class="tok-tutorial-steps">
              <div class="tok-tutorial-step">
                <span class="tok-tutorial-step-num">1</span>
                <div>
                  <p class="tok-tutorial-step-title">Crea tu cuenta en YCloud</p>
                  <p class="tok-tutorial-step-desc">Regístrate para acceder a la API de WhatsApp Business.</p>
                  <a href="https://www.ycloud.com/console/#/entry/register" target="_blank" rel="noopener noreferrer" class="tok-tutorial-btn">
                    Crear cuenta en YCloud ↗
                  </a>
                </div>
              </div>
              <div class="tok-tutorial-step">
                <span class="tok-tutorial-step-num">2</span>
                <div>
                  <p class="tok-tutorial-step-title">Configura el Webhook</p>
                  <a href="https://www.ycloud.com/console/#/whatsapp/webhook" target="_blank" rel="noopener noreferrer" class="tok-tutorial-btn">
                    Settings → Webhooks en YCloud ↗
                  </a>
                  <p class="tok-tutorial-step-desc" style="margin-top:8px">Pega esta URL:</p>
                  ${
                    companyToken
                      ? `<div class="tok-tutorial-url-box">
                    <code class="tok-tutorial-url">${webhookUrl}</code>
                    <button onclick="navigator.clipboard.writeText('${webhookUrl}');this.textContent='Copiado!';setTimeout(()=>this.textContent='Copiar',2000)" class="tok-tutorial-copy-btn">Copiar</button>
                  </div>`
                      : `<p class="tok-tutorial-step-desc" style="color:var(--color-warning,#F59E0B);margin-top:4px">Recarga la página para obtener tu URL.</p>`
                  }
                  <p class="tok-tutorial-step-desc" style="margin-top:6px">Marca estos eventos:</p>
                  <ul class="tok-tutorial-events">
                    <li>whatsapp.inbound_message.received</li>
                    <li>whatsapp.smb.message.echoes</li>
                  </ul>
                </div>
              </div>
              <div class="tok-tutorial-step">
                <span class="tok-tutorial-step-num">3</span>
                <div>
                  <p class="tok-tutorial-step-title">Pega tu API Key en ToK</p>
                  <p class="tok-tutorial-step-desc">Configuración → Integraciones → WhatsApp.</p>
                  <a href="https://www.ycloud.com/console/#/api-key/list" target="_blank" rel="noopener noreferrer" class="tok-tutorial-btn">
                    Settings → API Keys en YCloud ↗
                  </a>
                </div>
              </div>
            </div>
          `,
          side: "top",
        },
      });
    }

    // ── Listo (cierre) ────────────────────────────────────────
    steps.push({
      popover: {
        title: "¡Todo listo! 🚀",
        description: `
          <div class="tok-tut-welcome">
            <p class="tok-tut-welcome-lead">
              Ya conoces lo principal. Si necesitas ayuda, puedes volver a ver este tutorial desde
              <strong>Configuración → Perfil</strong>.
            </p>
            <p class="tok-tut-welcome-lead" style="margin-top:8px;color:var(--text-muted);font-size:12px">
              Empieza configurando tu agente IA en <strong>Agentes IA</strong> o conectando WhatsApp en <strong>Configuración → Integraciones</strong>.
            </p>
          </div>
        `,
      },
    });

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: mobile ? 4 : 8,
      stageRadius: 12,
      popoverClass: "tok-tutorial-popover",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Comenzar",
      progressText: "{{current}} de {{total}}",
      steps,
      onDestroyed: async () => {
        try {
          const tokenGetter = () => getToken();
          await authFetch("/user/tutorial-complete", { method: "PUT" }, tokenGetter);
          setTutorialSeen(true);
        } catch (err) {
          console.error("[Tutorial] Error marking as complete:", err);
        }
      },
    });

    setTimeout(() => driverObj.drive(), 800);
  }, [getToken, setTutorialSeen, isAdmin, companyToken]);

  // Auto-iniciar tutorial:
  // - solo si hay suscripción activa o en trial (no durante el flujo de pago)
  // - solo en /dashboard
  // - una sola vez (cuando hasSeenTutorial = false)
  useEffect(() => {
    if (!synced) return;
    if (hasSeenTutorial) return;
    if (pathname !== "/dashboard") return;
    if (subscriptionStatus !== "active" && subscriptionStatus !== "trialing") return;
    startTutorial();
  }, [synced, hasSeenTutorial, pathname, subscriptionStatus, startTutorial]);

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
      router.push("/dashboard");
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      console.error("[Tutorial] Error resetting:", err);
    }
  };

  return { resetAndStart };
}
