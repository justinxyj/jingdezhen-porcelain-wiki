/* Canonical knowledge store: entries, audited media, curated timeline context, and craft processes. */
(function(){
  const cache=new Map();let allPromise=null,processPromise=null;
  function client(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  function badMedia(m){
    if(window.JDM_MEDIA_POLICY?.isUsable && !window.JDM_MEDIA_POLICY.isUsable(m))return true;
    if(window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m))return true;
    const title=String(m?.title||''),path=String(m?.path||''),source=String(m?.source||'');
    return /关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i.test(`${title} ${source}`)||/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(path);
  }
  function canonicalMedia(list){return(list||[]).filter(m=>!badMedia(m)).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||Number(a.source_tier||99)-Number(b.source_tier||99)||new Date(a.created_at)-new Date(b.created_at))}
  async function all(){
    if(allPromise)return allPromise;
    allPromise=(async()=>{
      const db=client();if(!db)return[];
      const {data:entries,error:e}=await db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false});if(e)throw e;
      const {data:media,error:me}=await db.from('media').select('id,entry_id,path,title,source,license,creator,status,created_at,usage_type,source_tier,is_primary,verification_note,verified_at,canonical_key,source_url,source_type,review_state').eq('status','approved').order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true});if(me)throw me;
      let contexts=[];const ctxRes=await db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at,image_search_query,image_source_type,image_status').order('source_tier',{ascending:true});if(!ctxRes.error)contexts=ctxRes.data||[];
      const mm=new Map();(media||[]).forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
      const cm=new Map((contexts||[]).map(c=>[c.entry_id,c]));
      const rows=(entries||[]).map(e=>({...e,media:canonicalMedia(mm.get(e.id)||[]),timelineContext:cm.get(e.id)||null}));rows.forEach(e=>cache.set(e.slug,e));return rows;
    })().catch(err=>{console.warn('[JDM knowledge]',err);return[]});
    return allPromise;
  }
  async function craftProcesses(){
    if(processPromise)return processPromise;
    processPromise=(async()=>{
      const db=client();if(!db)return[];
      const {data,error}=await db.from('craft_processes').select('id,sequence,slug,name_zh,category,category_name,description_zh,historical_period,tools_zh,materials_zh,output_zh,source_title,source_url,source_institution,source_tier,image_url,image_credit,image_creator,image_license,image_search_query,image_review_note,image_source_url,image_source_type,image_status,reviewed_at').neq('image_status','rejected').order('sequence',{ascending:true});
      if(error){console.warn('[JDM craft processes]',error);return[]}
      return data||[];
    })();
    return processPromise;
  }
  async function craftProcessRelations(){
    const db=client();if(!db)return[];
    const {data,error}=await db.from('craft_process_relations').select('process_id,related_process_id,relation_type,note,created_at').order('created_at',{ascending:true});
    if(error){console.warn('[JDM craft process relations]',error);return[]}
    return data||[];
  }
  async function entryCraftProcesses(entryId){
    const db=client();if(!db||!entryId)return[];
    const {data,error}=await db.from('entry_craft_processes').select('entry_id,process_id,relation_type,note,source_url,source_institution,source_tier,reviewed_at').eq('entry_id',entryId);
    if(error){console.warn('[JDM entry craft processes]',error);return[]}
    return data||[];
  }
  async function get(slug){const hit=cache.get(slug);if(hit)return hit;return(await all()).find(e=>e.slug===slug)||null}
  async function byCategory(category){return(await all()).filter(e=>e.category===category)}
  function url(e){return e?`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`:'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={all,get,byCategory,url,craftProcesses,craftProcessRelations,entryCraftProcesses,reset:()=>{allPromise=null;processPromise=null;cache.clear()}};
})();