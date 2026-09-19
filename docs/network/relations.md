# 关系探索

<div class="museum-hero">
  <div>
    <div class="eyebrow">RELATION EXPLORER · 关系探索</div>
    <h1>从一个知识节点，沿着关系继续走。</h1>
    <p>把已经建立的知识关系变成可以点击、筛选和继续进入条目的探索界面。</p>
  </div>
  <div class="museum-hero-mark">关系<br>探索</div>
</div>

<div class="network-explorer" id="jdm-network-explorer">
  <div class="network-toolbar" role="search">
    <a class="network-unified-search" href="/jingdezhen-porcelain-wiki/search/">⌕ 统一搜索知识条目</a>
    <label class="network-search">
      <span>搜索知识节点</span>
      <input id="network-search-input" type="search" placeholder="例如：唐英、青花、御窑厂、郎廷极" autocomplete="off">
    </label>
    <label class="network-filter">
      <span>节点类型</span>
      <select id="network-type-filter">
        <option value="all">全部核心节点</option>
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

  <div class="network-layout">
    <section class="network-graph-panel" aria-label="知识关系图谱">
      <div class="network-panel-head">
        <div>
          <span>KNOWLEDGE GRAPH · 知识图谱</span>
          <h2>核心知识节点网络</h2>
        </div>
        <button id="network-reset" type="button">重置视图</button>
      </div>
      <div class="network-canvas-wrap">
        <svg id="network-canvas" class="network-canvas" viewBox="0 0 1100 720" role="img" aria-label="景德镇陶瓷知识关系图谱"></svg>
      </div>
    </section>

    <aside class="network-detail" id="network-detail" aria-live="polite">
      <div class="network-empty">
        <span>SELECT A NODE</span>
        <h3>点击一个节点</h3>
        <p>查看它连接到哪些知识，并从这里进入统一知识条目页面。</p>
      </div>
    </aside>
  </div>

  <div class="network-node-list" id="network-node-list"></div>
</div>

## 当前关系类型

关系探索器优先展示已经进入公共知识图谱的核心节点。媒体、来源和工序等底层节点仍存在于统一图谱中，但不会在第一屏全部铺开，避免把“知识探索”变成技术数据库。

- **人物 / 器物 / 历史 / 窑址 / 文献 / 工艺 / 现代**：核心知识节点
- **知识世界**：七大世界的入口节点
- **entry_relation**：已有的条目之间关系
- **world_primary / world_secondary**：条目与知识世界之间的语义关系

> 推荐关系与知识图谱不是同一层：相关推荐继续遵循 Phase 3B 的 A+ / A 证据门槛；这里展示的是更完整的事实与探索网络。

<div class="timeline-method-note">
<strong>数据原则</strong><br>
关系探索直接读取生产知识图谱，只展示当前公共数据层可访问的节点与关系；不会为了视觉效果虚构关系。
</div>
