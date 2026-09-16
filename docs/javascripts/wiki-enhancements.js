(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const qs=s=>document.querySelector(s);
  const escape=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function entryUrl(slug){return ROOT+'entry/?type=entry&slug='+encodeURIComponent(slug)}
  function editorUrl(slug){return ROOT+'editor/?slug='+encodeURIComponent(slug)}
  async function db(){if(!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase))return null;return window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey)}
  async function enhanceEntry(){
    const root=qs('#wiki-entry-root'); if(!root)return;
    const slug=new URLSearchParams(location.search).get('slug'); if(!slug)return;
    const client=await db(); if(!client)return;
    const {data}=await client.from('entries').select('slug,zh,sources,category,version,updated_at').eq('slug',slug).maybeSingle();
    if(!data)return;
    const body=qs('.wiki-entry-body'); if(!body)return;
    const old=qs('.wiki-source-panel'); if(old)old.remove();
    const refs=Array.isArray(data.sources)?data.sources:[];
    const panel=document.createElement('section');panel.className='wiki-source-panel';
    panel.innerHTML='<h2>来源与核验</h2>'+(refs.length?'<div class="wiki-source-list">'+refs.map(r=>`<a href="${ROOT}research/sources/#${escape(r)}"><span>${escape(r)}</span><b>打开文献记录 →</b></a>`).join('')+'</div>':'<div class="notice">这个条目暂未绑定结构化文献编号。欢迎编辑者补充来源。</div>');
    const related=body.querySelector('.wiki-related');body.insertBefore(panel,related||null);
    const action=qs('.wiki-actions a');if(action){action.href=editorUrl(data.slug);action.textContent='✎ 编辑本条目'}
  }
  function enhanceStaticLinks(){
    document.querySelectorAll('.md-content__inner a[href]').forEach(a=>{if(a.dataset.wikiEnhanced)return;const href=a.getAttribute('href')||'';if(/^https?:\/\//i.test(href)||href.startsWith('#')||a.closest('.wiki-chrome,.wiki-entry,.wechat-editor'))return;a.dataset.wikiEnhanced='1'});
  }
  function boot(){enhanceEntry();enhanceStaticLinks();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
