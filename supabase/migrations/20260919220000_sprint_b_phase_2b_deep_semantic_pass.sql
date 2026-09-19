-- Sprint B Phase 2B: deep semantic pass continuation
-- Rule: a secondary mapping must represent a real user path from the target knowledge world,
-- not merely a category duplicate or a generic topical association.

begin;

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id = e.id
  and e.slug = 'seto-kiln'
  and ew.world_slug = 'history'
  and ew.role = 'secondary';

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id = e.id
  and e.slug = 'jingdezhen'
  and ew.world_slug = 'research'
  and ew.role = 'secondary';

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id = e.id
  and e.slug = 'markley'
  and ew.world_slug = 'research'
  and ew.role = 'secondary';

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id = e.id
  and e.slug = 'du-chongyuan'
  and ew.world_slug = 'craft'
  and ew.role = 'secondary';

insert into public.entry_worlds(entry_id, world_slug, role, display_order, rationale)
select e.id, 'craft', 'secondary', 40,
       case e.slug
         when 'jingdezhen' then '景德镇窑不是单一窑址，而是持续演化的制瓷生产网络；进入工艺世界可从生产组织、原料、窑炉与分工理解这套技术系统。'
         when 'hutian-kiln' then '湖田窑是宋元景德镇手工瓷业的重要生产中心；进入工艺世界可直接理解青白瓷生产与窑业组织。'
         when 'imperial-kiln' then '御窑厂遗址集中呈现明清御窑生产、专业分工与官作体系，是从空间进入制瓷技术与生产组织的重要入口。'
         when 'gaoling-mining' then '高岭土矿是景德镇原料体系的关键节点；进入工艺世界可理解高岭土与瓷石配方、原料加工及烧成性能之间的关系。'
         when 'changling-stone' then '长岭瓷石采掘区连接瓷石原料、加工与制瓷生产；进入工艺世界可理解景德镇制瓷原料端。'
         when 'jiaotan-firewood' then '焦潭柴窑燃料生产区连接燃料采集、运输与窑炉生产；进入工艺世界可理解烧成所依赖的能源供应链。'
       end
from public.entries e
where e.slug in ('jingdezhen','hutian-kiln','imperial-kiln','gaoling-mining','changling-stone','jiaotan-firewood')
on conflict (entry_id, world_slug) do update
set role=excluded.role, display_order=excluded.display_order, rationale=excluded.rationale;

insert into public.entry_worlds(entry_id, world_slug, role, display_order, rationale)
select e.id, 'space', 'secondary', 40,
       case e.slug
         when 'r11' then '二元配方研究同时涉及高岭土资源开发史；从空间世界进入可把原料矿区与景德镇生产中心连接起来。'
         when 'r18' then '外销瓷与海上丝绸之路研究把景德镇生产与港口、航线及跨区域贸易网络连接起来，是空间网络入口。'
       end
from public.entries e
where e.slug in ('r11','r18')
on conflict (entry_id, world_slug) do update
set role=excluded.role, display_order=excluded.display_order, rationale=excluded.rationale;

update public.entry_worlds ew
set rationale = case e.slug
  when 'chen-yu' then '《景德镇陶录》所记景德镇都会景象，可从人物进入清代陶业、城市形成与专业分工史。'
  when 'du-chongyuan' then '杜重远主持江西陶业事务并调查景德镇瓷业，可从人物进入20世纪前期产业调查与转型史。'
  when 'lang-tingji' then '郎廷极连接康熙时期督陶、御窑管理与官窑生产制度，可从人物进入清代御窑制度史。'
  when 'nian-xiyao' then '年希尧连接雍正时期陶务管理与御窑工艺实践，可从人物进入18世纪制度与技术史。'
  when 'shen-defu' then '沈德符的明代笔记保存对景德镇瓷器的同时代观察，可从人物进入明代瓷业与消费史。'
  when 'shen-huaiqing' then '《窑民行》记录陶业、工匠与城市商业，可从作者人物进入清代景德镇社会经济史。'
  when 'tang-ying' then '唐英连接雍正—乾隆时期御窑管理、工艺记录与生产体系，是清代陶业史的核心人物入口。'
  when 'tong-bin' then '童宾连接明代御窑工匠与官方制瓷制度，可从人物进入明代御窑生产史。'
  when 'wang-zehong' then '王泽洪所记陶业与商业中心地位，可直接进入清代景德镇城市经济与陶业史。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='history' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
  when 'huang-yunpeng' then '黄云鹏以古陶瓷研究与传承为核心，可从人物进入传统工艺研究与当代传承实践。'
  when 'lang-tingji' then '郎廷极作为督陶官连接御窑管理、工艺实践与清代生产组织。'
  when 'liu-yuanchang' then '刘远长属于现代景德镇陶瓷艺术实践，可从人物进入当代创作与工艺传承。'
  when 'nian-xiyao' then '年希尧连接雍正时期陶务管理与御窑工艺实践，可从人物进入制度化工艺生产。'
  when 'qin-xilin' then '秦锡麟连接现代陶瓷教育、研究与艺术实践，可从人物进入当代工艺传承体系。'
  when 'tang-ying' then '唐英直接连接御窑管理、工艺记录与具体器物生产，是人物进入工艺世界的关键桥梁。'
  when 'tian-hexian' then '田鹤仙代表近代瓷画实践，可从人物进入珠山八友与瓷上绘画传统。'
  when 'tong-bin' then '童宾作为御窑工匠人物，可从人物进入明代窑业生产与工匠实践。'
  when 'wang-bu' then '王步以青花瓷画为核心实践，可从人物进入近代青花装饰与瓷画技艺。'
  when 'wang-qi' then '王琦的瓷画实践可从人物进入珠山八友与近代陶瓷绘画传统。'
  when 'wang-xiliang' then '王锡良代表现代景德镇陶瓷美术与粉彩等传统的传承。'
  when 'zhan-shaolin' then '占绍林属于现代景德镇陶瓷艺术实践，可从人物进入当代工艺与创作。'
  when 'zhang-songmao' then '张松茂代表现代粉彩技艺传承，可从人物进入粉彩制作与艺术实践。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='craft' and ew.role='secondary';

commit;
