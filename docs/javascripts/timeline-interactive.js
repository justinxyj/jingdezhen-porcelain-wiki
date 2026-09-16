/* Timeline interaction: anchors always remain usable; JS adds the detail modal. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  function bind(root,entries){
    const bySlug=new Map(entries.map(e=>[e.slug,e]));
    root.querySelectorAll('[data-entry-slug]').forEach(node=>{
      if(node.dataset.timelineBound==='1')return;
      const e=bySlug.get(node.dataset.entrySlug);if(!e)return;
      node.dataset.timelineBound='1';
      node.addEventListener('click',ev=>{if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();open(e)});
      node.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open(e)}});
      node.setAttribute('role','button');node.setAttribute('tabindex','0');
    });
  }
  function open(e){
    const m=e.zh?.meta||{},im=e.media?.[0],wikiTitle=m.wikiTitle||e.zh?.title||e.slug,source=(e.sources||[]).find(x=>x&&typeof x==='object'&&x.url)?.url||'';
    const modal=document.createElement('div');modal.className='jdm-timeline-modal is-open';modal.innerHTML=`<div class="jdm-timeline-backdrop"></div><article class="jdm-timeline-dialog"><button class="jdm-timeline-close" aria-label="关闭">×</button><div class="jdm-timeline-media">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}">`:'<div class="jdm-timeline-media-placeholder">暂无已核验图片</div>'}</div><div class="jdm-timeline-copy"><div class="jdm-timeline-tags"><span>${esc(e.category)}</span>${m.period?`<span>${esc(m.period)}</span>`:''}${m.map?.country?`<span>${esc(m.map.country)}</span>`:''}${m.ref?`<span>${esc(m.ref)}</span>`:''}</div><h2>${esc(e.zh?.title||e.slug)}</h2><p>${esc(text(e.zh?.content||''))}</p>${e.zh?.summary?`<div class="jdm-timeline-ai"><b>知识库摘要</b><p>${esc(text(e.zh.summary))}</p></div>`:''}<div class="jdm-timeline-actions"><a href="${window.JDM_KNOWLEDGE.url(e)}">进入统一知识条目 →</a>${source?`<a href="${esc(source)}" target="_blank" rel="noopener">权威来源 ↗</a>`:''}<a href="https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(wikiTitle)}" target="_blank" rel="noopener">维基百科 ↗</a></div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('jdm-timeline-open');
    const close=()=>{modal.remove();document.body.classList.remove('jdm-timeline-open')};
    modal.querySelector('.jdm-timeline-close').onclick=close;modal.querySelector('.jdm-timeline-backdrop').onclick=close;
    const onKey=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);
  }
  function init(){
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const attach=()=>{const root=document.querySelector('.timeline-comparison-root');if(root)bind(root,entries)};
      attach();
      const target=document.getElementById('timeline')||document.body;
      const observer=new MutationObserver(attach);observer.observe(target,{childList:true,subtree:true});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
