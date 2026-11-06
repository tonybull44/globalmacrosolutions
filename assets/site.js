document.documentElement.classList.add('js');
// Tabs de operación
const tabs=[...document.querySelectorAll('.stab')];
function showView(v){
  tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.v===v?'true':'false'));
  document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id===v));
  document.querySelectorAll('.side span[data-s]').forEach(s=>s.classList.toggle('on',s.dataset.s===v));
}
tabs.forEach(t=>t.addEventListener('click',()=>showView(t.dataset.v)));
// Tabla de planes
const P=[
 {k:'Gratuito · USD 0',h:'Club de Traders',p:'Tu primer contacto con el ecosistema.',l:['Introducción a macroeconomía','Comunidad','Canales de análisis','Sesiones abiertas']},
 {k:'USD 202 / mes',h:'Plan Mensual',p:'Global Macro Terminal, de acuerdo con las condiciones del plan.',l:['Herramientas de análisis y acceso a la Terminal','Sesiones de operativa e ideas de trading','Comunidad','Formación integrada con Cronoss']},
 {k:'USD 1,210 / semestre',h:'Acelerador',p:'Todo lo incluido en el Plan Mensual, más:',l:['Formación macroeconómica avanzada','Metodología del Acelerador','Sesiones grupales','Seguimiento']},
 {k:'USD 2,310 / año',h:'Trading Floor',p:'Todo lo incluido en el Acelerador, más:',l:['Reuniones individuales de seguimiento','Acceso anticipado a herramientas','Evaluación para programas profesionales']}
];
const det=document.getElementById('pdet'), rows=[...document.querySelectorAll('#plans tr')];
let cur=1;(window.GMS_HOOKS||[]).push(()=>plan(cur));
function plan(i){if(!det)return;
  rows.forEach(r=>r.classList.toggle('on',+r.dataset.p===i));
  const t=window.T||(x=>x);const d0=P[i],d={k:t(d0.k),h:t(d0.h),p:t(d0.p),l:d0.l.map(t)};cur=i;
  det.innerHTML=`<div class="it"><span class="k">${d.k}</span><h4>${d.h}</h4><p>${d.p}</p></div><div class="it"><span class="k">${t('Incluye')}</span><ul>${d.l.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="it"><a class="btn btn-black" href="${i===0?'https://comunidad.globalmacroterminal.com':i===2?'https://acelerador.globalmacroterminal.com':'https://www.globalmacroterminal.com/'}">${i===0?t('Únete gratis'):t('Elegir')+' '+d.h} →</a></div>`;
}
rows.forEach(r=>{r.addEventListener('click',()=>plan(+r.dataset.p));r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();plan(+r.dataset.p)}})});
if(det)plan(1);
// Menú direccional (port de Directional Menu · 21st.dev)
(function(){
  const g=window.gsap;
  const EASE='power2.inOut', DUR=.35, DIST=100, CLOSE_DELAY=80, FADE_DELAY=.06, FADE_DUR=.18;
  const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar=document.getElementById('dmBar'), wrap=document.getElementById('dmWrap'), viewport=document.getElementById('dmViewport');
  const trigs=[...document.querySelectorAll('.dm-trig[data-i]')], plain=[...document.querySelectorAll('.dm-link')];
  const tpl=i=>document.getElementById('tpl-'+i).content.cloneNode(true);
  let isOpen=false,current=null,animating=false,queued=null,curPane=null,timer=null;

  function highlight(i){trigs.forEach(t=>{const on=+t.dataset.i===i;t.classList.toggle('is-active',on);t.setAttribute('aria-expanded',on&&isOpen?'true':'false')});}
  function makePane(i){const p=document.createElement('div');p.className='dm-pane';p.appendChild(tpl(i));return p;}
  function clearTimer(){if(timer){clearTimeout(timer);timer=null}}
  function scheduleClose(){clearTimer();timer=setTimeout(close,CLOSE_DELAY)}

  function open(i){
    isOpen=true;current=i;queued=null;animating=false;
    viewport.innerHTML='';curPane=makePane(i);viewport.appendChild(curPane);
    wrap.classList.add('is-open');highlight(i);
    if(!g){wrap.style.height='auto';wrap.style.opacity=1;return}
    g.killTweensOf([wrap,viewport]);
    const h=curPane.offsetHeight;
    if(reduce()){g.set(wrap,{height:'auto',opacity:0});g.set(viewport,{height:h,opacity:1});g.to(wrap,{opacity:1,duration:.16});return}
    g.set(wrap,{height:0,opacity:1});g.set(viewport,{height:h,opacity:0});
    g.timeline().to(wrap,{height:'auto',duration:DUR,ease:EASE},0).to(viewport,{opacity:1,duration:FADE_DUR,ease:'power2.out'},FADE_DELAY);
  }
  function close(){
    clearTimer();if(!isOpen)return;
    const done=()=>{isOpen=false;current=null;animating=false;queued=null;viewport.innerHTML='';wrap.classList.remove('is-open');highlight(null)};
    trigs.forEach(t=>t.setAttribute('aria-expanded','false'));
    if(!g){wrap.style.height=0;wrap.style.opacity=0;done();return}
    g.killTweensOf([wrap,viewport]);
    if(reduce()){g.to(wrap,{opacity:0,duration:.16,onComplete:()=>{g.set(wrap,{height:0});done()}});return}
    g.to(wrap,{opacity:0,height:0,duration:DUR,ease:EASE,onComplete:done});
  }
  function switchTo(i){
    clearTimer();highlight(i);
    if(!isOpen||current===null){open(i);return}
    if(i===current&&!animating)return;
    if(animating){queued=i;return}
    const dir=i>current?1:-1, next=makePane(i), cur=curPane;
    viewport.appendChild(next);
    const ch=cur.offsetHeight, nh=next.offsetHeight;
    animating=true;
    const finish=()=>{cur.remove();g&&g.set(next,{clearProps:'position,inset,transform,opacity,zIndex,pointerEvents'});curPane=next;current=i;animating=false;
      if(queued!==null&&queued!==i){const q=queued;queued=null;switchTo(q)}else queued=null;highlight(current)};
    if(!g||reduce()){if(g)g.set(viewport,{height:nh});finish();return}
    g.set(cur,{position:'absolute',inset:0,x:0,opacity:1,zIndex:1,pointerEvents:'none'});
    g.set(next,{position:'absolute',inset:0,x:dir*DIST,opacity:0,zIndex:2,pointerEvents:'none'});
    g.set(viewport,{height:ch});
    g.timeline({onComplete:finish})
     .to(viewport,{height:nh,duration:DUR,ease:EASE},0)
     .to(cur,{x:-dir*DIST,opacity:0,duration:DUR,ease:EASE},0)
     .to(next,{x:0,opacity:1,duration:DUR,ease:EASE},0);
  }
  trigs.forEach(t=>{const i=+t.dataset.i;
    t.addEventListener('mouseenter',()=>{if(window.matchMedia('(hover:hover)').matches)switchTo(i)});
    t.addEventListener('click',()=>{if(isOpen&&current===i&&!animating)close();else switchTo(i)});
  });
  plain.forEach(a=>a.addEventListener('mouseenter',()=>{clearTimer();if(isOpen)close()}));
  [bar,wrap].forEach(el=>{el.addEventListener('mouseenter',clearTimer);el.addEventListener('mouseleave',e=>{if(!bar.contains(e.relatedTarget)&&!wrap.contains(e.relatedTarget))scheduleClose()})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen){const t=trigs[current];close();t&&t.focus()}});
  document.getElementById('dmHeader').addEventListener('focusout',e=>{if(isOpen&&!document.getElementById('dmHeader').contains(e.relatedTarget))scheduleClose()});
  wrap.addEventListener('click',e=>{if(e.target.closest('a'))close()});

  // Móvil: acordeón
  const burger=document.getElementById('dmBurger'), mob=document.getElementById('dmMobile');
  mob.querySelectorAll('.dm-acc-body').forEach(b=>b.appendChild(tpl(b.dataset.tpl)));
  function setMob(open){mob.classList.toggle('is-open',open);burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',(window.T||(x=>x))(open?'Cerrar menú':'Abrir menú'));if(open)mob.removeAttribute('inert');else{mob.setAttribute('inert','');mob.querySelectorAll('.dm-acc>button').forEach(b=>{b.setAttribute('aria-expanded','false');b.nextElementSibling.classList.remove('is-open')})}}
  burger.addEventListener('click',()=>setMob(!mob.classList.contains('is-open')));
  mob.querySelectorAll('.dm-acc>button').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')!=='true';
    mob.querySelectorAll('.dm-acc>button').forEach(x=>{x.setAttribute('aria-expanded','false');x.nextElementSibling.classList.remove('is-open')});
    b.setAttribute('aria-expanded',o);b.nextElementSibling.classList.toggle('is-open',o)}));
  mob.addEventListener('click',e=>{if(e.target.closest('a'))setMob(false)});
  document.addEventListener('pointerdown',e=>{if(mob.classList.contains('is-open')&&!document.getElementById('dmHeader').contains(e.target))setMob(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mob.classList.contains('is-open')){setMob(false);burger.focus()}});
})();
// TextLoop (21st.dev) — remate rotativo del titular
(function(){
  const words=['dirección macro.','criterio propio.','datos reales.','riesgo definido.'];
  const clip=document.getElementById('tlClip'), txt=document.getElementById('tlText');
  if(!clip)return;
  (window.GMS_HOOKS||[]).push(()=>{txt.textContent=(window.T||(x=>x))(words[i]);clip.style.width='auto'});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0;
  const T=800, EASE='cubic-bezier(.42,0,.58,1)';
  function measure(w){const m=txt.cloneNode(true);m.textContent=w;m.style.cssText='position:absolute;visibility:hidden;white-space:nowrap';clip.appendChild(m);const r=m.offsetWidth;m.remove();return r+2}
  function step(){
    i=(i+1)%words.length;const next=(window.T||(x=>x))(words[i]);
    if(reduce){txt.textContent=next;return}
    clip.style.transition='none';clip.style.width=clip.offsetWidth+'px';clip.style.opacity=1;clip.offsetWidth;
    clip.style.transition=`width ${T}ms ${EASE}, opacity ${T}ms ${EASE}`;clip.style.width='0px';clip.style.opacity=0;
    setTimeout(()=>{txt.textContent=next;const w=measure(next);clip.style.width=w+'px';clip.style.opacity=1;
      setTimeout(()=>{clip.style.transition='none';clip.style.width='auto'},T+20)},T);
  }
  setInterval(step,3000+1600);
  const tlBox=clip.closest('.tl');
  function fit(){tlBox.style.fontSize='';const avail=tlBox.parentElement.clientWidth-32;const tt=window.T||(x=>x);
    const max=Math.max(...words.map(w=>measure(tt(w))))+10;const s=Math.min(1,avail/max);if(s<1)tlBox.style.fontSize=s.toFixed(3)+'em'}
  fit();addEventListener('resize',fit);(window.GMS_HOOKS||[]).push(()=>requestAnimationFrame(fit));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();

// Counting Number (21st.dev) — cifras del hero
(function(){
  const els=[...document.querySelectorAll('.cn')];if(!els.length)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, D=3000;
  const run=el=>{const to=+el.dataset.to;const t0=performance.now();
    const dec=+(el.dataset.dec||0);const f=now=>{const p=Math.min(1,(now-t0)/D);el.textContent=dec?(to*ease(p)).toFixed(dec):Math.round(to*ease(p)).toLocaleString('es-MX');if(p<1)requestAnimationFrame(f)};
    el.textContent='0';requestAnimationFrame(f)};
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target)}}),{threshold:.4});
  els.forEach(el=>io.observe(el));
})();



