import { CircleCheck, Flame, Pencil, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ActiveSwitch } from "@/components/admin/ActiveSwitch";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { percentFromPrices } from "@/lib/pricing";
import { getAdmin } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata = { title: "Tenues" };

type SP = Promise<{ q?: string; collection?: string; ok?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const { q, collection, ok } = await searchParams;
  const { supabase } = await getAdmin();

  let req = supabase.from("products").select("*, collection:collections(name, slug)").order("created_at", { ascending: false });
  if (collection === "aucune") req = req.is("collection_id", null);
  else if (collection) req = req.eq("collection_id", collection);
  if (q) {
    const safe = q.replace(/[,()*%\\]/g, " ").trim();
    if (safe) req = req.ilike("name", `%${safe}%`);
  }
  const [{ data }, { data: collections }] = await Promise.all([req, supabase.from("collections").select("id, name").order("sort_order")]);
  const products = (data ?? []) as Product[];

  return (
    <>
      <PageHeader title="Tenues" description={`${products.length} tenue${products.length > 1 ? "s" : ""} au catalogue`}>
        <Link href="/admin/produits/nouveau" className="btn-primary rounded-md px-5">
          <Plus className="h-4 w-4" /> Nouvelle tenue
        </Link>
      </PageHeader>

      {ok && (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800">
          <CircleCheck className="h-4 w-4" /> Tenue enregistrée. Le site est à jour.
        </p>
      )}

      <form className="mb-5 flex flex-col gap-3 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <label htmlFor="q" className="sr-only">
            Rechercher une tenue
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Rechercher une tenue…" className="field rounded-md pl-9" />
        </div>
        <label htmlFor="collection" className="sr-only">
          Collection
        </label>
        <select id="collection" name="collection" defaultValue={collection ?? ""} className="field cursor-pointer rounded-md sm:w-56">
          <option value="">Toutes les collections</option>
          {(collections ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="aucune">Sans collection</option>
        </select>
        <button type="submit" className="btn-outline rounded-md">
          Filtrer
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState title="Aucune tenue" text="Ajoutez votre première tenue pour l'afficher sur le site.">
          <Link href="/admin/produits/nouveau" className="btn-primary rounded-md">
            Ajouter un produit
          </Link>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sable bg-white">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-ivoire text-[11px] uppercase tracking-[0.12em] text-taupe">
              <tr>
                <th className="px-5 py-3 font-medium">Tenue</th>
                <th className="px-5 py-3 font-medium">Collection</th>
                <th className="px-5 py-3 text-right font-medium">Location</th>
                <th className="px-5 py-3 text-right font-medium">Exemplaires</th>
                <th className="px-5 py-3 text-center font-medium">Visible</th>
                <th className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-ivoire">
                  <td className="px-5 py-3">
                    <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#F6F1EB]">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover mix-blend-multiply" />}
                      </span>
                      <span>
                        <span className="flex items-center gap-1.5 font-medium text-encre hover:underline">
                          {p.name}
                          {p.is_featured && <Flame className="h-4 w-4 shrink-0 text-or-600" strokeWidth={2} aria-label="Très demandée" />}
                        </span>
                        <span className="text-[12px] text-taupe">{p.material ?? ""}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-taupe">{p.collection?.name ?? <span className="text-prune-600">Sans collection</span>}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                      <span className="block text-[12px] text-taupe line-through">{formatPrice(p.compare_at_price)}</span>
                    )}
                    {formatPrice(p.price)}
                    {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                      <span className="ml-1.5 rounded bg-prune-50 px-1.5 py-0.5 text-[11px] font-medium text-prune-700">
                        −{percentFromPrices(Number(p.compare_at_price), Number(p.price))} %
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    <span className={p.stock <= 0 ? "font-medium text-prune-600" : p.stock <= 2 ? "font-medium text-or-700" : ""}>
                      {p.stock <= 0 ? "Retirée" : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-1 text-center">
                    <ActiveSwitch id={p.id} active={p.is_active} label={p.name} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/produits/${p.id}`} aria-label={`Modifier ${p.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-prune-900 hover:bg-champagne">
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
