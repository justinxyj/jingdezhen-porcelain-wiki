# 编辑知识条目

<div id="editor-status"></div>
<form id="editor-form" class="editor-box editor-form">
  <label>条目标题<input name="title" required placeholder="例如：湖田窑青白瓷"></label>
  <label>分类<select name="category"><option>历史</option><option>工艺</option><option>器物</option><option>窑址</option><option>人物</option><option>图片</option><option>文献</option></select></label>
  <label>修改内容<textarea name="content" rows="12" required placeholder="写下你希望增加或修正的内容，并尽量附上来源。"></textarea></label>
  <button class="md-button md-button--primary" type="submit">提交编辑</button>
</form>

## 编辑原则

**先提交、后审核、留版本。** 公共页面不因单个用户直接覆盖而失去历史记录。涉及年代、考古发现、馆藏信息或人物生平的修改，应提供可核验来源。

编辑提交后进入 `pending` 队列；审核通过后再写入公共数据集。
