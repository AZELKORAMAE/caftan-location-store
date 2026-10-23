import "server-only";
import { BRAND, STORE } from "@/lib/constants";
import { formatDayLong } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export type OrderSummary = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string | null;
  address: string;
  city: string | null;
  event_date: string;
  event_type: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  deposit_total: number;
  created_at: string;
  items: { product_name: string; product_image: string | null; unit_price: number; quantity: number; line_total: number; size?: string | null }[];
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SANS = "font-family:Arial,Helvetica,sans-serif;";
const SERIF = "font-family:Georgia,'Times New Roman',serif;";

/** E-mail « Merci pour votre réservation », même charte que l'e-mail du code de confirmation. */
export function orderConfirmationEmail(order: OrderSummary, siteUrl: string) {
  const firstName = esc(order.customer_name.split(" ")[0]);
  // Les photos de démonstration sont des chemins relatifs (/images/...) : l'e-mail a besoin d'une adresse complète
  const abs = (url: string) => (url.startsWith("/") ? `${siteUrl}${url}` : url);
  const eventLabel = `${order.event_type ? `${order.event_type} · ` : ""}${formatDayLong(order.event_date)}`;
  const rows = order.items
    .map(
      (i) => `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #EADFD2;width:64px;">
                ${i.product_image ? `<img src="${esc(abs(i.product_image))}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;object-fit:cover;background:#F6F1EB;" />` : ""}
              </td>
              <td style="padding:12px 12px;border-bottom:1px solid #EADFD2;${SANS}font-size:14px;color:#1E1214;">
                ${esc(i.product_name)}<br /><span style="font-size:12px;color:#6E5F5F;">Quantité : ${i.quantity}${i.size ? ` · Taille : ${esc(i.size)}` : ""}</span>
              </td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid #EADFD2;${SANS}font-size:14px;color:#1E1214;white-space:nowrap;">
                ${esc(formatPrice(i.line_total))}
              </td>
            </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Votre réservation Dar Lalla</title></head>
  <body style="margin:0;padding:0;background-color:#F4EDE4;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4EDE4;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#FFFFFF;">
            <tr>
              <td align="center" style="background-color:#2A0B28;padding:36px 24px 30px;">
                <div style="${SERIF}font-size:30px;letter-spacing:4px;color:#FBF8F4;">DAR <span style="font-style:italic;letter-spacing:0;color:#DDBB88;">Lalla</span></div>
                <div style="${SANS}font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#CDA06C;margin-top:8px;">Location de caftans</div>
              </td>
            </tr>
            <tr><td style="height:3px;background-color:#BB8656;line-height:3px;font-size:0;">&nbsp;</td></tr>
            <tr>
              <td align="center" style="padding:44px 36px 8px;">
                <div style="${SANS}font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7D5431;">Réservation ${esc(order.order_number)}</div>
                <h1 style="margin:14px 0 0;${SERIF}font-weight:normal;font-size:28px;line-height:1.3;color:#2A0B28;">Merci, ${firstName}</h1>
                <p style="margin:18px 0 0;${SANS}font-size:15px;line-height:1.6;color:#6E5F5F;">
                  Nous avons bien reçu votre réservation du ${esc(formatDate(order.created_at))}.
                </p>
                <p style="margin:14px 0 0;${SERIF}font-size:20px;color:#2A0B28;">Événement : ${esc(eventLabel)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBF8F4;border-left:3px solid #BB8656;">
                  <tr>
                    <td style="padding:18px 20px;${SANS}font-size:14px;line-height:1.6;color:#2A0B28;">
                      Notre équipe vous appelle très prochainement pour confirmer la réservation et organiser l'essayage et la livraison de votre tenue.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 0;">
                <div style="${SERIF}font-size:20px;color:#2A0B28;margin-bottom:4px;">Récapitulatif</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}
                  <tr>
                    <td colspan="2" style="padding:10px 0 0;${SANS}font-size:13px;color:#6E5F5F;">Livraison</td>
                    <td align="right" style="padding:10px 0 0;${SANS}font-size:13px;color:#7D5431;">${Number(order.shipping) > 0 ? esc(formatPrice(order.shipping)) : "Offerte"}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:10px 0 0;${SANS}font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#1E1214;">Location à régler à la livraison</td>
                    <td align="right" style="padding:10px 0 0;${SERIF}font-size:22px;color:#2A0B28;white-space:nowrap;">${esc(formatPrice(order.total))}</td>
                  </tr>${
                    Number(order.deposit_total) > 0
                      ? `
                  <tr>
                    <td colspan="2" style="padding:8px 0 0;${SANS}font-size:13px;color:#6E5F5F;">Caution, rendue au retour de la tenue</td>
                    <td align="right" style="padding:8px 0 0;${SANS}font-size:13px;color:#1E1214;">${esc(formatPrice(order.deposit_total))}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 8px;${SANS}font-size:13px;line-height:1.6;color:#6E5F5F;">
                <strong style="color:#1E1214;">Adresse de livraison</strong><br />
                ${esc(order.address)}${order.city ? `, ${esc(order.city)}` : ""}<br /><br />
                <strong style="color:#1E1214;">Paiement</strong><br />
                À la livraison de la tenue (location et caution).
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 36px 40px;">
                <p style="margin:0 0 22px;${SERIF}font-size:20px;font-style:italic;color:#2A0B28;">Merci d'avoir choisi ${esc(BRAND.name)}.</p>
                <a href="${esc(siteUrl)}/commande/${esc(order.id)}" style="display:inline-block;background-color:#2A0B28;color:#FBF8F4;${SANS}font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">Voir ma réservation</a>
              </td>
            </tr>
            <tr>
              <td align="center" style="background-color:#FBF8F4;border-top:1px solid #EADFD2;padding:22px 24px;">
                <p style="margin:0;${SANS}font-size:12px;line-height:1.7;color:#6E5F5F;">
                  Une question ? WhatsApp : <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#6F3467;">${esc(STORE.phone)}</a><br />
                  ${esc(STORE.storeName)} · ${esc(STORE.addressLine1)}, ${esc(STORE.addressLine2)}
                </p>
                <p style="margin:6px 0 0;${SANS}font-size:11px;color:#9C8F8F;">© ${esc(BRAND.name)} — ${esc(STORE.tagline)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Merci, ${order.customer_name.split(" ")[0]} !`,
    `Nous avons bien reçu votre réservation ${order.order_number}.`,
    `Événement : ${eventLabel}`,
    "Notre équipe vous appelle très prochainement pour confirmer la réservation et organiser l'essayage et la livraison.",
    "",
    ...order.items.map((i) => `- ${i.product_name}${i.size ? ` (taille ${i.size})` : ""} × ${i.quantity} : ${formatPrice(i.line_total)}`),
    `Location à régler à la livraison : ${formatPrice(order.total)}`,
    ...(Number(order.deposit_total) > 0 ? [`Caution (rendue au retour) : ${formatPrice(order.deposit_total)}`] : []),
    `Livraison : ${order.address}${order.city ? `, ${order.city}` : ""}`,
    "",
    `Merci d'avoir choisi ${BRAND.name}.`,
    `WhatsApp : ${STORE.phone}`,
  ].join("\n");

  return { subject: `Votre réservation ${order.order_number} — ${BRAND.name}`, html, text };
}
