create table if not exists public.desk_records (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.desk_records enable row level security;

create policy "own desk records" on public.desk_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
