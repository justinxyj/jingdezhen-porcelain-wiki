/* Editorial world browser: the seven knowledge worlds are an independent navigation dimension. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  function render(root,items){
    const primary=items.filter(x=>x.worldRole==='primary'), secondary=items.filter(x=>x.worldRole==='secondary');
    root.innerHTML=`<div class="jdm-world-browser-head"><div><span>KNOWLEDGE ENTRIES</span><strong>这个知识世界正在连接 ${items.length} 个条目</strong></div><small>条目的数据库类型与这里的知识角色可以不同。</small></div>
      <div class="jdm-world-browser-grid">${primary.map(e=>card(e,'核心条目')).join('')}</div>
      ${secondary.length?`<details class="jdm-world-browser-secondary"><summary>从其他知识世界进入这里 · ${secondary.length} 个关联条目</summary><div class="jdm-world-browser-grid">${secondary.map(e=>card(e,'关联入口')).join('')}</div></details>`:''}`;
  }
  function card(e,label){return `<a class="jdm-world-entry-card" href="${url(e)}"><div><span>${esc(label)} · ${esc(e.category)}</span><h3>${esc(e.zh?.title||e.slug)}</h3><p>${esc(plain(e.zh?.summary||e.zh?.content||'').slice(0,150)||'打开知识条目，继续探索。')}</p></div><b>打开条目 →</b></a>`}
  async function init(){
    const roots=[...document.querySelectorAll('[data-world-browser]')];if(!roots.length||!window.JDM_KNOWLEDGE?.byWorld)return;
    await Promise.all(roots.map(async root=>{
      const world=root.getAttribute('data-world-browser');root.innerHTML='<div class="jdm-world-browser-loading">正在连接知识世界……</div>';
      try{render(root,await window.JDM_KNOWLEDGE.byWorld(world,{limit:250}))}
      catch(error){const code=esc(error?.code||error?.status||'NETWORK');root.innerHTML=`<div class="jdm-world-browser-error" role="alert">知识世界暂时无法加载（${code}）。<button type="button">重新加载</button></div>`;root.querySelector('button')?.addEventListener('click',init)}
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();