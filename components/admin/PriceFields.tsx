"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { DEFAULT_PROMO_MARKUP, getPromo, percentFromPrices, priceFromPercent } from "@/lib/pricing";

const toNum = (v: string) => {
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return v.trim() === "" || Number.isNaN(n) ? null : n;
};
const fmt = (n: number | null) => (n === null ? "" : String(n));

/**
 * Prix initial, réduction et prix de location reliés :
 * - prix initial + prix de location → le pourcentage se calcule ;
 * - prix initial + pourcentage → le prix de location se calcule.
 * Pour une nouvelle tenue, le prix initial vaut par défaut prix de location + DEFAULT_PROMO_MARKUP.
 */
export function PriceFields({
  price: initialPrice,
  compareAt: initialCompare,
  isNew,
  priceError,
  compareError,
}: {
  price?: number | null;
  compareAt?: number | null;
  isNew: boolean;
  priceError?: string;
  compareError?: string;
}) {
  const [compare, setCompare] = useState(fmt(initialCompare ?? null));
  const [price, setPrice] = useState(fmt(initialPrice ?? null));
  const [percent, setPercent] = useState(() => {
    const c = initialCompare ?? null;
    const p = initialPrice ?? null;
    return c && p !== null ? fmt(percentFromPrices(c, p)) : "";
  });
  const [mode, setMode] = useState<"price" | "percent">("price");
  const [compareTouched, setCompareTouched] = useState(!isNew);

  const onCompare = (v: string) => {
    setCompare(v);
    setCompareTouched(true);
    const c = toNum(v);
    if (c === null) {
      setPercent("");
      return;
    }
    const pct = toNum(percent);
    if (mode === "percent" && pct !== null) setPrice(fmt(priceFromPercent(c, pct)));
    else {
      const p = toNum(price);
      if (p !== null) setPercent(fmt(percentFromPrices(c, p)));
    }
  };

  const onPercent = (v: string) => {
    setMode("percent");
    const raw = toNum(v);
    const pct = raw === null ? null : Math.min(95, Math.max(0, Math.round(raw)));
    setPercent(raw === null ? v : fmt(pct));
    const c = toNum(compare);
    if (c !== null && pct !== null) setPrice(fmt(priceFromPercent(c, pct)));
  };

  const onPrice = (v: string) => {
    setMode("price");
    setPrice(v);
    const p = toNum(v);
    if (p === null) return;
    if (!compareTouched) {
      const c = p + DEFAULT_PROMO_MARKUP;
      setCompare(fmt(c));
      setPercent(fmt(percentFromPrices(c, p)));
      return;
    }
    const c = toNum(compare);
    if (c !== null) setPercent(fmt(percentFromPrices(c, p)));
  };

  const applyDefault = () => {
    const p = toNum(price);
    if (p === null) return;
    const c = p + DEFAULT_PROMO_MARKUP;
    setCompare(fmt(c));
    setCompareTouched(true);
    setMode("price");
    setPercent(fmt(percentFromPrices(c, p)));
  };

  const removePromo = () => {
    setCompare("");
    setPercent("");
    setCompareTouched(true);
    setMode("price");
  };

  const p = toNum(price);
  const promo = p !== null ? getPromo(p, toNum(compare)) : null;

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="compare_at_price" className="field-label">
          Prix initial <span className="normal-case tracking-normal text-taupe">(barré)</span>
        </label>
        <input
          id="compare_at_price"
          name="compare_at_price"
          inputMode="decimal"
          value={compare}
          onChange={(e) => onCompare(e.target.value)}
          placeholder="Ex. : 1200"
          className="field rounded-md tabular-nums"
        />
        {compareError && (
          <p role="alert" className="mt-1.5 text-[13px] text-prune-600">
            {compareError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-3">
        <div>
          <label htmlFor="percent" className="field-label">
            Réduction
          </label>
          <div className="relative">
            <input
              id="percent"
              inputMode="numeric"
              value={percent}
              onChange={(e) => onPercent(e.target.value)}
              placeholder="0"
              className="field rounded-md pr-8 tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-taupe">%</span>
          </div>
        </div>
        <div>
          <label htmlFor="price" className="field-label">
            Prix de location <span className="text-prune-600">*</span>
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            value={price}
            onChange={(e) => onPrice(e.target.value)}
            placeholder="Ex. : 2500"
            className="field rounded-md tabular-nums"
            required
          />
        </div>
      </div>
      {priceError && (
        <p role="alert" className="-mt-3 text-[13px] text-prune-600">
          {priceError}
        </p>
      )}

      <div className="rounded-md bg-ivoire px-3 py-3 text-[13px]" aria-live="polite">
        {promo ? (
          <p className="text-encre">
            Le client verra <span className="text-taupe line-through">{formatPrice(toNum(compare))}</span>{" "}
            <span className="font-medium text-prune-700">{formatPrice(p)}</span>
            <span className="ml-2 bg-prune-900 px-1.5 py-0.5 text-[11px] font-semibold text-or-200">−{promo.percent} %</span>
            <span className="mt-1 block text-taupe">Économie : {formatPrice(promo.amount)}</span>
          </p>
        ) : (
          <p className="text-taupe">Pas de promotion affichée (le prix initial doit être supérieur au prix de location).</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={applyDefault} disabled={p === null} className="cursor-pointer text-or-700 underline-offset-4 hover:underline disabled:cursor-default disabled:opacity-40">
            Prix initial = prix + {DEFAULT_PROMO_MARKUP} DH
          </button>
          {promo && (
            <button type="button" onClick={removePromo} className="cursor-pointer text-taupe underline-offset-4 hover:text-prune-700 hover:underline">
              Retirer la promotion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
