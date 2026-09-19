-- Seed historical source arrays from the reviewed timeline_context provenance.
BEGIN;
UPDATE public.entries e
SET sources = jsonb_build_array(jsonb_build_object(
  'title',tc.official_source_title,
  'url',tc.official_source_url,
  'institution',tc.official_institution,
  'tier',tc.source_tier,
  'type','authoritative'
)),
updated_at=now()
FROM public.timeline_context tc
WHERE e.id=tc.entry_id
  AND e.category='历史'
  AND tc.official_source_url IS NOT NULL;
COMMIT;