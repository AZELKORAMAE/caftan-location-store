import { Flame } from "lucide-react";
import { Guarantees } from "@/components/shop/Guarantees";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AccordionItem } from "@/components/ui/Accordion";
import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProduct, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getPromo, SHIPPING_FEE } from "@/lib/pricing";
import { BRAND, BUFFER_DAYS, STORE } from "@/lib/constants";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Tenue introuvable" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  let related = product.collection_id ? await getProducts({ collectionId: product.collection_id, excludeId: product.id, limit: 10 }) : [];
  if (related.length < 4) related = [...related, ...(await getProducts({ featured: true, excludeId: product.id, limit: 8 }))].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);

  const promo = getPromo(product.price, product.compare_at_price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: BRAND.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY || "MAD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container pt-6 md:pt-10">
        <Breadcrumbs
          items={[
            product.collection
              ? { label: product.collection.name, href: `/collections/${product.collection.slug}` }
              : { label: "Toutes les tenues", href: "/boutique" },
            { label: product.name },
          ]}
        />
      </div>

      <section className="container grid gap-10 py-8 md:py-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[136px]">
            <Reveal y={16}>
              {product.is_featured && (
                <p className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-or-500 text-prune-950" title="Très demandée">
                  <Flame className="h-4 w-4" strokeWidth={2} aria-hidden />
                  <span className="sr-only">Très demandée</span>
                </p>
              )}
              {product.collection && (
                <Link href={`/collections/${product.collection.slug}`} className="font-serif text-[22px] italic text-or-700 hover:text-or-600">
                  {product.collection.name}
                </Link>
              )}
              <h1 className="mt-2 font-serif text-[34px] font-light leading-tight text-prune-900 md:text-[44px]">{product.name}</h1>
              {product.material && <p className="mt-3 text-[14px] text-taupe">{product.material}</p>}
              <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 tabular-nums">
                {promo && (
                  <span className="text-[17px] text-taupe line-through decoration-taupe/70">
                    <span className="sr-only">Prix initial : </span>
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                <span className={promo ? "text-[24px] font-medium text-prune-700" : "text-[22px] text-encre"}>
                  {promo && <span className="sr-only">Prix promotionnel : </span>}
                  {formatPrice(product.price)}
                </span>
                <span className="text-[13px] text-taupe">la location</span>
                {promo && (
                  <span className="self-center bg-prune-900 px-2.5 py-1 text-[12px] font-semibold tracking-wide text-or-200">−{promo.percent} %</span>
                )}
              </div>
              {promo && <p className="mt-2 text-[13px] text-or-700">Vous économisez {formatPrice(promo.amount)}</p>}
              {product.deposit > 0 && (
                <p className="mt-2 text-[13px] text-taupe">
                  + caution de {formatPrice(product.deposit)}, rendue au retour de la tenue
                </p>
              )}
              <div className="my-8 h-px bg-sable" />
              <AddToCart product={product} />

              <Guarantees className="mt-8" freeShipping={product.free_shipping !== false} />

              <div className="mt-10 border-t border-sable">
                <AccordionItem title="Description" defaultOpen>
                  <p>{product.description}</p>
                </AccordionItem>
                {product.details && (
                  <AccordionItem title="Détails de la tenue">
                    <ul className="space-y-2">
                      {product.details.split("\n").filter(Boolean).map((line) => (
                        <li key={line} className="flex gap-3">
                          <span className="mt-2.5 h-px w-3 shrink-0 bg-or-500" aria-hidden />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </AccordionItem>
                )}
                <AccordionItem title="Comment se passe la location ?">
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>Vous réservez la tenue pour la date de votre événement.</li>
                    <li>Nous vous appelons pour confirmer et, si vous le souhaitez, organiser un essayage au showroom.</li>
                    <li>
                      La tenue vous est livrée (ou vous la retirez) {BUFFER_DAYS} jours avant l&apos;événement, ajustée et repassée.
                      {product.free_shipping === false ? ` Livraison : ${SHIPPING_FEE} MAD.` : " Livraison offerte."}
                    </li>
                    <li>Vous la rendez dans les {BUFFER_DAYS} jours qui suivent : la caution vous est rendue aussitôt.</li>
                  </ol>
                </AccordionItem>
                <AccordionItem title="Caution, retouches et pressing">
                  <p>
                    La caution est versée à la réception de la tenue et rendue à son retour en bon état. Les petites retouches
                    (ourlet, manches) et le pressing sont inclus dans le prix de la location.
                  </p>
                  <p className="mt-3">
                    Une question ? Écrivez-nous sur WhatsApp au{" "}
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-prune-900 underline underline-offset-4">
                      {STORE.phone}
                    </a>
                    .
                  </p>
                </AccordionItem>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container border-t border-sable py-20 md:py-24">
          <SectionHeading eyebrow="Vous aimerez aussi" title="Tenues similaires" />
          <Reveal className="mt-12">
            <ProductCarousel products={related} label="Tenues similaires" />
          </Reveal>
        </section>
      )}
    </>
  );
}
