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
  function teamSlide(dir){
    const tot = teamTrack.children.length;
    const vis = Math.floor(teamTrack.parentElement.offsetWidth / CARD_W);
    tIdx = Math.max(0, Math.min(tIdx + dir, tot - vis));
    teamTrack.style.transform = `translateX(-${tIdx * CARD_W}px)`;
  }
  // Expose globally for onclick
  window.teamSlide = teamSlide;
  // Auto-slide
  setInterval(() => {
    const tot = teamTrack.children.length;
    const vis = Math.floor(teamTrack.parentElement.offsetWidth / CARD_W);
    if(tIdx >= tot - vis) tIdx = -1;
    teamSlide(1);
  }, 3200);
}

/* ── GALLERY SLIDER ── */
let gIdx = 0;
const GAL_W = 274;
const galTrack = document.getElementById('galTrack');
if(galTrack){
  function galSlide(dir){
    const tot = galTrack.children.length;
    const vis = Math.floor(galTrack.parentElement.offsetWidth / GAL_W);
    gIdx += dir;
    if(gIdx > tot - vis) gIdx = 0;
    if(gIdx < 0) gIdx = tot - vis;
    galTrack.style.transform = `translateX(-${gIdx * GAL_W}px)`;
  }
  window.galSlide = galSlide;
  setInterval(() => galSlide(1), 2800);
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
