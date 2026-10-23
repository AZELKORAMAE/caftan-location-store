"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const save = () => {
    if (value === "cancelled" && status !== "cancelled" && !confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setConfirmCancel(false);
    start(async () => {
      const res = await updateOrderStatus(id, value);
      setMessage({ ok: res.ok, text: res.message });
    });
  };

  return (
    <div className="space-y-3">
      <label htmlFor="status" className="field-label">
        Statut de la réservation
      </label>
      <select
        id="status"
        value={value}
        onChange={(e) => {
          setValue(e.target.value as OrderStatus);
          setMessage(null);
          setConfirmCancel(false);
        }}
        className="field cursor-pointer rounded-md"
      >
        {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUSES[s].label}
          </option>
        ))}
      </select>
      {confirmCancel && (
        <p role="alert" className="rounded-md bg-prune-50 px-3 py-2 text-[13px] text-prune-700">
          L&apos;annulation remettra les articles en stock. Cliquez à nouveau pour confirmer.
        </p>
      )}
      <button type="button" onClick={save} disabled={pending || value === status} className="btn-primary w-full rounded-md">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : confirmCancel ? "Confirmer l'annulation" : "Mettre à jour"}
      </button>
      {message && (
        <p role="status" className={`flex items-center gap-2 text-[13px] ${message.ok ? "text-emerald-700" : "text-prune-600"}`}>
          {message.ok && <Check className="h-4 w-4" />} {message.text}
        </p>
      )}
    </div>
  );
}
