"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  label,
  className,
}: SwitchProps) {
  const isSm = size === "sm";

  return (
    <div
      className={cn("flex items-center gap-2.5 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      {/* Track */}
      <motion.div
        className={cn(
          "relative rounded-full flex-shrink-0",
          isSm ? "w-[36px] h-[20px]" : "w-[44px] h-[24px]",
        )}
        initial={false}
        animate={{
          backgroundColor: checked ? "var(--accent)" : "var(--border-primary)",
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Thumb */}
        <motion.div
          className={cn(
            "absolute rounded-full border border-white/10 shadow-md",
            isSm ? "top-[3px] left-[3px] w-[14px] h-[14px]" : "top-[3px] left-[3px] w-[18px] h-[18px]",
          )}
          initial={false}
          animate={{
            x: checked ? (isSm ? 16 : 20) : 0,
            backgroundColor: "#FFFFFF",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
        >
          {/* Gloss */}
          <div className="absolute top-[2px] left-[3px] w-2 h-1 bg-white/40 rounded-full blur-[1px]" />
        </motion.div>
      </motion.div>

      {/* Label */}
      {label && (
        <span
          className={cn(
            "text-[12px] font-medium transition-colors duration-200 select-none",
            checked ? "text-text-primary" : "text-text-muted",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
