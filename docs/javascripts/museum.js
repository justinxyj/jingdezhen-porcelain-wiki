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
    root.innerHTML=items.map(e=>{const im=e.media?.[0],m=meta(e);return `<a class="catalog-card wiki-card-link" href="${entryUrl(e)}">${im?`<img data-museum-image="1" src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||'器物图片')}" loading="lazy">`:''}${m.period?`<div class="tag">${esc(m.period)}</div>`:''}<div class="tag">${esc(m.craft||e.category||'器物')}</div><h3>${esc(e.zh?.title||'未命名器物')}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">查看完整条目 →</span></a>`}).join('')||'<div class="notice">没有找到匹配器物。</div>';
  }
  function renderPeople(entries){
    const root=document.getElementById('people-list');if(!root)return;
    root.innerHTML=entries.map(e=>{const im=e.media?.[0],m=meta(e);return `<a class="person-card wiki-card-link" href="${entryUrl(e)}">${im?`<div class="person-card-image"><img data-museum-image="1" src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||'人物图片')}" loading="lazy"></div>`:''}${m.era||m.period?`<div class="tag">${esc(m.era||m.period)}</div>`:''}<h3>${esc(e.zh?.title||'未命名人物')}</h3><strong>${esc(m.role||'人物')}</strong><p>${esc(text(e))}</p><span class="wiki-read-more">查看人物条目 →</span></a>`}).join('')||'<div class="notice">暂无人物内容。</div>';
  }
  function timelineSortKey(e){
    const title=String(e?.zh?.title||''),m=meta(e),timeline=Array.isArray(m.timeline)?m.timeline:[];
    const structured=Number(m.timeline_sort_year);
    if(Number.isFinite(structured))return [structured,title];
    const yearMatch=title.match(/(\\d{3,4})/);
    if(yearMatch)return [Number(yearMatch[1]),title];
    const era=timeline[0]?.era||'';
    const eraRank={tang:1000,song:2000,yuan:3000,ming:4000,qing:5000,modern:6000};
    if(/东晋/.test(title))return [300,title];
    if(/五代/.test(title))return [907,title];
    return [eraRank[era]??900000,title];
  }
  function renderTimeline(entries){
    const root=document.getElementById('timeline');if(!root)return;
    const rows=entries.filter(e=>meta(e).kind==='history').sort((a,b)=>{
      const ka=timelineSortKey(a),kb=timelineSortKey(b);
      if(ka[0]!==kb[0])return ka[0]-kb[0];
      return ka[1].localeCompare(kb[1],'zh-CN');
    });
    root.innerHTML=`<div class="timeline">${rows.map(e=>`<a class="timeline-item timeline-link" href="${entryUrl(e)}"><div class="timeline-year">${esc(meta(e).period||String(e.zh?.title||'').match(/\\d{3,4}(?:[—–-]\\d{3,4})?/u)?.[0]||'')}</div><h3>${esc(e.zh?.title||'未命名节点')}</h3><p>${esc(text(e))}</p><span class="wiki-read-more">打开详情 →</span></a>`).join('')}</div>`;
  }
  function renderError(root,error){
    if(!root)return;
    const code=esc(error?.code||error?.status||'NETWORK');
    root.innerHTML='<div class="notice" role="alert">知识数据暂时无法加载（'+code+'）。<button type="button" class="jdm-retry">重新加载</button></div>';
    root.querySelector('.jdm-retry')?.addEventListener('click',()=>init());
  }
  async function init(){
    if(!window.JDM_KNOWLEDGE)return;
    const roots=[document.getElementById('catalog-list'),document.getElementById('people-list'),document.getElementById('timeline')];
    try{
      const [objects,people,history]=await Promise.all([
        window.JDM_KNOWLEDGE.byCategory('器物',250),
        window.JDM_KNOWLEDGE.byCategory('人物',250),
        window.JDM_KNOWLEDGE.list({limit:500})
      ]);
      renderCatalog(objects);renderPeople(people);renderTimeline(history);
      const search=document.getElementById('catalog-search');if(search&&!search.dataset.bound){search.dataset.bound='1';search.addEventListener('input',()=>renderCatalog(objects))}
    }catch(error){roots.forEach(root=>renderError(root,error))}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
