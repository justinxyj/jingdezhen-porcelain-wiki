/* Public museum image layer. */
(function(){
  // Images are governed by their source/review policy; do not hard-code-block a legitimate museum URL.
  function sanitizeImage(img){
    if(!img)return;
    const src=img.getAttribute('src')||'';
        img.setAttribute('loading','lazy');img.setAttribute('decoding','async');
    img.addEventListener('error',()=>{
      img.removeAttribute('src');img.setAttribute('data-image-invalid','1');
      img.closest('.official-gallery-card,.compare-node,.compare-specimen,.wiki-entry-cover')?.classList.add('image-unavailable');
    },{once:true});
  }
  function apply(){
    document.querySelectorAll('img').forEach(sanitizeImage);
    document.querySelectorAll('.official-museum-image').forEach(img=>{img.setAttribute('loading','lazy');img.setAttribute('decoding','async')});
    document.querySelectorAll('.compare-specimen.has-official-image').forEach(card=>{
      if(card.querySelector('.museum-image-credit'))return;
      const img=card.querySelector('img');const src=img?.dataset?.sourceUrl;if(!src)return;
      const credit=document.createElement('a');credit.className='museum-image-credit';credit.href=src;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent='查看馆藏来源 ↗';card.appendChild(credit);
    });
  }
  function init(){apply();window.setTimeout(apply,300);window.setTimeout(apply,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();