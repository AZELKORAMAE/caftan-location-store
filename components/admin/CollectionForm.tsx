"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCollection } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import type { Collection } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";
import { Toggle } from "./ProductForm";
import { Card } from "./ui";

export function CollectionForm({ collection }: { collection?: Collection }) {
  const [state, action, pending] = useActionState(saveCollection, null);
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [touched, setTouched] = useState(Boolean(collection));

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-3">
      {collection && <input type="hidden" name="id" value={collection.id} />}
      <div className="space-y-6 xl:col-span-2">
        <Card title="Informations">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="field-label">
                Nom de la collection <span className="text-prune-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                defaultValue={collection?.name}
                onChange={(e) => !touched && setSlug(slugify(e.target.value))}
                className="field rounded-md"
                required
              />
              {state?.fieldErrors?.name && <p role="alert" className="mt-1.5 text-[13px] text-prune-600">{state.fieldErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="slug" className="field-label">
                Lien de la page
              </label>
              <div className="flex items-center rounded-md border border-sable bg-ivoire focus-within:border-prune-900">
                <span className="hidden pl-4 text-[14px] text-taupe sm:inline">/collections/</span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setTouched(true);
                  }}
                  className="min-h-[48px] w-full bg-transparent px-2 text-[15px] focus:outline-none"
                />
              </div>
              {state?.fieldErrors?.slug && <p role="alert" className="mt-1.5 text-[13px] text-prune-600">{state.fieldErrors.slug}</p>}
            </div>
            <div>
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea id="description" name="description" rows={4} defaultValue={collection?.description ?? ""} className="field rounded-md py-3" />
            </div>
          </div>
        </Card>
        <Card title="Visuel de la collection">
          <ImageUploader name="image_url" initial={collection?.image_url ? [collection.image_url] : []} multiple={false} folder="collections" format="single" />
          <p className="mt-3 text-[12px] text-taupe">Image utilisée en bannière et sur l&apos;accueil. Format paysage ou portrait, haute résolution.</p>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Affichage">
          <div className="space-y-5">
            <div>
              <label htmlFor="sort_order" className="field-label">
                Ordre d&apos;affichage
              </label>
              <input id="sort_order" name="sort_order" inputMode="numeric" defaultValue={collection?.sort_order ?? 0} className="field rounded-md" />
            </div>
            <Toggle name="is_featured" label="Mise en avant sur l'accueil" defaultChecked={collection?.is_featured ?? true} />
            <Toggle name="requires_size" label="Proposer le choix de la taille (5 à 10)" defaultChecked={collection?.requires_size ?? false} />
            <p className="-mt-3 text-[12px] text-taupe">La cliente pourra indiquer sa taille (XS à XXL, facultatif) pour chaque tenue de cette collection.</p>
          </div>
        </Card>
        <div className="space-y-3 rounded-lg border border-sable bg-white p-4">
          {state && !state.ok && (
            <p role="alert" className="rounded-md bg-prune-50 px-3 py-2 text-[13px] text-prune-700">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn-primary w-full rounded-md">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : collection ? "Enregistrer" : "Créer la collection"}
          </button>
          <Link href="/admin/collections" className="block min-h-[40px] py-2 text-center text-[13px] text-taupe hover:text-encre">
            Annuler
          </Link>
        </div>
      </div>
    </form>
  );
}
