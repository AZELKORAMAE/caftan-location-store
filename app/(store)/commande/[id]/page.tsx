import { CalendarHeart, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { formatDayLong } from "@/lib/dates";
import { formatDate, formatPrice } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/server";
import type { OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "Réservation reçue", robots: { index: false } };
export const dynamic = "force-dynamic";

type Summary = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string | null;
  address: string;
  city: string | null;
  event_date: string;
  event_type: string | null;
  subtotal: number;
  deposit_total: number;
  shipping: number;
  total: number;
  created_at: string;
  items: OrderItem[];
};

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await createPublicClient().rpc("get_order_summary", { p_id: id });
  const order = data as Summary | null;
  if (!order) notFound();

  return (
    <div className="container max-w-3xl py-16 md:py-24">
      <Reveal className="text-center">
        <CircleCheck className="mx-auto h-14 w-14 text-or-600" strokeWidth={1} />
        <p className="eyebrow mt-6 text-or-700">Réservation {order.order_number}</p>
        <h1 className="display mt-4 text-[40px] text-prune-900 md:text-[56px]">Merci, {order.customer_name.split(" ")[0]}</h1>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-taupe">
          Votre réservation a bien été reçue le {formatDate(order.created_at)}. Notre équipe vous appelle très prochainement pour la confirmer et
          organiser l&apos;essayage et la livraison.{order.email && ` Un récapitulatif a été envoyé à ${order.email}.`}
        </p>
        <p className="mx-auto mt-6 inline-flex items-center gap-3 border border-or-300 bg-ivoire px-5 py-3 text-[15px] text-prune-900">
          <CalendarHeart className="h-5 w-5 text-or-600" strokeWidth={1.4} />
          {order.event_type ? `${order.event_type} · ` : "Événement · "}
          <span className="first-letter:uppercase">{formatDayLong(order.event_date)}</span>
        </p>
      </Reveal>

      <Reveal delay={0.15} className="mt-14 bg-ivoire p-6 md:p-10">
        <h2 className="font-serif text-2xl text-prune-900">Récapitulatif</h2>
        <ul className="mt-6 divide-y divide-sable">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#F6F1EB]">
                {item.product_image && <Image src={item.product_image} alt="" fill sizes="64px" className="object-cover mix-blend-multiply" />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-encre">{item.product_name}</p>
                <p className="text-[13px] text-taupe">
                  Quantité : {item.quantity}
                  {item.size && <> · Taille : {item.size}</>}
                </p>
              </div>
              <p className="text-[14px] tabular-nums">{formatPrice(item.line_total)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-sable pt-4 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-taupe">Livraison</dt>
            <dd className="text-or-700">{Number(order.shipping) > 0 ? formatPrice(order.shipping) : "Offerte"}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-[12px] font-medium uppercase tracking-[0.2em]">Location à régler à la livraison</dt>
            <dd className="font-serif text-2xl tabular-nums text-prune-900">{formatPrice(order.total)}</dd>
          </div>
          {Number(order.deposit_total) > 0 && (
            <div className="flex justify-between">
              <dt className="text-taupe">Caution (rendue au retour de la tenue)</dt>
              <dd className="tabular-nums">{formatPrice(order.deposit_total)}</dd>
            </div>
          )}
        </dl>
        <p className="mt-6 text-[13px] text-taupe">
          Adresse de livraison : {order.address}{order.city ? `, ${order.city}` : ""}
        </p>
      </Reveal>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <a
          href={whatsappOrderUrl({
            orderNumber: order.order_number,
            shipping: Number(order.shipping),
            name: order.customer_name,
            address: order.address,
            eventDate: order.event_date,
            eventType: order.event_type ?? "",
            lines: order.items.map((i) => ({
              name: i.product_name,
              quantity: i.quantity,
              price: Number(i.line_total) / i.quantity,
              deposit: Number(i.deposit ?? 0),
              size: i.size,
            })),
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-full bg-[#25D366] text-white hover:bg-[#1EBE5A] sm:w-auto"
        >
          <WhatsAppIcon className="h-5 w-5" /> Confirmer sur WhatsApp · <span dir="rtl" lang="ar" className="normal-case tracking-normal">تأكيد عبر واتساب</span>
        </a>
        <Link href="/boutique" className="btn-primary">
          Voir d&apos;autres tenues
        </Link>
        <Link href="/compte" className="btn-outline">
          Mon compte
        </Link>
      </div>
    </div>
  );
}
