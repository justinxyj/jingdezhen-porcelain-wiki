(function(){
/** @typedef {Omit<import('../../types/knowledge').GraphNode,'node_id'|'node_type'> & {node_id:string,node_type:string}} ExplorerNode */
/** @typedef {Omit<import('../../types/knowledge').GraphEdge,'source_node_id'|'target_node_id'> & {source_node_id:string,target_node_id:string}} ExplorerEdge */

  /** @type {Record<string,string>} */
  const relationLabels={person:'相关人物',object:'相关器物',craft:'相关工艺',kiln:'相关窑址',period:'时代背景',related:'相关条目'};
  /** @param {string} value */
  const relationLabel=value=>relationLabels[value]||value;
  const CORE_TYPES=new Set(['entry','world']);
  const TYPE_LABELS=/** @type {Record<string,string>} */({entry:'知识条目',world:'主题'});
  const TYPE_ORDER=['历史','工艺','器物','窑址','人物','文献','现代'];
  const CAT_CLASS=/** @type {Record<string,string>} */({历史:'history',工艺:'craft',器物:'object',窑址:'space',人物:'people',文献:'evidence',现代:'modern'});

  const init=async()=>{
    const root=document.getElementById('jdm-network-explorer');
    if(!root||!window.JDM_KNOWLEDGE)return;
    const svgCandidate=root.querySelector('#network-canvas');
    const statusCandidate=root.querySelector('#network-status');
    const detailCandidate=root.querySelector('#network-detail');
    const searchCandidate=root.querySelector('#network-search-input');
    const filterCandidate=root.querySelector('#network-type-filter');
    const resetCandidate=root.querySelector('#network-reset');
    const listCandidate=root.querySelector('#network-node-list');

    if(!(svgCandidate instanceof SVGSVGElement)||!(statusCandidate instanceof HTMLElement)||!(detailCandidate instanceof HTMLElement)||!(searchCandidate instanceof HTMLInputElement)||!(filterCandidate instanceof HTMLSelectElement)||!(resetCandidate instanceof HTMLElement)||!(listCandidate instanceof HTMLElement))return;
    const svg=svgCandidate,status=statusCandidate,detail=detailCandidate,search=searchCandidate,filter=filterCandidate,reset=resetCandidate,list=listCandidate;
    const store=window.JDM_KNOWLEDGE;
    /** @type {ExplorerNode[]} */ let nodes=[];
    /** @type {ExplorerEdge[]} */ let edges=[];
    /** @type {ExplorerNode|null} */ let active=null;
    let query='',type='all';

    /** @param {unknown} v */
    const esc=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m));
    /** @param {unknown} raw @param {{allowHttp?:boolean}} [opts] */
    const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
    /** @param {ExplorerNode} n */
    const label=(n)=>String(n?.label||metadata(n,'title')||n?.node_id||'');
    /** @param {ExplorerNode} n */
    const nodeCategory=(n)=>String(n?.category||metadata(n,'category')||'');
    /** @param {ExplorerNode} n */
    const isCore=(n)=>CORE_TYPES.has(n?.node_type);
    /** @param {ExplorerNode} n */
    const entryUrl=(n)=>{
      const slug=metadata(n,'slug');
      const category=nodeCategory(n);
      return slug?store.url({slug,category}):null;
    };

    /** @param {string} text @param {string} [kind] */
    const setStatus=(text,kind='')=>{
      status.setAttribute('aria-busy','false');status.textContent=text;
      status.dataset.state=kind;
    };

    /** @param {ExplorerNode} n @param {string} key */
    function metadata(n,key){const value=n.metadata;return value&&typeof value==='object'&&!Array.isArray(value)&&typeof value[key]==='string'?value[key]:'';}
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

    /** @param {ExplorerNode[]} visible */
    function relevantEdges(visible){
      const ids=new Set(visible.map(n=>n.node_id));
      return edges.filter(e=>ids.has(e.source_node_id)&&ids.has(e.target_node_id)&&(
        String(e.edge_type||'').startsWith('entry_relation:')||
        String(e.edge_type||'').startsWith('world_')
      ));
    }

    /** @param {ExplorerNode[]} vnodes */
    function layout(vnodes){
      const W=1100,H=720,cx=W/2,cy=H/2;
      const world=vnodes.filter(n=>n.node_type==='world');
      const entry=vnodes.filter(n=>n.node_type==='entry');
      const pos=/** @type {Map<string,{x:number,y:number}>} */(new Map());
      /** @param {Map<string,{x:number,y:number}>} positions @param {string} id */
      function point(positions,id){const p=positions.get(id);if(!p)throw new Error('网络布局坐标缺失');return p;}
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
        const next=/** @type {Map<string,{x:number,y:number}>} */(new Map());
        vnodes.forEach(n=>next.set(n.node_id,{x:point(pos,n.node_id).x,y:point(pos,n.node_id).y}));
        for(let i=0;i<vnodes.length;i++){
          const a=vnodes[i],pa=point(pos,a.node_id);
          let fx=(cx-pa.x)*0.002,fy=(cy-pa.y)*0.002;
          for(let j=i+1;j<vnodes.length;j++){
            const b=vnodes[j],pb=point(pos,b.node_id);
            let dx=pa.x-pb.x,dy=pa.y-pb.y,d2=Math.max(dx*dx+dy*dy,180);
            const force=9000/d2;
            fx+=dx*force;fy+=dy*force;
            const q=point(next,b.node_id);q.x-=dx*force*.18;q.y-=dy*force*.18;
          }
          point(next,a.node_id).x+=fx*.18;point(next,a.node_id).y+=fy*.18;
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
      if(!document.getElementById('network-graph-toggle')?.hasAttribute('open')){setStatus('可探索 '+vnodes.length+' 个条目与主题');renderList(vnodes);return;}
      const pos=layout(vnodes);
      svg.innerHTML='';
      const ns='http://www.w3.org/2000/svg';
      const g=document.createElementNS(ns,'g');
      g.classList.add('network-svg-layer');
      vedges.forEach(e=>{
        const a=pos.get(e.source_node_id),b=pos.get(e.target_node_id);if(!a||!b)return;
        const line=document.createElementNS(ns,'line');
        line.setAttribute('x1',String(a.x));line.setAttribute('y1',String(a.y));line.setAttribute('x2',String(b.x));line.setAttribute('y2',String(b.y));
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
        group.dataset.nodeId=n.node_id;group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label',label(n));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectNode(n.node_id)}});
        const circle=document.createElementNS(ns,'circle');
        circle.setAttribute('r',n.node_type==='world'?'27':'15');
        circle.setAttribute('class','network-node-circle '+(CAT_CLASS[nodeCategory(n)]||'world'));
        group.appendChild(circle);
        const text=document.createElementNS(ns,'text');
        text.setAttribute('class','network-node-label');
        text.setAttribute('y',n.node_type==='world'?'45':'29');
        text.setAttribute('text-anchor','middle');
        text.textContent=label(n).length>15?label(n).slice(0,14)+'…':label(n);
        group.appendChild(text);
        group.addEventListener('click',()=>selectNode(n.node_id));
        g.appendChild(group);
      });
      setStatus(`显示 ${vnodes.length} 个核心节点 · ${vedges.length} 条可视关系`);
      renderList(vnodes);
    }

    /** @param {ExplorerNode} n */
    function neighbors(n){
      return edges.filter(e=>e.source_node_id===n.node_id||e.target_node_id===n.node_id).map(e=>{
        const id=e.source_node_id===n.node_id?e.target_node_id:e.source_node_id;
        const other=nodes.find(x=>x.node_id===id);
        return other?{node:other,edge:e}:null;
      }).filter(x=>x!==null).sort((a,b)=>label(a.node).localeCompare(label(b.node),'zh'));
    }

    /** @param {string} id */
    function selectNode(id){
      active=nodes.find(n=>n.node_id===id)||null;
      if(!active){detail.innerHTML='';return;}
      const links=neighbors(active);
      const direct=links.filter(x=>isCore(x.node)).slice(0,18);
      const url=entryUrl(active);
      detail.innerHTML=`<div class="network-detail-kicker">${esc(TYPE_LABELS[active.node_type]||active.node_type)} · ${esc(nodeCategory(active)||'主题')}</div>
        <h3>${esc(label(active))}</h3>
        <p>${esc(active.summary||'从这个节点继续查看已经建立的知识关系。')}</p>
        <div class="network-detail-meta"><span>${links.length} 条已建立关系</span></div>
        ${url?`<a class="network-detail-entry" href="${safeHref(url)||''}">进入知识条目 →</a>`:''}
        <div class="network-neighbor-title">继续探索</div>
        <div class="network-neighbor-list">${direct.length?direct.map(x=>`<button type="button" data-node="${esc(x.node.node_id)}"><span>${esc(relationLabel(String(x?.edge.edge_type||'相关').replace(/^entry_relation:/,'').replace(/^world_.*/, '所属主题')))} · ${esc(nodeCategory(x.node)||'主题')}</span><b>${esc(label(x.node))}</b></button>`).join(''):'<div class="network-no-neighbor">当前节点暂无可展示的核心邻接节点。</div>'}</div>`;
      /** @type {NodeListOf<HTMLElement>} */(detail.querySelectorAll('[data-node]')).forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.node||'')));
      draw();
    }

    /** @param {ExplorerNode[]} vnodes */
    function renderList(vnodes){
      const matches=vnodes.slice(0,30);
      list.innerHTML=matches.map(n=>`<button type="button" class="network-list-item ${active?.node_id===n.node_id?'is-active':''}" data-node="${esc(n.node_id)}"><span>${esc(nodeCategory(n)||'主题')}</span><b>${esc(label(n))}</b></button>`).join('');
      /** @type {NodeListOf<HTMLElement>} */(list.querySelectorAll('[data-node]')).forEach(b=>b.addEventListener('click',()=>selectNode(b.dataset.node||'')));
    }

    document.getElementById('network-graph-toggle')?.addEventListener('toggle',draw);
    search.addEventListener('input',()=>{query=search.value.trim();draw();if(query){const match=visibleNodes().find(n=>n.node_type==='entry');if(match)selectNode(match.node_id);}});
    filter.addEventListener('change',()=>{type=filter.value;draw();});
    reset.addEventListener('click',()=>{query='';type='all';search.value='';filter.value='all';active=null;detail.innerHTML='<div class="network-empty"><span>选择条目</span><h3>点击一个节点</h3><p>查看它连接到哪些知识，并从这里进入完整条目页面。</p></div>';draw();});

    try{
      window.JDM_VISITOR?.renderState(status,'loading',{message:'正在读取关联内容…'});
      const graph=await store.graph({limit:500,edgeLimit:2000,includeEdges:true});
      nodes=graph.nodes.flatMap(n=>n.node_id&&n.node_type?[{...n,node_id:n.node_id,node_type:n.node_type}]:[]);edges=graph.edges.flatMap(e=>e.source_node_id&&e.target_node_id?[{...e,source_node_id:e.source_node_id,target_node_id:e.target_node_id}]:[]);
      if(!nodes.length){window.JDM_VISITOR?.renderState(status,'empty',{message:'当前没有可展示的内容。'});return;}
      draw();
      const requested=new URLSearchParams(location.search).get('node');
      const first=nodes.find(n=>n.node_id===requested)||nodes.find(n=>n.node_type==='entry'&&label(n).includes('青花'))||nodes.find(n=>n.node_type==='entry');
      if(first)selectNode(first.node_id);
    }catch(error){
      console.error('[JDM network explorer]',error);
      window.JDM_VISITOR?.renderState(status,'error',{error,retry:()=>location.reload()});
      window.JDM_VISITOR?.renderState(detail,'empty',{message:'请选择其他内容，或重新加载。'});
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();