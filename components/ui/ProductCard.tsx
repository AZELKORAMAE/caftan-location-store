import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getPromo } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";
import { QuickAdd } from "./QuickAdd";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Carte produit façon Tiffany : visuel carré, collection en serif, nom en capitales fines. */
export function ProductCard({ product, priority, sizes = "(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw", className }: ProductCardProps) {
  const [main, hover] = product.images;
  const soldOut = product.stock <= 0;
  const promo = getPromo(product.price, product.compare_at_price);
  const href = `/produit/${product.slug}`;

  return (
    <div className={cn("group relative text-center", className)}>
      <div className="relative aspect-square overflow-hidden bg-[#F6F1EB]">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 block cursor-pointer">
        {main ? (
          <Image
            src={main}
            alt={product.name}
            fill
            priority={priority}
            sizes={sizes}
            className={cn(
              "object-cover mix-blend-multiply transition-all duration-700 ease-luxe group-hover:scale-[1.04]",
              hover && "group-hover:opacity-0"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-script text-3xl text-or-500">DL</div>
        )}
        {hover && (
          <Image
            src={hover}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-all duration-700 ease-luxe group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        <div className="pointer-events-none absolute left-2.5 right-2.5 top-2.5 flex flex-nowrap items-center gap-1.5">
          {product.is_featured && !soldOut && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-or-500 text-prune-950" title="Très demandée">
              <Flame className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span className="sr-only">Très demandée</span>
            </span>
          )}
          {product.is_new && !soldOut && (
            <span className="truncate bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-prune-900">Nouveauté</span>
          )}
          {soldOut && (
            <span className="bg-prune-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ivoire">Indisponible</span>
          )}
          {promo && !soldOut && (
            <span className="ml-auto shrink-0 bg-prune-900 px-2 py-1 text-[11px] font-semibold tabular-nums tracking-wide text-or-200">−{promo.percent} %</span>
          )}
        </div>
        </Link>
        <QuickAdd product={product} />
      </div>
      <Link href={href} className="relative block cursor-pointer px-2 pb-2 pt-5">
        {product.collection && (
          <p className="font-serif text-[17px] italic text-or-700 md:text-[18px]">{product.collection.name}</p>
        )}
        <h3 className="mx-auto mt-1 max-w-[28ch] text-[13px] leading-relaxed text-encre md:text-[14px]">
          <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-luxe group-hover:bg-[length:100%_1px]">
            {product.name}
          </span>
        </h3>
        <p className="mt-2 text-[13px] tabular-nums">
          {promo && (
            <span className="mr-2 text-taupe line-through decoration-taupe/70">
              <span className="sr-only">Prix initial : </span>
              {formatPrice(product.compare_at_price)}
            </span>
          )}
          <span className={promo ? "font-medium text-prune-700" : "text-taupe"}>
            {promo && <span className="sr-only">Prix promotionnel : </span>}
            {formatPrice(product.price)}
          </span>
          <span className="text-taupe"> la location</span>
        </p>
      </Link>
    </div>
  );
}
