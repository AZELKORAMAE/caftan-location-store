"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Session expirée, reconnectez-vous." };

  const full_name = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  const { error } = await supabase.from("profiles").update({ full_name, phone }).eq("id", user.id);
  if (error) return { ok: false, message: "Impossible d'enregistrer vos informations." };
  revalidatePath("/compte");
  return { ok: true, message: "Informations enregistrées." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
