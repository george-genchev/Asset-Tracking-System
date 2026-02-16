alter table public.assets
  add column if not exists action_id uuid;

update public.assets a
set action_id = act.id
from public.actions act
where a.action is not null
  and upper(a.action) = act.name;

alter table public.assets
  drop constraint if exists assets_action_fkey;

alter table public.assets
  drop column if exists action;

alter table public.assets
  add constraint assets_action_id_fkey
  foreign key (action_id)
  references public.actions(id)
  on update cascade
  on delete set null;
