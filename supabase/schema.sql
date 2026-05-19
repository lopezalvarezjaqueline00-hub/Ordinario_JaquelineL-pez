create table if not exists public.mossi_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.mossi_state enable row level security;

drop policy if exists "Allow Mossi state reads" on public.mossi_state;
drop policy if exists "Allow Mossi state inserts" on public.mossi_state;
drop policy if exists "Allow Mossi state updates" on public.mossi_state;

create policy "Allow Mossi state reads"
on public.mossi_state
for select
to anon
using (true);

create policy "Allow Mossi state inserts"
on public.mossi_state
for insert
to anon
with check (true);

create policy "Allow Mossi state updates"
on public.mossi_state
for update
to anon
using (true)
with check (true);
