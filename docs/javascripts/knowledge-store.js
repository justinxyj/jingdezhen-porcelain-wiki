/* Canonical public knowledge store: explicit loading/error states, targeted detail reads, and bounded requests. */
(function(){
  const cache=new Map();
  let allPromise=null;
  let state={status:'idle',error:null,updatedAt:null};

  function client(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase)){
      const e=new Error('知识库配置不可用');
      e.code='JDM_CONFIG_MISSING';
      throw e;
    }
    return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
  }
  function timeout(signal,ms=10000){return AbortSignal.timeout?AbortSignal.timeout(ms):signal}
  function badMedia(m){
    if(window.JDM_MEDIA_POLICY?.isUsable && !window.JDM_MEDIA_POLICY.isUsable(m))return true;
    if(window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m))return true;
    const title=String(m?.title||''),path=String(m?.path||''),source=String(m?.source||'');
    return /关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i.test(`${title} ${source}`)||/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(path);
  }
  function canonicalMedia(list){
    return (list||[]).filter(m=>!badMedia(m)).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||Number(a.source_tier||99)-Number(b.source_tier||99)||new Date(a.created_at)-new Date(b.created_at));
  }
  function rememberError(err){
    state={status:'error',error:err,updatedAt:Date.now()};
    console.error('[JDM knowledge]',err);
  }
  async function query(q){
    const {data,error}=await q.abortSignal(timeout(null,10000));
    if(error)throw error;
    return data||[];
  }
  async function hydrateEntry(db,e){
    const media=await query(
      db.from('media_public')
        .select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type')
        .eq('entry_id',e.id)
        .order('is_primary',{ascending:false})
        .order('source_tier',{ascending:true})
        .order('created_at',{ascending:true})
    );
    const ctx=await query(
      db.from('timeline_context')
        .select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at')
        .eq('entry_id',e.id)
        .limit(1)
    );
    return {...e,media:canonicalMedia(media),timelineContext:ctx[0]||null};
  }
  async function all(){
    if(allPromise)return allPromise;
    state={status:'loading',error:null,updatedAt:state.updatedAt};
    allPromise=(async()=>{
      const db=client();
      const entries=await query(db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false}));
      const media=await query(db.from('media_public').select('id,entry_id,path,title,source,license,creator,captured_at,location,created_at,usage_type,source_tier,is_primary,canonical_key,source_url,source_type').order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true}));
      const contexts=await query(db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').order('source_tier',{ascending:true}));
      const mm=new Map();
      media.forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
      const cm=new Map(contexts.map(c=>[c.entry_id,c]));
      const rows=entries.map(e=>({...e,media:canonicalMedia(mm.get(e.id)||[]),timelineContext:cm.get(e.id)||null}));
      rows.forEach(e=>cache.set(e.slug,e));
      state={status:'ready',error:null,updatedAt:Date.now()};
      return rows;
    })().catch(err=>{allPromise=null;rememberError(err);throw err});
    return allPromise;
  }
  async function get(slug){
    const hit=cache.get(slug);if(hit)return hit;
    const db=client();
    try{
      state={status:'loading',error:null,updatedAt:state.updatedAt};
      const entries=await query(db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').eq('slug',slug).limit(1));
      if(!entries[0]){state={status:'ready',error:null,updatedAt:Date.now()};return null}
      const row=await hydrateEntry(db,entries[0]);
      cache.set(slug,row);
      state={status:'ready',error:null,updatedAt:Date.now()};
      return row;
    }catch(err){rememberError(err);throw err}
  }
  async function byCategory(category){return(await all()).filter(e=>e.category===category)}
  function url(e){return e?'/jingdezhen-porcelain-wiki/entry/?type='+encodeURIComponent(e.category)+'&slug='+encodeURIComponent(e.slug):'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={
    all,get,byCategory,url,
    state:()=>({...state}),
    reset:()=>{allPromise=null;cache.clear();state={status:'idle',error:null,updatedAt:null}}
  };
})();