-- Phase 6C-2 Corpus QA / Phase 7 governance
-- Applied to production on 2026-09-20.
alter table public.entry_content_admissions add column if not exists corpus_node_type text not null default 'canonical_entry';
alter table public.entry_content_admissions add column if not exists canonical_eligible boolean not null default true;
update public.entry_content_admissions
set corpus_node_type = case when corpus_disposition='C_context_or_relation' then 'knowledge_node' else 'canonical_entry' end,
    canonical_eligible = case when corpus_disposition='C_context_or_relation' then false else true end
where citation_readiness='review';
