/* One accessible detail dialog; links remain usable before enhancement. */
(function () {
  const esc = value => window.JDM_SAFE.esc(value);
  const href = value => window.JDM_SAFE.safeHref(value);
  const plain = value => { const node = document.createElement('div'); node.innerHTML = String(value || ''); return node.textContent || ''; };
  function open(entry) {
    const ui = window.JDM_VISITOR; if (!ui) { location.href = window.JDM_KNOWLEDGE.url(entry); return; }
    const meta = entry.zh?.meta || {}, context = entry.timelineContext || {};
    const modal = ui.dialog(entry.zh?.title || entry.slug);
    const media = (entry.media || []).find(m => window.JDM_MEDIA_POLICY.isUsable(m));
    const image = href(context.official_image_url || media?.path || '');
    const body = document.createElement('div');
    const relation = context.relationship_to_jingdezhen || meta.relation_to_jingdezhen || meta.jingdezhen_relation;
    const sources = entry.zh?.sources?.length ? entry.zh.sources : entry.sources || [];
    const unique = new Set();
    const sourceLinks = sources.filter(s => s && (!s.status || s.status === 'published') && href(s.url) && !unique.has(s.url) && unique.add(s.url)).slice(0,5);
    body.innerHTML = `<p>${esc(meta.period || meta.map?.period || '')}</p>${image ? `<figure><img class="visitor-detail-image" data-zoom-image src="${image}" alt="${esc(media?.title || context.official_image_credit || entry.zh?.title)}"><figcaption>${esc(context.official_image_credit || media?.source || '')}</figcaption></figure>` : '<p class="visitor-missing-image">暂无公开图片。图片需具备可追溯来源与使用许可。</p>'}<p>${esc(plain(context.official_summary || entry.zh?.summary || entry.zh?.content).slice(0,600))}</p><p><a class="visitor-primary" href="${href(window.JDM_KNOWLEDGE.url(entry))}">阅读全文 →</a></p>${relation ? `<h3>与景德镇的关系</h3><p>${esc(relation)}</p>` : ''}<p><a href="${ui.root}network/relations/?node=${encodeURIComponent('entry:'+entry.id)}">查看相关人物、器物与窑址 →</a></p><details><summary>资料来源（${sourceLinks.length}）</summary><ul>${sourceLinks.map(s=>`<li><a href="${href(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.title||'来源')} ↗</a></li>`).join('')}</ul></details>`;
    modal.append(body); modal.showModal();
  }
  function init() {
    const root = document.querySelector('.timeline-comparison-root'); if (!root || !window.JDM_KNOWLEDGE) return;
    window.JDM_KNOWLEDGE.all().then(entries => {
      const bySlug = new Map(entries.map(e=>[e.slug,e]));
      root.addEventListener('click', event => {
        const link = event.target.closest('[data-entry-slug]');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const entry = bySlug.get(link.dataset.entrySlug); if (!entry) return;
        event.preventDefault(); open(entry);
      });
    }).catch(()=>{}); // Original entry links are the fallback.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
