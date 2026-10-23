import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getCollections } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <section className="border-b border-sable bg-ivoire">
        <div className="container py-10 md:py-16">
          <Breadcrumbs items={[{ label: "Collections" }]} />
          <Reveal className="mx-auto mt-8 max-w-2xl text-center">
            <p className="eyebrow mb-4 text-or-700">Univers de la Maison</p>
            <h1 className="display text-[44px] text-prune-900 md:text-[64px]">Nos collections</h1>
            <p className="mt-5 text-[15px] leading-relaxed text-taupe md:text-base">
              Chaque collection raconte une histoire : celle d&apos;une matière, d&apos;une émotion, d&apos;un savoir-faire.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        {collections.length === 0 ? (
          <p className="py-20 text-center font-serif text-2xl text-prune-900">Les collections arrivent bientôt.</p>
        ) : (
          <RevealGroup className="grid gap-x-6 gap-y-14 md:grid-cols-2">
            {collections.map((c, i) => (
              <RevealItem key={c.id}>
                <Link href={`/collections/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-prune-900">
                    {c.image_url && (
                      <Image
                        src={c.image_url}
                        alt={c.name}
                        fill
                        priority={i < 2}
                        sizes="(min-width:768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-[1.05]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-prune-950/50 to-transparent" />
                  </div>
                  <div className="mt-6 text-center">
                    <h2 className="font-serif text-[30px] text-prune-900 md:text-[36px]">{c.name}</h2>
                    {c.description && <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-taupe">{c.description}</p>}
                    <span className="link-underline mt-4 text-or-700">Découvrir</span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </>
  );
}
