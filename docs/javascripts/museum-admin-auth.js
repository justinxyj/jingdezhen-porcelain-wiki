/* Admin auth gate for the curator console. */
(function(){
  const esc=s=>window.JDM_SAFE?.esc?.(s)??window.JDM_AUTH?.esc?.(s)??String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  function clearCurator(){
    const curator=document.getElementById('curator-root');
    if(curator)curator.innerHTML='';
  }
  function renderRejection(root,message){
    clearCurator();
    root.innerHTML=`<div class="curator-auth-denied" role="alert"><span>CURATOR ACCESS</span><h2>当前账号无馆长权限</h2><p>${esc(message||'仅管理员可以进入馆长后台。公开访客不需要账号。')}</p><p><a class="curator-auth-home" href="../">返回前台</a></p></div>`;
  }
  async function boot(){
    const root=document.getElementById('curator-auth-root');
    if(!root)return;
    if(!window.supabase||!window.JDM_RUNTIME_CONFIG){
      root.innerHTML=`<div class="curator-error" role="alert"><h2>认证配置不可用</h2><p>请稍后刷新重试。</p></div>`;
      clearCurator();
      return;
    }
    let db;
    try{
      db=window.JDM_AUTH?.getClient?.()||window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    }catch(_){
      root.innerHTML=`<div class="curator-error" role="alert"><h2>认证配置不可用</h2><p>请稍后刷新重试。</p></div>`;
      clearCurator();
      return;
    }
    const {data:{user}}=await db.auth.getUser();
    if(user){
      let profile=null;
      try{
        if(window.JDM_AUTH?.request){
          profile=await window.JDM_AUTH.request(/** @type {any} */ (d)=>d.from('profiles').select('role,display_name').eq('id',user.id).maybeSingle());
        }else{
          const res=await db.from('profiles').select('role,display_name').eq('id',user.id).maybeSingle();
          profile=res.data;
        }
      }catch(err){
        const code=err?.code||err?.status||'';
        if(code==='AUTH_EXPIRED'||code===401||err?.status===401){
          /* fall through to login */
        }else{
          renderRejection(root,err?.message||'无法验证馆长身份，请重新登录。');
          return;
        }
        profile=null;
      }
      if(profile?.role==='admin'){
        root.innerHTML='<div class="curator-auth-ok" hidden>已验证馆长身份</div>';
        window.dispatchEvent(new CustomEvent('jdm:curator-gate',{detail:{ok:true,user,profile}}));
        return;
      }
      if(user && profile && profile.role!=='admin'){
        renderRejection(root,'当前账号已登录，但角色不是 admin，无法使用馆长后台。');
        window.dispatchEvent(new CustomEvent('jdm:curator-gate',{detail:{ok:false,reason:'forbidden'}}));
        return;
      }
      if(user && !profile){
        renderRejection(root,'当前账号没有馆长档案，无法进入后台。');
        window.dispatchEvent(new CustomEvent('jdm:curator-gate',{detail:{ok:false,reason:'no_profile'}}));
        return;
      }
    }
    clearCurator();
    root.innerHTML='<form class="curator-login"><span>CURATOR ACCESS</span><h2>馆长登录</h2><p>仅管理员可以进入。公开访客不需要账号。</p><label>邮箱<input id="curator-email" type="email" autocomplete="username" required></label><label>密码<input id="curator-password" type="password" autocomplete="current-password" required></label><button type="submit">登录</button><div class="curator-login-msg" aria-live="polite"></div></form>';
    window.dispatchEvent(new CustomEvent('jdm:curator-gate',{detail:{ok:false,reason:'auth_required'}}));
    root.querySelector('form')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const msg=root.querySelector('.curator-login-msg');
      if(msg)msg.textContent='正在验证……';
      const email=/** @type {HTMLInputElement|null} */ (root.querySelector('#curator-email'))?.value||'';
      const password=/** @type {HTMLInputElement|null} */ (root.querySelector('#curator-password'))?.value||'';
      const {error}=await db.auth.signInWithPassword({email,password});
      if(error){if(msg)msg.textContent=error.message;return;}
      location.reload();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
