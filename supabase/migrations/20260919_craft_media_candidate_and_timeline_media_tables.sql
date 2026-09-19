-- Candidate tables for process and historical-entry media governance.
BEGIN;

CREATE TABLE IF NOT EXISTS public.craft_media_candidates (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.craft_processes(id) on delete cascade,
  image_url text not null,
  source_url text not null,
  source_type text not null check (source_type in ('official','commons','open_access','google_discovery')),
  source_tier integer check (source_tier between 1 and 3),
  title text,
  creator text,
  license text,
  match_scope text not null default 'representative'
    check (match_scope in ('process_specific','stage_representative','generic_technique','object_or_product','kiln_representative')),
  review_status text not null default 'pending'
    check (review_status in ('pending','verified','rejected')),
  note text,
  created_at timestamptz not null default now(),
  unique(process_id,image_url)
);

ALTER TABLE public.entry_craft_processes
  ADD COLUMN IF NOT EXISTS source_title text;

CREATE INDEX IF NOT EXISTS craft_media_candidates_process_idx
  ON public.craft_media_candidates(process_id,review_status);
CREATE INDEX IF NOT EXISTS media_entry_source_idx
  ON public.media(entry_id,source_tier,status);
CREATE INDEX IF NOT EXISTS entry_craft_processes_entry_idx
  ON public.entry_craft_processes(entry_id);

CREATE TABLE IF NOT EXISTS public.timeline_media_candidates (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  image_url text not null,
  source_url text not null,
  source_type text not null check (source_type in ('official','commons','open_access','google_discovery')),
  source_tier integer check (source_tier between 1 and 3),
  title text,
  creator text,
  license text,
  review_status text not null default 'pending'
    check (review_status in ('pending','verified','rejected')),
  note text,
  created_at timestamptz not null default now(),
  unique(entry_id,image_url)
);

CREATE INDEX IF NOT EXISTS timeline_media_candidates_entry_idx
  ON public.timeline_media_candidates(entry_id,review_status);

COMMIT;