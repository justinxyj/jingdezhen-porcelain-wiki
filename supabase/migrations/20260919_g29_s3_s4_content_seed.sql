-- G29 batch1 content seed (S3/S4). Does NOT change RLS.
-- Apply only with founder approval / service_role. Idempotent upserts by slug.

BEGIN;

-- S3: blue-and-white — fill zh.summary; keep sources R08/R16/R19; do not invent.
UPDATE public.entries
SET
  zh = jsonb_set(
    COALESCE(zh, '{}'::jsonb),
    '{summary}',
    to_jsonb($s3sum$釉下钴料彩绘、罩透明釉高温烧成的景德镇代表性品种；元为重要发展阶段，明早期各朝存在阶段性差异。不能仅凭呈色深浅断代或判真伪。$s3sum$::text),
    true
  ),
  updated_at = now(),
  version = COALESCE(version, 1) + 1
WHERE slug = 'blue-and-white'
  AND status = 'published';

-- S4: met-1991-253-33 — Met object 42490 / accession 1991.253.33 (NOT 42491)
INSERT INTO public.entries (slug, category, zh, en, ja, sources, status, version)
VALUES (
  'met-1991-253-33',
  '器物',
  $zh${
    "title": "景德镇窑青花莲池纹瓶（Met 1991.253.33）",
    "summary": "釉下青花绘莲池题材的景德镇瓷器；馆藏号 1991.253.33；图像 Public Domain。元代景德镇窑系个案，不外推全元生产史。窑场具体编号待考，不臆测湖田或御窑。",
    "content": "<p>Vase with lotus pond scene / 景德镇窑青花莲池纹瓶。馆方：Yuan dynasty，first half of the 14th century；Jingdezhen ware；Porcelain painted in underglaze cobalt blue。</p><p>尺寸：H. 28.6 cm（其余见馆方）。Credit: Gift of Stanley Herzman, in memory of Adele Herzman, 1991。</p><p>中文器型细名（如「玉壶春」）待与中文图录交叉，本条并列馆方英文 Vase，细名标待核。</p><h2>与景德镇</h2><p>馆方标注 Jingdezhen ware；个案背景见青花工艺总述，不外推全元史。</p>",
    "meta": {
      "kind": "object",
      "period": "元（Yuan；14世纪前半）",
      "craft": "青花",
      "form": "瓶（馆方 Vase；中文细名待核）",
      "kiln": "景德镇窑系（馆方 Jingdezhen ware；具体窑场待考）",
      "location": "现藏 The Metropolitan Museum of Art, New York",
      "accession": "1991.253.33",
      "metObjectId": "42490",
      "mediaPolicy": {
        "categoryRule": "具体器物官方馆藏图；优先Public Domain/Open Access"
      }
    }
  }$zh$::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  $src$[{"url":"https://www.metmuseum.org/art/collection/search/42490","label":"The Met — 1991.253.33 (object 42490)"},{"url":"https://collectionapi.metmuseum.org/public/collection/v1/objects/42490","label":"Met Collection API objects/42490"}]$src$::jsonb,
  'published',
  1
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  zh = EXCLUDED.zh,
  sources = EXCLUDED.sources,
  status = 'published',
  updated_at = now(),
  version = public.entries.version + 1;

-- Media for S4 (approved, primary)
INSERT INTO public.media (
  entry_id, path, title, source, license, creator, status,
  usage_type, source_tier, is_primary, verification_note, verified_at
)
SELECT e.id,
  'https://images.metmuseum.org/CRDImages/as/original/1991_253_33.jpg',
  'Vase with lotus pond scene (1991.253.33)',
  'https://www.metmuseum.org/art/collection/search/42490',
  'Public Domain / Open Access (The Met)',
  'The Metropolitan Museum of Art',
  'approved',
  'object',
  1,
  true,
  'Met objectID 42490; isPublicDomain=true; accession 1991.253.33 — verified 2026-09-19',
  now()
FROM public.entries e
WHERE e.slug = 'met-1991-253-33'
  AND NOT EXISTS (
    SELECT 1 FROM public.media m
    WHERE m.entry_id = e.id
      AND m.path = 'https://images.metmuseum.org/CRDImages/as/original/1991_253_33.jpg'
  );

-- Optional relation: met object -> blue-and-white craft/object overview
INSERT INTO public.entry_relations (entry_id, related_entry_id, relation_type, note)
SELECT a.id, b.id, 'related', 'S4 馆藏个案 ↔ S3 青花总述'
FROM public.entries a, public.entries b
WHERE a.slug = 'met-1991-253-33' AND b.slug = 'blue-and-white'
  AND NOT EXISTS (
    SELECT 1 FROM public.entry_relations r
    WHERE r.entry_id = a.id AND r.related_entry_id = b.id
  );

COMMIT;
