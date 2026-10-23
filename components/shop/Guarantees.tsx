import { Banknote, Scissors, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { SHIPPING_FEE } from "@/lib/pricing";

const FREE = { icon: Truck, fr: "Livraison et retour offerts", ar: "التوصيل والإرجاع مجانًا" };
const PAID = { icon: Truck, fr: `Livraison : ${SHIPPING_FEE} MAD`, ar: `ثمن التوصيل : ${SHIPPING_FEE} درهم` };

const ITEMS = [
  { icon: Banknote, fr: "Paiement à la livraison", ar: "الدفع عند الاستلام" },
  { icon: Scissors, fr: "Retouches et pressing inclus", ar: "التعديلات والتنظيف مشمولة" },
];

/** Engagements de la boutique, en français et en arabe. */
export function Guarantees({ className, freeShipping = true }: { className?: string; freeShipping?: boolean }) {
  return (
    <ul className={cn("space-y-2.5 text-[14px] text-taupe", className)}>
      {[freeShipping ? FREE : PAID, ...ITEMS].map(({ icon: Icon, fr, ar }) => (
        <li key={fr} className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0 text-or-600" strokeWidth={1.4} aria-hidden />
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <span>{fr}</span>
            <span dir="rtl" lang="ar" className="text-[14px] text-taupe/90">
              {ar}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
