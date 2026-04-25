"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface ConnectEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export function ConnectEmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: ConnectEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border-secondary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
          <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{description}</p>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white bg-accent hover:bg-accent-hover shadow-[0_0_16px_rgba(37,99,235,0.35)] hover:shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all"
        >
          {ctaLabel}
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
