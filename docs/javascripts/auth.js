/* Supabase auth/editor bridge. Fill config in this file after creating a Supabase project. */
const JDM_SUPABASE_URL='';
const JDM_SUPABASE_ANON_KEY='';
let jdmClient=null;
function authReady(){return !!(JDM_SUPABASE_URL&&JDM_SUPABASE_ANON_KEY&&window.supabase)}
async function initAuth(){
 const box=document.querySelector('[data-auth]');
 if(!box)return;
 if(!authReady()){box.innerHTML='<div class="notice"><b>账户系统待连接</b><br>前端已经准备好注册、登录、退出与编辑流程。要启用真实账户，请在 <code>docs/javascripts/auth.js</code> 填入 Supabase Project URL 与 anon key，并执行项目中的数据库 SQL。</div>';return;}
 jdmClient=window.supabase.createClient(JDM_SUPABASE_URL,JDM_SUPABASE_ANON_KEY);
 await renderAuth(box);
 jdmClient.auth.onAuthStateChange(()=>renderAuth(box));
}
async function renderAuth(box){
 const {data:{session}}=await jdmClient.auth.getSession();
 if(session){box.innerHTML=`<div class="notice">已登录：<b>${session.user.email||'用户'}</b></div><button class="md-button" id="logout">退出登录</button>`;document.getElementById('logout').onclick=()=>jdmClient.auth.signOut();return;}
 box.innerHTML=`<div class="editor-form"><label>邮箱<input id="auth-email" type="email" placeholder="name@example.com"></label><label>密码<input id="auth-password" type="password" placeholder="至少 6 位"></label><div><button class="md-button md-button--primary" id="login">登录</button> <button class="md-button" id="signup">注册</button></div><div id="auth-msg"></div></div>`;
 const email=()=>document.getElementById('auth-email').value.trim(),pw=()=>document.getElementById('auth-password').value;
 document.getElementById('login').onclick=async()=>{const r=await jdmClient.auth.signInWithPassword({email:email(),password:pw()});document.getElementById('auth-msg').textContent=r.error?r.error.message:'登录成功';await renderAuth(box)};
 document.getElementById('signup').onclick=async()=>{const r=await jdmClient.auth.signUp({email:email(),password:pw()});document.getElementById('auth-msg').textContent=r.error?r.error.message:'注册成功，请检查邮箱完成验证。'};
}
async function initEditor(){
 const form=document.querySelector('#editor-form');if(!form)return;
 if(!authReady()){document.querySelector('#editor-status').innerHTML='<div class="notice">编辑器 UI 已上线，但真实保存功能需要先连接 Supabase。</div>';return;}
 jdmClient=window.supabase.createClient(JDM_SUPABASE_URL,JDM_SUPABASE_ANON_KEY);const {data:{session}}=await jdmClient.auth.getSession();
 if(!session){document.querySelector('#editor-status').innerHTML='<div class="notice">请先登录，再提交编辑。</div>';form.style.display='none';return;}
 form.onsubmit=async e=>{e.preventDefault();const payload={title:form.title.value,category:form.category.value,content:form.content.value,status:'pending',author_id:session.user.id};const r=await jdmClient.from('edits').insert(payload);document.querySelector('#editor-status').textContent=r.error?r.error.message:'提交成功：已进入待审核队列。';form.reset()};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initAuth();initEditor()});else{initAuth();initEditor()}
