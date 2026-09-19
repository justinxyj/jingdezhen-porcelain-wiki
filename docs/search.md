<div class="jdm-search-page" data-entry-search>
  <div class="jdm-search-hero">
    <div>
      <div class="eyebrow">知识发现 · Phase 4D</div>
      <h1>从一个词，进入一整个知识网络。</h1>
      <p>统一搜索不只回答“有没有这个词”，还把知识世界、时代、空间与后续关系一起带出来。搜索结果始终回到同一个 canonical Entry。</p>
    </div>
    <div class="jdm-search-hero-stats"><span><b id="jdm-search-count">—</b><small>当前匹配</small></span><span><b>149</b><small>公开条目</small></span></div>
  </div>

  <div class="jdm-search-box" role="search">
    <label for="jdm-entry-search-input">搜索景德镇陶瓷知识</label>
    <div class="jdm-search-input-row">
      <input id="jdm-entry-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="试试：唐英、青花、御窑厂、郎廷极、鸡缸杯">
      <button id="jdm-entry-search-submit" type="button">搜索</button>
    </div>
    <div class="jdm-search-shortcut">按 <kbd>/</kbd> 或 <kbd>S</kbd> 快速聚焦搜索框</div>
    <div class="jdm-search-suggestions" id="jdm-search-suggestions" hidden></div>
    <div class="jdm-search-hints" aria-label="搜索示例">
      <button type="button" data-search-example="唐英">唐英</button>
      <button type="button" data-search-example="青花">青花</button>
      <button type="button" data-search-example="御窑厂">御窑厂</button>
      <button type="button" data-search-example="郎廷极">郎廷极</button>
      <button type="button" data-search-example="鸡缸杯">鸡缸杯</button>
    </div>
  </div>

  <div class="jdm-search-filter-panel">
    <div class="jdm-search-filter-row">
      <span>知识世界</span>
      <div class="jdm-search-filters" aria-label="知识世界筛选">
        <button type="button" class="is-active" data-search-world="">全部</button>
        <button type="button" data-search-world="history">历史与发展</button>
        <button type="button" data-search-world="craft">工艺与技术</button>
        <button type="button" data-search-world="objects">器物与美学</button>
        <button type="button" data-search-world="space">窑址与城市空间</button>
        <button type="button" data-search-world="people">人物与传承</button>
        <button type="button" data-search-world="research">文献与研究</button>
        <button type="button" data-search-world="contemporary">现代景德镇</button>
      </div>
    </div>
    <div class="jdm-search-filter-row">
      <span>条目类型</span>
      <div class="jdm-search-filters" aria-label="条目类型筛选">
        <button type="button" data-search-category="人物">人物</button>
        <button type="button" data-search-category="历史">历史</button>
        <button type="button" data-search-category="器物">器物</button>
        <button type="button" data-search-category="文献">文献</button>
        <button type="button" data-search-category="窑址">窑址</button>
      </div>
    </div>
    <div class="jdm-search-filter-row">
      <span>时间 / 空间</span>
      <div class="jdm-search-filters" aria-label="时代与空间筛选">
        <button type="button" data-search-era="tang">唐五代</button>
        <button type="button" data-search-era="song">宋</button>
        <button type="button" data-search-era="yuan">元</button>
        <button type="button" data-search-era="ming">明</button>
        <button type="button" data-search-era="qing">清</button>
        <button type="button" data-search-era="modern">近现代</button>
        <button type="button" data-search-lane="jdz">景德镇</button>
        <button type="button" data-search-lane="china">中国其他窑业</button>
        <button type="button" data-search-lane="world">世界其他地区</button>
        <button type="button" data-search-signal="map">有空间坐标</button>
        <button type="button" data-search-signal="time">有时间轴</button>
      </div>
    </div>
    <button type="button" id="jdm-search-clear" class="jdm-search-clear">清除筛选</button>
  </div>

  <div class="jdm-search-discovery-strip">
    <div><span>统一知识入口</span><b>搜索 → Entry → 世界 / 时代 / 空间 / 关系 → 继续探索</b></div>
    <a href="/jingdezhen-porcelain-wiki/network/global/">探索全球陶瓷网络 →</a>
  </div>

  <div class="jdm-search-status" id="jdm-search-status" aria-live="polite">正在读取公开知识条目……</div>
  <div class="jdm-search-results" id="jdm-search-results"></div>
</div>
