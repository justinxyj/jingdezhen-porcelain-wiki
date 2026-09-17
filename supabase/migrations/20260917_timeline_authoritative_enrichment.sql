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

-- Seed authoritative context for key historical kiln entries already present in the public timeline.
insert into public.timeline_context
  (entry_id,historical_role,official_summary,official_source_title,official_source_url,official_institution,source_tier)
select e.id,
       '湖田窑是景德镇早期至宋元时期重要窑业生产核心区，遗址保存窑业堆积、作坊、窑炉、道路、水井和房基等多类遗存。',
       '湖田古瓷窑址自五代开始烧造，历经宋、元、明多个时期，是研究景德镇早期窑业生产、青白瓷技术和产业空间的重要遗址。',
       '湖田古瓷窑址：千年窑火里的文明回响',
       'https://kx.jdz.gov.cn/rdzt/kpsy/t1017750.shtml',
       '景德镇市科学技术协会',
       1
from public.entries e
where e.slug in ('hutian-kiln','hutian')
limit 1
on conflict (entry_id) do update set
 historical_role=excluded.historical_role,
 official_summary=excluded.official_summary,
 official_source_title=excluded.official_source_title,
 official_source_url=excluded.official_source_url,
 official_institution=excluded.official_institution,
 source_tier=excluded.source_tier,
 updated_at=now();

insert into public.timeline_context
  (entry_id,historical_role,official_summary,official_source_title,official_source_url,official_institution,source_tier)
select e.id,
       '御窑厂是明清时期专为宫廷烧造瓷器的皇家窑场，是景德镇城市历史与技术体系的重要核心。',
       '御窑厂位于景德镇老城区珠山地区，明洪武二年设皇家御器厂，清代延续使用。遗址集中反映了明清皇家制瓷制度及相关工艺遗存。',
       '御窑厂国家考古遗址公园',
       'https://www.jdz.gov.cn/zjcd/mljdz/tscd/t300385.shtml',
       '景德镇市人民政府',
       1
from public.entries e
where e.slug in ('imperial-kiln','imperial-kiln-site','yu-yao')
limit 1
on conflict (entry_id) do update set
 historical_role=excluded.historical_role,
 official_summary=excluded.official_summary,
 official_source_title=excluded.official_source_title,
 official_source_url=excluded.official_source_url,
 official_institution=excluded.official_institution,
 source_tier=excluded.source_tier,
 updated_at=now();
