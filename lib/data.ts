import "server-only";
import catalog from "@/data/catalog.json";
import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/server";
import type { Collection, Product } from "./types";

// ---------------------------------------------------------------------
//  Mode démo : données locales tant que Supabase n'est pas configuré
// ---------------------------------------------------------------------
const demoCollections: Collection[] = catalog.collections.map((c) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image_url: c.image_url,
  is_featured: c.is_featured,
  sort_order: c.sort_order,
  requires_size: c.requires_size,
}));

const demoProducts: Product[] = catalog.products.map((p, i) => {
  const col = demoCollections.find((c) => c.slug === p.collection);
  return {
    id: p.slug,
    name: p.name,
    slug: p.slug,
    description: p.description,
    details: p.details,
    price: p.price,
    compare_at_price: p.compare_at_price ?? null,
    deposit: p.deposit,
    category: p.category,
    material: p.material,
    collection_id: col?.id ?? null,
    collection: col ? { name: col.name, slug: col.slug, requires_size: col.requires_size } : null,
    requires_size: Boolean(col?.requires_size),
    free_shipping: p.free_shipping,
    images: p.images,
    stock: p.stock,
    is_featured: p.is_featured,
    is_new: p.is_new,
    is_active: true,
    created_at: new Date(Date.now() - (p.is_new ? i : 30 + i) * 86400000).toISOString(),
  };
});

export type ProductQuery = {
  category?: string;
  collectionId?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
  isNew?: boolean;
  maxPrice?: number;
  limit?: number;
  excludeId?: string;
};

const PRODUCT_SELECT = "*, collection:collections(name, slug, requires_size)";

function normalizeProduct(row: Record<string, unknown>): Product {
  const collection = row.collection as { name: string; slug: string; requires_size?: boolean } | null;
  return {
    ...(row as Product),
    price: Number(row.price),
    compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
    deposit: Number(row.deposit ?? 0),
    requires_size: Boolean(collection?.requires_size),
  };
}

export async function getCollections(): Promise<Collection[]> {
  if (!isSupabaseConfigured) return demoCollections;
  const { data, error } = await createPublicClient()
    .from("collections")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) console.error("getCollections", error.message);
  return (data as Collection[]) ?? [];
}

export async function getCollection(slug: string): Promise<Collection | null> {
  if (!isSupabaseConfigured) return demoCollections.find((c) => c.slug === slug) ?? null;
  const { data } = await createPublicClient().from("collections").select("*").eq("slug", slug).maybeSingle();
  return (data as Collection) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { category, collectionId, q, sort, featured, isNew, maxPrice, limit, excludeId } = query;

  if (!isSupabaseConfigured) {
    let list = [...demoProducts];
    if (category) list = list.filter((p) => p.category === category);
    if (collectionId) list = list.filter((p) => p.collection_id === collectionId);
    if (featured) list = list.filter((p) => p.is_featured);
    if (isNew) list = list.filter((p) => p.is_new);
    if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
    if (excludeId) list = list.filter((p) => p.id !== excludeId);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.description} ${p.material} ${p.collection?.name}`.toLowerCase().includes(needle));
    }
    list.sort(sorter(sort));
    return limit ? list.slice(0, limit) : list;
  }

  let req = createPublicClient().from("products").select(PRODUCT_SELECT).eq("is_active", true);
  if (category) req = req.eq("category", category);
  if (collectionId) req = req.eq("collection_id", collectionId);
  if (featured) req = req.eq("is_featured", true);
  if (isNew) req = req.eq("is_new", true);
  if (maxPrice) req = req.lte("price", maxPrice);
  if (excludeId) req = req.neq("id", excludeId);
  if (q) {
    const safe = q.replace(/[,()*%\\]/g, " ").trim();
    if (safe) req = req.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,material.ilike.%${safe}%`);
  }
  if (sort === "prix-asc") req = req.order("price", { ascending: true });
  else if (sort === "prix-desc") req = req.order("price", { ascending: false });
  else if (sort === "nouveautes") req = req.order("created_at", { ascending: false });
  else req = req.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  if (limit) req = req.limit(limit);

  const { data, error } = await req;
  if (error) console.error("getProducts", error.message);
  return (data ?? []).map(normalizeProduct);
}

type HomeSection = "featured" | "new";

/**
 * Produits d'une section de l'accueil, dans l'ordre réglé dans Admin → Page d'accueil.
 * « featured » = cochés « Les plus demandées » ; « new » = cochés « Nouveauté ».
 * Sans ordre défini : du plus récent au plus ancien.
 */
export async function getHomeSection(section: HomeSection, limit = 12): Promise<Product[]> {
  const flag = section === "featured" ? "is_featured" : "is_new";
  const rank = section === "featured" ? "featured_rank" : "new_rank";
  if (!isSupabaseConfigured) return getProducts({ [section === "featured" ? "featured" : "isNew"]: true, sort: "nouveautes", limit });

  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq(flag, true)
    .order(rank, { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return getProducts({ [section === "featured" ? "featured" : "isNew"]: true, sort: "nouveautes", limit });
  return (data ?? []).map(normalizeProduct);
}

/** Tenues cochées « Les plus demandées » (flamme + section de l'accueil). */
export function getBestSellers(limit = 12) {
  return getHomeSection("featured", limit);
}

/** Produits cochés « Nouveauté » (section « Nouveautés »). */
export function getNewArrivals(limit = 12) {
  return getHomeSection("new", limit);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return demoProducts.find((p) => p.slug === slug) ?? null;
  const { data } = await createPublicClient().from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data) return null;
  const product = normalizeProduct(data);

  return product;
}

function sorter(sort?: string) {
  return (a: Product, b: Product) => {
    if (sort === "prix-asc") return a.price - b.price;
    if (sort === "prix-desc") return b.price - a.price;
    const byDate = new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    if (sort === "nouveautes") return byDate;
    return Number(b.is_featured) - Number(a.is_featured) || byDate;
  };
}
