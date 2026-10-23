import { ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";
import { markNotificationsRead } from "@/app/admin/actions";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { formatDate, timeAgo } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";
import type { AdminNotification } from "@/lib/types";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { supabase } = await getAdmin();
  const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
  const list = (data ?? []) as AdminNotification[];
  const unread = list.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHeader title="Notifications" description={unread ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour."}>
        {unread > 0 && (
          <form
            action={async () => {
              "use server";
              await markNotificationsRead();
            }}
          >
            <button type="submit" className="btn-outline rounded-md">
              Tout marquer comme lu
            </button>
          </form>
        )}
      </PageHeader>

      {list.length === 0 ? (
        <EmptyState title="Aucune notification" text="Vous serez alerté(e) ici, en temps réel, à chaque nouvelle réservation." />
      ) : (
        <ul className="overflow-hidden rounded-lg border border-sable bg-white">
          {list.map((n) => (
            <li key={n.id} className="border-b border-sable last:border-0">
              <Link href={n.order_id ? `/admin/commandes/${n.order_id}` : "#"} className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-ivoire ${n.is_read ? "" : "bg-or-50/60"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-prune-900 text-or-300">
                  {n.type === "delivery_soon" ? <Truck className="h-4 w-4" strokeWidth={1.5} /> : <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-encre">
                    {n.title}
                    {!n.is_read && <span className="rounded-full bg-prune-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">Nouveau</span>}
                  </span>
                  <span className="block text-[13px] text-taupe">{n.message}</span>
                </span>
                <span className="shrink-0 text-right text-[12px] text-taupe">
                  {timeAgo(n.created_at)}
                  <span className="hidden sm:block">{formatDate(n.created_at, true)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
