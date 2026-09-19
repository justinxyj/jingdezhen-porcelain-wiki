/* Public museum surfaces. Internal identifiers never render in the interface. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const path=p=>ROOT+p.replace(/^\//,'');
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||path(`entry/?type=${encodeURIComponent(e?.category||'')}&slug=${encodeURIComponent(e?.slug||'')}`);
  function text(e){return plain(e?.zh?.summary||e?.zh?.content||'')}
  function meta(e){return e?.zh?.meta||{}}
  function relationLinks(rows,label){
    return rows.slice(0,3).map(e=>'<a href="'+entryUrl(e)+'">'+esc(e.zh?.title||e.slug)+'</a>').join('');
  }
  function renderCatalog(items){
    const root=document.getElementById('catalog-list');if(!root)return;
    const q=(document.getElementById('catalog-search')?.value||'').trim().toLowerCase();
    const era=(document.getElementById('catalog-era')?.value||'').trim();
    const craft=(document.getElementById('catalog-craft')?.value||'').trim();
    const type=(document.getElementById('catalog-type')?.value||'').trim();
    const filtered=items.filter(x=>{
      const e=x.entry,m=meta(e),hay=JSON.stringify(e.zh||'').toLowerCase();
      const timeline=x.timeline||[];
      const eraOk=!era||timeline.some(t=>t?.era===era);
      const craftText=String(x.craft||m.craft||'').toLowerCase();
      const craftOk=!craft||craftText.includes(craft.toLowerCase())||x.craftProcesses?.some(p=>String(p.label||'').toLowerCase().includes(craft.toLowerCase()));
      const typeText=String(m.kind||m.type||e.category||'').toLowerCase();
      const typeOk=!type||typeText.includes(type.toLowerCase());
      return (!q||hay.includes(q))&&eraOk&&craftOk&&typeOk;
    });
    const count=document.getElementById('catalog-count');if(count)count.textContent='显示 '+filtered.length+' / '+items.length+' 件器物';
    root.innerHTML=filtered.map(x=>{
      const e=x.entry,im=e.media?.[0],m=meta(e),world=(x.worlds||[])[0],era=(x.timeline||[]).map(t=>t?.era).filter(Boolean)[0];
      const people=relationLinks(x.people,'人物'),kilns=relationLinks(x.kilns,'窑址'),docs=relationLinks(x.documents,'文献');
      const crafts=(x.craftProcesses||[]).slice(0,3).map(p=>'<a href="'+path('craft/technology-tree/')+'">'+esc(p.label||'工艺')+'</a>').join('');
      const global=path('network/global/?slug='+encodeURIComponent(e.slug));
      return '<article class="catalog-card catalog-card-v2">'+
        (im?'<a href="'+entryUrl(e)+'"><img data-museum-image="1" src="'+esc(im.path)+'" alt="'+esc(im.title||e.zh?.title||'器物图片')+'" loading="lazy"></a>':'')+
        '<div class="catalog-card-body">'+
        '<div class="catalog-card-tags">'+(m.period?'<span class="tag">'+esc(m.period)+'</span>':'')+(era?'<span class="tag">'+esc(eraLabel(era))+'</span>':'')+(world?'<span class="tag">'+esc(world.short_title||world.title)+'</span>':'')+'</div>'+
        '<h3><a href="'+entryUrl(e)+'">'+esc(e.zh?.title||'未命名器物')+'</a></h3><p>'+esc(text(e).slice(0,180))+'</p>'+
        (crafts?'<div class="catalog-knowledge-row"><b>工艺</b>'+crafts+'</div>':'')+
        (people?'<div class="catalog-knowledge-row"><b>人物</b>'+people+'</div>':'')+
        (kilns?'<div class="catalog-knowledge-row"><b>窑址</b>'+kilns+'</div>':'')+
        (docs?'<div class="catalog-knowledge-row"><b>文献</b>'+docs+'</div>':'')+
        '<div class="catalog-card-actions"><a href="'+entryUrl(e)+'">查看知识条目 →</a><a href="'+global+'">全球网络 →</a></div></div></article>';
    }).join('')||'<div class="notice">没有找到符合条件的器物。</div>';
  }
  function eraLabel(x){return ({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清','near-modern':'近代',modern:'现代'}[x]||x||'')}

  function renderPeople(items){
    const root=document.getElementById('people-list');if(!root)return;
    const q=(document.getElementById('people-search')?.value||'').trim().toLowerCase();
    const era=(document.getElementById('people-era')?.value||'').trim();
    const role=(document.getElementById('people-role')?.value||'').trim();
    const world=(document.getElementById('people-world')?.value||'').trim();
    const filtered=items.filter(x=>{
      const e=x.entry,m=meta(e),hay=JSON.stringify(e.zh||'').toLowerCase();
      const eraOk=!era||String(x.era||'').includes(era);
      const roleText=String(x.role||m.role||'').toLowerCase();
      const roleOk=!role||roleText.includes(role.toLowerCase());
      const worldOk=!world||(x.worlds||[]).some(w=>w.slug===world);
      return (!q||hay.includes(q))&&eraOk&&roleOk&&worldOk;
    });
    const count=document.getElementById('people-count');if(count)count.textContent='显示 '+filtered.length+' / '+items.length+' 位人物';
    root.innerHTML=filtered.map(x=>{
      const e=x.entry,im=e.media?.[0],m=meta(e);
      const works=relationLinks(x.works,'代表作品'),kilns=relationLinks(x.kilns,'窑址'),docs=relationLinks(x.documents,'文献');
      const craft=(x.craftProcesses||[]).slice(0,3).map(p=>'<a href="'+path('craft/technology-tree/')+'">'+esc(p.label||'工艺')+'</a>').join('');
      const same=(x.sameEra||[]).slice(0,3).map(p=>'<a href="'+entryUrl(p)+'">'+esc(p.zh?.title||p.slug)+'</a>').join('');
      const global=path('network/global/?slug='+encodeURIComponent(e.slug));
      const relation=(x.relatedPeople||[]).slice(0,3).map(p=>'<a href="'+entryUrl(p)+'">'+esc(p.zh?.title||p.slug)+'</a>').join('');
      return '<article class="person-card person-card-v2">'+
        (im?'<a href="'+entryUrl(e)+'" class="person-card-image"><img data-museum-image="1" src="'+esc(im.path)+'" alt="'+esc(im.title||e.zh?.title||'人物图片')+'" loading="lazy"></a>':'')+
        '<div class="person-card-body">'+
        '<div class="person-card-tags">'+(x.era?'<span class="tag">'+esc(x.era)+'</span>':'')+(x.worlds?.[0]?'<span class="tag">'+esc(x.worlds[0].short_title||x.worlds[0].title)+'</span>':'')+'</div>'+
        '<h3><a href="'+entryUrl(e)+'">'+esc(e.zh?.title||'未命名人物')+'</a></h3>'+
        (x.role?'<strong>'+esc(x.role)+'</strong>':'')+
        '<p>'+esc(text(e).slice(0,180))+'</p>'+
        (craft?'<div class="person-knowledge-row"><b>工艺</b>'+craft+'</div>':'')+
        (works?'<div class="person-knowledge-row"><b>作品</b>'+works+'</div>':'')+
        (kilns?'<div class="person-knowledge-row"><b>窑址</b>'+kilns+'</div>':'')+
        (docs?'<div class="person-knowledge-row"><b>文献</b>'+docs+'</div>':'')+
        (relation?'<div class="person-knowledge-row"><b>关联人物</b>'+relation+'</div>':'')+
        (same?'<div class="person-knowledge-row"><b>同时代</b>'+same+'</div>':'')+
        '<div class="person-card-actions"><a href="'+entryUrl(e)+'">查看知识条目 →</a><a href="'+global+'">全球网络 →</a></div></div></article>';
    }).join('')||'<div class="notice">没有找到符合条件的人物。</div>';
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
  let initSeq=0;
  async function init(){
    const seq=++initSeq;
    if(!window.JDM_KNOWLEDGE)return;
    const roots=[document.getElementById('catalog-list'),document.getElementById('people-list'),document.getElementById('timeline')];
    try{
      const [objects,people,history]=await Promise.all([
        window.JDM_KNOWLEDGE.objectAtlas({limit:250}),
        window.JDM_KNOWLEDGE.personAtlas({limit:250}),
        window.JDM_KNOWLEDGE.list({limit:500})
      ]);
      if(seq!==initSeq)return;
      renderCatalog(objects);renderPeople(people);renderTimeline(history);
      const search=document.getElementById('catalog-search');if(search&&!search.dataset.bound){search.dataset.bound='1';let raf=0;search.addEventListener('input',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>renderCatalog(objects))})}
      ['catalog-era','catalog-craft','catalog-type'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>renderCatalog(objects)));
      const personSearch=document.getElementById('people-search');if(personSearch&&!personSearch.dataset.bound){personSearch.dataset.bound='1';let raf=0;personSearch.addEventListener('input',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>renderPeople(people))})}
      ['people-era','people-role','people-world'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>renderPeople(people)));
    }catch(error){if(seq===initSeq)roots.forEach(root=>renderError(root,error))}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
