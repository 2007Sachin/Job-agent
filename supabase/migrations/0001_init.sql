-- Job-agent schema. Apply with the Supabase CLI or the SQL editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text default '',
  onboarded boolean not null default false,
  target_roles text[] not null default '{}',
  locations text[] not null default '{}',
  salary_min_lpa numeric,
  salary_max_lpa numeric,
  experience_years numeric,
  skills text[] not null default '{}',
  linkedin_url text default '',
  preferences text default '',
  resume_text text default '',
  resume_file_name text default '',
  email_consent boolean not null default false,
  consent_at timestamptz,
  smtp_host text default '',
  smtp_port text default '587',
  smtp_user text default '',
  smtp_from text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  job jsonb not null,
  stage text not null check (stage in ('saved', 'applied', 'interviewing', 'offer', 'rejected')),
  notes text default '',
  tailored_resume text default '',
  cover_letter text default '',
  linkedin_note text default '',
  recruiter_email text default '',
  applied_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  recipient text default '',
  subject text default '',
  body text default '',
  status text not null default 'draft',
  provider text default 'unsent',
  approved boolean not null default false,
  follow_up_on date,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null,
  count integer not null default 0,
  primary key (user_id, day, kind)
);

create table if not exists public.gmail_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.outreach enable row level security;
alter table public.usage_daily enable row level security;
alter table public.gmail_tokens enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own outreach" on public.outreach
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own usage" on public.usage_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Refresh tokens are written by the service role. Users may delete their row.
create policy "delete own gmail token" on public.gmail_tokens
  for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "own resume objects" on storage.objects
  for all using (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  ) with check (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  );
