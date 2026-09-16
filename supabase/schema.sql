-- Jingdezhen Porcelain Digital Museum: initial Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','reviewer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.edits (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
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
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, entry_id)
);

alter table public.profiles enable row level security;
alter table public.edits enable row level security;
alter table public.entries enable row level security;
alter table public.favorites enable row level security;

create policy "public read published entries" on public.entries for select using (status='published');
create policy "users read own edits" on public.edits for select using (auth.uid()=author_id);
create policy "users submit edits" on public.edits for insert with check (auth.uid()=author_id);
create policy "users manage own favorites" on public.favorites for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "users read own profile" on public.profiles for select using (auth.uid()=id);
create policy "users create own profile" on public.profiles for insert with check (auth.uid()=id);
