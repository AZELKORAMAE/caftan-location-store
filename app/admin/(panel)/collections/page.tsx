import { CircleCheck, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { getAdmin } from "@/lib/supabase/server";
import type { Collection } from "@/lib/types";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { supabase } = await getAdmin();
  const [{ data }, { data: products }] = await Promise.all([
    supabase.from("collections").select("*").order("sort_order").order("created_at"),
    supabase.from("products").select("collection_id"),
  ]);
  const collections = (data ?? []) as Collection[];
  const counts = new Map<string, number>();
  for (const p of products ?? []) if (p.collection_id) counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1);

  return (
    <>
      <PageHeader title="Collections" description="Organisez vos créations en univers.">
        <Link href="/admin/collections/nouvelle" className="btn-primary rounded-md px-5">
          <Plus className="h-4 w-4" /> Nouvelle collection
        </Link>
      </PageHeader>

      {ok && (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800">
          <CircleCheck className="h-4 w-4" /> Collection enregistrée.
        </p>
      )}

      {collections.length === 0 ? (
        <EmptyState title="Aucune collection" text="Créez une collection pour regrouper vos tenues.">
          <Link href="/admin/collections/nouvelle" className="btn-primary rounded-md">
            Créer une collection
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/collections/${c.id}`} className="group block overflow-hidden rounded-lg border border-sable bg-white transition-shadow hover:shadow-lg hover:shadow-prune-950/5">
                <div className="relative aspect-[16/10] overflow-hidden bg-prune-900">
                  {c.image_url && <Image src={c.image_url} alt="" fill sizes="(min-width:1280px) 30vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                  {c.requires_size && (
                    <span className="absolute right-3 top-3 rounded bg-prune-900 px-2 py-0.5 text-[10px] uppercase tracking-wider text-or-200">Tailles 5–10</span>
                  )}
                  {c.is_featured && (
                    <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-0.5 text-[10px] uppercase tracking-wider text-prune-900">Accueil</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-serif text-xl text-prune-900">{c.name}</p>
                    <p className="text-[12px] text-taupe">/collections/{c.slug}</p>
                  </div>
                  <span className="rounded-full bg-champagne px-3 py-1 text-[12px] tabular-nums text-or-800">
                    {counts.get(c.id) ?? 0} tenue{(counts.get(c.id) ?? 0) > 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
