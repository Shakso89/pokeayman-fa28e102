// Arcade games hub, lobby helpers and 3-2-1 countdown. Only presentation; game logic stays in index.html.
(function () {
  const GAMES = [
    { fn: 'chooseBaamboozlePowerUps', icon: '🎁', name: 'Surprise Boxes', desc: 'Open mystery boxes full of power-ups, traps and score swaps.', tags: ['1–4 players', 'Class favourite'], accent: 'pink', teacherOnly: true },
    { fn: 'chooseMatchWordCount', icon: '🎯', name: 'Match Words', desc: 'Race to match each word with its picture.', tags: ['1–4 players', 'Fast reflexes'], accent: 'red' },
    { fn: 'chooseMemoryDifficulty', icon: '🧠', name: 'Memory Flip', desc: 'Flip the tiles and find the matching pairs.', tags: ['1–4 players', 'Focus'], accent: 'violet' },
    { fn: 'chooseScrambleWordCount', icon: '🔤', name: 'Unscramble', desc: 'Put the mixed-up letters back in order.', tags: ['1–4 players', 'Spelling'], accent: 'blue' },
    { fn: 'chooseHangmanWordCount', icon: '🎮', name: 'Hangman', desc: 'Guess the secret word letter by letter.', tags: ['1–4 players', 'Classic'], accent: 'yellow' },
    { fn: 'chooseFindMeScore', icon: '🕵️', name: 'Find Me', desc: 'Spot the right word as fast as you can.', tags: ['1–4 players', 'Quick recall'], accent: 'mint' },
    { fn: 'startListenCatch', icon: '🔊', name: 'Listen and Catch', desc: 'Hear a word, catch the right answer, and fill your Catchdex.', tags: ['Solo', 'Listening'], accent: 'violet', proOnly: true },
    { fn: 'startVocabBattle', icon: '⚔️', name: 'Poké Battle', desc: 'Defeat a wild Pokémon and send its reward to your teacher for approval.', tags: ['Solo', 'Teacher-approved reward'], accent: 'red', proOnly: true },
  ];
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const THEME_STORAGE_KEY = 'pokeayman-game-theme';
  const GAME_THEMES = [
    {
      id: 'classroom',
      name: 'Classroom',
      subtitle: 'Chalkboard & wood',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="120" height="82" fill="#e6cfa8"/>
        <rect y="68" width="120" height="14" fill="#c59b68"/>
        <path d="M0 6 L12 18 L22 6 Z" fill="#e07a5f"/><path d="M22 6 L34 16 L44 6 Z" fill="#f2cc8f"/><path d="M44 6 L54 14 L62 6 Z" fill="#81b29a"/>
        <line x1="94" y1="0" x2="94" y2="18" stroke="#8c6d46" stroke-width="1"/><circle cx="94" cy="18" r="5" fill="#f4a261"/>
        <line x1="108" y1="0" x2="108" y2="24" stroke="#8c6d46" stroke-width="1"/><circle cx="108" cy="24" r="3.5" fill="#7c9a82"/>
        <rect x="14" y="14" width="92" height="50" rx="4" fill="#29523a" stroke="#b07d4f" stroke-width="3.5"/>
        <rect x="23" y="27" width="21" height="21" rx="3.5" fill="#e9c46a" stroke="#3d352e" stroke-width="1.8"/>
        <text x="33.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1f2421">a</text>
        <rect x="49.5" y="27" width="21" height="21" rx="3.5" fill="#a5978b" stroke="#3d352e" stroke-width="1.8"/>
        <text x="60" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1f2421">b</text>
        <rect x="76" y="27" width="21" height="21" rx="3.5" fill="#e9c46a" stroke="#3d352e" stroke-width="1.8"/>
        <text x="86.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1f2421">c</text>
        <rect x="26" y="53" width="68" height="7" rx="2" fill="#ffffff" stroke="#3d352e" stroke-width="1.2"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-cls-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ecdbb9"/>
            <stop offset="78%" stop-color="#d8be92"/>
            <stop offset="100%" stop-color="#c8a878"/>
          </linearGradient>
          <radialGradient id="ga-cls-sun" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#ecdbb9" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-cls-wall)"/>
        <rect width="1440" height="900" fill="url(#ga-cls-sun)"/>
        <rect y="790" width="1440" height="18" fill="#b3834f" opacity="0.7"/>
        <rect y="808" width="1440" height="92" fill="#c49a65"/>
        <path d="M-10 18 Q190 95 420 -10" fill="none" stroke="#9c7a54" stroke-width="3" opacity="0.65"/>
        <polygon points="24,30 62,102 98,48" fill="#d97757" opacity="0.82"/>
        <polygon points="118,52 152,118 188,58" fill="#e9b44c" opacity="0.82"/>
        <polygon points="208,58 240,116 272,54" fill="#7c9a82" opacity="0.82"/>
        <polygon points="292,50 322,102 350,34" fill="#d97757" opacity="0.78"/>
        <g opacity="0.85">
          <rect x="28" y="210" width="210" height="150" rx="8" fill="#f3e5c8" stroke="#c29562" stroke-width="6"/>
          <path d="M48 250 Q78 232 104 256 Q92 292 62 286 Z" fill="#84a98c" opacity="0.75"/>
          <path d="M126 242 Q168 230 198 258 Q210 296 172 322 Q138 304 126 242 Z" fill="#74a892" opacity="0.75"/>
          <circle cx="88" cy="316" r="18" fill="#e59866" opacity="0.65"/>
        </g>
        <g opacity="0.88">
          <rect x="1180" y="190" width="220" height="230" rx="8" fill="#c99b68" stroke="#a47545" stroke-width="6"/>
          <rect x="1202" y="214" width="56" height="62" rx="3" fill="#f472b6" transform="rotate(-4 1230 245)"/>
          <rect x="1276" y="218" width="58" height="62" rx="3" fill="#facc15" transform="rotate(3 1305 249)"/>
          <rect x="1210" y="296" width="60" height="62" rx="3" fill="#60a5fa" transform="rotate(2 1240 327)"/>
          <rect x="1288" y="294" width="58" height="62" rx="3" fill="#a78bfa" transform="rotate(-3 1317 325)"/>
        </g>
        <g opacity="0.9">
          <line x1="1040" y1="0" x2="1040" y2="118" stroke="#7c6244" stroke-width="2"/>
          <circle cx="1040" cy="118" r="15" fill="#7c9a82"/>
          <line x1="1120" y1="0" x2="1120" y2="175" stroke="#7c6244" stroke-width="2"/>
          <circle cx="1120" cy="175" r="34" fill="#f4a261"/>
          <circle cx="1110" cy="166" r="10" fill="#fde68a" opacity="0.55"/>
          <line x1="1210" y1="0" x2="1210" y2="96" stroke="#7c6244" stroke-width="2"/>
          <ellipse cx="1210" cy="96" rx="28" ry="8" fill="none" stroke="#d4a373" stroke-width="4" transform="rotate(-18 1210 96)"/>
          <circle cx="1210" cy="96" r="14" fill="#b5838d"/>
          <line x1="1290" y1="0" x2="1290" y2="150" stroke="#7c6244" stroke-width="2"/>
          <circle cx="1290" cy="150" r="18" fill="#6d9dc5"/>
        </g>
        <g opacity="0.88">
          <rect x="76" y="758" width="64" height="72" rx="8" fill="#b5654d"/>
          <line x1="108" y1="758" x2="108" y2="620" stroke="#6c584c" stroke-width="8" stroke-linecap="round"/>
          <line x1="108" y1="690" x2="72" y2="650" stroke="#6c584c" stroke-width="6" stroke-linecap="round"/>
          <line x1="108" y1="670" x2="146" y2="634" stroke="#6c584c" stroke-width="6" stroke-linecap="round"/>
          <circle cx="108" cy="610" r="24" fill="#7c9a82"/>
          <circle cx="70" cy="644" r="20" fill="#84a98c"/>
          <circle cx="148" cy="628" r="21" fill="#52796f"/>
          <circle cx="88" cy="692" r="16" fill="#95b89c"/>
          <circle cx="132" cy="684" r="16" fill="#7c9a82"/>
        </g>
        <g opacity="0.9">
          <circle cx="1175" cy="545" r="52" fill="#7ec8e3"/>
          <path d="M1145 520 Q1175 505 1198 532 Q1185 568 1152 558 Z" fill="#84a98c"/>
          <path d="M1135 588 A62 62 0 0 0 1215 498" fill="none" stroke="#8d6e63" stroke-width="8"/>
          <rect x="1150" y="606" width="50" height="14" rx="5" fill="#8d6e63"/>
          <rect x="1085" y="620" width="355" height="280" rx="8" fill="#d9cfc3" stroke="#bdb2a5" stroke-width="4"/>
        </g>
      </svg>`
    },
    {
      id: 'jungle',
      name: 'Jungle',
      subtitle: 'Temple & carved wood',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="120" height="82" fill="#123120"/>
        <path d="M0 0 Q30 22 14 48 L0 48 Z" fill="#1e4d32"/>
        <path d="M120 0 Q90 24 106 50 L120 50 Z" fill="#1e4d32"/>
        <rect y="68" width="120" height="14" fill="#2a1c11"/>
        <rect x="14" y="14" width="92" height="50" rx="5" fill="#1d432e" stroke="#c88a36" stroke-width="3.5"/>
        <rect x="23" y="27" width="21" height="21" rx="3.5" fill="#d99b52" stroke="#4a2808" stroke-width="1.8"/>
        <text x="33.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#2b1704">a</text>
        <rect x="49.5" y="27" width="21" height="21" rx="3.5" fill="#c68338" stroke="#4a2808" stroke-width="1.8"/>
        <text x="60" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#fffbeb">b</text>
        <rect x="76" y="27" width="21" height="21" rx="3.5" fill="#d99b52" stroke="#4a2808" stroke-width="1.8"/>
        <text x="86.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#2b1704">c</text>
        <rect x="26" y="53" width="68" height="7" rx="2" fill="#fdf3dc" stroke="#5c340e" stroke-width="1.2"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-jgl-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b2217"/>
            <stop offset="55%" stop-color="#153826"/>
            <stop offset="100%" stop-color="#0d2619"/>
          </linearGradient>
          <radialGradient id="ga-jgl-ray" cx="50%" cy="0%" r="75%">
            <stop offset="0%" stop-color="#fde68a" stop-opacity="0.28"/>
            <stop offset="60%" stop-color="#4ade80" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#0b2217" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-jgl-bg)"/>
        <rect width="1440" height="900" fill="url(#ga-jgl-ray)"/>
        <polygon points="360,0 540,0 780,900 480,900" fill="#fef08a" opacity="0.045"/>
        <polygon points="740,0 920,0 1180,900 880,900" fill="#fef08a" opacity="0.04"/>
        <rect x="0" y="80" width="95" height="820" fill="#1b2e23" opacity="0.7"/>
        <rect x="1345" y="80" width="95" height="820" fill="#1b2e23" opacity="0.7"/>
        <path d="M180 0 Q155 140 195 270 Q220 350 185 430" fill="none" stroke="#2d5a3c" stroke-width="7" stroke-linecap="round"/>
        <path d="M1260 0 Q1290 150 1245 290 Q1220 370 1255 460" fill="none" stroke="#2d5a3c" stroke-width="7" stroke-linecap="round"/>
        <path d="M0 0 Q190 30 280 160 Q140 180 0 110 Z" fill="#1f4e34"/>
        <path d="M0 90 Q160 140 210 290 Q95 280 0 210 Z" fill="#286443" opacity="0.85"/>
        <path d="M1440 0 Q1250 30 1160 160 Q1300 180 1440 110 Z" fill="#1f4e34"/>
        <path d="M1440 90 Q1280 140 1230 290 Q1345 280 1440 210 Z" fill="#286443" opacity="0.85"/>
        <path d="M0 900 Q80 710 240 680 Q180 810 120 900 Z" fill="#1b462f"/>
        <path d="M0 900 Q160 760 330 770 Q250 860 190 900 Z" fill="#2e6f4b"/>
        <path d="M1440 900 Q1360 710 1200 680 Q1260 810 1320 900 Z" fill="#1b462f"/>
        <path d="M1440 900 Q1280 760 1110 770 Q1190 860 1250 900 Z" fill="#2e6f4b"/>
        <circle cx="240" cy="480" r="4" fill="#fde047" opacity="0.8"/>
        <circle cx="160" cy="610" r="3" fill="#fde047" opacity="0.65"/>
        <circle cx="1210" cy="520" r="4" fill="#fde047" opacity="0.8"/>
        <circle cx="1290" cy="630" r="3.5" fill="#fde047" opacity="0.65"/>
      </svg>`
    },
    {
      id: 'toybox',
      name: 'Toybox',
      subtitle: '3D blocks & studio',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="120" height="82" fill="#1e1b4b"/>
        <circle cx="14" cy="16" r="8" fill="#f43f5e" opacity="0.85"/>
        <polygon points="106,8 115,22 97,22" fill="#38bdf8" opacity="0.85"/>
        <rect y="68" width="120" height="14" fill="#312e81"/>
        <rect x="14" y="14" width="92" height="50" rx="6" fill="#eef2ff" stroke="#6366f1" stroke-width="3.5"/>
        <rect x="23" y="27" width="21" height="21" rx="4.5" fill="#fb7185" stroke="#be123c" stroke-width="1.8"/>
        <text x="33.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#ffffff">a</text>
        <rect x="49.5" y="27" width="21" height="21" rx="4.5" fill="#facc15" stroke="#a16207" stroke-width="1.8"/>
        <text x="60" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1e1b4b">b</text>
        <rect x="76" y="27" width="21" height="21" rx="4.5" fill="#38bdf8" stroke="#0369a1" stroke-width="1.8"/>
        <text x="86.5" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#ffffff">c</text>
        <rect x="26" y="53" width="68" height="7" rx="3" fill="#ffffff" stroke="#818cf8" stroke-width="1.2"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-toy-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#17153b"/>
            <stop offset="50%" stop-color="#282368"/>
            <stop offset="100%" stop-color="#1b1747"/>
          </linearGradient>
          <radialGradient id="ga-toy-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#17153b" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-toy-bg)"/>
        <rect width="1440" height="900" fill="url(#ga-toy-glow)"/>
        <circle cx="140" cy="150" r="46" fill="#fb7185" opacity="0.28"/>
        <circle cx="130" cy="140" r="34" fill="#f43f5e" opacity="0.45"/>
        <rect x="86" y="340" width="68" height="68" rx="16" fill="#38bdf8" opacity="0.4" transform="rotate(-14 120 374)"/>
        <polygon points="150,560 205,650 95,650" fill="#facc15" opacity="0.42" transform="rotate(8 150 605)"/>
        <circle cx="1290" cy="170" r="48" fill="#a78bfa" opacity="0.35"/>
        <rect x="1245" y="360" width="74" height="74" rx="18" fill="#34d399" opacity="0.38" transform="rotate(16 1282 397)"/>
        <polygon points="1270,580 1330,675 1210,675" fill="#fb7185" opacity="0.4" transform="rotate(-10 1270 625)"/>
        <g opacity="0.7">
          <rect x="44" y="760" width="84" height="84" rx="14" fill="#f43f5e"/>
          <rect x="136" y="784" width="68" height="60" rx="12" fill="#facc15"/>
          <rect x="82" y="692" width="68" height="68" rx="12" fill="#38bdf8"/>
          <rect x="1308" y="760" width="84" height="84" rx="14" fill="#818cf8"/>
          <rect x="1230" y="784" width="68" height="60" rx="12" fill="#34d399"/>
          <rect x="1274" y="692" width="68" height="68" rx="12" fill="#fbbf24"/>
        </g>
      </svg>`
    },
    {
      id: 'classic',
      name: 'Classic',
      subtitle: 'Default arcade',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="120" height="82" fill="#0b1220"/>
        <g font-family="Outfit,sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">
          <rect x="14" y="8" width="28" height="20" rx="3" fill="#ef4444"/><text x="28" y="22">1</text>
          <rect x="46" y="8" width="28" height="20" rx="3" fill="#3b82f6"/><text x="60" y="22">2</text>
          <rect x="78" y="8" width="28" height="20" rx="3" fill="#8b5cf6"/><text x="92" y="22">3</text>
          <rect x="14" y="31" width="28" height="20" rx="3" fill="#ec4899"/><text x="28" y="45">4</text>
          <rect x="46" y="31" width="28" height="20" rx="3" fill="#f59e0b"/><text x="60" y="45">5</text>
          <rect x="78" y="31" width="28" height="20" rx="3" fill="#06b6d4"/><text x="92" y="45">6</text>
          <rect x="14" y="54" width="28" height="20" rx="3" fill="#dc2626"/><text x="28" y="68">7</text>
          <rect x="46" y="54" width="28" height="20" rx="3" fill="#6366f1"/><text x="60" y="68">8</text>
          <rect x="78" y="54" width="28" height="20" rx="3" fill="#10b981"/><text x="92" y="68">9</text>
        </g>
      </svg>`,
      backdropSvg: ''
    }
  ];

  window.gaThemes = GAME_THEMES;
  window.gaIsTeacherThemeEnabled = function () {
    return typeof currentRole === 'undefined' || currentRole !== 'student';
  };

  window.gaGetTheme = function () {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && GAME_THEMES.some(t => t.id === saved)) return saved;
    } catch (_) {}
    return 'classroom';
  };

  window.gaApplyThemeToStage = function (stage, themeId) {
    const target = stage || document.querySelector('body > .ga-stage');
    if (!window.gaIsTeacherThemeEnabled()) {
      if (target) {
        delete target.dataset.gaTheme;
        target.querySelector(':scope > .ga-theme-backdrop')?.remove();
      }
      delete document.body.dataset.gaActiveTheme;
      return;
    }
    const resolvedId = GAME_THEMES.some(t => t.id === themeId) ? themeId : window.gaGetTheme();
    const theme = GAME_THEMES.find(t => t.id === resolvedId) || GAME_THEMES[0];
    document.body.dataset.gaActiveTheme = theme.id;
    if (!target) return;
    target.dataset.gaTheme = theme.id;
    let backdrop = target.querySelector(':scope > .ga-theme-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'ga-theme-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      target.prepend(backdrop);
    }
    backdrop.innerHTML = theme.backdropSvg || '';
    backdrop.hidden = !theme.backdropSvg;
    target.querySelectorAll('[data-ga-theme-choice]').forEach(btn => {
      const active = btn.dataset.gaThemeChoice === theme.id;
      btn.classList.toggle('is-selected', active);
      btn.setAttribute('aria-checked', String(active));
    });
    const btnLabel = target.querySelector('.ga-stage-theme-current');
    if (btnLabel) btnLabel.textContent = theme.name;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  };

  window.gaSetTheme = function (themeId) {
    const theme = GAME_THEMES.find(t => t.id === themeId) || GAME_THEMES[0];
    try { localStorage.setItem(THEME_STORAGE_KEY, theme.id); } catch (_) {}
    document.querySelectorAll('.ga-theme-picker').forEach(picker => {
      const activeLabel = picker.querySelector('.ga-theme-active-label');
      if (activeLabel) activeLabel.textContent = `${theme.name} · ${theme.subtitle}`;
      picker.querySelectorAll('[data-ga-theme-choice]').forEach(btn => {
        const active = btn.dataset.gaThemeChoice === theme.id;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-checked', String(active));
      });
    });
    document.querySelectorAll('body > .ga-stage').forEach(stage => window.gaApplyThemeToStage(stage, theme.id));
  };

  function renderThemeCardsMarkup(selectedId) {
    return GAME_THEMES.map(theme => {
      const active = theme.id === selectedId;
      return `<button type="button" class="ga-theme-card${active ? ' is-selected' : ''}" role="radio" aria-checked="${active}" data-ga-theme-choice="${esc(theme.id)}" title="${esc(theme.name)} — ${esc(theme.subtitle)}">
        <span class="ga-theme-thumb">${theme.thumbSvg}</span>
        <span class="ga-theme-meta">
          <strong class="ga-theme-name">${esc(theme.name)}</strong>
          <small class="ga-theme-sub">${esc(theme.subtitle)}</small>
        </span>
      </button>`;
    }).join('');
  }

  window.pendingChosenGame = null;
  window.arcadeOpen = true;

  window.gaBackToArcade = function () {
    window.arcadeOpen = true;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaShowListSelection = function (game) {
    if (game) window.pendingChosenGame = game;
    window.arcadeOpen = false;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.selectGameToPlay = function (fnName) {
    const g = GAMES.find(item => item.fn === fnName);
    if (!g) return;
    const locked = Boolean(g.proOnly && !window.canUseProGames?.());
    if (locked) {
      if (typeof window.requireProGame === 'function') window.requireProGame(g.name);
      else toast(g.name + ' requires Pro access');
      return;
    }
    window.pendingChosenGame = g;
    window.arcadeOpen = false;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaLaunchChosenGame = function (g, list) {
    if (!g) {
      if (GAMES[0]) g = GAMES[0];
      else return;
    }
    const locked = Boolean(g.proOnly && !window.canUseProGames?.());
    if (locked) {
      if (typeof window.requireProGame === 'function') window.requireProGame(g.name);
      else toast(g.name + ' requires Pro access');
      return;
    }
    if (g.fn === 'startVocabBattle') {
      window.startVocabBattle(list);
    } else if (g.fn === 'startListenCatch') {
      window.startListenCatch(list);
    } else {
      let fn = window[g.fn];
      if (typeof fn !== 'function') {
        try { fn = eval(g.fn); } catch (e) {}
      }
      if (typeof fn === 'function') {
        chooseGamePlayers(list, fn);
      } else {
        toast('Cannot launch ' + g.name);
      }
    }
  };

  window.gaRenderHub = function (listLabel, isTeacher) {
    const cards = GAMES.filter(g => !(isTeacher ? g.studentOnly : g.teacherOnly)).map(g => {
      const locked = Boolean(g.proOnly && !window.canUseProGames?.());
      const isProListen = g.fn === 'startListenCatch';
      const isProBattle = g.fn === 'startVocabBattle';
      const proCardClass = isProListen ? ' ga-pro ga-pro-listen' : (isProBattle ? ' ga-pro ga-pro-battle' : (g.proOnly ? ' ga-pro' : ''));
      const playText = locked ? (isTeacher ? 'Upgrade to Pro' : 'Locked for class') : 'Choose ▶';
      return `
      <button type="button" class="ga-cart ga-${g.accent}${proCardClass}${locked ? ' ga-pro-locked' : ''}" onclick="${locked ? `window.requireProGame('${esc(g.name)}')` : `window.selectGameToPlay('${g.fn}')`}" aria-disabled="${locked}" aria-label="${locked ? `${g.name}, Pro access required` : `Choose ${g.name}`}" ${locked ? 'title="Pro access required"' : ''}>
        <span class="ga-cart-art" aria-hidden="true"><span>${g.icon}</span></span>
        <span class="ga-cart-body">
          <span class="ga-cart-name">${esc(g.name)}${g.proOnly ? '<span class="ga-pro-badge">👑 PRO</span>' : ''}</span>
          <span class="ga-cart-desc">${esc(g.desc)}</span>
          <span class="ga-cart-tags">${g.tags.map(t => `<span>${esc(t)}</span>`).join('')}</span>
        </span>
        <span class="ga-cart-play">${playText}</span>
      </button>`;
    }).join('');
    return `<section class="ga-hub" aria-label="Game arcade">
      <header class="ga-hub-head">
        <div>
          <span class="ga-hub-kicker">STEP 1</span>
          <h2 class="arena-title text-xl sm:text-2xl font-black text-white">Choose a Game to Play</h2>
          <p class="text-xs text-amber-200/80 mt-1">Select any game below, then pick the vocabulary lists for the game content.</p>
        </div>
      </header>
      <div class="ga-grid" role="group" aria-label="Choose a vocabulary game">${cards}</div>
    </section>`;
  };

  window.gaStudentSetup = function (listName, fnName) {
    const game = GAMES.find(item => item.fn === fnName && !item.teacherOnly);
    if (!game) return;
    if (fnName === 'startVocabBattle') { window.startVocabBattle(listName); return; }
    if (fnName === 'startListenCatch') { window.startListenCatch(listName); return; }
    const pictured = fnName === 'chooseMatchWordCount' || fnName === 'chooseFindMeScore';
    const words = getGameWords(listName, true).filter(word => String(word.vocab_word || '').trim() && (!pictured || String(word.vocab_image || '').trim()));
    const area = document.getElementById('student-tab-games');
    if (!area) return;
    area.querySelectorAll(':scope > .game-inline-view').forEach(view => view.remove());
    const hub = area.querySelector(':scope > .glass-container');
    if (hub) hub.hidden = true;
    const panel = document.createElement('section');
    panel.className = 'game-inline-view ga-student-setup ga-hub';
    panel.setAttribute('aria-label', `${game.name} word count`);
    panel.innerHTML = `<header class="ga-hub-head"><h2>${game.icon} ${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header><div class="ga-student-counts" role="group" aria-label="Number of words">${[5, 10, 15].map(count => `<button type="button" class="btn-primary" data-count="${count}" ${words.length < count ? 'disabled' : ''}><strong>${count}</strong><span>words</span></button>`).join('')}</div>`;
    panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
    panel.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
      const count = Number(button.dataset.count);
      pendingGameTimerSeconds = 0;
      pendingGameReward = 0;
      activeGameReward = 0;
      resetGameTurnState();
      panel.remove();
      if (fnName === 'chooseMatchWordCount') openGameMatch(listName, count, 0);
      else if (fnName === 'chooseMemoryDifficulty') openGameMemory(listName, 'easy', 0, count);
      else if (fnName === 'chooseScrambleWordCount') { scrambleSession = null; openGameScramble(listName, count, 0); }
      else if (fnName === 'chooseFindMeScore') openGameFindMe(listName, count, 0);
      else if (fnName === 'chooseHangmanWordCount') openGameHangman(listName, count, 0, 'easy', true);
    }));
    area.appendChild(panel);
  };

  window.gaListStep = function (selector, container, count) {
    if (!selector || !container) return;
    const isArcade = Boolean(window.arcadeOpen);
    selector.hidden = isArcade;
    container.hidden = !isArcade;
    if (isArcade) return;

    selector.querySelectorAll('.ga-continue').forEach(el => el.remove());
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ga-continue';
    const gameName = window.pendingChosenGame ? window.pendingChosenGame.name : 'Game';
    next.disabled = !count;
    next.textContent = count ? `Next: Game Settings for ${gameName} ▶ (${count} list${count === 1 ? '' : 's'})` : `Choose a vocabulary list to play ${gameName} →`;
    next.addEventListener('click', () => {
      if (!selectedGameList.length) { toast('Please choose at least one vocabulary list'); return; }
      if (getGameWords(selectedGameList).length < 2) { toast('Choose lists with at least two words.'); return; }
      window.gaLaunchChosenGame(window.pendingChosenGame, selectedGameList);
    });
    selector.appendChild(next);
  };

  window.gaMountStage = function (view) {
    const board = view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters');
    if (!board || view.querySelector('#game-player-list') || view.classList.contains('ga-stage')) return;
    view.classList.add('ga-stage');
    const shell = view.matches('.game-popup-modal') ? view.firstElementChild : view.querySelector('.game-popup-modal > div, .memory-game-shell, .cipher-lab-shell, .hangman-game-shell') || view.firstElementChild;
    if (!shell) return;
    shell.classList.add('ga-stage-shell');
    let parent = shell.parentElement;
    while (parent && parent !== view) { parent.classList.add('ga-stage-wrapper'); parent = parent.parentElement; }
    const header = view.querySelector('.surprise-boxes-header, .memory-game-header, .cipher-lab-header, .hangman-game-shell > div:first-child, .sticky.top-0') || shell.firstElementChild;
    if (header) {
      header.classList.add('ga-stage-header');
      header.querySelector('[data-games-back]')?.remove();
      header.querySelectorAll('.game-fullscreen-btn').forEach(button => button.remove());
      const controls = document.createElement('div'); controls.className = 'ga-stage-controls';
      if (window.gaIsTeacherThemeEnabled()) {
        const currentThemeId = window.gaGetTheme();
        const currentThemeObj = GAME_THEMES.find(t => t.id === currentThemeId) || GAME_THEMES[0];
        const themeWrap = document.createElement('div');
        themeWrap.className = 'ga-stage-theme-wrap';
        themeWrap.innerHTML = `<button type="button" class="ga-stage-theme-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Change visual style" title="Change visual style"><span aria-hidden="true">🎨</span><span class="ga-stage-theme-current">${esc(currentThemeObj.name)}</span></button>
          <div class="ga-stage-theme-popover" role="dialog" aria-label="Visual style" hidden>
            <div class="ga-stage-theme-popover-head"><strong>Visual style</strong><span>Switch live</span></div>
            <div class="ga-theme-grid ga-theme-grid-compact" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(currentThemeId)}</div>
          </div>`;
        const trigger = themeWrap.querySelector('.ga-stage-theme-btn');
        const popover = themeWrap.querySelector('.ga-stage-theme-popover');
        const setPopoverOpen = open => {
          popover.hidden = !open;
          trigger.setAttribute('aria-expanded', String(open));
          themeWrap.classList.toggle('is-open', open);
        };
        trigger.addEventListener('click', event => {
          event.stopPropagation();
          setPopoverOpen(popover.hidden);
        });
        popover.addEventListener('click', event => {
          event.stopPropagation();
          const card = event.target.closest('[data-ga-theme-choice]');
          if (!card) return;
          window.gaSetTheme(card.dataset.gaThemeChoice);
        });
        view.addEventListener('click', event => {
          if (!popover.hidden && !themeWrap.contains(event.target)) setPopoverOpen(false);
        });
        controls.appendChild(themeWrap);
      }
      const sound = document.createElement('button'); sound.type = 'button'; sound.className = 'ga-stage-sound';
      const syncSound = () => { const muted = window.pokeSfx?.isMuted() || false; sound.textContent = muted ? '🔇' : '🔊'; sound.setAttribute('aria-label', muted ? 'Turn game sounds on' : 'Turn game sounds off'); sound.title = sound.getAttribute('aria-label'); };
      syncSound(); sound.addEventListener('click', () => {
        window.pokeSfx?.setMuted(!window.pokeSfx.isMuted());
        if (typeof gameSoundState !== 'undefined') gameSoundState.muted = window.pokeSfx?.isMuted() || false;
        const scramble = view.querySelector('#scramble-sound-mute');
        if (scramble && (scramble.textContent.includes('🔇') !== Boolean(window.pokeSfx?.isMuted()))) scramble.click();
        syncSound();
      });
      const expand = document.createElement('button'); expand.type = 'button'; expand.textContent = '⛶'; expand.setAttribute('aria-label', 'Expand to browser fullscreen'); expand.title = 'Browser fullscreen';
      expand.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await view.requestFullscreen(); } catch (_) {} });
      const close = view.querySelector('#baam-close, #find-me-close, #game-close, #scramble-close, #hangman-close') || document.createElement('button');
      close.type = 'button'; close.textContent = '×'; close.classList.add('ga-stage-exit'); close.setAttribute('aria-label', 'Close game'); close.title = 'Close game';
      close.addEventListener('click', event => { event.preventDefault(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); endActiveGames(); });
      controls.append(sound, expand, close); header.appendChild(controls);
      header.querySelectorAll('.game-sound-controls, #scramble-sound-mute').forEach(node => { node.hidden = true; });
    }
    document.body.appendChild(view);
    document.body.classList.add('ga-playing');
    window.gaApplyThemeToStage(view, window.gaGetTheme());
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Vocabulary game');
    requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); view.querySelector('.ga-stage-exit')?.focus({ preventScroll: true }); });
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector('.ga-stage')) {
      const openPopover = document.querySelector('.ga-stage .ga-stage-theme-popover:not([hidden])');
      if (openPopover) {
        event.preventDefault();
        openPopover.hidden = true;
        const wrap = openPopover.closest('.ga-stage-theme-wrap');
        wrap?.classList.remove('is-open');
        wrap?.querySelector('.ga-stage-theme-btn')?.setAttribute('aria-expanded', 'false');
        return;
      }
      event.preventDefault();
      endActiveGames();
    }
  });
  const observeStages = () => new MutationObserver(() => {
    document.querySelectorAll('#class-subtab-games > .game-inline-view, #student-tab-games > .game-inline-view').forEach(view => window.gaMountStage(view));
    document.querySelectorAll('body > .ga-stage').forEach(view => { if (!view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters')) view.remove(); });
    if (!document.querySelector('.ga-stage') && document.body.classList.contains('ga-playing')) {
      document.body.classList.remove('ga-playing');
      delete document.body.dataset.gaActiveTheme;
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.querySelectorAll('#class-subtab-games > .glass-container, #student-tab-games > .glass-container').forEach(hub => { hub.hidden = false; });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (document.body) observeStages(); else document.addEventListener('DOMContentLoaded', observeStages, { once: true });

  window.gaEnhanceLobby = function (modal, fnName, refresh) {
    if (modal.classList.contains('ga-lobby')) return;
    const game = GAMES.find(g => g.fn === fnName);
    modal.classList.add('ga-lobby');
    const h2 = modal.querySelector('h2');
    if (h2 && game) h2.innerHTML = `<span class="ga-lobby-icon" aria-hidden="true">${game.icon}</span> ${esc(game.name)}`;
    const p = h2?.nextElementSibling;
    if (p && game) p.textContent = 'Round setup';
    const list = modal.querySelector('#game-player-list');
    if (!list) return;
    const checks = [...list.querySelectorAll('.game-player-check')];
    const root = list.parentElement;
    const next = modal.querySelector('#game-players-next');
    const cancel = modal.querySelector('#game-players-cancel');
    const error = modal.querySelector('#game-player-error');
    const requiresTwoPlayers = fnName === 'chooseBaamboozlePowerUps';
    const footer = next?.parentElement;
    if (!root || !footer) return;
    const players = document.createElement('section');
    players.className = 'ga-players-section';
    const bar = document.createElement('div');
    bar.className = 'ga-quick';
    bar.innerHTML = `<div class="ga-player-heading"><h3>Players</h3><span class="ga-player-count" aria-live="polite">0 / 4 selected</span></div>
      <div class="ga-pick-tools"><select aria-label="Random player count">${[1, 2, 3, 4].filter(n => n <= checks.length).map(n => `<option value="${n}" ${n === Math.min(2, checks.length) ? 'selected' : ''}>Random ${n}</option>`).join('')}</select><button type="button" data-q="random" aria-label="Pick random players" title="Pick random players">⤨</button><button type="button" data-q="clear" aria-label="Clear players" title="Clear players">×</button></div>`;
    const update = () => {
      const count = checks.filter(c => c.checked).length;
      bar.querySelector('.ga-player-count').textContent = `${count} / 4 selected · ${checks.length} in class`;
      if (next) next.textContent = count ? `Start game · ${count} player${count === 1 ? '' : 's'} →` : 'Start game →';
      if (requiresTwoPlayers) {
        const blocked = count < 2;
        if (next) {
          next.disabled = blocked;
          next.setAttribute('aria-disabled', String(blocked));
        }
        if (error) {
          error.textContent = blocked ? 'Surprise Boxes needs at least 2 students to start.' : '';
          error.classList.toggle('hidden', !blocked);
        }
      }
    };
    const set = picks => { checks.forEach(c => { c.disabled = false; c.checked = picks.includes(c); }); refresh?.(); update(); };
    bar.addEventListener('click', e => {
      const q = e.target.closest('button')?.dataset.q; if (!q) return;
      const shuffled = [...checks];
      for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      set(q === 'random' ? shuffled.slice(0, Number(bar.querySelector('select').value)) : []);
    });
    list.before(players);
    players.append(bar, list);
    checks.forEach(c => c.addEventListener('change', update));
    const settings = modal.querySelector('.game-settings-grid');
    const options = document.createElement('details');
    options.className = 'ga-round-options';
    options.innerHTML = '<summary><span>Timer & rewards</span><span class="ga-options-summary"></span></summary><div class="ga-options-body"></div>';
    if (settings) {
      settings.classList.add('ga-core-settings');
      settings.querySelectorAll('.game-setting-control').forEach(control => {
        if (!control.querySelector('#shared-winning-score')) options.querySelector('.ga-options-body').appendChild(control);
      });
      if (!settings.children.length) settings.remove();
    }
    // Card count and timer are separate segmented controls, never competing selections.
    modal.querySelectorAll('.shared-baam-count').forEach(button => button.classList.remove('game-timer-option'));
    [...root.children].forEach(el => {
      if (el.querySelector('.memory-level-option, .match-word-count-option, .shared-baam-count') || el === settings) el.classList.add('ga-round-setting');
    });
    if (window.gaIsTeacherThemeEnabled()) {
      const selectedThemeId = window.gaGetTheme();
      const selectedTheme = GAME_THEMES.find(t => t.id === selectedThemeId) || GAME_THEMES[0];
      const themeSection = document.createElement('section');
      themeSection.className = 'ga-theme-picker ga-round-setting';
      themeSection.setAttribute('aria-label', 'Visual style');
      themeSection.innerHTML = `<div class="ga-theme-picker-head">
        <h3>Visual style</h3>
        <span class="ga-theme-active-label" aria-live="polite">${esc(selectedTheme.name)} · ${esc(selectedTheme.subtitle)}</span>
      </div>
      <div class="ga-theme-grid" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(selectedTheme.id)}</div>`;
      themeSection.addEventListener('click', event => {
        const card = event.target.closest('[data-ga-theme-choice]');
        if (!card) return;
        window.gaSetTheme(card.dataset.gaThemeChoice);
      });
      footer.before(themeSection);
    }
    if (options.querySelector('.ga-options-body').children.length) footer.before(options);
    const updateOptions = () => {
      const seconds = Number(modal.querySelector('.game-timer-option.is-selected')?.dataset.seconds || 0);
      const reward = Number(modal.querySelector('.game-reward-option.is-selected')?.dataset.reward || 0);
      options.querySelector('.ga-options-summary').textContent = `${seconds ? `${seconds / 60} min` : 'No timer'} · ${reward ? `${reward} coins` : 'No reward'}`;
    };
    modal.addEventListener('click', () => queueMicrotask(updateOptions));
    updateOptions();
    footer.classList.add('ga-lobby-footer');
    if (cancel) { cancel.textContent = '← Games'; footer.prepend(cancel); }
    error?.setAttribute('role', 'alert');
    update();
  };

  window.gaCountdown = function (players, firstIndex, start, avatar) {
    const sfx = window.pokeSfx;
    const ov = document.createElement('div');
    ov.className = 'ga-countdown';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-live', 'assertive');
    const first = players[firstIndex];
    ov.innerHTML = `<div class="ga-cd-stage">
      <div class="ga-cd-players">${players.map((pl, i) => `<div class="ga-cd-player ${i === firstIndex ? 'is-first' : ''}" style="--i:${i}">${avatar(pl, 'ga-cd-avatar')}<span>${esc(pl.student_name)}</span></div>`).join('<b class="ga-cd-vs">VS</b>')}</div>
      <p class="ga-cd-first">${esc(first.student_name)} goes first!</p>
      <div class="ga-cd-num" aria-label="Countdown">3</div>
      <button type="button" class="ga-cd-skip">Skip</button></div>`;
    document.body.appendChild(ov);
    const num = ov.querySelector('.ga-cd-num');
    let n = 3, done = false;
    const finish = () => { if (done) return; done = true; clearInterval(t); ov.remove(); start(); };
    sfx?.play('vs');
    const t = setInterval(() => {
      n -= 1;
      if (n > 0) { num.textContent = n; sfx?.play('click'); }
      else if (n === 0) { num.textContent = 'GO!'; num.classList.add('is-go'); sfx?.play('fanfare'); }
      else finish();
      num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    }, 850);
    ov.querySelector('.ga-cd-skip').addEventListener('click', finish);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(finish, 900);
  };
})();
