/* Rich historical timeline detail viewer.
 * Prefer curated official-source metadata in zh.meta.timeline_context;
 * otherwise use the entry's audited sources/media without inventing facts.
 */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const clean=s=>text(s).replace(/\s+/g,' ').trim();
  const meta=e=>e?.zh?.meta||{};
  const timelineData=e=>meta(e).timeline||[];
  const laneOf=e=>(timelineData(e)[0]||{}).lane||'';
  const isKiln=e=>e.category==='窑址'||meta(e).kind==='kiln';
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  const sourcesOf=e=>(e?.sources||[]).filter(s=>s&&typeof s==='object'&&(s.url||s.label||s.title)).slice(0,5);
  const fallbackDetail=e=>meta(e).timeline_detail||meta(e).detail||meta(e).description||e?.zh?.content||e?.zh?.summary||'';
  const contextOf=e=>meta(e).timeline_context&&typeof meta(e).timeline_context==='object'?meta(e).timeline_context:null;
  function imageFor(e,c){return c?.official_image_url||validMedia(e)?.path||''}
  function typeLabel(e){return isKiln(e)?'窑址 / 窑业遗址':laneOf(e)==='world'?'国家 / 地区关系':'历史节点'}
  function relationFor(e,c){return clean(c?.relationship_to_jingdezhen||meta(e).relation_to_jingdezhen||meta(e).jingdezhen_relation||'')}
  function sourceBadge(c, officialUrl){
    if(c?.official_source_title||officialUrl||c?.official_institution)return `<div class="timeline-source-badge"><span>权威资料</span><strong>${esc(clean(c?.official_institution||'官方机构'))}</strong></div>`;
    return '';
  }
  function open(e){
    const m=meta(e), c=contextOf(e), im=validMedia(e), sources=sourcesOf(e);
    const title=clean(e?.zh?.title||e?.slug||''), period=clean(m.map?.period||m.period||''), country=clean(m.map?.country||''), detail=clean(c?.official_summary||fallbackDetail(e)), relation=relationFor(e,c), image=imageFor(e,c);
    const officialUrl=c?.official_source_url||'', officialTitle=c?.official_source_title||'', officialInstitution=c?.official_institution||'', imageCredit=c?.official_image_credit||im?.title||title;
    document.querySelectorAll('.timeline-detail-modal').forEach(x=>x.remove());
    const modal=document.createElement('div');modal.className='timeline-detail-modal is-open';
    const imageHtml=image?`<div class="timeline-detail-image"><img src="${esc(image)}" alt="${esc(imageCredit)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><div class="timeline-detail-image-caption">${esc(imageCredit)}</div></div>`:'';
    const sourceHtml=(officialUrl||sources.length)?`<div class="timeline-detail-sources"><strong>来源</strong>${sourceBadge(c,officialUrl)}${officialUrl?`<div class="timeline-source-primary"><span>权威来源</span><a href="${esc(officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(officialTitle||officialInstitution||'官方资料')} ↗</a></div>`:''}${sources.filter(s=>s.url&&s.url!==officialUrl).map(s=>`<div class="timeline-source-secondary"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'参考来源')} ↗</a></div>`).join('')}</div>`:'';
    const relationHtml=laneOf(e)==='world'?`<section class="timeline-relation"><b>与景德镇的关系</b><p>${esc(relation||'该条目尚未提供经过审核的景德镇关系说明。')}</p></section>`:'';
    modal.innerHTML=`<div class="timeline-detail-backdrop"></div><article class="timeline-detail-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}详细介绍"><button class="timeline-detail-close" aria-label="关闭">×</button><div class="timeline-detail-grid">${imageHtml}<div class="timeline-detail-copy"><div class="timeline-detail-overline">${esc(typeLabel(e))}</div><h2>${esc(title)}</h2><div class="timeline-detail-meta">${period?`<span>${esc(period)}</span>`:''}${country?`<span>${esc(country)}</span>`:''}</div>${relationHtml}<p class="timeline-detail-body">${esc(detail||'暂缺详细介绍。')}</p>${sourceHtml}</div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('timeline-detail-open');
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const close=()=>{modal.remove();document.body.classList.remove('timeline-detail-open');document.body.style.overflow=previousOverflow};
    modal.querySelector('.timeline-detail-close').onclick=close;modal.querySelector('.timeline-detail-backdrop').onclick=close;
    const key=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',key)}};document.addEventListener('keydown',key);
    requestAnimationFrame(()=>modal.querySelector('.timeline-detail-close')?.focus());
  }
  function init(){
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const bySlug=new Map(entries.map(e=>[e.slug,e]));
      document.addEventListener('click',ev=>{const node=ev.target.closest?.('[data-entry-slug]');if(!node)return;const e=bySlug.get(node.dataset.entrySlug);if(!e)return;if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();ev.stopPropagation();open(e)},{capture:true});
      document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest?.('[data-entry-slug]')){ev.preventDefault();ev.stopPropagation();const e=bySlug.get(ev.target.closest('[data-entry-slug]').dataset.entrySlug);if(e)open(e)}},{capture:true});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
