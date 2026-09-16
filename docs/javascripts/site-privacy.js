/* Keep implementation metadata out of the public interface. */
(function(){
  const selectors=['.wiki-entry-kicker','.wiki-entry-footer','.jdm-backend-badge','.editor-locked','.backend-only','.data-principles','.internal-meta'];
  function clean(root=document){
    selectors.forEach(sel=>root.querySelectorAll(sel).forEach(el=>el.remove()));
    root.querySelectorAll('small,span,p,div').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(/^(backend|后端|entry_relations|source_tier|usage_type|supabase|entries|media|relation_type|统一知识条目\s*[·|｜]?\s*版本|知识库摘要)$/i.test(t)) el.remove();
    });
  }
  function init(){clean();new MutationObserver(()=>clean()).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
