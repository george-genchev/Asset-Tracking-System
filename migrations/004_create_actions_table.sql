create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.actions (name)
values ('BUY'), ('SELL'), ('HOLD')
on conflict (name) do nothing;

update public.assets
set action = upper(action)
where action is not null;

update public.assets
set action = null
where action is not null
  and action not in ('BUY', 'SELL', 'HOLD');

alter table public.assets
  add constraint assets_action_fkey
  foreign key (action)
  references public.actions(name)
  on update cascade
  on delete set null;
