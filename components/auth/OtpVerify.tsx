"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Supabase envoie 6 à 10 chiffres selon le réglage « Email OTP Length » du projet
const MIN = 6;
const MAX = 10;
const RESEND_DELAY = 60;

/** Saisie du code de confirmation reçu par e-mail. */
export function OtpVerify({ email, next = "/compte", onBack }: { email: string; next?: string; onBack?: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_DELAY);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const verify = async (value: string) => {
    if (value.length < MIN) {
      setError(`Le code contient au moins ${MIN} chiffres.`);
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    const supabase = createClient();
    let { error: err } = await supabase.auth.verifyOtp({ email, token: value, type: "email" });
    if (err) ({ error: err } = await supabase.auth.verifyOtp({ email, token: value, type: "signup" }));
    if (err) {
      setLoading(false);
      // Supabase renvoie le même message pour un code faux ou expiré
      setError("Code incorrect ou expiré. Vérifiez qu'il s'agit du dernier code reçu, en entier, ou demandez-en un nouveau.");
      input.current?.select();
      return;
    }
    router.replace(next);
    router.refresh();
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, MAX);
    setCode(digits);
    if (error) setError("");
    // Collage ou remplissage automatique d'un code complet : validation immédiate
    if (digits.length >= MIN && raw.replace(/\D/g, "").length - code.length > 1) verify(digits);
  };

  const resend = async () => {
    setError("");
    setInfo("");
    const { error: err } = await createClient().auth.resend({ type: "signup", email });
    if (err) {
      setError(/rate|seconds/i.test(err.message) ? "Patientez quelques instants avant de redemander un code." : err.message);
      return;
    }
    setCode("");
    setInfo("Un nouveau code vient d'être envoyé. Les codes précédents ne sont plus valables.");
    setCooldown(RESEND_DELAY);
    input.current?.focus();
  };

  return (
    <div className="text-center">
      <MailCheck className="mx-auto h-12 w-12 text-or-600" strokeWidth={1} />
      <h2 className="mt-6 font-serif text-3xl text-prune-900">Confirmez votre adresse</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-taupe">
        Saisissez le code reçu par e-mail à <strong className="font-medium text-encre">{email}</strong>.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="mt-8"
      >
        <label htmlFor="otp" className="sr-only">
          Code de confirmation
        </label>
        <input
          ref={input}
          id="otp"
          name="otp"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          disabled={loading}
          aria-invalid={!!error}
          aria-describedby="otp-help"
          className={`h-16 w-full border bg-white text-center font-serif text-[32px] tracking-[0.4em] text-prune-900 placeholder:text-sable focus:border-prune-900 focus:outline-none ${
            error ? "border-prune-600" : code.length >= MIN ? "border-or-500" : "border-sable"
          }`}
        />
        <p id="otp-help" className="mt-2 text-[12px] text-taupe">
          Copiez-collez le code complet tel qu&apos;il apparaît dans l&apos;e-mail.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-[14px] text-prune-600">
            {error}
          </p>
        )}
        {info && !error && (
          <p role="status" className="mt-4 text-[14px] text-emerald-700">
            {info}
          </p>
        )}

        <button type="submit" disabled={loading || code.length < MIN} className="btn-primary mt-6 w-full">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Valider le code"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-[14px] text-taupe">
        <p>
          Pas reçu ? Vérifiez vos courriers indésirables, ou{" "}
          {cooldown > 0 ? (
            <span className="tabular-nums">renvoyez un code dans {cooldown} s</span>
          ) : (
            <button type="button" onClick={resend} className="cursor-pointer text-prune-900 underline underline-offset-4 hover:text-or-700">
              renvoyez un code
            </button>
          )}
          .
        </p>
        {onBack && (
          <button type="button" onClick={onBack} className="min-h-[44px] cursor-pointer text-[12px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900">
            ← Modifier l&apos;adresse e-mail
          </button>
        )}
      </div>
    </div>
  );
}
