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

/* ── BISHOP SCROLL SLIDER (drag + buttons, pixel-accurate extremes) ── */
const bishopTrack = document.getElementById('bishopTrack');
if(bishopTrack){
  let bPos = 0;          /* current translateX in px (negative or 0) */
  let bDragging = false;
  let bStartX = 0;
  let bStartPos = 0;
  let bCurrentX = 0;

  function bMaxScroll(){
    const trackW = bishopTrack.scrollWidth;
    const containerW = bishopTrack.parentElement.offsetWidth;
    return Math.max(0, trackW - containerW);
  }
  function bClamp(pos){
    const max = bMaxScroll();
    return Math.min(0, Math.max(-max, pos));
  }
  function bApply(animate){
    bishopTrack.style.transition = animate ? 'transform .5s cubic-bezier(.4,0,.2,1)' : 'none';
    bishopTrack.style.transform = `translateX(${bPos}px)`;
  }

  function bishopSlide(dir){
    const cardEl = bishopTrack.querySelector('.bsc');
    const step = cardEl ? (cardEl.getBoundingClientRect().width + 20) * 2 : 440; /* move ~2 cards */
    bPos = bClamp(bPos - dir * step);
    bApply(true);
  }

  function bishopStartDrag(e){
    bDragging = true;
    bStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    bStartPos = bPos;
    bApply(false);
    bishopTrack.style.cursor = 'grabbing';
  }
  function bishopMoveDrag(e){
    if(!bDragging) return;
    e.preventDefault?.();
    bCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const dragDist = bCurrentX - bStartX;
    bPos = bClamp(bStartPos + dragDist);
    bApply(false);
  }
  function bishopEndDrag(){
    if(!bDragging) return;
    bDragging = false;
    bApply(true);
    bishopTrack.style.cursor = 'grab';
  }

  bishopTrack.addEventListener('mousedown', bishopStartDrag);
  document.addEventListener('mousemove', bishopMoveDrag);
  document.addEventListener('mouseup', bishopEndDrag);
  bishopTrack.addEventListener('touchstart', bishopStartDrag, { passive: true });
  bishopTrack.addEventListener('touchmove', bishopMoveDrag, { passive: false });
  bishopTrack.addEventListener('touchend', bishopEndDrag);
  window.addEventListener('resize', () => { bPos = bClamp(bPos); bApply(false); });

  bishopTrack.style.cursor = 'grab';
  window.bishopSlide = bishopSlide;
}

/* ── GALLERY EVENT FOLDERS (open / close) ── */
function openGalEvent(id){
  const foldersView = document.getElementById('galFoldersView');
  if(foldersView) foldersView.style.display = 'none';
  document.querySelectorAll('.gal-event-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('ev-' + id);
  if(target){
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const track = target.querySelector('.gal-track-event');
    if(track) initGalEventTrack(track);
  }
}
function closeGalEvent(){
  document.querySelectorAll('.gal-event-view').forEach(v => v.classList.remove('active'));
  const foldersView = document.getElementById('galFoldersView');
  if(foldersView) foldersView.style.display = 'block';
  const gallerySection = document.getElementById('gallery');
  if(gallerySection) gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.openGalEvent = openGalEvent;
window.closeGalEvent = closeGalEvent;

/* ── EVENT GALLERY TRACKS (drag-scroll, pixel-accurate extremes, one per folder) ── */
function initGalEventTrack(track){
  if(track.dataset.initialized) return;
  track.dataset.initialized = 'true';

  let pos = 0;
  let dragging = false;
  let startX = 0;
  let startPos = 0;
  let currentX = 0;
  let autoTimer = null;

  function maxScroll(){
    return Math.max(0, track.scrollWidth - track.parentElement.offsetWidth);
  }
  function clamp(p){
    const max = maxScroll();
    return Math.min(0, Math.max(-max, p));
  }
  function apply(animate){
    track.style.transition = animate ? 'transform .5s cubic-bezier(.4,0,.2,1)' : 'none';
    track.style.transform = `translateX(${pos}px)`;
  }
  function autoSlide(){
    if(dragging) return;
    const max = maxScroll();
    const cardEl = track.querySelector('.gi');
    const step = cardEl ? cardEl.getBoundingClientRect().width + 16 : 220;
    if(pos <= -max){ pos = 0; } else { pos = clamp(pos - step); }
    apply(true);
  }
  function startAuto(){ autoTimer = setInterval(autoSlide, 2800); }
  function stopAuto(){ if(autoTimer) clearInterval(autoTimer); autoTimer = null; }

  function startDrag(e){
    stopAuto();
    dragging = true;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    startPos = pos;
    apply(false);
    track.style.cursor = 'grabbing';
  }
  function moveDrag(e){
    if(!dragging) return;
    e.preventDefault?.();
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    pos = clamp(startPos + (currentX - startX));
    apply(false);
  }
  function endDrag(){
    if(!dragging) return;
    dragging = false;
    apply(true);
    track.style.cursor = 'grab';
    startAuto();
  }

  track.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);
  track.addEventListener('touchstart', startDrag, { passive: true });
  track.addEventListener('touchmove', moveDrag, { passive: false });
  track.addEventListener('touchend', endDrag);
  window.addEventListener('resize', () => { pos = clamp(pos); apply(false); });

  track.style.cursor = 'grab';
  startAuto();
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