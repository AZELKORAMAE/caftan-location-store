import { Banknote, CalendarHeart, Scissors, Shirt, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { ParallaxImage } from "@/components/home/ParallaxImage";
import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EDITORIAL_IMAGES } from "@/lib/constants";
import { getBestSellers, getCollections, getNewArrivals } from "@/lib/data";
import { cn } from "@/lib/cn";

export const revalidate = 60;

const SERVICES = [
  { icon: Truck, title: "Livraison et retour", text: "Votre tenue arrive chez vous, repassée, deux jours avant l'événement." },
  { icon: Banknote, title: "Paiement à la livraison", text: "Vous réglez la location à la réception, sans avance en ligne." },
  { icon: Scissors, title: "Retouches incluses", text: "Ourlet et manches ajustés à vos mesures, sans supplément." },
  { icon: Sparkles, title: "Pressing inclus", text: "Chaque tenue est nettoyée et contrôlée avant et après chaque location." },
];

const STEPS = [
  { icon: Shirt, title: "Choisissez", text: "Parcourez nos caftans, takchitas et djellabas et choisissez votre coup de cœur." },
  { icon: CalendarHeart, title: "Réservez", text: "Indiquez la date de votre événement : nous vérifions la disponibilité aussitôt." },
  { icon: Sparkles, title: "Brillez", text: "Recevez votre tenue ajustée, profitez de votre soirée, puis rendez-la simplement." },
];

