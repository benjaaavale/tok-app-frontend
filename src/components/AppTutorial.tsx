"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

export function AppTutorial() {
  const { synced, hasSeenTutorial, setTutorialSeen, role } = useAuthStore();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role !== "worker";

  const startTutorial = useCallback(() => {
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
        },
      },
      {
        element: '[data-tour="nav-conversations"]',
        popover: {
          title: "Mensajes",
          description:
            "Tu bandeja de WhatsApp. Aqui llegan todos los mensajes de tus clientes. Puedes responder manualmente o dejar que el agente IA se encargue.",
        },
      },
      {
        element: '[data-tour="nav-calendar"]',
        popover: {
          title: "Agenda",
          description:
            "Calendario semanal con todas las citas. Las citas que agende el agente IA por WhatsApp tambien se reflejan aqui automaticamente. Puedes crear, reprogramar o cancelar citas, y sincronizar con Google Calendar.",
        },
      },
    ];

    // Solo agregar settings si es admin
    if (isAdmin) {
      steps.push({
        element: '[data-tour="nav-settings"]',
        popover: {
          title: "Configuracion",
          description:
            "Aqui configuras tu empresa, equipo, servicios, el agente IA y las integraciones con Google Calendar y WhatsApp.",
        },
      });
    }

    steps.push({
      popover: {
        title: "Listo! 🎉",
        description:
          "Ya conoces las secciones principales. Si necesitas ver este tutorial de nuevo, ve a Configuracion > Perfil. Ahora explora tu nueva herramienta!",
      },
    });

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "tok-tutorial-popover",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Comenzar!",
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
