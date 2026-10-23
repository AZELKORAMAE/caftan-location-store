import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, formatDayLong, todayISO } from "./dates";
import type { Order } from "./types";

export type DeliveryRow = Pick<
  Order,
  "id" | "order_number" | "customer_name" | "city" | "phone" | "total" | "status" | "delivery_date" | "event_date" | "event_type"
>;

const OPEN_STATUSES = ["pending", "confirmed", "postponed", "shipped"];

/**
 * Réservations à livrer dans les 48 h (aujourd'hui, demain, après-demain) + celles en retard,
 * hors réservations rendues ou annulées. Renvoie null en cas d'erreur de lecture.
 */
export async function getUpcomingDeliveries(supabase: SupabaseClient): Promise<DeliveryRow[] | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, city, phone, total, status, delivery_date, event_date, event_type")
    .not("delivery_date", "is", null)
    .lte("delivery_date", addDays(todayISO(), 2))
    .in("status", OPEN_STATUSES)
    .order("delivery_date", { ascending: true });
  if (error) return null;
  return (data ?? []) as DeliveryRow[];
}

/**
 * Crée une notification « Livraison dans 48 h » pour chaque réservation concernée qui n'a pas encore été signalée.
 * Appelé à l'ouverture de l'espace admin : la cloche (temps réel) affiche le rappel aussitôt.
 */
export async function sendDeliveryReminders(supabase: SupabaseClient) {
  const today = todayISO();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, city, delivery_date")
    .eq("delivery_reminder_sent", false)
    .not("delivery_date", "is", null)
    .gte("delivery_date", today)
    .lte("delivery_date", addDays(today, 2))
    .in("status", OPEN_STATUSES);
  if (error || !data?.length) return;

  await supabase.from("notifications").insert(
    data.map((o) => ({
      type: "delivery_soon",
      title: `Livraison dans 48 h : ${o.order_number}`,
      message: `${o.customer_name}${o.city ? ` · ${o.city}` : ""} · ${formatDayLong(o.delivery_date as string)}`,
      order_id: o.id,
    }))
  );
  await supabase.from("orders").update({ delivery_reminder_sent: true }).in("id", data.map((o) => o.id));
  // Une réservation reportée qui arrive à 48 h de sa livraison redevient « Confirmée »
  await supabase.from("orders").update({ status: "confirmed" }).in("id", data.map((o) => o.id)).eq("status", "postponed");
}
