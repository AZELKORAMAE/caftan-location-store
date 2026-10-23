"use client";

import { Banknote, ChevronDown, LoaderCircle, Lock, Ruler, ShoppingBag } from "lucide-react";
import { EventDateField, eventDateError } from "@/components/shop/EventDateField";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QuantityStepper } from "@/components/site/CartDrawer";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { lineKey, useCart } from "@/lib/cart";
import { EVENT_TYPES, SIZES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Form = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  event_type: string;
};

const EMPTY: Form = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Maroc",
  event_type: "",
};

type ErrorKey = "event_date" | "full_name" | "phone" | "address" | "city";

const REQUIRED: { key: "full_name" | "phone" | "address"; message: string }[] = [
  { key: "full_name", message: "Indiquez votre nom complet." },
  { key: "phone", message: "Indiquez un numéro de téléphone (WhatsApp) pour organiser la livraison." },
  { key: "address", message: "Indiquez l'adresse de livraison de la tenue." },
];

export function Checkout() {
  const router = useRouter();
  const { items, ready, subtotal, savings, shipping, deposit, eventDate, setEventDate, update, remove, setSize, clear } = useCart();
  const sizableMissing = items.filter((i) => i.sizable && !i.size).length;
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Pré-remplissage pour les clients connectés
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        full_name: f.full_name || profile?.full_name || "",
        phone: f.phone || profile?.phone || "",
      }));
    });
  }, []);

  const set = (key: "full_name" | "address" | "city") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key in errors) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    const dateErr = eventDateError(eventDate);
    if (dateErr) next.event_date = dateErr;
    for (const { key, message } of REQUIRED) if (!form[key].trim()) next[key] = message;
    if (form.phone && form.phone.replace(/\D/g, "").length < 8) next.phone = "Ce numéro semble trop court.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(first === "event_date" ? "#event_date" : `[name="${first}"]`)?.focus();
    return !first;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    if (!isSupabaseConfigured) {
      setServerError("Mode démo : connectez la base Supabase pour enregistrer les réservations (voir README).");
      return;
    }
    setSubmitting(true);
    const { data, error } = await createClient().rpc("place_order", {
      p_customer: { ...form, event_date: eventDate },
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size ?? null })),
    });
    if (error || !data) {
      setSubmitting(false);
      setServerError(error?.message || "La réservation n'a pas pu être enregistrée. Veuillez réessayer.");
      return;
    }
    const orderId = (data as { id: string }).id;
    // E-mail de confirmation à la cliente (n'empêche pas la réservation en cas d'échec)
    if (form.email) await fetch("/api/commande/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId }),
      keepalive: true,
    }).catch(() => {});
    clear();
    router.push(`/commande/${orderId}`);
  };

  if (!ready) {
    return <div className="skeleton mx-auto h-96 max-w-5xl" />;
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-or-500" strokeWidth={1} />
        <h2 className="mt-6 font-serif text-4xl text-prune-900">Votre sélection est vide</h2>
        <p className="mt-3 text-[15px] text-taupe">Découvrez nos caftans, takchitas et djellabas à louer.</p>
        <Link href="/boutique" className="btn-primary mt-8">
          Voir les tenues
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="min-w-0 space-y-12 lg:col-span-7">
        {/* Articles */}
        <section aria-labelledby="cart-title">
          <h2 id="cart-title" className="eyebrow mb-6 text-prune-900">
            1. Vos tenues
          </h2>
          {sizableMissing > 0 && (
            <p role="note" className="mb-4 flex items-start gap-3 border-l-2 border-or-500 bg-or-50 px-4 py-3 text-[14px] text-or-900">
              <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-or-700" strokeWidth={1.5} />
              <span>
                {sizableMissing > 1 ? `${sizableMissing} tenues de votre sélection existent` : "Une tenue de votre sélection existe"} en
                plusieurs tailles. Indiquez votre taille si vous la connaissez (facultatif) : sinon, nous l&apos;ajusterons lors de
                l&apos;essayage.
              </span>
            </p>
          )}
          <ul className="divide-y divide-sable border-y border-sable">
            {items.map((item) => (
              <li key={lineKey(item)} className="flex gap-5 py-6">
                <Link href={`/produit/${item.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden bg-[#F6F1EB] md:h-32 md:w-32">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover mix-blend-multiply" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {item.collection && <p className="font-serif text-[16px] italic text-or-700">{item.collection}</p>}
                      <Link href={`/produit/${item.slug}`} className="text-[15px] text-encre hover:underline">
                        {item.name}
                      </Link>
                      {!item.sizable && item.size && <p className="mt-0.5 text-[13px] text-taupe">Taille : {item.size}</p>}
                    </div>
                    <p className="shrink-0 text-right text-[15px] tabular-nums">
                      {item.compareAt && item.compareAt > item.price && (
                        <span className="block text-[13px] text-taupe line-through">{formatPrice(item.compareAt * item.quantity)}</span>
                      )}
                      <span className={item.compareAt && item.compareAt > item.price ? "text-prune-700" : ""}>{formatPrice(item.price * item.quantity)}</span>
                    </p>
                  </div>
                  {item.sizable && <SizeSelect value={item.size ?? null} onChange={(v) => setSize(lineKey(item), v)} id={`size-${lineKey(item)}`} />}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QuantityStepper value={item.quantity} max={Math.min(5, Math.max(item.stock, 1))} onChange={(q) => update(lineKey(item), q)} label={item.name} />
                    <button type="button" onClick={() => remove(lineKey(item))} className="min-h-[44px] cursor-pointer text-[11px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900 hover:underline">
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Informations acheteur */}
        <section aria-labelledby="shipping-title">
          <h2 id="shipping-title" className="eyebrow mb-6 text-prune-900">
            2. Votre événement et vos coordonnées
          </h2>
          <fieldset className="grid gap-5 sm:grid-cols-2" disabled={submitting}>
            <EventDateField
              id="event_date"
              value={eventDate}
              onChange={(d) => {
                setEventDate(d);
                if (errors.event_date) setErrors((er) => ({ ...er, event_date: undefined }));
              }}
              error={errors.event_date}
            />
            <div>
              <label htmlFor="event_type" className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-semibold text-encre">
                <span>
                  Type d&apos;événement <span className="font-normal text-taupe">(facultatif)</span>
                </span>
                <span dir="rtl">نوع المناسبة</span>
              </label>
              <div className="relative">
                <select
                  id="event_type"
                  name="event_type"
                  value={form.event_type}
                  onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
                  className="min-h-[50px] w-full cursor-pointer appearance-none rounded-md border border-sable bg-white px-3 pr-9 text-[16px] text-encre focus:border-prune-900 focus:outline-none"
                >
                  <option value="">Choisir</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-or-700" strokeWidth={1.5} />
              </div>
            </div>
            <Field label="Nom complet" name="full_name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} autoComplete="name" required className="sm:col-span-2" />
            <PhoneInput
              id="phone"
              label="Téléphone (WhatsApp)"
              value={form.phone}
              className="sm:col-span-2"
              onChange={(v) => {
                setForm((f) => ({ ...f, phone: v }));
                if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }));
              }}
              error={errors.phone}
              required
            />
            <Field label="Adresse" name="address" value={form.address} onChange={set("address")} error={errors.address} autoComplete="street-address" required className="sm:col-span-2" />
          </fieldset>
        </section>

        <section aria-labelledby="payment-title">
          <h2 id="payment-title" className="eyebrow mb-6 text-prune-900">
            3. Paiement
          </h2>
          <div className="flex items-start gap-4 border border-prune-900 bg-ivoire p-5">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-or-700" strokeWidth={1.4} />
            <div>
              <p className="text-[14px] font-medium text-encre">Paiement à la livraison</p>
              <p className="mt-1 text-[14px] text-taupe">
                Vous réglez la location et la caution à la réception de la tenue. La caution vous est rendue au retour de la tenue en
                bon état.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Récapitulatif */}
      <aside className="min-w-0 lg:col-span-5">
        <div className="bg-ivoire p-6 md:p-8 lg:sticky lg:top-[136px]">
          <h2 className="font-serif text-[28px] text-prune-900">Récapitulatif</h2>
          <dl className="mt-6 space-y-3 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-taupe">Location</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between">
                <dt className="text-taupe">Vos économies</dt>
                <dd className="font-medium tabular-nums text-prune-700">−{formatPrice(savings)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-taupe">Livraison</dt>
              {shipping > 0 ? <dd className="tabular-nums">{formatPrice(shipping)}</dd> : <dd className="text-or-700">Offerte</dd>}
            </div>
            <div className="flex justify-between">
              <dt className="text-taupe">Retouches et pressing</dt>
              <dd className="text-or-700">Inclus</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-sable pt-4">
              <dt className="text-[12px] font-medium uppercase tracking-[0.2em]">Total</dt>
              <dd className="font-serif text-[30px] tabular-nums text-prune-900">{formatPrice(subtotal + shipping)}</dd>
            </div>
            {deposit > 0 && (
              <div className="flex justify-between text-[13px]">
                <dt className="text-taupe">+ Caution, rendue au retour</dt>
                <dd className="tabular-nums text-taupe">{formatPrice(deposit)}</dd>
              </div>
            )}
          </dl>

          {serverError && (
            <p role="alert" className="mt-6 border-l-2 border-prune-600 bg-prune-50 px-4 py-3 text-[14px] text-prune-700">
              {serverError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Validation…
              </>
            ) : (
              "Confirmer la réservation"
            )}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-[12px] text-taupe">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Vos données sont protégées et ne sont jamais partagées.
          </p>
        </div>
      </aside>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
};

export function Field({ label, name, value, onChange, error, type = "text", autoComplete, required, className }: FieldProps) {
  const errId = `${name}-error`;
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label} {required && <span className="text-prune-600" aria-hidden>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={`field ${error ? "border-prune-600" : ""}`}
      />
      {error && (
        <p id={errId} role="alert" className="mt-2 text-[13px] text-prune-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SizeSelect({ id, value, onChange }: { id: string; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
      <label htmlFor={id} className="text-[12px] uppercase tracking-[0.12em] text-taupe">
        Taille <span className="normal-case tracking-normal">(facultatif)</span>
      </label>
      <div className="relative min-w-0 max-w-full">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={`min-h-[40px] w-full max-w-[240px] cursor-pointer appearance-none truncate border bg-white py-1.5 pl-3 pr-8 text-[14px] tabular-nums focus:border-prune-900 focus:outline-none ${value ? "border-prune-900 text-encre" : "border-or-400 text-taupe"}`}
        >
          <option value="">À préciser</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              Taille {s}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-or-700" strokeWidth={1.5} />
      </div>
    </div>
  );
}
