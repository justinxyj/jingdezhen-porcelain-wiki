/* Phase 4D: unified knowledge discovery UI — one index, multiple discovery paths, one canonical Entry destination. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const SEARCH_URL=ROOT+'search/';
  const esc=s=>String(s??'').replace(/[&<>\\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[m]));
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  const worldUrl=slug=>ROOT+({'history':'history/','craft':'craft/','objects':'objects/','space':'kilns/','people':'people/','research':'research/','contemporary':'contemporary/'}[slug]||'');
  const eraLabel=x=>({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清',modern:'近现代'}[x]||x);
  const laneLabel=x=>({jdz:'景德镇',china:'中国其他窑业',world:'世界其他地区'}[x]||x);
  const categoryLabel=x=>({人物:'人物与传承',历史:'历史与发展',器物:'器物与美学',文献:'文献与研究',窑址:'窑址与城市空间'}[x]||x||'知识');
  const state={q:'',world:'',category:'',era:'',lane:'',hasMap:'',hasTimeline:''};

  function syncUrl(){
    const p=new URLSearchParams();
    if(state.q)p.set('q',state.q);
    if(state.world)p.set('world',state.world);
    if(state.category)p.set('category',state.category);
    if(state.era)p.set('era',state.era);
    if(state.lane)p.set('lane',state.lane);
    if(state.hasMap)p.set('map',state.hasMap);
    if(state.hasTimeline)p.set('time',state.hasTimeline);
    history.replaceState(null,'',p.toString()?SEARCH_URL+'?'+p.toString():SEARCH_URL);
  }

  function card(e){
    const title=e.zh?.title||e.slug;
    const summary=plain(e.zh?.summary||e.zh?.content||'').slice(0,180);
    const worlds=(e.worlds||[]).slice(0,3).map(w=>'<a class="jdm-search-world" href="'+worldUrl(w.slug)+'" onclick="event.stopPropagation()">'+esc(w.short_title||w.title)+'</a>').join('');
    const eras=(e.discovery?.eras||[]).slice(0,2).map(x=>'<span class="jdm-search-era">'+esc(eraLabel(x))+'</span>').join('');
    const lanes=(e.discovery?.lanes||[]).slice(0,2).map(x=>'<span class="jdm-search-lane">'+esc(laneLabel(x))+'</span>').join('');
    const signals=[e.discovery?.hasMap?'有空间':null,e.discovery?.hasTimeline?'有时间轴':null].filter(Boolean).map(x=>'<span class="jdm-search-signal">'+esc(x)+'</span>').join('');
    const recs=(e.recommendations||[]).slice(0,3).map(r=>'<a href="'+entryUrl(r.entry)+'">'+esc(r.entry.zh?.title||r.entry.slug)+'</a>').join('');
    return '<article class="jdm-search-result"><div class="jdm-search-result-main"><div class="jdm-search-result-meta"><span>'+esc(categoryLabel(e.category))+'</span><div>'+(worlds||'')+eras+lanes+signals+'</div></div><h2><a href="'+entryUrl(e)+'">'+esc(title)+'</a></h2><p>'+esc(summary||'打开知识条目，查看完整知识节点。')+'</p><div class="jdm-search-result-actions"><a class="jdm-search-open" href="'+entryUrl(e)+'">打开知识条目 →</a><a href="'+ROOT+'network/relations/?node='+encodeURIComponent('entry:'+e.id)+'">关系网络 →</a><a href="'+ROOT+'network/global/?slug='+encodeURIComponent(e.slug)+'">全球网络 →</a></div></div>'+(recs?'<aside class="jdm-search-result-recs"><span>继续探索</span>'+recs+'</aside>':'')+'</article>';
  }

  function renderSuggestions(rows){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    root.innerHTML=rows.slice(0,5).map(e=>'<button type="button" data-suggest-id="'+esc(e.id)+'"><span>'+esc(categoryLabel(e.category))+'</span><b>'+esc(e.zh?.title||e.slug)+'</b></button>').join('');
    root.hidden=!rows.length;
    root.querySelectorAll('[data-suggest-id]').forEach(b=>b.addEventListener('click',()=>{
      const e=rows.find(x=>x.id===b.dataset.suggestId);
      if(e){const input=document.getElementById('jdm-entry-search-input');if(input)input.value=e.zh?.title||e.slug;state.q=e.zh?.title||e.slug;syncUrl();run();}
    }));
  }

  function selectedFilters(){
    return Object.fromEntries(Object.entries(state).filter(([k,v])=>k!=='q'&&v).map(([k,v])=>[k,v]));
  }

  function setActiveButtons(){
    document.querySelectorAll('[data-search-world]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchWorld||'')===state.world));
    document.querySelectorAll('[data-search-category]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchCategory||'')===state.category));
    document.querySelectorAll('[data-search-era]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchEra||'')===state.era));
    document.querySelectorAll('[data-search-lane]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchLane||'')===state.lane));
    document.querySelectorAll('[data-search-signal]').forEach(b=>b.classList.toggle('is-active',(b.dataset.searchSignal||'')===b.dataset.searchSignal&&((b.dataset.searchSignal==='map'&&state.hasMap==='true')||(b.dataset.searchSignal==='time'&&state.hasTimeline==='true'))));
  }

  async function suggest(q){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    if(!q){root.innerHTML='';root.hidden=true;return;}
    try{renderSuggestions(await window.JDM_KNOWLEDGE.searchEntries(q,{limit:5,worldSlug:state.world||null,category:state.category||null,era:state.era||null}))}catch(e){root.innerHTML='';root.hidden=true;}
  }

  async function run(){
    const status=document.getElementById('jdm-search-status'),results=document.getElementById('jdm-search-results'),count=document.getElementById('jdm-search-count');
    if(!status||!results)return;
    syncUrl();
    status.textContent='正在连接统一知识索引……';
    results.innerHTML='<div class="jdm-search-loading">正在整理知识世界、时代、空间与关系……</div>';
    try{
      const data=await window.JDM_KNOWLEDGE.searchDiscoveryPage(state.q,{limit:12,recommendationLimit:3,worldSlug:state.world||null,category:state.category||null,era:state.era||null,lane:state.lane||null,hasMap:state.hasMap?state.hasMap==='true':null,hasTimeline:state.hasTimeline?state.hasTimeline==='true':null});
      if(count)count.textContent=String(data.total||0);
      const filters=selectedFilters();
      const filterText=Object.keys(filters).length?' · 已应用 '+Object.keys(filters).length+' 项筛选':'';
      status.textContent=state.q?(data.total?'找到 '+data.total+' 个相关知识条目'+filterText+'。':'没有找到直接匹配的知识条目，可以换一个更具体的名称或关闭筛选。'):'当前展示 '+data.total+' 个公开知识条目'+filterText+'。';
      results.innerHTML=data.results.map(card).join('')||'<div class="jdm-search-empty">没有符合当前条件的知识条目。试试清除筛选。</div>';
      document.getElementById('jdm-search-suggestions')?.setAttribute('hidden','');
    }catch(error){
      status.textContent='搜索暂时不可用。';
      results.innerHTML='<div class="jdm-search-error">知识索引加载失败（'+esc(error?.code||error?.status||'NETWORK')+'）。请稍后重试。</div>';
    }
    setActiveButtons();
  }

  function clearFilters(){
    state.world=state.category=state.era=state.lane=state.hasMap=state.hasTimeline='';
    setActiveButtons();run();
  }

  function toggleFilter(key,value){
    state[key]=state[key]===value?'':value;
    run();
  }

  function initPage(){
    const page=document.querySelector('[data-entry-search]');if(!page)return;
    const input=document.getElementById('jdm-entry-search-input'),button=document.getElementById('jdm-entry-search-submit');
    const params=new URLSearchParams(location.search);
    state.q=params.get('q')||'';state.world=params.get('world')||'';state.category=params.get('category')||'';state.era=params.get('era')||'';state.lane=params.get('lane')||'';state.hasMap=params.get('map')||'';state.hasTimeline=params.get('time')||'';
    if(input)input.value=state.q;
    const submit=()=>{state.q=String(input?.value||'').trim();run();};
    button?.addEventListener('click',submit);
    input?.addEventListener('input',()=>suggest(input.value.trim()));
    input?.addEventListener('keydown',e=>{if(e.key==='Enter')submit();if(e.key==='Escape'){document.getElementById('jdm-search-suggestions')?.setAttribute('hidden','');}});
    page.querySelectorAll('[data-search-example]').forEach(b=>b.addEventListener('click',()=>{if(input)input.value=b.dataset.searchExample;submit();}));
    page.querySelectorAll('[data-search-world]').forEach(b=>b.addEventListener('click',()=>{state.world=b.dataset.searchWorld||'';run();}));
    page.querySelectorAll('[data-search-category]').forEach(b=>b.addEventListener('click',()=>toggleFilter('category',b.dataset.searchCategory||'')));
    page.querySelectorAll('[data-search-era]').forEach(b=>b.addEventListener('click',()=>toggleFilter('era',b.dataset.searchEra||'')));
    page.querySelectorAll('[data-search-lane]').forEach(b=>b.addEventListener('click',()=>toggleFilter('lane',b.dataset.searchLane||'')));
    page.querySelectorAll('[data-search-signal]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.searchSignal==='map'?'hasMap':'hasTimeline';state[key]=state[key]==='true'?'':'true';run();}));
    document.getElementById('jdm-search-clear')?.addEventListener('click',clearFilters);
    document.addEventListener('keydown',e=>{if((e.key==='/'||e.key==='s')&&document.activeElement!==input&&!e.ctrlKey&&!e.metaKey){e.preventDefault();input?.focus();}});
    setActiveButtons();
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPage);else initPage();
})();