"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export function MobileHeader() {
  const { theme } = useTheme();

  return (
    <div className="h-11 px-4 flex items-center lg:hidden bg-bg-sidebar flex-shrink-0">
      <Image
        src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
        alt="ToK"
        width={24}
        height={24}
        priority
      />
    </div>
  );
}
