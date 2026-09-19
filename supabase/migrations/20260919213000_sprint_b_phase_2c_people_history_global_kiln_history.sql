begin;

-- Sprint B Phase 2C: deep semantic audit for person -> history and kiln/global-site -> history.
-- Rule: keep a secondary edge only when the entry creates a concrete historical route,
-- not merely because the entity is old/historical or geographically relevant.

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and ew.world_slug='history'
  and e.category='人物'
  and e.slug in (
    'dong-biwu','feng-zikai','frank-b-lentz','guo-moruo',
    'joseph-needham','josiah-wedgwood','jean-baptiste-du-halde',
    'li-rihua','liu-zongyuan','longfellow','markley','mikami-tsugio',
    'peng-qizi','qianlong-emperor','rl-hobson','robert-finlay',
    'shu-tong','wang-bu','wang-qi','wang-shixing','wen-zhenheng',
    'xie-juezai','xie-min','yin-hong-xu','zang-yingxuan',
    'zhang-guangnian','tian-hexian','zhu-yan'
  );

delete from public.entry_worlds ew
using public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and ew.world_slug='history'
  and e.category='窑址'
  and e.slug in (
    'bat-trang','cizhou-kiln','dehua-kiln','europe-porcelain',
    'ge-kiln','goryeo-celadon','guan-kiln','icheon-ceramics',
    'islamic-ceramics','iznik-ceramics','japan-ceramics',
    'joseon-ceramics','korea-ceramics','liling-kiln','limoges-porcelain',
    'meissen-porcelain','sawankhalok','sevres-porcelain','shiwan-kiln',
    'southeast-asia-ceramics','stoke-on-trent','uk-ceramics',
    'west-asia-ceramics','yixing-kiln'
  );

update public.entry_worlds ew
set rationale = case
  when e.slug='chen-yu' then '《景德镇陶录》把陈淯的记录直接连接到清代景德镇由陶业形成都会与专业分工的历史。'
  when e.slug='du-chongyuan' then '杜重远对应20世纪前期景德镇陶业调查与产业转型，是从人物进入近代陶业史的具体入口。'
  when e.slug='lang-tingji' then '郎廷极连接康熙时期督陶与官窑生产管理，可由人物进入清代御窑制度史。'
  when e.slug='nian-xiyao' then '年希尧连接雍正时期陶务与御窑工艺管理，可由人物进入18世纪景德镇制度与技术史。'
  when e.slug='qianlong-emperor' then '乾隆时期宫廷对景德镇名瓷的鉴赏与御制诗构成清代宫廷瓷业史的文本入口。'
  when e.slug='shen-defu' then '沈德符的明代笔记提供同时代文人对景德镇瓷器的观察，可进入明代瓷业与消费史。'
  when e.slug='shen-huaiqing' then '《窑民行》记录陶业、工匠与商业生活，可由作者进入清代景德镇社会史。'
  when e.slug='tang-ying' then '唐英直接连接雍正—乾隆时期御窑管理、工艺记录与生产体系，是清代景德镇陶业史的核心人物入口。'
  when e.slug='tong-bin' then '童宾连接明代御窑工匠与御窑制度，是从人物进入明代官方制瓷体系的重要入口。'
  when e.slug='wang-zehong' then '王泽洪所记陶业与商业中心地位，可直接进入清代景德镇城市经济史。'
  when e.slug='wang-shixing' then '王士性关于宣德、成化窑器的记述保留明代同时代知识，可从文人观察进入明代瓷器史。'
  when e.slug='wen-zhenheng' then '《长物志》的器物品评反映明代文人审美与名瓷消费，可进入明代陶瓷文化史。'
  when e.slug='yin-hong-xu' then '殷弘绪的实地观察记录18世纪景德镇生产，并连接中西制瓷知识传播史。'
  when e.slug='zang-yingxuan' then '臧应选连接康熙时期督陶管理与颜色釉传统，可进入清初御窑制度史。'
  when e.slug='zhu-yan' then '朱琰及《陶说》系统整理景德镇及历代陶业文献，可由作者进入清代陶瓷史的史料体系。'
  when e.slug='li-rihua' then '李日华的明代文字记载了景德镇制瓷人物与器物，可作为明代陶业文献入口。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and ew.world_slug='history'
  and e.slug in (
    'chen-yu','du-chongyuan','lang-tingji','nian-xiyao',
    'qianlong-emperor','shen-defu','shen-huaiqing','tang-ying',
    'tong-bin','wang-zehong','wang-shixing','wen-zhenheng',
    'yin-hong-xu','zang-yingxuan','zhu-yan','li-rihua'
  );

update public.entry_worlds ew
set rationale = case
  when e.slug='arita-kiln' then '有田在17世纪形成成熟瓷业并出现景德镇式样的本土化，可由日本窑业进入东亚技术与贸易史。'
  when e.slug='changling-stone' then '长岭瓷石采掘区是景德镇历史生产系统的原料端，可进入10—19世纪完整产业链历史。'
  when e.slug='changsha-kiln' then '长沙窑把唐代民窑、装饰创新与远距离贸易连接起来，可与景德镇后来的规模化生产比较。'
  when e.slug='ding-kiln' then '定窑代表北方白瓷技术的重要阶段，可由窑址进入景德镇青白瓷形成前后的技术谱系。'
  when e.slug='gaoling-mining' then '高岭土矿采掘区是景德镇制瓷原料体系的关键历史环节，可进入生产基础史。'
  when e.slug='hutian-kiln' then '湖田窑呈现宋元至明清景德镇民窑长期生产的连续性，是城市窑业史的核心空间入口。'
  when e.slug='imperial-kiln' then '御窑厂遗址直接呈现明清官方制瓷、民窑配套与城市生产组织，可进入御窑制度史。'
  when e.slug='jingdezhen' then '景德镇窑本身是跨世纪生产中心的总节点，连接10—19世纪技术、原料、窑炉与社会组织演变。'
  when e.slug='jiaotan-firewood' then '焦潭柴窑燃料生产区展示历史窑业所依赖的燃料供应，可进入完整产业链与空间组织史。'
  when e.slug='jun-kiln' then '钧窑代表宋金时期另一条釉色技术路线，可用于理解景德镇与北方窑业的同期技术交流。'
  when e.slug='longquan-kiln' then '龙泉窑连接宋元青瓷生产、海上贸易与景德镇竞争环境，可进入区域窑业与贸易史。'
  when e.slug='ru-kiln' then '汝窑把北宋宫廷用瓷、考古遗址与传世品问题引入历史证据链，可与景德镇官窑史对读。'
  when e.slug='xing-kiln' then '邢窑是古代白瓷谱系的重要节点，可从北方白瓷技术背景进入景德镇白瓷形成史。'
  when e.slug='yaozhou-kiln' then '耀州窑可与湖田窑比较青瓷装饰与窑业组织，进入宋代区域技术交流史。'
  when e.slug='yue-kiln' then '越窑连接唐宋青瓷、贡瓷与跨区域传播，可作为景德镇青白瓷兴起前的东亚技术背景入口。'
  when e.slug='zhangzhou-kiln' then '漳州窑连接明清东南沿海民窑与外销市场，可进入景德镇外销体系的区域竞争史。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and ew.world_slug='history'
  and e.slug in (
    'arita-kiln','changling-stone','changsha-kiln','ding-kiln','gaoling-mining',
    'hutian-kiln','imperial-kiln','jingdezhen','jiaotan-firewood','jun-kiln',
    'longquan-kiln','ru-kiln','xing-kiln','yaozhou-kiln','yue-kiln',
    'zhangzhou-kiln'
  );

commit;
