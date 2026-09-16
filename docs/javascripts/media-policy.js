/* Media policy: the UI never treats arbitrary placeholder images as valid canonical media. */
(function(){
  window.JDM_MEDIA_POLICY={
    tiers:{
      1:'条目对应机构的官方馆藏/遗址/档案图像',
      2:'国家级博物馆、大学、UNESCO 等权威机构公开图像',
      3:'Wikimedia Commons / Wikipedia 中可核验版权与条目信息的图像',
      4:'仅作临时研究索引的关联图（不得作为主要图片）'
    },
    categoryRules:{
      '器物':'优先对应具体器物的博物馆 Open Access / Public Domain 图像',
      '人物':'优先本人可靠肖像或官方机构人物资料图；无可靠肖像则使用明确标注“关联器物/作品”的官方图，不冒充肖像',
      '窑址':'优先遗址现场、考古发掘、官方遗产申报或博物馆遗址图',
      '文献':'优先古籍书影、手稿、馆藏书目或出版社/图书馆官方封面；不能用无关器物图代替',
      '历史':'优先与该历史事件直接相关的考古、遗址、档案或官方历史资料图'
    },
    isGenericPlaceholder(media){
      const p=String(media?.path||'');
      return p.includes('/42490/177595/main-image') || /视觉索引|关联图/.test(String(media?.title||''));
    }
  };
})();
