import { Banknote, Clock, Crown, MapPin, MessageCircle, Phone, Scissors, Sparkles, Truck } from "lucide-react";
import { AccordionItem } from "@/components/ui/Accordion";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ParallaxImage } from "@/components/home/ParallaxImage";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EDITORIAL_IMAGES, SOCIAL_LINKS, STORE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dar Lalla",
  description: "Notre histoire, le fonctionnement de la location et les services de Dar Lalla, location de caftans à Casablanca.",
};

const STEPS = [
  { title: "Choisissez votre tenue", text: "En ligne ou au showroom, parmi nos caftans, takchitas, tenues de mariée et djellabas." },
  { title: "Réservez votre date", text: "Indiquez la date de l'événement : la tenue est bloquée pour vous, aucune avance n'est demandée en ligne." },
  { title: "Essayage et retouches", text: "Nous vous appelons pour confirmer. Essayage au showroom si vous le souhaitez, retouches incluses." },
  { title: "Livraison 2 jours avant", text: "La tenue arrive chez vous repassée. Vous réglez la location et la caution à la réception." },
  { title: "Retour 2 jours après", text: "Nous récupérons la tenue (ou vous la déposez). La caution vous est rendue aussitôt." },
];

const SERVICES = [
  { icon: Truck, title: "Livraison et retour", text: "Livraison et reprise de la tenue à domicile à Casablanca ; retrait possible au showroom." },
  { icon: Banknote, title: "Paiement à la livraison", text: "Aucun paiement en ligne : vous réglez la location à la réception de la tenue." },
  { icon: Scissors, title: "Retouches incluses", text: "Ourlet, manches, ceinture : notre couturière ajuste la tenue à vos mesures." },
  { icon: Sparkles, title: "Pressing inclus", text: "Chaque tenue est nettoyée, contrôlée et repassée avant chaque location." },
  { icon: Crown, title: "Accessoires assortis", text: "Ceinture (mdamma), diadème et babouches à ajouter à votre réservation." },
  { icon: MessageCircle, title: "Conseil sur WhatsApp", text: `Une question sur une tenue ou une taille ? Écrivez-nous au ${STORE.phone}.` },
];

const FAQ = [
  {
    q: "Combien de temps à l'avance faut-il réserver ?",
    a: "Dès que vous connaissez la date ! Les réservations sont ouvertes jusqu'à un an à l'avance. En pleine saison des mariages (été), les tenues les plus demandées partent vite.",
  },
  {
    q: "Comment fonctionne la caution ?",
    a: "La caution est indiquée sur chaque tenue. Vous la versez à la réception, en même temps que la location, et elle vous est rendue au retour de la tenue en bon état.",
  },
  {
    q: "Et si la tenue ne me va pas ?",
    a: "Nous ajustons la tenue à vos mesures (retouches incluses). Si elle ne vous convient vraiment pas à l'essayage, nous vous proposons une autre tenue disponible à votre date.",
  },
  {
    q: "Que se passe-t-il en cas de tache ou d'accroc ?",
    a: "Le pressing est inclus : les petites taches du quotidien ne sont pas facturées. Seuls les dommages importants (déchirure, brûlure) peuvent être retenus sur la caution, après accord avec vous.",
  },
  {
    q: "Puis-je annuler ma réservation ?",
    a: "Oui, gratuitement jusqu'à 7 jours avant l'événement : il suffit de nous écrire sur WhatsApp.",
  },
];

