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
create index if not exists entries_published_updated_idx on public.entries(updated_at desc, id) where status = 'published';
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

-- Canonical media boundary: current media.path/source_url values are HTTPS resource URLs.
alter table public.media drop constraint if exists media_path_https_check;
alter table public.media add constraint media_path_https_check
  check (path ~* '^https://[^[:space:]<>"]+$');
alter table public.media drop constraint if exists media_source_url_https_check;
alter table public.media add constraint media_source_url_https_check
  check (source_url is null or btrim(source_url) = '' or source_url ~* '^https://[^[:space:]<>"]+$');


alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.entry_relations enable row level security;
alter table public.edits enable row level security;
alter table public.entry_revisions enable row level security;
alter table public.media enable row level security;
alter table public.favorites enable row level security;

create schema if not exists private;
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role in ('reviewer','admin')
  );
$$;
revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to authenticated, service_role;

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
  using (private.is_staff());

create policy "entries_staff_write" on public.entries
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "entry_relations_public_read" on public.entry_relations
  for select to anon, authenticated
  using (
    exists (select 1 from public.entries e where e.id = entry_relations.entry_id and e.status = 'published')
    and exists (select 1 from public.entries e2 where e2.id = entry_relations.related_entry_id and e2.status = 'published')
  );

create policy "entry_relations_staff_write" on public.entry_relations
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "edits_insert" on public.edits
  for insert to authenticated
  with check (auth.uid() = author_id);

create policy "edits_own_select" on public.edits
  for select to authenticated
  using (auth.uid() = author_id);

create policy "edits_staff_select" on public.edits
  for select to authenticated
  using (private.is_staff());

create policy "edits_staff_update" on public.edits
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "revisions_staff_read" on public.entry_revisions
  for select to authenticated
  using (private.is_staff());

create policy "revisions_staff_insert" on public.entry_revisions
  for insert to authenticated
  with check (auth.uid() = editor_id and private.is_staff());

create policy "media_public_verified_read" on public.media
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
  using (private.is_staff());

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
  with check (private.is_staff());

create policy "media_staff_update" on public.media
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "users_manage_own_favorites" on public.favorites for all
  using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "users_read_own_profile" on public.profiles for select
  using (auth.uid()=id);

create policy "users_create_own_profile" on public.profiles for insert
  with check (auth.uid()=id);

-- Runtime hardening:
-- Keep the SECURITY DEFINER helper in the non-exposed private schema. Public API roles
-- must not be able to invoke it directly; RLS policies may still call it internally.
-- handle_new_user() is a trigger-only SECURITY DEFINER helper.
-- review_edit(...) is a transactional staff helper, not a public RPC entry point.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.review_edit(uuid,text,text) from public, anon, authenticated;

revoke all on table public.media from anon;
revoke all on table public.entry_revisions from anon;
revoke all on table public.edits from anon;
revoke all on table public.favorites from anon;
revoke all on table public.profiles from anon;
grant select (
  id, entry_id, path, title, source, license, creator, captured_at, location,
  created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
) on table public.media to anon;

revoke select on table public.entry_revisions from anon;
grant select on table public.entry_revisions to authenticated;


-- Wiki 2.0 editorial information architecture: knowledge worlds are separate from entry categories.
create table if not exists public.knowledge_worlds (
  slug text primary key,
  title text not null,
  short_title text not null,
  description text not null,
  display_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.entry_worlds (
  entry_id uuid not null references public.entries(id) on delete cascade,
  world_slug text not null references public.knowledge_worlds(slug) on delete cascade,
  role text not null check (role in ('primary','secondary')),
  display_order integer not null default 0,
  rationale text,
  created_at timestamptz not null default now(),
  primary key (entry_id, world_slug)
);

create unique index if not exists entry_worlds_one_primary_idx
  on public.entry_worlds(entry_id) where role = 'primary';
create index if not exists entry_worlds_world_order_idx
  on public.entry_worlds(world_slug, role, display_order, entry_id);

alter table public.knowledge_worlds enable row level security;
alter table public.entry_worlds enable row level security;

create policy "knowledge_worlds_public_read" on public.knowledge_worlds
  for select to anon, authenticated using (true);

create policy "entry_worlds_public_published_read" on public.entry_worlds
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.entries e
      where e.id = entry_worlds.entry_id
        and e.status = 'published'
    )
  );

