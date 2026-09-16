(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const path=p=>ROOT+p.replace(/^\//,'');
  const wikiSearch=q=>`https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`;
  const wikiApiTitle=t=>`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g,'_'))}`;

  const DATA=[
    {kind:'人物',era:'唐',name:'柳宗元',wikiTitle:'柳宗元',work:'《代人进瓷器状》',quote:'早期关于饶州瓷器的文献记录之一。',summary:'柳宗元并非景德镇陶瓷专门著述作者，但《代人进瓷器状》属于唐代关于饶州进贡瓷器的重要文字记录。它让景德镇所在区域的瓷器在唐代文献中留下了清晰的贡瓷线索。',source:'中国瓷都·景德镇市瓷业志“陶瓷要籍”整理',sourceUrl:'https://meta.librarydata.cn/metainfo?metaID=140420020210001666',wiki:'https://zh.wikipedia.org/wiki/柳宗元'},
    {kind:'人物',era:'明',name:'宋应星',wikiTitle:'宋应星',work:'《天工开物·陶埏》',quote:'“陶成雅器，有素肌玉骨之象焉。”',summary:'宋应星通过实地观察把明末景德镇制瓷的原料、成型、施釉、装饰和烧成纳入技术史叙述。《陶埏》尤其重要，因为它不是只赞美瓷器，而是把景德镇瓷器背后的劳动与技术过程写成可观察、可分析的生产知识。',source:'《天工开物·陶埏》原文与景德镇陶瓷史研究',sourceUrl:'https://www.diancangwang.cn/xueshuzaji/01dc5047d4c6/76ffa77c19c9.html',wiki:'https://zh.wikipedia.org/wiki/宋应星'},
    {kind:'人物',era:'清',name:'唐英',wikiTitle:'唐英 (清朝督陶官)',work:'《陶务叙略碑记 / 陶成纪事碑记》',quote:'以碑记方式总结雍正时期御窑生产、品类与督陶经验。',summary:'唐英既是督陶官，也是直接进入窑场学习制瓷的记录者。他留下的碑记和《陶冶图说》把景德镇御窑的生产组织、器类和工艺流程转化为系统文字，是研究清代景德镇生产体系的核心一手材料之一。',source:'景德镇陶瓷大学《中国陶瓷工业》相关研究',sourceUrl:'https://qkzzs.jcu.edu.cn/zgtcgy/info/1025/1261.htm',wiki:'https://zh.wikipedia.org/wiki/唐英_(清朝督陶官)'},
    {kind:'人物',era:'清',name:'朱琰',wikiTitle:'朱琰',work:'《陶说》',quote:'清代陶瓷史与窑业知识整理的重要作者。',summary:'朱琰的《陶说》把历代陶瓷知识、窑业传统和景德镇相关信息纳入较系统的文献整理。它与唐英、蓝浦的著述一起构成清代景德镇陶瓷知识生产的重要链条。',source:'《中国瓷都·景德镇市瓷业志》陶瓷要籍整理',sourceUrl:'https://meta.librarydata.cn/metainfo?metaID=140420020210001666',wiki:'https://zh.wikipedia.org/w/index.php?search=朱琰'},
    {kind:'人物',era:'清',name:'殷弘绪（d’Entrecolles）',wikiTitle:'殷弘绪',work:'1712、1722年关于景德镇制瓷的书信报告',quote:'把景德镇的制瓷工序、原料和生产组织详细介绍给欧洲读者。',summary:'法国耶稣会士殷弘绪长期观察景德镇窑业，并把制瓷原料、工序和生产组织写成报告传回欧洲。这些文字后来进入法国耶稣会文献与欧洲知识传播体系，是中国瓷器制造知识从景德镇进入欧洲公共知识领域的重要节点。',source:'法国国家图书馆“中法共享遗产”·Porcelaine',sourceUrl:'https://heritage.bnf.fr/france-chine/porcelaine',wiki:'https://zh.wikipedia.org/wiki/殷弘绪'},
    {kind:'人物',era:'清—工业时代',name:'约西亚·韦奇伍德（Josiah Wedgwood）',wikiTitle:'Josiah Wedgwood',work:'对杜赫德《中华帝国志》材料的研究与记录',quote:'欧洲陶瓷工业者把景德镇作为理解中国瓷器制造的重要参照。',summary:'韦奇伍德并非景德镇的直接观察者，但他认真研究了欧洲流传的中国瓷器制造资料，并关注景德镇瓷器的生产秘密。这一角色代表了另一种“评价”：景德镇不再只是东方消费品来源，也成为欧洲陶瓷工业理解和追赶的技术参照。',source:'The Radical Potter，对杜赫德及韦奇伍德阅读中国瓷器资料的研究',sourceUrl:'https://us.macmillan.com/books/9781250128355/theradicalpotter/',wiki:'https://en.wikipedia.org/wiki/Josiah_Wedgwood'},
    {kind:'人物',era:'清',name:'让-巴蒂斯特·杜赫德（Jean-Baptiste Du Halde）',wikiTitle:'Jean-Baptiste Du Halde',work:'《中华帝国志》（Description de la Chine）',quote:'将殷弘绪关于景德镇的材料整理进欧洲广泛传播的中国知识体系。',summary:'杜赫德本人并非长期驻景德镇的制瓷观察者，但他编辑、整理了耶稣会士报告，使景德镇瓷器生产知识进入欧洲大型中国史地著作。它进一步影响了欧洲对中国瓷器、工艺与生产城市的认识。',source:'法国国家图书馆“中法共享遗产”·Porcelaine',sourceUrl:'https://heritage.bnf.fr/france-chine/porcelaine',wiki:'https://en.wikipedia.org/wiki/Jean-Baptiste_Du_Halde'},
    {kind:'书籍',era:'明',name:'《天工开物》',wikiTitle:'天工开物',author:'宋应星',quote:'《陶埏》以技术观察的方式记录明末景德镇制瓷。',summary:'《天工开物》不是景德镇专著，但《陶埏》成为研究明末景德镇制瓷工艺的重要技术文献。它把“瓷器之美”与原料、泥料、成型、施釉、装饰和烧成连接起来。',source:'《天工开物》维基条目与《陶埏》原文',sourceUrl:'https://zh.wikipedia.org/wiki/天工开物',wiki:'https://zh.wikipedia.org/wiki/天工开物'},
    {kind:'书籍',era:'清·1815',name:'《景德镇陶录》',wikiTitle:'景德镇陶录',author:'蓝浦、郑廷桂',quote:'景德镇陶瓷专门著述中最系统、最重要的清代文献之一。',summary:'《景德镇陶录》把景德镇的历史、御窑厂、作坊分工、工艺流程、器物类别以及历代窑考集中到一部专著中。它的价值不仅在于“评价”景德镇，更在于让景德镇第一次以一个完整的陶瓷生产系统成为专门著述对象。',source:'《景德镇陶录》维基条目及中国哲学书电子化计划',sourceUrl:'https://ctext.org/wiki.pl?if=gb&res=336161',wiki:'https://zh.wikipedia.org/wiki/景德镇陶录'},
    {kind:'书籍',era:'清·1735',name:'《中华帝国志》',wikiTitle:'Description of China',author:'Jean-Baptiste Du Halde',quote:'把景德镇制瓷资料带入欧洲启蒙时代的中国知识传播。',summary:'《中华帝国志》吸收殷弘绪等耶稣会士资料，使景德镇生产瓷器的城市形象和工艺知识进入欧洲知识网络。它后来又通过其他欧洲作者、百科全书和工匠阅读产生连锁传播。',source:'法国国家图书馆“中法共享遗产”·Porcelaine',sourceUrl:'https://heritage.bnf.fr/france-chine/porcelaine',wiki:'https://en.wikipedia.org/wiki/Description_of_China'},
    {kind:'书籍',era:'清·1722',name:'《耶稣会士书信集》中的景德镇报告',wikiTitle:'Lettres édifiantes et curieuses',author:'法国耶稣会士',quote:'保存了殷弘绪关于景德镇制瓷的两封重要报告。',summary:'殷弘绪1712和1722年的报告先后被收入《Lettres édifiantes et curieuses》。这套书让景德镇的制瓷工艺成为欧洲读者能够阅读、讨论和进一步模仿的知识。',source:'法国国家图书馆“中法共享遗产”·Porcelaine',sourceUrl:'https://heritage.bnf.fr/france-chine/porcelaine',wiki:'https://en.wikipedia.org/wiki/Lettres_%C3%A9difiantes_et_curieuses'},
    {kind:'书籍',era:'现代研究',name:'《The Pilgrim Art: Cultures of Porcelain in World History》',wikiTitle:'The Pilgrim Art',author:'Robert Finlay',quote:'从全球贸易、收藏和文化交流角度重新理解瓷器史。',summary:'这部现代研究把中国瓷器放入全球流通、消费、模仿和文化转译的历史中。对景德镇而言，它提供了从“产地史”走向“世界关系史”的阅读框架。',source:'JSTOR / The Pilgrim Art',sourceUrl:'https://www.jstor.org/stable/10.1525/j.ctt1pnfm7',wiki:'https://en.wikipedia.org/w/index.php?search=The+Pilgrim+Art+Cultures+of+Porcelain+in+World+History'}
  ];

  function card(item,i){
    const wiki=item.wiki||wikiSearch(item.name);
    return `<article class="voice-card" data-index="${i}">
      <div class="voice-image-wrap"><img class="voice-wiki-image" data-wiki-title="${esc(item.wikiTitle||item.name)}" alt="${esc(item.name)}" loading="lazy"><div class="voice-image-fallback">维基百科图片加载中</div></div>
      <div class="voice-card-body"><div class="voice-tags"><span>${esc(item.kind)}</span><span>${esc(item.era)}</span></div><h2>${esc(item.name)}</h2>${item.author?`<p class="voice-author">作者：${esc(item.author)}</p>`:''}<p class="voice-work">${esc(item.work||'')}</p><blockquote>${esc(item.quote)}</blockquote><div class="voice-ai"><b>AI介绍</b><p>${esc(item.summary)}</p><small>AI整理，仅作导览；评价原文请以出处为准。</small></div><div class="voice-actions"><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">详细出处 ↗</a><a href="${esc(wiki)}" target="_blank" rel="noopener">维基百科 ↗</a></div></div>
    </article>`;
  }

  async function hydrateImages(root){
    const imgs=[...root.querySelectorAll('.voice-wiki-image')];
    await Promise.all(imgs.map(async img=>{
      const title=img.dataset.wikiTitle;
      try{
        const r=await fetch(wikiApiTitle(title),{headers:{Accept:'application/json'}});
        if(!r.ok) throw new Error('wiki image unavailable');
        const d=await r.json();
        const src=d?.thumbnail?.source||d?.originalimage?.source;
        if(!src) throw new Error('no thumbnail');
        img.src=src;
        img.closest('.voice-image-wrap').classList.add('has-image');
        img.nextElementSibling.remove();
      }catch(e){
        img.remove();
      }
    }));
  }

  function init(){
    const root=document.getElementById('voices-books-root');
    if(!root) return;
    root.innerHTML=`<div class="voice-filter"><button class="is-active" data-filter="all">全部</button><button data-filter="人物">名人</button><button data-filter="书籍">书籍</button><input id="voice-search" type="search" placeholder="搜索人物、书籍或关键词…"></div><div class="voices-grid">${DATA.map(card).join('')}</div>`;
    const grid=root.querySelector('.voices-grid');
    const filter=()=>{const f=root.querySelector('.voice-filter .is-active')?.dataset.filter||'all';const q=(root.querySelector('#voice-search')?.value||'').trim().toLowerCase();root.querySelectorAll('.voice-card').forEach((el,i)=>{const x=DATA[i];const ok=(f==='all'||x.kind===f)&&(!q||[x.name,x.author,x.work,x.quote,x.summary].join(' ').toLowerCase().includes(q));el.hidden=!ok;});};
    root.querySelectorAll('.voice-filter button').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('.voice-filter button').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');filter();}));
    root.querySelector('#voice-search').addEventListener('input',filter);
    hydrateImages(root);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
