import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToK - Panel de gesti\u00f3n",
  description: "Panel de gesti\u00f3n WhatsApp para empresas",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={esES}
      signInUrl="/login"
      signInFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: "#3B82F6",
          borderRadius: "12px",
        },
      }}
    >
      <html lang="es" suppressHydrationWarning>
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
