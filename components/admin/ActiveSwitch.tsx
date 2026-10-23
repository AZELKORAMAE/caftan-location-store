"use client";

import { useOptimistic, useTransition } from "react";
import { toggleProductActive } from "@/app/admin/actions";

export function ActiveSwitch({ id, active, label }: { id: string; active: boolean; label: string }) {
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [, start] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={`${optimistic ? "Masquer" : "Afficher"} « ${label} » dans la boutique`}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleProductActive(id, !optimistic);
        })
      }
      className="relative inline-flex h-11 w-14 cursor-pointer items-center justify-center"
    >
      <span className={`h-6 w-11 rounded-full transition-colors ${optimistic ? "bg-prune-900" : "bg-sable"}`} />
      <span className={`absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${optimistic ? "translate-x-5" : ""}`} />
    </button>
  );
}
