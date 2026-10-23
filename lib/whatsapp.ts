import { formatDayLong } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { BRAND } from "@/lib/constants";

/** Numéro WhatsApp de la boutique (format international, sans « + »). Numéro fictif à remplacer. */
export const WHATSAPP_NUMBER = "212600000000";

type Line = { name: string; quantity: number; price: number; deposit?: number; size?: string | null };

/**
 * Lien WhatsApp avec un message de réservation pré-rempli (français / arabe).
 * La taille n'apparaît que si elle a été choisie ; les champs vides restent
 * à compléter par le client.
 */
export function whatsappOrderUrl({
  lines,
  orderNumber,
  shipping = 0,
  name = "",
  address = "",
  phone = "",
  eventDate = "",
  eventType = "",
}: {
  lines: Line[];
  orderNumber?: string;
  shipping?: number;
  name?: string;
  address?: string;
  phone?: string;
  eventDate?: string;
  eventType?: string;
}) {
  const total = lines.reduce((n, l) => n + l.price * l.quantity, 0) + shipping;
  const deposit = lines.reduce((n, l) => n + (l.deposit ?? 0) * l.quantity, 0);
  const message = [
    "السلام عليكم، أريد حجز زي لمناسبتي",
    orderNumber
      ? `Bonjour ${BRAND.name}, je souhaite confirmer ma réservation ${orderNumber} :`
      : `Bonjour ${BRAND.name}, je souhaite réserver :`,
    "",
    `Événement / المناسبة : ${eventDate ? formatDayLong(eventDate) : ""}${eventType ? ` (${eventType})` : ""}`,
    ...lines.map((l) => `• ${l.name} × ${l.quantity}${l.size ? ` · Taille / المقاس ${l.size}` : ""} · ${formatPrice(l.price * l.quantity)}`),
    `Livraison / التوصيل : ${shipping > 0 ? formatPrice(shipping) : "Offerte / مجاني"}`,
    `Total location : ${formatPrice(total)} (paiement à la livraison)`,
    ...(deposit > 0 ? [`Caution / الضمانة : ${formatPrice(deposit)} (rendue au retour)`] : []),
    "",
    `Nom complet / الاسم الكامل : ${name.trim()}`,
    `Adresse / العنوان : ${address.trim()}`,
    `Téléphone / الهاتف : ${phone.trim()}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
