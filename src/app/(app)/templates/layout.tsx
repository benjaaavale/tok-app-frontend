import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plantillas" };

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
