const JDM_DATA={
 timeline:[
  {y:'东晋—唐',title:'新平镇与昌南镇',text:'地方志建置资料记载，东晋称新平镇，唐称昌南镇。地名沿革与窑业史应分别考证。[R07]'},
  {y:'五代—宋',title:'湖田窑与青白瓷',text:'湖田窑考古资料覆盖五代至宋元明多个阶段；宋代青白瓷成为景德镇研究的核心产品之一。[R01][R09][R10]'},
  {y:'元',title:'青花与釉下彩绘',text:'景德镇青花釉下彩绘技术在元代进入重要发展阶段，相关工艺与后来的明代青花体系相互衔接。[R16][R19]'},
  {y:'明',title:'御窑厂与官作体系',text:'御窑厂考古揭示窑炉、作坊、窑具、瓷片堆积和落选品处理等生产遗迹，显示宫廷用瓷生产具有复杂空间与组织结构。[R03]'},
  {y:'清',title:'御窑、彩瓷与颜色釉',text:'清代文献《景德镇陶录》《浮梁县志》记录御窑厂、陶务、陶匠、色料等；粉彩和颜色釉研究显示清代装饰技术继续发展。[R04][R06][R25][R30]'},
  {y:'1909—1910',title:'近代企业与陶业教育',text:'江西瓷业公司及中国陶业学堂相关资料反映出近代景德镇陶瓷业开始引入企业组织和职业教育机制。[R32]'},
  {y:'1949—1966',title:'生产制度与科技转型',text:'这一时期景德镇陶瓷业经历生产管理和科技体系变化，成为传统手工业向现代工业转型的重要案例。[R20]'},
  {y:'2002—2014',title:'御窑厂主动性考古',text:'北京大学等单位开展两次大规模主动性发掘，推动研究从传世器物进一步进入生产遗迹、作坊布局和制度研究。[R03]'},
  {y:'2026',title:'景德镇手工瓷业遗存列入世界遗产名录',text:'UNESCO将景德镇手工瓷业遗存列入《世界遗产名录》，系列遗产覆盖10—19世纪手工制瓷业的原料、燃料、窑炉、生产组织和城市空间。[R23]'}
 ],
 kilns:[],
 catalog:[
  {id:'JDP-001',name:'青白瓷',period:'宋—元',craft:'青白釉',tag:'湖田窑研究重点',desc:'景德镇宋代窑业研究的重要产品，湖田窑长期生产并形成丰富的器型与装饰序列。[R01][R09][R10]'},
  {id:'JDP-002',name:'青花瓷',period:'元—明清',craft:'釉下彩',tag:'重要装饰体系',desc:'以含钴彩料在胎体上绘画后施釉烧成，元代进入重要发展阶段，明代御窑青花形成丰富的阶段性面貌。[R08][R16][R19]'},
  {id:'JDP-003',name:'粉彩瓷',period:'清代',craft:'釉上彩',tag:'清代彩瓷',desc:'研究通常把粉彩的形成放在康熙晚期至雍正时期，其工艺受到传统五彩与珐琅彩等因素影响。[R25][R26]'},
  {id:'JDP-004',name:'颜色釉瓷',period:'明清',craft:'颜色釉',tag:'釉色体系',desc:'包括霁红、霁蓝等不同历史品种，呈色与釉层组成、化学成分和烧成工艺有关。[R29][R30]'}
 ],
 people:[
  {name:'唐英',era:'清代',role:'督陶官 / 陶务管理相关人物',desc:'《浮梁县志》《景德镇陶录》等资料均涉及唐英及其与景德镇御窑、陶务相关的文献，是清代景德镇陶瓷史人物数据库的核心条目。[R04][R06]'}
 ]
};
function el(id){return document.getElementById(id)}
function renderTimeline(){const x=el('timeline');if(!x)return;x.innerHTML='<div class="timeline">'+JDM_DATA.timeline.map(i=>`<div class="timeline-item"><div class="timeline-year">${i.y}</div><h3>${i.title}</h3><p>${i.text}</p></div>`).join('')+'</div>'}
function renderCatalog(){const x=el('catalog-list');if(!x)return;const q=(el('catalog-search')?.value||'').toLowerCase();x.innerHTML=JDM_DATA.catalog.filter(i=>Object.values(i).join(' ').toLowerCase().includes(q)).map(i=>`<article class="catalog-card"><div class="tag">${i.id}</div><div class="tag">${i.period}</div><div class="tag">${i.craft}</div><h3>${i.name}</h3><p>${i.desc}</p></article>`).join('')}
function renderPeople(){const x=el('people-list');if(!x)return;x.innerHTML=JDM_DATA.people.map(i=>`<article class="person-card"><div class="tag">${i.era}</div><h3>${i.name}</h3><strong>${i.role}</strong><p>${i.desc}</p></article>`).join('')}
function initMap(){const x=el('kiln-map');if(!x||typeof L==='undefined')return;const map=L.map(x).setView([29.27,117.20],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);JDM_DATA.kilns.forEach(k=>L.marker([k.lat,k.lng]).addTo(map).bindPopup(`<b>${k.name}</b><br>${k.type}<br>${k.desc}`))}
function openJingdezhen(){const intro=el('jdm-intro');if(!intro||intro.classList.contains('zooming')||intro.classList.contains('done'))return;intro.classList.add('zooming');window.setTimeout(()=>intro.classList.add('done'),3000)}
function initHomepage(){const home=el('jdm-home');if(!home)return;const enter=el('jdm-enter'),skip=el('jdm-skip');enter?.addEventListener('click',openJingdezhen);skip?.addEventListener('click',openJingdezhen);window.setTimeout(()=>{if(!document.hidden)openJingdezhen()},5600);document.querySelectorAll('.jdm-artifact').forEach(card=>{card.addEventListener('mouseenter',()=>{card.querySelector('.artifact-glow')?.classList.add('is-hot')});card.addEventListener('mouseleave',()=>{card.querySelector('.artifact-glow')?.classList.remove('is-hot')})})}
function initMuseum(){renderTimeline();renderCatalog();renderPeople();initMap();el('catalog-search')?.addEventListener('input',renderCatalog);initHomepage()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMuseum);else initMuseum();
