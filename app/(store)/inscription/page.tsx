import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { EDITORIAL_IMAGES } from "@/lib/constants";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <AuthShell image={EDITORIAL_IMAGES.hero[1]} quote="« Rejoignez Dar Lalla et réservez vos tenues en un instant. »">
      <p className="eyebrow text-or-700">Inscription</p>
      <h1 className="display mt-4 text-[40px] text-prune-900 md:text-[48px]">Créer votre compte</h1>
      <p className="mb-10 mt-3 text-[15px] text-taupe">Suivez vos réservations et réservez plus rapidement.</p>
      <SignupForm />
    </AuthShell>
  );
}
