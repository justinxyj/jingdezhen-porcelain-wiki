/* Dynamic seven-world browser: world identity, live counts, representative entries and cross-world paths. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const worldUrl=slug=>ROOT+({'history':'history/','craft':'craft/','objects':'objects/','space':'kilns/','people':'people/','research':'research/','contemporary':'contemporary/'}[slug]||'');
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  function render(root,data){
    const {world,items,primary,secondary,categories,connections,featured}=data;
    const connected=connections.length?'<div class="jdm-world-connections"><span class="jdm-world-overview-eyebrow">CONNECTED WORLDS</span>'+connections.map(w=>'<a class="jdm-world-connection" href="'+worldUrl(w.slug)+'">'+esc(w.short_title||w.title)+' <b>'+w.count+'</b></a>').join('')+'</div>':'';
    const featuredHtml=featured.length?'<div class="jdm-world-featured"><div class="jdm-world-featured-head"><strong>代表性入口</strong><span>'+esc(categories.join(' · '))+'</span></div><div class="jdm-world-featured-grid">'+featured.map(e=>'<a class="jdm-world-featured-card" href="'+url(e)+'"><span>'+esc(e.worldRole==='primary'?'核心条目':'关联入口')+' · '+esc(e.category)+'</span><b>'+esc(e.zh?.title||e.slug)+'</b></a>').join('')+'</div></div>':'';
    root.innerHTML='<div class="jdm-world-overview"><div class="jdm-world-overview-main"><div><div class="jdm-world-overview-eyebrow">KNOWLEDGE WORLD · '+esc(String(world.short_title||world.title||'').toUpperCase())+'</div><h2>'+esc(world.title)+'</h2><p>'+esc(world.description||'')+'</p></div><div class="jdm-world-overview-stats"><div class="jdm-world-search-link"><a href="/jingdezhen-porcelain-wiki/search/">⌕ 搜索整个 Entry 知识库</a></div><div class="jdm-world-stat"><strong>'+primary+'</strong><span>核心条目</span></div><div class="jdm-world-stat"><strong>'+secondary+'</strong><span>跨世界入口</span></div><div class="jdm-world-stat"><strong>'+items.length+'</strong><span>当前连接</span></div></div></div>'+connected+featuredHtml+'</div><div class="jdm-world-browser-head"><div><span>KNOWLEDGE ENTRIES</span><strong>继续探索这个知识世界</strong></div><small>核心条目构成主叙事；跨世界入口把同一知识带入其他世界。</small></div>'+primaryGrid(items.filter(x=>x.worldRole==='primary'),'核心条目')+(secondary?'<details class="jdm-world-browser-secondary"><summary>从其他知识世界进入这里 · '+secondary+' 个关联条目</summary>'+primaryGrid(items.filter(x=>x.worldRole==='secondary'),'关联入口')+'</details>':'');
  }
  function primaryGrid(items,label){return '<div class="jdm-world-browser-grid">'+items.map(e=>card(e,label)).join('')+'</div>'}
  function card(e,label){return '<a class="jdm-world-entry-card" href="'+url(e)+'"><div><span>'+esc(label)+' · '+esc(e.category)+'</span><h3>'+esc(e.zh?.title||e.slug)+'</h3><p>'+esc(plain(e.zh?.summary||e.zh?.content||'').slice(0,150)||'打开知识条目，继续探索。')+'</p></div><b>打开条目 →</b></a>'}
  async function init(){
    const roots=[...document.querySelectorAll('[data-world-browser]')];if(!roots.length||!window.JDM_KNOWLEDGE?.worldOverview)return;
    await Promise.all(roots.map(async root=>{
      const world=root.getAttribute('data-world-browser');root.innerHTML='<div class="jdm-world-browser-loading">正在连接七大知识世界……</div>';
      try{render(root,await window.JDM_KNOWLEDGE.worldOverview(world,{limit:250,featured:8}))}
      catch(error){const code=esc(error?.code||error?.status||'NETWORK');root.innerHTML='<div class="jdm-world-browser-error" role="alert">知识世界暂时无法加载（'+code+'）。<button type="button">重新加载</button></div>';root.querySelector('button')?.addEventListener('click',init)}
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();