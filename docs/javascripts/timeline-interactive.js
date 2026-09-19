/* Timeline interaction: each historical card opens one detail modal. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  function validMedia(e){
    const m=e?.media?.[0];
    if(!m)return null;
    if(window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m))return null;
    return m;
  }
  function bindNode(node,bySlug){
    if(node.nodeType!==1)return;
    const targets=node.matches?.('[data-entry-slug]')?[node]:[...node.querySelectorAll?.('[data-entry-slug]')||[]];
    targets.forEach(target=>{
      if(target.dataset.timelineBound==='1')return;
      const e=bySlug.get(target.dataset.entrySlug);if(!e)return;
      target.dataset.timelineBound='1';
      target.addEventListener('click',ev=>{if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();open(e)});
      target.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open(e)}});
      target.setAttribute('role','button');target.setAttribute('tabindex','0');
    });
  }
  function bind(root,entries){
    const bySlug=new Map(entries.map(e=>[e.slug,e]));
    root.querySelectorAll('[data-entry-slug]').forEach(node=>bindNode(node,bySlug));
    return bySlug;
  }
  function open(e){
    const m=e.zh?.meta||{},im=validMedia(e),wikiTitle=m.wikiTitle||e.zh?.title||e.slug,source=(e.sources||[]).find(x=>x&&typeof x==='object'&&x.url)?.url||'';
    document.querySelectorAll('.jdm-timeline-modal').forEach(x=>x.remove());
    const modal=document.createElement('div');modal.className='jdm-timeline-modal is-open';
    modal.innerHTML=`<div class="jdm-timeline-backdrop"></div><article class="jdm-timeline-dialog"><button class="jdm-timeline-close" aria-label="关闭">×</button><div class="jdm-timeline-detail">${im?`<div class="jdm-timeline-image"><img data-museum-image="1" src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}"></div>`:''}<div class="jdm-timeline-copy"><div class="detail-overline">历史节点</div><h3>${esc(e.zh?.title||e.slug)}</h3><div class="detail-meta">${m.period?`<span>${esc(m.period)}</span>`:''}${m.map?.country?`<span>${esc(m.map.country)}</span>`:''}</div><p>${esc(text(e.zh?.content||''))}</p>${e.zh?.summary?`<div class="ai-summary"><b>简介</b><p>${esc(text(e.zh.summary))}</p></div>`:''}<div class="jdm-timeline-actions">${source?`<a class="secondary" href="${esc(source)}" target="_blank" rel="noopener">来源 ↗</a>`:''}<a class="secondary" href="https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(wikiTitle)}" target="_blank" rel="noopener">维基百科 ↗</a></div></div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('jdm-timeline-open');
    const close=()=>{modal.remove();document.body.classList.remove('jdm-timeline-open')};
    modal.querySelector('.jdm-timeline-close').onclick=close;modal.querySelector('.jdm-timeline-backdrop').onclick=close;
    const onKey=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);
  }
  function init(){
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.list({limit:500}).then(entries=>{
      const root=document.querySelector('.timeline-comparison-root');
      if(!root)return;
      const bySlug=bind(root,entries);
      const observer=new MutationObserver(mutations=>{
        mutations.forEach(m=>m.addedNodes.forEach(node=>bindNode(node,bySlug)));
      });
      observer.observe(root,{childList:true,subtree:true});
    }).catch(error=>{
      const root=document.querySelector('.timeline-comparison-root');
      if(root)root.insertAdjacentHTML('afterbegin','<div class="wiki-entry-error" role="alert">时间轴内容暂时无法加载，请稍后重试。<button type="button">重新加载</button></div>');
      const button=root?.querySelector('.wiki-entry-error button');
      if(button)button.onclick=()=>{window.JDM_KNOWLEDGE.reset();location.reload()};
      console.error('[JDM timeline]',error);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();