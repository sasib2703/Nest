/**
 * NEST — Phase 6
 * checkout.js — Checkout Flow & Form Validation Logic
 *
 * Handles:
 *   1. 3-Step Navigation (Shipping -> Review -> Confirm)
 *   2. Progress Indicator updates
 *   3. Form Validation (clean, non-intrusive error highlights)
 *   4. Review Order & Order Summary population
 *   5. Order Placement (generating ID, saving to localStorage, clearing cart)
 *
 * Requires: data.js + cart.js to be loaded first.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONSTANTS & STATE
  ───────────────────────────────────────────────────────────── */

  var CURRENT_STEP = 1;
  var TOTAL_STEPS  = 3;
  var LAST_ORDER_KEY = 'nest-last-order';

  var SHIPPING_DATA = {
    name:    '',
    email:   '',
    phone:   '',
    address: '',
    city:    '',
    state:   '',
    zip:     ''
  };


  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */

  function formatPrice (price) {
    return '\u20b9' + price.toLocaleString('en-IN');
  }

  /**
   * Generates a random Order ID like #NST-849201
   */
  function generateOrderId () {
    var num = Math.floor(100000 + Math.random() * 900000);
    return '#NST-' + num;
  }

  /**
   * Returns future date string (3 business days from now)
   */
  function getDeliveryEstimate () {
    var d = new Date();
    d.setDate(d.getDate() + 4);
    var options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
  }


  /* ─────────────────────────────────────────────────────────────
     INIT CHECKOUT
  ───────────────────────────────────────────────────────────── */

  function initCheckout () {
    /* Verify cart has items */
    if (!window.NEST || !window.NEST.cart) return;
    var items = window.NEST.cart.getItems();

    if (items.length === 0) {
      alert('Your cart is empty. Redirecting to products...');
      window.location.href = 'products.html';
      return;
    }

    /* Populate summaries */
    updateOrderSummary();
    bindFormEvents();
    bindNavigationButtons();
  }


  /* ─────────────────────────────────────────────────────────────
     STEP NAVIGATION
  ───────────────────────────────────────────────────────────── */

  function goToStep (stepNumber) {
    if (stepNumber < 1 || stepNumber > TOTAL_STEPS) return;

    /* If going forward from Step 1, validate first */
    if (CURRENT_STEP === 1 && stepNumber === 2) {
      if (!validateForm()) return;
      captureShippingData();
      populateReviewStep();
    }

    /* If going forward to Step 3, populate final confirmation details */
    if (stepNumber === 3) {
      populateConfirmStep();
    }

    /* Hide current step */
    var currentEl = document.getElementById('step-' + CURRENT_STEP);
    if (currentEl) {
      currentEl.classList.remove('checkout-step--active');
      currentEl.classList.remove('checkout-step--visible');
    }

    /* Update State */
    CURRENT_STEP = stepNumber;

    /* Show new step */
    var nextEl = document.getElementById('step-' + CURRENT_STEP);
    if (nextEl) {
      nextEl.classList.add('checkout-step--active');
      requestAnimationFrame(function () {
        nextEl.classList.add('checkout-step--visible');
      });
    }

    updateProgressIndicator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep () { goToStep(CURRENT_STEP + 1); }
  function previousStep () { goToStep(CURRENT_STEP - 1); }

  function updateProgressIndicator () {
    for (var i = 1; i <= TOTAL_STEPS; i++) {
      var stepEl = document.getElementById('prog-step-' + i);
      if (!stepEl) continue;

      var circleEl = stepEl.querySelector('.progress-step__circle');

      stepEl.classList.remove('progress-step--active', 'progress-step--completed');

      if (i < CURRENT_STEP) {
        stepEl.classList.add('progress-step--completed');
        if (circleEl) circleEl.textContent = '✓';
      } else if (i === CURRENT_STEP) {
        stepEl.classList.add('progress-step--active');
        if (circleEl) circleEl.textContent = i;
      } else {
        if (circleEl) circleEl.textContent = i;
      }
    }

    /* Update connecting bar */
    var fillEl = document.getElementById('prog-bar-fill');
    if (fillEl) {
      var pct = ((CURRENT_STEP - 1) / (TOTAL_STEPS - 1)) * 100;
      fillEl.style.width = pct + '%';
    }
  }


  /* ─────────────────────────────────────────────────────────────
     FORM VALIDATION (Clean & Non-Intrusive)
  ───────────────────────────────────────────────────────────── */

  function validateForm () {
    var isValid = true;
    var fields = ['ship-name', 'ship-email', 'ship-phone', 'ship-address', 'ship-city', 'ship-state', 'ship-zip'];

    fields.forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      var group = input.closest('.form-group');

      var value = input.value.trim();
      var fieldValid = true;

      if (!value) {
        fieldValid = false;
      } else if (id === 'ship-email' && (!value.includes('@') || !value.includes('.'))) {
        fieldValid = false;
      } else if (id === 'ship-phone' && value.replace(/\D/g, '').length < 7) {
        fieldValid = false;
      }

      if (!fieldValid) {
        isValid = false;
        if (group) group.classList.add('has-error');
      } else {
        if (group) group.classList.remove('has-error');
      }
    });

    if (!isValid) {
      /* Focus first error field */
      var firstErr = document.querySelector('.form-group.has-error .form-input');
      if (firstErr) firstErr.focus();
    }

    return isValid;
  }

  function bindFormEvents () {
    /* Clear error state on user typing */
    var inputs = document.querySelectorAll('.form-input');
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var group = input.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });
  }

  function captureShippingData () {
    SHIPPING_DATA.name    = (document.getElementById('ship-name') || {}).value || '';
    SHIPPING_DATA.email   = (document.getElementById('ship-email') || {}).value || '';
    SHIPPING_DATA.phone   = (document.getElementById('ship-phone') || {}).value || '';
    SHIPPING_DATA.address = (document.getElementById('ship-address') || {}).value || '';
    SHIPPING_DATA.city    = (document.getElementById('ship-city') || {}).value || '';
    SHIPPING_DATA.state   = (document.getElementById('ship-state') || {}).value || '';
    SHIPPING_DATA.zip     = (document.getElementById('ship-zip') || {}).value || '';
  }


  /* ─────────────────────────────────────────────────────────────
     POPULATE SECTIONS
  ───────────────────────────────────────────────────────────── */

  function updateOrderSummary () {
    if (!window.NEST || !window.NEST.cart) return;
    var totals   = window.NEST.cart.calculateTotals();
    var cartItems = window.NEST.cart.getItems();
    var products  = window.PRODUCTS || [];

    /* Right Sticky Box Totals */
    var subEl  = document.getElementById('sum-subtotal');
    var taxEl  = document.getElementById('sum-tax');
    var shipEl = document.getElementById('sum-shipping');
    var totEl  = document.getElementById('sum-total');

    if (subEl)  subEl.textContent  = formatPrice(totals.subtotal);
    if (taxEl)  taxEl.textContent  = formatPrice(totals.tax);
    if (shipEl) shipEl.textContent = totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping);
    if (totEl)  totEl.textContent  = formatPrice(totals.total);

    /* Mini Items List in Right Box */
    var miniList = document.getElementById('sum-mini-items');
    if (miniList) {
      miniList.innerHTML = '';
      var html = '';
      cartItems.forEach(function (cItem) {
        var prod = null;
        for (var i = 0; i < products.length; i++) {
          if (products[i].id === cItem.id) { prod = products[i]; break; }
        }
        if (!prod) return;
        html +=
          '<div class="mini-item">' +
            '<span class="mini-item__name">' + cItem.qty + '× ' + prod.name + '</span>' +
            '<span class="mini-item__price">' + formatPrice(prod.price * cItem.qty) + '</span>' +
          '</div>';
      });
      miniList.innerHTML = html;
    }
  }

  function populateReviewStep () {
    /* Shipping details */
    var shipEl = document.getElementById('review-shipping-details');
    if (shipEl) {
      shipEl.innerHTML =
        '<div class="review-info-item">' +
          '<span class="review-info-label">Contact</span>' +
          '<span class="review-info-val">' + SHIPPING_DATA.name + ' (' + SHIPPING_DATA.phone + ')</span>' +
        '</div>' +
        '<div class="review-info-item">' +
          '<span class="review-info-label">Delivery Address</span>' +
          '<span class="review-info-val">' + SHIPPING_DATA.address + ', ' + SHIPPING_DATA.city + ', ' + SHIPPING_DATA.state + ' - ' + SHIPPING_DATA.zip + '</span>' +
        '</div>';
    }

    /* Cart Items in Review */
    var listEl    = document.getElementById('review-items-list');
    var cartItems = window.NEST.cart.getItems();
    var products  = window.PRODUCTS || [];

    if (listEl) {
      var html = '';
      cartItems.forEach(function (cItem) {
        var prod = null;
        for (var i = 0; i < products.length; i++) {
          if (products[i].id === cItem.id) { prod = products[i]; break; }
        }
        if (!prod) return;
        html +=
          '<div class="review-item">' +
            '<img src="' + prod.image + '" alt="' + prod.name + '" class="review-item__img" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop\';" />' +
            '<div>' +
              '<div class="review-item__name">' + prod.name + '</div>' +
              '<div class="review-item__qty">Qty: ' + cItem.qty + '</div>' +
            '</div>' +
            '<div class="review-item__price">' + formatPrice(prod.price * cItem.qty) + '</div>' +
          '</div>';
      });
      listEl.innerHTML = html;
    }
  }

  function populateConfirmStep () {
    var totals = window.NEST.cart.calculateTotals();

    var totEl = document.getElementById('conf-total-val');
    var delEl = document.getElementById('conf-delivery-val');
    var payEl = document.getElementById('conf-payment-val');

    if (totEl) totEl.textContent = formatPrice(totals.total);
    if (delEl) delEl.textContent = 'By ' + getDeliveryEstimate();
    if (payEl) payEl.textContent = 'Secured Online Payment';
  }


  /* ─────────────────────────────────────────────────────────────
     ORDER PLACEMENT
  ───────────────────────────────────────────────────────────── */

  function placeOrder () {
    var btn = document.getElementById('btn-place-order');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = 'Processing Order...';

    setTimeout(function () {
      var totals    = window.NEST.cart.calculateTotals();
      var cartItems = window.NEST.cart.getItems();
      var products  = window.PRODUCTS || [];

      /* Build detailed items array for success page */
      var detailedItems = [];
      cartItems.forEach(function (cItem) {
        for (var i = 0; i < products.length; i++) {
          if (products[i].id === cItem.id) {
            detailedItems.push({
              id:    products[i].id,
              name:  products[i].name,
              price: products[i].price,
              qty:   cItem.qty,
              image: products[i].image
            });
            break;
          }
        }
      });

      var orderData = {
        orderId:          generateOrderId(),
        date:             new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        deliveryEstimate: getDeliveryEstimate(),
        shipping:         SHIPPING_DATA,
        items:            detailedItems,
        totals:           totals
      };

      /* Save order to localStorage */
      try {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderData));
      } catch (e) {}

      /* Clear Cart */
      window.NEST.cart.clearCart();

      /* Redirect to Success Page */
      window.location.href = 'success.html';
    }, 1200);
  }


  /* ─────────────────────────────────────────────────────────────
     BIND BUTTONS
  ───────────────────────────────────────────────────────────── */

  function bindNavigationButtons () {
    /* Step 1 to 2 */
    var btnToReview = document.getElementById('btn-to-review');
    if (btnToReview) {
      btnToReview.addEventListener('click', function () { nextStep(); });
    }

    /* Step 2 back to 1 */
    var btnBackShip = document.getElementById('btn-back-shipping');
    if (btnBackShip) {
      btnBackShip.addEventListener('click', function () { previousStep(); });
    }

    /* Edit shipping link in Review step */
    var btnEditShip = document.getElementById('btn-edit-shipping');
    if (btnEditShip) {
      btnEditShip.addEventListener('click', function () { goToStep(1); });
    }

    /* Step 2 to 3 */
    var btnToConfirm = document.getElementById('btn-to-confirm');
    if (btnToConfirm) {
      btnToConfirm.addEventListener('click', function () { nextStep(); });
    }

    /* Step 3 back to 2 */
    var btnBackRev = document.getElementById('btn-back-review');
    if (btnBackRev) {
      btnBackRev.addEventListener('click', function () { previousStep(); });
    }

    /* Place Order */
    var btnPlace = document.getElementById('btn-place-order');
    if (btnPlace) {
      btnPlace.addEventListener('click', function () { placeOrder(); });
    }
  }


  /* ─────────────────────────────────────────────────────────────
     INITIALISE
  ───────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initCheckout();
  });

  /* Expose API for external testing */
  window.NEST = window.NEST || {};
  window.NEST.checkout = {
    goToStep:     goToStep,
    nextStep:     nextStep,
    previousStep: previousStep,
    validateForm: validateForm,
    placeOrder:   placeOrder
  };

}());
