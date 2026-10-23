"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export const COUNTRY_CODES = [
  { code: "+212", label: "Maroc" },
  { code: "+33", label: "France" },
  { code: "+34", label: "Espagne" },
  { code: "+32", label: "Belgique" },
  { code: "+31", label: "Pays-Bas" },
  { code: "+49", label: "Allemagne" },
  { code: "+39", label: "Italie" },
  { code: "+44", label: "Royaume-Uni" },
  { code: "+41", label: "Suisse" },
  { code: "+1", label: "États-Unis / Canada" },
  { code: "+971", label: "Émirats arabes unis" },
  { code: "+966", label: "Arabie saoudite" },
  { code: "+974", label: "Qatar" },
  { code: "+213", label: "Algérie" },
  { code: "+216", label: "Tunisie" },
];

/** Sépare « +212 655777934 » en indicatif + numéro local. */
function split(full: string) {
  const v = full.trim();
  if (v.startsWith("+")) {
    const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => v.startsWith(c.code));
    if (match) return { code: match.code, local: v.slice(match.code.length).trim() };
  }
  return { code: "+212", local: v };
}

/** Assemble au format international (sans le 0 initial) : « +212 655777934 ». */
export function joinPhone(code: string, local: string) {
  const digits = local.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `${code} ${digits}` : "";
}

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (full: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
};

/** Téléphone avec indicatif du pays, pour pouvoir contacter le client sur WhatsApp. */
export function PhoneInput({ id, label, value, onChange, error, required, className }: Props) {
  const initial = split(value);
  const [code, setCode] = useState(initial.code);
  const [local, setLocal] = useState(initial.local);

  // Suit les changements externes (ex. pré-remplissage depuis le profil)
  useEffect(() => {
    if (joinPhone(code, local) !== value) {
      const s = split(value);
      setCode(s.code);
      setLocal(s.local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const errId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-prune-600" aria-hidden>*</span>}
      </label>
      <div className={`flex border bg-white focus-within:border-prune-900 ${error ? "border-prune-600" : "border-sable"}`}>
        <div className="relative flex shrink-0 items-center gap-1 border-r border-sable pl-3 pr-2 text-[15px] tabular-nums text-encre">
          <span aria-hidden>{code}</span>
          <ChevronDown className="h-3.5 w-3.5 text-or-700" strokeWidth={1.5} aria-hidden />
          <label htmlFor={id + "-code"} className="sr-only">
            Indicatif du pays
          </label>
          {/* Liste native invisible par-dessus : n'affiche que l'indicatif une fois choisi */}
          <select
            id={id + "-code"}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              onChange(joinPhone(e.target.value, local));
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.label}
              </option>
            ))}
          </select>
        </div>
        <input
          id={id}
          name={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            onChange(joinPhone(code, e.target.value));
          }}
          placeholder="6 12 34 56 78"
          aria-invalid={!!error}
          aria-describedby={error ? errId : `${id}-hint`}
          className="min-h-[48px] w-full min-w-0 bg-transparent px-3 text-[16px] text-encre placeholder:text-taupe/50 focus:outline-none"
        />
      </div>
      {error ? (
        <p id={errId} role="alert" className="mt-2 text-[13px] text-prune-600">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-2 text-[12px] text-taupe">
          Numéro WhatsApp de préférence, pour organiser l&apos;essayage et la livraison.
        </p>
      )}
    </div>
  );
}
