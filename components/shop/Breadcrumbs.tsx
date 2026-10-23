import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[11px] uppercase tracking-[0.18em] text-taupe">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-prune-900">
            Accueil
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-or-500" strokeWidth={1.5} aria-hidden />
            {item.href ? (
              <Link href={item.href} className="hover:text-prune-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-prune-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
