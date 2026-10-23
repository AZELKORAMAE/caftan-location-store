"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct, type ActionState } from "@/app/admin/actions";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/format";
import { SHIPPING_FEE } from "@/lib/pricing";
import type { Collection, Product } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";
import { PriceFields } from "./PriceFields";
import { Card } from "./ui";

function FieldError({ state, name }: { state: ActionState; name: string }) {
  const msg = state?.fieldErrors?.[name];
  return msg ? (
    <p role="alert" className="mt-1.5 text-[13px] text-prune-600">
      {msg}
    </p>
  ) : null;
}

export function ProductForm({ product, collections }: { product?: Product; collections: Pick<Collection, "id" | "name">[] }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-3">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6 xl:col-span-2">
        <Card title="Informations">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="field-label">
                Nom de la tenue <span className="text-prune-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className="field rounded-md"
                required
              />
              <FieldError state={state} name="name" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="slug" className="field-label">
                Lien de la page
              </label>
              <div className="flex items-center rounded-md border border-sable bg-ivoire focus-within:border-prune-900">
                <span className="hidden pl-4 text-[14px] text-taupe sm:inline">/produit/</span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className="min-h-[48px] w-full bg-transparent px-2 text-[15px] focus:outline-none"
                />
              </div>
              <FieldError state={state} name="slug" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className="field rounded-md py-3" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="details" className="field-label">
                Détails <span className="normal-case tracking-normal text-taupe">(une caractéristique par ligne)</span>
              </label>
              <textarea id="details" name="details" rows={4} defaultValue={product?.details ?? ""} placeholder={"Velours brodé au fil d'or\nCeinture assortie incluse\nTailles disponibles : S à XL"} className="field rounded-md py-3" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="material" className="field-label">
                Matière
              </label>
              <input id="material" name="material" defaultValue={product?.material ?? ""} placeholder="Velours grenat, broderie au fil d’or" className="field rounded-md" />
            </div>
          </div>
        </Card>

        <Card title="Images">
          <ImageUploader name="images" initial={product?.images ?? []} folder="produits" />
          <p className="mt-3 text-[12px] text-taupe">La première image est affichée dans la boutique ; la deuxième apparaît au survol.</p>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Prix & exemplaires">
          <div className="space-y-5">
            <PriceFields
              price={product?.price}
              compareAt={product?.compare_at_price}
              isNew={!product}
              priceError={state?.fieldErrors?.price}
              compareError={state?.fieldErrors?.compare_at_price}
            />
            <div>
              <label htmlFor="deposit" className="field-label">
                Caution <span className="normal-case tracking-normal text-taupe">(rendue au retour)</span>
              </label>
              <input id="deposit" name="deposit" inputMode="decimal" defaultValue={product?.deposit ?? ""} placeholder="Ex. : 1500" className="field rounded-md tabular-nums" />
              <FieldError state={state} name="deposit" />
            </div>
            <div>
              <label htmlFor="stock" className="field-label">
                Nombre d&apos;exemplaires <span className="text-prune-600">*</span>
              </label>
              <input id="stock" name="stock" inputMode="numeric" defaultValue={product?.stock ?? 1} className="field rounded-md tabular-nums" required />
              <p className="mt-1.5 text-[12px] text-taupe">Combien de fois cette tenue peut être louée pour une même date (0 = plus proposée).</p>
              <FieldError state={state} name="stock" />
            </div>
          </div>
        </Card>

        <Card title="Classement">
          <div className="space-y-5">
            <div>
              <label htmlFor="category" className="field-label">
                Type de tenue
              </label>
              <select id="category" name="category" defaultValue={product?.category ?? "caftan"} className="field cursor-pointer rounded-md">
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="collection_id" className="field-label">
                Collection
              </label>
              <select id="collection_id" name="collection_id" defaultValue={product?.collection_id ?? ""} className="field cursor-pointer rounded-md">
                <option value="">— Aucune —</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="space-y-1">
              <legend className="field-label">Visibilité</legend>
              <Toggle name="is_active" label="Visible sur le site" defaultChecked={product?.is_active ?? true} />
              <Toggle name="is_featured" label="Très demandée (flamme + section « Les plus demandées »)" defaultChecked={product?.is_featured ?? false} />
              <Toggle name="is_new" label="Badge « Nouveauté »" defaultChecked={product?.is_new ?? true} />
            </fieldset>
            <fieldset className="space-y-1">
              <legend className="field-label">Livraison</legend>
              <Toggle name="free_shipping" label="Livraison gratuite" defaultChecked={product?.free_shipping ?? true} />
              <p className="text-[12px] leading-relaxed text-taupe">Si désactivée, {SHIPPING_FEE} DH de livraison sont ajoutés à la réservation (une seule fois par réservation).</p>
            </fieldset>
          </div>
        </Card>

        <div className="sticky bottom-4 space-y-3 rounded-lg border border-sable bg-white p-4 shadow-lg shadow-prune-950/5">
          {state && !state.ok && (
            <p role="alert" className="rounded-md bg-prune-50 px-3 py-2 text-[13px] text-prune-700">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn-primary w-full rounded-md">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : product ? "Enregistrer les modifications" : "Publier la tenue"}
          </button>
          <Link href="/admin/produits" className="block min-h-[40px] py-2 text-center text-[13px] text-taupe hover:text-encre">
            Annuler
          </Link>
        </div>
      </div>
    </form>
  );
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 text-[14px] text-encre">
      {label}
      <span className="relative inline-flex">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-sable transition-colors peer-checked:bg-prune-900 peer-focus-visible:ring-2 peer-focus-visible:ring-or-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
