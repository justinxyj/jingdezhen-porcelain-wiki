/* Museum Curator Console: authenticated editorial dashboard. */
(function(){
  const esc=s=>window.JDM_SAFE?.esc?.(s)??window.JDM_AUTH?.esc?.(s)??String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const statusText=(v)=>({published:'已发布',draft:'草稿',archived:'已归档'}[v]||v||'未设置');
  const mediaState=(v)=>({verified:'已核验',unreviewed:'待核验',rejected:'已拒绝',expired:'已过期'}[v]||v||'未设置');
  const ENTRY_LIMIT=250;
  const MEDIA_LIMIT=500;
  // TODO(H-2 follow-up): full pagination / cursor for entries & media beyond hard limits.
  async function dbClient(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))throw new Error('Supabase 配置不可用');
    const db=window.JDM_AUTH?.getClient?.()||window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    const {data:{user}}=await db.auth.getUser();
    if(!user)throw Object.assign(new Error('馆长后台需要登录，请重新登录'),{code:'AUTH_REQUIRED',status:401});
    const result=window.JDM_AUTH?.request
      ? await window.JDM_AUTH.request(/** @type {any} */ (d)=>d.from('profiles').select('role').eq('id',user.id).maybeSingle())
      : (await db.from('profiles').select('role').eq('id',user.id).maybeSingle()).data;
    const profile=result;
    if(profile?.role!=='admin')throw Object.assign(new Error('当前账号没有馆长后台权限'),{code:'AUTH_FORBIDDEN',status:403});
    return db;
  }
  function domainResult(settled,limit){
    if(settled.status==='fulfilled'){
      const rows=Array.isArray(settled.value)?settled.value:(settled.value==null?[]:[settled.value]);
      const truncated=Number.isFinite(limit)&&rows.length>=limit;
      return {ok:true,rows,error:null,truncated,loaded:rows.length,limit:limit??null};
    }
    const error=settled.reason instanceof Error?settled.reason:new Error(String(settled.reason||'加载失败'));
    return {ok:false,rows:[],error,truncated:false,loaded:0,limit:limit??null};
  }
  async function load(){
    const db=await dbClient();
    const request=window.JDM_AUTH?.request;
    if(!request)throw Object.assign(new Error('统一认证请求层不可用，请刷新页面后重试'),{code:'JDM_AUTH_MISSING'});
    const settled=await Promise.allSettled([
      request(/** @type {any} */ (d)=>d.from('entries').select('id,slug,category,zh,status,updated_at').order('updated_at',{ascending:false}).limit(ENTRY_LIMIT)),
      request(/** @type {any} */ (d)=>d.from('media').select('id,entry_id,path,title,source,license,status,review_state,is_primary,verified_at').order('created_at',{ascending:false}).limit(MEDIA_LIMIT))
    ]);
    const entriesDomain=domainResult(settled[0],ENTRY_LIMIT);
    const mediaDomain=domainResult(settled[1],MEDIA_LIMIT);
    const normalizedEntries=entriesDomain.rows.map(e=>({...e,confidence:e.zh?.meta?.confidence||null,editorial_status:e.zh?.meta?.editorial_status||e.status,reviewed_at:e.zh?.meta?.reviewed_at||null}));
    const normalizedMedia=mediaDomain.rows.map(m=>({...m,verification_status:m.review_state,reviewed_at:m.verified_at||null}));
    const sources=[];
    if(entriesDomain.ok){
      normalizedEntries.forEach(e=>{
        (Array.isArray(e.zh?.sources)?e.zh.sources:Array.isArray(e.sources)?e.sources:[]).forEach((s,i)=>{
          if(s&&typeof s==='object')sources.push({id:`${e.id}:${i}`,title:s.label||s.title||'未命名来源',url:s.url||'',tier:s.tier||null,status:s.status||'published',institution:s.institution||'',last_checked_at:s.last_checked_at||null});
        });
      });
    }
    const truncated=Boolean(entriesDomain.truncated||mediaDomain.truncated);
    const loadFailed=!entriesDomain.ok||!mediaDomain.ok;
    const incomplete=truncated||loadFailed;
    return {
      entries:normalizedEntries,
      media:normalizedMedia,
      sources,
      meta:{
        truncated,
        incomplete,
        loadFailed,
        domains:{
          entries:entriesDomain,
          media:mediaDomain,
          sources:{ok:entriesDomain.ok,loaded:sources.length,truncated:false,error:entriesDomain.ok?null:entriesDomain.error}
        },
        limits:{entries:ENTRY_LIMIT,media:MEDIA_LIMIT},
        loaded:{entries:normalizedEntries.length,media:normalizedMedia.length,sources:sources.length}
      }
    };
  }
  function checks(data){
    const meta=data.meta||{};
    const domains=meta.domains||{};
    const issues=[];
    const statusParts=[];
    // Failed domains do not participate in full quality checks.
    if(domains.entries?.ok){
      const mediaByEntry=new Map();
      if(domains.media?.ok){
        data.media.forEach(m=>{if(!mediaByEntry.has(m.entry_id))mediaByEntry.set(m.entry_id,[]);mediaByEntry.get(m.entry_id).push(m)});
      }
      data.entries.forEach(e=>{
        if(!e.zh?.title)issues.push(['entry','缺少标题',e.slug]);
        if(!String(e.zh?.content||'').trim())issues.push(['entry','缺少正文',e.slug]);
        if(!String(e.zh?.summary||'').trim())issues.push(['entry','缺少简介',e.slug]);
        if(e.confidence==='unreviewed')issues.push(['review','尚未标注可信度',e.slug]);
        if(domains.media?.ok&&!mediaByEntry.has(e.id))issues.push(['media','没有公开媒体',e.slug]);
      });
      data.sources.forEach(s=>{
        if(!String(s.title||'').trim())issues.push(['source','来源缺少标题',s.id]);
        if(!String(s.url||'').trim())issues.push(['source','来源缺少URL',s.title||s.id]);
      });
    }else{
      statusParts.push('entries_failed');
    }
    if(domains.media?.ok){
      data.media.forEach(m=>{
        if(!String(m.path||'').trim())issues.push(['media','图片路径为空',m.id]);
        if(m.review_state!=='verified')issues.push(['media',`图片状态：${mediaState(m.review_state)}`,m.title||m.id]);
      });
    }else{
      statusParts.push('media_failed');
    }
    const truncated=Boolean(meta.truncated);
    const incomplete=Boolean(meta.incomplete);
    let conclusion='issues';
    if(incomplete)conclusion='incomplete';
    else if(!issues.length)conclusion='pass';
    return {
      issues,
      conclusion,
      truncated,
      incomplete,
      status:incomplete?'truncated':(issues.length?'issues':'complete'),
      failedDomains:statusParts
    };
  }
  function domainBadge(name,domain){
    if(!domain)return `<div class="curator-domain is-unknown"><strong>${esc(name)}</strong><span>未知</span></div>`;
    if(!domain.ok){
      const msg=domain.error?.message||domain.error?.code||'加载失败';
      return `<div class="curator-domain is-fail"><strong>${esc(name)}</strong><span>失败</span><small>${esc(msg)}</small></div>`;
    }
    const trunc=domain.truncated?` · 已截断（上限 ${domain.limit}）`:'';
    return `<div class="curator-domain is-ok"><strong>${esc(name)}</strong><span>成功 · 已加载 ${domain.loaded}${trunc}</span></div>`;
  }
  function render(root,data){
    const check=checks(data),issues=check.issues,count=k=>issues.filter(x=>x[0]===k).length;
    const meta=data.meta||{};
    const loaded=meta.loaded||{entries:data.entries.length,media:data.media.length,sources:data.sources.length};
    const bannerParts=[];
    if(meta.loadFailed)bannerParts.push('部分数据域加载失败，下列质量检查结果不完整。');
    if(meta.truncated)bannerParts.push('已命中后台拉取上限，结果可能不完整 / 已截断（条目 '+ENTRY_LIMIT+'、媒体 '+MEDIA_LIMIT+'）。完整分页待后续迭代。');
    const banner=bannerParts.length?`<div class="curator-banner" role="status">${bannerParts.map(esc).join(' ')}</div>`:'';
    let issuesHtml;
    if(check.incomplete){
      const emptyNote=issues.length?'':`<p class="curator-incomplete-note">当前未见规则命中问题，但检查标记为 <b>truncated / incomplete</b>，不能视为「全部通过」。</p>`;
      issuesHtml=issues.slice(0,100).map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join('')+emptyNote;
    }else{
      issuesHtml=issues.slice(0,100).map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join('')||'<p>基础检查通过，没有发现当前规则覆盖的问题。</p>';
    }
    const conclusionLabel=check.conclusion==='pass'?'完整检查通过':check.conclusion==='incomplete'?'结果不完整（truncated）':'发现问题';
    root.innerHTML=`<div class="curator-console"><div class="curator-hero"><span>CURATOR CONSOLE · 馆长后台</span><h1>内容、图片、来源，一处检查。</h1><p>后台只对管理员开放，用于审核公开知识库的数据完整性与来源质量。</p></div>${banner}<div class="curator-stats"><div><b>${loaded.entries}</b><span>已加载条目${meta.domains?.entries?.truncated?'（截断）':''}</span></div><div><b>${loaded.media}</b><span>已加载媒体${meta.domains?.media?.truncated?'（截断）':''}</span></div><div><b>${loaded.sources}</b><span>已解析来源</span></div><div><b>${issues.length}</b><span>待处理问题</span></div></div><section class="curator-section"><div class="curator-head"><h2>加载域状态</h2></div><div class="curator-domain-grid">${domainBadge('entries',meta.domains?.entries)}${domainBadge('media',meta.domains?.media)}${domainBadge('sources',meta.domains?.sources)}</div></section><section class="curator-section"><div class="curator-head"><h2>数据质量</h2><button id="curator-refresh">重新检查</button></div><p class="curator-check-status">检查结论：<b>${esc(conclusionLabel)}</b>${check.incomplete?' · status=truncated/incomplete':''}</p><div class="curator-check-grid"><div><strong>${count('entry')}</strong><span>内容问题</span></div><div><strong>${count('media')}</strong><span>媒体问题</span></div><div><strong>${count('source')}</strong><span>来源问题</span></div><div><strong>${count('review')}</strong><span>审核问题</span></div></div><div class="curator-issues">${issuesHtml}</div></section><section class="curator-section"><div class="curator-head"><h2>最近条目</h2></div><div class="curator-table">${(meta.domains?.entries?.ok?data.entries:[]).slice(0,30).map(e=>`<div><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.category||'')}</span><span>${statusText(e.status)}</span><span>${esc(e.confidence||'未审核')}</span></div>`).join('')||'<p>条目域未成功加载。</p>'}</div></section><section class="curator-section"><div class="curator-head"><h2>最近媒体</h2></div><div class="curator-table">${(meta.domains?.media?.ok?data.media:[]).slice(0,30).map(m=>`<div><b>${esc(m.title||'未命名图片')}</b><span>${esc(m.source||'')}</span><span>${mediaState(m.verification_status)}</span><span>${m.is_primary?'主图':'媒体'}</span></div>`).join('')||'<p>媒体域未成功加载。</p>'}</div></section></div>`;
    root.querySelector('#curator-refresh').onclick=()=>init(root);
  }
  let initSeq=0;
  async function init(root){const seq=++initSeq;root.innerHTML='<div class="curator-loading">正在读取馆藏数据……</div>';try{const data=await load();if(seq!==initSeq)return;render(root,data)}catch(err){const code=esc(err?.code||err?.status||'UNKNOWN');root.innerHTML=`<div class="curator-error" role="alert"><h2>${esc(err.message||'后台加载失败')}</h2><p>错误代码：${code}</p><button type="button" id="curator-auth-retry">重新检查</button></div>`;root.querySelector('#curator-auth-retry')?.addEventListener('click',()=>init(root))}}
  function boot(){const root=document.getElementById('curator-root');if(!root)return;window.addEventListener('jdm:auth',event=>{const detail=event instanceof CustomEvent?event.detail:null;if(detail?.event==='SIGNED_OUT')root.innerHTML='<div class="curator-error" role="alert"><h2>登录状态已失效</h2><p>请重新登录后再使用馆长后台。</p></div>'});init(root)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
