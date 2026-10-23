import type { OrderStatus } from "./types";

export const BRAND = {
  name: "Dar Lalla",
  tagline: "Location de caftans",
  email: "contact@darlalla.ma",
};

/** Visuels éditoriaux (remplaçables : gardez le même nom de fichier dans public/images/). */
export const EDITORIAL_IMAGES = {
  // Grand visuel de l'accueil : fichiers dans public/images/hero/
  hero: ["/images/hero/accueil-1.jpg", "/images/hero/accueil-2.jpg", "/images/hero/accueil-3.jpg"],
  feature: "/images/accueil-collection.jpg", // section éditoriale (1re collection)
  essayage: "/images/accueil-essayage.jpg",
  atelier: "/images/maison-atelier.jpg",
  auth: "/images/connexion.jpg",
  admin: "/images/connexion.jpg",
};

/** Réseaux sociaux : renseignez vos liens pour les afficher dans le pied de page. */
export const SOCIAL_LINKS: { label: string; href: string; icon: "instagram" | "facebook" | "tiktok" | "whatsapp" }[] = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
  { label: "Facebook", href: "", icon: "facebook" },
  { label: "TikTok", href: "", icon: "tiktok" },
  { label: "WhatsApp", href: "https://wa.me/212600000000", icon: "whatsapp" },
];

/** Showroom (informations fictives à remplacer) */
const STORE_ADDRESS = "Dar Lalla, 12 rue des Orangers, Maârif, Casablanca 20330";

export const STORE = {
  tagline: "Location de caftans, takchitas et djellabas",
  instagramHandle: "@darlalla.caftan",
  storeName: "Showroom Dar Lalla",
  addressLine1: "12 rue des Orangers, Maârif",
  addressLine2: "Casablanca 20330",
  hours: "10h00 – 20h00, sur rendez-vous",
  closed: "Fermé le dimanche",
  phone: "+212 6 00 00 00 00",
  phoneHref: "tel:+212600000000",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&output=embed`,
};

/** Types de tenue (colonne « category » des produits). */
export const PRODUCT_CATEGORIES = [
  { value: "caftan", label: "Caftan" },
  { value: "takchita", label: "Takchita" },
  { value: "mariee", label: "Tenue de mariée" },
  { value: "djellaba", label: "Djellaba" },
  { value: "homme", label: "Tenue homme" },
  { value: "enfant", label: "Tenue enfant" },
  { value: "accessoire", label: "Accessoire" },
] as const;

/** Tailles proposées pour les tenues (le client peut aussi laisser vide). */
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/** Types d'événement proposés lors de la réservation. */
export const EVENT_TYPES = ["Mariage", "Fiançailles", "Henné", "Aqiqa", "Soirée", "Aïd", "Autre"] as const;

/**
 * Jours bloqués avant et après l'événement (livraison, retour, pressing).
 * Doit rester égal à la valeur utilisée dans supabase/schema.sql (place_order).
 */
export const BUFFER_DAYS = 2;

/** Délai minimum entre la réservation et l'événement, en jours. */
export const MIN_LEAD_DAYS = 1;

export const SORT_OPTIONS = [
  { value: "", label: "Recommandés" },
  { value: "nouveautes", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
] as const;

export const ORDER_STATUSES: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "En attente", tone: "bg-or-100 text-or-800 ring-or-300" },
  confirmed: { label: "Confirmée", tone: "bg-prune-50 text-prune-700 ring-prune-200" },
  postponed: { label: "Reportée", tone: "bg-sky-50 text-sky-800 ring-sky-200" },
  shipped: { label: "Chez la cliente", tone: "bg-sable text-encre ring-or-200" },
  delivered: { label: "Rendue", tone: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  cancelled: { label: "Annulée", tone: "bg-neutral-100 text-neutral-600 ring-neutral-300" },
};

/** Filtre « petits prix » de la boutique (?prix=petits-prix) */
export const BUDGET_PRICE_LIMIT = 800;
