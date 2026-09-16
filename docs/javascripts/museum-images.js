/* Public museum image layer.
 * Uses only canonical media rendered by the page; no hidden data-copy overrides.
 */
(function(){
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  function applyCredits(){
    document.querySelectorAll('.official-museum-image').forEach(img=>{
      img.setAttribute('loading','lazy');
      img.setAttribute('decoding','async');
    });
    document.querySelectorAll('.compare-specimen.has-official-image').forEach(card=>{
      if(card.querySelector('.museum-image-credit'))return;
      const img=card.querySelector('img');
      const src=img?.dataset?.sourceUrl;
      if(!src)return;
      const credit=document.createElement('a');
      credit.className='museum-image-credit';
      credit.href=src;
      credit.target='_blank';
      credit.rel='noopener noreferrer';
      credit.textContent='查看馆藏来源 ↗';
      card.appendChild(credit);
    });
  }
  function init(){applyCredits();window.setTimeout(applyCredits,300);window.setTimeout(applyCredits,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
