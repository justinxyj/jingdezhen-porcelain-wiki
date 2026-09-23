/* Rich historical timeline detail viewer. */
(function(){
    const esc=s=>window.JDM_SAFE?.esc?.(s)??window.JDM_AUTH?.esc?.(s)??String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const clean=s=>text(s).replace(/\s+/g,' ').trim();
  const meta=e=>e?.zh?.meta||{};
  const timelineData=e=>meta(e).timeline||[];
  const laneOf=e=>(timelineData(e)[0]||{}).lane||'';
  const isKiln=e=>e.category==='窑址'||meta(e).kind==='kiln';
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  const sourcesOf=e=>(e?.sources||[]).filter(s=>s&&typeof s==='object'&&(s.url||s.label||s.title)).slice(0,5);
  const fallbackDetail=e=>meta(e).timeline_detail||meta(e).detail||meta(e).description||e?.zh?.content||e?.zh?.summary||'';
  const contextOf=e=>e?.timelineContext||meta(e).timeline_context||null;
  function typeLabel(e){return isKiln(e)?'窑址 / 窑业遗址':laneOf(e)==='world'?'国家 / 地区关系':'历史节点'}
  function relationFor(e,c){return clean(c?.relationship_to_jingdezhen||meta(e).relation_to_jingdezhen||meta(e).jingdezhen_relation||'')}
  function sourceBadge(c, officialUrl){
    if(c?.description_source_type==='ai')return '<div class="timeline-source-badge timeline-source-ai"><span>内容类型</span><strong>AI整理（未找到稳定官方专页）</strong></div>';
    if(c?.official_source_title||officialUrl||c?.official_institution)return `<div class="timeline-source-badge"><span>权威资料</span><strong>${esc(clean(c?.official_institution||'官方机构'))}</strong></div>`;
    return '';
  }
  async function commonsImage(query){
    if(!query)return null;
    try{
      const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query)+'&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json&origin=*';
      const r=await fetch(api,{headers:{Accept:'application/json'}}); if(!r.ok)return null;
      const j=await r.json(); const page=Object.values(j?.query?.pages||{})[0]; const info=page?.imageinfo?.[0];
      if(!info?.thumburl&&!info?.url)return null;
      const meta=info.extmetadata||{};
      return {url:info.thumburl||info.url,title:page.title?.replace(/^File:/,'')||query,credit:'Wikimedia Commons',source:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title||'')};
    }catch(_){return null}
  }
  async function open(e){
    const m=meta(e), c=contextOf(e), im=validMedia(e), sources=sourcesOf(e);
    const title=clean(e?.zh?.title||e?.slug||''), period=clean(m.map?.period||m.period||''), country=clean(m.map?.country||''), detail=clean(c?.official_summary||c?.ai_summary||fallbackDetail(e)), relation=relationFor(e,c);
    const officialUrl=c?.official_source_url||'', officialTitle=c?.official_source_title||'', officialInstitution=c?.official_institution||'';
    let image=imageForEntry(e,c), imageCredit=c?.official_image_credit||im?.title||title, imageSourceType=c?.image_source_type||'';
    if(!image && c?.image_search_query){const candidate=await commonsImage(c.image_search_query);if(candidate){image=candidate.url;imageCredit=candidate.title+' · Wikimedia Commons';imageSourceType='commons_candidate'}}
    document.querySelectorAll('.timeline-detail-modal').forEach(x=>x.remove());
    const modal=document.createElement('div');modal.className='timeline-detail-modal is-open';
    const imageHtml=image&&safeHref(image)?`<div class="timeline-detail-image"><img src="${safeHref(image)}" alt="${esc(imageCredit)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><div class="timeline-detail-image-caption">${esc(imageCredit)}${imageSourceType==='commons_candidate'?' · 自动匹配候选图':''}</div></div>`:'';
    const sourceHtml=(officialUrl||sources.length)?`<div class="timeline-detail-sources"><strong>来源</strong>${sourceBadge(c,officialUrl)}${officialUrl?`<div class="timeline-source-primary"><span>权威来源</span><a href="${safeHref(officialUrl)||''}" target="_blank" rel="noopener noreferrer">${esc(officialTitle||officialInstitution||'官方资料')} ↗</a></div>`:''}${sources.filter(s=>s.url&&s.url!==officialUrl).map(s=>`<div class="timeline-source-secondary"><a href="${safeHref(s.url)||''}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'参考来源')} ↗</a></div>`).join('')}</div>`:'';
    const relationHtml=laneOf(e)==='world'?`<section class="timeline-relation"><b>与景德镇的关系</b><p>${esc(relation||'该条目尚未提供经过审核的景德镇关系说明。')}</p></section>`:'';
    modal.innerHTML=`<div class="timeline-detail-backdrop"></div><article class="timeline-detail-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}详细介绍"><button class="timeline-detail-close" aria-label="关闭">×</button><div class="timeline-detail-grid">${imageHtml}<div class="timeline-detail-copy"><div class="timeline-detail-overline">${esc(typeLabel(e))}</div><h2>${esc(title)}</h2><div class="timeline-detail-meta">${period?`<span>${esc(period)}</span>`:''}${country?`<span>${esc(country)}</span>`:''}</div>${relationHtml}<p class="timeline-detail-body">${esc(detail||'暂缺详细介绍。')}</p>${sourceHtml}</div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('timeline-detail-open');
    const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const close=()=>{modal.remove();document.body.classList.remove('timeline-detail-open');document.body.style.overflow=previousOverflow};
    modal.querySelector('.timeline-detail-close').onclick=ev=>{ev.preventDefault();ev.stopPropagation();close()};
    modal.querySelector('.timeline-detail-backdrop').onclick=ev=>{ev.preventDefault();ev.stopPropagation();close()};
    const key=ev=>{if(ev.key==='Escape'){close();document.removeEventListener('keydown',key)}};document.addEventListener('keydown',key);
    requestAnimationFrame(()=>modal.querySelector('.timeline-detail-close')?.focus());
  }
  function imageForEntry(e,c){return c?.official_image_url||validMedia(e)?.path||''}
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
