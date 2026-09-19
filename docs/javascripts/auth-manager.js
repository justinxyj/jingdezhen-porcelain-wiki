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
    e.kind=e.status===401?'auth':e.status===403?'forbidden':e.name==='AbortError'?'timeout':(e.message||'').toLowerCase().includes('network')?'network':'server';
    return e;
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
  async function request(factory,{retryAuth=true,timeoutMs=10000}={}){
    const db=getClient();
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    let result;
    try{result=await factory(db,controller.signal)}catch(error){throw normalizeError(error)}
    finally{clearTimeout(timer)}
    if(!result?.error)return result?.data;
    const err=normalizeError(result.error);
    if(retryAuth&&err.status===401){
      let refreshError=null;
      try{
        const refreshed=await refresh();
        if(refreshed)return request(factory,{retryAuth:false,timeoutMs});
      }catch(error){refreshError=normalizeError(error)}
      await signOut();
      throw authExpired(refreshError||err);
    }
    throw err;
  }
  async function signOut(){
    try{await getClient().auth.signOut()}catch(_){}
    authState={status:'signed_out',session:null,user:null,lastEvent:'SIGNED_OUT'};
  }
  function getState(){return {...authState}}
  window.JDM_AUTH={getClient,session,user,refresh,request,signOut,state:getState,safeHref};
})();
