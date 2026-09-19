-- HISTORICAL / SUPERSEDED
-- This migration originally introduced an intermediate media_public view and a
-- temporary media RLS boundary. The canonical final state is implemented by
-- supabase/schema.sql and the later final_security_performance_hardening migration.
-- Kept as a migration-history marker; intentionally no-op on fresh environments.

begin;
-- No-op: do not recreate the superseded media_public view or grant its old ACL.
commit;
