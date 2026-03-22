"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => handleClose(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[360px] bg-bg-secondary border border-border-secondary rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => handleClose(false)}
                className="absolute top-3 right-3 p-1 rounded-lg text-text-muted hover:bg-bg-hover transition-colors"
              >
                <X size={14} />
              </button>

              <div className="p-5">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    state.options.variant === "danger"
                      ? "bg-red-500/10"
                      : state.options.variant === "warning"
                      ? "bg-amber-500/10"
                      : "bg-accent/10"
                  }`}
                >
                  <AlertTriangle
                    size={18}
                    className={
                      state.options.variant === "danger"
                        ? "text-red-500"
                        : state.options.variant === "warning"
                        ? "text-amber-500"
                        : "text-accent"
                    }
                  />
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-semibold text-text-primary mb-1">
                  {state.options.title}
                </h3>

                {/* Description */}
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {state.options.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-[12px] font-medium text-text-secondary bg-bg-primary border border-border-secondary hover:bg-bg-hover transition-all"
                >
                  {state.options.cancelText || "Cancelar"}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 px-4 py-2 rounded-xl text-[12px] font-medium text-white transition-all ${
                    state.options.variant === "danger"
                      ? "bg-red-500 hover:bg-red-600"
                      : state.options.variant === "warning"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-accent hover:bg-accent-hover"
                  }`}
                >
                  {state.options.confirmText || "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
