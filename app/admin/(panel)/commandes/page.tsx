import { Search } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDayShort, relativeDay } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types";

export const metadata = { title: "Réservations" };

type SP = Promise<{ statut?: string; q?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  const { statut, q } = await searchParams;
  const { supabase } = await getAdmin();

  let req = supabase.from("orders").select("*, order_items(quantity)").order("created_at", { ascending: false }).limit(500);
  if (statut && statut in ORDER_STATUSES) req = req.eq("status", statut);
  if (q) {
    const safe = q.replace(/[,()*%\\]/g, " ").trim();
    if (safe) req = req.or(`order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,city.ilike.%${safe}%`);
  }
  const { data } = await req;
  const orders = (data ?? []) as (Order & { order_items: { quantity: number }[] })[];

  const tab = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("statut", s);
    if (q) p.set("q", q);
    return `/admin/commandes${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Réservations" description="Suivez les réservations de tenues, de la confirmation au retour." />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrer par statut" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto">
          {[{ key: undefined, label: "Toutes" }, ...(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => ({ key: s, label: ORDER_STATUSES[s].label }))].map((t) => {
            const active = (statut ?? undefined) === t.key;
            return (
              <Link
                key={t.label}
                href={tab(t.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[40px] items-center whitespace-nowrap rounded-full px-4 text-[13px] transition-colors",
                  active ? "bg-prune-900 text-ivoire" : "bg-white text-taupe ring-1 ring-sable hover:text-prune-900"
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <form className="relative w-full lg:w-80" role="search">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <label htmlFor="q" className="sr-only">
            Rechercher une réservation
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="N°, cliente, e-mail, téléphone…" className="field rounded-md pl-9" />
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Aucune réservation" text={q || statut ? "Aucun résultat pour ces filtres." : "Les nouvelles réservations apparaîtront ici en temps réel."} />
      ) : (
        <>
          {/* Mobile : cartes */}
          <ul className="space-y-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/commandes/${o.id}`} className="block rounded-lg border border-sable bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-prune-900">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-2 text-[14px] text-encre">{o.customer_name}</p>
                  <div className="mt-1 flex items-center justify-between text-[13px] text-taupe">
                    <span>
                      Événement le {formatDayShort(o.event_date)} · {relativeDay(o.event_date)}
                    </span>
                    <span className="tabular-nums text-encre">{formatPrice(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop : tableau */}
          <div className="hidden overflow-x-auto rounded-lg border border-sable bg-white md:block">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-ivoire text-[11px] uppercase tracking-[0.12em] text-taupe">
                <tr>
                  <th className="px-5 py-3 font-medium">Réservation</th>
                  <th className="px-5 py-3 font-medium">Événement</th>
                  <th className="px-5 py-3 font-medium">Livraison</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Tenues</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sable">
                {orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-ivoire">
                    <td className="px-5 py-4">
                      <Link href={`/admin/commandes/${o.id}`} className="font-medium text-prune-900 hover:underline">
                        {o.order_number}
                      </Link>
                      <span className="block text-[11px] text-taupe">reçue le {formatDate(o.created_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/calendrier?jour=${o.event_date}`} className="whitespace-nowrap text-encre hover:text-or-700">
                        {formatDayShort(o.event_date)}
                        <span className="block text-[11px] text-taupe">
                          {o.event_type ? `${o.event_type} · ` : ""}
                          {relativeDay(o.event_date)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {o.delivery_date ? (
                        <Link href={`/admin/calendrier?jour=${o.delivery_date}`} className="whitespace-nowrap text-encre hover:text-or-700">
                          {formatDayShort(o.delivery_date)}
                          <span className="block text-[11px] text-taupe">{relativeDay(o.delivery_date)}</span>
                        </Link>
                      ) : (
                        <span className="text-[12px] text-taupe/70">Non fixée</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-encre">{o.customer_name}</p>
                      <p className="text-[12px] text-taupe">
                        {o.phone}{o.city ? ` · ${o.city}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-taupe">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
