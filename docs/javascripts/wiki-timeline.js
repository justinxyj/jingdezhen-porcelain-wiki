/* Comparative timeline projection for the public museum interface. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const eras=[['tang','唐','618–907','成熟白瓷、青瓷体系形成与跨区域交流'],['song','宋','960–1279','多窑系并立，器物审美与技术高度分化'],['yuan','元','1271–1368','青花与全球贸易网络发生关键变化'],['ming','明','1368–1644','御窑制度、青花与彩瓷体系高度发展'],['qing','清','1644–1911','粉彩、珐琅彩、颜色釉与全球消费市场扩张'],['modern','近现代','1911–至今','工业化、教育科研、艺术陶瓷与全球设计体系']];
  const url=e=>window.JDM_KNOWLEDGE?.url(e)||`/jingdezhen-porcelain-wiki/entry/?type=${encodeURIComponent(e.category)}&slug=${encodeURIComponent(e.slug)}`;
  const meta=e=>e?.zh?.meta||{};
  const title=e=>e?.zh?.title||e?.slug||'';
  const text=s=>{const d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||d.innerText||''};
  const validMedia=e=>{const m=e?.media?.[0];return m&&!window.JDM_MEDIA_POLICY?.isGenericPlaceholder?.(m)?m:null};
  const periodOf=e=>String(meta(e).map?.period||meta(e).period||'').trim();
  const timelineOf=e=>meta(e).timeline||[];
  const isPlace=e=>['窑址','窑业遗址','地点','城市'].includes(e.category||'')||meta(e).kind==='kiln';
  function node(e){
    const m=meta(e),map=m.map||{},im=validMedia(e),period=periodOf(e);
    const cls=`compare-node ${im?'has-media':'no-media'} ${isPlace(e)?'kiln':''}`;
    return `<a class="${cls}" data-entry-slug="${esc(e.slug)}" href="${url(e)}" aria-label="打开${esc(title(e))}">`+
      (im?`<div class="compare-node-media"><img src="${esc(im.path)}" alt="${esc(im.title||title(e))}" loading="lazy" decoding="async"></div>`:'')+
      `<div class="compare-node-body"><div class="compare-node-kicker">${esc(map.country||e.category||'')}</div><b>${esc(title(e))}</b>${period?`<strong class="compare-node-period">${esc(period)}</strong>`:''}<p>${esc(text(e.zh?.content||e.zh?.summary||''))}</p>${isPlace(e)?`<span class="compare-node-detail-hint">查看详细介绍 · 官方来源 →</span>`:''}</div></a>`;
  }
  function lane(label,rows,cls){return `<section class="compare-lane ${cls}"><header><span>${esc(label)}</span><b>${rows.length}</b></header><div class="compare-lane-grid">${rows.map(node).join('')||'<div class="compare-empty">这一时期暂无可展示的节点。</div>'}</div></section>`}
  function render(entries){
    let root=document.querySelector('.timeline-comparison-root');
    if(!root){root=document.getElementById('timeline');if(!root)return;root.classList.add('timeline-comparison-root');}
    root.innerHTML=eras.map(([id,era,years,focus])=>{
      const related=entries.filter(e=>timelineOf(e).some(t=>t.era===id));
      const jdz=related.filter(e=>timelineOf(e).some(t=>t.era===id&&t.lane==='jdz'));
      const china=related.filter(e=>timelineOf(e).some(t=>t.era===id&&t.lane==='china'));
      const world=related.filter(e=>timelineOf(e).some(t=>t.era===id&&t.lane==='world'));
      return `<article class="compare-era" id="era-${id}"><div class="compare-era-heading"><div><span>${esc(era)}</span><h2>${esc(years)}</h2><div class="compare-era-focus">${esc(focus)}</div></div><small>${related.length} 个历史节点</small></div><div class="compare-axis"><span>景德镇</span><i></i><span>中国其他窑业</span><i></i><span>世界</span></div>${lane('景德镇',jdz,'lane-jdz')}${lane('中国其他窑业',china,'lane-china')}${lane('世界其他地区',world,'lane-world')}</article>`;
    }).join('');
  }
  function init(){if(!window.JDM_KNOWLEDGE)return;window.JDM_KNOWLEDGE.all().then(render)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();