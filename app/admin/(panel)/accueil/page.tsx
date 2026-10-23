import { ExternalLink, Flame, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { HomeOrderList, type HomeRow } from "@/components/admin/HomeOrderList";
import { Card, PageHeader } from "@/components/admin/ui";
import { getAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Page d'accueil" };

type Row = HomeRow;
type Section = "featured" | "new";

export default async function AdminHomePage() {
  const { supabase } = await getAdmin();

  const load = (section: Section) =>
    supabase
      .from("products")
      .select("id, name, price, images, collection:collections(name)")
      .eq(section === "featured" ? "is_featured" : "is_new", true)
      .eq("is_active", true)
      .order(section === "featured" ? "featured_rank" : "new_rank", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

  const [featured, fresh] = await Promise.all([load("featured"), load("new")]);
  const missingColumns = Boolean(featured.error || fresh.error);

  return (
    <>
      <PageHeader title="Page d'accueil" description="Choisissez l'ordre d'affichage des tenues dans les sections de l'accueil.">
        <Link href="/" target="_blank" className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-[13px] text-prune-900 hover:bg-champagne">
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Voir l&apos;accueil
        </Link>
      </PageHeader>

      {missingColumns && (
        <div role="alert" className="mb-6 flex gap-3 rounded-lg border border-or-300 bg-or-50 p-5 text-[14px] text-or-900">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-or-700" strokeWidth={1.5} />
          <div>
            <p className="font-medium">Une étape reste à faire pour activer le classement.</p>
            <p className="mt-1">
              Dans Supabase → <strong>SQL Editor</strong>, collez le contenu du fichier <code>supabase/ordre-accueil.sql</code> puis cliquez sur{" "}
              <strong>Run</strong>. Rechargez ensuite cette page.
            </p>
          </div>
        </div>
      )}

      {!missingColumns && (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionList
            section="featured"
            title="Les plus demandées"
            icon={<Flame className="h-5 w-5 text-or-600" strokeWidth={1.8} />}
            hint="Tenues cochées « Très demandée ». Glissez par la poignée ⋮⋮ pour changer l'ordre. Les 12 premiers s'affichent sur l'accueil."
            rows={(featured.data ?? []) as unknown as Row[]}
          />
          <SectionList
            section="new"
            title="Nouveautés"
            icon={<Sparkles className="h-5 w-5 text-or-600" strokeWidth={1.8} />}
            hint="Tenues cochées « Nouveauté ». Glissez par la poignée ⋮⋮ pour changer l'ordre. Les 12 premiers s'affichent sur l'accueil."
            rows={(fresh.data ?? []) as unknown as Row[]}
          />
        </div>
      )}
    </>
  );
}

function SectionList({ section, title, icon, hint, rows }: { section: Section; title: string; icon: React.ReactNode; hint: string; rows: Row[] }) {
  return (
    <Card title={title} action={icon}>
      <p className="text-[13px] text-taupe">{hint}</p>
      {rows.length === 0 ? (
        <p className="mt-4 rounded-md bg-ivoire px-4 py-8 text-center text-[13px] text-taupe">
          Aucun produit coché pour le moment. Activez l&apos;option dans <Link href="/admin/produits" className="text-prune-900 underline">Produits</Link>.
        </p>
      ) : (
        <HomeOrderList key={rows.map((r) => r.id).join(",")} section={section} rows={rows} />
      )}
    </Card>
  );
}
