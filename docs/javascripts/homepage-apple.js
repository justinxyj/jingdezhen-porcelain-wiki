(function(){
  const init=()=>{
    const root=document.querySelector('.jdm-apple-home');
    if(!root)return;
    const items=[...root.querySelectorAll('.jdm-reveal')];
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
      items.forEach(x=>io.observe(x));
    }else items.forEach(x=>x.classList.add('is-visible'));
    const nav=[...root.querySelectorAll('.jdm-nav-links a[data-scroll]')];
    nav.forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'})}}));
    const hero=root.querySelector('.jdm-apple-hero');
    const object=root.querySelector('.jdm-hero-object img');
    if(hero&&object&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      window.addEventListener('scroll',()=>{const y=Math.min(window.scrollY,520);object.style.transform=`translateY(${-y*.035}px) rotate(${y*.006}deg) scale(${1+y*.00012})`},{passive:true});
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
