/* Shared Supabase client and authentication lifecycle.
   Public pages never redirect on auth errors; protected surfaces can render a clear re-auth state. */
(function(){
  let client=null;
  let authSubscription=null;
  let refreshPromise=null;
  let authState={status:'unknown',session:null,user:null,lastEvent:null};

  function normalizeError(error){
    if(!error)return null;
    const e=error instanceof Error?error:new Error(String(error.message||error));
    e.status=Number(error.status||error.statusCode||0)||0;
    e.code=error.code||e.code||(e.status===401?'AUTH_EXPIRED':e.status===403?'AUTH_FORBIDDEN':'JDM_REQUEST_ERROR');
    if(e.code==='PGRST301'&&!e.status)e.status=401;
    e.kind=(e.status===401||e.code==='PGRST301'||e.code==='AUTH_EXPIRED')?'auth':e.status===403?'forbidden':e.name==='AbortError'?'timeout':(e.message||'').toLowerCase().includes('network')?'network':'server';
    return e;
  }
  function esc(s){
    return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function safeHref(raw,{allowHttp=false}={}){
    const value=String(raw??'').trim();
    if(!value)return '';
    try{
      const base=window.location?.href||'https://localhost/';
      const url=new URL(value,base);
      const protocol=url.protocol.toLowerCase();
      const sameOrigin=url.origin===window.location.origin;
      if(protocol==='javascript:'||protocol==='data:'||protocol==='vbscript:'||protocol==='file:'||protocol==='blob:')return '';
      if(sameOrigin&&(protocol==='http:'||protocol==='https:'))return url.href;
      if(protocol==='https:')return url.href;
      if(protocol==='http:'&&allowHttp)return url.href;
    }catch(_){return ''}
    return '';
  }
  function getClient(){
    if(client)return client;
    const c=window.JDM_RUNTIME_CONFIG;
    if(!(c?.supabaseUrl&&c?.supabaseAnonKey&&window.supabase?.createClient)){
      const e=new Error('Supabase 配置不可用');e.code='JDM_CONFIG_MISSING';e.kind='config';throw e;
    }
    client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{
      auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
    });
    const result=client.auth.onAuthStateChange((event,session)=>{
      authState={status:session?'signed_in':'signed_out',session,user:session?.user||null,lastEvent:event};
      window.dispatchEvent(new CustomEvent('jdm:auth',{detail:{event,session,user:session?.user||null}}));
    });
    authSubscription=result?.data?.subscription||null;
    return client;
  }
  async function session(){
    const db=getClient();
    const {data,error}=await db.auth.getSession();
    if(error)throw normalizeError(error);
    authState={...authState,status:data.session?'signed_in':'signed_out',session:data.session||null,user:data.session?.user||null};
    return data.session||null;
  }
  async function user(){const s=await session();return s?.user||null}
  async function refresh(){
    if(refreshPromise)return refreshPromise;
    refreshPromise=(async()=>{
      const db=getClient();
      const {data,error}=await db.auth.refreshSession();
      if(error)throw normalizeError(error);
      return data.session||null;
    })().finally(()=>{refreshPromise=null});
    return refreshPromise;
  }
  function authExpired(cause){
    const e=new Error('登录状态已失效，请重新登录');
    e.code='AUTH_EXPIRED';e.status=401;e.kind='auth';e.cause=cause||null;e.details={cause:normalizeError(cause)};
    return e;
  }
  function isStaleAuthError(err){
    return !!err&&(err.status===401||err.code==='PGRST301'||err.code==='AUTH_EXPIRED');
  }
  async function request(factory,{retryAuth=true,timeoutMs=10000,anonFallback=false}={}){
    const db=getClient();
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    let result;
    try{result=await factory(db,controller.signal)}catch(error){throw normalizeError(error)}
    finally{clearTimeout(timer)}
    if(!result?.error)return result?.data;
    const err=normalizeError(result.error);
    if(retryAuth&&isStaleAuthError(err)){
      let refreshError=null;
      try{
        const refreshed=await refresh();
        if(refreshed)return request(factory,{retryAuth:false,timeoutMs,anonFallback:false});
      }catch(error){refreshError=normalizeError(error)}
      // Dirty / unrefreshable JWT: clear local session so the next call is pure anon.
      await signOut();
      if(anonFallback){
        try{
          return await request(factory,{retryAuth:false,timeoutMs,anonFallback:false});
        }catch(anonError){
          // Public retry failed for a real reason — surface that error, not AUTH_EXPIRED.
          throw normalizeError(anonError);
        }
      }
      throw authExpired(refreshError||err);
    }
    throw err;
  }
  async function signOut(){
    try{await getClient().auth.signOut()}catch(_){}
    authState={status:'signed_out',session:null,user:null,lastEvent:'SIGNED_OUT'};
  }
  function describeError(error){
    const e=normalizeError(error);if(!e)return {code:'UNKNOWN',kind:'unknown',message:'暂时无法完成请求，请稍后重试。',action:'retry'};
    if(e.code==='AUTH_EXPIRED'||e.status===401)return {code:'AUTH_EXPIRED',kind:'auth',message:'登录状态已失效，请重新登录。',action:'login'};
    if(e.status===403)return {code:'AUTH_FORBIDDEN',kind:'forbidden',message:'当前账号没有执行此操作的权限。',action:'contact'};
    if(e.status===429||e.code==='RATE_LIMITED')return {code:'RATE_LIMITED',kind:'rate',message:'请求过于频繁，请稍后再试。',action:'retry'};
    if(e.kind==='timeout')return {code:'TIMEOUT',kind:'timeout',message:'请求超时，请重试。',action:'retry'};
    if(e.kind==='network')return {code:'NETWORK',kind:'network',message:'网络连接暂时不可用，请重试。',action:'retry'};
    if(e.code==='JDM_CONFIG_MISSING')return {code:e.code,kind:'config',message:'网站数据服务配置异常，请联系管理员。',action:'contact'};
    return {code:e.code||'JDM_REQUEST_ERROR',kind:e.kind||'server',message:'知识数据暂时无法加载，请稍后重试。',action:'retry'};
  }
  function getState(){return {...authState}}
  window.JDM_AUTH={getClient,session,user,refresh,request,signOut,state:getState,esc,safeHref,describeError};
})();
