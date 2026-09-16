/* Source/media audit helpers. Exposes a small diagnostic API for the curator console. */
(function(){
  window.JDM_AUDIT={
    normalizeUrl(url){try{return new URL(url,location.href).href}catch{return ''}},
    media(media){
      const p=String(media?.path||'').trim(),t=String(media?.title||''),s=String(media?.source||'');
      return !!p && !/关联图|视觉索引|占位|placeholder|待补|暂无|未核验|示意图|配图/i.test(`${t} ${s}`) && !/placeholder|no[-_ ]image|noimage|blank|transparent/i.test(p);
    },
    source(source){return !!String(source?.title||'').trim() && !!this.normalizeUrl(source?.url||'') && Number(source?.tier)>=1 && Number(source?.tier)<=3},
    entry(entry){return !!String(entry?.zh?.title||'').trim() && !!String(entry?.zh?.content||'').trim()}
  };
})();
