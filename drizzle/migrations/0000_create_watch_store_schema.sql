-- ROLES
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own roles select" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- CATALOG
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
grant insert, update, delete on public.categories to authenticated;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  model text,
  description text,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  gender text not null default 'unisex',
  material text,
  strap text,
  case_size text,
  movement text,
  water_resistance text,
  colors text[] not null default '{}',
  images text[] not null default '{}',
  stock integer not null default 0,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  price_delta numeric(10,2) not null default 0,
  stock integer not null default 0
);
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "variants public read" on public.product_variants for select using (true);
create policy "variants admin write" on public.product_variants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  change integer not null,
  resulting_stock integer not null,
  reason text,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.inventory_logs to authenticated;
grant all on public.inventory_logs to service_role;
alter table public.inventory_logs enable row level security;
create policy "inventory admin" on public.inventory_logs for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon, authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons read active" on public.coupons for select using (true);
create policy "coupons admin write" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address text,
  city text,
  postal_code text,
  country text,
  payment_method text not null default 'mock_card',
  payment_status text not null default 'pending',
  payment_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders own read" on public.orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "orders own insert" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  quantity integer not null default 1,
  variant text
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items own read" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);
create policy "order items own insert" on public.order_items for insert to authenticated with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mock',
  reference text not null,
  amount numeric(10,2) not null,
  status text not null default 'succeeded',
  created_at timestamptz not null default now()
);
grant select, insert on public.payment_transactions to authenticated;
grant all on public.payment_transactions to service_role;
alter table public.payment_transactions enable row level security;
create policy "tx own read" on public.payment_transactions for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);
create policy "tx own insert" on public.payment_transactions for insert to authenticated with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- REVIEWS + WISHLIST
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null,
  title text,
  body text,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews own insert" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "reviews own delete" on public.reviews for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlist to authenticated;
grant all on public.wishlist to service_role;
alter table public.wishlist enable row level security;
create policy "wishlist own" on public.wishlist for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SEED
insert into public.categories (slug, name, description, image_url) values
  ('luxury','Luxury','Hand-finished timepieces for the collector.','/images/watches/aurum-chrono.jpg'),
  ('chronograph','Chronograph','Precision stopwatch complications.','/images/watches/obsidian-diver.jpg'),
  ('diver','Diver','Built for depth and pressure.','/images/watches/sport-titan.jpg'),
  ('dress','Dress','Slim profiles for black tie.','/images/watches/minimal-blanc.jpg'),
  ('smart-hybrid','Smart Hybrid','Mechanical soul, connected mind.','/images/watches/rose-eclipse.jpg');

