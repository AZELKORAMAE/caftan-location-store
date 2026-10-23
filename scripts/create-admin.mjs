// Crée (ou met à jour) le compte administrateur dans Supabase.
// Usage : npm run create-admin   (lit .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error(
    "Variables manquantes dans .env.local : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function findUserByEmail(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found || data.users.length < 200) return found ?? null;
  }
  return null;
}

let user = await findUserByEmail(email);

if (user) {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
  console.log(`Compte existant mis à jour : ${email}`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Dar Lalla" },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Compte créé : ${email}`);
}

const { error: profileError } = await supabase
  .from("profiles")
  .upsert({ id: user.id, email, full_name: "Dar Lalla", role: "admin" }, { onConflict: "id" });

if (profileError) {
  console.error("Impossible d'attribuer le rôle admin. Avez-vous exécuté supabase/schema.sql ?", profileError.message);
  process.exit(1);
}

console.log("Rôle administrateur attribué. Connectez-vous sur /admin/login");
