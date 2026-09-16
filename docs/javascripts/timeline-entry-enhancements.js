(function(){
  const ROOT='/jingdezhen-porcelain-wiki/';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const entry=(slug)=>ROOT+'entry/?type=timeline&slug='+encodeURIComponent(slug);
  const wiki=(q)=>'https://zh.wikipedia.org/w/index.php?search='+encodeURIComponent(q);
  const DATA={
    '越窑':{type:'中国窑址',region:'浙江·越地',era:'唐—宋',focus:'青瓷与秘色瓷传统',ai:'越窑是中国南方重要的青瓷窑系之一。唐代越窑青瓷已经形成成熟的胎釉和器型体系，并通过贸易进入更广阔区域。对景德镇而言，越窑代表了唐宋时期成熟青瓷传统所构成的技术与审美背景；景德镇后来形成的青白瓷并不是孤立出现，而是在中国南方窑业长期积累与竞争的环境中发展。',wiki:wiki('越窑')},
    '邢窑':{type:'中国窑址',region:'河北·内丘',era:'唐',focus:'白瓷体系成熟',ai:'邢窑是唐代北方白瓷的重要窑系。其白瓷传统帮助建立了中国古代高质量白瓷的技术参照。与景德镇的关系主要体现在中国白瓷技术史的连续比较：景德镇早期白瓷、宋代青白瓷的发展，需要放在唐宋白瓷体系已经成熟的背景中理解。',wiki:wiki('邢窑')},
    '长沙窑':{type:'中国窑址',region:'湖南·长沙',era:'唐',focus:'釉下彩、彩绘与外销',ai:'长沙窑以釉下彩、彩绘和外销陶瓷著称，是唐代陶瓷装饰创新的重要窑场。它与景德镇的关系更多体现为技术与市场史上的横向比较：长沙窑展示了唐代窑业如何把装饰、商品生产和远距离贸易结合起来，而景德镇后来则进一步形成了规模更大的瓷业网络。',wiki:wiki('长沙窑')},
    '耀州窑':{type:'中国窑址',region:'陕西·铜川',era:'唐—宋',focus:'刻花青瓷',ai:'耀州窑是北方重要青瓷窑系，以刻花装饰形成鲜明面貌。宋代中国陶瓷并非由单一窑场主导，而是多个区域窑系同时发展。与景德镇相比，耀州窑提供了北方青瓷装饰传统的参照，可以帮助理解宋代景德镇青白瓷在器型和装饰上的区域竞争环境。',wiki:wiki('耀州窑')},
    '定窑':{type:'中国窑址',region:'河北·曲阳',era:'唐—金',focus:'白瓷、刻花、印花',ai:'定窑是中国古代著名白瓷窑系，以细白胎、白釉以及刻花、印花装饰闻名。宋代定窑与景德镇青白瓷构成重要的南北比较：一个强调北方白瓷传统，一个发展出带青意的透明釉和丰富刻印花体系。',wiki:wiki('定窑')},
    '汝窑':{type:'中国窑址',region:'河南·宝丰',era:'北宋',focus:'天青釉与宫廷用瓷',ai:'汝窑代表北宋宫廷青瓷审美的重要阶段，以天青釉等特征受到高度关注。与景德镇的关系不是简单的直接继承，而是同处宋代多窑系竞争和宫廷审美影响的历史环境。景德镇青白瓷的成熟，正发生在这一高度分化的宋代陶瓷体系中。',wiki:wiki('汝窑')},
    '官窑':{type:'中国窑址',region:'河南/杭州',era:'宋',focus:'宫廷官窑体系',ai:'宋代官窑体现了宫廷需求对窑业生产、器型和釉色的影响。它与景德镇的关系主要在于官窑制度史：景德镇明代御窑厂形成后成为长期的宫廷瓷器生产中心，而宋代官窑则提供了更早的制度与审美参照。',wiki:wiki('官窑')},
    '哥窑':{type:'中国窑址',region:'浙江相关研究区',era:'宋',focus:'开片审美',ai:'哥窑是宋代陶瓷史中的重要概念，尤其因开片釉面而受到关注。由于窑址、传世品和文献之间存在复杂问题，相关归属应保持谨慎。与景德镇的关系主要是宋代不同釉色和表面效果之间的比较。',wiki:wiki('哥窑')},
    '钧窑':{type:'中国窑址',region:'河南·禹州',era:'宋—元',focus:'窑变釉',ai:'钧窑以窑变釉和蓝、紫等呈色传统著称。它展示了窑炉气氛、釉料和偶然性共同形成视觉效果的路径。景德镇后来发展出丰富颜色釉体系，因此钧窑可以作为理解中国颜色釉技术史的重要比较对象。',wiki:wiki('钧窑')},
    '龙泉窑':{type:'中国窑址',region:'浙江·龙泉',era:'宋—明',focus:'粉青、梅子青与外销青瓷',ai:'龙泉窑是宋元明时期重要青瓷窑系，粉青、梅子青等釉色形成鲜明传统，并拥有广泛外销市场。元明时期景德镇青花兴起后，两者在部分海外市场产生替代与竞争关系；同时，景德镇也吸收和转化了部分传统青瓷的器型与审美资源。',wiki:wiki('龙泉窑')},
    '磁州窑':{type:'中国窑址',region:'河北·磁县',era:'宋—元',focus:'白地黑彩与民窑装饰',ai:'磁州窑以白地黑彩等自由活泼的民窑装饰传统著称。它与景德镇的关系更多体现为市场和装饰语言的比较：景德镇长期同时存在官窑与民窑体系，磁州窑则帮助理解中国北方民窑如何通过绘画装饰满足更广泛的消费需求。',wiki:wiki('磁州窑')},
    '德化窑':{type:'中国窑址',region:'福建·德化',era:'宋—清',focus:'白瓷与人物雕塑',ai:'德化窑长期以白瓷著称，尤其形成了具有辨识度的白瓷雕塑传统。与景德镇的关系包括技术、贸易和市场层面的长期比较：两地都参与中国外销瓷体系，但在胎釉、器型和雕塑传统上形成不同面貌。',wiki:wiki('德化窑')},
    '漳州窑':{type:'中国窑址',region:'福建·漳州',era:'明',focus:'外销青花与五彩',ai:'漳州窑是明代外销陶瓷史的重要节点，产品进入东南亚及更广阔市场。它与景德镇共同参与海上贸易网络，但产品定位、装饰和生产组织并不完全相同，因此可以用来观察明代中国外销瓷市场内部的多中心格局。',wiki:wiki('漳州窑')},
    '宜兴窑':{type:'中国窑址',region:'江苏·宜兴',era:'明清',focus:'紫砂与茶文化',ai:'宜兴窑以紫砂器闻名，与景德镇以瓷器为核心的生产体系形成鲜明对照。两者都与茶文化和文人生活发生关系，但材料、成型、烧成和审美路径不同，是理解明清中国陶瓷多样性的很好比较对象。',wiki:wiki('宜兴窑')},
    '醴陵窑':{type:'中国窑址',region:'湖南·醴陵',era:'清末—现代',focus:'釉下彩与现代产业',ai:'醴陵窑在近现代形成鲜明的釉下彩传统，并逐步与现代工业生产结合。与景德镇相比，它体现了另一条从传统窑业向现代产业转型的路径；两地又都保留艺术瓷与日用瓷并行发展的特点。',wiki:wiki('醴陵窑')},
    '石湾窑':{type:'中国窑址',region:'广东·佛山',era:'明清—现代',focus:'陶塑与民间陶艺',ai:'石湾窑以陶塑传统见长，人物、动物和民间题材形成独特地方风格。它与景德镇的关系主要是中国南方陶瓷区域文化的比较：景德镇偏重精细瓷器体系，石湾则以陶塑和地方民间审美形成另一种传统。',wiki:wiki('石湾窑')},
    '日本':{type:'国家·日本',region:'东亚',era:'对应时间轴时期',focus:'本土窑业与中国陶瓷输入',ai:'日本陶瓷史需要按具体时期观察：唐代受朝鲜半岛与唐文化影响形成高火度陶器传统；宋元以后，日本大量输入中国陶瓷，并出现对中国器物的模仿；明清时期茶道审美推动濑户、美浓、有田等地发展。景德镇与日本的关系尤其体现在唐物输入、青花瓷传播、茶陶审美以及有田瓷器形成后的相互影响。',wiki:wiki('日本陶瓷')},
    '高丽':{type:'国家·朝鲜半岛',region:'东亚',era:'对应时间轴时期',focus:'高丽青瓷与中国陶瓷交流',ai:'高丽时期形成高度成熟的青瓷传统，早期受到中国尤其宋代陶瓷技术与审美影响，随后发展出独具特色的翡色青瓷和镶嵌装饰。元代以后，高丽陶瓷又受到景德镇青花等新风格影响。景德镇与朝鲜半岛之间因此存在输入、模仿、转化与再创造的长期关系。',wiki:wiki('高丽青瓷')},
    '朝鲜·粉青沙器':{type:'国家·朝鲜',region:'朝鲜半岛',era:'明',focus:'粉青沙器与白瓷转型',ai:'朝鲜王朝的粉青沙器与白瓷体现了本土审美和中国陶瓷影响之间的重新组合。明代景德镇青花、白瓷等通过贸易和外交网络进入朝鲜半岛，对器型与装饰观念产生影响，但朝鲜陶工并未简单复制，而是形成自身的简洁审美。',wiki:wiki('粉青沙器')},
    '日本·有田/伊万里':{type:'国家·日本',region:'九州·有田',era:'清',focus:'青花、伊万里与外销瓷',ai:'有田在近世日本瓷器史中占据重要位置。景德镇青花瓷等中国瓷器通过贸易进入日本后，相关器型和装饰语言成为日本瓷器发展的重要参照；有田随后形成自己的染付、色绘和伊万里外销体系，并进入欧洲市场。这里体现的是输入、模仿与本土化再创造。',wiki:wiki('有田烧')},
    '日本·九谷':{type:'国家·日本',region:'石川·九谷',era:'清',focus:'彩绘瓷传统',ai:'九谷烧以丰富的彩绘装饰形成鲜明传统。清代中国彩瓷和景德镇外销瓷构成日本彩绘瓷发展的重要外部背景之一，但九谷最终形成自己的色彩、构图与地方审美体系。',wiki:wiki('九谷烧')},
    '梅森':{type:'国家·德国',region:'萨克森·梅森',era:'18世纪',focus:'欧洲硬质瓷的突破',ai:'18世纪初欧洲长期尝试破解中国瓷器的材料与烧成技术。梅森在1708年前后实现硬质瓷技术突破，并于1710年建立制造体系。它与景德镇的关系非常直接：欧洲对中国瓷器的长期输入、收藏和模仿，是欧洲自主制瓷技术探索的重要背景。',wiki:wiki('梅森瓷')},
    '塞夫勒':{type:'国家·法国',region:'法国·塞夫勒',era:'18世纪',focus:'宫廷瓷与彩绘',ai:'法国塞夫勒瓷器在18世纪形成宫廷艺术与制造业结合的体系。中国景德镇瓷器及其他东亚瓷器长期进入欧洲宫廷市场，推动欧洲制造者发展自己的瓷器与装饰语言。塞夫勒后来形成具有法国宫廷特色的色彩、绘画和造型体系。',wiki:wiki('塞夫勒瓷器')},
    '英国':{type:'国家·英国',region:'英国',era:'18—19世纪',focus:'骨瓷与工业化',ai:'英国在18世纪以后发展出软质瓷和骨瓷等制造体系，并逐步形成工业化陶瓷生产。景德镇及中国外销瓷长期影响英国市场的器型、装饰和消费文化；英国本土制造则进一步通过材料创新和工业组织形成自己的陶瓷产业。',wiki:wiki('英国陶瓷')},
    '奥斯曼世界':{type:'国家·奥斯曼帝国',region:'伊兹尼克',era:'明',focus:'蓝白与彩釉陶器',ai:'奥斯曼伊兹尼克陶器形成独特的蓝白与彩釉装饰传统。中国青花瓷通过贸易进入伊斯兰世界，对视觉文化产生影响，但当地陶工以自身材料和图案传统进行转化。景德镇与伊兹尼克之间体现的是跨区域视觉语言传播，而不是单向复制。',wiki:wiki('伊兹尼克陶器')},
    '欧洲':{type:'区域·欧洲',region:'葡萄牙/荷兰等',era:'明',focus:'中国瓷器输入与消费文化',ai:'明代海上贸易扩大后，中国瓷器进入欧洲市场，成为收藏、宴饮和宫廷陈设的重要商品。景德镇青花尤其产生广泛影响。欧洲最初主要是输入和模仿，直到18世纪梅森等制造中心出现后，欧洲才建立自己的硬质瓷生产体系。',wiki:wiki('中国外销瓷')},
    '伊斯兰世界':{type:'区域·西亚/中东',region:'西亚',era:'唐—元',focus:'中国瓷器输入与地方陶瓷转化',ai:'唐宋元时期，中国瓷器通过陆海贸易进入伊斯兰世界，对釉陶、器型和装饰视觉产生影响。景德镇在元代青花成熟后逐渐成为这一交流网络的重要生产中心之一。西亚陶工则根据本地材料和审美进行转化，形成跨区域互动。',wiki:wiki('Islamic pottery')},
    '东南亚':{type:'区域·东南亚',region:'越南、泰国等',era:'唐—明',focus:'本土窑业与中国瓷器贸易',ai:'东南亚长期处于中国海上贸易网络中，本土窑业与输入中国瓷器并行发展。宋元以后，中国青瓷、青白瓷和青花等进入区域市场，景德镇逐渐成为重要供应者；越南、泰国等地也发展自己的窑业，并在器型和装饰上与中国形成互动。',wiki:wiki('Southeast Asian ceramics')}
  };
  const aliases={'越窑':'越窑','邢窑':'邢窑','长沙窑':'长沙窑','耀州窑':'耀州窑','定窑早期':'定窑','定窑':'定窑','汝窑':'汝窑','官窑':'官窑','哥窑':'哥窑','钧窑':'钧窑','钧窑系':'钧窑','龙泉窑':'龙泉窑','磁州窑':'磁州窑','德化窑':'德化窑','漳州窑':'漳州窑','宜兴窑':'宜兴窑','醴陵窑':'醴陵窑','石湾窑':'石湾窑','日本':'日本','高丽':'高丽','朝鲜·粉青沙器':'朝鲜·粉青沙器','日本·有田/伊万里':'日本·有田/伊万里','日本·九谷':'日本·九谷','梅森':'梅森','塞夫勒':'塞夫勒','英国':'英国','奥斯曼世界':'奥斯曼世界','欧洲':'欧洲','伊斯兰世界':'伊斯兰世界','东南亚':'东南亚'};
  const slug=s=>String(s).trim().toLowerCase().replace(/[·/\s]+/g,'-').replace(/[—–]+/g,'-').replace(/[^\w\u4e00-\u9fff-]/g,'').replace(/-+/g,'-');
  function keyFor(name){return aliases[name]||name}
  function decorateTimeline(){
    document.querySelectorAll('.compare-specimen').forEach(card=>{
      if(card.dataset.timelineEnhanced)return;
      const b=card.querySelector('.specimen-meta b');
      const name=b?.textContent.trim(); if(!name)return;
      const d=DATA[keyFor(name)]; if(!d)return;
      const a=document.createElement('a'); a.className='timeline-entry-link'; a.href=entry(slug(name)); a.innerHTML='打开详细条目 →';
      card.classList.add('timeline-interactive'); card.setAttribute('tabindex','0'); card.setAttribute('role','link'); card.dataset.timelineEnhanced='1'; card.dataset.timelineSlug=slug(name); card.appendChild(a);
      card.addEventListener('click',e=>{if(e.target.closest('a'))return;location.href=a.href});
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.href=a.href}});
    });
  }
  function renderDetail(){
    const root=document.querySelector('#wiki-entry-root'); if(!root)return false;
    const p=new URLSearchParams(location.search); if(p.get('type')!=='timeline')return false;
    const slugValue=p.get('slug')||''; const d=Object.values(DATA).find(x=>slug(x.name||'')===slugValue)||Object.values(DATA).find(x=>slug((x.region||''))===slugValue);
    const matchName=Object.keys(DATA).find(k=>slug(k)===slugValue); const item=d||DATA[matchName]; if(!item){root.innerHTML='<div class="notice"><b>时间轴条目不存在。</b><br><a href="'+ROOT+'museum/timeline/">返回历史时间轴 →</a></div>';return true}
    const title=matchName||item.name||item.region; const world=/国家|区域/.test(item.type);
    root.innerHTML='<article class="timeline-entry-detail"><header class="wiki-entry-header"><div><div class="wiki-kicker">'+esc(item.type)+' · HISTORICAL CERAMIC CONTEXT</div><h1>'+esc(title)+'</h1><div class="wiki-entry-tags"><span class="tag">'+esc(item.era)+'</span><span class="tag">'+esc(item.focus)+'</span></div></div><div class="wiki-entry-tools"><a class="md-button" href="'+ROOT+'museum/timeline/">← 返回时间轴</a></div></header><div class="timeline-detail-grid"><aside class="wiki-infobox"><div class="wiki-infobox-title">条目信息</div><dl><div><dt>类别</dt><dd>'+esc(item.type)+'</dd></div><div><dt>区域</dt><dd>'+esc(item.region)+'</dd></div><div><dt>时间</dt><dd>'+esc(item.era)+'</dd></div><div><dt>主题</dt><dd>'+esc(item.focus)+'</dd></div></dl></aside><div class="wiki-entry-body"><section class="ai-summary"><div class="ai-summary-head"><h2>🤖 AI '+(world?'地区陶瓷史':'窑址')+'总结</h2><span>AI 导览 · 仅作辅助阅读</span></div><p>'+esc(item.ai)+'</p><small>本段用于帮助读者快速建立历史关系；正式研究应以考古报告、博物馆资料和学术文献为准。</small></section><section class="timeline-jdz-relation"><h2>与景德镇的关系</h2><p>'+esc(item.ai)+'</p></section><section class="external-reference-panel"><h2>维基百科参考</h2><a href="'+esc(item.wiki)+'" target="_blank" rel="noopener">打开维基百科参考页面 ↗</a><small>维基百科用于辅助导航，不作为本馆条目的唯一证据来源。</small></section></div></div></article>';
    return true;
  }
  function boot(){if(renderDetail())return; decorateTimeline(); setTimeout(decorateTimeline,300);setTimeout(decorateTimeline,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  const mo=new MutationObserver(()=>decorateTimeline()); mo.observe(document.body,{childList:true,subtree:true});
})();
