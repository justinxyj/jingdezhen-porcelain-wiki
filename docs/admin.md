# 管理员审核中心

<div id="admin-status"></div>
<div id="admin-panel" style="display:none">
  <div class="museum-toolbar">
    <select id="admin-filter">
      <option value="pending">待审核</option>
      <option value="approved">已通过</option>
      <option value="rejected">已拒绝</option>
      <option value="all">全部</option>
    </select>
    <button class="md-button" id="admin-refresh">刷新</button>
  </div>
  <div id="admin-list"></div>
</div>

## 审核流程

1. 用户提交编辑后进入 `pending`。
2. 审核员或管理员查看标题、分类、内容和提交者。
3. 通过后写入知识条目，并保留修订记录；拒绝则留下审核意见。
4. 所有审核动作都由数据库权限控制，普通用户不能直接发布公共条目。

<script>
(function(){
  const status=document.getElementById('admin-status'),panel=document.getElementById('admin-panel');
  function ready(){return !!(window.JDM_RUNTIME_CONFIG?.supabaseUrl&&window.JDM_RUNTIME_CONFIG?.supabaseAnonKey&&window.supabase)}
  async function boot(){
    if(!ready()){status.innerHTML='<div class="notice">账户系统尚未连接。</div>';return}
    const db=window.supabase.createClient(window.JDM_RUNTIME_CONFIG.supabaseUrl,window.JDM_RUNTIME_CONFIG.supabaseAnonKey);
    const {data:{session}}=await db.auth.getSession();
    if(!session){status.innerHTML='<div class="notice">请先登录。<a href="../account/">前往登录</a></div>';return}
    const {data:profile,error}=await db.from('profiles').select('display_name,role').eq('id',session.user.id).maybeSingle();
    if(error||!profile||!['reviewer','admin'].includes(profile.role)){status.innerHTML='<div class="notice">当前账户没有审核权限。</div>';return}
    status.innerHTML='<div class="notice">审核员：<b>'+(profile.display_name||session.user.email||'用户')+'</b> · 权限：'+profile.role+'</div>';
    panel.style.display='block';
    async function load(){
      const f=document.getElementById('admin-filter').value;
      let q=db.from('edits').select('id,title,category,content,status,author_id,created_at,reviewer_id,review_note,reviewed_at').order('created_at',{ascending:false});
      if(f!=='all')q=q.eq('status',f);
      const {data,error}=await q;
      const list=document.getElementById('admin-list');
      if(error){list.innerHTML='<div class="notice">加载失败：'+error.message+'</div>';return}
      if(!data?.length){list.innerHTML='<div class="notice">暂无'+(f==='pending'?'待审核':'相关')+'编辑。</div>';return}
      list.innerHTML=data.map(x=>`<article class="admin-card"><div class="tag">${x.category}</div><span class="admin-date">${new Date(x.created_at).toLocaleString('zh-CN')}</span><h3>${esc(x.title)}</h3><p>${esc(x.content).replace(/\n/g,'<br>')}</p><small>提交者：${esc(x.author_id)}</small>${x.status==='pending'?`<div class="admin-actions"><button class="md-button md-button--primary" data-action="approve" data-id="${x.id}">通过并发布</button><button class="md-button" data-action="reject" data-id="${x.id}">拒绝</button></div>`:`<div class="notice">状态：${x.status}${x.review_note?' · '+esc(x.review_note):''}</div>`}</article>`).join('');
      list.querySelectorAll('[data-action]').forEach(b=>b.onclick=async()=>{const note=b.dataset.action==='reject'?prompt('请输入拒绝原因（可选）：')||'未提供原因':'审核通过';await review(b.dataset.id,b.dataset.action,note)});
    }
    function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
    async function review(id,action,note){
      const patch={status:action==='approve'?'approved':'rejected',reviewer_id:session.user.id,review_note:note,reviewed_at:new Date().toISOString()};
      const r=await db.from('edits').update(patch).eq('id',id);
      if(r.error){alert('审核失败：'+r.error.message);return}
      await load();
    }
    document.getElementById('admin-filter').onchange=load;document.getElementById('admin-refresh').onclick=load;await load();
  }
  boot();
})();
</script>
