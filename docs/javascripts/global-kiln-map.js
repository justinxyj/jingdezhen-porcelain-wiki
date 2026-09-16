/* Global kiln atlas = spatial projection of the same canonical entries + media store. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const wiki=t=>`https://zh.wikipedia.org/wiki/${encodeURIComponent(t||'')}`;
  const ROOT='/jingdezhen-porcelain-wiki/';
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||`${ROOT}entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`;
  function init(entries){
    const root=document.getElementById('kiln-map');if(!root||typeof L==='undefined')return;
    const rows=entries.filter(e=>e.category==='窑址'&&e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null);
    root.innerHTML=`<div class="global-kiln-map-toolbar"><input id="global-kiln-search" placeholder="搜索窑址、国家、年代或类型……"><div><button class="is-active" data-region="all">全部</button><button data-region="中国">中国</button><button data-region="东亚">东亚</button><button data-region="全球">全球</button></div></div><div id="global-kiln-map-canvas" class="global-kiln-map-canvas"></div><div id="global-kiln-list" class="global-kiln-list"></div><div id="global-kiln-modal"></div>`;
    const map=L.map('global-kiln-map-canvas').setView([25,110],2);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    const markers=new Map();
    const region=e=>{const c=e.zh?.meta?.map?.country||'';if(c.startsWith('中国'))return '中国';if(c.includes('韩国')||c.includes('日本'))return '东亚';return '全球'};
    function visible(e,q,r){const hay=JSON.stringify(e.zh||{}).toLowerCase();return (!q||hay.includes(q))&&(r==='all'||region(e)===r)}
    function open(e){
      const m=e.zh?.meta?.map||{},im=e.media?.[0],wikiTitle=e.zh?.meta?.wikiTitle||e.zh?.title||e.slug;
      const modal=document.getElementById('global-kiln-modal');
      modal.innerHTML=`<div class="global-kiln-modal"><div class="global-kiln-backdrop" data-close></div><article class="global-kiln-dialog"><button class="global-kiln-close" data-close>×</button><div class="global-kiln-image">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}"><small>${esc(im.source||'后端媒体资料')}</small>`:'<span>该条目暂未配置图片</span>'}</div><div class="global-kiln-content"><div class="global-kiln-tags"><span>${esc(m.country||'')}</span><span>${esc(m.period||'')}</span><span>${esc(m.type||'窑业中心')}</span></div><h2>${esc(e.zh?.title||e.slug)}</h2><p class="global-kiln-intro">${esc(e.zh?.content||'')}</p><div class="global-kiln-ai"><b>知识库摘要</b><p>${esc(e.zh?.summary||'')}</p><small>地图是同一后端知识条目的空间投影。</small></div><div class="global-kiln-links"><a href="${entryUrl(e)}">进入统一知识条目 →</a><a href="${wiki(wikiTitle)}" target="_blank" rel="noopener">维基百科 ↗</a>${e.sources?.[0]?.url?`<a href="${esc(e.sources[0].url)}" target="_blank" rel="noopener">权威来源 ↗</a>`:''}</div></div></article></div>`;
      modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>{modal.innerHTML='';document.body.classList.remove('global-kiln-open')}));document.body.classList.add('global-kiln-open');
    }
    function render(){
      const q=(document.getElementById('global-kiln-search')?.value||'').trim().toLowerCase();const active=document.querySelector('.global-kiln-map-toolbar button.is-active')?.dataset.region||'all';
      markers.forEach((marker,e)=>{if(visible(e,q,active))marker.addTo(map);else map.removeLayer(marker)});
      const list=document.getElementById('global-kiln-list');list.innerHTML=rows.filter(e=>visible(e,q,active)).map(e=>{const m=e.zh.meta.map;return `<button class="global-kiln-list-item" data-slug="${esc(e.slug)}"><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(m.country||'')} · ${esc(m.period||'')}</span></button>`}).join('');
      list.querySelectorAll('[data-slug]').forEach(btn=>btn.addEventListener('click',()=>{const e=rows.find(x=>x.slug===btn.dataset.slug);if(!e)return;const m=e.zh.meta.map;map.flyTo([m.lat,m.lng],Math.max(map.getZoom(),5),{duration:.7});open(e)}));
    }
    rows.forEach(e=>{const m=e.zh.meta.map;const marker=L.marker([m.lat,m.lng]).bindTooltip(e.zh?.title||e.slug,{direction:'top'}).on('click',()=>open(e));markers.set(e,marker)});
    document.getElementById('global-kiln-search').addEventListener('input',render);document.querySelectorAll('.global-kiln-map-toolbar button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.global-kiln-map-toolbar button').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');render()}));render();
  }
  async function boot(){if(!window.JDM_KNOWLEDGE)return;init(await window.JDM_KNOWLEDGE.all())}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
