/* Museum Curator Console: private/editorial surface. Public navigation never exposes this page. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const statusText=(v)=>({published:'已发布',draft:'草稿',archived:'已归档'}[v]||v||'未设置');
  const mediaState=(v)=>({verified:'已核验',unreviewed:'待核验',rejected:'已拒绝',expired:'已过期'}[v]||v||'未设置');
  async function getDb(){
    if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))throw new Error('Supabase 配置不可用');
    return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
  }
  async function load(){
    const db=await getDb();
    const [{data:entries,error:ee},{data:media,error:me},{data:sources,error:se}]=await Promise.all([
      db.from('entries').select('id,slug,category,zh,status,confidence,editorial_status,reviewed_at').order('updated_at',{ascending:false}),
      db.from('media').select('id,entry_id,path,title,source,license,status,verification_status,is_primary').order('created_at',{ascending:false}),
      db.from('sources').select('id,title,url,tier,status,institution,last_checked_at').order('updated_at',{ascending:false})
    ]);
    if(ee)throw ee;if(me)throw me;if(se)throw se;
    return {db,entries:entries||[],media:media||[],sources:sources||[]};
  }
  function checks(data){
    const {entries,media,sources}=data;
    const mediaByEntry=new Map();media.forEach(m=>{if(!mediaByEntry.has(m.entry_id))mediaByEntry.set(m.entry_id,[]);mediaByEntry.get(m.entry_id).push(m)});
    const issues=[];
    entries.forEach(e=>{
      const title=e.zh?.title||e.slug;
      const body=e.zh?.content||'';
      const summary=e.zh?.summary||'';
      if(!title)issues.push(['entry','缺少标题',e.slug]);
      if(!body)issues.push(['entry','缺少正文',e.slug]);
      if(!summary)issues.push(['entry','缺少简介',e.slug]);
      if(!e.confidence||e.confidence==='unreviewed')issues.push(['review','尚未标注可信度',e.slug]);
      if(!mediaByEntry.has(e.id))issues.push(['media','没有经过审核的图片',e.slug]);
    });
    media.forEach(m=>{if(!m.path)issues.push(['media','图片路径为空',m.id]);if(m.verification_status!=='verified')issues.push(['media',`图片状态：${mediaState(m.verification_status)}`,m.title||m.id])});
    sources.forEach(s=>{if(!s.title)issues.push(['source','来源缺少标题',s.id]);if(!s.url)issues.push(['source','来源缺少URL',s.title||s.id]);if(!s.last_checked_at)issues.push(['source','来源尚未检查',s.title||s.id])});
    return issues;
  }
  function render(root,data){
    const issues=checks(data),count=(kind)=>issues.filter(x=>x[0]===kind).length;
    root.innerHTML=`<div class="curator-console"><div class="curator-hero"><div><span>CURATOR CONSOLE · 馆长后台</span><h1>让每一条知识，都经得起追溯。</h1><p>内容、图片、来源与证据统一管理。此页面仅供编辑与审核使用。</p></div></div><div class="curator-stats"><div><b>${data.entries.length}</b><span>条目</span></div><div><b>${data.media.length}</b><span>媒体</span></div><div><b>${data.sources.length}</b><span>来源</span></div><div><b>${issues.length}</b><span>待处理问题</span></div></div><section class="curator-section"><div class="curator-head"><h2>数据质量</h2><button id="curator-refresh">重新检查</button></div><div class="curator-check-grid"><div><strong>${count('entry')}</strong><span>内容问题</span></div><div><strong>${count('media')}</strong><span>图片问题</span></div><div><strong>${count('source')}</strong><span>来源问题</span></div><div><strong>${count('review')}</strong><span>审核问题</span></div></div><div class="curator-issues">${issues.slice(0,80).map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join('')||'<p>当前没有发现基础数据质量问题。</p>'}</div></section><section class="curator-section"><div class="curator-head"><h2>最近条目</h2></div><div class="curator-table">${data.entries.slice(0,25).map(e=>`<div><b>${esc(e.zh?.title||e.slug)}</b><span>${esc(e.category||'')}</span><span>${statusText(e.status)}</span><span>${esc(e.confidence||'未审核')}</span></div>`).join('')}</div></section><section class="curator-section"><div class="curator-head"><h2>最近媒体</h2></div><div class="curator-table">${data.media.slice(0,25).map(m=>`<div><b>${esc(m.title||'未命名图片')}</b><span>${esc(m.source||'')}</span><span>${mediaState(m.verification_status)}</span><span>${m.is_primary?'主图':'关联媒体'}</span></div>`).join('')}</div></section></div>`;
    root.querySelector('#curator-refresh').onclick=()=>init(root);
  }
  async function init(root){root.innerHTML='<div class="curator-loading">正在读取馆藏数据……</div>';try{render(root,await load())}catch(err){root.innerHTML=`<div class="curator-error">${esc(err.message||'后台加载失败')}</div>`}}
  function boot(){const root=document.getElementById('curator-root');if(root)init(root)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
