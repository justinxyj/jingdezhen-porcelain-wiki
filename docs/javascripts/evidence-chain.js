/* Explicit records only: a reference is not a verified claim. */
(function(){
  async function init(){
    const root=document.querySelector('[data-evidence-chain]');if(!root)return;
    const slug=new URLSearchParams(location.search).get('slug');
    if(!slug){root.textContent='请从百科条目的“查看完整证据链”进入。';return;}
    try{
      const store=window.JDM_KNOWLEDGE;if(!store)throw new Error('资料服务未加载');
      const entry=await store.get(slug);if(!entry){root.textContent='没有找到对应内容。';return;}
      root.replaceChildren();
      const title=document.createElement('h2');title.textContent=entry.zh?.title||entry.slug;root.append(title);
      const sources=Array.isArray(entry.zh?.sources)&&entry.zh.sources.length?entry.zh.sources:entry.sources||[];
      const seen=new Set();
      sources.forEach((source,i)=>{
        if(!source||typeof source!=='object'||(source.status&&source.status!=='published'))return;
        const url=window.JDM_SAFE?.safeHref(source.url,{allowHttp:true});if(!url||seen.has(url))return;seen.add(url);
        const section=document.createElement('section'),heading=document.createElement('h3');heading.textContent='['+(i+1)+'] '+(source.label||source.title||'参考资料');section.append(heading);
        const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='阅读原始资料 ↗';section.append(link);
        const verification=source.verification;
        const verified=verification&&typeof verification==='object'&&verification.status==='verified'&&verification.reviewed_at&&verification.reviewer&&verification.claim&&verification.locator;
        const status=document.createElement('p');status.textContent=verified?'已核验（对应论述）':'参考资料：未提供完整的逐项核验记录';section.append(status);
        const fields={claim:source.claim||verification?.claim,relation:source.relation,verification:verified?[verification.reviewer,verification.reviewed_at,verification.locator].join(' · '):null,provenance:source.provenance||source.citation};
        const labels=/** @type {Record<string,string>} */({claim:'对应论述',relation:'支持的关系',verification:'核验记录',provenance:'资料出处'});
        for(const [key,value] of Object.entries(fields))if(value){const p=document.createElement('p');p.textContent=labels[key]+'：'+(typeof value==='string'?value:JSON.stringify(value));section.append(p);}
        root.append(section);
      });
      if(!seen.size){const p=document.createElement('p');p.textContent='尚未提供公开参考资料。';root.append(p);}
      const relations=document.createElement('section');root.append(relations);
      try{
        const context=await store.entryContext(entry.id);
        const heading=document.createElement('h2');heading.textContent='已记录的关系';relations.append(heading);
        const note=document.createElement('p');note.textContent='关系记录与逐项事实核验分别列示；存在关联不等于已证实历史因果。';relations.append(note);
        context.relations.forEach(relation=>{
          const p=document.createElement('p');p.textContent=(entry.zh?.title||entry.slug)+' → '+(relation.semantic_label||'相关内容')+' → ';
          const a=document.createElement('a');a.href=store.url(relation.entry);a.textContent=relation.entry.zh?.title||relation.entry.slug;p.append(a);
          if(relation.semantic_source_url){const source=document.createElement('a');source.href=window.JDM_SAFE?.safeHref(relation.semantic_source_url)||'';source.textContent=' 关系依据';p.append(source);}
          relations.append(p);
          if(relation.note){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='原始关系记录（不代表已核验）';details.append(summary,document.createTextNode(relation.note));relations.append(details);}
        });
        if(!context.relations.length){const p=document.createElement('p');p.textContent='尚未提供公开关系记录。';relations.append(p);}
      }catch(error){window.JDM_VISITOR?.renderState(relations,'error',{message:'关系记录暂时无法加载，参考资料仍可查阅。',error,retry:init});}
      const a=document.createElement('a');a.href=store.url(entry);a.textContent='返回百科 →';root.append(a);
    }catch(error){window.JDM_VISITOR?.renderState(root,'error',{error,retry:init});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
