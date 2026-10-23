"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

/** Événement écouté par l'en-tête pour faire rebondir l'icône du panier. */
export const CART_BUMP_EVENT = "bl:cart-bump";

/** Fait voler la photo du produit depuis le bouton jusqu'à l'icône du panier de l'en-tête. */
function flyToCart(from: HTMLElement, imageUrl: string | null, onArrive: () => void) {
  const target = document.getElementById("header-cart");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!target || reduce) {
    onArrive();
    return;
  }
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 56;
  const startX = a.left + a.width / 2 - size / 2;
  const startY = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - startX;
  const dy = b.top + b.height / 2 - size / 2 - startY;

  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    zIndex: "100",
    pointerEvents: "none",
    backgroundColor: "#2A0B28",
    backgroundImage: imageUrl ? `url("${imageUrl}${imageUrl.includes("?") ? "&" : "?"}w=128")` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "2px solid #BB8656",
    boxShadow: "0 10px 30px -8px rgba(44,0,1,0.45)",
  });
  document.body.appendChild(ghost);

  // Trajectoire en arc : monte d'abord, puis plonge vers le panier en rétrécissant
  const lift = Math.min(160, Math.abs(dy) * 0.35 + 60);
  const animation = ghost.animate(
    [
      { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
      { transform: "translate(0, -10px) scale(1)", opacity: 1, offset: 0.12 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.35 - lift}px) scale(0.85)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.4 },
    ],
    { duration: 850, easing: "cubic-bezier(0.45, 0, 0.25, 1)" }
  );
  animation.onfinish = () => {
    ghost.remove();
    onArrive();
  };
}

/** Ajout rapide à la sélection depuis une carte produit : bouton rond (au survol sur ordinateur, toujours visible sur mobile). */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  if (product.stock <= 0) return null;

  const onAdd = () => {
    const item = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      collection: product.collection?.name ?? null,
      image: product.images[0] ?? null,
      price: product.price,
      compareAt: product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : null,
      deposit: product.deposit,
      size: null,
      sizable: Boolean(product.requires_size),
      paidShipping: product.free_shipping === false,
      stock: product.stock,
    };
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    if (button.current) {
      flyToCart(button.current, item.image, () => {
        add(item, 1, { open: false });
        window.dispatchEvent(new Event(CART_BUMP_EVENT));
      });
    } else {
      add(item, 1, { open: false });
    }
  };

  return (
    <button
      ref={button}
      type="button"
      onClick={onAdd}
      aria-label={added ? `${product.name} ajoutée à ma sélection` : `Ajouter ${product.name} à ma sélection`}
      title="Ajouter à ma sélection"
      className="absolute bottom-2.5 right-2.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 text-prune-900 shadow-md shadow-prune-950/15 transition-all duration-300 ease-luxe hover:bg-prune-900 hover:text-or-100 active:scale-90 md:bottom-3 md:right-3 md:h-12 md:w-12 md:translate-y-2 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
    >
      {added ? <Check className="h-[18px] w-[18px]" strokeWidth={2} /> : <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />}
      <span className="sr-only" aria-live="polite">
        {added ? "Ajoutée à ma sélection" : ""}
      </span>
    </button>
  );
}