export default async function HomePage() {
  const [bestSellers, newest, collections] = await Promise.all([
    getBestSellers(10),
    getNewArrivals(12),
    getCollections(),
  ]);

  const featured = collections.find((c) => c.slug === "takchitas") ?? collections[0];

  const slides = [
    {
      image: EDITORIAL_IMAGES.hero[0],
      position: "50% 20%",
      eyebrow: "Saison des mariages",
      title: "Le caftan de vos plus belles soirées",
      text: "Caftans, takchitas et djellabas de créateurs à louer pour vos mariages, fiançailles et henné.",
      href: "/boutique",
      cta: "Voir les tenues",
    },
    {
      image: EDITORIAL_IMAGES.hero[1],
      position: "50% 30%",
      eyebrow: "Takchitas",
      title: "L'élégance, sans l'acheter",
      text: "Portez une pièce d'exception pour une soirée, à une fraction de son prix.",
      href: "/collections/takchitas",
      cta: "Découvrir",
    },
    {
      image: EDITORIAL_IMAGES.hero[2],
      position: "50% 25%",
      eyebrow: "Réservation en ligne",
      title: "Réservez pour votre date",
      text: "Choisissez la date de l'événement : la disponibilité de la tenue s'affiche aussitôt.",
      href: "/boutique?tri=nouveautes",
      cta: "Réserver",
    },
  ];

  return (
    <>
      <Hero slides={slides} />

      {/* Comment ça marche */}
      <section className="border-b border-sable bg-ivoire py-16 md:py-20">
        <div className="container">
          <SectionHeading eyebrow="Location en 3 étapes" title="Comment ça marche ?" />
          <RevealGroup className="mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <RevealItem key={title} className="text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-t-full border border-or-400 text-or-600">
                  <Icon className="h-6 w-6" strokeWidth={1.2} />
                  <span className="absolute -right-2 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-prune-900 text-[11px] font-semibold text-or-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-[26px] text-prune-900">{title}</h3>
                <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-taupe">{text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Les plus demandées : tenues cochées dans l'admin */}
      {bestSellers.length > 0 && (
      <section className="container py-20 md:py-28">
        <SectionHeading
          eyebrow="Les plus demandées"
          title="Les préférées de nos clientes"
          description="Les tenues les plus réservées de la saison : pensez à réserver tôt pour votre date."
        />
        <Reveal className="mt-14" delay={0.1}>
          <ProductCarousel products={bestSellers} label="Les plus demandées" />
        </Reveal>
      </section>
      )}

      {/* Collections (gérées depuis Admin → Collections) */}
      {collections.length > 0 && (
        <section className="bg-ivoire py-20 md:py-28">
          <div className="container">
            <SectionHeading eyebrow="Explorer" title="Louer par collection" />
            <RevealGroup
              className={cn(
                "mx-auto mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6",
                collections.length >= 4 ? "lg:grid-cols-4" : collections.length === 3 ? "lg:grid-cols-3" : "max-w-3xl"
              )}
            >
              {collections.map((c) => (
                <RevealItem key={c.id}>
                  <Link href={`/collections/${c.slug}`} className="group block text-center">
                    <div className="relative aspect-[3/4] overflow-hidden bg-champagne">
                      {c.image_url ? (
                        <Image
                          src={c.image_url}
                          alt={c.name}
                          fill
                          sizes="(min-width:1024px) 25vw, 50vw"
                          className="object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-script text-5xl text-or-500">DL</div>
                      )}
                      <div className="absolute inset-0 bg-prune-950/0 transition-colors duration-500 group-hover:bg-prune-950/10" />
                    </div>
                    <h3 className="mt-5 font-serif text-[22px] text-prune-900 md:text-[26px]">{c.name}</h3>
                    <span className="link-underline mt-2 text-[11px] text-or-700">Découvrir</span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* Éditorial : collection mise en avant */}
      {featured && (
        <section className="grid md:grid-cols-2">
          <ParallaxImage src={EDITORIAL_IMAGES.feature} alt={featured.name} className="aspect-[4/5] md:aspect-auto md:min-h-[720px]" />
          <div className="flex items-center bg-prune-900 px-6 py-20 md:px-16 lg:px-24">
            <Reveal className="max-w-md">
              <p className="eyebrow text-or-400">Collection</p>
              <h2 className="display mt-5 text-[44px] text-ivoire md:text-[60px]">{featured.name}</h2>
              <div className="my-8 h-px w-16 bg-or-500" />
              <p className="text-[15px] leading-relaxed text-or-100/85 md:text-base">{featured.description}</p>
              <Link href={`/collections/${featured.slug}`} className="btn-outline-light mt-10">
                Découvrir la collection
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Nouveautés (ordre réglé dans Admin → Page d'accueil) */}
      {newest.length > 0 && (
      <section className="container py-20 md:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" eyebrow="Nouveautés" title="Les dernières arrivées" className="max-w-xl" />
          <Reveal>
            <Link href="/boutique?tri=nouveautes" className="link-underline text-prune-900">
              Tout voir
            </Link>
          </Reveal>
        </div>
        <Reveal className="mt-12" delay={0.1}>
          <ProductCarousel products={newest} label="Nouveautés" />
        </Reveal>
      </section>
      )}

      <Marquee />

      {/* Essayage au showroom */}
      <section className="bg-champagne">
        <div className="container grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <Reveal className="order-2 md:order-1">
            <p className="eyebrow text-or-700">Sur rendez-vous</p>
            <h2 className="display mt-5 text-[40px] text-prune-900 md:text-[56px]">Essayez au showroom</h2>
            <div className="my-8 h-px w-16 bg-or-500" />
            <p className="max-w-md text-[15px] leading-relaxed text-taupe md:text-base">
              Vous hésitez entre deux tenues ? Venez les essayer dans notre salon à Casablanca. Notre couturière prend vos
              mesures et ajuste la tenue choisie pour qu&apos;elle tombe parfaitement le jour J.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/maison#showroom" className="btn-primary">
                Prendre rendez-vous
              </Link>
              <Link href="/maison#fonctionnement" className="btn-outline">
                Comment louer
              </Link>
            </div>
          </Reveal>
          <Reveal className="order-1 md:order-2" delay={0.15}>
            <div className="relative">
              <ParallaxImage src={EDITORIAL_IMAGES.essayage} alt="Caftan brodé porté lors d'un essayage" className="aspect-[4/5]" strength={8} />
              <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 border border-or-500 md:block" aria-hidden />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="container py-20 md:py-24">
        <RevealGroup className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <RevealItem key={title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-or-300 text-or-600">
                <Icon className="h-6 w-6" strokeWidth={1.2} />
              </div>
              <h3 className="mt-6 font-serif text-[24px] text-prune-900">{title}</h3>
              <p className="mx-auto mt-3 max-w-[30ch] text-[14px] leading-relaxed text-taupe">{text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
