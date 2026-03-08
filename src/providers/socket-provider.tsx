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
  const { getToken, isSignedIn } = useAuth();
  const companyToken = useAuthStore((s) => s.companyToken);
  const synced = useAuthStore((s) => s.synced);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !synced || !companyToken) return;

    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      // Disconnect existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(API_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
      });

      socket.on("connect", () => {
        setConnected(true);
        // Join company room
        socket.emit("join", companyToken);
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

      socket.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [isSignedIn, synced, companyToken, getToken, queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
