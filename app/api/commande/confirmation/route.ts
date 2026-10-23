import { NextResponse } from "next/server";
import { orderConfirmationEmail, type OrderSummary } from "@/lib/email/order-confirmation";
import { isMailConfigured, sendMail } from "@/lib/email/send";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Envoie l'e-mail de confirmation à la cliente juste après sa réservation. */
export async function POST(request: Request) {
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !isSupabaseConfigured) {
    return NextResponse.json({ ok: false, error: "Réservation invalide" }, { status: 400 });
  }
  if (!isMailConfigured()) {
    console.warn("E-mail de confirmation non envoyé : SMTP_USER / SMTP_PASS manquants.");
    return NextResponse.json({ ok: false, error: "E-mail non configuré" }, { status: 503 });
  }

  const { data } = await createPublicClient().rpc("get_order_summary", { p_id: id });
  const order = data as OrderSummary | null;
  if (!order) return NextResponse.json({ ok: false, error: "Réservation introuvable" }, { status: 404 });
  if (!order.email) return NextResponse.json({ ok: true, skipped: "pas d'e-mail" });

  // Uniquement pour une réservation toute récente : évite les renvois abusifs
  if (Date.now() - new Date(order.created_at).getTime() > 15 * 60 * 1000) {
    return NextResponse.json({ ok: false, error: "Réservation trop ancienne" }, { status: 409 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  try {
    await sendMail({ to: order.email, ...orderConfirmationEmail(order, siteUrl) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Envoi de l'e-mail de confirmation impossible :", e);
    return NextResponse.json({ ok: false, error: "Envoi impossible" }, { status: 502 });
  }
}
