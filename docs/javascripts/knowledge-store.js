/* Canonical knowledge store.
 * Every public-facing museum surface reads the same published entries table.
 * Media is attached here too, so pages never maintain parallel entry/image data.
 */
(function(){
  const cache=new Map();
  let allPromise=null;
  function client(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;
    return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
  }
  async function all(){
    if(allPromise)return allPromise;
    allPromise=(async()=>{
      const db=client();if(!db)return [];
      const [{data:entries,error:e1},{data:media,error:e2}]=await Promise.all([
        db.from('entries').select('id,slug,category,zh,en,ja,sources,status,version,updated_at').eq('status','published').order('updated_at',{ascending:false}),
        db.from('media').select('id,entry_id,path,title,source,license,creator,status,created_at').eq('status','approved').order('created_at',{ascending:true})
      ]);
      if(e1)throw e1;if(e2)throw e2;
      const mm=new Map();(media||[]).forEach(m=>{if(!mm.has(m.entry_id))mm.set(m.entry_id,[]);mm.get(m.entry_id).push(m)});
      const rows=(entries||[]).map(e=>({...e,media:mm.get(e.id)||[]}));
      rows.forEach(e=>cache.set(e.slug,e));
      return rows;
    })().catch(err=>{console.warn('[JDM knowledge]',err);return []});
    return allPromise;
  }
  async function get(slug){const hit=cache.get(slug);if(hit)return hit;const rows=await all();return rows.find(e=>e.slug===slug)||null}
  async function byCategory(category){return (await all()).filter(e=>e.category===category)}
  function url(entry){if(!entry)return '/jingdezhen-porcelain-wiki/';return `/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(entry.category)}&slug=${encodeURIComponent(entry.slug)}`}
  window.JDM_KNOWLEDGE={all,get,byCategory,url,reset:()=>{allPromise=null;cache.clear()}};
})();
