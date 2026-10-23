"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { updateProfile } from "@/app/(store)/compte/actions";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="full_name" className="field-label">
          Nom complet
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} autoComplete="name" className="field" />
      </div>
      <div>
        <label htmlFor="phone" className="field-label">
          Téléphone
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" className="field" />
      </div>
      <div>
        <label htmlFor="email-ro" className="field-label">
          E-mail
        </label>
        <input id="email-ro" value={email} readOnly className="field cursor-default bg-ivoire text-taupe" />
      </div>
      <button type="submit" disabled={pending} className="btn-outline w-full">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Enregistrer"}
      </button>
      {state && (
        <p role="status" className={`text-[13px] ${state.ok ? "text-emerald-700" : "text-prune-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
