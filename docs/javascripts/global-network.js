/* Phase 4C: entry-centric global ceramic network — time, space, people, craft, worlds and relations. */
(function(){
  /** @type {Record<string,string>} */
  const relationLabels={person:'相关人物',object:'相关器物',craft:'相关工艺',kiln:'相关窑址',period:'时代背景',related:'相关条目'};
  /** @param {string} value */
  const relationLabel=value=>relationLabels[value]||'相关内容';
  const ROOT='/jingdezhen-porcelain-wiki/';
  /** @param {unknown} s */
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]||m));
  /** @param {unknown} raw @param {{allowHttp?:boolean}} [opts] */
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  /** @param {unknown} s */
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  /** @param {import('../../types/knowledge').Entry} e */
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const eraLabels=/** @type {Record<string,string>} */({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清','near-modern':'近代',modern:'现代'});
  /** @type {import('../../types/knowledge').Entry[]} */
  let entries=[];
  /** @param {import('../../types/knowledge').Entry} e @param {string} [extra] */
  function card(e,extra=''){return '<a class="jdm-gn-card" href="'+(safeHref(entryUrl(e))||'')+'"><div><span>'+esc(e.category||'知识条目')+'</span><h3>'+esc(e.zh?.title||e.slug)+'</h3>'+extra+'</div><b>→</b></a>'}
  /** @param {import('../../types/knowledge').Relation} r */
  function relationCard(r){const e=r.entry;if(!e)return '';return '<a class="jdm-gn-relation" href="'+(safeHref(entryUrl(e))||'')+'"><span>'+esc(r.semantic_label||relationLabel(r.relation_type||'关联'))+'</span><strong>'+esc(e.zh?.title||e.slug)+'</strong><small>'+esc(r.semantic_note||'对应条目的正文与参考资料提供背景。')+'</small></a>'}
  /** @param {import('../../types/knowledge').Entry[]} rows */
  function renderSearchResults(rows){const root=document.getElementById('jdm-global-network-search-results');if(!root)return;root.innerHTML=rows.filter(e=>e.source_type!=='markdown').slice(0,8).map(e=>'<button type="button" data-global-result="'+esc(e.id)+'"><span>'+esc(e.category||'知识条目')+'</span><b>'+esc(e.zh?.title||e.slug)+'</b></button>').join('');/** @type {NodeListOf<HTMLElement>} */(root.querySelectorAll('[data-global-result]')).forEach(b=>b.addEventListener('click',()=>select(b.dataset.globalResult||'')))}
  /** @param {string} q */
  async function search(q){const root=document.getElementById('jdm-global-network-search-results');if(!root)return;if(!q){root.innerHTML='';return}try{renderSearchResults(await window.JDM_KNOWLEDGE?.searchEntries(q,{limit:8})||[])}catch(e){root.innerHTML='<div class="jdm-gn-search-error">搜索暂时不可用，请稍后重试。</div>'}}
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function craftSection(ctx){
    const rows=ctx.craftProcesses||[];
    return '<section class="jdm-gn-section"><div class="jdm-gn-section-head"><div><span>CRAFT · 工艺</span><h2>它通过什么工艺被制造？</h2><p>从当前知识条目进入已有的 72 道工艺流程知识，了解原料、成型与烧成之间的联系。</p></div></div><div class="jdm-gn-craft-grid">'+(rows.length?rows.map(n=>'<a class="jdm-gn-craft" href="'+ROOT+'craft/technology-tree/#'+encodeURIComponent(String(n.label||n.node_id).replace(/\s+/g,'-'))+'"><b>'+esc(n.label||n.node_id)+'</b><span>'+esc(n.summary||n.rationale||'工艺关联')+'</span></a>').join(''):'<div class="jdm-gn-empty">当前条目暂未建立具体工艺流程关联。</div>')+'</div></section>';
  }
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function timelineSection(ctx){
    const peers=ctx.timelinePeers||[],chips=(ctx.eras||[]).map(x=>'<span>'+esc(eraLabels[x]||x)+'</span>').join('');
    const groups=[['jdz','景德镇'],['china','中国其他窑业'],['world','世界其他地区']].map(([lane,label])=>{const rows=peers.filter(e=>(e.zh?.meta?.timeline||[]).some(t=>t.lane===lane));return '<div class="jdm-gn-time-group"><header><b>'+label+'</b><span>'+rows.length+' 项内容</span></header>'+rows.slice(0,6).map(e=>card(e,(e.zh?.meta?.timeline||[]).filter(t=>ctx.eras.includes(t.era||'')).map(t=>'<em>'+esc(eraLabels[t.era||'']||t.era)+'</em>').join(''))).join('')+'</div>'}).join('');
    return '<section class="jdm-gn-section"><div class="jdm-gn-section-head"><div><span>TIME · 时间</span><h2>它出现在哪个时代？</h2><p>把当前知识条目放回景德镇、中国其他窑业与世界陶瓷史的同一时间尺度。</p></div><div class="jdm-gn-era-chips">'+chips+'</div></div><div class="jdm-gn-time-grid">'+groups+'</div></section>';
  }
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function mapSection(ctx){const rows=(ctx.spaceEntries||[]).filter(e=>e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null);return '<section class="jdm-gn-section"><div class="jdm-gn-section-head"><div><span>SPACE · 空间</span><h2>它位于哪里？又与哪些陶瓷中心相连？</h2><p>地图只负责呈现空间关系；真正的知识入口仍然是知识条目。</p></div></div><div class="jdm-gn-space-grid"><div id="jdm-gn-map" class="jdm-gn-map"></div><div class="jdm-gn-space-list">'+rows.slice(0,12).map(e=>card(e,'<em>'+esc(e.zh?.meta?.map?.country||'')+'</em>')).join('')+'</div></div></section>'}
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function relationSection(ctx){const ordered=[...(ctx.relations||[])].sort((a,b)=>Number(Boolean(b.semantic_label))-Number(Boolean(a.semantic_label))),relations=ordered.slice(0,10),recs=(ctx.recommendations||[]).slice(0,8);return '<section class="jdm-gn-section"><div class="jdm-gn-section-head"><div><span>RELATIONS · 关系</span><h2>谁、什么、哪一处与它相连？</h2><p>先阅读有明确资料依据的联系，再沿人物、器物、窑址与文献理解背景。</p></div></div><div class="jdm-gn-rel-grid">'+relations.map(relationCard).join('')+'</div><div class="jdm-gn-recommend"><header><b>相关推荐</b><span>继续阅读相关资料</span></header><div>'+recs.map(r=>card(r.entry,'<em>'+esc(r.reason||'相关知识')+'</em>')).join('')+'</div></div></section>'}
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function identity(ctx){const e=ctx.entry,m=e.zh?.meta||{},worlds=(ctx.worlds||[]).map(w=>'<a href="'+ROOT+(w.slug==='space'?'kilns':w.slug)+'/">'+esc(w.short_title||w.title)+'</a>').join(''),map=m.map,location=map?esc(map.country||''):((ctx.relations||[]).filter(r=>r.entry?.category==='窑址').map(r=>r.entry.zh?.title).slice(0,2).join('、')||'未建立直接空间坐标');return '<section class="jdm-gn-identity"><div><span>条目</span><h2>'+esc(e.zh?.title||e.slug)+'</h2><p>'+esc(text(e.zh?.summary||e.zh?.content||'').slice(0,240))+'</p><div class="jdm-gn-worlds">'+worlds+'</div></div><div class="jdm-gn-facts"><div><small>类别</small><b>'+esc(e.category||'—')+'</b></div><div><small>时代</small><b>'+esc((ctx.eras||[]).map(x=>eraLabels[x]||x).join('、')||'待关联')+'</b></div><div><small>空间</small><b>'+location+'</b></div><div><small>连接</small><b>'+ctx.stats.relationCount+' 关系 · '+ctx.stats.recommendationCount+' 推荐</b></div></div></section>'}
  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function render(ctx){
    const root=document.getElementById('jdm-global-network-content'),status=document.getElementById('jdm-global-network-status');if(!root||!status)return;
    status.setAttribute('aria-busy','false');status.textContent='正在阅读 '+(ctx.entry.zh?.title||ctx.entry.slug)+' 的历史联系。';
    const context=ctx.entry.timelineContext,relation=context?.relationship_to_jingdezhen||ctx.entry.zh?.meta?.relation_to_jingdezhen||'';
    const core=ctx.lanes.includes('jdz')||Boolean(relation&&context?.reviewed_at&&context.description_source_type!=='ai');
    const explanation=core?(relation||'从景德镇的生产、工艺和器物出发，阅读资料中已记录的历史联系。'):'现有资料提供比较背景，尚不足以把这一对象列为景德镇直接联系的核心路线。时间相近或风格相似，本身不能证明传播。';
    const comparison=timelineSection(ctx)+mapSection(ctx);
    root.innerHTML=identity(ctx)+'<section class="jdm-gn-section"><h2>与景德镇的关系</h2><p>'+esc(explanation)+'</p><a href="'+safeHref(entryUrl(ctx.entry))+'">阅读全文与来源 →</a> · <a href="'+ROOT+'research/evidence/?slug='+encodeURIComponent(ctx.entry.slug)+'">查看完整证据链 →</a></section>'+relationSection(ctx)+(core?comparison:'<details><summary>跨地区比较资料</summary>'+comparison+'</details>')+'<details><summary>深入研究：工艺流程</summary>'+craftSection(ctx)+'</details>';
    if(core)drawMap(ctx);else root.querySelector('details')?.addEventListener('toggle',event=>{if(event.target instanceof HTMLDetailsElement&&event.target.open)drawMap(ctx)},{once:true});
    history.replaceState(null,'',ROOT+'network/global/?slug='+encodeURIComponent(ctx.entry.slug));
  }

  /** @param {import('../../types/knowledge').NetworkContext} ctx */
  function drawMap(ctx){
    const el=document.getElementById('jdm-gn-map');if(!el||typeof L==='undefined')return;
    const rows=ctx.spaceEntries.flatMap(entry=>entry.zh?.meta?.map?[{entry,point:entry.zh.meta.map}]:[]);
    /** @type {import('leaflet').LatLngTuple} */
    const center=ctx.map?[ctx.map.lat,ctx.map.lng]:rows[0]?[rows[0].point.lat,rows[0].point.lng]:[25,110];
    const map=L.map(el,{scrollWheelZoom:false}).setView(center,ctx.map?5:3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    /** @type {import('leaflet').LatLngTuple[]} */ const bounds=[];
    rows.forEach(({entry,point})=>{
      const marker=L.circleMarker([point.lat,point.lng],{radius:entry.id===ctx.entry.id?10:6,weight:2,fillOpacity:.8}).addTo(map).bindTooltip(entry.zh?.title||entry.slug,{direction:'top'});
      marker.on('click',()=>select(entry.id));bounds.push([point.lat,point.lng]);
    });
    if(ctx.map)map.setView([ctx.map.lat,ctx.map.lng],5);else if(bounds.length>1)map.fitBounds(bounds,{padding:[30,30],maxZoom:5});requestAnimationFrame(()=>map.invalidateSize());
  }
  /** @param {string} id */
  async function select(id){const status=document.getElementById('jdm-global-network-status');if(!status)return;window.JDM_VISITOR?.renderState(status,'loading',{message:'正在连接知识网络…'});try{const ctx=await window.JDM_KNOWLEDGE?.entryNetworkContext(id);if(ctx)render(ctx);else status.textContent='没有找到这个知识条目。'}catch(error){window.JDM_VISITOR?.renderState(status,'error',{error,retry:()=>select(id)})}}
  async function boot(){if(!window.JDM_KNOWLEDGE||!document.getElementById('jdm-global-network-content'))return;entries=await window.JDM_KNOWLEDGE.all();const input=document.getElementById('jdm-global-network-input'),button=document.getElementById('jdm-global-network-search-button');if(!(input instanceof HTMLInputElement))return;input.addEventListener('input',()=>search(input.value.trim()));input?.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=document.querySelector('[data-global-result]');if(first instanceof HTMLElement)select(first.dataset.globalResult||'')}});button?.addEventListener('click',()=>{const first=document.querySelector('[data-global-result]');if(first instanceof HTMLElement)select(first.dataset.globalResult||'')});/** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-global-example]')).forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.globalExample||'';search(b.dataset.globalExample||'')}));const slug=new URLSearchParams(location.search).get('slug');if(slug){const e=entries.find(x=>x.slug===slug);if(e)select(e.id);else search(slug)}else{const first=entries.find(e=>e.slug==='jingdezhen')||entries.find(e=>e.slug==='blue-and-white')||entries[0];if(first)select(first.id)}}
  /** @param {unknown} error */
  function showError(error){const root=document.getElementById('jdm-global-network-status');if(root)window.JDM_VISITOR?.renderState(root,'error',{error,retry:()=>{window.JDM_KNOWLEDGE?.reset();boot().catch(showError)}})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot().catch(showError));else boot().catch(showError);
})();