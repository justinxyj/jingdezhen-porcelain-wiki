/* A Jingdezhen-first atlas; the searchable directory survives tile failures. */
(function () {
  /** @param {unknown} value */
  const esc=value=>window.JDM_SAFE?.esc(value)||'';
  /** @param {unknown} value */
  const href=value=>window.JDM_SAFE?.safeHref(value)||'';
  /** @param {unknown} value */
  const plain = value => { const node=document.createElement('div');node.innerHTML=String(value||'');return node.textContent||''; };
  /** @type {Record<string,{label:string,center:import('leaflet').LatLngTuple,zoom:number}>} */
  const views={world:{label:'全部',center:[25,15],zoom:2},jdz:{label:'景德镇',center:[29.29,117.21],zoom:11},china:{label:'中国其他地区',center:[34,105],zoom:4},japan:{label:'日本',center:[35,135],zoom:5},korea:{label:'韩国',center:[36,128],zoom:6},southeast:{label:'东南亚',center:[15,105],zoom:4},west:{label:'西亚',center:[33,43],zoom:4},europe:{label:'欧洲',center:[49,8],zoom:4},other:{label:'其他',center:[25,15],zoom:2}};
  /** @param {import('../../types/knowledge').Entry} e */
  function region(e){
    const country=String(e.zh?.meta?.map?.country||'');
    if(country.startsWith('中国'))return country.includes('景德镇')?'jdz':'china';
    if(country.startsWith('日本'))return 'japan';
    if(country.startsWith('韩国'))return 'korea';
    if(/^(泰国|越南|东南亚|马来西亚|印度尼西亚|柬埔寨|缅甸)/.test(country))return 'southeast';
    if(/^(西亚|土耳其|伊朗|伊拉克)/.test(country))return 'west';
    if(/^(欧洲|法国|英国|德国|荷兰|意大利|葡萄牙|西班牙)/.test(country))return 'europe';
    return 'other';
  }
  async function boot() {
    const rootCandidate=document.getElementById('kiln-map');if(!rootCandidate)return;const root=rootCandidate;
    const storeCandidate=window.JDM_KNOWLEDGE;if(!storeCandidate)return;const store=storeCandidate;if(!root||!window.JDM_KNOWLEDGE)return;
    try { init(await window.JDM_KNOWLEDGE.kilnAtlas({limit:250})); }
    catch (error) { window.JDM_VISITOR?.renderState(root,'error',{error,retry:()=>{window.JDM_KNOWLEDGE?.reset();boot()}}); }
  }
  /** @param {import('../../types/knowledge').Entry[]} entries */
  function init(entries) {
    const rootCandidate=document.getElementById('kiln-map');if(!rootCandidate)return;const root=rootCandidate;
    const storeCandidate=window.JDM_KNOWLEDGE;if(!storeCandidate)return;const store=storeCandidate;
    const rows=entries.flatMap(e=>{const m=e.zh?.meta?.map;if(e.category!=='窑址'||!m||!Number.isFinite(Number(m.lat))||!Number.isFinite(Number(m.lng)))return [];return [{...e,zh:{...e.zh,meta:{...e.zh.meta,map:m}}}];});
    /** @typedef {(typeof rows)[number]} MappedEntry */
    let level='jdz',selected='',query='';
    root.innerHTML=`<div class="global-kiln-map-toolbar"><label for="global-kiln-search">搜索当前范围的窑址</label><input id="global-kiln-search" type="search" placeholder="窑址、国家或年代"><div aria-label="地图范围">${Object.entries(views).map(([key,v])=>`<button type="button" data-region="${key}" aria-pressed="${key===level}">${v.label}</button>`).join('')}</div><span id="global-kiln-count" role="status"></span><button type="button" id="map-list-toggle" aria-controls="global-kiln-map-canvas" aria-expanded="true">切换地图 / 列表</button></div><div id="global-kiln-map-canvas" class="global-kiln-map-canvas" aria-label="窑址地图"></div><div id="global-kiln-list" class="global-kiln-list" aria-label="窑址目录"></div>`;
    const canvasCandidate=root.querySelector('#global-kiln-map-canvas');if(!(canvasCandidate instanceof HTMLElement))return;const canvas=canvasCandidate;
    const leaflet=window.L;
    const map=leaflet?leaflet.map(canvas).setView(views.jdz.center,views.jdz.zoom):null;
    const layer=map&&leaflet?leaflet.layerGroup().addTo(map):null;
    if(map&&leaflet){
      const tiles=leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
      let warned=false;tiles.on('tileerror',()=>{if(warned)return;warned=true;const notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='底图连接暂时不可用，下方目录仍可浏览。';canvas.before(notice)});
      map.on('zoomend',drawMarkers);
      if(window.ResizeObserver)new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(canvas);
    }else canvas.innerHTML='<p>底图暂时不可用，请使用下方窑址目录。</p>';
    /** @type {Map<string,import('leaflet').Marker>} */
    const markers=new Map();
    /** @param {MappedEntry} e */
    function inRegion(e){return level==='world'||region(e)===level;}
    /** @param {string} slug */
    function highlight(slug){/** @type {NodeListOf<HTMLButtonElement>} */(root.querySelectorAll('[data-slug]')).forEach(b=>b.classList.toggle('is-highlighted',b.dataset.slug===slug));markers.forEach(marker=>marker.getElement()?.classList.toggle('is-highlighted',marker===markers.get(slug)));}
    function shown(){return rows.filter(e=>inRegion(e)&&(!query||JSON.stringify(e.zh).toLowerCase().includes(query)));}
    /** @param {MappedEntry} e */
    function select(e,fromMarker=false){
      selected=e.slug;renderList();
      const button=[.../** @type {NodeListOf<HTMLButtonElement>} */(root.querySelectorAll('[data-slug]'))].find(b=>b.dataset.slug===e.slug);
      if(fromMarker)button?.scrollIntoView({block:'nearest',behavior:'auto'});
      if(map&&!fromMarker){const m=e.zh.meta.map;map.setView([m.lat,m.lng],Math.max(map.getZoom(),12),{animate:false});}
      button?.focus({preventScroll:true});open(e);
    }
    /** @param {MappedEntry} e */
    async function open(e){
      const ui=window.JDM_VISITOR;if(!ui){location.href=store.url(e);return;}
      const modal=ui.dialog(e.zh?.title||e.slug),body=document.createElement('div'),m=e.zh.meta.map;
      const source=(e.zh?.sources?.length?e.zh.sources:e.sources||[]).find(s=>s&&(!s.status||s.status==='published')&&href(s.url));
      const media=(e.media||[]).find(item=>window.JDM_MEDIA_POLICY?.isUsable?.(item));
      body.innerHTML=`${media&&href(media.path)?`<figure><img class="visitor-detail-image" data-zoom-image data-source-url="${href(media.source_url)}" data-creator="${esc(media.creator||'')}" data-license="${esc(media.license||'')}" data-institution="${esc(media.institution||'')}" data-era="${esc(m.period||'')}" src="${href(media.path)}" alt="${esc(media.title||e.zh?.title)}"><figcaption>${esc([media.title,media.creator,media.source,media.license].filter(Boolean).join(' · '))}</figcaption></figure>`:''}<p>${esc([m.country,m.period,m.type].filter(Boolean).join(' · '))}</p><p>${esc(plain(e.zh?.summary||e.zh?.content).slice(0,280))}</p><p><a class="visitor-primary" href="${href(store.url(e))}">阅读全文 →</a></p><div class="map-related"></div>${source?`<p><a href="${href(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label||source.title||'资料来源')} ↗</a></p>`:''}`;
      modal.append(body);modal.showModal();
      try{
        const context=await store.entryContext(e.id);
        if(!modal.isConnected)return;
        const related=body.querySelector('.map-related');if(!related)return;
        for(const [category,label] of [['器物','相关器物'],['人物','相关人物']]){
          const matches=context.relations.filter(r=>r.entry?.category===category);if(!matches.length)continue;
          const heading=document.createElement('h3');heading.textContent=label;related.append(heading);
          matches.forEach(r=>{const a=document.createElement('a');a.href=href(store.url(r.entry));a.textContent=(r.entry.zh?.title||r.entry.slug)+' →';related.append(a,document.createElement('br'));});
        }
      }catch(_){/* Missing relationships never generate empty or invented buttons. */}
    }
    function renderList(){const list=root.querySelector('#global-kiln-list'),count=root.querySelector('#global-kiln-count'),items=shown();if(!list||!count)return;count.textContent=views[level].label+'范围：'+items.length+' 处窑址';list.innerHTML=items.map(e=>`<button type="button" class="global-kiln-list-item ${selected===e.slug?'is-active':''}" data-slug="${esc(e.slug)}" aria-pressed="${selected===e.slug}"><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.zh.meta.map.period||'')}</span></button>`).join('')||'<p>当前范围没有匹配。试试更短的名称，或切换到世界范围。</p>';/** @type {NodeListOf<HTMLButtonElement>} */(list.querySelectorAll('[data-slug]')).forEach(b=>{b.onclick=()=>{const e=rows.find(e=>e.slug===b.dataset.slug);if(e)select(e);};b.onmouseenter=b.onfocus=()=>highlight(b.dataset.slug||'');b.onmouseleave=b.onblur=()=>highlight('');});}
    function drawMarkers(){
      if(!map||!layer||!leaflet)return;layer.clearLayers();markers.clear();const items=shown(),groups=/** @type {Map<string,MappedEntry[]>} */(new Map());
      // Screen-space clustering keeps close markers selectable without a second map library.
      items.forEach(e=>{const m=e.zh.meta.map,p=map.project([m.lat,m.lng],map.getZoom()),key=items.length>12?Math.floor(p.x/56)+':'+Math.floor(p.y/56):e.slug;if(!groups.has(key))groups.set(key,[]);groups.get(key)?.push(e)});
      groups.forEach(group=>{const e=group[0],m=e.zh.meta.map;if(group.length===1){const marker=leaflet.marker([m.lat,m.lng],{title:e.zh?.title||e.slug,alt:e.zh?.title||e.slug,keyboard:true}).bindTooltip(e.zh?.title||e.slug).on('click',()=>select(e,true)).addTo(layer);markers.set(e.slug,marker);const icon=marker.getElement();if(icon){icon.addEventListener('focus',()=>highlight(e.slug));icon.addEventListener('blur',()=>highlight(''));}}else{
        /** @type {import('leaflet').LatLngTuple} */
        const center=[group.reduce((v,x)=>v+Number(x.zh.meta.map.lat),0)/group.length,group.reduce((v,x)=>v+Number(x.zh.meta.map.lng),0)/group.length];const cluster=leaflet.marker(center,{title:group.length+'处窑址，放大查看',keyboard:true,icon:leaflet.divIcon({className:'visitor-cluster',html:String(group.length),iconSize:[40,40]})}).on('click',()=>map.setView(center,map.getZoom()+2)).addTo(layer);group.forEach(item=>markers.set(item.slug,cluster));cluster.getElement()?.addEventListener('focus',()=>highlight(e.slug));cluster.getElement()?.addEventListener('blur',()=>highlight(''));}});
    }
    function render(){renderList();drawMarkers();}
    const search=root.querySelector('#global-kiln-search');if(search instanceof HTMLInputElement)search.addEventListener('input',()=>{query=search.value.trim().toLowerCase();render();});
    root.querySelectorAll('[data-region]').forEach(button=>{if(!(button instanceof HTMLButtonElement))return;button.onclick=()=>{level=button.dataset.region||'world';root.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(map)map.setView(views[level].center,views[level].zoom,{animate:false});render();};});
    const toggle=root.querySelector('#map-list-toggle');if(toggle instanceof HTMLButtonElement)toggle.onclick=()=>{canvas.hidden=!canvas.hidden;toggle.setAttribute('aria-expanded',String(!canvas.hidden));if(map&&!canvas.hidden)map.invalidateSize();};
    render();const slug=new URLSearchParams(location.search).get('slug'),initial=rows.find(e=>e.slug===slug);if(initial){level='world';render();select(initial);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
