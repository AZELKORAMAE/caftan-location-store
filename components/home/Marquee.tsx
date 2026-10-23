const WORDS = ["Caftans", "Takchitas", "Djellabas", "Retouches incluses", "Pressing inclus", "Fait main"];

/** Bandeau défilant en serif italique. */
export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden border-y border-sable bg-ivoire py-5" aria-hidden>
      <div className="flex w-max animate-marquee items-center">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap font-serif text-2xl italic text-prune-900 md:text-3xl">
            <span className="px-8">{w}</span>
            <span className="text-sm text-or-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
