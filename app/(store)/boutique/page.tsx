import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SortSelect } from "@/components/shop/SortSelect";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { BUDGET_PRICE_LIMIT } from "@/lib/constants";
import { getCollections, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

type SearchParams = Promise<{ collection?: string; tri?: string; q?: string; prix?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { collection, q } = await searchParams;
  if (q) return { title: `Recherche « ${q} »` };
  const current = collection ? (await getCollections()).find((c) => c.slug === collection) : null;
  return { title: current?.name ?? "Toutes les tenues" };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { collection, tri, q, prix } = await searchParams;
  const budget = prix === "petits-prix";
  const collections = await getCollections();
  const current = collection ? collections.find((c) => c.slug === collection) ?? null : null;
  const products = await getProducts({
    collectionId: current?.id,
    sort: tri,
    q,
    maxPrice: budget ? BUDGET_PRICE_LIMIT : undefined,
  });

  const title = q ? `« ${q} »` : budget ? "Petits prix" : current ? current.name : "Toutes les tenues";
  const intro = q
    ? `${products.length} tenue${products.length > 1 ? "s" : ""} correspond${products.length > 1 ? "ent" : ""} à votre recherche.`
    : budget
      ? `Des tenues de fête à moins de ${formatPrice(BUDGET_PRICE_LIMIT)} la location, retouches et pressing inclus.`
      : current?.description || "Caftans, takchitas, tenues de mariée et djellabas à louer pour vos événements, retouches et pressing inclus.";

  const chipHref = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set("collection", slug);
    if (tri) p.set("tri", tri);
    if (budget) p.set("prix", "petits-prix");
    return `/boutique${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <section className="border-b border-sable bg-ivoire">
        <div className="container py-10 md:py-16">
          <Breadcrumbs
            items={[
              { label: q ? "Recherche" : "Tenues", href: q || current || budget ? "/boutique" : undefined },
              ...(current || budget || q ? [{ label: q ? q : title }] : []),
            ]}
          />
          <Reveal className="mx-auto mt-8 max-w-2xl text-center">
            {q && <p className="eyebrow mb-4 text-or-700">Résultats pour</p>}
            <h1 className="display text-[44px] text-prune-900 md:text-[64px]">{title}</h1>
            <p className="mt-5 text-[15px] leading-relaxed text-taupe md:text-base">{intro}</p>
          </Reveal>
        </div>
      </section>

      <div className="sticky top-16 z-20 border-b border-sable bg-white/95 backdrop-blur-md lg:top-[112px]">
        <div className="container flex items-center justify-between gap-6">
          <ul className="scrollbar-none -mx-1 flex flex-1 items-center gap-1 overflow-x-auto">
            <li>
              <FilterChip href={chipHref()} active={!current}>
                Tout
              </FilterChip>
            </li>
            {collections.map((c) => (
              <li key={c.slug}>
                <FilterChip href={chipHref(c.slug)} active={current?.slug === c.slug}>
                  {c.name}
                </FilterChip>
              </li>
            ))}
          </ul>
          <div className="hidden shrink-0 items-center gap-8 md:flex">
            <span className="text-[12px] tabular-nums text-taupe">
              {products.length} tenue{products.length > 1 ? "s" : ""}
            </span>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
        </div>
      </div>

      <section className="container py-10 md:py-16">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <span className="text-[12px] tabular-nums text-taupe">
            {products.length} tenue{products.length > 1 ? "s" : ""}
          </span>
          <Suspense>
            <SortSelect />
          </Suspense>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-[52px] items-center whitespace-nowrap px-3 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors",
        active ? "text-prune-900" : "text-taupe hover:text-prune-900"
      )}
    >
      {children}
      <span className={cn("absolute inset-x-3 bottom-0 h-px bg-prune-900 transition-transform duration-500 ease-luxe", active ? "scale-x-100" : "scale-x-0")} />
    </Link>
  );
}
