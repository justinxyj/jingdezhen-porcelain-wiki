-- Phase 7.2 Corpus Evidence QA / Primary Evidence Mapping
-- Applied to production 2026-09-20.
alter table public.entry_content_admissions add column if not exists primary_evidence_status text;
alter table public.entry_content_admissions add column if not exists primary_evidence_refs jsonb not null default '[]'::jsonb;
alter table public.entry_content_admissions add column if not exists evidence_mapping_version text;

-- 39 Research Corpus entries are classified as mapped, bibliographic_primary_target,
-- or target_defined.