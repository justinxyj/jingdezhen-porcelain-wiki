/* Museum image recovery: only marked/known museum images use external recovery. */
(function(){
  const RECOVERED='imageRecovered',MAX_CONCURRENCY=3,REQUEST_TIMEOUT=8000,NEGATIVE_TTL=120000;
  /** @type {Map<string,Promise<string|null>>} */
  const cache=new Map();
  /** @type {Map<string,number>} */
  const negative=new Map();
  /** @type {Array<{task:()=>Promise<void>,resolve:(value:unknown)=>void}>} */
  const queue=[];let active=0,applyQueued=false;
  const pageController=new AbortController();
  window.addEventListener('pagehide',()=>pageController.abort(),{once:true});
  /** @param {HTMLImageElement} img */
  const isMuseumImage=img=>!!img&&(img.matches?.('[data-museum-image],.official-museum-image')||!!img.closest?.('.official-gallery-card,.wiki-entry-cover,.jdm-timeline-image,.compare-specimen.has-official-image')||!!img.dataset.sourceUrl);
  /** @param {unknown} src */
  function metObjectId(src){return String(src||'').match(/collectionapi\.metmuseum\.org\/api\/collection\/v1\/iiif\/(\d+)\//i)?.[1]||''}
  /** @param {unknown} src */
  function metObjectIdFromSource(src){return String(src||'').match(/metmuseum\.org\/art\/collection\/search\/(\d+)/i)?.[1]||''}
  /** @param {HTMLImageElement} img */
  function setVisible(img){img.removeAttribute('data-image-invalid');img.classList.remove('jdm-image-recovering');img.style.visibility='visible'}
  /** @param {HTMLImageElement} img @param {string} label */
  function setFallback(img,label){const safe=String(label||'景德镇陶瓷').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]||m));const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#eef3f8"/><path d="M470 610c0-150 50-235 130-235s130 85 130 235" fill="#d8e1ea"/><path d="M500 610h200M520 375c20-70 55-105 80-105s60 35 80 105" fill="none" stroke="#7d91a5" stroke-width="18"/><text x="600" y="700" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#53687d">'+safe+'</text><text x="600" y="742" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#8192a3">图片来源暂不可用</text></svg>';img.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);img.dataset.imageFallback='1';setVisible(img)}
  /** @param {number} ms */
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  /** @param {string} url @returns {Promise<{primaryImageSmall?:string,primaryImage?:string}|null>} */
  async function requestJson(url,attempt=0){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
    const abort=()=>controller.abort();pageController.signal.addEventListener('abort',abort,{once:true});
    try{
      const r=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});
      if((r.status===429||r.status>=500)&&attempt<1&&!pageController.signal.aborted){clearTimeout(timer);await sleep(500);return requestJson(url,attempt+1)}
      if(!r.ok)return null;return await r.json();
    }catch(_){if(attempt<1&&!pageController.signal.aborted){await sleep(500);return requestJson(url,attempt+1)}return null}
    finally{clearTimeout(timer);pageController.signal.removeEventListener('abort',abort)}
  }
  /** @param {unknown} id */
  function validMetId(id){return /^\d{1,8}$/.test(String(id||''))}
  /** @param {string} id @returns {Promise<string|null>} */
  async function fetchMetImage(id){
    if(!validMetId(id))return null;
    const key='met:'+id,now=Date.now();
    if(negative.has(key)&&(negative.get(key)||0)>now)return null;if(negative.has(key))negative.delete(key);
    const cached=cache.get(key);if(cached)return cached;
    const p=requestJson('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+encodeURIComponent(id)).then(j=>j?.primaryImageSmall||j?.primaryImage||null);
    cache.set(key,p);const value=await p;if(!value){negative.set(key,Date.now()+NEGATIVE_TTL);cache.delete(key)}return value;
  }
  /** @param {()=>Promise<void>} task */
  function enqueue(task){return new Promise(resolve=>{queue.push({task,resolve});pump()})}
  function pump(){while(active<MAX_CONCURRENCY&&queue.length){const item=queue.shift();if(!item)return;active++;Promise.resolve().then(item.task).then(item.resolve,item.resolve).finally(()=>{active--;pump()})}}
  /** @param {HTMLImageElement} img */
  async function recoverNow(img){
    if(!img||img.dataset[RECOVERED]||img.dataset.imageFallback||!isMuseumImage(img))return;
    img.dataset[RECOVERED]='1';img.classList.add('jdm-image-recovering');img.style.visibility='hidden';
    const original=img.dataset.originalSrc||img.currentSrc||img.getAttribute('src')||'';
    const sourceUrl=img.dataset.sourceUrl||img.closest('[data-source-url]')?.getAttribute('data-source-url')||'';
    const objectId=metObjectId(original)||metObjectIdFromSource(sourceUrl);
    const label=(img.getAttribute('alt')||'').replace(/\s*·\s*The Met Open Access.*$/i,'').trim();
    // Recover only the same accession record. Search results can depict a different object.
    const next=await fetchMetImage(objectId);
    if(next&&next!==original){
      img.addEventListener('load',()=>setVisible(img),{once:true});
      img.addEventListener('error',()=>setFallback(img,label),{once:true});
      img.src=next;return;
    }
    setFallback(img,label||'景德镇陶瓷');
  }
  /** @param {HTMLImageElement} img */
  function recover(img){return enqueue(()=>recoverNow(img))}
  /** @param {HTMLImageElement} img */
  function bind(img){if(!img||img.dataset.imageBound||!isMuseumImage(img))return;img.dataset.imageBound='1';img.dataset.originalSrc=img.getAttribute('src')||'';if(img.getAttribute('loading')!=='eager'&&img.getAttribute('fetchpriority')!=='high')img.setAttribute('loading','lazy');img.setAttribute('decoding','async');img.setAttribute('referrerpolicy','no-referrer');img.addEventListener('error',()=>recover(img));if(img.complete&&img.naturalWidth===0&&img.getAttribute('src'))recover(img)}
  /** @param {Node} root */
  function scan(root){
    if(root instanceof HTMLImageElement)bind(root);
    if(root instanceof Element||root instanceof Document)root.querySelectorAll('img').forEach(bind);
  }
  function init(){scan(document);new MutationObserver(mutations=>{mutations.forEach(m=>m.addedNodes.forEach(scan));}).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();