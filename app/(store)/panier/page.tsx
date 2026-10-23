import type { Metadata } from "next";
import { Checkout } from "@/components/shop/Checkout";

export const metadata: Metadata = { title: "Ma sélection & réservation", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mb-12 text-center">
        <p className="eyebrow text-or-700">Réservation</p>
        <h1 className="display mt-4 text-[44px] text-prune-900 md:text-[60px]">Votre sélection</h1>
        <div className="gold-rule mt-6" />
      </div>
      <Checkout />
    </div>
  );
}
