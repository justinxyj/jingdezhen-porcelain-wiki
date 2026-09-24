/* Museum Curator Console: quality checks + Phase1 entry content editor. */
(function(){
  /** @param {any} s */
  const esc=s=>window.JDM_SAFE?.esc?.(s)??window.JDM_AUTH?.esc?.(s)??String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const safeHref=(raw,opts)=>window.JDM_SAFE?.safeHref?.(raw,opts)??window.JDM_AUTH?.safeHref?.(raw,opts)??'';
  const sanitizeBodyHtml=raw=>window.JDM_SAFE?.sanitizeBodyHtml?.(raw)??(function(r){
    const tpl=document.createElement('template');tpl.innerHTML=String(r||'');
    const allowed=new Set(['P','BR','STRONG','B','EM','I','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','A']);
    tpl.content.querySelectorAll('*').forEach(node=>{
      if(!allowed.has(node.tagName)){node.replaceWith(...node.childNodes);return;}
      [...node.attributes].forEach(attr=>{
        if(node.tagName==='A'&&attr.name.toLowerCase()==='href'){
          const href=safeHref(attr.value);
          if(href)node.setAttribute('href',href);else node.removeAttribute('href');
        }else node.removeAttribute(attr.name);
      });
      if(node.tagName==='A'&&node.getAttribute('href')){node.setAttribute('target','_blank');node.setAttribute('rel','noopener noreferrer');}
    });
    return tpl.innerHTML;
  })(raw);
  const statusText=(v)=>({published:'已发布',draft:'草稿',archived:'已归档'}[v]||v||'未设置');
  const mediaState=(v)=>({verified:'已核验',unreviewed:'待核验',rejected:'已拒绝',expired:'已过期'}[v]||v||'未设置');
  const ENTRY_LIMIT=250;
  const MEDIA_LIMIT=500;
  const ENTRY_SELECT='id,slug,category,zh,en,ja,sources,status,version,updated_by,updated_at,created_at';
  const REVISION_LIMIT=30;
  // TODO(H-2 follow-up): full pagination / cursor for entries & media beyond hard limits.

  /** @type {{view:'dashboard'|'editor', editSlug:string|null, dirty:boolean, saving:boolean}} */
  const ui={view:'dashboard',editSlug:null,dirty:false,saving:false};

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
    return {db,user};
  }
  function requireRequest(){
    const request=window.JDM_AUTH?.request;
    if(!request)throw Object.assign(new Error('统一认证请求层不可用，请刷新页面后重试'),{code:'JDM_AUTH_MISSING'});
    return request;
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
    await dbClient();
    const request=requireRequest();
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

  /** Escape PostgREST filter values for .or() / .ilike patterns. */
  function escapeFilterValue(value){
    return String(value||'').replace(/[,.()\\%_]/g,ch=>{
      if(ch==='%'||ch==='_')return '\\'+ch;
      if(ch===','||ch==='.'||ch==='('||ch===')')return ' ';
      return ch;
    }).trim();
  }

  /**
   * Server-side search by slug / title — not limited to the recent-N truncated list.
   * @param {string} term
   */
  async function searchEntries(term){
    await dbClient();
    const request=requireRequest();
    const q=String(term||'').trim();
    if(!q)return [];
    const safe=escapeFilterValue(q);
    if(!safe)return [];
    const pattern=`%${safe}%`;
    const selectCols='id,slug,category,zh,status,version,updated_at';
    /** Prefer exact slug hit, then fuzzy slug / title (server-side, not recent-N only). */
    const [exact,bySlug,byTitle]=await Promise.all([
      request(/** @type {any} */ (d)=>d.from('entries').select(selectCols).eq('slug',q).maybeSingle()),
      request(/** @type {any} */ (d)=>d.from('entries').select(selectCols).ilike('slug',pattern).order('updated_at',{ascending:false}).limit(40)),
      request(/** @type {any} */ (d)=>d.from('entries').select(selectCols).filter('zh->>title','ilike',pattern).order('updated_at',{ascending:false}).limit(40))
    ]);
    const byId=new Map();
    if(exact&&exact.id)byId.set(exact.id,exact);
    (Array.isArray(bySlug)?bySlug:[]).forEach(r=>{if(r?.id&&!byId.has(r.id))byId.set(r.id,r)});
    (Array.isArray(byTitle)?byTitle:[]).forEach(r=>{if(r?.id&&!byId.has(r.id))byId.set(r.id,r)});
    const list=[...byId.values()];
    const ql=q.toLowerCase();
    list.sort((a,b)=>{
      const as=String(a.slug||'').toLowerCase()===ql?0:String(a.zh?.title||'').includes(q)?1:2;
      const bs=String(b.slug||'').toLowerCase()===ql?0:String(b.zh?.title||'').includes(q)?1:2;
      return as-bs||String(a.zh?.title||'').localeCompare(String(b.zh?.title||''),'zh-Hans-CN');
    });
    return list;
  }

  async function fetchEntryBySlug(slug){
    await dbClient();
    const request=requireRequest();
    const row=await request(/** @type {any} */ (d)=>d.from('entries').select(ENTRY_SELECT).eq('slug',slug).maybeSingle());
    if(!row)throw Object.assign(new Error('找不到该条目'),{code:'ENTRY_NOT_FOUND',status:404});
    return row;
  }

  async function fetchRevisions(entryId){
    const request=requireRequest();
    const rows=await request(/** @type {any} */ (d)=>d.from('entry_revisions')
      .select('id,entry_id,editor_id,version,snapshot,note,created_at')
      .eq('entry_id',entryId)
      .order('version',{ascending:false})
      .limit(REVISION_LIMIT));
    const list=Array.isArray(rows)?rows:[];
    const editorIds=[...new Set(list.map(r=>r.editor_id).filter(Boolean))];
    /** @type {Map<string,string>} */
    const names=new Map();
    if(editorIds.length){
      try{
        const profiles=await request(/** @type {any} */ (d)=>d.from('profiles').select('id,display_name,role').in('id',editorIds));
        (Array.isArray(profiles)?profiles:[]).forEach(p=>{if(p?.id)names.set(p.id,p.display_name||p.id.slice(0,8));});
      }catch(_){/* display names are best-effort */}
    }
    return list.map(r=>({...r,editor_label:names.get(r.editor_id)||String(r.editor_id||'').slice(0,8)||'未知'}));
  }

  function buildSnapshot(row){
    return {
      id:row.id,
      slug:row.slug,
      category:row.category,
      zh:row.zh&&typeof row.zh==='object'?row.zh:{},
      en:row.en&&typeof row.en==='object'?row.en:{},
      ja:row.ja&&typeof row.ja==='object'?row.ja:{},
      sources:Array.isArray(row.sources)?row.sources:(row.sources??[]),
      status:row.status,
      version:row.version,
      updated_by:row.updated_by||null,
      updated_at:row.updated_at||null
    };
  }

  function mergeZh(existingZh,title,summary,content){
    const base=existingZh&&typeof existingZh==='object'&&!Array.isArray(existingZh)?{...existingZh}:{};
    base.title=title;
    base.summary=summary;
    base.content=content;
    return base;
  }

  /**
   * Save path: read row → INSERT revision (old snapshot) → UPDATE entries (merge zh, version+1).
   * Never touches sources column.
   */
  async function saveEntry(slug,/** @type {{title:string,summary:string,content:string,note?:string}} */ {title,summary,content,note}){
    const {user}=await dbClient();
    const request=requireRequest();
    const trimmedTitle=String(title||'').trim();
    if(!trimmedTitle)throw Object.assign(new Error('标题不能为空'),{code:'VALIDATION'});
    const cleanSummary=String(summary??'');
    const cleanContent=sanitizeBodyHtml(content||'');
    const current=await request(/** @type {any} */ (d)=>d.from('entries').select(ENTRY_SELECT).eq('slug',slug).maybeSingle());
    if(!current)throw Object.assign(new Error('找不到该条目'),{code:'ENTRY_NOT_FOUND',status:404});
    const oldVersion=Number(current.version)||1;
    const snapshot=buildSnapshot(current);
    await request(/** @type {any} */ (d)=>d.from('entry_revisions').insert({
      entry_id:current.id,
      editor_id:user.id,
      version:oldVersion,
      snapshot,
      note:note||'内容编辑保存前快照'
    }).select('id').maybeSingle());
    const nextZh=mergeZh(current.zh,trimmedTitle,cleanSummary,cleanContent);
    const updated=await request(/** @type {any} */ (d)=>d.from('entries').update({
      zh:nextZh,
      version:oldVersion+1,
      updated_by:user.id,
      updated_at:new Date().toISOString()
    }).eq('id',current.id).eq('version',oldVersion).select(ENTRY_SELECT).maybeSingle());
    if(!updated)throw Object.assign(new Error('保存冲突：条目版本已变更，请刷新后重试'),{code:'VERSION_CONFLICT'});
    return updated;
  }

  /**
   * Restore: snapshot current as revision, then write selected revision's zh title/summary/content.
   */
  async function restoreRevision(slug,revisionId){
    const {user}=await dbClient();
    const request=requireRequest();
    const current=await request(/** @type {any} */ (d)=>d.from('entries').select(ENTRY_SELECT).eq('slug',slug).maybeSingle());
    if(!current)throw Object.assign(new Error('找不到该条目'),{code:'ENTRY_NOT_FOUND',status:404});
    const rev=await request(/** @type {any} */ (d)=>d.from('entry_revisions').select('id,entry_id,version,snapshot,created_at').eq('id',revisionId).eq('entry_id',current.id).maybeSingle());
    if(!rev)throw Object.assign(new Error('找不到该历史版本'),{code:'REVISION_NOT_FOUND'});
    const snap=rev.snapshot&&typeof rev.snapshot==='object'?rev.snapshot:{};
    const snapZh=snap.zh&&typeof snap.zh==='object'?snap.zh:{};
    const title=String(snapZh.title||'').trim();
    if(!title)throw Object.assign(new Error('该历史版本缺少标题，无法恢复'),{code:'VALIDATION'});
    const summary=String(snapZh.summary??'');
    const content=sanitizeBodyHtml(snapZh.content||'');
    const oldVersion=Number(current.version)||1;
    await request(/** @type {any} */ (d)=>d.from('entry_revisions').insert({
      entry_id:current.id,
      editor_id:user.id,
      version:oldVersion,
      snapshot:buildSnapshot(current),
      note:`恢复至版本 ${rev.version} 前快照`
    }).select('id').maybeSingle());
    const nextZh=mergeZh(current.zh,title,summary,content);
    const updated=await request(/** @type {any} */ (d)=>d.from('entries').update({
      zh:nextZh,
      version:oldVersion+1,
      updated_by:user.id,
      updated_at:new Date().toISOString()
    }).eq('id',current.id).eq('version',oldVersion).select(ENTRY_SELECT).maybeSingle());
    if(!updated)throw Object.assign(new Error('恢复冲突：条目版本已变更，请刷新后重试'),{code:'VERSION_CONFLICT'});
    return updated;
  }

  function entryFrontUrl(slug){
    /* Site-relative path from museum/admin/ → /entry/?slug= */
    const raw=`../../entry/?slug=${encodeURIComponent(slug)}`;
    return safeHref(raw)||raw;
  }

  function formatTime(iso){
    if(!iso)return '—';
    try{
      const d=new Date(iso);
      if(Number.isNaN(d.getTime()))return String(iso);
      return d.toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false});
    }catch(_){return String(iso);}
  }

  function bindDashboard(root,data){
    root.querySelector('#curator-refresh')?.addEventListener('click',()=>init(root));
    const searchInput=/** @type {HTMLInputElement|null} */ (root.querySelector('#curator-entry-search'));
    const searchBtn=root.querySelector('#curator-entry-search-btn');
    const resultsEl=root.querySelector('#curator-entry-search-results');
    async function runSearch(){
      if(!resultsEl||!searchInput)return;
      const term=searchInput.value.trim();
      if(!term){resultsEl.innerHTML='<p class="curator-muted">请输入标题或 slug（例如：童宾 / tong-bin）</p>';return;}
      resultsEl.innerHTML='<p class="curator-muted">正在搜索……</p>';
      try{
        const rows=await searchEntries(term);
        if(!rows.length){
          resultsEl.innerHTML='<p class="curator-muted">没有匹配的知识条目。可换词或直接用 slug 查询。</p>';
          return;
        }
        resultsEl.innerHTML=rows.map(e=>`<button type="button" class="curator-entry-hit" data-slug="${esc(e.slug)}"><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.slug)}</span><span>${esc(e.category||'')}</span><span>${statusText(e.status)}</span></button>`).join('');
        resultsEl.querySelectorAll('.curator-entry-hit').forEach(btn=>{
          btn.addEventListener('click',()=>{
            const slug=btn.getAttribute('data-slug');
            if(slug)openEditor(root,slug);
          });
        });
      }catch(err){
        resultsEl.innerHTML=`<p class="curator-error-inline" role="alert">${esc(err?.message||'搜索失败')}</p>`;
      }
    }
    searchBtn?.addEventListener('click',()=>runSearch());
    searchInput?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runSearch();}});
    root.querySelectorAll('[data-edit-slug]').forEach(el=>{
      el.addEventListener('click',()=>{
        const slug=el.getAttribute('data-edit-slug');
        if(slug)openEditor(root,slug);
      });
    });
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
    const recentRows=(meta.domains?.entries?.ok?data.entries:[]).slice(0,30);
    const recentHtml=recentRows.map(e=>`<div class="curator-entry-row"><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.category||'')}</span><span>${statusText(e.status)}</span><span>${esc(e.confidence||'未审核')}</span><button type="button" class="curator-link-btn" data-edit-slug="${esc(e.slug)}">编辑</button></div>`).join('')||'<p>条目域未成功加载。</p>';

    root.innerHTML=`<div class="curator-console"><div class="curator-hero"><span>CURATOR CONSOLE · 馆长后台</span><h1>内容管理与质量检查</h1><p>后台只对管理员开放。可搜索并编辑知识条目的标题、简介与正文；保存时写入版本历史，且不改动既有来源。</p></div>
<section class="curator-section curator-content-mgmt"><div class="curator-head"><h2>内容管理</h2></div>
<p class="curator-hint">按标题或 slug 搜索（例如「童宾」或 <code>tong-bin</code>）。搜索走独立查询，不依赖上方最近条目截断列表。</p>
<div class="curator-search-bar"><input id="curator-entry-search" type="search" placeholder="搜索标题或 slug…" autocomplete="off"><button type="button" id="curator-entry-search-btn">搜索</button></div>
<div id="curator-entry-search-results" class="curator-search-results" aria-live="polite"></div>
<div class="curator-head" style="margin-top:18px"><h3>最近条目</h3></div>
<div class="curator-table curator-entry-table">${recentHtml}</div>
</section>
${banner}<div class="curator-stats"><div><b>${loaded.entries}</b><span>已加载条目${meta.domains?.entries?.truncated?'（截断）':''}</span></div><div><b>${loaded.media}</b><span>已加载媒体${meta.domains?.media?.truncated?'（截断）':''}</span></div><div><b>${loaded.sources}</b><span>已解析来源</span></div><div><b>${issues.length}</b><span>待处理问题</span></div></div>
<section class="curator-section"><div class="curator-head"><h2>加载域状态</h2></div><div class="curator-domain-grid">${domainBadge('entries',meta.domains?.entries)}${domainBadge('media',meta.domains?.media)}${domainBadge('sources',meta.domains?.sources)}</div></section>
<section class="curator-section"><div class="curator-head"><h2>数据质量</h2><button type="button" id="curator-refresh">重新检查</button></div><p class="curator-check-status">检查结论：<b>${esc(conclusionLabel)}</b>${check.incomplete?' · status=truncated/incomplete':''}</p><div class="curator-check-grid"><div><strong>${count('entry')}</strong><span>内容问题</span></div><div><strong>${count('media')}</strong><span>媒体问题</span></div><div><strong>${count('source')}</strong><span>来源问题</span></div><div><strong>${count('review')}</strong><span>审核问题</span></div></div><div class="curator-issues">${issuesHtml}</div></section>
<section class="curator-section"><div class="curator-head"><h2>最近媒体</h2></div><div class="curator-table">${(meta.domains?.media?.ok?data.media:[]).slice(0,30).map(m=>`<div><b>${esc(m.title||'未命名图片')}</b><span>${esc(m.source||'')}</span><span>${mediaState(m.verification_status)}</span><span>${m.is_primary?'主图':'媒体'}</span></div>`).join('')||'<p>媒体域未成功加载。</p>'}</div></section></div>`;
    bindDashboard(root,data);
  }

  function execCmd(cmd,value){
    try{document.execCommand(cmd,false,value??undefined);}catch(_){/* contenteditable fallback */}
  }

  async function openEditor(root,slug){
    if(ui.dirty&&!confirm('有未保存的更改，确定离开？'))return;
    ui.view='editor';ui.editSlug=slug;ui.dirty=false;
    root.innerHTML='<div class="curator-loading">正在读取条目……</div>';
    try{
      const entry=await fetchEntryBySlug(slug);
      const revisions=await fetchRevisions(entry.id);
      renderEditor(root,entry,revisions,null);
    }catch(err){
      root.innerHTML=`<div class="curator-error" role="alert"><h2>${esc(err?.message||'加载失败')}</h2><button type="button" id="curator-back-dash">返回内容管理</button></div>`;
      root.querySelector('#curator-back-dash')?.addEventListener('click',()=>{ui.dirty=false;init(root);});
    }
  }

  /**
   * @param {HTMLElement} root
   * @param {any} entry
   * @param {any[]} revisions
   * @param {string|null} flash
   */
  function renderEditor(root,entry,revisions,flash){
    const zh=entry.zh&&typeof entry.zh==='object'?entry.zh:{};
    const title=String(zh.title||'');
    const summary=String(zh.summary||'');
    const contentHtml=sanitizeBodyHtml(zh.content||'');
    const sourcesCount=Array.isArray(entry.sources)?entry.sources.length:0;
    const frontHref=entryFrontUrl(entry.slug);
    const revHtml=revisions.length?revisions.map(r=>`<div class="curator-rev-row"><span>v${esc(String(r.version))}</span><span>${esc(formatTime(r.created_at))}</span><span>${esc(r.editor_label||'')}</span><button type="button" class="curator-link-btn" data-restore-id="${esc(r.id)}">恢复此版</button></div>`).join(''):'<p class="curator-muted">暂无历史版本。</p>';

    root.innerHTML=`<div class="curator-console curator-editor">
<div class="curator-editor-top">
  <button type="button" class="curator-ghost-btn" id="curator-back">← 返回内容管理</button>
  <div class="curator-editor-meta"><span>slug · <code>${esc(entry.slug)}</code></span><span>category · ${esc(entry.category||'')}</span><span>status · ${statusText(entry.status)}</span><span>version · v${esc(String(entry.version))}</span></div>
  <div class="curator-editor-actions">
    <a class="curator-ghost-btn" href="${frontHref}" target="_blank" rel="noopener noreferrer">在前台打开</a>
    <button type="button" class="curator-primary-btn" id="curator-save">保存</button>
  </div>
</div>
${flash?`<div class="curator-flash" role="status">${esc(flash)}</div>`:''}
<div class="curator-governance" role="note">
  <strong>表述分层提示</strong>
  <ul>
    <li><b>史实</b>：有可核对来源支撑的陈述，写清依据范围。</li>
    <li><b>研究观点</b>：学界解释或归纳，避免写成唯一定论。</li>
    <li><b>尚存争议</b>：并列呈现不同说法，默认不写成已决事实。</li>
  </ul>
  <p>本页仅编辑标题 / 简介 / 正文。来源、关系、媒体与多语言不在本阶段修改；保存后仍沿用条目既有 sources（当前 ${sourcesCount} 条）。</p>
</div>
<section class="curator-section">
  <label class="curator-field"><span>标题</span><input id="curator-field-title" type="text" required maxlength="200" value="${esc(title)}"></label>
  <label class="curator-field"><span>简介</span><textarea id="curator-field-summary" rows="4" maxlength="4000">${esc(summary)}</textarea></label>
  <div class="curator-field"><span>正文（富文本）</span>
    <div class="curator-rte-toolbar" role="toolbar" aria-label="正文格式">
      <button type="button" data-cmd="formatBlock" data-value="p">段落</button>
      <button type="button" data-cmd="formatBlock" data-value="h2">标题 H2</button>
      <button type="button" data-cmd="formatBlock" data-value="h3">标题 H3</button>
      <button type="button" data-cmd="bold"><b>粗体</b></button>
      <button type="button" data-cmd="italic"><i>斜体</i></button>
      <button type="button" data-cmd="insertUnorderedList">列表</button>
      <button type="button" data-cmd="createLink">链接</button>
    </div>
    <div id="curator-field-content" class="curator-rte" contenteditable="true" role="textbox" aria-multiline="true"></div>
  </div>
  <p id="curator-save-msg" class="curator-save-msg" aria-live="polite"></p>
</section>
<section class="curator-section">
  <div class="curator-head"><h2>版本历史</h2><span class="curator-muted">当前 v${esc(String(entry.version))} · 更新于 ${esc(formatTime(entry.updated_at))}</span></div>
  <div class="curator-rev-list">${revHtml}</div>
</section>
</div>`;

    const contentEl=/** @type {HTMLElement|null} */ (root.querySelector('#curator-field-content'));
    if(contentEl)contentEl.innerHTML=contentHtml||'<p></p>';

    const markDirty=()=>{ui.dirty=true;};
    root.querySelector('#curator-field-title')?.addEventListener('input',markDirty);
    root.querySelector('#curator-field-summary')?.addEventListener('input',markDirty);
    contentEl?.addEventListener('input',markDirty);

    root.querySelectorAll('.curator-rte-toolbar [data-cmd]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();
        const cmd=btn.getAttribute('data-cmd')||'';
        let value=btn.getAttribute('data-value')||undefined;
        if(cmd==='formatBlock'&&value)value=`<${value}>`;
        if(cmd==='createLink'){
          const url=prompt('链接 URL（仅 https）','https://');
          if(!url)return;
          const href=safeHref(url);
          if(!href){alert('链接无效或不被允许');return;}
          execCmd('createLink',href);
        }else execCmd(cmd,value);
        markDirty();
        contentEl?.focus();
      });
    });

    root.querySelector('#curator-back')?.addEventListener('click',()=>{
      if(ui.dirty&&!confirm('有未保存的更改，确定离开？'))return;
      ui.dirty=false;ui.view='dashboard';ui.editSlug=null;init(root);
    });

    root.querySelector('#curator-save')?.addEventListener('click',async()=>{
      if(ui.saving)return;
      const msg=root.querySelector('#curator-save-msg');
      const titleEl=/** @type {HTMLInputElement|null} */ (root.querySelector('#curator-field-title'));
      const summaryEl=/** @type {HTMLTextAreaElement|null} */ (root.querySelector('#curator-field-summary'));
      const saveBtn=/** @type {HTMLButtonElement|null} */ (root.querySelector('#curator-save'));
      const nextTitle=titleEl?.value||'';
      const nextSummary=summaryEl?.value||'';
      const nextContent=contentEl?.innerHTML||'';
      ui.saving=true;
      if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='保存中…';}
      if(msg)msg.textContent='正在保存……';
      try{
        const updated=await saveEntry(entry.slug,{title:nextTitle,summary:nextSummary,content:nextContent});
        ui.dirty=false;
        const revs=await fetchRevisions(updated.id);
        renderEditor(root,updated,revs,'已保存，并已写入版本历史；来源未改，仍沿用既有 sources。');
      }catch(err){
        if(msg)msg.textContent=err?.message||'保存失败';
        if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='保存';}
      }finally{
        ui.saving=false;
      }
    });

    root.querySelectorAll('[data-restore-id]').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const id=btn.getAttribute('data-restore-id');
        if(!id)return;
        if(ui.dirty&&!confirm('当前有未保存更改，恢复将丢弃这些更改。继续？'))return;
        if(!confirm('确认恢复到该历史版本？将写回标题/简介/正文，并再记一条版本记录。来源不会被修改。'))return;
        root.innerHTML='<div class="curator-loading">正在恢复版本……</div>';
        try{
          const updated=await restoreRevision(entry.slug,id);
          ui.dirty=false;
          const revs=await fetchRevisions(updated.id);
          renderEditor(root,updated,revs,'已恢复所选版本，并已写入版本历史；来源未改，仍沿用既有 sources。');
        }catch(err){
          root.innerHTML=`<div class="curator-error" role="alert"><h2>${esc(err?.message||'恢复失败')}</h2><button type="button" id="curator-back-edit">返回编辑</button></div>`;
          root.querySelector('#curator-back-edit')?.addEventListener('click',()=>openEditor(root,entry.slug));
        }
      });
    });

    window.onbeforeunload=ui.dirty?()=>'':null;
  }

  let initSeq=0;
  async function init(root){
    const seq=++initSeq;
    ui.view='dashboard';ui.editSlug=null;
    root.innerHTML='<div class="curator-loading">正在读取馆藏数据……</div>';
    try{
      const data=await load();
      if(seq!==initSeq)return;
      render(root,data);
    }catch(err){
      if(seq!==initSeq)return;
      const code=esc(err?.code||err?.status||'UNKNOWN');
      if(err?.code==='AUTH_REQUIRED'||err?.status===401){
        root.innerHTML='';
        return;
      }
      if(err?.code==='AUTH_FORBIDDEN'||err?.status===403){
        root.innerHTML='';
        return;
      }
      root.innerHTML=`<div class="curator-error" role="alert"><h2>${esc(err.message||'后台加载失败')}</h2><p>错误代码：${code}</p><button type="button" id="curator-auth-retry">重新检查</button></div>`;
      root.querySelector('#curator-auth-retry')?.addEventListener('click',()=>init(root));
    }
  }

  function boot(){
    const root=document.getElementById('curator-root');
    if(!root)return;
    let started=false;
    const start=()=>{if(started)return;started=true;init(root);};
    window.addEventListener('jdm:auth',event=>{
      const detail=event instanceof CustomEvent?event.detail:null;
      if(detail?.event==='SIGNED_OUT'){
        ui.dirty=false;started=false;
        root.innerHTML='<div class="curator-error" role="alert"><h2>登录状态已失效</h2><p>请重新登录后再使用馆长后台。</p></div>';
      }
    });
    window.addEventListener('jdm:curator-gate',event=>{
      const detail=event instanceof CustomEvent?event.detail:null;
      if(detail?.ok)start();
      else {started=false;root.innerHTML='';}
    });
    /* Fallback when auth gate is unavailable or event already fired before listener. */
    setTimeout(async()=>{
      if(started)return;
      try{
        const client=window.JDM_AUTH?.getClient?.()||(window.JDM_RUNTIME_CONFIG&&window.supabase?.createClient?.(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey));
        if(!client){root.innerHTML='';return;}
        const {data:{user}}=await client.auth.getUser();
        if(!user){root.innerHTML='';return;}
        const request=window.JDM_AUTH?.request;
        let role=null;
        if(request){
          const profile=await request(/** @type {any} */ (d)=>d.from('profiles').select('role').eq('id',user.id).maybeSingle());
          role=profile?.role||null;
        }
        if(role==='admin')start();
        else root.innerHTML='';
      }catch(_){root.innerHTML='';}
    },120);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
