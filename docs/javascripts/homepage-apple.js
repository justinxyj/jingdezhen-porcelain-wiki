(function(){
  const init=()=>{
    const root=document.querySelector('.jdm-apple-home');
    if(!root)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items=[...root.querySelectorAll('.jdm-reveal')];
    if('IntersectionObserver' in window&&!reduce){
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -8% 0px'});
      items.forEach(x=>io.observe(x));
    }else items.forEach(x=>x.classList.add('is-visible'));

    root.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{
      const el=document.querySelector(a.getAttribute('href'));
      if(el){e.preventDefault();el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}
    }));

    const vessel=root.querySelector('.jdm-v2-hero-vessel');
    let ticking=false;
    const parallax=()=>{
      if(reduce||!vessel){ticking=false;return;}
      const y=Math.min(window.scrollY,700);
      vessel.style.transform=`translateX(-50%) translateY(${y*.055}px) rotate(${y*.004}deg)`;
      ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true;}},{passive:true});

    const sections=[...root.querySelectorAll('section[id]')];
    const navLinks=[...root.querySelectorAll('.jdm-nav-links a[data-scroll]')];
    if('IntersectionObserver' in window){
      const navIO=new IntersectionObserver(es=>es.forEach(e=>{
        if(!e.isIntersecting)return;
        navLinks.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+e.target.id));
      }),{threshold:.35});
      sections.forEach(s=>navIO.observe(s));
    }

    root.querySelectorAll('.jdm-v2-product, .jdm-world-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        if(reduce||window.innerWidth<850)return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`translateY(-7px) rotateX(${y*-1.5}deg) rotateY(${x*1.5}deg)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
