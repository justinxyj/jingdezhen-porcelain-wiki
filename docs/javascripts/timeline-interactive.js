/* Timeline interaction: each historical card opens one detail modal. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const parsed=new DOMParser().parseFromString(String(s||''),'text/html');return parsed.body.textContent||''};
  const safeHref=raw=>window.JDM_AUTH?.safeHref?.(raw)||'';
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
    const m=e.zh?.meta||{},im=validMedia(e),wikiTitle=m.wikiTitle||e.zh?.title||e.slug,source=safeHref((e.sources||[]).find(x=>x&&typeof x==='object'&&x.url)?.url||''),wikiHref=safeHref('https://zh.wikipedia.org/w/index.php?search='+encodeURIComponent(wikiTitle));
    document.querySelectorAll('.jdm-timeline-modal').forEach(x=>x.remove());
    const modal=document.createElement('div');modal.className='jdm-timeline-modal is-open';
    const backdrop=document.createElement('div');backdrop.className='jdm-timeline-backdrop';
    const dialog=document.createElement('article');dialog.className='jdm-timeline-dialog';
    const closeButton=document.createElement('button');closeButton.className='jdm-timeline-close';closeButton.type='button';closeButton.setAttribute('aria-label','关闭');closeButton.textContent='×';
    const detail=document.createElement('div');detail.className='jdm-timeline-detail';
    if(im){const imageHref=safeHref(im.path);if(imageHref){const wrap=document.createElement('div');wrap.className='jdm-timeline-image';const img=document.createElement('img');img.dataset.museumImage='1';img.src=imageHref;img.alt=String(im.title||e.zh?.title||e.slug);wrap.appendChild(img);detail.appendChild(wrap)}}
    const copy=document.createElement('div');copy.className='jdm-timeline-copy';
    const overline=document.createElement('div');overline.className='detail-overline';overline.textContent='历史节点';copy.appendChild(overline);
    const title=document.createElement('h3');title.textContent=String(e.zh?.title||e.slug);copy.appendChild(title);
    const meta=document.createElement('div');meta.className='detail-meta';if(m.period){const s=document.createElement('span');s.textContent=String(m.period);meta.appendChild(s)}if(m.map?.country){const s=document.createElement('span');s.textContent=String(m.map.country);meta.appendChild(s)}copy.appendChild(meta);
    const p=document.createElement('p');p.textContent=text(e.zh?.content||'');copy.appendChild(p);
    if(e.zh?.summary){const box=document.createElement('div');box.className='ai-summary';const b=document.createElement('b');b.textContent='简介';const sp=document.createElement('p');sp.textContent=text(e.zh.summary);box.append(b,sp);copy.appendChild(box)}
    const actions=document.createElement('div');actions.className='jdm-timeline-actions';
    if(source){const a=document.createElement('a');a.className='secondary';a.href=source;a.target='_blank';a.rel='noopener noreferrer';a.textContent='来源 ↗';actions.appendChild(a)}
    if(wikiHref){const a=document.createElement('a');a.className='secondary';a.href=wikiHref;a.target='_blank';a.rel='noopener noreferrer';a.textContent='维基百科 ↗';actions.appendChild(a)}
    copy.appendChild(actions);detail.appendChild(copy);dialog.append(closeButton,detail);modal.append(backdrop,dialog);document.body.appendChild(modal);document.body.classList.add('jdm-timeline-open');
    const close=()=>{modal.remove();document.body.classList.remove('jdm-timeline-open')};
    modal.querySelector('.jdm-timeline-close').onclick=close;modal.querySelector('.jdm-timeline-backdrop').onclick=close;
    const onKey=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);
  }
  let initSeq=0;
  let observer=null;
  function init(){
    const seq=++initSeq;
    observer?.disconnect();observer=null;
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.list({limit:500}).then(entries=>{
      const root=document.querySelector('.timeline-comparison-root');
      if(!root)return;
      if(seq!==initSeq)return;
      const bySlug=bind(root,entries);
      observer=new MutationObserver(mutations=>{
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