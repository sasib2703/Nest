/**
 * NEST — Phase 2
 * Hero Section — Interaction Controller
 *
 * Responsibilities:
 *  1. Trigger hero entrance animations after intro animation completes
 *  2. Scroll-driven parallax on background image
 *  3. Scroll-driven content fade-out (smooth transition into next section)
 *  4. Navbar transparent→solid transition when hero is in view
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     ELEMENT REFERENCES
  ───────────────────────────────────────────────────────────── */

  const hero        = document.getElementById('hero');
  const heroBg      = document.getElementById('hero-bg');
  const heroContent = document.getElementById('hero-content');
  const heroMeta    = document.getElementById('hero-meta');
  const navbar      = document.getElementById('nest-navbar');

  if (!hero) return;

  /* ─────────────────────────────────────────────────────────────
     1. HERO ENTRANCE — Timed relative to intro animation
     Phase 1 intro ends at ~1600ms. Hero reveals as intro clears.
  ───────────────────────────────────────────────────────────── */

  function activateHero () {
    hero.classList.add('is-ready');
  }

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // No intro was shown — reveal immediately
    activateHero();
  } else {
    // Intro animation lasts ~1600ms; activate hero as it clears
    // The CSS transitions handle the per-element staggering
    setTimeout(activateHero, 1400);
  }


  /* ─────────────────────────────────────────────────────────────
     2. SCROLL — Parallax background + content fade
     Uses requestAnimationFrame for smooth 60fps performance.
     Only runs if reduced motion is not preferred.
  ───────────────────────────────────────────────────────────── */

  if (!prefersReduced) {

    let ticking     = false;
    let lastScrollY = 0;

    /*
     * Cache heroHeight outside the rAF callback so we never
     * trigger a forced layout (reflow) inside the hot scroll path.
     * Update it on resize via ResizeObserver.
     */
    let heroHeight = hero.offsetHeight;

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        heroHeight = hero.offsetHeight;
      }).observe(hero);
    } else {
      window.addEventListener('resize', function () {
        heroHeight = hero.offsetHeight;
      }, { passive: true });
    }

    function onScroll () {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    }

    function updateOnScroll () {
      const scrollY = lastScrollY;

      // Only run while hero is at least partially in viewport
      if (scrollY > heroHeight) {
        ticking = false;
        return;
      }

      // ── Content fade: starts at 12% scroll, complete at 55% ──
      const fadeStart    = heroHeight * 0.12;
      const fadeEnd      = heroHeight * 0.55;
      const fadeProgress = Math.max(0, Math.min(1,
        (scrollY - fadeStart) / (fadeEnd - fadeStart)
      ));
      const contentOpacity = 1 - fadeProgress;
      const contentShift   = fadeProgress * -30;

      if (heroContent) {
        heroContent.style.opacity   = contentOpacity;
        heroContent.style.transform = 'translate3d(0, ' + contentShift + 'px, 0)';
      }

      if (heroMeta) {
        heroMeta.style.opacity   = contentOpacity;
        heroMeta.style.transform = 'translate3d(0, ' + contentShift + 'px, 0)';
      }

      ticking = false;
    }

    window.addEventListener('scroll', onScroll, { passive: true });

  }



  /* ─────────────────────────────────────────────────────────────
     3. NAVBAR COLOR — Transparent while hero is in view
     When hero occupies the viewport, make navbar text white
     for legibility against the dark hero background.
     Phase 1 navbar already handles its own scroll solidification.
  ───────────────────────────────────────────────────────────── */

  if (navbar) {

    /*
     * Apply is-over-hero IMMEDIATELY — before any async observer fires.
     * Without this, the navbar briefly shows as white with white text
     * (invisible) on first paint because the observer callback is async.
     * The hero now slides behind the sticky navbar (margin-top: -72px),
     * so transparent background correctly reveals the dark hero image.
     */
    navbar.classList.add('is-over-hero');

    /*
     * Use IntersectionObserver only to REMOVE the class once the hero
     * completely scrolls out of view. The navbar.js scroll handler
     * already adds is-scrolled (frosted glass) as the user scrolls down.
     */
    if ('IntersectionObserver' in window) {

      const navbarObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              navbar.classList.add('is-over-hero');
            } else {
              navbar.classList.remove('is-over-hero');
            }
          });
        },
        {
          threshold:  0,
          rootMargin: '0px 0px 0px 0px'
        }
      );

      navbarObserver.observe(hero);

    }

  }


  /* ─────────────────────────────────────────────────────────────
     4. CTA BUTTON — Magnetic hover micro-interaction
     Subtle attraction toward cursor on hover — minimal, refined
  ───────────────────────────────────────────────────────────── */

  if (!prefersReduced) {

    const btns = hero.querySelectorAll('.hero__btn');

    btns.forEach(function (btn) {

      btn.addEventListener('mousemove', function (e) {
        const rect   = btn.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);

        // Very subtle magnetic pull — max 3px
        btn.style.transform = 'translate('
          + (dx * 3) + 'px, '
          + (dy * 3 - 2) + 'px)'; // -2 keeps the hover lift
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });

    });

  }

}());
