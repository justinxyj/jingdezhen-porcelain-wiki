/* Public global kiln atlas. Internal media labels and implementation wording stay hidden. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const wiki=t=>`https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(t||'')}`;
  const ROOT='/jingdezhen-porcelain-wiki/';
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||`${ROOT}entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`;
  function mediaMarkup(e){const im=e.media?.[0];return im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||'窑址图片')}" loading="lazy"><small>${esc(im.title||'馆藏图片')}</small>`:'<span>暂无已核验图片</span>'}
  function init(entries){
    const root=document.getElementById('kiln-map');if(!root||typeof L==='undefined')return;
    const rows=entries.filter(e=>e.category==='窑址'&&e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null);
    root.innerHTML=`<div class="global-kiln-map-toolbar"><input id="global-kiln-search" placeholder="搜索窑址、国家、年代或类型……"><div><span class="global-kiln-count" id="global-kiln-count"></span><button class="is-active" data-region="all">全部</button><button data-region="中国">中国</button><button data-region="东亚">东亚</button><button data-region="全球">全球</button></div></div><div id="global-kiln-map-canvas" class="global-kiln-map-canvas"></div><div id="global-kiln-list" class="global-kiln-list"></div><div id="global-kiln-modal"></div>`;
    const canvas=document.getElementById('global-kiln-map-canvas');
    const map=L.map(canvas).setView([25,110],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    // MkDocs Material can change the content column width after the map is created
    // (sidebar collapse, responsive layout, navigation transitions). Leaflet otherwise
    // keeps the old viewport and part of the world map can appear clipped/covered.
    const resizeMap=()=>requestAnimationFrame(()=>map.invalidateSize({pan:false,animate:false}));
    resizeMap();
    window.addEventListener('resize',resizeMap,{passive:true});
    if(window.ResizeObserver){
      const ro=new ResizeObserver(resizeMap);
      ro.observe(canvas);
      ro.observe(root);
    }
    const markers=new Map();
    const region=e=>{const c=e.zh?.meta?.map?.country||'';if(c.startsWith('中国'))return '中国';if(c.includes('韩国')||c.includes('日本'))return '东亚';return '全球'};
    function visible(e,q,r){const hay=JSON.stringify(e.zh||'').toLowerCase();return (!q||hay.includes(q))&&(r==='all'||region(e)===r)}
    function open(e){const m=e.zh?.meta?.map||{},wikiTitle=m.wikiTitle||e.zh?.title||e.slug,source=e.sources?.[0]?.url||'',modal=document.getElementById('global-kiln-modal');modal.innerHTML=`<div class="global-kiln-modal"><div class="global-kiln-backdrop" data-close></div><article class="global-kiln-dialog"><button class="global-kiln-close" data-close>×</button><div class="global-kiln-image">${mediaMarkup(e)}</div><div class="global-kiln-content"><div class="global-kiln-tags"><span>${esc(m.country||'')}</span><span>${esc(m.period||'')}</span><span>${esc(m.type||'窑业中心')}</span></div><h2>${esc(e.zh?.title||'窑址')}</h2><p class="global-kiln-intro">${esc(plain(e.zh?.content||e.zh?.summary||''))}</p><div class="global-kiln-ai"><b>摘要</b><p>${esc(plain(e.zh?.summary||''))}</p></div><div class="global-kiln-links"><a href="${entryUrl(e)}">查看知识条目 →</a><a href="${ROOT}network/global/?slug=${encodeURIComponent(e.slug)}">全球网络 →</a><a href="${ROOT}search/?q=${encodeURIComponent(e.zh?.title||e.slug)}">统一搜索 →</a>${source?`<a href="${esc(source)}" target="_blank" rel="noopener">权威来源 ↗</a>`:''}</div></div></article></div>`;modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>{modal.innerHTML='';document.body.classList.remove('global-kiln-open')}));document.body.classList.add('global-kiln-open')}
    function plain(s){const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''}
    function render(){const q=(document.getElementById('global-kiln-search')?.value||'').trim().toLowerCase();const active=document.querySelector('.global-kiln-map-toolbar button.is-active')?.dataset.region||'all';markers.forEach((marker,e)=>{if(visible(e,q,active))marker.addTo(map);else map.removeLayer(marker)});const list=document.getElementById('global-kiln-list');const shown=rows.filter(e=>visible(e,q,active));document.getElementById('global-kiln-count').textContent='显示 '+shown.length+' / '+rows.length+' 个有坐标窑址';list.innerHTML=shown.map(e=>{const m=e.zh.meta.map;return `<button class="global-kiln-list-item" data-slug="${esc(e.slug)}"><b>${esc(e.zh?.title||'窑址')}</b><span>${esc(m.country||'')} · ${esc(m.period||'')}</span></button>`}).join('');list.querySelectorAll('[data-slug]').forEach(btn=>btn.addEventListener('click',()=>{const e=rows.find(x=>x.slug===btn.dataset.slug);if(!e)return;const m=e.zh.meta.map;map.flyTo([m.lat,m.lng],Math.max(map.getZoom(),5),{duration:.7});open(e)}));resizeMap()}
    rows.forEach(e=>{const m=e.zh.meta.map,marker=L.marker([m.lat,m.lng]).bindTooltip(e.zh?.title||'窑址',{direction:'top'}).on('click',()=>open(e));markers.set(e,marker)});
    document.getElementById('global-kiln-search').addEventListener('input',render);document.querySelectorAll('.global-kiln-map-toolbar button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.global-kiln-map-toolbar button').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');render()}));render();
  }
  async function boot(){if(!window.JDM_KNOWLEDGE)return;init(await window.JDM_KNOWLEDGE.all())}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
