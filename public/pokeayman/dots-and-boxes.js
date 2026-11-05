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
        activeGamePlayers.push({
          student_name: 'Pikachu Bot',
          avatar_pokemon_id: 25,
          __backendId: 'bot-pikachu',
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
    // Each player has a persistent time bank (like other arcade games)
    let playerTimeRemaining = [turnTimeLimit, turnTimeLimit];
    if (typeof activeGamePlayerRemaining !== 'undefined') {
      activeGamePlayerRemaining = playerTimeRemaining;
    }
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

    const stopTurnTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    const updateTimerDisplay = () => {
      if (turnTimeLimit <= 0) return;
      const curP1 = Math.max(0, Math.ceil(playerTimeRemaining[0] || 0));
      const curP2 = Math.max(0, Math.ceil(playerTimeRemaining[1] || 0));
      const activeLeft = activeGamePlayerIndex === 0 ? curP1 : curP2;

      // 1. Center VS Timer
      const timerVal = modal?.querySelector?.('#dots-timer-val');
      const timerPill = modal?.querySelector?.('#dots-hud-timer');
      if (timerVal) timerVal.textContent = formatTime(activeLeft);
      if (timerPill) {
        const isDanger = activeLeft <= 5 || (turnTimeLimit > 0 && activeLeft / turnTimeLimit <= 0.2);
        const isWarn = !isDanger && (activeLeft <= 10 || (turnTimeLimit > 0 && activeLeft / turnTimeLimit <= 0.4));
        timerPill.classList.toggle('is-danger', isDanger);
        timerPill.classList.toggle('is-warn', isWarn);
      }

      // 2. Player 1 Badge Timer
      const p1Timer = modal?.querySelector?.('#dots-timer-p1');
      if (p1Timer) {
        p1Timer.textContent = `⏱ ${formatTime(curP1)}`;
        p1Timer.classList.toggle('text-rose-400', curP1 <= 5);
        p1Timer.classList.toggle('border-rose-500/50', curP1 <= 5);
      }

      // 3. Player 2 Badge Timer
      const p2Timer = modal?.querySelector?.('#dots-timer-p2');
      if (p2Timer) {
        p2Timer.textContent = `⏱ ${formatTime(curP2)}`;
        p2Timer.classList.toggle('text-rose-400', curP2 <= 5);
        p2Timer.classList.toggle('border-rose-500/50', curP2 <= 5);
      }

      // 4. Question Card Header Timer
      const qTimer = modal?.querySelector?.('#dots-q-timer');
      if (qTimer) {
        qTimer.textContent = `⏱ ${formatTime(activeLeft)}`;
        qTimer.classList.toggle('text-rose-400', activeLeft <= 5);
      }
    };

    const handleTimeout = () => {
      if (phase === 'ROUND_OVER') return;
      try { window.pokeSfx?.play?.('wrong'); } catch (e) {}

      const p1Time = playerTimeRemaining[0];
      const p2Time = playerTimeRemaining[1];

      // If BOTH players have no time left: Game over!
      if (p1Time <= 0 && p2Time <= 0) {
        stopTurnTimer();
        phase = 'ROUND_OVER';
        updateStatus();
        renderBoard();

        const p1Score = activeGameScores[0];
        const p2Score = activeGameScores[1];
        const tied = p1Score === p2Score;
        const winner = tied ? null : (p1Score > p2Score ? p1 : p2);

        if (typeof toast === 'function') {
          toast('⏱ Time is up for both players!');
        }

        setTimeout(() => {
          if (typeof showGameCelebration === 'function') {
            showGameCelebration(modal, 'Time is up!', '', winner);
          }
        }, 800);
        return;
      }

      // One player timed out
      const timedOutPlayer = activeGamePlayers[activeGamePlayerIndex];
      const timedOutName = timedOutPlayer?.student_name || timedOutPlayer?.name || 'Player';
      const nextIndex = 1 - activeGamePlayerIndex;
      const nextPlayer = activeGamePlayers[nextIndex];
      const nextName = nextPlayer?.student_name || nextPlayer?.name || 'Opponent';

      if (typeof toast === 'function') {
        toast(`⏱ ${timedOutName}'s time ran out! Turn passes to ${nextName}!`);
      }

      consecutiveTurnsRemaining = 0;
      activeGamePlayerIndex = nextIndex;
      lastTick = Date.now();
      currentQuestion = generateMCQ(allWords, currentQuestion?.wordItem);
      phase = 'MCQ';
      updateStatus();
      renderQuestion();
      renderBoard();
      updateTimerDisplay();
    };

    const startTurnTimer = () => {
      if (turnTimeLimit <= 0 || phase === 'ROUND_OVER') return;
      lastTick = Date.now();
      updateTimerDisplay();
      if (timerInterval !== null) return;
      timerInterval = setInterval(() => {
        if (!document.body.contains(modal) || phase === 'ROUND_OVER') {
          stopTurnTimer();
          return;
        }
        const now = Date.now();
        const elapsed = Math.max(0, (now - lastTick) / 1000);
        lastTick = now;

        if (playerTimeRemaining[activeGamePlayerIndex] > 0) {
          playerTimeRemaining[activeGamePlayerIndex] = Math.max(0, playerTimeRemaining[activeGamePlayerIndex] - elapsed);
          if (typeof activeGamePlayerRemaining !== 'undefined' && Array.isArray(activeGamePlayerRemaining)) {
            activeGamePlayerRemaining[activeGamePlayerIndex] = playerTimeRemaining[activeGamePlayerIndex];
          }
        }
        updateTimerDisplay();

        if (playerTimeRemaining[activeGamePlayerIndex] <= 0) {
          handleTimeout();
        }
      }, 250);
    };

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
    modal._stopPlayerTurnTimer = stopTurnTimer;

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
                ${turnTimeLimit > 0 ? `<span class="dots-badge-timer text-[11px] font-black text-amber-300 bg-amber-400/15 border border-amber-400/40 px-1.5 py-0.2 rounded-full" id="dots-timer-p1">⏱ ${formatTime(turnTimeLimit)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="dots-hud-center-col flex flex-col items-center justify-center px-1">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">VS</span>
            ${turnTimeLimit > 0 ? `
              <div class="dots-hud-timer mt-1 flex items-center gap-1 font-black text-xs" id="dots-hud-timer" role="timer" aria-label="Turn timer">
                <span class="dots-timer-icon">⏱</span>
                <span id="dots-timer-val">${formatTime(turnTimeLimit)}</span>
              </div>
            ` : ''}
          </div>
          <div class="dots-player-badge p2" id="dots-badge-p2">
            <img src="${p2AvatarUrl}" class="dots-player-avatar" alt="${esc(p2Name)}">
            <div class="dots-player-info">
              <span class="dots-player-name text-cyan-300">${esc(p2Name)}</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="dots-player-score" id="dots-score-p2">0 boxes</span>
                ${turnTimeLimit > 0 ? `<span class="dots-badge-timer text-[11px] font-black text-cyan-300 bg-cyan-400/15 border border-cyan-400/40 px-1.5 py-0.2 rounded-full" id="dots-timer-p2">⏱ ${formatTime(turnTimeLimit)}</span>` : ''}
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
            ${turnTimeLimit > 0 ? `<span id="dots-q-timer" class="dots-q-timer text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-400/50 text-amber-300">⏱ ${formatTime(turnTimeLimit)}</span>` : ''}
            <span id="dots-turn-badge" class="dots-turn-badge text-xs font-black uppercase px-2.5 py-1 rounded-full hidden"></span>
          </div>

          <div class="dots-clue-img-box" id="dots-clue-box"></div>

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

    const cleanupAndClose = () => {
      stopTurnTimer();
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

      const qTimer = modal.querySelector('#dots-q-timer');
      if (qTimer) {
        qTimer.className = `dots-q-timer text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 border ${isP1 ? 'border-amber-400/50 text-amber-300' : 'border-cyan-400/50 text-cyan-300'}`;
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
    };

    const renderQuestion = () => {
      const clueBox = modal.querySelector('#dots-clue-box');
      const choicesGrid = modal.querySelector('#dots-choices-grid');

      if (!currentQuestion) {
        currentQuestion = generateMCQ(allWords, null);
      }
      if (!currentQuestion || !clueBox || !choicesGrid) return;

      const item = currentQuestion.wordItem;
      const imageUrl = item.vocab_image || item.image_url || '';

      if (imageUrl) {
        clueBox.innerHTML = `<img src="${esc(imageUrl)}" alt="Vocabulary clue picture" class="object-contain" loading="eager">`;
      } else {
        clueBox.innerHTML = `<div class="p-4 text-center"><span class="text-4xl block mb-2">📖</span><p class="text-sm font-bold text-amber-200">${esc(item.vocab_translation || item.vocab_definition || item.vocab_word)}</p></div>`;
      }

      const letters = ['A', 'B', 'C', 'D'];
      choicesGrid.innerHTML = currentQuestion.options
        .map(
          (opt, i) => `
        <button type="button" class="dots-choice-btn" data-option="${esc(opt)}" ${phase !== 'MCQ' ? 'disabled' : ''}>
          <span class="dots-choice-letter">${letters[i]}</span>
          <span class="truncate">${esc(opt)}</span>
        </button>
      `
        )
        .join('');

      choicesGrid.querySelectorAll('.dots-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (phase !== 'MCQ') return;
          const choice = btn.dataset.option;
          handleMCQAnswer(choice, btn);
        });
      });
    };

    const handleMCQAnswer = (selected, btn) => {
      if (phase !== 'MCQ' || !currentQuestion) return;

      if (selected === currentQuestion.correctAnswer) {
        try { window.pokeSfx?.play?.('correct'); } catch (e) {}
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
          activeGamePlayerIndex = 1 - activeGamePlayerIndex;
          lastTick = Date.now();
          currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
          phase = 'MCQ';

          updateStatus();
          renderQuestion();
          renderBoard();
          startTurnTimer();
        }, 850);
      }
    };

    const startPullFromDot = (e, startR, startC, startDotEl) => {
      if (phase !== 'DRAW_LINE') return;
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

      // 30% bigger box sizing for 3x3, 4x4, and 5x5 dots
      const boxSize = N >= 5 ? 'clamp(58px, 14vw, 74px)' : (N === 4 ? 'clamp(70px, 18vw, 92px)' : 'clamp(86px, 23vw, 115px)');
      const colDefs = [];
      const rowDefs = [];
      for (let i = 0; i < N - 1; i++) {
        colDefs.push('28px', boxSize);
        rowDefs.push('28px', boxSize);
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
            btn.style.height = '28px';
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
              btn.addEventListener('click', () => handleDrawLine('H', r, c));
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
            btn.style.width = '28px';
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
              btn.addEventListener('click', () => handleDrawLine('V', r, c));
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
        stopTurnTimer();
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

      // Check turn progression:
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
          activeGamePlayerIndex = 1 - activeGamePlayerIndex;
        }
      }

      currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
      phase = 'MCQ';

      updateStatus();
      renderQuestion();
      renderBoard();
      startTurnTimer();
    };

    updateStatus();
    renderQuestion();
    renderBoard();
    startTurnTimer();
  };
})();
