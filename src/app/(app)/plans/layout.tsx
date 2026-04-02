import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planes" };

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
