-- Historical timeline enrichment: official-source fields for kiln/country entries.
-- Curated entries may add these fields without changing existing content.
-- Sources should be official museums, UNESCO, national/provincial/local government, archaeology institutes,
-- or other clearly authoritative institutional pages. Do not fabricate URLs or historical relationships.

create table if not exists public.timeline_context (
  entry_id uuid primary key references public.entries(id) on delete cascade,
  historical_role text,
  relationship_to_jingdezhen text,
  official_summary text,
  official_image_url text,
  official_image_credit text,
  official_source_title text,
  official_source_url text,
  official_institution text,
  source_tier integer check (source_tier between 1 and 3),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timeline_context_source_tier_idx on public.timeline_context(source_tier);
create index if not exists timeline_context_institution_idx on public.timeline_context(official_institution);

comment on table public.timeline_context is 'Curated official descriptions, images and Jingdezhen relationship context used by the historical timeline detail viewer.';
comment on column public.timeline_context.relationship_to_jingdezhen is 'For China/world comparison entries, a concise evidence-based explanation of the historical relationship with Jingdezhen.';
comment on column public.timeline_context.official_image_url is 'Directly corresponding image URL from the cited authoritative institution; never a placeholder or generic image.';
