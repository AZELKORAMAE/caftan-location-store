"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleUser, LoaderCircle, MapPin, PartyPopper, X } from "lucide-react";
import { EventDateField, eventDateError } from "@/components/shop/EventDateField";
import { Guarantees } from "@/components/shop/Guarantees";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { EVENT_TYPES, SIZES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { depositTotal, shippingFee } from "@/lib/pricing";
import { useEscape, useLockBody } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type OrderLine = {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  compareAt?: number | null;
  /** Caution de la tenue */
  deposit?: number;
  quantity: number;
  size?: string | null;
  sizable?: boolean;
  /** Tenue sans livraison gratuite */
  paidShipping?: boolean;
};

/**
 * Formulaire de réservation express (arabe / français) : date et type d'événement, nom, adresse, téléphone.
 * Utilisé depuis la fiche produit (« Réserver ») et depuis la sélection.
 */
export function OrderModal({
  open,
  onClose,
  lines: initialLines,
  onOrdered,
}: {
  open: boolean;
  onClose: () => void;
  lines: OrderLine[];
  /** Appelé après une réservation réussie (ex. vider la sélection) */
  onOrdered?: () => void;
}) {
  const router = useRouter();
  const { eventDate, setEventDate } = useCart();
  const [lines, setLines] = useState(initialLines);
  const [eventType, setEventType] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ date?: string; name?: string; address?: string; phone?: string }>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useLockBody(open);
  useEscape(onClose, open);

  // À chaque ouverture : articles à jour + pré-remplissage si le client est connecté
  useEffect(() => {
    if (!open) return;
    setLines(initialLines);
    setServerError("");
    window.setTimeout(() => firstField.current?.focus(), 200);
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      setName((v) => v || profile?.full_name || "");
      setPhone((v) => v || profile?.phone || "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shipping = shippingFee(lines);
  const total = subtotal + shipping;
  const deposit = depositTotal(lines);
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const next: typeof errors = {};
    const dateErr = eventDateError(eventDate);
    if (dateErr) next.date = dateErr;
    if (!name.trim()) next.name = "الاسم مطلوب / Indiquez votre nom complet.";
    if (!address.trim()) next.address = "العنوان مطلوب / Indiquez votre adresse.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "رقم الهاتف غير صحيح / Numéro de téléphone invalide.";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!isSupabaseConfigured) {
      setServerError("Mode démo : connectez la base Supabase pour enregistrer les réservations.");
      return;
    }

    setSubmitting(true);
    const { data, error } = await createClient().rpc("place_order", {
      p_customer: {
        full_name: name,
        address,
        phone,
        city: "",
        email,
        country: "Maroc",
        event_date: eventDate,
        event_type: eventType,
      },
      p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity, size: l.size ?? null })),
    });
    if (error || !data) {
      setSubmitting(false);
      setServerError(error?.message || "La réservation n'a pas pu être enregistrée. Veuillez réessayer.");
      return;
    }
    const orderId = (data as { id: string }).id;
    if (email) {
      await fetch("/api/commande/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
        keepalive: true,
      }).catch(() => {});
    }
    onOrdered?.();
    router.push(`/commande/${orderId}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-prune-950/55 backdrop-blur-[2px]" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {/* En-tête */}
            <div className="flex items-start gap-3 border-b border-sable px-5 py-4">
              <h2 id="order-modal-title" dir="rtl" className="flex-1 text-center text-[15px] font-semibold leading-snug text-prune-900">
                املئي الاستمارة لحجز الزي والدفع عند الاستلام
                <span dir="ltr" className="mt-0.5 block text-[12px] font-normal text-taupe">
                  Remplissez le formulaire pour réserver · paiement à la livraison
                </span>
              </h2>
              <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-prune-900">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={submit} noValidate className="flex-1 overflow-y-auto px-5 pb-5">
              {/* Articles */}
              <ul className="divide-y divide-sable border-b border-sable">
                {lines.map((l, i) => (
                  <li key={`${l.productId}-${l.size ?? ""}-${i}`} className="flex items-center gap-3 py-3">
                    <span className="relative h-14 w-14 shrink-0 overflow-visible">
                      <span className="relative block h-14 w-14 overflow-hidden rounded-md bg-[#F6F1EB]">
                        {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-cover mix-blend-multiply" />}
                      </span>
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-taupe px-1 text-[11px] font-semibold text-white">
                        {l.quantity}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-encre">{l.name}</span>
                      {l.sizable ? (
                        <span className="relative mt-1 inline-block">
                          <label htmlFor={`om-size-${i}`} className="sr-only">
                            Taille
                          </label>
                          <select
                            id={`om-size-${i}`}
                            value={l.size ?? ""}
                            onChange={(e) => setLines((prev) => prev.map((x, j) => (j === i ? { ...x, size: e.target.value || null } : x)))}
                            className="min-h-[34px] cursor-pointer appearance-none rounded border border-sable bg-white py-1 pl-2 pr-7 text-[12px] text-encre focus:border-prune-900 focus:outline-none"
                          >
                            <option value="">Taille à préciser · المقاس لاحقاً</option>
                            {SIZES.map((s) => (
                              <option key={s} value={s}>
                                Taille {s} · المقاس {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-or-700" />
                        </span>
                      ) : (
                        l.size && <span className="block text-[12px] text-taupe">Taille {l.size} · المقاس {l.size}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-right text-[14px] font-semibold tabular-nums text-encre">
                      {l.compareAt && l.compareAt > l.price && (
                        <span className="block text-[11px] font-normal text-taupe line-through">{formatPrice(l.compareAt * l.quantity)}</span>
                      )}
                      {formatPrice(l.price * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="flex items-center justify-between gap-3 border-b border-sable py-2.5 text-[13px]">
                <span className="text-taupe">
                  Livraison · <span dir="rtl" lang="ar">التوصيل</span>
                </span>
                {shipping > 0 ? (
                  <span className="font-semibold tabular-nums text-encre">{formatPrice(shipping)}</span>
                ) : (
                  <span className="text-or-700">
                    Offerte · <span dir="rtl" lang="ar">مجاني</span>
                  </span>
                )}
              </p>
              {deposit > 0 && (
                <p className="flex items-center justify-between gap-3 border-b border-sable py-2.5 text-[13px]">
                  <span className="text-taupe">
                    Caution rendue au retour · <span dir="rtl" lang="ar">الضمانة</span>
                  </span>
                  <span className="tabular-nums text-encre">{formatPrice(deposit)}</span>
                </p>
              )}
              {lines.length > 1 && (
                <p className="flex justify-between border-b border-sable py-3 text-[14px]">
                  <span className="text-taupe">Total location ({count} tenues)</span>
                  <span className="font-semibold tabular-nums text-prune-900">{formatPrice(total)}</span>
                </p>
              )}

              {/* Champs */}
              <div className="mt-5 space-y-4">
                <EventDateField
                  id="om-event-date"
                  value={eventDate}
                  onChange={(d) => {
                    setEventDate(d);
                    setErrors((er) => ({ ...er, date: undefined }));
                  }}
                  error={errors.date}
                />
                <div>
                  <label htmlFor="om-event-type" className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-semibold text-encre">
                    <span>
                      Type d&apos;événement <span className="font-normal text-taupe">(facultatif)</span>
                    </span>
                    <span dir="rtl">نوع المناسبة</span>
                  </label>
                  <div className="relative flex overflow-hidden rounded-md border border-sable bg-white focus-within:border-prune-900">
                    <span className="flex w-12 shrink-0 items-center justify-center border-r border-sable bg-ivoire text-prune-900" aria-hidden>
                      <PartyPopper className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <select
                      id="om-event-type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="min-h-[48px] w-full min-w-0 cursor-pointer appearance-none bg-transparent px-3 pr-9 text-[16px] text-encre focus:outline-none"
                    >
                      <option value="">Choisir · اختاري</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-or-700" />
                  </div>
                </div>
                <ModalField id="om-name" ar="الاسم الكامل" fr="Nom complet" icon={<CircleUser className="h-5 w-5" strokeWidth={1.5} />} error={errors.name}>
                  <input
                    ref={firstField}
                    id="om-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="الاسم الكامل / Nom complet"
                    className="min-h-[48px] w-full min-w-0 bg-transparent px-3 text-[16px] text-encre placeholder:text-taupe/60 focus:outline-none"
                  />
                </ModalField>
                <ModalField id="om-address" ar="العنوان" fr="Adresse" icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />} error={errors.address}>
                  <input
                    id="om-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    placeholder="العنوان / Adresse"
                    className="min-h-[48px] w-full min-w-0 bg-transparent px-3 text-[16px] text-encre placeholder:text-taupe/60 focus:outline-none"
                  />
                </ModalField>
                <div>
                  <PhoneInput id="om-phone" label="رقم الهاتف / Numéro" value={phone} onChange={setPhone} error={errors.phone} required />
                </div>

              </div>

              {serverError && (
                <p role="alert" className="mt-4 rounded-md bg-prune-50 px-3 py-2 text-[13px] text-prune-700">
                  {serverError}
                </p>
              )}

              <button type="submit" disabled={submitting || !lines.length} className="btn-primary mt-5 w-full rounded-md bg-prune-600 px-4 text-[13px] tracking-[0.12em] hover:bg-prune-500">
                {submitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="whitespace-nowrap">
                      Réserver<span className="hidden sm:inline"> ma tenue</span>
                    </span>
                    <span className="rounded bg-white/10 px-2.5 py-1 text-[13px] font-semibold tabular-nums tracking-normal text-or-200">{formatPrice(total)}</span>
                    <span dir="rtl" lang="ar" className="whitespace-nowrap font-sans text-[15px] font-semibold normal-case tracking-normal">
                      تأكيد الحجز
                    </span>
                  </span>
                )}
              </button>
              <a
                href={whatsappOrderUrl({ lines, shipping, name, address, phone, eventDate, eventType })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-[#25D366] px-4 text-[13px] font-medium text-[#128C4B] transition-colors hover:bg-[#25D366]/10"
              >
                <span className="inline-flex items-center gap-2">
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                  Réserver via WhatsApp
                </span>
                <span dir="rtl" lang="ar" className="font-semibold">
                  احجزي عبر واتساب
                </span>
              </a>
              <Guarantees className="mt-4" freeShipping={shipping === 0} />
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ModalField({ id, ar, fr, icon, error, children }: { id: string; ar: string; fr: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-semibold text-encre">
        <span>
          {fr} <span className="text-prune-600">*</span>
        </span>
        <span dir="rtl">{ar}</span>
      </label>
      <div className={`flex overflow-hidden rounded-md border bg-white focus-within:border-prune-900 ${error ? "border-prune-600" : "border-sable"}`}>
        <span className="flex w-12 shrink-0 items-center justify-center border-r border-sable bg-ivoire text-prune-900" aria-hidden>
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-prune-600">
          {error}
        </p>
      )}
    </div>
  );
}
