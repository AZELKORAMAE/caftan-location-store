import { Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { BRAND, SOCIAL_LINKS, STORE } from "@/lib/constants";
import type { Collection } from "@/lib/types";
import { NewsletterForm } from "./NewsletterForm";

const ICONS = { instagram: InstagramIcon, facebook: FacebookIcon, tiktok: TikTokIcon, whatsapp: WhatsAppIcon };

export function Footer({ collections }: { collections: Pick<Collection, "name" | "slug">[] }) {
  const socials = SOCIAL_LINKS.filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden bg-prune-900 text-or-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 0%, #BB8656 0, transparent 45%), radial-gradient(circle at 90% 100%, #BB8656 0, transparent 40%)" }}
        aria-hidden
      />
      <div className="container relative">
        <div className="flex flex-col items-center border-b border-or-500/20 py-16 text-center md:py-20">
          <Logo tone="light" className="scale-125" />
          <h2 className="mt-10 font-serif text-3xl font-light text-ivoire md:text-4xl">Les nouvelles de Dar Lalla</h2>
          <p className="mt-3 max-w-md text-[15px] text-or-200/80">
            Nouvelles tenues, saison des mariages et offres privées : soyez les premières informées.
          </p>
          <div className="mt-8 flex w-full justify-center">
            <NewsletterForm />
          </div>
        </div>

        {/* Boutique physique */}
        <div className="border-b border-or-500/20 py-12">
          <h2 className="eyebrow text-center text-or-400">Notre showroom à Casablanca</h2>
          <p className="mt-3 text-center font-serif text-2xl font-light italic text-ivoire md:text-3xl">{STORE.tagline}</p>
          <div className="mt-10 grid gap-8 text-center sm:grid-cols-3">
            <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
              <MapPin className="h-6 w-6 text-or-400" strokeWidth={1.3} />
              <span className="mt-3 text-[14px] leading-relaxed text-or-100/85 group-hover:text-or-300">
                <span className="font-medium text-ivoire">{STORE.storeName}</span>
                <br />
                {STORE.addressLine1}
                <br />
                {STORE.addressLine2}
              </span>
              <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-or-400 underline-offset-4 group-hover:underline">Itinéraire</span>
            </a>
            <div className="flex flex-col items-center">
              <Clock className="h-6 w-6 text-or-400" strokeWidth={1.3} />
              <span className="mt-3 text-[14px] leading-relaxed text-or-100/85">
                Lundi – samedi : {STORE.hours}
                <br />
                {STORE.closed}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-6 w-6 text-or-400" strokeWidth={1.3} />
              <a href={STORE.phoneHref} className="mt-3 text-[14px] tabular-nums text-or-100/85 hover:text-or-300">
                {STORE.phone}
              </a>
              <a
                href={SOCIAL_LINKS[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-[36px] items-center gap-2 text-[14px] text-or-100/85 hover:text-or-300"
              >
                <InstagramIcon className="h-4 w-4 text-or-400" /> {STORE.instagramHandle}
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol title="Location">
            <FooterLink href="/boutique">Toutes les tenues</FooterLink>
            <FooterLink href="/boutique?tri=nouveautes">Nouveautés</FooterLink>
            <FooterLink href="/boutique?prix=petits-prix">Petits prix</FooterLink>
            <FooterLink href="/collections">Toutes les collections</FooterLink>
          </FooterCol>
          <FooterCol title="Collections">
            {collections.slice(0, 6).map((c) => (
              <FooterLink key={c.slug} href={`/collections/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Services">
            <FooterLink href="/maison#fonctionnement">Comment louer</FooterLink>
            <FooterLink href="/maison#services">Essayage au showroom</FooterLink>
            <FooterLink href="/maison#services">Retouches et pressing</FooterLink>
            <FooterLink href="/maison#questions">Questions fréquentes</FooterLink>
          </FooterCol>
          <FooterCol title="Dar Lalla">
            <FooterLink href="/maison">Notre histoire</FooterLink>
            <FooterLink href="/compte">Mon compte</FooterLink>
            <FooterLink href="/inscription">Créer un compte</FooterLink>
            <li>
              <a href={`mailto:${BRAND.email}`} className="inline-flex min-h-[36px] items-center break-all text-[14px] text-or-100/80 transition-colors hover:text-or-300">
                {BRAND.email}
              </a>
            </li>
          </FooterCol>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-or-500/20 py-8 md:flex-row">
          <p className="text-[12px] tracking-wide text-or-200/70">
            © {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}. Tous droits réservés.
            {/* Crédit obligatoire des photos de démonstration (CC BY-SA 4.0) : à retirer avec les photos */}
            <span className="mt-1 block text-[11px] text-or-200/50">
              Photos de démonstration : Yafit Vaknin, CC BY-SA 4.0, via Wikimedia Commons (modifiées).
            </span>
          </p>
          {socials.length > 0 && (
            <ul className="flex items-center gap-2">
              {socials.map((s) => {
                const Icon = ICONS[s.icon];
                return (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-11 w-11 items-center justify-center text-or-300 transition-colors hover:text-ivoire">
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-5 text-or-400">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-[36px] items-center text-[14px] text-or-100/80 transition-colors hover:text-or-300">
        {children}
      </Link>
    </li>
  );
}
