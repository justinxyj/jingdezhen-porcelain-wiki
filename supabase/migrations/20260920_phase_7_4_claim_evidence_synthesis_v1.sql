-- Phase 7.4 — Research Corpus Claim-by-Claim Evidence Synthesis
-- Production DDL applied 2026-09-20.
-- claim_evidence_map stores structured Claim -> Evidence -> Source -> Evidence Type -> Confidence -> Boundary.
-- This is governance/evidence metadata, not a second fact database.
alter table public.entry_content_admissions
  add column if not exists claim_evidence_map jsonb not null default '[]'::jsonb,
  add column if not exists claim_synthesis_version text;
create index if not exists idx_entry_content_admissions_claim_synthesis_version
  on public.entry_content_admissions(claim_synthesis_version);
