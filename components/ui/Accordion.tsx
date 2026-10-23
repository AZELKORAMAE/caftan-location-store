"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

export function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-sable">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 text-left text-[12px] font-medium uppercase tracking-[0.2em] text-encre"
      >
        {title}
        <Plus className={`h-4 w-4 shrink-0 text-or-700 transition-transform duration-300 ${open ? "rotate-45" : ""}`} strokeWidth={1.5} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[15px] leading-relaxed text-taupe">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
