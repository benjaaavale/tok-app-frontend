"use client";

import { AbandonedCheckouts } from "@/components/settings/AbandonedCheckouts";
import { CartEmailMarketing } from "@/components/abandoned-carts/CartEmailMarketing";
import { ShoppingCart } from "lucide-react";

export default function AbandonedCartsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-border-secondary">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingCart size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary">Carritos abandonados</h1>
            <p className="text-[12px] text-text-muted mt-0.5">
              Recupera ventas perdidas con recordatorios automáticos
            </p>
          </div>
        </header>

        <AbandonedCheckouts />

        <CartEmailMarketing />
      </div>
    </div>
  );
}
