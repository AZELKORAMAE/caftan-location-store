import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { getAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Nouvelle tenue" };

export default async function NewProductPage() {
  const { supabase } = await getAdmin();
  const { data: collections } = await supabase.from("collections").select("id, name").order("sort_order");

  return (
    <>
      <Link href="/admin/produits" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900">
        <ArrowLeft className="h-4 w-4" /> Produits
      </Link>
      <PageHeader title="Nouvelle tenue" description="Ajoutez une tenue à louer à votre catalogue." />
      <ProductForm collections={collections ?? []} />
    </>
  );
}
