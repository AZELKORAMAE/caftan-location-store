"use client";

import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";

/**
 * Nombre d'exemplaires d'une tenue encore libres pour la date de l'événement.
 * En mode démo (sans Supabase), toutes les tenues en stock sont considérées libres.
 */
export async function checkAvailability(productId: string, eventDate: string, stock: number): Promise<number> {
  if (!isSupabaseConfigured) return Math.max(stock, 0);
  const { data, error } = await createClient().rpc("check_availability", { p_product_id: productId, p_event_date: eventDate });
  if (error || data == null) return Math.max(stock, 0);
  return Number(data);
}
