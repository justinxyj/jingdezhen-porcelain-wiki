-- Phase 6C Research Pass v2
alter table public.entry_content_admissions add column if not exists source_quality text not null default 'secondary' check (source_quality in ('primary_or_institutional','secondary','weak'));
alter table public.entry_content_admissions add column if not exists research_priority text not null default 'normal' check (research_priority in ('critical','high','normal','low'));
alter table public.entry_content_admissions add column if not exists research_pass_version text not null default '6C-v1';

-- source_quality/research_priority are governance metadata only; they never replace canonical Entry facts.
