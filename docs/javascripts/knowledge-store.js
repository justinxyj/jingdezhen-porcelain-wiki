/* Canonical knowledge store: entries and approved media are one shared source. */
(function(){
  const cache=new Map();let allPromise=null;
  function client(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  async function all(){if(allPromise)return allPromise;allPromise=(async()=>{const db=client();if(!db)return[];const {data:entries,error:e}=await db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false});if(e)throw e;const {data:media,error:me}=await db.from('media').select('id,entry_id,path,title,source,license,creator,status,created_at,usage_type,source_tier,is_primary,verification_note,verified_at').eq('status','approved').order('is_primary',{ascending:false}).order('created_at',{ascending:true});if(me)throw me;const mm=new Map();(media||[]).forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});const rows=(entries||[]).map(e=>({...e,media:mm.get(e.id)||[]}));rows.forEach(e=>cache.set(e.slug,e));return rows})().catch(err=>{console.warn('[JDM knowledge]',err);return[]});return allPromise}
  async function get(slug){const hit=cache.get(slug);if(hit)return hit;return(await all()).find(e=>e.slug===slug)||null}
  async function byCategory(category){return(await all()).filter(e=>e.category===category)}
  function url(e){return e?`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`:'/jingdezhen-porcelain-wiki/'}
  window.JDM_KNOWLEDGE={all,get,byCategory,url,reset:()=>{allPromise=null;cache.clear()}};
})();
