"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
// Note: socket auth uses companyToken (non-expiring), not Clerk JWT
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { API_URL } from "@/lib/constants";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const companyToken = useAuthStore((s) => s.companyToken);
  const synced = useAuthStore((s) => s.synced);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !synced || !companyToken) return;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(API_URL, {
      auth: { token: companyToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 20,
    });

    socket.on("connect", () => {
      setConnected(true);
    });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      // New message → refresh conversations and messages
      socket.on("nuevo_mensaje", (data) => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if (data.conversationId) {
          queryClient.invalidateQueries({
            queryKey: ["messages", data.conversationId],
          });
        }
      });

      // Bot status change → refresh contact
      socket.on("bot_status_changed", (data) => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        // Invalidate any open contact panel
        queryClient.invalidateQueries({ queryKey: ["contact"] });
      });

      // Escalation to human → refresh conversations
      socket.on("escalation", () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      });

      // Conversation assigned to worker → refresh conversations
      socket.on("conversation_assigned", () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      });

      // Appointment created/updated/cancelled → refresh calendar
      socket.on("appointment_update", () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      });

      // Contact updated (etapa, bot status, nombre, etc.) → refresh contact panel
      socket.on("contact_updated", (data) => {
        queryClient.invalidateQueries({ queryKey: ["contact"] });
        if (data?.contactId) {
          queryClient.invalidateQueries({ queryKey: ["contact", data.contactId] });
        }
        // Also refresh conversations list (etapa badge updates)
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
      });

      socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isSignedIn, synced, companyToken, queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
