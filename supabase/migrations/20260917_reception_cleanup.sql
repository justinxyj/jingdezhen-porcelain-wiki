-- Cleanup for the public reception archive.
-- Keep one stable, readable presentation per person/literature entry and remove common accidental duplicates.

-- Disable legacy duplicate reception entries by slug patterns used in earlier imports.
-- The canonical reception records live in 20260917_reception_quotes.sql.
update public.entries
set status='archived', updated_at=now()
where status='published'
  and category in ('人物','文献')
  and (
    slug ilike 'frank-b-lentz%'
    or slug ilike '%ma-jili%'
    or slug ilike '%marcel%' 
  )
  and not slug in ('peng-qizi','qianlong-emperor','yin-hong-xu','guo-moruo','tian-han','joseph-needham','longfellow','rl-hobson','tang-ying');

-- Remove obvious replacement-character/encoding damage from text fields where it is present.
update public.entries
set zh = jsonb_set(
  jsonb_set(
    jsonb_set(zh,'{title}',to_jsonb(replace(replace(replace(coalesce(zh->>'title',''),'�',''),'ï¿½',''),'\uFFFD','')),true),
    '{summary}',to_jsonb(replace(replace(replace(coalesce(zh->>'summary',''),'�',''),'ï¿½'),'\uFFFD','')),true),
  '{content}',to_jsonb(replace(replace(replace(coalesce(zh->>'content',''),'�',''),'ï¿½'),'\uFFFD','')),true),
  updated_at=now()
where category in ('人物','文献');

-- Normalize reception metadata keys for the public renderer.
update public.entries
set zh = jsonb_set(
  zh,
  '{meta}',
  coalesce(zh->'meta','{}'::jsonb) - 'evaluation' - 'assessment' - 'review' - '原话'
    || case when coalesce(zh->'meta'->>'quote','')='' and coalesce(zh->'meta'->>'quote_original','')<>''
       then jsonb_build_object('quote',zh->'meta'->>'quote_original') else '{}'::jsonb end,
  true
), updated_at=now()
where category in ('人物','文献');
