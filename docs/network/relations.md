---
hide:
  - navigation
  - toc
---
<div class="museum-hero">
  <div>
    <div class="eyebrow">RELATION EXPLORER · 关系探索</div>
    <h1>从一个条目，找到下一步阅读。</h1>
    <p>选择人物、器物或窑址，查看它与其他条目的具体关系。需要观察整体结构时，再展开关系图。</p>
  </div>
  <div class="museum-hero-mark">关系<br>探索</div>
</div>

<div class="network-explorer" id="jdm-network-explorer">
  <div class="network-toolbar" role="search">
    <a class="network-unified-search" href="/jingdezhen-porcelain-wiki/search/">⌕ 搜索条目</a>
    <label class="network-search">
      <span>查找条目</span>
      <input id="network-search-input" type="search" placeholder="例如：唐英、青花、御窑厂、郎廷极" autocomplete="off">
    </label>
    <label class="network-filter">
      <span>条目类型</span>
      <select id="network-type-filter">
        <option value="all">全部主题</option>
        <option value="人物">人物</option>
        <option value="器物">器物</option>
        <option value="历史">历史</option>
        <option value="窑址">窑址</option>
        <option value="文献">文献</option>
        <option value="工艺">工艺</option>
        <option value="现代">现代</option>
      </select>
    </label>
  </div>

  <div class="network-status" id="network-status" aria-live="polite">正在加载知识网络……</div>

    <h2 class="visitor-sr-only">关系详情</h2>
    <aside class="network-detail" id="network-detail" aria-live="polite">
      <div class="network-empty">
        <span>选择条目</span>
        <h3>从一个主题开始</h3>
        <p>查看它连接到哪些知识，并从这里进入完整条目。</p>
      </div>
    </aside>
  <div class="network-node-list" id="network-node-list"></div>
  <details id="network-graph-toggle"><summary>高级视图：展开关系图</summary>
<section class="network-graph-panel" aria-label="知识关系图谱">
      <div class="network-panel-head">
        <div>
          <span>关系图</span>
          <h2>人物、器物与窑址的连接</h2>
        </div>
        <button id="network-reset" type="button">重置视图</button>
      </div>
      <div class="network-canvas-wrap">
        <svg id="network-canvas" class="network-canvas" viewBox="0 0 1100 720" role="group" aria-label="景德镇陶瓷知识关系图谱"></svg>
      </div>
    </section>
  </details>
</div>

## 连线表示什么

关系需要说明具体含义：出土于某地、使用某工艺、由某人制作、被某文献记录，或仅作为比较对象。不同关系所需证据不同。题材相似不等于同一作者，时代相近不等于技术直接传播，文献提到器物也不意味着其全部信息已经确认。

探索时先打开对象和关系说明，再核对来源。网络用于提出问题和连接阅读，不能由连线数量直接判断历史重要性或学术结论的可靠程度。

进一步阅读[研究导览](../research/research-hub.md)和[博物馆资料](../research/museum-sources.md)。

## 从常见问题开始

- [青花怎样制作？](../craft/qinghua.md)
- [湖田窑出土了什么？](../kilns/hutian-kiln.md)
- [御窑如何服务宫廷？](../kilns/imperial-kiln.md)