grant select on table public.knowledge_worlds to anon, authenticated;
grant select on table public.entry_worlds to anon, authenticated;
);
alter table public.media drop constraint if exists media_source_url_https_check;
alter table public.media add constraint media_source_url_https_check
  check (source_url is null or btrim(source_url) = '' or source_url ~* '^https://[^[:space:]<>"]+

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
  using (private.is_staff());

create policy "entries_staff_write" on public.entries
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "entry_relations_public_read" on public.entry_relations
  for select to anon, authenticated
  using (
    exists (select 1 from public.entries e where e.id = entry_relations.entry_id and e.status = 'published')
    and exists (select 1 from public.entries e2 where e2.id = entry_relations.related_entry_id and e2.status = 'published')
  );

create policy "entry_relations_staff_write" on public.entry_relations
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "edits_insert" on public.edits
  for insert to authenticated
  with check (auth.uid() = author_id);

create policy "edits_own_select" on public.edits
  for select to authenticated
  using (auth.uid() = author_id);

create policy "edits_staff_select" on public.edits
  for select to authenticated
  using (private.is_staff());

create policy "edits_staff_update" on public.edits
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "revisions_staff_read" on public.entry_revisions
  for select to authenticated
  using (private.is_staff());

create policy "revisions_staff_insert" on public.entry_revisions
  for insert to authenticated
  with check (auth.uid() = editor_id and private.is_staff());

create policy "media_public_verified_read" on public.media
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
  using (private.is_staff());

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
  with check (private.is_staff());

create policy "media_staff_update" on public.media
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "users_manage_own_favorites" on public.favorites for all
  using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "users_read_own_profile" on public.profiles for select
  using (auth.uid()=id);

create policy "users_create_own_profile" on public.profiles for insert
  with check (auth.uid()=id);

-- Runtime hardening:
-- is_staff() remains SECURITY DEFINER because RLS policies call it and profiles RLS would recurse under invoker semantics.
-- handle_new_user() is a trigger-only SECURITY DEFINER helper.
-- review_edit(...) is a transactional staff helper, not a public RPC entry point.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.review_edit(uuid,text,text) from public, anon, authenticated;
grant execute on function private.is_staff() to authenticated, service_role;

revoke all on table public.media from anon;
revoke all on table public.entry_revisions from anon;
revoke all on table public.edits from anon;
revoke all on table public.favorites from anon;
revoke all on table public.profiles from anon;
grant select (
  id, entry_id, path, title, source, license, creator, captured_at, location,
  created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
) on table public.media to anon;

revoke select on table public.entry_revisions from anon;
grant select on table public.entry_revisions to authenticated;


-- Wiki 2.0 editorial information architecture: knowledge worlds are separate from entry categories.
create table if not exists public.knowledge_worlds (
  slug text primary key,
  title text not null,
  short_title text not null,
  description text not null,
  display_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.entry_worlds (
  entry_id uuid not null references public.entries(id) on delete cascade,
  world_slug text not null references public.knowledge_worlds(slug) on delete cascade,
  role text not null check (role in ('primary','secondary')),
  display_order integer not null default 0,
  rationale text,
  created_at timestamptz not null default now(),
  primary key (entry_id, world_slug)
);

create unique index if not exists entry_worlds_one_primary_idx
  on public.entry_worlds(entry_id) where role = 'primary';
create index if not exists entry_worlds_world_order_idx
  on public.entry_worlds(world_slug, role, display_order, entry_id);

alter table public.knowledge_worlds enable row level security;
alter table public.entry_worlds enable row level security;

create policy "knowledge_worlds_public_read" on public.knowledge_worlds
  for select to anon, authenticated using (true);

create policy "entry_worlds_public_published_read" on public.entry_worlds
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.entries e
      where e.id = entry_worlds.entry_id
        and e.status = 'published'
    )
  );

grant select on table public.knowledge_worlds to anon, authenticated;
grant select on table public.entry_worlds to anon, authenticated;
);

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
  using (private.is_staff());

create policy "entries_staff_write" on public.entries
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "entry_relations_public_read" on public.entry_relations
  for select to anon, authenticated
  using (
    exists (select 1 from public.entries e where e.id = entry_relations.entry_id and e.status = 'published')
    and exists (select 1 from public.entries e2 where e2.id = entry_relations.related_entry_id and e2.status = 'published')
  );

create policy "entry_relations_staff_write" on public.entry_relations
  for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "edits_insert" on public.edits
  for insert to authenticated
  with check (auth.uid() = author_id);

create policy "edits_own_select" on public.edits
  for select to authenticated
  using (auth.uid() = author_id);

create policy "edits_staff_select" on public.edits
  for select to authenticated
  using (private.is_staff());

create policy "edits_staff_update" on public.edits
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "revisions_staff_read" on public.entry_revisions
  for select to authenticated
  using (private.is_staff());

create policy "revisions_staff_insert" on public.entry_revisions
  for insert to authenticated
  with check (auth.uid() = editor_id and private.is_staff());

