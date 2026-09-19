-- Restore the canonical Chinese process name for step 19.
-- The slug remains an internal stable identifier; public-facing name_zh must be Chinese.
BEGIN;
UPDATE public.craft_processes
SET name_zh = '分泥',
    updated_at = now()
WHERE sequence = 19
  AND slug = 'portioning';
COMMIT;
