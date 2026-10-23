"use client";

import { CalendarDays, Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { setDeliveryDate } from "@/app/admin/actions";
import { formatDayLong, relativeDay, todayISO } from "@/lib/dates";

export function DeliveryDateForm({ id, date }: { id: string; date: string | null }) {
  const [value, setValue] = useState(date ?? "");
  const [saved, setSaved] = useState(date ?? "");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (next: string | null) =>
    start(async () => {
      const res = await setDeliveryDate(id, next);
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok) {
        setSaved(next ?? "");
        setValue(next ?? "");
      }
    });

  return (
    <div className="space-y-3">
      <label htmlFor="delivery_date" className="field-label">
        Date de livraison prévue
      </label>
      <input
        id="delivery_date"
        type="date"
        value={value}
        min={todayISO()}
        onChange={(e) => {
          setValue(e.target.value);
          setMessage(null);
        }}
        className="field cursor-pointer rounded-md"
      />
      {saved && (
        <p className="flex items-center gap-2 text-[13px] text-encre">
          <CalendarDays className="h-4 w-4 text-or-600" strokeWidth={1.5} />
          <span className="first-letter:uppercase">{formatDayLong(saved)}</span>
          <span className="text-taupe">· {relativeDay(saved)}</span>
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => save(value || null)} disabled={pending || value === saved || !value} className="btn-primary flex-1 rounded-md">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Enregistrer la date"}
        </button>
        {saved && (
          <button type="button" onClick={() => save(null)} disabled={pending} className="min-h-[48px] cursor-pointer rounded-md px-3 text-[13px] text-taupe hover:text-prune-700">
            Retirer
          </button>
        )}
      </div>
      {message && (
        <p role="status" className={`flex items-center gap-2 text-[13px] ${message.ok ? "text-emerald-700" : "text-prune-600"}`}>
          {message.ok && <Check className="h-4 w-4" />} {message.text}
        </p>
      )}
      {saved && (
        <Link href={`/admin/calendrier?jour=${saved}`} className="inline-block text-[12px] text-or-700 underline-offset-4 hover:underline">
          Voir ce jour dans le calendrier →
        </Link>
      )}
    </div>
  );
}
