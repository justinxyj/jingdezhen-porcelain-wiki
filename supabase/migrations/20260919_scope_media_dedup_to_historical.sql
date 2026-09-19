-- Historical media dedup is intentionally scoped to historical entries.
-- The production dataset was normalized accordingly before any future destructive cleanup.
BEGIN;
UPDATE public.media
SET status='approved',
    review_state='verified',
    verification_note=regexp_replace(COALESCE(verification_note,''), '；同一条目媒体去重：保留同 canonical_key 的首条记录', ''),
    verified_at=COALESCE(verified_at, now())
WHERE entry_id IN (SELECT id FROM public.entries WHERE category <> '历史')
  AND status='rejected';
COMMIT;