-- Phase 7.8 — Cross-Civilization Network QA
-- Reproducible governance marker and refresh for network QA classification.
alter table public.entry_content_admissions
  add column if not exists network_qa_status text,
  add column if not exists network_qa_reason text,
  add column if not exists network_qa_version text;

-- Relation repair itself is deliberately data-driven and must remain evidence-backed.
-- Phase 7.8-v2 refresh classified all 190 Canonical Entries after verified relation additions:
-- connected 58 / isolated 92 / multi_weak 11 / single_strong 29.
