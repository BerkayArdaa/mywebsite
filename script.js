// ================================
//  UX helpers (nav, reveal, projects)
// ================================

// Smooth scrolling (keeps native anchor semantics)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Navbar scroll effect + active link
const navbar = document.querySelector('.navbar');
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

function setActiveNavLink() {
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const scrollPos = window.scrollY + 110; // account for fixed header
  let current = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPos) current = section.id;
  });

  navLinks.forEach((a) => {
    const id = (a.getAttribute('href') || '').replace('#', '');
    a.classList.toggle('active', id && id === current);
  });
}

window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.style.backgroundColor = window.scrollY > 30 ? 'rgba(10, 10, 10, 0.92)' : 'rgba(10, 10, 10, 0.78)';
  setActiveNavLink();
});

// Mobile menu
const navToggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('primary-menu');

function closeMenu() {
  if (!menu || !navToggle) return;
  menu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && menu) {
  navToggle.addEventListener('click', () => {
    const willOpen = !menu.classList.contains('open');
    menu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(willOpen));
  });

  // close menu when clicking a link
  navLinks.forEach((a) => a.addEventListener('click', closeMenu));
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => io.observe(el));
}

// Expandable project cards
document.querySelectorAll('[data-expandable]').forEach((card) => {
  const btn = card.querySelector('.expand-btn');
  const info = card.querySelector('.project-info');
  if (!btn || !info) return;

  const toggle = () => {
    const isOpen = card.classList.toggle('active');
    btn.textContent = isOpen ? 'Close' : 'Details';
    btn.setAttribute('aria-expanded', String(isOpen));
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // clicking header also toggles (but not links/media)
  card.querySelector('.project-header')?.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('a') || target.closest('button')) return;
    toggle();
  });

  // prevent card toggling when interacting with media inside details
  info.querySelectorAll('a, video, img').forEach((el) => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });
});

// ================================
//  Lightbox (image galleries)
// ================================
let currentImageIndex = 0;
let images = Array.from(document.querySelectorAll('.image-gallery img'));

images.forEach((img, index) => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageIndex = index;
    openLightbox(images[currentImageIndex].src);
  });
});

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  lightbox.style.display = 'flex';
  lightboxImg.src = src;
}

function closeLightbox(event) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  if (event.target === lightbox || event.target.classList.contains('close-btn')) {
    lightbox.style.display = 'none';
    const img = document.getElementById('lightbox-img');
    if (img) img.src = '';
  }
}

function changeImage(direction) {
  if (!images.length) return;
  currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
  const img = document.getElementById('lightbox-img');
  if (img) img.src = images[currentImageIndex].src;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  if (lightbox.style.display === 'flex') {
    if (e.key === 'ArrowLeft') changeImage(-1);
    if (e.key === 'ArrowRight') changeImage(1);
    if (e.key === 'Escape') closeLightbox({ target: lightbox });
  }
});

// ================================
//  Hero portrait motion (subtle float + tilt)
// ================================
(() => {
  const hero = document.querySelector('.hero');
  const wrap = document.querySelector('.hero-image');
  const img = document.querySelector('.profile-img');
  if (!hero || !wrap || !img) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (prefersReduced || coarsePointer) return;

  let rafId = 0;
  let target = { rx: 0, ry: 0, tx: 0, ty: 0 };
  let current = { rx: 0, ry: 0, tx: 0, ty: 0 };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function render() {
    rafId = 0;
    // smooth toward target
    const lerp = 0.12;
    current.rx += (target.rx - current.rx) * lerp;
    current.ry += (target.ry - current.ry) * lerp;
    current.tx += (target.tx - current.tx) * lerp;
    current.ty += (target.ty - current.ty) * lerp;

    img.style.transform = `translate3d(${current.tx}px, ${current.ty}px, 0) rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
  }

  function requestRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(render);
  }

  hero.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

    const nx = clamp(x, -1, 1);
    const ny = clamp(y, -1, 1);

    // small + premium: tiny tilt, tiny translate
    target.ry = nx * 8;     // left/right tilt
    target.rx = -ny * 8;    // up/down tilt
    target.tx = nx * 10;
    target.ty = ny * 10;

    requestRender();
  });

  hero.addEventListener('mouseleave', () => {
    target = { rx: 0, ry: 0, tx: 0, ty: 0 };
    requestRender();
  });
})();

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
