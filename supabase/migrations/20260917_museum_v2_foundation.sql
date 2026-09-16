-- Museum V2 foundation: data model conventions for objects, media, sources, evidence and editorial QA.
-- This migration is additive and keeps existing entries/media compatible.

alter table public.entries
  add column if not exists object_type text,
  add column if not exists aliases jsonb default '[]'::jsonb,
  add column if not exists place_name text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists confidence text default 'unreviewed',
  add column if not exists editorial_status text default 'published',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid;

alter table public.media
  add column if not exists verification_status text default 'unreviewed',
  add column if not exists source_url text,
  add column if not exists source_institution text,
  add column if not exists copyright_note text,
  add column if not exists mime_type text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists last_checked_at timestamptz;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  source_type text not null default 'web',
  institution text,
  tier integer not null default 3 check (tier between 1 and 3),
  citation text,
  license text,
  language text,
  published_at date,
  last_checked_at timestamptz,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entry_sources (
  entry_id uuid not null references public.entries(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  role text not null default 'evidence',
  excerpt text,
  note text,
  created_at timestamptz not null default now(),
  primary key (entry_id, source_id, role)
);

create index if not exists entries_object_type_idx on public.entries(object_type);
create index if not exists entries_confidence_idx on public.entries(confidence);
create index if not exists entries_editorial_status_idx on public.entries(editorial_status);
create index if not exists media_verification_status_idx on public.media(verification_status);
create index if not exists media_source_institution_idx on public.media(source_institution);
create index if not exists entry_sources_source_idx on public.entry_sources(source_id);

-- Normalize existing rows without overwriting curated content.
update public.entries set object_type = case category
  when '器物' then 'object'
  when '人物' then 'person'
  when '窑址' then 'kiln'
  when '文献' then 'literature'
  when '历史' then 'history'
  else coalesce(object_type,'topic') end
where object_type is null;

update public.entries set editorial_status = case status
  when 'published' then 'published'
  when 'draft' then 'draft'
  when 'archived' then 'archived'
  else coalesce(editorial_status,'published') end
where editorial_status is null;

update public.media set verification_status='verified'
where status='approved' and verification_status='unreviewed';
