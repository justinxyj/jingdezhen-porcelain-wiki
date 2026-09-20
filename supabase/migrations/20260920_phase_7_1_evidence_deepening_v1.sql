-- Phase 7.1 Evidence Deepening v1
-- Production governance applied 2026-09-20.
alter table public.entry_content_admissions add column if not exists evidence_deepening_version text;
update public.entry_content_admissions
set evidence_deepening_version='phase7.1-v1'
where citation_readiness='pass' and admission_status='admitted';

-- 101 Phase 7 growth Entries were reviewed against institutional evidence anchors
-- and explicit research boundaries; 39 B_research Entries remain review-only.
