import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Nouvelle collection" };

export default function NewCollectionPage() {
  return (
    <>
      <Link href="/admin/collections" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-taupe hover:text-prune-900">
        <ArrowLeft className="h-4 w-4" /> Collections
      </Link>
      <PageHeader title="Nouvelle collection" description="Créez un nouvel univers pour vos créations." />
      <CollectionForm />
    </>
  );
}
