"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInPageProps {
  className?: string;
  onGoogleSignIn?: () => void;
  onEmailSubmit?: (email: string) => Promise<void>;
  onCodeSubmit?: (code: string) => Promise<void>;
  onResendCode?: () => void;
}

export const SignInPage = ({
  className,
  onGoogleSignIn,
  onEmailSubmit,
  onCodeSubmit,
  onResendCode,
}: SignInPageProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !onEmailSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      await onEmailSubmit(email);
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Algo salió mal. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
      if (index === 5 && value && newCode.every((d) => d.length === 1)) {
        handleCodeComplete(newCode.join(""));
      }
    }
  };

  const handleCodeComplete = async (fullCode: string) => {
    if (!onCodeSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      await onCodeSubmit(fullCode);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Código inválido. Intenta de nuevo.");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => codeInputRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      codeInputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextIndex = Math.min(pasted.length, 5);
    codeInputRefs.current[nextIndex]?.focus();
    if (pasted.length === 6) {
      handleCodeComplete(pasted);
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setError(null);
  };

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div
      className={cn(
        "flex w-full min-h-screen relative overflow-hidden bg-bg-primary transition-colors duration-300",
        className
      )}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full blur-[120px] animate-[drift_20s_ease-in-out_infinite]",
            isDark ? "bg-blue-500/8" : "bg-blue-400/15"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] animate-[drift_25s_ease-in-out_infinite_reverse]",
            isDark ? "bg-indigo-500/6" : "bg-indigo-300/12"
          )}
        />
        <div
          className={cn(
            "absolute top-[20%] left-[50%] w-[40%] h-[40%] rounded-full blur-[100px] animate-[drift_18s_ease-in-out_infinite_2s]",
            isDark ? "bg-cyan-500/4" : "bg-sky-300/10"
          )}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          isDark ? "opacity-[0.03]" : "opacity-[0.04]"
        )}
        style={{
          backgroundImage: `radial-gradient(circle, var(--accent) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Theme toggle — top right */}
      {mounted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={toggleTheme}
          className={cn(
            "absolute top-5 right-5 z-20 flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 cursor-pointer",
            isDark
              ? "bg-bg-secondary/80 border-border-primary hover:bg-bg-hover"
              : "bg-white/80 border-border-primary hover:bg-bg-hover",
            "backdrop-blur-sm"
          )}
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-[18px] h-[18px] text-amber-400" strokeWidth={1.8} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-[18px] h-[18px] text-text-muted" strokeWidth={1.8} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image
              src={isDark ? "/logo-blanco.png" : "/logo-negro.png"}
              alt="ToK"
              width={64}
              height={64}
              priority
              className="transition-opacity duration-300"
            />
          </div>

          {/* Card container */}
          <div
            className={cn(
              "rounded-2xl border p-6 sm:p-8 transition-all duration-300",
              isDark
                ? "bg-bg-secondary/50 border-border-primary backdrop-blur-md"
                : "bg-white/70 border-border-primary/60 backdrop-blur-md shadow-[var(--shadow-md)]"
            )}
          >
            <AnimatePresence mode="wait">
              {/* ── Step 1: Email ── */}
              {step === "email" ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                      Bienvenido
                    </h1>
                    <p className="text-sm text-text-muted font-light">
                      Inicia sesión para continuar
                    </p>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-sm bg-danger-light/50 rounded-[var(--radius-lg)] px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="space-y-3">
                    {onGoogleSignIn && (
                      <button
                        onClick={onGoogleSignIn}
                        className={cn(
                          "w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                          isDark
                            ? "bg-bg-primary/60 hover:bg-bg-hover text-text-primary border border-border-primary"
                            : "bg-bg-secondary hover:bg-bg-hover text-text-primary border border-border-primary"
                        )}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continuar con Google
                      </button>
                    )}

                    <div className="flex items-center gap-4 py-1">
                      <div className="h-px bg-border-primary flex-1" />
                      <span className="text-text-muted text-xs uppercase tracking-wider">
                        o
                      </span>
                      <div className="h-px bg-border-primary flex-1" />
                    </div>

                    <form onSubmit={handleEmailSubmit}>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            "w-full text-text-primary rounded-xl py-3 px-4 pr-12 transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                            "placeholder:text-text-muted/60",
                            isDark
                              ? "bg-bg-primary/60 border border-border-primary"
                              : "bg-bg-secondary border border-border-primary"
                          )}
                          required
                        />
                        <button
                          type="submit"
                          disabled={isLoading || !email}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                          {isLoading ? (
                            <svg
                              className="w-4 h-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="opacity-25"
                              />
                              <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : step === "code" ? (
                /* ── Step 2: OTP Code ── */
                <motion.div
                  key="code-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                      Verifica tu email
                    </h1>
                    <p className="text-sm text-text-muted font-light">
                      Enviamos un código a{" "}
                      <span className="text-text-secondary font-medium">
                        {email}
                      </span>
                    </p>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-sm bg-danger-light/50 rounded-[var(--radius-lg)] px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* OTP inputs */}
                  <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                      <React.Fragment key={i}>
                        <input
                          ref={(el) => {
                            codeInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className={cn(
                            "w-11 h-13 text-center text-xl font-semibold rounded-xl border text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                            isDark ? "bg-bg-primary/60" : "bg-bg-secondary",
                            digit
                              ? "border-accent/40"
                              : "border-border-primary"
                          )}
                        />
                        {i === 2 && (
                          <span className="text-text-muted/40 text-lg mx-0.5">
                            –
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={onResendCode}
                    className="text-text-muted hover:text-accent text-sm transition-colors duration-200"
                  >
                    Reenviar código
                  </button>

                  <div className="flex w-full gap-3 pt-2">
                    <button
                      onClick={handleBackClick}
                      className={cn(
                        "rounded-xl font-medium px-6 py-3 border border-border-primary transition-all duration-200 active:scale-[0.98]",
                        isDark
                          ? "bg-bg-primary/60 text-text-secondary hover:bg-bg-hover"
                          : "bg-bg-secondary text-text-secondary hover:bg-bg-hover"
                      )}
                    >
                      Volver
                    </button>
                    <button
                      onClick={() => handleCodeComplete(code.join(""))}
                      disabled={!code.every((d) => d !== "") || isLoading}
                      className={cn(
                        "flex-1 rounded-xl font-medium py-3 transition-all duration-200 active:scale-[0.98]",
                        code.every((d) => d !== "")
                          ? "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md"
                          : isDark
                            ? "bg-bg-primary/60 text-text-muted border border-border-primary cursor-not-allowed"
                            : "bg-bg-secondary text-text-muted border border-border-primary cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="opacity-25"
                            />
                            <path
                              d="M4 12a8 8 0 018-8"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                          Verificando...
                        </span>
                      ) : (
                        "Continuar"
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ── Step 3: Success ── */
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                      ¡Listo!
                    </h1>
                    <p className="text-sm text-text-muted font-light">
                      Bienvenido de vuelta
                    </p>
                  </div>

                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="py-8"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-text-muted/50 text-xs mt-6">
            Potenciado por ToK
          </p>
        </div>
      </div>

      {/* Inline keyframes for background orbs */}
      <style jsx global>{`
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(30px, -20px);
          }
          50% {
            transform: translate(-20px, 30px);
          }
          75% {
            transform: translate(20px, 10px);
          }
        }
      `}</style>
    </div>
  );
};
