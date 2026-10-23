import { ArrowRight, CalendarHeart, Hourglass, ShoppingCart, Truck, Users, Wallet } from "lucide-react";
import { addDays, daysFromToday, formatDayShort, relativeDay, todayISO } from "@/lib/dates";
import { getUpcomingDeliveries } from "@/lib/deliveries";
import Image from "next/image";
import Link from "next/link";
import { RevenueChart, type RevenuePoint } from "@/components/admin/RevenueChart";
import { Card, PageHeader, StatCard } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/types";

export const metadata = { title: "Tableau de bord" };

type OrderRow = Pick<Order, "id" | "order_number" | "customer_name" | "city" | "total" | "status" | "created_at" | "email">;

const DAY = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default async function DashboardPage() {
  const { supabase } = await getAdmin();
  const deliveries = (await getUpcomingDeliveries(supabase)) ?? [];

  const today = todayISO();
  const [{ data: ordersData }, { count: customers }, { data: upcomingData }, { data: itemsData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, city, total, status, created_at, email")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, event_date, event_type")
      .gte("event_date", today)
      .lte("event_date", addDays(today, 14))
      .neq("status", "cancelled")
      .order("event_date")
      .limit(8),
    supabase.from("order_items").select("product_name, product_image, quantity, line_total, order:orders!inner(status)").neq("order.status", "cancelled").limit(2000),
  ]);

  const orders = (ordersData ?? []) as OrderRow[];
  const valid = orders.filter((o) => o.status !== "cancelled");
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const sum = (list: OrderRow[]) => list.reduce((s, o) => s + Number(o.total), 0);
  const revenueTotal = sum(valid);
  const revenueMonth = sum(valid.filter((o) => new Date(o.created_at) >= startMonth));
  const revenuePrev = sum(valid.filter((o) => new Date(o.created_at) >= startPrevMonth && new Date(o.created_at) < startMonth));
  const delta = revenuePrev > 0 ? ((revenueMonth - revenuePrev) / revenuePrev) * 100 : null;
  const pending = orders.filter((o) => o.status === "pending").length;
  const avg = valid.length ? revenueTotal / valid.length : 0;
  const uniqueBuyers = new Set(orders.map((o) => o.email)).size;

  // Série des 30 derniers jours
  const series: RevenuePoint[] = [];
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of valid) {
    const k = dayKey(new Date(o.created_at));
    const cur = byDay.get(k) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total);
    cur.orders += 1;
    byDay.set(k, cur);
  }
  const dayLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    const v = byDay.get(dayKey(d)) ?? { revenue: 0, orders: 0 };
    series.push({ date: dayKey(d), label: dayLabel.format(d), ...v });
  }
  const revenue30 = series.reduce((s, d) => s + d.revenue, 0);

  // Répartition des statuts
  const statusCounts = (Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }));
  const maxStatus = Math.max(1, ...statusCounts.map((s) => s.count));

  const upcomingEvents = (upcomingData ?? []) as Pick<Order, "id" | "order_number" | "customer_name" | "event_date" | "event_type">[];

  // Tenues les plus louées
  const top = new Map<string, { name: string; image: string | null; qty: number; revenue: number }>();
  for (const it of (itemsData ?? []) as { product_name: string; product_image: string | null; quantity: number; line_total: number }[]) {
    const cur = top.get(it.product_name) ?? { name: it.product_name, image: it.product_image, qty: 0, revenue: 0 };
    cur.qty += it.quantity;
    cur.revenue += Number(it.line_total);
    top.set(it.product_name, cur);
  }
  const bestSellers = [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de l'activité de location.">
        <Link href="/admin/produits/nouveau" className="btn-primary min-h-[44px] rounded-md px-5">
          Ajouter une tenue
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard highlight label="Revenus du mois" value={formatPrice(revenueMonth)} delta={delta} hint="vs mois dernier" icon={Wallet} />
        <StatCard label="Revenus totaux" value={formatPrice(revenueTotal)} hint={`Location moyenne ${formatPrice(avg)}`} icon={Wallet} />
        <StatCard label="Réservations" value={String(orders.length)} hint={`${pending} en attente`} icon={ShoppingCart} />
        <StatCard label="Clientes" value={String(Math.max(customers ?? 0, uniqueBuyers))} hint={`${customers ?? 0} compte(s) créé(s)`} icon={Users} />
      </div>

      {deliveries.length > 0 && (
        <Link
          href="/admin/calendrier"
          className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-prune-900 bg-prune-900 px-5 py-4 text-[14px] text-ivoire transition-colors hover:bg-prune-800"
        >
          <span className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-or-300" strokeWidth={1.5} />
            {deliveries.length} tenue{deliveries.length > 1 ? "s" : ""} à livrer dans les 48 h
            {deliveries.some((d) => daysFromToday(d.delivery_date as string) < 0) && <span className="rounded bg-prune-400 px-2 py-0.5 text-[11px] font-semibold">dont en retard</span>}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {pending > 0 && (
        <Link
          href="/admin/commandes?statut=pending"
          className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-or-300 bg-or-50 px-5 py-4 text-[14px] text-or-800 transition-colors hover:bg-or-100"
        >
          <span className="flex items-center gap-3">
            <Hourglass className="h-4 w-4" strokeWidth={1.5} />
            {pending} réservation{pending > 1 ? "s" : ""} en attente de confirmation
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Revenus — 30 derniers jours"
          action={<span className="font-serif text-xl tabular-nums text-prune-900">{formatPrice(revenue30)}</span>}
          className="xl:col-span-2"
        >
          <RevenueChart data={series} />
        </Card>

        <Card title="Statut des réservations">
          <ul className="space-y-4">
            {statusCounts.map(({ status, count }) => (
              <li key={status}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-encre">{ORDER_STATUSES[status].label}</span>
                  <span className="tabular-nums text-taupe">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-champagne" role="presentation">
                  <div className="h-full rounded-full bg-prune-600" style={{ width: `${(count / maxStatus) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Dernières réservations"
          action={
            <Link href="/admin/commandes" className="text-[12px] font-medium uppercase tracking-[0.15em] text-or-700 hover:underline">
              Tout voir
            </Link>
          }
          className="xl:col-span-2"
        >
          {orders.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-taupe">Aucune réservation pour le moment. Elles apparaîtront ici en temps réel.</p>
          ) : (
            <div className="-mx-5 -my-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead className="bg-ivoire text-[11px] uppercase tracking-[0.12em] text-taupe">
                  <tr>
                    <th className="px-5 py-3 font-medium">Réservation</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sable">
                  {orders.slice(0, 7).map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-ivoire">
                      <td className="px-5 py-3">
                        <Link href={`/admin/commandes/${o.id}`} className="font-medium text-prune-900 hover:underline">
                          {o.order_number}
                        </Link>
                        <p className="text-[12px] text-taupe">{timeAgo(o.created_at)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-encre">{o.customer_name}</p>
                        <p className="text-[12px] text-taupe">{o.city ?? ""}</p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Tenues les plus louées">
            {bestSellers.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-taupe">Pas encore de locations.</p>
            ) : (
              <ol className="space-y-3">
                {bestSellers.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="w-4 text-[12px] tabular-nums text-taupe">{i + 1}</span>
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-[#F6F1EB]">
                      {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover mix-blend-multiply" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-encre">{p.name}</span>
                      <span className="text-[12px] text-taupe">{p.qty} location(s)</span>
                    </span>
                    <span className="text-[13px] tabular-nums">{formatPrice(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Événements des 14 prochains jours">
            {upcomingEvents.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-taupe">Aucun événement réservé dans les deux prochaines semaines.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/commandes/${o.id}`} className="flex items-center gap-3 rounded-md hover:bg-ivoire">
                      <CalendarHeart className="h-4 w-4 shrink-0 text-or-600" strokeWidth={1.5} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-encre">{o.customer_name}</span>
                        <span className="text-[12px] text-taupe">
                          {o.order_number}
                          {o.event_type ? ` · ${o.event_type}` : ""}
                        </span>
                      </span>
                      <span className="text-right text-[12px] font-medium text-or-700">
                        {formatDayShort(o.event_date)}
                        <span className="block font-normal text-taupe">{relativeDay(o.event_date)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
