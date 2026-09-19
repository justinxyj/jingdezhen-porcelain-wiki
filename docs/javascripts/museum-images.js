/* Public museum image layer: bounded recovery queue, timeout, deduplication, and safe fallback. */
(function(){
  const RECOVERED='data-image-recovered';
  const MAX_CONCURRENCY=3;
  const REQUEST_TIMEOUT=8000;
  const cache=new Map();
  const queue=[];
  let active=0;
  let applyQueued=false;

  function metObjectId(src){
    const m=String(src||'').match(/collectionapi\.metmuseum\.org\/api\/collection\/v1\/iiif\/(\d+)\//i);
    return m?.[1]||'';
  }
  function metObjectIdFromSource(src){
    const m=String(src||'').match(/metmuseum\.org\/art\/collection\/search\/(\d+)/i);
    return m?.[1]||'';
  }
  function setVisible(img){
    img.removeAttribute('data-image-invalid');
    img.classList.remove('jdm-image-recovering');
    img.style.visibility='visible';
  }
  function setFallback(img,label){
    const safe=String(label||'景德镇陶瓷').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#eef3f8"/><path d="M470 610c0-150 50-235 130-235s130 85 130 235" fill="#d8e1ea"/><path d="M500 610h200M520 375c20-70 55-105 80-105s60 35 80 105" fill="none" stroke="#7d91a5" stroke-width="18"/><text x="600" y="700" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#53687d">'+safe+'</text><text x="600" y="742" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#8192a3">图片来源暂不可用</text></svg>';
    img.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
    img.dataset.imageFallback='1';
    setVisible(img);
  }
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
  async function requestJson(url,attempt=0){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
    try{
      const r=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});
      if((r.status===429||r.status>=500)&&attempt<1){clearTimeout(timer);await sleep(500);return requestJson(url,attempt+1)}
      if(!r.ok)return null;
      return await r.json();
    }catch(_){
      if(attempt<1){await sleep(500);return requestJson(url,attempt+1)}
      return null;
    }finally{clearTimeout(timer)}
  }
  async function fetchMetImage(objectId){
    if(!objectId)return null;
    const key='met:'+objectId;
    if(cache.has(key))return cache.get(key);
    const p=requestJson('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+encodeURIComponent(objectId)).then(j=>j?.primaryImageSmall||j?.primaryImage||null);
    cache.set(key,p);
    return p;
  }
  async function fetchCommonsImage(query){
    if(!query)return null;
    const key='commons:'+query;
    if(cache.has(key))return cache.get(key);
    const api='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query)+'&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*';
    const p=requestJson(api).then(j=>{
      const page=Object.values(j?.query?.pages||{})[0];
      const info=page?.imageinfo?.[0];
      return info?.thumburl||info?.url||null;
    });
    cache.set(key,p);
    return p;
  }
  function enqueue(task){
    return new Promise(resolve=>{
      queue.push({task,resolve});
      pump();
    });
  }
  function pump(){
    while(active<MAX_CONCURRENCY&&queue.length){
      const item=queue.shift();active++;
      Promise.resolve().then(item.task).then(item.resolve,item.resolve).finally(()=>{active--;pump()});
    }
  }
  async function recoverNow(img){
    if(!img||img.dataset[RECOVERED]||img.dataset.imageFallback)return;
    img.dataset[RECOVERED]='1';
    img.classList.add('jdm-image-recovering');
    img.setAttribute('referrerpolicy','no-referrer');
    const original=img.dataset.originalSrc||img.currentSrc||img.getAttribute('src')||'';
    const sourceUrl=img.dataset.sourceUrl||img.closest('[data-source-url]')?.dataset.sourceUrl||'';
    const objectId=metObjectId(original)||metObjectIdFromSource(sourceUrl);
    let next=await fetchMetImage(objectId);
    if(next){img.addEventListener('load',()=>setVisible(img),{once:true});img.src=next;return}
    const label=(img.getAttribute('alt')||'').replace(/\s*·\s*The Met Open Access.*$/i,'').trim();
    next=await fetchCommonsImage(objectId?('Met object ID '+objectId):label);
    if(!next&&label)next=await fetchCommonsImage(label+' porcelain ceramics');
    if(next){img.addEventListener('load',()=>setVisible(img),{once:true});img.src=next;return}
    setFallback(img,label||'景德镇陶瓷');
  }
  function recover(img){return enqueue(()=>recoverNow(img))}
  function sanitizeImage(img){
    if(!img||img.dataset.imageBound)return;
    img.dataset.imageBound='1';
    img.dataset.originalSrc=img.getAttribute('src')||'';
    img.setAttribute('loading','lazy');
    img.setAttribute('decoding','async');
    img.setAttribute('referrerpolicy','no-referrer');
    img.addEventListener('error',()=>recover(img),{once:false});
    if(img.complete&&img.naturalWidth===0&&img.getAttribute('src'))recover(img);
  }
  function apply(){
    applyQueued=false;
    document.querySelectorAll('img').forEach(sanitizeImage);
    document.querySelectorAll('.official-museum-image').forEach(img=>{img.setAttribute('loading','lazy');img.setAttribute('decoding','async');img.setAttribute('referrerpolicy','no-referrer')});
    document.querySelectorAll('.compare-specimen.has-official-image').forEach(card=>{
      if(card.querySelector('.museum-image-credit'))return;
      const img=card.querySelector('img');const src=img?.dataset?.sourceUrl;if(!src)return;
      const credit=document.createElement('a');credit.className='museum-image-credit';credit.href=src;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='查看馆藏来源 ↗';card.appendChild(credit);
    });
  }
  function scheduleApply(){
    if(applyQueued)return;
    applyQueued=true;
    (window.requestAnimationFrame||setTimeout)(apply,0);
  }
  function init(){
    apply();
    new MutationObserver(scheduleApply).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();