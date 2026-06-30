/* ═══════════════════════════════════════════
   HEAVENGATE BIBLE MISSION — app.js
═══════════════════════════════════════════ */

/* ── BISHOPS SLIDER ── */
let bIdx = 0;
const BISHOP_W = 218;
const bishopsTrack = document.getElementById('bishopsTrack');
if(bishopsTrack){
  let bDragging = false, bStartX = 0, bCurrentX = 0, bVelocity = 0, bLastX = 0, bLastTime = 0;

  function bishopsSlide(dir){
    const tot = bishopsTrack.children.length;
    const vis = Math.max(1, Math.floor(bishopsTrack.parentElement.offsetWidth / BISHOP_W));
    bIdx += dir;
    if(bIdx > tot - vis) bIdx = 0;
    if(bIdx < 0) bIdx = tot - vis;
    bishopsTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    bishopsTrack.style.transform = `translateX(-${bIdx * BISHOP_W}px)`;
  }
  window.bishopsSlide = bishopsSlide;

  function bStartDrag(e){
    bDragging = true;
    bAnimating = false;
    bStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    bLastX = bStartX; bLastTime = Date.now(); bVelocity = 0;
    bishopsTrack.style.transition = 'none';
    bishopsTrack.style.cursor = 'grabbing';
  }
  function bMoveDrag(e){
    if(!bDragging) return;
    e.preventDefault?.();
    bCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const dx = bCurrentX - bLastX;
    const now = Date.now();
    bVelocity = (now - bLastTime) > 0 ? (dx / (now - bLastTime)) * 16 : 0;
    bLastX = bCurrentX; bLastTime = now;
    bishopsTrack.style.transform = `translateX(${-bIdx * BISHOP_W + (bCurrentX - bStartX)}px)`;
  }
  function bEndDrag(){
    if(!bDragging) return;
    bDragging = false;
    const dragDist = bCurrentX - bStartX;
    if(Math.abs(dragDist) > BISHOP_W * 0.15){
      if(dragDist > 0) bIdx = Math.max(0, bIdx - 1);
      else bIdx = Math.min(bishopsTrack.children.length - Math.floor(bishopsTrack.parentElement.offsetWidth / BISHOP_W), bIdx + 1);
    }
    bishopsTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    bishopsTrack.style.transform = `translateX(-${bIdx * BISHOP_W}px)`;
    bishopsTrack.style.cursor = 'grab';
  }
  bishopsTrack.addEventListener('mousedown', bStartDrag);
  document.addEventListener('mousemove', bMoveDrag);
  document.addEventListener('mouseup', bEndDrag);
  bishopsTrack.addEventListener('touchstart', bStartDrag);
  bishopsTrack.addEventListener('touchmove', bMoveDrag, { passive: false });
  bishopsTrack.addEventListener('touchend', bEndDrag);
  bishopsTrack.style.cursor = 'grab';
}

/* ── GALLERY EVENTS TOGGLE ── */
function toggleGalEvent(header){
  const eventEl = header.parentElement;
  eventEl.classList.toggle('open');
}
window.toggleGalEvent = toggleGalEvent;

/* ── CALVARY BELLS SLIDER ── */
let cbCurrentSlide = 0;
const cbSlides = document.querySelectorAll('.cb-slide');
const cbDots = document.querySelectorAll('.cb-dot');
function cbGoToSlide(idx){
  cbCurrentSlide = idx;
  cbSlides.forEach((s,i) => s.classList.toggle('active', i === idx));
  cbDots.forEach((d,i) => d.classList.toggle('active', i === idx));
}
window.cbGoToSlide = cbGoToSlide;
// Auto-slide
setInterval(() => {
  if(cbSlides.length > 0){
    cbCurrentSlide = (cbCurrentSlide + 1) % cbSlides.length;
    cbGoToSlide(cbCurrentSlide);
  }
}, 4000);

/* ── CALVARY BELLS AUDIO PLAYER ── */
const cbAudio = document.getElementById('cbAudio');
const cbPlayBtn = document.getElementById('cbPlayBtn');
const cbProgressBar = document.getElementById('cbProgressBar');
const cbProgressFill = document.getElementById('cbProgressFill');
const cbCurrentTimeEl = document.getElementById('cbCurrentTime');
const cbTotalTimeEl = document.getElementById('cbTotalTime');
let cbCurrentTrackIdx = -1;
let cbIsPlaying = false;

