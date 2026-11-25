create table if not exists public.waitlist (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;
