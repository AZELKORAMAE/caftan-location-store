"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarDays, ExternalLink, House, Layers, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAdmin } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Réservations", icon: ShoppingCart, badge: "pending" as const },
  { href: "/admin/calendrier", label: "Calendrier", icon: CalendarDays, badge: "deliveries" as const },
  { href: "/admin/accueil", label: "Page d'accueil", icon: House },
  { href: "/admin/produits", label: "Tenues", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/clients", label: "Clientes", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "unread" as const },
];

type Counts = { pending: number; unread: number; deliveries: number };

function NavList({ counts, onNavigate }: { counts: Counts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {LINKS.map(({ href, label, icon: Icon, badge }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const n = badge ? counts[badge] : 0;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[13px] transition-colors",
                active ? "bg-or-500/15 text-or-200" : "text-or-100/70 hover:bg-white/5 hover:text-or-100"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-or-400" aria-hidden />}
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="flex-1">{label}</span>
              {n > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-or-500 px-1.5 text-[10px] font-semibold text-prune-950">
                  {n}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ counts, email, onNavigate }: { counts: Counts; email: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <Image src="/logo-gold.png" alt="" width={44} height={45} className="h-11 w-auto" />
        <div className="leading-tight">
          <p className="font-serif text-xl text-ivoire">Dar Lalla</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-or-400">Administration</p>
        </div>
      </div>
      <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 py-2">
        <NavList counts={counts} onNavigate={onNavigate} />
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link href="/" target="_blank" className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[13px] text-or-100/70 hover:bg-white/5 hover:text-or-100">
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.5} /> Voir la boutique
        </Link>
        <form action={signOutAdmin}>
          <button type="submit" className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-md px-3 text-[13px] text-or-100/70 hover:bg-white/5 hover:text-or-100">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} /> Se déconnecter
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-[11px] text-or-100/40">{email}</p>
      </div>
    </div>
  );
}

export function Sidebar({ counts, email }: { counts: Counts; email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-prune-900 lg:block">
        <SidebarBody counts={counts} email={email} />
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu d'administration"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-prune-900 hover:bg-champagne lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-prune-950/60" />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-72 bg-prune-900"
            >
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-3 top-6 flex h-11 w-11 cursor-pointer items-center justify-center text-or-200">
                <X className="h-5 w-5" />
              </button>
              <SidebarBody counts={counts} email={email} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
