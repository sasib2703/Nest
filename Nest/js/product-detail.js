/**
 * NEST — Phase 5
 * product-detail.js — Product Detail Page Logic
 *
 * Reads ?id= from the URL, finds the product in PRODUCTS (data.js),
 * and populates:
 *   1. Hero (image, name, category, description, rating, price, qty)
 *   2. Features section
 *   3. Specifications section
 *   4. Reviews section
 *   5. Related products grid
 *
 * Requires: data.js + cart.js to be loaded first.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CATEGORY FEATURES
     4 features per category — icon SVG + title + description
  ───────────────────────────────────────────────────────────── */

  var CATEGORY_FEATURES = {
    'Smart Speakers & Audio': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        title: 'Spatial Audio',
        desc: 'Immersive 360° sound field engineered to fill every corner of the room naturally.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        title: 'Voice Assistant',
        desc: 'Native support for Google Assistant, Amazon Alexa, and Apple Siri, hands-free.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>',
        title: 'Multi-room Sync',
        desc: 'Link multiple NEST speakers for seamless whole-home audio at perfect synchrony.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
        title: 'Smart Automation',
        desc: 'Build routines, set alarms, and control your smart home by voice or schedule.',
      },
    ],
    'Smart Lighting': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        title: 'Adaptive Brightness',
        desc: 'Automatically adjusts colour temperature throughout the day to match natural light.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        title: 'Scene Presets',
        desc: 'Choose from dozens of curated scenes — Movie Night, Focus, Energise, and more.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        title: 'App & Voice Control',
        desc: 'Control every light via the NEST app, or speak commands to any voice assistant.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        title: 'Energy Monitoring',
        desc: 'Live energy usage reports so you always know what each light costs to run.',
      },
    ],
    'Security Devices': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        title: 'AI Motion Detection',
        desc: 'Distinguishes people, animals, and vehicles to eliminate false alerts intelligently.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        title: 'Colour Night Vision',
        desc: 'See in full colour even in complete darkness with advanced low-light imaging.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        title: 'Two-way Audio',
        desc: 'Speak and listen in real time to anyone at your door from anywhere in the world.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        title: 'Instant Alerts',
        desc: 'Push notifications delivered in under 500ms when any motion is detected.',
      },
    ],
    'Climate & Appliances': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
        title: 'Precision Temperature',
        desc: 'Maintains your exact preferred temperature with 0.1°C accuracy, all day long.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        title: 'Learning Schedule',
        desc: 'Observes your patterns over 7 days and auto-creates an energy-saving schedule.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        title: 'Energy Reports',
        desc: 'Detailed weekly insights into energy consumption and money saved on bills.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>',
        title: 'Remote Control',
        desc: 'Adjust your home climate from anywhere in the world via the NEST app.',
      },
    ],
    'Connectivity & Power': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>',
        title: 'Wi-Fi 6E Ready',
        desc: 'Tri-band Wi-Fi 6E delivers gigabit speeds to every device in your home.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        title: 'WPA3 Security',
        desc: 'Bank-grade encryption protects every connected device on your network.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
        title: 'Seamless Mesh',
        desc: 'Roam between access points without interruption — one network, zero dead zones.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        title: 'Parental Controls',
        desc: 'Schedule internet access, block content categories, and pause devices instantly.',
      },
    ],
    'Kitchen Essentials': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        title: 'Precision Control',
        desc: 'Precise temperature and timing settings for consistently perfect results every time.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        title: 'Recipe Guidance',
        desc: 'Built-in recipes with step-by-step guidance synced directly from the NEST app.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        title: 'Voice Commands',
        desc: 'Start, stop, and adjust settings hands-free while your hands stay in the dough.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        title: 'Scheduled Operation',
        desc: 'Set brew, cook, and warm times so your kitchen is ready the moment you are.',
      },
    ],
    'Cleaning Devices': [
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        title: 'LiDAR Mapping',
        desc: 'Laser-precise room mapping creates a digital layout for intelligent, systematic cleaning.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
        title: 'AI Obstacle Avoidance',
        desc: 'Recognises and navigates around cables, socks, shoes, and furniture automatically.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12 19.79 19.79 0 0 1 1.09 3.18a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        title: 'Auto-Empty Base',
        desc: '45-day dustbin capacity. The dock automatically empties the robot after every clean.',
      },
      {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        title: 'No-go Zones',
        desc: 'Draw virtual boundaries in the app to keep the robot out of any area you choose.',
      },
    ],
  };

  /* Default features for unknown category */
  var DEFAULT_FEATURES = [
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', title: 'Premium Build', desc: 'Engineered with premium materials built for years of reliable performance.' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>', title: 'Smart Connectivity', desc: 'Works seamlessly with Wi-Fi, Bluetooth, and the NEST ecosystem.' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>', title: 'App Control', desc: 'Full control from your smartphone via the NEST companion app.' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>', title: 'Energy Efficient', desc: 'Designed to minimise energy consumption without sacrificing performance.' },
  ];


  /* ─────────────────────────────────────────────────────────────
     CATEGORY SPECIFICATIONS
  ───────────────────────────────────────────────────────────── */

  var CATEGORY_SPECS = {
    'Smart Speakers & Audio': [
      { label: 'Connectivity',   value: 'Wi-Fi 6 (2.4GHz / 5GHz), Bluetooth 5.2' },
      { label: 'Compatibility',  value: 'Google Home, Amazon Alexa, Apple HomeKit' },
      { label: 'Audio Output',   value: 'Bi-amplified, dual-driver, 360° sound' },
      { label: 'Power Supply',   value: 'AC power adapter (included)' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
    'Smart Lighting': [
      { label: 'Colour Range',   value: '16 million colours + tunable white 2700K–6500K' },
      { label: 'Connectivity',   value: 'Wi-Fi 5, Zigbee 3.0, Bluetooth 5.0' },
      { label: 'Compatibility',  value: 'Google Home, Amazon Alexa, Apple HomeKit, Matter' },
      { label: 'Lifespan',       value: 'Up to 25,000 hours' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
    'Security Devices': [
      { label: 'Resolution',     value: '4K Ultra HD (3840 × 2160)' },
      { label: 'Field of View',  value: '130° wide angle' },
      { label: 'Night Vision',   value: 'Full-colour night vision up to 10m' },
      { label: 'Connectivity',   value: 'Wi-Fi 5 (2.4GHz / 5GHz)' },
      { label: 'Storage',        value: 'NEST Cloud (30-day free) + local microSD' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
    'Climate & Appliances': [
      { label: 'Accuracy',       value: '±0.1°C temperature precision' },
      { label: 'Display',        value: '3.5" colour ambient display' },
      { label: 'Connectivity',   value: 'Wi-Fi 5, Zigbee, Matter' },
      { label: 'Compatibility',  value: 'Google Home, Amazon Alexa, Apple HomeKit' },
      { label: 'Power',          value: 'C-wire (24VAC) / battery' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
    'Connectivity & Power': [
      { label: 'Wi-Fi Standard', value: 'Wi-Fi 6E (802.11ax tri-band)' },
      { label: 'Security',       value: 'WPA3, automatic firmware updates' },
      { label: 'Compatibility',  value: 'Matter, Thread, Zigbee gateway' },
      { label: 'Ports',          value: '1× WAN, 4× LAN Gigabit, 2× USB-A' },
      { label: 'Coverage',       value: 'Up to 280m² per unit' },
      { label: 'Warranty',       value: '3 years limited' },
    ],
    'Kitchen Essentials': [
      { label: 'Connectivity',   value: 'Wi-Fi 5, Bluetooth 5.0' },
      { label: 'Compatibility',  value: 'Google Home, Amazon Alexa, Apple HomeKit' },
      { label: 'Material',       value: 'Brushed stainless steel, BPA-free internals' },
      { label: 'Power',          value: '220–240V AC, 50/60Hz' },
      { label: 'Certifications', value: 'CE, RoHS, FSSAI compliant' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
    'Cleaning Devices': [
      { label: 'Navigation',     value: 'LiDAR + AI vision obstacle avoidance' },
      { label: 'Suction Power',  value: 'Up to 4,500Pa (max mode)' },
      { label: 'Battery',        value: '5,200 mAh — up to 210 min runtime' },
      { label: 'Noise Level',    value: '58dB (standard mode)' },
      { label: 'Connectivity',   value: 'Wi-Fi 5, Bluetooth 5.0' },
      { label: 'Warranty',       value: '2 years limited' },
    ],
  };

  var DEFAULT_SPECS = [
    { label: 'Connectivity',  value: 'Wi-Fi 5, Bluetooth 5.0' },
    { label: 'Compatibility', value: 'Google Home, Amazon Alexa, Apple HomeKit' },
    { label: 'Power',         value: 'AC adapter (included)' },
    { label: 'Warranty',      value: '2 years limited' },
  ];


  /* ─────────────────────────────────────────────────────────────
     STATIC REVIEWS (3 per page — realistic but generic)
  ───────────────────────────────────────────────────────────── */

  var REVIEWS = [
    {
      name:     'Sarah M.',
      location: 'Mumbai, India',
      rating:   5,
      date:     'March 2026',
      text:     'Genuinely impressed. Setup took under five minutes, it connected to everything seamlessly. The quality is unlike anything I\'ve owned at this price.',
    },
    {
      name:     'James R.',
      location: 'Bengaluru, India',
      rating:   4,
      date:     'February 2026',
      text:     'Beautifully designed and works exactly as advertised. The app experience is clean and the performance is consistent. Would absolutely recommend.',
    },
    {
      name:     'Priya K.',
      location: 'Delhi, India',
      rating:   5,
      date:     'January 2026',
      text:     'I didn\'t realise how much I needed this until I had it. It fits perfectly into our home and the whole family uses it daily without any issues.',
    },
  ];


  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */

  function formatPrice (price) {
    return '\u20b9' + price.toLocaleString('en-IN');
  }

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

  function getParam (name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }


  /* ─────────────────────────────────────────────────────────────
     PAGE POPULATION
  ───────────────────────────────────────────────────────────── */

  function populatePage (product) {

    /* ── Document title ── */
    document.title = product.name + ' — NEST';

    /* ── Breadcrumb ── */
    var crumbProduct = document.getElementById('crumb-product');
    if (crumbProduct) crumbProduct.textContent = product.name;

    /* ── Hero Image ── */
    var imgEl = document.getElementById('pd-img');
    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop';
      };
    }

    /* Badges */
    var badgesEl = document.getElementById('pd-badges');
    if (badgesEl) {
      var badges = '';
      if (product.featured)  badges += '<span class="pd-badge pd-badge--featured">Featured</span>';
      if (product.newArrival) badges += '<span class="pd-badge pd-badge--new">New Arrival</span>';
      badgesEl.innerHTML = badges;
    }

    /* ── Hero Info ── */
    var categoryEl = document.getElementById('pd-category');
    if (categoryEl) categoryEl.textContent = product.category;

    var nameEl = document.getElementById('pd-name');
    if (nameEl) nameEl.textContent = product.name;

    var descEl = document.getElementById('pd-desc');
    if (descEl) descEl.textContent = product.description;

    var ratingEl = document.getElementById('pd-rating');
    if (ratingEl) {
      ratingEl.innerHTML =
        '<span class="pd-stars">' + buildStars(product.rating) + '</span>' +
        '<span class="pd-rating-num">' + product.rating.toFixed(1) + '</span>' +
        '<span class="pd-rating-count">(148 reviews)</span>';
    }

    var priceEl = document.getElementById('pd-price');
    if (priceEl) priceEl.textContent = formatPrice(product.price);

    var taxNoteEl = document.getElementById('pd-tax-note');
    if (taxNoteEl) taxNoteEl.textContent = 'Inclusive of all taxes. Free delivery above ₹10,000.';

    /* ── Quantity ── */
    var qtyVal = 1;
    var qtyDisplay = document.getElementById('pd-qty-val');
    var qtyDec     = document.getElementById('pd-qty-dec');
    var qtyInc     = document.getElementById('pd-qty-inc');

    if (qtyDec) {
      qtyDec.addEventListener('click', function () {
        if (qtyVal > 1) {
          qtyVal--;
          if (qtyDisplay) qtyDisplay.textContent = qtyVal;
        }
      });
    }

    if (qtyInc) {
      qtyInc.addEventListener('click', function () {
        if (qtyVal < 10) {
          qtyVal++;
          if (qtyDisplay) qtyDisplay.textContent = qtyVal;
        }
      });
    }

    /* ── Add to Cart ── */
    var addBtn = document.getElementById('pd-add-cart');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (addBtn.dataset.adding) return;
        addBtn.dataset.adding = 'true';

        /* Call cart module */
        if (window.NEST && window.NEST.cart) {
          window.NEST.cart.addToCart(product.id, qtyVal);
        }

        var original = addBtn.textContent;
        addBtn.textContent = 'Added to Cart ✓';
        addBtn.classList.add('pd-add-cart--added');

        setTimeout(function () {
          addBtn.textContent = original;
          addBtn.classList.remove('pd-add-cart--added');
          delete addBtn.dataset.adding;
        }, 2000);
      });
    }

    /* ── View Cart Link ── */
    var viewCartBtn = document.getElementById('pd-view-cart');
    if (viewCartBtn) {
      viewCartBtn.addEventListener('click', function () {
        window.location.href = 'cart.html';
      });
    }
  }


  /* ─────────────────────────────────────────────────────────────
     FEATURES
  ───────────────────────────────────────────────────────────── */

  function renderFeatures (product) {
    var container = document.getElementById('pd-features-grid');
    if (!container) return;

    var features = CATEGORY_FEATURES[product.category] || DEFAULT_FEATURES;
    var html = '';

    features.forEach(function (f) {
      html +=
        '<div class="pd-feat-card">' +
          '<div class="pd-feat-card__icon">' + f.icon + '</div>' +
          '<h3 class="pd-feat-card__title">' + f.title + '</h3>' +
          '<p class="pd-feat-card__desc">' + f.desc + '</p>' +
        '</div>';
    });

    container.innerHTML = html;
  }


  /* ─────────────────────────────────────────────────────────────
     SPECIFICATIONS
  ───────────────────────────────────────────────────────────── */

  function renderSpecs (product) {
    var container = document.getElementById('pd-specs-list');
    if (!container) return;

    var specs = CATEGORY_SPECS[product.category] || DEFAULT_SPECS;
    var html  = '';

    specs.forEach(function (spec) {
      html +=
        '<div class="pd-spec-row">' +
          '<dt class="pd-spec-label">' + spec.label + '</dt>' +
          '<dd class="pd-spec-value">' + spec.value + '</dd>' +
        '</div>';
    });

    container.innerHTML = html;
  }


  /* ─────────────────────────────────────────────────────────────
     REVIEWS
  ───────────────────────────────────────────────────────────── */

  function renderReviews () {
    var container = document.getElementById('pd-reviews-grid');
    if (!container) return;

    var html = '';

    REVIEWS.forEach(function (r) {
      html +=
        '<blockquote class="pd-review">' +
          '<div class="pd-review__header">' +
            '<span class="pd-review__stars" aria-label="' + r.rating + ' out of 5">' +
              buildStars(r.rating) +
            '</span>' +
            '<span class="pd-review__date">' + r.date + '</span>' +
          '</div>' +
          '<p class="pd-review__text">&ldquo;' + r.text + '&rdquo;</p>' +
          '<footer class="pd-review__footer">' +
            '<span class="pd-review__name">' + r.name + '</span>' +
            '<span class="pd-review__location">' + r.location + '</span>' +
          '</footer>' +
        '</blockquote>';
    });

    container.innerHTML = html;
  }


  /* ─────────────────────────────────────────────────────────────
     RELATED PRODUCTS
  ───────────────────────────────────────────────────────────── */

  function renderRelated (product) {
    var container = document.getElementById('pd-related-grid');
    if (!container) return;

    var products = window.PRODUCTS || [];
    var related  = products
      .filter(function (p) { return p.category === product.category && p.id !== product.id; })
      .slice(0, 4);

    if (related.length === 0) {
      /* Fallback: pick from any category */
      related = products.filter(function (p) { return p.id !== product.id; }).slice(0, 4);
    }

    var html = '';

    related.forEach(function (p) {
      html +=
        '<a href="product-detail.html?id=' + p.id + '" class="pd-related-card" aria-label="' + p.name + '">' +
          '<div class="pd-related-card__img-wrap">' +
            '<img src="' + p.image + '" alt="' + p.name + '" class="pd-related-card__img" loading="lazy" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop\';" />' +
          '</div>' +
          '<div class="pd-related-card__body">' +
            '<p class="pd-related-card__category">' + p.category + '</p>' +
            '<h3 class="pd-related-card__name">' + p.name + '</h3>' +
            '<span class="pd-related-card__price">' + formatPrice(p.price) + '</span>' +
          '</div>' +
        '</a>';
    });

    container.innerHTML = html;
  }


  /* ─────────────────────────────────────────────────────────────
     NOT FOUND STATE
  ───────────────────────────────────────────────────────────── */

  function showNotFound () {
    document.title = 'Product Not Found — NEST';
    var main = document.getElementById('main-content');
    if (main) {
      main.innerHTML =
        '<div class="pd-not-found">' +
          '<p class="pd-not-found__eyebrow">404</p>' +
          '<h1 class="pd-not-found__title">Product Not Found</h1>' +
          '<p class="pd-not-found__text">The product you\'re looking for doesn\'t exist or has been removed.</p>' +
          '<a href="products.html" class="pd-not-found__btn">Browse All Products</a>' +
        '</div>';
    }
  }


  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    var productId = getParam('id');
    var products  = window.PRODUCTS || [];

    if (!productId) { showNotFound(); return; }

    var product = null;
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === productId) { product = products[i]; break; }
    }

    if (!product) { showNotFound(); return; }

    /* Populate all sections */
    populatePage(product);
    renderFeatures(product);
    renderSpecs(product);
    renderReviews();
    renderRelated(product);

    /* Reveal page content */
    var page = document.getElementById('pd-page');
    if (page) {
      requestAnimationFrame(function () {
        page.classList.add('pd-page--ready');
      });
    }
  });

}());
