/* Surprise Boxes (Baamboozle-style) game module: setup modal and board gameplay */
(function () {
  const baamboozlePowerUps = ['Star','Steal','Rocket','Bomb','Swap','Gift','Trap'];
  window.baamboozlePowerUps = baamboozlePowerUps;

  const formatBaamScoreDelta = (text) => String(text || '')
    .replace(/(\+\d+)/g, '<span class="baam-num-plus">$1</span>')
    .replace(/([−-]\d+)/g, '<span class="baam-num-minus">$1</span>');
  window.formatBaamScoreDelta = formatBaamScoreDelta;

  const BAAM_POWER_INFO = {
    Star:   { name: 'Star Boost',   emoji: '⭐', desc: '+25 points for you!' },
    Steal:  { name: 'Zap Steal',    emoji: '⚡', desc: 'Steal 15 points from the leader!' },
    Rocket: { name: 'Rocket Blast', emoji: '🚀', desc: 'Blast 5 points above first place!' },
    Bomb:   { name: 'Mega Bomb',    emoji: '💣', desc: 'Oh no! −20 points.' },
    Swap:   { name: 'Score Swap',   emoji: '🔄', desc: 'Swap scores with the leader!' },
    Gift:   { name: 'Mystery Gift', emoji: '🎁', desc: 'Everyone else gets +10 points.' },
    Trap:   { name: 'Sticky Trap',  emoji: '🕸️', desc: 'Trapped! No points this turn.' }
  };
  window.BAAM_POWER_INFO = BAAM_POWER_INFO;

  function chooseBaamboozlePowerUps(listName) {
    if (typeof chooseGamePlayers === 'function') {
      chooseGamePlayers(listName, chooseBaamboozlePowerUps);
      return;
    }
    const availableWords = getGameWords(listName).filter(w => w.vocab_word);
    if (!availableWords.length) { toast('Add vocabulary words first'); return; }
    const maxCards = 16;
    const modal = document.createElement('div');
    modal.className = 'surprise-boxes-setup game-inline-view game-setup-panel mx-auto my-4';
    modal.innerHTML = `<div class="game-setup-panel">
      <h2 class="heading-font text-2xl font-bold text-gray-800 text-center mb-1">🎁 Surprise Boxes</h2>
      <p class="text-sm text-gray-500 text-center mb-3">Choose how many cards to play with.</p>
      <label for="baam-card-count" class="sr-only">Number of cards</label>
      <div class="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="Number of cards">
        ${[8, 18, 24].map(n => `<button type="button" class="baam-card-count rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-400 ${n === Math.min(24, Math.max(8, availableWords.length)) ? 'border-orange-500 bg-orange-100 ring-2 ring-orange-300' : ''}" data-count="${n}">${n} cards</button>`).join('')}
      </div>
      <p class="text-sm text-gray-500 text-center mb-3">Power-ups for this round</p>
      <button type="button" id="baam-power-toggle" class="w-full btn-primary mb-2">All power-ups enabled</button>
      <p id="baam-powerup-status" class="text-xs text-orange-600 text-center">All power-ups enabled</p>
      <div class="flex gap-2 mt-5"><button type="button" id="baam-start" class="flex-1 btn-success">Start game</button><button type="button" id="baam-cancel" class="flex-1 btn-outline">Cancel</button></div>
    </div>`;
    document.body.appendChild(modal);
    let selectedCardCount = Math.min(16, Math.max(8, availableWords.length));
    let powerUpsEnabled = true;
    const status = modal.querySelector('#baam-powerup-status');
    modal.querySelectorAll('.baam-card-count').forEach(button => button.addEventListener('click', () => {
      selectedCardCount = Number(button.dataset.count);
      modal.querySelectorAll('.baam-card-count').forEach(card => card.classList.remove('border-orange-500', 'bg-orange-100', 'ring-2', 'ring-orange-300'));
      button.classList.add('border-orange-500', 'bg-orange-100', 'ring-2', 'ring-orange-300');
    }));
    modal.querySelector('#baam-power-toggle').addEventListener('click', () => {
      powerUpsEnabled = !powerUpsEnabled;
      const label = powerUpsEnabled ? 'All power-ups enabled' : 'All power-ups disabled';
      modal.querySelector('#baam-power-toggle').textContent = label;
      status.textContent = label;
    });
    modal.querySelector('#baam-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#baam-start').addEventListener('click', () => { const enabled = powerUpsEnabled ? baamboozlePowerUps : []; modal.remove(); openBaamboozle(listName, enabled, selectedCardCount); });
    modal.addEventListener('click', e => { /* Outside clicks intentionally do not close the setup. */ });
  }
  window.chooseBaamboozlePowerUps = chooseBaamboozlePowerUps;

  function openBaamboozle(listName, enabledPowerUps = [], cardCount = 16, timerSeconds = 0) {
    setGameReplay(() => { resetGameTurnState(); openBaamboozle(listName, enabledPowerUps, cardCount, timerSeconds); });
    const normalizedTimerSeconds = Number.isFinite(Number(timerSeconds)) && Number(timerSeconds) > 0 ? Number(timerSeconds) : 0;
    const words = getGameWords(listName).filter(w => w && w.vocab_word);
    if (!words.length) { toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: no valid words were loaded.' : 'Add vocabulary words first'); return; }

    // 1. Deduplicate words by normalized word text so NO word can ever repeat
    const seenNorm = new Set();
    const uniqueWords = [];
    for (const w of words) {
      const norm = String(w?.vocab_word || '').trim().toLowerCase();
      if (norm && !seenNorm.has(norm)) {
        seenNorm.add(norm);
        uniqueWords.push(w);
      }
    }
    if (!uniqueWords.length) {
      toast(selectedGameSource === 'my_lists' ? 'My lists launch failed: no valid words were loaded.' : 'Add vocabulary words first');
      return;
    }

    const shuffledWords = uniqueWords.slice().sort(() => Math.random() - 0.5);
    const roundSize = Number(cardCount) || 8;
    const isPowerupsExplicitlyEnabled = Array.isArray(enabledPowerUps) && enabledPowerUps.length > 0;
    const powerUpPool = isPowerupsExplicitlyEnabled
      ? enabledPowerUps
      : (Array.isArray(baamboozlePowerUps) && baamboozlePowerUps.length > 0 ? baamboozlePowerUps : ['Star','Steal','Rocket','Bomb','Swap','Gift','Trap']);

    let selectedWords = [];
    let neededPowerUps = 0;

    if (shuffledWords.length < roundSize) {
      // If list words are not enough for the cards (e.g. 5 words for 8 cards),
      // use each unique word exactly once, and complete the rest with power-ups by default!
      selectedWords = shuffledWords.slice();
      neededPowerUps = roundSize - selectedWords.length;
    } else if (isPowerupsExplicitlyEnabled) {
      // Words are sufficient and power-ups are enabled: mix of unique words and surprise power-ups
      const targetPowerUps = Math.max(1, Math.min(Math.round(roundSize * 0.25), roundSize - 1));
      const targetWords = roundSize - targetPowerUps;
      selectedWords = shuffledWords.slice(0, targetWords);
      neededPowerUps = roundSize - selectedWords.length;
    } else {
      // Words are sufficient and power-ups are disabled: all unique vocabulary cards
      selectedWords = shuffledWords.slice(0, roundSize);
      neededPowerUps = 0;
    }

    const selectedPowerUps = [];
    if (neededPowerUps > 0 && powerUpPool.length > 0) {
      const shuffledPool = powerUpPool.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < neededPowerUps; i++) {
        const pType = shuffledPool[i % shuffledPool.length];
        selectedPowerUps.push({ powerUp: pType, vocab_word: '' });
      }
    }

    const selectedCards = [...selectedWords, ...selectedPowerUps];
    const deck = selectedCards.sort(() => Math.random() - 0.5);
    let index = 0;
    let roundEnded = false;
    // Track every tile chosen at least once; completion is based only on this set.
    const chosenCards = new Set();
    const modal = document.createElement('div'); modal.className = 'game-popup-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    const tileCount = deck.length;
    const tileNumbers = Array.from({length: tileCount}, (_, i) => i + 1);
    const blankTiles = new Set();
    modal.innerHTML = `<div class="surprise-boxes-game bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
      <div class="surprise-boxes-header bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-4 border-b-4 border-white relative">
        <h2 class="game-title-bright heading-font text-xl sm:text-3xl font-bold text-slate-800 text-center flex-1 min-w-0 truncate">🎁 Surprise boxes</h2>
        <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative z-10">
          <div class="flex items-center gap-1 rounded-xl border-2 border-amber-700/40 bg-white/35 p-1 shadow-lg backdrop-blur-md">
            <button type="button" id="baam-size-decrease" class="text-slate-900 hover:bg-white/60 hover:text-amber-900 text-base font-black w-9 h-9 rounded-lg bg-white/45 transition-all duration-200 shadow-inner" aria-label="Show fewer boxes per row" title="Fewer boxes">−</button>
            <button type="button" id="baam-size-increase" class="text-slate-900 hover:bg-white/60 hover:text-amber-900 text-base font-black w-9 h-9 rounded-lg bg-white/45 transition-all duration-200 shadow-inner" aria-label="Show more boxes per row" title="More boxes">+</button>
          </div>
          <button type="button" id="baam-close" class="text-slate-900 hover:bg-white/60 hover:text-amber-900 text-2xl font-black w-10 h-9 rounded-lg bg-white/45 border-2 border-amber-700/40 transition-all shadow-lg" aria-label="Close game" title="Close">×</button>
        </div>
      </div>
      <div class="surprise-boxes-body p-3 sm:p-5 bg-slate-50"><div id="baam-player-hud" class="game-player-hud justify-center mt-0 mb-4 max-w-[900px]"></div><div id="baam-board" class="grid grid-cols-4 gap-1.5 sm:gap-2"></div>
        <div id="baam-reveal" class="hidden baam-reveal-overlay"><div class="baam-reveal-panel baam-question-card" role="dialog" aria-modal="true" aria-labelledby="baam-question-title"><header class="baam-question-header"><div><span class="baam-question-kicker">SURPRISE BOXES</span><h3 id="baam-question-title">Box 01</h3></div><button type="button" id="baam-reveal-close" class="btn-outline baam-question-close" aria-label="Close question" title="Close question">×</button></header><div id="baam-question-player" class="baam-question-player"></div><div id="baam-picture" class="baam-question-picture"></div><p id="baam-word" class="hidden"></p><div id="baam-answer-controls" class="baam-question-actions"></div><p id="baam-answer-status" aria-live="polite"></p></div></div>
      </div></div>`;
    document.body.appendChild(modal);
    // Surprise Boxes stays inside the normal page view; other games retain fullscreen behavior.
    // Preserve the exact 2–4 students chosen in the pre-game chooser.
    const baamPlayers = (activeGamePlayers || []).slice(0, 4);
    if (baamPlayers.length === 1) {
      baamPlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || {
        student_name: 'Robot',
        avatar_pokemon_id: 137,
        __backendId: 'bot-robot',
        isBot: true,
        botDifficulty: window.selectedBotDifficulty || 'medium'
      });
    }
    const baamQ = sel => modal.querySelector(sel) || document.querySelector('.baam-stage-portal ' + sel);
    if (baamPlayers.length < 2) { toast('Select at least two students for Surprise Boxes'); modal.remove(); return; }
    activeGamePlayers = baamPlayers;
    activeGamePlayerIndex = 0;
    activeGameScores = baamPlayers.map(() => 0);
    const playerHud = modal.querySelector('#baam-player-hud');
    playerHud.innerHTML = baamPlayers.map((player, index) => {
      const avatar = player.avatar_pokemon_id || 25;
      return `<div class="game-player-card ${index === 0 ? 'is-active' : ''}" data-player-index="${index}">
        <div class="game-player-avatar-wrap">${gameStudentAvatarMarkup(player, 'game-player-avatar baam-player-avatar')}</div>
        <p class="game-player-name font-bold text-xs text-slate-700 baam-player-name">${player.student_name}</p>
        <p class="game-player-turn text-[11px] font-black" aria-hidden="true"></p>
        <div class="game-turn-timer hidden" role="timer" aria-label="Remaining turn time"><span class="game-turn-timer-track"><span class="game-turn-timer-fill"></span></span><span class="game-turn-timer-number">⏱ 0s</span></div>
        <p class="game-player-score" aria-label="Player score"><strong class="baam-player-score-value">0</strong></p>
      </div>`;
    }).join('');
    playerHud.style.gridTemplateColumns = `repeat(${baamPlayers.length}, minmax(0, 1fr))`;
    if (normalizedTimerSeconds > 0) startPlayerTurnTimer(modal, normalizedTimerSeconds);
    else { modal.dataset.timerSeconds = ''; updateGamePlayerHud(modal, 0, activeGamePlayerIndex); }
    const board = modal.querySelector('#baam-board');
    const baamGridConfig = deck.length <= 8 ? { columns: 4, rows: Math.max(2, Math.ceil(deck.length / 4)) } : deck.length <= 12 ? { columns: 4, rows: 3 } : deck.length <= 18 ? { columns: 6, rows: 3 } : { columns: 6, rows: 4 };
    let baamGridColumns = baamGridConfig.columns;
    let baamGridRows = baamGridConfig.rows;
    const fitBaamBoard = () => {
      const body = modal.querySelector('.surprise-boxes-body');
      if (!body || !board) return;
      const bodyStyle = window.getComputedStyle(body);
      const boardStyle = window.getComputedStyle(board);
      const bodyPadX = (parseFloat(bodyStyle.paddingLeft) || 0) + (parseFloat(bodyStyle.paddingRight) || 0);
      const bodyPadY = (parseFloat(bodyStyle.paddingTop) || 0) + (parseFloat(bodyStyle.paddingBottom) || 0);
      const boardPadX = (parseFloat(boardStyle.paddingLeft) || 0) + (parseFloat(boardStyle.paddingRight) || 0);
      const boardPadY = (parseFloat(boardStyle.paddingTop) || 0) + (parseFloat(boardStyle.paddingBottom) || 0);
      const boardBorderX = (parseFloat(boardStyle.borderLeftWidth) || 0) + (parseFloat(boardStyle.borderRightWidth) || 0);
      const boardBorderY = (parseFloat(boardStyle.borderTopWidth) || 0) + (parseFloat(boardStyle.borderBottomWidth) || 0);
      const hud = playerHud?.offsetHeight || 0;
      const rawBoardInnerW = board.clientWidth > 0
        ? (board.clientWidth - boardPadX)
        : (body.clientWidth - bodyPadX - boardPadX - boardBorderX);
      const rawBoardInnerH = (body.clientHeight - hud - bodyPadY - boardPadY - boardBorderY);
      const availableWidth = Math.max(1, rawBoardInnerW - 16);
      const availableHeight = Math.max(1, rawBoardInnerH - 16);
      const gap = Math.max(8, Math.min(16, Math.floor(Math.min(availableWidth / baamGridColumns, availableHeight / baamGridRows) * .075)));
      const boxRatio = 1.25; // Locked gift box aspect ratio: width = height * 1.25
      const maxBoxWidth = (availableWidth - gap * (baamGridColumns - 1)) / baamGridColumns;
      const maxBoxHeight = (availableHeight - gap * (baamGridRows - 1)) / baamGridRows;
      const boxWidth = Math.max(54, Math.min(maxBoxWidth, maxBoxHeight * boxRatio));
      const boxHeight = boxWidth / boxRatio;
      board.style.gridTemplateColumns = `repeat(${baamGridColumns}, ${Math.floor(boxWidth)}px)`;
      board.style.gridTemplateRows = `repeat(${baamGridRows}, ${Math.floor(boxHeight)}px)`;
      board.style.gap = `${gap}px`;
      board.style.justifyContent = 'center';
      board.style.alignContent = 'center';
    };
    const updateBaamGridDensity = () => { baamGridColumns = baamGridConfig.columns; baamGridRows = baamGridConfig.rows; fitBaamBoard(); requestAnimationFrame(fitBaamBoard); };
    let baamDensityStep = 1;
    const baamDensityLimits = { min: 0, max: 2 };
    const updateBaamDensityControls = () => {
      const decrease = modal.querySelector('#baam-size-decrease');
      const increase = modal.querySelector('#baam-size-increase');
      decrease.disabled = baamDensityStep <= baamDensityLimits.min;
      increase.disabled = baamDensityStep >= baamDensityLimits.max;
      decrease.setAttribute('aria-disabled', String(decrease.disabled));
      increase.setAttribute('aria-disabled', String(increase.disabled));
    };
    const adjustBaamDensity = direction => {
      const next = Math.max(baamDensityLimits.min, Math.min(baamDensityLimits.max, baamDensityStep + direction));
      if (next === baamDensityStep) return;
      baamDensityStep = next;
      // The controls adjust the board layout only; the selected deck and game state stay intact.
      const columns = Math.max(4, Math.min(8, baamGridConfig.columns + (baamDensityStep - 1) * 2));
      const rows = Math.ceil(tileCount / columns);
      baamGridColumns = columns;
      baamGridRows = rows;
      updateBaamDensityControls();
      fitBaamBoard();
    };
    modal.querySelector('#baam-size-decrease').addEventListener('click', () => adjustBaamDensity(-1));
    modal.querySelector('#baam-size-increase').addEventListener('click', () => adjustBaamDensity(1));
    updateBaamDensityControls();
    window.addEventListener('resize', fitBaamBoard);
    window.visualViewport?.addEventListener('resize', fitBaamBoard);
    const activeBaamThemeId = modal.dataset.gaTheme || (typeof window.gaGetTheme === 'function' ? window.gaGetTheme() : (document.body.dataset.gaActiveTheme || 'classic'));
    modal.dataset.gaTheme = activeBaamThemeId;
    const getThemeBallSrc = (themeId) => {
      if (themeId === 'jungle') return '/pokeayman/assets/balls/6.png';
      if (themeId === 'toybox') return '/pokeayman/assets/balls/11.png';
      if (themeId === 'halloween') return '/pokeayman/assets/balls/4.png';
      return '/pokeayman/assets/balls/1.png';
    };
    const baamBallSrc = getThemeBallSrc(activeBaamThemeId);
    board.innerHTML = tileNumbers.map(n => blankTiles.has(n) ? `<button type="button" class="aspect-[1.25] rounded-lg bg-slate-50 text-slate-300 text-3xl font-black shadow-sm" disabled>×</button>` : `<button type="button" class="baam-tile baam-giftbox" data-tile="${n}" aria-label="Open box ${n}" style="--d:${(n % 8) * 0.18}s"><span class="baam-box-lid" aria-hidden="true"></span><span class="baam-box-body" aria-hidden="true"><span class="baam-box-seal"><img class="baam-seal-ball" src="${baamBallSrc}" alt="Poké Ball" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('is-fallback')"></span></span><span class="baam-box-num">${n}</span></button>`).join('');
    updateBaamGridDensity();
    let selectedCard = null;
    const updateTeamScores = () => {
      modal.querySelectorAll('.game-player-card').forEach((card, index) => {
        const score = card.querySelector('.baam-player-score-value');
        if (score) {
          const previousValue = score.dataset.scoreValue;
          const nextValue = String(activeGameScores[index] || 0);
          score.dataset.scoreValue = nextValue;
          score.textContent = nextValue;
          if (previousValue !== undefined && previousValue !== nextValue) {
            score.classList.remove('game-player-score-number-change');
            void score.offsetWidth;
            score.classList.add('game-player-score-number-change');
          }
        }
      });
    };
    const applyPowerUp = (power) => {
      const current = activeGamePlayerIndex;
      const opponents = activeGameScores.map((_, index) => index).filter(index => index !== current);
      const before = [...activeGameScores];
      const leader = opponents.slice().sort((a, b) => activeGameScores[b] - activeGameScores[a])[0];
      if (power === 'Star') {
        try { window.pokeSfx?.play?.('star'); } catch (e) {}
        activeGameScores[current] += 25;
      } else if (power === 'Steal' && leader !== undefined) {
        try { window.pokeSfx?.play?.('whoosh'); } catch (e) {}
        const taken = Math.min(15, Math.max(0, activeGameScores[leader]));
        activeGameScores[leader] -= taken; activeGameScores[current] += taken;
      } else if (power === 'Rocket') {
        try { window.pokeSfx?.play?.('rocket'); } catch (e) {}
        activeGameScores[current] = Math.max(...activeGameScores) + 5;
      } else if (power === 'Bomb') {
        try { window.pokeSfx?.play?.('boom'); } catch (e) {}
        activeGameScores[current] = Math.max(0, activeGameScores[current] - 20);
      } else if (power === 'Swap' && leader !== undefined) {
        try { window.pokeSfx?.play?.('whoosh'); } catch (e) {}
        [activeGameScores[current], activeGameScores[leader]] = [activeGameScores[leader], activeGameScores[current]];
      } else if (power === 'Gift') {
        try { window.pokeSfx?.play?.('plus'); } catch (e) {}
        opponents.forEach(index => { activeGameScores[index] += 10; });
      } else if (power === 'Trap') {
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
      }
      const impacts = activeGameScores.map((score, index) => score - before[index]);
      updateTeamScores();
      // Show every student the power-up changed, not just the current player:
      // one staggered chip per score change, laid out in the panel's own flow
      // after the card so it can never cover the player pill, and used instead of
      // repeating the same numbers as plain text in the status line.
      const changedEntries = impacts.map((impact, index) => ({ impact, index })).filter(entry => entry.impact);
      const scoreStage = baamQ('#baam-reveal .baam-reveal-panel');
      scoreStage?.querySelector('.baam-impact-stack')?.remove();
      if (changedEntries.length && scoreStage) {
        const impactStack = document.createElement('div');
        impactStack.className = 'baam-impact-stack';
        impactStack.setAttribute('aria-hidden', 'true');
        changedEntries.forEach((entry, order) => {
          const impactPlayer = baamPlayers[entry.index];
          const chip = document.createElement('div');
          const isScorePlus = entry.impact > 0;
          chip.className = `baam-impact-chip ${isScorePlus ? 'is-plus' : 'is-minus'}`;
          chip.style.setProperty('--baam-impact-order', String(order));
          chip.innerHTML = `${impactPlayer ? gameStudentAvatarMarkup(impactPlayer, 'baam-impact-avatar') : ''}<span class="baam-impact-name"></span><strong class="baam-impact-value ${isScorePlus ? 'is-plus' : 'is-minus'}">${isScorePlus ? '+' : '−'}${Math.abs(entry.impact)}</strong>`;
          chip.querySelector('.baam-impact-name').textContent = impactPlayer?.student_name || `Player ${entry.index + 1}`;
          impactStack.appendChild(chip);
        });
        const pictureEl = baamQ('#baam-picture');
        if (pictureEl && pictureEl.parentElement === scoreStage) {
          pictureEl.insertAdjacentElement('afterend', impactStack);
        } else {
          const statusEl = baamQ('#baam-answer-status');
          scoreStage.insertBefore(impactStack, statusEl && statusEl.parentElement === scoreStage ? statusEl : null);
        }
      }
      if (power === 'Bomb') { const shakeEl = modal.querySelector('#baam-board'); shakeEl?.classList.remove('baam-shake'); void modal.offsetWidth; shakeEl?.classList.add('baam-shake'); }
      advanceGameTurn();
      updateGamePlayerHud(modal, 0, activeGamePlayerIndex);
      if (power === 'Trap') return 'Trapped! No points this turn.';
      // The chips above already show who gained or lost what; repeating it here
      // would print the same numbers twice.
      return changedEntries.length ? '' : 'No score change';
    };
    const endBaamboozle = async () => {
      if (roundEnded || chosenCards.size < deck.length) return;
      roundEnded = true;
      const winnerIndex = activeGameScores[0] === activeGameScores[1] ? -1 : (activeGameScores[0] > activeGameScores[1] ? 0 : 1);
      const winnerName = winnerIndex >= 0 ? (baamPlayers[winnerIndex]?.student_name || `Player ${winnerIndex + 1}`) : '';
      const winner = winnerIndex < 0 ? "It's a tie!" : `${winnerName} wins!`;
      const winnerNames = `${baamPlayers[0]?.student_name || 'Player 1'} ${activeGameScores[0]} · ${baamPlayers[1]?.student_name || 'Player 2'} ${activeGameScores[1]}`;
      const winnerPlayer = winnerIndex >= 0 ? baamPlayers[winnerIndex] : null;
      const winnerAvatar = winnerPlayer?.avatar_pokemon_id || 25;
      const winnerAvatarAlt = winnerPlayer ? `${winnerPlayer.student_name}'s avatar Pokémon` : 'Pokémon game tie';
      const isBotWinner = Boolean(winnerPlayer?.isBot || winnerPlayer?.student_name === 'Robot');
      const baamConfiguredPrize = Math.max(0, Math.floor(Number(activeGameReward) || 0));
      let baamAwardedPrize = 0;
      if (winnerPlayer && !isBotWinner && baamConfiguredPrize > 0 && !activeGameRewardClaimed) {
        activeGameRewardClaimed = true;
        const winnerRecord = getAllStudents().find(student => student.__backendId === winnerPlayer.__backendId) || getAllStudents().find(student => student.student_name === winnerName);
        if (winnerRecord) {
          const awardResult = await window.dataSdk.update({ ...winnerRecord, coins: (Number(winnerRecord.coins) || 0) + baamConfiguredPrize, claimed_via_battle: true });
          if (awardResult?.isOk) {
            baamAwardedPrize = baamConfiguredPrize;
            toast(`${winnerName} was awarded ${baamAwardedPrize} coins!`);
          } else {
            activeGameRewardClaimed = false;
            toast('Could not award the Surprise Boxes prize. Please try again.');
          }
        } else {
          activeGameRewardClaimed = false;
        }
      } else if ((!winnerPlayer || isBotWinner) && baamConfiguredPrize > 0 && !activeGameRewardClaimed) {
        activeGameRewardClaimed = true;
        const teacher = typeof currentTeacher !== 'undefined' ? currentTeacher : '';
        if (typeof refundTeacherCredits === 'function' && teacher) {
          refundTeacherCredits(baamConfiguredPrize, teacher);
          if (isBotWinner) toast(`Game reward (${baamConfiguredPrize} coins) returned to teacher because Robot won.`);
        }
      }
      const baamPrizeNotice = (!isBotWinner && baamAwardedPrize > 0) ? `<p class="relative z-10 mt-3 rounded-xl border-2 border-yellow-300 bg-slate-950 px-4 py-2 text-lg font-black text-yellow-200 shadow-lg" aria-live="polite">Prize: ${baamAwardedPrize} coins</p>` : '';
      baamQ('#baam-reveal')?.classList.add('hidden');
      modal.querySelectorAll('.baam-tile').forEach(tile => { tile.disabled = true; });
      const overlay = document.createElement('div');
      overlay.className = 'game-celebration-overlay baam-final-overlay';
      overlay.innerHTML = `<div class="game-celebration-card" role="dialog" aria-modal="true" aria-labelledby="baam-final-title" tabindex="-1"><img class="game-celebration-pikachu battle-winner-celebrate" src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${winnerAvatar}.png" alt="${winnerAvatarAlt}"><div class="text-4xl mb-1 relative z-10" aria-hidden="true">🏆</div><h2 id="baam-final-title" class="heading-font text-3xl font-black text-amber-700 relative z-10">${winner}</h2><p class="mt-1 text-base font-bold text-slate-700 relative z-10">${winnerNames}</p>${baamPrizeNotice}<div class="flex gap-3 mt-5 relative z-10"><button type="button" id="baam-final-replay" class="btn-primary flex-1">Play again</button><button type="button" id="baam-final-close" class="btn-outline flex-1">Close</button></div></div>`;
      mountGameCelebrationOverlay(modal, overlay);
      const closeResult = () => {
        overlay.remove();
        modal.remove();
        if (typeof window.gaExitSetupToArcade === 'function') {
          window.gaExitSetupToArcade();
        } else {
          returnToGamesTab();
        }
      };
      overlay.querySelector('#baam-final-close').addEventListener('click', closeResult);
      overlay.querySelector('#baam-final-replay').addEventListener('click', () => { overlay.remove(); modal.remove(); resetGameTurnState(); openBaamboozle(listName, enabledPowerUps, cardCount, timerSeconds); });
      overlay.addEventListener('click', event => { /* Result popup closes only through its Replay/Close buttons. */ });
      overlay.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeResult(); } });
      overlay.querySelector('.game-celebration-card').focus();
    };
    let answerProgressionTimer = null;
    const clearAnswerTimer = () => {
      if (answerProgressionTimer) {
        clearTimeout(answerProgressionTimer);
        answerProgressionTimer = null;
      }
    };
    let baamBotTimer = null;
    const clearBaamBot = () => {
      if (baamBotTimer) {
        if (typeof window.clearWaitForGameWordAloud === 'function') {
          window.clearWaitForGameWordAloud(baamBotTimer);
        }
        clearTimeout(baamBotTimer);
        baamBotTimer = null;
      }
    };
    const checkBaamBotTurn = () => {
      clearBaamBot();
      if (!document.body.contains(modal)) return;
      const curPlayer = baamPlayers[activeGamePlayerIndex];
      if (!curPlayer?.isBot) return;

      const diff = curPlayer.botDifficulty || window.selectedBotDifficulty || 'normal';
      const revealPanel = baamQ('#baam-reveal');
      const isQuestionOpen = revealPanel && !revealPanel.classList.contains('hidden');
      const scheduleFn = typeof window.waitForGameWordAloud === 'function' ? window.waitForGameWordAloud : setTimeout;

      if (isQuestionOpen) {
        const continueBtn = revealPanel.querySelector('.baam-power-continue-btn');
        if (continueBtn) {
          // Give students plenty of time (3.2s total, ~2.5s after score delta applies) to see the score change!
          baamBotTimer = setTimeout(() => {
            baamBotTimer = null;
            if (!revealPanel.classList.contains('hidden')) {
              continueBtn.click();
            }
          }, 3200);
          return;
        }

        const choiceBtns = Array.from(revealPanel.querySelectorAll('.baam-choice-btn:not([disabled])'));
        if (!choiceBtns.length) return;
        const thinkDelay = diff === 'hard' ? 700 : ((diff === 'normal' || diff === 'medium') ? 1000 : 1300);
        baamBotTimer = scheduleFn(() => {
          baamBotTimer = null;
          if (revealPanel.classList.contains('hidden')) return;
          const targetWord = String(selectedCard?.vocab_word || '').trim().toLowerCase();
          const correctBtn = choiceBtns.find(b => String(b.dataset.choice || '').trim().toLowerCase() === targetWord);
          const wrongBtns = choiceBtns.filter(b => b !== correctBtn);

          const acc = diff === 'hard' ? 0.95 : ((diff === 'normal' || diff === 'medium') ? 0.75 : 0.50);
          const pickCorrect = Math.random() < acc && correctBtn;
          const chosen = (pickCorrect ? correctBtn : (wrongBtns[0] || correctBtn));
          chosen?.click();
        }, thinkDelay);
      } else {
        const thinkDelay = diff === 'hard' ? 700 : ((diff === 'normal' || diff === 'medium') ? 1000 : 1300);
        baamBotTimer = scheduleFn(() => {
          baamBotTimer = null;
          if (!document.body.contains(modal)) return;
          if (baamPlayers[activeGamePlayerIndex] !== curPlayer) return;
          const unrevealedTiles = Array.from(modal.querySelectorAll('.baam-tile:not([disabled])'));
          if (!unrevealedTiles.length) return;
          const randomTile = unrevealedTiles[Math.floor(Math.random() * unrevealedTiles.length)];
          randomTile?.click();
        }, thinkDelay);
      }
    };
    const reveal = () => {
      clearAnswerTimer();
      const w = deck[index % deck.length];
      selectedCard = w;
      if (selectedCard) {
        selectedCard._scoreAwarded = false;
        selectedCard._isCorrect = false;
      }
      const revealPanel = baamQ('#baam-reveal');
      const picture = baamQ('#baam-picture');
      const word = baamQ('#baam-word');
      const status = baamQ('#baam-answer-status');
      const answerControls = baamQ('#baam-answer-controls');
      baamQ('#baam-question-title').textContent = `Box ${String(index + 1).padStart(2, '0')}`;
      const playerChip = baamQ('#baam-question-player');
      const questionPlayer = baamPlayers[activeGamePlayerIndex];
      playerChip.replaceChildren();
      if (questionPlayer) {
        playerChip.innerHTML = gameStudentAvatarMarkup(questionPlayer, 'baam-question-avatar');
        const playerName = document.createElement('span');
        playerName.textContent = questionPlayer.student_name;
        playerChip.appendChild(playerName);
      }
      revealPanel.classList.remove('hidden');
      word.classList.add('hidden');
      word.style.cursor = '';
      word.title = '';
      word.onclick = null;
      status.textContent = '';
      status.className = '';
      revealPanel.querySelector('.baam-impact-stack')?.remove();
      revealPanel.querySelector('.baam-post-answer-actions')?.remove();
      const questionCard = baamQ('#baam-reveal .baam-question-card') || baamQ('#baam-reveal .baam-reveal-panel');
      const allPowerClasses = ['baam-powerup-reveal', 'baam-powerup-star', 'baam-powerup-rocket', 'baam-powerup-steal', 'baam-powerup-bomb', 'baam-powerup-swap', 'baam-powerup-gift', 'baam-powerup-trap'];
      revealPanel.classList.remove(...allPowerClasses);
      questionCard?.classList.remove(...allPowerClasses);
      const kickerEl = baamQ('.baam-question-kicker');
      if (kickerEl) kickerEl.textContent = 'SURPRISE BOXES';

      if (w.powerUp) {
        const info = BAAM_POWER_INFO[w.powerUp] || { name: w.powerUp, emoji: '✨', desc: '' };
        picture.innerHTML = `<div class="baam-power-stage" aria-label="${info.name} power-up">
          <div class="baam-powerup-icon"><span class="baam-power-badge" aria-hidden="true">${info.emoji}</span></div>
          <h3 class="baam-power-name">${info.name}</h3>
          <p class="baam-power-desc">${formatBaamScoreDelta(info.desc)}</p>
        </div>`;
        const pKey = w.powerUp.toLowerCase();
        revealPanel.classList.add('baam-powerup-reveal', `baam-powerup-${pKey}`);
        questionCard?.classList.add('baam-powerup-reveal', `baam-powerup-${pKey}`);
        if (kickerEl) kickerEl.textContent = '⚡ POWER-UP!';
        status.textContent = '';
        try { window.pokeSfx?.play('pop'); setTimeout(() => window.pokeSfx?.play(({ Star: 'star', Bomb: 'boom', Steal: 'whoosh', Rocket: 'rocket', Swap: 'whoosh', Gift: 'coin', Trap: 'wrong' })[w.powerUp] || 'star'), 500); } catch (e) {}
        if (answerControls) {
          answerControls.replaceChildren();
          const continueBtn = document.createElement('button');
          continueBtn.type = 'button';
          continueBtn.className = 'baam-power-continue-btn';
          continueBtn.textContent = 'Continue →';
          continueBtn.addEventListener('click', () => {
            clearBaamBot();
            closeBaamRevealAsWrong();
          });
          answerControls.appendChild(continueBtn);
          answerControls.classList.remove('hidden');
          checkBaamBotTurn();
        }
        setTimeout(() => {
          if (revealPanel.classList.contains('baam-powerup-reveal')) {
            status.innerHTML = formatBaamScoreDelta(applyPowerUp(w.powerUp));
            if (chosenCards.size === deck.length) setTimeout(endBaamboozle, 1200);
          }
        }, 700);
        selectedCard = null; return;
      }
      picture.innerHTML = w.vocab_image ? `<img src="${w.vocab_image}" class="w-80 h-56 max-w-full rounded-lg object-contain mx-auto" alt="Picture prompt for ${w.vocab_word}" onerror="this.style.display='none'">` : `<div class="w-80 h-56 max-w-full rounded-lg bg-white border border-amber-200 flex items-center justify-center text-sm text-slate-400">No picture available</div>`;

      // Four answer options from selected vocabulary list: 1 correct + up to 3 unique distractors
      const targetWord = String(w.vocab_word || '').trim();
      const normalizedTarget = targetWord.toLowerCase();
      const seenWords = new Set([normalizedTarget]);
      const distractorPool = [];
      const shuffledSource = words.slice().sort(() => Math.random() - 0.5);
      for (const item of shuffledSource) {
        const candidate = String(item?.vocab_word || '').trim();
        const candKey = candidate.toLowerCase();
        if (!candKey || seenWords.has(candKey)) continue;
        seenWords.add(candKey);
        distractorPool.push(candidate);
        if (distractorPool.length >= 3) break;
      }
      const choices = [targetWord, ...distractorPool].sort(() => Math.random() - 0.5);

      if (answerControls) {
        answerControls.replaceChildren();
        let choiceLocked = false;
        choices.forEach((choiceText, choiceIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'baam-choice-btn';
          btn.dataset.choice = choiceText;
          btn.dataset.sfx = 'none';

          if (choices.length % 2 === 1 && choiceIdx === choices.length - 1) {
            btn.classList.add('baam-choice-btn-full');
          }

          const badge = document.createElement('span');
          badge.className = 'baam-choice-badge';
          badge.setAttribute('aria-hidden', 'true');
          badge.textContent = ['A', 'B', 'C', 'D'][choiceIdx] || String(choiceIdx + 1);

          const label = document.createElement('span');
          label.className = 'baam-choice-text';
          label.textContent = choiceText;

          btn.appendChild(badge);
          btn.appendChild(label);

          btn.addEventListener('click', (e) => {
            const curPlayer = baamPlayers[activeGamePlayerIndex];
            if (curPlayer?.isBot && e.isTrusted) return;
            if (choiceLocked) return;
            choiceLocked = true;
            clearAnswerTimer();

            const isCorrect = choiceText.trim().toLowerCase() === normalizedTarget;

            // Lock all choices and highlight the correct one
            answerControls.querySelectorAll('.baam-choice-btn').forEach(b => {
              b.disabled = true;
              if (String(b.dataset.choice || '').trim().toLowerCase() === normalizedTarget) {
                b.classList.add('is-revealed-correct');
              }
            });

            if (isCorrect) {
              btn.classList.add('is-correct');
              status.innerHTML = '✓ Correct! <span class="baam-num-plus">+10</span> points';
              status.className = 'baam-answer-feedback is-correct';
              try { window.pokeSfx?.play('correct'); } catch (e) {}

              // Award score immediately to the answering player & update HUD right away
              const currentPlayer = activeGamePlayerIndex;
              if (selectedCard && !selectedCard._scoreAwarded) {
                selectedCard._scoreAwarded = true;
                selectedCard._isCorrect = true;
                activeGameScores[currentPlayer] = (activeGameScores[currentPlayer] || 0) + 10;
                updateTeamScores();
                updateGamePlayerHud(modal, 0, currentPlayer);
                showCorrectAnswerCelebration(modal, currentPlayer);
              }

              if (typeof window.readGameWordAloud === 'function') {
                window.readGameWordAloud(targetWord);
              }

              word.textContent = targetWord;
              word.classList.remove('hidden');
              word.style.cursor = 'pointer';
              word.title = 'Click to hear word again';
              word.onclick = () => {
                if (typeof window.readGameWordAloud === 'function') {
                  window.readGameWordAloud(targetWord);
                }
              };

              // Option only playable after correct answer: Hear Again
              revealPanel.querySelector('.baam-post-answer-actions')?.remove();
              const actionRow = document.createElement('div');
              actionRow.className = 'baam-post-answer-actions';

              const hearAgainBtn = document.createElement('button');
              hearAgainBtn.type = 'button';
              hearAgainBtn.className = 'baam-hear-again-btn';
              hearAgainBtn.id = 'baam-hear-again';
              hearAgainBtn.setAttribute('aria-label', `Hear "${targetWord}" again`);
              hearAgainBtn.title = 'Hear word again';
              hearAgainBtn.innerHTML = `
                <svg class="baam-hear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <span>Hear Again</span>
              `;

              const continueBtn = document.createElement('button');
              continueBtn.type = 'button';
              continueBtn.className = 'baam-hear-continue-btn';
              continueBtn.id = 'baam-hear-continue';
              continueBtn.innerHTML = `<span>Continue →</span>`;

              hearAgainBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                if (typeof window.readGameWordAloud === 'function') {
                  window.readGameWordAloud(targetWord);
                }
                hearAgainBtn.classList.remove('is-speaking');
                void hearAgainBtn.offsetWidth;
                hearAgainBtn.classList.add('is-speaking');
                setTimeout(() => hearAgainBtn.classList.remove('is-speaking'), 1200);

                // Reset progression timer so playback is not cut off
                if (!curPlayer?.isBot) {
                  clearAnswerTimer();
                  answerProgressionTimer = setTimeout(() => {
                    answerProgressionTimer = null;
                    markAnswer(true);
                  }, 4500);
                }
              });

              continueBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                clearAnswerTimer();
                markAnswer(true);
              });

              actionRow.appendChild(hearAgainBtn);
              actionRow.appendChild(continueBtn);
              status.insertAdjacentElement('afterend', actionRow);

            } else {
              btn.classList.add('is-wrong');
              status.textContent = `✕ Not quite! Answer: ${targetWord}`;
              status.className = 'baam-answer-feedback is-wrong';
              try { window.pokeSfx?.play('wrong'); } catch (e) {}
              if (typeof window.readGameWordAloud === 'function') {
                window.readGameWordAloud(targetWord, 350);
              }
              word.textContent = targetWord;
              word.classList.remove('hidden');
            }

            const isBotAnswering = !!curPlayer?.isBot;
            answerProgressionTimer = setTimeout(() => {
              answerProgressionTimer = null;
              markAnswer(isCorrect);
            }, isBotAnswering ? 1800 : (isCorrect ? 4000 : 1800));
          });

          answerControls.appendChild(btn);
        });
        answerControls.classList.remove('hidden');
        checkBaamBotTurn();
      }
    };
    const closeBaamRevealAsWrong = () => {
      clearAnswerTimer();
      clearBaamBot();
      // Always dismiss the reveal overlay, including after a power-up resolves.
      const revealPanel = baamQ('#baam-reveal');
      if (!revealPanel) return;
      revealPanel.querySelector('.baam-post-answer-actions')?.remove();
      if (selectedCard && !selectedCard.powerUp) {
        advanceGameTurn();
        updateGamePlayerHud(modal, 0, activeGamePlayerIndex);
      }
      selectedCard = null;
      revealPanel.classList.add('hidden');
      if (chosenCards.size >= deck.length) endBaamboozle();
      else checkBaamBotTurn();
    };
    const markAnswer = (isCorrect) => {
      clearAnswerTimer();
      if (!selectedCard || selectedCard.powerUp) return;
      const revealPanel = baamQ('#baam-reveal');
      revealPanel?.querySelector('.baam-post-answer-actions')?.remove();
      const word = baamQ('#baam-word');
      const currentPlayer = activeGamePlayerIndex;
      if (isCorrect) {
        try { window.pokeSfx?.play?.('correct'); } catch (e) {}
        if (!selectedCard._scoreAwarded) {
          selectedCard._scoreAwarded = true;
          selectedCard._isCorrect = true;
          activeGameScores[currentPlayer] = (activeGameScores[currentPlayer] || 0) + 10;
          updateTeamScores();
          updateGamePlayerHud(modal, 0, currentPlayer);
          showCorrectAnswerCelebration(modal, currentPlayer);
        }
        word.textContent = selectedCard.vocab_word;
        word.classList.remove('hidden');
        advanceGameTurn();
        updateGamePlayerHud(modal, 0, activeGamePlayerIndex);
      } else {
        try { window.pokeSfx?.play?.('wrong'); } catch (e) {}
        if (!choiceLocked && typeof window.readGameWordAloud === 'function') {
          window.readGameWordAloud(selectedCard.vocab_word, 350);
        }
        showWrongAnswerCelebration(modal, currentPlayer);
        advanceGameTurn();
        updateGamePlayerHud(modal, 0, activeGamePlayerIndex);
      }
      selectedCard = null;
      baamQ('#baam-reveal').classList.add('hidden');
      if (chosenCards.size >= deck.length) endBaamboozle();
      else checkBaamBotTurn();
    };
    const baamPortal = document.createElement('div');
    baamPortal.className = 'baam-stage-portal';
    baamPortal.appendChild(modal.querySelector('#baam-reveal'));
    document.body.appendChild(baamPortal);
    const baamPortalWatch = setInterval(() => { if (!modal.isConnected) { clearAnswerTimer(); baamPortal.remove(); clearInterval(baamPortalWatch); } }, 1000);
    baamQ('#baam-reveal-close')?.addEventListener('click', closeBaamRevealAsWrong);
    baamQ('#baam-reveal')?.addEventListener('click', event => {
      /* Clicks outside the question card intentionally do not dismiss or mark it wrong. */
    });
    baamQ('#baam-correct')?.addEventListener('click', () => markAnswer(true));
    baamQ('#baam-wrong')?.addEventListener('click', () => markAnswer(false));
    const powerStyle = document.createElement('style');
    powerStyle.textContent = `.baam-reveal-panel{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;width:min(100%,34rem);min-height:22rem;max-height:calc(100 * min(var(--vh, 1vh), 1vh) - 2rem);padding:2.5rem 1.5rem 1.5rem!important;background:#07111f!important;border:2px solid rgba(135,171,255,.72);border-radius:1.5rem!important;color:#f8fafc;box-shadow:0 0 0 1px rgba(253,224,71,.18),inset 0 1px 0 rgba(255,255,255,.2),0 24px 70px rgba(2,6,23,.78),0 0 34px var(--baam-glow,rgba(255,203,5,.3));text-align:center}.baam-reveal-panel #baam-picture{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:min(100%,18rem);min-height:8rem;max-height:11rem;margin:0 auto .25rem}.baam-reveal-panel #baam-picture img{display:block;max-width:100%;max-height:11rem;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.5))}.baam-reveal-panel #baam-word{position:relative;z-index:2;max-width:100%;margin:.25rem auto 0;color:#fff7a8!important;font-size:clamp(2.4rem,9vw,5rem)!important;font-weight:950!important;line-height:1.05;overflow-wrap:anywhere;text-align:center;text-shadow:0 3px 0 rgba(2,6,23,.9),0 0 16px rgba(250,204,21,.5)}.baam-reveal-panel #baam-answer-status{position:relative;z-index:2;max-width:100%;margin:.25rem auto 0;padding:.45rem .8rem;border:1px solid rgba(125,211,252,.42);border-radius:999px;background:rgba(2,6,23,.72);color:#e0f2fe!important;font-size:clamp(.9rem,2.5vw,1.1rem)!important;font-weight:850;line-height:1.35;overflow-wrap:anywhere}.baam-reveal-panel #baam-answer-controls{position:relative;z-index:2;width:min(100%,22rem);margin-top:.5rem}.baam-reveal-panel #baam-answer-controls button{min-height:3rem;font-size:1rem;font-weight:900}.baam-reveal-panel #baam-reveal-close{z-index:4;width:2.5rem;height:2.5rem;border-radius:.75rem;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.28)}.baam-reveal-panel.baam-powerup-reveal::before{content:'SUPERPOWER';position:absolute;top:.7rem;left:50%;z-index:2;transform:translateX(-50%);padding:.22rem .7rem;border:1px solid rgba(253,224,71,.55);border-radius:999px;background:rgba(2,6,23,.55);color:#fde68a;font-size:.58rem;font-weight:950;letter-spacing:.22em;line-height:1;box-shadow:0 4px 12px rgba(2,6,23,.25)}.baam-reveal-panel::after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.8px),radial-gradient(circle,#fde68a 0 1px,transparent 1.8px),linear-gradient(115deg,transparent 25%,rgba(125,211,252,.14) 50%,transparent 75%);background-size:72px 58px,96px 86px,220% 100%;background-position:12% 20%,78% 28%,-120% 0;opacity:.72;animation:baamParticleDrift 2.2s ease-out both,baamRaySweep 3.8s ease-in-out infinite}.baam-reveal-panel.baam-powerup-reveal{animation:baamRevealBurst .85s cubic-bezier(.2,.85,.25,1) both,baamPanelSettle 2.8s ease-in-out .85s infinite;overflow:visible!important}.baam-reveal-panel.baam-powerup-reveal #baam-picture{height:auto!important;max-height:none!important;min-height:16rem!important;padding:2rem 1.2rem 1.2rem!important;overflow:visible!important}.baam-powerup-reveal .baam-powerup-icon{position:relative;display:flex;align-items:center;justify-content:center;min-height:9rem;margin-top:1rem;font-size:clamp(5rem,18vw,8rem);line-height:1;filter:drop-shadow(0 0 12px var(--baam-glow,#a855f7)) drop-shadow(0 10px 12px rgba(0,0,0,.45));animation:baamPowerDrama .85s cubic-bezier(.2,.85,.25,1) both,baamHeroGlow 2.4s ease-in-out .85s infinite}.baam-reveal-panel #baam-answer-status{display:inline-block;margin:.6rem auto .15rem;padding:.3rem .72rem;border:1px solid rgba(125,211,252,.35);border-radius:999px;background:rgba(18,26,69,.62);color:#bae6fd!important;font-size:.7rem;font-weight:850;letter-spacing:.04em;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.baam-reveal-panel [class*='point'],.baam-reveal-panel [class*='Point']{position:relative;z-index:2;color:#fff7a8!important;-webkit-text-stroke:1px rgba(30,20,5,.8);text-shadow:0 3px 0 rgba(30,20,5,.72),0 0 12px var(--baam-glow,#facc15),0 0 24px rgba(250,204,21,.42);animation:superUpPointsPop 520ms cubic-bezier(.2,.85,.25,1) both,superUpPointsPulse 1.8s ease-in-out 520ms infinite}.baam-powerup-reveal .baam-powerup-icon::before{content:'';position:absolute;width:10rem;height:10rem;border-radius:50%;background:radial-gradient(circle,var(--baam-core,rgba(168,85,247,.42)),transparent 68%);filter:blur(12px);z-index:-1;animation:baamCoreFlash .85s ease-out both}.baam-powerup-reveal .baam-powerup-icon::after{content:'✦ · ✧ · ✦';position:absolute;inset:0;display:grid;place-items:center;color:var(--baam-glow,#c4b5fd);font-size:1.15rem;letter-spacing:1.5rem;opacity:.9;animation:baamSparkBurst 1.1s ease-out both} @keyframes baamRaySweep{0%,100%{background-position:12% 20%,78% 28%,-120% 0}55%{background-position:12% 20%,78% 28%,120% 0}} @keyframes baamPanelSettle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}} @keyframes baamHeroGlow{0%,100%{filter:drop-shadow(0 0 12px var(--baam-glow,#a855f7)) drop-shadow(0 10px 12px rgba(0,0,0,.45))}50%{filter:drop-shadow(0 0 24px var(--baam-glow,#a855f7)) drop-shadow(0 10px 12px rgba(0,0,0,.45))}}.baam-powerup-reveal .baam-powerup-icon::before{content:'';position:absolute;width:8rem;height:8rem;border-radius:50%;background:var(--baam-core,rgba(168,85,247,.32));filter:blur(10px);z-index:-1;animation:baamCoreFlash .85s ease-out both}.baam-powerup-reveal .baam-powerup-icon::after{content:'✦  ·  ✧  ·  ✦';position:absolute;inset:0;display:grid;place-items:center;color:var(--baam-glow,#c4b5fd);font-size:1.2rem;letter-spacing:1.6rem;opacity:.9;animation:baamSparkBurst 1.1s ease-out both}.baam-powerup-reveal .baam-powerup-icon + *{position:relative}.baam-powerup-star{--baam-glow:#facc15;--baam-core:rgba(250,204,21,.45);--baam-aura:radial-gradient(circle,rgba(245,158,11,.65),transparent 68%)}.baam-powerup-rocket{--baam-glow:#fb923c;--baam-core:rgba(249,115,22,.4);--baam-aura:linear-gradient(90deg,transparent,rgba(249,115,22,.55),transparent)}.baam-powerup-rocket .baam-powerup-icon::after{content:'» » »';letter-spacing:1.1rem}.baam-powerup-virus,.baam-powerup-boom{--baam-glow:#fb7185;--baam-core:rgba(239,68,68,.36)}.baam-powerup-gold{--baam-glow:#facc15;--baam-core:rgba(251,191,36,.42)}.baam-powerup-fairy,.baam-powerup-heart,.baam-powerup-gift{--baam-glow:#f0abfc;--baam-core:rgba(217,70,239,.36)}.baam-powerup-thief,.baam-powerup-shark,.baam-powerup-magnet{--baam-glow:#ffcb05;--baam-core:rgba(255,203,5,.34)}.baam-powerup-trap,.baam-powerup-baam{--baam-glow:#a78bfa;--baam-core:rgba(124,58,237,.38)}.baam-powerup-eraser{--baam-glow:#ffd84d;--baam-core:rgba(120,152,255,.34)}.baam-powerup-seesaw{--baam-glow:#fde68a;--baam-core:rgba(253,224,71,.35)}.baam-powerup-virus .baam-powerup-icon,.baam-powerup-boom .baam-powerup-icon{animation:baamPowerDrama .85s ease both,baamPowerShake .85s ease both}@keyframes baamRevealBurst{0%{opacity:0;transform:scale(.72);filter:brightness(2.2)}35%{opacity:1;transform:scale(1.03);filter:brightness(1.35)}100%{transform:scale(1);filter:brightness(1)}}@keyframes baamPowerDrama{0%{opacity:0;transform:scale(.2) rotate(-25deg)}55%{opacity:1;transform:scale(1.35) rotate(12deg)}100%{transform:scale(1) rotate(0)}}@keyframes baamCoreFlash{0%{opacity:0;transform:scale(.25)}35%{opacity:1;transform:scale(1.35)}100%{opacity:.8;transform:scale(1)}}@keyframes baamSparkBurst{0%{opacity:0;transform:scale(.2) rotate(-18deg)}45%{opacity:1;transform:scale(1.2) rotate(8deg)}100%{opacity:.72;transform:scale(1) rotate(0)}}@keyframes baamParticleDrift{0%{opacity:0;transform:scale(.7) translateY(10px)}30%{opacity:.9}100%{opacity:.45;transform:scale(1.08) translateY(-6px)}}@keyframes baamAuraPulse{0%,100%{opacity:.52;transform:scale(.86)}50%{opacity:.9;transform:scale(1.08)}}@keyframes baamPowerShake{0%,100%{transform:translateX(0) scale(1)}25%{transform:translateX(-12px) rotate(-8deg) scale(1.15)}75%{transform:translateX(12px) rotate(8deg) scale(1.15)}}@media(max-width:640px){.baam-reveal-panel{width:min(100%,calc(100vw - 1.5rem));min-height:18rem;padding:2.25rem 1rem 1rem!important;border-radius:1.25rem!important}.baam-reveal-panel #baam-picture{min-height:6rem;max-height:8rem}.baam-reveal-panel #baam-picture img{max-height:8rem}.baam-reveal-panel #baam-answer-controls{width:100%;gap:.6rem}.baam-reveal-panel #baam-answer-controls button{min-height:2.8rem;font-size:.95rem}}@media(prefers-reduced-motion:reduce){.baam-reveal-panel,.baam-reveal-panel::before,.baam-reveal-panel::after,.baam-powerup-reveal .baam-powerup-icon,.baam-powerup-reveal .baam-powerup-icon::before,.baam-powerup-reveal .baam-powerup-icon::after{animation:none!important}.baam-reveal-panel{filter:none!important}}`;
    document.head.appendChild(powerStyle);
    if (!document.getElementById('baam-surprise-css')) { const l = document.createElement('link'); l.id = 'baam-surprise-css'; l.rel = 'stylesheet'; l.href = 'surprise-boxes.css'; document.head.appendChild(l); }
    board.querySelectorAll('.baam-tile').forEach(tile => tile.addEventListener('click', (e) => {
      const curPlayer = baamPlayers[activeGamePlayerIndex];
      if (curPlayer?.isBot && e.isTrusted) return;
      try { window.pokeSfx?.play?.('pop'); } catch (e) {}
      // A card counts as chosen immediately, but completion waits for resolution.
      index = Number(tile.dataset.tile) - 1;
      chosenCards.add(index);
      reveal();
      tile.disabled = true;
      tile.classList.add('is-opened');
    }));
    modal.querySelector('#baam-close')?.addEventListener('click', () => { clearAnswerTimer(); clearBaamBot(); stopGameFinishedActivity(modal); modal.remove(); returnToGamesTab(); }); modal.addEventListener('click', e => { /* Outside clicks intentionally do not close the game. */ });
    checkBaamBotTurn();
  }
  window.openBaamboozle = openBaamboozle;
})();
