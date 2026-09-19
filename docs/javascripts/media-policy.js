/* Media policy: only directly corresponding and verifiable images may enter the public museum UI. */
(function(){
  const reject=/关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i;
  window.JDM_MEDIA_POLICY={
    tiers:{
      1:'条目对应机构的官方馆藏/遗址/档案图像',
      2:'国家级博物馆、大学、UNESCO 等权威机构公开图像',
      3:'Wikimedia Commons / Wikipedia 中可核验版权与条目信息的图像'
    },
    categoryRules:{
      '器物':'优先对应具体器物的博物馆 Open Access / Public Domain 图像',
      '人物':'优先本人可靠肖像；无可靠肖像则不强行配图',
      '窑址':'优先遗址现场、考古发掘、官方遗产申报或博物馆遗址图',
      '文献':'优先古籍书影、手稿、馆藏书目或出版社/图书馆官方封面；不能用无关器物图代替',
      '历史':'优先与该历史事件直接相关的考古、遗址、档案或官方历史资料图'
    },
    isGenericPlaceholder(media){
      if(!media)return true;
      const p=String(media.path||'').trim(),t=String(media.title||'').trim(),s=String(media.source||'').trim();
      if(!p)return true;
      if(reject.test(`${t} ${s}`))return true;
      if(/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(p))return true;
      return false;
    },
    isUsable(media){
      if(this.isGenericPlaceholder(media))return false;
      return /^https?:\/\//i.test(String(media.path||'').trim())&&String(media.title||'').trim().length>0;
    }
  };
})();
