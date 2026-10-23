"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Location de caftans pour tous vos événements",
  "Paiement à la livraison",
  "Retouches et pressing inclus",
  "Essayage au showroom sur rendez-vous",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-9 items-center justify-center overflow-hidden bg-prune-900 px-4 text-or-200">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="truncate text-[10px] font-medium uppercase tracking-[0.12em] sm:text-[11px] sm:tracking-[0.22em]"
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
