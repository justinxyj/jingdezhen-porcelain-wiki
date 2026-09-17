/* Rich historical timeline details: kiln/city entries and China/world relationships. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  function timelineData(e){return e?.zh?.meta?.timeline||[]}
  function laneOf(e){const t=timelineData(e)[0]||{};return t.lane||''}
  function detailOf(e){const m=e?.zh?.meta||{};return m.timeline_detail||m.detail||m.description||e?.zh?.content||e?.zh?.summary||''}
  function sourceList(e){return (e?.sources||[]).filter(s=>s&&typeof s==='object'&&(s.url||s.label||s.title)).slice(0,4)}
  function typeLabel(e){return e.category==='窑址'?'窑址介绍':(laneOf(e)==='world'?'国家 / 地区关系':'历史节点')}
  function open(e){
    const m=e?.zh?.meta||{}, im=validMedia(e), sources=sourceList(e), period=m.map?.period||m.period||'', country=m.map?.country||'', title=e?.zh?.title||e?.slug||'', detail=esc(text(detailOf(e))),
      relation=laneOf(e)==='world'?(m.relation_to_jingdezhen||m.jingdezhen_relation||'该地区与景德镇的陶瓷贸易、技术传播、器物消费或收藏之间存在历史联系。'):'';
    document.querySelectorAll('.timeline-detail-modal').forEach(x=>x.remove());
    const modal=document.createElement('div'); modal.className='timeline-detail-modal is-open';
    const image=im?`<div class="timeline-detail-image"><img src="${esc(im.path)}" alt="${esc(im.title||title)}" loading="lazy" decoding="async"><div class="timeline-detail-image-caption">${esc(im.title||title)}</div></div>`:'';
    const sourceHtml=sources.length?`<div class="timeline-detail-sources"><strong>权威来源</strong>${sources.map(s=>s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'官方资料')} ↗</a>`:`<span>${esc(s.label||s.title||'官方资料')}</span>`).join('')}</div>`:'';
    modal.innerHTML=`<div class="timeline-detail-backdrop"></div><article class="timeline-detail-dialog"><button class="timeline-detail-close" aria-label="关闭">×</button><div class="timeline-detail-grid">${image}<div class="timeline-detail-copy"><div class="timeline-detail-overline">${esc(typeLabel(e))}</div><h2>${esc(title)}</h2><div class="timeline-detail-meta">${period?`<span>${esc(period)}</span>`:''}${country?`<span>${esc(country)}</span>`:''}</div>${laneOf(e)==='world'&&relation?`<section class="timeline-relation"><b>与景德镇的关系</b><p>${esc(text(relation))}</p></section>`:''}<p class="timeline-detail-body">${detail||'暂缺详细介绍。'}</p>${sourceHtml}</div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('timeline-detail-open');
    const close=()=>{modal.remove();document.body.classList.remove('timeline-detail-open')};
    modal.querySelector('.timeline-detail-close').onclick=close;modal.querySelector('.timeline-detail-backdrop').onclick=close;
    const key=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',key)}};document.addEventListener('keydown',key);
  }
  function init(){
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const bySlug=new Map(entries.map(e=>[e.slug,e]));
      document.addEventListener('click',ev=>{
        const node=ev.target.closest?.('[data-entry-slug]'); if(!node)return;
        const e=bySlug.get(node.dataset.entrySlug); if(!e)return;
        if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;
        ev.preventDefault(); open(e);
      },{capture:true});
      document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest?.('[data-entry-slug]')){ev.preventDefault();const e=bySlug.get(ev.target.closest('[data-entry-slug]').dataset.entrySlug);if(e)open(e)}});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
