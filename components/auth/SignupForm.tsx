"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/shop/Checkout";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OtpVerify } from "./OtpVerify";
import { PasswordInput } from "./PasswordInput";

type Errors = Partial<Record<"full_name" | "email" | "phone" | "password" | "confirm" | "form", string>>;

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Errors = {};
    if (!form.full_name.trim()) e.full_name = "Indiquez votre nom complet.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Saisissez une adresse e-mail valide (ex. : nom@exemple.com).";
    if (password.length < 8) e.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (confirm !== password) e.confirm = "Les deux mots de passe ne correspondent pas.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!isSupabaseConfigured) {
      setErrors({ form: "La base de données n'est pas encore connectée (voir README)." });
      return;
    }
    setLoading(true);
    const { data, error } = await createClient().auth.signUp({
      email: form.email.trim(),
      password,
      options: {
        data: { full_name: form.full_name.trim(), phone: form.phone.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?suivant=/compte`,
      },
    });
    setLoading(false);
    if (error) {
      setErrors({
        form: error.message.includes("already registered") ? "Un compte existe déjà avec cette adresse. Connectez-vous." : error.message,
      });
      return;
    }
    // Supabase ne renvoie pas d'erreur pour une adresse déjà confirmée : l'identité est simplement vide
    if (data.user && data.user.identities?.length === 0) {
      setErrors({ form: "Un compte existe déjà avec cette adresse. Connectez-vous." });
      return;
    }
    if (data.session) {
      router.replace("/compte");
      router.refresh();
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return <OtpVerify email={form.email.trim()} onBack={() => setSent(false)} />;
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nom complet" name="full_name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} autoComplete="name" required />
      <Field label="E-mail" name="email" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
      <PhoneInput id="phone" label="Téléphone (WhatsApp)" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
      <PasswordInput id="password" label="Mot de passe" value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} hint="8 caractères minimum." />
      <PasswordInput id="confirm" label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
      {errors.form && (
        <p role="alert" className="border-l-2 border-prune-600 bg-prune-50 px-4 py-3 text-[14px] text-prune-700">
          {errors.form}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
      </button>
      <p className="text-center text-[14px] text-taupe">
        Déjà client ?{" "}
        <Link href="/connexion" className="text-prune-900 underline underline-offset-4 hover:text-or-700">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
