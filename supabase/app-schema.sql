-- Optional account data schema for the next Supabase phase.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  score smallint,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  title text not null,
  due_date date,
  due_km integer,
  completed boolean not null default false,
  notification_status text not null default 'local-only',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.reports enable row level security;
alter table public.reminders enable row level security;

create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own vehicles" on public.vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reports" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reminders" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