function cbFormatTime(s){
  if(isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function cbUpdatePlayButton(){
  if(!cbPlayBtn) return;
  const icon = cbPlayBtn.querySelector('i');
  if(cbIsPlaying){ icon.className = 'fas fa-pause'; }
  else { icon.className = 'fas fa-play'; }
}

function cbUpdateTracklist(){
  document.querySelectorAll('.cb-track').forEach((t,i) => {
    t.classList.toggle('playing', i === cbCurrentTrackIdx);
    const playIcon = t.querySelector('.cb-track-play i');
    if(playIcon) playIcon.className = i === cbCurrentTrackIdx && cbIsPlaying ? 'fas fa-pause' : 'fas fa-play';
  });
}

function cbPlayTrack(el){
  const idx = Array.from(document.querySelectorAll('.cb-track')).indexOf(el);
  if(idx === -1) return;
  const src = el.dataset.src;
  if(!src || !cbAudio) return;

  if(cbCurrentTrackIdx === idx && cbIsPlaying){
    cbAudio.pause();
    cbIsPlaying = false;
  } else {
    if(cbCurrentTrackIdx !== idx){
      cbAudio.src = src;
      cbCurrentTrackIdx = idx;
    }
    cbAudio.play().catch(()=>{});
    cbIsPlaying = true;
  }
  cbUpdatePlayButton();
  cbUpdateTracklist();
}
window.cbPlayTrack = cbPlayTrack;

function cbTogglePlay(){
  if(!cbAudio) return;
  if(cbCurrentTrackIdx === -1){
    const firstTrack = document.querySelector('.cb-track');
    if(firstTrack) cbPlayTrack(firstTrack);
    return;
  }
  if(cbIsPlaying){
    cbAudio.pause();
    cbIsPlaying = false;
  } else {
    cbAudio.play().catch(()=>{});
    cbIsPlaying = true;
  }
  cbUpdatePlayButton();
  cbUpdateTracklist();
}
window.cbTogglePlay = cbTogglePlay;

function cbPrevTrack(){
  const tracks = document.querySelectorAll('.cb-track');
  if(tracks.length === 0) return;
  let idx = cbCurrentTrackIdx - 1;
  if(idx < 0) idx = tracks.length - 1;
  cbPlayTrack(tracks[idx]);
}
window.cbPrevTrack = cbPrevTrack;

function cbNextTrack(){
  const tracks = document.querySelectorAll('.cb-track');
  if(tracks.length === 0) return;
  let idx = cbCurrentTrackIdx + 1;
  if(idx >= tracks.length) idx = 0;
  cbPlayTrack(tracks[idx]);
}
window.cbNextTrack = cbNextTrack;

if(cbAudio){
  cbAudio.addEventListener('timeupdate', () => {
    if(cbAudio.duration){
      const pct = (cbAudio.currentTime / cbAudio.duration) * 100;
      if(cbProgressFill) cbProgressFill.style.width = pct + '%';
      if(cbCurrentTimeEl) cbCurrentTimeEl.textContent = cbFormatTime(cbAudio.currentTime);
    }
  });
  cbAudio.addEventListener('loadedmetadata', () => {
    if(cbTotalTimeEl) cbTotalTimeEl.textContent = cbFormatTime(cbAudio.duration);
  });
  cbAudio.addEventListener('ended', () => {
    cbNextTrack();
  });
}
if(cbProgressBar){
  cbProgressBar.addEventListener('click', (e) => {
    if(!cbAudio || !cbAudio.duration) return;
    const rect = cbProgressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    cbAudio.currentTime = pct * cbAudio.duration;
  });
}

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
  const mob = document.getElementById('mob');
  const isOpen = mob.classList.toggle('open');
  const btn = document.querySelector('.hbg');
  document.body.classList.toggle('menu-open', isOpen);
  if(btn) btn.setAttribute('aria-expanded', isOpen);
}
window.addEventListener('resize', () => {
  if(window.innerWidth > 768){
    document.getElementById('mob').classList.remove('open');
    document.body.classList.remove('menu-open');
    const btn = document.querySelector('.hbg');
    if(btn) btn.setAttribute('aria-expanded', 'false');
  }
});

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
