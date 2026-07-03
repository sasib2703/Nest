/**
 * NEST — Phase 1
 * Navbar & Opening Animation — Interaction Controller
 *
 * Responsibilities:
 *  1. Orchestrate opening animation sequence (timing, class states)
 *  2. Navbar scroll-refined state
 *  3. Mobile menu open/close with focus trap
 *  4. Cart badge visibility
 *  5. Keyboard navigation / accessibility
 */

(function () {
  'use strict';

  /* Immediately enforce #f5f5f7 background to eliminate white flash */
  document.documentElement.style.background = "#f5f5f7";
  if (document.body) document.body.style.background = "#f5f5f7";

  /* Determine if loader should run (first visit, full page refresh, or logo click) */
  let isReload = false;
  try {
    isReload = (window.performance && window.performance.navigation && window.performance.navigation.type === 1) ||
               (window.performance && typeof window.performance.getEntriesByType === 'function' &&
                window.performance.getEntriesByType('navigation')[0] &&
                window.performance.getEntriesByType('navigation')[0].type === 'reload');
  } catch (e) {}

  let isLogoClick = false;
  try {
    isLogoClick = sessionStorage.getItem('nestLogoClicked') === 'true';
    if (isLogoClick) sessionStorage.removeItem('nestLogoClicked');
  } catch (e) {}

  let isFirstVisit = false;
  try {
    isFirstVisit = !sessionStorage.getItem('nestIntroPlayed');
  } catch (e) {}

  const shouldRunLoader = isReload || isLogoClick || isFirstVisit;

  /* Instant synchronous check to skip loader if not needed */
  try {
    if (!shouldRunLoader || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('no-intro-splash');
      const earlyIntro = document.getElementById('nest-intro');
      if (earlyIntro && earlyIntro.parentNode) {
        earlyIntro.parentNode.removeChild(earlyIntro);
      }
    }
  } catch (e) {}

  /* ─────────────────────────────────────────────────────────────
     ELEMENT REFERENCES
  ───────────────────────────────────────────────────────────── */

  const intro       = document.getElementById('nest-intro');
  const navbar      = document.getElementById('nest-navbar');
  const hamburger   = document.getElementById('btn-hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const backdrop    = document.getElementById('mobile-backdrop');
  const drawer      = document.getElementById('mobile-drawer');
  const closeBtn    = document.getElementById('btn-menu-close');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.mobile-menu__link') : [];
  const cartBadge   = document.getElementById('cart-count');


  /* ─────────────────────────────────────────────────────────────
     1. OPENING ANIMATION & PAGE LOAD TRANSITION
  ───────────────────────────────────────────────────────────── */

  function markPageLoaded () {
    if (document.body && !document.body.classList.contains('loaded')) {
      document.body.classList.add('loaded');
      document.body.style.background = "#f5f5f7";
    }
  }

  if (document.readyState === 'complete') {
    markPageLoaded();
  } else {
    window.addEventListener('load', markPageLoaded);
    setTimeout(markPageLoaded, 600); /* Safety fallback */
  }

  function runIntroSequence () {

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !shouldRunLoader) {
      document.documentElement.classList.add('no-intro-splash');
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      if (navbar) navbar.classList.add('no-intro');
      revealNavbar();
      markPageLoaded();
      return;
    }

    if (!intro) {
      if (navbar) navbar.classList.add('no-intro');
      revealNavbar();
      markPageLoaded();
      return;
    }

    try {
      sessionStorage.setItem('nestIntroPlayed', 'true');
    } catch (e) {}

    // Step 1: Fade in brand wordmark smoothly (opacity 0 -> 1, scale 0.97 -> 1)
    setTimeout(function () {
      intro.classList.add('is-brand-visible');
    }, 20);

    // Step 2: Hold briefly (~800ms) then fade out cleanly
    let minTimePassed = false;
    let pageLoaded    = document.readyState === 'complete';

    function tryExitIntro () {
      if (!minTimePassed || !pageLoaded) return;
      markPageLoaded();

      intro.classList.add('is-parting');

      setTimeout(function () {
        intro.classList.add('is-done');
        if (navbar) navbar.classList.add('no-intro');
        revealNavbar();
      }, 300);

      setTimeout(function () {
        if (intro && intro.parentNode) {
          intro.parentNode.removeChild(intro);
        }
      }, 800);
    }

    setTimeout(function () {
      minTimePassed = true;
      tryExitIntro();
    }, 850);

    if (!pageLoaded) {
      window.addEventListener('load', function () {
        pageLoaded = true;
        tryExitIntro();
      });
      setTimeout(function () {
        pageLoaded = true;
        tryExitIntro();
      }, 2000); /* Maximum wait fallback */
    }
  }

  function revealNavbar () {
    if (navbar) {
      navbar.classList.add('is-visible');
      /* Enable scroll-hide transitions only after the intro has fully settled.
         - With intro:    intro opacity+transform take ~2.1s total → wait 2400ms
         - Without intro: transition-delay is 0ms   → 50ms is plenty            */
      var scrollReadyDelay = navbar.classList.contains('no-intro') ? 50 : 2400;
      setTimeout(function () {
        if (navbar) navbar.classList.add('is-scroll-ready');
      }, scrollReadyDelay);
    }
  }


  /* ─────────────────────────────────────────────────────────────
     2. SCROLL — REFINED NAVBAR STATE
  ───────────────────────────────────────────────────────────── */

  function initScrollBehavior () {
    if (!navbar) return;

    const SCROLL_THRESHOLD = 40;   /* px before .is-scrolled pill kicks in  */
    const HIDE_THRESHOLD   = 80;   /* px before hide-on-scroll-down engages  */
    const DIRECTION_BUFFER = 8;    /* px user must scroll before we commit   */

    let lastScrollY    = window.scrollY;
    let ticking        = false;
    let accumulatedDelta = 0;        /* tracks net scroll since last direction change */

    function onScroll () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const currentY = window.scrollY;
          const delta    = currentY - lastScrollY;

          /* ── Near top: always show, always in pill or normal mode ── */
          if (currentY <= HIDE_THRESHOLD) {
            navbar.classList.remove('is-hidden');
            accumulatedDelta = 0;
          } else {
            /* Don't hide navbar if mobile menu is open */
            const menuOpen = mobileMenu && mobileMenu.classList.contains('is-open');

            if (!menuOpen) {
              accumulatedDelta += delta;

              if (accumulatedDelta > DIRECTION_BUFFER) {
                /* Scrolling DOWN — hide navbar */
                navbar.classList.add('is-hidden');
                accumulatedDelta = DIRECTION_BUFFER; /* clamp — prevents over-accumulation */
              } else if (accumulatedDelta < -DIRECTION_BUFFER) {
                /* Scrolling UP — reveal navbar */
                navbar.classList.remove('is-hidden');
                accumulatedDelta = -DIRECTION_BUFFER;
              }
            }
          }

          /* ── Pill morph (is-scrolled): independent of hide state ── */
          if (currentY > SCROLL_THRESHOLD) {
            navbar.classList.add('is-scrolled');
          } else {
            navbar.classList.remove('is-scrolled');
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────────
     3. MOBILE MENU — OPEN / CLOSE
  ───────────────────────────────────────────────────────────── */

  let previouslyFocused = null;

  function openMobileMenu () {
    if (!mobileMenu || !hamburger) return;

    previouslyFocused = document.activeElement;

    // Show the container (removes [hidden])
    mobileMenu.removeAttribute('hidden');

    // Force reflow so transition fires
    void mobileMenu.offsetWidth;

    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Move focus into drawer
    setTimeout(function () {
      if (closeBtn) closeBtn.focus();
    }, 60);

    // Trap focus within drawer
    mobileMenu.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', onEscapeKey);
  }

  function closeMobileMenu () {
    if (!mobileMenu || !hamburger) return;

    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');

    document.body.style.overflow = '';

    mobileMenu.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', onEscapeKey);

    // Wait for slide-out transition before adding [hidden]
    const duration = 480; // matches CSS transition
    setTimeout(function () {
      mobileMenu.setAttribute('hidden', '');
      // Return focus to trigger element
      if (previouslyFocused) {
        previouslyFocused.focus();
        previouslyFocused = null;
      }
    }, duration);
  }

  function toggleMobileMenu () {
    const isOpen = mobileMenu && mobileMenu.classList.contains('is-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  }


  /* ─────────────────────────────────────────────────────────────
     4. FOCUS TRAP (Mobile menu accessibility)
  ───────────────────────────────────────────────────────────── */

  function getFocusableElements () {
    if (!drawer) return [];
    return Array.from(
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return el.offsetParent !== null; // only visible elements
    });
  }

  function trapFocus (e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Backwards tab — wrap from first to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Forward tab — wrap from last to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onEscapeKey (e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  }


  /* ─────────────────────────────────────────────────────────────
     5. CART BADGE VISIBILITY
     Badge hides when count is 0, appears with spring animation when > 0
  ───────────────────────────────────────────────────────────── */

  function updateCartBadge (count) {
    if (!cartBadge) return;

    cartBadge.textContent = count > 99 ? '99+' : String(count);

    if (count > 0) {
      cartBadge.classList.add('is-active');
      // Update accessible label on the button
      const cartBtn = document.getElementById('btn-cart');
      if (cartBtn) {
        cartBtn.setAttribute(
          'aria-label',
          'Open cart, ' + count + ' item' + (count === 1 ? '' : 's')
        );
      }
    } else {
      cartBadge.classList.remove('is-active');
    }
  }

  // Expose globally so other modules (Phase 2+) can call it
  window.NEST = window.NEST || {};
  window.NEST.updateCartBadge = updateCartBadge;


  /* ─────────────────────────────────────────────────────────────
     6. MOBILE LINKS — Close menu on click
  ───────────────────────────────────────────────────────────── */

  function initMobileLinkClose () {
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
     7. BACKDROP CLICK — Close menu
  ───────────────────────────────────────────────────────────── */

  function initBackdropClose () {
    if (!backdrop) return;
    backdrop.addEventListener('click', closeMobileMenu);
  }


  /* ─────────────────────────────────────────────────────────────
     8. ACTIVE NAV LINK — Highlight current section
     Uses IntersectionObserver to mark links active as user scrolls
  ───────────────────────────────────────────────────────────── */

  function initActiveNavLinks () {
    const navLinks = document.querySelectorAll('.navbar__nav-link[href^="#"]');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    const sectionMap = new Map();

    navLinks.forEach(function (link) {
      const targetId = link.getAttribute('href').slice(1);
      const section  = document.getElementById(targetId);
      if (section) sectionMap.set(section, link);
    });

    if (sectionMap.size === 0) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const link = sectionMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            // Remove active from all
            navLinks.forEach(function (l) {
              l.removeAttribute('aria-current');
            });
            // Set active on this one
            link.setAttribute('aria-current', 'page');
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionMap.forEach(function (_, section) {
      observer.observe(section);
    });
  }


  /* ─────────────────────────────────────────────────────────────
     INIT — Wire everything up
  ───────────────────────────────────────────────────────────── */

  function init () {

    // 1. Opening animation
    runIntroSequence();

    // 2. Scroll behavior
    initScrollBehavior();

    // 3. Hamburger toggle
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    // 4. Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileMenu);
    }

    // 5. Backdrop click
    initBackdropClose();

    // 6. Mobile links close menu
    initMobileLinkClose();

    // 7. Active nav links
    initActiveNavLinks();

    // 8. Initial cart badge state (zero items on load)
    updateCartBadge(0);

    // 9. Profile Dropdown
    initProfileDropdown();

    // 10. Global Search
    initGlobalSearch();

    // 11. Track Logo Clicks for Apple-grade Loader Trigger
    document.querySelectorAll('.navbar__logo, .acct-logo').forEach(function (logo) {
      logo.addEventListener('click', function () {
        try {
          sessionStorage.setItem('nestLogoClicked', 'true');
        } catch (e) {}
      });
    });

  }

  /* ─────────────────────────────────────────────────────────────
     9. PROFILE DROPDOWN
  ───────────────────────────────────────────────────────────── */

  function initProfileDropdown() {
    const accountBtn = document.getElementById('btn-account');
    if (!accountBtn) return;
    
    var isSubpage = window.location.pathname.includes('/pages/');
    var pathPrefix = isSubpage ? './' : 'pages/';
    
    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'navbar__dropdown';
    dropdown.id = 'profile-dropdown';
    dropdown.setAttribute('hidden', 'true');
    dropdown.setAttribute('role', 'menu');
    dropdown.innerHTML = 
      '<ul class="navbar__dropdown-list">' +
        '<li><a href="' + pathPrefix + 'account.html" class="navbar__dropdown-item" role="menuitem">My Account</a></li>' +
        '<li><a href="' + pathPrefix + 'orders.html" class="navbar__dropdown-item" role="menuitem">Orders</a></li>' +
        '<li><a href="' + pathPrefix + 'wishlist.html" class="navbar__dropdown-item" role="menuitem">Wishlist</a></li>' +
        '<li class="navbar__dropdown-divider"></li>' +
        '<li><a href="' + pathPrefix + 'auth.html" class="navbar__dropdown-item" role="menuitem">Login / Logout</a></li>' +
      '</ul>';
    
    accountBtn.parentNode.insertBefore(dropdown, accountBtn.nextSibling);
    
    accountBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = !dropdown.hasAttribute('hidden');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
    
    function openDropdown() {
      dropdown.removeAttribute('hidden');
      void dropdown.offsetWidth;
      dropdown.classList.add('is-open');
      accountBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeDropdown() {
      dropdown.classList.remove('is-open');
      accountBtn.setAttribute('aria-expanded', 'false');
      setTimeout(function() {
        if (!dropdown.classList.contains('is-open')) {
          dropdown.setAttribute('hidden', 'true');
        }
      }, 300);
    }
    
    document.addEventListener('click', function(e) {
      if (!dropdown.hasAttribute('hidden') && !dropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        closeDropdown();
      }
    });
    
    const items = dropdown.querySelectorAll('.navbar__dropdown-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        closeDropdown();
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     10. GLOBAL SEARCH
  ───────────────────────────────────────────────────────────── */

  function initGlobalSearch() {
    const searchBtn = document.getElementById('btn-search');
    if (!searchBtn) return;

    const localSearchInput = document.getElementById('search-input');
    if (localSearchInput) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localSearchInput.focus();
        localSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'navbar__dropdown navbar__search-dropdown';
    dropdown.id = 'search-dropdown';
    dropdown.setAttribute('hidden', 'true');
    dropdown.innerHTML = 
      '<form class="navbar__search-form" id="global-search-form" role="search">' +
        '<input type="search" class="navbar__search-input" placeholder="Search products..." aria-label="Search products" autocomplete="off" />' +
      '</form>';

    searchBtn.parentNode.insertBefore(dropdown, searchBtn.nextSibling);

    const form = dropdown.querySelector('#global-search-form');
    const input = dropdown.querySelector('.navbar__search-input');

    searchBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = !dropdown.hasAttribute('hidden');
      if (isOpen) {
        closeSearch();
      } else {
        openSearch();
      }
    });

    function openSearch() {
      const profileDropdown = document.getElementById('profile-dropdown');
      if (profileDropdown && !profileDropdown.hasAttribute('hidden')) {
        profileDropdown.setAttribute('hidden', 'true');
        profileDropdown.classList.remove('is-open');
      }

      dropdown.removeAttribute('hidden');
      void dropdown.offsetWidth;
      dropdown.classList.add('is-open');
      searchBtn.setAttribute('aria-expanded', 'true');
      setTimeout(function() { input.focus(); }, 50);
    }

    function closeSearch() {
      dropdown.classList.remove('is-open');
      searchBtn.setAttribute('aria-expanded', 'false');
      setTimeout(function() {
        if (!dropdown.classList.contains('is-open')) {
          dropdown.setAttribute('hidden', 'true');
        }
      }, 300);
    }

    document.addEventListener('click', function(e) {
      if (!dropdown.hasAttribute('hidden') && !dropdown.contains(e.target) && !searchBtn.contains(e.target)) {
        closeSearch();
      }
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = input.value.trim();
      var isSubpage = window.location.pathname.includes('/pages/');
      var pathPrefix = isSubpage ? './' : 'pages/';
      if (term) {
        window.location.href = pathPrefix + 'products.html?q=' + encodeURIComponent(term);
      } else {
        window.location.href = pathPrefix + 'products.html';
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
