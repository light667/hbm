/* ═══════════════════════════════════════════
   HEAVENGATE BIBLE MISSION — app.js
═══════════════════════════════════════════ */

/* ── LANGUAGE ── */
function setLang(l){
  document.body.className = 'lang-' + l;
  document.getElementById('btn-en').classList.toggle('on', l === 'en');
  document.getElementById('btn-fr').classList.toggle('on', l === 'fr');
  document.documentElement.lang = l;
  localStorage.setItem('hbm-lang', l);

  document.querySelectorAll('option[data-en][data-fr]').forEach(opt => {
    opt.textContent = l === 'en' ? opt.dataset.en : opt.dataset.fr;
  });
}
(function(){
  const saved = localStorage.getItem('hbm-lang') || 'en';
  setLang(saved);
})();

/* ── NAVBAR SCROLL ── */
const nav = document.getElementById('nav');
const stb = document.getElementById('stb');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  stb.classList.toggle('vis', window.scrollY > 400);
  highlightNav();
}, { passive: true });

/* ── MOBILE MENU ── */
function mobToggle(){
  document.getElementById('mob').classList.toggle('open');
}

/* ── SMOOTH NAV HIGHLIGHT ── */
function highlightNav(){
  const sections = document.querySelectorAll('section[id]');
  let cur = '';
  sections.forEach(s => { if(window.scrollY >= s.offsetTop - 90) cur = s.id; });
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}

/* ── COUNTERS ── */
let counted = false;
const cEls = document.querySelectorAll('[data-count]');
if(cEls.length){
  new IntersectionObserver(entries => {
    if(entries[0].isIntersecting && !counted){
      counted = true;
      cEls.forEach(el => {
        const target = +el.dataset.count;
        const dur = 1800;
        const step = target / (dur / 16);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.floor(cur).toLocaleString();
          if(cur >= target) clearInterval(t);
        }, 16);
      });
    }
  }, { threshold: 0.3 }).observe(cEls[0]);
}

/* ── TEAM SLIDER ── */
let tIdx = 0;
const CARD_W = 210;
const teamTrack = document.getElementById('teamTrack');
if(teamTrack){
  let tAutoSlideTimer = null;
  let tDragging = false;
  let tStartX = 0;
  let tCurrentX = 0;
  let tVelocity = 0;
  let tLastX = 0;
  let tLastTime = 0;
  let tAnimating = false;

  function teamSlide(dir){
    const tot = teamTrack.children.length;
    const vis = Math.floor(teamTrack.parentElement.offsetWidth / CARD_W);
    tIdx = Math.max(0, Math.min(tIdx + dir, tot - vis));
    teamTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    teamTrack.style.transform = `translateX(-${tIdx * CARD_W}px)`;
  }

  function teamAutoSlide(){
    if(!tDragging && !tAnimating){
      const tot = teamTrack.children.length;
      const vis = Math.floor(teamTrack.parentElement.offsetWidth / CARD_W);
      if(tIdx >= tot - vis) tIdx = -1;
      teamSlide(1);
    }
  }

  function teamStartAutoSlide(){
    tAutoSlideTimer = setInterval(teamAutoSlide, 3200);
  }

  function teamStopAutoSlide(){
    if(tAutoSlideTimer) clearInterval(tAutoSlideTimer);
    tAutoSlideTimer = null;
  }

  function teamStartDrag(e){
    teamStopAutoSlide();
    tDragging = true;
    tAnimating = false;
    tStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    tLastX = tStartX;
    tLastTime = Date.now();
    tVelocity = 0;
    teamTrack.style.transition = 'none';
    teamTrack.style.cursor = 'grabbing';
  }

  function teamMoveDrag(e){
    if(!tDragging) return;
    e.preventDefault?.();
    tCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const dx = tCurrentX - tLastX;
    const now = Date.now();
    const timeDelta = now - tLastTime;
    
    tVelocity = timeDelta > 0 ? (dx / timeDelta) * 16 : 0;
    tLastX = tCurrentX;
    tLastTime = now;
    
    const dragDist = tCurrentX - tStartX;
    const newPos = -tIdx * CARD_W + dragDist;
    teamTrack.style.transform = `translateX(${newPos}px)`;
  }

  function teamEndDrag(){
    if(!tDragging) return;
    tDragging = false;
    
    const dragDist = tCurrentX - tStartX;
    const threshold = CARD_W * 0.15;
    
    if(Math.abs(dragDist) > threshold){
      if(dragDist > 0) tIdx = Math.max(0, tIdx - 1);
      else tIdx = Math.min(teamTrack.children.length - Math.floor(teamTrack.parentElement.offsetWidth / CARD_W), tIdx + 1);
    }
    
    // Apply momentum if velocity is high
    if(Math.abs(tVelocity) > 0.5){
      tAnimating = true;
      let currentVel = tVelocity;
      const friction = 0.95;
      const startIdx = tIdx;
      
      const momentumAnim = setInterval(() => {
        currentVel *= friction;
        if(Math.abs(currentVel) < 0.05){
          clearInterval(momentumAnim);
          tAnimating = false;
          teamTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
          teamTrack.style.transform = `translateX(-${tIdx * CARD_W}px)`;
          teamStartAutoSlide();
        } else {
          const moveDist = currentVel * 10;
          const pixelPos = -startIdx * CARD_W - moveDist;
          teamTrack.style.transform = `translateX(${pixelPos}px)`;
        }
      }, 16);
    } else {
      teamTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
      teamTrack.style.transform = `translateX(-${tIdx * CARD_W}px)`;
      teamStartAutoSlide();
    }
    
    teamTrack.style.cursor = 'grab';
  }

  // Mouse events
  teamTrack.addEventListener('mousedown', teamStartDrag);
  document.addEventListener('mousemove', teamMoveDrag);
  document.addEventListener('mouseup', teamEndDrag);
  
  // Touch events
  teamTrack.addEventListener('touchstart', teamStartDrag);
  teamTrack.addEventListener('touchmove', teamMoveDrag, { passive: false });
  teamTrack.addEventListener('touchend', teamEndDrag);
  
  teamTrack.style.cursor = 'grab';
  window.teamSlide = teamSlide;
  // Auto-slide disabled for team section
}

