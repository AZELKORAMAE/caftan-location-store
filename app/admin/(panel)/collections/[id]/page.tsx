import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCollection } from "@/app/admin/actions";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageHeader } from "@/components/admin/ui";
import { getAdmin } from "@/lib/supabase/server";
import type { Collection } from "@/lib/types";

export const metadata = { title: "Modifier la collection" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getAdmin();
  const { data } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const collection = data as Collection;

  return (
    <>
      <Link href="/admin/collections" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900">
        <ArrowLeft className="h-4 w-4" /> Collections
      </Link>
      <PageHeader title={collection.name} description="Les tenues de cette collection resteront au catalogue en cas de suppression.">
        <Link href={`/collections/${collection.slug}`} target="_blank" className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-[13px] text-prune-900 hover:bg-champagne">
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Voir en boutique
        </Link>
        <DeleteButton action={deleteCollection.bind(null, collection.id)} label="Supprimer" redirectTo="/admin/collections" />
      </PageHeader>
      <CollectionForm collection={collection} />
    </>
  );
}
