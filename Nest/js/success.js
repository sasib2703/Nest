/**
 * NEST — Phase 6
 * success.js — Success Page Logic & Order Confirmation Rendering
 *
 * Reads last order from localStorage ('nest-last-order') and renders:
 *   1. Order ID & Date
 *   2. Purchased Items List
 *   3. Delivery Estimate & Shipping Address
 *   4. Cost breakdown (Subtotal, GST, Shipping, Total)
 * Wires Track Order button simulation.
 */

(function () {
  'use strict';

  var LAST_ORDER_KEY = 'nest-last-order';

  function formatPrice (price) {
    return '\u20b9' + price.toLocaleString('en-IN');
  }

  function renderSuccess () {
    var rawData = null;
    try {
      rawData = localStorage.getItem(LAST_ORDER_KEY);
    } catch (e) {}

    var order = rawData ? JSON.parse(rawData) : null;

    /* Fallback mock order if loaded directly without purchasing */
    if (!order) {
      order = {
        orderId: '#NST-894231',
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        deliveryEstimate: '3–5 Business Days',
        shipping: {
          name: 'Sasi Kumar',
          address: 'Tech Park, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560066'
        },
        items: [
          {
            id: 'spk-01',
            name: 'Nest Audio Pro — Charcoal',
            price: 18999,
            qty: 1,
            image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80'
          }
        ],
        totals: {
          subtotal: 18999,
          tax: 3420,
          shipping: 0,
          total: 22419
        }
      };
    }

    /* Populate Order ID & Date */
    var idEl   = document.getElementById('succ-order-id');
    var dateEl = document.getElementById('succ-order-date');
    if (idEl)   idEl.textContent   = 'Order ' + order.orderId;
    if (dateEl) dateEl.textContent = 'Placed on ' + order.date;

    /* Populate Delivery Estimate & Address */
    var delDateEl = document.getElementById('succ-delivery-date');
    var delAddrEl = document.getElementById('succ-delivery-addr');
    if (delDateEl) delDateEl.textContent = 'Estimated Delivery by ' + order.deliveryEstimate;
    if (delAddrEl && order.shipping) {
      delAddrEl.textContent = 'Shipping to ' + order.shipping.name + ' (' + order.shipping.city + ')';
    }

    /* Populate Items */
    var itemsListEl = document.getElementById('succ-items-list');
    if (itemsListEl && order.items) {
      var html = '';
      order.items.forEach(function (item) {
        html +=
          '<div class="success-item">' +
            '<img src="' + item.image + '" alt="' + item.name + '" class="success-item__img" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop\';" />' +
            '<div>' +
              '<div class="success-item__name">' + item.name + '</div>' +
              '<div class="success-item__qty">Qty: ' + item.qty + '</div>' +
            '</div>' +
            '<div class="success-item__price">' + formatPrice(item.price * item.qty) + '</div>' +
          '</div>';
      });
      itemsListEl.innerHTML = html;
    }

    /* Populate Cost Breakdown */
    var subEl  = document.getElementById('succ-subtotal');
    var taxEl  = document.getElementById('succ-tax');
    var shipEl = document.getElementById('succ-shipping');
    var totEl  = document.getElementById('succ-total');

    if (subEl)  subEl.textContent  = formatPrice(order.totals.subtotal);
    if (taxEl)  taxEl.textContent  = formatPrice(order.totals.tax);
    if (shipEl) shipEl.textContent = order.totals.shipping === 0 ? 'Free' : formatPrice(order.totals.shipping);
    if (totEl)  totEl.textContent  = formatPrice(order.totals.total);

    /* Track Order Button */
    var trackBtn = document.getElementById('btn-track-order');
    if (trackBtn) {
      trackBtn.addEventListener('click', function () {
        alert('📦 Tracking Update for ' + order.orderId + ':\n\nStatus: Order Confirmed & In Processing.\nLocation: NEST Automated Hub, Bengaluru.\nExpected Arrival: ' + order.deliveryEstimate);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSuccess();
  });

  window.NEST = window.NEST || {};
  window.NEST.success = { renderSuccess: renderSuccess };

}());