create policy "media_public_verified_read" on public.media
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
  using (private.is_staff());

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
  with check (private.is_staff());

create policy "media_staff_update" on public.media
  for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "users_manage_own_favorites" on public.favorites for all
  using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "users_read_own_profile" on public.profiles for select
  using (auth.uid()=id);

create policy "users_create_own_profile" on public.profiles for insert
  with check (auth.uid()=id);

-- Runtime hardening:
-- is_staff() remains SECURITY DEFINER because RLS policies call it and profiles RLS would recurse under invoker semantics.
-- handle_new_user() is a trigger-only SECURITY DEFINER helper.
-- review_edit(...) is a transactional staff helper, not a public RPC entry point.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.review_edit(uuid,text,text) from public, anon, authenticated;
grant execute on function private.is_staff() to authenticated, service_role;

revoke all on table public.media from anon;
revoke all on table public.entry_revisions from anon;
revoke all on table public.edits from anon;
revoke all on table public.favorites from anon;
revoke all on table public.profiles from anon;
grant select (
  id, entry_id, path, title, source, license, creator, captured_at, location,
  created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
) on table public.media to anon;

revoke select on table public.entry_revisions from anon;
grant select on table public.entry_revisions to authenticated;


-- Wiki 2.0 editorial information architecture: knowledge worlds are separate from entry categories.
create table if not exists public.knowledge_worlds (
  slug text primary key,
  title text not null,
  short_title text not null,
  description text not null,
  display_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.entry_worlds (
  entry_id uuid not null references public.entries(id) on delete cascade,
  world_slug text not null references public.knowledge_worlds(slug) on delete cascade,
  role text not null check (role in ('primary','secondary')),
  display_order integer not null default 0,
  rationale text,
  created_at timestamptz not null default now(),
  primary key (entry_id, world_slug)
);

create unique index if not exists entry_worlds_one_primary_idx
  on public.entry_worlds(entry_id) where role = 'primary';
create index if not exists entry_worlds_world_order_idx
  on public.entry_worlds(world_slug, role, display_order, entry_id);

alter table public.knowledge_worlds enable row level security;
alter table public.entry_worlds enable row level security;

create policy "knowledge_worlds_public_read" on public.knowledge_worlds
  for select to anon, authenticated using (true);

create policy "entry_worlds_public_published_read" on public.entry_worlds
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.entries e
      where e.id = entry_worlds.entry_id
        and e.status = 'published'
    )
  );

grant select on table public.knowledge_worlds to anon, authenticated;
grant select on table public.entry_worlds to anon, authenticated;


-- Targeted Entry Detail peer functions. SECURITY INVOKER preserves normal public RLS.
create or replace function public.entry_timeline_peers(
  p_entry_id uuid, p_eras text[], p_limit integer default 12
) returns setof public.entries
language sql stable security invoker set search_path = public
as $$
  select e.* from public.entries e
  where e.status = 'published' and e.id <> p_entry_id
    and coalesce(jsonb_array_length(e.zh->'meta'->'timeline'),0) > 0
    and exists (select 1 from jsonb_array_elements(e.zh->'meta'->'timeline') t
      where t->>'era' = any(coalesce(p_eras, '{}'::text[])))
  order by e.updated_at desc, e.id
  limit least(greatest(coalesce(p_limit,12),1),100);
$$;

create or replace function public.entry_space_peers(
  p_entry_id uuid, p_eras text[], p_limit integer default 24
) returns setof public.entries
language sql stable security invoker set search_path = public
as $$
  with candidates as (
    select distinct e.* from public.entries e
    left join public.entry_relations r on ((r.related_entry_id=e.id and r.entry_id=p_entry_id) or (r.entry_id=e.id and r.related_entry_id=p_entry_id))
    where e.status='published' and e.id<>p_entry_id
      and e.zh->'meta'->'map'->>'lat' is not null
      and e.zh->'meta'->'map'->>'lng' is not null
      and (r.entry_id is not null or exists (
        select 1 from jsonb_array_elements(coalesce(e.zh->'meta'->'timeline','[]'::jsonb)) t
        where t->>'era'=any(coalesce(p_eras,'{}'::text[]))))
  ) select * from candidates order by updated_at desc,id
    limit least(greatest(coalesce(p_limit,24),1),100);
$$;
revoke all on function public.entry_timeline_peers(uuid,text[],integer) from public;
revoke all on function public.entry_space_peers(uuid,text[],integer) from public;
grant execute on function public.entry_timeline_peers(uuid,text[],integer) to anon, authenticated;
grant execute on function public.entry_space_peers(uuid,text[],integer) to anon, authenticated;
