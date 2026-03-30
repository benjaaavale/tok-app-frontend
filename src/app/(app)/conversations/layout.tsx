import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mensajes" };

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
