"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/** Carrousel horizontal (défilement natif + boutons + barre de progression dorée). */
export function ProductCarousel({ products, label }: { products: Product[]; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(1);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setThumb(el.scrollWidth ? el.clientWidth / el.scrollWidth : 1);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className="relative" role="region" aria-roledescription="carrousel" aria-label={label}>
      <div
        ref={track}
        onScroll={measure}
        className="scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 md:-mx-8 md:scroll-px-8 md:gap-6 md:px-8 xl:-mx-12 xl:scroll-px-12 xl:px-12"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[64%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[23%] xl:w-[19%]">
            <ProductCard product={p} sizes="(min-width:1280px) 19vw, (min-width:1024px) 23vw, (min-width:768px) 31vw, 64vw" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-sable" aria-hidden>
          <div
            className="absolute inset-y-0 bg-prune-900 transition-[left] duration-300"
            style={{ width: `${thumb * 100}%`, left: `${progress * (1 - thumb) * 100}%`, height: 1 }}
          />
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label="Produits précédents"
            className="flex h-11 w-11 cursor-pointer items-center justify-center border border-sable text-prune-900 transition-colors hover:border-prune-900 disabled:cursor-default disabled:opacity-30 disabled:hover:border-sable"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label="Produits suivants"
            className="flex h-11 w-11 cursor-pointer items-center justify-center border border-sable text-prune-900 transition-colors hover:border-prune-900 disabled:cursor-default disabled:opacity-30 disabled:hover:border-sable"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
