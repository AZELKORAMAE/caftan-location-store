"use client";

import { Reorder, useDragControls } from "framer-motion";
import { Check, GripVertical, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { saveHomeOrder } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

export type HomeRow = { id: string; name: string; price: number; images: string[]; collection: { name: string } | null };

const VISIBLE = 12;

/** Liste réordonnable au glisser-déposer (souris ou doigt), enregistrée au relâchement. */
export function HomeOrderList({ section, rows }: { section: "featured" | "new"; rows: HomeRow[] }) {
  const [items, setItems] = useState(rows);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const lastSaved = useRef(rows.map((r) => r.id).join(","));

  const save = (list: HomeRow[]) => {
    const key = list.map((r) => r.id).join(",");
    if (key === lastSaved.current) return;
    start(async () => {
      const res = await saveHomeOrder(section, list.map((r) => r.id));
      if (res.ok) {
        lastSaved.current = key;
        setStatus("saved");
        window.setTimeout(() => setStatus("idle"), 2000);
      } else setStatus("error");
    });
  };

  /** Alternative clavier : flèches haut/bas sur la poignée. */
  const moveWithKeyboard = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    save(next);
    window.setTimeout(() => document.getElementById(`handle-${section}-${next[j].id}`)?.focus(), 0);
  };

  return (
    <div>
      <div className="mb-2 flex h-5 items-center justify-end text-[12px]" aria-live="polite">
        {pending && (
          <span className="inline-flex items-center gap-1.5 text-taupe">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
          </span>
        )}
        {!pending && status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <Check className="h-3.5 w-3.5" /> Ordre enregistré
          </span>
        )}
        {!pending && status === "error" && <span className="text-prune-600">Échec de l&apos;enregistrement, réessayez.</span>}
      </div>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-1.5">
        {items.map((p, i) => (
          <Row
            key={p.id}
            row={p}
            index={i}
            section={section}
            hidden={i >= VISIBLE}
            onDrop={() => save(items)}
            onKey={(dir) => moveWithKeyboard(i, dir)}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function Row({
  row,
  index,
  section,
  hidden,
  onDrop,
  onKey,
}: {
  row: HomeRow;
  index: number;
  section: string;
  hidden: boolean;
  onDrop: () => void;
  onKey: (dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={row}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px -12px rgba(44,0,1,0.35)", zIndex: 10 }}
      className={`relative flex select-none items-center gap-3 rounded-md border bg-white px-2 py-2 ${
        index === VISIBLE - 1 ? "border-b-2 border-b-or-400" : "border-sable"
      }`}
    >
      <button
        type="button"
        id={`handle-${section}-${row.id}`}
        onPointerDown={(e) => controls.start(e)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onKey(-1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onKey(1);
          }
        }}
        aria-label={`Déplacer ${row.name} (position ${index + 1}). Glissez, ou utilisez les flèches du clavier.`}
        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded text-taupe hover:bg-champagne hover:text-prune-900 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <span className={`w-6 text-center font-serif text-lg tabular-nums ${hidden ? "text-taupe/50" : "text-or-700"}`}>{index + 1}</span>
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-[#F6F1EB]">
        {row.images?.[0] && <Image src={row.images[0]} alt="" fill sizes="44px" className="pointer-events-none object-cover" draggable={false} />}
      </span>
      <span className="min-w-0 flex-1">
        <Link href={`/admin/produits/${row.id}`} className="block truncate text-[13px] text-encre hover:underline" draggable={false}>
          {row.name}
        </Link>
        <span className="text-[12px] text-taupe">
          {row.collection?.name ?? "Sans collection"} · {formatPrice(row.price)}
          {hidden && " · non affiché"}
        </span>
      </span>
    </Reorder.Item>
  );
}
