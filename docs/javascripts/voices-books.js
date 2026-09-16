/* Public-facing reception archive: quotations first, sources second. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const meta=e=>e?.zh?.meta||{};
  const isPerson=e=>e.category==='人物';
  const isLiterature=e=>e.category==='文献';
  const pick=(m,keys)=>keys.map(k=>m?.[k]).find(v=>typeof v==='string'&&v.trim());
  function quoteOf(e){const m=meta(e);return pick(m,['quote','quotation','evaluation','voiceQuote','assessment','review','评价','引文','原话'])||'';}
  function titleOf(e){return e?.zh?.title||e?.slug||'未命名';}
  function hasReception(e){const q=quoteOf(e);return !!q&&q.trim().length>=8;}
  function sourceOf(e,type){
    const m=meta(e);
    const s=(e.sources||[]).find(x=>x&&typeof x==='object'&&(x.url||x.label||x.title));
    if(type==='literature') return {url:s?.url||'',label:s?.label||s?.title||(m.author?`${m.author}《${titleOf(e)}》`:`《${titleOf(e)}》`)};
    return {url:s?.url||'',label:s?.label||s?.title||m.work||m.source||'人物相关资料'};
  }
  function personName(e){const m=meta(e);return m.name||m.person||m.author||titleOf(e);}
  function card(e,i,type){
    const m=meta(e),im=e.media?.[0],q=quoteOf(e),src=sourceOf(e,type);
    const title=type==='literature'?titleOf(e):personName(e);
    const speaker=type==='literature'?(m.author||'作者'):titleOf(e);
    const relation=type==='literature'?'书中评价':'名人评价';
    return `<article class="reception-card ${type==='person'?'reception-person-card':'reception-text-card'}" data-index="${i}"><div class="reception-card-main">${im?`<img class="reception-thumb" src="${esc(im.path)}" alt="${esc(im.title||title)}" loading="lazy">`:''}<div class="reception-context"><span class="reception-type">${relation}</span>${m.era||m.period?`<span class="reception-era">${esc(m.era||m.period)}</span>`:''}<blockquote>“${esc(plain(q))}”</blockquote><h3>${esc(title)}</h3><p class="reception-speaker">${esc(speaker)}</p><div class="reception-source"><span>来源</span>${src.url?`<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label)} ↗</a>`:`<span>${esc(src.label)}</span>`}</div></div></div></article>`;
  }
  function init(){
    const root=document.getElementById('voices-books-root');
    if(!root||!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const people=entries.filter(isPerson).filter(hasReception);
      const books=entries.filter(isLiterature).filter(hasReception);
      root.innerHTML=`<div class="reception-intro"><span class="reception-kicker">VOICES · 评价史</span><h2>先读评价，再看出处。</h2><p>这里的主角是“评价”本身。书籍、人物与文献只是来源；页面首先呈现关于景德镇的原话。</p></div><div class="reception-tabs"><button class="is-active" data-view="all">全部评价</button><button data-view="literature">书中评价</button><button data-view="person">名人评价</button></div><div class="reception-grid" id="reception-grid">${people.map((e,i)=>card(e,i,'person')).join('')}${books.map((e,i)=>card(e,people.length+i,'literature')).join('')}</div><div class="reception-empty" id="reception-empty" hidden>目前还没有可展示的评价。</div>`;
      const grid=root.querySelector('#reception-grid'),empty=root.querySelector('#reception-empty'),tabs=[...root.querySelectorAll('.reception-tabs button')];
      function apply(view){let count=0;[...grid.children].forEach(el=>{const p=el.classList.contains('reception-person-card');const ok=view==='all'||(view==='person'&&p)||(view==='literature'&&!p);el.style.display=ok?'':'none';if(ok)count++});empty.hidden=count>0;}
      tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');apply(b.dataset.view)}));
      apply('all');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
