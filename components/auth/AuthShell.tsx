import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/** Mise en page écran partagé : visuel prune à gauche, formulaire à droite. */
export function AuthShell({ image, quote, children }: { image: string; quote: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100svh-36px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-prune-950 lg:block">
        <Image src={image} alt="" fill priority sizes="50vw" className="animate-ken-burns object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-prune-950 via-prune-950/40 to-prune-950/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-between p-12 text-center">
          <Link href="/" aria-label="Retour à l'accueil">
            <Image src="/logo-gold.png" alt="Dar Lalla" width={130} height={132} className="h-auto w-[120px]" />
          </Link>
          <p className="max-w-sm font-serif text-3xl font-light italic leading-snug text-ivoire">{quote}</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-14 md:px-12">
        <Reveal className="w-full max-w-md" y={20}>
          {children}
        </Reveal>
      </div>
    </div>
  );
}