// Logo Marquee (21st.dev): desplazamiento infinito, se acelera al pasar el mouse
(function(){
  const track=document.getElementById('lmqTrack');if(!track)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const GAP=42, BASE=80, HOVER=25; let dur=BASE, target=BASE, x=null, last=performance.now();
  const half=()=>track.firstElementChild.offsetWidth+GAP;
  track.parentElement.addEventListener('mouseenter',()=>target=HOVER);
  track.parentElement.addEventListener('mouseleave',()=>target=BASE);
  function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;const h=half();
    if(x===null)x=-h;
    dur+=(target-dur)*Math.min(1,dt*4);
    x+=h/dur*dt; if(x>=0)x-=h;   /* reverse: se mueve hacia la derecha */
    track.style.transform=`translate3d(${x}px,0,0)`;requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
})();

// Beams Background (21st.dev)
(function(){
  const canvas=document.getElementById('beamsCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const host=canvas.parentElement, INTENSITY=1, MIN=20;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,beams=[],raf=0,visible=true;
  const mk=()=>({x:Math.random()*W*1.5-W*.25,y:Math.random()*H*1.5-H*.25,width:30+Math.random()*60,length:H*2.5,angle:-35+Math.random()*10,speed:.6+Math.random()*1.2,opacity:.12+Math.random()*.16,hue:218+Math.random()*16,pulse:Math.random()*Math.PI*2,pulseSpeed:.02+Math.random()*.03});
  function size(){const S=.25;W=host.offsetWidth;H=host.offsetHeight;canvas.width=Math.ceil(W*S);canvas.height=Math.ceil(H*S);ctx.setTransform(S,0,0,S,0,0);beams=Array.from({length:18},mk)}
  function reset(b,i,n){const col=i%3,sp=W/3;b.y=H+100;b.x=col*sp+sp/2+(Math.random()-.5)*sp*.5;b.width=100+Math.random()*100;b.speed=.5+Math.random()*.4;b.hue=218+(i*16)/n;b.opacity=.2+Math.random()*.1;b.length=H*2.5}
  function draw(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle*Math.PI/180);
    const o=b.opacity*(.8+Math.sin(b.pulse)*.2)*INTENSITY,g=ctx.createLinearGradient(0,0,0,b.length),c=a=>`hsla(${b.hue},85%,65%,${a})`;
    g.addColorStop(0,c(0));g.addColorStop(.1,c(o*.5));g.addColorStop(.4,c(o));g.addColorStop(.6,c(o));g.addColorStop(.9,c(o*.5));g.addColorStop(1,c(0));
    ctx.fillStyle=g;ctx.fillRect(-b.width/2,0,b.width,b.length);ctx.restore()}
  function frame(){ctx.clearRect(0,0,W,H);const n=beams.length;
    beams.forEach((b,i)=>{if(!reduce){b.y-=b.speed*2;b.pulse+=b.pulseSpeed*2}if(b.y+b.length<-100)reset(b,i,n);draw(b)})}
  let lt=0;function loop(now){if(!now||now-lt>=32){lt=now||0;frame()}if(visible&&!reduce&&!document.hidden)raf=requestAnimationFrame(loop)}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}});
  size();loop();
  new ResizeObserver(()=>{const w=host.offsetWidth,h=host.offsetHeight;if(Math.abs(w-W)>2||Math.abs(h-H)>40){size();if(reduce)frame()}}).observe(host);
  new IntersectionObserver(([e])=>{const was=visible;visible=e.isIntersecting;if(visible&&!was&&!reduce){cancelAnimationFrame(raf);loop()}}).observe(host);
})();
// Blur Reveal (21st.dev): letra por letra con desenfoque al entrar en pantalla (una sola vez)
(function(){
  const els=[...document.querySelectorAll('[data-blur-reveal]')];if(!els.length)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('br-calm');
  const SPEED_REVEAL=1.5, STAGGER=.03/SPEED_REVEAL;
  els.forEach(el=>{
    const build=text=>{const delay=parseFloat(el.dataset.delay||0);let k=0;
    el.textContent='';
    const sr=document.createElement('span');sr.className='br-sr';sr.textContent=text;el.appendChild(sr);
    const words=text.split(' ');
    words.forEach((w,wi)=>{const ws=document.createElement('span');ws.className='br-w';ws.setAttribute('aria-hidden','true');
      const add=ch=>{const c=document.createElement('span');c.className='br-c';c.textContent=ch;c.style.setProperty('--d',(delay+k*STAGGER).toFixed(3)+'s');k++;ws.appendChild(c)};
      [...w].forEach(add);if(wi<words.length-1)add('\u00a0');el.appendChild(ws)});};
    build(el.textContent.trim());el.__brBuild=build;
    el.classList.add('br-ready');
    const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add('is-in');io.disconnect()}},{threshold:.6,rootMargin:'0px 0px -10% 0px'});
    io.observe(el);
  });
})();
// S2 · Card-6: contador con resorte + barras que se llenan
(function(){
  const card=document.getElementById('fxCard');if(!card)return;
  const num=document.getElementById('fxNum'), bars=card.querySelector('.sc-bars');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){bars.classList.add('is-in');return}
  num.textContent='0.0';
  const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();
    requestAnimationFrame(()=>bars.classList.add('is-in'));
    // resorte (mass .8, stiffness 75, damping 15)
    let x=0,v=0,last=performance.now();const T=9.6,m=.8,k=75,c=15;
    (function step(now){const DT=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
      for(let j=0;j<10;j++){const dt=DT/10,a=(-k*(x-T)-c*v)/m;v+=a*dt;x+=v*dt}num.textContent=Math.max(0,x).toFixed(1);
      if(Math.abs(x-T)>.005||Math.abs(v)>.01)requestAnimationFrame(step);else num.textContent=T.toFixed(1)})(last);
  },{threshold:.35});
  io.observe(card);
})();
// S3 · Interactive Feature Section (21st.dev): el avance va ligado al scroll de la página (sin bloquearla)
(function(){
  const sec=document.getElementById('trader-macro');if(!sec)return;
  const N=3, DOTS=44, ROWS=2, ind=document.getElementById('fx3Ind'), sticky=document.getElementById('fx3Sticky');
  const b1=document.getElementById('fx3B1'), b2=document.getElementById('fx3B2'), b3=document.getElementById('fx3B3');
  const HUES=[226,172,22]; // azul GMS → turquesa → naranja // dorado → menta → azul marino (paleta GMS)
  const narrow=()=>innerWidth<768;
  // indicadores 01·02·03 con matriz de puntos
  const items=[...Array(N)].map((_,i)=>{const b=document.createElement('button');b.className='fx3-it';b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label','Etapa '+(i+1));
    b.innerHTML=`<span class="n">0${i+1}</span><span class="fx3-dots">${'<i></i>'.repeat(DOTS)}</span>`;
    b.addEventListener('click',()=>{const top=sec.getBoundingClientRect().top+scrollY;const span=sec.offsetHeight-innerHeight;scrollTo({top:top+span*(i/N)+2,behavior:'smooth'})});
    ind.appendChild(b);return b});
  let active=-1, progress=0;
  function render(){
    const r=sec.getBoundingClientRect(), span=sec.offsetHeight-innerHeight;
    progress=Math.max(0,Math.min(N,(-r.top/span)*N));
    const a=Math.min(N-1,Math.floor(progress));
    if(a!==active){active=a;
      sec.querySelectorAll('.fx3-pane').forEach(p=>p.classList.toggle('is-on',+p.dataset.i===a));
      targetHue=HUES[a];}
    items.forEach((it,i)=>{const sp=i<Math.floor(progress)?1:(i===Math.floor(progress)?progress-Math.floor(progress):0);
      const filled=Math.round(DOTS*sp), per=narrow()?11:22, rows=DOTS/per, cols=Math.ceil(filled/rows);
      it.classList.toggle('on',i===active);it.style.opacity=(i===0||progress>=i)?1:.5;it.setAttribute('aria-selected',i===active);
      [...it.querySelectorAll('i')].forEach((d,k)=>{d.classList.toggle('f',k%per<cols)});});
  }
  // springs (mouse + tono)
  let mx=.5,my=.5,tx=.5,ty=.5,vx=0,vy=0, hue=HUES[0],vh=0,targetHue=HUES[0], rawX=.5,rawY=.5;
  sticky.addEventListener('mousemove',e=>{const r=sticky.getBoundingClientRect();rawX=(e.clientX-r.left)/r.width;rawY=(e.clientY-r.top)/r.height});
  let last=performance.now(), visible=false;
  function tick(now){const dt=Math.min(.033,(now-last)/1000);last=now;
    const w=.3, sx=.5+(active*.2-.2), sy=.5+(active*.15-.15);
    tx=rawX*(1-w)+sx*w;ty=rawY*(1-w)+sy*w;
    // damping 25, stiffness 120
    let ax=-120*(mx-tx)-25*vx, ay=-120*(my-ty)-25*vy;vx+=ax*dt;vy+=ay*dt;mx+=vx*dt;my+=vy*dt;
    // damping 12, stiffness 20, mass 3.5
    const ah=(-20*(hue-targetHue)-12*vh)/3.5;vh+=ah*dt;hue+=vh*dt;
    b1.style.left=b3.style.left=(mx*100)+'%';b1.style.top=b3.style.top=(my*100)+'%';
    b2.style.left=(10+mx*80)+'%';b2.style.top=(10+my*80)+'%';
    b1.style.background=`radial-gradient(circle at center,hsl(${hue},88%,62%) 0%,hsl(${hue+14},90%,45%) 20%,transparent 70%)`;
    b2.style.background=`radial-gradient(circle at center,hsl(${hue+28},85%,52%) 0%,transparent 60%)`;
    if(visible)requestAnimationFrame(tick)}
  new IntersectionObserver(([e])=>{const was=visible;visible=e.isIntersecting;if(visible&&!was){last=performance.now();requestAnimationFrame(tick)}}).observe(sec);
  addEventListener('scroll',render,{passive:true});addEventListener('resize',render);
  render();
})();

