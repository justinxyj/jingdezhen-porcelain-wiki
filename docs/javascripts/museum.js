const JDM_DATA={
 timeline:[
  {y:'唐—五代',title:'早期瓷业与“新平”传统',text:'景德镇地区瓷业逐步发展，形成后来瓷都历史的重要基础。'},
  {y:'宋',title:'青白瓷与市场扩张',text:'以青白瓷为代表的产品进入更广阔的国内外市场，景德镇瓷业地位上升。'},
  {y:'元',title:'青花与釉里红',text:'元代景德镇成为重要制瓷中心，青花、釉里红等装饰技术进入重要发展阶段。'},
  {y:'明',title:'御窑体系形成与成熟',text:'景德镇御窑厂成为宫廷用瓷生产核心，官窑制度与民窑体系共同塑造城市格局。'},
  {y:'清',title:'多品种彩瓷与外销',text:'青花、五彩、粉彩、颜色釉等体系进一步丰富，景德镇与全球贸易联系持续增强。'},
  {y:'1911—1949',title:'传统与现代转型',text:'窑业、商业和城市社会经历剧烈变化，传统工艺在新的生产体系中延续。'},
  {y:'1949—至今',title:'现代陶瓷产业与艺术城市',text:'国营瓷业、院校体系、艺术家工作室和国际陶瓷交流共同构成当代景德镇。'}
 ],
 kilns:[
  {name:'御窑厂遗址',lat:29.2747,lng:117.1767,type:'明清官窑',desc:'景德镇城市历史与御窑制度的重要遗址。'},
  {name:'湖田窑遗址',lat:29.2678,lng:117.2134,type:'宋元窑址',desc:'景德镇重要古窑址群之一，见证青白瓷等产品的发展。'},
  {name:'三宝国际陶艺村',lat:29.2477,lng:117.2438,type:'当代陶艺空间',desc:'当代艺术、驻地创作与传统陶瓷文化交汇的城市空间。'},
  {name:'陶溪川',lat:29.2896,lng:117.1909,type:'当代陶瓷文化街区',desc:'由老瓷厂空间转型形成的文化与创意产业聚集区。'}
 ],
 catalog:[
  {id:'JDP-001',name:'青花瓷',period:'元—清',craft:'青花',tag:'典型器类',desc:'以钴料在胎体上绘画后施透明釉高温烧成。'},
  {id:'JDP-002',name:'青白瓷',period:'宋—元',craft:'青白釉',tag:'早期代表',desc:'釉色介于青白之间，景德镇传统瓷业的重要品类。'},
  {id:'JDP-003',name:'粉彩瓷',period:'清—近现代',craft:'粉彩',tag:'彩瓷',desc:'在釉上彩绘体系中发展出的重要装饰传统。'},
  {id:'JDP-004',name:'颜色釉瓷',period:'宋—当代',craft:'颜色釉',tag:'釉色',desc:'通过釉料配方与窑火控制获得丰富色彩，是景德镇重要技术谱系。'},
  {id:'JDP-005',name:'玲珑瓷',period:'清—近现代',craft:'镂雕/玲珑',tag:'工艺',desc:'以通透的玲珑眼与薄胎工艺形成独特视觉效果。'},
  {id:'JDP-006',name:'薄胎瓷',period:'清—当代',craft:'薄胎',tag:'高难度工艺',desc:'胎体极薄，对成型、修坯和烧成控制要求很高。'}
 ],
 people:[
  {name:'唐英',era:'清代',role:'督陶官 / 陶瓷工艺管理者',desc:'清代景德镇御窑生产与工艺管理史中的重要人物。'},
  {name:'何朝宗',era:'明代',role:'雕塑家 / 德化瓷人物',desc:'明代瓷塑史的重要人物，可用于扩展景德镇与中国陶瓷人物数据库的比较维度。'},
  {name:'王步',era:'近现代',role:'青花艺术家',desc:'近现代景德镇青花艺术的重要代表人物之一。'},
  {name:'刘雨岑',era:'近现代',role:'陶瓷艺术家',desc:'景德镇近现代陶瓷艺术史的重要人物之一。'},
  {name:'戴荣华',era:'当代',role:'陶瓷艺术家',desc:'景德镇当代陶瓷艺术与粉彩传统相关的重要艺术家。'},
  {name:'中国景德镇陶瓷大学相关师生群体',era:'当代',role:'教育 / 研究 / 创作',desc:'构成现代景德镇陶瓷知识生产与人才培养的重要网络。'}
 ]
};
function el(id){return document.getElementById(id)}
function renderTimeline(){const x=el('timeline');if(!x)return;x.innerHTML='<div class="timeline">'+JDM_DATA.timeline.map(i=>`<div class="timeline-item"><div class="timeline-year">${i.y}</div><h3>${i.title}</h3><p>${i.text}</p></div>`).join('')+'</div>'}
function renderCatalog(){const x=el('catalog-list');if(!x)return;const q=(el('catalog-search')?.value||'').toLowerCase();x.innerHTML=JDM_DATA.catalog.filter(i=>Object.values(i).join(' ').toLowerCase().includes(q)).map(i=>`<article class="catalog-card"><div class="tag">${i.id}</div><div class="tag">${i.period}</div><div class="tag">${i.craft}</div><h3>${i.name}</h3><p>${i.desc}</p></article>`).join('')}
function renderPeople(){const x=el('people-list');if(!x)return;x.innerHTML=JDM_DATA.people.map(i=>`<article class="person-card"><div class="tag">${i.era}</div><h3>${i.name}</h3><strong>${i.role}</strong><p>${i.desc}</p></article>`).join('')}
function initMap(){const x=el('kiln-map');if(!x||typeof L==='undefined')return;const map=L.map(x).setView([29.27,117.20],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);JDM_DATA.kilns.forEach(k=>L.marker([k.lat,k.lng]).addTo(map).bindPopup(`<b>${k.name}</b><br>${k.type}<br>${k.desc}`))}
function initMuseum(){renderTimeline();renderCatalog();renderPeople();initMap();el('catalog-search')?.addEventListener('input',renderCatalog)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMuseum);else initMuseum();
