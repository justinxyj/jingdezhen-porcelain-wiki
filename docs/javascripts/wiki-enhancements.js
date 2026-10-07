/* Public knowledge-entry renderer. Internal IDs, relation types and version fields never render. */
(function(){
  const esc=s=>window.JDM_SAFE?.esc?.(s)??window.JDM_AUTH?.esc?.(s)??String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const ROOT='/jingdezhen-porcelain-wiki/';
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`${ROOT}entry/?slug=${encodeURIComponent(e?.slug||'')}`;
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  const hrefFor=u=>safeHref(u)||'';
  const sourceUrl=s=>{if(!s||typeof s!=='object')return '';const raw=String(s.url??'').trim();return /^https?:\/\//i.test(raw)?safeHref(raw,{allowHttp:true}):''};
  const sourceLabel=s=>{if(s&&typeof s==='object'){for(const k of ['label','title']){const v=s[k];if(v!=null&&String(v).trim())return String(v)}}return '来源'};
  /* status: missing/blank/'published' => visible; anything else (e.g. 'pending') => hidden. tier/grade are never rendered. */
  const sourcePublished=s=>{const st=s?.status;return st==null||(typeof st==='string'&&!st.trim())||String(st).trim().toLowerCase()==='published'};
  /* Same rules as scripts/generate_entry_pages.py visible_sources(): n = 1-based position in the original array; url de-dup is a fallback and never renumbers. */
  const visibleSources=list=>{const seen=new Set(),out=[];if(!Array.isArray(list))return out;list.forEach((s,i)=>{if(!s||typeof s!=='object'||!sourcePublished(s))return;const key=String(s.url??'').trim(),u=sourceUrl(s);if(!u||seen.has(key))return;seen.add(key);out.push({n:i+1,href:u,label:sourceLabel(s)})});return out};
  const bodyHasRefs=raw=>/\[\d+\]/.test(String(raw||'').replace(/<[^>]*>/g,' '));
  const entrySources=e=>Array.isArray(e?.zh?.sources)&&e.zh.sources.length?e.zh.sources:e?.sources;
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  function detailedIntro(e){
    const m=e.zh?.meta||{};
    const summary=plain(e.zh?.summary||'');
    const context=plain(m.description||m.context||m.quote_context||'');
    const text=summary||context;
    if(text.length>=180)return text.slice(0,180).replace(/[，；、]$/,'')+'…';
    if(context&&text!==context&&context.length>=80)return (text+(text?'\n\n':'')+context).trim().slice(0,260);
    const facts=[m.era||m.period,m.role,m.location,m.region,m.craft].filter(Boolean).join('、');
    return text||(facts?facts+'。该条目结合可核验文献、考古与馆藏资料说明其历史位置及与景德镇陶瓷发展的关系。':'该条目结合可核验史料、研究与馆藏信息说明相关历史背景及其与景德镇陶瓷史的联系。');
  }
  function render(root,e,network){
    const m=e.zh?.meta||{},im=validMedia(e);
    const intro=detailedIntro(e), relations=network?.relations||[], recommendations=network?.recommendations||[];
    const worlds=network?.worlds||[], timelinePeers=network?.timelinePeers||[], spaceEntries=network?.spaceEntries||[], craftProcesses=network?.craftProcesses||[];
    const tags=[m.period,m.era,m.role,m.location,m.region,m.craft].filter(Boolean);
    const relationCards=relations.slice(0,24).sort((a,b)=>String(a.entry.category).localeCompare(String(b.entry.category))).map(r=>{const h=hrefFor(url(r.entry));return h?'<a href="'+h+'"><span>'+esc((r.entry.category||'相关条目')+' · '+(r.relation_type||'相关'))+'</span><b>'+esc(r.entry.zh?.title||r.entry.slug)+'</b><small>'+esc(r.note||'继续查看相关知识')+' →</small></a>':''}).filter(Boolean).join('');
    const worldPath=w=>ROOT+(w.slug==='history'?'history/':w.slug==='craft'?'craft/':w.slug==='objects'?'objects/':w.slug==='space'?'kilns/':w.slug==='people'?'people/':w.slug==='research'?'research/':w.slug==='contemporary'?'contemporary/':'');
    const worldLinks=worlds.map(w=>{const h=hrefFor(worldPath(w));return h?'<a class="wiki-entry-world-link" href="'+h+'">'+esc(w.short_title||w.title||w.slug)+' →</a>':''}).filter(Boolean).join('');
    const entryCards=(items,kind)=>items.slice(0,8).map(x=>{const h=hrefFor(url(x));return h?'<a class="wiki-entry-explore-card" href="'+h+'"><span>'+esc(kind)+'</span><b>'+esc(x.zh?.title||x.slug)+'</b><small>'+esc(x.category||'知识')+' →</small></a>':''}).filter(Boolean).join('');
    const visSources=visibleSources(entrySources(e)), numberedSources=visSources.length>0&&bodyHasRefs(e.zh?.content);
    const sourceLinks=visSources.map(s=>{const a='<a href="'+s.href+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a>';return numberedSources?'<li><span class="wiki-entry-source-no">['+s.n+']</span> '+a+'</li>':a}).join('');
    const sourceBlock=numberedSources?'<ol class="wiki-entry-source-links wiki-entry-source-refs" style="list-style:none;padding:0;margin:0">'+sourceLinks+'</ol>':'<div class="wiki-entry-source-links">'+(sourceLinks||'<span>暂无外部来源。</span>')+'</div>';
    root.innerHTML='<article class="wiki-entry-card wiki-entry-v2">'+
      '<header class="wiki-entry-header"><div><div class="wiki-entry-kicker">'+esc(e.category||'知识')+'</div><h1>'+esc(e.zh?.title||e.slug)+'</h1><p>'+esc(intro)+'</p></div>'+(im&&safeHref(im.path)?'<figure class="wiki-entry-cover"><img data-museum-image="1" src="'+safeHref(im.path)+'" alt="'+esc(im.title||e.zh?.title||e.slug)+'"><figcaption>'+esc(im.title||'')+' · '+esc(im.source||'')+' · '+esc(im.license||'')+'</figcaption></figure>':'<p class="visitor-missing-image">暂无公开图片。图片需具备可追溯来源与使用许可。</p>')+'</header>'+
      (tags.length?'<div class="wiki-entry-v2-tags">'+tags.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')+
      (worldLinks?'<div class="wiki-entry-world-path"><span>相关阅读主题</span><div>'+worldLinks+'</div></div>':'')+
      '<div class="visitor-entry-shortcuts">'+(m.map?.lat!=null?'<a href="'+ROOT+'museum/kiln-map/?slug='+encodeURIComponent(e.slug)+'">在地图中查看 →</a>':'')+(m.timeline?.length?'<a href="'+ROOT+'museum/timeline/?slug='+encodeURIComponent(e.slug)+'">在时间轴中查看 →</a>':'')+'</div>'+
      '<div class="wiki-entry-v2-grid"><div class="wiki-entry-v2-main">'+
      '<section class="wiki-entry-body"><h2>详细介绍</h2><div class="wiki-entry-text">'+contentOrIntro(e,intro)+'</div></section>'+
      (relations.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">知识关系</div><h2>它与哪些知识相连</h2><div class="wiki-entry-v2-relations">'+relationCards+'</div></section>':'')+
      (e.timelineContext?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">时间与空间</div><h2>历史与空间</h2><p>'+esc(e.timelineContext.official_summary||e.timelineContext.relationship_to_jingdezhen||e.timelineContext.historical_role||'该条目具有可追溯的时间轴或历史语境信息。')+'</p>'+(safeHref(e.timelineContext.official_source_url)?'<a href="'+safeHref(e.timelineContext.official_source_url)+'" target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a>':'')+'</section>':'')+
      (timelinePeers.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">同一时代</div><h2>同一时代，还可以看</h2><div class="wiki-entry-explore-grid">'+entryCards(timelinePeers,'同一时代')+'</div></section>':'')+
      (spaceEntries.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">空间语境</div><h2>同一空间语境，还可以看</h2><div class="wiki-entry-explore-grid">'+entryCards(spaceEntries,'空间关联')+'</div></section>':'')+
      (craftProcesses.length?'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">工艺</div><h2>相关工艺</h2><div class="wiki-entry-craft-list">'+craftProcesses.slice(0,8).map(p=>{const h=hrefFor(ROOT+'craft/technology-tree/?process='+encodeURIComponent(p.node_id||''));return h?'<a href="'+h+'"><span>工序</span><b>'+esc(p.label||p.node_id)+'</b><small>进入72道工艺 →</small></a>':''}).filter(Boolean).join('')+'</div></section>':'')+
      (recommendations.length?'<section class="wiki-entry-recommendations"><div class="wiki-entry-section-kicker">知识探索</div><h2>你可能还想了解</h2><p class="wiki-recommendation-intro">这些条目可以补充当前主题的背景；具体关系以各自来源为依据。</p><div class="wiki-recommendation-grid">'+recommendations.map(r=>{const h=hrefFor(url(r.entry));return h?'<a class="wiki-recommendation-card" href="'+h+'"><span class="wiki-recommendation-category">'+esc(r.target_category||r.entry.category||'知识')+'</span><b>'+esc(r.target_label||r.entry.zh?.title||r.entry.slug)+'</b><small>'+esc(r.reason||'相关知识入口')+' →</small></a>':''}).filter(Boolean).join('')+'</div></section>':'')+
      '<section class="wiki-entry-v2-section"><h2>参考资料与来源</h2><p>'+visSources.length+' 条可访问来源；数量不代表结论已获核验。</p>'+sourceBlock+'</section><details class="visitor-research"><summary>深入研究：关系图与研究方法</summary><p><a href="'+ROOT+'network/relations/?node='+encodeURIComponent('entry:'+e.id)+'">查看关系图</a> · <a href="'+ROOT+'research/">阅读研究方法</a></p></details><p class="visitor-feedback"><a href="https://github.com/justinxyj/jingdezhen-porcelain-wiki/issues/new?title='+encodeURIComponent('条目反馈：'+(e.zh?.title||e.slug))+'">发现错误？反馈此条目 →</a></p><p>继续阅读：<a href="'+ROOT+'search/?category='+encodeURIComponent(e.category||'')+'">更多'+esc(e.category||'相关')+'条目 →</a></p></div></div></article>';
  }
  function sanitizeBodyHtml(raw){
    if(typeof window.JDM_SAFE?.sanitizeBodyHtml==='function')return window.JDM_SAFE.sanitizeBodyHtml(raw);
    const tpl=document.createElement('template');
    tpl.innerHTML=String(raw||'');
    const allowed=new Set(['P','BR','STRONG','B','EM','I','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','A']);
    tpl.content.querySelectorAll('*').forEach(node=>{
      if(!allowed.has(node.tagName)){node.replaceWith(...node.childNodes);return;}
      [...node.attributes].forEach(attr=>{
        if(node.tagName==='A'&&attr.name.toLowerCase()==='href'){
          const href=safeHref(attr.value);
          if(href)node.setAttribute('href',href);else node.removeAttribute('href');
        }else node.removeAttribute(attr.name);
      });
      if(node.tagName==='A'&&node.getAttribute('href')){
        node.setAttribute('target','_blank');
        node.setAttribute('rel','noopener noreferrer');
      }
    });
    return tpl.innerHTML;
  }
  function contentOrIntro(e,intro){
    const raw=String(e.zh?.content||'').trim();
    const summary=plain(e.zh?.summary||'').trim();
    if(!raw)return '<p>'+esc(intro)+'</p>';
    const tpl=document.createElement('template');
    tpl.innerHTML=raw;
    const generic=[
      '本 Entry 的核心信息以页面列出的来源为证据入口。涉及年代、人物身份、器物归属、窑址范围或技术判断时，应优先回到原始馆藏、考古报告、官方遗产文件或原始文献核对，而不应仅依据二手概括。',
      '本 Entry 以 UNESCO、博物馆或研究机构资料作为证据入口；涉及具体年代、窑口、器物归属和传播路径时，应回到原始记录核对。',
      '本条目只陈述当前资料能够支持的范围。单一来源不能自动证明更大的历史结论；对于存在学术争议、断代差异或来源不足的内容，应保留不确定性，并避免把推测写成确定事实。',
      '不把风格相似自动等同为技术传播，不把馆藏器物自动归属于具体制作者，也不把单一来源概括扩展为更大的历史结论。',
      '可从本 Entry 当前所属的 Knowledge World、关联 Entry、人物、器物、窑址、工艺或文献继续追踪证据链。研究型引用应同时核对具体来源页面与原始材料。',
      '可沿当前 Knowledge World、相关器物、窑址、人物和文献继续追踪证据链。',
      '本条目以博物馆、UNESCO或研究机构记录为证据入口。',
      '具体年代、窑口、传播路径与制作者归属仍需回到原始记录核对。',
      '可沿关联器物、窑址、人物和文献继续追踪。'
    ];
    [...tpl.content.querySelectorAll('p')].forEach(p=>{
      if(generic.includes(plain(p.textContent||''))){
        const prev=p.previousElementSibling;
        if(prev?.tagName==='H2'&&['证据与来源','研究边界','继续研究'].includes(plain(prev.textContent||'').trim()))prev.remove();
        p.remove();
      }
    });
    [...tpl.content.querySelectorAll('h2')].forEach(h=>{
      const t=plain(h.textContent||'').trim();
      if(['证据与来源','研究边界','继续研究'].includes(t))h.remove();
    });
    const first=tpl.content.firstElementChild;
    if(first?.tagName==='P'&&summary&&plain(first.textContent||'').trim()===summary)first.remove();
    const core=tpl.content.querySelector('h2');
    if(core&&plain(core.textContent||'').trim()==='核心信息'){
      const next=core.nextElementSibling;
      if(next?.tagName==='P'&&summary&&plain(next.textContent||'').trim()===summary){
        core.remove(); next.remove();
      }
    }
    const cleaned=sanitizeBodyHtml(tpl.innerHTML).trim();
    return cleaned||'<p>'+esc(summary||intro)+'</p>';
  }
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
    root.innerHTML=`<div class="wiki-entry-error" role="alert"><h2>知识内容暂时无法加载</h2><p>网络或资料服务暂时不可用。请稍后重试。</p><button type="button">重新加载</button><details><summary>技术详情</summary>${code}</details></div>`;
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
      if(!e){if(staticRendered)return;root.innerHTML='<div class="wiki-entry-loading">没有找到这个公开条目。</div>';return}
      /** @type {any} */
      const network=await window.JDM_KNOWLEDGE.entryNetworkContext(e.id,{timelineLimit:8,spaceLimit:12}).catch(async networkError=>{
        const [ctx,recs]=await Promise.all([
          window.JDM_KNOWLEDGE.entryContext(e.id,{relationLimit:100}).catch(()=>({relations:[]})),
          window.JDM_KNOWLEDGE.recommendations(e.id,{limit:8}).catch(()=>[])
        ]);
        return {entry:e,worlds:[],relations:ctx.relations||[],recommendations:Array.isArray(recs)?recs:[],timelinePeers:[],spaceEntries:[],craftProcesses:[],networkError};
      });
      if(!network){if(staticRendered)return;root.innerHTML='<div class="wiki-entry-loading">没有找到这个公开 Entry。</div>';return}
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
