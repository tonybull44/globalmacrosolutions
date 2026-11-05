/* ===== Movimiento GMS: scroll suave, anclas, aparición por secciones y demo viva ===== */
(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(pointer:fine)').matches;

  /* --- Scroll suave (Lenis) --- */
  var lenis=null;
  if(window.Lenis&&!reduce){
    lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true,syncTouch:false});
    window.__lenis=lenis;
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    if(root.classList.contains('gms-intro')){
      lenis.stop();
      new MutationObserver(function(m,o){if(!root.classList.contains('gms-intro')){lenis.start();o.disconnect()}}).observe(root,{attributes:true,attributeFilter:['class']});
    }
    document.querySelectorAll('[data-lenis-prevent-auto]').forEach(function(e){e.setAttribute('data-lenis-prevent','')});
  }

  /* --- Anclas de la misma página (con offset del menú) --- */
  var OFF=-96;
  function samePage(a){try{var u=new URL(a.href,location.href);return u.origin===location.origin&&u.pathname.replace(/index\.html$/,'')===location.pathname.replace(/index\.html$/,'')&&u.hash.length>1}catch(e){return false}}
  function go(hash,instant){var el=document.querySelector(hash);if(!el)return;
    if(lenis)lenis.scrollTo(el,{offset:OFF,immediate:!!instant});
    else{var y=el.getBoundingClientRect().top+scrollY+OFF;scrollTo({top:y,behavior:instant||reduce?'auto':'smooth'})}}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="#"]');if(!a||a.target==='_blank'||e.metaKey||e.ctrlKey)return;
    if(samePage(a)){var h=new URL(a.href,location.href).hash;if(!document.querySelector(h))return;e.preventDefault();history.pushState(null,'',h);go(h)}});
  if(location.hash.length>1)addEventListener('load',function(){setTimeout(function(){go(location.hash,true)},60)});

  /* --- Aparición por secciones --- */
  if(!reduce&&'IntersectionObserver' in window){
    var sel=['main section:not(.hero):not(.fq):not(.fx3) .wrap > .eb','main section:not(.hero):not(.fq):not(.fx3) .wrap > .h2','main section:not(.hero):not(.fq):not(.fx3) .wrap > h2',
      'main section:not(.hero):not(.fq):not(.fx3) .wrap > .sub','main section:not(.hero):not(.fq):not(.fx3) .wrap > .fine','.eco','.op-k','.op','.op-cta','.eco-head',
      '.gmods > div','.tl5-card','.path-card','.inv2 > *','.book','.tblwrap','.pdet','.op2 > *','.cierre-ctas','.net-vis'].join(',');
    var els=[].slice.call(document.querySelectorAll(sel)).filter(function(e){return !e.closest('[data-blur-reveal]')&&!e.hasAttribute('data-blur-reveal')&&!e.closest('.dm-wrap,.nav,template')});
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    var groups=new Map();
    els.forEach(function(e){var p=e.parentElement;var k=groups.get(p)||0;groups.set(p,k+1);
      e.style.setProperty('--rvd',Math.min(k,6)*0.07+'s');
      var r=e.getBoundingClientRect();if(r.top<innerHeight*.92&&r.bottom>0)return; // ya visible: no esconder
      e.classList.add('rv');io.observe(e)});
  }

  /* --- Panel demo de la Terminal: autoplay, ticker y datos vivos --- */
  var op=document.querySelector('.op'),tabs=[].slice.call(document.querySelectorAll('.stab'));
  if(op&&tabs.length&&!reduce){
    var AUTO=5200,timer=0,user=false,vis=false;
    op.style.setProperty('--auto',AUTO+'ms');
    tabs.forEach(function(t){var s=document.createElement('span');s.className='stab-prog';s.innerHTML='<i></i>';t.appendChild(s);
      t.addEventListener('click',function(e){if(e.isTrusted){user=true;op.classList.remove('auto');clearTimeout(timer)}})});
    function next(){if(user||!vis)return;var i=tabs.findIndex(function(t){return t.getAttribute('aria-selected')==='true'});
      var n=tabs[(i+1)%tabs.length];n.click();restart()}
    function restart(){clearTimeout(timer);if(user||!vis)return;op.classList.remove('auto');void op.offsetWidth;op.classList.add('auto');timer=setTimeout(next,AUTO)}
    new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)restart();else{clearTimeout(timer);op.classList.remove('auto')}},{threshold:.35}).observe(op);
    // ticker infinito
    var tk=op.querySelector('.ticker');
    if(tk){var tr=document.createElement('div');tr.className='tk-track';while(tk.firstChild)tr.appendChild(tk.firstChild);
      var cl=tr.cloneNode(true);[].slice.call(cl.children).forEach(function(c){c.setAttribute('aria-hidden','true');tr.appendChild(c)});tk.appendChild(tr)}
    // pequeñas variaciones de datos (demo)
    var bars=[].slice.call(op.querySelectorAll('#v1 .bar i')).map(function(b){return{el:b,base:parseFloat(b.style.width)||10}});
    var nums=[].slice.call(op.querySelectorAll('.ticker i'));
    setInterval(function(){if(!vis||document.hidden)return;
      bars.forEach(function(b){var v=Math.max(3,b.base+(Math.random()*6-3));b.el.style.width=v.toFixed(1)+'%'});
      var k=nums[Math.floor(Math.random()*nums.length)];if(k){k.classList.add('fl');setTimeout(function(){k.classList.remove('fl')},500)}
    },2200);
  }
})();
