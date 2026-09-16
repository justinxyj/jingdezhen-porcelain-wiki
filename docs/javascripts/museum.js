/* Museum surfaces are projections of the canonical entries + media store. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const path=p=>ROOT+p.replace(/^\//,'');
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||path(`entry/?type=${encodeURIComponent(e?.category||'')}&slug=${encodeURIComponent(e?.slug||'')}`);
  function text(e){return e?.zh?.summary||e?.zh?.content||''}
  function meta(e){return e?.zh?.meta||{}}
  function renderCatalog(entries){
    const root=document.getElementById('catalog-list');if(!root)return;
    const q=(document.getElementById('catalog-search')?.value||'').trim().toLowerCase();
    const items=entries.filter(e=>!q||JSON.stringify(e.zh||{}).toLowerCase().includes(q)||e.slug.includes(q));
    root.innerHTML=items.map(e=>{const im=e.media?.[0];return `<a class="catalog-card wiki-card-link" href="${entryUrl(e)}">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}" loading="lazy">`:''}<div class="tag">${esc(e.slug)}</div><div class="tag">${esc(e.zh?.meta?.period||'')}</div><div class="tag">${esc(e.zh?.meta?.craft||e.category)}</div><h3>${esc(e.zh?.title||e.slug)}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">查看完整条目 →</span></a>`}).join('')||'<div class="notice">没有找到匹配器物。</div>';
  }
  function renderPeople(entries){
    const root=document.getElementById('people-list');if(!root)return;
    root.innerHTML=entries.map(e=>{const im=e.media?.[0];return `<a class="person-card wiki-card-link" href="${entryUrl(e)}">${im?`<div class="person-card-image"><img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}" loading="lazy"></div>`:''}<div class="tag">${esc(e.zh?.meta?.era||e.zh?.meta?.period||'知识条目')}</div><h3>${esc(e.zh?.title||e.slug)}</h3><strong>${esc(e.zh?.meta?.role||'人物')}</strong><p>${esc(text(e))}</p><span class="wiki-read-more">查看人物条目 →</span></a>`}).join('');
  }
  function renderTimeline(entries){
    const root=document.getElementById('timeline');if(!root)return;
    const rows=entries.filter(e=>meta(e).kind==='history').sort((a,b)=>String(a.zh?.meta?.period||a.slug).localeCompare(String(b.zh?.meta?.period||b.slug),'zh-CN'));
    root.innerHTML=`<div class="timeline">${rows.map(e=>`<a class="timeline-item timeline-link" href="${entryUrl(e)}"><div class="timeline-year">${esc(e.zh?.meta?.period||'')}</div><h3>${esc(e.zh?.title||e.slug)}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">打开知识条目 →</span></a>`).join('')}</div>`;
  }
  function initMap(entries){
    const root=document.getElementById('kiln-map');if(!root||typeof L==='undefined')return;
    const rows=entries.filter(e=>meta(e).map?.lat!=null&&meta(e).map?.lng!=null);
    const map=L.map(root).setView([29.35,117.30],3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
    rows.forEach(e=>{const m=meta(e).map;L.marker([m.lat,m.lng]).addTo(map).bindPopup(`<a href="${entryUrl(e)}"><b>${esc(e.zh?.title||e.slug)}</b></a><br>${esc(m.country||'')} · ${esc(m.period||'')}<br>${esc(text(e))}`)});
  }
  async function init(){
    if(!window.JDM_KNOWLEDGE)return;
    const entries=await window.JDM_KNOWLEDGE.all();
    const objects=entries.filter(e=>e.category==='器物'),people=entries.filter(e=>e.category==='人物');
    renderCatalog(objects);renderPeople(people);renderTimeline(entries);initMap(entries.filter(e=>e.category==='窑址'));
    const search=document.getElementById('catalog-search');if(search)search.addEventListener('input',()=>renderCatalog(objects));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
