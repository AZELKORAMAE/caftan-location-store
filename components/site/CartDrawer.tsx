"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OrderModal } from "@/components/shop/OrderModal";
import { lineKey, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useEscape, useLockBody } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const { items, isOpen, close, update, remove, subtotal, savings, shipping, deposit, count, clear } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const pathname = usePathname();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useLockBody(isOpen);
  useEscape(close, isOpen);

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => closeBtn.current?.focus(), 100);
  }, [isOpen]);

  return (
    <>
    <OrderModal
      open={orderOpen}
      onClose={() => setOrderOpen(false)}
      onOrdered={clear}
      lines={items.map((i) => ({ productId: i.productId, name: i.name, image: i.image, price: i.price, compareAt: i.compareAt, deposit: i.deposit, quantity: i.quantity, size: i.size, sizable: i.sizable, paidShipping: i.paidShipping }))}
    />
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Votre sélection">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="absolute inset-0 bg-prune-950/45" />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.28 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white"
          >
            <div className="flex h-16 items-center justify-between border-b border-sable px-6">
              <p className="eyebrow text-prune-900">
                Votre sélection {count > 0 && <span className="text-or-700">({count})</span>}
              </p>
              <button ref={closeBtn} type="button" onClick={close} aria-label="Fermer la sélection" className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-prune-900">
                <X className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag className="h-10 w-10 text-or-500" strokeWidth={1} />
                <p className="mt-6 font-serif text-3xl text-prune-900">Votre sélection est vide</p>
                <p className="mt-3 text-[15px] text-taupe">Choisissez la tenue de votre prochain événement.</p>
                <Link href="/boutique" onClick={close} className="btn-primary mt-8">
                  Voir les tenues
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-sable overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={lineKey(item)} className="flex gap-4 py-6">
                      <Link href={`/produit/${item.slug}`} onClick={close} className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#F6F1EB]">
                        {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover mix-blend-multiply" />}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        {item.collection && <p className="font-serif text-[15px] italic text-or-700">{item.collection}</p>}
                        <Link href={`/produit/${item.slug}`} onClick={close} className="text-[14px] leading-snug text-encre hover:underline">
                          {item.name}
                        </Link>
                        {item.size ? (
                          <p className="text-[12px] text-taupe">Taille : {item.size} · المقاس {item.size}</p>
                        ) : (
                          item.sizable && <p className="text-[12px] text-or-700">
                            Taille à préciser à la réservation · <span dir="rtl" lang="ar">المقاس يُحدَّد عند الحجز</span>
                          </p>
                        )}
                        <p className="mt-1 text-[13px] tabular-nums">
                          {item.compareAt && item.compareAt > item.price && (
                            <span className="mr-2 text-taupe line-through">{formatPrice(item.compareAt)}</span>
                          )}
                          <span className={item.compareAt && item.compareAt > item.price ? "text-prune-700" : "text-taupe"}>{formatPrice(item.price)}</span>
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityStepper
                            value={item.quantity}
                            max={Math.min(5, Math.max(item.stock, 1))}
                            onChange={(q) => update(lineKey(item), q)}
                            label={item.name}
                          />
                          <button
                            type="button"
                            onClick={() => remove(lineKey(item))}
                            className="min-h-[44px] cursor-pointer text-[11px] uppercase tracking-[0.15em] text-taupe underline-offset-4 hover:text-prune-900 hover:underline"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-sable bg-ivoire px-6 py-6">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-taupe">Location</span>
                    <span className="font-medium tabular-nums text-encre">{formatPrice(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="mt-2 flex items-center justify-between text-[14px]">
                      <span className="text-taupe">Vos économies</span>
                      <span className="font-medium tabular-nums text-prune-700">−{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[14px]">
                    <span className="text-taupe">Livraison</span>
                    {shipping > 0 ? <span className="tabular-nums text-encre">{formatPrice(shipping)}</span> : <span className="text-or-700">Offerte</span>}
                  </div>
                  {deposit > 0 && (
                    <div className="mt-2 flex items-center justify-between text-[14px]">
                      <span className="text-taupe">Caution (rendue au retour)</span>
                      <span className="tabular-nums text-encre">{formatPrice(deposit)}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      setOrderOpen(true);
                    }}
                    className="btn-primary mt-6 w-full"
                  >
                    Réserver
                  </button>
                  <button type="button" onClick={close} className="mt-3 min-h-[44px] w-full cursor-pointer text-[11px] font-medium uppercase tracking-[0.2em] text-prune-900 hover:text-or-700">
                    Continuer ma visite
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

export function QuantityStepper({ value, max, onChange, label }: { value: number; max: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center border border-sable">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Diminuer la quantité de ${label}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center text-prune-900 transition-colors hover:bg-champagne"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <span className="w-8 text-center text-[14px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Augmenter la quantité de ${label}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center text-prune-900 transition-colors hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
