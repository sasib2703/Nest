/**
 * NEST — Phase 4
 * products.js — Search, Filter, Sort & Render Engine
 *
 * Functions:
 *  renderProducts(products)   — builds product cards in the grid
 *  filterProducts()           — applies search + category + price + rating
 *  sortProducts(list, sortBy) — returns a sorted copy of the list
 *  searchProducts(list, q)    — filters by search query
 *
 * State: one central `activeFilters` object drives everything.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     ELEMENT REFERENCES
  ───────────────────────────────────────────────────────────── */

  const grid          = document.getElementById('products-grid');
  const emptyState    = document.getElementById('empty-state');
  const resultsCount  = document.getElementById('results-count');
  const sortSelect    = document.getElementById('sort-select');
  const searchInput   = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const filterForm    = document.getElementById('filter-form');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const mobileFilterBtn  = document.getElementById('mobile-filter-btn');
  const mobileFilterClose = document.getElementById('mobile-filter-close');
  const sidebar       = document.getElementById('products-sidebar');
  const activeTagsBar = document.getElementById('active-tags-bar');

  /* ─────────────────────────────────────────────────────────────
     CENTRAL FILTER STATE
  ───────────────────────────────────────────────────────────── */

  var activeFilters = {
    search:     '',
    categories: [],   /* array of selected category strings */
    priceRange: null, /* 'under-5000' | '5000-15000' | '15000-30000' | 'above-30000' */
    rating:     null, /* 4 | 3 — minimum star rating */
    sortBy:     'featured',
  };


  /* ─────────────────────────────────────────────────────────────
     1. SEARCH — real-time as user types
  ───────────────────────────────────────────────────────────── */

  /**
   * Returns a filtered list where the query matches
   * product name, category, or description.
   * @param {Array}  list - products to search
   * @param {string} query - raw search string
   * @returns {Array}
   */
  function searchProducts (list, query) {
    var q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(function (product) {
      return (
        product.name.toLowerCase().includes(q)        ||
        product.category.toLowerCase().includes(q)    ||
        product.description.toLowerCase().includes(q)
      );
    });
  }


  /* ─────────────────────────────────────────────────────────────
     2. FILTER — category + price + rating
  ───────────────────────────────────────────────────────────── */

  /**
   * Applies all active filters against the full PRODUCTS array.
   * Always starts from the complete dataset so filters compose correctly.
   * @returns {Array} filtered product list
   */
  function filterProducts () {
    var result = PRODUCTS.slice(); /* copy of full catalogue */

    /* ── Search ── */
    result = searchProducts(result, activeFilters.search);

    /* ── Category ── */
    if (activeFilters.categories.length > 0) {
      result = result.filter(function (p) {
        return activeFilters.categories.indexOf(p.category) !== -1;
      });
    }

    /* ── Price Range ── */
    if (activeFilters.priceRange) {
      result = result.filter(function (p) {
        switch (activeFilters.priceRange) {
          case 'under-5000':      return p.price < 5000;
          case '5000-15000':     return p.price >= 5000  && p.price < 15000;
          case '15000-30000':    return p.price >= 15000 && p.price < 30000;
          case 'above-30000':    return p.price >= 30000;
          default:               return true;
        }
      });
    }

    /* ── Rating ── */
    if (activeFilters.rating !== null) {
      result = result.filter(function (p) {
        return p.rating >= activeFilters.rating;
      });
    }

    return result;
  }


  /* ─────────────────────────────────────────────────────────────
     3. SORT
  ───────────────────────────────────────────────────────────── */

  /**
   * Returns a SORTED COPY of the list (never mutates the original).
   * @param {Array}  list
   * @param {string} sortBy - sort key from activeFilters.sortBy
   * @returns {Array}
   */
  function sortProducts (list, sortBy) {
    var sorted = list.slice();

    switch (sortBy) {
      case 'featured':
        sorted.sort(function (a, b) {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.popularity - a.popularity;
        });
        break;
      case 'popular':
        sorted.sort(function (a, b) { return b.popularity - a.popularity; });
        break;
      case 'newest':
        /* newArrival: true products first, then by id order */
        sorted.sort(function (a, b) {
          if (a.newArrival && !b.newArrival) return -1;
          if (!a.newArrival && b.newArrival) return 1;
          return 0;
        });
        break;
      case 'price-asc':
        sorted.sort(function (a, b) { return a.price - b.price; });
        break;
      case 'price-desc':
        sorted.sort(function (a, b) { return b.price - a.price; });
        break;
      case 'rating':
        sorted.sort(function (a, b) { return b.rating - a.rating; });
        break;
    }

    return sorted;
  }


  /* ─────────────────────────────────────────────────────────────
     4. RENDER — build product cards into the DOM
  ───────────────────────────────────────────────────────────── */

  /**
   * Generates star HTML from a numeric rating.
   * @param {number} rating
   * @returns {string} HTML string of star spans
   */
  function buildStars (rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (rating >= i) {
        html += '<span class="star star--full" aria-hidden="true">★</span>';
      } else if (rating >= i - 0.5) {
        html += '<span class="star star--half" aria-hidden="true">★</span>';
      } else {
        html += '<span class="star star--empty" aria-hidden="true">☆</span>';
      }
    }
    return html;
  }

  /**
   * Formats a price number as Indian rupee string.
   * @param {number} price
   * @returns {string}
   */
  function formatPrice (price) {
    return '₹' + price.toLocaleString('en-IN');
  }

  /**
   * Builds and injects the product card grid.
   * Cards animate in with staggered delays.
   * @param {Array} products - filtered + sorted product list
   */
  function renderProducts (products) {
    /* Clear previous cards */
    grid.innerHTML = '';

    /* Show / hide empty state */
    if (products.length === 0) {
      emptyState.hidden = false;
      grid.hidden       = true;
      updateResultsCount(0);
      return;
    }

    emptyState.hidden = true;
    grid.hidden       = false;
    updateResultsCount(products.length);

    /* Build a document fragment — single DOM write */
    var fragment = document.createDocumentFragment();

    products.forEach(function (product, index) {
      var card = document.createElement('article');
      card.className   = 'pcard';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', product.name);
      card.dataset.id  = product.id;

      /* Stagger entrance delay */
      var delay = Math.min(index * 55, 450);
      card.style.transitionDelay = delay + 'ms';

      card.innerHTML =
        '<div class="pcard__img-wrap">' +
          '<img' +
          '  src="' + product.image + '"' +
          '  alt="' + product.name + '"' +
          '  class="pcard__img"' +
          '  loading="lazy"' +
          '  onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop\';"' +
          '/>' +
          (product.featured ? '<span class="pcard__badge pcard__badge--featured">Featured</span>' : '') +
          (product.newArrival ? '<span class="pcard__badge pcard__badge--new">New</span>' : '') +
          '<button' +
          '  class="pcard__quick-add"' +
          '  type="button"' +
          '  data-id="' + product.id + '"' +
          '  aria-label="Quick add ' + product.name + ' to cart"' +
          '>Add to Cart</button>' +
        '</div>' +
        '<div class="pcard__body">' +
          '<p class="pcard__category">' + product.category + '</p>' +
          '<h3 class="pcard__name">' + product.name + '</h3>' +
          '<p class="pcard__desc">' + product.description + '</p>' +
          '<div class="pcard__footer">' +
            '<div class="pcard__rating" aria-label="Rating ' + product.rating + ' out of 5">' +
              '<span class="pcard__stars">' + buildStars(product.rating) + '</span>' +
              '<span class="pcard__rating-num">' + product.rating.toFixed(1) + '</span>' +
            '</div>' +
            '<span class="pcard__price">' + formatPrice(product.price) + '</span>' +
          '</div>' +
        '</div>';

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    /* Trigger entrance animation next frame */
    requestAnimationFrame(function () {
      var cards = grid.querySelectorAll('.pcard');
      cards.forEach(function (card) {
        card.classList.add('pcard--visible');
        card.addEventListener('click', function (e) {
          if (!e.target.closest('.pcard__quick-add') && !e.target.closest('.card-qty-ctrl')) {
            window.location.href = 'product-detail.html?id=' + card.dataset.id;
          }
        });
      });
    });

    /* Bind quick-add buttons */
    bindQuickAdd();
    if (window.NEST && typeof window.NEST.syncCardQuantities === 'function') {
      window.NEST.syncCardQuantities();
    }
  }


  /* ─────────────────────────────────────────────────────────────
     QUICK-ADD INTERACTION
  ───────────────────────────────────────────────────────────── */

  function bindQuickAdd () {
    var buttons = grid.querySelectorAll('.pcard__quick-add');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        /* Call shared cart engine if available */
        if (window.NEST && window.NEST.cart) {
          window.NEST.cart.addToCart(btn.dataset.id, 1);
        } else {
          if (btn.dataset.adding) return;
          btn.dataset.adding = 'true';
          var badge = document.getElementById('cart-count');
          if (badge) {
            var count = parseInt(badge.textContent, 10) || 0;
            badge.textContent = count + 1;
          }
          var original = btn.textContent;
          btn.textContent = 'Added ✓';
          btn.classList.add('pcard__quick-add--added');

          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('pcard__quick-add--added');
            delete btn.dataset.adding;
          }, 1800);
        }
      });
    });
  }


  /* ─────────────────────────────────────────────────────────────
     RESULTS COUNT
  ───────────────────────────────────────────────────────────── */

  function updateResultsCount (count) {
    if (!resultsCount) return;
    resultsCount.textContent = count + (count === 1 ? ' product' : ' products');
  }


  /* ─────────────────────────────────────────────────────────────
     ACTIVE TAGS BAR
     Shows chips for active filters so user can remove them easily.
  ───────────────────────────────────────────────────────────── */

  function renderActiveTags () {
    if (!activeTagsBar) return;
    activeTagsBar.innerHTML = '';

    var hasActive = false;

    /* Search tag */
    if (activeFilters.search) {
      hasActive = true;
      activeTagsBar.appendChild(makeTag('Search: "' + activeFilters.search + '"', function () {
        activeFilters.search = '';
        searchInput.value = '';
        updateClearSearch();
        refresh();
      }));
    }

    /* Category tags */
    activeFilters.categories.forEach(function (cat) {
      hasActive = true;
      activeTagsBar.appendChild(makeTag(cat, function () {
        activeFilters.categories = activeFilters.categories.filter(function (c) { return c !== cat; });
        /* Uncheck the checkbox */
        var cb = filterForm.querySelector('input[data-category="' + CSS.escape(cat) + '"]');
        if (cb) cb.checked = false;
        refresh();
      }));
    });

    /* Price tag */
    if (activeFilters.priceRange) {
      hasActive = true;
      var priceLabels = {
        'under-5000':   'Under ₹5,000',
        '5000-15000':  '₹5,000 – ₹15,000',
        '15000-30000': '₹15,000 – ₹30,000',
        'above-30000': 'Above ₹30,000',
      };
      activeTagsBar.appendChild(makeTag(priceLabels[activeFilters.priceRange], function () {
        activeFilters.priceRange = null;
        var checked = filterForm.querySelector('input[name="price"]:checked');
        if (checked) checked.checked = false;
        refresh();
      }));
    }

    /* Rating tag */
    if (activeFilters.rating !== null) {
      hasActive = true;
      activeTagsBar.appendChild(makeTag(activeFilters.rating + '★ & Up', function () {
        activeFilters.rating = null;
        var checked = filterForm.querySelector('input[name="rating"]:checked');
        if (checked) checked.checked = false;
        refresh();
      }));
    }

    activeTagsBar.hidden = !hasActive;
  }

  function makeTag (label, onRemove) {
    var tag = document.createElement('button');
    tag.type = 'button';
    tag.className = 'filter-tag';
    tag.innerHTML = label + '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>';
    tag.addEventListener('click', onRemove);
    return tag;
  }


  /* ─────────────────────────────────────────────────────────────
     MASTER REFRESH
     Called whenever any filter/sort/search changes.
  ───────────────────────────────────────────────────────────── */

  function refresh () {
    var filtered = filterProducts();
    var sorted   = sortProducts(filtered, activeFilters.sortBy);
    renderProducts(sorted);
    renderActiveTags();
    updateClearFiltersVisibility();
    updateCategoryPillsUI();
  }

  function updateClearFiltersVisibility () {
    if (!clearFiltersBtn) return;
    var hasFilters =
      activeFilters.categories.length > 0 ||
      activeFilters.priceRange !== null   ||
      activeFilters.rating     !== null   ||
      activeFilters.search !== '';
    clearFiltersBtn.hidden = !hasFilters;
  }

  function updateCategoryPillsUI () {
    var pills = document.querySelectorAll('.cat-pill');
    if (!pills.length) return;

    pills.forEach(function (pill) {
      var cat = pill.getAttribute('data-category');
      if (cat === 'all') {
        if (activeFilters.categories.length === 0) {
          pill.classList.add('is-active');
        } else {
          pill.classList.remove('is-active');
        }
      } else {
        if (activeFilters.categories.indexOf(cat) !== -1) {
          pill.classList.add('is-active');
        } else {
          pill.classList.remove('is-active');
        }
      }
    });
  }


  /* ─────────────────────────────────────────────────────────────
     EVENT BINDINGS
  ───────────────────────────────────────────────────────────── */

  /* ── Search Input ── */
  var searchTimer = null;

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        activeFilters.search = searchInput.value;
        updateClearSearch();
        refresh();
      }, 200); /* 200ms debounce — feels instant, avoids thrash */
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimer);
        activeFilters.search = searchInput.value;
        updateClearSearch();
        refresh();
      }
    });
  }

  function updateClearSearch () {
    if (!clearSearchBtn) return;
    clearSearchBtn.hidden = !activeFilters.search;
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      activeFilters.search = '';
      searchInput.value    = '';
      updateClearSearch();
      refresh();
      searchInput.focus();
    });
  }

  /* ── Filter Form — change events ── */
  if (filterForm) {
    filterForm.addEventListener('change', function (e) {
      var input = e.target;

      /* Category checkboxes */
      if (input.name === 'category') {
        var cat = input.getAttribute('data-category');
        if (input.checked) {
          if (activeFilters.categories.indexOf(cat) === -1) {
            activeFilters.categories.push(cat);
          }
        } else {
          activeFilters.categories = activeFilters.categories.filter(function (c) {
            return c !== cat;
          });
        }
      }

      /* Price radios */
      if (input.name === 'price') {
        activeFilters.priceRange = input.value || null;
      }

      /* Rating radios */
      if (input.name === 'rating') {
        activeFilters.rating = input.value ? parseFloat(input.value) : null;
      }

      refresh();
    });
  }

  /* ── Sort Select ── */
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      activeFilters.sortBy = sortSelect.value;
      refresh();
    });
  }

  /* ── Clear All Filters ── */
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function () {
      activeFilters.categories = [];
      activeFilters.priceRange = null;
      activeFilters.rating     = null;
      activeFilters.search     = '';

      if (searchInput)  searchInput.value = '';
      if (filterForm)   filterForm.reset();
      updateClearSearch();
      refresh();
    });
  }

  /* ── Mobile Filter Drawer ── */
  if (mobileFilterBtn && sidebar) {
    mobileFilterBtn.addEventListener('click', function () {
      sidebar.classList.add('sidebar--open');
      document.body.classList.add('filter-open');
      mobileFilterClose && mobileFilterClose.focus();
    });
  }

  if (mobileFilterClose && sidebar) {
    mobileFilterClose.addEventListener('click', function () {
      sidebar.classList.remove('sidebar--open');
      document.body.classList.remove('filter-open');
      mobileFilterBtn && mobileFilterBtn.focus();
    });
  }

  /* Close sidebar on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('sidebar--open')) {
      sidebar.classList.remove('sidebar--open');
      document.body.classList.remove('filter-open');
      mobileFilterBtn && mobileFilterBtn.focus();
    }
  });

  /* ── Top Category Pills ── */
  var catPillsContainer = document.querySelector('.top-categories');
  if (catPillsContainer) {
    catPillsContainer.addEventListener('click', function (e) {
      var pill = e.target.closest('.cat-pill');
      if (!pill) return;
      var cat = pill.getAttribute('data-category');

      if (cat === 'all') {
        activeFilters.categories = [];
        if (filterForm) filterForm.reset();
      } else {
        activeFilters.categories = [cat];
        if (filterForm) {
          var checkboxes = filterForm.querySelectorAll('input[name="category"]');
          checkboxes.forEach(function (cb) {
            cb.checked = (cb.getAttribute('data-category') === cat);
          });
        }
      }
      refresh();
    });
  }

  /* ── Empty State Reset Button ── */
  var emptyResetBtn = document.getElementById('empty-reset-btn');
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', function () {
      activeFilters.categories = [];
      activeFilters.priceRange = null;
      activeFilters.rating     = null;
      activeFilters.search     = '';

      if (searchInput)  searchInput.value = '';
      if (filterForm)   filterForm.reset();
      updateClearSearch();
      refresh();
    });
  }

  /* ── Keyboard activation for product cards ── */
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('pcard')) {
      e.preventDefault();
      e.target.click();
    }
  });


  /* ─────────────────────────────────────────────────────────────
     INITIAL RENDER & URL PARAMS
  ───────────────────────────────────────────────────────────── */

  /* ── URL param: ?q (search) ── */
  var urlParams = new URLSearchParams(window.location.search);
  var qParam = urlParams.get('q');
  if (qParam) {
    activeFilters.search = qParam;
    if (searchInput) searchInput.value = qParam;
    updateClearSearch();
  }

  /* ── URL param: ?category (slug → full category name) ── */
  var categorySlugMap = {
    'smart-speakers-audio': 'Smart Speakers & Audio',
    'smart-lighting':       'Smart Lighting',
    'security-devices':     'Security Devices',
    'climate-appliances':   'Climate & Appliances',
    'connectivity-power':   'Connectivity & Power',
    'kitchen-essentials':   'Kitchen Essentials',
    'cleaning-devices':     'Cleaning Devices',
  };

  var categoryParam = urlParams.get('category');
  if (categoryParam) {
    var fullCategoryName = categorySlugMap[categoryParam.toLowerCase()];
    if (fullCategoryName) {
      /* Add to active filter state */
      if (activeFilters.categories.indexOf(fullCategoryName) === -1) {
        activeFilters.categories.push(fullCategoryName);
      }
      /* Check the matching sidebar checkbox so UI stays in sync */
      if (filterForm) {
        var checkboxes = filterForm.querySelectorAll('input[name="category"]');
        checkboxes.forEach(function (cb) {
          if (cb.getAttribute('data-category') === fullCategoryName) {
            cb.checked = true;
          }
        });
      }
    }
  }

  refresh();

}());
