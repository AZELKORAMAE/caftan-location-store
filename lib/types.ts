export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  /** Choix de taille (XS à XXL, facultatif) proposé pour les tenues de la collection */
  requires_size?: boolean;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  /** Prix de location pour un événement */
  price: number;
  compare_at_price: number | null;
  /** Caution rendue au retour de la tenue */
  deposit: number;
  category: string;
  material: string | null;
  collection_id: string | null;
  collection?: { name: string; slug: string; requires_size?: boolean } | null;
  images: string[];
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  /** Hérité de la collection : le client peut choisir une taille */
  requires_size?: boolean;
  /** Livraison gratuite (par défaut) ; sinon les frais de livraison sont ajoutés à la réservation */
  free_shipping?: boolean;
  created_at?: string;
};

export type OrderStatus = "pending" | "confirmed" | "postponed" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id?: string;
  product_id?: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  /** Caution de la tenue au moment de la réservation */
  deposit?: number;
  quantity: number;
  line_total: number;
  size?: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  country: string;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  receipt_name?: string | null;
  show_price_on_receipt?: boolean;
  is_gift?: boolean;
  /** Date de l'événement (AAAA-MM-JJ), choisie par la cliente */
  event_date: string;
  /** Mariage, fiançailles, henné… */
  event_type?: string | null;
  /** Total des cautions, rendu au retour des tenues */
  deposit_total: number;
  /** Date de livraison / retrait prévue (AAAA-MM-JJ), fixée par l'admin */
  delivery_date?: string | null;
  delivery_reminder_sent?: boolean;
  created_at: string;
  order_items?: OrderItem[];
};

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  collection: string | null;
  image: string | null;
  price: number;
  /** Prix initial barré (promotion), si supérieur au prix de vente */
  compareAt?: number | null;
  /** Caution de la tenue */
  deposit?: number;
  /** Taille choisie (XS à XXL) si la collection la propose */
  size?: string | null;
  /** Le produit appartient à une collection qui propose une taille */
  sizable?: boolean;
  /** Produit sans livraison gratuite : frais de livraison ajoutés */
  paidShipping?: boolean;
  quantity: number;
  stock: number;
};
