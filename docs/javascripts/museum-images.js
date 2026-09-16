/* Official museum image layer for the comparative timeline.
 * All image URLs below are served by The Metropolitan Museum of Art's
 * Collection API and are public-domain/Open Access images on the cited object records.
 */
(function(){
  const OFFICIAL = {
    '白瓷碗': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/78432/1582904/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Tang dynasty Xing ware jar, 7th–early 8th century',
      url:'https://www.metmuseum.org/art/collection/search/78432'
    },
    '长沙窑彩绘器': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/44347/174052/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Tang dynasty Changsha ware circular box, 9th century',
      url:'https://www.metmuseum.org/art/collection/search/44347'
    },
    '青白瓷梅瓶': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/50236/135438/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Southern Song Jingdezhen Qingbai flower-shaped vase, 12th century',
      url:'https://www.metmuseum.org/art/collection/search/50236'
    },
    '定窑刻花碗': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/44735/1460309/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Northern Song Ding ware dish, 11th century',
      url:'https://www.metmuseum.org/art/collection/search/44735'
    },
    '龙泉粉青碗': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/48390/194608/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Southern Song Longquan ware meiping vase, 13th century',
      url:'https://www.metmuseum.org/art/collection/search/48390'
    },
    '高丽青瓷': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/42307/73487/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Goryeo dynasty celadon maebyeong, 12th century',
      url:'https://www.metmuseum.org/art/collection/search/42307'
    },
    '元青花大罐': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/42490/177595/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Yuan dynasty Jingdezhen blue-and-white vase with lotus pond, first half of 14th century',
      url:'https://www.metmuseum.org/art/collection/search/42490'
    },
    '宣德青花': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/42497/1797383/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Ming Xuande Jingdezhen blue-and-white dish with dragon, 1426–1435',
      url:'https://www.metmuseum.org/art/collection/search/42497'
    },
    '粉彩瓷': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/48308/83774/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Qing Qianlong Jingdezhen famille rose vase, 1736–1795',
      url:'https://www.metmuseum.org/art/collection/search/48308'
    },
    '梅森瓷': {
      image:'https://collectionapi.metmuseum.org/api/collection/v1/iiif/201774/2477821/main-image',
      museum:'The Metropolitan Museum of Art',
      object:'Meissen porcelain plate, ca. 1733–1734',
      url:'https://www.metmuseum.org/art/collection/search/201774'
    }
  };

  function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}

  function applyOfficialImages(){
    document.querySelectorAll('.compare-specimen').forEach(card=>{
      const title=card.querySelector('.specimen-meta b')?.textContent?.trim();
      const data=OFFICIAL[title];
      if(!data) return;
      const stage=card.querySelector('.specimen-stage');
      if(!stage || card.classList.contains('has-official-image')) return;
      const img=document.createElement('img');
      img.className='official-museum-image';
      img.src=data.image;
      img.alt=`${title}｜${data.object}`;
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      img.addEventListener('error',()=>{img.remove();},{once:true});
      stage.replaceChildren(img);
      const source=document.createElement('a');
      source.className='museum-image-credit';
      source.href=data.url;
      source.target='_blank';
      source.rel='noopener noreferrer';
      source.innerHTML=`${esc(data.museum)} · Open Access / Public Domain`;
      card.appendChild(source);
      card.classList.add('has-official-image');
    });
  }

  function init(){
    window.setTimeout(applyOfficialImages,120);
    window.setTimeout(applyOfficialImages,900);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
