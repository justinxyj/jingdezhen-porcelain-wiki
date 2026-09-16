/* Timeline detail interaction: every node resolves directly to its canonical entry id/slug. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  async function media(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return[];
    const db=window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    const {data}=await db.from('media').select('entry_id,path,title,source,license,creator').eq('status','approved');return data||[];
  }
  async function init(){
    if(!window.JDM_KNOWLEDGE)return;
    const entries=await window.JDM_KNOWLEDGE.all();
    const bySlug=new Map(entries.map(e=>[e.slug,e]));
    const medias=await media();const mm=new Map();medias.forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,m)});
    const root=document.querySelector('.timeline-comparison-root');if(!root)return;
    root.querySelectorAll('[data-entry-slug]').forEach(node=>{
      const slug=node.dataset.entrySlug,e=bySlug.get(slug);if(!e)return;
      node.addEventListener('click',ev=>{if(ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey)return;ev.preventDefault();open(e,mm.get(e.id))});
      node.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open(e,mm.get(e.id))}});
      node.setAttribute('role','button');node.setAttribute('tabindex','0');
    });
  }
  function open(e,im){
    const m=e.zh?.meta||{}, wikiTitle=m.wikiTitle||e.zh?.title||e.slug, source=e.sources?.[0]?.url||'';
    const modal=document.createElement('div');modal.className='jdm-timeline-modal';modal.innerHTML=`<div class="jdm-timeline-backdrop"></div><article class="jdm-timeline-dialog"><button class="jdm-timeline-close" aria-label="关闭">×</button><div class="jdm-timeline-media">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}">`:'<div class="jdm-timeline-media-placeholder">暂无已核验图片</div>'}</div><div class="jdm-timeline-copy"><div class="jdm-timeline-tags"><span>${esc(e.category)}</span>${m.map?.period?`<span>${esc(m.map.period)}</span>`:''}</div><h2>${esc(e.zh?.title||e.slug)}</h2><p>${esc(e.zh?.content||'')}</p><div class="jdm-timeline-ai"><b>知识库摘要</b><p>${esc(e.zh?.summary||'')}</p></div><div class="jdm-timeline-actions"><a href="${window.JDM_KNOWLEDGE.url(e)}">进入统一知识条目 →</a>${source?`<a href="${esc(source)}" target="_blank" rel="noopener">权威来源 ↗</a>`:''}<a href="https://zh.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}" target="_blank" rel="noopener">维基百科 ↗</a></div></div></article></div>`;
    document.body.appendChild(modal);document.body.classList.add('jdm-timeline-open');
    const close=()=>{modal.remove();document.body.classList.remove('jdm-timeline-open')};modal.querySelector('.jdm-timeline-close').onclick=close;modal.querySelector('.jdm-timeline-backdrop').onclick=close;document.addEventListener('keydown',function escKey(ev){if(ev.key==='Escape'){close();document.removeEventListener('keydown',escKey)}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
