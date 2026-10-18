/* PokéAyman sound effects: synthesized with Web Audio, no files to load. */
(function () {
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

  // Smooth tone generator with exponential gain envelope and optional frequency slide
  function tone(f, t, dur, { type = 'sine', vol = 0.14, slide = 0 } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    const s = c.currentTime + t;
    o.type = type;
    o.frequency.setValueAtTime(f, s);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), s + dur);

    // Click-free attack and exponential decay
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(vol, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);

    o.connect(g);
    g.connect(c.destination);
    o.start(s);
    o.stop(s + dur + 0.03);
  }

  // Dual-harmonic chime for bell/metallic resonance (coins, rewards, stars)
  function bellTone(f, t, dur, { vol = 0.14 } = {}) {
    const c = ac(); if (!c) return;
    const s = c.currentTime + t;

    // Fundamental tone
    const o1 = c.createOscillator(), g1 = c.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(f, s);
    g1.gain.setValueAtTime(0.0001, s);
    g1.gain.linearRampToValueAtTime(vol, s + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o1.connect(g1);
    g1.connect(c.destination);
    o1.start(s);
    o1.stop(s + dur + 0.03);

    // Harmonic overtone (octave shimmer for authentic metallic chime)
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(f * 2, s);
    g2.gain.setValueAtTime(0.0001, s);
    g2.gain.linearRampToValueAtTime(vol * 0.35, s + 0.006);
    g2.gain.exponentialRampToValueAtTime(0.0001, s + (dur * 0.55));
    o2.connect(g2);
    g2.connect(c.destination);
    o2.start(s);
    o2.stop(s + (dur * 0.55) + 0.03);
  }

  // Filtered noise generator for impacts, whooshes, and booms
  function noise(t, dur, { vol = 0.18, freq = 1200, q = 0.8, type = 'bandpass', sweep = 0 } = {}) {
    const c = ac(); if (!c) return;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    const s = c.currentTime + t;
    src.buffer = buf;
    fl.type = type;
    fl.Q.value = q;
    fl.frequency.setValueAtTime(freq, s);
    if (sweep) fl.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), s + dur);
    g.gain.setValueAtTime(vol, s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    src.connect(fl);
    fl.connect(g);
    g.connect(c.destination);
    src.start(s);
  }

  const S = {
    // UI general clicks and tab switches are completely silent
    click() { /* intentionally silent */ },
    tab() { /* intentionally silent */ },

    // COIN ADJUSTMENT (+) & REWARDS
    // Bright, crystal-clear bell chime (B5 -> E6)
    coin() {
      bellTone(987.77, 0, 0.28, { vol: 0.15 });
      bellTone(1318.51, 0.065, 0.38, { vol: 0.16 });
    },
    // Ascending celebratory chime for + coin adjustment
    plus() {
      bellTone(783.99, 0, 0.22, { vol: 0.12 });
      bellTone(987.77, 0.07, 0.25, { vol: 0.14 });
      bellTone(1318.51, 0.14, 0.38, { vol: 0.16 });
    },
    // COIN ADJUSTMENT (-) & DEDUCTIONS
    // Gentle, soft descending chime (warm, clear, non-abrasive)
    minus() {
      tone(392.00, 0, 0.14, { type: 'sine', vol: 0.12 });
      tone(329.63, 0.09, 0.16, { type: 'sine', vol: 0.11 });
      tone(261.63, 0.18, 0.22, { type: 'sine', vol: 0.10 });
    },

    // GAME EFFECTS
    // Right answer in games / quizzes: uplifting major chord arpeggio
    correct() {
      tone(523.25, 0, 0.11, { type: 'sine', vol: 0.10 });
      tone(659.25, 0.055, 0.12, { type: 'sine', vol: 0.11 });
      tone(783.99, 0.11, 0.14, { type: 'sine', vol: 0.12 });
      bellTone(1046.50, 0.17, 0.32, { vol: 0.14 });
    },
    // Wrong answer / trap in games: gentle double low thud (informative, not piercing)
    wrong() {
      tone(220, 0, 0.13, { type: 'triangle', vol: 0.11, slide: -25 });
      tone(174.6, 0.11, 0.18, { type: 'triangle', vol: 0.10, slide: -20 });
    },
    // Box opening pop (clean, tactile wooden/bubble pop)
    pop() {
      tone(320, 0, 0.08, { type: 'sine', vol: 0.16, slide: 460 });
      noise(0, 0.035, { vol: 0.07, freq: 2200, q: 2 });
    },
    // Box hover / shake rattle
    rattle() {
      for (let i = 0; i < 4; i++) {
        noise(i * 0.05, 0.035, { vol: 0.06, freq: 1500 + i * 150, q: 3.5 });
      }
    },
    // Star power-up: magical sparkling twinkle
    star() {
      [1046.5, 1318.5, 1567.98, 2093.0, 2637.0].forEach((f, i) => {
        tone(f, i * 0.045, 0.16, { type: 'sine', vol: 0.06 });
      });
    },
    // Bomb power-up: deep, warm muffled thud
    boom() {
      tone(85, 0, 0.35, { type: 'sine', vol: 0.20, slide: -40 });
      noise(0, 0.35, { vol: 0.22, freq: 400, type: 'lowpass', sweep: -250 });
    },
    // Swap / Steal power-up: smooth filtered wind sweep
    whoosh() {
      noise(0, 0.28, { vol: 0.16, freq: 350, q: 1.2, sweep: 2000 });
    },
    // Rocket power-up: ascending propulsion soar
    rocket() {
      tone(160, 0, 0.55, { type: 'sine', vol: 0.11, slide: 700 });
      noise(0, 0.48, { vol: 0.13, freq: 300, q: 1, sweep: 2200 });
    },
    // Shop purchase / Pokémon catch: iconic victory jingle
    purchase() {
      bellTone(783.99, 0, 0.15, { vol: 0.13 });
      bellTone(987.77, 0.08, 0.16, { vol: 0.14 });
      bellTone(1174.66, 0.16, 0.18, { vol: 0.15 });
      bellTone(1567.98, 0.24, 0.42, { vol: 0.16 });
    },
    // Game victory / championship fanfare: triumphant melodic fanfare
    fanfare() {
      [
        [523.25, 0, 0.14],
        [523.25, 0.12, 0.14],
        [523.25, 0.24, 0.14],
        [659.25, 0.36, 0.22],
        [783.99, 0.58, 0.16],
        [659.25, 0.74, 0.16],
        [1046.50, 0.90, 0.55]
      ].forEach(([f, t, dur]) => {
        tone(f, t, dur, { type: dur > 0.3 ? 'triangle' : 'sine', vol: 0.12 });
      });
    },
    victory() {
      S.fanfare();
    },

    // BATTLE ARENA
    vs() {
      tone(130, 0, 0.4, { type: 'sawtooth', vol: 0.08, slide: -40 });
      tone(260, 0.04, 0.35, { type: 'sine', vol: 0.08 });
      noise(0, 0.2, { vol: 0.18, freq: 2200, q: 0.8 });
    },
    lunge() {
      noise(0, 0.15, { vol: 0.14, freq: 650, q: 1.2, sweep: 1800 });
    },
    faint() {
      tone(520, 0, 0.75, { type: 'sine', vol: 0.11, slide: -380 });
    },
    superEff() {
      bellTone(880, 0, 0.18, { vol: 0.13 });
      bellTone(1175, 0.06, 0.20, { vol: 0.14 });
      bellTone(1760, 0.12, 0.35, { vol: 0.15 });
    },
    hit(type) {
      const t = String(type || 'normal').toLowerCase();
      if (t === 'electric') {
        for (let i = 0; i < 3; i++) noise(i * 0.04, 0.04, { vol: 0.16, freq: 3500, q: 2 });
        tone(1200, 0, 0.16, { type: 'sawtooth', vol: 0.04, slide: -700 });
      } else if (t === 'fire') {
        noise(0, 0.32, { vol: 0.22, freq: 800, type: 'lowpass', sweep: -500 });
      } else if (t === 'water' || t === 'ice') {
        noise(0, 0.25, { vol: 0.18, freq: 2200, q: 0.7, sweep: -1500 });
        tone(1400, 0.02, 0.12, { vol: 0.05, slide: 500 });
      } else if (t === 'rock' || t === 'ground' || t === 'steel' || t === 'fighting') {
        noise(0, 0.22, { vol: 0.25, freq: 260, type: 'lowpass' });
        tone(80, 0, 0.2, { vol: 0.18, slide: -30 });
      } else {
        noise(0, 0.12, { vol: 0.22, freq: 1200, q: 0.7 });
        tone(140, 0, 0.12, { vol: 0.14, slide: -40 });
      }
    }
  };

  function play(name, arg) {
    if (muted || !S[name]) return;
    const now = performance.now();
    // 200ms debounce prevents double/triple triggering
    if (last[name] && now - last[name] < 200) return;
    last[name] = now;
    try { S[name](arg); } catch (e) {}
  }

  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
    try { if (window.gameSoundState) window.gameSoundState.muted = muted; } catch (e) {}
    document.querySelectorAll('.sfx-toggle').forEach(b => {
      b.textContent = muted ? '🔇' : '🔊';
      b.setAttribute('aria-label', muted ? 'Turn sounds on' : 'Turn sounds off');
      b.setAttribute('aria-pressed', String(!muted));
    });
  }

  window.pokeSfx = { play, setMuted, isMuted: () => muted };

  // Floating mute button (if present)
  function mountToggle() {
    if (document.querySelector('.sfx-toggle')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sfx-toggle';
    b.dataset.sfx = 'none';
    b.addEventListener('click', () => { setMuted(!muted); });
    document.body.appendChild(b);
    setMuted(muted);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountToggle); else mountToggle();

  // Delegated click sounds - strictly restricted to games, shop actions, and explicit game triggers
  document.addEventListener('click', e => {
    const el = e.target.closest('button, [role="button"], a, .baam-giftbox, .shop-pokemon-card');
    if (!el || el.disabled) return;

    const hint = el.dataset.sfx;
    if (hint === 'none' || hint === 'click' || hint === 'tab') return;
    if (hint && S[hint]) return play(hint);

    // Box game shake sound
    if (el.matches('.baam-giftbox')) return play('rattle');

    const txt = (el.textContent || '').trim().toLowerCase();
    const id = el.id || '';

    // Only in active games: check for correct / wrong answer clicks
    const inGame = el.closest('.game-popup-modal, .memory-game-shell, .hangman-game-shell, .cipher-lab-shell, .surprise-boxes-game, .arena-actions, #battle-area, #listen-catch-root');
    if (inGame) {
      if (/correct|baam-correct/.test(id) || /^✓/.test(txt)) return play('correct');
      if (/wrong/.test(id) || /^✕/.test(txt)) return play('wrong');
    }

    // Shop / Catchdex purchase click
    if (el.closest('#profile-tab-shop, #tab-shop, .shop-toolbar, .pokemon-details-dialog') && /buy|catch|unlock/.test(txt) && !/cancel/.test(txt)) {
      return play('purchase');
    }

    // All normal buttons, tabs, links, dialog controls are SILENT
  }, true);

  // Celebration overlays for game completions
  const seen = new WeakSet();
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (!(n instanceof HTMLElement) || seen.has(n)) continue;
      // Only play fanfare for actual game finish overlays, not coin adjustments
      if (n.matches('.game-celebration-overlay') && !n.matches('.coin-celebration-overlay')) {
        seen.add(n);
        play(n.querySelector('.single-player-timeout-overlay, .hangman-game-over-overlay') ? 'wrong' : 'fanfare');
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();