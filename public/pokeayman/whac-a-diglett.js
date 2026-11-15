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
    modal.className = 'whac-game-modal game-popup-modal';
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

          <button type="button" class="ga-stage-sound w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center text-xs font-bold cursor-pointer" id="whac-sound-toggle" title="Toggle sound">🔊</button>
          <button type="button" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center text-sm font-bold cursor-pointer" id="whac-fullscreen-btn" title="Toggle fullscreen">⛶</button>
          <button type="button" class="ga-stage-exit w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center justify-center text-base font-bold cursor-pointer" id="whac-close-btn" title="Exit game" aria-label="Close game">×</button>
        </div>
      </header>

      <div class="whac-game-shell ga-stage-shell">
        <!-- 2. Dedicated Duelists Score HUD (Never white-on-white) -->
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

        <!-- 3. Target Clue Signboard (Clean: Centered Picture, no label above, no empty audio box) -->
        <section class="whac-signboard" aria-label="Target clue to whack">
          <div class="whac-combo-badge" id="whac-combo">Combo x2</div>
          <div class="whac-clue-content">
            <img id="whac-clue-image" class="whac-clue-img hidden" alt="Picture clue" title="Click to hear word">
            <span id="whac-clue-text" class="whac-clue-text hidden"></span>
          </div>
        </section>

        <!-- 4. 3D Layered Playing Field: Digletts emerge straight out of the dark hole pit -->
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
    `;

    document.body.appendChild(modal);
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
    soundBtn?.addEventListener('click', () => {
      if (window.pokeSfx && typeof window.pokeSfx.toggleMute === 'function') {
        const isMuted = window.pokeSfx.toggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
      }
    });

    // Fullscreen toggle (Bulletproof direct API)
    modal.querySelector('#whac-fullscreen-btn')?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await modal.requestFullscreen();
        }
      } catch (_) {}
    });

    const clueLabel = modal.querySelector('#whac-clue-label');
    const clueText = modal.querySelector('#whac-clue-text');
    const clueImage = modal.querySelector('#whac-clue-image');
    const speakBtn = modal.querySelector('#whac-speak-btn');
    const comboEl = modal.querySelector('#whac-combo');
    const field = modal.querySelector('#whac-field');

    // Clicking clue image or text speaks the word
    clueImage?.addEventListener('click', () => {
      if (currentTargetWord) speakTarget(currentTargetWord.vocab_word);
    });
    clueText?.addEventListener('click', () => {
      if (currentTargetWord) speakTarget(currentTargetWord.vocab_word);
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

    function speakTarget(word) {
      if (!word) return;
      if (typeof window.readGameWordAloud === 'function') {
        window.readGameWordAloud(word);
      } else if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(word);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
    }

    speakBtn?.addEventListener('click', () => {
      if (currentTargetWord) speakTarget(currentTargetWord.vocab_word);
    });

    function cleanUpWave() {
      clearTimeout(waveTimer);
      clearTimeout(botTimer);
      modal.querySelectorAll('.whac-diglett').forEach((el) => {
        el.classList.remove('is-up', 'is-whacked');
      });
      currentActiveHoles = [];
    }

    function spawnWave() {
      if (!roundActive) return;
      cleanUpWave();
      updateScoreHud();

      // Pick next target word
      const nextWord = allWords[Math.floor(Math.random() * allWords.length)];
      currentTargetWord = nextWord;

      // Update signboard clue: NEVER show spelling next to picture!
      if (nextWord.vocab_image && String(nextWord.vocab_image).trim().length > 0) {
        clueImage.src = nextWord.vocab_image;
        clueImage.classList.remove('hidden');
        clueText.classList.add('hidden');
        clueText.textContent = '';
        if (clueLabel) clueLabel.textContent = 'WHACK THE MATCHING WORD';
      } else if (nextWord.vocab_meaning || nextWord.translation) {
        clueImage.classList.add('hidden');
        clueText.textContent = nextWord.vocab_meaning || nextWord.translation;
        clueText.classList.remove('hidden');
        if (clueLabel) clueLabel.textContent = 'WHACK THE ENGLISH WORD';
      } else {
        clueImage.classList.add('hidden');
        clueText.textContent = 'Listen carefully';
        clueText.classList.remove('hidden');
        if (clueLabel) clueLabel.textContent = 'LISTEN TO PRONUNCIATION';
      }

      // Automatically speak word once wave appears
      speakTarget(nextWord.vocab_word);

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

        // Pop up from inside the hole
        setTimeout(() => {
          if (roundActive) diglett.classList.add('is-up');
        }, Math.random() * 80);
      });

      // Handle Robot Opponent logic
      const currentPlayer = activeGamePlayers[activeGamePlayerIndex];
      if (currentPlayer && currentPlayer.isBot) {
        const botDiff = currentPlayer.botDifficulty || window.selectedBotDifficulty || 'normal';
        const reactionTimes = { easy: 1800, normal: 1200, hard: 750 };
        const delay = reactionTimes[botDiff] || 1200;

        botTimer = setTimeout(() => {
          if (!roundActive) return;
          const targetDiglett = modal.querySelector(`[data-hole-diglett="${targetHole}"]`);
          if (targetDiglett && targetDiglett.classList.contains('is-up') && !targetDiglett.classList.contains('is-whacked')) {
            handleHit(targetHole, true, true);
          }
        }, delay);
      }

      // Wave retreat timeout (if not whacked within 2.3s)
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
      }, 2300);
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
      modal.remove();
      if (typeof returnToGamesTab === 'function') returnToGamesTab();
    });

    // Start first wave
    setTimeout(spawnWave, 400);
  };
})();
