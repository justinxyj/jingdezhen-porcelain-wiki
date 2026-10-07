/* A Jingdezhen-first atlas; the searchable directory survives tile failures. */
(function () {
  const esc = value => window.JDM_SAFE.esc(value);
  const href = value => window.JDM_SAFE.safeHref(value);
  const plain = value => { const node=document.createElement('div');node.innerHTML=String(value||'');return node.textContent||''; };
  const views = {jdz:{label:'景德镇',center:[29.29,117.21],zoom:11},china:{label:'中国',center:[34,105],zoom:4},asia:{label:'亚洲',center:[30,110],zoom:3},world:{label:'世界',center:[25,15],zoom:2}};
  async function boot() {
    const root=document.getElementById('kiln-map');if(!root||!window.JDM_KNOWLEDGE)return;
    try { init(await window.JDM_KNOWLEDGE.kilnAtlas({limit:250})); }
    catch (_) { root.innerHTML='<p role="alert">窑址目录暂时无法加载。<button type="button">重试</button></p><p>仍可阅读下方的窑址介绍。</p>';root.querySelector('button').onclick=()=>{window.JDM_KNOWLEDGE.reset();boot()}; }
  }
  function init(entries) {
    const root=document.getElementById('kiln-map');
    const rows=entries.filter(e=>e.category==='窑址'&&Number.isFinite(Number(e.zh?.meta?.map?.lat))&&Number.isFinite(Number(e.zh?.meta?.map?.lng))&&e.zh?.meta?.map?.lat!=null&&e.zh?.meta?.map?.lng!=null);
    let level='jdz',selected='',query='';
    root.innerHTML=`<div class="global-kiln-map-toolbar"><label for="global-kiln-search">搜索当前范围的窑址</label><input id="global-kiln-search" type="search" placeholder="窑址、国家或年代"><div aria-label="地图范围">${Object.entries(views).map(([key,v])=>`<button type="button" data-region="${key}" aria-pressed="${key===level}">${v.label}</button>`).join('')}</div><span id="global-kiln-count" role="status"></span><button type="button" id="map-list-toggle" aria-controls="global-kiln-map-canvas" aria-expanded="true">切换地图 / 列表</button></div><div id="global-kiln-map-canvas" class="global-kiln-map-canvas" aria-label="窑址地图"></div><div id="global-kiln-list" class="global-kiln-list" aria-label="窑址目录"></div>`;
    const canvas=root.querySelector('#global-kiln-map-canvas');
    const map=window.L?window.L.map(canvas).setView(views.jdz.center,views.jdz.zoom):null;
    const layer=map?window.L.layerGroup().addTo(map):null;
    if(map){
      const tiles=window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
      let warned=false;tiles.on('tileerror',()=>{if(warned)return;warned=true;const notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='底图连接暂时不可用，下方目录仍可浏览。';canvas.before(notice)});
      map.on('zoomend',drawMarkers);
      if(window.ResizeObserver)new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(canvas);
    }else canvas.innerHTML='<p>底图暂时不可用，请使用下方窑址目录。</p>';
    function inRegion(e){const m=e.zh.meta.map,lat=Number(m.lat),lng=Number(m.lng),country=String(m.country||'');if(level==='jdz')return lat>=28.8&&lat<=30&&lng>=116.7&&lng<=117.9;if(level==='china')return country.startsWith('中国');if(level==='asia')return lng>=25&&lng<=180&&lat>=-12&&lat<=80;return true;}
    function shown(){return rows.filter(e=>inRegion(e)&&(!query||JSON.stringify(e.zh).toLowerCase().includes(query)));}
    function select(e,fromMarker=false){
      selected=e.slug;renderList();
      const button=[...root.querySelectorAll('[data-slug]')].find(b=>b.dataset.slug===e.slug);
      if(fromMarker)button?.scrollIntoView({block:'nearest',behavior:'auto'});
      if(map&&!fromMarker){const m=e.zh.meta.map;map.setView([m.lat,m.lng],Math.max(map.getZoom(),12),{animate:false});}
      open(e);
    }
    function open(e){
      const ui=window.JDM_VISITOR;if(!ui){location.href=window.JDM_KNOWLEDGE.url(e);return;}
      const modal=ui.dialog(e.zh?.title||e.slug),body=document.createElement('div'),m=e.zh.meta.map;
      const source=(e.zh?.sources?.length?e.zh.sources:e.sources||[]).find(s=>s&&(!s.status||s.status==='published')&&href(s.url));
      body.innerHTML=`<p>${esc([m.country,m.period,m.type].filter(Boolean).join(' · '))}</p><p>${esc(plain(e.zh?.summary||e.zh?.content).slice(0,280))}</p><p><a class="visitor-primary" href="${href(window.JDM_KNOWLEDGE.url(e))}">阅读全文 →</a></p><p><a href="${ui.root}network/relations/?node=${encodeURIComponent('entry:'+e.id)}">相关器物与人物 →</a></p>${source?`<p><a href="${href(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label||source.title||'资料来源')} ↗</a></p>`:''}`;
      modal.append(body);modal.showModal();
    }
    function renderList(){const list=root.querySelector('#global-kiln-list'),items=shown();root.querySelector('#global-kiln-count').textContent=views[level].label+'范围：'+items.length+' 处窑址';list.innerHTML=items.map(e=>`<button type="button" class="global-kiln-list-item ${selected===e.slug?'is-active':''}" data-slug="${esc(e.slug)}" aria-pressed="${selected===e.slug}"><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.zh.meta.map.period||'')}</span></button>`).join('')||'<p>当前范围没有匹配。试试更短的名称，或切换到世界范围。</p>';list.querySelectorAll('[data-slug]').forEach(b=>b.onclick=()=>select(rows.find(e=>e.slug===b.dataset.slug)));}
    function drawMarkers(){
      if(!map)return;layer.clearLayers();const items=shown(),groups=new Map();
      // Screen-space clustering keeps close markers selectable without a second map library.
      items.forEach(e=>{const m=e.zh.meta.map,p=map.project([m.lat,m.lng],map.getZoom()),key=items.length>12?Math.floor(p.x/56)+':'+Math.floor(p.y/56):e.slug;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e)});
      groups.forEach(group=>{const e=group[0],m=e.zh.meta.map;if(group.length===1){window.L.marker([m.lat,m.lng],{title:e.zh?.title||e.slug,alt:e.zh?.title||e.slug,keyboard:true}).bindTooltip(e.zh?.title||e.slug).on('click',()=>select(e,true)).addTo(layer);}else{const center=[group.reduce((v,x)=>v+Number(x.zh.meta.map.lat),0)/group.length,group.reduce((v,x)=>v+Number(x.zh.meta.map.lng),0)/group.length];window.L.marker(center,{title:group.length+'处窑址，放大查看',keyboard:true,icon:window.L.divIcon({className:'visitor-cluster',html:String(group.length),iconSize:[40,40]})}).on('click',()=>map.setView(center,map.getZoom()+2)).addTo(layer);}});
    }
    function render(){renderList();drawMarkers();}
    root.querySelector('#global-kiln-search').oninput=event=>{query=event.target.value.trim().toLowerCase();render();};
    root.querySelectorAll('[data-region]').forEach(button=>button.onclick=()=>{level=button.dataset.region;root.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(map)map.setView(views[level].center,views[level].zoom,{animate:false});render();});
    root.querySelector('#map-list-toggle').onclick=event=>{canvas.hidden=!canvas.hidden;event.target.setAttribute('aria-expanded',String(!canvas.hidden));if(map&&!canvas.hidden)map.invalidateSize();};
    render();const slug=new URLSearchParams(location.search).get('slug'),initial=rows.find(e=>e.slug===slug);if(initial){level='world';render();select(initial);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
