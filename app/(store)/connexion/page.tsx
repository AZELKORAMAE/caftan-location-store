import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { EDITORIAL_IMAGES } from "@/lib/constants";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suivant?: string }> }) {
  const { suivant } = await searchParams;
  return (
    <AuthShell image={EDITORIAL_IMAGES.auth} quote="« Chaque fête mérite sa tenue. »">
      <p className="eyebrow text-or-700">Espace client</p>
      <h1 className="display mt-4 text-[40px] text-prune-900 md:text-[48px]">Bon retour parmi nous</h1>
      <p className="mb-10 mt-3 text-[15px] text-taupe">Connectez-vous pour suivre vos réservations.</p>
      <LoginForm next={suivant?.startsWith("/") ? suivant : "/compte"} />
    </AuthShell>
  );
}
