/* Canonical 72-step craft tree: the public page reads the production craft_processes table. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[m]));
  const GROUP_IMG={
    material:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_45aa148150364c28a17c83bbf03f2b0e.JPG',credit:'新华社｜高岭土开采现场'},
    kneading:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_61778eaa7f3e48d79de223638f892ce3.jpg',credit:'新华社｜揉泥现场'},
    forming:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_f4dd983be25444d39058e7841a2d6e57.JPG',credit:'新华社｜拉坯现场'},
    decoration:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_0481a98e30454d95a53b86e1c53addb6.jpg',credit:'新华社｜画坯现场'},
    glaze:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_0481a98e30454d95a53b86e1c53addb6.jpg',credit:'新华社｜画坯阶段代表照片'},
    kiln:{url:'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_3b26201898234bfaa6a8d8725c24b3c5.jpg',credit:'新华社｜烧窑阶段代表照片'}
  };
  const CLASSIFICATION='https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml';
  const ICH='https://www.ihchina.cn/Article/Index/detail?id=14270';
  const XINHUA='https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html';
  function db(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  function imageFor(x){if(x.image_status==='verified'&&x.image_url)return {url:x.image_url,credit:x.image_credit||'已核验官方图片',source:x.image_source_url||XINHUA};return {...(GROUP_IMG[x.category]||GROUP_IMG.kiln),source:XINHUA,representative:true}}
  function init(){
    const root=document.getElementById('porcelain-tech-tree');if(!root)return;
    const nodes=document.getElementById('tech-tree-nodes'),svg=document.getElementById('tech-tree-links'),detail=document.getElementById('tech-tree-detail');
    const supa=db();if(!supa){detail.innerHTML='<div class="tech-tree-detail-empty">暂时无法连接工艺数据库。</div>';return}
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
    supa.from('craft_processes').select('id,sequence,slug,name_zh,category,category_name,description_zh,historical_period,tools_zh,materials_zh,output_zh,source_title,source_url,source_institution,source_tier,image_url,image_credit,image_source_url,image_status,image_license,image_creator').order('sequence',{ascending:true}).range(0,499).abortSignal(controller.signal).then(({data,error})=>{
      clearTimeout(timer);
      if(error||!data){detail.innerHTML='<div class="tech-tree-detail-empty" role="alert">工艺数据暂时无法加载。<button type="button" class="tech-retry">重新加载</button></div>';detail.querySelector('.tech-retry')?.addEventListener('click',init);return}
      if(!data.length){detail.innerHTML='<div class="tech-tree-detail-empty" role="alert">当前没有可用工艺数据。</div>';return}
      const DATA=data;
      const completeness=DATA.length===72?'':'<div class="tech-data-warning" role="status">当前工艺目录返回 '+DATA.length+' 道记录，标准目录应为 72 道；已显示当前可用数据，后台完整性检查需要复核。</div>';const byId=new Map(DATA.map(x=>[x.id,x]));
      const filters=[['all','全部72道'],...Array.from(new Map(DATA.map(x=>[x.category,x.category_name])).entries()).map(([id,name])=>[id,name])];
      const toolbar=root.querySelector('.tech-tree-filters');
      toolbar.innerHTML=filters.map(([id,name])=>'<button class="'+(id==='all'?'is-active':'')+'" data-filter="'+esc(id)+'">'+esc(name)+'</button>').join('');
      function matches(x,f,q){return(f==='all'||x.category===f)&&(!q||`${x.name_zh}${x.category_name}${x.description_zh}`.toLowerCase().includes(q))}
      function render(f='all',q=''){
        nodes.innerHTML=completeness+filters.slice(1).filter(g=>f==='all'||g[0]===f).map(g=>'<section class="tech-tree-group" data-group="'+esc(g[0])+'"><header><span>'+esc(g[1])+'</span><b>'+DATA.filter(x=>x.category===g[0]).length+'道</b></header><div class="tech-tree-group-nodes">'+DATA.filter(x=>x.category===g[0]&&matches(x,f,q)).map(x=>'<button class="tech-node tech-'+esc(x.category)+'" data-id="'+esc(x.id)+'"><i>'+x.sequence+'</i><span>'+esc(x.name_zh)+'</span></button>').join('')+'</div></section>').join('')||'<div class="notice">没有匹配的工序。</div>';
        draw();nodes.querySelectorAll('.tech-node').forEach(b=>b.onclick=()=>select(b.dataset.id));
      }
      function draw(){requestAnimationFrame(()=>{svg.innerHTML='';const rr=root.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${root.clientWidth} ${Math.max(500,nodes.offsetHeight)}`);const visible=Array.from(nodes.querySelectorAll('.tech-node'));for(let i=0;i<visible.length-1;i++){const A=visible[i].getBoundingClientRect(),B=visible[i+1].getBoundingClientRect(),x1=A.right-rr.left,y1=A.top+A.height/2-rr.top,x2=B.left-rr.left,y2=B.top+B.height/2-rr.top,dx=Math.max(20,(x2-x1)*.35),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${x1} ${y1} C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`);p.classList.add('tech-link');svg.appendChild(p)}})}
      function select(id){
        const x=byId.get(id);if(!x)return;
        nodes.querySelectorAll('.tech-node').forEach(b=>b.classList.toggle('is-selected',b.dataset.id===id));
        const prev=DATA[x.sequence-2],next=DATA[x.sequence],im=imageFor(x);
        detail.innerHTML='<div class="tech-detail-media"><img src="'+esc(im.url)+'" alt="'+esc(x.name_zh)+'工艺资料图" loading="lazy"><small>'+esc(im.credit)+(im.representative?' · 当前为工艺阶段代表图':' · 已核验')+' · <a href="'+esc(im.source)+'" target="_blank" rel="noopener">图片来源</a></small></div><div class="tech-detail-body"><div class="tech-detail-kicker">第 '+x.sequence+' / 72 道 · '+esc(x.category_name)+'</div><h2>'+esc(x.name_zh)+'</h2><p>'+esc(x.description_zh)+'</p>'+(x.historical_period?'<div class="tech-detail-flow"><b>历史时期</b><span>'+esc(x.historical_period)+'</span></div>':'')+(x.materials_zh||x.tools_zh||x.output_zh?'<div class="tech-detail-flow"><b>工艺信息</b><div>'+[x.materials_zh?'原料：'+x.materials_zh:'',x.tools_zh?'工具：'+x.tools_zh:'',x.output_zh?'产出：'+x.output_zh:''].filter(Boolean).map(esc).join('<br>')+'</div></div>':'')+'<div class="tech-detail-flow"><b>工序位置</b><div>'+(prev?'<button data-jump="'+esc(prev.id)+'">← '+esc(prev.name_zh)+'</button>':'')+(next?'<button data-jump="'+esc(next.id)+'">'+esc(next.name_zh)+' →</button>':'')+'</div></div><div class="tech-detail-source"><b>资料依据</b>'+(x.source_url?'<a href="'+esc(x.source_url)+'" target="_blank" rel="noopener">'+esc(x.source_title||x.source_institution||'条目来源')+' ↗</a>':'')+'<a href="'+CLASSIFICATION+'" target="_blank" rel="noopener">景德镇市人民政府工艺体系分类表 ↗</a><a href="'+ICH+'" target="_blank" rel="noopener">国家级非遗：景德镇手工制瓷技艺 ↗</a></div></div>';
        detail.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>select(b.dataset.jump));
      }
      root.querySelector('#tech-tree-search').oninput=e=>{const f=root.querySelector('.tech-tree-filters .is-active')?.dataset.filter||'all';render(f,e.target.value.trim().toLowerCase())};
      toolbar.addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;toolbar.querySelectorAll('button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');render(b.dataset.filter,root.querySelector('#tech-tree-search').value.trim().toLowerCase())});
      addEventListener('resize',draw);render();select(DATA[0].id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();