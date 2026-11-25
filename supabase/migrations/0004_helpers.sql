create table if not exists public.connected_apps (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.extension_tokens (
  token_hash text primary key,
  subject text not null,
  user_id uuid references auth.users (id) on delete cascade,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.extension_jobs (
  id text primary key,
  subject text not null,
  user_id uuid references auth.users (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.connected_apps enable row level security;
alter table public.extension_tokens enable row level security;
alter table public.extension_jobs enable row level security;

create policy "own apps" on public.connected_apps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own extension tokens" on public.extension_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own extension jobs" on public.extension_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
