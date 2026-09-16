/* Canonical knowledge store.
 * Every public-facing museum surface reads the same published entries table.
 * Pages must not maintain parallel copies of people, objects, literature or kiln data.
 */
(function(){
  const cache = new Map();
  let allPromise = null;
  function client(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl && window.JDM_RUNTIME_CONFIG?.supabaseAnonKey && window.supabase)) return null;
    return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl, window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
  }
  async function all(){
    if(allPromise) return allPromise;
    allPromise=(async()=>{
      const db=client();
      if(!db) return [];
      const {data,error}=await db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false});
      if(error) throw error;
      (data||[]).forEach(e=>cache.set(e.slug,e));
      return data||[];
    })().catch(err=>{console.warn('[JDM knowledge]',err);return [];});
    return allPromise;
  }
  async function get(slug){
    const hit=cache.get(slug); if(hit) return hit;
    const rows=await all();
    return rows.find(e=>e.slug===slug)||null;
  }
  async function byCategory(category){
    return (await all()).filter(e=>e.category===category);
  }
  function url(entry){
    if(!entry) return '/jingdezhen-porcelain-wiki/';
    return `/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(entry.category)}&slug=${encodeURIComponent(entry.slug)}`;
  }
  window.JDM_KNOWLEDGE={all,get,byCategory,url,reset:()=>{allPromise=null;cache.clear();}};
})();
