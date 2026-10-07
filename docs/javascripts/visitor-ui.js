/* Shared visitor interactions; public search reuses the existing knowledge store. */
(function () {
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const root = base.pathname;
  const safe = window.JDM_SAFE;
  let dataPromise, dialogCount=0;
  function loadData() {
    if (window.JDM_KNOWLEDGE) return Promise.resolve(window.JDM_KNOWLEDGE);
    if (!dataPromise) dataPromise = (async () => {
      for (const path of ['javascripts/runtime-config.js', 'vendor/supabase/supabase.min.js', 'javascripts/auth-manager.js', 'javascripts/data-contract.js', 'javascripts/knowledge-store.js']) {
        await new Promise((resolve, reject) => {
          const node = document.createElement('script');
          node.src = new URL(path, base).href;
          node.onload = resolve; node.onerror = () => { node.remove(); reject(new Error('资料服务连接失败')); };
          document.head.append(node);
        });
      }
      return window.JDM_KNOWLEDGE;
    })().catch(error => { dataPromise = null; throw error; });
    return dataPromise;
  }
  // Native dialogs supply focus containment, Escape and inert background across widgets.
  function dialog(title) {
    const previous = document.activeElement;
    const node = document.createElement('dialog'); node.className = 'visitor-dialog';
    const heading = document.createElement('h2'); heading.id = 'visitor-dialog-title-'+(++dialogCount); heading.textContent = title;
    node.setAttribute('aria-labelledby', heading.id);
    const close = document.createElement('button'); close.type = 'button'; close.className = 'visitor-close'; close.textContent = '关闭';
    close.addEventListener('click', () => node.close()); node.append(close, heading);
    node.addEventListener('click', event => { if (event.target === node) { const rect = node.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) node.close(); } });
    node.addEventListener('keydown', event => { if(event.key==='Escape'){event.preventDefault();event.stopPropagation();node.close();} });
    node.addEventListener('close', () => { node.remove(); previous?.focus?.(); }, { once: true });
    document.body.append(node);
    return node;
  }
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
    let timer, sequence = 0;
    input.addEventListener('input', () => {
      clearTimeout(timer); const seq = ++sequence, query = input.value.trim(); results.replaceChildren();
      if (!query) { status.textContent = '例如：青花、唐英、湖田窑'; return; }
      timer = setTimeout(async () => {
        status.textContent = '正在查找…';
        try {
          const store = await loadData(), entries = await store.searchEntries(query, { limit: 6 });
          if (seq !== sequence || !searchDialog.open) return;
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
  window.JDM_VISITOR = { loadData, dialog, root, openSearch };
  function init() {
    const host = document.querySelector('.md-header__inner') || document.querySelector('.wiki-chrome');
    if (host) { const button = document.createElement('button'); button.className = 'visitor-search-trigger'; button.type = 'button'; button.textContent = '搜索'; button.setAttribute('aria-label', '搜索（Ctrl 或 Command 加 K）'); button.addEventListener('click', openSearch); host.append(button); }
    document.addEventListener('keydown', event => {
      const editing = event.target.closest?.('input,textarea,select,[contenteditable="true"]');
      if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey)) { event.preventDefault(); openSearch(); }
    });
    const imageSelector='.wiki-entry-cover img,.official-gallery-card img,[data-zoom-image]';
    const prepareImages=()=>document.querySelectorAll(imageSelector).forEach(img=>{if(!img.closest('a')){img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','放大图片：'+img.alt);}});
    prepareImages();new MutationObserver(prepareImages).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
    document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches?.(imageSelector)){event.preventDefault();event.target.click();}});
    document.addEventListener('click', event => {
      const image = event.target.closest?.('.wiki-entry-cover img,.official-gallery-card img,.museum-gallery img,[data-zoom-image]');
      if (!image || event.target.closest('a')) return;
      const viewer = dialog(image.alt || '器物图片'); viewer.classList.add('visitor-image-viewer');
      const img = document.createElement('img'); img.src = image.currentSrc || image.src; img.alt = image.alt;
      const caption = document.createElement('p'); caption.textContent = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
      const zoom = document.createElement('button'); zoom.type = 'button'; zoom.textContent = '放大 / 适应窗口'; zoom.addEventListener('click', () => img.classList.toggle('is-zoomed'));
      viewer.append(zoom, img, caption);const source=image.dataset.sourceUrl||image.closest('figure')?.querySelector('a')?.href;if(source&&safe.safeHref(source)){const a=document.createElement('a');a.href=safe.safeHref(source);a.textContent='查看馆藏记录与图片来源 ↗';a.target='_blank';a.rel='noopener noreferrer';viewer.append(a);}viewer.showModal();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