// S5 · Scroll Timeline (21st.dev): la línea se dibuja con el scroll y enciende cada hito
(function(){
  const box=document.getElementById('tl5');if(!box)return;
  const fill=document.getElementById('tl5Fill'), items=[...box.querySelectorAll('.tl5-item')], n=items.length;
  function upd(){const r=box.getBoundingClientRect();let p=(innerHeight/2-r.top)/r.height;p=Math.max(0,Math.min(1,p));
    fill.style.height=(p*100)+'%';items.forEach((it,i)=>it.classList.toggle('on',p>=i/(n-1||1)-.05))}
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();

// S6 · Feature Shader Cards (21st.dev): fondo Warp de Paper Shaders detrás de cada tarjeta
(async function(){
  const cards=[...document.querySelectorAll('.fsc-card')];if(!cards.length)return;
  await new Promise(r=>{const o=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){o.disconnect();r()}},{rootMargin:'300px'});cards.forEach(c=>o.observe(c))});
  let P;try{P=await import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.60/+esm')}catch(e){return}
  const {ShaderMount,warpFragmentShader,getShaderColorFromString,getShaderNoiseTexture,WarpPatterns,ShaderFitOptions}=P;
  const C=[ // configuraciones del componente, recoloreadas al manual de marca GMS
    {proportion:.3,softness:.8,distortion:.15,swirl:.6,swirlIterations:8,shape:'checks',shapeScale:.08,colors:['#1e1c1c','#2b44d3','#1b328e','#6f84f0']},
    {proportion:.4,softness:1.2,distortion:.2,swirl:.9,swirlIterations:12,shape:'stripes',shapeScale:.12,colors:['#1e1c1c','#2b44d3','#1b328e','#4de1c7']},
    {proportion:.35,softness:.9,distortion:.18,swirl:.7,swirlIterations:10,shape:'checks',shapeScale:.1,colors:['#7a3510','#e27028','#1e1c1c','#f2a26e']},
    {proportion:.45,softness:1.1,distortion:.22,swirl:.8,swirlIterations:15,shape:'stripes',shapeScale:.09,colors:['#1b328e','#2b44d3','#1e1c1c','#4de1c7']},
    {proportion:.38,softness:.95,distortion:.16,swirl:.85,swirlIterations:11,shape:'checks',shapeScale:.11,colors:['#1e1c1c','#1b328e','#2b44d3','#6f84f0']},
    {proportion:.42,softness:1,distortion:.19,swirl:.75,swirlIterations:9,shape:'stripes',shapeScale:.13,colors:['#1e1c1c','#2b44d3','#1b328e','#e27028']}];
  const noise=getShaderNoiseTexture();
  if(noise&&!noise.complete)await new Promise(r=>{noise.onload=r;noise.onerror=r});
  const speed=matchMedia('(prefers-reduced-motion: reduce)').matches?0:.8;
  cards.forEach((card,i)=>{const c=C[i%C.length];
    try{new ShaderMount(card.querySelector('.fsc-shader'),warpFragmentShader,{
      u_colors:c.colors.map(getShaderColorFromString),u_colorsCount:c.colors.length,u_proportion:c.proportion,u_softness:c.softness,
      u_distortion:c.distortion,u_swirl:c.swirl,u_swirlIterations:c.swirlIterations,u_shapeScale:c.shapeScale,u_shape:WarpPatterns[c.shape],
      u_noiseTexture:noise,u_scale:1,u_rotation:0,u_fit:ShaderFitOptions.none,u_offsetX:0,u_offsetY:0,u_originX:.5,u_originY:.5,u_worldWidth:0,u_worldHeight:0
    },undefined,speed)}catch(e){console.warn('shader',e)}});
})();

