/* Phase 4E-5: unified craft -> process -> knowledge network explorer. */
(function(){
  /** @param {unknown} s */
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]||m));
  /** @param {unknown} raw @param {{allowHttp?:boolean}} [opts] */
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  const ROOT=window.location.pathname.includes('/jingdezhen-porcelain-wiki/')?'/jingdezhen-porcelain-wiki/':'/';
  /** @type {Record<string,{url:string,credit:string}>} */
  const GROUP_IMG={
    material:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_45aa148150364c28a17c83bbf03f2b0e.JPG',credit:'新华社｜高岭土开采现场'},
    kneading:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75e3e48d79de223638f892ce3.jpg',credit:'新华社｜揉泥现场'},
    forming:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75e4dd983be25444d39058e7841a2d6e57.JPG',credit:'新华社｜拉坯现场'},
    decoration:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_0481a98e30454d95a53b86e1c53addb6.jpg',credit:'新华社｜画坯现场'},
    glaze:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_0481a98e30454d95a53b86e1c53addb6.jpg',credit:'新华社｜画坯阶段代表照片'},
    kiln:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_3b26201898234bfaa6a8d8725c24b3c5.jpg',credit:'新华社｜烧窑阶段代表照片'}
  };
  /** @param {import('../../types/knowledge').Craft} x */
  const imageFor=x=>x.image_status==='verified'&&x.image_url?{url:x.image_url,credit:x.image_credit||'工序资料图片',source:x.image_source_url||x.source_url,representative:false}:{...(GROUP_IMG[x.category]||GROUP_IMG.kiln),source:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html',representative:true};
  /** @param {string} x */
  const eraLabel=x=>(/** @type {Record<string,string>} */({tang:'唐五代',song:'宋',yuan:'元',ming:'明',qing:'清','near-modern':'近代',modern:'现代'})[x]||x||'');
  /** @param {import('../../types/knowledge').Entry} e */
  const entryUrl=e=>window.JDM_KNOWLEDGE?.url?window.JDM_KNOWLEDGE.url(e):ROOT+'entry/?slug='+encodeURIComponent(e.slug);
  const init=async()=>{
    const rootCandidate=document.getElementById('porcelain-tech-tree');if(!rootCandidate)return;const root=rootCandidate;
    const nodeCandidate=document.getElementById('tech-tree-nodes'),svgCandidate=document.getElementById('tech-tree-links'),detailCandidate=document.getElementById('tech-tree-detail');
    if(!nodeCandidate||!svgCandidate||!detailCandidate)return;
    const nodes=nodeCandidate,svg=svgCandidate,detail=detailCandidate;
    if(!window.supabase?.createClient){const code='SCRIPT_NOT_LOADED';console.warn('[technology-tree]',code,'supabase UMD missing');window.JDM_VISITOR?.renderState(detail,'error',{error:new Error(code),retry:init});return}
    if(!window.JDM_KNOWLEDGE?.craftProcesses||!window.JDM_KNOWLEDGE?.craftProcessContext){const code='JDM_KNOWLEDGE_MISSING';console.warn('[technology-tree]',code);window.JDM_VISITOR?.renderState(detail,'error',{error:new Error(code),retry:init});return}
    const store=window.JDM_KNOWLEDGE;
    /** @type {import('../../types/knowledge').Craft[]} */
    let DATA=[];
    try{DATA=await store.craftProcesses({limit:72});}catch(error){window.JDM_VISITOR?.renderState(detail,'error',{error,retry:init});return}
    if(!DATA.length){window.JDM_VISITOR?.renderState(detail,'empty',{message:'当前没有可用工艺数据。'});return}
    const completeness=DATA.length===72?'':'<div class="tech-data-warning">当前工艺目录返回 '+DATA.length+' 道记录，标准目录应为 72 道；已显示当前可用数据。</div>';
    const byId=new Map(DATA.map(x=>[x.id,x]));
    const filters=[['all','全部72道'],...Array.from(new Map(DATA.map(x=>[x.category,x.category_name])).entries()).map(([id,name])=>[id,name])];
    const toolbarCandidate=root.querySelector('.tech-tree-filters'),searchCandidate=root.querySelector('#tech-tree-search');
    if(!(toolbarCandidate instanceof HTMLElement)||!(searchCandidate instanceof HTMLInputElement))return;
    const toolbar=toolbarCandidate,searchInput=searchCandidate;
    toolbar.innerHTML=filters.map(([id,name])=>'<button class="'+(id==='all'?'is-active':'')+'" data-filter="'+esc(id)+'">'+esc(name)+'</button>').join('');
    /** @param {import('../../types/knowledge').Craft} x @param {string} f @param {string} q */
    function matches(x,f,q){return(f==='all'||x.category===f)&&(!q||`${x.name_zh}${x.category_name}${x.description_zh}${x.materials_zh}${x.tools_zh}${x.output_zh}`.toLowerCase().includes(q))}
    function draw(){requestAnimationFrame(()=>{svg.innerHTML='';const rr=root.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${root.clientWidth} ${Math.max(500,nodes.offsetHeight)}`);const visible=Array.from(/** @type {NodeListOf<HTMLButtonElement>} */(nodes.querySelectorAll('.tech-node')));for(let i=0;i<visible.length-1;i++){const A=visible[i].getBoundingClientRect(),B=visible[i+1].getBoundingClientRect(),x1=A.right-rr.left,y1=A.top+A.height/2-rr.top,x2=B.left-rr.left,y2=B.top+B.height/2-rr.top,dx=Math.max(20,(x2-x1)*.35),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${x1} ${y1} C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`);p.classList.add('tech-link');svg.appendChild(p)}})}
    function render(f='all',q=''){nodes.innerHTML=completeness+filters.slice(1).filter(g=>f==='all'||g[0]===f).map(g=>'<section class="tech-tree-group" data-group="'+esc(g[0])+'"><header><span>'+esc(g[1])+'</span><b>'+DATA.filter(x=>x.category===g[0]).length+'道</b></header><div class="tech-tree-group-nodes">'+DATA.filter(x=>x.category===g[0]&&matches(x,f,q)).map(x=>'<button class="tech-node tech-'+esc(x.category)+'" data-id="'+esc(x.id)+'"><i>'+x.sequence+'</i><span>'+esc(x.name_zh)+'</span></button>').join('')+'</div></section>').join('')||'<div class="notice">没有匹配的工序。</div>';draw();/** @type {NodeListOf<HTMLButtonElement>} */(nodes.querySelectorAll('.tech-node')).forEach(b=>b.onclick=()=>select(b.dataset.id||''))}
    /** @param {string} id */
    async function select(id){
      const x=byId.get(id);if(!x)return;
      /** @type {NodeListOf<HTMLButtonElement>} */(nodes.querySelectorAll('.tech-node')).forEach(b=>b.classList.toggle('is-selected',b.dataset.id===id));
      window.JDM_VISITOR?.renderState(detail,'loading',{message:'正在加载工序与相关资料…'});
      let ctx=null;try{ctx=await store.craftProcessContext(id,{entryLimit:12,relationLimit:60})}catch(error){window.JDM_VISITOR?.renderState(detail,'error',{error,retry:()=>select(id)});return}
      if(!ctx){window.JDM_VISITOR?.renderState(detail,'empty',{message:'找不到该工序。'});return}
      const im=imageFor(x),p=ctx.previous,n=ctx.next;
      const entryCards=ctx.entries.map(item=>{const e=item.entry;return '<article class="tech-entry-card"><div class="tech-entry-card-head"><span>'+esc(e.category||'知识条目')+'</span><b>'+esc(eraLabel(item.era))+'</b></div><h4>'+esc(e.zh?.title||e.slug)+'</h4><p>'+esc((e.zh?.summary||e.zh?.content||'').replace(/<[^>]*>/g,'').slice(0,120))+'</p><div class="tech-entry-signals">'+(item.map?'有空间 · ':'')+(item.people.length?'人物 '+item.people.length+' · ':'')+(item.objects.length?'器物 '+item.objects.length+' · ':'')+(item.kilns.length?'窑址 '+item.kilns.length:'')+'</div><div class="tech-entry-actions"><a href="'+(safeHref(entryUrl(e))||'')+'">知识条目 →</a><a href="'+(safeHref(ROOT+'network/global/?slug='+encodeURIComponent(e.slug))||'')+'">全球网络 →</a></div></article>'}).join('');
      /** @param {string} title @param {number} count @param {import('../../types/knowledge').Entry[]} items @param {string} cls */
      const pathCard=(title,count,items,cls)=>'<section class="tech-path-card '+cls+'"><div class="tech-path-head"><b>'+esc(title)+'</b><span>'+count+'</span></div><div class="tech-path-items">'+items.slice(0,8).map(e=>'<a href="'+(safeHref(entryUrl(e))||'')+'">'+esc(e.zh?.title||e.slug)+'</a>').join('')+(items.length>8?'<small>还有 '+(items.length-8)+' 项，可从知识网络继续探索。</small>':'')+(items.length===0?'<small>当前已有数据中暂无直接关联。</small>':'')+'</div></section>';
      const materialCards=ctx.materials.map(x=>'<span class="tech-material-chip">'+esc(x)+'</span>').join('');
      const pathway='<div class="tech-pathway"><div class="tech-pathway-step is-material"><span>材料</span><b>'+(ctx.materials.length||'—')+'</b></div><i>→</i><div class="tech-pathway-step"><span>器物</span><b>'+ctx.stats.objects+'</b></div><i>→</i><div class="tech-pathway-step"><span>时代</span><b>'+ctx.stats.eras+'</b></div><i>→</i><div class="tech-pathway-step"><span>窑址</span><b>'+ctx.stats.kilns+'</b></div><i>→</i><div class="tech-pathway-step"><span>人物</span><b>'+ctx.stats.people+'</b></div></div>';
      const source=safeHref(x.source_url)?'<a href="'+safeHref(x.source_url)+'" target="_blank" rel="noopener">'+esc(x.source_title||x.source_institution||'条目来源')+' ↗</a>':'';
      detail.innerHTML='<div class="tech-detail-media"><img data-zoom-image data-source-url="'+esc(safeHref(im.source))+'" src="'+(safeHref(im.url)||'')+'" alt="'+esc(x.name_zh)+'工艺资料图" loading="lazy"><small>'+esc(im.credit)+(im.representative?' · 当前为工艺阶段代表图':' · 工序资料图')+(im.source?' · <a href="'+(safeHref(im.source)||'')+'" target="_blank" rel="noopener">图片来源</a>':'')+'</small></div><div class="tech-detail-body"><div class="tech-detail-kicker">第 '+x.sequence+' / 72 道 · '+esc(x.category_name)+'</div><h2>'+esc(x.name_zh)+'</h2><div class="tech-detail-section"><b>技术原理与作用</b><p>'+esc(x.description_zh)+'</p></div><div class="tech-detail-grid"><div><b>材料</b><span>'+esc(x.materials_zh||'—')+'</span></div><div><b>工具</b><span>'+esc(x.tools_zh||'—')+'</span></div><div><b>产出</b><span>'+esc(x.output_zh||'—')+'</span></div><div><b>时代</b><span>'+esc(x.historical_period||'传统制瓷体系长期工序')+'</span></div></div><div class="tech-detail-flow"><b>工序位置</b><div>'+(p?'<button data-jump="'+esc(p.id)+'">← '+esc(p.name_zh)+'</button>':'')+(n?'<button data-jump="'+esc(n.id)+'">'+esc(n.name_zh)+' →</button>':'')+'</div></div><div class="tech-detail-network"><b>相关对象与资料</b><div class="tech-network-stats"><span>知识条目 '+ctx.stats.entries+'</span><span>人物 '+ctx.stats.people+'</span><span>器物 '+ctx.stats.objects+'</span><span>窑址 '+ctx.stats.kilns+'</span><span>文献 '+ctx.stats.documents+'</span><span>时代 '+ctx.stats.eras+'</span><span>空间 '+ctx.stats.spaces+'</span></div><p>结合材料、器物、年代和地点，理解这道工序在制作过程中的作用。</p></div>'+pathway+'<div class="tech-materials"><b>材料线索</b><div class="tech-material-list">'+(materialCards||'<span>—</span>')+'</div></div><div class="tech-path-grid">'+pathCard('器物',ctx.objects.length,ctx.objects,'is-object')+pathCard('窑址',ctx.kilns.length,ctx.kilns,'is-kiln')+pathCard('人物',ctx.people.length,ctx.people,'is-person')+pathCard('文献',ctx.documents.length,ctx.documents,'is-document')+'</div><div class="tech-era-space"><section><b>时代</b><div class="tech-era-list">'+(ctx.eras.map(x=>'<span>'+esc(eraLabel(x))+'</span>').join('')||'<small>暂无可归纳时代</small>')+'</div></section><section><b>空间</b><div class="tech-space-list">'+ctx.mappedEntries.slice(0,8).map(e=>'<a href="'+(safeHref(entryUrl(e))||'')+'">'+esc(e.zh?.title||e.slug)+'</a>').join('')+(ctx.mappedEntries.length>8?'<small>还有 '+(ctx.mappedEntries.length-8)+' 个有空间信息的关联条目。</small>':'')+(ctx.mappedEntries.length===0?'<small>当前关联条目暂无空间坐标。</small>':'')+'</div></section></div><div class="tech-entry-grid">'+(entryCards||'<div class="notice">当前暂无直接关联的知识条目。</div>')+'</div><div class="tech-detail-source"><b>资料依据</b>'+source+'<a href="https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml" target="_blank" rel="noopener">景德镇市人民政府工艺体系分类表 ↗</a><a href="https://www.ihchina.cn/Article/Index/detail?id=14270" target="_blank" rel="noopener">国家级非遗：景德镇手工制瓷技艺 ↗</a></div></div>';
      /** @type {NodeListOf<HTMLButtonElement>} */(detail.querySelectorAll('[data-jump]')).forEach(b=>b.onclick=()=>select(b.dataset.jump||''));
    }
    searchInput.addEventListener('input',()=>{const button=root.querySelector('.tech-tree-filters .is-active');const f=button instanceof HTMLElement?button.dataset.filter||'all':'all';render(f,searchInput.value.trim().toLowerCase());});
    toolbar.addEventListener('click',event=>{const b=event.target instanceof Element?event.target.closest('button[data-filter]'):null;if(!(b instanceof HTMLElement))return;toolbar.querySelectorAll('button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');render(b.dataset.filter||'all',searchInput.value.trim().toLowerCase());});
    addEventListener('resize',draw);render();select(DATA[0].id);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();