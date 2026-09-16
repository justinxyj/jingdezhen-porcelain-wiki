/* Canonical entry renderer. No page-local people/object/kiln/literature copies live here. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  async function db(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  async function loadMedia(db,entryId){if(!db)return null;const {data}=await db.from('media').select('path,title,source,license,creator').eq('entry_id',entryId).eq('status','approved').order('created_at',{ascending:true}).limit(1).maybeSingle();return data||null}
  async function loadRelations(db,entryId,entries){if(!db)return[];const {data}=await db.from('entry_relations').select('related_entry_id,relation_type,note').eq('entry_id',entryId);return (data||[]).map(r=>({...r,entry:entries.find(e=>e.id===r.related_entry_id)})).filter(r=>r.entry)}
  function sourceLinks(e){return (e.sources||[]).map(s=>`<a href="${esc(s.url||'#')}" target="_blank" rel="noopener">${esc(s.label||'来源')} ↗</a>`).join('')}
  function render(root,e,im,relations){
    const m=e.zh?.meta||{}, wiki=m.wikiTitle||e.zh?.title||e.slug;
    root.innerHTML=`<article class="wiki-entry-card"><header class="wiki-entry-header"><div><div class="wiki-entry-kicker">${esc(e.category)} · ${esc(e.slug)}</div><h1>${esc(e.zh?.title||e.slug)}</h1><p>${esc(e.zh?.summary||'')}</p></div>${im?`<figure class="wiki-entry-cover"><img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}"><figcaption>${esc(im.source||'图片来源')} · ${esc(im.license||'')}</figcaption></figure>`:''}</header><div class="wiki-entry-meta">${m.period?`<span>${esc(m.period)}</span>`:''}${m.map?.country?`<span>${esc(m.map.country)}</span>`:''}${m.map?.type?`<span>${esc(m.map.type)}</span>`:''}${m.ref?`<span>${esc(m.ref)}</span>`:''}</div><section class="wiki-entry-body"><h2>条目正文</h2><p>${esc(e.zh?.content||'暂无正文')}</p></section>${relations.length?`<section class="wiki-entry-relations"><h2>知识网络</h2><div class="wiki-relation-grid">${relations.map(r=>`<a href="${ROOT}entry/?type=${encodeURIComponent(r.entry.category)}&slug=${encodeURIComponent(r.entry.slug)}"><b>${esc(r.entry.zh?.title||r.entry.slug)}</b><small>${esc(r.relation_type)}${r.note?` · ${esc(r.note)}`:''}</small></a>`).join('')}</div></section>`:''}<section class="wiki-entry-sources"><h2>来源与外部资料</h2><div class="wiki-entry-source-links">${sourceLinks(e)||'<span>暂无外部来源。</span>'}<a href="https://zh.wikipedia.org/wiki/${encodeURIComponent(wiki)}" target="_blank" rel="noopener">维基百科 ↗</a></div></section><footer class="wiki-entry-footer">统一知识条目 · 版本 ${esc(e.version||1)} · 更新于 ${esc(e.updated_at||'')}</footer></article>`;
  }
  async function init(){
    const root=document.getElementById('wiki-entry-root');if(!root||!window.JDM_KNOWLEDGE)return;
    const params=new URLSearchParams(location.search),slug=params.get('slug');if(!slug){root.innerHTML='<div class="wiki-entry-loading">缺少知识条目 slug。</div>';return}
    const [e,entries,dbClient]=await Promise.all([window.JDM_KNOWLEDGE.get(slug),window.JDM_KNOWLEDGE.all(),db()]);
    if(!e){root.innerHTML='<div class="wiki-entry-loading">没有找到这个已发布的知识条目。</div>';return}
    const [im,relations]=await Promise.all([loadMedia(dbClient,e.id),loadRelations(dbClient,e.id,entries)]);render(root,e,im,relations);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
