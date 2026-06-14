/**
 * gallery.js — Mitaali's Mandala Portfolio
 *
 * HOW DYNAMIC IMAGE LOADING WORKS
 * ────────────────────────────────
 * Pure static HTML has no way to list directory contents — browsers
 * cannot read folder listings without a server.
 *
 * The cleanest production approach (zero build step) is a small
 * manifest file: `images/manifest.json`. This file lists every
 * image in the folder. You update it once each time you add images.
 *
 * Alternatively, if deploying to Netlify/Vercel, a tiny serverless
 * function can generate the manifest automatically.
 *
 * See README.md for the full workflow.
 */

'use strict';

/* ── CONFIG ─────────────────────────────────────── */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MANIFEST_PATH    = 'images/manifest.json';

/* ── FALLBACK (demo mode) ────────────────────────
 * If no manifest.json exists, the gallery tries the
 * standard filenames from the original project so the
 * page still works without any server setup.
 */
const FALLBACK_IMAGES = [
  'images/mandala1.jpg',  'images/mandala3.jpg',
  'images/mandala4.jpg',  'images/mandala5.jpg',
  'images/mandala6.jpg',  'images/mandala7.jpg',
  'images/mandala8.jpg',  'images/mandala9.jpg',
  'images/mandala10.jpg', 'images/mandala11.jpg',
];

/* ── STATE ───────────────────────────────────────── */
let allImages    = [];
let currentIndex = 0;

/* ── DOM REFS ────────────────────────────────────── */
const grid        = document.getElementById('masonryGrid');
const emptyState  = document.getElementById('galleryEmpty');
const countEl     = document.getElementById('galleryCount');
const countPieces = document.getElementById('countPieces');
const scrollProg  = document.getElementById('scrollProgress');
const navEl       = document.getElementById('nav');
const backToTop   = document.getElementById('backToTop');

// Lightbox
const lightbox   = document.getElementById('lightbox');
const lbOverlay  = document.getElementById('lbOverlay');
const lbImg      = document.getElementById('lbImg');
const lbCaption  = document.getElementById('lbCaption');
const lbCounter  = document.getElementById('lbCounter');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');

/* ── LOAD IMAGES ─────────────────────────────────── */
async function loadImages() {
  try {
    const res = await fetch(MANIFEST_PATH);
    if (!res.ok) throw new Error('No manifest');
    const manifest = await res.json();
    // manifest is either string[] of filenames, or object with .images[]
    const files = Array.isArray(manifest) ? manifest : manifest.images || [];
    allImages = files
      .filter(f => IMAGE_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)))
      .map(f => ({ src: `images/${f}`, name: formatName(f) }));
  } catch {
    // Try fallback: probe each known filename silently
    allImages = FALLBACK_IMAGES.map(src => ({
      src,
      name: formatName(src.split('/').pop())
    }));
  }

  if (allImages.length === 0) {
    emptyState.hidden = false;
    return;
  }

  renderGallery();
  animateCounter(allImages.length);
}

/* ── FORMAT FILENAME → READABLE LABEL ───────────── */
function formatName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')         // strip extension
    .replace(/[-_]/g, ' ')           // hyphens/underscores → spaces
    .replace(/(\d+)$/, ' $1')        // space before trailing number
    .replace(/\b\w/g, c => c.toUpperCase())  // title case
    .trim();
}

/* ── RENDER MASONRY GRID ─────────────────────────── */
function renderGallery() {
  countEl.textContent = `${allImages.length} piece${allImages.length !== 1 ? 's' : ''}`;

  allImages.forEach((img, i) => {
    const item = document.createElement('div');
    item.className = 'masonry__item';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Open ${img.name} in full view`);

    const image = new Image();
    image.alt     = img.name;
    image.loading = 'lazy';          // native lazy loading
    image.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'masonry__item__overlay';
    const label = document.createElement('span');
    label.className = 'masonry__item__label';
    label.textContent = img.name;
    overlay.appendChild(label);

    item.appendChild(image);
    item.appendChild(overlay);
    grid.appendChild(item);

    // Load image — only swap src after element is in DOM
    image.src = img.src;
    image.onerror = () => { item.style.display = 'none'; };

    // Click / keyboard
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });

    // Intersection Observer for staggered fade-in
    observeItem(item, i);
  });
}

/* ── INTERSECTION OBSERVER ───────────────────────── */
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

/* ── COUNTER ANIMATION ───────────────────────────── */
function animateCounter(target) {
  if (!countPieces) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const tick = setInterval(() => {
    current = Math.min(current + step, target);
    countPieces.textContent = current;
    if (current >= target) clearInterval(tick);
  }, 40);
}

/* ── LIGHTBOX ────────────────────────────────────── */
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
  // Return focus to the grid item
  const items = grid.querySelectorAll('.masonry__item');
  if (items[currentIndex]) items[currentIndex].focus();
}

function showImage(index) {
  currentIndex = (index + allImages.length) % allImages.length;
  const { src, name } = allImages[currentIndex];
  lbImg.src       = '';                     // trigger re-animation
  requestAnimationFrame(() => {
    lbImg.src     = src;
    lbImg.alt     = name;
    lbCaption.textContent = name;
    lbCounter.textContent = `${currentIndex + 1} / ${allImages.length}`;
  });
}

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showImage(currentIndex - 1));
lbNext.addEventListener('click', () => showImage(currentIndex + 1));

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showImage(currentIndex - 1);
  if (e.key === 'ArrowRight')  showImage(currentIndex + 1);
});

/* Touch swipe for lightbox */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
}, { passive: true });

/* ── SCROLL EFFECTS ──────────────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

function onScroll() {
  const scrollY   = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress  = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

  scrollProg.style.width = progress + '%';
  navEl.classList.toggle('scrolled', scrollY > 60);
  backToTop.classList.toggle('visible', scrollY > 400);
  ticking = false;
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── INIT ────────────────────────────────────────── */
loadImages();
