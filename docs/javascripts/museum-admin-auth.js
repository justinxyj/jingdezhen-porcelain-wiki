/* Admin auth gate for the curator console. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  async function boot(){
    const root=document.getElementById('curator-auth-root');if(!root||!window.supabase||!window.JDM_RUNTIME_CONFIG)return;
    const db=window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    const {data:{user}}=await db.auth.getUser();
    if(user){const {data:p}=await db.from('profiles').select('role,display_name').eq('id',user.id).maybeSingle();if(p?.role==='admin'){root.innerHTML='<div class="curator-auth-ok">已验证馆长身份，正在载入后台……</div>';return;}}
    root.innerHTML='<form class="curator-login"><span>CURATOR ACCESS</span><h2>馆长登录</h2><p>仅管理员可以进入。公开访客不需要账号。</p><label>邮箱<input id="curator-email" type="email" autocomplete="username" required></label><label>密码<input id="curator-password" type="password" autocomplete="current-password" required></label><button type="submit">登录</button><div class="curator-login-msg" aria-live="polite"></div></form>';
    root.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const msg=root.querySelector('.curator-login-msg');msg.textContent='正在验证……';const {error}=await db.auth.signInWithPassword({email:root.querySelector('#curator-email').value,password:root.querySelector('#curator-password').value});if(error){msg.textContent=error.message;return}location.reload()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
