"use client";

import { CalendarCheck, CalendarX, Check, LoaderCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { QuantityStepper } from "@/components/site/CartDrawer";
import { EventDateField, eventDateError } from "@/components/shop/EventDateField";
import { OrderModal } from "@/components/shop/OrderModal";
import { checkAvailability } from "@/lib/availability";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { SIZES } from "@/lib/constants";
import { formatDayLong } from "@/lib/dates";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add, eventDate, setEventDate } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  // Exemplaires libres à la date choisie (null = pas encore vérifié)
  const [free, setFree] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const unavailable = product.stock <= 0;
  const max = Math.min(5, Math.max(free ?? product.stock, 1));

  // Vérifie la disponibilité dès que la date change
  useEffect(() => {
    setFree(null);
    if (!eventDate || eventDateError(eventDate)) return;
    let cancelled = false;
    setChecking(true);
    checkAvailability(product.id, eventDate, product.stock).then((n) => {
      if (cancelled) return;
      setFree(n);
      setChecking(false);
      setQty((q) => Math.max(1, Math.min(q, n || 1)));
    });
    return () => {
      cancelled = true;
    };
  }, [eventDate, product.id, product.stock]);

  const bookedOnDate = free === 0;

  const requireDate = () => {
    const err = eventDateError(eventDate);
    setDateError(err);
    if (err) document.getElementById("pdp-event-date")?.focus();
    return !err;
  };

  const line = {
    productId: product.id,
    name: product.name,
    image: product.images[0] ?? null,
    price: product.price,
    compareAt: product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : null,
    deposit: product.deposit,
    size: product.requires_size ? size : null,
    sizable: Boolean(product.requires_size),
    paidShipping: product.free_shipping === false,
  };

  const onAdd = () => {
    if (!requireDate() || bookedOnDate) return;
    add({ ...line, slug: product.slug, collection: product.collection?.name ?? null, stock: product.stock }, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const onReserve = () => {
    if (!requireDate() || bookedOnDate) return;
    setOrderOpen(true);
  };

  return (
    <div>
      {!unavailable && (
        <div className="mb-6">
          <EventDateField
            id="pdp-event-date"
            value={eventDate}
            onChange={(d) => {
              setEventDate(d);
              setDateError(null);
            }}
            error={dateError}
          />
          <p className="mt-2 min-h-[20px] text-[13px]" role="status" aria-live="polite">
            {checking ? (
              <span className="inline-flex items-center gap-2 text-taupe">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Vérification de la disponibilité…
              </span>
            ) : free === null ? (
              <span className="text-taupe">Choisissez la date pour vérifier la disponibilité de la tenue.</span>
            ) : bookedOnDate ? (
              <span className="inline-flex items-center gap-2 text-prune-600">
                <CalendarX className="h-4 w-4" strokeWidth={1.6} /> Déjà réservée autour du {formatDayLong(eventDate)}. Essayez une autre date.
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                <CalendarCheck className="h-4 w-4" strokeWidth={1.6} /> Disponible pour le {formatDayLong(eventDate)}
                {free <= 2 && ` (${free} exemplaire${free > 1 ? "s" : ""})`}
              </span>
            )}
          </p>
        </div>
      )}

      {product.requires_size && !unavailable && (
        <fieldset className="mb-6">
          <legend className="mb-3 flex w-full items-center justify-between text-[12px] font-medium uppercase tracking-[0.15em] text-encre">
            <span>
              Taille <span className="normal-case tracking-normal text-taupe">(facultatif)</span>
              <span dir="rtl" lang="ar" className="ml-2 normal-case tracking-normal text-taupe">
                المقاس (اختياري)
              </span>
            </span>
            {size && <span className="normal-case tracking-normal text-or-700">Taille {size} sélectionnée</span>}
          </legend>
          <div role="radiogroup" aria-label="Choisir une taille" className="grid grid-cols-6 gap-2 focus:outline-none">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize((cur) => (cur === s ? null : s))}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center border text-[14px] transition-colors",
                  size === s ? "border-prune-900 bg-prune-900 text-or-100" : "border-sable bg-white text-encre hover:border-prune-900"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-taupe">
            Vous pouvez laisser vide : nous ajustons la tenue à vos mesures lors de l&apos;essayage.
          </p>
        </fieldset>
      )}

      {unavailable ? (
        <p className="mb-3 text-[13px] text-prune-600">Cette tenue n&apos;est plus proposée à la location pour le moment.</p>
      ) : (
        <button
          type="button"
          onClick={onReserve}
          disabled={bookedOnDate || checking}
          className="btn-primary mb-3 w-full justify-between bg-prune-500 px-6 text-[13px] shadow-lg shadow-prune-500/30 hover:bg-prune-400"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-or-300" strokeWidth={1.8} /> Réserver cette tenue
          </span>
          <span dir="rtl" lang="ar" className="font-sans text-[15px] font-semibold normal-case tracking-normal">
            احجزي الآن
          </span>
        </button>
      )}
      <div className="flex gap-3">
        {!unavailable && <QuantityStepper value={qty} max={max} onChange={(v) => setQty(Math.max(1, v))} label={product.name} />}
        <button
          type="button"
          onClick={onAdd}
          disabled={unavailable || bookedOnDate || checking}
          className="btn-outline flex-1 whitespace-nowrap px-3 tracking-[0.1em] sm:px-4 sm:tracking-[0.2em]"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.8} /> Ajoutée
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> Ajouter à ma sélection
            </>
          )}
        </button>
      </div>
      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} lines={[{ ...line, quantity: qty }]} />
    </div>
  );
}
