import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { getAdmin } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata = { title: "Modifier la tenue" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getAdmin();
  const [{ data: product }, { data: collections }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("collections").select("id, name").order("sort_order"),
  ]);
  if (!product) notFound();
  const p = { ...(product as Product), price: Number(product.price), compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price) };

  return (
    <>
      <Link href="/admin/produits" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900">
        <ArrowLeft className="h-4 w-4" /> Produits
      </Link>
      <PageHeader title={p.name} description="Modifiez les informations de cette tenue.">
        <Link href={`/produit/${p.slug}`} target="_blank" className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-[13px] text-prune-900 hover:bg-champagne">
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Voir en boutique
        </Link>
        <DeleteButton action={deleteProduct.bind(null, p.id)} label="Supprimer" redirectTo="/admin/produits" />
      </PageHeader>
      <ProductForm product={p} collections={collections ?? []} />
    </>
  );
}
