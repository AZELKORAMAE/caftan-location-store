-- =====================================================================
--  DAR LALLA — Location de caftans · Schéma Supabase
--  À exécuter dans Supabase → SQL Editor (ré-exécutable sans risque),
--  puis exécuter supabase/seed.sql pour le catalogue de démonstration.
--
--  Remplacez l'adresse admin@darlalla.ma (2 occurrences ci-dessous) par
--  l'adresse du compte administrateur (la même que ADMIN_EMAIL).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  PROFILS (1 ligne par compte, créée automatiquement à l'inscription)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Vérifie le rôle sans déclencher la récursion des politiques RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- L'adresse de la boutique devient automatiquement administratrice
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    case when lower(new.email) = 'admin@darlalla.ma' then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrapage pour les comptes existants
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;
update public.profiles set role = 'admin' where lower(email) = 'admin@darlalla.ma';

-- ---------------------------------------------------------------------
--  CATALOGUE
-- ---------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_featured boolean not null default true,
  sort_order int not null default 0,
  requires_size boolean not null default true,  -- choix de la taille (XS à XXL) proposé
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  details text,
  price numeric(12, 2) not null check (price >= 0),          -- prix de location (1 événement)
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  deposit numeric(12, 2) not null default 0 check (deposit >= 0), -- caution rendue au retour
  category text not null default 'caftan',
  material text,
  collection_id uuid references public.collections (id) on delete set null,
  images text[] not null default '{}',
  stock int not null default 1,  -- nombre d'exemplaires de la tenue
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  free_shipping boolean not null default true,
  featured_rank int,  -- ordre dans « Les plus demandées » (accueil)
  new_rank int,       -- ordre dans « Nouveautés » (accueil)
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_collection_idx on public.products (collection_id);
create index if not exists products_created_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------
--  RÉSERVATIONS (table « orders »)
-- ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  email text,
  phone text not null,
  address text not null,
  city text,
  postal_code text,
  country text not null default 'Maroc',
  notes text,
  event_date date not null,          -- date de l'événement
  event_type text,                   -- mariage, fiançailles, henné…
  subtotal numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  deposit_total numeric(12, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'postponed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'cod',
  delivery_date date,                -- livraison / retrait, fixée par l'admin
  delivery_reminder_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_event_date_idx on public.orders (event_date);
create index if not exists orders_delivery_date_idx on public.orders (delivery_date);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(12, 2) not null,
  deposit numeric(12, 2) not null default 0,
  quantity int not null check (quantity > 0),
  line_total numeric(12, 2) not null,
  size text
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------
--  NOTIFICATIONS ADMIN & NEWSLETTER
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'new_order',
  title text not null,
  message text,
  order_id uuid references public.orders (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_created_idx on public.notifications (created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  DISPONIBILITÉ D'UNE TENUE
--  Une tenue réservée est bloquée de 2 jours avant à 2 jours après
--  l'événement (livraison, retour, pressing). Valeur à garder égale à
--  BUFFER_DAYS dans lib/constants.ts.
-- ---------------------------------------------------------------------
create or replace function public.reserved_quantity(p_product_id uuid, p_event_date date, p_exclude_order uuid default null)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(i.quantity), 0)::int
  from public.order_items i
  join public.orders o on o.id = i.order_id
  where i.product_id = p_product_id
    and o.status <> 'cancelled'
    and o.event_date between p_event_date - 4 and p_event_date + 4
    and (p_exclude_order is null or o.id <> p_exclude_order);
$$;

-- Exemplaires encore libres pour une date (utilisé par la fiche produit)
create or replace function public.check_availability(p_product_id uuid, p_event_date date)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select greatest(p.stock - public.reserved_quantity(p.id, p_event_date), 0)
  from public.products p
  where p.id = p_product_id and p.is_active;
$$;

-- ---------------------------------------------------------------------
--  RÉSERVATION (prix, caution et disponibilité recalculés côté serveur)
-- ---------------------------------------------------------------------
create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_free int;
  v_subtotal numeric(12, 2) := 0;
  v_deposit numeric(12, 2) := 0;
  v_count int := 0;
  v_size text;
  v_requires_size boolean;
  v_paid_shipping boolean := false;
  v_event_date date;
  v_name text := left(trim(coalesce(p_customer ->> 'full_name', '')), 120);
  v_email text := nullif(lower(left(trim(coalesce(p_customer ->> 'email', '')), 160)), '');
  v_phone text := left(trim(coalesce(p_customer ->> 'phone', '')), 40);
  v_address text := left(trim(coalesce(p_customer ->> 'address', '')), 300);
  v_city text := left(trim(coalesce(p_customer ->> 'city', '')), 80);
  v_event_type text := nullif(left(trim(coalesce(p_customer ->> 'event_type', '')), 40), '');
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Votre sélection est vide.';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'Votre sélection contient trop de tenues.';
  end if;
  if v_name = '' or v_phone = '' or v_address = '' then
    raise exception 'Merci de compléter vos informations.';
  end if;
  -- L'e-mail est facultatif : vérifié seulement s'il est fourni
  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Adresse e-mail invalide.';
  end if;

  begin
    v_event_date := (p_customer ->> 'event_date')::date;
  exception when others then
    v_event_date := null;
  end;
  if v_event_date is null then
    raise exception 'Indiquez la date de votre événement.';
  end if;
  if v_event_date < current_date + 1 then
    raise exception 'La date de l''événement doit être au moins demain.';
  end if;
  if v_event_date > current_date + 365 then
    raise exception 'Les réservations sont ouvertes jusqu''à un an à l''avance.';
  end if;

  -- Une seule réservation à la fois sur le catalogue : évite qu'une tenue soit louée deux fois
  perform pg_advisory_xact_lock(hashtext('place_order'));

  v_number := 'DL-' || nextval('public.order_number_seq');

  insert into public.orders (
    order_number, user_id, customer_name, email, phone, address, city, postal_code, country, notes,
    event_date, event_type
  )
  values (
    v_number, auth.uid(), v_name, v_email, v_phone, v_address, nullif(v_city, ''),
    nullif(left(trim(coalesce(p_customer ->> 'postal_code', '')), 20), ''),
    coalesce(nullif(left(trim(coalesce(p_customer ->> 'country', '')), 60), ''), 'Maroc'),
    nullif(left(trim(coalesce(p_customer ->> 'notes', '')), 1000), ''),
    v_event_date, v_event_type
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(coalesce((v_item ->> 'quantity')::int, 1), 5));

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid and is_active;

    if not found then
      raise exception 'Une tenue de votre sélection n''est plus disponible.';
    end if;

    v_free := v_product.stock - public.reserved_quantity(v_product.id, v_event_date, v_order_id);
    if v_free < v_qty then
      if v_free <= 0 then
        raise exception '« % » est déjà réservée à cette date. Choisissez une autre date ou une autre tenue.', v_product.name;
      end if;
      raise exception 'Il ne reste que % exemplaire(s) de « % » à cette date.', v_free, v_product.name;
    end if;

    -- Taille facultative (XS à XXL), proposée pour les collections qui ont l'option
    v_requires_size := false;
    select coalesce(c.requires_size, false) into v_requires_size from public.collections c where c.id = v_product.collection_id;
    v_size := nullif(upper(trim(coalesce(v_item ->> 'size', ''))), '');
    if not coalesce(v_requires_size, false) or (v_size is not null and v_size !~ '^(XS|S|M|L|XL|XXL)$') then
      v_size := null;
    end if;

    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, deposit, quantity, line_total, size)
    values (v_order_id, v_product.id, v_product.name, v_product.images[1], v_product.price, v_product.deposit, v_qty, v_product.price * v_qty, v_size);

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_deposit := v_deposit + v_product.deposit * v_qty;
    if not coalesce(v_product.free_shipping, true) then
      v_paid_shipping := true;
    end if;
    v_count := v_count + v_qty;
  end loop;

  -- Frais de livraison : 50 DH si au moins une tenue n'a pas la livraison gratuite (cf. lib/pricing.ts)
  update public.orders
  set subtotal = v_subtotal,
      deposit_total = v_deposit,
      shipping = case when v_paid_shipping then 50 else 0 end,
      total = v_subtotal + case when v_paid_shipping then 50 else 0 end
  where id = v_order_id;

  insert into public.notifications (type, title, message, order_id)
  values (
    'new_order',
    'Nouvelle réservation ' || v_number,
    v_name || ' · ' || v_count || ' tenue(s) · événement le ' || to_char(v_event_date, 'DD/MM/YYYY'),
    v_order_id
  );

  return json_build_object('id', v_order_id, 'order_number', v_number);
end;
$$;

-- Récapitulatif pour la page de confirmation et l'e-mail (l'identifiant UUID fait office de clé secrète)
create or replace function public.get_order_summary(p_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'customer_name', o.customer_name,
    'email', o.email,
    'address', o.address,
    'city', o.city,
    'event_date', o.event_date,
    'event_type', o.event_type,
    'subtotal', o.subtotal,
    'shipping', o.shipping,
    'total', o.total,
    'deposit_total', o.deposit_total,
    'status', o.status,
    'created_at', o.created_at,
    'items', coalesce((
      select json_agg(json_build_object(
        'product_name', i.product_name, 'product_image', i.product_image,
        'unit_price', i.unit_price, 'deposit', i.deposit, 'quantity', i.quantity,
        'line_total', i.line_total, 'size', i.size))
      from public.order_items i where i.order_id = o.id
    ), '[]'::json)
  )
  from public.orders o
  where o.id = p_id;
