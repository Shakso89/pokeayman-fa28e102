// Bright mode catch-all: legacy styles hardcode dark navy surfaces and pale text with
// high-specificity rules. In bright mode we detect those at runtime and tag them so
// bright-fixes.css can repaint them with the bright tokens. Dark mode is untouched.
(function () {
  // These surfaces have their own intentional dark palette even in bright mode.
  // The legacy contrast sweep must not recolour the home hero or login dialogs.
  const SKIP = '#home-screen, #home-screen *, .pk-login-overlay, .pk-login-overlay *, .vb-stage .vb-arena *, img, svg, canvas, video, .ga-cart-art, .ga-cart-play, [class*="holo"], [class*="rarity"], [class*="tier-"], .coin-celebration, [class*="celebrat"], .pokeball, [class*="pokeball"], [class*="hp-fill"], [class*="timer-fill"], .hangman-figure *';
  // Modern computed colours can be oklch()/color(srgb ...), not just rgb().
  const colorCache = new Map();
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const parse = (c) => {
    if (!c || c === 'transparent') return null;
    if (colorCache.has(c)) return colorCache.get(c);
    if (!ctx || !CSS.supports('color', c)) return null;
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    const value = [pixel[0], pixel[1], pixel[2], pixel[3] / 255];
    colorCache.set(c, value); return value;
  };
  const lum = (rgb) => { const [r, g, b] = rgb.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function surfaceColor(s) {
    const bg = parse(s.backgroundColor);
    // An opaque base does not hide a gradient painted above it.
    if (s.backgroundImage && s.backgroundImage.includes('gradient')) { const m = s.backgroundImage.match(/(?:rgba?|oklch|oklab|color|hsl|hsla)\([^)]+\)/); if (m) { const c = parse(m[0]); if (c && c[3] > 0.4) return c; } }
    if (bg && bg[3] > 0.4) return bg;
    return null;
  }
  function sweep() {
    if (!document.body.classList.contains('ts-bright')) {
      document.querySelectorAll('.pk-bf-dark,.pk-bf-ink').forEach((el) => el.classList.remove('pk-bf-dark', 'pk-bf-ink'));
      return;
    }
    const all = document.body.querySelectorAll('div,section,article,aside,header,nav,label,button,span,p,li,form,a,h1,h2,h3,h4,table,td,th,tr');
    for (const el of all) {
      if (el.matches(SKIP)) { el.classList.remove('pk-bf-dark', 'pk-bf-ink'); continue; }
      if (el.classList.contains('pk-bf-dark') || el.closest('.vb-stage') && !el.closest('.vb-picker, .vb-head')) continue;
      const s = getComputedStyle(el);
      const c = surfaceColor(s);
      if (!c) continue;
      const sat = Math.max(...c.slice(0, 3)) - Math.min(...c.slice(0, 3));
      // Dark navy / slate legacy surfaces only (keeps red, yellow, purple action buttons).
      if (lum(c) < 0.10 && sat < 120) el.classList.add('pk-bf-dark');
    }
    for (const el of all) {
      if (el.matches(SKIP)) { el.classList.remove('pk-bf-dark', 'pk-bf-ink'); continue; }
      if (el.classList.contains('pk-bf-ink')) continue;
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
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
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
