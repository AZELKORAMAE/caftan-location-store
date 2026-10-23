import { Mail } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Clientes" };

type Buyer = { email: string; name: string; phone: string; city: string; orders: number; spent: number; last: string; registered: boolean };

export default async function ClientsPage() {
  const { supabase } = await getAdmin();
  const [{ data: orders }, { data: profiles }, { data: subscribers }] = await Promise.all([
    supabase.from("orders").select("email, customer_name, phone, city, total, status, created_at, user_id").order("created_at", { ascending: false }).limit(2000),
    supabase.from("profiles").select("id, email, full_name, phone, created_at, role").eq("role", "customer").order("created_at", { ascending: false }),
    supabase.from("newsletter_subscribers").select("email, created_at").order("created_at", { ascending: false }).limit(200),
  ]);

  // Clientes = personnes ayant réservé (avec ou sans compte) + comptes sans réservation
  const buyers = new Map<string, Buyer>();
  for (const o of orders ?? []) {
    const key = (o.email || o.phone || o.customer_name).toLowerCase();
    const b = buyers.get(key) ?? { email: o.email ?? "", name: o.customer_name, phone: o.phone, city: o.city ?? "", orders: 0, spent: 0, last: o.created_at, registered: Boolean(o.user_id) };
    b.orders += 1;
    if (o.status !== "cancelled") b.spent += Number(o.total);
    if (o.user_id) b.registered = true;
    buyers.set(key, b);
  }
  for (const p of profiles ?? []) {
    const key = (p.email ?? "").toLowerCase();
    if (!key) continue;
    const existing = buyers.get(key);
    if (existing) existing.registered = true;
    else buyers.set(key, { email: key, name: p.full_name ?? "—", phone: p.phone ?? "", city: "", orders: 0, spent: 0, last: p.created_at, registered: true });
  }
  const list = [...buyers.values()].sort((a, b) => b.spent - a.spent);

  return (
    <>
      <PageHeader title="Clientes" description={`${list.length} cliente${list.length > 1 ? "s" : ""} · ${profiles?.length ?? 0} compte(s) créé(s)`} />

      {list.length === 0 ? (
        <EmptyState title="Pas encore de clientes" text="Vos clientes et les comptes créés apparaîtront ici." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sable bg-white">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-ivoire text-[11px] uppercase tracking-[0.12em] text-taupe">
              <tr>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 text-right font-medium">Réservations</th>
                <th className="px-5 py-3 text-right font-medium">Total dépensé</th>
                <th className="px-5 py-3 font-medium">Dernière activité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable">
              {list.map((b) => (
                <tr key={b.email} className="hover:bg-ivoire">
                  <td className="px-5 py-3">
                    <p className="font-medium text-encre">{b.name}</p>
                    <p className="text-[12px] text-taupe">{b.registered ? "Compte client" : "Invité"}{b.city ? ` · ${b.city}` : ""}</p>
                  </td>
                  <td className="px-5 py-3">
                    {b.email ? (
                      <a href={`mailto:${b.email}`} className="text-encre hover:text-or-700">
                        {b.email}
                      </a>
                    ) : (
                      <span className="text-taupe">Sans e-mail</span>
                    )}
                    <p className="text-[12px] text-taupe">{b.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{b.orders}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatPrice(b.spent)}</td>
                  <td className="px-5 py-3 text-taupe">{formatDate(b.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Card title={`Newsletter (${subscribers?.length ?? 0})`} className="mt-8">
        {(subscribers ?? []).length === 0 ? (
          <p className="py-4 text-center text-[13px] text-taupe">Aucun abonné pour le moment.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(subscribers ?? []).map((s) => (
              <li key={s.email} className="flex items-center gap-2 truncate rounded-md bg-ivoire px-3 py-2 text-[13px]">
                <Mail className="h-3.5 w-3.5 shrink-0 text-or-600" />
                <span className="truncate">{s.email}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
