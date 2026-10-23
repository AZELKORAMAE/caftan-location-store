"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, ShoppingCart, Truck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { markNotificationsRead } from "@/app/admin/actions";
import { timeAgo } from "@/lib/format";
import { useEscape } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import type { AdminNotification } from "@/lib/types";

/** Carillon discret joué à l'arrivée d'une réservation (Web Audio, sans fichier). */
function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1);
    });
  } catch {}
}

export function NotificationBell({ initial, unread: initialUnread }: { initial: AdminNotification[]; unread: number }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<AdminNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setItems(initial), [initial]);
  useEffect(() => setUnread(initialUnread), [initialUnread]);
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useEscape(close, open);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Temps réel : chaque nouvelle réservation crée une notification
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const n = payload.new as AdminNotification;
        setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)].slice(0, 20));
        setUnread((u) => u + 1);
        setToasts((t) => [...t, n]);
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), 6000);
        chime();
        if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
          new Notification(n.title, { body: n.message ?? "", icon: "/icon.png" });
        }
        router.refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    await markNotificationsRead();
  };

  const askPermission = async () => {
    if (!("Notification" in window)) return;
    setPermission(await Notification.requestPermission());
  };

  return (
    <>
      <div ref={panel} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Notifications${unread ? `, ${unread} non lue${unread > 1 ? "s" : ""}` : ""}`}
          aria-expanded={open}
          className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-prune-900 transition-colors hover:bg-champagne"
        >
          {unread > 0 ? <BellRing className="h-5 w-5" strokeWidth={1.5} /> : <Bell className="h-5 w-5" strokeWidth={1.5} />}
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-prune-700 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,380px)] origin-top-right overflow-hidden rounded-lg border border-sable bg-white shadow-xl shadow-prune-950/10"
            >
              <div className="flex items-center justify-between border-b border-sable px-4 py-3">
                <p className="font-serif text-lg text-prune-900">Notifications</p>
                {unread > 0 && (
                  <button type="button" onClick={markAll} className="min-h-[36px] cursor-pointer text-[12px] text-or-700 hover:underline">
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              {permission === "default" && (
                <button type="button" onClick={askPermission} className="w-full cursor-pointer bg-or-50 px-4 py-2.5 text-left text-[12px] text-or-800 hover:bg-or-100">
                  Activer les alertes du navigateur pour être prévenu(e) même onglet fermé →
                </button>
              )}
              <ul className="max-h-[60vh] divide-y divide-sable overflow-y-auto">
                {items.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-taupe">Aucune notification pour le moment.</li>}
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.order_id ? `/admin/commandes/${n.order_id}` : "/admin/notifications"}
                      onClick={() => setOpen(false)}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-ivoire ${n.is_read ? "" : "bg-or-50/60"}`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-prune-900 text-or-300">
                        {n.type === "delivery_soon" ? <Truck className="h-4 w-4" strokeWidth={1.5} /> : <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-encre">
                          {n.title}
                          {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-prune-600" aria-label="non lue" />}
                        </span>
                        <span className="block truncate text-[12px] text-taupe">{n.message}</span>
                        <span className="text-[11px] text-taupe/80">{timeAgo(n.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/admin/notifications" onClick={() => setOpen(false)} className="block border-t border-sable px-4 py-3 text-center text-[12px] font-medium uppercase tracking-[0.15em] text-prune-900 hover:bg-ivoire">
                Voir tout
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toasts de nouvelles réservations */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,360px)] flex-col gap-3" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 border-or-500 bg-prune-900 p-4 text-ivoire shadow-2xl"
            >
              <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-or-300" strokeWidth={1.5} />
              <Link href={t.order_id ? `/admin/commandes/${t.order_id}` : "/admin/notifications"} className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{t.title}</p>
                <p className="truncate text-[12px] text-or-100/80">{t.message}</p>
              </Link>
              <button
                type="button"
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                aria-label="Fermer"
                className="-m-2 flex h-9 w-9 cursor-pointer items-center justify-center text-or-200 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
