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
  // A → B → C: each part starts as soon as the previous finishes (1.5s transition + 100ms breath)
  const schedule = [
    { selector: '.hero__eyebrow',           delay: 400  }, // A — done ~1900ms
    { selector: '.hero__line:nth-child(1)', delay: 2000 }, // B — done ~3500ms
    { selector: '.hero__line:nth-child(2)', delay: 3600 }, // C — both lines together
    { selector: '.hero__line:nth-child(3)', delay: 3700 },
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
    '.project-card, .about__content, .about__image-wrap, .about__credential, .contact'
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
