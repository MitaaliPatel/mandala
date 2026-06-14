/**
 * gallery.js — Mitaali's Mandala Portfolio
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TO ADD / REMOVE IMAGES — edit the two
 *  lists below. That's the only file you
 *  ever need to touch.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

'use strict';

/* ══════════════════════════════════════════
   ①  YOUR GALLERY IMAGES
   Add or remove filenames here.
   Files must be inside the  images/  folder.
   ══════════════════════════════════════════ */
const GALLERY_IMAGES = [
  'mandala1.jpg',
  'mandala3.jpg',
  'mandala4.jpg',
  'mandala5.jpg',
  'mandala6.jpg',
  'mandala7.jpg',
  'mandala8.jpg',
  'mandala9.jpg',
  'mandala10.jpg',
  'mandala11.jpg',
];

/* ══════════════════════════════════════════
   ②  YOUR COMMISSIONED IMAGES
   Add or remove filenames here.
   Files must be inside  images/commissioned/
   Leave the list empty [] to hide the section.
   ══════════════════════════════════════════ */
const COMMISSIONED_IMAGES = [
  // 'commission1.jpg',
  // 'commission2.jpg',
];

/* ─── everything below runs automatically ─── */

const allImages         = GALLERY_IMAGES.map(f => ({ src: `images/${f}` }));
const commissionedImages = COMMISSIONED_IMAGES.map(f => ({ src: `images/commissioned/${f}` }));

let currentIndex = 0;

/* ── DOM REFS ─────────────────────────────── */
const grid       = document.getElementById('masonryGrid');
const commGrid   = document.getElementById('commissionedGrid');
const scrollProg = document.getElementById('scrollProgress');
const navEl      = document.getElementById('nav');
const backToTop  = document.getElementById('backToTop');
const lightbox   = document.getElementById('lightbox');
const lbOverlay  = document.getElementById('lbOverlay');
const lbImg      = document.getElementById('lbImg');
const lbCaption  = document.getElementById('lbCaption');
const lbCounter  = document.getElementById('lbCounter');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');

/* ── INIT ─────────────────────────────────── */
function init() {
  buildGrid(allImages, grid, 0);

  if (commissionedImages.length === 0) {
    const commSection = document.querySelector('.commissioned');
    if (commSection) commSection.style.display = 'none';
  } else {
    buildGrid(commissionedImages, commGrid, allImages.length);
  }
}

/* ── BUILD GRID ───────────────────────────── */
function buildGrid(images, container, indexOffset) {
  images.forEach((img, i) => {
    const globalIndex = indexOffset + i;

    const item = document.createElement('div');
    item.className = 'masonry__item';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', 'Open artwork in full view');

    const image = new Image();
    image.alt      = 'Mandala artwork';
    image.loading  = 'lazy';
    image.decoding = 'async';
    image.src      = img.src;
    image.onerror  = () => { item.style.display = 'none'; };

    item.appendChild(image);
    container.appendChild(item);

    item.addEventListener('click', () => openLightbox(globalIndex));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(globalIndex); }
    });

    observeItem(item, globalIndex);
  });
}

/* ── INTERSECTION OBSERVER (fade-in) ─────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = (parseInt(entry.target.dataset.i || 0) % 6) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeItem(el, i) {
  el.dataset.i = i;
  observer.observe(el);
}

/* ── LIGHTBOX ─────────────────────────────── */
const combined = () => [...allImages, ...commissionedImages];

function openLightbox(index) {
  currentIndex = index;
  showImage(index);
  lightbox.hidden  = false;
  lbOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden  = true;
  lbOverlay.hidden = true;
  document.body.style.overflow = '';
}

function showImage(index) {
  const all = combined();
  currentIndex = (index + all.length) % all.length;
  lbImg.src = '';
  requestAnimationFrame(() => {
    lbImg.src = all[currentIndex].src;
    lbImg.alt = 'Mandala artwork';
    lbCounter.textContent = `${currentIndex + 1} / ${all.length}`;
  });
}

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showImage(currentIndex - 1));
lbNext.addEventListener('click', () => showImage(currentIndex + 1));

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

/* Touch swipe */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
}, { passive: true });

/* ── SCROLL EFFECTS ───────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });

function onScroll() {
  const scrollY   = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProg.style.width = (docHeight > 0 ? (scrollY / docHeight) * 100 : 0) + '%';
  navEl.classList.toggle('scrolled', scrollY > 60);
  backToTop.classList.toggle('visible', scrollY > 400);
  ticking = false;
}

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── START ────────────────────────────────── */
init();