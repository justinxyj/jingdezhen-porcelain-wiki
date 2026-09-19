-- Keep the public media view security-invoker based.
-- Anonymous callers receive only the public-safe media columns and still pass media RLS.

begin;

alter view public.media_public set (security_invoker = true);

revoke all on table public.media from anon;
grant select (
  id,
  entry_id,
  path,
  title,
  source,
  license,
  creator,
  captured_at,
  location,
  created_at,
  usage_type,
  source_tier,
  is_primary,
  canonical_key,
  source_url,
  source_type
) on table public.media to anon;

commit;
