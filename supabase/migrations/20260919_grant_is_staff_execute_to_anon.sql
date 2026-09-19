-- HISTORICAL / SUPERSEDED
-- This migration temporarily granted anon EXECUTE on is_staff() to recover an
-- earlier RLS design. The final architecture has public SELECT policies that do
-- not call is_staff(), and anon must not execute the SECURITY DEFINER helper.
-- Kept as a migration-history marker; intentionally no-op on fresh environments.

begin;
revoke execute on function public.is_staff() from anon;
commit;
