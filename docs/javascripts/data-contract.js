/* Runtime boundary checks complement the TypeScript/JSDoc contracts.
   Invalid public rows fail loudly instead of becoming mysterious rendering bugs. */
(function(){
  /** @param {string} code @param {string} message @param {unknown} details */
  const fail=(code,message,details)=>{const e=new Error(message);e.code=code;e.details=details;return e};
  /** @param {unknown} value @returns {Record<string,unknown>} */
  function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?/** @type {Record<string,unknown>} */(value):{};}
  /** @param {unknown} value @returns {import('../../types/knowledge').Entry} */
  function entry(value){
    const x=record(value);
    if(!x||typeof x.id!=='string'||typeof x.slug!=='string'||typeof x.category!=='string'||!x.zh||typeof x.zh!=='object'){
      throw fail('JDM_ENTRY_CONTRACT','公开条目数据结构异常',{slug:x?.slug});
    }
    return /** @type {import('../../types/knowledge').Entry} */(/** @type {unknown} */(x));
  }
  /** @param {unknown} value @returns {import('../../types/knowledge').Media} */
  function media(value){
    const x=record(value);
    if(!x||typeof x.id!=='string'||typeof x.path!=='string'||typeof x.entry_id!=='string'){
      throw fail('JDM_MEDIA_CONTRACT','公开媒体数据结构异常',{id:x?.id});
    }
    return /** @type {import('../../types/knowledge').Media} */(/** @type {unknown} */(x));
  }
  /** @param {unknown} value @returns {import('../../types/database.types').Database['public']['Tables']['knowledge_worlds']['Row']} */
  function world(value){
    const x=record(value);
    if(!x||typeof x.slug!=='string'||typeof x.title!=='string'||typeof x.display_order!=='number'){
      throw fail('JDM_WORLD_CONTRACT','知识世界数据结构异常',{slug:x?.slug});
    }
    return /** @type {import('../../types/database.types').Database['public']['Tables']['knowledge_worlds']['Row']} */(x);
  }
  /** @template T @param {unknown[]} items @param {(value:unknown)=>T} validator */
  function list(items,validator){return (items||[]).map(validator)}
  window.JDM_CONTRACT={entry,media,world,entries:items=>list(items,entry),mediaList:items=>list(items,media),worlds:items=>list(items,world)};
})();
