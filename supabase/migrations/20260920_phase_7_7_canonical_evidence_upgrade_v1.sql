-- Phase 7.7 — Canonical Evidence Upgrade
-- Production changes applied 2026-09-20.
-- Full content/source/relation payload was applied directly to the nine newly admitted Canonical Entries.
-- This migration records the governance/version marker for reproducibility.
update public.entry_content_admissions a
set evidence_mapping_version='phase7.7-canonical-evidence-upgrade-v1'
from public.entries e
where a.entry_id=e.id
  and e.slug in ('arita-kiln','bat-trang','iznik-ceramics','sawankhalok','seto-kiln','yixing-kiln','tao-shuo','jean-baptiste-du-halde','zhu-yan');
