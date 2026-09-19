-- APPROVED handoff r3-narrow (director 2026-09-19) — sole PR input.
-- Path: supabase/migrations/20260919_rls_phase_b_public_select_without_is_staff.sql
--
-- Production already applied Phase B via MCP; this file mirrors final state for repo history.
-- Merge requires founder approval. Do not re-apply on production unless new environment.
-- Rollback: restore pre-B policy snapshot / backup; do not hand-rewrite casually.
-- IN SCOPE: entries, media, entry_relations, entry_revisions, edits, is_staff EXECUTE
-- OUT OF SCOPE: profiles, favorites (do not DROP/CREATE)
--
-- Final state:
--   * Public SELECT entries/media/entry_relations: NO is_staff()
--   * entry_relations_public_read: BOTH ends published
--   * Every is_staff() policy: TO authenticated only
--   * REVOKE EXECUTE ON is_staff() FROM anon; GRANT authenticated, service_role
--   * RLS stays ON; no anon writes
--
-- Before PR merge: reconcile DROP names with live pg_policies if a snapshot is available.

BEGIN;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edits ENABLE ROW LEVEL SECURITY;

-- DROP checklist (expected live names — confirm via pg_policies when possible):
--   entries: entries_public_read, entries_owner_read, entries_staff_read, entries_staff_write
--   media: media_public_read, media_owner_read, media_staff_read, media_insert, media_staff_update
--   entry_relations: entry_relations_public_read, entry_relations_staff_write
--   entry_revisions: revisions_public_read, revisions_staff_insert
--   edits: edits_insert, edits_own_select, edits_staff_select, edits_staff_update

DROP POLICY IF EXISTS "entries_public_read" ON public.entries;
DROP POLICY IF EXISTS "entries_owner_read" ON public.entries;
DROP POLICY IF EXISTS "entries_staff_read" ON public.entries;
DROP POLICY IF EXISTS "entries_staff_write" ON public.entries;

CREATE POLICY "entries_public_read" ON public.entries
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "entries_owner_read" ON public.entries
  FOR SELECT TO authenticated
  USING (auth.uid() = updated_by);

CREATE POLICY "entries_staff_read" ON public.entries
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "entries_staff_write" ON public.entries
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "media_public_read" ON public.media;
DROP POLICY IF EXISTS "media_owner_read" ON public.media;
DROP POLICY IF EXISTS "media_staff_read" ON public.media;
DROP POLICY IF EXISTS "media_insert" ON public.media;
DROP POLICY IF EXISTS "media_staff_update" ON public.media;

CREATE POLICY "media_public_read" ON public.media
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "media_owner_read" ON public.media
  FOR SELECT TO authenticated
  USING (auth.uid() = uploader_id);

CREATE POLICY "media_staff_read" ON public.media
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "media_insert" ON public.media
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "media_staff_update" ON public.media
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "entry_relations_public_read" ON public.entry_relations;
DROP POLICY IF EXISTS "entry_relations_staff_write" ON public.entry_relations;

CREATE POLICY "entry_relations_public_read" ON public.entry_relations
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.entries e
      WHERE e.id = entry_relations.entry_id AND e.status = 'published'
    )
    AND EXISTS (
      SELECT 1 FROM public.entries e2
      WHERE e2.id = entry_relations.related_entry_id AND e2.status = 'published'
    )
  );

CREATE POLICY "entry_relations_staff_write" ON public.entry_relations
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "revisions_public_read" ON public.entry_revisions;
DROP POLICY IF EXISTS "revisions_staff_insert" ON public.entry_revisions;

CREATE POLICY "revisions_public_read" ON public.entry_revisions
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.entries e
      WHERE e.id = entry_revisions.entry_id AND e.status = 'published'
    )
  );

CREATE POLICY "revisions_staff_insert" ON public.entry_revisions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = editor_id AND public.is_staff());

DROP POLICY IF EXISTS "edits_insert" ON public.edits;
DROP POLICY IF EXISTS "edits_own_select" ON public.edits;
DROP POLICY IF EXISTS "edits_staff_select" ON public.edits;
DROP POLICY IF EXISTS "edits_staff_update" ON public.edits;

CREATE POLICY "edits_insert" ON public.edits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "edits_own_select" ON public.edits
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "edits_staff_select" ON public.edits
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "edits_staff_update" ON public.edits
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- profiles / favorites: OUT OF SCOPE — do not touch

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO service_role;

COMMIT;
