import { CalendarDays, ChevronLeft, ChevronRight, Phone, Truck } from "lucide-react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { addDays, daysFromToday, formatDayLong, formatDayShort, relativeDay, todayISO } from "@/lib/dates";
import { getUpcomingDeliveries, type DeliveryRow } from "@/lib/deliveries";
import { formatPrice } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Calendrier des événements" };

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const OPEN = ["pending", "confirmed", "postponed", "shipped"];

type SP = Promise<{ mois?: string; jour?: string }>;

export default async function CalendarPage({ searchParams }: { searchParams: SP }) {
  const params = await searchParams;
  const today = todayISO();
  const selected = params.jour && /^\d{4}-\d{2}-\d{2}$/.test(params.jour) ? params.jour : today;
  const month = params.mois && /^\d{4}-\d{2}$/.test(params.mois) ? params.mois : selected.slice(0, 7);

  // Bornes du mois affiché
  const first = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const last = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  const offset = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7; // lundi = 0
  const prevMonth = addDays(first, -1).slice(0, 7);
  const nextMonth = addDays(last, 1).slice(0, 7);
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${first}T12:00:00Z`));

  const { supabase } = await getAdmin();
  const select = "id, order_number, customer_name, city, phone, total, status, delivery_date, event_date, event_type";
  const [monthRes, dayRes, undatedRes, upcoming] = await Promise.all([
    supabase.from("orders").select(select).gte("event_date", first).lte("event_date", last).neq("status", "cancelled"),
    supabase.from("orders").select(select).eq("event_date", selected).neq("status", "cancelled").order("created_at"),
    supabase.from("orders").select(select).is("delivery_date", null).in("status", OPEN).order("created_at", { ascending: false }).limit(20),
    getUpcomingDeliveries(supabase),
  ]);
  const byDay = new Map<string, DeliveryRow[]>();
  for (const o of (monthRes.data ?? []) as DeliveryRow[]) {
    const k = o.event_date;
    byDay.set(k, [...(byDay.get(k) ?? []), o]);
  }
  const dayOrders = (dayRes.data ?? []) as DeliveryRow[];
  const undated = (undatedRes.data ?? []) as DeliveryRow[];
  const soon = upcoming ?? [];

  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);

  return (
    <>
      <PageHeader
        title="Calendrier des événements"
        description="Chaque réservation apparaît à la date de l'événement. Fixez la date de livraison de la tenue depuis la réservation."
      />

      <>
          {/* À livrer dans les 48 h */}
          <section className="mb-6 rounded-lg border border-prune-900 bg-prune-900 p-5 text-ivoire md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-or-300">
                <Truck className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </span>
              <h2 className="font-serif text-2xl">À livrer dans les 48 h</h2>
              <span className="rounded-full bg-or-500 px-2.5 py-0.5 text-[12px] font-semibold text-prune-950">{soon.length}</span>
            </div>
            {soon.length === 0 ? (
              <p className="text-[14px] text-or-100/80">Aucune livraison prévue dans les 48 prochaines heures.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {soon.map((o) => {
                  const late = daysFromToday(o.delivery_date as string) < 0;
                  return (
                    <li key={o.id}>
                      <Link href={`/admin/commandes/${o.id}`} className="block rounded-md bg-white/[0.07] p-4 transition-colors hover:bg-white/[0.12]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{o.order_number}</span>
                          <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", late ? "bg-prune-400 text-white" : "bg-or-500 text-prune-950")}>
                            {relativeDay(o.delivery_date as string)}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-or-100/85">
                          {o.customer_name}{o.city ? ` · ${o.city}` : ""}
                        </p>
                        <p className="mt-1 text-[12px] text-or-100/60">
                          Livraison {formatDayShort(o.delivery_date as string)} · événement {formatDayShort(o.event_date)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Calendrier du mois */}
            <Card
              className="xl:col-span-2"
              title={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
              action={
                <div className="flex items-center gap-1">
                  <Link href={`/admin/calendrier?mois=${prevMonth}&jour=${selected}`} aria-label="Mois précédent" className="flex h-9 w-9 items-center justify-center rounded-md text-prune-900 hover:bg-champagne">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                  <Link href={`/admin/calendrier?jour=${today}`} className="flex h-9 items-center rounded-md px-3 text-[12px] text-prune-900 hover:bg-champagne">
                    Aujourd&apos;hui
                  </Link>
                  <Link href={`/admin/calendrier?mois=${nextMonth}&jour=${selected}`} aria-label="Mois suivant" className="flex h-9 w-9 items-center justify-center rounded-md text-prune-900 hover:bg-champagne">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              }
            >
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-taupe">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`vide-${i}`} className="aspect-square md:aspect-[4/3]" />;
                  const list = byDay.get(day) ?? [];
                  const isToday = day === today;
                  const isSelected = day === selected;
                  const isPast = day < today;
                  return (
                    <Link
                      key={day}
                      href={`/admin/calendrier?mois=${month}&jour=${day}`}
                      aria-current={isSelected ? "date" : undefined}
                      aria-label={`${formatDayLong(day)} : ${list.length} événement${list.length > 1 ? "s" : ""}`}
                      className={cn(
                        "flex aspect-square flex-col rounded-md border p-1.5 text-left transition-colors md:aspect-[4/3] md:p-2",
                        isSelected ? "border-prune-900 bg-prune-900 text-ivoire" : "border-sable bg-white hover:border-or-400 hover:bg-ivoire",
                        isToday && !isSelected && "ring-2 ring-or-500 ring-offset-1",
                        isPast && !isSelected && "text-taupe/60"
                      )}
                    >
                      <span className={cn("text-[13px] font-medium tabular-nums md:text-[14px]", isToday && !isSelected && "text-or-700")}>{Number(day.slice(8))}</span>
                      {list.length > 0 && (
                        <>
                          <span
                            className={cn(
                              "mt-auto inline-flex w-fit items-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums md:hidden",
                              isSelected ? "bg-or-500 text-prune-950" : "bg-prune-900 text-or-200"
                            )}
                          >
                            {list.length}
                          </span>
                          <span className="mt-auto hidden space-y-0.5 md:block">
                            {list.slice(0, 2).map((o) => (
                              <span
                                key={o.id}
                                className={cn(
                                  "block truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                                  isSelected ? "bg-white/15 text-or-100" : o.status === "delivered" ? "bg-emerald-50 text-emerald-800" : "bg-or-100 text-or-800"
                                )}
                              >
                                {o.order_number}
                              </span>
                            ))}
                            {list.length > 2 && <span className={cn("block text-[10px]", isSelected ? "text-or-200" : "text-taupe")}>+ {list.length - 2} autre(s)</span>}
                          </span>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Événements du jour sélectionné */}
            <Card title={formatDayLong(selected).replace(/^./, (c) => c.toUpperCase())} action={<span className="text-[12px] text-taupe">{relativeDay(selected)}</span>}>
              {dayOrders.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CalendarDays className="h-9 w-9 text-or-400" strokeWidth={1.2} />
                  <p className="mt-3 text-[14px] text-taupe">Aucun événement réservé ce jour-là.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {dayOrders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/commandes/${o.id}`} className="block rounded-md border border-sable p-3 transition-colors hover:border-or-400 hover:bg-ivoire">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-prune-900">{o.order_number}</span>
                          <StatusBadge status={o.status} />
                        </div>
                        <p className="mt-1 text-[13px] text-encre">
                          {o.customer_name}
                          {o.event_type ? ` · ${o.event_type}` : ""}
                        </p>
                        <p className="mt-1 text-[12px] text-taupe">
                          {o.delivery_date ? `Livraison prévue le ${formatDayShort(o.delivery_date)}` : "Livraison à fixer"}
                        </p>
                        <p className="mt-1 flex items-center justify-between text-[12px] text-taupe">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {o.phone}
                          </span>
                          <span className="tabular-nums text-encre">{formatPrice(o.total)}</span>
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Réservations sans date de livraison */}
          <Card title={`Réservations sans date de livraison (${undated.length})`} className="mt-6">
            {undated.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-taupe">Toutes les réservations en cours ont une date de livraison.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {undated.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/commandes/${o.id}`} className="flex items-center justify-between gap-3 rounded-md bg-ivoire px-3 py-2.5 text-[13px] hover:bg-champagne">
                      <span>
                        <span className="font-medium text-prune-900">{o.order_number}</span>
                        <span className="text-taupe">
                          {" "}
                          · {o.customer_name} · événement {formatDayShort(o.event_date)}
                        </span>
                      </span>
                      <span className="shrink-0 text-[12px] text-or-700">Fixer une date →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
      </>
    </>
  );
}
