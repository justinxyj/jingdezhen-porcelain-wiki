/* 72-step technology tree backed by the canonical Supabase craft_processes catalog. */
(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const fallbackGroups=[{id:'material',name:'一｜原料'},{id:'kneading',name:'二｜制泥'},{id:'forming',name:'三｜成型与修整'},{id:'decoration',name:'四｜坯体与彩绘'},{id:'glaze',name:'五｜施釉'},{id:'kiln',name:'六｜装烧与烧成'}];
  function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function init(){
    const root=document.getElementById('porcelain-tech-tree');if(!root)return;
    const nodes=document.getElementById('tech-tree-nodes'),svg=document.getElementById('tech-tree-links'),detail=document.getElementById('tech-tree-detail');
    if(!nodes||!detail)return;
    const search=root.querySelector('#tech-tree-search'),filters=[...root.querySelectorAll('.tech-tree-filters button')];
    const boot=window.JDM_KNOWLEDGE?.craftProcesses?window.JDM_KNOWLEDGE.craftProcesses():Promise.resolve([]);
    boot.then(DATA=>{
      if(!DATA.length){detail.innerHTML='<div class="tech-tree-detail-empty">暂时无法读取工艺数据，请稍后刷新。</div>';return}
      const byId=new Map(DATA.map(x=>[x.id,x]));
      const groupName=x=>x.category_name||fallbackGroups.find(g=>g.id===x.category)?.name||x.category;
      const matches=(x,f,q)=>(f==='all'||x.category===f)&&(!q||`${x.name_zh}${x.category_name}${x.description_zh}${x.tools_zh||''}${x.materials_zh||''}`.toLowerCase().includes(q));
      function render(f='all',q=''){
        nodes.innerHTML=fallbackGroups.filter(g=>f==='all'||g.id===f).map(g=>{
          const items=DATA.filter(x=>x.category===g.id&&matches(x,f,q));
          return `<section class="tech-tree-group" data-group="${g.id}"><header><span>${esc(g.name)}</span><b>${DATA.filter(x=>x.category===g.id).length}道</b></header><div class="tech-tree-group-nodes">${items.map(x=>`<button class="tech-node tech-${esc(x.category)}" data-id="${esc(x.id)}"><i>${x.sequence}</i><span>${esc(x.name_zh)}</span></button>`).join('')}</div></section>`;
        }).join('');
        draw();nodes.querySelectorAll('.tech-node').forEach(b=>b.onclick=()=>select(b.dataset.id));
      }
      function draw(){requestAnimationFrame(()=>{svg.innerHTML='';const r=root.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${root.clientWidth} ${Math.max(500,nodes.offsetHeight)}`);const visible=[...nodes.querySelectorAll('.tech-node')];for(let i=0;i<visible.length-1;i++){const A=visible[i].getBoundingClientRect(),B=visible[i+1].getBoundingClientRect(),x1=A.right-r.left,y1=A.top+A.height/2-r.top,x2=B.left-r.left,y2=B.top+B.height/2-r.top,dx=Math.max(20,(x2-x1)*.35),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${x1} ${y1} C${x1+dx} ${y1} ${x2-dx} ${y2} ${x2} ${y2}`);p.classList.add('tech-link');svg.appendChild(p)}})}
      function select(id){
        const x=byId.get(id);if(!x)return;nodes.querySelectorAll('.tech-node').forEach(b=>b.classList.toggle('is-selected',b.dataset.id===id));
        const prev=DATA.find(p=>p.sequence===x.sequence-1),next=DATA.find(p=>p.sequence===x.sequence+1);
        const source=x.source_url?`<a href="${esc(x.source_url)}" target="_blank" rel="noopener">${esc(x.source_title||x.source_institution||'资料来源')} ↗</a>`:'';
        const image=x.image_url?`<div class="tech-detail-media"><img src="${esc(x.image_url)}" alt="${esc(x.name_zh)}工序资料图" loading="lazy"><small>${esc(x.image_credit||'')}</small>${x.image_source_url?`<a href="${esc(x.image_source_url)}" target="_blank" rel="noopener">图片来源 ↗</a>`:''}</div>`:'<div class="tech-detail-media"><div class="tech-detail-no-image">暂无已核验工序图片</div></div>';
        const badge=x.image_status==='verified'?'已核验图片':x.image_source_type==='official_stage_representative'?'官方阶段代表图':'待审核图片';
        detail.innerHTML=`${image}<div class="tech-detail-body"><div class="tech-detail-kicker">第 ${x.sequence} / 72 道 · ${esc(groupName(x))}</div><div class="tech-detail-badge">${esc(badge)}</div><h2>${esc(x.name_zh)}</h2><p>${esc(x.description_zh)}</p>${x.tools_zh?`<p><b>工具：</b>${esc(x.tools_zh)}</p>`:''}${x.materials_zh?`<p><b>材料：</b>${esc(x.materials_zh)}</p>`:''}${x.output_zh?`<p><b>产出：</b>${esc(x.output_zh)}</p>`:''}<div class="tech-detail-flow"><b>工序位置</b><div>${prev?`<button data-jump="${esc(prev.id)}">← ${esc(prev.name_zh)}</button>`:''}${next?`<button data-jump="${esc(next.id)}">${esc(next.name_zh)} →</button>`:''}</div></div><div class="tech-detail-source"><b>资料依据</b>${source||'<span>暂无来源链接。</span>'}</div></div>`;
        detail.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>select(b.dataset.jump));
      }
      search.oninput=()=>{const f=root.querySelector('.tech-tree-filters .is-active')?.dataset.filter||'all';render(f,search.value.trim().toLowerCase())};
      filters.forEach(b=>b.onclick=()=>{filters.forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');render(b.dataset.filter,search.value.trim().toLowerCase())});
      window.addEventListener('resize',draw);render();select(DATA[0].id);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();