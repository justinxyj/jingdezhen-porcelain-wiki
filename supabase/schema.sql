-- Jingdezhen Porcelain Digital Museum: canonical knowledge graph data model
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','reviewer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  zh jsonb not null default '{}'::jsonb,
  en jsonb not null default '{}'::jsonb,
  ja jsonb not null default '{}'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Canonical graph edges. Timeline, map, people, objects and literature all resolve to entries,
-- and cross-page relationships are represented here instead of being duplicated in Markdown/JS.
create table if not exists public.entry_relations (
  entry_id uuid not null references public.entries(id) on delete cascade,
  related_entry_id uuid not null references public.entries(id) on delete cascade,
  relation_type text not null check (relation_type in ('related','person','object','kiln','craft','period','source')),
  note text,
  created_at timestamptz not null default now(),
  primary key(entry_id, related_entry_id, relation_type),
  check(entry_id <> related_entry_id)
);

create table if not exists public.edits (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete set null,
  title text not null,
  category text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.entry_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  editor_id uuid not null references auth.users(id),
  version integer not null,
  snapshot jsonb not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.entries(id) on delete set null,
  uploader_id uuid references auth.users(id) on delete set null,
  path text not null,
  title text,
  source text,
  license text,
  creator text,
  captured_at date,
  location text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  usage_type text,
  source_tier integer,
  is_primary boolean not null default false,
  verification_note text,
  verified_at timestamptz,
  canonical_key text,
  source_url text,
  source_type text,
  review_state text not null default 'pending' check (review_state in ('pending','verified','rejected'))
);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, entry_id)
);

create index if not exists entries_category_status_idx on public.entries(category,status);
create index if not exists entry_relations_related_idx on public.entry_relations(related_entry_id);
create index if not exists media_entry_status_idx on public.media(entry_id,status);
create index if not exists media_review_state_idx on public.media(review_state,status);
create index if not exists media_canonical_key_idx on public.media(canonical_key);
create unique index if not exists media_one_primary_per_entry_idx
  on public.media(entry_id) where is_primary = true and entry_id is not null;
create unique index if not exists entry_revisions_entry_version_key
  on public.entry_revisions(entry_id, version);
create index if not exists entry_relations_entry_type_idx
  on public.entry_relations(entry_id, relation_type);
create index if not exists entry_relations_related_type_idx
  on public.entry_relations(related_entry_id, relation_type);
create index if not exists media_public_verified_entry_created_idx
  on public.media(entry_id, created_at desc)
  where status = 'approved' and review_state = 'verified';

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.entry_relations enable row level security;
alter table public.edits enable row level security;
alter table public.entry_revisions enable row level security;
alter table public.media enable row level security;
alter table public.favorites enable row level security;

-- Phase B final state: public SELECT without is_staff(); staff policies TO authenticated.
-- See migration 20260919_rls_phase_b_public_select_without_is_staff.sql

create policy "entries_public_read" on public.entries
  for select to anon, authenticated
  using (status = 'published');

create policy "entries_owner_read" on public.entries
  for select to authenticated
  using (auth.uid() = updated_by);

create policy "entries_staff_read" on public.entries
  for select to authenticated
  using (public.is_staff());

create policy "entries_staff_write" on public.entries
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "entry_relations_public_read" on public.entry_relations
  for select to anon, authenticated
  using (
    exists (select 1 from public.entries e where e.id = entry_relations.entry_id and e.status = 'published')
    and exists (select 1 from public.entries e2 where e2.id = entry_relations.related_entry_id and e2.status = 'published')
  );

create policy "entry_relations_staff_write" on public.entry_relations
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "edits_insert" on public.edits
  for insert to authenticated
  with check (auth.uid() = author_id);

create policy "edits_own_select" on public.edits
  for select to authenticated
  using (auth.uid() = author_id);

create policy "edits_staff_select" on public.edits
  for select to authenticated
  using (public.is_staff());

create policy "edits_staff_update" on public.edits
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "revisions_staff_read" on public.entry_revisions
  for select to authenticated
  using (public.is_staff());

create policy "revisions_staff_insert" on public.entry_revisions
  for insert to authenticated
  with check (auth.uid() = editor_id and public.is_staff());

create policy "media_public_read" on public.media
  for select to anon, authenticated
  using (status = 'approved' and review_state = 'verified');

create policy "media_owner_public_read" on public.media
  for select to authenticated
  using (
    auth.uid() = uploader_id
    and status = 'approved'
    and review_state = 'verified'
  );

create policy "media_staff_read" on public.media
  for select to authenticated
  using (public.is_staff());

create policy "media_user_insert" on public.media
  for insert to authenticated
  with check (
    auth.uid() = uploader_id
    and status = 'pending'
    and review_state = 'pending'
    and verified_at is null
    and is_primary = false
  );

create policy "media_staff_insert" on public.media
  for insert to authenticated
  with check (public.is_staff());

create policy "media_staff_update" on public.media
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "users_manage_own_favorites" on public.favorites for all
  using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "users_read_own_profile" on public.profiles for select
  using (auth.uid()=id);

create policy "users_create_own_profile" on public.profiles for insert
  with check (auth.uid()=id);

-- Runtime hardening:
-- is_staff() is SECURITY INVOKER and remains executable by authenticated because RLS policies call it.
-- handle_new_user() is a trigger-only SECURITY DEFINER helper.
-- review_edit(...) is a transactional staff helper, not a public RPC entry point.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.review_edit(uuid,text,text) from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated, service_role;

revoke all on table public.media from anon;
grant select (
  id, entry_id, path, title, source, license, creator, captured_at, location,
  created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
) on table public.media to anon;

revoke select on table public.entry_revisions from anon;
grant select on table public.entry_revisions to authenticated;
