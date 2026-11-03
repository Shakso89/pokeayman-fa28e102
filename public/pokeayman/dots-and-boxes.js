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

      <!-- 2. Sub-Header: Duelists Score HUD (Placed UNDER the header) -->
      <div class="dots-hud-banner game-player-hud-slot">
        <div class="dots-duel-hud">
          <div class="dots-player-badge p1 is-active" id="dots-badge-p1">
            <img src="${p1AvatarUrl}" class="dots-player-avatar" alt="${esc(p1Name)}">
            <div class="dots-player-info">
              <span class="dots-player-name text-amber-300">${esc(p1Name)}</span>
              <span class="dots-player-score" id="dots-score-p1">0 boxes</span>
            </div>
          </div>
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">VS</span>
          <div class="dots-player-badge p2" id="dots-badge-p2">
            <img src="${p2AvatarUrl}" class="dots-player-avatar" alt="${esc(p2Name)}">
            <div class="dots-player-info">
              <span class="dots-player-name text-cyan-300">${esc(p2Name)}</span>
              <span class="dots-player-score" id="dots-score-p2">0 boxes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Arena: Left MCQ Question Card | Right Dots & Boxes Grid -->
      <main class="dots-arena-layout dots-game-shell">
        <!-- Question Card (Left) -->
        <section class="dots-question-card" id="dots-question-section">
          <div class="dots-card-header flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span class="text-xs font-black uppercase tracking-wider text-amber-400" id="dots-q-kicker">Vocabulary Challenge</span>
            <span class="text-xs font-semibold text-slate-400" id="dots-turn-indicator">${esc(p1.student_name)}</span>
          </div>

          <div class="dots-clue-img-box" id="dots-clue-box"></div>

          <div class="dots-choices-grid" id="dots-choices-grid"></div>

          <div class="dots-penalty-hint text-center text-[11px] text-slate-400 mt-1">
            ⚠️ Wrong answer = −1 point and turn is passed to your opponent!
          </div>
        </section>

        <!-- Board (Right) -->
        <section class="dots-board-wrapper">
          <div class="dots-board-info mb-3 flex items-center justify-between w-full max-w-sm px-2 text-xs font-bold text-slate-400">
            <span>Boxes remaining: <strong class="text-white" id="dots-boxes-left">${totalPossibleBoxes}</strong></span>
            <span>Total: <strong class="text-amber-300">${totalPossibleBoxes} boxes (${N}×${N} dots)</strong></span>
          </div>
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
      const statusText = modal.querySelector('#dots-status-text');
      const badgeP1 = modal.querySelector('#dots-badge-p1');
      const badgeP2 = modal.querySelector('#dots-badge-p2');
      const turnIndicator = modal.querySelector('#dots-turn-indicator');
      const scoreP1 = modal.querySelector('#dots-score-p1');
      const scoreP2 = modal.querySelector('#dots-score-p2');
      const boxesLeft = modal.querySelector('#dots-boxes-left');

      badgeP1?.classList.toggle('is-active', isP1);
      badgeP2?.classList.toggle('is-active', !isP1);

      if (scoreP1) scoreP1.textContent = `${activeGameScores[0]} box${activeGameScores[0] === 1 ? '' : 'es'}`;
      if (scoreP2) scoreP2.textContent = `${activeGameScores[1]} box${activeGameScores[1] === 1 ? '' : 'es'}`;

      const completed = Object.values(boxes).filter((b) => b !== null).length;
      if (boxesLeft) boxesLeft.textContent = String(totalPossibleBoxes - completed);

      if (turnIndicator) {
        turnIndicator.textContent = activePlayerName;
        turnIndicator.className = isP1 ? 'text-xs font-bold text-amber-300' : 'text-xs font-bold text-cyan-300';
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
        btn.style.borderColor = '#10b981';
        btn.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        phase = 'DRAW_LINE';
        updateStatus();
        renderBoard();
      } else {
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
        btn.style.borderColor = '#ef4444';
        btn.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        activeGameScores[activeGamePlayerIndex] = Math.max(0, activeGameScores[activeGamePlayerIndex] - 1);

        activeGamePlayerIndex = 1 - activeGamePlayerIndex;
        currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
        phase = 'MCQ';

        setTimeout(() => {
          updateStatus();
          renderQuestion();
          renderBoard();
        }, 700);
      }
    };

    const renderBoard = () => {
      const grid = modal.querySelector('#dots-board-grid');
      if (!grid) return;
      const isP1 = activeGamePlayerIndex === 0;
      const turnClass = isP1 ? 'p1-turn' : 'p2-turn';

      // Responsive track sizing for 3x3, 4x4, and 5x5 dots
      const boxSize = N >= 5 ? 'minmax(38px, 56px)' : (N === 4 ? 'minmax(48px, 68px)' : 'minmax(60px, 86px)');
      const colDefs = [];
      const rowDefs = [];
      for (let i = 0; i < N - 1; i++) {
        colDefs.push('24px', boxSize);
        rowDefs.push('24px', boxSize);
      }
      colDefs.push('24px');
      rowDefs.push('24px');

      grid.style.gridTemplateColumns = colDefs.join(' ');
      grid.style.gridTemplateRows = rowDefs.join(' ');
      grid.innerHTML = '';

      const totalGridRows = 2 * N - 1;
      const totalGridCols = 2 * N - 1;

      for (let gr = 0; gr < totalGridRows; gr++) {
        for (let gc = 0; gc < totalGridCols; gc++) {
          const isEvenR = gr % 2 === 0;
          const isEvenC = gc % 2 === 0;

          if (isEvenR && isEvenC) {
            // Dot Node
            const dot = document.createElement('div');
            dot.className = 'dots-node';
            grid.appendChild(dot);
          } else if (isEvenR && !isEvenC) {
            // Horizontal line button
            const r = gr / 2;
            const c = (gc - 1) / 2;
            const key = `${r}-${c}`;
            const drawnBy = horizontalLines[key];

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `dots-line-h ${phase === 'DRAW_LINE' && drawnBy === null ? 'dots-line-clickable' : ''}`;
            btn.setAttribute('aria-label', `Horizontal line at row ${r}, col ${c}`);
            if (drawnBy !== null || phase !== 'DRAW_LINE') {
              btn.disabled = drawnBy !== null || phase !== 'DRAW_LINE';
            }

            const bar = document.createElement('span');
            bar.className = 'dots-line-h-bar';
            if (drawnBy === 0) bar.classList.add('dots-line-drawn-p1');
            else if (drawnBy === 1) bar.classList.add('dots-line-drawn-p2');
            else if (phase === 'DRAW_LINE') bar.classList.add(turnClass);

            btn.appendChild(bar);

            if (phase === 'DRAW_LINE' && drawnBy === null) {
              btn.addEventListener('click', () => handleDrawLine('H', r, c));
            }
            grid.appendChild(btn);
          } else if (!isEvenR && isEvenC) {
            // Vertical line button (with explicit height & stretch so vertical lines are 100% visible)
            const r = (gr - 1) / 2;
            const c = gc / 2;
            const key = `${r}-${c}`;
            const drawnBy = verticalLines[key];

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `dots-line-v ${phase === 'DRAW_LINE' && drawnBy === null ? 'dots-line-clickable' : ''}`;
            btn.setAttribute('aria-label', `Vertical line at row ${r}, col ${c}`);
            if (drawnBy !== null || phase !== 'DRAW_LINE') {
              btn.disabled = drawnBy !== null || phase !== 'DRAW_LINE';
            }
            btn.style.alignSelf = 'stretch';
            btn.style.justifySelf = 'center';

            const bar = document.createElement('span');
            bar.className = 'dots-line-v-bar';
            const barHeight = N >= 5 ? '30px' : (N === 4 ? '38px' : '48px');
            bar.style.height = barHeight;
            bar.style.minHeight = barHeight;
            if (drawnBy === 0) bar.classList.add('dots-line-drawn-p1');
            else if (drawnBy === 1) bar.classList.add('dots-line-drawn-p2');
            else if (phase === 'DRAW_LINE') bar.classList.add(turnClass);

            btn.appendChild(bar);

            if (phase === 'DRAW_LINE' && drawnBy === null) {
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
    };

    const handleDrawLine = (type, row, col) => {
      if (phase !== 'DRAW_LINE') return;
      const key = `${row}-${col}`;

      if (type === 'H' && horizontalLines[key] !== null) return;
      if (type === 'V' && verticalLines[key] !== null) return;

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

      // Bonus turn if scored, otherwise pass turn
      if (boxesCompleted === 0) {
        activeGamePlayerIndex = 1 - activeGamePlayerIndex;
      }

      currentQuestion = generateMCQ(allWords, currentQuestion.wordItem);
      phase = 'MCQ';

      updateStatus();
      renderQuestion();
      renderBoard();
    };

    updateStatus();
    renderQuestion();
    renderBoard();
  };
})();
