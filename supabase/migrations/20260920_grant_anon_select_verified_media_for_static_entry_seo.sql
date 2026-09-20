-- Allow public build/runtime reads of media while RLS limits rows to approved + verified media.
grant select on table public.media to anon;
