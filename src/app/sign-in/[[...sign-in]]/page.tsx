"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1437] via-[#1B2559] to-[#2B3674]">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo-blanco.png"
          alt="ToK"
          width={80}
          height={80}
          priority
        />
        <p className="text-white/60 text-sm">
          Panel de gesti&oacute;n para empresas
        </p>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              formFieldLabel: "text-white/80",
              formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/40",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
            },
          }}
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
