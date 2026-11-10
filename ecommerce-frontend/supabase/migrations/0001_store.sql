-- SK Envision store: customers, products, orders, order items, PayPal events.
--
-- Run once in the Supabase SQL editor (or `supabase db push`). Every table has
-- row level security on and NO public policies: the browser never reads or
-- writes these tables directly. All access goes through the Vercel functions
-- in /api, which use the service role key and check who is asking.

-- ---------------------------------------------------------------- customers
-- One row per signed-up shopper, keyed to Supabase Auth's user id.
create table if not exists public.customers (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  first_name  text,
  last_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Create the customer row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
begin
  insert into public.customers (id, email, first_name, last_name)
  values (
    new.id,
    lower(new.email),
    nullif(split_part(full_name, ' ', 1), ''),
    nullif(trim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1)), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- products
-- A mirror of src/data/products.json for reporting and stock. Prices shown on
-- the site and charged at checkout come from that JSON file, so the two can
-- never disagree; re-run supabase/seed.sql (pnpm run db:seed) after editing it.
-- stock is null when not tracked.
create table if not exists public.products (
  id                text primary key,
  slug              text not null unique,
  title             text not null,
  price_cents       integer not null check (price_cents >= 0),
  compare_at_cents  integer check (compare_at_cents >= 0),
  stock             integer check (stock >= 0),
  active            boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------- orders
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null unique,              -- e.g. SK-7Q4M2X, shown to shoppers
  view_token         text not null,                    -- secret for the guest order link (set by /api)
  customer_id        uuid references public.customers (id) on delete set null,
  email              text not null,
  first_name         text,
  last_name          text,
  phone              text,
  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
  currency           text not null default 'USD',
  subtotal_cents     integer not null check (subtotal_cents >= 0),
  discount_cents     integer not null default 0 check (discount_cents >= 0),
  shipping_cents     integer not null default 0 check (shipping_cents >= 0),
  tax_cents          integer not null default 0 check (tax_cents >= 0),
  total_cents        integer not null check (total_cents >= 0),
  promo_code         text,
  shipping_method    text not null default 'standard',
  shipping_address   jsonb not null,
  paypal_order_id    text unique,
  paypal_capture_id  text unique,
  carrier            text,
  tracking_number    text,
  created_at         timestamptz not null default now(),
  paid_at            timestamptz,
  fulfilled_at       timestamptz,
  cancelled_at       timestamptz,
  refunded_at        timestamptz,
  updated_at         timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id                bigint generated always as identity primary key,
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        text not null,
  slug              text,
  title             text not null,
  unit_price_cents  integer not null check (unit_price_cents >= 0),
  quantity          integer not null check (quantity > 0),
  size              text,
  color             text,
  is_gift           boolean not null default false,
  line_total_cents  integer not null check (line_total_cents >= 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- PayPal webhook deliveries we have already handled (PayPal retries).
create table if not exists public.paypal_events (
  id           text primary key,
  event_type   text not null,
  resource_id  text,
  received_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_touch on public.customers;
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- Take paid items out of tracked stock (never below zero). Untracked
-- products (stock is null) are left alone.
create or replace function public.decrement_stock(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p
  set stock = greatest(0, p.stock - i.qty)
  from (
    select product_id, sum(quantity)::int as qty
    from public.order_items
    where order_id = p_order_id
    group by product_id
  ) i
  where p.id = i.product_id and p.stock is not null;
$$;

-- ---------------------------------------------------------------- security
alter table public.customers     enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.paypal_events enable row level security;

-- No policies on purpose: with RLS on and no policy, the public (anon) and
-- signed-in (authenticated) roles can read and write nothing. The service
-- role used by /api bypasses RLS.
revoke all on public.customers, public.products, public.orders, public.order_items,
  public.paypal_events from anon, authenticated;
revoke execute on function public.decrement_stock(uuid) from public, anon, authenticated;

-- The service role used by /api keeps full access.
grant all on public.customers, public.products, public.orders, public.order_items,
  public.paypal_events to service_role;
grant execute on function public.decrement_stock(uuid) to service_role;
