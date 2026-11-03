-- ═══════════════════════════════════════════════════════════════════
-- THE VIAL VAULT — complete Supabase backend (run ONCE in a NEW project)
-- Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / ON CONFLICT throughout.
--
-- This is The Vial Vault's own backend. It never touches TruPep's project.
-- Contents:
--   1. Helpers (updated_at trigger, admins table, is_admin())
--   2. products (+ Spanish columns, per-size photos) + storage buckets
--   3. site_settings (payment handles + contact info, edited in Admin › Settings)
--   4. customers + orders (+ discount_amount, shipping_method)
--   5. Promo engine: check_promo_used, discount_codes, get_promo, redeem_promo
--   6. reviews (moderated) + review-photos bucket
--   7. site_events (anonymous first-party analytics)
--   8. Seed: 26 products at the confirmed prices, settings placeholders
--   9. Make thevialvault843@gmail.com an admin (after her login exists)
--
-- RLS RULE (learned the hard way on TruPep): every admin check calls the
-- SECURITY DEFINER helper public.is_admin(). No policy on `admins` ever
-- queries `admins` itself (that is Postgres error 42P17, infinite recursion,
-- and it makes admin queues silently render empty).
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 1. HELPERS ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Which Supabase Auth users are store admins. The same login can also be a
-- customer account; this row is what unlocks /admin.
-- *_seen_at power the dashboard notification badges (cleared when a tab is opened).
create table if not exists public.admins (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  orders_seen_at    timestamptz not null default now(),
  customers_seen_at timestamptz not null default now(),
  reviews_seen_at   timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
-- An admin may read/update only their own row (badge timestamps). No self-query.
drop policy if exists "Admins read own row" on public.admins;
create policy "Admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Admins update own row" on public.admins;
create policy "Admins update own row" on public.admins
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── 2. PRODUCTS ─────────────────────────────────────────────────────
-- variants: [{ "label": "10mg", "price": 75, "image": "/products/vial-bpc157-10mg.webp" }]
-- price null = not priced yet (shown as "Price coming soon", cannot be added to cart).
create table if not exists public.products (
  id                  text primary key,
  name                text not null,
  name_es             text,
  category            text not null,
  description         text,
  description_es      text,
  variants            jsonb not null default '[]'::jsonb,
  image_url           text,
  stock_quantity      integer not null default 0,
  low_stock_threshold integer not null default 5,
  batch_number        text,
  coa_url             text,
  coa_uploaded_at     timestamptz,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;
drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products" on public.products
  for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: product photos + COA PDFs (public read, admin-only write)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('coa-documents', 'coa-documents', true)
  on conflict (id) do nothing;

drop policy if exists "Public reads product images" on storage.objects;
create policy "Public reads product images" on storage.objects
  for select to anon, authenticated using (bucket_id in ('product-images', 'coa-documents'));
drop policy if exists "Admins upload product files" on storage.objects;
create policy "Admins upload product files" on storage.objects
  for insert to authenticated with check (bucket_id in ('product-images', 'coa-documents') and public.is_admin());
drop policy if exists "Admins update product files" on storage.objects;
create policy "Admins update product files" on storage.objects
  for update to authenticated using (bucket_id in ('product-images', 'coa-documents') and public.is_admin());
drop policy if exists "Admins delete product files" on storage.objects;
create policy "Admins delete product files" on storage.objects
  for delete to authenticated using (bucket_id in ('product-images', 'coa-documents') and public.is_admin());

-- ── 3. SITE SETTINGS (one row; edited in Admin › Settings) ──────────
-- Payment handles are shown to every shopper at checkout, so they are public
-- to read. Any value that starts with "PLACEHOLDER" is hidden on the storefront.
create table if not exists public.site_settings (
  id            integer primary key default 1 check (id = 1),
  zelle_name    text,
  zelle_handle  text,
  venmo_handle  text,
  paypal_handle text,
  cashapp_handle text,
  contact_email text,
  contact_phone text,
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
drop policy if exists "Public reads settings" on public.site_settings;
create policy "Public reads settings" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins update settings" on public.site_settings;
create policy "Admins update settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── 4. CUSTOMERS + ORDERS ───────────────────────────────────────────
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email        text,
  name         text,
  phone        text,
  created_at   timestamptz not null default now()
);
alter table public.customers enable row level security;
drop policy if exists "Admins manage all customers" on public.customers;
create policy "Admins manage all customers" on public.customers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Customers manage their own record" on public.customers;
create policy "Customers manage their own record" on public.customers
  for all to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid references public.customers(id) on delete set null,  -- null = guest
  guest              boolean not null default true,
  customer_name      text,
  customer_email     text,
  customer_phone     text,
  street text, city text, state text, zip text,
  contact_pref       text,
  items              jsonb not null default '[]'::jsonb,  -- [{product_id, name, variant_label, price, qty}]
  subtotal           numeric(10,2),
  discount_pct       numeric(5,2) default 0,
  discount_amount    numeric(10,2),                       -- exact dollars a promo took off
  shipping_method    text,                                -- standard | overnight
  shipping_cost      numeric(10,2) default 0,
  total              numeric(10,2),
  promo_code         text,
  payment_method     text,
  payment_status     text not null default 'pending',     -- pending | paid | refunded
  fulfillment_status text not null default 'new',         -- new | processing | shipped | completed | cancelled
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_email_promo_idx on public.orders (lower(customer_email), upper(promo_code));

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Guests can place guest orders" on public.orders;
create policy "Guests can place guest orders" on public.orders
  for insert to anon with check (customer_id is null and payment_status = 'pending' and fulfillment_status = 'new');
drop policy if exists "Customers can place their own orders" on public.orders;
create policy "Customers can place their own orders" on public.orders
  for insert to authenticated with check (
    payment_status = 'pending' and fulfillment_status = 'new' and (
      customer_id is null
      or customer_id in (select id from public.customers where auth_user_id = auth.uid())
    )
  );
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders" on public.orders
  for select to authenticated
  using (customer_id in (select id from public.customers where auth_user_id = auth.uid()));

-- ── 5. PROMO ENGINE ─────────────────────────────────────────────────
-- Layer 1 (built-in % codes, incl. WELCOME10) live in main.jsx → PROMO_CODES.
-- Abuse guard: one use of a built-in code per email address.
create or replace function public.check_promo_used(p_email text, p_code text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.orders
     where lower(trim(customer_email)) = lower(trim(p_email))
       and upper(trim(promo_code)) = upper(trim(p_code))
  );
$$;
grant execute on function public.check_promo_used(text, text) to anon, authenticated;

-- Layer 2: database codes. RLS on, NO policies → unreadable through the API.
-- Only get_promo / redeem_promo can touch it. New reward codes = insert a row,
-- no site deploy needed. Single-use codes delete themselves when redeemed.
create table if not exists public.discount_codes (
  code       text primary key check (code = upper(code)),
  kind       text not null check (kind in ('flat', 'pct')),
  amount     numeric(10,2) not null check (amount > 0),
  note       text,
  active     boolean not null default true,
  single_use boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.discount_codes enable row level security;
-- Intentionally no policies. Never add one "just for debugging".

create or replace function public.get_promo(p_code text)
returns table (valid boolean, kind text, amount numeric, reason text)
language plpgsql stable security definer set search_path = public as $$
declare r public.discount_codes%rowtype;
begin
  select * into r from public.discount_codes where code = upper(trim(p_code));
  if not found then
    return query select false, null::text, null::numeric, 'not_found'::text; return;
  end if;
  if not r.active then
    return query select false, r.kind, r.amount, 'inactive'::text; return;
  end if;
  return query select true, r.kind, r.amount, null::text;
end;
$$;

-- Burns a single-use code. Only works for an order that was actually placed
-- with that code, so nobody can delete codes without ordering.
create or replace function public.redeem_promo(p_code text, p_order text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from public.discount_codes d
   where d.code = upper(trim(p_code)) and d.active and d.single_use
     and exists (select 1 from public.orders o
                  where o.id::text = p_order and upper(trim(o.promo_code)) = d.code);
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
grant execute on function public.get_promo(text) to anon, authenticated;
grant execute on function public.redeem_promo(text, text) to anon, authenticated;

-- ── 6. REVIEWS (moderated) ──────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 80),
  rating     int  not null check (rating between 1 and 5),
  body       text not null check (char_length(body) between 1 and 2000),
  photo_url  text check (photo_url is null or char_length(photo_url) <= 500),
  status     text not null default 'pending' check (status in ('pending','approved','denied'))
);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;
drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews
  for select to anon, authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "Anyone can submit a pending review" on public.reviews;
create policy "Anyone can submit a pending review" on public.reviews
  for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews" on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews" on public.reviews
  for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

drop policy if exists "Review photos are public" on storage.objects;
create policy "Review photos are public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'review-photos');
drop policy if exists "Anyone can upload a review photo" on storage.objects;
create policy "Anyone can upload a review photo" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'review-photos');
drop policy if exists "Admins can delete review photos" on storage.objects;
create policy "Admins can delete review photos" on storage.objects
  for delete to authenticated using (bucket_id = 'review-photos' and public.is_admin());

-- ── 7. ANALYTICS (anonymous, first-party) ───────────────────────────
create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event_type  text not null check (char_length(event_type) <= 40),
  item_slug   text check (item_slug is null or char_length(item_slug) <= 60),
  search_term text check (search_term is null or char_length(search_term) <= 40),
  meta        jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 512)
);
create index if not exists site_events_created_idx on public.site_events (created_at desc);
create index if not exists site_events_type_idx    on public.site_events (event_type, created_at desc);

