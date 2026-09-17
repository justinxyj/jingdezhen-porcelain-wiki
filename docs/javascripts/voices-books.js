/* Public-facing reception archive: normalize, deduplicate, then render. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const clean=s=>plain(s).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/�|ï¿½/g,'').replace(/\s+/g,' ').trim();
  const meta=e=>e?.zh?.meta||{};
  const isPerson=e=>e.category==='人物';
  const isLiterature=e=>e.category==='文献';
  const pick=(m,keys)=>keys.map(k=>m?.[k]).find(v=>typeof v==='string'&&clean(v));
  function quoteOf(e){const m=meta(e);return pick(m,['quote','quotation','evaluation','voiceQuote','assessment','review','评价','引文','原话'])||'';}
  function titleOf(e){return clean(e?.zh?.title||e?.slug||'未命名');}
  function quality(e){const m=meta(e),q=clean(quoteOf(e)),t=titleOf(e),s=(e.sources||[]).find(x=>x&&typeof x==='object'&&(x.url||x.label||x.title));return (q?4:0)+(t?2:0)+(m.quote_work?1:0)+(s?.url?2:0)+(m.quote_context?1:0);}
  function hasReception(e){const q=clean(quoteOf(e));const all=JSON.stringify(e?.zh||{});return !!q&&q.length>=8&&!/�|ï¿½/.test(all);}
  function dedupe(entries){
    const groups=new Map();
    entries.filter(hasReception).forEach(e=>{
      const m=meta(e),q=clean(quoteOf(e)).toLowerCase(),title=titleOf(e).toLowerCase(),src=(e.sources||[]).find(x=>x&&typeof x==='object'&&x.url)?.url||'';
      const key=`${q}|${src}|${title}`;
      const prev=groups.get(key);if(!prev||quality(e)>quality(prev))groups.set(key,e);
    });
    return [...groups.values()];
  }
  function sourceOf(e,type){
    const m=meta(e),s=(e.sources||[]).find(x=>x&&typeof x==='object'&&(x.url||x.label||x.title));
    if(type==='literature')return {url:s?.url||'',label:clean(s?.label||s?.title||(m.author?`${m.author}《${titleOf(e)}》`:`《${titleOf(e)}》`))};
    return {url:s?.url||'',label:clean(s?.label||s?.title||m.work||m.source||'人物相关资料')};
  }
  function personName(e){const m=meta(e);return clean(m.name||m.person||m.author||titleOf(e));}
  function eraValue(e){return clean(meta(e).era||meta(e).period||'');}
  function sortEntries(a,b){return eraValue(a).localeCompare(eraValue(b),'zh-CN')||titleOf(a).localeCompare(titleOf(b),'zh-CN');}
  function resolveImage(raw){
    const value=clean(raw); if(!value)return '';
    if(/^https:\/\/collectionapi\.metmuseum\.org\/api\/collection\/v1\/iiif\/42490\/177595\/main-image(?:\?.*)?$/.test(value)) return '';
    return value;
  }
  function card(e,i,type){
    const m=meta(e),rawIm=e.media?.[0],im=resolveImage(rawIm?.path),q=clean(quoteOf(e)),src=sourceOf(e,type),translation=clean(m.quote_translation||m.translation||'');
    const title=type==='literature'?titleOf(e):personName(e),relation=type==='literature'?'书中评价':'名人评价';
    const speaker=type==='literature'?clean(m.author||'作者'):'';
    return `<article class="reception-card ${type==='person'?'reception-person-card':'reception-text-card'}" data-index="${i}"><div class="reception-card-main">${im?`<img class="reception-thumb" src="${esc(im)}" alt="${esc(rawIm?.title||title)}" loading="lazy" decoding="async">`:''}<div class="reception-context"><div class="reception-card-top"><span class="reception-type">${relation}</span>${eraValue(e)?`<span class="reception-era">${esc(eraValue(e))}</span>`:''}</div><blockquote>“${esc(q)}”</blockquote>${translation?`<p class="reception-translation">${esc(translation)}</p>`:''}<h3>${esc(title)}</h3>${speaker?`<p class="reception-speaker">${esc(speaker)}</p>`:''}${m.quote_work?`<p class="reception-work">${esc(clean(m.quote_work))}</p>`:''}${m.quote_context?`<p class="reception-context-note">${esc(clean(m.quote_context))}</p>`:''}<div class="reception-source"><span>来源</span>${src.url?`<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label)} ↗</a>`:`<span>${esc(src.label)}</span>`}</div></div></div></article>`;
  }
  function init(){
    const root=document.getElementById('voices-books-root');if(!root||!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const people=dedupe(entries.filter(isPerson)).sort(sortEntries),books=dedupe(entries.filter(isLiterature)).sort(sortEntries),all=[...people.map(e=>({e,t:'person'})),...books.map(e=>({e,t:'literature'}))];
      root.innerHTML=`<div class="reception-intro"><span class="reception-kicker">VOICES · 评价史</span><h2>先读评价，再看出处。</h2><p>这里以可核验的原话为入口，并把人物、作品、时代、语境与来源分开呈现。重复记录与含乱码的记录不会直接出现在公开列表。</p></div><div class="reception-tabs"><button class="is-active" data-view="all">全部评价 · ${all.length}</button><button data-view="literature">书中评价 · ${books.length}</button><button data-view="person">名人评价 · ${people.length}</button></div><div class="reception-grid" id="reception-grid">${all.map((x,i)=>card(x.e,i,x.t)).join('')}</div><div class="reception-empty" id="reception-empty" hidden>目前还没有可展示的评价。</div>`;
      const grid=root.querySelector('#reception-grid'),empty=root.querySelector('#reception-empty'),tabs=[...root.querySelectorAll('.reception-tabs button')];
      function apply(view){let count=0;[...grid.children].forEach(el=>{const p=el.classList.contains('reception-person-card');const ok=view==='all'||(view==='person'&&p)||(view==='literature'&&!p);el.hidden=!ok;if(ok)count++});empty.hidden=count>0;}
      tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');apply(b.dataset.view)}));apply('all');
    }).catch(err=>{console.warn('[JDM reception]',err);root.innerHTML='<div class="reception-empty">评价资料暂时无法加载，请稍后再试。</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
