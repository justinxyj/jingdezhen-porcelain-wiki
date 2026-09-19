/* Museum Curator Console: authenticated editorial dashboard. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const statusText=(v)=>({published:'已发布',draft:'草稿',archived:'已归档'}[v]||v||'未设置');
  const mediaState=(v)=>({verified:'已核验',unreviewed:'待核验',rejected:'已拒绝',expired:'已过期'}[v]||v||'未设置');
  async function dbClient(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))throw new Error('Supabase 配置不可用');
    const db=window.JDM_AUTH?.getClient?.()||window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    const {data:{user}}=await db.auth.getUser();
    if(!user)throw Object.assign(new Error('馆长后台需要登录，请重新登录'),{code:'AUTH_REQUIRED',status:401});
    const {data:profile,error}=await (window.JDM_AUTH?.request
      ? window.JDM_AUTH.request(d=>d.from('profiles').select('role').eq('id',user.id).maybeSingle())
      : db.from('profiles').select('role').eq('id',user.id).maybeSingle());
    if(error)throw error;
    if(profile?.role!=='admin')throw Object.assign(new Error('当前账号没有馆长后台权限'),{code:'AUTH_FORBIDDEN',status:403});
    return db;
  }
  async function load(){
    const db=await dbClient();
    const request=window.JDM_AUTH?.request;
    if(!request)throw Object.assign(new Error('统一认证请求层不可用，请刷新页面后重试'),{code:'JDM_AUTH_MISSING'});
    const [entries,media]=await Promise.all([
      request(d=>d.from('entries').select('id,slug,category,zh,status,updated_at').order('updated_at',{ascending:false}).limit(250)),
      request(d=>d.from('media').select('id,entry_id,path,title,source,license,status,review_state,is_primary,verified_at').order('created_at',{ascending:false}).limit(500))
    ]);
    const normalizedEntries=(entries||[]).map(e=>({...e,confidence:e.zh?.meta?.confidence||null,editorial_status:e.zh?.meta?.editorial_status||e.status,reviewed_at:e.zh?.meta?.reviewed_at||null}));
    const normalizedMedia=(media||[]).map(m=>({...m,verification_status:m.review_state,reviewed_at:m.verified_at||null}));
    const sources=[];
    normalizedEntries.forEach(e=>(Array.isArray(e.sources)?e.sources:e.sources?[]:[]));
    normalizedEntries.forEach(e=>{
      (Array.isArray(e.zh?.sources)?e.zh.sources:Array.isArray(e.sources)?e.sources:[]).forEach((s,i)=>{
        if(s&&typeof s==='object')sources.push({id:`${e.id}:${i}`,title:s.label||s.title||'未命名来源',url:s.url||'',tier:s.tier||null,status:s.status||'published',institution:s.institution||'',last_checked_at:s.last_checked_at||null});
      });
    });
    return {entries:normalizedEntries,media:normalizedMedia,sources};
  }
  function checks({entries,media,sources}){
    const mediaByEntry=new Map();media.forEach(m=>{if(!mediaByEntry.has(m.entry_id))mediaByEntry.set(m.entry_id,[]);mediaByEntry.get(m.entry_id).push(m)});
    const issues=[];
    entries.forEach(e=>{
      if(!e.zh?.title)issues.push(['entry','缺少标题',e.slug]);
      if(!String(e.zh?.content||'').trim())issues.push(['entry','缺少正文',e.slug]);
      if(!String(e.zh?.summary||'').trim())issues.push(['entry','缺少简介',e.slug]);
      if(e.confidence==='unreviewed')issues.push(['review','尚未标注可信度',e.slug]);
      if(!mediaByEntry.has(e.id))issues.push(['media','没有公开媒体',e.slug]);
    });
    media.forEach(m=>{
      if(!String(m.path||'').trim())issues.push(['media','图片路径为空',m.id]);
      if(m.review_state!=='verified')issues.push(['media',`图片状态：${mediaState(m.review_state)}`,m.title||m.id]);
    });
    sources.forEach(s=>{
      if(!String(s.title||'').trim())issues.push(['source','来源缺少标题',s.id]);
      if(!String(s.url||'').trim())issues.push(['source','来源缺少URL',s.title||s.id]);
    });
    return issues;
  }
  function render(root,data){
    const issues=checks(data),count=k=>issues.filter(x=>x[0]===k).length;
    root.innerHTML=`<div class="curator-console"><div class="curator-hero"><span>CURATOR CONSOLE · 馆长后台</span><h1>内容、图片、来源，一处检查。</h1><p>后台只对管理员开放，用于审核公开知识库的数据完整性与来源质量。</p></div><div class="curator-stats"><div><b>${data.entries.length}</b><span>公开条目</span></div><div><b>${data.media.length}</b><span>媒体记录</span></div><div><b>${data.sources.length}</b><span>来源记录</span></div><div><b>${issues.length}</b><span>待处理问题</span></div></div><section class="curator-section"><div class="curator-head"><h2>数据质量</h2><button id="curator-refresh">重新检查</button></div><div class="curator-check-grid"><div><strong>${count('entry')}</strong><span>内容问题</span></div><div><strong>${count('media')}</strong><span>媒体问题</span></div><div><strong>${count('source')}</strong><span>来源问题</span></div><div><strong>${count('review')}</strong><span>审核问题</span></div></div><div class="curator-issues">${issues.slice(0,100).map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join('')||'<p>基础检查通过，没有发现当前规则覆盖的问题。</p>'}</div></section><section class="curator-section"><div class="curator-head"><h2>最近条目</h2></div><div class="curator-table">${data.entries.slice(0,30).map(e=>`<div><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.category||'')}</span><span>${statusText(e.status)}</span><span>${esc(e.confidence||'未审核')}</span></div>`).join('')}</div></section><section class="curator-section"><div class="curator-head"><h2>最近媒体</h2></div><div class="curator-table">${data.media.slice(0,30).map(m=>`<div><b>${esc(m.title||'未命名图片')}</b><span>${esc(m.source||'')}</span><span>${mediaState(m.verification_status)}</span><span>${m.is_primary?'主图':'媒体'}</span></div>`).join('')}</div></section></div>`;
    root.querySelector('#curator-refresh').onclick=()=>init(root);
  }
  let initSeq=0;
  async function init(root){const seq=++initSeq;root.innerHTML='<div class="curator-loading">正在读取馆藏数据……</div>';try{const data=await load();if(seq!==initSeq)return;render(root,data)}catch(err){const code=esc(err?.code||err?.status||'UNKNOWN');root.innerHTML=`<div class="curator-error" role="alert"><h2>${esc(err.message||'后台加载失败')}</h2><p>错误代码：${code}</p><button type="button" id="curator-auth-retry">重新检查</button></div>`;root.querySelector('#curator-auth-retry')?.addEventListener('click',()=>init(root))}}
  function boot(){const root=document.getElementById('curator-root');if(!root)return;window.addEventListener('jdm:auth',event=>{const detail=event instanceof CustomEvent?event.detail:null;if(detail?.event==='SIGNED_OUT')root.innerHTML='<div class="curator-error" role="alert"><h2>登录状态已失效</h2><p>请重新登录后再使用馆长后台。</p></div>'});init(root)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
