-- Media governance: searchable provenance and source-type audit for craft-process imagery.
-- Candidates are never promoted to verified automatically.
BEGIN;

ALTER TABLE public.craft_processes
  ADD COLUMN IF NOT EXISTS image_license text,
  ADD COLUMN IF NOT EXISTS image_creator text,
  ADD COLUMN IF NOT EXISTS image_search_query text,
  ADD COLUMN IF NOT EXISTS image_review_note text;

ALTER TABLE public.craft_processes DROP CONSTRAINT IF EXISTS craft_processes_image_source_type_check;
ALTER TABLE public.craft_processes
  ADD CONSTRAINT craft_processes_image_source_type_check
  CHECK (image_source_type IS NULL OR image_source_type IN (
    'official_step',
    'official_stage_representative',
    'public_domain',
    'commons_candidate',
    'google_candidate'
  ));

CREATE INDEX IF NOT EXISTS craft_processes_image_status_idx
  ON public.craft_processes(image_status);

CREATE INDEX IF NOT EXISTS craft_processes_image_source_type_idx
  ON public.craft_processes(image_source_type);

COMMIT;
