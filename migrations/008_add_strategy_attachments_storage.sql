-- Migration: 008_add_strategy_attachments_storage
-- Description: Add strategy attachments table, storage bucket, and RLS policies
-- Date: 2026-02-28

create table if not exists public.strategy_attachments (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.strategies(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  mime_type text,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_strategy_attachments_strategy_id on public.strategy_attachments(strategy_id);
create index if not exists idx_strategy_attachments_owner_id on public.strategy_attachments(owner_id);

alter table public.strategy_attachments enable row level security;

drop policy if exists "Users can view attachments from own strategies" on public.strategy_attachments;
create policy "Users can view attachments from own strategies"
  on public.strategy_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.strategies s
      where s.id = strategy_attachments.strategy_id
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can insert attachments into own strategies" on public.strategy_attachments;
create policy "Users can insert attachments into own strategies"
  on public.strategy_attachments
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.strategies s
      where s.id = strategy_attachments.strategy_id
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can delete attachments from own strategies" on public.strategy_attachments;
create policy "Users can delete attachments from own strategies"
  on public.strategy_attachments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.strategies s
      where s.id = strategy_attachments.strategy_id
        and s.owner_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('strategy-attachments', 'strategy-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own strategy attachment objects" on storage.objects;
create policy "Users can read own strategy attachment objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'strategy-attachments'
    and exists (
      select 1
      from public.strategies s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can upload own strategy attachment objects" on storage.objects;
create policy "Users can upload own strategy attachment objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'strategy-attachments'
    and exists (
      select 1
      from public.strategies s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own strategy attachment objects" on storage.objects;
create policy "Users can delete own strategy attachment objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'strategy-attachments'
    and exists (
      select 1
      from public.strategies s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );
