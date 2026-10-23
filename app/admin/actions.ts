"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays, todayISO } from "@/lib/dates";
import { sendDeliveryReminders } from "@/lib/deliveries";
import { slugify } from "@/lib/format";
import { getAdmin } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type ActionState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

async function requireAdmin() {
  const { supabase, profile } = await getAdmin();
  if (!profile) throw new Error("Accès refusé");
  return supabase;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string) => {
  const raw = str(fd, key).replace(/\s/g, "").replace(",", ".");
  return raw === "" ? null : Number(raw);
};

function refreshStore() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ Produits
export async function saveProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const price = num(fd, "price");
  const compare = num(fd, "compare_at_price");
  const deposit = num(fd, "deposit");
  const stock = num(fd, "stock");
  let images: string[] = [];
  try {
    images = JSON.parse(str(fd, "images") || "[]");
  } catch {}

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Le nom est obligatoire.";
  if (price === null || Number.isNaN(price) || price < 0) fieldErrors.price = "Indiquez un prix valide.";
  if (compare !== null && (Number.isNaN(compare) || compare < 0)) fieldErrors.compare_at_price = "Prix barré invalide.";
  if (deposit !== null && (Number.isNaN(deposit) || deposit < 0)) fieldErrors.deposit = "Caution invalide.";
  if (stock === null || !Number.isInteger(stock) || stock < 0) fieldErrors.stock = "Le stock doit être un nombre entier positif.";
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Certains champs sont à corriger.", fieldErrors };

  const payload = {
    name,
    slug: slugify(str(fd, "slug") || name),
    description: str(fd, "description") || null,
    details: str(fd, "details") || null,
    price,
    // Promotion seulement si le prix initial dépasse le prix de location
    compare_at_price: compare !== null && price !== null && compare > price ? compare : null,
    deposit: deposit ?? 0,
    category: str(fd, "category") || "caftan",
    material: str(fd, "material") || null,
    collection_id: str(fd, "collection_id") || null,
    // Photos téléversées (https) ou photos de démonstration du dossier public/images
    images: images.filter((u) => typeof u === "string" && (u.startsWith("http") || u.startsWith("/images/"))),
    stock,
    is_featured: fd.get("is_featured") === "on",
    is_new: fd.get("is_new") === "on",
    is_active: fd.get("is_active") === "on",
    free_shipping: fd.get("free_shipping") === "on",
  };

  const { error } = id ? await supabase.from("products").update(payload).eq("id", id) : await supabase.from("products").insert(payload);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Ce lien (slug) est déjà utilisé.", fieldErrors: { slug: "Choisissez un autre lien." } };
    return { ok: false, message: error.message };
  }
  refreshStore();
  revalidatePath("/admin/produits");
  redirect("/admin/produits?ok=1");
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  refreshStore();
  revalidatePath("/admin/produits");
  return { ok: true, message: "Tenue supprimée." };
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = await requireAdmin();
  await supabase.from("products").update({ is_active: active }).eq("id", id);
  refreshStore();
  revalidatePath("/admin/produits");
}

// -------------------------------------------------------- Page d'accueil
/** Enregistre l'ordre complet d'une section après un glisser-déposer (1, 2, 3…). */
export async function saveHomeOrder(section: "featured" | "new", ids: string[]) {
  const supabase = await requireAdmin();
  const rank = section === "featured" ? "featured_rank" : "new_rank";
  const results = await Promise.all(
    ids.slice(0, 500).map((pid, index) => supabase.from("products").update({ [rank]: index + 1 }).eq("id", pid))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, message: failed.error.message };
  refreshStore();
  revalidatePath("/admin/accueil");
  return { ok: true, message: "Ordre enregistré" };
}

// ------------------------------------------------------------- Collections
export async function saveCollection(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { ok: false, message: "Le nom est obligatoire.", fieldErrors: { name: "Le nom est obligatoire." } };

  const payload = {
    name,
    slug: slugify(str(fd, "slug") || name),
    description: str(fd, "description") || null,
    image_url: str(fd, "image_url") || null,
    sort_order: num(fd, "sort_order") ?? 0,
    is_featured: fd.get("is_featured") === "on",
    requires_size: fd.get("requires_size") === "on",
  };

  const { error } = id ? await supabase.from("collections").update(payload).eq("id", id) : await supabase.from("collections").insert(payload);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Ce lien (slug) est déjà utilisé.", fieldErrors: { slug: "Choisissez un autre lien." } };
    return { ok: false, message: error.message };
  }
  refreshStore();
  revalidatePath("/admin/collections");
  redirect("/admin/collections?ok=1");
}

export async function deleteCollection(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  refreshStore();
  revalidatePath("/admin/collections");
  return { ok: true, message: "Collection supprimée." };
}

// ------------------------------------------------------------- Réservations
const STATUSES: OrderStatus[] = ["pending", "confirmed", "postponed", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await requireAdmin();
  if (!STATUSES.includes(status)) return { ok: false, message: "Statut invalide." };
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin", "layout");
  refreshStore();
  return { ok: true, message: "Statut mis à jour." };
}

/** Fixe (ou retire) la date de livraison d'une réservation ; le rappel 48 h est réarmé. */
export async function setDeliveryDate(id: string, date: string | null) {
  const supabase = await requireAdmin();
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "Date invalide." };

  // Au-delà de 48 h → « Reportée » ; dans les 48 h (ou sans date) une réservation reportée redevient « Confirmée ».
  // Une réservation rendue ou annulée garde son statut.
  const { data: current } = await supabase.from("orders").select("status").eq("id", id).maybeSingle();
  const status = current?.status as OrderStatus | undefined;
  const update: { delivery_date: string | null; delivery_reminder_sent: boolean; status?: OrderStatus } = { delivery_date: date, delivery_reminder_sent: false };
  if (status && status !== "delivered" && status !== "cancelled") {
    if (date && date > addDays(todayISO(), 2)) update.status = "postponed";
    else if (status === "postponed") update.status = "confirmed";
  }

  const { error } = await supabase.from("orders").update(update).eq("id", id);
  if (error) return { ok: false, message: error.message };
  await sendDeliveryReminders(supabase);
  revalidatePath("/admin", "layout");
  const suffix = update.status === "postponed" ? " La réservation passe en « Reportée »." : update.status === "confirmed" ? " La réservation repasse en « Confirmée »." : "";
  return { ok: true, message: (date ? "Date de livraison enregistrée." : "Date de livraison retirée.") + suffix };
}

/**
 * Supprime une réservation (ses tenues et notifications sont supprimées en cascade par la base).
 * Les tenues redeviennent aussitôt disponibles pour la date de l'événement.
 */
export async function deleteOrder(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin", "layout");
  refreshStore();
  return { ok: true, message: "Réservation supprimée." };
}

// ----------------------------------------------------------- Notifications
export async function markNotificationsRead(ids?: string[]) {
  const supabase = await requireAdmin();
  let req = supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (ids?.length) req = req.in("id", ids);
  await req;
  revalidatePath("/admin", "layout");
}

export async function signOutAdmin() {
  const { supabase } = await getAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
