"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMessage("Merci de saisir une adresse e-mail valide.");
      return;
    }
    setState("loading");
    if (isSupabaseConfigured) {
      const { error } = await createClient().from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
      if (error && error.code !== "23505") {
        setState("error");
        setMessage("Une erreur est survenue. Veuillez réessayer.");
        return;
      }
    }
    setState("done");
    setMessage("Merci ! Vous recevrez bientôt les nouvelles de la Maison.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse e-mail
      </label>
      <div className="flex items-center border-b border-or-500/60 focus-within:border-or-300">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className="min-h-[48px] w-full bg-transparent text-[16px] text-ivoire placeholder:text-or-200/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label="S'inscrire à la newsletter"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-or-300 transition-transform hover:translate-x-1 disabled:opacity-50"
        >
          {state === "loading" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" strokeWidth={1.4} />}
        </button>
      </div>
      <p role="status" className={`mt-3 min-h-[20px] text-[13px] ${state === "error" ? "text-prune-200" : "text-or-200"}`}>
        {message}
      </p>
    </form>
  );
}
