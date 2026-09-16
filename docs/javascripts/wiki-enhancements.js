(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const qs=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const ITEMS={
    'qingbai-porcelain':{name:'青白瓷',period:'宋—元',craft:'青白釉',id:'JDP-001',desc:'景德镇宋元时期的重要瓷类，湖田窑等窑场形成了丰富的器型与装饰序列。',image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/50236/135438/main-image',source:'https://www.metmuseum.org/art/collection/search/50236',sourceName:'The Met · Object 17.175.5'},
    'blue-and-white':{name:'青花瓷',period:'元—明清',craft:'釉下彩',id:'JDP-002',desc:'以钴料在胎体上绘画后施釉烧成，元代景德镇青花进入重要发展阶段。',image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/42490/177595/main-image',source:'https://www.metmuseum.org/art/collection/search/42490',sourceName:'The Met · Object 1991.253.33'},
    'fencai':{name:'粉彩瓷',period:'清代',craft:'釉上彩',id:'JDP-003',desc:'清代景德镇重要彩瓷体系，粉彩以柔和的色阶和丰富的釉上装饰见长。',image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/48308/83774/main-image',source:'https://www.metmuseum.org/art/collection/search/48308',sourceName:'The Met · Object 65.86.18'},
    'colored-glaze':{name:'颜色釉瓷',period:'明清',craft:'颜色釉',id:'JDP-004',desc:'以釉色本身构成主要视觉效果，包括红、蓝等不同呈色体系；具体品种按馆藏和文献分别核验。',image:null,source:'https://www.metmuseum.org/art/collection/search/42216',sourceName:'The Met · Jingdezhen blue-glaze vase'}
  };
  function entryUrl(slug){return ROOT+'entry/?type=entry&slug='+encodeURIComponent(slug)}
  function editorUrl(slug){return ROOT+'editor/?slug='+encodeURIComponent(slug)}
  function historyUrl(slug){return ROOT+'history-revisions/'+(slug?'?slug='+encodeURIComponent(slug):'')}
  async function db(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  async function mediaFor(client,slug){const {data}=await client.from('media').select('path,title,source,license,creator').eq('status','approved').eq('entry_id',(await client.from('entries').select('id').eq('slug',slug).maybeSingle()).data?.id||'00000000-0000-0000-0000-000000000000').order('created_at',{ascending:false});return data||[]}
  async function enhanceCatalog(){
    const root=qs('#catalog-list');if(!root)return;
    const input=qs('#catalog-search');
    async function render(){
      const client=await db();let dynamic=[];
      if(client){const {data}=await client.from('entries').select('slug,category,zh,version').eq('status','published').in('category',['器物','objects','catalog']);dynamic=data||[]}
      const q=(input?.value||'').trim().toLowerCase();
      const all=Object.entries(ITEMS).map(([slug,v])=>({slug,...v}));
      dynamic.forEach(e=>{if(!all.some(x=>x.slug===e.slug))all.push({slug:e.slug,name:e.zh?.title||e.slug,period:'已发布',craft:e.category,id:'WIKI',desc:e.zh?.summary||e.zh?.content?.replace(/<[^>]+>/g,'').slice(0,150)||''})});
      const filtered=all.filter(i=>`${i.name} ${i.period} ${i.craft} ${i.desc}`.toLowerCase().includes(q));
      root.innerHTML=filtered.map(i=>`<a class="catalog-card wiki-card-link catalog-interactive" href="${entryUrl(i.slug)}">${i.image?`<div class="catalog-cover"><img src="${i.image}" alt="${esc(i.name)} 官方馆藏图" loading="lazy"><span>官方馆藏图</span></div>`:'<div class="catalog-cover catalog-no-image"><span>官方图片待核验</span></div>'}<div class="tag">${esc(i.id)}</div><div class="tag">${esc(i.period)}</div><div class="tag">${esc(i.craft)}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc)}</p>${i.source?`<small class="catalog-source">${esc(i.sourceName||'官方馆藏')} ↗</small>`:''}<span class="wiki-read-more">打开完整器物条目 →</span></a>`).join('')||'<div class="notice">没有找到匹配器物。</div>';
    }
    await render();input?.addEventListener('input',render);
  }
  async function enhanceEntry(){
    const root=qs('#wiki-entry-root');if(!root)return;
    const slug=new URLSearchParams(location.search).get('slug');if(!slug){root.innerHTML='<div class="notice"><b>知识条目入口</b><br>请从器物、人物、窑址或时间轴点击具体条目进入。<div class="hero-actions"><a class="md-button md-button--primary" href="'+ROOT+'museum/catalog/">器物图谱</a><a class="md-button" href="'+ROOT+'museum/people/">人物数据库</a><a class="md-button" href="'+ROOT+'museum/timeline/">历史时间轴</a></div></div>';return}
    const client=await db();let data=null;
    if(client){const r=await client.from('entries').select('id,slug,category,zh,en,ja,sources,version,updated_at').eq('slug',slug).eq('status','published').maybeSingle();data=r.data}
    const staticItem=ITEMS[slug];
    if(!data&&!staticItem){root.innerHTML='<div class="notice"><b>条目不存在或尚未审核发布。</b><br>你可以返回图谱，或创建一个新条目提交审核。<div class="hero-actions"><a class="md-button md-button--primary" href="'+ROOT+'editor/">创建条目</a><a class="md-button" href="'+ROOT+'museum/catalog/">返回图谱</a></div></div>';return}
    let media=[];if(data&&client)media=await mediaFor(client,slug);if(!media.length&&staticItem?.image)media=[{path:staticItem.image,title:staticItem.name,source:staticItem.source,license:'Public Domain / Open Access',creator:'The Metropolitan Museum of Art'}];
    const title=data?.zh?.title||staticItem?.name||slug;const category=data?.category||'器物';const body=data?.zh?.content||staticItem?.desc||'';const refs=Array.isArray(data?.sources)?data.sources:[];
    root.innerHTML=`<article class="wiki-entry"><header class="wiki-entry-header"><div><div class="wiki-kicker">${esc(category)} · JINGDEZHEN PORCELAIN WIKI</div><h1>${esc(title)}</h1><div class="wiki-entry-tags"><span class="tag">${esc(data?.version?`第 ${data.version} 版`:staticItem?.id||'WIKI')}</span><span class="tag">官方来源核验层</span></div></div><div class="wiki-entry-tools"><a class="md-button md-button--primary" href="${editorUrl(slug)}">✎ 编辑条目</a><a class="md-button" href="${historyUrl(slug)}">◷ 历史</a><button class="md-button" id="entry-favorite" type="button">☆ 收藏</button></div></header><div class="wiki-entry-layout"><aside class="wiki-infobox"><div class="wiki-infobox-title">条目信息</div><dl><div><dt>分类</dt><dd>${esc(category)}</dd></div><div><dt>年代</dt><dd>${esc(staticItem?.period||data?.zh?.period||'见正文')}</dd></div><div><dt>工艺</dt><dd>${esc(staticItem?.craft||'—')}</dd></div><div><dt>图片</dt><dd>${media.length} 张已核验</dd></div></dl></aside><div class="wiki-entry-body"><section><h2>官方馆藏图片</h2>${media.length?`<div class="entry-media-grid">${media.map(m=>`<figure><img src="${esc(m.path)}" alt="${esc(m.title||title)}" loading="lazy"><figcaption><b>${esc(m.title||title)}</b><small>${esc(m.creator||'官方馆藏')} · ${esc(m.license||'来源核验中')}</small>${m.source?`<a href="${esc(m.source)}" target="_blank" rel="noopener">打开官方馆藏记录 →</a>`:''}</figcaption></figure>`).join('')}</div>`:'<div class="notice">当前尚未找到可直接核验的官方图片。我们不会用第三方图片填充。</div>'}</section><section><h2>正文</h2><div class="entry-rich-body">${data?body:'<p>'+esc(body)+'</p>'}</div></section><section class="wiki-source-panel"><h2>来源与核验</h2>${refs.length?'<div class="wiki-source-list">'+refs.map(r=>`<a href="${ROOT}research/sources/#${esc(r)}"><span>${esc(r)}</span><b>打开文献记录 →</b></a>`).join('')+'</div>':staticItem?.source?`<div class="notice">主要图像来源：<a href="${esc(staticItem.source)}" target="_blank" rel="noopener">${esc(staticItem.sourceName||'官方馆藏记录')}</a></div>`:'<div class="notice">这个条目暂未绑定结构化文献编号。</div>'}</section></div></div></article>`;
    setupFavorite(slug,client);
  }
  async function setupFavorite(slug,client){const b=qs('#entry-favorite');if(!b||!client)return;b.onclick=async()=>{const {data:{session}}=await client.auth.getSession();if(!session){b.textContent='请先登录';setTimeout(()=>b.textContent='☆ 收藏',1800);return}const {data:e}=await client.from('entries').select('id').eq('slug',slug).maybeSingle();if(!e)return;const {data:old}=await client.from('favorites').select('entry_id').eq('user_id',session.user.id).eq('entry_id',e.id).maybeSingle();if(old){await client.from('favorites').delete().eq('user_id',session.user.id).eq('entry_id',e.id);b.textContent='☆ 收藏'}else{await client.from('favorites').insert({user_id:session.user.id,entry_id:e.id});b.textContent='★ 已收藏'}}}
  function boot(){enhanceCatalog();enhanceEntry();enhanceStaticLinks()}
  function enhanceStaticLinks(){document.querySelectorAll('.md-content__inner a[href]').forEach(a=>{if(a.dataset.wikiEnhanced)return;const href=a.getAttribute('href')||'';if(/^https?:\/\//i.test(href)||href.startsWith('#'))return;a.dataset.wikiEnhanced='1'})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
