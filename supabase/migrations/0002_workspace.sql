create table if not exists public.bots (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  bot_id text not null,
  title text not null default 'Chat',
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.bots enable row level security;
alter table public.skills enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "own bots" on public.bots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
