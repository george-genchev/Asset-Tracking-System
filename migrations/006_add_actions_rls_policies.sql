-- Enable RLS on actions table if not already enabled
alter table public.actions enable row level security;

-- Allow all authenticated users to read actions
create policy "Allow authenticated users to read actions"
  on public.actions
  for select
  using (auth.role() = 'authenticated');

-- Allow anon users to read actions (for login page, etc)
create policy "Allow anon users to read actions"
  on public.actions
  for select
  using (auth.role() = 'anon');