export default function MaisonPage() {
  return (
    <>
      <section className="relative flex h-[60svh] min-h-[440px] items-center justify-center overflow-hidden bg-prune-950 text-center">
        <Image src={EDITORIAL_IMAGES.atelier} alt="" fill priority sizes="100vw" className="animate-ken-burns object-cover opacity-50" />
        <div className="absolute inset-0 bg-prune-950/50" />
        <Reveal className="container relative">
          <Image src="/logo-gold.png" alt="" width={120} height={123} className="mx-auto h-auto w-[110px]" />
          <h1 className="display mt-8 text-[48px] text-ivoire md:text-[76px]">Dar Lalla</h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-or-100/90 md:text-base">
            La maison du caftan à louer : des tenues de créateurs pour chaque fête, sans avoir à les acheter.
          </p>
        </Reveal>
      </section>

      <section className="container grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-or-700">Notre histoire</p>
          <h2 className="display mt-5 text-[38px] text-prune-900 md:text-[52px]">Une tenue d&apos;exception pour chaque fête</h2>
          <div className="my-8 h-px w-16 bg-or-500" />
          <div className="space-y-5 text-[15px] leading-relaxed text-taupe md:text-base">
            <p>
              Mariage d&apos;une sœur, fiançailles d&apos;une amie, henné, aqiqa : chaque fête mérite sa tenue. Dar Lalla est née
              d&apos;une idée simple : permettre à chacune de porter un caftan de créateur sans devoir l&apos;acheter.
            </p>
            <p>
              Nos tenues sont choisies auprès de maâlems et de stylistes marocains : broderies au fil d&apos;or, sfifa et aâkad
              faits main, velours, brocart et mousseline. Elles sont entretenues avec soin entre chaque location.
            </p>
          </div>
        </Reveal>
        <ParallaxImage src={EDITORIAL_IMAGES.hero[1]} alt="Caftan porté lors d'une soirée" className="aspect-[4/5]" />
      </section>

      <section id="fonctionnement" className="scroll-mt-32 border-y border-sable py-20 md:py-24">
        <div className="container">
          <SectionHeading eyebrow="Pas à pas" title="Comment louer votre tenue" />
          <RevealGroup className="mx-auto mt-14 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(({ title, text }, i) => (
              <RevealItem key={title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-t-full border border-or-400 font-serif text-[26px] text-prune-900">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-serif text-[22px] text-prune-900">{title}</h3>
                <p className="mx-auto mt-2 max-w-[28ch] text-[14px] leading-relaxed text-taupe">{text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="services" className="scroll-mt-32 bg-ivoire py-20 md:py-28">
        <div className="container">
          <SectionHeading eyebrow="À votre service" title="Tout est inclus" />
          <RevealGroup className="mt-14 grid gap-px bg-sable sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <RevealItem key={title} className="bg-ivoire p-8 md:p-10">
                <Icon className="h-7 w-7 text-or-600" strokeWidth={1.2} />
                <h3 className="mt-6 font-serif text-[24px] text-prune-900">{title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-taupe">{text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="showroom" className="scroll-mt-32">
        <div className="grid md:grid-cols-2">
          <div className="flex items-center bg-prune-900 px-6 py-16 md:px-16 lg:px-24">
            <Reveal className="max-w-md">
              <p className="eyebrow text-or-400">Visitez-nous</p>
              <h2 className="display mt-5 text-[40px] text-ivoire md:text-[54px]">Notre showroom</h2>
              <p className="mt-3 font-serif text-xl italic text-or-300">{STORE.tagline}</p>
              <div className="my-8 h-px w-16 bg-or-500" />
              <ul className="space-y-5 text-[15px] text-or-100/90">
                <li className="flex gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-or-400" strokeWidth={1.3} />
                  <span>
                    <span className="font-medium text-ivoire">{STORE.storeName}</span>
                    <br />
                    {STORE.addressLine1}
                    <br />
                    {STORE.addressLine2}
                  </span>
                </li>
                <li className="flex gap-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-or-400" strokeWidth={1.3} />
                  <span>
                    Lundi – samedi : {STORE.hours}
                    <br />
                    {STORE.closed}
                  </span>
                </li>
                <li className="flex gap-4">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-or-400" strokeWidth={1.3} />
                  <a href={STORE.phoneHref} className="tabular-nums hover:text-or-300">
                    {STORE.phone}
                  </a>
                </li>
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  Itinéraire
                </a>
                <a href={SOCIAL_LINKS[0].href} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
                  <InstagramIcon className="h-4 w-4" /> {STORE.instagramHandle}
                </a>
              </div>
            </Reveal>
          </div>
          <iframe
            src={STORE.mapsEmbed}
            title={`Plan d'accès au ${STORE.storeName}, ${STORE.addressLine1}, ${STORE.addressLine2}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[380px] w-full border-0 grayscale-[35%] md:h-auto md:min-h-[560px]"
          />
        </div>
      </section>

      <section id="questions" className="container scroll-mt-32 py-20 md:py-28">
        <SectionHeading eyebrow="Questions fréquentes" title="Tout savoir sur la location" />
        <div className="mx-auto mt-12 max-w-3xl border-t border-sable">
          {FAQ.map(({ q, a }, i) => (
            <AccordionItem key={q} title={q} defaultOpen={i === 0}>
              <p>{a}</p>
            </AccordionItem>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/boutique" className="btn-primary">
            Voir les tenues
          </Link>
        </div>
      </section>
    </>
  );
}
