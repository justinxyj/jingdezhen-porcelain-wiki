alter table public.entry_content_admissions
  add column if not exists corpus_track text,
  add column if not exists corpus_disposition text,
  add column if not exists corpus_rationale text,
  add column if not exists corpus_review_version text;

update public.entry_content_admissions a
set corpus_track = case
  when e.slug in ('qingbai-porcelain','five-dynasties-song','yuan-blue-white','active-archaeology') then 'jingdezhen_core'
  when e.slug in ('lettres-edifiantes-porcelaine','tao-shuo','r02','r01','r11','r06','r18','r03','r21','r09','r34','r07','r22','r25','r08','r33','r13','r16','r17','r27','r24','r29','r35','r10','r30') then 'literature_evidence'
  when e.slug in ('arita-kiln','seto-kiln','yixing-kiln','sawankhalok','bat-trang','iznik-ceramics') then 'east_asia_global_comparison'
  when e.slug in ('joseph-needham','jean-baptiste-du-halde','rl-hobson','robert-finlay','mikami-tsugio','josiah-wedgwood','pilgrim-art') then 'global_research'
  when e.category='人物' then 'person_context'
  else 'corpus_support'
end,
corpus_disposition = case
  when e.slug in ('qingbai-porcelain','five-dynasties-song','yuan-blue-white','active-archaeology') then 'A_deepen'
  when e.slug in ('lettres-edifiantes-porcelaine','arita-kiln','iznik-ceramics','seto-kiln','yixing-kiln',
                  'r02','r01','r11','r06','r18','r03','r21','r09','r34','r07','r22','r25','r08','r33','r13','r16','r17','r27','r24','r29','r35','r10','r30',
                  'joseph-needham','jean-baptiste-du-halde','rl-hobson','robert-finlay','mikami-tsugio','josiah-wedgwood','pilgrim-art') then 'B_research'
  when e.slug in ('wang-zehong','xie-min','li-zhengdao','qian-qichen','li-xiannian','peng-zhen','wang-zhen','dong-biwu','xie-juezai','bo-yibo','tian-han','feng-zikai','longfellow','markley','shen-huaiqing','shen-defu','zhang-guangnian','shu-tong','qigong','liu-yuanchang','zhan-shaolin','chen-yu','peng-qizi','wen-zhenheng','li-rihua','du-chongyuan','liu-zongyuan','guo-moruo','frank-b-lentz','tong-bin') then 'C_context_or_relation'
  when e.slug='fencai' then 'A_deepen'
  else 'B_research'
end,
corpus_rationale = case
  when e.slug in ('qingbai-porcelain','fencai','five-dynasties-song','yuan-blue-white','active-archaeology') then 'Directly strengthens the Jingdezhen-centered civilizational corpus.'
  when e.category='人物' then 'Retain only where the person has documented research, production, transmission, collecting, or cultural-institution relevance to the corpus; otherwise treat as contextual/relationship evidence rather than a core Canonical Entry.'
  when e.category='文献' then 'Research source object: deepen when it provides primary evidence, archaeological record, technical evidence, or a documented transmission argument.'
  else 'Comparative kiln/civilization node; deepen only when it creates an evidence-backed bridge to Jingdezhen.'
end,
corpus_review_version='6C-CORPUS-1',
reviewed_at=now()
from public.entries e
where a.entry_id=e.id and e.status='published' and a.citation_readiness='review';