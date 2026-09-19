/* Keep implementation metadata out of the public interface.
   Hide only explicit internal nodes; never delete content by matching visible text. */
(function(){
  const selectors=['.wiki-entry-footer','.jdm-backend-badge','.editor-locked','.backend-only','.data-principles','.internal-meta'];
  function clean(root=document){
    selectors.forEach(sel=>root.querySelectorAll(sel).forEach(el=>el.remove()));
    if(root.nodeType===1&&root.matches?.(selectors.join(',')))root.remove();
  }
  let observer=null;
  function init(){
    if(observer)return;
    clean();
    observer=new MutationObserver(mutations=>{
      mutations.forEach(m=>m.addedNodes.forEach(node=>{
        if(node.nodeType!==1)return;
        clean(node);
      }));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();