// S8 · Stats Card (21st.dev): cifra con resorte y barras al entrar en pantalla
(function(){
  document.querySelectorAll('.stc').forEach(card=>{
    const num=card.querySelector('.stc-num'), chart=card.querySelector('.stc-chart'), T=+num.dataset.to;
    const fmt=v=>'$'+Math.round(v).toLocaleString('en-US');
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){chart&&chart.classList.add('is-in');return}
    num.textContent=fmt(0);
    const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();chart&&chart.classList.add('is-in');
      let x=0,v=0,last=performance.now();const k=100,c=30,m=1;
      (function step(now){const DT=Math.max(0,Math.min(.05,(now-last)/1000));last=now;for(let j=0;j<10;j++){const dt=DT/10,a=(-k*(x-T)-c*v)/m;v+=a*dt;x+=v*dt}num.textContent=fmt(Math.max(0,x));
        if(Math.abs(x-T)>T*.0005||Math.abs(v)>1)requestAnimationFrame(step);else num.textContent=fmt(T)})(last);
    },{threshold:.4});io.observe(card);
  });
})();

// S9 · Team Showcase (21st.dev): foto y nombre se iluminan juntos al pasar el mouse
(function(){
  const box=document.getElementById('tsc');if(!box)return;
  const els=[...box.querySelectorAll('[data-id]')];
  const set=id=>{box.classList.toggle('has-hover',id!==null);els.forEach(e=>e.classList.toggle('on',e.dataset.id===id))};
  els.forEach(e=>{e.addEventListener('mouseenter',()=>set(e.dataset.id));e.addEventListener('mouseleave',()=>set(null));
    e.addEventListener('click',()=>set(e.classList.contains('on')?null:e.dataset.id))});
})();

