# 景德镇文献总库 · 在线阅读

> R01—R35 现在也进入统一后端知识库。这里不再保存第二份书目数据；页面只是把“文献”分类的后端条目投影出来。

<div class="library-toolbar">
  <input id="literature-search" type="search" placeholder="搜索作者、书名、主题、编号……" aria-label="搜索文献">
  <div class="library-filters"><button class="is-active" data-library-filter="all">全部</button><button data-library-filter="考古">考古</button><button data-library-filter="古籍与地方志">古籍与地方志</button><button data-library-filter="学术研究">学术研究</button><button data-library-filter="遗产与产业">遗产与产业</button></div>
</div>

<div id="literature-library" class="literature-library">
  <div class="voice-loading">正在加载统一文献知识库……</div>
</div>

## 数据原则

- 每条文献都是 `entries` 表中的一个正式知识条目。
- R04《景德镇陶录》、R05《天工开物》等与“名人与书籍”页面共享同一个条目，不再复制一份。
- 每条记录保存出处 URL、文献类型和参考编号；点击“进入统一知识条目”后可继续进入关系网络。
- 后续新增文献只增加后端条目，不再直接编辑本页面的数据列表。
