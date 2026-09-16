/* Public museum surfaces. Internal identifiers never render in the interface. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const path=p=>ROOT+p.replace(/^\//,'');
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||path(`entry/?type=${encodeURIComponent(e?.category||'')}&slug=${encodeURIComponent(e?.slug||'')}`);
  function text(e){return plain(e?.zh?.summary||e?.zh?.content||'')}
  function meta(e){return e?.zh?.meta||{}}
  function renderCatalog(entries){
    const root=document.getElementById('catalog-list');if(!root)return;
    const q=(document.getElementById('catalog-search')?.value||'').trim().toLowerCase();
    const items=entries.filter(e=>!q||JSON.stringify(e.zh||{}).toLowerCase().includes(q));
    root.innerHTML=items.map(e=>{const im=e.media?.[0],m=meta(e);return `<a class="catalog-card wiki-card-link" href="${entryUrl(e)}">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||'器物图片')}" loading="lazy">`:''}${m.period?`<div class="tag">${esc(m.period)}</div>`:''}<div class="tag">${esc(m.craft||e.category||'器物')}</div><h3>${esc(e.zh?.title||'未命名器物')}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">查看完整条目 →</span></a>`}).join('')||'<div class="notice">没有找到匹配器物。</div>';
  }
  function renderPeople(entries){
    const root=document.getElementById('people-list');if(!root)return;
    root.innerHTML=entries.map(e=>{const im=e.media?.[0],m=meta(e);return `<a class="person-card wiki-card-link" href="${entryUrl(e)}">${im?`<div class="person-card-image"><img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||'人物图片')}" loading="lazy"></div>`:''}${m.era||m.period?`<div class="tag">${esc(m.era||m.period)}</div>`:''}<h3>${esc(e.zh?.title||'未命名人物')}</h3><strong>${esc(m.role||'人物')}</strong><p>${esc(text(e))}</p><span class="wiki-read-more">查看人物条目 →</span></a>`}).join('')||'<div class="notice">暂无人物内容。</div>';
  }
  function renderTimeline(entries){
    const root=document.getElementById('timeline');if(!root)return;
    const rows=entries.filter(e=>meta(e).kind==='history').sort((a,b)=>String(meta(a).period||'').localeCompare(String(meta(b).period||''),'zh-CN'));
    root.innerHTML=`<div class="timeline">${rows.map(e=>`<a class="timeline-item timeline-link" href="${entryUrl(e)}"><div class="timeline-year">${esc(meta(e).period||'')}</div><h3>${esc(e.zh?.title||'未命名节点')}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">打开详情 →</span></a>`).join('')}</div>`;
  }
  async function init(){if(!window.JDM_KNOWLEDGE)return;const entries=await window.JDM_KNOWLEDGE.all();const objects=entries.filter(e=>e.category==='器物'),people=entries.filter(e=>e.category==='人物');renderCatalog(objects);renderPeople(people);renderTimeline(entries);const search=document.getElementById('catalog-search');if(search)search.addEventListener('input',()=>renderCatalog(objects))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
