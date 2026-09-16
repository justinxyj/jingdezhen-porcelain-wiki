# 可视化编辑器

<div class="wechat-editor" id="wechat-editor">
  <div class="wechat-editor-topbar">
    <div><strong>景德镇陶瓷 Wiki 编辑器</strong><span id="editor-mode-label">新建知识条目</span></div>
    <div class="editor-top-actions"><button type="button" class="md-button" id="editor-preview-toggle">预览</button><button type="button" class="md-button" id="editor-save-draft">保存草稿</button><button type="button" class="md-button md-button--primary" id="editor-submit">提交审核</button></div>
  </div>
  <div id="editor-status"></div>
  <div class="wechat-editor-meta">
    <label class="cover-picker">封面图 URL<input id="editor-cover" type="url" placeholder="https://…（可选）"></label>
    <label>条目标题<input id="editor-title" type="text" required placeholder="例如：湖田窑青白瓷"></label>
    <label>分类<select id="editor-category"><option>历史</option><option>工艺</option><option>器物</option><option>窑址</option><option>人物</option><option>图片</option><option>文献</option><option>其他</option></select></label>
    <label>摘要<input id="editor-summary" type="text" maxlength="180" placeholder="一句话概括这个条目"></label>
  </div>
  <div class="wechat-editor-workspace">
    <section class="wechat-editor-main">
      <div class="wechat-toolbar" role="toolbar" aria-label="富文本工具栏">
        <button type="button" data-cmd="undo" title="撤销">↶</button><button type="button" data-cmd="redo" title="重做">↷</button><span></span>
        <select id="editor-block" title="段落样式"><option value="p">正文</option><option value="h2">标题 2</option><option value="h3">标题 3</option><option value="blockquote">引用</option></select>
        <button type="button" data-cmd="bold" title="粗体"><b>B</b></button><button type="button" data-cmd="italic" title="斜体"><i>I</i></button><button type="button" data-cmd="underline" title="下划线"><u>U</u></button><button type="button" data-cmd="strikeThrough" title="删除线">S̶</button><span></span>
        <button type="button" data-cmd="insertUnorderedList" title="项目符号">☷</button><button type="button" data-cmd="insertOrderedList" title="编号">1.</button><button type="button" data-action="quote" title="引用">❝</button><button type="button" data-action="link" title="插入链接">🔗</button><button type="button" data-action="image" title="插入图片">▧</button><span></span>
        <button type="button" data-action="source" title="HTML 源码">&lt;/&gt;</button><button type="button" data-cmd="removeFormat" title="清除格式">Tx</button>
      </div>
      <div class="wechat-editor-paper">
        <div id="editor-canvas" class="wechat-editor-canvas" contenteditable="true" spellcheck="true"><p>从这里开始写知识条目……</p></div>
        <textarea id="editor-source" class="wechat-editor-source" aria-label="HTML 源码"></textarea>
      </div>
      <div class="editor-bottom-bar"><span id="editor-word-count">0 字</span><span id="editor-autosave">尚未保存</span><span>支持 Ctrl+B / Ctrl+I / Ctrl+K</span></div>
    </section>
    <aside class="wechat-editor-side">
      <div class="editor-side-card"><h3>条目结构</h3><p>像微信公众号一样直接排版，但保存后仍会进入 Wiki 的审核、版本和来源追踪流程。</p><div class="editor-outline" id="editor-outline"></div></div>
      <div class="editor-side-card"><h3>来源与核验</h3><label>参考文献编号<input id="editor-sources" placeholder="R01, R03, R23"></label><small>建议每个历史事实、考古信息、馆藏信息都留下可核验来源。</small></div>
      <div class="editor-side-card"><h3>发布设置</h3><label><input id="editor-watch" type="checkbox" checked> 提交后关注这个条目</label><p class="editor-tip">保存草稿只保存在当前浏览器；提交审核后才进入管理员审核队列。</p></div>
    </aside>
  </div>
</div>

## 编辑规则

- **可视化编辑**：正文排版、标题、列表、引用、链接和图片均可直接操作。
- **先提交、后审核、留版本**：普通用户不能绕过审核直接覆盖公共条目。
- **来源优先**：考古、馆藏、人物生平、年代和技术判断尽量绑定正式文献或机构来源。
- **图片版权**：图片需要记录来源与许可；不要直接上传没有授权的网络图片。

编辑器采用“可视化编辑 + 版本历史 + 来源追踪”的 Wiki 工作流，同时把正文工作区设计成更接近微信公众号后台的富文本排版体验。
