"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("tri") ?? "";

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("tri", value);
    else next.delete("tri");
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  return (
    <label className="relative inline-flex items-center gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-taupe">Trier</span>
      <span className="relative">
        <select
          value={current}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[44px] cursor-pointer appearance-none border-b border-sable bg-transparent pr-8 text-[13px] text-encre focus:border-prune-900 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-or-700" strokeWidth={1.5} />
      </span>
    </label>
  );
}
