-- Global kiln map media integrity repair (2026-09-20)
-- Remove a rejected The Met visual-index image that was accidentally reused across 64 entries.
delete from public.media
where canonical_key='https://www.metmuseum.org/art/collection/search/42490'
  and title='The Met Open Access 青花瓷关联图（视觉索引）';

-- Add a verified Shiwan/Nanfeng Kiln site photograph from Wikimedia Commons.
insert into public.media (
  entry_id,path,title,source,license,creator,usage_type,source_tier,is_primary,
  verification_note,verified_at,canonical_key,source_url,source_type,status,review_state
)
select
  '6ccac91e-d92d-47bf-b625-68e3779d32bd'::uuid,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nanfeng_Kiln_39180-Foshan_(49043084327).jpg',
  '南风古灶（石湾窑代表性遗存）',
  'Wikimedia Commons',
  'CC BY 2.0',
  'xiquinhosilva',
  'official-site',
  3,
  true,
  'Wikimedia Commons 文件页明确说明该图为佛山石湾镇南风古灶；文件由 xiquinhosilva 拍摄，CC BY 2.0。用于石湾窑条目的遗址现场图。',
  now(),
  'https://commons.wikimedia.org/wiki/File:Nanfeng_Kiln_39180-Foshan_(49043084327).jpg',
  'https://commons.wikimedia.org/wiki/File:Nanfeng_Kiln_39180-Foshan_(49043084327).jpg',
  'Wikimedia Commons',
  'verified'
where not exists (
  select 1 from public.media
  where entry_id='6ccac91e-d92d-47bf-b625-68e3779d32bd'::uuid
    and canonical_key='https://commons.wikimedia.org/wiki/File:Nanfeng_Kiln_39180-Foshan_(49043084327).jpg'
);
