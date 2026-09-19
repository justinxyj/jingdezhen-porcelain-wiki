/* Public knowledge-entry renderer. Internal IDs, relation types and version fields never render. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`${ROOT}entry/?type=${encodeURIComponent(e?.category||'')}&slug=${encodeURIComponent(e?.slug||'')}`;
  const sourceUrl=s=>s&&typeof s==='object'?s.url:'';
  const sourceLabel=s=>s&&typeof s==='object'?s.label||'来源':(typeof s==='string'?s:'来源');
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  function detailedIntro(e){
    const m=e.zh?.meta||{};
    const summary=plain(e.zh?.summary||'');
    const content=plain(e.zh?.content||'');
    const text=content||summary;
    if(text.length>=180)return text;
    const context=plain(m.description||m.context||m.quote_context||'');
    if(context&&context.length>=80)return `${text}${text&&context?'\n\n':''}${context}`.trim();
    const facts=[m.era||m.period,m.role,m.location,m.region,m.craft].filter(Boolean).join('、');
    return text||(facts?`${facts}。该条目集中介绍相关历史背景、人物或器物信息，并结合可核验文献与馆藏资料说明其历史位置、文化意义及与景德镇陶瓷发展之间的关系。`:'该条目用于介绍这一历史对象、人物、文献或工艺主题，结合相关史料、研究与馆藏信息说明其形成背景、发展过程及与景德镇陶瓷史的联系。');
  }
  function render(root,e,relations){
    const m=e.zh?.meta||{},im=validMedia(e),wiki=m.wikiTitle||e.zh?.title||e.slug;
    const intro=detailedIntro(e);
    root.innerHTML=`<article class="wiki-entry-card"><header class="wiki-entry-header"><div><div class="wiki-entry-kicker">${esc(e.category||'知识')}</div><h1>${esc(e.zh?.title||e.slug)}</h1><p>${esc(intro)}</p></div>${im?`<figure class="wiki-entry-cover"><img src="${esc(im.path)}" alt="${esc(im.title||e.zh?.title||e.slug)}"><figcaption>${esc(im.title||'')} · ${esc(im.source||'')} · ${esc(im.license||'')}</figcaption></figure>`:''}</header><div class="wiki-entry-meta">${m.period?`<span>${esc(m.period)}</span>`:''}${m.map?.country?`<span>${esc(m.map.country)}</span>`:''}${m.map?.type?`<span>${esc(m.map.type)}</span>`:''}</div><section class="wiki-entry-body"><h2>详细介绍</h2><div class="wiki-entry-text">${esc(contentOrIntro(e,intro))}</div></section>${relations.length?`<section class="wiki-entry-relations"><h2>相关内容</h2><div class="wiki-relation-grid">${relations.map(r=>`<a href="${url(r.entry)}"><b>${esc(r.entry.zh?.title||r.entry.slug)}</b><small>查看相关内容 →</small></a>`).join('')}</div></section>`:''}<section class="wiki-entry-sources"><h2>来源与外部资料</h2><div class="wiki-entry-source-links">${(e.sources||[]).map(s=>{const u=sourceUrl(s);return u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(sourceLabel(s))} ↗</a>`:''}).filter(Boolean).join('')||'<span>暂无外部来源。</span>'}<a href="https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(wiki)}" target="_blank" rel="noopener">维基百科 ↗</a></div></section></article>`;
  }
  function contentOrIntro(e,intro){const content=plain(e.zh?.content||'');return content||intro}
  async function loadRelations(db,entryId){
    if(!db)return{relations:[],error:new Error('知识库连接不可用')};
    try{
      const relationQuery=(d,s)=>d.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').or(`entry_id.eq.${entryId},related_entry_id.eq.${entryId}`).limit(100).abortSignal(s);
      const relRows=window.JDM_AUTH?.request?await window.JDM_AUTH.request(relationQuery):await relationQuery(db,new AbortController().signal).then(r=>{if(r.error)throw r.error;return r.data||[]});
      const ids=[...new Set(relRows.map(r=>r.entry_id===entryId?r.related_entry_id:r.entry_id))];
      if(!ids.length)return{relations:[],error:null};
      const entryQuery=(d,s)=>d.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).limit(100).abortSignal(s);
      const entryRows=window.JDM_AUTH?.request?await window.JDM_AUTH.request(entryQuery):await entryQuery(db,new AbortController().signal).then(r=>{if(r.error)throw r.error;return r.data||[]});
      const byId=new Map(entryRows.map(x=>[x.id,x]));
      return{relations:relRows.map(r=>({...r,entry:byId.get(r.entry_id===entryId?r.related_entry_id:r.entry_id)})).filter(r=>r.entry),error:null};
    }catch(error){return{relations:[],error}}
  }
  function renderRelationWarning(root){
    const note=document.createElement('div');
    note.className='wiki-entry-relation-warning';
    note.setAttribute('role','status');
    note.innerHTML='相关内容暂时加载失败。<button type="button">重试</button>';
    note.querySelector('button').onclick=()=>init();
    root.prepend(note);
  }
  function renderLoadError(root,error){
    const code=esc(error?.code||error?.status||'NETWORK');
    root.innerHTML=`<div class="wiki-entry-error" role="alert"><h2>知识内容暂时无法加载</h2><p>网络或数据服务出现异常（${code}）。请稍后重试。</p><button type="button">重新加载</button></div>`;
    root.querySelector('button').onclick=()=>{window.JDM_KNOWLEDGE.reset();init()};
  }
  async function init(){
    const root=document.getElementById('wiki-entry-root');
    if(!root||!window.JDM_KNOWLEDGE)return;
    const slug=new URLSearchParams(location.search).get('slug');
    if(!slug){root.innerHTML='<div class="wiki-entry-loading">没有指定条目。</div>';return}
    root.innerHTML='<div class="wiki-entry-loading" aria-live="polite">正在加载知识条目…</div>';
    try{
      const e=await window.JDM_KNOWLEDGE.get(slug);
      if(!e){root.innerHTML='<div class="wiki-entry-loading">没有找到这个公开条目。</div>';return}
      const db=window.supabase?.createClient?.(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
      const {relations,error}=await loadRelations(db,e.id);
      render(root,e,relations);
      if(error)renderRelationWarning(root);
    }catch(error){renderLoadError(root,error)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
