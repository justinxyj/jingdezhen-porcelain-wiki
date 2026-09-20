/* Public knowledge-entry renderer. Internal IDs, relation types and version fields never render. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`${ROOT}entry/${encodeURIComponent(e?.slug||'')}/`;
  const safeHref=raw=>window.JDM_AUTH?.safeHref?.(raw)||'';
  const sourceUrl=s=>s&&typeof s==='object'?safeHref(s.url):'';
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
  function render(root,e,network){
    const m=e.zh?.meta||{},im=validMedia(e),wiki=m.wikiTitle||e.zh?.title||e.slug;
    const intro=detailedIntro(e), relations=network?.relations||[], recommendations=network?.recommendations||[];
    const worlds=network?.worlds||[], timelinePeers=network?.timelinePeers||[], spaceEntries=network?.spaceEntries||[], craftProcesses=network?.craftProcesses||[];
    const tags=[m.period,m.era,m.role,m.location,m.region,m.craft].filter(Boolean);
    const relationCards=relations.slice(0,24).map(r=>'<a href="'+url(r.entry)+'"><span>'+esc(r.relation_type||'关联')+'</span><b>'+esc(r.entry.zh?.title||r.entry.slug)+'</b><small>'+esc(r.note||'继续查看相关知识')+' →</small></a>').join('');
    const worldLinks=worlds.map(w=>'<a class="wiki-entry-world-link" href="'+ROOT+(w.slug==='history'?'history/':w.slug==='craft'?'craft/':w.slug==='objects'?'objects/':w.slug==='space'?'kilns/':w.slug==='people'?'people/':w.slug==='research'?'research/':w.slug==='contemporary'?'contemporary/':'')+'">'+esc(w.short_title||w.title||w.slug)+' →</a>').join('');
    const entryCards=(items,kind)=>items.slice(0,8).map(x=>'<a class="wiki-entry-explore-card" href="'+url(x)+'"><span>'+esc(kind)+'</span><b>'+esc(x.zh?.title||x.slug)+'</b><small>'+esc(x.category||'知识')+' →</small></a>').join('');
    const sourceLinks=(e.sources||[]).map(s=>{const u=sourceUrl(s);return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(sourceLabel(s))+' ↗</a>':''}).filter(Boolean).join('');
    root.innerHTML='<article class="wiki-entry-card wiki-entry-v2">'+
      '<header class="wiki-entry-header"><div><div class="wiki-entry-kicker">'+esc(e.category||'知识')+'</div><h1>'+esc(e.zh?.title||e.slug)+'</h1><p>'+esc(intro)+'</p></div>'+(im&&safeHref(im.path)?'<figure class="wiki-entry-cover"><img data-museum-image="1" src="'+safeHref(im.path)+'" alt="'+esc(im.title||e.zh?.title||e.slug)+'"><figcaption>'+esc(im.title||'')+' · '+esc(im.source||'')+' · '+esc(im.license||'')+'</figcaption></figure>':'')+'</header>'+
      (tags.length?'<div class="wiki-entry-v2-tags">'+tags.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')+
      (worldLinks?'<div class="wiki-entry-world-path"><span>所属知识世界</span><div>'+worldLinks+'</div></div>':'')+
      '<div class="wiki-entry-v2-grid"><aside class="wiki-entry-v2-rail"><div class="wiki-entry-v2-card"><strong>知识节点</strong><span>'+esc(e.category||'知识')+'</span><span>'+esc(m.period||m.era||'时代信息待核')+'</span><span>'+esc(m.location||m.region||'空间信息待核')+'</span></div><div class="wiki-entry-v2-card"><strong>继续探索</strong><a href="'+ROOT+'search/">⌕ 搜索知识 →</a><a href="'+ROOT+'network/relations/">关系网络 →</a><a href="'+ROOT+'network/global/">全球陶瓷网络 →</a></div></aside><div class="wiki-entry-v2-main">'+
      '<section class="wiki-entry-body"><h2>详细介绍</h2><div class="wiki-entry-text">'+esc(contentOrIntro(e,intro))+'</div></section>'+
      (relations.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">知识关系</div><h2>它与哪些知识相连</h2><div class="wiki-entry-v2-relations">'+relationCards+'</div></section>':'')+
      (e.timelineContext?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">时间与空间</div><h2>历史与空间</h2><p>'+esc(e.timelineContext.official_summary||e.timelineContext.relationship_to_jingdezhen||e.timelineContext.historical_role||'该条目具有可追溯的时间轴或历史语境信息。')+'</p>'+(safeHref(e.timelineContext.official_source_url)?'<a href="'+safeHref(e.timelineContext.official_source_url)+'" target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a>':'')+'</section>':'')+
      (timelinePeers.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">同一时代</div><h2>同一时代，还可以看</h2><div class="wiki-entry-explore-grid">'+entryCards(timelinePeers,'同一时代')+'</div></section>':'')+
      (spaceEntries.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">空间语境</div><h2>同一空间语境，还可以看</h2><div class="wiki-entry-explore-grid">'+entryCards(spaceEntries,'空间关联')+'</div></section>':'')+
      (craftProcesses.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">工艺</div><h2>相关工艺</h2><div class="wiki-entry-craft-list">'+craftProcesses.slice(0,8).map(p=>'<a href="'+ROOT+'craft/technology-tree/?process='+encodeURIComponent(p.node_id||'')+'"><span>工序</span><b>'+esc(p.label||p.node_id)+'</b><small>进入72道工艺 →</small></a>').join('')+'</div></section>':'')+
      (recommendations.length?'<section class="wiki-entry-recommendations"><div class="wiki-entry-section-kicker">知识探索</div><h2>你可能还想了解</h2><p class="wiki-recommendation-intro">从当前条目继续探索高置信度相关知识。</p><div class="wiki-recommendation-grid">'+recommendations.map(r=>'<a class="wiki-recommendation-card" href="'+url(r.entry)+'"><span class="wiki-recommendation-category">'+esc(r.target_category||r.entry.category||'知识')+'</span><b>'+esc(r.target_label||r.entry.zh?.title||r.entry.slug)+'</b><small>'+esc(r.reason||'相关知识入口')+' →</small></a>').join('')+'</div></section>':'')+
      '<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">来源</div><h2>来源与外部资料</h2><div class="wiki-entry-source-links">'+(sourceLinks||'<span>暂无外部来源。</span>')+'<a href="https://zh.wikipedia.org/w/index.php?search='+encodeURIComponent(wiki)+'" target="_blank" rel="noopener">维基百科 ↗</a></div></section></div></div></article>';
  }
  function contentOrIntro(e,intro){const content=plain(e.zh?.content||'');return content||intro}
  const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  async function loadRelations(entryId){
    if(!window.JDM_AUTH?.request)return{relations:[],truncated:false,error:Object.assign(new Error('统一认证请求层不可用，请刷新页面后重试'),{code:'JDM_AUTH_MISSING'})};
    if(!UUID_RE.test(String(entryId||''))){const e=new Error('条目标识格式异常，无法加载相关内容。');e.code='JDM_ENTRY_ID_CONTRACT';return{relations:[],truncated:false,error:e}}
    try{
      const relationQuery=(field,d,s)=>d.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').eq(field,entryId).order('relation_type',{ascending:true}).order('related_entry_id',{ascending:true}).range(0,100).abortSignal(s);
      const [outgoing,incoming]=await Promise.all([
        window.JDM_AUTH.request((d,s)=>relationQuery('entry_id',d,s)),
        window.JDM_AUTH.request((d,s)=>relationQuery('related_entry_id',d,s))
      ]);
      const relRows=[...outgoing,...incoming].filter((r,i,a)=>i===a.findIndex(x=>x.entry_id===r.entry_id&&x.related_entry_id===r.related_entry_id&&x.relation_type===r.relation_type));
      const truncated=outgoing.length===101||incoming.length===101;
      const ids=[...new Set(relRows.map(r=>r.entry_id===entryId?r.related_entry_id:r.entry_id))];
      if(!ids.length)return{relations:[],truncated,error:null};
      const entryQuery=(d,s)=>d.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).order('updated_at',{ascending:false}).limit(101).abortSignal(s);
      const entryRows=await window.JDM_AUTH.request(entryQuery);
      const byId=new Map(entryRows.map(x=>[x.id,x]));
      return{relations:relRows.map(r=>({...r,entry:byId.get(r.entry_id===entryId?r.related_entry_id:r.entry_id)})).filter(r=>r.entry),truncated,error:null};
    }catch(error){return{relations:[],truncated:false,error}}
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
  let initSeq=0;
  async function init(){
    const seq=++initSeq;
    const root=document.getElementById('wiki-entry-root');
    if(!root||!window.JDM_KNOWLEDGE)return;
    const staticRendered=root.dataset.staticRendered==='true';
    const slug=new URLSearchParams(location.search).get('slug')||window.JDM_STATIC_ENTRY_SLUG||root.dataset.entrySlug;
    if(!slug){if(!staticRendered)root.innerHTML='<div class="wiki-entry-loading">没有指定条目。</div>';return}
    if(!staticRendered)root.innerHTML='<div class="wiki-entry-loading" aria-live="polite">正在加载知识条目…</div>';
    try{
      const e=await window.JDM_KNOWLEDGE.get(slug);
      if(!e){root.innerHTML='<div class="wiki-entry-loading">没有找到这个公开条目。</div>';return}
      /** @type {any} */
      const network=await window.JDM_KNOWLEDGE.entryNetworkContext(e.id,{timelineLimit:8,spaceLimit:12}).catch(async networkError=>{
        const [ctx,recs]=await Promise.all([
          window.JDM_KNOWLEDGE.entryContext(e.id,{relationLimit:100}).catch(()=>({relations:[]})),
          window.JDM_KNOWLEDGE.recommendations(e.id,{limit:8}).catch(()=>[])
        ]);
        return {entry:e,worlds:[],relations:ctx.relations||[],recommendations:Array.isArray(recs)?recs:[],timelinePeers:[],spaceEntries:[],craftProcesses:[],networkError};
      });
      if(!network){root.innerHTML='<div class="wiki-entry-loading">没有找到这个公开 Entry。</div>';return}
      const error=null; const truncated=false;
      if(seq!==initSeq)return;
      render(root,e,network);
      const relations=network.relations||[], recommendations=network.recommendations||[];
      const relationTruncated=Boolean(network.relationTruncated||network.stats?.relationTruncated);
      const recommendationError=network.networkError?network.networkError:null;
      if(recommendationError){const note=document.createElement('div');note.className='wiki-entry-recommendation-warning';note.setAttribute('role','status');note.textContent='部分扩展探索信息暂时无法加载，当前 Entry 仍可正常浏览。';root.querySelector('.wiki-entry-card')?.appendChild(note);}
      if(error)renderRelationWarning(root);
      if(relationTruncated){const note=document.createElement('div');note.className='wiki-entry-relation-warning';note.setAttribute('role','status');note.textContent='相关内容较多，当前仅显示部分关系。';root.querySelector('.wiki-entry-card')?.appendChild(note)}
    }catch(error){if(staticRendered){console.warn('[JDM entry] enhancement failed; keeping static content',error)}else{renderLoadError(root,error)}}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
