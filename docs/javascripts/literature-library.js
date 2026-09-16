/* Full R01–R35 library = canonical 文献 entries. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  function init(){
    const root=document.getElementById('literature-library');if(!root||!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const docs=entries.filter(e=>e.category==='文献'&&e.zh?.meta?.ref).sort((a,b)=>Number(String(a.zh.meta.ref).slice(1))-Number(String(b.zh.meta.ref).slice(1)));
      const search=document.getElementById('literature-search');const buttons=[...document.querySelectorAll('[data-library-filter]')];let filter='all';
      root.innerHTML=docs.map(e=>{const m=e.zh.meta,source=e.sources?.[0]?.url||'';return `<article class="literature-item" data-category="${esc(m.libraryCategory||'')}"><b>${esc(m.ref)}</b><h3>${esc(e.zh?.title||e.slug)}</h3><p>${esc(e.zh?.content||e.zh?.summary||'')}</p><div class="literature-actions"><a href="${window.JDM_KNOWLEDGE.url(e)}">进入统一知识条目 →</a>${source?`<a href="${esc(source)}" target="_blank" rel="noopener">在线资料 ↗</a>`:''}</div></article>`}).join('');
      function apply(){const q=(search?.value||'').toLowerCase();root.querySelectorAll('.literature-item').forEach(el=>{const okCat=filter==='all'||el.dataset.category===filter;const okQ=!q||el.textContent.toLowerCase().includes(q);el.style.display=okCat&&okQ?'':'none'})}
      search?.addEventListener('input',apply);buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');filter=b.dataset.libraryFilter;apply()}));
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
