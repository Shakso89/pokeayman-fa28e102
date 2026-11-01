// Bright mode readability fixes.
// High-performance stylesheet-driven rendering. (Eliminates synchronous canvas/DOM sweep lag)

// Clean up any obsolete sweep classes
(function () {
  function cleanupLegacyMarkers() {
    if (document.body && !document.body.classList.contains('ts-bright')) {
      document.querySelectorAll('.pk-bf-dark,.pk-bf-ink').forEach((el) => el.classList.remove('pk-bf-dark', 'pk-bf-ink'));
    }
  }
  window.addEventListener('DOMContentLoaded', cleanupLegacyMarkers);
  window.addEventListener('load', cleanupLegacyMarkers);
  cleanupLegacyMarkers();
})();

// Strip leading emoji from tab buttons (labels stay text-only).
(function () {
  const EMOJI = /^[\s\p{Extended_Pictographic}\u200d\ufe0f]+/u;
  function strip() {
    document.querySelectorAll('.student-dashboard-tab, .class-subtab-btn, [role="tab"], .ts-item, .th-tab').forEach((b) => {
      for (const n of b.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const v = n.textContent.replace(EMOJI, '');
          if (v !== n.textContent) n.textContent = v;
          break;
        }
      }
    });
  }
  let t;
  new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(strip, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });
  strip();
})();
