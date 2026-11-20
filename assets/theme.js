/**
 * DealTargets theme behaviour.
 * Vanilla JS, no dependencies. Every feature is optional: each init looks for
 * its own data-attributes and does nothing when they are absent.
 */
(function () {
  'use strict';

  /* ---------- Dialog drawers (mobile menu) ---------- */
  function initDialogs() {
    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-open-dialog]');
      if (opener) {
        var dialog = document.getElementById(opener.getAttribute('data-open-dialog'));
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
          opener.setAttribute('aria-expanded', 'true');
        }
        return;
      }

      var closer = event.target.closest('[data-close-dialog]');
      if (closer) {
        var parent = closer.closest('dialog');
        if (parent) parent.close();
        return;
      }

      // Click on the dialog backdrop closes it.
      if (event.target.tagName === 'DIALOG' && event.target.open) {
        event.target.close();
      }
    });

    document.querySelectorAll('dialog').forEach(function (dialog) {
      dialog.addEventListener('close', function () {
        document.querySelectorAll('[data-open-dialog="' + dialog.id + '"]').forEach(function (btn) {
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    });
  }

  /* ---------- Search: category select narrows by product type ---------- */
  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var select = form.querySelector('[data-search-type]');
        var input = form.querySelector('input[name="q"]');
        if (!select || !input || !select.value) return;
        var terms = input.value.replace(/\s*product_type:"[^"]*"/g, '').trim();
        input.value = (terms ? terms + ' ' : '') + 'product_type:"' + select.value + '"';
      });
    });
  }

  /* ---------- Tabs (home product lists, product info) ---------- */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;

      function select(tab, focus) {
        tabs.forEach(function (t) {
          var active = t === tab;
          t.setAttribute('aria-selected', active ? 'true' : 'false');
          t.tabIndex = active ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !active;
        });
        if (focus) tab.focus();
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { select(tab, false); });
        tab.addEventListener('keydown', function (event) {
          var next = null;
          if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
          if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
          if (event.key === 'Home') next = tabs[0];
          if (event.key === 'End') next = tabs[tabs.length - 1];
          if (next) {
            event.preventDefault();
            select(next, true);
          }
        });
      });
    });
  }

  /* ---------- Quantity steppers ---------- */
  function initQuantity() {
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-qty-step]');
      if (!btn) return;
      var wrap = btn.closest('.dt-qty');
      var input = wrap && wrap.querySelector('input');
      if (!input) return;
      var min = parseInt(input.min || '0', 10);
      var value = (parseInt(input.value, 10) || 0) + parseInt(btn.getAttribute('data-qty-step'), 10);
      input.value = Math.max(min, value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Cart page: submit the cart form when a quantity changes.
    var cartForm = document.getElementById('CartForm');
    if (cartForm) {
      var timer;
      cartForm.addEventListener('change', function (event) {
        if (!event.target.matches('[data-cart-qty]')) return;
        clearTimeout(timer);
        timer = setTimeout(function () {
          var update = document.createElement('input');
          update.type = 'hidden';
          update.name = 'update';
          update.value = '1';
          cartForm.appendChild(update);
          cartForm.submit();
        }, 500);
      });
    }
  }

  /* ---------- Collection / search filters, sort and view ---------- */
  function initFacets() {
    var drawer = document.querySelector('[data-filters]');
    var overlay = document.querySelector('.dt-filters__overlay');
    var form = document.querySelector('[data-facets-form]');

    function isDrawerMode() {
      return window.matchMedia('(max-width: 989px)').matches;
    }

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('is-open');
      if (overlay) overlay.hidden = false;
      document.documentElement.classList.add('dt-lock');
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      if (overlay) overlay.hidden = true;
      document.documentElement.classList.remove('dt-lock');
    }

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-filters-open]')) openDrawer();
      if (event.target.closest('[data-filters-close]')) closeDrawer();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
    });

    function submitFilters() {
      if (!form) return;
      var params = new URLSearchParams();
      new FormData(form).forEach(function (value, key) {
        if (value !== '') params.append(key, value);
      });
      window.location.search = params.toString();
    }

    if (form) {
      form.addEventListener('change', function () {
        // On desktop apply immediately; in the mobile drawer wait for “Show results”.
        if (!isDrawerMode()) submitFilters();
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitFilters();
      });
    }

    var sort = document.querySelector('[data-sort-select]');
    if (sort) {
      sort.addEventListener('change', function () {
        var params = new URLSearchParams(window.location.search);
        params.set('sort_by', sort.value);
        params.delete('page');
        window.location.search = params.toString();
      });
    }

    var grid = document.querySelector('[data-product-grid]');
    var viewButtons = document.querySelectorAll('[data-view]');
    function setView(view) {
      if (!grid) return;
      grid.classList.toggle('is-list', view === 'list');
      viewButtons.forEach(function (b) {
        var active = b.getAttribute('data-view') === view;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      try { localStorage.setItem('dt-view', view); } catch (e) { /* storage unavailable */ }
    }
    if (grid && viewButtons.length) {
      viewButtons.forEach(function (b) {
        b.addEventListener('click', function () { setView(b.getAttribute('data-view')); });
      });
      var saved = null;
      try { saved = localStorage.getItem('dt-view'); } catch (e) { /* storage unavailable */ }
      if (saved === 'list') setView('list');
    }
  }

  /* ---------- Product gallery ---------- */
  function showMedia(gallery, mediaId) {
    if (!gallery || !mediaId) return;
    var slides = gallery.querySelectorAll('[data-media-id]');
    var found = false;
    slides.forEach(function (slide) {
      var match = slide.getAttribute('data-media-id') === String(mediaId);
      if (match) found = true;
      slide.hidden = !match;
    });
    if (!found) return;

    var index = 0;
    var zoomUrl = null;
    gallery.querySelectorAll('[data-media-target]').forEach(function (thumb) {
      var match = thumb.getAttribute('data-media-target') === String(mediaId);
      thumb.classList.toggle('is-active', match);
      if (match) {
        index = thumb.getAttribute('data-index');
        zoomUrl = thumb.getAttribute('data-zoom-url');
      }
    });

    var count = gallery.querySelector('[data-gallery-count]');
    if (count && index) count.textContent = index + ' of ' + slides.length;
    var zoom = gallery.querySelector('[data-gallery-zoom]');
    if (zoom && zoomUrl) zoom.href = zoomUrl;

    // Pause any video that is no longer visible.
    gallery.querySelectorAll('[data-media-id][hidden] video').forEach(function (v) { v.pause(); });
  }

  function initGallery() {
    document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
      gallery.addEventListener('click', function (event) {
        var thumb = event.target.closest('[data-media-target]');
        if (thumb) showMedia(gallery, thumb.getAttribute('data-media-target'));
      });
    });
  }

  /* ---------- Product variant picker ---------- */
  function initVariants() {
    document.querySelectorAll('[data-product-section]').forEach(function (section) {
      var dataEl = section.querySelector('[data-product-variants]');
      var form = section.querySelector('[data-product-form]');
      if (!dataEl || !form) return;

      var variants;
      try { variants = JSON.parse(dataEl.textContent); } catch (e) { return; }

      var idInput = form.querySelector('[data-variant-id]');
      var addBtn = form.querySelector('[data-add-button]');
      var price = section.querySelector('[data-price]');
      var compare = section.querySelector('[data-compare]');
      var sku = section.querySelector('[data-sku]');
      var skuWrap = section.querySelector('[data-sku-wrap]');
      var stock = section.querySelector('[data-stock]');
      var gallery = section.querySelector('[data-gallery]');

      form.addEventListener('change', function (event) {
        if (!event.target.matches('input[type="radio"][name^="option-"]')) return;

        var selected = [];
        form.querySelectorAll('[data-option-index]').forEach(function (fieldset) {
          var checked = fieldset.querySelector('input:checked');
          selected.push(checked ? checked.value : null);
          var label = fieldset.querySelector('[data-option-value]');
          if (label && checked) label.textContent = checked.value;
        });

        var variant = variants.find(function (v) {
          return v.options.every(function (opt, i) { return opt === selected[i]; });
        });

        if (!variant) {
          if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = 'Unavailable';
          }
          if (stock) {
            stock.textContent = 'Unavailable';
            stock.className = 'dt-stock dt-stock--lg dt-stock--out';
          }
          return;
        }

        idInput.value = variant.id;
        if (price) {
          price.textContent = variant.price;
          price.classList.toggle('dt-price--sale', !!variant.compare);
        }
        if (compare) {
          compare.hidden = !variant.compare;
          if (variant.compare) compare.textContent = variant.compare;
        }
        if (sku) sku.textContent = variant.sku || '';
        if (skuWrap) skuWrap.hidden = !variant.sku;
        if (stock) {
          stock.textContent = variant.stock;
          stock.className = 'dt-stock dt-stock--lg dt-stock--' + variant.stockMod;
        }
        if (addBtn) {
          addBtn.disabled = !variant.available;
          addBtn.textContent = variant.available ? 'Add to cart' : 'Sold out';
        }
        if (variant.media) showMedia(gallery, variant.media);

        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      });
    });
  }

  /* ---------- Product recommendations ---------- */
  function initRecommendations() {
    document.querySelectorAll('[data-recommendations]').forEach(function (el) {
      var url = el.getAttribute('data-url');
      if (!url || el.children.length) return;
      fetch(url)
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
        })
        .catch(function () { /* recommendations are optional */ });
    });
  }

  function init() {
    initDialogs();
    initSearchForms();
    initTabs();
    initQuantity();
    initFacets();
    initGallery();
    initVariants();
    initRecommendations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run section-level behaviour when sections reload in the theme editor.
  document.addEventListener('shopify:section:load', function () {
    initTabs();
    initGallery();
    initVariants();
    initRecommendations();
  });
})();
