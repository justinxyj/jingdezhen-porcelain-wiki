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
    const ctl=makeSignal(timeoutMs);
    try{
      let result=await builderFactory(db,ctl.signal);
      if(!result?.error)return result.data||[];
      let err=normalizeError(result.error,result.status);
      if(retryAuth&&err.status===401&&window.JDM_AUTH){
        try{await window.JDM_AUTH.refresh();ctl.clear();return query(builderFactory,{timeoutMs,retryAuth:false})}
        catch(refreshError){await window.JDM_AUTH.signOut();throw normalizeError(refreshError)}
      }
      throw err;
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
    const media=window.JDM_CONTRACT.mediaList(await query((d,s)=>d.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').eq('entry_id',e.id).order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).abortSignal(s)));
    const ctx=await query((d,s)=>d.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').eq('entry_id',e.id).limit(1).abortSignal(s));
    return {...e,media:canonicalMedia(media),timelineContext:ctx[0]||null};
  }
  async function list({category=null,limit=250,offset=0}={}){
    const rows=window.JDM_CONTRACT?.entries(await query((db,s)=>{let q=db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false}).order('id',{ascending:true}).range(offset,offset+limit-1).abortSignal(s);if(category)q=q.eq('category',category);return q}));
    if(!rows.length)return [];
    const ids=rows.map(e=>e.id);
    const media=window.JDM_CONTRACT.mediaList(await query((db,s)=>db.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').in('entry_id',ids).order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).order('id',{ascending:true}).abortSignal(s)));
    const contexts=await query((db,s)=>db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').in('entry_id',ids).abortSignal(s));
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
const media=window.JDM_CONTRACT.mediaList(await paged(db=>db.from('media').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}).order('id',{ascending:true})));
const contexts=await paged(db=>db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').order('source_tier',{ascending:true}).order('entry_id',{ascending:true}));
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
  async function recommendations(entryId,{limit=12}={}){
    const nodeId=entryId.startsWith('entry:')?entryId:'entry:'+entryId;
    const rows=await query((db,s)=>db.from('knowledge_recommendations').select('source_node_id,target_node_id,target_label,target_category,edge_type,reason,weight').eq('source_node_id',nodeId).order('weight',{ascending:false}).order('target_label',{ascending:true}).limit(limit).abortSignal(s));
    if(!rows.length)return [];
    const ids=[...new Set(rows.map(r=>String(r.target_node_id||'').replace(/^entry:/,'')).filter(Boolean))];
    const entries=window.JDM_CONTRACT?.entries(await query((db,s)=>db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').in('id',ids).abortSignal(s)))||[];
    const byId=new Map(entries.map(e=>[e.id,e]));
    return rows.map(r=>({...r,entry:byId.get(String(r.target_node_id||'').replace(/^entry:/,''))})).filter(r=>r.entry);
  }
  async function graph({nodeType=null,nodeId=null,limit=500,includeEdges=false}={}){
    if(nodeId){
      const edges=await query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,display_order,metadata').or('source_node_id.eq.'+nodeId+',target_node_id.eq.'+nodeId).order('edge_type',{ascending:true}).order('display_order',{ascending:true}).limit(limit).abortSignal(s));
      const ids=[...new Set([nodeId,...edges.flatMap(e=>[e.source_node_id,e.target_node_id])])];
      const nodes=ids.length?await query((db,s)=>db.from('knowledge_graph_nodes').select('node_type,node_id,label,category,summary,metadata').in('node_id',ids).limit(limit).abortSignal(s)):[];
      return {nodes,edges};
    }
    const nodes=await query((db,s)=>{let q=db.from('knowledge_graph_nodes').select('node_type,node_id,label,category,summary,metadata').order('node_type',{ascending:true}).order('node_id',{ascending:true}).limit(limit).abortSignal(s);if(nodeType)q=q.eq('node_type',nodeType);return q});
    if(!includeEdges)return {nodes,edges:[]};
    const edges=await query((db,s)=>db.from('knowledge_graph_edges').select('source_node_id,target_node_id,edge_type,rationale,display_order,metadata').order('source_node_id',{ascending:true}).order('display_order',{ascending:true}).limit(limit).abortSignal(s));
    return {nodes,edges};
  }
  async function byCategory(category,limit=250){return list({category,limit})}
  function url(e){return e?'/jingdezhen-porcelain-wiki/entry/?type='+encodeURIComponent(e.category)+'&slug='+encodeURIComponent(e.slug):'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={all,get,list,worlds,byWorld,graph,recommendations,byCategory,url,state:()=>({...state}),reset:()=>{allPromise=null;cache.clear();state={status:'idle',error:null,updatedAt:null}}};
})();