import { LayoutDashboard, LogOut, Package } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isSupabaseConfigured) redirect("/connexion");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?suivant=/compte");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).single(),
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const list = (orders ?? []) as Order[];
  const firstName = (profile?.full_name || user.email || "").split(" ")[0];

  return (
    <div className="container py-12 md:py-16">
      <div className="flex flex-col justify-between gap-6 border-b border-sable pb-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-or-700">Mon compte</p>
          <h1 className="display mt-4 text-[40px] text-prune-900 md:text-[56px]">Bonjour {firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile?.role === "admin" && (
            <Link href="/admin" className="btn-gold">
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} /> Espace admin
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="btn-outline">
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Se déconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-12 pt-12 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-labelledby="orders-title">
          <h2 id="orders-title" className="font-serif text-3xl text-prune-900">
            Mes réservations
          </h2>
          {list.length === 0 ? (
            <div className="mt-6 flex flex-col items-center bg-ivoire px-6 py-16 text-center">
              <Package className="h-10 w-10 text-or-500" strokeWidth={1} />
              <p className="mt-4 text-[15px] text-taupe">Vous n&apos;avez pas encore réservé de tenue.</p>
              <Link href="/boutique" className="btn-primary mt-6">
                Voir les tenues
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-5">
              {list.map((o) => (
                <li key={o.id} className="border border-sable p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium text-encre">{o.order_number}</p>
                      <p className="text-[13px] text-taupe">Événement le {formatDate(o.event_date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={o.status} />
                      <span className="font-serif text-xl tabular-nums text-prune-900">{formatPrice(o.total)}</span>
                    </div>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-3">
                    {o.order_items?.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 bg-ivoire py-2 pl-2 pr-4">
                        <span className="relative h-12 w-12 overflow-hidden bg-[#F6F1EB]">
                          {item.product_image && <Image src={item.product_image} alt="" fill sizes="48px" className="object-cover mix-blend-multiply" />}
                        </span>
                        <span className="text-[13px]">
                          {item.product_name} <span className="text-taupe">{item.size ? `· T. ${item.size} ` : ""}× {item.quantity}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-4">
          <div className="bg-ivoire p-6 md:p-8">
            <h2 className="font-serif text-2xl text-prune-900">Mes informations</h2>
            <div className="mt-6">
              <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={user.email ?? ""} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
