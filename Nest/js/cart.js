/**
 * NEST — Phase 5
 * cart.js — Shared Cart Logic + Cart Page Rendering
 *
 * Loaded on ALL pages so the badge stays current everywhere.
 * On cart.html, also renders the full cart UI.
 *
 * API exposed at window.NEST.cart:
 *   addToCart(id, qty)
 *   removeFromCart(id)
 *   updateQuantity(id, qty)
 *   getItems()
 *   getCount()
 *   calculateTotals()
 *   clearCart()
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────────────────────────── */

  var CART_KEY    = 'nest-cart-v1';
  var TAX_RATE    = 0.18;       /* 18% GST */
  var FREE_SHIP   = 10000;      /* Free shipping above ₹10,000 subtotal */
  var SHIP_FEE    = 199;        /* Flat shipping fee */


  /* ─────────────────────────────────────────────────────────────
     DATA LAYER — localStorage CRUD
  ───────────────────────────────────────────────────────────── */

  /** Returns cart array from localStorage. Safe — never throws. */
  function getItems () {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  /** Saves items to localStorage and refreshes the badge. */
  function saveItems (items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) { /* storage full — silently fail */ }
    updateBadge();
    if (typeof syncCardQuantities === 'function') syncCardQuantities();
    window.dispatchEvent(new CustomEvent('nest-cart-sync'));
  }

  /**
   * Adds a product to the cart.
   * If product already exists, increments quantity.
   * @param {string} productId
   * @param {number} [qty=1]
   */
  function addToCart (productId, qty) {
    qty = qty || 1;
    var items   = getItems();
    var existing = null;

    for (var i = 0; i < items.length; i++) {
      if (items[i].id === productId) { existing = items[i]; break; }
    }

    if (existing) {
      existing.qty = existing.qty + qty;
    } else {
      items.push({ id: productId, qty: qty });
    }

    saveItems(items);
    if (typeof showToast === 'function') showToast('Added to Cart ✓');
  }

  /**
   * Removes a product from the cart entirely.
   * @param {string} productId
   */
  function removeFromCart (productId) {
    var items = getItems().filter(function (i) { return i.id !== productId; });
    saveItems(items);
  }

  /**
   * Sets a product's quantity. If qty ≤ 0, removes the item.
   * @param {string} productId
   * @param {number} qty
   */
  function updateQuantity (productId, qty) {
    if (qty <= 0) { removeFromCart(productId); return; }

    var items = getItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === productId) { items[i].qty = qty; break; }
    }
    saveItems(items);
  }

  /** Returns total number of items (sum of quantities) for the badge. */
  function getCount () {
    return getItems().reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  /**
   * Calculates subtotal, tax, shipping, and total.
   * Requires window.PRODUCTS to be loaded from data.js.
   * @returns {{ subtotal, tax, shipping, total }}
   */
  function calculateTotals () {
    var items    = getItems();
    var products = window.PRODUCTS || [];
    var subtotal = 0;

    items.forEach(function (cartItem) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === cartItem.id) {
          subtotal += products[i].price * cartItem.qty;
          break;
        }
      }
    });

    var tax      = Math.round(subtotal * TAX_RATE);
    var shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP ? 0 : SHIP_FEE);
    var total    = subtotal + tax + shipping;

    return { subtotal: subtotal, tax: tax, shipping: shipping, total: total };
  }

  /** Empties the cart entirely. */
  function clearCart () { saveItems([]); }


  /* ─────────────────────────────────────────────────────────────
     EXPOSE GLOBAL API
  ───────────────────────────────────────────────────────────── */

  window.NEST         = window.NEST || {};
  window.NEST.cart    = {
    getItems:        getItems,
    addToCart:       addToCart,
    removeFromCart:  removeFromCart,
    updateQuantity:  updateQuantity,
    getCount:        getCount,
    calculateTotals: calculateTotals,
    clearCart:       clearCart,
  };


  /* ─────────────────────────────────────────────────────────────
     BADGE UPDATE
     Runs on every saveItems() call + on page load.
  ───────────────────────────────────────────────────────────── */

  function updateBadge () {
    if (window.NEST && typeof window.NEST.updateCartBadge === 'function') {
      window.NEST.updateCartBadge(getCount());
    }
  }

  /* ─────────────────────────────────────────────────────────────
     TOAST NOTIFICATION
  ───────────────────────────────────────────────────────────── */

  function showToast (msg) {
    var toast = document.getElementById('nest-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nest-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '32px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.background = 'rgba(10, 10, 10, 0.9)';
      toast.style.color = '#fff';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '100px';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = '500';
      toast.style.zIndex = '9999';
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
      toast.style.pointerEvents = 'none';
      toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
      document.body.appendChild(toast);
    }
    
    toast.textContent = msg;
    
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    if (toast.timeout) clearTimeout(toast.timeout);
    toast.timeout = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }


  /* ─────────────────────────────────────────────────────────────
     CART BUTTON — navigate to cart.html on click
  ───────────────────────────────────────────────────────────── */

  function wireCartButton () {
    var btn = document.getElementById('btn-cart');
    if (btn) {
      btn.addEventListener('click', function () {
        var isSubpage = window.location.pathname.includes('/pages/');
        var pathPrefix = isSubpage ? './' : 'pages/';
        window.location.href = pathPrefix + 'cart.html';
      });
    }
  }


  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */

  function formatPrice (price) {
    return '\u20b9' + price.toLocaleString('en-IN');
  }


  /* ─────────────────────────────────────────────────────────────
     CART PAGE — renderCart()
     Only executes when cart-items-list element exists (cart.html).
  ───────────────────────────────────────────────────────────── */

  function renderCart () {
    var listEl      = document.getElementById('cart-items-list');
    var emptyEl     = document.getElementById('cart-empty');
    var contentEl   = document.getElementById('cart-content');

    if (!listEl) return; /* not on cart page */

    var cartItems = getItems();
    var products  = window.PRODUCTS || [];

    /* Filter against valid product catalogue */
    var validCartItems = [];
    for (var j = 0; j < cartItems.length; j++) {
      for (var k = 0; k < products.length; k++) {
        if (products[k].id === cartItems[j].id) {
          validCartItems.push(cartItems[j]);
          break;
        }
      }
    }

    /* ── Empty state ── */
    if (validCartItems.length === 0) {
      if (emptyEl)  emptyEl.classList.remove('is-hidden');
      if (contentEl) contentEl.classList.add('is-hidden');
      updateBadge();
      return;
    }

    if (emptyEl)  emptyEl.classList.add('is-hidden');
    if (contentEl) contentEl.classList.remove('is-hidden');

    /* ── Build items ── */
    listEl.innerHTML = '';
    var fragment = document.createDocumentFragment();

    cartItems.forEach(function (cartItem) {
      /* Match with product catalogue */
      var product = null;
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === cartItem.id) { product = products[i]; break; }
      }
      if (!product) return; /* product removed from catalogue */

      var itemEl = document.createElement('div');
      itemEl.className  = 'cart-item';
      itemEl.dataset.id = product.id;

      itemEl.innerHTML =
        '<div class="cart-item__img-wrap">' +
          '<img src="' + product.image + '" alt="' + product.name + '" class="cart-item__img" loading="lazy" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop\';" />' +
        '</div>' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__category">' + product.category + '</p>' +
          '<h3 class="cart-item__name">' + product.name + '</h3>' +
          '<p class="cart-item__desc">' + product.description + '</p>' +
        '</div>' +
        '<div class="cart-item__right">' +
          '<div class="cart-qty" role="group" aria-label="Quantity for ' + product.name + '">' +
            '<button class="cart-qty__btn cart-qty__btn--dec" type="button" data-id="' + product.id + '" aria-label="Decrease quantity"' + (cartItem.qty <= 1 ? ' disabled' : '') + '>' +
              '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/></svg>' +
            '</button>' +
            '<span class="cart-qty__val" aria-live="polite">' + cartItem.qty + '</span>' +
            '<button class="cart-qty__btn cart-qty__btn--inc" type="button" data-id="' + product.id + '" aria-label="Increase quantity">' +
              '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="cart-item__price-row">' +
            '<span class="cart-item__price">' + formatPrice(product.price * cartItem.qty) + '</span>' +
            '<button class="cart-item__remove" type="button" data-id="' + product.id + '" aria-label="Remove ' + product.name + ' from cart">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">' +
                '<polyline points="3 6 5 6 21 6"/>' +
                '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
                '<path d="M10 11v6M14 11v6"/>' +
                '<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +
        '</div>';

      fragment.appendChild(itemEl);
    });

    listEl.appendChild(fragment);

    /* Animate items in */
    requestAnimationFrame(function () {
      listEl.querySelectorAll('.cart-item').forEach(function (el, i) {
        el.style.transitionDelay = (i * 60) + 'ms';
        el.classList.add('cart-item--visible');
      });
    });

    /* Bind controls */
    bindCartControls();

    /* Render order summary */
    renderSummary();
    updateBadge();
  }

  /* ── Order Summary ── */
  function renderSummary () {
    var totals = calculateTotals();

    var els = {
      subtotal: document.getElementById('summary-subtotal'),
      tax:      document.getElementById('summary-tax'),
      shipping: document.getElementById('summary-shipping'),
      total:    document.getElementById('summary-total'),
    };

    if (els.subtotal) els.subtotal.textContent = formatPrice(totals.subtotal);
    if (els.tax)      els.tax.textContent      = formatPrice(totals.tax);
    if (els.shipping) els.shipping.textContent = totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping);
    if (els.total)    els.total.textContent    = formatPrice(totals.total);
  }

  /* ── Quantity + Remove Controls ── */
  function bindCartControls () {
    /* Decrease */
    document.querySelectorAll('.cart-qty__btn--dec').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id    = btn.dataset.id;
        var items = getItems();
        var item  = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;
        updateQuantity(id, item.qty - 1);
        renderCart();
      });
    });

    /* Increase */
    document.querySelectorAll('.cart-qty__btn--inc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id    = btn.dataset.id;
        var items = getItems();
        var item  = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;
        updateQuantity(id, item.qty + 1);
        renderCart();
      });
    });

    /* Remove */
    document.querySelectorAll('.cart-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id     = btn.dataset.id;
        var itemEl = btn.closest('.cart-item');
        if (itemEl) {
          itemEl.style.opacity   = '0';
          itemEl.style.transform = 'translateX(-16px)';
          setTimeout(function () {
            removeFromCart(id);
            renderCart();
          }, 220);
        } else {
          removeFromCart(id);
          renderCart();
        }
      });
    });
  }

  /* ── Clear cart button ── */
  function bindClearCart () {
    var btn = document.getElementById('clear-cart-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        if (window.confirm('Remove all items from your cart?')) {
          clearCart();
          renderCart();
        }
      });
    }
  }


  /* ─────────────────────────────────────────────────────────────
     PRODUCT CARD QUANTITY CONTROLS SYNC
  ───────────────────────────────────────────────────────────── */

  function syncCardQuantities () {
    var items = getItems();
    var cartMap = {};
    for (var i = 0; i < items.length; i++) {
      cartMap[items[i].id] = items[i].qty;
    }

    var buttons = document.querySelectorAll('.pcard__quick-add[data-id], .prod-card__btn[data-id]');
    buttons.forEach(function (btn) {
      var id = btn.dataset.id;
      var qty = cartMap[id] || 0;
      var parent = btn.parentElement; if (!parent) return;

      var existingCtrl = parent.querySelector('.card-qty-ctrl[data-id="' + id + '"]');

      if (qty > 0) {
        btn.style.display = 'none';
        if (existingCtrl) {
          var numSpan = existingCtrl.querySelector('.card-qty-ctrl__num');
          if (numSpan) numSpan.textContent = qty;
        } else {
          var ctrl = document.createElement('div');
          ctrl.className = 'card-qty-ctrl';
          if (parent.classList.contains('pcard__img-wrap')) {
            ctrl.classList.add('card-qty-ctrl--pcard');
          }
          ctrl.dataset.id = id;
          ctrl.innerHTML =
            '<button type="button" class="card-qty-ctrl__btn qty-minus" aria-label="Decrease quantity">−</button>' +
            '<span class="card-qty-ctrl__num">' + qty + '</span>' +
            '<button type="button" class="card-qty-ctrl__btn qty-plus" aria-label="Increase quantity">+</button>';

          ctrl.addEventListener('click', function (e) { e.stopPropagation(); });

          ctrl.querySelector('.qty-minus').addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            var latest = getItems();
            var current = 0;
            for (var k = 0; k < latest.length; k++) {
              if (latest[k].id === id) { current = latest[k].qty; break; }
            }
            updateQuantity(id, current - 1);
          });

          ctrl.querySelector('.qty-plus').addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            addToCart(id, 1);
          });

          parent.appendChild(ctrl);
        }
      } else {
        btn.style.display = '';
        if (existingCtrl) {
          existingCtrl.remove();
        }
      }
    });
  }

  window.NEST.syncCardQuantities = syncCardQuantities;
  window.addEventListener('nest-cart-sync', syncCardQuantities);
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === CART_KEY) {
      updateBadge();
      syncCardQuantities();
    }
  });


  /* ─────────────────────────────────────────────────────────────
     INITIALISE
  ───────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    syncCardQuantities();
    wireCartButton();

    /* Cart page */
    if (document.getElementById('cart-items-list')) {
      renderCart();
      bindClearCart();
    }
  });

  /* Also expose renderCart so product pages can call it */
  window.NEST.cart.renderCart = renderCart;

}());
