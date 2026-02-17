-- Migration: 007_add_exchanges_table_and_assets_exchange_id
-- Description: Create exchanges table and link assets.exchange to exchanges
-- Date: 2026-02-17

create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.exchanges (name)
values ('NASDAQ'), ('NYSE')
on conflict (name) do nothing;

alter table public.assets
  add column if not exists exchange_id uuid references public.exchanges(id);

update public.assets a
set exchange_id = e.id
from public.exchanges e
where a.exchange is not null
  and lower(a.exchange) = lower(e.name);

create index if not exists idx_assets_exchange_id on public.assets(exchange_id);

alter table public.assets
  drop column if exists exchange;

alter table public.exchanges enable row level security;

create policy "Authenticated users can view exchanges"
  on public.exchanges
  for select
  to authenticated
  using (true);