$$;

grant execute on function public.check_availability(uuid, date) to anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_order_summary(uuid) to anon, authenticated;
revoke execute on function public.reserved_quantity(uuid, date, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
--  SÉCURITÉ (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profils : chacun lit le sien, l'admin lit tout. Seuls nom et téléphone sont modifiables.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Collections : lecture publique, écriture admin
drop policy if exists "collections_read" on public.collections;
create policy "collections_read" on public.collections for select using (true);
drop policy if exists "collections_admin" on public.collections;
create policy "collections_admin" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Produits : lecture publique des produits actifs, écriture admin
drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products_admin" on public.products;
create policy "products_admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Commandes : création via place_order() uniquement ; le client voit les siennes, l'admin gère tout
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete to authenticated using (public.is_admin());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- Notifications : admin uniquement
drop policy if exists "notifications_admin" on public.notifications;
create policy "notifications_admin" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Newsletter : tout le monde peut s'inscrire, seul l'admin consulte
drop policy if exists "newsletter_insert" on public.newsletter_subscribers;
create policy "newsletter_insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
drop policy if exists "newsletter_admin" on public.newsletter_subscribers;
create policy "newsletter_admin" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
--  TEMPS RÉEL : notifications instantanées dans l'espace admin
-- ---------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
--  STOCKAGE DES IMAGES (bucket public « images »)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'images');
drop policy if exists "images_admin_insert" on storage.objects;
create policy "images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "images_admin_update" on storage.objects;
create policy "images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "images_admin_delete" on storage.objects;
create policy "images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());
