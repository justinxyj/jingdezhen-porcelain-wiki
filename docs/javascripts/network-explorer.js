(function(){
  const CORE_TYPES=new Set(['entry','world']);
  const TYPE_LABELS={entry:'知识条目',world:'知识世界'};
  const TYPE_ORDER=['历史','工艺','器物','窑址','人物','文献','现代'];
  const CAT_CLASS={历史:'history',工艺:'craft',器物:'object',窑址:'space',人物:'people',文献:'evidence',现代:'modern'};

  const init=async()=>{
    const root=document.getElementById('jdm-network-explorer');
    if(!root||!window.JDM_KNOWLEDGE)return;
    const svg=root.querySelector('#network-canvas');
    const status=root.querySelector('#network-status');
    const detail=root.querySelector('#network-detail');
    const search=root.querySelector('#network-search-input');
    const filter=root.querySelector('#network-type-filter');
    const reset=root.querySelector('#network-reset');
    const list=root.querySelector('#network-node-list');

    let graph=null, nodes=[], edges=[], active=null, query='', type='all';

    const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const label=(n)=>String(n?.label||n?.metadata?.title||n?.node_id||'');
    const nodeCategory=(n)=>String(n?.category||n?.metadata?.category||'');
    const isCore=(n)=>CORE_TYPES.has(n?.node_type);
    const entryUrl=(n)=>{
      const slug=n?.metadata?.slug;
      const category=nodeCategory(n);
      return slug?window.JDM_KNOWLEDGE.url({slug,category}):null;
    };

    const setStatus=(text,kind='')=>{
      status.textContent=text;
      status.dataset.state=kind;
    };

    function visibleNodes(){
      return nodes.filter(n=>{
        if(!isCore(n))return false;
        if(type!=='all'&&n.node_type==='entry'&&nodeCategory(n)!==type)return false;
        if(type!=='all'&&n.node_type==='world')return false;
        if(query){
          if(n.node_type!=='entry')return false;
          const hay=(label(n)+' '+nodeCategory(n)+' '+String(n.summary||'')).toLowerCase();
          if(!hay.includes(query.toLowerCase()))return false;
        }
        return true;
      });
    }

    function relevantEdges(visible){
      const ids=new Set(visible.map(n=>n.node_id));
      return edges.filter(e=>ids.has(e.source_node_id)&&ids.has(e.target_node_id)&&(
        String(e.edge_type||'').startsWith('entry_relation:')||
        String(e.edge_type||'').startsWith('world_')
      ));
    }

    function layout(vnodes){
      const W=1100,H=720,cx=W/2,cy=H/2;
      const world=vnodes.filter(n=>n.node_type==='world');
      const entry=vnodes.filter(n=>n.node_type==='entry');
      const pos=new Map();
      world.forEach((n,i)=>{
        const a=(Math.PI*2*i/Math.max(world.length,1))-.5;
        pos.set(n.node_id,{x:cx+Math.cos(a)*250,y:cy+Math.sin(a)*190});
      });
      entry.forEach((n,i)=>{
        const a=(Math.PI*2*i/Math.max(entry.length,1))-.35;
        const r=260+((i%7)*26);
        pos.set(n.node_id,{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*.72});
      });
      for(let iter=0;iter<55;iter++){
        const next=new Map();
        vnodes.forEach(n=>next.set(n.node_id,{x:pos.get(n.node_id).x,y:pos.get(n.node_id).y}));
        for(let i=0;i<vnodes.length;i++){
          const a=vnodes[i],pa=pos.get(a.node_id);
          let fx=(cx-pa.x)*0.002,fy=(cy-pa.y)*0.002;
          for(let j=i+1;j<vnodes.length;j++){
            const b=vnodes[j],pb=pos.get(b.node_id);
            let dx=pa.x-pb.x,dy=pa.y-pb.y,d2=Math.max(dx*dx+dy*dy,180);
            const force=9000/d2;
            fx+=dx*force;fy+=dy*force;
            const q=next.get(b.node_id);q.x-=dx*force*.18;q.y-=dy*force*.18;
          }
          next.get(a.node_id).x+=fx*.18;next.get(a.node_id).y+=fy*.18;
        }
        pos.clear();next.forEach((p,id)=>{
          p.x=Math.max(34,Math.min(W-34,p.x));p.y=Math.max(34,Math.min(H-34,p.y));pos.set(id,p);
        });
      }
      return pos;
    }

    function draw(){
      const vnodes=visibleNodes();
      const vedges=relevantEdges(vnodes);
      const pos=layout(vnodes);
      svg.innerHTML='';
      const ns='http://www.w3.org/2000/svg';
      const g=document.createElementNS(ns,'g');
      g.classList.add('network-svg-layer');
      vedges.forEach(e=>{
        const a=pos.get(e.source_node_id),b=pos.get(e.target_node_id);if(!a||!b)return;
        const line=document.createElementNS(ns,'line');
        line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);line.setAttribute('x2',b.x);line.setAttribute('y2',b.y);
        line.setAttribute('class','network-edge '+(active&&(e.source_node_id===active.node_id||e.target_node_id===active.node_id)?'is-active':''));
        line.dataset.edge=e.edge_type||'';
        g.appendChild(line);
      });
      svg.appendChild(g);
      vnodes.forEach(n=>{
        const p=pos.get(n.node_id);if(!p)return;
        const group=document.createElementNS(ns,'g');
        const activeClass=active?.node_id===n.node_id?' is-selected':'';
        group.setAttribute('class','network-node-svg '+(n.node_type==='world'?'world-node':'entry-node')+activeClass);
        group.setAttribute('transform',`translate(${p.x} ${p.y})`);
        group.dataset.nodeId=n.node_id;
        const circle=document.createElementNS(ns,'circle');
        circle.setAttribute('r',n.node_type==='world'?27:15);
        circle.setAttribute('class','network-node-circle '+(CAT_CLASS[nodeCategory(n)]||'world'));
        group.appendChild(circle);
        const text=document.createElementNS(ns,'text');
        text.setAttribute('class','network-node-label');
        text.setAttribute('y',n.node_type==='world'?45:29);
        text.setAttribute('text-anchor','middle');
        text.textContent=label(n).length>15?label(n).slice(0,14)+'…':label(n);
        group.appendChild(text);
        group.addEventListener('click',()=>selectNode(n.node_id));
        g.appendChild(group);
      });
      setStatus(`显示 ${vnodes.length} 个核心节点 · ${vedges.length} 条可视关系`);
      renderList(vnodes);
    }

    function neighbors(n){
      return edges.filter(e=>e.source_node_id===n.node_id||e.target_node_id===n.node_id).map(e=>{
        const id=e.source_node_id===n.node_id?e.target_node_id:e.source_node_id;
        const other=nodes.find(x=>x.node_id===id);
        return other?{node:other,edge:e}:null;
      }).filter(Boolean).sort((a,b)=>label(a.node).localeCompare(label(b.node),'zh'));
    }

    function selectNode(id){
      active=nodes.find(n=>n.node_id===id)||null;
      if(!active){detail.innerHTML='';return;}
      const links=neighbors(active);
      const direct=links.filter(x=>isCore(x.node)).slice(0,18);
      const url=entryUrl(active);
      detail.innerHTML=`<div class="network-detail-kicker">${esc(TYPE_LABELS[active.node_type]||active.node_type)} · ${esc(nodeCategory(active)||'知识世界')}</div>
        <h3>${esc(label(active))}</h3>
        <p>${esc(active.summary||'从这个节点继续查看已经建立的知识关系。')}</p>
        <div class="network-detail-meta"><span>${links.length} 条已建立关系</span></div>
        ${url?`<a class="network-detail-entry" href="${esc(url)}">进入知识条目 →</a>`:''}
        <div class="network-neighbor-title">继续探索</div>
        <div class="network-neighbor-list">${direct.length?direct.map(x=>`<button type="button" data-node="${esc(x.node.node_id)}"><span>${esc(nodeCategory(x.node)||'知识世界')}</span><b>${esc(label(x.node))}</b></button>`).join(''):'<div class="network-no-neighbor">当前节点暂无可展示的核心邻接节点。</div>'}</div>`;
      detail.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.node)));
      draw();
    }

    function renderList(vnodes){
      const matches=vnodes.slice(0,30);
      list.innerHTML=matches.map(n=>`<button type="button" class="network-list-item ${active?.node_id===n.node_id?'is-active':''}" data-node="${esc(n.node_id)}"><span>${esc(nodeCategory(n)||'知识世界')}</span><b>${esc(label(n))}</b></button>`).join('');
      list.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.node)));
    }

    search.addEventListener('input',()=>{query=search.value.trim();draw();if(query){const match=visibleNodes().find(n=>n.node_type==='entry');if(match)selectNode(match.node_id);}});
    filter.addEventListener('change',()=>{type=filter.value;draw();});
    reset.addEventListener('click',()=>{query='';type='all';search.value='';filter.value='all';active=null;detail.innerHTML='<div class="network-empty"><span>SELECT A NODE</span><h3>点击一个节点</h3><p>查看它连接到哪些知识，并从这里进入统一知识条目页面。</p></div>';draw();});

    try{
      setStatus('正在读取统一知识图谱……');
      graph=await window.JDM_KNOWLEDGE.graph({limit:500,edgeLimit:2000,includeEdges:true});
      nodes=graph.nodes||[];edges=graph.edges||[];
      if(!nodes.length){setStatus('当前没有可展示的知识节点','error');return;}
      draw();
      const first=nodes.find(n=>n.node_type==='world')||nodes.find(n=>n.node_type==='entry');
      if(first)selectNode(first.node_id);
    }catch(error){
      console.error('[JDM network explorer]',error);
      setStatus('知识网络暂时无法加载，请稍后重试。','error');
      detail.innerHTML='<div class="network-empty"><span>NETWORK UNAVAILABLE</span><h3>暂时无法加载</h3><p>其他知识页面不受影响。</p></div>';
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();