import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-serif text-3xl text-prune-900">Aucune tenue trouvée</p>
        <p className="mt-3 text-[15px] text-taupe">Essayez une autre recherche ou découvrez toutes nos tenues.</p>
        <Link href="/boutique" className="btn-primary mt-8">
          Toutes les tenues
        </Link>
      </div>
    );
  }

  return (
    <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4" stagger={0.05}>
      {products.map((p, i) => (
        <RevealItem key={p.id}>
          <ProductCard product={p} priority={i < 4} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
