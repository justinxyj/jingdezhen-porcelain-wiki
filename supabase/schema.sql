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
  status text not null default 'pending',
  created_at timestamptz not null default now()
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

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.entry_relations enable row level security;
alter table public.edits enable row level security;
alter table public.entry_revisions enable row level security;
alter table public.media enable row level security;
alter table public.favorites enable row level security;

-- Public can read published knowledge, graph edges and approved media.
create policy "entries_public_read" on public.entries for select
  using (status='published' or auth.uid()=updated_by or is_staff());

create policy "entries_staff_write" on public.entries for all
  using (is_staff()) with check (is_staff());

create policy "entry_relations_public_read" on public.entry_relations for select
  using (exists (select 1 from public.entries e where e.id=entry_relations.entry_id and e.status='published'));

create policy "entry_relations_staff_write" on public.entry_relations for all
  using (is_staff()) with check (is_staff());

create policy "edits_insert" on public.edits for insert
  with check (auth.uid()=author_id);

create policy "edits_own_select" on public.edits for select
  using (auth.uid()=author_id or is_staff());

create policy "edits_staff_update" on public.edits for update
  using (is_staff()) with check (is_staff());

create policy "revisions_staff_insert" on public.entry_revisions for insert
  with check (auth.uid()=editor_id and is_staff());

create policy "revisions_public_read" on public.entry_revisions for select
  using (exists (select 1 from public.entries e where e.id=entry_revisions.entry_id and e.status='published'));

create policy "media_insert" on public.media for insert
  with check (auth.uid()=uploader_id);

create policy "media_public_read" on public.media for select
  using (status='approved' or auth.uid()=uploader_id or is_staff());

create policy "media_staff_update" on public.media for update
  using (is_staff()) with check (is_staff());

create policy "users_manage_own_favorites" on public.favorites for all
  using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "users_read_own_profile" on public.profiles for select
  using (auth.uid()=id);

create policy "users_create_own_profile" on public.profiles for insert
  with check (auth.uid()=id);

-- The database also contains SECURITY DEFINER helpers handle_new_user(), is_staff()
-- and review_edit(p_edit_id, p_action, p_note), with search_path pinned to public.
-- Keep their EXECUTE privileges restricted to the roles required by the auth flow.
