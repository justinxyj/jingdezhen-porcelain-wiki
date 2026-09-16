/* Comparative ceramic history layer.
 * Inspired by the comparative, multi-lane reading model of AllHistory:
 * one date axis, multiple civilizations/regions, and representative objects.
 * Data labels are intentionally descriptive rather than ranking cultures.
 */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const path=p=>ROOT+p.replace(/^\//,'');
  const entry=(type,slug)=>path(`entry/?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`);
  const source=(r)=>path(`research/sources/#${r.toLowerCase()}`);

  const ERAS=[
    {id:'tang',period:'唐 · 618–907',focus:'成熟白瓷、青瓷体系形成与跨区域交流',jdz:'景德镇/昌南镇：青釉、白瓷及早期窑业遗存',
      china:[['越窑','浙江·上虞/慈溪','青瓷','青瓷、秘色瓷传统'],['邢窑','河北·内丘','白瓷','白瓷体系成熟'],['长沙窑','湖南·长沙','釉下彩','釉下彩、彩绘与外销'],['耀州窑','陕西·铜川','青瓷','刻花青瓷'],['定窑早期','河北·曲阳','白瓷','北方白瓷传统']],
      world:[['朝鲜半岛','统一新罗','陶瓷','青瓷技术传统逐渐发展'],['日本','奈良时代','陶器','须惠器及唐文化影响'],['伊斯兰世界','中东','陶器/玻璃','金属器与陶器传统并存']],
      works:[['青釉碗','中国·越窑','青瓷','越窑青瓷代表性器类'],['白瓷碗','中国·邢窑','白瓷','北方白瓷代表性器类'],['长沙窑彩绘器','中国·长沙窑','釉下彩','釉下彩装饰代表'],['青釉执壶','景德镇·早期窑业','青釉','景德镇早期器物谱系']],refs:['R01','R09','R10']},
    {id:'song',period:'宋 · 960–1279',focus:'多窑系并立，器物审美与技术高度分化',jdz:'景德镇：青白瓷成为核心产品，湖田窑等窑场扩张',
      china:[['汝窑','河南·宝丰','青瓷','天青釉、宫廷用瓷'],['官窑','河南/杭州','青瓷','宫廷官窑体系'],['哥窑','浙江·龙泉相关研究区','青瓷','开片审美'],['定窑','河北·曲阳','白瓷','刻花、印花白瓷'],['钧窑','河南·禹州','窑变釉','窑变蓝釉、紫红斑'],['龙泉窑','浙江·龙泉','青瓷','粉青、梅子青传统'],['磁州窑','河北·磁县','白地黑彩','民窑装饰传统'],['耀州窑','陕西·铜川','青瓷','刻花青瓷']],
      world:[['高丽','朝鲜半岛','青瓷','翡色青瓷传统'],['日本','平安时代','陶器','常滑、猿投等窑业发展'],['伊斯兰世界','西亚/中亚','陶器','釉陶、刻划装饰与贸易陶'],['东南亚','越南等','陶器','本土窑业与中国瓷器输入']],
      works:[['青白瓷梅瓶','景德镇·湖田窑','青白釉','薄胎、透光、刻印花'],['汝窑天青釉器','中国·汝窑','青瓷','天青釉代表'],['定窑刻花碗','中国·定窑','白瓷','刻花白瓷'],['龙泉粉青碗','中国·龙泉窑','青瓷','粉青釉'],['高丽青瓷','朝鲜半岛','青瓷','翡色青瓷']],refs:['R01','R09','R10']},
    {id:'yuan',period:'元 · 1271–1368',focus:'高温瓷体系、青花与全球贸易网络发生关键变化',jdz:'景德镇：高岭土加入与多元配方、青花及釉下红的发展',
      china:[['景德镇','江西·景德镇','青白/青花','青花、釉里红、多元配方'],['龙泉窑','浙江·龙泉','青瓷','大器、外销青瓷'],['德化窑','福建·德化','白瓷','白瓷与外销'],['磁州窑','北方','白地黑彩','民窑装饰传统'],['钧窑系','河南','窑变釉','传统延续']],
      world:[['高丽/朝鲜','朝鲜半岛','青瓷→白瓷','青瓷传统与白瓷转型'],['日本','镰仓—室町','陶器','中国瓷器输入与本土窑业'],['西亚','伊朗等','陶器','中国青花输入并产生影响'],['东南亚','越南/泰国','陶瓷','本地窑业与中国瓷器竞争/交流']],
      works:[['元青花大罐','景德镇','青花','钴料釉下彩绘'],['釉里红器','景德镇','釉下红','铜红呈色技术'],['龙泉大盘','龙泉窑','青瓷','外销型大器'],['西亚仿青花陶器','西亚','陶器','中国青花输入后的地方转化']],refs:['R16','R19']},
    {id:'ming',period:'明 · 1368–1644',focus:'御窑制度、青花与彩瓷体系高度发展',jdz:'景德镇：御窑厂建立，官窑与民窑共同形成庞大生产网络',
      china:[['景德镇御窑','江西·景德镇','青花/彩瓷','御窑厂、官样、窑炉与作坊体系'],['龙泉窑','浙江·龙泉','青瓷','传统青瓷与外销'],['德化窑','福建·德化','白瓷','白瓷、人物雕塑'],['漳州窑','福建·漳州','外销陶瓷','外销青花、五彩等']],
      world:[['朝鲜·粉青沙器','朝鲜半岛','粉青/白瓷','粉青沙器、白瓷传统'],['日本·濑户/美浓','日本','陶器/瓷器','茶陶传统与中国器物影响'],['日本·有田前史','九州','陶瓷','瓷器生产条件逐步形成'],['奥斯曼世界','土耳其·伊兹尼克','釉陶','蓝白、彩釉装饰传统'],['欧洲','葡萄牙/荷兰','输入瓷器','海上贸易带来中国瓷器收藏']],
      works:[['永乐甜白釉器','景德镇御窑','白瓷','甜白釉传统'],['宣德青花','景德镇御窑','青花','宣德青花代表'],['成化斗彩','景德镇御窑','斗彩','釉下青花与釉上彩结合'],['龙泉青瓷盘','龙泉窑','青瓷','传统青瓷外销'],['伊兹尼克蓝白盘','奥斯曼','釉陶','跨文化视觉比较']],refs:['R03','R08','R16','R19']},
    {id:'qing',period:'清 · 1644–1911',focus:'粉彩、珐琅彩、颜色釉与全球消费市场扩张',jdz:'景德镇：御窑复建、唐窑、彩瓷与综合装饰',
      china:[['景德镇御窑','江西·景德镇','粉彩/颜色釉','御窑、唐窑、综合装饰'],['德化窑','福建·德化','白瓷','白瓷雕塑传统'],['宜兴窑','江苏·宜兴','紫砂','茶文化器物'],['醴陵窑','湖南·醴陵','釉下彩','近代釉下五彩'],['石湾窑','广东·佛山','陶塑','民间陶塑传统']],
      world:[['日本·有田/伊万里','日本·九州','瓷器','染付、伊万里与外销瓷'],['日本·九谷','日本·石川','彩瓷','彩绘瓷传统'],['韩国·白瓷','朝鲜半岛','白瓷','白瓷与文人审美'],['梅森','德意志地区','硬质瓷','欧洲硬质瓷工业化起点'],['塞夫勒','法国','软质/硬质瓷','宫廷瓷与彩绘'],['英国','英国','瓷器','骨瓷等工业体系']],
      works:[['粉彩瓷','景德镇','粉彩','釉上彩与柔和设色'],['珐琅彩瓷','清宫/景德镇体系','珐琅彩','宫廷彩绘'],['青花釉里红','景德镇','综合装饰','多种装饰技术结合'],['伊万里瓷','日本·有田','彩绘瓷','中国青花与日本彩绘的融合'],['梅森瓷','欧洲','硬质瓷','欧洲硬质瓷体系'],['塞夫勒彩瓷','法国','彩瓷','宫廷装饰艺术']],refs:['R04','R06','R25','R30']},
    {id:'modern',period:'近现代 · 1911–至今',focus:'工业化、教育科研、艺术陶瓷与全球设计体系',jdz:'景德镇：传统工艺与现代产业、艺术教育并行',
      china:[['景德镇','江西','日用/艺术瓷','产业、教育、艺术创作'],['醴陵','湖南','釉下五彩','现代产业体系'],['德化','福建','白瓷','传统白瓷现代产业化'],['佛山石湾','广东','陶塑','传统陶塑现代转型']],
      world:[['日本·有田','日本','瓷器','传统工艺与现代设计'],['德国·梅森','德国','瓷器','品牌化与艺术设计'],['法国·利摩日','法国','瓷器','工业瓷与设计'],['英国·斯托克','英国','骨瓷','工业化陶瓷体系'],['韩国·利川','韩国','陶瓷','传统陶艺与现代艺术']],
      works:[['现代青花艺术瓷','景德镇','艺术瓷','传统笔墨与现代造型'],['现代白瓷雕塑','德化','白瓷','传统雕塑语言现代化'],['有田现代瓷','日本·有田','瓷器','传统技艺与现代设计'],['梅森现代设计','德国','瓷器','品牌设计体系']],refs:['R20','R32']}
  ];

  function objectShape(kind){return `<span class="compare-vessel compare-${kind||'bottle'}"><i></i></span>`}
  function specimenCard(w){return `<div class="compare-specimen"><div class="specimen-stage">${objectShape(w[2]==='青瓷'?'bowl':w[2]==='白瓷'?'vase':w[2]==='青花'?'blue':'bottle')}</div><div class="specimen-meta"><b>${esc(w[0])}</b><small>${esc(w[1])}</small><span>${esc(w[2])}</span><p>${esc(w[3])}</p></div></div>`}
  function lane(title,items,cls){return `<section class="compare-lane ${cls}"><div class="compare-lane-title"><span>${title}</span><em>${items.length} 类代表性窑业/地区</em></div><div class="compare-lane-grid">${items.map(x=>`<article class="compare-node"><b>${esc(x[0])}</b><small>${esc(x[1])}</small><strong>${esc(x[2])}</strong><p>${esc(x[3])}</p></article>`).join('')}</div></section>`}
  function render(){const root=document.getElementById('timeline');if(!root)return;root.classList.add('timeline-comparison-root');root.innerHTML=`<div class="timeline-comparison-intro"><div><span class="compare-eyebrow">COMPARATIVE CERAMIC HISTORY</span><h2>把景德镇放回世界瓷业史</h2><p>沿同一时间轴，同时观察景德镇、中国其他窑址与世界主要陶瓷传统。每个时代先看“同时发生了什么”，再进入具体器物与知识条目。</p></div><div class="compare-key"><span>景德镇</span><span>中国其他窑址</span><span>世界其他地区</span><span>代表器物</span></div></div><div class="compare-period-nav">${ERAS.map((e,i)=>`<a href="#era-${e.id}" class="${i===0?'is-active':''}">${esc(e.period.split(' · ')[0])}</a>`).join('')}</div><div class="compare-axis">${ERAS.map((e,i)=>`<section id="era-${e.id}" class="compare-era"><header><div class="era-date">${esc(e.period)}</div><div><h3>${esc(e.focus)}</h3><p><b>景德镇同期：</b>${esc(e.jdz)}</p></div><a class="era-detail" href="${entry('timeline',e.id)}">进入本时期条目 →</a></header><div class="compare-grid"><div class="jdz-focus"><span class="lane-label">景德镇</span><div class="jdz-focus-inner"><b>${esc(e.jdz)}</b><span>重点观察：生产技术 · 器型 · 制度 · 贸易</span><a href="${entry('timeline',e.id)}">查看详细历史 →</a></div></div>${lane('中国其他窑址',e.china,'china-lane')}${lane('世界其他地区',e.world,'world-lane')}</div><div class="specimen-strip"><div class="strip-heading"><span>同时期代表器物</span><small>用于视觉比较，不以“先进/落后”排序</small></div><div class="specimen-grid">${e.works.map(specimenCard).join('')}</div><div class="compare-refs">证据：${e.refs.map(r=>`<a href="${source(r)}">[${esc(r)}]</a>`).join(' ')}</div></div></section>`).join('')}</div>`;
    const links=[...root.querySelectorAll('.compare-period-nav a')];const sections=[...root.querySelectorAll('.compare-era')];const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){links.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+en.target.id))}}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>io.observe(s));
  }
  window.JDM_COMPARATIVE_ERAS=ERAS;
  window.addEventListener('DOMContentLoaded',()=>setTimeout(render,80));
})();
