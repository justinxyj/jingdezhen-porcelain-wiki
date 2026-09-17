/* Canonical knowledge store: entries, audited media, and curated timeline context are one shared source. */
(function(){
  const cache=new Map();let allPromise=null;
  function client(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  function badMedia(m){
    if(window.JDM_MEDIA_POLICY?.isUsable && !window.JDM_MEDIA_POLICY.isUsable(m))return true;
    if(window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m))return true;
    const title=String(m?.title||''),path=String(m?.path||''),source=String(m?.source||'');
    return /关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i.test(`${title} ${source}`)||/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(path);
  }
  function canonicalMedia(list){return (list||[]).filter(m=>!badMedia(m)).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||Number(a.source_tier||99)-Number(b.source_tier||99)||new Date(a.created_at)-new Date(b.created_at))}
  async function all(){
    if(allPromise)return allPromise;
    allPromise=(async()=>{
      const db=client();if(!db)return[];
      const {data:entries,error:e}=await db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false});if(e)throw e;
      const {data:media,error:me}=await db.from('media').select('id,entry_id,path,title,source,license,creator,status,created_at,usage_type,source_tier,is_primary,verification_note,verified_at').eq('status','approved').order('is_primary',{ascending:false}).order('source_tier',{ascending:true}).order('created_at',{ascending:true});if(me)throw me;
      let contexts=[];const ctxRes=await db.from('timeline_context').select('entry_id,historical_role,relationship_to_jingdezhen,official_summary,official_image_url,official_image_credit,official_source_title,official_source_url,official_institution,source_tier,reviewed_at').order('source_tier',{ascending:true});if(!ctxRes.error)contexts=ctxRes.data||[];
      const mm=new Map();(media||[]).forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
      const cm=new Map((contexts||[]).map(c=>[c.entry_id,c]));
      const rows=(entries||[]).map(e=>({...e,media:canonicalMedia(mm.get(e.id)||[]),timelineContext:cm.get(e.id)||null}));rows.forEach(e=>cache.set(e.slug,e));return rows;
    })().catch(err=>{console.warn('[JDM knowledge]',err);return[]});
    return allPromise;
  }
  async function get(slug){const hit=cache.get(slug);if(hit)return hit;return(await all()).find(e=>e.slug===slug)||null}
  async function byCategory(category){return(await all()).filter(e=>e.category===category)}
  function url(e){return e?`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`:'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={all,get,byCategory,url,reset:()=>{allPromise=null;cache.clear()}};
})();
