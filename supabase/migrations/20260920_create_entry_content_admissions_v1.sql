-- Phase 6B/6C: Canonical Content Admission v1.
-- This table is governance metadata, not a second knowledge fact source.
create table if not exists public.entry_content_admissions (
  entry_id uuid primary key references public.entries(id) on delete cascade,
  admission_version text not null default 'v1',
  entity_boundary boolean not null default false,
  independent_value boolean not null default false,
  source_present boolean not null default false,
  source_depth boolean not null default false,
  world_mapped boolean not null default false,
  exploration_exit boolean not null default false,
  body_depth boolean not null default false,
  citation_readiness text not null default 'review' check (citation_readiness in ('pass','review','block')),
  admission_status text not null default 'review' check (admission_status in ('admitted','develop','blocked')),
  evidence_score integer not null default 0,
  notes text,
  reviewed_at timestamptz not null default now(),
  content_quality_status text not null default 'develop' check (content_quality_status in ('ready','develop','rewrite'))
);
alter table public.entry_content_admissions enable row level security;
revoke all on public.entry_content_admissions from anon, authenticated;
