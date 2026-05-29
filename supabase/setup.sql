-- Tulevaisuustutka Supabase setup
-- Run this in Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.response_horizons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.directions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.signal_statuses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.source_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.implication_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.relationship_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.trend_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.trend_statuses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.time_horizons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fi text not null,
  name_en text not null,
  description_fi text,
  description_en text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  signal_code text unique,
  title text not null,
  summary text not null,
  description text,
  signal_status_id uuid references public.signal_statuses(id),
  extraction_date date,
  ingestion_method text not null default 'manual' check (ingestion_method in ('manual', 'ai_suggested', 'imported')),
  ai_summary text,
  ai_extracted_metadata jsonb not null default '{}'::jsonb,
  ai_confidence_score int check (ai_confidence_score between 1 and 5),
  validated_by uuid references public.profiles(id),
  validated_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger set_signals_updated_at
before update on public.signals
for each row execute function public.set_updated_at();

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text,
  publisher text,
  publication_date date,
  source_type_id uuid references public.source_types(id),
  doi text,
  patent_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.signal_sources (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  credibility_score int check (credibility_score between 1 and 5),
  source_relevance_score int check (source_relevance_score between 1 and 5),
  evidence_note text,
  created_at timestamptz not null default now(),
  unique (signal_id, source_id)
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.signal_themes (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  theme_id uuid not null references public.themes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (signal_id, theme_id)
);

create table if not exists public.signal_secondary_sectors (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  sector_id uuid not null references public.sectors(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (signal_id, sector_id)
);

create table if not exists public.signal_assessments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  version int not null default 1,
  is_current boolean not null default true,
  primary_sector_id uuid references public.sectors(id),
  response_horizon_id uuid references public.response_horizons(id),
  direction_id uuid references public.directions(id),
  impact_score int check (impact_score between 1 and 5),
  uncertainty_score int check (uncertainty_score between 1 and 5),
  confidence_score int check (confidence_score between 1 and 5),
  relevance_score int check (relevance_score between 1 and 5),
  novelty_score int check (novelty_score between 1 and 5),
  assessment_rationale text,
  what_if_question text,
  assessed_by uuid references public.profiles(id),
  assessed_at timestamptz not null default now(),
  unique (signal_id, version)
);

create unique index if not exists signal_assessments_one_current_per_signal
on public.signal_assessments (signal_id)
where is_current;

create table if not exists public.innovation_implications (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  implication_type_id uuid references public.implication_types(id),
  title text not null,
  description text,
  second_order_effects text,
  time_horizon_id uuid references public.time_horizons(id),
  potential_impact_score int check (potential_impact_score between 1 and 5),
  actionability_score int check (actionability_score between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  trend_code text unique,
  title text not null,
  summary text,
  description text,
  trend_type_id uuid references public.trend_types(id),
  maturity_score int check (maturity_score between 1 and 5),
  impact_potential_score int check (impact_potential_score between 1 and 5),
  speed_of_change_score int check (speed_of_change_score between 1 and 5),
  strategic_status_id uuid references public.trend_statuses(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger set_trends_updated_at
before update on public.trends
for each row execute function public.set_updated_at();

create table if not exists public.signal_trends (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  trend_id uuid not null references public.trends(id) on delete cascade,
  relationship_strength int check (relationship_strength between 1 and 5),
  rationale text,
  created_at timestamptz not null default now(),
  unique (signal_id, trend_id)
);

create table if not exists public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  source_entity_type text not null check (source_entity_type in ('signal', 'trend')),
  source_entity_id uuid not null,
  target_entity_type text not null check (target_entity_type in ('signal', 'trend')),
  target_entity_id uuid not null,
  relationship_type_id uuid references public.relationship_types(id),
  impact_coefficient int check (impact_coefficient between -3 and 3),
  strength_score int check (strength_score between 1 and 5),
  impact_rationale text,
  created_at timestamptz not null default now()
);

insert into public.sectors (code, name_fi, name_en, display_order) values
  ('political', 'Poliittinen', 'Political', 10),
  ('economic', 'Taloudellinen', 'Economic', 20),
  ('social', 'Sosiaalinen', 'Social', 30),
  ('technological', 'Teknologinen', 'Technological', 40),
  ('environmental', 'Ympäristö', 'Environmental', 50),
  ('cultural', 'Kulttuurinen', 'Cultural', 60)
on conflict (code) do update set
  name_fi = excluded.name_fi,
  name_en = excluded.name_en,
  display_order = excluded.display_order;

insert into public.response_horizons (code, name_fi, name_en, description_fi, description_en, display_order) values
  ('act', 'Toimi nyt', 'Act now', '0-12 kuukautta', '0-12 months', 10),
  ('prepare', 'Valmistaudu', 'Prepare', '12-36 kuukautta', '12-36 months', 20),
  ('watch', 'Seuraa', 'Watch', '36+ kuukautta tai epävarma', '36+ months or uncertain', 30)
on conflict (code) do update set
  name_fi = excluded.name_fi,
  name_en = excluded.name_en,
  description_fi = excluded.description_fi,
  description_en = excluded.description_en,
  display_order = excluded.display_order;

insert into public.directions (code, name_fi, name_en, display_order) values
  ('opportunity', 'Mahdollisuus', 'Opportunity', 10),
  ('risk', 'Riski', 'Risk', 20),
  ('mixed', 'Sekoitus', 'Mixed', 30)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.signal_statuses (code, name_fi, name_en, display_order) values
  ('draft', 'Luonnos', 'Draft', 10),
  ('published', 'Julkaistu', 'Published', 20),
  ('archived', 'Arkistoitu', 'Archived', 30)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.source_types (code, name_fi, name_en, display_order) values
  ('research', 'Tutkimus', 'Research', 10),
  ('report', 'Raportti', 'Report', 20),
  ('news', 'Uutinen', 'News', 30),
  ('blog', 'Blogi', 'Blog', 40),
  ('policy_document', 'Politiikkadokumentti', 'Policy document', 50),
  ('dataset', 'Aineisto', 'Dataset', 60),
  ('patent', 'Patentti', 'Patent', 70),
  ('expert_observation', 'Asiantuntijahavainto', 'Expert observation', 80),
  ('other', 'Muu', 'Other', 90)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.implication_types (code, name_fi, name_en, display_order) values
  ('service', 'Palvelu', 'Service', 10),
  ('product', 'Tuote', 'Product', 20),
  ('policy', 'Politiikka', 'Policy', 30),
  ('governance', 'Hallinta', 'Governance', 40),
  ('capability', 'Kyvykkyys', 'Capability', 50),
  ('business_model', 'Liiketoimintamalli', 'Business model', 60),
  ('research', 'Tutkimus', 'Research', 70),
  ('regulation', 'Sääntely', 'Regulation', 80)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.relationship_types (code, name_fi, name_en, display_order) values
  ('reinforces', 'Vahvistaa', 'Reinforces', 10),
  ('inhibits', 'Heikentää', 'Inhibits', 20),
  ('similar_to', 'Samankaltainen kuin', 'Similar to', 30),
  ('contradicts', 'Ristiriidassa', 'Contradicts', 40),
  ('precursor_to', 'Edeltää', 'Precursor to', 50),
  ('depends_on', 'Riippuu kohteesta', 'Depends on', 60)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.trend_types (code, name_fi, name_en, display_order) values
  ('megatrend', 'Megatrendi', 'Megatrend', 10),
  ('macrotrend', 'Makrotrendi', 'Macrotrend', 20),
  ('microtrend', 'Mikrotrendi', 'Microtrend', 30),
  ('technology_trend', 'Teknologiatrendi', 'Technology trend', 40),
  ('policy_trend', 'Politiikkatrendi', 'Policy trend', 50),
  ('other', 'Muu', 'Other', 60)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.trend_statuses (code, name_fi, name_en, display_order) values
  ('parked', 'Parkissa', 'Parked', 10),
  ('observing', 'Seurannassa', 'Observing', 20),
  ('planning', 'Suunnittelussa', 'Planning', 30),
  ('actively_pursuing', 'Aktiivisesti edistettävä', 'Actively pursuing', 40)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

insert into public.time_horizons (code, name_fi, name_en, display_order) values
  ('short', 'Lyhyt', 'Short', 10),
  ('medium', 'Keskipitkä', 'Medium', 20),
  ('long', 'Pitkä', 'Long', 30)
on conflict (code) do update set name_fi = excluded.name_fi, name_en = excluded.name_en, display_order = excluded.display_order;

create or replace function public.is_published_signal(signal_row_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.signals s
    join public.signal_statuses ss on ss.id = s.signal_status_id
    where s.id = signal_row_id
      and ss.code = 'published'
  );
$$;

grant execute on function public.is_published_signal(uuid) to anon, authenticated;

create or replace view public.published_signal_cards as
select
  s.id,
  s.signal_code,
  s.title,
  s.summary,
  s.signal_status_id,
  ss.code as status_code,
  ss.name_fi as status_name_fi,
  a.primary_sector_id,
  sec.code as sector_code,
  sec.name_fi as sector_name_fi,
  a.response_horizon_id,
  rh.code as response_horizon_code,
  rh.name_fi as horizon_name_fi,
  a.direction_id,
  d.code as direction_code,
  d.name_fi as direction_name_fi,
  a.impact_score,
  a.relevance_score,
  a.confidence_score,
  a.novelty_score,
  s.created_at,
  s.updated_at
from public.signals s
join public.signal_statuses ss on ss.id = s.signal_status_id and ss.code = 'published'
left join public.signal_assessments a on a.signal_id = s.id and a.is_current = true
left join public.sectors sec on sec.id = a.primary_sector_id
left join public.response_horizons rh on rh.id = a.response_horizon_id
left join public.directions d on d.id = a.direction_id;

create or replace view public.dashboard_signal_stats as
select
  count(*)::int as total_published,
  count(*) filter (where s.created_at >= now() - interval '30 days')::int as new_signals,
  count(*) filter (where a.impact_score >= 4)::int as high_impact
from public.signals s
join public.signal_statuses ss on ss.id = s.signal_status_id and ss.code = 'published'
left join public.signal_assessments a on a.signal_id = s.id and a.is_current = true;

alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.response_horizons enable row level security;
alter table public.directions enable row level security;
alter table public.signal_statuses enable row level security;
alter table public.source_types enable row level security;
alter table public.implication_types enable row level security;
alter table public.relationship_types enable row level security;
alter table public.trend_types enable row level security;
alter table public.trend_statuses enable row level security;
alter table public.time_horizons enable row level security;
alter table public.signals enable row level security;
alter table public.sources enable row level security;
alter table public.signal_sources enable row level security;
alter table public.themes enable row level security;
alter table public.signal_themes enable row level security;
alter table public.signal_secondary_sectors enable row level security;
alter table public.signal_assessments enable row level security;
alter table public.innovation_implications enable row level security;
alter table public.trends enable row level security;
alter table public.signal_trends enable row level security;
alter table public.entity_relationships enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.published_signal_cards to anon, authenticated;
grant select on public.dashboard_signal_stats to anon, authenticated;

grant select on
  public.sectors,
  public.response_horizons,
  public.directions,
  public.signal_statuses,
  public.source_types,
  public.implication_types,
  public.relationship_types,
  public.trend_types,
  public.trend_statuses,
  public.time_horizons
to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on
  public.signals,
  public.sources,
  public.signal_sources,
  public.themes,
  public.signal_themes,
  public.signal_secondary_sectors,
  public.signal_assessments,
  public.innovation_implications,
  public.trends,
  public.signal_trends
to anon;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own_display_name_or_admin on public.profiles;
create policy profiles_update_own_display_name_or_admin on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists signals_public_select_published on public.signals;
create policy signals_public_select_published on public.signals
for select to anon, authenticated
using (public.is_published_signal(id));

drop policy if exists signals_admin_all on public.signals;
create policy signals_admin_all on public.signals
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists assessments_public_select_current_published on public.signal_assessments;
create policy assessments_public_select_current_published on public.signal_assessments
for select to anon, authenticated
using (is_current and public.is_published_signal(signal_id));

drop policy if exists assessments_admin_all on public.signal_assessments;
create policy assessments_admin_all on public.signal_assessments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists signal_sources_public_select_published on public.signal_sources;
create policy signal_sources_public_select_published on public.signal_sources
for select to anon, authenticated
using (public.is_published_signal(signal_id));

drop policy if exists signal_sources_admin_all on public.signal_sources;
create policy signal_sources_admin_all on public.signal_sources
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists sources_public_select_linked_published on public.sources;
create policy sources_public_select_linked_published on public.sources
for select to anon, authenticated
using (
  exists (
    select 1
    from public.signal_sources ss
    where ss.source_id = sources.id
      and public.is_published_signal(ss.signal_id)
  )
);

drop policy if exists sources_admin_all on public.sources;
create policy sources_admin_all on public.sources
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists signal_themes_public_select_published on public.signal_themes;
create policy signal_themes_public_select_published on public.signal_themes
for select to anon, authenticated
using (public.is_published_signal(signal_id));

drop policy if exists signal_themes_admin_all on public.signal_themes;
create policy signal_themes_admin_all on public.signal_themes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists themes_public_select_linked_published on public.themes;
create policy themes_public_select_linked_published on public.themes
for select to anon, authenticated
using (
  exists (
    select 1
    from public.signal_themes st
    where st.theme_id = themes.id
      and public.is_published_signal(st.signal_id)
  )
);

drop policy if exists themes_admin_all on public.themes;
create policy themes_admin_all on public.themes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists secondary_sectors_public_select_published on public.signal_secondary_sectors;
create policy secondary_sectors_public_select_published on public.signal_secondary_sectors
for select to anon, authenticated
using (public.is_published_signal(signal_id));

drop policy if exists secondary_sectors_admin_all on public.signal_secondary_sectors;
create policy secondary_sectors_admin_all on public.signal_secondary_sectors
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists implications_public_select_published on public.innovation_implications;
create policy implications_public_select_published on public.innovation_implications
for select to anon, authenticated
using (public.is_published_signal(signal_id));

drop policy if exists implications_admin_all on public.innovation_implications;
create policy implications_admin_all on public.innovation_implications
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists signal_trends_public_select_published on public.signal_trends;
create policy signal_trends_public_select_published on public.signal_trends
for select to anon, authenticated
using (public.is_published_signal(signal_id));

drop policy if exists signal_trends_admin_all on public.signal_trends;
create policy signal_trends_admin_all on public.signal_trends
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists trends_public_select_linked_published on public.trends;
create policy trends_public_select_linked_published on public.trends
for select to anon, authenticated
using (
  exists (
    select 1
    from public.signal_trends st
    where st.trend_id = trends.id
      and public.is_published_signal(st.signal_id)
  )
);

drop policy if exists trends_admin_all on public.trends;
create policy trends_admin_all on public.trends
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists entity_relationships_admin_all on public.entity_relationships;
create policy entity_relationships_admin_all on public.entity_relationships
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists sectors_public_select on public.sectors;
create policy sectors_public_select on public.sectors for select to anon, authenticated using (true);
drop policy if exists sectors_admin_all on public.sectors;
create policy sectors_admin_all on public.sectors for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists response_horizons_public_select on public.response_horizons;
create policy response_horizons_public_select on public.response_horizons for select to anon, authenticated using (true);
drop policy if exists response_horizons_admin_all on public.response_horizons;
create policy response_horizons_admin_all on public.response_horizons for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists directions_public_select on public.directions;
create policy directions_public_select on public.directions for select to anon, authenticated using (true);
drop policy if exists directions_admin_all on public.directions;
create policy directions_admin_all on public.directions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists signal_statuses_public_select on public.signal_statuses;
create policy signal_statuses_public_select on public.signal_statuses for select to anon, authenticated using (true);
drop policy if exists signal_statuses_admin_all on public.signal_statuses;
create policy signal_statuses_admin_all on public.signal_statuses for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists source_types_public_select on public.source_types;
create policy source_types_public_select on public.source_types for select to anon, authenticated using (true);
drop policy if exists source_types_admin_all on public.source_types;
create policy source_types_admin_all on public.source_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists implication_types_public_select on public.implication_types;
create policy implication_types_public_select on public.implication_types for select to anon, authenticated using (true);
drop policy if exists implication_types_admin_all on public.implication_types;
create policy implication_types_admin_all on public.implication_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists relationship_types_public_select on public.relationship_types;
create policy relationship_types_public_select on public.relationship_types for select to anon, authenticated using (true);
drop policy if exists relationship_types_admin_all on public.relationship_types;
create policy relationship_types_admin_all on public.relationship_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists trend_types_public_select on public.trend_types;
create policy trend_types_public_select on public.trend_types for select to anon, authenticated using (true);
drop policy if exists trend_types_admin_all on public.trend_types;
create policy trend_types_admin_all on public.trend_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists trend_statuses_public_select on public.trend_statuses;
create policy trend_statuses_public_select on public.trend_statuses for select to anon, authenticated using (true);
drop policy if exists trend_statuses_admin_all on public.trend_statuses;
create policy trend_statuses_admin_all on public.trend_statuses for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists time_horizons_public_select on public.time_horizons;
create policy time_horizons_public_select on public.time_horizons for select to anon, authenticated using (true);
drop policy if exists time_horizons_admin_all on public.time_horizons;
create policy time_horizons_admin_all on public.time_horizons for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- After creating your first Supabase Auth user, make them admin with:
-- update public.profiles set role = 'admin' where id = '<auth-user-id>';
