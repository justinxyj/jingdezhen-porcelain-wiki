-- Phase 4E-4: canonical era taxonomy
-- Public filter groups: 唐五代 / 宋 / 元 / 明 / 清 / 近代 / 现代.
-- Original era text remains unchanged; era_group is additive.

UPDATE public.entries
SET zh = jsonb_set(
  COALESCE(zh,'{}'::jsonb),
  '{meta,era_group}',
  to_jsonb(
    CASE
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%唐%' THEN 'tang'
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%宋%' THEN 'song'
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%元%' THEN 'yuan'
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%明%' THEN 'ming'
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%清%' OR COALESCE(zh->'meta'->>'era','') LIKE '%18世纪%' THEN 'qing'
      WHEN COALESCE(zh->'meta'->>'era','') LIKE '%民国%' OR COALESCE(zh->'meta'->>'era','') LIKE '%19世纪%' OR COALESCE(zh->'meta'->>'era','') LIKE '%20世纪初%' THEN 'near-modern'
      WHEN COALESCE(zh->'meta'->>'era','') = '现代' THEN 'modern'
      WHEN COALESCE(zh->'meta'->>'era','') = '20世纪' THEN 'modern'
      ELSE NULL
    END
  ),
  true
)
WHERE status='published' AND category='人物' AND COALESCE(zh->'meta'->>'era','') <> '';

UPDATE public.entries
SET zh = jsonb_set(
  COALESCE(zh,'{}'::jsonb),
  '{meta,era_group}',
  to_jsonb(
    CASE
      WHEN (regexp_match(COALESCE(zh->>'title',''),'((?:19|20)\\d{2})'))[1]::int BETWEEN 1911 AND 1948 THEN 'near-modern'
      ELSE 'modern'
    END
  ),
  true
)
WHERE status='published'
  AND jsonb_typeof(zh->'meta'->'timeline')='array'
  AND zh->'meta'->'timeline' @> '[{"era":"modern"}]'::jsonb;

-- Existing person records without a legacy era label are assigned to the
-- canonical group from their documented historical role, without overwriting
-- the original era field.
UPDATE public.entries
SET zh = jsonb_set(
  COALESCE(zh,'{}'::jsonb),
  '{meta,era_group}',
  to_jsonb(CASE slug
    WHEN 'tang-ying' THEN 'qing'
    WHEN 'nian-xiyao' THEN 'qing'
    WHEN 'zang-yingxuan' THEN 'qing'
    WHEN 'lang-tingji' THEN 'qing'
    WHEN 'tong-bin' THEN 'ming'
    WHEN 'wang-bu' THEN 'near-modern'
    WHEN 'wang-qi' THEN 'near-modern'
    WHEN 'tian-hexian' THEN 'near-modern'
    WHEN 'zhang-songmao' THEN 'modern'
    WHEN 'wang-xiliang' THEN 'modern'
    WHEN 'qin-xilin' THEN 'modern'
    WHEN 'huang-yunpeng' THEN 'modern'
    WHEN 'liu-yuanchang' THEN 'modern'
    WHEN 'zhan-shaolin' THEN 'modern'
    ELSE zh->'meta'->>'era_group'
  END),
  true
)
WHERE status='published'
  AND category='人物'
  AND slug IN ('tang-ying','nian-xiyao','zang-yingxuan','lang-tingji','tong-bin','wang-bu','wang-qi','tian-hexian','zhang-songmao','wang-xiliang','qin-xilin','huang-yunpeng','liu-yuanchang','zhan-shaolin');
