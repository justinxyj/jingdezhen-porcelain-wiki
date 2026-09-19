-- Phase 3B-3: high-quality, entry-specific relation evidence expansion
-- Production data update recorded after verification against authoritative sources.
-- Uses title lookups rather than hard-coded UUIDs.

update public.entry_relations er
set note = case
  when er.entry_id = (select id from public.entries where zh->>'title'='王步')
   and er.related_entry_id = (select id from public.entries where zh->>'title'='青花瓷')
    then '景德镇皇窑陶瓷艺术博物馆资料称王步“尤以青花盖世”，并将其列为民国青花创新的重要代表。'
  when er.entry_id = (select id from public.entries where zh->>'title'='田鹤仙')
   and er.related_entry_id = (select id from public.entries where zh->>'title'='粉彩瓷')
    then '文化和旅游部恭王府博物馆与景德镇中国陶瓷博物馆展览资料将田鹤仙列入珠山八友，并说明该画派以粉彩工笔细描等工艺推动新粉彩瓷发展。'
  when er.entry_id = (select id from public.entries where zh->>'title'='张松茂')
   and er.related_entry_id = (select id from public.entries where zh->>'title'='粉彩瓷')
    then '张松茂条目定位为现代粉彩技艺传承人物；其与粉彩瓷的关系用于连接现代粉彩传承知识。'
  when er.entry_id = (select id from public.entries where zh->>'title'='唐英')
   and er.related_entry_id = (select id from public.entries where zh->>'title'='御窑厂遗址')
    then '故宫博物院资料记载唐英自雍正六年驻景德镇御窑厂任协理官，并长期管理御窑厂窑务。'
end
where (er.entry_id, er.related_entry_id) in (
  ((select id from public.entries where zh->>'title'='王步'),(select id from public.entries where zh->>'title'='青花瓷')),
  ((select id from public.entries where zh->>'title'='田鹤仙'),(select id from public.entries where zh->>'title'='粉彩瓷')),
  ((select id from public.entries where zh->>'title'='张松茂'),(select id from public.entries where zh->>'title'='粉彩瓷')),
  ((select id from public.entries where zh->>'title'='唐英'),(select id from public.entries where zh->>'title'='御窑厂遗址'))
);
