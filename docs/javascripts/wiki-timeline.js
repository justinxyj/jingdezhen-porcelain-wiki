/* Comparative timeline projection of the canonical knowledge graph. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const eras=[['tang','唐 · 618–907','成熟白瓷、青瓷体系形成与跨区域交流'],['song','宋 · 960–1279','多窑系并立，器物审美与技术高度分化'],['yuan','元 · 1271–1368','青花与全球贸易网络发生关键变化'],['ming','明 · 1368–1644','御窑制度、青花与彩瓷体系高度发展'],['qing','清 · 1644–1911','粉彩、珐琅彩、颜色釉与全球消费市场扩张'],['modern','近现代 · 1911–至今','工业化、教育科研、艺术陶瓷与全球设计体系']];
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`;
  const meta=e=>e?.zh?.meta||{};
  const text=e=>e?.zh?.summary||e?.zh?.content||'';
  const title=e=>e?.zh?.title||e?.slug||'';
  function node(e){const m=meta(e),map=m.map||{},im=e.media?.[0];return `<a class="compare-node" data-entry-slug="${esc(e.slug)}" href="${url(e)}" aria-label="打开${esc(title(e))}"><div class="compare-node-media">${im?`<img src="${esc(im.path)}" alt="${esc(im.title||title(e))}" loading="lazy">`:'<span>暂无图片</span>'}</div><b>${esc(title(e))}</b><small>${esc(map.country||e.category||'')}</small><strong>${esc(map.period||m.period||'')}</strong><p>${esc(text(e))}</p><span class="compare-node-action">查看知识条目 →</span></a>`}
  function lane(label,rows,cls){return `<section class="compare-lane ${cls}"><header><span>${esc(label)}</span><b>${rows.length}</b></header><div class="compare-lane-grid">${rows.map(node).join('')||'<div class="compare-empty">这一时期暂未建立对应后端条目。</div>'}</div></section>`}
  function works(rows){if(!rows.length)return '';return `<section class="compare-works"><header><span>同期代表性器物</span><small>点击进入同一器物知识条目</small></header><div class="compare-specimen-grid">${rows.slice(0,6).map(e=>`<a class="compare-specimen" href="${url(e)}"><div class="specimen-stage">${e.media?.[0]?`<img src="${esc(e.media[0].path)}" alt="${esc(e.media[0].title||title(e))}" loading="lazy">`:''}</div><div class="specimen-meta"><b>${esc(title(e))}</b><small>${esc(meta(e).map?.country||'景德镇')}</small><span>${esc(meta(e).craft||e.category)}</span><p>${esc(text(e))}</p></div></a>`).join('')}</div></section>`}
  function render(entries){
    let root=document.querySelector('.timeline-comparison-root');
    if(!root){root=document.getElementById('timeline');if(!root)return;root.classList.add('timeline-comparison-root');}
    root.innerHTML=eras.map(([id,period,focus])=>{const related=entries.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id));const jdz=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='jdz'));const china=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='china'));const world=related.filter(e=>(meta(e).timeline||[]).some(t=>t.era===id&&t.lane==='world'));const objs=entries.filter(e=>meta(e).kind==='object'&&(meta(e).timeline||[]).some(t=>t.era===id));return `<article class="compare-era" id="era-${id}"><div class="compare-era-heading"><div><span>${esc(period)}</span><h2>${esc(focus)}</h2></div><small>${related.length} 个后端知识条目</small></div><div class="compare-axis"><span>景德镇</span><i></i><span>中国其他窑业</span><i></i><span>世界</span></div>${lane('景德镇',jdz,'lane-jdz')}${lane('中国其他窑业',china,'lane-china')}${lane('世界其他地区',world,'lane-world')}${works(objs)}</article>`}).join('');
  }
  async function init(){if(!window.JDM_KNOWLEDGE)return;render(await window.JDM_KNOWLEDGE.all())}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
