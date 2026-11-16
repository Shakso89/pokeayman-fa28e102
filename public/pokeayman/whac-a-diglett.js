/* Whac-A-Diglett Arcade Mini-Game */
(() => {
  'use strict';

  const esc = (v) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[c])
    );

  window.chooseWhacADiglett = function (listName) {
    // Early background pre-cache of authentic Gemini voices while picking players/options
    const allWords = typeof getGameWords === 'function' ? getGameWords(listName, false) : [];
    if (allWords && allWords.length) {
      const prefetchFn = window.pokeaymanPrefetchVoices || window.parent?.pokeaymanPrefetchVoices || window.pokeaymanAudioCache?.prefetchVocabularySpeechList || window.parent?.pokeaymanAudioCache?.prefetchVocabularySpeechList;
      if (typeof prefetchFn === 'function') {
        const rawLvl = (typeof window.getClassReadingLevel === 'function'
          ? window.getClassReadingLevel(typeof currentRole !== 'undefined' && currentRole === 'student' ? currentStudentSchool : navSchool, typeof currentRole !== 'undefined' && currentRole === 'student' ? currentStudentClass : navClass)
          : 'P4') || 'P4';
        const resolvedLvl = typeof toReadingLevelCode === 'function' ? toReadingLevelCode(rawLvl) : (/^P[1-6]$/.test(rawLvl) ? rawLvl : 'P4');
        prefetchFn(allWords, resolvedLvl).catch(() => {});
      }
    }
    if (typeof currentRole !== 'undefined' && currentRole === 'student') {
      if (typeof window.gaStudentSetup === 'function') {
        window.gaStudentSetup(listName, 'chooseWhacADiglett');
        return;
      }
    }
    if (typeof chooseGamePlayers === 'function') {
      chooseGamePlayers(listName, window.chooseWhacADiglett);
    }
  };

  window.openGameWhacADiglett = function (listName, targetScore = 10, timerSeconds = 0) {
    const allWords = typeof getGameWords === 'function' ? getGameWords(listName, false) : [];
    if (!allWords || allWords.length < 2) {
      if (typeof toast === 'function') {
        toast('Whac-A-Diglett needs a vocabulary list with at least 2 words.');
      }
      return;
    }

    // Set up players
    if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) {
      const student = (typeof currentStudent !== 'undefined' ? (typeof getAllStudents === 'function' ? getAllStudents().find(s => s.student_name === currentStudent) : null) : null) || { student_name: 'Player', avatar_pokemon_id: 25 };
      activeGamePlayers = [student, window.createRobotPlayer?.(window.selectedBotDifficulty || 'normal') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }];
    } else if (activeGamePlayers.length === 1) {
      activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'normal') || { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 });
    }

    if (!Array.isArray(activeGameScores) || activeGameScores.length !== activeGamePlayers.length) {
      activeGameScores = activeGamePlayers.map(() => 0);
    }
    activeGamePlayerIndex = 0;

    if (typeof setGameReplay === 'function') {
      setGameReplay(() => {
        if (typeof resetGameTurnState === 'function') resetGameTurnState();
        window.openGameWhacADiglett(listName, targetScore, timerSeconds);
      });
    }

    const winningScore = Math.max(3, Number(targetScore) || 10);
    const numHoles = 6;
    let currentTargetWord = null;
    let roundActive = true;
    let comboStreak = 0;
    let waveTimer = null;
    let botTimer = null;
    let currentActiveHoles = [];

    // Themes setup
    const themes = [
      { id: 'classroom', name: 'Classroom', subtitle: 'Poké Academy & chalkboard' },
      { id: 'jungle', name: 'Jungle', subtitle: 'Emerald moss & vines' },
      { id: 'toybox', name: 'Toybox', subtitle: 'Vibrant blocks & play' },
      { id: 'halloween', name: 'Halloween', subtitle: 'Spooky dusk & shadows' },
      { id: 'classic', name: 'Classic', subtitle: 'Arcade neon' }
    ];
    const initialThemeId = (typeof window.gaGetTheme === 'function' ? window.gaGetTheme() : 'classroom') || 'classroom';
    const initialThemeObj = themes.find((t) => t.id === initialThemeId) || themes[0];

    const themeGridHtml = typeof window.renderThemeCardsMarkup === 'function'
      ? window.renderThemeCardsMarkup(initialThemeObj.id)
      : themes.map(t => `
          <button type="button" class="ga-theme-card ${t.id === initialThemeObj.id ? 'is-selected' : ''}" data-ga-theme-choice="${t.id}" role="radio" aria-checked="${t.id === initialThemeObj.id}">
            <div class="ga-theme-card-thumb"><span class="text-lg">🎨</span></div>
            <div class="ga-theme-card-info">
              <strong class="ga-theme-card-name">${esc(t.name)}</strong>
              <small class="ga-theme-card-sub">${esc(t.subtitle)}</small>
            </div>
          </button>
        `).join('');

    const p1 = activeGamePlayers[0] || { student_name: 'Player 1', avatar_pokemon_id: 25 };
    const p2 = activeGamePlayers[1] || { student_name: 'Robot', avatar_pokemon_id: 137, isBot: true };
    const p1Name = p1.student_name || 'Player 1';
    const p2Name = p2.student_name || (p2.isBot ? 'Robot' : 'Player 2');
    const p1Avatar = p1.avatar_url || `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p1.avatar_pokemon_id || 25}.png`;
    const p2Avatar = p2.avatar_url || `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p2.avatar_pokemon_id || (p2.isBot ? 137 : 133)}.png`;

    // Create Modal
    const modal = document.createElement('div');
    modal.className = 'whac-game-modal game-popup-modal ga-stage';
    modal.dataset.game = 'whac-a-diglett';
    modal.dataset.gaTheme = initialThemeObj.id;
    modal.setAttribute('data-ga-theme', initialThemeObj.id);

    modal.innerHTML = `
      <!-- 1. Header Bar: Title, Theme Selector & Stage Controls -->
      <header class="whac-header ga-stage-header">
        <div class="whac-header-title">
          <img src="/pokeayman/assets/games/whac-a-diglett.jpg" alt="" class="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50 shadow-md">
          <div>
            <h2>Whac-A-Diglett</h2>
            <p class="text-[11px] text-amber-300 font-semibold">Target: First to ${winningScore} points</p>
          </div>
        </div>

        <div class="whac-header-controls">
          <!-- In-Game Visual Style / Theme Selector -->
          <div class="ga-stage-theme-wrap" id="whac-theme-wrap">
            <button type="button" class="ga-stage-theme-btn" id="whac-theme-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Change visual style" title="Change visual style">
              <span aria-hidden="true">🎨</span>
              <span class="ga-stage-theme-current">${esc(initialThemeObj.name)}</span>
            </button>
            <div class="ga-stage-theme-popover" id="whac-theme-popover" role="dialog" aria-label="Visual style" hidden>
              <div class="ga-stage-theme-popover-head"><strong>Visual style</strong><span>Switch live</span></div>
              <div class="ga-theme-grid ga-theme-grid-compact" role="radiogroup" aria-label="Choose visual style">
                ${themeGridHtml}
              </div>
            </div>
          </div>

          <button type="button" class="ga-stage-sound" id="whac-sound-toggle" title="Toggle sound" aria-label="Toggle sound"></button>
          <button type="button" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center text-sm font-bold cursor-pointer" id="whac-fullscreen-btn" title="Toggle fullscreen">⛶</button>
          <button type="button" class="ga-stage-exit w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center justify-center text-base font-bold cursor-pointer" id="whac-close-btn" title="Exit game" aria-label="Close game">×</button>
        </div>
      </header>

      <div class="whac-game-shell ga-stage-shell">
        <!-- 2. Dedicated Duelists Score HUD (Guaranteed High Contrast, Never White-on-White) -->
        <div class="whac-duel-hud">
          <div class="whac-player-badge p1 ${activeGamePlayerIndex === 0 ? 'is-active' : ''}" id="whac-p1-badge">
            <img src="${p1Avatar}" class="whac-player-avatar" alt="${esc(p1Name)}">
            <div class="whac-player-info">
              <span class="whac-player-name">${esc(p1Name)}</span>
              <span class="whac-player-turn-pill" id="whac-p1-turn">${activeGamePlayerIndex === 0 ? 'TURN' : ''}</span>
            </div>
            <span class="whac-player-score" id="whac-p1-score">${activeGameScores[0] || 0}</span>
          </div>

          <div class="whac-target-pill">
            <span class="whac-target-title">TARGET</span>
            <span class="whac-target-val">${winningScore}</span>
          </div>

          <div class="whac-player-badge p2 ${activeGamePlayerIndex === 1 ? 'is-active' : ''}" id="whac-p2-badge">
            <img src="${p2Avatar}" class="whac-player-avatar" alt="${esc(p2Name)}">
            <div class="whac-player-info">
              <span class="whac-player-name">${esc(p2Name)}</span>
              <span class="whac-player-turn-pill" id="whac-p2-turn">${activeGamePlayerIndex === 1 ? 'TURN' : ''}</span>
            </div>
            <span class="whac-player-score" id="whac-p2-score">${activeGameScores[1] || 0}</span>
          </div>
        </div>

        <!-- 3. Target Clue Signboard (Clean: Centered Picture OR 3D Audio Card, no weird extra empty box, no label above) -->
        <section class="whac-signboard" id="whac-signboard" aria-label="Target clue to whack">
          <div class="whac-combo-badge" id="whac-combo">Combo x2</div>
          <div class="whac-clue-content" id="whac-clue-content">
            <img id="whac-clue-image" class="whac-clue-img hidden" alt="Picture clue" title="Click to hear word">
            <span id="whac-clue-text" class="whac-clue-text hidden"></span>
            <div id="whac-clue-audio" class="whac-audio-clue hidden" title="Click to hear word again" role="button" tabindex="0">
              <div class="whac-audio-clue-box">
                <svg viewBox="0 0 32 32" width="34" height="34" fill="none" class="whac-audio-clue-svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="whac-spk-grad" x1="4" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#ffffff"/>
                      <stop offset="0.6" stop-color="#e2e8f0"/>
                      <stop offset="1" stop-color="#94a3b8"/>
                    </linearGradient>
                  </defs>
                  <path d="M15 6 L8 11 H3 C2.4 11 2 11.4 2 12 V20 C2 20.6 2.4 21 3 21 H8 L15 26 C15.7 26.5 16.5 26 16.5 25.2 V6.8 C16.5 6 15.7 5.5 15 6 Z" fill="url(#whac-spk-grad)"/>
                  <path class="whac-wave-1" d="M20.5 11 C22 12.5 22.8 14.2 22.8 16 C22.8 17.8 22 19.5 20.5 21" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
                  <path class="whac-wave-2" d="M24.5 7.5 C27 10 28.5 12.8 28.5 16 C28.5 19.2 27 22 24.5 24.5" stroke="#60a5fa" stroke-width="2.8" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="whac-audio-clue-label">Listen &amp; Whack</span>
            </div>
          </div>
        </section>

        <!-- 4. Themed Ground Arena Stage & 3D Layered Playing Field -->
        <div class="whac-arena-stage" id="whac-arena">
          <div class="whac-arena-ground-decor" id="whac-arena-decor" aria-hidden="true"></div>
          <main class="whac-field" id="whac-field" role="region" aria-label="Diglett field">
            ${Array.from({ length: numHoles }).map((_, i) => `
              <div class="whac-mound-wrap" data-hole-index="${i}">
                <div class="whac-mound-stage">
                  <!-- Hole background & dark pit -->
                  <div class="whac-hole-back">
                    <div class="whac-hole-pit"></div>
                  </div>

                  <!-- Burrow Chamber (clips Diglett bottom underground) -->
                  <div class="whac-burrow-chamber" data-hole="${i}">
                    <div class="whac-diglett" data-hole-diglett="${i}">
                      <div class="whac-diglett-body">
                        <!-- 3D Dome Top Light -->
                        <div class="whac-diglett-sheen"></div>
                        <!-- Cool Shades (shown on occasional stylish Digletts!) -->
                        <div class="whac-diglett-shades">
                          <div class="whac-shade-lens left"></div>
                          <div class="whac-shade-bridge"></div>
                          <div class="whac-shade-lens right"></div>
                        </div>
                        <!-- Authentic Diglett Eyes with circular gleam -->
                        <div class="whac-diglett-eyes">
                          <div class="whac-diglett-eye left"><span class="whac-eye-sparkle"></span></div>
                          <div class="whac-diglett-eye right"><span class="whac-eye-sparkle"></span></div>
                        </div>
                        <!-- Authentic Diglett Nose & Cheeks -->
                        <div class="whac-diglett-cheeks">
                          <div class="whac-diglett-blush left"></div>
                          <div class="whac-diglett-nose"><span class="whac-nose-highlight"></span></div>
                          <div class="whac-diglett-blush right"></div>
                        </div>
                        <!-- Cute Diglett Paws holding the card -->
                        <div class="whac-diglett-paws">
                          <div class="whac-diglett-paw left"></div>
                          <div class="whac-diglett-paw right"></div>
                        </div>
                        <!-- High-contrast Word Badge -->
                        <div class="whac-word-badge" data-hole-badge="${i}"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Front Dirt Mound Lip (masks lower body in front) -->
                  <div class="whac-mound-front"></div>
                </div>
              </div>
            `).join('')}
          </main>
        </div>
      </div>
    `;

    // Render rich themed decor inside the playing arena ground
    function updateArenaGroundDecor(themeId) {
      const decor = modal.querySelector('#whac-arena-decor');
      if (!decor) return;
      if (themeId === 'jungle') {
        decor.innerHTML = `
          <svg class="whac-decor-svg" viewBox="0 0 900 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 435 Q 160 395 340 425 T 680 405 T 900 435 L 900 480 L 0 480 Z" fill="#14532d" opacity="0.45"/>
            <path d="M 0 458 Q 240 430 500 445 T 900 452 L 900 480 L 0 480 Z" fill="#052e16" opacity="0.6"/>
            <!-- Grass tufts and clovers -->
            <g fill="#4ade80">
              <path d="M 35 435 C 38 410, 48 395, 52 380 C 50 400, 46 415, 42 435 Z"/>
              <path d="M 45 435 C 52 415, 66 405, 74 395 C 68 410, 58 422, 50 435 Z"/>
              <path d="M 855 435 C 852 410, 842 395, 838 380 C 840 400, 844 415, 848 435 Z"/>
              <path d="M 845 435 C 838 415, 824 405, 816 395 C 822 410, 832 422, 840 435 Z"/>
              <path d="M 440 450 C 445 428, 455 415, 460 405 C 456 422, 450 435, 446 450 Z"/>
              <path d="M 452 450 C 460 432, 472 425, 480 418 C 474 430, 464 440, 458 450 Z"/>
            </g>
            <!-- Blooming Wild Flowers -->
            <g>
              <circle cx="68" cy="392" r="6" fill="#facc15"/><circle cx="68" cy="392" r="2.5" fill="#d97706"/>
              <circle cx="828" cy="390" r="6" fill="#38bdf8"/><circle cx="828" cy="390" r="2.5" fill="#0284c7"/>
              <circle cx="475" cy="414" r="5" fill="#f472b6"/><circle cx="475" cy="414" r="2" fill="#db2777"/>
              <circle cx="280" cy="445" r="4.5" fill="#fde047"/>
              <circle cx="620" cy="442" r="4.5" fill="#a78bfa"/>
            </g>
            <!-- Creeping vine garland border -->
            <path d="M 30 20 Q 90 34 160 18 T 290 24 T 420 16 T 550 25 T 680 17 T 810 24 T 870 18" stroke="#22c55e" stroke-width="4.5" fill="none" opacity="0.75" stroke-linecap="round"/>
            <g fill="#16a34a" opacity="0.9">
              <path d="M 95 24 Q 104 10 114 24 Q 105 30 95 24 Z"/>
              <path d="M 230 21 Q 242 8 250 22 Q 240 28 230 21 Z"/>
              <path d="M 460 18 Q 472 4 482 18 Q 472 25 460 18 Z"/>
              <path d="M 700 19 Q 712 6 722 20 Q 712 26 700 19 Z"/>
              <path d="M 830 21 Q 842 8 850 22 Q 840 28 830 21 Z"/>
            </g>
          </svg>
        `;
      } else if (themeId === 'halloween') {
        decor.innerHTML = `
          <svg class="whac-decor-svg" viewBox="0 0 900 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Graveyard ground fog mist -->
            <path d="M 0 415 Q 200 365 450 405 T 900 390 L 900 480 L 0 480 Z" fill="#3b0764" opacity="0.5"/>
            <path d="M 0 445 Q 240 415 500 435 T 900 425 L 900 480 L 0 480 Z" fill="#1e0533" opacity="0.65"/>
            <!-- Glowing Jack-o'-Lantern Pumpkins on field corners -->
            <g transform="translate(30, 385)">
              <ellipse cx="28" cy="24" rx="24" ry="18" fill="#ea580c"/>
              <ellipse cx="28" cy="24" rx="16" ry="18" fill="#f97316"/>
              <ellipse cx="28" cy="24" rx="8" ry="17.5" fill="#fb923c"/>
              <rect x="25" y="4" width="6" height="7" rx="2" fill="#65a30d"/>
              <polygon points="18,18 24,18 21,13" fill="#fef08a" filter="drop-shadow(0 0 3px #f59e0b)"/>
              <polygon points="32,18 38,18 35,13" fill="#fef08a" filter="drop-shadow(0 0 3px #f59e0b)"/>
              <polygon points="28,21 26,24 30,24" fill="#fef08a"/>
              <path d="M 18 27 Q 28 35 38 27 Q 35 30 33 28 Q 28 33 23 28 Z" fill="#fef08a" filter="drop-shadow(0 0 4px #ea580c)"/>
            </g>
            <g transform="translate(815, 385)">
              <ellipse cx="28" cy="24" rx="24" ry="18" fill="#ea580c"/>
              <ellipse cx="28" cy="24" rx="16" ry="18" fill="#f97316"/>
              <ellipse cx="28" cy="24" rx="8" ry="17.5" fill="#fb923c"/>
              <rect x="25" y="4" width="6" height="7" rx="2" fill="#65a30d"/>
              <polygon points="18,18 24,18 21,13" fill="#fef08a" filter="drop-shadow(0 0 3px #f59e0b)"/>
              <polygon points="32,18 38,18 35,13" fill="#fef08a" filter="drop-shadow(0 0 3px #f59e0b)"/>
              <path d="M 19 27 Q 28 34 37 27 Q 32 31 28 29 Q 24 31 19 27 Z" fill="#fef08a" filter="drop-shadow(0 0 4px #ea580c)"/>
            </g>
            <!-- Spooky Cobwebs at Corners -->
            <g stroke="#c084fc" stroke-width="1.3" opacity="0.4" fill="none">
              <path d="M 0 0 L 70 70 M 0 25 L 55 55 M 25 0 L 55 55 M 0 50 L 40 40 M 50 0 L 40 40"/>
              <path d="M 900 0 L 830 70 M 900 25 L 845 55 M 875 0 L 845 55 M 900 50 L 860 40 M 850 0 L 860 40"/>
            </g>
            <!-- Flying spooky bats silhouettes -->
            <g fill="#17072b" opacity="0.75">
              <path d="M 120 40 Q 130 25 142 35 Q 152 28 160 40 Q 148 45 140 38 Q 132 45 120 40 Z"/>
              <path d="M 760 50 Q 770 36 780 45 Q 788 38 796 50 Q 786 54 778 48 Q 770 54 760 50 Z" transform="scale(0.85) translate(140, 20)"/>
            </g>
          </svg>
        `;
      } else if (themeId === 'toybox') {
        decor.innerHTML = `
          <svg class="whac-decor-svg" viewBox="0 0 900 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Playful foam puzzle floor teeth -->
            <path d="M 0 455 Q 60 445 120 455 Q 180 465 240 455 Q 300 445 360 455 Q 420 465 480 455 Q 540 445 600 455 Q 660 465 720 455 Q 780 445 840 455 L 900 455 L 900 480 L 0 480 Z" fill="#312e81" opacity="0.45"/>
            <!-- Chunky Toy Building Blocks at bottom corners -->
            <g transform="translate(30, 395)">
              <rect x="0" y="24" width="34" height="34" rx="6" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
              <text x="17" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="20" fill="#ffffff">A</text>
              <rect x="24" y="0" width="34" height="34" rx="6" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
              <text x="41" y="24" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="20" fill="#ffffff">B</text>
            </g>
            <g transform="translate(815, 395)">
              <rect x="18" y="24" width="34" height="34" rx="6" fill="#10b981" stroke="#047857" stroke-width="2"/>
              <text x="35" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="20" fill="#ffffff">C</text>
              <rect x="0" y="4" width="30" height="30" rx="6" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
              <polygon points="15,10 18,17 25,18 20,23 21,30 15,26 9,30 10,23 5,18 12,17" fill="#ffffff"/>
            </g>
            <!-- Floating star confetti stickers -->
            <g fill="#fde047" opacity="0.8">
              <polygon points="70,50 73,58 81,59 75,65 77,73 70,69 63,73 65,65 59,59 67,58"/>
              <polygon points="830,45 833,52 840,53 835,58 836,65 830,62 824,65 825,58 820,53 827,52"/>
              <polygon points="450,22 452,27 457,28 453,32 454,37 450,35 446,37 447,32 443,28 448,27"/>
              <circle cx="160" cy="35" r="5" fill="#ec4899"/>
              <circle cx="730" cy="30" r="5" fill="#06b6d4"/>
            </g>
          </svg>
        `;
      } else if (themeId === 'classroom') {
        decor.innerHTML = `
          <svg class="whac-decor-svg" viewBox="0 0 900 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Polished Hardwood Planks Seams -->
            <g stroke="#b5804c" stroke-width="2" opacity="0.4">
              <line x1="0" y1="120" x2="900" y2="120"/>
              <line x1="0" y1="240" x2="900" y2="240"/>
              <line x1="0" y1="360" x2="900" y2="360"/>
              <line x1="280" y1="0" x2="280" y2="120"/>
              <line x1="620" y1="0" x2="620" y2="120"/>
              <line x1="140" y1="120" x2="140" y2="240"/>
              <line x1="460" y1="120" x2="460" y2="240"/>
              <line x1="780" y1="120" x2="780" y2="240"/>
              <line x1="310" y1="240" x2="310" y2="360"/>
              <line x1="650" y1="240" x2="650" y2="360"/>
              <line x1="180" y1="360" x2="180" y2="480"/>
              <line x1="510" y1="360" x2="510" y2="480"/>
              <line x1="820" y1="360" x2="820" y2="480"/>
            </g>
            <!-- Brass Decorative Corner Studs & Plates -->
            <g fill="#ca8a04" stroke="#854d0e" stroke-width="1.5">
              <circle cx="28" cy="28" r="8"/><circle cx="28" cy="28" r="3" fill="#fef08a"/>
              <circle cx="872" cy="28" r="8"/><circle cx="872" cy="28" r="3" fill="#fef08a"/>
              <circle cx="28" cy="452" r="8"/><circle cx="28" cy="452" r="3" fill="#fef08a"/>
              <circle cx="872" cy="452" r="8"/><circle cx="872" cy="452" r="3" fill="#fef08a"/>
            </g>
            <!-- Academy Stage Chalk Measurement Ruler -->
            <g stroke="#ca8a04" stroke-width="1.2" opacity="0.5">
              <line x1="60" y1="468" x2="840" y2="468"/>
              <line x1="60" y1="460" x2="60" y2="468"/><line x1="160" y1="463" x2="160" y2="468"/>
              <line x1="260" y1="463" x2="260" y2="468"/><line x1="360" y1="463" x2="360" y2="468"/>
              <line x1="460" y1="460" x2="460" y2="468"/><line x1="560" y1="463" x2="560" y2="468"/>
              <line x1="660" y1="463" x2="660" y2="468"/><line x1="760" y1="463" x2="760" y2="468"/>
              <line x1="840" y1="460" x2="840" y2="468"/>
            </g>
          </svg>
        `;
      } else {
        // Classic Pokémon Meadow & Grassy Stadium (Lush grass lawn, daisies, clovers & dirt pebbles like official card!)
        decor.innerHTML = `
          <svg class="whac-decor-svg" viewBox="0 0 900 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="whac-lawn-grad" x1="0" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse">
                <stop stop-color="#22c55e" stop-opacity="0.3"/>
                <stop offset="0.5" stop-color="#16a34a" stop-opacity="0.5"/>
                <stop offset="1" stop-color="#14532d" stop-opacity="0.65"/>
              </linearGradient>
            </defs>
            <rect width="900" height="480" fill="url(#whac-lawn-grad)"/>
            <!-- Rolling gentle lawn contours -->
            <path d="M 0 420 Q 220 380 450 410 T 900 400 L 900 480 L 0 480 Z" fill="#15803d" opacity="0.35"/>
            <path d="M 0 450 Q 250 425 520 440 T 900 435 L 900 480 L 0 480 Z" fill="#166534" opacity="0.5"/>
            <!-- Grass blades & clovers around mounds -->
            <g fill="#4ade80" opacity="0.85">
              <path d="M 45 440 C 48 415, 58 400, 62 385 C 60 405, 56 420, 52 440 Z"/>
              <path d="M 55 440 C 62 420, 76 410, 84 400 C 78 415, 68 427, 60 440 Z"/>
              <path d="M 845 440 C 842 415, 832 400, 828 385 C 830 405, 834 420, 838 440 Z"/>
              <path d="M 835 440 C 828 420, 814 410, 806 400 C 812 415, 822 427, 830 440 Z"/>
              <path d="M 220 450 C 224 430, 235 418, 240 408 C 236 425, 230 438, 226 450 Z"/>
              <path d="M 680 450 C 676 430, 665 418, 660 408 C 664 425, 670 438, 674 450 Z"/>
              <path d="M 445 455 C 450 432, 462 420, 468 410 C 463 427, 456 440, 451 455 Z"/>
            </g>
            <!-- White Daisies & Golden Buttercups -->
            <g>
              <circle cx="78" cy="395" r="7" fill="#ffffff"/><circle cx="78" cy="395" r="3" fill="#facc15"/>
              <circle cx="818" cy="392" r="7" fill="#ffffff"/><circle cx="818" cy="392" r="3" fill="#facc15"/>
              <circle cx="236" cy="414" r="6" fill="#fef08a"/><circle cx="236" cy="414" r="2.5" fill="#f59e0b"/>
              <circle cx="664" cy="414" r="6" fill="#fef08a"/><circle cx="664" cy="414" r="2.5" fill="#f59e0b"/>
              <circle cx="462" cy="416" r="6.5" fill="#ffffff"/><circle cx="462" cy="416" r="2.8" fill="#facc15"/>
              <circle cx="160" cy="445" r="5" fill="#f472b6"/><circle cx="160" cy="445" r="2" fill="#db2777"/>
              <circle cx="740" cy="445" r="5" fill="#38bdf8"/><circle cx="740" cy="445" r="2" fill="#0284c7"/>
            </g>
            <!-- Loose earthen soil specks and tiny pebbles -->
            <g fill="#78350f" opacity="0.6">
              <circle cx="95" cy="438" r="3.5"/><circle cx="110" cy="442" r="2"/><circle cx="125" cy="435" r="2.5"/>
              <circle cx="800" cy="438" r="3.5"/><circle cx="785" cy="442" r="2"/><circle cx="770" cy="435" r="2.5"/>
              <circle cx="250" cy="446" r="3"/><circle cx="645" cy="446" r="3"/><circle cx="480" cy="448" r="3"/>
            </g>
            <!-- Subtle stadium arc lines -->
            <path d="M 50 40 Q 450 15 850 40" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.25"/>
            <path d="M 90 60 Q 450 35 810 60" stroke="#facc15" stroke-width="1.5" fill="none" opacity="0.2"/>
          </svg>
        `;
      }
    }

    document.body.appendChild(modal);
    if (typeof window.gaApplyThemeToStage === 'function') {
      window.gaApplyThemeToStage(modal, initialThemeObj.id);
    }
    updateArenaGroundDecor(initialThemeObj.id);
    if (typeof startPlayerTurnTimer === 'function') startPlayerTurnTimer(modal, timerSeconds);

    // Live theme switcher behavior
    const themeWrap = modal.querySelector('#whac-theme-wrap');
    const themeBtn = modal.querySelector('#whac-theme-btn');
    const themePopover = modal.querySelector('#whac-theme-popover');
    const themeCurrent = modal.querySelector('.ga-stage-theme-current');

    const setThemePopoverOpen = (open) => {
      if (!themePopover || !themeBtn) return;
      themePopover.hidden = !open;
      themeBtn.setAttribute('aria-expanded', String(open));
      themeWrap?.classList.toggle('is-open', open);
    };

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setThemePopoverOpen(themePopover.hidden);
    });

    modal.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-ga-theme-choice]');
      if (choice) {
        const themeId = choice.dataset.gaThemeChoice;
        modal.dataset.gaTheme = themeId;
        modal.setAttribute('data-ga-theme', themeId);
        if (typeof window.gaApplyThemeToStage === 'function') {
          window.gaApplyThemeToStage(modal, themeId);
        }
        updateArenaGroundDecor(themeId);
        const found = themes.find((t) => t.id === themeId);
        if (found && themeCurrent) themeCurrent.textContent = found.name;
        if (typeof window.gaSetTheme === 'function') window.gaSetTheme(themeId);
        themePopover?.querySelectorAll('.ga-theme-card').forEach((card) => {
          const active = card === choice;
          card.classList.toggle('is-selected', active);
          card.setAttribute('aria-checked', String(active));
        });
        setThemePopoverOpen(false);
        return;
      }
      if (themePopover && !themePopover.hidden && !e.target.closest('#whac-theme-wrap')) {
        setThemePopoverOpen(false);
      }
    });

    // Sound toggle
    const soundBtn = modal.querySelector('#whac-sound-toggle');
    const syncWhacSound = () => {
      const muted = window.pokeSfx?.isMuted?.() || false;
      if (typeof window.renderArcadeSoundIcon === 'function') {
        soundBtn.innerHTML = window.renderArcadeSoundIcon(muted);
      } else {
        soundBtn.textContent = muted ? '🔇' : '🔊';
      }
      soundBtn.setAttribute('aria-label', muted ? 'Turn game sounds on' : 'Turn game sounds off');
      soundBtn.title = soundBtn.getAttribute('aria-label');
    };
    syncWhacSound();
    soundBtn?.addEventListener('click', () => {
      if (window.pokeSfx && typeof window.pokeSfx.toggleMute === 'function') {
        window.pokeSfx.toggleMute();
      } else if (window.pokeSfx && typeof window.pokeSfx.setMuted === 'function') {
        window.pokeSfx.setMuted(!window.pokeSfx.isMuted());
      }
      if (typeof gameSoundState !== 'undefined') gameSoundState.muted = window.pokeSfx?.isMuted?.() || false;
      syncWhacSound();
    });

    // Fullscreen toggle (Bulletproof direct API with in-app edge-to-edge fallback)
    const fsBtn = modal.querySelector('#whac-fullscreen-btn');
    const syncFsIcon = () => {
      const isFs = Boolean(document.fullscreenElement) || modal.classList.contains('game-fullscreen-active');
      if (fsBtn) {
        fsBtn.textContent = isFs ? '↙' : '⛶';
        fsBtn.setAttribute('title', isFs ? 'Exit fullscreen' : 'Toggle fullscreen');
        fsBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Toggle fullscreen');
      }
    };
    fsBtn?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          modal.classList.remove('game-fullscreen-active');
        } else {
          try {
            await modal.requestFullscreen();
          } catch (_) {
            modal.classList.toggle('game-fullscreen-active');
          }
        }
      } catch (_) {
        modal.classList.toggle('game-fullscreen-active');
      }
      syncFsIcon();
    });
    const onFsChange = () => {
      if (!document.fullscreenElement && modal.classList.contains('game-fullscreen-active')) {
        modal.classList.remove('game-fullscreen-active');
      }
      syncFsIcon();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    modal.addEventListener('remove', () => document.removeEventListener('fullscreenchange', onFsChange), { once: true });

    const signboard = modal.querySelector('#whac-signboard');
    const clueLabel = modal.querySelector('#whac-clue-label');
    const clueText = modal.querySelector('#whac-clue-text');
    const clueImage = modal.querySelector('#whac-clue-image');
    const clueAudio = modal.querySelector('#whac-clue-audio');
    const speakBtn = modal.querySelector('#whac-speak-btn');
    const comboEl = modal.querySelector('#whac-combo');
    const field = modal.querySelector('#whac-field');

    // Clicking clue image, text, or audio speaks/replays the word
    clueImage?.addEventListener('click', () => {
      if (currentTargetWord) playWaveAudio(currentTargetWord.vocab_word);
    });
    clueText?.addEventListener('click', () => {
      if (currentTargetWord) playWaveAudio(currentTargetWord.vocab_word);
    });
    clueAudio?.addEventListener('click', () => {
      if (currentTargetWord) playWaveAudio(currentTargetWord.vocab_word);
    });
    speakBtn?.addEventListener('click', () => {
      if (currentTargetWord) playWaveAudio(currentTargetWord.vocab_word);
    });

    const p1Badge = modal.querySelector('#whac-p1-badge');
    const p2Badge = modal.querySelector('#whac-p2-badge');
    const p1ScoreEl = modal.querySelector('#whac-p1-score');
    const p2ScoreEl = modal.querySelector('#whac-p2-score');
    const p1TurnEl = modal.querySelector('#whac-p1-turn');
    const p2TurnEl = modal.querySelector('#whac-p2-turn');

    function updateScoreHud() {
      if (p1ScoreEl) p1ScoreEl.textContent = String(activeGameScores[0] || 0);
      if (p2ScoreEl) p2ScoreEl.textContent = String(activeGameScores[1] || 0);

      const isP1 = activeGamePlayerIndex === 0;
      if (p1Badge) p1Badge.classList.toggle('is-active', isP1);
      if (p2Badge) p2Badge.classList.toggle('is-active', !isP1);

      if (p1TurnEl) p1TurnEl.textContent = isP1 ? 'TURN' : '';
      if (p2TurnEl) p2TurnEl.textContent = !isP1 ? 'TURN' : '';
    }

    const rawLevel = (typeof window.getClassReadingLevel === 'function'
      ? window.getClassReadingLevel(typeof currentRole !== 'undefined' && currentRole === 'student' ? currentStudentSchool : navSchool, typeof currentRole !== 'undefined' && currentRole === 'student' ? currentStudentClass : navClass)
      : 'P4') || 'P4';
    const resolvedLevel = typeof toReadingLevelCode === 'function' ? toReadingLevelCode(rawLevel) : (/^P[1-6]$/.test(rawLevel) ? rawLevel : 'P4');

    const inMemoryAudioUrls = new Map();
    let activeAudio = null;
    let currentSpeechAbort = null;
    let waveAudioStarted = false;

    function playWaveAudio(word, onStart, onEnd) {
      waveAudioStarted = false;
      let hasEnded = false;

      const triggerStart = () => {
        if (waveAudioStarted) return;
        waveAudioStarted = true;
        signboard?.classList.add('is-speaking');
        onStart?.();
      };

      const triggerEnd = () => {
        if (hasEnded) return;
        hasEnded = true;
        signboard?.classList.remove('is-speaking');
        onEnd?.();
      };

      if (!word) {
        triggerStart();
        triggerEnd();
        return;
      }

      const isMuted = (window.pokeSfx && typeof window.pokeSfx.isMuted === 'function' && window.pokeSfx.isMuted()) || (typeof gameSoundState !== 'undefined' && gameSoundState.muted);
      if (isMuted) {
        triggerStart();
        setTimeout(triggerEnd, 1200);
        return;
      }

      // Cancel prior audio
      if (currentSpeechAbort) {
        try { currentSpeechAbort.abort(); } catch (_) {}
        currentSpeechAbort = null;
      }
      if (activeAudio) {
        try {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        } catch (_) {}
        activeAudio = null;
      }
      const stopFn = window.stopNaturalVocabulary || window.parent?.stopNaturalVocabulary;
      if (typeof stopFn === 'function') {
        try { stopFn(); } catch (_) {}
      }

      const abortCtrl = new AbortController();
      currentSpeechAbort = abortCtrl;
      const key = String(word).trim().toLowerCase();

      // 1. Instant 0ms playback: In-memory pre-cached Gemini voice Object URL
      const cachedUrl = inMemoryAudioUrls.get(key);
      if (cachedUrl) {
        try {
          const audio = new Audio(cachedUrl);
          activeAudio = audio;
          audio.onplay = () => triggerStart();
          audio.onended = () => {
            if (activeAudio === audio) activeAudio = null;
            triggerEnd();
          };
          audio.onerror = () => {
            speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
          };
          audio.play().catch(() => {
            speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
          });
          return;
        } catch (_) {
          speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
          return;
        }
      }

      // 2. Fast check: permanent IndexedDB audio cache (Gemini voice)
      const audioCache = window.pokeaymanAudioCache || window.parent?.pokeaymanAudioCache;
      if (audioCache && typeof audioCache.getCachedAudio === 'function') {
        audioCache.getCachedAudio(word, resolvedLevel, 'kore').then(blob => {
          if (abortCtrl.signal.aborted || waveAudioStarted) return;
          if (blob) {
            try {
              const audioUrl = URL.createObjectURL(blob);
              inMemoryAudioUrls.set(key, audioUrl);
              const audio = new Audio(audioUrl);
              activeAudio = audio;
              audio.onplay = () => triggerStart();
              audio.onended = () => {
                if (activeAudio === audio) activeAudio = null;
                triggerEnd();
              };
              audio.onerror = () => {
                speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
              };
              audio.play().catch(() => {
                speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
              });
              return;
            } catch (_) {}
          }
          speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
        }).catch(() => {
          speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
        });
        return;
      }

      // 3. Fallback: Speak using the exact same Gemini natural reader as vocabulary lists
      speakViaGeminiNatural(word, abortCtrl.signal, triggerStart, triggerEnd);
    }

    // Authentic Gemini studio voice (same as vocabulary lists / vb lists) - NEVER robotic
    function speakViaGeminiNatural(word, signal, onStart, onEnd) {
      if (signal?.aborted) return;
      const readNaturalFn = window.readNaturalVocabulary || window.parent?.readNaturalVocabulary;
      if (typeof readNaturalFn === 'function') {
        readNaturalFn(word, null, {
          level: resolvedLevel,
          preventRoboticFallback: true,
          onStart: () => {
            if (!signal?.aborted) onStart();
          },
          onEnd: () => {
            onEnd();
          }
        }).catch(() => {
          onEnd();
        });
        return;
      }

      const speaker = window.pokeaymanSpeak || window.parent?.pokeaymanSpeak;
      if (typeof speaker === 'function') {
        onStart();
        speaker(word, resolvedLevel).then(() => onEnd()).catch(() => onEnd());
        return;
      }

      if (typeof window.readGameWordAloud === 'function') {
        onStart();
        window.readGameWordAloud(word);
        setTimeout(onEnd, 1200);
        return;
      }

      onStart();
      onEnd();
    }

    function cleanUpWave() {
      clearTimeout(waveTimer);
      clearTimeout(botTimer);
      if (currentSpeechAbort) {
        try { currentSpeechAbort.abort(); } catch (_) {}
        currentSpeechAbort = null;
      }
      if (activeAudio) {
        try {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        } catch (_) {}
        activeAudio = null;
      }
      const stopFn = window.stopNaturalVocabulary || window.parent?.stopNaturalVocabulary;
      if (typeof stopFn === 'function') {
        try { stopFn(); } catch (_) {}
      }
      modal.querySelectorAll('.whac-diglett').forEach((el) => {
        el.classList.remove('is-up', 'is-whacked');
      });
      signboard?.classList.remove('is-speaking');
      currentActiveHoles = [];
    }

    function spawnWave() {
      if (!roundActive) return;
      cleanUpWave();
      updateScoreHud();

      // Pick next target word
      const nextWord = allWords[Math.floor(Math.random() * allWords.length)];
      currentTargetWord = nextWord;

      // Update signboard clue
      const hasImage = nextWord.vocab_image && String(nextWord.vocab_image).trim().length > 0;
      const hasTranslation = Boolean(nextWord.vocab_meaning || nextWord.translation);

      if (hasImage) {
        clueImage.onerror = () => {
          clueImage.classList.add('hidden');
          if (clueAudio) clueAudio.classList.remove('hidden');
        };
        clueImage.src = nextWord.vocab_image;
        clueImage.classList.remove('hidden');
        clueText.classList.add('hidden');
        clueText.textContent = '';
        if (clueAudio) clueAudio.classList.add('hidden');
        if (clueLabel) clueLabel.textContent = '';
      } else if (hasTranslation) {
        clueImage.classList.add('hidden');
        clueText.textContent = nextWord.vocab_meaning || nextWord.translation;
        clueText.classList.remove('hidden');
        if (clueAudio) clueAudio.classList.add('hidden');
        if (clueLabel) clueLabel.textContent = '';
      } else {
        clueImage.classList.add('hidden');
        clueText.classList.add('hidden');
        if (clueAudio) clueAudio.classList.remove('hidden');
        if (clueLabel) clueLabel.textContent = '';
      }

      // Select 2 or 3 random distinct holes
      const holeIndices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      const activeCount = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
      const chosenHoles = holeIndices.slice(0, activeCount);
      currentActiveHoles = chosenHoles;

      // Distractors
      const distractorPool = allWords.filter((w) => w.vocab_word !== nextWord.vocab_word);
      const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5);

      // Random hole in chosenHoles gets the correct word
      const targetHole = chosenHoles[Math.floor(Math.random() * chosenHoles.length)];

      chosenHoles.forEach((holeIdx) => {
        const diglett = modal.querySelector(`[data-hole-diglett="${holeIdx}"]`);
        const badge = modal.querySelector(`[data-hole-badge="${holeIdx}"]`);
        if (!diglett || !badge) return;

        const isTarget = holeIdx === targetHole;
        const wordObj = isTarget ? nextWord : (shuffledDistractors.pop() || nextWord);

        badge.textContent = wordObj.vocab_word;
        diglett.dataset.word = wordObj.vocab_word;
        diglett.dataset.isTarget = isTarget ? 'true' : 'false';

        // 1 in 3 Digletts wear cool shades like in the official Pokémon card!
        const hasShades = Math.random() < 0.33;
        diglett.classList.toggle('has-shades', hasShades);
      });

      // Sound-Synced Wave: Start audio first, pop Digletts up when audio begins!
      playWaveAudio(nextWord.vocab_word, () => {
        if (!roundActive) return;

        // Audio has begun playing! Digletts pop up now!
        chosenHoles.forEach((holeIdx) => {
          const diglett = modal.querySelector(`[data-hole-diglett="${holeIdx}"]`);
          if (diglett) {
            diglett.classList.add('is-up');
            try { window.pokeSfx?.play?.('click'); } catch (_) {}
          }
        });

        // Robot opponent logic scheduled from when audio starts
        const currentPlayer = activeGamePlayers[activeGamePlayerIndex];
        if (currentPlayer && currentPlayer.isBot) {
          const botDiff = currentPlayer.botDifficulty || window.selectedBotDifficulty || 'normal';
          const reactionTimes = { easy: 2400, normal: 1700, hard: 1100 };
          const delay = reactionTimes[botDiff] || 1700;

          botTimer = setTimeout(() => {
            if (!roundActive) return;
            const targetDiglett = modal.querySelector(`[data-hole-diglett="${targetHole}"]`);
            if (targetDiglett && targetDiglett.classList.contains('is-up') && !targetDiglett.classList.contains('is-whacked')) {
              handleHit(targetHole, true, true);
            }
          }, delay);
        }

        // Wave retreat timeout (Full fair 3.0s reaction window from sound start!)
        waveTimer = setTimeout(() => {
          if (!roundActive) return;
          modal.querySelectorAll('.whac-diglett.is-up').forEach((el) => {
            el.classList.remove('is-up');
          });
          if (activeGamePlayers.length > 1) {
            if (typeof advanceGameTurn === 'function') advanceGameTurn();
            updateScoreHud();
          }
          setTimeout(spawnWave, 400);
        }, 3000);
      });
    }

    // Render Pikachu holding the giant Pokéball hammer striking down!
    function renderHammerStrike(holeIdx) {
      const moundWrap = modal.querySelector(`[data-hole-index="${holeIdx}"]`);
      if (!moundWrap) return;

      const hammer = document.createElement('div');
      hammer.className = 'whac-hammer-anim';
      hammer.innerHTML = `
        <svg viewBox="0 0 160 140" width="150" height="130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 1. Pikachu Lightning Tail -->
          <path d="M 115 88 L 132 78 L 126 64 L 144 50 L 138 36 L 152 20" stroke="#facc15" stroke-width="8" stroke-linecap="round" stroke-linejoin="miter"/>
          <path d="M 115 88 L 122 84" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>

          <!-- 2. Pikachu Chubby Body -->
          <path d="M 94 60 C 86 70, 86 96, 96 108 C 104 116, 122 114, 130 102 C 138 90, 136 68, 126 58 C 118 50, 102 50, 94 60 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2.5"/>
          <ellipse cx="100" cy="112" rx="9" ry="5.5" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <ellipse cx="124" cy="107" rx="8" ry="5" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>

          <!-- Pikachu Ears -->
          <path d="M 95 44 C 88 26, 74 12, 68 8 C 75 19, 88 34, 93 48 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <path d="M 68 8 C 70 12, 75 18, 77 16 C 76 13, 73 10, 68 8 Z" fill="#1e293b"/>
          <path d="M 116 38 C 124 22, 138 8, 144 4 C 140 18, 128 32, 120 42 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <path d="M 144 4 C 141 9, 135 14, 133 13 C 137 9, 141 6, 144 4 Z" fill="#1e293b"/>

          <!-- Pikachu Head -->
          <ellipse cx="108" cy="56" rx="21" ry="19" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <ellipse cx="94" cy="62" rx="6" ry="5.5" fill="#ef4444"/>
          <ellipse cx="122" cy="58" rx="6" ry="5.5" fill="#ef4444"/>

          <!-- Eyes & Happy Action Smile -->
          <circle cx="101" cy="53" r="3.8" fill="#111827"/>
          <circle cx="100" cy="51.8" r="1.3" fill="#ffffff"/>
          <circle cx="115" cy="50" r="3.8" fill="#111827"/>
          <circle cx="114" cy="48.8" r="1.3" fill="#ffffff"/>
          <polygon points="108,55 106.8,57.5 109.2,57.5" fill="#1e293b"/>
          <path d="M 104 60 Q 108 66 112 60 Z" fill="#be123c" stroke="#991b1b" stroke-width="1"/>

          <!-- 3. Sturdy Wooden Handle -->
          <rect x="36" y="68" width="68" height="9" rx="4.5" fill="#d97706" stroke="#78350f" stroke-width="2.5" transform="rotate(-34, 70, 72)"/>
          <ellipse cx="86" cy="68" rx="6.5" ry="5.5" fill="#facc15" stroke="#b45309" stroke-width="2"/>
          <ellipse cx="98" cy="60" rx="6.5" ry="5.5" fill="#facc15" stroke="#b45309" stroke-width="2"/>

          <!-- 4. Giant Pokéball Mallet Head -->
          <g transform="translate(18, 62) rotate(-22)">
            <path d="M 6 0 L 52 0 C 58 0 62 6 62 14 L 62 21 L 0 21 L 0 14 C 0 6 4 0 6 0 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2.5"/>
            <path d="M 10 5 Q 30 2 50 6" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 0 21 L 62 21 L 62 28 C 62 36 58 42 52 42 L 6 42 C 4 42 0 36 0 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
            <rect x="0" y="18" width="62" height="6.5" fill="#1e293b"/>
            <ellipse cx="5" cy="21" rx="5" ry="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
            <ellipse cx="5" cy="13" rx="3" ry="10" fill="#ef4444"/>
            <ellipse cx="5" cy="29" rx="3" ry="10" fill="#e2e8f0"/>
            <rect x="2.5" y="18" width="5" height="6.5" fill="#1e293b"/>
            <circle cx="31" cy="21.2" r="9" fill="#ffffff" stroke="#1e293b" stroke-width="3"/>
            <circle cx="31" cy="21.2" r="4.2" fill="#f8fafc" stroke="#64748b" stroke-width="1.8"/>
          </g>

          <!-- 5. Comic Action Strike Lightning Sparks -->
          <polygon points="12,106 18,94 17,103 26,98 20,109 28,113 18,115 24,124 15,118 10,126 9,116 2,114" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
          <polygon points="52,114 60,103 58,111 67,106 61,117 70,121 59,123 63,132 54,125 48,133 48,122 41,120" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
          <circle cx="28" cy="120" r="3" fill="#ffffff"/>
          <circle cx="48" cy="110" r="2.5" fill="#ffffff"/>
        </svg>
      `;
      moundWrap.appendChild(hammer);
      setTimeout(() => hammer.remove(), 480);
    }

    function createHitFx(holeIdx, isCorrect) {
      const moundWrap = modal.querySelector(`[data-hole-index="${holeIdx}"]`);
      if (!moundWrap) return;

      const fx = document.createElement('div');
      fx.className = 'whac-hit-fx';
      fx.innerHTML = `
        <div class="whac-hit-icon">
          ${isCorrect
            ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          }
        </div>
        <div class="whac-hit-score" style="color: ${isCorrect ? '#10b981' : '#ef4444'};">${isCorrect ? '+1' : 'MISS'}</div>
      `;
      moundWrap.appendChild(fx);
      setTimeout(() => fx.remove(), 550);
    }

    function handleHit(holeIdx, isTarget, fromBot = false) {
      const diglett = modal.querySelector(`[data-hole-diglett="${holeIdx}"]`);
      if (!diglett || !diglett.classList.contains('is-up') || diglett.classList.contains('is-whacked')) return;

      clearTimeout(waveTimer);
      clearTimeout(botTimer);

      diglett.classList.add('is-whacked');
      renderHammerStrike(holeIdx);
      createHitFx(holeIdx, isTarget);

      if (isTarget) {
        // Correct hit!
        try { window.pokeSfx?.play?.('correct'); } catch (e) {}
        comboStreak++;
        if (comboStreak > 1) {
          comboEl.textContent = `Combo x${comboStreak}`;
          comboEl.classList.add('is-visible');
        }

        activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
        updateScoreHud();

        if (typeof showCorrectAnswerCelebration === 'function') {
          showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
        }

        // Check victory condition
        if (activeGameScores[activeGamePlayerIndex] >= winningScore) {
          roundActive = false;
          cleanUpWave();
          try { window.pokeSfx?.play?.('cheer'); } catch (e) {}
          setTimeout(() => {
            if (typeof showGameCelebration === 'function') {
              showGameCelebration(modal, 'Whac-A-Diglett Champion!', currentTargetWord.vocab_word, null, currentTargetWord.vocab_image);
            }
          }, 450);
          return;
        }

        // Turn advance in 2-player / vs robot
        if (activeGamePlayers.length > 1) {
          if (typeof advanceGameTurn === 'function') advanceGameTurn();
          updateScoreHud();
        }

        // Next round wave
        setTimeout(() => {
          diglett.classList.remove('is-up', 'is-whacked');
          setTimeout(spawnWave, 250);
        }, 350);

      } else {
        // Wrong hit!
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
        comboStreak = 0;
        comboEl.classList.remove('is-visible');

        const prevPlayerIndex = activeGamePlayerIndex;
        if (typeof advanceGameTurn === 'function') {
          advanceGameTurn();
        }
        if (typeof showWrongAnswerCelebration === 'function') {
          showWrongAnswerCelebration(modal, prevPlayerIndex);
        }
        updateScoreHud();

        setTimeout(() => {
          diglett.classList.remove('is-up', 'is-whacked');
          setTimeout(spawnWave, 350);
        }, 350);
      }
    }

    // Attach click / tap listener to holes
    field.addEventListener('click', (e) => {
      if (!roundActive) return;
      const chamber = e.target.closest('[data-hole]');
      if (!chamber) return;
      const holeIdx = Number(chamber.dataset.hole);
      const diglett = chamber.querySelector('.whac-diglett');
      if (!diglett || !diglett.classList.contains('is-up')) return;

      const isTarget = diglett.dataset.isTarget === 'true';
      handleHit(holeIdx, isTarget, false);
    });

    // Close Handler
    modal.querySelector('#whac-close-btn').addEventListener('click', () => {
      roundActive = false;
      cleanUpWave();
      inMemoryAudioUrls.forEach((url) => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      });
      inMemoryAudioUrls.clear();
      modal.remove();
      if (typeof returnToGamesTab === 'function') returnToGamesTab();
    });

    // Helper: pre-cache all vocabulary word Gemini voices before wave 1 starts.
    // If voices are already cached in IndexedDB, they are loaded into memory URLs.
    // If not cached, they are fetched concurrently (concurrency: 3) and saved to cache.
    async function prepareVoicesAndStart() {
      const uniqueWords = [...new Set(
        allWords
          .map(w => (typeof w === 'string' ? w : (w?.vocab_word || w?.word || '')).trim())
          .filter(Boolean)
      )];

      if (!uniqueWords.length) {
        setTimeout(spawnWave, 400);
        return;
      }

      const audioCache = window.pokeaymanAudioCache || window.parent?.pokeaymanAudioCache;

      // 1. Check which words are already cached and load into in-memory URLs for 0ms latency
      let uncachedCount = 0;
      if (audioCache && typeof audioCache.getCachedAudio === 'function') {
        await Promise.all(
          uniqueWords.map(async (w) => {
            try {
              const blob = await audioCache.getCachedAudio(w, resolvedLevel, 'kore');
              if (blob) {
                inMemoryAudioUrls.set(w.toLowerCase(), URL.createObjectURL(blob));
              } else {
                uncachedCount++;
              }
            } catch (_) {
              uncachedCount++;
            }
          })
        );
      }

      // If all words are already in-memory/cached, start wave 1 immediately!
      if (uncachedCount === 0) {
        setTimeout(spawnWave, 400);
        return;
      }

      // Show brief smooth non-blocking preparing voice indicator
      let prepToast = modal.querySelector('.whac-prep-voices');
      if (!prepToast) {
        prepToast = document.createElement('div');
        prepToast.className = 'whac-prep-voices absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/50 text-amber-300 text-xs font-black shadow-lg flex items-center gap-2 pointer-events-none transition-opacity duration-300';
        prepToast.innerHTML = '<span class="inline-block animate-spin">⚡</span> <span class="whac-prep-text">Readying Gemini voices for rapid round...</span>';
        modal.appendChild(prepToast);
      }

      const prefetchFn = window.pokeaymanPrefetchVoices || window.parent?.pokeaymanPrefetchVoices || audioCache?.prefetchVocabularySpeechList;
      if (typeof prefetchFn === 'function') {
        try {
          const textEl = prepToast.querySelector('.whac-prep-text');
          const prefetchPromise = prefetchFn(uniqueWords, resolvedLevel, (count, total) => {
            if (textEl) textEl.textContent = `Readying Gemini voices (${count}/${total})...`;
          });
          // Allow prefetching to complete so all Gemini studio voices are ready
          await Promise.race([prefetchPromise, new Promise(r => setTimeout(r, 4500))]);
        } catch (e) {
          console.warn('[Whac-A-Diglett] Pre-cache voice warning:', e);
        }
      }

      // Populate inMemoryAudioUrls for any newly fetched words
      if (audioCache && typeof audioCache.getCachedAudio === 'function') {
        await Promise.all(
          uniqueWords.map(async (w) => {
            const key = w.toLowerCase();
            if (!inMemoryAudioUrls.has(key)) {
              try {
                const blob = await audioCache.getCachedAudio(w, resolvedLevel, 'kore');
                if (blob) inMemoryAudioUrls.set(key, URL.createObjectURL(blob));
              } catch (_) {}
            }
          })
        );
      }

      if (prepToast) {
        prepToast.style.opacity = '0';
        setTimeout(() => prepToast?.remove(), 350);
      }

      if (roundActive) {
        setTimeout(spawnWave, 300);
      }
    }

    prepareVoicesAndStart();
  };
})();
