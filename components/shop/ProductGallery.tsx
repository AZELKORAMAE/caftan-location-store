"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onTrackScroll = () => {
    const el = track.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!list.length) {
    return <div className="flex aspect-square items-center justify-center bg-[#F6F1EB] font-script text-6xl text-or-500">BL</div>;
  }

  return (
    <div>
      {/* Mobile : défilement horizontal */}
      <div className="md:hidden">
        <div ref={track} onScroll={onTrackScroll} className="scrollbar-none -mx-5 flex snap-x snap-mandatory overflow-x-auto">
          {list.map((src, i) => (
            <div key={src} className="relative aspect-square w-full shrink-0 snap-center bg-[#F6F1EB]">
              <Image src={src} alt={`${name} — vue ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-cover mix-blend-multiply" />
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-4 flex justify-center gap-2" aria-hidden>
            {list.map((src, i) => (
              <span key={src} className={cn("h-1.5 rounded-full transition-all duration-300", i === active ? "w-6 bg-prune-900" : "w-1.5 bg-sable")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop : visuel principal + vignettes, zoom au survol */}
      <div className="hidden gap-4 md:flex">
        {list.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {list.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Afficher la vue ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden bg-[#F6F1EB] ring-1 transition-all",
                  i === active ? "ring-prune-900" : "ring-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover mix-blend-multiply" />
              </button>
            ))}
          </div>
        )}
        <div
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden bg-[#F6F1EB]"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={list[active]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={list[active]}
                alt={name}
                fill
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover mix-blend-multiply transition-transform duration-300 ease-out"
                style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
