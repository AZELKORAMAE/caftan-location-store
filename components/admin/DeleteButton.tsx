"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Suppression en deux temps (confirmation intégrée, sans boîte de dialogue). */
export function DeleteButton({ action, label, redirectTo }: { action: () => Promise<{ ok: boolean; message: string }>; label: string; redirectTo: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md px-4 text-[13px] text-prune-600 hover:bg-prune-50">
        <Trash2 className="h-4 w-4" strokeWidth={1.5} /> {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-prune-50 p-2">
      <span className="px-2 text-[13px] text-prune-700">Suppression définitive ?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await action();
            if (res.ok) router.push(redirectTo);
            else setError(res.message);
          })
        }
        className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md bg-prune-700 px-4 text-[13px] text-white hover:bg-prune-800"
      >
        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />} Supprimer
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="min-h-[40px] cursor-pointer rounded-md px-3 text-[13px] text-taupe hover:text-encre">
        Annuler
      </button>
      {error && <p role="alert" className="w-full px-2 text-[12px] text-prune-700">{error}</p>}
    </div>
  );
}
