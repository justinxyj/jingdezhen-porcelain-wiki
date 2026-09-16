/* Public-facing reception archive: quotations first, sources second. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const meta=e=>e?.zh?.meta||{};
  const isPerson=e=>e.category==='人物';
  const isLiterature=e=>e.category==='文献';
  const hasReception=e=>!!(meta(e).quote||meta(e).quotation||meta(e).evaluation||meta(e).voiceQuote||meta(e).assessment||meta(e).review);
  function quoteOf(e){const m=meta(e);return m.quote||m.quotation||m.evaluation||m.voiceQuote||m.assessment||m.review||plain(e.zh?.content||e.zh?.summary||'');}
  function titleOf(e){return e?.zh?.title||e?.slug||'未命名';}
  function sourceOf(e){const m=meta(e);const s=(e.sources||[]).find(x=>x&&typeof x==='object'&&x.url);return {url:s?.url||'',label:s?.label||s?.title||(m.author?`${m.author}《${titleOf(e)}》`:`《${titleOf(e)}》`)};}
  function card(e,i,type){
    const m=meta(e),im=e.media?.[0],q=quoteOf(e),src=sourceOf(e);
    const subject=type==='literature'?'书中评价':'人物评价';
    const title=titleOf(e);
    const attribution=type==='literature'?(m.author?`作者：${m.author}`:'书籍 / 文献'):(m.role?m.role:'人物');
    return `<article class="reception-card ${type==='person'?'reception-person-card':'reception-text-card'}" data-index="${i}"><div class="reception-card-main">${im?`<img class="reception-thumb" src="${esc(im.path)}" alt="${esc(im.title||title)}" loading="lazy">`:''}<div class="reception-context"><span class="reception-type">${subject}</span>${m.era||m.period?`<span class="reception-era">${esc(m.era||m.period)}</span>`:''}<blockquote>“${esc(plain(q))}”</blockquote><h3>${esc(title)}</h3><p class="reception-speaker">${esc(attribution)}</p><div class="reception-source"><span>来源</span>${src.url?`<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label)} ↗</a>`:`<span>${esc(src.label)}</span>`}</div></div></div></article>`;
  }
  function init(){
    const root=document.getElementById('voices-books-root');
    if(!root||!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const people=entries.filter(isPerson).filter(hasReception);
      const books=entries.filter(isLiterature).filter(hasReception);
      root.innerHTML=`<div class="reception-intro"><span class="reception-kicker">VOICES · 评价史</span><h2>先读评价，再看出处。</h2><p>这里的主角是“评价”本身。每一条记录先呈现关于景德镇的原文，再在下方标明说话的人、书籍或文献来源。</p></div><div class="reception-tabs"><button class="is-active" data-view="all">全部评价</button><button data-view="literature">书籍与文献</button><button data-view="person">名人评价</button></div><div class="reception-grid" id="reception-grid">${books.map((e,i)=>card(e,i,'literature')).join('')}${people.map((e,i)=>card(e,books.length+i,'person')).join('')}</div><div class="reception-empty" id="reception-empty" hidden>目前还没有可展示的评价。</div>`;
      const grid=root.querySelector('#reception-grid'),empty=root.querySelector('#reception-empty'),tabs=[...root.querySelectorAll('.reception-tabs button')];
      function apply(view){let count=0;[...grid.children].forEach(el=>{const p=el.classList.contains('reception-person-card');const ok=view==='all'||(view==='person'&&p)||(view==='literature'&&!p);el.style.display=ok?'':'none';if(ok)count++});empty.hidden=count>0;}
      tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');apply(b.dataset.view)}));
      apply('all');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
