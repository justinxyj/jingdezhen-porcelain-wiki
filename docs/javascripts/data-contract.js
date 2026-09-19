/* Runtime boundary checks complement the TypeScript/JSDoc contracts.
   Invalid public rows fail loudly instead of becoming mysterious rendering bugs. */
(function(){
  const fail=(code,message,details)=>{const e=new Error(message);e.code=code;e.details=details;return e};
  function entry(x){
    if(!x||typeof x.id!=='string'||typeof x.slug!=='string'||typeof x.category!=='string'||!x.zh||typeof x.zh!=='object'){
      throw fail('JDM_ENTRY_CONTRACT','公开条目数据结构异常',{slug:x?.slug});
    }
    return x;
  }
  function media(x){
    if(!x||typeof x.id!=='string'||typeof x.path!=='string'||typeof x.entry_id!=='string'){
      throw fail('JDM_MEDIA_CONTRACT','公开媒体数据结构异常',{id:x?.id});
    }
    return x;
  }
  function list(items,validator){return (items||[]).map(validator)}
  window.JDM_CONTRACT={entry,media,entries:items=>list(items,entry),mediaList:items=>list(items,media)};
})();
