/* Unified 知识条目 discovery: one search index, one canonical destination, worlds/graph/recommendations as the next layer. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const SEARCH_URL=ROOT+'search/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const worldUrl=slug=>ROOT+({'history':'history/','craft':'craft/','objects':'objects/','space':'kilns/','people':'people/','research':'research/','contemporary':'contemporary/'}[slug]||'');
  let activeWorld='';
  let activeQuery='';
  function eraLabels(e){return [...new Set((Array.isArray(e.zh?.meta?.timeline)?e.zh.meta.timeline:[]).map(x=>x?.era).filter(Boolean))].map(x=>({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清',modern:'近现代'}[x]||x)).slice(0,2)}
  function card(e){
    const title=e.zh?.title||e.slug, summary=plain(e.zh?.summary||e.zh?.content||'').slice(0,150);
    const worlds=(e.worlds||[]).slice(0,3).map(w=>'<a class="jdm-search-world" href="'+worldUrl(w.slug)+'" onclick="event.stopPropagation()">'+esc(w.short_title||w.title)+'</a>').join('');
    const eras=eraLabels(e).map(x=>'<span class="jdm-search-era">'+esc(x)+'</span>').join('');
    const recs=(e.recommendations||[]).slice(0,3).map(r=>'<a href="'+entryUrl(r.entry)+'">'+esc(r.entry.zh?.title||r.entry.slug)+'</a>').join('');
    return '<article class="jdm-search-result"><div class="jdm-search-result-main"><div class="jdm-search-result-meta"><span>'+esc(e.category||'知识')+'</span><div>'+(worlds||'')+eras+'</div></div><h2><a href="'+entryUrl(e)+'">'+esc(title)+'</a></h2><p>'+esc(summary||'打开知识条目，查看完整知识节点。')+'</p><div class="jdm-search-result-actions"><a class="jdm-search-open" href="'+entryUrl(e)+'">打开知识条目 →</a><a href="'+ROOT+'network/relations/?node='+encodeURIComponent('entry:'+e.id)+'">关系网络 →</a><a href="'+ROOT+'network/global/?slug='+encodeURIComponent(e.slug)+'">全球网络 →</a></div></div>'+(recs?'<aside class="jdm-search-result-recs"><span>相关推荐</span>'+recs+'</aside>':'')+'</article>';
  }
  function renderSuggestions(rows){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    root.innerHTML=rows.slice(0,5).map(e=>'<button type="button" data-suggest-id="'+esc(e.id)+'"><span>'+esc(e.category||'知识')+'</span><b>'+esc(e.zh?.title||e.slug)+'</b></button>').join('');
    root.querySelectorAll('[data-suggest-id]').forEach(b=>b.addEventListener('click',()=>{const e=rows.find(x=>x.id===b.dataset.suggestId);if(e){document.getElementById('jdm-entry-search-input').value=e.zh?.title||e.slug;runSearch(e.zh?.title||e.slug)}}));
  }
  async function suggest(q){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    if(!q){root.innerHTML='';return}
    try{renderSuggestions(await window.JDM_KNOWLEDGE.searchEntries(q,{limit:5,worldSlug:activeWorld||null}))}catch(e){root.innerHTML=''}
  }
  async function runSearch(q){
    const status=document.getElementById('jdm-search-status'),results=document.getElementById('jdm-search-results');
    if(!status||!results)return;
    const query=String(q||'').trim();activeQuery=query;
    history.replaceState(null,'',query?SEARCH_URL+'?q='+encodeURIComponent(query)+(activeWorld?'&world='+encodeURIComponent(activeWorld):''):SEARCH_URL);
    if(!query){status.textContent='选择一个知识世界，或输入关键词开始发现。';results.innerHTML='';return}
    status.textContent='正在搜索知识条目……';results.innerHTML='<div class="jdm-search-loading">正在连接统一知识索引……</div>';
    try{
      const rows=await window.JDM_KNOWLEDGE.searchDiscovery(query,{limit:12,recommendationLimit:3,worldSlug:activeWorld||null});
      status.textContent=rows.length?'找到 '+rows.length+' 个相关知识条目。'+(activeWorld?' 已按知识世界筛选。':''):'没有找到直接匹配的知识条目，可以换一个更具体的名称、时代或器物名。';
      results.innerHTML=rows.map(card).join('');
    }catch(error){status.textContent='搜索暂时不可用。';results.innerHTML='<div class="jdm-search-error">知识索引加载失败（'+esc(error?.code||error?.status||'NETWORK')+'）。请稍后重试。</div>'}
  }
  function initPage(){
    const page=document.querySelector('[data-entry-search]');if(!page)return;
    const input=document.getElementById('jdm-entry-search-input'),button=document.getElementById('jdm-entry-search-submit');
    const submit=()=>runSearch(input.value);
    button?.addEventListener('click',submit);
    input?.addEventListener('input',()=>suggest(input.value.trim()));
    input?.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
    page.querySelectorAll('[data-search-example]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.searchExample;submit()}));
    page.querySelectorAll('[data-search-world]').forEach(b=>b.addEventListener('click',()=>{activeWorld=b.dataset.searchWorld||'';page.querySelectorAll('[data-search-world]').forEach(x=>x.classList.toggle('is-active',x===b));if(activeQuery)runSearch(activeQuery)}));
    const params=new URLSearchParams(location.search),q=params.get('q'),world=params.get('world');activeWorld=world||'';page.querySelectorAll('[data-search-world]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchWorld||'')===activeWorld));if(q){input.value=q;runSearch(q)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPage);else initPage()
})();
