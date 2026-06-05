/* =============================================================================
   PABLO LLINAS — main.js
   ============================================================================= */

'use strict';

/* ---------------------------------------------------------------------------
   1. PAGE LOAD STATE
   --------------------------------------------------------------------------- */
(function initPageLoad() {
  document.body.classList.add('is-loading');

  window.addEventListener('load', () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  });
})();


/* ---------------------------------------------------------------------------
   2. NAVIGATION — transparent always, adapts to section background
   --------------------------------------------------------------------------- */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const lightSections = document.querySelectorAll('[data-nav-light]');
  let ticking = false;

  function updateNav() {
    const threshold = 64; // nav height
    let isLight = false;

    lightSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= threshold && rect.bottom > threshold) {
        isLight = true;
      }
    });

    nav.classList.toggle('nav--light-bg', isLight);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNav(); // run once on load
})();


/* ---------------------------------------------------------------------------
   3. HERO TEXT ANIMATION
   --------------------------------------------------------------------------- */
(function initHeroAnimation() {
  const schedule = [
    { selector: '.hero__eyebrow',           delay: 300  },
    { selector: '.hero__line:nth-child(1)', delay: 1000 },
    { selector: '.hero__line:nth-child(2)', delay: 1700 },
    { selector: '.hero__line:nth-child(3)', delay: 1800 },
  ];

  function revealHero() {
    schedule.forEach(({ selector, delay }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      setTimeout(() => el.classList.add('is-visible'), delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealHero);
  } else {
    revealHero();
  }
})();


/* ---------------------------------------------------------------------------
   4. SCROLL REVEAL — Intersection Observer
   --------------------------------------------------------------------------- */
(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.project-card, .about__content, .about__image-wrap, .about__credential, .contact,' +
    '.work-item, .work-section__header, .work-intro__line,' +
    '.proj-item, .proj-header__eyebrow, .proj-header__heading, .proj-header__sub,' +
    '.pp-intro__inner, .pp-section__header, .pp-grid__item, .pp-single-img, .pp-full-bleed-img, .pp-next__inner,' +
    '.pp-reel__header, .pp-reel__card,' +
    '.pp-final-caption, .pp-split, .pp-features, .pp-feature'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  targets.forEach((el) => observer.observe(el));
})();


/* ---------------------------------------------------------------------------
   5. PROJECT CARD PARALLAX — mousemove image shift
   --------------------------------------------------------------------------- */
(function initCardParallax() {
  const cards = document.querySelectorAll('.project-card');
  const MAX_SHIFT = 8; // px

  cards.forEach((card) => {
    const img = card.querySelector('.project-card__image');
    if (!img) return;

    img.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease';

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;

      const tx = cx * MAX_SHIFT * -1;
      const ty = cy * MAX_SHIFT * -1;

      img.style.transform = `scale(1.06) translate(${tx}px, ${ty}px)`;
    }

    function onLeave() {
      img.style.transform = '';
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
})();


/* ---------------------------------------------------------------------------
   6. SMOOTH SCROLL — anchor links with nav offset
   --------------------------------------------------------------------------- */
(function initSmoothScroll() {
  const NAV_HEIGHT = 64;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---------------------------------------------------------------------------
   7. CUSTOM CURSOR
   --------------------------------------------------------------------------- */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  document.body.appendChild(cursor);

  let mx = window.innerWidth  / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;
  const LERP = 0.18;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    cx = lerp(cx, mx, LERP);
    cy = lerp(cy, my, LERP);
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  const hoverTargets = 'a, button, .project-card, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.add('cursor--hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.remove('cursor--hover');
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('cursor--hidden'));
})();


/* ---------------------------------------------------------------------------
   8. SCROLL GALLERY — front pair slides up over sticky back image
   --------------------------------------------------------------------------- */
(function initScrollGallery() {
  const gallery = document.querySelector('.pp-scroll-gallery');
  if (!gallery) return;

  const front = gallery.querySelector('.pp-scroll-gallery__front');

  function update() {
    const rect     = gallery.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const raw      = -rect.top / scrollable;           // 0 → 1 as gallery scrolls
    const progress = Math.max(0, Math.min(1, raw));

    // Front images start sliding in immediately, fully in at 60%
    const start = 0.05, end = 0.60;
    const slide = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    front.style.transform = `translateY(${(1 - slide) * 100}%)`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();


/* ---------------------------------------------------------------------------
   9. VIDEO CAPTIONS — sync WebVTT track to custom caption display
   --------------------------------------------------------------------------- */
(function initVideoCaptions() {
  const video   = document.getElementById('hypnos-video');
  const display = document.getElementById('hypnos-caption');
  const trackEl = document.getElementById('hypnos-track');
  if (!video || !display || !trackEl) return;

  function syncCaption() {
    const track = trackEl.track;
    track.mode = 'hidden'; // prevent browser default rendering
    const cues = track.activeCues;
    display.textContent = cues && cues.length
      ? cues[0].text.replace(/\n/g, ' ')
      : '';
  }

  video.addEventListener('timeupdate', syncCaption);
  trackEl.addEventListener('load', () => { trackEl.track.mode = 'hidden'; });
})();
