// Génère supabase/seed.sql à partir de data/catalog.json
// Usage : npm run seed:generate
import { readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../data/catalog.json", import.meta.url), "utf8"));

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;

let sql = `-- =====================================================================
--  DAR LALLA — Catalogue de démonstration (collections + tenues fictives)
--  À exécuter APRÈS schema.sql. Fichier généré par scripts/generate-seed.mjs
-- =====================================================================

`;

sql += "insert into public.collections (name, slug, description, image_url, is_featured, sort_order, requires_size) values\n";
sql += catalog.collections
  .map((c) => `  (${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${q(c.image_url)}, ${c.is_featured}, ${c.sort_order}, ${c.requires_size})`)
  .join(",\n");
sql += "\non conflict (slug) do nothing;\n\n";

// Dates échelonnées pour que le tri « Nouveautés » soit cohérent
const total = catalog.products.length;
sql +=
  "insert into public.products (name, slug, description, details, price, compare_at_price, deposit, category, material, collection_id, images, stock, is_featured, is_new, free_shipping, created_at) values\n";
sql += catalog.products
  .map((p, i) => {
    const days = p.is_new ? i % 7 : 20 + (total - i);
    return `  (${q(p.name)}, ${q(p.slug)}, ${q(p.description)}, ${q(p.details)}, ${p.price}, ${p.compare_at_price ?? "null"}, ${p.deposit}, ${q(p.category)}, ${q(p.material)}, (select id from public.collections where slug = ${q(p.collection)}), ${arr(p.images)}, ${p.stock}, ${p.is_featured}, ${p.is_new}, ${p.free_shipping}, now() - interval '${days} days')`;
  })
  .join(",\n");
sql += "\non conflict (slug) do nothing;\n";

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql généré : ${catalog.collections.length} collections, ${total} tenues.`);
