"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { todayISO } from "./dates";
import { depositTotal, shippingFee } from "./pricing";
import type { CartItem } from "./types";

/** Identifiant de ligne du panier : produit + taille éventuelle. */
export const lineKey = (i: Pick<CartItem, "productId" | "size">) => (i.size ? `${i.productId}:${i.size}` : i.productId);

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** Total économisé grâce aux promotions */
  savings: number;
  /** Frais de livraison (0 si tout est en livraison gratuite) */
  shipping: number;
  /** Total des cautions */
  deposit: number;
  /** Date de l'événement choisie par la cliente (AAAA-MM-JJ), partagée par la fiche produit et la réservation */
  eventDate: string;
  setEventDate: (date: string) => void;
  ready: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number, options?: { open?: boolean }) => void;
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  setSize: (key: string, size: string | null) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dar-lalla-cart";
const DATE_KEY = "dar-lalla-event-date";
const MAX_QTY = 5;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
      const savedDate = localStorage.getItem(DATE_KEY);
      // Une date déjà passée n'est pas reprise
      if (savedDate && savedDate > todayISO()) setEventDate(savedDate);
    } catch {
      // stockage indisponible (navigation privée) : panier en mémoire uniquement
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(DATE_KEY, eventDate);
    } catch {}
  }, [items, eventDate, ready]);

  const add = useCallback<CartContextValue["add"]>((item, quantity = 1, options) => {
    setItems((prev) => {
      const limit = Math.min(MAX_QTY, Math.max(item.stock, 1));
      const key = lineKey(item);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, limit) } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, limit) }];
    });
    // Le panier latéral s'ouvre sauf pour l'ajout rapide depuis une carte produit
    if (options?.open !== false) setIsOpen(true);
  }, []);

  const update = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (lineKey(i) === key ? { ...i, quantity: Math.min(quantity, MAX_QTY, Math.max(i.stock, 1)) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }, []);

  const setSize = useCallback((key: string, size: string | null) => {
    setItems((prev) => {
      const line = prev.find((i) => lineKey(i) === key);
      if (!line) return prev;
      const updated = { ...line, size };
      const others = prev.filter((i) => lineKey(i) !== key);
      const same = others.find((i) => lineKey(i) === lineKey(updated));
      if (same) {
        const limit = Math.min(MAX_QTY, Math.max(same.stock, 1));
        return others.map((i) => (i === same ? { ...i, quantity: Math.min(i.quantity + line.quantity, limit) } : i));
      }
      return prev.map((i) => (lineKey(i) === key ? updated : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      isOpen,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      shipping: shippingFee(items),
      deposit: depositTotal(items),
      eventDate,
      setEventDate,
      savings: items.reduce((n, i) => n + (i.compareAt && i.compareAt > i.price ? (i.compareAt - i.price) * i.quantity : 0), 0),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      update,
      remove,
      setSize,
      clear,
    }),
    [items, ready, isOpen, eventDate, add, update, remove, setSize, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
