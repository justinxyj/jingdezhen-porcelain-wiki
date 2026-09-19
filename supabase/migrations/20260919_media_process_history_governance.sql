-- Phase 3: media governance, deduplication, source tiers, craft-entry graph readiness.
-- This migration mirrors the production governance changes applied to Supabase.
-- It is intentionally additive/idempotent.

BEGIN;

UPDATE public.media
SET source_tier = COALESCE(source_tier, 3)
WHERE source_tier IS NULL;

ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS canonical_key text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS review_state text NOT NULL DEFAULT 'pending';

UPDATE public.media
SET canonical_key = COALESCE(NULLIF(source_url,''), NULLIF(source,''), NULLIF(path,''))
WHERE canonical_key IS NULL;

ALTER TABLE public.timeline_context
  ADD COLUMN IF NOT EXISTS source_tier integer CHECK (source_tier BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS image_search_query text,
  ADD COLUMN IF NOT EXISTS image_status text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS image_source_type text NOT NULL DEFAULT 'official';

ALTER TABLE public.craft_processes
  ADD COLUMN IF NOT EXISTS image_license text,
  ADD COLUMN IF NOT EXISTS image_creator text,
  ADD COLUMN IF NOT EXISTS image_search_query text,
  ADD COLUMN IF NOT EXISTS image_review_note text;

CREATE INDEX IF NOT EXISTS media_canonical_key_idx ON public.media(canonical_key);
CREATE INDEX IF NOT EXISTS media_source_tier_idx ON public.media(source_tier);
CREATE INDEX IF NOT EXISTS timeline_context_image_status_idx ON public.timeline_context(image_status);
CREATE INDEX IF NOT EXISTS entry_craft_processes_process_idx ON public.entry_craft_processes(process_id);

WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY entry_id, canonical_key
           ORDER BY is_primary DESC NULLS LAST, source_tier ASC NULLS LAST, created_at ASC
         ) AS rn
  FROM public.media
  WHERE canonical_key IS NOT NULL AND status <> 'rejected'
)
UPDATE public.media m
SET status='rejected',
    review_state='rejected',
    verification_note=COALESCE(m.verification_note,'') || '；同一条目媒体去重：保留同 canonical_key 的首条记录'
FROM ranked r
WHERE m.id=r.id AND r.rn>1;

COMMIT;
