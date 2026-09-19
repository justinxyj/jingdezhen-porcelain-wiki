/* Canonical public knowledge store: bounded pagination, explicit errors, targeted detail reads. */
/** @typedef {{id:string,slug:string,category:string,zh:object,en:object,ja:object,sources:unknown[],status:string,version:number,updated_at:string}} JDMEntry */
/** @typedef {{id:string,entry_id:string,path:string,title?:string,source?:string,license?:string,creator?:string,source_tier?:number,is_primary?:boolean,canonical_key?:string,source_url?:string,source_type?:string}} JDMMedia */
(function(){
  const cache=new Map();
  let allPromise=null;
  let state={status:'idle',error:null,updatedAt:null};

  function client(){return window.JDM_AUTH?.getClient?.()||window.supabase?.createClient?.(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  function normalizeError(error,status){
    const e=error instanceof Error?error:new Error(String(error?.message||error||'请求失败'));
    e.status=Number(error?.status||status||0)||0;
    e.code=error?.code||e.code||(e.status===401?'AUTH_EXPIRED':e.status===403?'AUTH_FORBIDDEN':e.status===429?'RATE_LIMITED':'JDM_REQUEST_ERROR');
    e.kind=e.status===401?'auth':e.status===403?'forbidden':e.name==='AbortError'?'timeout':(e.message||'').toLowerCase().includes('network')?'network':'server';
    return e;
  }
  function makeSignal(ms=10000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),ms);
    return {signal:controller.signal,clear:()=>clearTimeout(timer)};
  }
  async function query(builderFactory,{timeoutMs=10000,retryAuth=true}={}){
    const db=client();if(!db)throw Object.assign(new Error('知识库配置不可用'),{code:'JDM_CONFIG_MISSING',kind:'config'});
    if(window.JDM_AUTH?.request){
      try{return await window.JDM_AUTH.request(builderFactory,{timeoutMs,retryAuth})}
      catch(error){throw normalizeError(error)}
    }
    const ctl=makeSignal(timeoutMs);
    try{
      const result=await builderFactory(db,ctl.signal);
      if(!result?.error)return result.data||[];
      throw normalizeError(result.error,result.status);
    }catch(error){throw normalizeError(error)}
    finally{ctl.clear()}
  }
  async function paged(builderFactory,{pageSize=500,maxPages=20}={}){
    const out=[];
    for(let page=0;page<maxPages;page++){
      const rows=await query((db,signal)=>builderFactory(db).range(page*pageSize,(page+1)*pageSize-1).abortSignal(signal));
      out.push(...rows);
      if(rows.length<pageSize)return out;
    }
    const e=new Error('公开知识数据超过安全分页上限，请拆分页面查询');e.code='JDM_PAGE_LIMIT';throw e;
  }
  function badMedia(m){
    if(window.JDM_MEDIA_POLICY?.isUsable&&!window.JDM_MEDIA_POLICY.isUsable(m))return true;
    if(window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m))return true;
    const title=String(m?.title||''),path=String(m?.path||''),source=String(m?.source||'');
    return /关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i.test(`${title} ${source}`)||/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(path);
  }
  function canonicalMedia(list){
    return (list||[]).filter(m=>!badMedia(m)).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||Number(a.source_tier||99)-Number(b.source_tier||99)||Number(new Date(a.created_at).getTime())-Number(new Date(b.created_at).getTime()));
  }
  function rememberError(err){state={status:'error',error:err,updatedAt:Date.now()};console.error('[JDM knowledge]',err)}
  async function hydrateEntry(db,e){
    const [mediaResult,ctxResult]=await Promise.all([
      query((d,s)=>d.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').eq('entry_id',e.id).order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).abortSignal(s)),
      query((d,s)=>d.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').eq('entry_id',e.id).limit(1).abortSignal(s))
    ]);
    const media=window.JDM_CONTRACT.mediaList(mediaResult);
    const ctx=ctxResult;
    return {...e,media:canonicalMedia(media),timelineContext:ctx[0]||null,dataStatus:{status:'complete',failed:[]}};
  }
  async function list({category=null,limit=250,offset=0}={}){
    const rows=window.JDM_CONTRACT?.entries(await query((db,s)=>{let q=db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false}).order('id',{ascending:true}).range(offset,offset+limit-1).abortSignal(s);if(category)q=q.eq('category',category);return q}));
    if(!rows.length)return [];
    const ids=rows.map(e=>e.id);
    const [mediaResult,contextResult]=await Promise.all([
      query((db,s)=>db.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').in('entry_id',ids).order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).order('id',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').in('entry_id',ids).abortSignal(s))
    ]);
    const media=window.JDM_CONTRACT.mediaList(mediaResult);
    const contexts=contextResult;
    const mm=new Map();media.forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
    const cm=new Map(contexts.map(x=>[x.entry_id,x]));
    const result=rows.map(e=>({...e,media:canonicalMedia(mm.get(e.id)||[]),timelineContext:cm.get(e.id)||null}));
    result.forEach(e=>cache.set(e.slug,e));return result;
  }
  async function all(){
    if(allPromise)return allPromise;
    state={status:'loading',error:null,updatedAt:state.updatedAt};
    allPromise=(async()=>{
      const entries=window.JDM_CONTRACT.entries(await paged(db=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false})));
      const [mediaResult,contextResult]=await Promise.all([
        paged(db=>db.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).order('id',{ascending:true})),
        paged(db=>db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').order('source_tier',{ascending:true}).order('entry_id',{ascending:true}))
      ]);
      const media=window.JDM_CONTRACT.mediaList(mediaResult);
      const contexts=contextResult;
      const mm=new Map();media.forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
      const cm=new Map(contexts.map(c=>[c.entry_id,c]));
      const rows=entries.map(e=>({...e,media:canonicalMedia(mm.get(e.id)||[]),timelineContext:cm.get(e.id)||null}));
      rows.forEach(e=>cache.set(e.slug,e));state={status:'ready',error:null,updatedAt:Date.now()};return rows;
    })().catch(err=>{allPromise=null;rememberError(err);throw err});
    return allPromise;
  }
  async function get(slug){
    const hit=cache.get(slug);if(hit)return hit;
    try{
      state={status:'loading',error:null,updatedAt:state.updatedAt};
      const entries=window.JDM_CONTRACT.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').eq('slug',slug).limit(1).abortSignal(s)));
      if(!entries[0]){state={status:'ready',error:null,updatedAt:Date.now()};return null}
      const row=await hydrateEntry(client(),entries[0]);cache.set(slug,row);state={status:'ready',error:null,updatedAt:Date.now()};return row;
    }catch(err){rememberError(err);throw err}
  }
  async function worlds(){
    return window.JDM_CONTRACT?.worlds(await query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,description,display_order').order('display_order',{ascending:true}).abortSignal(s)))||[];
  }
  async function byWorld(worldSlug,{limit=250,role=null}={}){
    if(!worldSlug)return [];
    const links=await query((db,s)=>{
      let q=db.from('entry_worlds').select('entry_id,world_slug,role,display_order,rationale').eq('world_slug',worldSlug).order('role',{ascending:true}).order('display_order',{ascending:true}).order('entry_id',{ascending:true}).limit(limit).abortSignal(s);
      if(role)q=q.eq('role',role);
      return q;
    });
    if(!links.length)return [];
    const ids=links.map(x=>x.entry_id);
    const entries=window.JDM_CONTRACT?.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).abortSignal(s)))||[];
    const byId=new Map(entries.map(e=>[e.id,e]));
    return links.map(link=>({...link,entry:byId.get(link.entry_id)})).filter(x=>x.entry).map(x=>({...x.entry,worldRole:x.role,worldRationale:x.rationale,worldOrder:x.display_order}));
  }
  async function entryContext(entryId,{relationLimit=100}={}){
    const id=String(entryId||'');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw Object.assign(new Error('条目标识格式异常'),{code:'JDM_ENTRY_ID_CONTRACT'});
    const relations=await query((db,s)=>db.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').or('entry_id.eq.'+id+',related_entry_id.eq.'+id).order('relation_type',{ascending:true}).order('related_entry_id',{ascending:true}).limit(relationLimit).abortSignal(s));
    const ids=[...new Set(relations.flatMap(r=>[r.entry_id,r.related_entry_id]).filter(x=>x!==id))];
    const related=ids.length?await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).abortSignal(s)):[];
    const byId=new Map(related.map(e=>[e.id,e]));
    return {relations:relations.map(r=>({...r,entry:byId.get(r.entry_id===id?r.related_entry_id:r.entry_id)})).filter(r=>r.entry),related:related.length};
  }
  async function worldOverview(worldSlug,{limit=250,featured=8}={}){
    if(!worldSlug)return null;
    const worlds=await window.JDM_CONTRACT?.worlds(await query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,description,display_order').order('display_order',{ascending:true}).abortSignal(s)))||[];
    const world=worlds.find(w=>w.slug===worldSlug);if(!world)return null;
    const links=await query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,display_order,rationale').eq('world_slug',worldSlug).order('role',{ascending:true}).order('display_order',{ascending:true}).order('entry_id',{ascending:true}).limit(limit).abortSignal(s));
    if(!links.length)return {world,items:[],primary:0,secondary:0,categories:[],connections:[]};
    const ids=links.map(x=>x.entry_id);
    const entries=window.JDM_CONTRACT?.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).abortSignal(s)))||[];
    const byId=new Map(entries.map(e=>[e.id,e]));
    const items=links.map(x=>({...byId.get(x.entry_id),worldRole:x.role,worldRationale:x.rationale,worldOrder:x.display_order})).filter(x=>x.id);
    const allLinks=await query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role').in('entry_id',ids).neq('world_slug',worldSlug).limit(Math.max(500,ids.length*3)).abortSignal(s));
    const count=new Map();allLinks.forEach(x=>count.set(x.world_slug,(count.get(x.world_slug)||0)+1));
    const connections=worlds.filter(w=>count.has(w.slug)).map(w=>({...w,count:count.get(w.slug)})).sort((a,b)=>b.count-a.count||a.display_order-b.display_order).slice(0,6);
    const categories=[...new Set(items.map(x=>x.category).filter(Boolean))];
    return {world,items,primary:items.filter(x=>x.worldRole==='primary').length,secondary:items.filter(x=>x.worldRole==='secondary').length,categories,connections,featured:items.slice(0,featured)};
  }
  async function recommendations(entryId,{limit=12}={}){
    const nodeId=entryId.startsWith('entry:')?entryId:'entry:'+entryId;
    const rows=await query((db,s)=>db.from('knowledge_recommendations').select('source_node_id,target_node_id,target_label,target_category,edge_type,reason,weight').eq('source_node_id',nodeId).order('weight',{ascending:false}).order('target_label',{ascending:true}).limit(limit).abortSignal(s));
    if(!rows.length)return [];
    const ids=[...new Set(rows.map(r=>String(r.target_node_id||'').replace(/^entry:/,'')).filter(Boolean))];
    const entries=window.JDM_CONTRACT?.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).abortSignal(s)))||[];
    const byId=new Map(entries.map(e=>[e.id,e]));
    return rows.map(r=>({...r,entry:byId.get(String(r.target_node_id||'').replace(/^entry:/,''))})).filter(r=>r.entry);
  }
  async function graph({nodeType=null,nodeId=null,limit=500,edgeLimit=2000,includeEdges=false}={}){
    if(nodeId){
      if(!/^(entry|world|category|source|media|craft_process|timeline):[A-Za-z0-9_-]+$/.test(String(nodeId)))throw Object.assign(new Error('知识网络节点标识格式异常'),{code:'JDM_NODE_ID_CONTRACT'});
      const edges=await query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,display_order,metadata').or('source_node_id.eq.'+nodeId+',target_node_id.eq.'+nodeId).order('edge_type',{ascending:true}).order('display_order',{ascending:true}).limit(limit).abortSignal(s));
      const ids=[...new Set([nodeId,...edges.flatMap(e=>[e.source_node_id,e.target_node_id])])];
      const nodes=ids.length?await query((db,s)=>db.from('knowledge_graph_nodes').select('node_type,node_id,label,category,summary,metadata').in('node_id',ids).limit(limit).abortSignal(s)):[];
      return {nodes,edges};
    }
    const nodes=await query((db,s)=>{let q=db.from('knowledge_graph_nodes').select('node_type,node_id,label,category,summary,metadata').order('node_type',{ascending:true}).order('node_id',{ascending:true}).limit(limit).abortSignal(s);if(nodeType)q=q.eq('node_type',nodeType);return q});
    if(!includeEdges)return {nodes,edges:[]};
    const edges=await query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,display_order,metadata').order('source_node_id',{ascending:true}).order('display_order',{ascending:true}).limit(edgeLimit).abortSignal(s));
    return {nodes,edges};
  }
  let searchIndexPromise=null;
  function eraGroupFor(e,t=null){
    const m=e?.zh?.meta||{}, raw=String(t?.era||m.era_group||m.era||m.period||'').trim();
    const title=String(e?.zh?.title||'');
    const yearMatch=title.match(/((?:18|19|20)\d{2})/);
    const year=yearMatch?Number(yearMatch[1]):null;
    if(raw==='tang'||/唐/.test(raw))return 'tang';
    if(raw==='song'||/宋/.test(raw))return 'song';
    if(raw==='yuan'||/元/.test(raw))return 'yuan';
    if(raw==='ming'||/明/.test(raw))return 'ming';
    if(raw==='qing'||/清/.test(raw)||/18世纪/.test(raw))return 'qing';
    if(raw==='near-modern'||/近代|近现代|民国|19世纪|20世纪初/.test(raw))return 'near-modern';
    if(raw==='modern'||/现代/.test(raw)||/20世纪/.test(raw))return (year&&year>=1840&&year<=1948)?'near-modern':'modern';
    if(year&&year>=1840&&year<=1948)return 'near-modern';
    if(year&&year>=1949)return 'modern';
    return raw;
  }

  async function searchEntries(term,{limit=20,category=null,worldSlug=null,era=null,lane=null,hasMap=null,hasTimeline=null}={}) {
    const q=String(term||'').trim().toLowerCase();
    if(!searchIndexPromise){
      searchIndexPromise=query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('id',{ascending:true}).abortSignal(s));
    }
    const rows=await searchIndexPromise;
    let candidates=rows;
    if(category)candidates=candidates.filter(e=>String(e.category||'')===String(category));
    if(era)candidates=candidates.filter(e=>{const t=Array.isArray(e.zh?.meta?.timeline)?e.zh.meta.timeline:[];return t.some(x=>eraGroupFor(e,x)===era)||eraGroupFor(e)===era;});
    if(lane)candidates=candidates.filter(e=>Array.isArray(e.zh?.meta?.timeline)&&e.zh.meta.timeline.some(x=>x?.lane===lane));
    if(hasTimeline!==null&&hasTimeline!==undefined)candidates=candidates.filter(e=>Array.isArray(e.zh?.meta?.timeline)&&e.zh.meta.timeline.length>0===Boolean(hasTimeline));
    if(hasMap!==null&&hasMap!==undefined)candidates=candidates.filter(e=>Boolean(e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null)===Boolean(hasMap));
    if(worldSlug){
      const links=await queryEntriesWorlds(candidates.map(e=>e.id));
      const allowed=new Set(links.filter(x=>x.world_slug===worldSlug).map(x=>x.entry_id));
      candidates=candidates.filter(e=>allowed.has(e.id));
    }
    const scored=candidates.map(e=>{
      const title=String(e.zh?.title||'').toLowerCase();
      const summary=String(e.zh?.summary||'').toLowerCase();
      const content=String(e.zh?.content||'').toLowerCase();
      const slug=String(e.slug||'').toLowerCase();
      const categoryText=String(e.category||'').toLowerCase();
      const enTitle=String(e.en?.title||'').toLowerCase();
      const jaTitle=String(e.ja?.title||'').toLowerCase();
      let score=0;
      if(!q)score=1;
      else{
        if(title===q)score+=1000; else if(title.startsWith(q))score+=700; else if(title.includes(q))score+=500;
        if(categoryText===q)score+=420; else if(categoryText.includes(q))score+=220;
        if(slug===q)score+=400; else if(slug.includes(q))score+=160;
        if(enTitle===q||jaTitle===q)score+=360; else if(enTitle.includes(q)||jaTitle.includes(q))score+=180;
        if(summary.includes(q))score+=90;
        if(content.includes(q))score+=35;
      }
      return {...e,_searchScore:score};
    });
    scored.sort((a,b)=>b._searchScore-a._searchScore||String(a.zh?.title||'').localeCompare(String(b.zh?.title||''),'zh-Hans-CN'));
    return scored.slice(0,Math.max(1,Math.min(250,Number(limit)||20))).map(({_searchScore,...e})=>e);
  }
  async function searchDiscoveryPage(term,{limit=12,recommendationLimit=3,category=null,worldSlug=null,era=null,lane=null,hasMap=null,hasTimeline=null}={}) {
    const entries=await searchEntries(term,{limit:250,category,worldSlug,era,lane,hasMap,hasTimeline});
    if(!entries.length)return {results:[],total:0,facets:{categories:[],eras:[],lanes:[]}};
    const ids=entries.map(e=>e.id);
    const [links,worldRows]=await Promise.all([
      queryEntriesWorlds(ids),
      query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,description,display_order').order('display_order',{ascending:true}).abortSignal(s))
    ]);
    const worldsBySlug=new Map(worldRows.map(w=>[w.slug,w]));
    const worldByEntry=new Map();
    links.forEach(x=>{
      if(!worldByEntry.has(x.entry_id))worldByEntry.set(x.entry_id,[]);
      const world=worldsBySlug.get(x.world_slug);
      if(world)worldByEntry.get(x.entry_id).push({...world,role:x.role,rationale:x.rationale});
    });
    const facetCount=(values)=>{const m=new Map();values.forEach(v=>{if(v)m.set(v,(m.get(v)||0)+1)});return [...m.entries()].map(([value,count])=>({value,count})).sort((a,b)=>b.count-a.count||String(a.value).localeCompare(String(b.value),'zh-Hans-CN'))};
    const facets={
      categories:facetCount(entries.map(e=>e.category)),
      eras:facetCount(entries.flatMap(e=>Array.isArray(e.zh?.meta?.timeline)?e.zh.meta.timeline.map(x=>x?.era):[])),
      lanes:facetCount(entries.flatMap(e=>Array.isArray(e.zh?.meta?.timeline)?e.zh.meta.timeline.map(x=>x?.lane):[])),
      worlds:facetCount(links.map(x=>x.world_slug)),
      mapped:entries.filter(e=>e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null).length,
      timed:entries.filter(e=>Array.isArray(e.zh?.meta?.timeline)&&e.zh.meta.timeline.length).length
    };
    const visibleEntries=entries.slice(0,Math.max(1,Math.min(24,Number(limit)||12)));
    const sourceNodeIds=visibleEntries.map(e=>'entry:'+e.id);
    const recommendationRows=sourceNodeIds.length?await query((db,s)=>db.from('knowledge_recommendations').select('source_node_id,target_node_id,target_label,target_category,edge_type,reason,weight').in('source_node_id',sourceNodeIds).order('weight',{ascending:false}).order('target_label',{ascending:true}).limit(Math.max(1,visibleEntries.length*Math.min(5,Math.max(1,Number(recommendationLimit)||3)))).abortSignal(s)):[];
    const targetIds=[...new Set(recommendationRows.map(r=>String(r.target_node_id||'').replace(/^entry:/,'')).filter(Boolean))];
    const targetEntries=targetIds.length?window.JDM_CONTRACT?.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',targetIds).abortSignal(s))):[];
    const targetById=new Map((targetEntries||[]).map(e=>[e.id,e]));
    const recBySource=new Map();
    recommendationRows.forEach(r=>{const target=targetById.get(String(r.target_node_id||'').replace(/^entry:/,''));if(!target)return;if(!recBySource.has(r.source_node_id))recBySource.set(r.source_node_id,[]);if(recBySource.get(r.source_node_id).length<Math.max(1,Math.min(5,Number(recommendationLimit)||3)))recBySource.get(r.source_node_id).push({...r,entry:target})});
    const results=visibleEntries.map(e=>({...e,worlds:worldByEntry.get(e.id)||[],recommendations:recBySource.get('entry:'+e.id)||[],discovery:{score:0,hasMap:Boolean(e.zh?.meta?.map?.lat!=null&&e.zh.meta.map.lng!=null),hasTimeline:Boolean(Array.isArray(e.zh?.meta?.timeline)&&e.zh.meta.timeline.length),eras:[...new Set(((e.zh?.meta?.timeline||[]).map(x=>eraGroupFor(e,x)).filter(Boolean).length?((e.zh?.meta?.timeline||[]).map(x=>eraGroupFor(e,x)).filter(Boolean)):[eraGroupFor(e)]).filter(Boolean))],lanes:[...new Set((e.zh?.meta?.timeline||[]).map(x=>x?.lane).filter(Boolean))]}}));
    return {results,total:entries.length,facets};
  }
  async function searchDiscovery(term,options={}) {
    return (await searchDiscoveryPage(term,options)).results;
  }
  async function queryEntriesWorlds(ids){
    return ids.length?await query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,rationale').in('entry_id',ids).order('role',{ascending:true}).order('display_order',{ascending:true}).abortSignal(s)):[];
  }
  async function personAtlas({limit=250}={}) {
    const people=(await byCategory('人物',limit)).filter(e=>e?.status==='published');
    if(!people.length)return [];
    const ids=people.map(e=>e.id);
    const [worldResult,worldDefResult,relationResult,craftResult]=await Promise.all([
      query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,rationale').in('entry_id',ids).abortSignal(s)),
      query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,display_order').order('display_order',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').or('entry_id.in.('+ids.join(',')+'),related_entry_id.in.('+ids.join(',')+')').order('relation_type',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,metadata').in('source_node_id',ids.map(id=>'entry:'+id)).eq('edge_type','craft_process:historically_important_for').abortSignal(s))
    ]);
    const worldRows=worldResult;
    const worldDefs=worldDefResult;
    const relationRows=relationResult;
    const craftEdges=craftResult;
    const otherIds=[...new Set(relationRows.flatMap(r=>[r.entry_id,r.related_entry_id]).filter(id=>id&&!ids.includes(id)))];
    const otherRows=otherIds.length?await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,status').eq('status','published').in('id',otherIds).abortSignal(s)):[];
    const craftIds=[...new Set(craftEdges.map(r=>String(r.target_node_id||'')).filter(x=>x.startsWith('craft:')))];
    const craftRows=craftIds.length?await query((db,s)=>db.from('knowledge_graph_nodes').select('node_id,label,node_type,metadata').in('node_id',craftIds).abortSignal(s)):[];
    const worlds=new Map(worldDefs.map(w=>[w.slug,w])), byOther=new Map(otherRows.map(e=>[e.id,e])), crafts=new Map(craftRows.map(e=>[e.node_id,e]));
    const worldByPerson=new Map(), relationsByPerson=new Map(), craftsByPerson=new Map();
    worldRows.forEach(w=>{if(!worldByPerson.has(w.entry_id))worldByPerson.set(w.entry_id,[]);const d=worlds.get(w.world_slug);if(d)worldByPerson.get(w.entry_id).push({...d,role:w.role,rationale:w.rationale})});
    relationRows.forEach(r=>{
      const owner=ids.includes(r.entry_id)?r.entry_id:ids.includes(r.related_entry_id)?r.related_entry_id:null;
      if(!owner)return;
      const targetId=owner===r.entry_id?r.related_entry_id:r.entry_id;
      const target=byOther.get(targetId);
      if(!target)return;
      if(!relationsByPerson.has(owner))relationsByPerson.set(owner,[]);
      relationsByPerson.get(owner).push({...r,target,fromOwner:owner===r.entry_id});
    });
    craftEdges.forEach(r=>{const id=r.source_node_id;if(!craftsByPerson.has(id))craftsByPerson.set(id,[]);const node=crafts.get(r.target_node_id);if(node)craftsByPerson.get(id).push({...node,rationale:r.rationale})});
    const peopleByEra=new Map();
    people.forEach(e=>{const era=eraGroupFor(e);if(!era)return;if(!peopleByEra.has(era))peopleByEra.set(era,[]);peopleByEra.get(era).push(e)});
    return people.map(e=>{
      const zh=/** @type {any} */ (e.zh); const m=zh?.meta||{}, rel=relationsByPerson.get(e.id)||[], era=eraGroupFor(e);
      const works=rel.filter(r=>r.target?.category==='器物').map(r=>r.target);
      const kilns=rel.filter(r=>r.target?.category==='窑址').map(r=>r.target);
      const documents=rel.filter(r=>r.target?.category==='文献').map(r=>r.target);
      const relatedPeople=rel.filter(r=>r.target?.category==='人物').map(r=>r.target);
      const sameEra=(peopleByEra.get(era)||[]).filter(x=>x.id!==e.id).slice(0,4);
      return {entry:e,worlds:worldByPerson.get(e.id)||[],relations:rel,works,kilns,documents,relatedPeople,sameEra,craftProcesses:craftsByPerson.get('entry:'+e.id)||[],era,role:m.role||'',map:m.map||null};
    });
  }

  async function objectAtlas({limit=250}={}) {
    const objects=(await byCategory('器物',limit)).filter(e=>e?.status==='published');
    if(!objects.length)return [];
    const ids=objects.map(e=>e.id);
    const [worldResult,worldDefResult,relationResult,craftResult]=await Promise.all([
      query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,rationale').in('entry_id',ids).abortSignal(s)),
      query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,display_order').order('display_order',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').in('entry_id',ids).order('relation_type',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,metadata').in('source_node_id',ids.map(id=>'entry:'+id)).eq('edge_type','craft_process:historically_important_for').abortSignal(s))
    ]);
    const worldRows=worldResult;
    const worldDefs=worldDefResult;
    const relations=relationResult;
    const craftEdges=craftResult;
    const relatedIds=[...new Set(relations.map(r=>r.related_entry_id).filter(Boolean))];
    const relatedRows=relatedIds.length?await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,status').eq('status','published').in('id',relatedIds).abortSignal(s)):[];
    const craftIds=[...new Set(craftEdges.map(r=>String(r.target_node_id||'')).filter(x=>x.startsWith('craft:')))];
    const craftRows=craftIds.length?await query((db,s)=>db.from('knowledge_graph_nodes').select('node_id,label,node_type,metadata').in('node_id',craftIds).abortSignal(s)):[];
    const worlds=new Map(worldDefs.map(w=>[w.slug,w]));
    const related=new Map(relatedRows.map(e=>[e.id,e]));
    const crafts=new Map(craftRows.map(e=>[e.node_id,e]));
    const worldByEntry=new Map(), relationByEntry=new Map(), craftByEntry=new Map();
    worldRows.forEach(w=>{if(!worldByEntry.has(w.entry_id))worldByEntry.set(w.entry_id,[]);const d=worlds.get(w.world_slug);if(d)worldByEntry.get(w.entry_id).push({...d,role:w.role,rationale:w.rationale})});
    relations.forEach(r=>{if(!relationByEntry.has(r.entry_id))relationByEntry.set(r.entry_id,[]);const e=related.get(r.related_entry_id);if(e)relationByEntry.get(r.entry_id).push({...r,entry:e})});
    craftEdges.forEach(r=>{if(!craftByEntry.has(r.source_node_id))craftByEntry.set(r.source_node_id,[]);const node=crafts.get(r.target_node_id);if(node)craftByEntry.get(r.source_node_id).push({...node,rationale:r.rationale})});
    return objects.map(e=>{
      const zh=/** @type {any} */ (e.zh); const m=zh?.meta||{};
      const rel=relationByEntry.get(e.id)||[];
      return {
        entry:e,
        worlds:worldByEntry.get(e.id)||[],
        relations:rel,
        people:rel.filter(r=>r.entry?.category==='人物').map(r=>r.entry),
        kilns:rel.filter(r=>r.entry?.category==='窑址').map(r=>r.entry),
        documents:rel.filter(r=>r.entry?.category==='文献').map(r=>r.entry),
        craftProcesses:craftByEntry.get('entry:'+e.id)||[],
        timeline:Array.isArray(m.timeline)?m.timeline:[],
        map:m.map||null,
        period:m.period||m.era||'',
        craft:m.craft||''
      };
    });
  }

  async function craftProcesses({limit=72}={}) {
    const n=Math.max(1,Math.min(72,Number(limit)||72));
    return await query((db,s)=>db.from('craft_processes').select('id,sequence,slug,name_zh,category,category_name,description_zh,historical_period,tools_zh,materials_zh,output_zh,source_title,source_url,source_institution,source_tier,image_url,image_credit,image_source_url,image_status,image_license,image_creator').order('sequence',{ascending:true}).limit(n).abortSignal(s));
  }

  async function craftProcessContext(processId,{entryLimit=40,relationLimit=300}={}) {
    const id=String(processId||'');
    if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('JDM_CRAFT_PROCESS_ID_CONTRACT');
    const processResult=await query((db,s)=>db.from('craft_processes').select('id,sequence,slug,name_zh,category,category_name,description_zh,historical_period,tools_zh,materials_zh,output_zh,source_title,source_url,source_institution,source_tier,image_url,image_credit,image_source_url,image_status,image_license,image_creator').eq('id',id).limit(1).abortSignal(s));
    const process=processResult[0];
    if(!process)return null;
    const [neighborResult,linkResult]=await Promise.all([
      query((db,s)=>db.from('craft_process_relations').select('process_id,related_process_id,relation_type,note').or('process_id.eq.'+id+',related_process_id.eq.'+id).order('relation_type',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('entry_craft_processes').select('entry_id,process_id,relation_type,note').eq('process_id',id).limit(entryLimit).abortSignal(s))
    ]);
    const neighborRows=neighborResult;
    const linkRows=linkResult;
    const entryIds=[...new Set(linkRows.map(x=>x.entry_id).filter(Boolean))];
    const [entryResult,worldResult,relationResult]=await Promise.all([
      entryIds.length?query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,status').eq('status','published').in('id',entryIds).abortSignal(s)):Promise.resolve([]),
      entryIds.length?query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,rationale').in('entry_id',entryIds).abortSignal(s)):Promise.resolve([]),
      entryIds.length?query((db,s)=>db.from('entry_relations').select('entry_id,related_entry_id,relation_type,note').in('entry_id',entryIds).limit(relationLimit).abortSignal(s)):Promise.resolve([])
    ]);
    const entries=entryResult;
    const worlds=worldResult;
    const relations=relationResult;
    const targetIds=[...new Set(relations.map(x=>x.related_entry_id).filter(Boolean))];
    const targets=targetIds.length?await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,status').eq('status','published').in('id',targetIds).abortSignal(s)):[]; 
    const byEntry=new Map(entries.map(e=>[e.id,e]));
    const byTarget=new Map(targets.map(e=>[e.id,e]));
    const worldByEntry=new Map();
    worlds.forEach(w=>{if(!worldByEntry.has(w.entry_id))worldByEntry.set(w.entry_id,[]);worldByEntry.get(w.entry_id).push(w)});
    const relatedByEntry=new Map();
    relations.forEach(r=>{const target=byTarget.get(r.related_entry_id);if(!target)return;if(!relatedByEntry.has(r.entry_id))relatedByEntry.set(r.entry_id,[]);relatedByEntry.get(r.entry_id).push({...r,target})});
    const eraForEntry=e=>{
      const m=(/** @type {any} */ (e.zh))?.meta||{};
      const timeline=Array.isArray(m.timeline)?m.timeline:[];
      const eras=[...new Set(timeline.map(t=>eraGroupFor(e,t)).filter(Boolean))];
      return eras[0]||eraGroupFor(e);
    };
    const materialTokens=String(process.materials_zh||'').split(/[、，,；;\/]/).map(x=>x.trim()).filter(Boolean);
    const materialLabels=[...new Set(materialTokens)];
    const enriched=linkRows.map(link=>{
      const entry=byEntry.get(link.entry_id);
      if(!entry)return null;
      const m=(/** @type {any} */ (entry.zh))?.meta||{};
      const rel=relatedByEntry.get(entry.id)||[];
      return {
        ...link,
        entry,
        worlds:worldByEntry.get(entry.id)||[],
        era:eraForEntry(entry),
        map:m.map||null,
        related:rel,
        people:rel.filter(r=>r.target?.category==='人物').map(r=>r.target),
        objects:rel.filter(r=>r.target?.category==='器物').map(r=>r.target),
        kilns:rel.filter(r=>r.target?.category==='窑址').map(r=>r.target),
        documents:rel.filter(r=>r.target?.category==='文献').map(r=>r.target)
      };
    }).filter(Boolean);
    const neighborIds=[...new Set(neighborRows.flatMap(x=>[x.process_id,x.related_process_id]).filter(x=>x&&x!==id))];
    const neighbors=neighborIds.length?await query((db,s)=>db.from('craft_processes').select('id,sequence,slug,name_zh,category,category_name').in('id',neighborIds).order('sequence',{ascending:true}).abortSignal(s)):[];
    const neighborMap=new Map(neighbors.map(x=>[x.id,x]));
    const previous=enriched.length?neighborRows.find(x=>x.related_process_id===id)?.process_id:null;
    const next=enriched.length?neighborRows.find(x=>x.process_id===id)?.related_process_id:null;
    return {
      process,
      previous:previous?neighborMap.get(previous)||null:null,
      next:next?neighborMap.get(next)||null:null,
      entries:enriched,
      materials:materialLabels,
      objects:[...new Map(enriched.flatMap(x=>x.objects).map(e=>[e.id,e])).values()],
      people:[...new Map(enriched.flatMap(x=>x.people).map(e=>[e.id,e])).values()],
      kilns:[...new Map(enriched.flatMap(x=>x.kilns).map(e=>[e.id,e])).values()],
      documents:[...new Map(enriched.flatMap(x=>x.documents).map(e=>[e.id,e])).values()],
      eras:[...new Set(enriched.map(x=>x.era).filter(Boolean))],
      mappedEntries:[...new Map(enriched.filter(x=>x.map).map(x=>[x.entry.id,x.entry])).values()],
      stats:{
        entries:enriched.length,
        people:[...new Set(enriched.flatMap(x=>x.people.map(e=>e.id)))].length,
        objects:[...new Set(enriched.flatMap(x=>x.objects.map(e=>e.id)))].length,
        kilns:[...new Set(enriched.flatMap(x=>x.kilns.map(e=>e.id)))].length,
        documents:[...new Set(enriched.flatMap(x=>x.documents.map(e=>e.id)))].length,
        eras:[...new Set(enriched.map(x=>x.era).filter(Boolean))].length,
        spaces:[...new Set(enriched.filter(x=>x.map).map(x=>x.entry.id))].length
      }
    };
  }

  async function entryNetworkContext(entryId,{timelineLimit=12,spaceLimit=24}={}) {
    const rawId=String(entryId||'');
    const id=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawId)?rawId:null;
    let entry=id?null:await get(rawId);
    if(!id&&entry)return entryNetworkContext(entry.id,{timelineLimit,spaceLimit});
    if(!id)return null;
    entry=await get(id);
    if(!entry)return null;
    const [ctx,worldRows,worldDefs,recs,craftEdges]=await Promise.all([
      entryContext(entry.id),
      query((db,s)=>db.from('entry_worlds').select('entry_id,world_slug,role,rationale').eq('entry_id',entry.id).order('role',{ascending:true}).abortSignal(s)),
      query((db,s)=>db.from('knowledge_worlds').select('slug,title,short_title,description,display_order').order('display_order',{ascending:true}).abortSignal(s)),
      recommendations(entry.id,{limit:8}),
      query((db,s)=>db.from('knowledge_graph_edges').select('target_node_id,rationale,display_order,metadata').eq('source_node_id','entry:'+entry.id).eq('edge_type','craft_process:historically_important_for').order('display_order',{ascending:true}).limit(12).abortSignal(s))
    ]);
    const worldBySlug=new Map(worldDefs.map(w=>[w.slug,w]));
    const worlds=worldRows.map(x=>({...worldBySlug.get(x.world_slug),role:x.role,rationale:x.rationale})).filter(x=>x.slug);
    const craftIds=[...new Set(craftEdges.map(x=>x.target_node_id).filter(Boolean))];
    const craftNodes=craftIds.length?await query((db,s)=>db.from('knowledge_graph_nodes').select('node_id,label,category,summary,metadata').in('node_id',craftIds).abortSignal(s)):[];
    const relationEntries=ctx.relations.map(x=>x.entry).filter(Boolean);
    const timeline=Array.isArray(entry.zh?.meta?.timeline)?entry.zh.meta.timeline:[];
    const eras=[...new Set(timeline.map(x=>x?.era).filter(Boolean))];
    const laneSet=new Set(timeline.map(x=>x?.lane).filter(Boolean));
    const [timelinePeers,spacePeers]=await Promise.all([
      eras.length?query((db,s)=>db.rpc('entry_timeline_peers',{p_entry_id:entry.id,p_eras:eras,p_limit:Math.min(100,Math.max(1,timelineLimit))}).abortSignal(s)):Promise.resolve([]),
      query((db,s)=>db.rpc('entry_space_peers',{p_entry_id:entry.id,p_eras:eras,p_limit:Math.min(100,Math.max(1,spaceLimit))}).abortSignal(s))
    ]);
    const spaceEntries=spacePeers||[];
    return {
      entry,
      worlds,
      relations:ctx.relations,
      recommendations:recs,
      craftProcesses:craftNodes.map(n=>({...n,rationale:craftEdges.find(x=>x.target_node_id===n.node_id)?.rationale||''})),
      timeline,
      eras:[...eras],
      lanes:[...laneSet],
      timelinePeers,
      spaceEntries,
      map:entry.zh?.meta?.map||null,
      stats:{relationCount:ctx.relations.length,recommendationCount:recs.length,timelinePeerCount:timelinePeers.length,spaceCount:spaceEntries.length}
    };
  }
  async function byCategory(category,limit=250){return list({category,limit})}
  function url(e){return e?'/jingdezhen-porcelain-wiki/entry/?type='+encodeURIComponent(e.category)+'&slug='+encodeURIComponent(e.slug):'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={all,get,list,worlds,byWorld,worldOverview,entryContext,entryNetworkContext,craftProcesses,craftProcessContext,objectAtlas,personAtlas,graph,recommendations,eraGroup:eraGroupFor,searchEntries,searchDiscovery,searchDiscoveryPage,byCategory,url,state:()=>({...state}),reset:()=>{allPromise=null;searchIndexPromise=null;cache.clear();state={status:'idle',error:null,updatedAt:null}}};
})();