insert into public.products (slug,name,brand,model,description,price,original_price,category_id,gender,material,strap,case_size,movement,water_resistance,colors,images,stock,rating,review_count,is_featured,is_new,is_best_seller) values
('aurelien-serie-royale','Aurélien Série Royale','Aurélien','SR-1908','A 18k champagne-gold case wrapped around a sunburst black dial. Swiss automatic movement with 72-hour power reserve.',7450,8900,(select id from public.categories where slug='luxury'),'men','18k Gold','Gold bracelet','41mm','Swiss Automatic','50m','{"Gold/Black","Gold/Champagne"}','{"/images/watches/aurum-chrono.jpg","/images/watches/noir-classic.jpg","/images/watches/skeleton-royale.jpg"}',12,4.9,214,true,true,true),
('aurora-chronograph','Aurora Chronograph 100M','Aurora','AC-100','Dual-tone chronograph with tachymeter bezel and luminous champagne indices.',3980,4600,(select id from public.categories where slug='chronograph'),'men','Stainless Steel','Two-tone bracelet','43mm','Automatic Chronograph','100m','{"Gold/Black","Steel/Black"}','{"/images/watches/hero-watch.jpg","/images/watches/obsidian-diver.jpg"}',8,4.8,167,true,true,true),
('noir-classic','Noir Classic Automatic','Aurélien','NC-22','Pure minimalism: matte black dial, applied gold markers, sapphire crystal.',2150,null,(select id from public.categories where slug='dress'),'men','Stainless Steel','Black leather','40mm','Automatic','30m','{"Black/Gold"}','{"/images/watches/noir-classic.jpg","/images/watches/minimal-blanc.jpg"}',24,4.7,98,true,false,true),
('celeste-diamond','Céleste Diamond','Céleste','CD-07','Mother-of-pearl dial set with 42 brilliant-cut diamonds on a rose-gold case.',5320,6650,(select id from public.categories where slug='luxury'),'women','Rose Gold','Rose gold bracelet','34mm','Swiss Quartz','30m','{"Rose Gold/Pearl"}','{"/images/watches/celeste-diamond.jpg","/images/watches/rose-eclipse.jpg"}',6,5.0,142,true,true,false),
('rose-eclipse','Rose Eclipse Slim','Céleste','RE-31','An ultra-slim 6.8mm profile in blush rose gold with a smoked champagne dial.',1890,2450,(select id from public.categories where slug='dress'),'women','Rose Gold','Mesh bracelet','32mm','Quartz','30m','{"Rose Gold","Rose Gold/Ivory"}','{"/images/watches/rose-eclipse.jpg","/images/watches/celeste-diamond.jpg"}',18,4.6,76,false,true,true),
('obsidian-diver','Obsidian Diver 300','Obsidian','OD-300','Professional dive instrument, unidirectional ceramic bezel, 300m rated.',2890,3400,(select id from public.categories where slug='diver'),'men','Titanium','Rubber strap','44mm','Automatic','300m','{"Black","Black/Gold"}','{"/images/watches/obsidian-diver.jpg","/images/watches/sport-titan.jpg"}',15,4.8,203,false,false,true),
('skeleton-royale','Skeleton Royale Openwork','Aurélien','SK-09','Fully skeletonised movement, hand-bevelled bridges, visible from both sides.',9600,null,(select id from public.categories where slug='luxury'),'men','Gold-plated Steel','Alligator leather','42mm','Manual Skeleton','30m','{"Gold/Smoke"}','{"/images/watches/skeleton-royale.jpg","/images/watches/aurum-chrono.jpg"}',4,4.9,54,true,true,false),
('minimal-blanc','Minimal Blanc 36','Blanc','MB-36','Clean ivory dial, brushed gold hands, a study in restraint.',990,1290,(select id from public.categories where slug='dress'),'unisex','Stainless Steel','Ivory leather','36mm','Quartz','30m','{"Ivory/Gold","Ivory/Steel"}','{"/images/watches/minimal-blanc.jpg","/images/watches/noir-classic.jpg"}',40,4.5,61,false,false,true),
('sport-titan','Sport Titan GMT','Obsidian','ST-GMT','Lightweight titanium GMT for the frequent flyer, dual-timezone bezel.',3450,null,(select id from public.categories where slug='chronograph'),'men','Titanium','Titanium bracelet','42mm','Automatic GMT','200m','{"Graphite","Graphite/Gold"}','{"/images/watches/sport-titan.jpg","/images/watches/hero-watch.jpg"}',10,4.7,88,false,true,false),
('celeste-pearl-mini','Céleste Pearl Mini','Céleste','CP-28','A 28mm jewel of a watch; pearl dial and champagne-gold bezel.',1450,1850,(select id from public.categories where slug='dress'),'women','Gold-plated Steel','Gold bracelet','28mm','Quartz','30m','{"Gold/Pearl"}','{"/images/watches/celeste-diamond.jpg","/images/watches/minimal-blanc.jpg"}',22,4.6,44,false,false,false),
('aurora-hybrid-smart','Aurora Hybrid Smart','Aurora','AH-2','Mechanical hands over a hidden OLED ring; tracks activity discreetly.',1190,1490,(select id from public.categories where slug='smart-hybrid'),'unisex','Stainless Steel','Silicone strap','42mm','Hybrid Quartz','50m','{"Black","Champagne"}','{"/images/watches/hero-watch.jpg","/images/watches/sport-titan.jpg"}',30,4.4,120,false,true,true),
('noir-midnight-tourbillon','Noir Midnight Tourbillon','Aurélien','NMT-01','Flying tourbillon at 6 o’clock, black onyx dial, limited to 50 pieces.',18900,null,(select id from public.categories where slug='luxury'),'men','18k Gold','Alligator leather','41mm','Manual Tourbillon','30m','{"Onyx/Gold"}','{"/images/watches/skeleton-royale.jpg","/images/watches/aurum-chrono.jpg"}',2,5.0,19,true,false,false),
('obsidian-field','Obsidian Field Automatic','Obsidian','OF-12','Utility field watch with sandblasted case and luminous numerals.',890,1150,(select id from public.categories where slug='diver'),'men','Stainless Steel','Canvas strap','39mm','Automatic','100m','{"Black","Olive"}','{"/images/watches/obsidian-diver.jpg","/images/watches/noir-classic.jpg"}',0,4.3,57,false,false,false),
('celeste-gala','Céleste Gala Bracelet','Céleste','CG-50','A watch and a bracelet in one; hidden clasp, champagne finish.',2290,2990,(select id from public.categories where slug='luxury'),'women','Gold-plated Steel','Gold cuff','30mm','Quartz','30m','{"Champagne Gold"}','{"/images/watches/rose-eclipse.jpg","/images/watches/celeste-diamond.jpg"}',9,4.7,33,false,true,false),
('blanc-heritage','Blanc Heritage 1954','Blanc','BH-54','A faithful reissue of the 1954 original with domed acrylic-look sapphire.',1650,null,(select id from public.categories where slug='dress'),'unisex','Stainless Steel','Brown leather','38mm','Automatic','50m','{"Cream/Gold"}','{"/images/watches/minimal-blanc.jpg","/images/watches/skeleton-royale.jpg"}',14,4.6,71,false,false,true);

insert into public.coupons (code, discount_type, discount_value, min_order_amount, is_active, ends_at) values
  ('GOLD10','percent',10,500,true, now() + interval '90 days'),
  ('WELCOME150','fixed',150,1200,true, now() + interval '90 days'),
  ('VIP20','percent',20,5000,true, now() + interval '30 days');

insert into public.reviews (product_id, author_name, rating, title, body) values
  ((select id from public.products where slug='aurelien-serie-royale'),'Daniel R.',5,'Beyond expectations','The finishing is genuinely at a different level. Wears beautifully.'),
  ((select id from public.products where slug='aurelien-serie-royale'),'Sofia M.',5,'A gift that landed','Bought for my husband — the packaging alone felt like an event.'),
  ((select id from public.products where slug='aurora-chronograph'),'Marcus L.',5,'Perfect daily chrono','Legible, solid, and the two-tone works far better in person.'),
  ((select id from public.products where slug='celeste-diamond'),'Amelia K.',5,'Understated sparkle','Catches light without shouting. Exactly what I wanted.'),
  ((select id from public.products where slug='obsidian-diver'),'Jonas P.',4,'Tank of a watch','Heavier than expected but the bezel action is superb.');
