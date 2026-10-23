"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Slide = { image: string; eyebrow: string; title: string; text: string; href: string; cta: string; /** cadrage, ex. "50% 20%" */ position?: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 7000;

export function Hero({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => window.clearTimeout(id);
  }, [index, paused, slides.length]);

  const slide = slides[index];

  return (
    <section
      ref={ref}
      className="relative h-[78svh] min-h-[520px] overflow-hidden bg-prune-950 md:h-[88vh] md:max-h-[920px]"
      aria-roledescription="carrousel"
      aria-label="À la une"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className="animate-ken-burns object-cover" style={{ objectPosition: slide.position ?? "50% 50%" }} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-prune-950/85 via-prune-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-prune-950/70 via-transparent to-transparent md:hidden" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="container relative flex h-full items-end pb-20 md:items-center md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
              exit: { opacity: 0, transition: { duration: 0.3 } },
            }}
            className="max-w-xl text-ivoire"
          >
            <motion.p variants={item} className="eyebrow text-or-300">
              {slide.eyebrow}
            </motion.p>
            <motion.h1 variants={item} className="display mt-5 text-balance text-[48px] md:text-[76px] lg:text-[88px]">
              {slide.title}
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-md text-[15px] leading-relaxed text-or-100/90 md:text-base">
              {slide.text}
            </motion.p>
            <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href={slide.href} className="btn-gold">
                {slide.cta}
              </Link>
              <Link href="/boutique" className="link-underline text-ivoire">
                Toutes les tenues
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-3 md:bottom-10">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher la diapositive ${i + 1}`}
              aria-current={i === index}
              className="group flex h-11 cursor-pointer items-center"
            >
              <span className="relative block h-px w-10 overflow-hidden bg-ivoire/35 md:w-14">
                <span
                  key={`${index}-${paused}`}
                  className={cn("absolute inset-y-0 left-0 bg-or-300", i === index ? "w-full" : "w-0")}
                  style={i === index && !paused ? { animation: `hero-progress ${DURATION}ms linear both` } : undefined}
                />
              </span>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes hero-progress{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};
