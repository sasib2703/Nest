/**
 * NEST — Phase 3
 * Homepage Section Animations & Interactions
 *
 * Responsibilities:
 *  1. Scroll-reveal — sections + staggered children fade up on enter
 *  2. Category card keyboard activation (Enter/Space)
 *  3. Product card "Add to Cart" feedback
 *  4. Newsletter form submission handling
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     REDUCED MOTION CHECK
  ───────────────────────────────────────────────────────────── */

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ─────────────────────────────────────────────────────────────
     1. SCROLL REVEAL
     Each .reveal-section fades up when it enters the viewport.
     Cards within each section get a staggered entrance.
  ───────────────────────────────────────────────────────────── */

  if (!prefersReduced && 'IntersectionObserver' in window) {

    /* ── Section-level observer ── */
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const section = entry.target;
          section.classList.add('is-visible');

          /* Stagger child reveal-items inside this section */
          const items = section.querySelectorAll(
            '.cat-card, .feat-card, .why-card, .prod-card, .testi-card'
          );

          items.forEach(function (item, index) {
            setTimeout(function () {
              item.classList.add('reveal-item', 'is-visible');
            }, index * 80);
          });

          /* Stop observing once revealed */
          sectionObserver.unobserve(section);
        });
      },
      {
        threshold:  0.08,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    /* Observe all reveal sections */
    document.querySelectorAll('.reveal-section').forEach(function (section) {
      sectionObserver.observe(section);
    });

    /* ── Newsletter section observer (uses same threshold) ── */
    const newsletterSection = document.querySelector('.s-newsletter');
    if (newsletterSection) {
      sectionObserver.observe(newsletterSection);
    }

  } else {
    /* Reduced motion or no IntersectionObserver — show everything immediately */
    document.querySelectorAll('.reveal-section').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ─────────────────────────────────────────────────────────────
     2. CATEGORY CARDS — Keyboard activation
     Cards are <article tabindex="0"> — allow Enter/Space to click
  ───────────────────────────────────────────────────────────── */

  document.querySelectorAll('.cat-card, .feat-card').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });


  /* ─────────────────────────────────────────────────────────────
     3. PRODUCT CARDS — "Add to Cart" button feedback
     Visual micro-confirmation without routing to a cart page.
     Phases 4+ will wire up actual cart state.
  ───────────────────────────────────────────────────────────── */

  document.querySelectorAll('.prod-card__btn').forEach(function (btn) {

    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      if (window.NEST && window.NEST.cart && btn.dataset.id) {
        window.NEST.cart.addToCart(btn.dataset.id, 1);
        return;
      }

      if (btn.dataset.adding) return; // prevent double-click
      btn.dataset.adding = 'true';

      const originalText  = btn.textContent.trim();
      const originalWidth = btn.offsetWidth;

      /* Lock width so button doesn't resize */
      btn.style.minWidth = originalWidth + 'px';

      /* Confirmation state */
      btn.textContent = 'Added ✓';
      btn.style.background   = 'var(--color-text-primary)';
      btn.style.color        = 'var(--color-text-inverse)';
      btn.style.borderColor  = 'var(--color-text-primary)';

      /* Update cart badge via Phase 1 API */
      if (window.NEST && window.NEST.updateCartBadge) {
        const currentCount = parseInt(
          document.getElementById('cart-count').textContent || '0', 10
        );
        window.NEST.updateCartBadge(currentCount + 1);
      }

      /* Reset after 1.8s */
      setTimeout(function () {
        btn.textContent       = originalText;
        btn.style.background  = '';
        btn.style.color       = '';
        btn.style.borderColor = '';
        btn.style.minWidth    = '';
        delete btn.dataset.adding;
      }, 1800);
    });

  });


  /* ─────────────────────────────────────────────────────────────
     4. NEWSLETTER FORM — Submit handling
  ───────────────────────────────────────────────────────────── */

  const newsletterForm = document.querySelector('.newsletter-form');
  const newsletterBtn  = document.querySelector('.newsletter-btn');
  const newsletterInput = document.getElementById('newsletter-email');

  if (newsletterForm && newsletterBtn) {

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!newsletterInput || !newsletterInput.value.trim()) return;
      if (newsletterBtn.dataset.submitting) return;
      newsletterBtn.dataset.submitting = 'true';

      const originalText = newsletterBtn.textContent.trim();
      newsletterBtn.textContent = 'Subscribed ✓';

      /* Move focus to button for screen reader feedback */
      newsletterBtn.focus();

      setTimeout(function () {
        newsletterBtn.textContent = originalText;
        if (newsletterInput) newsletterInput.value = '';
        delete newsletterBtn.dataset.submitting;
      }, 2500);
    });

  }

}());
