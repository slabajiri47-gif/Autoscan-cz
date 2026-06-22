-- AutoScan CZ engine catalog schema. Run in Supabase SQL Editor.
create table if not exists public.engines (
  id text primary key,
  code text,
  brand text not null,
  model text not null,
  generation text,
  year_from smallint,
  year_to smallint,
  fuel text check (fuel in ('benzín', 'nafta', 'hybrid', 'elektro', 'LPG/CNG', 'jiné')),
  displacement integer check (displacement is null or displacement > 0),
  power_kw smallint check (power_kw is null or power_kw > 0),
  market text default 'Evropa',
  vin_prefixes text[] not null default '{}',
  base_score smallint not null default 50 check (base_score between 0 and 100),
  repair_reserve integer not null default 0 check (repair_reserve >= 0),
  faults jsonb not null default '[]'::jsonb,
  source_name text,
  source_url text,
  verified_at date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_year_range check (year_from is null or year_to is null or year_from <= year_to),
  constraint faults_are_array check (jsonb_typeof(faults) = 'array')
);

create index if not exists engines_brand_model_idx on public.engines (brand, model);
create index if not exists engines_year_idx on public.engines (year_from, year_to);
create index if not exists engines_fuel_idx on public.engines (fuel);
create index if not exists engines_active_idx on public.engines (active) where active = true;

alter table public.engines enable row level security;

drop policy if exists "Public can read active engines" on public.engines;
create policy "Public can read active engines"
on public.engines for select
to anon, authenticated
using (active = true);

-- Writes stay restricted to the Supabase dashboard/service role.
revoke insert, update, delete on public.engines from anon, authenticated;
grant select on public.engines to anon, authenticated;
