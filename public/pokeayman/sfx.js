/* PokéAyman global sound effects: synthesized with Web Audio, no files to load. */
(function () {
  if (window.pokeSfx) return;
  const KEY = 'pokeayman-sfx-muted';
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) {}
  const last = {};

  function ac() {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    if (!ctx) ctx = new A();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(f, t, dur, { type = 'sine', vol = 0.18, slide = 0 } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    const s = c.currentTime + t;
    o.type = type; o.frequency.setValueAtTime(f, s);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), s + dur);
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(vol, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + dur + 0.03);
  }
  function noise(t, dur, { vol = 0.25, freq = 1200, q = 0.8, type = 'bandpass', sweep = 0 } = {}) {
    const c = ac(); if (!c) return;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    const s = c.currentTime + t;
    src.buffer = buf; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(freq, s);
    if (sweep) fl.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), s + dur);
    g.gain.setValueAtTime(vol, s); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    src.connect(fl); fl.connect(g); g.connect(c.destination); src.start(s);
  }

  const S = {
    click() { tone(880, 0, 0.05, { type: 'triangle', vol: 0.07 }); },
    tab() { tone(660, 0, 0.06, { type: 'triangle', vol: 0.08 }); tone(990, 0.04, 0.07, { type: 'triangle', vol: 0.06 }); },
    coin() { tone(988, 0, 0.08, { type: 'square', vol: 0.06 }); tone(1319, 0.07, 0.28, { type: 'square', vol: 0.06 }); },
    correct() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.22, { type: 'triangle', vol: 0.14 })); },
    wrong() { tone(330, 0, 0.18, { type: 'sine', vol: 0.16, slide: -90 }); tone(250, 0.16, 0.26, { type: 'sine', vol: 0.14, slide: -80 }); },
    plus() { [659, 880, 1175].forEach((f, i) => tone(f, i * 0.06, 0.14, { type: 'triangle', vol: 0.12 })); },
    minus() { [440, 349, 262].forEach((f, i) => tone(f, i * 0.08, 0.16, { type: 'sine', vol: 0.13 })); },
    pop() { tone(420, 0, 0.12, { type: 'sine', vol: 0.18, slide: 600 }); noise(0, 0.08, { vol: 0.12, freq: 3000 }); },
    rattle() { for (let i = 0; i < 5; i++) noise(i * 0.06, 0.04, { vol: 0.12, freq: 1800 + i * 200, q: 4 }); },
    star() { [1047, 1319, 1568, 2093, 1568, 2093].forEach((f, i) => tone(f, i * 0.05, 0.12, { type: 'square', vol: 0.05 })); },
    boom() { noise(0, 0.6, { vol: 0.5, freq: 600, type: 'lowpass', sweep: -500 }); tone(110, 0, 0.5, { type: 'sine', vol: 0.3, slide: -70 }); },
    whoosh() { noise(0, 0.35, { vol: 0.22, freq: 400, q: 1.5, sweep: 2600 }); },
    rocket() { noise(0, 0.7, { vol: 0.2, freq: 300, q: 1, sweep: 3000 }); tone(200, 0, 0.7, { type: 'sawtooth', vol: 0.05, slide: 900 }); },
    purchase() { tone(1200, 0, 0.04, { type: 'square', vol: 0.08 }); tone(700, 0.06, 0.05, { type: 'square', vol: 0.08 }); [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.18 + i * 0.08, 0.2, { type: 'triangle', vol: 0.12 })); },
    fanfare() { [[523, 0], [523, 0.12], [523, 0.24], [698, 0.36], [880, 0.62], [784, 0.8], [1047, 0.98]].forEach(([f, t]) => tone(f, t, t > 0.9 ? 0.6 : 0.16, { type: 'square', vol: 0.07 })); },
    vs() { noise(0, 0.25, { vol: 0.3, freq: 2500, q: 0.6 }); tone(150, 0, 0.45, { type: 'sawtooth', vol: 0.1, slide: -60 }); tone(300, 0.05, 0.4, { type: 'square', vol: 0.05 }); },
    lunge() { noise(0, 0.18, { vol: 0.18, freq: 700, q: 1.4, sweep: 2200 }); },
    faint() { tone(600, 0, 0.9, { type: 'triangle', vol: 0.12, slide: -480 }); },
    superEff() { [784, 1047, 1568].forEach((f, i) => tone(f, i * 0.05, 0.16, { type: 'square', vol: 0.06 })); },
    hit(type) {
      const t = String(type || 'normal').toLowerCase();
      if (t === 'electric') { for (let i = 0; i < 4; i++) noise(i * 0.04, 0.05, { vol: 0.25, freq: 4000, q: 2 }); tone(1400, 0, 0.2, { type: 'sawtooth', vol: 0.05, slide: -900 }); }
      else if (t === 'fire') { noise(0, 0.45, { vol: 0.35, freq: 900, type: 'lowpass', sweep: -600 }); }
      else if (t === 'water' || t === 'ice') { noise(0, 0.3, { vol: 0.25, freq: 2500, q: 0.7, sweep: -1800 }); tone(1600, 0.02, 0.15, { vol: 0.06, slide: 600 }); }
      else if (t === 'flying' || t === 'psychic' || t === 'ghost' || t === 'fairy') { noise(0, 0.3, { vol: 0.2, freq: 600, q: 1.2, sweep: 3000 }); tone(900, 0, 0.3, { type: 'sine', vol: 0.07, slide: 500 }); }
      else if (t === 'rock' || t === 'ground' || t === 'steel' || t === 'fighting') { noise(0, 0.3, { vol: 0.45, freq: 300, type: 'lowpass' }); tone(90, 0, 0.25, { vol: 0.3, slide: -40 }); }
      else { noise(0, 0.15, { vol: 0.35, freq: 1500, q: 0.7 }); tone(160, 0, 0.15, { vol: 0.22, slide: -60 }); }
    },
  };

  function play(name, arg) {
    if (muted || !S[name]) return;
    const now = performance.now();
    if (last[name] && now - last[name] < 45) return;
    last[name] = now;
    try { S[name](arg); } catch (e) {}
  }
  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
    try { if (window.gameSoundState) window.gameSoundState.muted = muted; } catch (e) {}
    document.querySelectorAll('.sfx-toggle').forEach(b => { b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-label', muted ? 'Turn sounds on' : 'Turn sounds off'); b.setAttribute('aria-pressed', String(!muted)); });
  }
  window.pokeSfx = { play, setMuted, isMuted: () => muted };

  // Floating mute button
  function mountToggle() {
    if (document.querySelector('.sfx-toggle')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sfx-toggle'; b.dataset.sfx = 'none';
    b.addEventListener('click', () => { setMuted(!muted); if (!muted) play('tab'); });
    document.body.appendChild(b);
    setMuted(muted);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountToggle); else mountToggle();

  // Delegated click sounds
  document.addEventListener('click', e => {
    const el = e.target.closest('button, [role="button"], a, .class-view-tab, .student-dashboard-tab, .baam-giftbox, .shop-pokemon-card');
    if (!el || el.disabled) return;
    const hint = el.dataset.sfx;
    if (hint === 'none') return;
    if (hint) return play(hint);
    const txt = (el.textContent || '').trim().toLowerCase();
    const id = el.id || '';
    if (el.matches('.baam-giftbox')) return play('rattle');
    if (/correct|baam-correct/.test(id) || /^✓/.test(txt)) return play('correct');
    if (/wrong/.test(id) || /^✕/.test(txt)) return play('wrong');
    if (/buy|purchase|catch|unlock/.test(txt) && !/cancel/.test(txt)) return play('purchase');
    if (/gift|award|\+\d|coins?\b/.test(txt)) return play('coin');
    if (el.matches('.class-view-tab, .student-dashboard-tab, [data-classtab], [data-tab]')) return play('tab');
    play('click');
  }, true);

  // Celebration overlays and toasts
  const seen = new WeakSet();
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (!(n instanceof HTMLElement) || seen.has(n)) continue;
      if (n.matches('.game-celebration-overlay')) { seen.add(n); play(n.querySelector('.negative-award-card') ? 'minus' : 'fanfare'); }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