/* ── GALLERY SLIDER ── */
let gIdx = 0;
const GAL_W = 274;
const galTrack = document.getElementById('galTrack');
if(galTrack){
  let gAutoSlideTimer = null;
  let gDragging = false;
  let gStartX = 0;
  let gCurrentX = 0;
  let gVelocity = 0;
  let gLastX = 0;
  let gLastTime = 0;
  let gAnimating = false;

  function galSlide(dir){
    const tot = galTrack.children.length;
    const vis = Math.floor(galTrack.parentElement.offsetWidth / GAL_W);
    gIdx += dir;
    if(gIdx > tot - vis) gIdx = 0;
    if(gIdx < 0) gIdx = tot - vis;
    galTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    galTrack.style.transform = `translateX(-${gIdx * GAL_W}px)`;
  }

  function galAutoSlide(){
    if(!gDragging && !gAnimating) galSlide(1);
  }

  function galStartAutoSlide(){
    gAutoSlideTimer = setInterval(galAutoSlide, 2800);
  }

  function galStopAutoSlide(){
    if(gAutoSlideTimer) clearInterval(gAutoSlideTimer);
    gAutoSlideTimer = null;
  }

  function galStartDrag(e){
    galStopAutoSlide();
    gDragging = true;
    gAnimating = false;
    gStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    gLastX = gStartX;
    gLastTime = Date.now();
    gVelocity = 0;
    galTrack.style.transition = 'none';
    galTrack.style.cursor = 'grabbing';
  }

  function galMoveDrag(e){
    if(!gDragging) return;
    e.preventDefault?.();
    gCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const dx = gCurrentX - gLastX;
    const now = Date.now();
    const timeDelta = now - gLastTime;
    
    gVelocity = timeDelta > 0 ? (dx / timeDelta) * 16 : 0;
    gLastX = gCurrentX;
    gLastTime = now;
    
    const dragDist = gCurrentX - gStartX;
    const newPos = -gIdx * GAL_W + dragDist;
    galTrack.style.transform = `translateX(${newPos}px)`;
  }

  function galEndDrag(){
    if(!gDragging) return;
    gDragging = false;
    
    const dragDist = gCurrentX - gStartX;
    const threshold = GAL_W * 0.15;
    
    if(Math.abs(dragDist) > threshold){
      if(dragDist > 0) gIdx = Math.max(0, gIdx - 1);
      else gIdx = Math.min(galTrack.children.length - Math.floor(galTrack.parentElement.offsetWidth / GAL_W), gIdx + 1);
    }
    
    // Apply momentum if velocity is high
    if(Math.abs(gVelocity) > 0.5){
      gAnimating = true;
      let currentVel = gVelocity;
      const friction = 0.95;
      const startIdx = gIdx;
      
      const momentumAnim = setInterval(() => {
        currentVel *= friction;
        if(Math.abs(currentVel) < 0.05){
          clearInterval(momentumAnim);
          gAnimating = false;
          galTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
          galTrack.style.transform = `translateX(-${gIdx * GAL_W}px)`;
          galStartAutoSlide();
        } else {
          const moveDist = currentVel * 10;
          const pixelPos = -startIdx * GAL_W - moveDist;
          galTrack.style.transform = `translateX(${pixelPos}px)`;
        }
      }, 16);
    } else {
      galTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
      galTrack.style.transform = `translateX(-${gIdx * GAL_W}px)`;
      galStartAutoSlide();
    }
    
    galTrack.style.cursor = 'grab';
  }

  // Mouse events
  galTrack.addEventListener('mousedown', galStartDrag);
  document.addEventListener('mousemove', galMoveDrag);
  document.addEventListener('mouseup', galEndDrag);
  
  // Touch events
  galTrack.addEventListener('touchstart', galStartDrag);
  galTrack.addEventListener('touchmove', galMoveDrag, { passive: false });
  galTrack.addEventListener('touchend', galEndDrag);
  
  galTrack.style.cursor = 'grab';
  window.galSlide = galSlide;
  galStartAutoSlide();
}

/* ── LIGHTBOX ── */
function openLb(src){
  document.getElementById('lbImg').src = src;
  document.getElementById('lb').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeLb(){
  document.getElementById('lb').classList.remove('on');
  document.body.style.overflow = '';
}
window.openLb = openLb;
window.closeLb = closeLb;
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLb(); });

/* ── AOS INIT ── */
if(window.AOS){
  AOS.init({ duration: 750, once: true, offset: 60, easing: 'ease-out-cubic' });
}

/* ── SCROLL TO TOP ── */
window.scrollToTop = function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); };
