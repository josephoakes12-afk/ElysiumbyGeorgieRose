(function () {
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  // Mobile: collapse service accordions by default, desktop: leave as authored
  if (isMobile) {
    document.querySelectorAll('details.service-accordion').forEach((detail) => detail.removeAttribute('open'));
  }

  function openAccordionFromHash() {
    if (!window.location.hash) {
      return;
    }

    let target = null;
    try {
      target = document.querySelector(window.location.hash);
    } catch (_error) {
      return;
    }

    if (target && target.matches('details.service-accordion')) {
      target.setAttribute('open', 'open');
    }
  }

  // Prevent horizontal overflow debugging guard
  // (adds a class if any overflow occurs so we can spot it quickly)
  function detectOverflow() {
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth) {
      doc.classList.add('has-horizontal-overflow');
    } else {
      doc.classList.remove('has-horizontal-overflow');
    }
  }

  document.querySelectorAll('[data-show-more-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const crop = btn.previousElementSibling;
      if (crop && crop.classList.contains('mobile-gallery-crop')) {
        crop.classList.add('is-expanded');
        btn.style.display = 'none';
      }
    });
  });

  window.addEventListener('resize', detectOverflow);
  window.addEventListener('load', () => {
    detectOverflow();
    openAccordionFromHash();
  });
  window.addEventListener('hashchange', openAccordionFromHash);
})();
