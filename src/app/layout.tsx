import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ToK - Panel de gestión",
  description: "Panel de gestión WhatsApp para empresas",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={esMX}
      signInUrl="/login"
      signInFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: "#3B82F6",
          borderRadius: "12px",
        },
      }}
    >
      <html lang="es" suppressHydrationWarning className={inter.variable}>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: "var(--radius-md)",
                  },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
