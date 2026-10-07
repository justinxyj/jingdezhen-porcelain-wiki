/* Phase 4D: 知识发现界面 — 一个索引，多条发现路径，一个知识条目出口。 */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const SEARCH_URL=ROOT+'search/';
  /** @param {unknown} value */
  const esc=value=>window.JDM_SAFE?.esc(value)??String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  /** @param {unknown} raw @param {{allowHttp?:boolean}} [opts] */
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  /** @param {unknown} s */
  const plain=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  /** @param {import('../../types/knowledge').Entry} e */
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url(e)||ROOT+'entry/?slug='+encodeURIComponent(e?.slug||'');
  /** @param {string} slug */
  const worldUrl=slug=>ROOT+(/** @type {Record<string,string>} */({'history':'history/','craft':'craft/','objects':'objects/','space':'kilns/','people':'people/','research':'research/','contemporary':'contemporary/'} )[slug]||'');
  /** @param {string} x */
  const eraLabel=x=>(/** @type {Record<string,string>} */({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清','near-modern':'近代',modern:'现代'})[x]||x);
  /** @param {string} x */
  const laneLabel=x=>(/** @type {Record<string,string>} */({jdz:'景德镇',china:'中国其他窑业',world:'世界其他地区'})[x]||x);
  /** @param {string} x */
  const categoryLabel=x=>(/** @type {Record<string,string>} */({人物:'人物与传承',历史:'历史与发展',器物:'器物与美学',文献:'文献与研究',窑址:'窑址与城市空间'})[x]||x||'知识');
  const state={q:'',world:'',category:'',era:'',lane:'',hasMap:'',hasTimeline:'',hasImage:'',hasLiterature:''};
  let runSeq=0,suggestTimer=0,offset=0,suggestSeq=0;
  /** @param {unknown} value */
  const highlight=value=>{const raw=String(value||''),q=state.q;if(!q)return esc(raw);return raw.split(q).map(esc).join('<mark>'+esc(q)+'</mark>')};

  function syncUrl(){
    const p=new URLSearchParams();
    if(state.q)p.set('q',state.q);
    if(state.world)p.set('world',state.world);
    if(state.category)p.set('category',state.category);
    if(state.era)p.set('era',state.era);
    if(state.lane)p.set('lane',state.lane);
    if(state.hasMap)p.set('map',state.hasMap);
    if(state.hasTimeline)p.set('time',state.hasTimeline);
    if(state.hasImage)p.set('image',state.hasImage);
    if(state.hasLiterature)p.set('literature',state.hasLiterature);
    history.replaceState(null,'',p.toString()?SEARCH_URL+'?'+p.toString():SEARCH_URL);
  }

  /** @param {import('../../types/knowledge').Entry} e */
  function card(e){
    const title=e.zh?.title||e.slug;
    const summary=plain(e.zh?.summary||e.zh?.content||'').slice(0,180);
    const worlds=(e.worlds||[]).slice(0,3).map(w=>'<a class="jdm-search-world" href="'+(safeHref(worldUrl(w.slug))||'')+'" onclick="event.stopPropagation()">'+esc(w.short_title||w.title)+'</a>').join('');
    const eras=(e.discovery?.eras||[]).slice(0,2).map(x=>'<span class="jdm-search-era">'+esc(eraLabel(x))+'</span>').join('');
    const lanes=(e.discovery?.lanes||[]).slice(0,2).map(x=>'<span class="jdm-search-lane">'+esc(laneLabel(x))+'</span>').join('');
    const signals=[e.discovery?.hasMap?'有空间':null,e.discovery?.hasTimeline?'有时间轴':null].filter(Boolean).map(x=>'<span class="jdm-search-signal">'+esc(x)+'</span>').join('');
    const recs=(e.recommendations||[]).slice(0,3).map(r=>'<a href="'+(safeHref(entryUrl(r.entry))||'')+'">'+esc(r.entry.zh?.title||r.entry.slug)+'</a>').join('');
    const im=e.media?.[0];const image=im&&safeHref(im.path)?'<img class="visitor-result-image" data-source-url="'+esc(safeHref(im.source_url))+'" data-creator="'+esc(im.creator||'')+'" data-license="'+esc(im.license||'')+'" src="'+safeHref(im.path)+'" alt="'+esc(im.title||title)+'" loading="lazy">':'';
    return '<article class="jdm-search-result">'+image+'<div class="jdm-search-result-main"><div class="jdm-search-result-meta"><span>'+esc(categoryLabel(e.category))+'</span><div>'+(worlds||'')+eras+lanes+signals+'</div></div><h2><a href="'+(safeHref(entryUrl(e))||'')+'">'+highlight(title)+'</a></h2><p>'+highlight(summary||'打开条目阅读完整介绍。')+'</p><div class="jdm-search-result-actions"><a class="jdm-search-open" href="'+(safeHref(entryUrl(e))||'')+'">阅读全文 →</a>'+(e.source_type==='markdown'?'':'<a href="'+ROOT+'network/relations/?node='+encodeURIComponent('entry:'+e.id)+'">关系网络 →</a><a href="'+ROOT+'network/global/?slug='+encodeURIComponent(e.slug)+'">全球网络 →</a>')+'</div></div>'+(recs?'<aside class="jdm-search-result-recs"><span>继续探索</span>'+recs+'</aside>':'')+'</article>';
  }

  /** @param {import('../../types/knowledge').Entry[]} rows */
  function renderSuggestions(rows){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    root.innerHTML=rows.slice(0,5).map(e=>'<a href="'+safeHref(entryUrl(e))+'"><span>'+esc(e.category||'条目')+'</span><b>'+esc(e.zh?.title||e.slug)+'</b></a>').join('');
    root.hidden=!rows.length;
  }

  function selectedFilters(){
    return Object.fromEntries(Object.entries(state).filter(([k,v])=>k!=='q'&&v).map(([k,v])=>[k,v]));
  }

  function setActiveButtons(){
    const mobile=document.getElementById('search-mobile-filters');if(mobile)mobile.textContent='筛选（'+Object.keys(selectedFilters()).length+'）';
    /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-search-world]')).forEach(b=>b.classList.toggle('is-active',(b.dataset.searchWorld||'')===state.world));
    /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-search-category]')).forEach(b=>b.classList.toggle('is-active',(b.dataset.searchCategory||'')===state.category));
    /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-search-era]')).forEach(b=>b.classList.toggle('is-active',(b.dataset.searchEra||'')===state.era));
    /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-search-lane]')).forEach(b=>b.classList.toggle('is-active',(b.dataset.searchLane||'')===state.lane));
    /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll('[data-search-signal]')).forEach(b=>b.classList.toggle('is-active',(b.dataset.searchSignal||'')===b.dataset.searchSignal&&((b.dataset.searchSignal==='map'&&state.hasMap==='true')||(b.dataset.searchSignal==='time'&&state.hasTimeline==='true')||(b.dataset.searchSignal==='image'&&state.hasImage==='true')||(b.dataset.searchSignal==='literature'&&state.hasLiterature==='true'))));
  }

  /** @param {string} q */
  async function suggest(q){
    const root=document.getElementById('jdm-search-suggestions');if(!root)return;
    if(!q){++suggestSeq;root.innerHTML='';root.hidden=true;return;}
    const seq=++suggestSeq;try{const store=window.JDM_KNOWLEDGE;if(!store)throw new Error('搜索服务未加载');const rows=await store.searchEntries(q,{limit:5,worldSlug:state.world||null,category:state.category||null,era:state.era||null});if(seq===suggestSeq)renderSuggestions(rows)}catch(e){root.innerHTML='';root.hidden=true;}
  }

  async function run(append=false){
    if(!append)offset=0;
    const more=/** @type {HTMLButtonElement|null} */ (document.getElementById("jdm-search-more"));if(more)more.disabled=true;
    const seq=++runSeq;
    const status=document.getElementById('jdm-search-status'),results=document.getElementById('jdm-search-results'),count=document.getElementById('jdm-search-count');
    if(!status||!results)return;
    syncUrl();
    status.textContent='正在查找条目……';
    if(!append)window.JDM_VISITOR?.renderState(results,'loading',{message:'正在加载搜索结果…'});
    try{
      const store=window.JDM_KNOWLEDGE;if(!store)throw new Error('搜索服务未加载');
      const data=(await store.searchDiscoveryPage(state.q,{limit:12,offset,recommendationLimit:3,worldSlug:state.world||null,category:state.category||null,era:state.era||null,lane:state.lane||null,hasMap:state.hasMap?state.hasMap==='true':null,hasTimeline:state.hasTimeline?state.hasTimeline==='true':null,hasImage:state.hasImage?state.hasImage==='true':null,hasLiterature:state.hasLiterature?state.hasLiterature==='true':null}));
      if(seq!==runSeq)return;
      if(count)count.textContent=String(data.total||0);
      const filters=selectedFilters();
      const filterText=Object.keys(filters).length?' · 已应用 '+Object.keys(filters).length+' 项筛选':'';
      status.textContent=state.q?(data.total?'找到 '+data.total+' 个相关知识条目'+filterText+'。':'没有找到直接匹配的知识条目，可以换一个更具体的名称或关闭筛选。'):'当前展示 '+data.total+' 个公开知识条目'+filterText+'。';
      const html=data.results.map(card).join('');
      if(append)results.insertAdjacentHTML('beforeend',html);else results.innerHTML=html||'<div class="jdm-search-empty"><p>没有找到“'+esc(state.q||'符合当前筛选的内容')+'”</p><button type="button" id="search-empty-clear">清除筛选</button><p>相关类别：<a href="?category=器物">器物</a> · <a href="?category=人物">人物</a> · <a href="?category=窑址">窑址</a> · <a href="?category=工艺">工艺</a></p><p>热门内容：<a href="?q=青花">青花</a> · <a href="?q=唐英">唐英</a> · <a href="?q=湖田">湖田窑</a></p></div>';
      if(!data.total&&state.q){const suggestion=window.JDM_KNOWLEDGE?.suggestSearch(state.q);if(suggestion){const p=document.createElement('p');p.textContent='你可能想找：';const a=document.createElement('a');a.href='?q='+encodeURIComponent(suggestion);a.textContent=suggestion;p.append(a);results.querySelector('.jdm-search-empty')?.append(p);}}
      document.getElementById('search-empty-clear')?.addEventListener('click',clearFilters);
      results.setAttribute('aria-busy','false');
      offset+=data.results.length;if(more)more.hidden=offset>=data.total;
      document.getElementById('jdm-search-suggestions')?.setAttribute('hidden','');
    }catch(error){
      status.textContent='暂时无法加载';
      window.JDM_VISITOR?.renderState(results,'error',{error,retry:()=>{window.JDM_KNOWLEDGE?.reset();run()}});
    }
    if(more)more.disabled=false;setActiveButtons();
  }

  function clearFilters(){
    state.world=state.category=state.era=state.lane=state.hasMap=state.hasTimeline=state.hasImage=state.hasLiterature='';
    setActiveButtons();run();
  }

  /** @param {keyof typeof state} key @param {string} value */
  function toggleFilter(key,value){
    state[key]=state[key]===value?'':value;
    run();
  }

  function openFilterSheet(){
    const ui=window.JDM_VISITOR;if(!ui)return;
    const modal=ui.dialog('筛选');modal.classList.add('visitor-bottom-sheet');
    const form=document.createElement('form');form.method='dialog';
    const fields=[['category','类型','data-search-category'],['era','时代','data-search-era'],['world','领域','data-search-world']];
    fields.forEach(([key,label,attr])=>{
      const wrapper=document.createElement('label');wrapper.textContent=label;
      const select=document.createElement('select');select.name=key;
      select.add(new Option('全部',''));
      document.querySelectorAll('['+attr+']').forEach(link=>{const value=link.getAttribute(attr);if(value)select.add(new Option(link.textContent||value,value));});
      select.value=state[/** @type {keyof typeof state} */(key)];wrapper.append(select);form.append(wrapper);
    });
    [['hasImage','图片'],['hasLiterature','文献']].forEach(([key,label])=>{
      const wrapper=document.createElement('label');wrapper.textContent=label;
      const select=document.createElement('select');select.name=key;
      select.add(new Option('不限',''));select.add(new Option('有'+label,'true'));select.add(new Option('无'+label,'false'));select.value=state[/** @type {keyof typeof state} */(key)];wrapper.append(select);form.append(wrapper);
    });
    const count=document.createElement('p');count.textContent='当前已应用 '+Object.keys(selectedFilters()).length+' 项筛选';form.prepend(count);
    const clear=document.createElement('button');clear.type='button';clear.textContent='清除筛选';
    clear.addEventListener('click',()=>{form.querySelectorAll('select').forEach(select=>{select.value='';});count.textContent='待应用：清除全部筛选';form.dataset.clear='true';});
    const apply=document.createElement('button');apply.type='submit';apply.textContent='应用筛选';
    form.append(clear,apply);form.addEventListener('submit',event=>{
      event.preventDefault();if(form.dataset.clear)state.lane=state.hasMap=state.hasTimeline='';
      new FormData(form).forEach((value,key)=>{if(key in state)state[/** @type {keyof typeof state} */(key)]=String(value);});modal.close();run();
    });modal.append(form);modal.showModal();
  }

  function initPage(){
    const page=document.querySelector('[data-entry-search]');if(!page)return;
    const input=document.getElementById('jdm-entry-search-input');if(!(input instanceof HTMLInputElement))return;const button=document.getElementById('jdm-entry-search-submit');
    const params=new URLSearchParams(location.search);
    state.q=params.get('q')||'';state.world=params.get('world')||'';state.category=params.get('category')||'';state.era=params.get('era')||'';state.lane=params.get('lane')||'';state.hasMap=params.get('map')||'';state.hasTimeline=params.get('time')||'';state.hasImage=params.get('image')||'';state.hasLiterature=params.get('literature')||'';
    if(input)input.value=state.q;
    const submit=()=>{state.q=String(input?.value||'').trim();run();};
    button?.addEventListener('click',submit);
    input?.addEventListener('input',()=>{clearTimeout(suggestTimer);suggestTimer=setTimeout(()=>suggest(input.value.trim()),180)});
    input?.addEventListener('keydown',e=>{if(e.key==='Enter')submit();if(e.key==='Escape'){document.getElementById('jdm-search-suggestions')?.setAttribute('hidden','');}});
    /** @type {NodeListOf<HTMLElement>} */(page.querySelectorAll('[data-search-example]')).forEach(b=>b.addEventListener('click',e=>{e.preventDefault();if(input)b.dataset.searchExample&&(input.value=b.dataset.searchExample);submit();}));
    page.addEventListener('click',e=>{
      const el=e.target instanceof Element?e.target.closest('[data-search-world],[data-search-category],[data-search-era],[data-search-lane],[data-search-signal]'):null;
      if(!(el instanceof HTMLElement))return;
      e.preventDefault();
      if(el.dataset.searchWorld!==undefined){state.world=el.dataset.searchWorld||'';run();return;}
      if(el.dataset.searchCategory!==undefined){toggleFilter('category',el.dataset.searchCategory||'');return;}
      if(el.dataset.searchEra!==undefined){toggleFilter('era',el.dataset.searchEra||'');return;}
      if(el.dataset.searchLane!==undefined){toggleFilter('lane',el.dataset.searchLane||'');return;}
      if(el.dataset.searchSignal!==undefined){const keys=/** @type {Record<string,keyof typeof state>} */({map:'hasMap',time:'hasTimeline',image:'hasImage',literature:'hasLiterature'});const key=keys[el.dataset.searchSignal];if(!key)return;state[key]=state[key]==='true'?'':'true';run();}
    });
    document.getElementById('search-mobile-filters')?.addEventListener('click',openFilterSheet);
    document.getElementById('jdm-search-clear')?.addEventListener('click',clearFilters);
    document.getElementById('jdm-search-more')?.addEventListener('click',()=>run(true));
    setActiveButtons();
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPage);else initPage();
})();