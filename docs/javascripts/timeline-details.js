/* Rich historical timeline detail viewer.
 * Data source precedence:
 *   1) timeline_context table (curated official source metadata)
 *   2) entry metadata/source list
 * No relationship or citation is invented in the UI when authoritative context is absent.
 */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const clean=s=>text(s).replace(/\s+/g,' ').trim();
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  const meta=e=>e?.zh?.meta||{};
  const timelineData=e=>meta(e).timeline||[];
  const laneOf=e=>(timelineData(e)[0]||{}).lane||'';
  const sourcesOf=e=>(e?.sources||[]).filter(s=>s&&typeof s==='object'&&(s.url||s.label||s.title)).slice(0,5);
  const detailOf=e=>meta(e).timeline_detail||meta(e).detail||meta(e).description||e?.zh?.content||e?.zh?.summary||'';
  const relationOf=e=>meta(e).relation_to_jingdezhen||meta(e).jingdezhen_relation||meta(e).jingdezhenRelation||'';
  const typeLabel=e=>e.category==='窑址'||meta(e).kind==='kiln'?'窑址 / 窑业遗址':(laneOf(e)==='world'?'国家 / 地区关系':'历史节点');
  function officialContext(e){
    const c=meta(e).timeline_context;
    if(!c||typeof c!=='object')return null;
    return c;
  }
  function open(e){
    const m=meta(e), im=validMedia(e), c=officialContext(e), sources=sourcesOf(e), period=m.map?.period||m.period||'', country=m.map?.country||'', title=e?.zh?.title||e?.slug||'';
    const detail=clean(c?.official_summary||detailOf(e));
    const relation=clean(c?.relationship_to_jingdezhen||relationOf(e));
    const officialUrl=c?.official_source_url||'';
    const officialTitle=c?.official_source_title||'';
    const officialInstitution=c?.official_institution||'';
    const imageUrl=c?.official_image_url||'';
    const imageCredit=c?.official_image_credit||'';
    document.querySelectorAll('.timeline-detail-modal').forEach(x=>x.remove());
    const modal=document.createElement('div');modal.className='timeline-detail-modal is-open';
    const imageSrc=imageUrl||im?.path||'';
    const imageCaption=imageCredit||im?.title||title;
    const image=imageSrc?`<div class="timeline-detail-image"><img src="${esc(imageSrc)}" alt="${esc(imageCaption)}" loading="lazy" decoding="async"><div class="timeline-detail-image-caption">${esc(imageCaption)}</div></div>`:'';
    const official=officialUrl?`<a href="${esc(officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(officialTitle||officialInstitution||'权威机构资料')} ↗</a>`:'';
    const extraSources=sources.filter(s=>s.url&&s.url!==officialUrl).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'来源')} ↗</a>`).join('');
    const sourceHtml=(official||extraSources)?`<div class="timeline-detail-sources"><strong>来源</strong>${official?`<div class="timeline-source-primary"><span>权威来源</span>${official}</div>`:''}${extraSources?`<div class="timeline-source-secondary">${extraSources}</div>`:''}</div>`:'';
    const relationHtml=laneOf(e)==='world'?`<section class="timeline-relation"><b>与景德镇的关系</b><p>${esc(relation||'当前条目尚未提供经过审核的景德镇关系说明。')}</p></section>`:'';
    modal.innerHTML=`<div class="timeline-detail-backdrop"></div><article class="timeline-detail-dialog"><button class="timeline-detail-close" aria-label="关闭">×</button><div class="timeline-detail-grid">${image}<div class="timeline-detail-copy"><div class="timeline-detail-overline">${esc(typeLabel(e))}</div><h2>${esc(title)}</h2><div class="timeline-detail-meta">${period?`<span>${esc(period)}</span>`:''}${country?`<span>${esc(country)}</span>`:''}${m.culture?`<span>${esc(m.culture)}</span>`:''}</div>${relationHtml}<p class="timeline-detail-body">${esc(detail||'暂缺详细介绍。')}</p>${sourceHtml}</div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('timeline-detail-open');
    const close=()=>{modal.remove();document.body.classList.remove('timeline-detail-open')};
    modal.querySelector('.timeline-detail-close').onclick=close;modal.querySelector('.timeline-detail-backdrop').onclick=close;
    const key=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',key)}};document.addEventListener('keydown',key);
  }
  function init(){
    if(!window.JDM_KNOWLEDGE)return;
    window.JDM_KNOWLEDGE.all().then(entries=>{
      const bySlug=new Map(entries.map(e=>[e.slug,e]));
      document.addEventListener('click',ev=>{const node=ev.target.closest?.('[data-entry-slug]');if(!node)return;const e=bySlug.get(node.dataset.entrySlug);if(!e)return;if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();open(e)},{capture:true});
      document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest?.('[data-entry-slug]')){ev.preventDefault();const e=bySlug.get(ev.target.closest('[data-entry-slug]').dataset.entrySlug);if(e)open(e)}});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
