/* Unified Entry discovery: one search index, one canonical destination, worlds/graph/recommendations as the next layer. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const SEARCH_URL=ROOT+'search/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const worldUrl=slug=>ROOT+({'history':'history/','craft':'craft/','objects':'objects/','space':'kilns/','people':'people/','research':'research/','contemporary':'contemporary/'}[slug]||'');
  function installGlobalLauncher(){
    if(document.querySelector('.jdm-global-search-launcher'))return;
    const link=document.createElement('a');
    link.className='jdm-global-search-launcher';
    link.href=SEARCH_URL;
    link.setAttribute('aria-label','打开统一知识搜索');
    link.innerHTML='<span>⌕</span><b>搜索知识</b>';
    const custom=document.querySelector('.jdm-nav-links');
    if(custom){custom.appendChild(link);return}
    const header=document.querySelector('.md-header__inner');
    if(header){
      const anchor=header.querySelector('.md-header__topic')||header.querySelector('.md-header__title');
      (anchor?.parentElement||header).appendChild(link);
    }
  }
  function card(e){
    const title=e.zh?.title||e.slug, summary=plain(e.zh?.summary||e.zh?.content||'').slice(0,150);
    const worlds=(e.worlds||[]).slice(0,3).map(w=>'<a class="jdm-search-world" href="'+worldUrl(w.slug)+'" onclick="event.stopPropagation()">'+esc(w.short_title||w.title)+'</a>').join('');
    const recs=(e.recommendations||[]).slice(0,3).map(r=>'<a href="'+entryUrl(r.entry)+'">'+esc(r.entry.zh?.title||r.entry.slug)+'</a>').join('');
    return '<article class="jdm-search-result"><div class="jdm-search-result-main"><div class="jdm-search-result-meta"><span>'+esc(e.category||'知识')+'</span>'+(worlds?'<div>'+worlds+'</div>':'')+'</div><h2><a href="'+entryUrl(e)+'">'+esc(title)+'</a></h2><p>'+esc(summary||'打开 Entry，查看完整知识节点。')+'</p><div class="jdm-search-result-actions"><a class="jdm-search-open" href="'+entryUrl(e)+'">打开 Entry →</a><a href="'+ROOT+'network/relations/?node='+encodeURIComponent('entry:'+e.id)+'">关系网络 →</a></div></div>'+(recs?'<aside class="jdm-search-result-recs"><span>相关推荐</span>'+recs+'</aside>':'')+'</article>';
  }
  async function runSearch(q){
    const status=document.getElementById('jdm-search-status'),results=document.getElementById('jdm-search-results');
    if(!status||!results)return;
    const query=String(q||'').trim();
    history.replaceState(null,'',query?SEARCH_URL+'?q='+encodeURIComponent(query):SEARCH_URL);
    if(!query){status.textContent='输入关键词，搜索 149 个公开 Entry 知识节点。';results.innerHTML='';return}
    status.textContent='正在搜索 Entry 知识节点……';results.innerHTML='<div class="jdm-search-loading">正在连接统一知识索引……</div>';
    try{
      const rows=await window.JDM_KNOWLEDGE.searchDiscovery(query,{limit:12,recommendationLimit:3});
      status.textContent=rows.length?'找到 '+rows.length+' 个相关 Entry。所有结果均指向统一知识节点。':'没有找到直接匹配的 Entry，可以换一个更具体的名称或器物名。';
      results.innerHTML=rows.map(card).join('');
    }catch(error){
      status.textContent='搜索暂时不可用。';
      results.innerHTML='<div class="jdm-search-error">知识索引加载失败（'+esc(error?.code||error?.status||'NETWORK')+'）。请稍后重试。</div>';
    }
  }
  function initPage(){
    const page=document.querySelector('[data-entry-search]');
    if(!page)return;
    const input=document.getElementById('jdm-entry-search-input'),button=document.getElementById('jdm-entry-search-submit');
    const submit=()=>runSearch(input.value);
    button?.addEventListener('click',submit);
    input?.addEventListener('keydown',e=>{if(e.key==='Enter')submit()});
    page.querySelectorAll('[data-search-example]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.searchExample;submit()}));
    const q=new URLSearchParams(location.search).get('q');if(q){input.value=q;runSearch(q)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installGlobalLauncher();initPage()});else{installGlobalLauncher();initPage()}
})();
