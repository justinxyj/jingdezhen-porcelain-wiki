/* Comparative timeline projection for the public museum interface. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const eras=[['tang','唐 · 618–907','成熟白瓷、青瓷体系形成与跨区域交流'],['song','宋 · 960–1279','多窑系并立，器物审美与技术高度分化'],['yuan','元 · 1271–1368','青花与全球贸易网络发生关键变化'],['ming','明 · 1368–1644','御窑制度、青花与彩瓷体系高度发展'],['qing','清 · 1644–1911','粉彩、珐琅彩、颜色釉与全球消费市场扩张'],['modern','近现代 · 1911–至今','工业化、教育科研、艺术陶瓷与全球设计体系']];
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`;
  const meta=e=>e?.zh?.meta||{};
  const text=e=>{const v=e?.zh?.content||e?.zh?.summary||'';const d=document.createElement('div');d.innerHTML=String(v);return d.textContent||d.innerText||''};
  const title=e=>e?.zh?.title||e?.slug||'';
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  function node(e){
    const m=meta(e),map=m.map||{},im=validMedia(e);
    return `<a class="compare-node ${im?'has-media':'no-media'}" data-entry-slug="${esc(e.slug)}" href="${url(e)}" aria-label="打开${esc(title(e))}">
      ${im?`<div class="compare-node-media"><img src="${esc(im.path)}" alt="${esc(im.title||title(e))}" loading="lazy"></div>`:''}
      <div class="compare-node-body"><div class="compare-node-kicker">${esc(map.country||e.category||'')}</div><b>${esc(title(e))}</b><strong>${esc(map.period||m.period||'')}</strong><p>${esc(text(e))}</p></div>
    </a>`;
  }
  function lane(label,rows,cls){return `<section class="compare-lane ${cls}"><header><span>${esc(label)}</span><b>${rows.length}</b></header><div class="compare-lane-grid">${rows.map(node).join('')||'<div class="compare-empty">这一时期暂无可展示的节点。</div>'}</div></section>`}
  function works(rows){
    if(!rows.length)return '';
    const usable=rows.slice(0,6);
    return `<section class="compare-works"><header><span>同期代表性器物</span><small>点击进入器物详情</small></header><div class="compare-specimen-grid">${usable.map(e=>{const im=validMedia(e);return `<a class="compare-specimen" href="${url(e)}">${im?`<div class="specimen-stage"><img src="${esc(im.path)}" alt="${esc(im.title||title(e))}" loading="lazy"></div>`:''}<div class="specimen-meta"><b>${esc(title(e))}</b><small>${esc(meta(e).map?.country||'景德镇')}</small><span>${esc(meta(e).craft||e.category)}</span><p>${esc(text(e))}</p></div></a>`}).join('')}</div></section>`;
  }
  function render(entries){
    let root=document.querySelector('.timeline-comparison-root');
    if(!root){root=document.getElementById('timeline');if(!root)return;root.classList.add('timeline-comparison-root');}
    root.innerHTML=eras.map(([id,period,focus])=>{
      const related=entries.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id));
      const jdz=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='jdz'));
      const china=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='china'));
      const world=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='world'));
      const objs=entries.filter(e=>meta(e).kind==='object'&&(meta(e).timeline||[]).some(t=>t.era===id));
      return `<article class="compare-era" id="era-${id}"><div class="compare-era-heading"><div><span>${esc(period)}</span><h2>${esc(focus)}</h2></div><small>${related.length} 个历史节点</small></div><div class="compare-axis"><span>景德镇</span><i></i><span>中国其他窑业</span><i></i><span>世界</span></div>${lane('景德镇',jdz,'lane-jdz')}${lane('中国其他窑业',china,'lane-china')}${lane('世界其他地区',world,'lane-world')}${works(objs)}</article>`;
    }).join('');
  }
  function init(){if(!window.JDM_KNOWLEDGE)return;window.JDM_KNOWLEDGE.all().then(render)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();