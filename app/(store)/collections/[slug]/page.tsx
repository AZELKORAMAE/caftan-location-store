import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SortSelect } from "@/components/shop/SortSelect";
import { Reveal } from "@/components/ui/Reveal";
import { getCollection, getProducts } from "@/lib/data";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ tri?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Collection introuvable" };
  return {
    title: collection.name,
    description: collection.description ?? undefined,
    openGraph: collection.image_url ? { images: [collection.image_url] } : undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, { tri }] = await Promise.all([params, searchParams]);
  const collection = await getCollection(slug);
  if (!collection) notFound();
  const products = await getProducts({ collectionId: collection.id, sort: tri });

  return (
    <>
      <section className="relative flex h-[56svh] min-h-[420px] items-end overflow-hidden bg-prune-950 md:h-[68vh]">
        {collection.image_url && (
          <Image src={collection.image_url} alt="" fill priority sizes="100vw" className="animate-ken-burns object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-prune-950/90 via-prune-950/30 to-prune-950/10" />
        <div className="container relative pb-14 md:pb-20">
          <Reveal className="max-w-2xl text-ivoire">
            <p className="eyebrow text-or-300">Collection</p>
            <h1 className="display mt-4 text-[52px] md:text-[84px]">{collection.name}</h1>
            {collection.description && <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-or-100/90 md:text-base">{collection.description}</p>}
          </Reveal>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="mb-10 flex flex-col gap-6 border-b border-sable pb-6 md:flex-row md:items-center md:justify-between">
          <Breadcrumbs items={[{ label: "Collections", href: "/collections" }, { label: collection.name }]} />
          <div className="flex items-center justify-between gap-8">
            <span className="text-[12px] tabular-nums text-taupe">
              {products.length} tenue{products.length > 1 ? "s" : ""}
            </span>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
