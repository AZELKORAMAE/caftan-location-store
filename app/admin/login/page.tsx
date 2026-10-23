import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { EDITORIAL_IMAGES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-prune-950 px-5 py-12">
      <Image src={EDITORIAL_IMAGES.admin} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-prune-950/90 via-prune-900/80 to-prune-950/95" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo-gold.png" alt="Dar Lalla" width={120} height={122} className="h-auto w-[100px]" />
          <p className="eyebrow mt-6 text-or-300">Espace d&apos;administration</p>
        </div>
        <div className="bg-white p-8 shadow-2xl shadow-prune-950/50 md:p-10">
          <h1 className="font-serif text-[34px] font-light text-prune-900">Connexion</h1>
          <p className="mb-8 mt-2 text-[14px] text-taupe">Accès réservé à l&apos;équipe Dar Lalla.</p>
          {!isSupabaseConfigured && (
            <p className="mb-6 border-l-2 border-or-500 bg-or-50 px-4 py-3 text-[13px] text-or-800">
              Supabase n&apos;est pas encore configuré : renseignez les clés dans <code>.env.local</code> (voir README).
            </p>
          )}
          <LoginForm next="/admin" adminOnly />
        </div>
        <p className="mt-8 text-center">
          <Link href="/" className="text-[12px] uppercase tracking-[0.2em] text-or-200 hover:text-or-100">
            ← Retour à la boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
