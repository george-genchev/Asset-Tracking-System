-- Migration: 009_add_is_admin_and_admin_rls_overrides
-- Description:
--   1) Add public.is_admin()
--   2) Admin full-access overrides for RLS-restricted app tables
--   3) Admin-only INSERT/UPDATE/DELETE on lookup tables:
--      actions, exchanges, orders, targets

begin;

-- =========================================================
-- 1) Admin helper function
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'::public.roles
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- =========================================================
-- 2) Admin full-access RLS overrides
--    (Adds admin bypass on existing ownership-restricted tables)
-- =========================================================

-- Strategies
drop policy if exists "Admins can manage all strategies" on public.strategies;
create policy "Admins can manage all strategies"
  on public.strategies
  as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Assets
drop policy if exists "Admins can manage all assets" on public.assets;
create policy "Admins can manage all assets"
  on public.assets
  as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Strategy attachments metadata table (from migration 008)
drop policy if exists "Admins can manage all strategy attachments" on public.strategy_attachments;
create policy "Admins can manage all strategy attachments"
  on public.strategy_attachments
  as permissive
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Optional: storage object-level admin bypass for strategy attachments bucket
drop policy if exists "Admins can manage all strategy attachment objects" on storage.objects;
create policy "Admins can manage all strategy attachment objects"
  on storage.objects
  as permissive
  for all
  to authenticated
  using (
    bucket_id = 'strategy-attachments'
    and public.is_admin()
  )
  with check (
    bucket_id = 'strategy-attachments'
    and public.is_admin()
  );

-- =========================================================
-- 3) Admin-only writes on lookup tables
--    (Read policies remain as-is)
-- =========================================================

alter table public.actions enable row level security;
alter table public.exchanges enable row level security;
alter table public.orders enable row level security;
alter table public.targets enable row level security;

-- Actions
drop policy if exists "Admins can insert actions" on public.actions;
drop policy if exists "Admins can update actions" on public.actions;
drop policy if exists "Admins can delete actions" on public.actions;

create policy "Admins can insert actions"
  on public.actions
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update actions"
  on public.actions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete actions"
  on public.actions
  for delete
  to authenticated
  using (public.is_admin());

-- Exchanges
drop policy if exists "Admins can insert exchanges" on public.exchanges;
drop policy if exists "Admins can update exchanges" on public.exchanges;
drop policy if exists "Admins can delete exchanges" on public.exchanges;

create policy "Admins can insert exchanges"
  on public.exchanges
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update exchanges"
  on public.exchanges
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete exchanges"
  on public.exchanges
  for delete
  to authenticated
  using (public.is_admin());

-- Orders
drop policy if exists "Admins can insert orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Admins can insert orders"
  on public.orders
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete orders"
  on public.orders
  for delete
  to authenticated
  using (public.is_admin());

-- Targets
drop policy if exists "Admins can insert targets" on public.targets;
drop policy if exists "Admins can update targets" on public.targets;
drop policy if exists "Admins can delete targets" on public.targets;

create policy "Admins can insert targets"
  on public.targets
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update targets"
  on public.targets
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete targets"
  on public.targets
  for delete
  to authenticated
  using (public.is_admin());

commit;