// S12 · FAQ (21st.dev): título palabra por palabra + acordeón de una sola respuesta abierta
(function(){
  const sec=document.getElementById('faq');if(!sec)return;
  const t=sec.querySelector('[data-fq-words]');
  const fqb=txt=>{t.innerHTML=txt.trim().split(' ').map((w,i)=>`<span class="w" style="--d:${(i*.08).toFixed(2)}s">${w}</span>`).join('')};fqb(t.textContent);t.__fqBuild=fqb;
  const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){sec.classList.add('is-in');io.disconnect()}},{threshold:.15});io.observe(sec);
  const trigs=[...sec.querySelectorAll('.fq-trig')];
  trigs.forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')==='true';
    trigs.forEach(x=>{x.setAttribute('aria-expanded','false');document.getElementById(x.getAttribute('aria-controls')).classList.remove('open')});
    if(!open){b.setAttribute('aria-expanded','true');document.getElementById(b.getAttribute('aria-controls')).classList.add('open')}}));
})();
// S13 · Shutter Glyph Footer (21st.dev): wordmark "MACRO" con obturador en la C
(function(){
  const root=document.getElementById('sgf'), svg=document.getElementById('sgfSvg');if(!root||!svg)return;
  const NS='http://www.w3.org/2000/svg', CAP=100, S=19, B=17, SH=100, K=21, REST=77;
  const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v, f=n=>String(Math.round(n*100)/100);
  const rect=(x,y,w,h)=>'M'+f(x)+' '+f(y)+'H'+f(x+w)+'V'+f(y+h)+'H'+f(x)+'Z';
  const slant=(x1,y1,x2,y2,t)=>'M'+f(x1)+' '+f(y1)+'H'+f(x1+t)+'L'+f(x2+t)+' '+f(y2)+'H'+f(x2)+'Z';
  const ring=(cx,cy,rx,ry,tx,ty)=>{const e=(r1,r2)=>'M'+f(cx-r1)+' '+f(cy)+'A'+f(r1)+' '+f(r2)+' 0 1 1 '+f(cx+r1)+' '+f(cy)+'A'+f(r1)+' '+f(r2)+' 0 1 1 '+f(cx-r1)+' '+f(cy)+'Z';return e(rx,ry)+e(rx-tx,ry-ty)};
  // C: anillo abierto a la derecha (apertura de ±a grados), con cortes horizontales en las puntas
  const cee=(cx,cy,rx,ry,tx,ty,a)=>{const r=a*Math.PI/180,ox=cx+rx*Math.cos(r),oy=ry*Math.sin(r),ix=cx+(rx-tx)*Math.cos(r),iy=(ry-ty)*Math.sin(r);return 'M'+f(ox)+' '+f(cy-oy)+'A'+f(rx)+' '+f(ry)+' 0 1 0 '+f(ox)+' '+f(cy+oy)+'L'+f(ix)+' '+f(cy+iy)+'A'+f(rx-tx)+' '+f(ry-ty)+' 0 1 1 '+f(ix)+' '+f(cy-iy)+'Z'};
  const bowl=(x,y,w,h,t,tb)=>{const ry=h/2,rx=Math.min(w-t,ry*.95),sx=x+w-rx;return 'M'+f(x)+' '+f(y)+'H'+f(sx)+'A'+f(rx)+' '+f(ry)+' 0 0 1 '+f(sx)+' '+f(y+h)+'H'+f(x)+'Z'+'M'+f(x+t)+' '+f(y+tb)+'H'+f(sx)+'A'+f(rx-t)+' '+f(ry-tb)+' 0 0 1 '+f(sx)+' '+f(y+h-tb)+'H'+f(x+t)+'Z'};
  const G={M:{w:112,d:[rect(0,0,S+3,100),slant(0,0,46,100,9),slant(68,0,40,100,22),rect(112-S-3,0,S+3,100)]},
    A:{w:96,d:[slant(37,0,0,100,23),slant(37,0,73,100,23),rect(18,60,60,16)]},
    R:{w:84,d:[rect(0,0,S,100),bowl(0,0,82,58,S,B),slant(34,50,62,100,22)]},
    O:{w:100,d:[ring(50,50,50,50,S+2,B)]},
    C:{w:94,d:[cee(50,50,50,50,S+2,B,41)]}};
  const turn=(x,y,t)=>{const n=((t%4)+4)%4;let a=x,b=y;for(let i=0;i<n;i++){const q=a;a=SH-b;b=q}return [a,b]};
  const restPivot=t=>turn(REST,REST,t);
  const blades=(px,py,t)=>{const [qx,qy]=turn(clamp(px,8,92),clamp(py,8,92),-t);
    return [[0,0,K,0,qx,qy,0,K],[qx,0,SH,0,SH,K,qx,qy],[0,qy,qx,qy,K,SH,0,SH]].map(s=>{const o=[];for(let i=0;i<s.length;i+=2)o.push(...turn(s[i],s[i+1],t));return o})};
  const approach=(a,b,k,dt)=>b+(a-b)*Math.pow(1-k,clamp(dt,0,.1)*60);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el=(n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e};
  // layout
  const word='MACRO', shutterAt=-1, gap=12;let x=0;const items=[];
  [...word].forEach((ch,i)=>{const sh=i===shutterAt;const w=sh?SH:G[ch].w;items.push({ch,x,w,sh});x+=w+gap});
  const width=x-gap;
  svg.setAttribute('viewBox','0 0 '+f(width)+' '+CAP);svg.style.aspectRatio=width+' / '+CAP;
  const defs=el('defs');
  const cu=el('clipPath',{id:'sgfUp',clipPathUnits:'userSpaceOnUse'});cu.appendChild(el('rect',{x:-40,y:-200,width:400,height:252.6}));
  const cd=el('clipPath',{id:'sgfDn',clipPathUnits:'userSpaceOnUse'});cd.appendChild(el('rect',{x:-40,y:51.4,width:400,height:250}));
  defs.append(cu,cd);svg.appendChild(defs);
  let turns=0, polys=[], shX=0;
  items.forEach((it,i)=>{
    const outer=el('g',{transform:'translate('+f(it.x)+' 0)'}), rise=el('g',{class:'sgf-rise'});rise.style.setProperty('--sgf-d',(200+i*90)+'ms');
    if(it.sh){shX=it.x;const g=el('g',{class:'sgf-g sgf-sh'});g.appendChild(el('rect',{width:SH,height:CAP,fill:'transparent'}));
      const r=restPivot(0);blades(r[0],r[1],0).forEach(p=>{const pg=el('polygon',{points:p.map(f).join(' ')});polys.push(pg);g.appendChild(pg)});
      g.addEventListener('click',()=>{turns++});rise.appendChild(g);}
    else{const gl=G[it.ch];const g=el('g',{class:'sgf-g sgf-flip'});g.appendChild(el('rect',{width:gl.w,height:CAP,fill:'transparent'}));
      [['sgfUp','sgf-up'],['sgfDn','sgf-dn']].forEach(([cp,cl])=>{const c=el('g',{'clip-path':'url(#'+cp+')'}),h=el('g',{class:'sgf-half '+cl});gl.d.forEach(d=>h.appendChild(el('path',{d,'fill-rule':'evenodd'})));c.appendChild(h);g.appendChild(c)});
      g.addEventListener('click',()=>{if(reduce)return;g.classList.remove('is-flip');void g.getBoundingClientRect();g.classList.add('is-flip')});
      g.addEventListener('animationend',()=>g.classList.remove('is-flip'));rise.appendChild(g);}
    outer.appendChild(rise);svg.appendChild(outer)});
  // escalonado de entrada
  let d=0;root.querySelectorAll('.sgf-fade').forEach(e=>e.style.setProperty('--sgf-d',(d+=60)+'ms'));
  // links: flecha + scramble
  const ARROW='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6h9.2M6.4 2.2 10.2 6l-3.8 3.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/></svg>';
  const NOISE='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=/<>';
  const scramble=(t,p,seed)=>{const c=[...t],s=Math.floor(clamp(p,0,1)*c.length);return c.map((ch,i)=>{if(i<s||!/[a-z0-9áéíóúñ]/i.test(ch))return ch;const r=Math.abs(Math.sin((i+1)*12.9898+seed*78.233)*43758.5453)%1;return NOISE[Math.floor(r*NOISE.length)]}).join('')};
  root.querySelectorAll('[data-scr]').forEach(a=>{const text=a.textContent.trim();a.setAttribute('aria-label',text);a.innerHTML='<span aria-hidden="true"></span>'+ARROW;const sp=a.firstChild;sp.textContent=text;
    if(/^https?:/.test(a.href)&&!a.href.startsWith(location.origin)){a.target='_blank';a.rel='noreferrer'}
    let raf=0;const run=()=>{if(reduce)return;cancelAnimationFrame(raf);const t0=performance.now(),seed=Math.random()*100;let n=0;
      const step=now=>{const p=(now-t0)/420;if(p>=1){sp.textContent=text;return}if(n++%2===0)sp.textContent=scramble(text,p,seed+Math.floor(n/2));raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)};
    a.addEventListener('pointerenter',run);a.addEventListener('focus',run)});
  // revelado + obturador que sigue al puntero
  const ptr={x:0,y:0,inside:false};let pivot=restPivot(0),visible=false,raf=0,last=0;
  const paint=(px,py)=>{if(!polys.length)return;blades(px,py,turns).forEach((p,i)=>polys[i].setAttribute('points',p.map(f).join(' ')))};
  const onPtr=e=>{ptr.inside=e.type!=='pointerleave';const r=svg.getBoundingClientRect(),sc=r.width/width||1;ptr.x=(e.clientX-r.left)/sc-shX;ptr.y=(e.clientY-r.top)/sc};
  ['pointermove','pointerenter','pointerleave'].forEach(t=>root.addEventListener(t,onPtr));
  const tick=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;const rest=restPivot(turns);
    const tx=ptr.inside?clamp(ptr.x,8,92):rest[0],ty=ptr.inside?clamp(ptr.y,8,92):rest[1];
    pivot=[approach(pivot[0],tx,.12,dt),approach(pivot[1],ty,.12,dt)];paint(pivot[0],pivot[1]);if(visible)raf=requestAnimationFrame(tick)};
  if(reduce){root.dataset.in='true';svg.addEventListener('click',()=>{const r=restPivot(turns);paint(r[0],r[1])});return}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){root.dataset.in='true';cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(tick)}},{threshold:.1}).observe(root);
})();

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

