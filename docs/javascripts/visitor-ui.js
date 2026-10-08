/* Shared visitor interactions; public search reuses the existing knowledge store. */
(function () {
  const script=document.currentScript;if(!(script instanceof HTMLScriptElement))return;
  const base = new URL('../', script.src);
  const root = base.pathname;
  const safeCandidate=window.JDM_SAFE;if(!safeCandidate)return;const safe=safeCandidate;
  /** @type {Promise<NonNullable<Window['JDM_KNOWLEDGE']>>|null} */
  let dataPromise=null;let dialogCount=0;
  function loadData() {
    if (window.JDM_KNOWLEDGE) return Promise.resolve(window.JDM_KNOWLEDGE);
    if (!dataPromise) dataPromise = (async () => {
      for (const path of ['javascripts/runtime-config.js', 'vendor/supabase/supabase.min.js', 'javascripts/auth-manager.js', 'assets/source-references.js', 'javascripts/data-contract.js', 'javascripts/knowledge-store.js']) {
        await new Promise((resolve, reject) => {
          const node = document.createElement('script');
          node.src = new URL(path, base).href;
          node.onload=()=>resolve(undefined); node.onerror = () => { node.remove(); reject(new Error('资料服务连接失败')); };
          document.head.append(node);
        });
      }
      if(!window.JDM_KNOWLEDGE)throw new Error('资料服务未成功加载');return window.JDM_KNOWLEDGE;
    })().catch(error => { dataPromise = null; throw error; });
    return dataPromise;
  }
  // Native dialogs supply focus containment, Escape and inert background across widgets.
  /** @param {string} title */
  function dialog(title) {
    const previous = document.activeElement;
    const node = document.createElement('dialog'); node.className = 'visitor-dialog';
    const heading = document.createElement('h2'); heading.id = 'visitor-dialog-title-'+(++dialogCount); heading.textContent = title;
    node.setAttribute('aria-labelledby', heading.id);node.setAttribute('aria-modal','true');
    const close = document.createElement('button'); close.type = 'button'; close.className = 'visitor-close'; close.textContent = '关闭';
    close.addEventListener('click', () => node.close()); node.append(close, heading);
    node.addEventListener('click', event => { if (event.target === node) { const rect = node.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) node.close(); } });
    node.addEventListener('keydown', event => {
      if(event.key==='Tab') {
        const focusable=Array.from(node.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(el=>el instanceof HTMLElement&&el.getClientRects().length);
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&document.activeElement===first&&last instanceof HTMLElement){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last&&first instanceof HTMLElement){event.preventDefault();first.focus();}
      }
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();node.close();}
    });
    node.addEventListener('close', () => { node.remove(); if(previous instanceof HTMLElement||previous instanceof SVGElement)previous.focus(); }, { once: true });
    document.body.append(node);
    return node;
  }
  /** @type {HTMLDialogElement|undefined} */
  let searchDialog;
  function openSearch() {
    if (searchDialog?.open) return;
    searchDialog = dialog('搜索景德镇陶瓷');
    const form = document.createElement('form'); form.action = root + 'search/'; form.setAttribute('role', 'search');
    const label = document.createElement('label'); label.htmlFor = 'visitor-search'; label.textContent = '输入器物、人物、窑址或工艺';
    const input = document.createElement('input'); input.id = 'visitor-search'; input.name = 'q'; input.type = 'search'; input.autocomplete = 'off';
    const button = document.createElement('button'); button.textContent = '查看全部结果';
    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '例如：青花、唐英、湖田窑';
    const results = document.createElement('ul'); results.className = 'visitor-suggestions';
    form.append(label, input, button); searchDialog.append(form, status, results);
    /** @type {number|undefined} */ let timer;let sequence=0;
    input.addEventListener('input', () => {
      clearTimeout(timer); const seq = ++sequence, query = input.value.trim(); results.replaceChildren();
      if (!query) { status.textContent = '例如：青花、唐英、湖田窑'; return; }
      timer = setTimeout(async () => {
        status.textContent = '正在查找…';
        try {
          const store = await loadData(), entries = await store.searchEntries(query, { limit: 6 });
          if (seq !== sequence || !searchDialog?.open) return;
          status.textContent = entries.length ? '选择条目直接阅读，或查看全部结果。' : '没有直接匹配。试试“青花”或更短的名称。';
          for (const entry of entries) {
            const li = document.createElement('li'), a = document.createElement('a');
            a.href = safe.safeHref(store.url(entry)); a.textContent = `${entry.category || '条目'} · ${entry.zh?.title || entry.slug}`;
            li.append(a); results.append(li);
          }
        } catch (_) { if (seq === sequence) status.textContent = '联想暂时不可用，可以进入搜索页重试。'; }
      }, 180);
    });
    searchDialog.showModal(); input.focus();
  }
  /** @param {Element} host @param {'loading'|'error'|'empty'} kind @param {{message?:string,error?:unknown,retry?:()=>void}} [options] */
  function renderState(host,kind,options={}) {
    const box=document.createElement('div');box.className='visitor-state visitor-state-'+kind;
    box.setAttribute('role',kind==='error'?'alert':'status');
    const message=document.createElement('p');message.textContent=options.message||(kind==='loading'?'正在加载…':kind==='error'?'暂时无法加载':'暂无内容');box.append(message);
    if(kind==='error') {
      if(options.retry){const retry=document.createElement('button');retry.type='button';retry.textContent='重新加载';retry.addEventListener('click',options.retry);box.append(retry);}
      if(options.error){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='技术详情';details.append(summary,document.createTextNode(options.error instanceof Error?options.error.message:String(options.error)));box.append(details);}
    }
    host.replaceChildren(box);host.setAttribute('aria-busy',String(kind==='loading'));
  }
  function openFeedback(){
    const modal=dialog('反馈此页');const form=document.createElement('form');form.className='visitor-feedback-form';
    const title=document.querySelector('h1')?.textContent?.trim()||document.title;
    const url=document.querySelector('link[rel="canonical"]')?.getAttribute('href')||location.origin+location.pathname;
    const context=document.createElement('p');context.textContent=title+' · '+url;
    const notice=document.createElement('p');notice.textContent='无需 GitHub 账户。填写后可复制或下载反馈记录，转交项目维护者；本站暂未提供匿名自动接收服务。';
    const label=document.createElement('label');label.htmlFor='visitor-feedback-description';label.textContent='问题说明（必填）';
    const input=document.createElement('textarea');input.id=label.htmlFor;input.required=true;input.maxLength=5000;
    const sourceLabel=document.createElement('label');sourceLabel.htmlFor='visitor-feedback-source';sourceLabel.textContent='参考资料网址（选填）';
    const source=document.createElement('input');source.id=sourceLabel.htmlFor;source.type='url';
    const status=document.createElement('p');status.className='visitor-feedback-status';status.setAttribute('role','status');status.textContent='反馈记录尚未发送。';
    const text=()=>['页面：'+title,'地址：'+url,'问题：'+input.value.trim(),'参考资料：'+source.value.trim()].join('\n');
    const actions=document.createElement('div');actions.className='visitor-feedback-actions';
    const copy=document.createElement('button');copy.type='submit';copy.textContent='复制反馈记录';
    const download=document.createElement('button');download.type='button';download.textContent='下载反馈记录';
    form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;try{await navigator.clipboard.writeText(text());status.textContent='已复制，尚未发送。请转交项目维护者。';}catch{status.textContent='浏览器未允许复制，请使用下载反馈记录。';}});
    download.addEventListener('click',()=>{if(!form.reportValidity())return;const href=URL.createObjectURL(new Blob([text()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=href;a.download='陶瓷百科反馈.txt';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);status.textContent='已生成下载记录，尚未发送。请转交项目维护者。';});
    const optional=document.createElement('a');optional.textContent='使用 GitHub 反馈（可选）';optional.href='https://github.com/justinxyj/jingdezhen-porcelain-wiki/issues/new';optional.target='_blank';optional.rel='noopener noreferrer';
    actions.append(copy,download);form.append(context,notice,label,input,sourceLabel,source,actions,status,optional);modal.append(form);modal.showModal();input.focus();
  }
  window.JDM_VISITOR = { loadData, dialog, root, openSearch, renderState };
  function init() {
    document.addEventListener('click',event=>{if(event.target instanceof Element&&event.target.closest('.visitor-feedback a')){event.preventDefault();openFeedback();}});
    const host = document.querySelector('.md-header__inner') || document.querySelector('.visitor-static-nav');
    if (host) { const button = document.createElement('button'); button.className = 'visitor-search-trigger'; button.type = 'button'; button.textContent = '搜索'; button.setAttribute('aria-label', '搜索（Ctrl 或 Command 加 K）'); button.addEventListener('click', openSearch); const existing=host.querySelector('a[href$="/search/"]');if(existing)existing.replaceWith(button);else host.append(button); }
    const menu=(()=>{
      const label=document.querySelector('.md-header [for="__drawer"]');
      if(!(label instanceof HTMLLabelElement))return label;
      const button=document.createElement('button');button.type='button';
      for(const attr of label.attributes)button.setAttribute(attr.name,attr.value);
      button.append(...label.childNodes);label.replaceWith(button);return button;
    })(),drawer=document.getElementById('__drawer'),navigation=document.querySelector('.md-sidebar--primary');
    if(menu instanceof HTMLElement&&drawer instanceof HTMLInputElement&&navigation instanceof HTMLElement){
      navigation.id=navigation.id||'visitor-mobile-navigation';menu.tabIndex=0;menu.setAttribute('aria-controls',navigation.id);
      const initiallyHidden=navigation.hidden;
      const sync=()=>{navigation.hidden=initiallyHidden&&!drawer.checked;menu.setAttribute('aria-expanded',String(drawer.checked));menu.setAttribute('aria-label',drawer.checked?'关闭菜单':'打开菜单');};sync();drawer.addEventListener('change',sync);
      menu.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')event.stopPropagation();});
      menu.addEventListener('click',event=>{event.stopPropagation();drawer.checked=!drawer.checked;drawer.dispatchEvent(new Event('change'));if(drawer.checked)Array.from(navigation.querySelectorAll('a')).find(a=>a.getClientRects().length)?.focus();});
      document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(drawer.checked||(event.target instanceof Node&&navigation.contains(event.target)))){event.preventDefault();drawer.checked=false;drawer.dispatchEvent(new Event('change'));menu.focus();}});
    }
    document.addEventListener('keydown', event => {
      const editing=event.target instanceof Element?event.target.closest('input,textarea,select,[contenteditable="true"]'):null;
      if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey)) { event.preventDefault(); openSearch(); }
    });
    const imageSelector='.visitor-result-image,.wiki-entry-cover img,.official-gallery-card img,.museum-gallery img,.catalog-card img,.person-card img,.wiki-entry-explore-card img,.wiki-recommendation-card img,[data-zoom-image]';
    const prepareImages=()=>document.querySelectorAll(imageSelector).forEach(img=>{if(!(img instanceof HTMLImageElement))return;
      const anchor=img.closest('a');
      if(!anchor){img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','放大图片：'+img.alt);}
      else if(!img.dataset.viewerPrepared){
        img.dataset.viewerPrepared='true';
        const button=document.createElement('button');button.type='button';button.className='visitor-image-open';button.textContent='查看大图';button.setAttribute('aria-label','查看大图：'+img.alt);button.addEventListener('click',()=>openImage(img));anchor.after(button);
      }
    });
    prepareImages();new MutationObserver(prepareImages).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof HTMLImageElement&&event.target.matches(imageSelector)){event.preventDefault();event.target.click();}});
    document.addEventListener('click',event=>{
      if(!(event.target instanceof Element))return;const image=event.target.closest(imageSelector);if(!(image instanceof HTMLImageElement)||event.target.closest('a'))return;openImage(image);
    });
  }
  /** @param {HTMLImageElement} image */
  function openImage(image){
    const viewer=dialog(image.alt||'器物图片');viewer.classList.add('visitor-image-viewer');
    const viewport=document.createElement('div');viewport.className='visitor-image-viewport';
    const img=document.createElement('img');img.src=image.currentSrc||image.src;img.alt=image.alt;
    let scale=1;
    const update=()=>{
      if(!img.naturalWidth||!img.naturalHeight||!viewport.clientWidth)return;
      const limit=parseFloat(getComputedStyle(viewport).maxHeight)||window.innerHeight*.65;
      const fit=Math.min(viewport.clientWidth/img.naturalWidth,limit/img.naturalHeight);
      img.style.width=(img.naturalWidth*fit*scale)+'px';
      img.style.height=(img.naturalHeight*fit*scale)+'px';img.style.maxWidth='none';
      if(scale===1){viewport.scrollTop=0;viewport.scrollLeft=0;}
    };
    img.addEventListener('load',update);
    window.addEventListener('resize',update);
    viewer.addEventListener('close',()=>window.removeEventListener('resize',update),{once:true});
    const controls=document.createElement('div');controls.className='visitor-image-controls';controls.setAttribute('aria-label','图片缩放');
    /** @type {Array<[string,()=>void]>} */
    const actions=[['放大',()=>{scale=Math.min(4,scale+.25);}],['缩小',()=>{scale=Math.max(.5,scale-.25);}],['适应窗口',()=>{scale=1;}]];
    for(const [label,action] of actions){
      const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{action();update();});controls.append(button);
    }
    viewport.append(img);viewer.append(controls,viewport);
    const caption=document.createElement('p');caption.textContent=image.closest('figure')?.querySelector('figcaption')?.textContent||image.dataset.caption||image.alt;viewer.append(caption);
    const fields={era:'相关内容年代',creator:'作者',institution:'馆藏机构',sourceInstitution:'来源机构',license:'版权 / 使用条件',source:'来源'};
    for(const [key,label] of Object.entries(fields))if(image.dataset[key]){const p=document.createElement('p');p.textContent=label+'：'+image.dataset[key];viewer.append(p);}
    const source=image.dataset.sourceUrl||image.closest('figure')?.querySelector('a')?.href;
    if(source&&safe.safeHref(source)){const a=document.createElement('a');a.href=safe.safeHref(source);a.textContent='查看馆藏记录与图片来源 ↗';a.target='_blank';a.rel='noopener noreferrer';viewer.append(a);}viewer.showModal();update();

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