alter table public.site_events enable row level security;
drop policy if exists "Anyone can log an anonymous event" on public.site_events;
create policy "Anyone can log an anonymous event" on public.site_events
  for insert to anon, authenticated with check (true);
drop policy if exists "Admins can read events" on public.site_events;
create policy "Admins can read events" on public.site_events
  for select to authenticated using (public.is_admin());

-- ── 8. SEED ─────────────────────────────────────────────────────────
-- Payment handles are PLACEHOLDERS until Madre's are collected — set them in
-- Admin › Settings. Contact email/phone are the ones already on her current site.
-- No physical location is stored or shown (by request).
insert into public.site_settings (id, zelle_name, zelle_handle, venmo_handle, paypal_handle, cashapp_handle, contact_email, contact_phone)
values (1,
  'PLACEHOLDER — set in Admin › Settings',
  'PLACEHOLDER — set in Admin › Settings',
  'PLACEHOLDER — set in Admin › Settings',
  'PLACEHOLDER — set in Admin › Settings',
  null,
  'thevialvault843@gmail.com',
  '843-421-0420')
on conflict (id) do nothing;

-- Catalog: 25 products at TruPep's verified live prices + Wolverine (unpriced,
-- set its price in Admin › Products). ON CONFLICT DO NOTHING: never overwrites
-- edits made later in the admin.
insert into public.products (id, name, name_es, category, description, description_es, variants, image_url) values
('retatrutide','Retatrutide','Retatrutide','Weight Management','Triple receptor GLP-1/GIP/glucagon agonist commonly researched for advanced metabolic support and body composition.','Agonista triple de los receptores GLP-1/GIP/glucagón, investigado comúnmente para el apoyo metabólico avanzado y la composición corporal.','[{"label": "10mg", "price": 100, "image": "/products/vial-retatrutide-10mg.webp"}, {"label": "20mg", "price": 140, "image": "/products/vial-retatrutide-20mg.webp"}, {"label": "30mg", "price": 170, "image": "/products/vial-retatrutide-30mg.webp"}]'::jsonb,'/products/vial-retatrutide-10mg.webp'),
('tirzepatide','Tirzepatide','Tirzepatida','Weight Management','Dual GIP/GLP-1 receptor agonist commonly researched for metabolic health and body composition improvement.','Agonista dual de los receptores GIP/GLP-1, investigado comúnmente para la salud metabólica y la mejora de la composición corporal.','[{"label": "20mg", "price": 100, "image": "/products/vial-tirzepatide-20mg.webp"}, {"label": "30mg", "price": 120, "image": "/products/vial-tirzepatide-30mg.webp"}]'::jsonb,'/products/vial-tirzepatide-20mg.webp'),
('5amino','5-Amino-1MQ','5-Amino-1MQ','Weight Management','NNMT inhibitor commonly researched for fat cell metabolism activation and body recomposition support.','Inhibidor de NNMT investigado comúnmente para activar el metabolismo de las células grasas y apoyar la recomposición corporal.','[{"label": "50mg", "price": 105, "image": "/products/vial-5amino-50mg.webp"}]'::jsonb,'/products/vial-5amino-50mg.webp'),
('bpc157','BPC-157','BPC-157','Recovery','Body protection compound commonly researched for tissue repair, gut lining integrity, and accelerated healing.','Compuesto de protección corporal investigado comúnmente para la reparación de tejidos, la integridad de la mucosa intestinal y la cicatrización acelerada.','[{"label": "10mg", "price": 75, "image": "/products/vial-bpc157-10mg.webp"}, {"label": "20mg", "price": 95, "image": "/products/vial-bpc157-20mg.webp"}]'::jsonb,'/products/vial-bpc157-10mg.webp'),
('cagrilintide','Cagrilintide','Cagrilintida','Weight Management','Long-acting amylin analogue commonly researched for appetite regulation and sustained weight management.','Análogo de amilina de acción prolongada investigado comúnmente para la regulación del apetito y el control sostenido del peso.','[{"label": "5mg", "price": 75, "image": "/products/vial-cagrilintide-5mg.webp"}, {"label": "10mg", "price": 95, "image": "/products/vial-cagrilintide-10mg.webp"}]'::jsonb,'/products/vial-cagrilintide-5mg.webp'),
('cjcipamorelin','CJC No DAC / Ipamorelin','CJC sin DAC / Ipamorelina','Performance','Synergistic GHRH and GHRP combination commonly researched for growth hormone optimization and recovery.','Combinación sinérgica de GHRH y GHRP investigada comúnmente para la optimización de la hormona del crecimiento y la recuperación.','[{"label": "10mg", "price": 95, "image": "/products/vial-cjcipamorelin-10mg.webp"}]'::jsonb,'/products/vial-cjcipamorelin-10mg.webp'),
('epithalon','Epithalon','Epitalón','Anti-Aging','Tetrapeptide commonly researched for telomere elongation, circadian rhythm support, and longevity.','Tetrapéptido investigado comúnmente para la elongación de los telómeros, el apoyo al ritmo circadiano y la longevidad.','[{"label": "10mg", "price": 75, "image": "/products/vial-epithalon-10mg.webp"}]'::jsonb,'/products/vial-epithalon-10mg.webp'),
('hghfrag','HGH Fragment 176-191','Fragmento de HGH 176-191','Weight Management','Modified growth hormone fragment commonly researched for targeted lipolysis and fat metabolism.','Fragmento modificado de la hormona del crecimiento investigado comúnmente para la lipólisis dirigida y el metabolismo de las grasas.','[{"label": "5mg", "price": 75, "image": "/products/vial-hghfrag-5mg.webp"}]'::jsonb,'/products/vial-hghfrag-5mg.webp'),
('ghkcu','GHK-Cu','GHK-Cu','Aesthetics','Copper peptide commonly researched for collagen synthesis, skin regeneration, and wound healing.','Péptido de cobre investigado comúnmente para la síntesis de colágeno, la regeneración de la piel y la cicatrización de heridas.','[{"label": "100mg", "price": 95, "image": "/products/vial-ghkcu-100mg.webp"}]'::jsonb,'/products/vial-ghkcu-100mg.webp'),
('ipamorelin','Ipamorelin','Ipamorelina','Performance','Selective growth hormone releasing peptide commonly researched for GH release with a clean safety profile.','Péptido liberador selectivo de la hormona del crecimiento investigado comúnmente para la liberación de GH con un perfil de seguridad limpio.','[{"label": "10mg", "price": 75, "image": "/products/vial-ipamorelin-10mg.webp"}]'::jsonb,'/products/vial-ipamorelin-10mg.webp'),
('kisspeptin','Kisspeptin','Kisspeptina','Performance','Neuropeptide commonly researched for LH/FSH regulation, hormonal balance, and reproductive health.','Neuropéptido investigado comúnmente para la regulación de LH/FSH, el equilibrio hormonal y la salud reproductiva.','[{"label": "10mg", "price": 85, "image": "/products/vial-kisspeptin-10mg.webp"}]'::jsonb,'/products/vial-kisspeptin-10mg.webp'),
('klowblend','KLOW Blend','Mezcla KLOW','Peptide Blends','Proprietary metabolic blend commonly researched for comprehensive weight management and metabolic optimization.','Mezcla metabólica exclusiva investigada comúnmente para el control integral del peso y la optimización metabólica.','[{"label": "80mg", "price": 160, "image": "/products/vial-klowblend-80mg.webp"}]'::jsonb,'/products/vial-klowblend-80mg.webp'),
('glowblend','GLOW Blend','Mezcla GLOW','Peptide Blends','Proprietary aesthetic blend commonly researched for skin health, hair quality, and overall appearance support.','Mezcla estética exclusiva investigada comúnmente para la salud de la piel, la calidad del cabello y el apoyo a la apariencia general.','[{"label": "70mg", "price": 140, "image": "/products/vial-glowblend-70mg.webp"}]'::jsonb,'/products/vial-glowblend-70mg.webp'),
('kpv','KPV Tripeptide','Tripéptido KPV','Recovery','Alpha-MSH derived tripeptide commonly researched for anti-inflammatory action and gut barrier support.','Tripéptido derivado de alfa-MSH investigado comúnmente por su acción antiinflamatoria y el apoyo a la barrera intestinal.','[{"label": "10mg", "price": 75, "image": "/products/vial-kpv-10mg.webp"}]'::jsonb,'/products/vial-kpv-10mg.webp'),
('lipoc','Lipo C with B12','Lipo C con B12','Weight Management','Lipotropic compound with Vitamin B12 commonly researched for fat mobilization and energy metabolism.','Compuesto lipotrópico con vitamina B12 investigado comúnmente para la movilización de grasas y el metabolismo energético.','[{"label": "10mL", "price": 105, "image": "/products/vial-lipoc-10ml.webp"}]'::jsonb,'/products/vial-lipoc-10ml.webp'),
('motsc','MOTS-C','MOTS-C','Anti-Aging','Mitochondrial peptide commonly researched for metabolic flexibility, insulin sensitivity, and healthy aging.','Péptido mitocondrial investigado comúnmente para la flexibilidad metabólica, la sensibilidad a la insulina y el envejecimiento saludable.','[{"label": "10mg", "price": 100, "image": "/products/vial-motsc-10mg.webp"}]'::jsonb,'/products/vial-motsc-10mg.webp'),
('melanotanI','Melanotan I','Melanotan I','Aesthetics','Alpha-MSH analogue commonly researched for skin pigmentation, UV photoprotection, and tanning.','Análogo de alfa-MSH investigado comúnmente para la pigmentación de la piel, la fotoprotección UV y el bronceado.','[{"label": "10mg", "price": 85, "image": "/products/vial-melanotani-10mg.webp"}]'::jsonb,'/products/vial-melanotani-10mg.webp'),
('melanotanII','Melanotan II','Melanotan II','Aesthetics','MSH analogue commonly researched for pigmentation, libido enhancement, and appetite suppression.','Análogo de MSH investigado comúnmente para la pigmentación, el aumento de la libido y la supresión del apetito.','[{"label": "10mg", "price": 95, "image": "/products/vial-melanotanii-10mg.webp"}]'::jsonb,'/products/vial-melanotanii-10mg.webp'),
('nad','NAD+','NAD+','Anti-Aging','Essential coenzyme commonly researched for cellular energy production, DNA repair, and cognitive support.','Coenzima esencial investigada comúnmente para la producción de energía celular, la reparación del ADN y el apoyo cognitivo.','[{"label": "500mg", "price": 100, "image": "/products/vial-nad-500mg.webp"}, {"label": "1000mg", "price": 130, "image": "/products/vial-nad-1000mg.webp"}]'::jsonb,'/products/vial-nad-500mg.webp'),
('pt141','PT-141','PT-141','Aesthetics','Melanocortin receptor agonist commonly researched for sexual health, libido, and arousal support.','Agonista de los receptores de melanocortina investigado comúnmente para la salud sexual, la libido y el apoyo a la excitación.','[{"label": "10mg", "price": 75, "image": "/products/vial-pt141-10mg.webp"}]'::jsonb,'/products/vial-pt141-10mg.webp'),
('selank','Selank','Selank','Cognitive','Anxiolytic peptide commonly researched for stress reduction, anxiety relief, and memory enhancement.','Péptido ansiolítico investigado comúnmente para la reducción del estrés, el alivio de la ansiedad y la mejora de la memoria.','[{"label": "10mg", "price": 75, "image": "/products/vial-selank-10mg.webp"}]'::jsonb,'/products/vial-selank-10mg.webp'),
('semax','Semax','Semax','Cognitive','ACTH-derived nootropic peptide commonly researched for focus, neuroprotection, and mood stabilization.','Péptido nootrópico derivado de ACTH investigado comúnmente para la concentración, la neuroprotección y la estabilización del estado de ánimo.','[{"label": "10mg", "price": 75, "image": "/products/vial-semax-10mg.webp"}]'::jsonb,'/products/vial-semax-10mg.webp'),
('tesamorelin','Tesamorelin','Tesamorelina','Anti-Aging','GHRH analogue commonly researched for visceral fat reduction, IGF-1 stimulation, and metabolic health.','Análogo de GHRH investigado comúnmente para la reducción de la grasa visceral, la estimulación de IGF-1 y la salud metabólica.','[{"label": "20mg", "price": 120, "image": "/products/vial-tesamorelin-20mg.webp"}]'::jsonb,'/products/vial-tesamorelin-20mg.webp'),
('tb500','TB-500','TB-500','Recovery','Thymosin Beta-4 fragment commonly researched for injury recovery, flexibility, and tissue repair.','Fragmento de timosina beta-4 investigado comúnmente para la recuperación de lesiones, la flexibilidad y la reparación de tejidos.','[{"label": "10mg", "price": 80, "image": "/products/vial-tb500-10mg.webp"}]'::jsonb,'/products/vial-tb500-10mg.webp'),
('bacwater','BAC Water','Agua BAC','Accessories','Bacteriostatic water for safe reconstitution of lyophilized peptide research compounds.','Agua bacteriostática para la reconstitución segura de compuestos peptídicos de investigación liofilizados.','[{"label": "30mL", "price": 30, "image": "/products/vial-bacwater-30ml.webp"}]'::jsonb,'/products/vial-bacwater-30ml.webp'),
('wolverine','Wolverine','Wolverine','Peptide Blends','The Vial Vault''s signature recovery blend: TB-500 (10mg) and BPC-157 (10mg) in one vial, commonly researched for tissue repair, flexibility, and recovery support.','La mezcla de recuperación exclusiva de The Vial Vault: TB-500 (10 mg) y BPC-157 (10 mg) en un solo vial, investigada comúnmente para la reparación de tejidos, la flexibilidad y el apoyo a la recuperación.','[{"label": "20mg", "price": null, "image": "/products/vial-wolverine-20mg.webp"}]'::jsonb,'/products/vial-wolverine-20mg.webp')
on conflict (id) do nothing;

-- ── 9. ADMIN ACCESS ─────────────────────────────────────────────────
-- First create her login: Supabase → Authentication → Users → Add user →
-- thevialvault843@gmail.com + the password Tristan supplies (Auto Confirm ON).
-- Then run this statement (re-running it is harmless):
insert into public.admins (user_id)
select id from auth.users where lower(email) = 'thevialvault843@gmail.com'
on conflict (user_id) do nothing;
