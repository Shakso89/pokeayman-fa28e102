/* Dots and Boxes Turn-Based Vocabulary Mini-Game */
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

  window.chooseDotsAndBoxes = function (listName) {
    if (typeof chooseGamePlayers === 'function') {
      chooseGamePlayers(listName, window.chooseDotsAndBoxes);
    }
  };

  function generateMCQ(vocabWords, currentWord) {
    if (!vocabWords || !vocabWords.length) return null;

    // Prefer words with images
    const eligible = vocabWords.filter(
      (w) => (w.vocab_image || w.image_url) && String(w.vocab_image || w.image_url).trim().length > 0
    );
    const pool = eligible.length >= 2 ? eligible : vocabWords;

    let candidates = pool;
    if (currentWord && pool.length > 1) {
      candidates = pool.filter((w) => w.vocab_word !== currentWord.vocab_word);
      if (!candidates.length) candidates = pool;
    }
    const correct = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];

    const otherWords = vocabWords
      .filter((w) => w.vocab_word !== correct.vocab_word)
      .map((w) => w.vocab_word);

    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3);

    const fallbackDistractors = ['Pikachu', 'Pokéball', 'Charmander', 'Bulbasaur', 'Squirtle', 'Eevee'];
    let fbIdx = 0;
    while (distractors.length < 3) {
      const fb = fallbackDistractors[fbIdx++];
      if (fb !== correct.vocab_word && !distractors.includes(fb)) {
        distractors.push(fb);
      }
    }

    const options = [...distractors, correct.vocab_word].sort(() => Math.random() - 0.5);

    return {
      wordItem: correct,
      options,
      correctAnswer: correct.vocab_word,
    };
  }

  window.openGameDotsAndBoxes = function (listName, gridDots = 4, timerSeconds = 0) {
    const allWords = typeof getGameWords === 'function' ? getGameWords(listName, false) : [];
    if (!allWords || allWords.length < 2) {
      if (typeof toast === 'function') {
        toast('Dots and Boxes needs a vocabulary list with at least 2 words.');
      }
      return;
    }

    if (!Array.isArray(activeGamePlayers) || activeGamePlayers.length < 2) {
      if (Array.isArray(activeGamePlayers) && activeGamePlayers.length === 1) {
        activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || {
          student_name: 'Robot',
          avatar_pokemon_id: 137,
          __backendId: 'bot-robot',
          isBot: true,
          botDifficulty: window.selectedBotDifficulty || 'medium',
        });
      } else {
        if (typeof toast === 'function') {
          toast('Dots and Boxes requires 2 players.');
        }
        return;
      }
    }

    activeGameScores = [0, 0];
    activeGamePlayerIndex = 0;
    if (typeof setGameReplay === 'function') {
      setGameReplay(() => {
        if (typeof resetGameTurnState === 'function') resetGameTurnState();
        if (typeof activeGamePlayerRemaining !== 'undefined') activeGamePlayerRemaining = [];
        window.openGameDotsAndBoxes(listName, gridDots, timerSeconds);
      });
    }

    // Grid size: 3x3 dots (4 boxes), 4x4 dots (9 boxes), or 5x5 dots (16 boxes)
    const N = Math.max(3, Math.min(5, Number(gridDots) || 4));
    const numBoxes = N - 1;
    const totalPossibleBoxes = numBoxes * numBoxes;

    const horizontalLines = {};
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < numBoxes; c++) {
        horizontalLines[`${r}-${c}`] = null;
      }
    }
    const verticalLines = {};
    for (let r = 0; r < numBoxes; r++) {
      for (let c = 0; c < N; c++) {
        verticalLines[`${r}-${c}`] = null;
      }
    }
    const boxes = {};
    for (let r = 0; r < numBoxes; r++) {
      for (let c = 0; c < numBoxes; c++) {
        boxes[`${r}-${c}`] = null;
      }
    }

    let phase = 'MCQ'; // 'MCQ' | 'DRAW_LINE' | 'ROUND_OVER'
    let currentQuestion = generateMCQ(allWords, null);
    let lastDrawn = null; // { type: 'H' | 'V', r: number, c: number }
    let pullState = null;
    let consecutiveTurnsRemaining = 0;

    const turnTimeLimit = Math.max(0, Number(timerSeconds) || 0);
    const matchTimeLimit = turnTimeLimit;
    // Persistent dual-player time banks
    let playerTimeRemaining = [turnTimeLimit, turnTimeLimit];
    if (typeof activeGamePlayerRemaining !== 'undefined') {
      activeGamePlayerRemaining = playerTimeRemaining;
    }
    let matchTimeRemaining = turnTimeLimit;
    let timerInterval = null;
    let lastTick = Date.now();

    const formatTime = (seconds) => {
      const s = Math.max(0, Math.ceil(seconds || 0));
      if (s >= 60) {
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}:${String(rem).padStart(2, '0')}`;
      }
      return `${s}s`;
    };

    const stopMatchTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };
    const stopTurnTimer = stopMatchTimer;

    const updateTimerDisplay = () => {
      if (turnTimeLimit <= 0) return;
      const p1Sec = Math.max(0, Math.ceil(playerTimeRemaining[0] || 0));
      const p2Sec = Math.max(0, Math.ceil(playerTimeRemaining[1] || 0));
      const activeIdx = activeGamePlayerIndex === 1 ? 1 : 0;
      const curLeft = activeIdx === 0 ? p1Sec : p2Sec;
      matchTimeRemaining = curLeft;

      // 1. Center VS Timer (displays active player's remaining bank)
      const timerVal = modal?.querySelector?.('#dots-timer-val');
      const timerPill = modal?.querySelector?.('#dots-hud-timer');
      if (timerVal) timerVal.textContent = formatTime(curLeft);
      if (timerPill) {
        const isDanger = curLeft <= 10 || (turnTimeLimit > 0 && curLeft / turnTimeLimit <= 0.15);
        const isWarn = !isDanger && (curLeft <= 30 || (turnTimeLimit > 0 && curLeft / turnTimeLimit <= 0.35));
        timerPill.classList.toggle('is-danger', isDanger);
        timerPill.classList.toggle('is-warn', isWarn);
      }

      // 2. Player 1 Badge Timer (SEPARATE: counts down ONLY when Player 1 is active)
      const p1Timer = modal?.querySelector?.('#dots-timer-p1');
      if (p1Timer) p1Timer.textContent = `⏱ ${formatTime(p1Sec)}`;

      // 3. Player 2 Badge Timer (SEPARATE: counts down ONLY when Player 2 is active)
      const p2Timer = modal?.querySelector?.('#dots-timer-p2');
      if (p2Timer) p2Timer.textContent = `⏱ ${formatTime(p2Sec)}`;

      // 4. Question Card Header Timer (displays active player's remaining bank)
      const qTimer = modal?.querySelector?.('#dots-q-timer');
      if (qTimer) qTimer.textContent = `⏱ ${formatTime(curLeft)}`;
    };

    const handleMatchTimeout = () => {
      if (phase === 'ROUND_OVER') return;
      stopMatchTimer();
      phase = 'ROUND_OVER';
      updateStatus();
      renderBoard();

      try { window.pokeSfx?.play?.('fanfare'); } catch (e) {}

      const p1Score = activeGameScores[0];
      const p2Score = activeGameScores[1];
      const tied = p1Score === p2Score;
      const winner = tied ? null : (p1Score > p2Score ? p1 : p2);
      const winnerName = winner ? (winner.student_name || winner.name || 'Winner') : null;

      if (typeof toast === 'function') {
        toast(tied ? `⏱ Time's up! Match ended in Even even seven eleven!` : `⏱ Time's up! ${winnerName} won the match!`);
      }

      setTimeout(() => {
        if (typeof showGameCelebration === 'function') {
          showGameCelebration(modal, tied ? "Even even seven eleven" : `${winnerName} Wins!`, `Final Score: ${p1Score} - ${p2Score}`, winner);
        }
      }, 700);
    };

    const startMatchTimer = () => {
      if (turnTimeLimit <= 0 || phase === 'ROUND_OVER') return;
      lastTick = Date.now();
      updateTimerDisplay();
      if (timerInterval !== null) return;
      timerInterval = setInterval(() => {
        if (!document.body.contains(modal) || phase === 'ROUND_OVER') {
          stopMatchTimer();
          return;
        }
        const now = Date.now();
        const elapsed = Math.max(0, (now - lastTick) / 1000);
        lastTick = now;

        const activeIdx = activeGamePlayerIndex === 1 ? 1 : 0;
        playerTimeRemaining[activeIdx] = Math.max(0, playerTimeRemaining[activeIdx] - elapsed);
        updateTimerDisplay();

        if (playerTimeRemaining[activeIdx] <= 0) {
          const otherIdx = 1 - activeIdx;
          if (playerTimeRemaining[otherIdx] > 0) {
            const timedOutPlayer = activeGamePlayers[activeIdx];
            const timedOutName = timedOutPlayer?.student_name || timedOutPlayer?.name || 'Player';
            if (typeof toast === 'function') {
              toast(`⏱ ${timedOutName} ran out of time and will be skipped!`);
            }
            activeGamePlayerIndex = otherIdx;
            lastTick = Date.now();
            phase = 'MCQ';
            currentQuestion = generateMCQ(allWords);
            updateTimerDisplay();
            updateStatus();
            renderQuestion();
            renderBoard();
            scheduleBotTurnIfNeeded();
            return;
          }
          handleMatchTimeout();
        }
      }, 250);
    };
    const startTurnTimer = startMatchTimer;

    const modal = document.createElement('div');
    modal.className = 'dots-game-modal ga-stage';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Dots and Boxes Game');

    const themes = window.gaThemes || [
      { id: 'classroom', name: 'Classroom', subtitle: 'Chalkboard style' },
      { id: 'jungle', name: 'Jungle', subtitle: 'Wild expedition' },
      { id: 'toybox', name: 'Toybox', subtitle: 'Playful blocks' },
      { id: 'halloween', name: 'Haunted Manor', subtitle: 'Spooky thrill' },
      { id: 'classic', name: 'Classic', subtitle: 'Arcade neon' }
    ];
    const initialThemeId = (typeof window.gaGetTheme === 'function' ? window.gaGetTheme() : 'classroom') || 'classroom';
    const initialThemeObj = themes.find((t) => t.id === initialThemeId) || themes[0];
    modal.dataset.gaTheme = initialThemeObj.id;
    modal._stopPlayerTurnTimer = stopMatchTimer;

    const p1 = activeGamePlayers[0];
    const p2 = activeGamePlayers[1];
    const p1Name = p1?.student_name || p1?.name || 'Player 1';
    const p2Name = p2?.student_name || p2?.name || 'Player 2';
    const p1AvatarUrl = p1?.avatar_url || `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p1?.avatar_pokemon_id || 25}.png`;
    const p2AvatarUrl = p2?.avatar_url || `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${p2?.avatar_pokemon_id || 133}.png`;

    const themeGridHtml = typeof window.renderThemeCardsMarkup === 'function'
      ? window.renderThemeCardsMarkup(initialThemeObj.id)
      : themes.map(t => `
          <button type="button" class="ga-theme-card ${t.id === initialThemeObj.id ? 'is-selected' : ''}" data-ga-theme-choice="${t.id}" role="radio" aria-checked="${t.id === initialThemeObj.id}">
            <div class="ga-theme-card-thumb">${t.thumbSvg || '<span class="text-lg">🎨</span>'}</div>
            <div class="ga-theme-card-info">
              <strong class="ga-theme-card-name">${esc(t.name)}</strong>
              <span class="ga-theme-card-sub">${esc(t.subtitle || '')}</span>
            </div>
          </button>
        `).join('');

    modal.innerHTML = `
      <!-- 1. Header Bar: Title, Theme Selector & Stage Controls (NO Score Box in Header) -->
      <header class="dots-header ga-stage-header">
        <div class="dots-header-title flex items-center gap-3">
          <img src="/pokeayman/assets/games/dots-and-boxes.jpg" alt="" class="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/50 shadow-md">
          <div>
            <h2 class="text-sm sm:text-base font-black text-white leading-tight">Dots & Boxes</h2>
            <p class="text-[11px] text-amber-300 font-semibold">${N}×${N} Dots · ${totalPossibleBoxes} Boxes</p>
          </div>
        </div>

        <div class="dots-header-controls">
          <!-- In-Game Visual Style / Theme Selector -->
          <div class="ga-stage-theme-wrap" id="dots-theme-wrap">
            <button type="button" class="ga-stage-theme-btn" id="dots-theme-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Change visual style" title="Change visual style">
              <span aria-hidden="true">🎨</span>
              <span class="ga-stage-theme-current">${esc(initialThemeObj.name)}</span>
            </button>
            <div class="ga-stage-theme-popover" id="dots-theme-popover" role="dialog" aria-label="Visual style" hidden>
              <div class="ga-stage-theme-popover-head"><strong>Visual style</strong><span>Switch live</span></div>
              <div class="ga-theme-grid ga-theme-grid-compact" role="radiogroup" aria-label="Choose visual style">
                ${themeGridHtml}
              </div>
            </div>
          </div>

          <button type="button" class="ga-stage-sound w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center text-xs font-bold" id="dots-sound-toggle" title="Toggle sound">🔊</button>
          <button type="button" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center text-sm font-bold" id="dots-fullscreen-btn" title="Fullscreen">⛶</button>
          <button type="button" class="ga-stage-exit w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center justify-center text-base font-bold" id="dots-close-btn" title="Exit game" aria-label="Close game">×</button>
        </div>
      </header>

      <!-- 2. Sub-Header: Duelists Score HUD with Timer (Placed UNDER the header) -->
      <div class="dots-hud-banner game-player-hud-slot">
        <div class="dots-duel-hud">
          <div class="dots-player-badge p1 is-active" id="dots-badge-p1">
            <img src="${p1AvatarUrl}" class="dots-player-avatar" alt="${esc(p1Name)}">
            <div class="dots-player-info">
              <span class="dots-player-name text-amber-300">${esc(p1Name)}</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="dots-player-score" id="dots-score-p1">0 boxes</span>
                ${matchTimeLimit > 0 ? `<span class="dots-badge-timer text-[11px] font-black text-amber-300 bg-amber-400/15 border border-amber-400/40 px-1.5 py-0.2 rounded-full" id="dots-timer-p1">⏱ ${formatTime(matchTimeLimit)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="dots-hud-center-col flex flex-col items-center justify-center px-1">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">VS</span>
            ${matchTimeLimit > 0 ? `
              <div class="dots-hud-timer mt-1 flex items-center gap-1 font-black text-xs" id="dots-hud-timer" role="timer" aria-label="Turn timer">
                <span class="dots-timer-icon">⏱</span>
                <span id="dots-timer-val">${formatTime(matchTimeLimit)}</span>
              </div>
            ` : ''}
          </div>
          <div class="dots-player-badge p2" id="dots-badge-p2">
            <img src="${p2AvatarUrl}" class="dots-player-avatar" alt="${esc(p2Name)}">
            <div class="dots-player-info">
              <span class="dots-player-name text-cyan-300">${esc(p2Name)}</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="dots-player-score" id="dots-score-p2">0 boxes</span>
                ${matchTimeLimit > 0 ? `<span class="dots-badge-timer text-[11px] font-black text-cyan-300 bg-cyan-400/15 border border-cyan-400/40 px-1.5 py-0.2 rounded-full" id="dots-timer-p2">⏱ ${formatTime(matchTimeLimit)}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Arena: Left MCQ Question Card | Right Dots & Boxes Grid -->
      <main class="dots-arena-layout dots-game-shell">
        <!-- Question Card (Left) -->
        <section class="dots-question-card" id="dots-question-section">
          <div class="dots-card-header flex items-center justify-center gap-3 pb-3 border-b border-slate-700/60 w-full text-center" id="dots-card-header">
            <img src="${p1AvatarUrl}" class="dots-q-avatar rounded-full object-contain bg-slate-950 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md flex-shrink-0" id="dots-q-avatar" alt="">
            <span class="dots-q-student-name font-black text-amber-300 tracking-wide truncate" id="dots-q-student-name">${esc(p1Name)}</span>
            ${matchTimeLimit > 0 ? `<span id="dots-q-timer" class="dots-q-timer text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-400/50 text-amber-300">⏱ ${formatTime(matchTimeLimit)}</span>` : ''}
            <span id="dots-turn-badge" class="dots-turn-badge text-xs font-black uppercase px-2.5 py-1 rounded-full hidden"></span>
          </div>

          <div class="dots-clue-img-box" id="dots-clue-box"></div>

          <!-- Word Size Controller Toolbar -->
          <div class="dots-options-toolbar" id="dots-options-toolbar">
            <div class="dots-toolbar-left">
              <span class="dots-toolbar-icon">🔤</span>
              <span class="dots-toolbar-title">Word Size</span>
            </div>
            <div class="dots-font-controls" role="group" aria-label="Word size">
              <button type="button" class="dots-font-btn" id="dots-font-dec" title="Smaller font (A−)" aria-label="Smaller font">A−</button>
              <span class="dots-font-indicator" id="dots-font-indicator">Medium</span>
              <button type="button" class="dots-font-btn" id="dots-font-inc" title="Larger font (A+)" aria-label="Larger font">A+</button>
            </div>
          </div>

          <div class="dots-choices-grid" id="dots-choices-grid"></div>

          <div class="dots-penalty-hint text-center text-xs font-semibold text-amber-300/80 mt-1" id="dots-penalty-hint">
            ⚡ Wrong answer gives your opponent 2 turns to play!
          </div>
        </section>

        <!-- Board (Right: removed text above the game box) -->
        <section class="dots-board-wrapper">
          <div class="dots-board-grid" id="dots-board-grid"></div>
        </section>
      </main>

      <!-- Zoom Image Lightbox Modal -->
      <div class="dots-lightbox" id="dots-img-lightbox" hidden role="dialog" aria-modal="true" aria-label="Zoomed vocabulary picture">
        <div class="dots-lightbox-backdrop" id="dots-lightbox-backdrop"></div>
        <div class="dots-lightbox-content">
          <button type="button" class="dots-lightbox-close" id="dots-lightbox-close" aria-label="Close" title="Close (Esc)">✕</button>
          <img class="dots-lightbox-img" id="dots-lightbox-img" src="" alt="Zoomed vocabulary clue">
          <div class="dots-lightbox-footer">
            <span class="dots-lightbox-hint">Tap anywhere or press Esc to close</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('ga-playing');

    // Apply active theme immediately
    if (typeof window.gaApplyThemeToStage === 'function') {
      window.gaApplyThemeToStage(modal, initialThemeObj.id);
    }

    // Live theme switcher behavior within the game itself
    const themeWrap = modal.querySelector('#dots-theme-wrap');
    const themeBtn = modal.querySelector('#dots-theme-btn');
    const themePopover = modal.querySelector('#dots-theme-popover');
    const themeCurrent = modal.querySelector('.ga-stage-theme-current');

    const setThemePopoverOpen = (open) => {
      if (!themePopover || !themeBtn) return;
      themePopover.hidden = !open;
      themeBtn.setAttribute('aria-expanded', String(open));
      themeWrap?.classList.toggle('is-open', open);
    };

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setThemePopoverOpen(themePopover?.hidden ?? true);
    });

    themePopover?.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.target.closest('[data-ga-theme-choice]');
      if (!card) return;
      const chosenThemeId = card.dataset.gaThemeChoice;
      if (typeof window.gaSetTheme === 'function') {
        window.gaSetTheme(chosenThemeId);
      }
      modal.dataset.gaTheme = chosenThemeId;
      if (typeof window.gaApplyThemeToStage === 'function') {
        window.gaApplyThemeToStage(modal, chosenThemeId);
      }
      const found = themes.find((t) => t.id === chosenThemeId);
      if (themeCurrent && found) {
        themeCurrent.textContent = found.name;
      }
      themePopover.querySelectorAll('[data-ga-theme-choice]').forEach((b) => {
        const isActive = b.dataset.gaThemeChoice === chosenThemeId;
        b.classList.toggle('is-selected', isActive);
        b.setAttribute('aria-checked', String(isActive));
      });
      setThemePopoverOpen(false);
    });

    modal.addEventListener('click', (e) => {
      if (themePopover && !themePopover.hidden && themeWrap && !themeWrap.contains(e.target)) {
        setThemePopoverOpen(false);
      }
    });

    // Sound toggle
    const soundBtn = modal.querySelector('#dots-sound-toggle');
    const updateSoundBtn = () => {
      const muted = window.pokeSfx?.isMuted?.() || false;
      if (soundBtn) soundBtn.textContent = muted ? '🔇' : '🔊';
    };
    updateSoundBtn();
    soundBtn?.addEventListener('click', () => {
      if (window.pokeSfx?.setMuted) {
        window.pokeSfx.setMuted(!window.pokeSfx.isMuted());
        updateSoundBtn();
      }
    });

    // Fullscreen toggle
    modal.querySelector('#dots-fullscreen-btn')?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await modal.requestFullscreen();
      } catch (_) {}
    });

    // Word size controller setup
    const WORD_SIZES = [
      { id: 'S', label: 'Small', rem: '0.88rem' },
      { id: 'M', label: 'Medium', rem: '1.08rem' },
      { id: 'L', label: 'Large', rem: '1.35rem' },
      { id: 'XL', label: 'Huge', rem: '1.68rem' }
    ];

    let wordSizeIdx = 1;
    try {
      const savedIdx = parseInt(localStorage.getItem('pokeayman_dots_word_size_idx') || '1', 10);
      if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < WORD_SIZES.length) {
        wordSizeIdx = savedIdx;
      }
    } catch (_) {}

    const applyWordSize = (idx) => {
      wordSizeIdx = Math.max(0, Math.min(WORD_SIZES.length - 1, idx));
      const current = WORD_SIZES[wordSizeIdx];
      const qSection = modal.querySelector('#dots-question-section');
      const indicator = modal.querySelector('#dots-font-indicator');
      const decBtn = modal.querySelector('#dots-font-dec');
      const incBtn = modal.querySelector('#dots-font-inc');

      if (qSection) {
        qSection.style.setProperty('--dots-choice-font-size', current.rem);
      }
      if (indicator) {
        indicator.textContent = current.label;
      }
      if (decBtn) {
        decBtn.disabled = wordSizeIdx === 0;
      }
      if (incBtn) {
        incBtn.disabled = wordSizeIdx === WORD_SIZES.length - 1;
      }
      try {
        localStorage.setItem('pokeayman_dots_word_size_idx', String(wordSizeIdx));
      } catch (_) {}
    };

    modal.querySelector('#dots-font-dec')?.addEventListener('click', (e) => {
      e.stopPropagation();
      applyWordSize(wordSizeIdx - 1);
    });
    modal.querySelector('#dots-font-inc')?.addEventListener('click', (e) => {
      e.stopPropagation();
      applyWordSize(wordSizeIdx + 1);
    });
    applyWordSize(wordSizeIdx);

    // Zoom Image Lightbox setup
    const lightbox = modal.querySelector('#dots-img-lightbox');
    const lightboxImg = modal.querySelector('#dots-lightbox-img');
    const lightboxClose = modal.querySelector('#dots-lightbox-close');
    const lightboxBackdrop = modal.querySelector('#dots-lightbox-backdrop');

    const openLightbox = (imgSrc) => {
      if (!lightbox || !lightboxImg || !imgSrc) return;
      lightboxImg.src = imgSrc;
      lightbox.hidden = false;
      lightbox.classList.add('is-open');
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      lightbox.classList.remove('is-open');
      if (lightboxImg) lightboxImg.src = '';
    };

    lightboxClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
    lightboxBackdrop?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxBackdrop || e.target === lightboxImg) {
        closeLightbox();
      }
    });

    const onGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);

    let botTurnTimer = null;
    const clearBotTurn = () => {
      if (botTurnTimer) {
        clearTimeout(botTurnTimer);
        botTurnTimer = null;
      }
    };

    const checkBotTurn = () => {
      clearBotTurn();
      if (phase === 'ROUND_OVER' || !document.body.contains(modal)) return;
      const curPlayer = activeGamePlayers[activeGamePlayerIndex];
      if (!curPlayer?.isBot) return;

      const diff = curPlayer.botDifficulty || window.selectedBotDifficulty || 'normal';
      const isHard = diff === 'hard';
      const isNormal = diff === 'normal' || diff === 'medium';

      if (phase === 'MCQ') {
        botTurnTimer = setTimeout(() => {
          botTurnTimer = null;
          if (phase !== 'MCQ' || !document.body.contains(modal)) return;
          const buttons = Array.from(modal.querySelectorAll('.dots-choice-btn:not([disabled])'));
          if (!buttons.length || !currentQuestion) return;

          const targetWord = String(currentQuestion.correctAnswer || '').trim().toLowerCase();
          const correctBtn = buttons.find(b => String(b.dataset.option || '').trim().toLowerCase() === targetWord);
          const wrongBtns = buttons.filter(b => b !== correctBtn);

          const acc = isHard ? 0.95 : (isNormal ? 0.75 : 0.50);
          const pickCorrect = Math.random() < acc && correctBtn;
          const chosen = (pickCorrect ? correctBtn : (wrongBtns[0] || correctBtn));
          chosen?.click();
        }, 900);
      } else if (phase === 'DRAW_LINE') {
        botTurnTimer = setTimeout(() => {
          botTurnTimer = null;
          if (phase !== 'DRAW_LINE' || !document.body.contains(modal)) return;

          const availableH = [];
          for (let r = 0; r < N; r++) {
            for (let c = 0; c < numBoxes; c++) {
              if (horizontalLines[`${r}-${c}`] === null) availableH.push({ type: 'H', r, c });
            }
          }
          const availableV = [];
          for (let r = 0; r < numBoxes; r++) {
            for (let c = 0; c < N; c++) {
              if (verticalLines[`${r}-${c}`] === null) availableV.push({ type: 'V', r, c });
            }
          }
          const allAvailable = [...availableH, ...availableV];
          if (!allAvailable.length) return;

          const getBoxEdges = (r, c) => [
            { type: 'H', r, c },
            { type: 'H', r: r + 1, c },
            { type: 'V', r, c },
            { type: 'V', r, c: c + 1 }
          ];

          const isEdgeDrawn = (edge) => {
            const key = `${edge.r}-${edge.c}`;
            return edge.type === 'H' ? horizontalLines[key] !== null : verticalLines[key] !== null;
          };

          const getBoxState = (r, c) => {
            if (boxes[`${r}-${c}`] !== null) return { completed: true, drawnCount: 4, missingEdges: [] };
            const edges = getBoxEdges(r, c);
            const drawn = edges.filter(isEdgeDrawn);
            const missing = edges.filter(e => !isEdgeDrawn(e));
            return { completed: false, drawnCount: drawn.length, missingEdges: missing };
          };

          const completesBox = (line) => {
            let count = 0;
            for (let r = 0; r < numBoxes; r++) {
              for (let c = 0; c < numBoxes; c++) {
                if (boxes[`${r}-${c}`] !== null) continue;
                let filled = 0;
                if (horizontalLines[`${r}-${c}`] !== null || (line.type === 'H' && line.r === r && line.c === c)) filled++;
                if (horizontalLines[`${r + 1}-${c}`] !== null || (line.type === 'H' && line.r === r + 1 && line.c === c)) filled++;
                if (verticalLines[`${r}-${c}`] !== null || (line.type === 'V' && line.r === r && line.c === c)) filled++;
                if (verticalLines[`${r}-${c + 1}`] !== null || (line.type === 'V' && line.r === r && line.c === c + 1)) filled++;
                if (filled === 4) count++;
              }
            }
            return count;
          };

          let chosenMove = null;

          // Priority 1: Complete any box with 3 sides drawn (claims point & extra turn immediately)
          const completingMoves = allAvailable.filter(m => completesBox(m) > 0);
          if (completingMoves.length > 0) {
            if (isHard || (isNormal && Math.random() < 0.90) || (!isHard && !isNormal && Math.random() < 0.50)) {
              completingMoves.sort((a, b) => completesBox(b) - completesBox(a));
              chosenMove = completingMoves[0];
            }
          }

          // Priority 2: Smart 2-turn combo when player made a wrong answer (bot has 2 consecutive turns).
          // If a box has 2 sides connected (90-degree corner), draw 1 missing edge on Turn 1 so it reaches
          // 3 sides, setting up the 2nd turn to immediately close the box and claim the point!
          if (!chosenMove && consecutiveTurnsRemaining > 1 && (isHard || (isNormal && Math.random() < 0.85))) {
            const twoSidedBoxes = [];
            for (let r = 0; r < numBoxes; r++) {
              for (let c = 0; c < numBoxes; c++) {
                const state = getBoxState(r, c);
                if (!state.completed && state.drawnCount === 2 && state.missingEdges.length === 2) {
                  twoSidedBoxes.push({ r, c, missingEdges: state.missingEdges });
                }
              }
            }
            if (twoSidedBoxes.length > 0) {
              const targetBox = twoSidedBoxes[0];
              const candEdge = targetBox.missingEdges[0];
              const match = allAvailable.find(m => m.type === candEdge.type && m.r === candEdge.r && m.c === candEdge.c);
              if (match) chosenMove = match;
            }
          }

          // Priority 3: Safe moves that do NOT create a 3-sided box for the opponent
          if (!chosenMove && (isHard || (isNormal && Math.random() < 0.80))) {
            const safeMoves = allAvailable.filter(m => {
              const touchingBoxes = [];
              if (m.type === 'H') {
                if (m.r > 0) touchingBoxes.push({ r: m.r - 1, c: m.c });
                if (m.r < numBoxes) touchingBoxes.push({ r: m.r, c: m.c });
              } else {
                if (m.c > 0) touchingBoxes.push({ r: m.r, c: m.c - 1 });
                if (m.c < numBoxes) touchingBoxes.push({ r: m.r, c: m.c });
              }
              for (const b of touchingBoxes) {
                const state = getBoxState(b.r, b.c);
                if (!state.completed && state.drawnCount === 2) {
                  return false;
                }
              }
              return true;
            });
            if (safeMoves.length > 0) {
              chosenMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            }
          }

          // Fallback: pick any available move
          if (!chosenMove) {
            chosenMove = allAvailable[Math.floor(Math.random() * allAvailable.length)];
          }

          if (chosenMove) {
            handleDrawLine(chosenMove.type, chosenMove.r, chosenMove.c);
          }
        }, 800);
      }
    };

    const cleanupAndClose = () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
      closeLightbox();
      stopMatchTimer();
      clearBotTurn();
      if (typeof stopPlayerTurnTimer === 'function') stopPlayerTurnTimer(modal);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      modal.remove();
      document.body.classList.remove('ga-playing');
      if (typeof endActiveGames === 'function') {
        endActiveGames();
      } else if (typeof window.gaExitSetupToArcade === 'function') {
        window.gaExitSetupToArcade();
      }
    };
    modal.querySelector('#dots-close-btn')?.addEventListener('click', cleanupAndClose);

    const updateStatus = () => {
      const activePlayer = activeGamePlayerIndex === 0 ? p1 : p2;
      const activePlayerName = activePlayer?.student_name || activePlayer?.name || (activeGamePlayerIndex === 0 ? 'Player 1' : 'Player 2');
      const isP1 = activeGamePlayerIndex === 0;
      const activeAvatar = isP1 ? p1AvatarUrl : p2AvatarUrl;
      const statusText = modal.querySelector('#dots-status-text');
      const badgeP1 = modal.querySelector('#dots-badge-p1');
      const badgeP2 = modal.querySelector('#dots-badge-p2');
      const scoreP1 = modal.querySelector('#dots-score-p1');
      const scoreP2 = modal.querySelector('#dots-score-p2');
      const boxesLeft = modal.querySelector('#dots-boxes-left');
      const qAvatar = modal.querySelector('#dots-q-avatar');
      const qName = modal.querySelector('#dots-q-student-name');
      const turnBadge = modal.querySelector('#dots-turn-badge');

      badgeP1?.classList.toggle('is-active', isP1);
      badgeP2?.classList.toggle('is-active', !isP1);

      if (scoreP1) scoreP1.textContent = `${activeGameScores[0]} box${activeGameScores[0] === 1 ? '' : 'es'}`;
      if (scoreP2) scoreP2.textContent = `${activeGameScores[1]} box${activeGameScores[1] === 1 ? '' : 'es'}`;

      const completed = Object.values(boxes).filter((b) => b !== null).length;
      if (boxesLeft) boxesLeft.textContent = String(totalPossibleBoxes - completed);

      if (qAvatar) {
        if (activeAvatar) {
          qAvatar.src = activeAvatar;
          qAvatar.style.display = 'block';
          qAvatar.className = `dots-q-avatar rounded-full object-contain bg-slate-950 border-2 ${isP1 ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_14px_rgba(251,191,36,0.5)]' : 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_14px_rgba(56,189,248,0.5)]'} flex-shrink-0`;
        } else {
          qAvatar.style.display = 'none';
        }
      }

      if (qName) {
        qName.textContent = activePlayerName;
        qName.className = `dots-q-student-name font-black tracking-wide truncate ${isP1 ? 'text-amber-300' : 'text-cyan-300'}`;
      }

      if (turnBadge) {
        if (consecutiveTurnsRemaining === 2) {
          turnBadge.textContent = '⚡ 2 Turns (Turn 1)';
          turnBadge.className = `dots-turn-badge text-xs font-black uppercase px-2.5 py-1 rounded-full ${isP1 ? 'bg-amber-400/20 text-amber-300 border-amber-400/50' : 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50'} border animate-pulse`;
        } else if (consecutiveTurnsRemaining === 1) {
          turnBadge.textContent = '⚡ Bonus Turn (Turn 2)';
          turnBadge.className = `dots-turn-badge text-xs font-black uppercase px-2.5 py-1 rounded-full ${isP1 ? 'bg-amber-400/20 text-amber-300 border-amber-400/50' : 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50'} border animate-pulse`;
        } else {
          turnBadge.className = 'hidden';
        }
      }

      if (statusText) {
        if (phase === 'MCQ') {
          statusText.innerHTML = `<span class="${isP1 ? 'text-amber-300' : 'text-cyan-300'} font-black">${esc(activePlayerName)}</span>'s Turn: Choose the correct word for the picture!`;
        } else if (phase === 'DRAW_LINE') {
          statusText.innerHTML = `⭐ Correct! <span class="${isP1 ? 'text-amber-300' : 'text-cyan-300'} font-black">${esc(activePlayerName)}</span>, click any available horizontal or vertical line!`;
        } else if (phase === 'ROUND_OVER') {
          statusText.innerHTML = `<span class="text-emerald-400 font-black">Match Complete!</span> Calculating winner...`;
        }
      }

      updateTimerDisplay();
      checkBotTurn();
    };

    const renderQuestion = () => {
      const clueBox = modal.querySelector('#dots-clue-box');
      const choicesGrid = modal.querySelector('#dots-choices-grid');

      if (!currentQuestion) {
        currentQuestion = generateMCQ(allWords, null);
      }
      if (!currentQuestion || !clueBox || !choicesGrid) return;

      const item = currentQuestion.wordItem;
      const imageUrl = item.vocab_image || item.image_url || item.image || '';

      if (imageUrl) {
        clueBox.classList.add('has-image');
        clueBox.setAttribute('title', 'Click to view larger picture');
        clueBox.innerHTML = `
          <img src="${esc(imageUrl)}" alt="Vocabulary clue picture" class="object-contain" loading="eager">
          <div class="dots-clue-zoom-hint" aria-hidden="true"><span>🔍</span><span>Zoom</span></div>
        `;
        clueBox.onclick = () => openLightbox(imageUrl);
      } else {
        clueBox.classList.remove('has-image');
        clueBox.removeAttribute('title');
        clueBox.onclick = null;
        clueBox.innerHTML = `<div class="p-4 text-center"><span class="text-4xl block mb-2">📖</span><p class="text-sm font-bold text-amber-200">${esc(item.vocab_translation || item.vocab_definition || item.vocab_word)}</p></div>`;
      }

      const letters = ['A', 'B', 'C', 'D'];
      choicesGrid.innerHTML = currentQuestion.options
        .map(
          (opt, i) => `
        <button type="button" class="dots-choice-btn" data-option="${esc(opt)}" ${phase !== 'MCQ' ? 'disabled' : ''}>
          <span class="dots-choice-letter">${letters[i]}</span>
          <span class="dots-choice-text truncate">${esc(opt)}</span>
        </button>
      `
        )
        .join('');

      choicesGrid.querySelectorAll('.dots-choice-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          if (phase !== 'MCQ') return;
          const curPlayer = activeGamePlayers[activeGamePlayerIndex];
          if (curPlayer?.isBot && e.isTrusted) return;
          const choice = btn.dataset.option;
          handleMCQAnswer(choice, btn);
        });
      });
    };

    const handleMCQAnswer = (selected, btn) => {
      if (phase !== 'MCQ' || !currentQuestion) return;

      if (selected === currentQuestion.correctAnswer) {
        try { window.pokeSfx?.play?.('correct'); } catch (e) {}
        if (typeof window.readGameWordAloud === 'function') {
          window.readGameWordAloud(currentQuestion.correctAnswer);
        }
        // Do NOT pause or stop the timer: clock keeps running continuously during DRAW_LINE!
        btn.classList.add('is-correct');
        btn.style.borderColor = '#10b981';
        btn.style.backgroundColor = 'rgba(16, 185, 129, 0.35)';
        btn.style.boxShadow = '0 0 18px rgba(16, 185, 129, 0.7)';

        modal.querySelectorAll('.dots-choice-btn').forEach((b) => {
          b.disabled = true;
          if (b !== btn) {
            b.style.opacity = '0.35';
          }
        });

        phase = 'DRAW_LINE';
        updateStatus();
        renderBoard();
      } else {
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
        if (typeof window.readGameWordAloud === 'function') {
          window.readGameWordAloud(currentQuestion.correctAnswer, 350);
        }
        btn.classList.add('is-wrong', 'dots-choice-shake');
        btn.style.borderColor = '#ef4444';
        btn.style.backgroundColor = 'rgba(239, 68, 68, 0.35)';
        btn.style.boxShadow = '0 0 18px rgba(239, 68, 68, 0.7)';

        modal.querySelectorAll('.dots-choice-btn').forEach((b) => {
          b.disabled = true;
        });

        const correctBtn = modal.querySelector(`.dots-choice-btn[data-option="${esc(currentQuestion.correctAnswer)}"]`);
        if (correctBtn) {
          correctBtn.style.borderColor = '#10b981';
          correctBtn.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
        }

        // New game rule: NO -1 point deduction! Opponent gets 2 turns!
        consecutiveTurnsRemaining = 2;
        if (typeof toast === 'function') {
          const nextPlayer = activeGamePlayerIndex === 0 ? p2 : p1;
          const nextName = nextPlayer?.student_name || nextPlayer?.name || 'Opponent';
          toast(`⚡ Wrong! ${nextName} gets 2 turns in a row!`);
        }

        setTimeout(() => {
          if (phase === 'ROUND_OVER') return;
          const nextIdx = 1 - activeGamePlayerIndex;
          if (playerTimeRemaining[nextIdx] > 0 || playerTimeRemaining[activeGamePlayerIndex] <= 0) {
            activeGamePlayerIndex = nextIdx;
          }
          lastTick = Date.now();
          currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
          phase = 'MCQ';

          updateStatus();
          renderQuestion();
          renderBoard();
          startMatchTimer();
        }, 1450);
      }
    };

    const startPullFromDot = (e, startR, startC, startDotEl) => {
      if (phase !== 'DRAW_LINE') return;
      const curPlayer = activeGamePlayers[activeGamePlayerIndex];
      if (curPlayer?.isBot && e.isTrusted) return;
      e.preventDefault();
      e.stopPropagation();

      const grid = modal.querySelector('#dots-board-grid');
      if (!grid) return;

      let svg = grid.querySelector('.dots-pull-overlay');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'dots-pull-overlay');
        grid.appendChild(svg);
      }
      svg.innerHTML = '';

      const gridRect = grid.getBoundingClientRect();
      const dotRect = startDotEl.getBoundingClientRect();
      const startX = dotRect.left + dotRect.width / 2 - gridRect.left;
      const startY = dotRect.top + dotRect.height / 2 - gridRect.top;

      const isP1 = activeGamePlayerIndex === 0;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(startX));
      line.setAttribute('y1', String(startY));
      line.setAttribute('x2', String(startX));
      line.setAttribute('y2', String(startY));
      line.setAttribute('class', `dots-pull-live-line ${isP1 ? 'p1-pull' : 'p2-pull'}`);
      svg.appendChild(line);

      startDotEl.classList.add('is-pulling-origin');

      pullState = {
        startR,
        startC,
        startX,
        startY,
        startDotEl,
        svg,
        line,
        activeTargetDot: null,
        targetLine: null
      };

      try { window.pokeSfx?.play?.('click'); } catch (_) {}

      const onPointerMove = (moveEv) => {
        if (!pullState) return;
        const curGridRect = grid.getBoundingClientRect();
        const curX = moveEv.clientX - curGridRect.left;
        const curY = moveEv.clientY - curGridRect.top;

        // Orthogonal neighbor candidates
        const candidates = [
          { r: pullState.startR - 1, c: pullState.startC, type: 'V', lineR: pullState.startR - 1, lineC: pullState.startC }, // Up
          { r: pullState.startR + 1, c: pullState.startC, type: 'V', lineR: pullState.startR, lineC: pullState.startC },     // Down
          { r: pullState.startR, c: pullState.startC - 1, type: 'H', lineR: pullState.startR, lineC: pullState.startC - 1 }, // Left
          { r: pullState.startR, c: pullState.startC + 1, type: 'H', lineR: pullState.startR, lineC: pullState.startC }      // Right
        ].filter((cand) => cand.r >= 0 && cand.r < N && cand.c >= 0 && cand.c < N);

        let closestNeighbor = null;
        let minDistance = 46;

        for (const cand of candidates) {
          const dotEl = grid.querySelector(`.dots-node[data-r="${cand.r}"][data-c="${cand.c}"]`);
          if (!dotEl) continue;
          const dRect = dotEl.getBoundingClientRect();
          const dX = dRect.left + dRect.width / 2 - curGridRect.left;
          const dY = dRect.top + dRect.height / 2 - curGridRect.top;
          const dist = Math.hypot(curX - dX, curY - dY);
          if (dist < minDistance) {
            minDistance = dist;
            closestNeighbor = { ...cand, dotEl, snapX: dX, snapY: dY };
          }
        }

        if (pullState.activeTargetDot && pullState.activeTargetDot !== closestNeighbor?.dotEl) {
          pullState.activeTargetDot.classList.remove('is-pull-target');
          pullState.activeTargetDot = null;
          pullState.targetLine = null;
        }

        if (closestNeighbor) {
          pullState.line.setAttribute('x2', String(closestNeighbor.snapX));
          pullState.line.setAttribute('y2', String(closestNeighbor.snapY));
          closestNeighbor.dotEl.classList.add('is-pull-target');
          pullState.activeTargetDot = closestNeighbor.dotEl;
          pullState.targetLine = closestNeighbor;
        } else {
          pullState.line.setAttribute('x2', String(curX));
          pullState.line.setAttribute('y2', String(curY));
        }
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        if (!pullState) return;
        const target = pullState.targetLine;

        if (pullState.startDotEl) pullState.startDotEl.classList.remove('is-pulling-origin');
        if (pullState.activeTargetDot) pullState.activeTargetDot.classList.remove('is-pull-target');
        if (pullState.svg) pullState.svg.innerHTML = '';

        pullState = null;

        if (target) {
          const key = `${target.lineR}-${target.lineC}`;
          const isDrawn = target.type === 'H' ? horizontalLines[key] !== null : verticalLines[key] !== null;
          if (!isDrawn) {
            handleDrawLine(target.type, target.lineR, target.lineC);
          }
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    const renderBoard = () => {
      const grid = modal.querySelector('#dots-board-grid');
      if (!grid) return;
      const isP1 = activeGamePlayerIndex === 0;
      const turnClass = isP1 ? 'p1-turn' : 'p2-turn';

      // Dynamic grid track sizing: 28px dot tracks, boxes take 1fr to fill available square
      const dotTrack = '28px';
      const colDefs = [];
      const rowDefs = [];
      for (let i = 0; i < N - 1; i++) {
        colDefs.push('28px', '1fr');
        rowDefs.push('28px', '1fr');
      }
      colDefs.push('28px');
      rowDefs.push('28px');

      grid.style.gridTemplateColumns = colDefs.join(' ');
      grid.style.gridTemplateRows = rowDefs.join(' ');
      grid.innerHTML = '';

      // Persistent SVG layer for animated live pull gesture
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'dots-pull-overlay');
      grid.appendChild(svg);

      const totalGridRows = 2 * N - 1;
      const totalGridCols = 2 * N - 1;

      for (let gr = 0; gr < totalGridRows; gr++) {
        for (let gc = 0; gc < totalGridCols; gc++) {
          const isEvenR = gr % 2 === 0;
          const isEvenC = gc % 2 === 0;

          if (isEvenR && isEvenC) {
            // Dot Node
            const dotR = gr / 2;
            const dotC = gc / 2;
            const dot = document.createElement('div');
            dot.className = `dots-node ${phase === 'DRAW_LINE' ? 'is-pullable' : ''}`;
            dot.dataset.r = String(dotR);
            dot.dataset.c = String(dotC);
            dot.setAttribute('aria-label', `Dot at row ${dotR}, col ${dotC}`);

            if (phase === 'DRAW_LINE') {
              dot.addEventListener('pointerdown', (e) => startPullFromDot(e, dotR, dotC, dot));
            }
            grid.appendChild(dot);
          } else if (isEvenR && !isEvenC) {
            // Horizontal line button (Full line stretching between horizontal dots)
            const r = gr / 2;
            const c = (gc - 1) / 2;
            const key = `${r}-${c}`;
            const drawnBy = horizontalLines[key];

            const isDrawn = drawnBy !== null;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `dots-line-h ${phase === 'DRAW_LINE' && !isDrawn ? 'dots-line-clickable' : ''}`;
            btn.setAttribute('aria-label', `Horizontal line at row ${r}, col ${c}`);
            btn.disabled = isDrawn || phase !== 'DRAW_LINE';
            btn.style.width = '100%';
            btn.style.height = dotTrack;
            btn.style.justifySelf = 'stretch';
            btn.style.alignSelf = 'center';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';

            const bar = document.createElement('span');
            bar.className = `dots-line-h-bar ${isDrawn ? 'is-drawn' : 'is-empty'}`;
            bar.style.display = 'block';
            bar.style.width = '100%';
            bar.style.minWidth = '100%';
            bar.style.flex = '1 1 100%';
            if (isDrawn) {
              if (drawnBy === 0) bar.classList.add('dots-line-drawn-p1');
              else if (drawnBy === 1) bar.classList.add('dots-line-drawn-p2');
            } else if (phase === 'DRAW_LINE') {
              bar.classList.add(turnClass);
            }

            if (lastDrawn && lastDrawn.type === 'H' && lastDrawn.r === r && lastDrawn.c === c) {
              bar.classList.add('dots-line-drawn-anim-h');
            }

            btn.appendChild(bar);

            if (phase === 'DRAW_LINE' && !isDrawn) {
              btn.addEventListener('click', (e) => {
                const curPlayer = activeGamePlayers[activeGamePlayerIndex];
                if (curPlayer?.isBot && e.isTrusted) return;
                handleDrawLine('H', r, c);
              });
            }
            grid.appendChild(btn);
          } else if (!isEvenR && isEvenC) {
            // Vertical line button (Full line stretching between vertical dots)
            const r = (gr - 1) / 2;
            const c = gc / 2;
            const key = `${r}-${c}`;
            const drawnBy = verticalLines[key];
            const isDrawn = drawnBy !== null;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `dots-line-v ${phase === 'DRAW_LINE' && !isDrawn ? 'dots-line-clickable' : ''}`;
            btn.setAttribute('aria-label', `Vertical line at row ${r}, col ${c}`);
            btn.disabled = isDrawn || phase !== 'DRAW_LINE';
            btn.style.alignSelf = 'stretch';
            btn.style.justifySelf = 'center';
            btn.style.height = '100%';
            btn.style.width = dotTrack;
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';

            const bar = document.createElement('span');
            bar.className = `dots-line-v-bar ${isDrawn ? 'is-drawn' : 'is-empty'}`;
            bar.style.display = 'block';
            bar.style.height = '100%';
            bar.style.minHeight = '100%';
            bar.style.flex = '1 1 100%';
            if (isDrawn) {
              if (drawnBy === 0) bar.classList.add('dots-line-drawn-p1');
              else if (drawnBy === 1) bar.classList.add('dots-line-drawn-p2');
            } else if (phase === 'DRAW_LINE') {
              bar.classList.add(turnClass);
            }

            if (lastDrawn && lastDrawn.type === 'V' && lastDrawn.r === r && lastDrawn.c === c) {
              bar.classList.add('dots-line-drawn-anim-v');
            }

            btn.appendChild(bar);

            if (phase === 'DRAW_LINE' && !isDrawn) {
              btn.addEventListener('click', (e) => {
                const curPlayer = activeGamePlayers[activeGamePlayerIndex];
                if (curPlayer?.isBot && e.isTrusted) return;
                handleDrawLine('V', r, c);
              });
            }
            grid.appendChild(btn);
          } else {
            // Box cell
            const r = (gr - 1) / 2;
            const c = (gc - 1) / 2;
            const key = `${r}-${c}`;
            const claimedBy = boxes[key];

            const box = document.createElement('div');
            box.className = 'dots-box-cell';
            if (claimedBy === 0) {
              box.classList.add('dots-box-claimed-p1');
              box.innerHTML = `<img src="${p1AvatarUrl}" class="dots-box-avatar animate-bounce" alt="${esc(p1.student_name)}'s box">`;
            } else if (claimedBy === 1) {
              box.classList.add('dots-box-claimed-p2');
              box.innerHTML = `<img src="${p2AvatarUrl}" class="dots-box-avatar animate-bounce" alt="${esc(p2.student_name)}'s box">`;
            }
            grid.appendChild(box);
          }
        }
      }

      lastDrawn = null;
    };

    const handleDrawLine = (type, row, col) => {
      if (phase !== 'DRAW_LINE') return;
      const key = `${row}-${col}`;

      if (type === 'H' && horizontalLines[key] !== null) return;
      if (type === 'V' && verticalLines[key] !== null) return;

      lastDrawn = { type, r: row, c: col };

      if (type === 'H') horizontalLines[key] = activeGamePlayerIndex;
      if (type === 'V') verticalLines[key] = activeGamePlayerIndex;

      try { window.pokeSfx?.play?.('pop'); } catch (e) {}

      let boxesCompleted = 0;
      for (let r = 0; r < numBoxes; r++) {
        for (let c = 0; c < numBoxes; c++) {
          const bKey = `${r}-${c}`;
          if (boxes[bKey] === null) {
            const top = horizontalLines[`${r}-${c}`] !== null;
            const bottom = horizontalLines[`${r + 1}-${c}`] !== null;
            const left = verticalLines[`${r}-${c}`] !== null;
            const right = verticalLines[`${r}-${c + 1}`] !== null;

            if (top && bottom && left && right) {
              boxes[bKey] = activeGamePlayerIndex;
              boxesCompleted++;
            }
          }
        }
      }

      if (boxesCompleted > 0) {
        activeGameScores[activeGamePlayerIndex] += boxesCompleted;
        try { window.pokeSfx?.play?.('coin'); } catch (e) {}
      }

      const totalClaimed = Object.values(boxes).filter((b) => b !== null).length;
      if (totalClaimed >= totalPossibleBoxes) {
        stopMatchTimer();
        phase = 'ROUND_OVER';
        updateStatus();
        renderBoard();

        const p1Score = activeGameScores[0];
        const p2Score = activeGameScores[1];
        const tied = p1Score === p2Score;
        const winner = tied ? null : (p1Score > p2Score ? p1 : p2);

        setTimeout(() => {
          if (typeof showGameCelebration === 'function') {
            showGameCelebration(modal, 'Dots & Boxes Champion!', '', winner);
          }
        }, 1000);
        return;
      }

      // Check turn progression (no timer reset: continuous match countdown!)
      // If boxes completed: player gets another turn (standard Dots & Boxes rule)
      // If NO boxes completed:
      if (boxesCompleted === 0) {
        if (consecutiveTurnsRemaining > 1) {
          consecutiveTurnsRemaining--;
          if (typeof toast === 'function') {
            const curPlayer = activeGamePlayers[activeGamePlayerIndex];
            const curName = curPlayer?.student_name || curPlayer?.name || 'Player';
            toast(`⚡ ${curName} gets their 2nd turn!`);
          }
        } else {
          consecutiveTurnsRemaining = 0;
          const nextIdx = 1 - activeGamePlayerIndex;
          if (playerTimeRemaining[nextIdx] > 0 || playerTimeRemaining[activeGamePlayerIndex] <= 0) {
            activeGamePlayerIndex = nextIdx;
          }
          lastTick = Date.now();
        }
      }

      currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
      phase = 'MCQ';

      updateStatus();
      renderQuestion();
      renderBoard();
      startMatchTimer();
    };

    updateStatus();
    renderQuestion();
    renderBoard();
    startMatchTimer();
  };
})();