/* --- Video en ventana (botón masterclass gratuita) --- */
(function(){
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-video]');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();
    var id=a.getAttribute('data-video'),back=document.activeElement;
    var m=document.createElement('div');m.className='vmodal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Masterclass gratuita');
    m.innerHTML='<button class="vmodal-x" type="button" aria-label="Cerrar video">×</button><div class="vmodal-box"><iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Masterclass gratuita" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    document.body.appendChild(m);if(window.__lenis)window.__lenis.stop();
    requestAnimationFrame(function(){m.classList.add('on')});
    var x=m.querySelector('.vmodal-x');x.focus();
    function close(){m.classList.remove('on');document.removeEventListener('keydown',esc);if(window.__lenis)window.__lenis.start();setTimeout(function(){m.remove();back&&back.focus&&back.focus()},300)}
    function esc(ev){if(ev.key==='Escape')close()}
    x.addEventListener('click',close);m.addEventListener('click',function(ev){if(ev.target===m)close()});document.addEventListener('keydown',esc);
  });
})();

/* --- Selector de idioma desplegable --- */
(function(){
  var dd=document.getElementById('langDd');if(!dd)return;
  var btn=document.getElementById('langBtn'),menu=document.getElementById('langMenu'),cur=document.getElementById('langCur');
  var items=[].slice.call(menu.querySelectorAll('[data-lang]'));
  function sync(){var on=menu.querySelector('[data-lang].on')||items[0];cur.textContent=on.getAttribute('data-lang').toUpperCase();
    items.forEach(function(i){i.setAttribute('aria-checked',i.classList.contains('on')?'true':'false')})}
  function open(){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('on')});btn.setAttribute('aria-expanded','true');
    (menu.querySelector('.on')||items[0]).focus({preventScroll:true})}
  function close(f){menu.classList.remove('on');btn.setAttribute('aria-expanded','false');setTimeout(function(){if(!menu.classList.contains('on'))menu.hidden=true},250);if(f)btn.focus({preventScroll:true})}
  btn.addEventListener('click',function(){btn.getAttribute('aria-expanded')==='true'?close():open()});
  items.forEach(function(i){i.addEventListener('click',function(){setTimeout(function(){sync();close(true)},0)})});
  document.addEventListener('pointerdown',function(e){if(!dd.contains(e.target)&&btn.getAttribute('aria-expanded')==='true')close()});
  dd.addEventListener('keydown',function(e){
    if(e.key==='Escape'){close(true)}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(btn.getAttribute('aria-expanded')!=='true'){open();return}
      var k=items.indexOf(document.activeElement);k=(k+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[k].focus()}});
  (window.GMS_HOOKS||[]).push(sync);sync();
})();
