// Bright mode catch-all: legacy styles hardcode dark navy surfaces and pale text with
// high-specificity rules. In bright mode we detect those at runtime and tag them so
// bright-fixes.css can repaint them with the bright tokens. Dark mode is untouched.
(function () {
  const SKIP = '.vb-stage .vb-arena *, img, svg, canvas, video, .ga-cart-art, .ga-cart-play, [class*="holo"], [class*="rarity"], [class*="tier-"], .coin-celebration, [class*="celebrat"], .pokeball, [class*="pokeball"], [class*="hp-fill"], [class*="timer-fill"], .hangman-figure *';
  const parse = (c) => { const m = String(c).match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const lum = (rgb) => { const [r, g, b] = rgb.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function surfaceColor(s) {
    const bg = parse(s.backgroundColor);
    if (bg && (bg[3] === undefined || bg[3] > 0.4)) return bg;
    if (s.backgroundImage && s.backgroundImage.includes('gradient')) { const m = s.backgroundImage.match(/rgba?\([^)]+\)/); if (m) { const c = parse(m[0]); if (c && (c[3] === undefined || c[3] > 0.4)) return c; } }
    return null;
  }
  function sweep() {
    if (!document.body.classList.contains('ts-bright')) {
      document.querySelectorAll('.pk-bf-dark,.pk-bf-ink').forEach((el) => el.classList.remove('pk-bf-dark', 'pk-bf-ink'));
      return;
    }
    const all = document.body.querySelectorAll('div,section,article,aside,header,nav,label,button,span,p,li,form,a,h1,h2,h3,h4,table,td,th,tr');
    for (const el of all) {
      if (el.classList.contains('pk-bf-dark') || el.closest('.vb-stage') && !el.closest('.vb-picker, .vb-head')) continue;
      if (el.matches(SKIP)) continue;
      const s = getComputedStyle(el);
      const c = surfaceColor(s);
      if (!c) continue;
      const sat = Math.max(...c.slice(0, 3)) - Math.min(...c.slice(0, 3));
      // Dark navy / slate legacy surfaces only (keeps red, yellow, purple action buttons).
      if (lum(c) < 0.06 && sat < 120) el.classList.add('pk-bf-dark');
    }
    for (const el of all) {
      if (el.classList.contains('pk-bf-ink') || el.matches(SKIP)) continue;
      if (el.closest('.vb-stage') && !el.closest('.vb-picker, .vb-head')) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const fg = parse(getComputedStyle(el).color);
      if (!fg || lum(fg) < 0.55) continue;
      let p = el, bg = null;
      while (p && p !== document.documentElement) { const sc = p.classList.contains('pk-bf-dark') ? [255, 255, 255] : surfaceColor(getComputedStyle(p)); if (sc) { bg = sc; break; } p = p.parentElement; }
      if (!bg || lum(bg) > 0.45) el.classList.add('pk-bf-ink');
    }
  }
  let t = null;
  const schedule = () => { clearTimeout(t); t = setTimeout(sweep, 180); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', schedule);
  schedule();
})();
// Strip leading emoji from tab buttons (labels stay text-only).
(function () {
  const EMOJI = /^[\s\p{Extended_Pictographic}\u200d\ufe0f]+/u;
  function strip() {
    document.querySelectorAll('.student-dashboard-tab, .class-subtab-btn, [role="tab"], .ts-item, .th-tab').forEach((b) => {
      for (const n of b.childNodes) { if (n.nodeType === 3 && n.textContent.trim()) { const v = n.textContent.replace(EMOJI, ''); if (v !== n.textContent) n.textContent = v; break; } }
    });
  }
  let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(strip, 150); }).observe(document.documentElement, { childList: true, subtree: true });
  strip();
})();
