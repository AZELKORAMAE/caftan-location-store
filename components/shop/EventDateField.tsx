"use client";

import { CalendarDays } from "lucide-react";
import { MIN_LEAD_DAYS } from "@/lib/constants";
import { addDays, todayISO } from "@/lib/dates";
import { cn } from "@/lib/cn";

/** Bornes acceptées pour la date de l'événement (identiques au contrôle de place_order). */
export function eventDateBounds() {
  const today = todayISO();
  return { min: addDays(today, MIN_LEAD_DAYS), max: addDays(today, 365) };
}

/** Message d'erreur si la date est absente ou hors bornes, sinon null. */
export function eventDateError(date: string) {
  if (!date) return "Indiquez la date de votre événement. · حددي تاريخ المناسبة";
  const { min, max } = eventDateBounds();
  if (date < min) return "La date de l'événement doit être au moins demain.";
  if (date > max) return "Les réservations sont ouvertes jusqu'à un an à l'avance.";
  return null;
}

/** Champ « Date de l'événement » (français / arabe). */
export function EventDateField({
  id,
  value,
  onChange,
  error,
  className,
}: {
  id: string;
  value: string;
  onChange: (date: string) => void;
  error?: string | null;
  className?: string;
}) {
  const { min, max } = eventDateBounds();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-semibold text-encre">
        <span>
          Date de l&apos;événement <span className="text-prune-600">*</span>
        </span>
        <span dir="rtl" lang="ar">
          تاريخ المناسبة
        </span>
      </label>
      <div
        className={cn(
          "flex overflow-hidden rounded-md border bg-white focus-within:border-prune-900",
          error ? "border-prune-600" : "border-sable"
        )}
      >
        <span className="flex w-12 shrink-0 items-center justify-center border-r border-sable bg-ivoire text-prune-900" aria-hidden>
          <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[48px] w-full min-w-0 cursor-pointer bg-transparent px-3 text-[16px] text-encre focus:outline-none"
          aria-invalid={Boolean(error)}
        />
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-prune-600">
          {error}
        </p>
      )}
    </div>
  );
}
