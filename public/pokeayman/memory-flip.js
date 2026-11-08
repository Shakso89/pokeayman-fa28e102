/* Memory Flip game module: setup modal and card matching gameplay */
// Memory Game word-count chooser
function chooseMemoryDifficulty(listName) {
  const available = getVocabWords(listName, navSchool, navClass).filter(word => word && String(word.vocab_word || '').trim());
  chooseGamePlayers(listName, chooseMemoryDifficulty);
  return;
  const levels = { easy: { pairs: 5, label: 'Easy · 10 cards' }, medium: { pairs: 9, label: 'Medium · 18 cards' }, hard: { pairs: 15, label: 'Hard · 30 cards' } };
  const modal = document.createElement('div');
  modal.className = 'game-inline-view game-setup-panel mx-auto my-4';
  modal.innerHTML = `<div class="game-setup-panel text-center">
    <h2 class="heading-font text-2xl font-bold text-amber-100 mb-2">🧠 Memory Game</h2>
    <p class="text-sm text-indigo-100 mb-4">Choose a difficulty level.</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4" role="group" aria-label="Memory difficulty level">
      ${Object.entries(levels).map(([level, config], index) => `<button type="button" class="memory-level-option rounded-lg border-2 px-3 py-3 text-sm font-bold transition ${index === 0 ? 'is-selected border-lime-300 bg-indigo-700 text-amber-100 ring-2 ring-lime-300' : 'border-indigo-300 bg-slate-900 text-indigo-100 hover:border-indigo-200 hover:bg-slate-800'}" data-level="${level}" aria-pressed="${index === 0}">${config.label}</button>`).join('')}
    </div>
    <div class="rounded-lg border border-indigo-200/25 bg-slate-800/80 p-3 mb-4 text-left">
      <label class="flex items-center gap-2 text-sm font-semibold text-indigo-50"><input id="memory-timer-enabled" type="checkbox" class="accent-teal-400"> Enable per-player timer</label>
      <div id="memory-timer-settings" class="hidden mt-2"><span class="text-xs font-medium text-amber-100">Time for each player</span><div class="grid grid-cols-4 gap-2 mt-1" role="group" aria-label="Memory timer duration"><input type="hidden" id="memory-timer-seconds" value="300"><button type="button" class="memory-timer-option rounded-lg border border-indigo-300 bg-slate-900 px-2 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-200 hover:bg-slate-800" data-seconds="60">1 min</button><button type="button" class="memory-timer-option rounded-lg border border-indigo-200/35 bg-slate-700 px-2 py-2 text-xs font-semibold text-indigo-50 transition hover:border-indigo-300 hover:bg-indigo-600" data-seconds="180">3 min</button><button type="button" class="memory-timer-option rounded-lg border-2 border-lime-300 bg-indigo-700 px-2 py-2 text-xs font-semibold text-amber-100 ring-2 ring-lime-300" data-seconds="300">5 min</button><button type="button" class="memory-timer-option rounded-lg border border-indigo-200/35 bg-slate-700 px-2 py-2 text-xs font-semibold text-indigo-50 transition hover:border-indigo-300 hover:bg-indigo-600" data-seconds="600">10 min</button></div></div>
    </div>
    <div class="flex gap-2"><button type="button" id="memory-level-start" class="flex-1 btn-primary">Start Game</button><button type="button" id="memory-level-cancel" class="flex-1 btn-outline">Cancel</button></div>
  </div>`;
  document.body.appendChild(modal);
  const memoryTimerToggle = modal.querySelector('#memory-timer-enabled');
  memoryTimerToggle.addEventListener('change', () => modal.querySelector('#memory-timer-settings').classList.toggle('hidden', !memoryTimerToggle.checked));
  modal.querySelectorAll('.memory-timer-option').forEach(option => option.addEventListener('click', () => { modal.querySelector('#memory-timer-seconds').value = option.dataset.seconds; modal.querySelectorAll('.memory-timer-option').forEach(button => button.classList.remove('border-lime-300', 'bg-indigo-700', 'ring-2', 'ring-lime-300', 'is-selected')); option.classList.add('border-lime-300', 'bg-indigo-700', 'ring-2', 'ring-lime-300', 'is-selected'); }));
  let selectedLevel = 'easy';
  let memoryStarting = false;
  const startMemoryButton = modal.querySelector('#memory-level-start');
  const memoryError = document.createElement('p');
  memoryError.id = 'memory-setup-error'; memoryError.className = 'hidden text-sm font-semibold text-rose-300 mb-3'; memoryError.setAttribute('role', 'alert');
  startMemoryButton.parentElement.before(memoryError);
  modal.querySelectorAll('.memory-level-option').forEach(option => option.addEventListener('click', () => { selectedLevel = levels[option.dataset.level] ? option.dataset.level : 'easy'; modal.querySelectorAll('.memory-level-option').forEach(button => { const active = button === option; button.classList.toggle('is-selected', active); button.classList.toggle('border-lime-300', active); button.classList.toggle('bg-indigo-700', active); button.classList.toggle('text-amber-100', active); button.classList.toggle('ring-2', active); button.classList.toggle('ring-lime-300', active); button.classList.toggle('border-indigo-300', !active); button.classList.toggle('bg-slate-900', !active); button.classList.toggle('text-indigo-100', !active); button.setAttribute('aria-pressed', String(active)); }); }));
  startMemoryButton.addEventListener('click', () => {
    if (memoryStarting) return;
    const config = levels[selectedLevel] || levels.easy;
    const players = Array.isArray(activeGamePlayers) ? activeGamePlayers.filter(player => player && player.student_name) : [];
    const timerValue = modal.querySelector('#memory-timer-seconds')?.value;
    const timerSeconds = memoryTimerToggle.checked ? (Number(timerValue) || 300) : 0;
    const currentWords = getVocabWords(listName, navSchool, navClass).filter(word => word && String(word.vocab_word || '').trim());
    if (currentWords.length < config.pairs || players.length < 1) {
      memoryError.textContent = currentWords.length < config.pairs ? `This list needs at least ${config.pairs} words for ${selectedLevel}.` : 'Select at least one player before starting.';
      memoryError.classList.remove('hidden');
      return;
    }
    memoryStarting = true; startMemoryButton.disabled = true; startMemoryButton.setAttribute('aria-busy', 'true'); memoryError.classList.add('hidden');
    try {
      activeGamePlayers = players.slice(0, 4);
      pendingGamePlayers = activeGamePlayers.length;
      activeGameReward = Math.max(0, Math.floor(Number(pendingGameReward) || 0));
      activeGameRewardClaimed = false;
      resetGameTurnState();
      modal.remove();
      openGameMemory(listName, selectedLevel, timerSeconds);
    } catch (error) {
      memoryStarting = false; startMemoryButton.disabled = false; startMemoryButton.removeAttribute('aria-busy');
      memoryError.textContent = 'Memory could not start. Check the vocabulary list and try again.'; memoryError.classList.remove('hidden');
    }
  });
  modal.querySelector('#memory-level-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.chooseMemoryDifficulty = chooseMemoryDifficulty;

// Responsive Auto-Scaling Typography
const getDynamicTextClass = (word, totalCards = 10) => {
  const len = (word || '').trim().length;

  // For large grids (18 or 30 cards) where each card is physically smaller:
  if (totalCards > 12) {
    if (len <= 4) return 'text-sm sm:text-base font-extrabold';
    if (len <= 7) return 'text-xs sm:text-sm font-bold';
    return 'text-[11px] sm:text-xs font-bold';
  }

  // For small grids (Easy 10 cards) where cards are physically larger:
  if (len <= 4) return 'text-xl sm:text-2xl font-extrabold';
  if (len <= 7) return 'text-base sm:text-lg font-bold';
  return 'text-sm sm:text-base font-bold';
};
window.getDynamicTextClass = getDynamicTextClass;
const getWordFontSize = (word, totalCards = 10) => getDynamicTextClass(word, totalCards);
window.getWordFontSize = getWordFontSize;

// Power-Up Deck Generation with Strict 2-Card Per Type Cap & Zero-Text Roster
function generateMemoryDeck(vocabWords, difficulty = 'easy', isTimerActive = false) {
  const levels = { easy: 5, medium: 9, hard: 15 };
  const totalPairs = typeof difficulty === 'number' ? difficulty : (levels[difficulty] || 5);
  const totalGridCards = totalPairs * 2;

  const validWords = (Array.isArray(vocabWords) ? vocabWords : []).filter(w => w && String(w.vocab_word || '').trim());
  const chosenWords = validWords.slice().sort(() => Math.random() - 0.5).slice(0, totalPairs);
  const neededMysteryPairs = Math.max(0, totalPairs - chosenWords.length);

  const cards = [];
  chosenWords.forEach((word, pairIndex) => {
    const cleanWord = String(word.vocab_word).trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const pairId = `memory-pair-${pairIndex}-${cleanWord}`;
    cards.push({
      pairId,
      cardId: `${pairId}-word`,
      type: 'word',
      word
    });
    cards.push({
      pairId,
      cardId: `${pairId}-image`,
      type: 'image',
      word
    });
  });

  if (neededMysteryPairs > 0) {
    // Strict 2-Card Cap Per Power-Up Type: maximum 2 bombs, 2 magnets, 2 shuffles per match (1 pair each)
    const MAX_PER_TYPE = 2;
    const availableTypes = ['bomb', 'magnet', 'shuffle'];

    // Select distinct power-up types (at most 1 pair = 2 cards each)
    const shuffledTypes = availableTypes.slice().sort(() => Math.random() - 0.5);
    const selectedTypes = shuffledTypes.slice(0, Math.min(neededMysteryPairs, availableTypes.length));

    selectedTypes.forEach((type, m) => {
      const pairId = `memory-powerup-${m}-${type}-${Math.random().toString(36).slice(2, 6)}`;
      cards.push({
        pairId,
        cardId: `${pairId}-a`,
        type: 'powerup',
        powerup: type,
        mystery: { kind: type, title: type },
        word: { vocab_word: type }
      });
      cards.push({
        pairId,
        cardId: `${pairId}-b`,
        type: 'powerup',
        powerup: type,
        mystery: { kind: type, title: type },
        word: { vocab_word: type }
      });
    });

    // If still more pairs needed (e.g. extremely short vocabulary lists), fill with repeated vocabulary pairs
    const remainingNeededPairs = neededMysteryPairs - selectedTypes.length;
    if (remainingNeededPairs > 0 && validWords.length > 0) {
      for (let r = 0; r < remainingNeededPairs; r++) {
        const word = validWords[r % validWords.length];
        const cleanWord = String(word.vocab_word).trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
        const pairId = `memory-pair-extra-${r}-${cleanWord}`;
        cards.push({
          pairId,
          cardId: `${pairId}-word`,
          type: 'word',
          word
        });
        cards.push({
          pairId,
          cardId: `${pairId}-image`,
          type: 'image',
          word
        });
      }
    } else if (remainingNeededPairs > 0) {
      // Fallback placeholder pairs if no vocabulary words are present at all
      for (let r = 0; r < remainingNeededPairs; r++) {
        const placeholderWord = { vocab_word: `Word ${r + 1}`, vocab_image: '' };
        const pairId = `memory-pair-placeholder-${r}`;
        cards.push({
          pairId,
          cardId: `${pairId}-word`,
          type: 'word',
          word: placeholderWord
        });
        cards.push({
          pairId,
          cardId: `${pairId}-image`,
          type: 'image',
          word: placeholderWord
        });
      }
    }
  }

  const shuffledCards = cards.sort(() => Math.random() - 0.5);
  return {
    cards: shuffledCards,
    vocabWords: chosenWords,
    neededMysteryPairs,
    totalPairs,
    totalGridCards
  };
}
window.generateMemoryDeck = generateMemoryDeck;

// Memory Game - One card shows word, other shows image
function openGameMemory(listName, difficulty = 'easy', timerSeconds = 0, studentWordCount = null) {
  window.ensureMasterCardBackDefs?.();
  const memoryLevels = { easy: { pairs: 5, columns: 5, rows: 2 }, medium: { pairs: 9, columns: 6, rows: 3 }, hard: { pairs: 15, columns: 10, rows: 3 } };
  const selectedDifficulty = memoryLevels[difficulty] ? difficulty : 'easy';
  const levelConfig = currentRole === 'student' && [5, 10, 15].includes(studentWordCount) ? { pairs: studentWordCount, columns: studentWordCount === 15 ? 10 : 5, rows: studentWordCount === 5 ? 2 : studentWordCount === 10 ? 4 : 3 } : memoryLevels[selectedDifficulty] || memoryLevels.easy;
  setGameReplay(() => { resetGameTurnState(); openGameMemory(listName, selectedDifficulty, timerSeconds, studentWordCount); });
  const words = getGameWords(listName).filter(word => word && String(word.vocab_word || '').trim());
  if (!words.length || !Array.isArray(activeGamePlayers) || !activeGamePlayers.some(player => player && player.student_name)) {
    toast('Memory needs at least one valid vocabulary word and at least one selected player.');
    return;
  }
  if (activeGamePlayers.length === 1) {
    activeGamePlayers.push(window.createRobotPlayer?.(window.selectedBotDifficulty || 'medium') || {
      student_name: 'Robot',
      avatar_pokemon_id: 137,
      __backendId: 'bot-robot',
      isBot: true,
      botDifficulty: window.selectedBotDifficulty || 'medium'
    });
    pendingGamePlayers = 2;
  }
  
  // Build deck with dynamic mystery filler cards
  const isTimerActive = Number.isFinite(Number(timerSeconds)) && Number(timerSeconds) > 0;
  const deckData = generateMemoryDeck(words, selectedDifficulty, isTimerActive);
  const pairs = deckData.cards;
  const selectedWords = deckData.vocabWords;
  
  let flipped = [];
  let matched = new Set();
  let mismatchLocked = false;
  let checkTimer = null;
  let mismatchTimer = null;
  const botMemory = new Map();
  let memoryBotTimer = null;
  const clearMemoryBot = () => {
    if (memoryBotTimer) {
      clearTimeout(memoryBotTimer);
      memoryBotTimer = null;
    }
  };

  const checkMemoryBotTurn = () => {
    clearMemoryBot();
    if (!document.body.contains(modal) || matched.size >= pairs.length) return;
    const curPlayer = activeGamePlayers[activeGamePlayerIndex];
    if (!curPlayer?.isBot) return;

    const diff = curPlayer.botDifficulty || window.selectedBotDifficulty || 'medium';

    memoryBotTimer = setTimeout(() => {
      memoryBotTimer = null;
      if (!document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer) return;
      if (mismatchLocked || flipped.length >= 2) return;

      const availableCards = Array.from(grid.querySelectorAll('.memory-card')).filter(c => {
        const idx = Number(c.dataset.index);
        return !matched.has(idx) && !flipped.includes(idx);
      });
      if (!availableCards.length) return;

      const memoryProb = diff === 'hard' ? 0.90 : (diff === 'medium' ? 0.60 : 0.25);
      let knownPair = null;

      if (Math.random() < memoryProb) {
        const pairMap = new Map();
        for (const c of availableCards) {
          const idx = Number(c.dataset.index);
          const pId = botMemory.get(idx);
          if (pId) {
            if (pairMap.has(pId)) {
              knownPair = [pairMap.get(pId), c];
              break;
            } else {
              pairMap.set(pId, c);
            }
          }
        }
      }

      if (knownPair) {
        knownPair[0].click();
        setTimeout(() => {
          if (!document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer) return;
          knownPair[1].click();
        }, 750);
      } else {
        const c1 = availableCards[Math.floor(Math.random() * availableCards.length)];
        c1.click();
        setTimeout(() => {
          if (!document.body.contains(modal) || activeGamePlayers[activeGamePlayerIndex] !== curPlayer) return;
          const idx1 = Number(c1.dataset.index);
          const p1Id = pairs[idx1]?.pairId;
          let matchingCard = null;
          if (Math.random() < memoryProb && p1Id) {
            const rem = availableCards.filter(c => c !== c1);
            matchingCard = rem.find(c => botMemory.get(Number(c.dataset.index)) === p1Id);
          }
          if (matchingCard) {
            matchingCard.click();
          } else {
            const rem = availableCards.filter(c => c !== c1 && !flipped.includes(Number(c.dataset.index)));
            if (rem.length) {
              const c2 = rem[Math.floor(Math.random() * rem.length)];
              c2.click();
            }
          }
        }, 800);
      }
    }, 1100);
  };
  let roundToken = `${Date.now()}-${Math.random()}`;
  const clearMemoryRoundTimers = () => {
    if (checkTimer) { clearTimeout(checkTimer); checkTimer = null; }
    if (mismatchTimer) { clearTimeout(mismatchTimer); mismatchTimer = null; }
  };
  const invalidateMemoryRound = () => { clearMemoryRoundTimers(); roundToken = `${Date.now()}-${Math.random()}`; };

  // Single source of truth for flipped card faces. Prevents any card from ever getting stuck face-up.
  const syncCardFaces = () => {
    grid.querySelectorAll('.memory-card').forEach(c => {
      const i = Number(c.dataset.index);
      const inner = c.querySelector('.memory-card-inner');
      if (!inner) return;
      const shouldBeFlipped = matched.has(i) || flipped.includes(i);
      if (inner.classList.contains('flipped') !== shouldBeFlipped) {
        inner.classList.toggle('flipped', shouldBeFlipped);
      }
      c.classList.toggle('is-flipped', shouldBeFlipped);
      c.classList.toggle('flipped', shouldBeFlipped);
      c.setAttribute('aria-pressed', String(shouldBeFlipped));
      if (!flipped.includes(i)) {
        c.classList.remove('memory-card-mismatch');
      }
    });
  };

  const resetMismatchState = () => {
    if (mismatchTimer) {
      clearTimeout(mismatchTimer);
      mismatchTimer = null;
    }
    grid.querySelectorAll('.memory-card.memory-card-mismatch').forEach(c => {
      c.classList.remove('memory-card-mismatch');
    });
    flipped = [];
    mismatchLocked = false;
    grid._memoryLockAt = 0;
    syncCardFaces();
    checkMemoryBotTurn();
  };
  
  const modal = document.createElement('div');
  modal.dataset.memoryInline = 'true';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `<div class="memory-game-shell bg-white rounded-2xl shadow-2xl">
    <div class="memory-game-header bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-center justify-between rounded-t-2xl">
      <h2 class="heading-font text-2xl font-bold text-white text-center flex-1">🧠 Memory Game</h2>
      <div class="flex items-center gap-2 flex-wrap justify-end">${gameSoundControls()}<button id="game-close" class="text-white hover:bg-white/20 hover:text-yellow-200 text-2xl font-bold w-10 h-9 rounded-xl bg-white/10 border border-white/10 transition-all duration-200 shadow-lg shadow-purple-950/10" aria-label="Close game" title="Close">×</button></div>
    </div>
    <div class="memory-game-body">
      <div class="game-player-hud-slot memory-game-hud flex justify-center w-full"></div>
      <div id="memory-grid" class="memory-game-grid" style="perspective: 1000px; container-type: size;"></div>
      <div class="memory-game-status text-center">
        <p id="memory-status" class="text-lg font-bold text-gray-700"></p>
      </div>
    </div>
  </div>`;

  const memoryGamesArea = document.getElementById(currentRole === 'student' ? 'student-tab-games' : 'class-subtab-games');
  const memoryGamesHub = memoryGamesArea?.querySelector(':scope > .glass-container');
  if (memoryGamesArea && memoryGamesHub) {
    memoryGamesArea.querySelectorAll(':scope > .game-inline-view, :scope > .game-popup-modal').forEach(view => view.remove());
    const inlineMemoryView = document.createElement('div');
    inlineMemoryView.className = 'game-inline-view';
    inlineMemoryView.dataset.inGamesHub = 'true';
    inlineMemoryView.appendChild(modal);
    memoryGamesArea.appendChild(inlineMemoryView);
    memoryGamesHub.hidden = true;
    modal.classList.remove('fixed', 'inset-0', 'bg-black/50', 'z-50', 'p-4');
  } else {
    document.body.appendChild(modal);
  }
  modal._cleanupMemoryRound = invalidateMemoryRound;
  window._activeMemoryModal = modal;
  attachGameSoundControls(modal);
  attachGameFullscreen(modal);
  renderGamePlayerHud(modal, selectedWords.length, 0);
  startPlayerTurnTimer(modal, timerSeconds);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cardHoloSweep {
      0% { transform: translateX(-140%) rotate(25deg); opacity: 0; }
      20% { opacity: 0.95; }
      80% { opacity: 0.8; }
      100% { transform: translateX(140%) rotate(25deg); opacity: 0; }
    }
    @keyframes cardMatchBurst {
      0% { transform: scale(1.02); filter: brightness(1); }
      40% { transform: scale(1.12) translateY(-4px); filter: brightness(1.3) drop-shadow(0 0 20px rgba(74, 222, 128, 0.95)); }
      100% { transform: scale(1.05) translateY(-2px); filter: brightness(1.2) drop-shadow(0 0 14px rgba(74, 222, 128, 0.85)); }
    }
    @keyframes cardVanishFade {
      0% { transform: scale(1.05); opacity: 1; filter: brightness(1.3) drop-shadow(0 0 15px rgba(74, 222, 128, 0.9)); }
      100% { transform: scale(0); opacity: 0; filter: brightness(2) blur(4px); }
    }
    @keyframes cardMismatchWobble {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(3px); }
    }
    @keyframes gaBoardShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px) rotate(-0.5deg); }
      40%, 80% { transform: translateX(6px) rotate(0.5deg); }
    }
    .ga-board-shake {
      animation: gaBoardShake 0.48s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
    }
    @keyframes gaDittoWobble {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(0.85) rotate(180deg); }
      100% { transform: scale(1) rotate(360deg); }
    }
    .ga-ditto-wobble {
      animation: gaDittoWobble 0.4s ease-in-out both !important;
    }
    
    .memory-card {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      cursor: pointer;
      position: relative;
      border-radius: 14px;
      overflow: visible !important;
      perspective: 1000px;
      -webkit-perspective: 1000px;
      aspect-ratio: 1 / 1;
      width: 100%;
      height: 100%;
      transition: transform 0.12s ease-out;
    }
    .memory-card:active:not(.memory-card-matched):not(.memory-card-disappeared) {
      transform: scale(0.96);
    }
    .memory-card:not(.is-flipped):not(.flipped):not(.memory-card-matched):hover {
      transform: translateY(-2px);
    }
    .memory-card.memory-card-mismatch {
      animation: cardMismatchWobble 0.35s ease forwards;
    }
    .memory-card.memory-card-matched {
      animation: cardMatchBurst 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      pointer-events: none !important;
    }
    .memory-card.memory-card-disappearing {
      animation: cardVanishFade 0.32s ease-in forwards !important;
      pointer-events: none !important;
    }
    .memory-card.memory-card-disappeared,
    .memory-card.memory-card-disappeared *,
    .memory-card.memory-card-disappeared .memory-card-inner,
    .memory-card.memory-card-disappeared .memory-card-front,
    .memory-card.memory-card-disappeared .memory-card-back {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      transform: scale(0) !important;
    }
    
    .memory-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
    }
    .memory-card-inner.flipped,
    .memory-card.is-flipped .memory-card-inner,
    .memory-card.flipped .memory-card-inner {
      transform: rotateY(180deg) !important;
    }
    
    .memory-card-front, .memory-card-back {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: inherit !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      pointer-events: none !important;
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
    }
    .memory-card-front {
      transform: rotateY(0deg) translateZ(1px) !important;
      -webkit-transform: rotateY(0deg) translateZ(1px) !important;
      background: #ffffff;
    }
    .memory-card-back {
      transform: rotateY(180deg) translateZ(1px) !important;
      -webkit-transform: rotateY(180deg) translateZ(1px) !important;
      background: #ffffff !important;
    }
    .memory-card-inner.flipped .memory-card-back,
    .memory-card.is-flipped .memory-card-back,
    .memory-card.flipped .memory-card-back {
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.8), 0 8px 24px rgba(56, 189, 248, 0.35);
    }
    
    .memory-card:focus,
    .memory-card:focus-visible,
    .memory-card-inner:focus,
    .memory-card-inner:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .memory-card:not(.is-flipped):not(.flipped) .memory-card-back {
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .memory-card.is-flipped .memory-card-front,
    .memory-card.flipped .memory-card-front {
      visibility: hidden !important;
      pointer-events: none !important;
    }
    .memory-card-back::after {
      content: '';
      position: absolute;
      inset: -60%;
      background: linear-gradient(
        115deg,
        transparent 0%,
        rgba(255, 255, 255, 0) 36%,
        rgba(255, 255, 255, 0.35) 44%,
        rgba(147, 197, 253, 0.85) 49%,
        rgba(255, 255, 255, 0.95) 51%,
        rgba(255, 255, 255, 0.35) 56%,
        rgba(255, 255, 255, 0) 64%,
        transparent 100%
      );
      transform: translateX(-140%) rotate(25deg);
      pointer-events: none;
      z-index: 10;
      opacity: 0;
    }
    .memory-card-inner.flipped .memory-card-back::after {
      animation: cardHoloSweep 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s forwards;
    }
    html:has(.ga-stage), body.ga-playing { overflow: hidden !important; box-sizing: border-box; }
    *, *::before, *::after { box-sizing: border-box; }
    .memory-game-shell { position: relative; inset: auto; width: 100%; max-width: 100%; height: auto; min-height: 0; max-height: 92vh; overflow: hidden; display: flex; flex-direction: column; margin: 0; padding: 0; transform: none; box-sizing: border-box; }
    .game-fullscreen-active .memory-game-shell { position: relative; inset: auto; width: 100%; max-width: none; height: 100%; min-height: 0; max-height: none; overflow: hidden; }
    .game-inline-view .memory-game-shell { position: relative; inset: auto; width: 100%; height: 100%; min-height: 0; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; }
    .game-inline-view .memory-game-shell .memory-game-header { flex: 0 0 auto; }
    .game-inline-view .memory-game-shell .memory-game-body { flex: 1 1 0%; min-height: 0; height: 100%; overflow: hidden; }
    .game-inline-view .memory-game-shell .memory-game-grid { flex: 1 1 0%; min-height: 0; height: 100%; align-content: center; justify-content: center; overflow: hidden; }
    .game-inline-view .memory-game-shell .game-player-hud-slot { flex: 0 0 auto; min-height: 0; }
    @media (max-width: 640px) {
      .game-inline-view .memory-game-shell { height: 100%; min-height: 0; max-height: 85vh; overflow: hidden; }
      .game-inline-view .memory-game-shell .memory-game-body { min-height: 0; height: 100%; overflow: hidden; }
      .game-inline-view .memory-game-shell .memory-game-grid { height: 100%; min-height: 0; overflow: hidden; }
    }
    .memory-game-header, .memory-game-body, .memory-game-hud, .memory-game-status, .memory-game-grid { min-height: 0; }
    .memory-game-body { flex: 1 1 0%; min-height: 0; max-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(4px, 1vh, 10px); padding: clamp(6px, 1vh, 12px); overflow: hidden; }
    html body > .ga-stage .memory-game-body, html body > .ga-stage .ga-stage-shell > .memory-game-body { width: 100% !important; max-width: none !important; padding-left: clamp(0.75rem, 2vw, 2.5rem) !important; padding-right: clamp(0.75rem, 2vw, 2.5rem) !important; }
    .memory-game-grid { width: 100%; height: 100%; flex: 1 1 0%; min-width: 0; min-height: 0; max-height: 100%; display: grid; align-content: center; justify-content: center; align-items: center; justify-items: center; gap: var(--memory-gap, 8px); grid-template-columns: repeat(var(--memory-cols, 4), minmax(0, 1fr)); grid-template-rows: repeat(var(--memory-rows, 4), minmax(0, 1fr)); overflow: hidden; box-sizing: border-box; background: transparent !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; }
    html body > .ga-stage[data-ga-theme] .memory-game-grid, html body > .ga-stage:not([data-ga-theme]) .memory-game-grid { background: transparent !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; }
    .memory-game-grid .memory-card { width: 100%; height: 100%; min-width: 0; min-height: 0; max-width: 100%; max-height: 100%; aspect-ratio: 1 / 1; box-sizing: border-box; overflow: visible; position: relative; margin: 0; }
    .memory-game-status { flex: 0 0 auto; min-height: 1.25rem; line-height: 1.1; }
  `;
  document.head.appendChild(style);
  
  const cardBackUrl = document.querySelector('[data-template-id="memory-card-back"]')?.src || '';
  const frozenThemeId = modal.dataset.frozenTheme || modal.dataset.gaTheme || (typeof window.gaGetTheme === 'function' ? window.gaGetTheme() : 'classroom');
  modal.dataset.frozenTheme = frozenThemeId;
  const activeMemoryTheme = (window.gaThemes || []).find(t => t.id === frozenThemeId) || (window.gaThemes || [])[0];
  const grid = modal.querySelector('#memory-grid');
  let memoryGridColumns = levelConfig.columns;
  const updateMemoryGridDensity = () => { delete grid.dataset.fitKey; requestAnimationFrame(fitMemoryBoard); };
  modal.querySelector('#memory-size-decrease')?.addEventListener('click', () => { updateMemoryGridDensity(); });
  modal.querySelector('#memory-size-increase')?.addEventListener('click', () => { updateMemoryGridDensity(); });
  
  grid.innerHTML = pairs.map((p, idx) => {
    const isMatched = matched.has(idx);
    const wordText = String(p.word?.vocab_word || '').trim();
    const imgSrc = (p.word?.vocab_image || '').trim() || 'https://via.placeholder.com/160?text=Image+Not+Found';
    const totalGridCards = pairs.length;
    let revealedContent = '';
    
    if (p.type === 'word') {
      revealedContent = `
        <div class="w-full h-full p-2 flex items-center justify-center overflow-hidden">
          <div class="w-full h-full max-h-[82%] px-2.5 py-1.5 rounded-2xl bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-center shadow-inner">
            <span class="text-slate-950 leading-tight select-none break-words line-clamp-2 max-w-full ${getDynamicTextClass(wordText, totalGridCards)}">
              ${wordText}
            </span>
          </div>
        </div>
      `;
    } else if (p.type === 'image') {
      revealedContent = `
        <div class="w-full h-full p-2 flex items-center justify-center overflow-hidden">
          <div class="w-full h-full max-h-[82%] p-1.5 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-inner overflow-hidden select-none">
            <img src="${imgSrc}" class="w-full h-full object-contain rounded-lg" alt="${wordText}" onerror="this.src='https://via.placeholder.com/160?text=Image+Not+Found'; this.style.backgroundColor='#e9d5ff';">
          </div>
        </div>
      `;
    } else if (p.type === 'powerup' || p.type === 'mystery') {
      const type = p.powerup || p.mystery?.kind || 'bomb';
      let svg = '';
      if (type === 'bomb') {
        svg = `<svg class="w-3/5 h-3/5 text-amber-500 drop-shadow select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="88" rx="26" ry="6" fill="rgba(0,0,0,0.25)"/>
          <path d="M50 36 C50 20 64 24 66 14" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          <circle cx="66" cy="14" r="5" fill="#f59e0b"/>
          <path d="M66 6 L69 12 L75 14 L69 16 L66 22 L63 16 L57 14 L63 12 Z" fill="#ef4444"/>
          <circle cx="66" cy="14" r="2.5" fill="#fef08a"/>
          <rect x="42" y="32" width="16" height="7" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2"/>
          <circle cx="50" cy="62" r="28" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
          <ellipse cx="40" cy="52" rx="9" ry="4.5" transform="rotate(-35 40 52)" fill="rgba(255,255,255,0.4)"/>
        </svg>`;
      } else if (type === 'magnet' || type === 'radar') {
        svg = `<svg class="w-3/5 h-3/5 text-red-500 drop-shadow select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 18 C18 10 32 6 36 12" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 3"/>
          <path d="M78 18 C82 10 68 6 64 12" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 3"/>
          <path d="M50 8 L52 13 L57 15 L52 17 L50 22 L48 17 L43 15 L48 13 Z" fill="#fbbf24"/>
          <path d="M25 8 L26 11 L29 12 L26 13 L25 16 L24 13 L21 12 L24 11 Z" fill="#38bdf8"/>
          <path d="M75 8 L76 11 L79 12 L76 13 L75 16 L74 13 L71 12 L74 11 Z" fill="#38bdf8"/>
          <path d="M22 28 V58 C22 74 34 86 50 86 C66 86 78 74 78 58 V28 H62 V56 C62 63 57 68 50 68 C43 68 38 63 38 56 V28 H22 Z" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
          <rect x="22" y="20" width="16" height="12" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
          <rect x="62" y="20" width="16" height="12" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
          <path d="M26 34 V56 C26 68 36 78 48 80" stroke="rgba(255,255,255,0.45)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        </svg>`;
      } else if (type === 'shuffle' || type === 'ditto') {
        svg = `<svg class="w-3/5 h-3/5 text-blue-400 drop-shadow select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="38" stroke="rgba(96, 165, 250, 0.15)" stroke-width="8"/>
          <path d="M30 32 C35 24 44 20 54 20 C68 20 80 30 82 44" stroke="#60a5fa" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M74 46 L82 46 L86 38" fill="#60a5fa" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
          <path d="M70 68 C65 76 56 80 46 80 C32 80 20 70 18 56" stroke="#38bdf8" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M26 54 L18 54 L14 62" fill="#38bdf8" stroke="#0284c7" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="50" cy="50" r="5" fill="#93c5fd"/>
        </svg>`;
      }
      revealedContent = `
        <div class="w-full h-full p-2 sm:p-2.5 flex items-center justify-center">
          <div class="w-full h-full rounded-2xl flex items-center justify-center border-2 border-slate-900/80 shadow-inner bg-slate-800/40">
            ${svg}
          </div>
        </div>
      `;
    }
    
    const cardBackHtml = activeMemoryTheme?.cardBackSvg ? `<div class="ga-card-back-art w-full h-full flex items-center justify-center p-2" data-theme-id="${frozenThemeId}" aria-hidden="true">${activeMemoryTheme.cardBackSvg}</div>` : '';
    return isMatched ? `<div class="memory-card memory-card-placeholder" aria-hidden="true" data-index="${idx}" data-card-id="${p.cardId}" data-pair-id="${p.pairId}" style="visibility:hidden; pointer-events:none;"></div>` : `<div class="memory-card relative rounded-xl shadow-xl cursor-pointer" data-index="${idx}" data-card-id="${p.cardId}" data-pair-id="${p.pairId}" data-type="${p.type}" data-word="${wordText}" aria-label="${p.type === 'word' ? 'Word card' : p.type === 'image' ? 'Picture card' : 'Mystery card'}" aria-pressed="${flipped.includes(idx)}" tabindex="0" role="button" style="container-type: size;">
      <div class="memory-card-inner w-full h-full">
        <div class="memory-card-front bg-white bg-cover bg-center" style="${cardBackUrl ? `background-image: url('${cardBackUrl}');` : ''}">
          ${cardBackHtml}
        </div>
        <div class="memory-card-back bg-white p-1">
          ${revealedContent}
        </div>
      </div>
    </div>`;
  }).join('');

  const fitMemoryBoard = () => {
    const shell = modal.querySelector('.memory-game-shell');
    const header = modal.querySelector('.memory-game-header');
    const body = modal.querySelector('.memory-game-body');
    const hud = modal.querySelector('.memory-game-hud');
    const status = modal.querySelector('.memory-game-status');
    if (!shell || !body || !grid) return;
    const count = Math.max(1, pairs.length);
    const bodyStyle = getComputedStyle(body);
    const gridStyle = getComputedStyle(grid);
    const bodyPadX = (parseFloat(bodyStyle.paddingLeft) || 0) + (parseFloat(bodyStyle.paddingRight) || 0);
    const bodyPadY = (parseFloat(bodyStyle.paddingTop) || 0) + (parseFloat(bodyStyle.paddingBottom) || 0);
    const gridPadX = (parseFloat(gridStyle.paddingLeft) || 0) + (parseFloat(gridStyle.paddingRight) || 0);
    const gridPadY = (parseFloat(gridStyle.paddingTop) || 0) + (parseFloat(gridStyle.paddingBottom) || 0);
    const gridBorderX = (parseFloat(gridStyle.borderLeftWidth) || 0) + (parseFloat(gridStyle.borderRightWidth) || 0);
    const gridBorderY = (parseFloat(gridStyle.borderTopWidth) || 0) + (parseFloat(gridStyle.borderBottomWidth) || 0);

    // CRITICAL: Measure container width from the parent container (body), NEVER grid.clientWidth.
    // grid.style.maxWidth is set by this function, so reading grid.clientWidth causes recursive collapsing ratchet.
    const containerW = Math.max(0, (body.clientWidth || shell.clientWidth || modal.clientWidth || window.innerWidth) - bodyPadX);
    const availableWidth = Math.max(1, containerW - gridPadX - gridBorderX - 8);

    const inlineMode = !modal.classList.contains('game-fullscreen-active') && !document.fullscreenElement;
    const measuredBodyHeight = body.clientHeight || (inlineMode ? Math.min(680, Math.max(380, availableWidth * .75)) : (window.innerHeight - 80));
    const hudHeight = hud?.offsetHeight || 0;
    const statusHeight = status?.offsetHeight || 0;
    const containerH = Math.max(0, measuredBodyHeight - bodyPadY - hudHeight - statusHeight);
    const availableHeight = Math.max(1, containerH - gridPadY - gridBorderY - 8);
    
    // Select layout that maximizes card size while preferring fully-packed rectangular grids (no orphan cards)
    let best = { size: 0, cols: 4, rows: Math.ceil(count / 4), gap: 8, score: 0 };

    for (let cols = 2; cols <= Math.min(count, 10); cols++) {
      const rows = Math.ceil(count / cols);
      const gap = availableWidth < 600 || availableHeight < 500 ? 6 : Math.max(6, Math.min(12, Math.floor(Math.min(availableWidth / cols, availableHeight / rows) * 0.08)));
      const sizeW = (availableWidth - gap * (cols - 1)) / cols;
      const sizeH = (availableHeight - gap * (rows - 1)) / rows;
      const size = Math.min(sizeW, sizeH);

      // Prefer clean rectangular packing (e.g. 10x3, 6x5, 6x3, 5x2) over layouts with leftover orphan cards
      const isEvenDivision = count % cols === 0;
      const score = isEvenDivision ? size * 1.15 : size;

      if (score > best.score + 0.5) {
        best = { size, cols, rows, gap, score };
      }
    }

    const maxFitSizeW = Math.floor((availableWidth - best.gap * (best.cols - 1)) / best.cols);
    const maxFitSizeH = Math.floor((availableHeight - best.gap * (best.rows - 1)) / best.rows);
    const clampedSize = Math.max(36, Math.min(180, Math.floor(best.size), maxFitSizeW, maxFitSizeH));
    const targetCardW = Math.floor(best.cols * clampedSize + best.gap * (best.cols - 1));
    const targetCardH = Math.floor(best.rows * clampedSize + best.gap * (best.rows - 1));
    const targetGridW = targetCardW + gridPadX + gridBorderX;
    const targetGridH = targetCardH + gridPadY + gridBorderY;

    if (grid.dataset.fitKey === `${best.cols}|${best.rows}|${clampedSize}|${best.gap}|${targetGridW}|${targetGridH}`) return;
    grid.dataset.fitKey = `${best.cols}|${best.rows}|${clampedSize}|${best.gap}|${targetGridW}|${targetGridH}`;
    grid.style.setProperty('--memory-cols', best.cols);
    grid.style.setProperty('--memory-rows', best.rows);
    grid.style.setProperty('--memory-gap', `${best.gap}px`);
    grid.style.setProperty('--memory-card-size', `${clampedSize}px`);
    grid.style.maxWidth = `${targetGridW}px`;
    grid.style.maxHeight = `${targetGridH}px`;
    grid.style.width = '100%';
    grid.style.height = '100%';
    grid.style.gridTemplateColumns = `repeat(${best.cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${best.rows}, 1fr)`;
  };
  const scheduleMemoryFit = () => requestAnimationFrame(() => requestAnimationFrame(fitMemoryBoard));
  scheduleMemoryFit();
  window.addEventListener('resize', scheduleMemoryFit);
  window.addEventListener('orientationchange', scheduleMemoryFit);
  document.addEventListener('fullscreenchange', scheduleMemoryFit);
  window.visualViewport?.addEventListener('resize', scheduleMemoryFit);
  const memoryResizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleMemoryFit) : null;
  memoryResizeObserver?.observe(modal.querySelector('.memory-game-shell'));
  memoryResizeObserver?.observe(modal.querySelector('.memory-game-body'));
  modal._cleanupMemoryFit = () => { window.removeEventListener('resize', scheduleMemoryFit); window.removeEventListener('orientationchange', scheduleMemoryFit); document.removeEventListener('fullscreenchange', scheduleMemoryFit); window.visualViewport?.removeEventListener('resize', scheduleMemoryFit); memoryResizeObserver?.disconnect(); };

  function runMemoryCheck() {
    checkTimer = null;
    try {
      checkMatch();
    } catch (error) {
      console.error('Memory check failed', error);
      clearMemoryRoundTimers();
      resetMismatchState();
    }
  }

  function checkMatch() {
    if (flipped.length !== 2) {
      clearMemoryRoundTimers();
      resetMismatchState();
      return;
    }
    const [idx1, idx2] = flipped;
    const firstCard = pairs[idx1];
    const secondCard = pairs[idx2];
    if (!firstCard || !secondCard || idx1 === idx2) {
      clearMemoryRoundTimers();
      resetMismatchState();
      return;
    }
    
    const card1 = grid.querySelector('.memory-card[data-index="' + idx1 + '"]');
    const card2 = grid.querySelector('.memory-card[data-index="' + idx2 + '"]');

    const isSamePair = firstCard.pairId === secondCard.pairId && firstCard.cardId !== secondCard.cardId;
    const normWord = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isMatchingVocabPair = firstCard.cardId !== secondCard.cardId &&
      firstCard.type !== secondCard.type &&
      (firstCard.type === 'word' || firstCard.type === 'image') &&
      (secondCard.type === 'word' || secondCard.type === 'image') &&
      normWord(firstCard.word?.vocab_word) === normWord(secondCard.word?.vocab_word);

    if (isSamePair || isMatchingVocabPair) {
      // Correct match!
      clearMemoryRoundTimers();
      matched.add(idx1);
      matched.add(idx2);
      flipped = [];
      mismatchLocked = false;
      grid._memoryLockAt = 0;

      // Handle Power-Up pair effects vs standard vocabulary pair
      if (firstCard.type === 'powerup' || firstCard.type === 'mystery') {
        const kind = firstCard.powerup || firstCard.mystery?.kind || 'bomb';
        if (kind === 'bomb') {
          // 💣 Bomb: Deducts 1 point from active player and ends the turn. (Updated: in multiplayer, deducts 1 point from other player(s))
          try { window.pokeSfx?.play?.('boom'); } catch (e) {}
          playTransactionSound('deduction');
          const shell = modal.querySelector('.memory-game-shell') || grid;
          shell.classList.remove('ga-board-shake');
          void shell.offsetWidth;
          shell.classList.add('ga-board-shake');
          setTimeout(() => shell.classList.remove('ga-board-shake'), 650);

          if (activeGamePlayers.length > 1) {
            activeGamePlayers.forEach((p, idx) => {
              if (idx !== activeGamePlayerIndex) {
                activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);
              }
            });
            updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
          } else if (activeGamePlayers.length === 1) {
            activeGameScores[0] = Math.max(0, (activeGameScores[0] || 0) - 1);
            updateGamePlayerHud(modal, selectedWords.length, 0);
          }

          const status = modal.querySelector('#memory-status');
          if (status) {
            if (activeGamePlayers.length === 2) {
              const otherIdx = activeGamePlayerIndex === 0 ? 1 : 0;
              const otherName = activeGamePlayers[otherIdx]?.student_name || 'Opponent';
              status.innerHTML = `<span class="text-rose-500 font-extrabold text-xl animate-bounce">💣 BOOM! -1 Point to ${escapeHtml(otherName)}!</span>`;
            } else if (activeGamePlayers.length > 2) {
              status.innerHTML = '<span class="text-rose-500 font-extrabold text-xl animate-bounce">💣 BOOM! -1 Point to each other player!</span>';
            } else {
              status.innerHTML = '<span class="text-rose-500 font-extrabold text-xl animate-bounce">💣 BOOM! -1 Point! Turn ended!</span>';
            }
          }
          // Ends turn
          advanceGameTurn();
          updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
        } else if (kind === 'magnet' || kind === 'radar') {
          // 🧲 Magnet: Auto-reveals and matches one hidden vocabulary pair on board, awarding points to the active player.
          try { window.pokeSfx?.play?.('star'); } catch (e) {}
          playGameSound('success');
          if (activeGamePlayers.length) {
            activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
            updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
            showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
          }
          let targetPairId = null;
          let magnetWord = '';
          for (let i = 0; i < pairs.length; i++) {
            if (!matched.has(i) && pairs[i].type !== 'powerup' && pairs[i].type !== 'mystery') {
              targetPairId = pairs[i].pairId;
              magnetWord = pairs[i].word?.vocab_word || '';
              break;
            }
          }
          if (targetPairId) {
            const targetIndices = [];
            pairs.forEach((p, i) => {
              if (p.pairId === targetPairId) targetIndices.push(i);
            });
            if (targetIndices.length === 2) {
              const [rIdx1, rIdx2] = targetIndices;
              const rc1 = grid.querySelector('.memory-card[data-index="' + rIdx1 + '"]');
              const rc2 = grid.querySelector('.memory-card[data-index="' + rIdx2 + '"]');
              [rc1, rc2].forEach(rc => { if (rc) rc.style.pointerEvents = 'none'; });
              setTimeout(() => {
                matched.add(rIdx1);
                matched.add(rIdx2);
                [rc1, rc2].forEach(rc => {
                  if (!rc) return;
                  rc.classList.add('is-flipped', 'flipped', 'memory-card-matched');
                  rc.querySelector('.memory-card-inner')?.classList.add('flipped');
                  rc.setAttribute('aria-pressed', 'true');
                  rc.style.pointerEvents = 'none';
                });
                setTimeout(() => {
                  [rc1, rc2].forEach(rc => {
                    if (!rc) return;
                    rc.classList.remove('memory-card-matched');
                    rc.classList.add('memory-card-disappeared');
                    rc.style.setProperty('visibility', 'hidden', 'important');
                    rc.style.setProperty('opacity', '0', 'important');
                    rc.style.setProperty('pointer-events', 'none', 'important');
                  });
                  syncCardFaces();
                }, 450);
              }, 200);
            }
          }
          const status = modal.querySelector('#memory-status');
          if (status) {
            status.innerHTML = `<span class="text-cyan-400 font-extrabold text-xl">🧲 Magnet matched: ${magnetWord || 'Pair'}! +1 Point!</span>`;
          }
        } else if (kind === 'shuffle' || kind === 'ditto') {
          // 🔄 Shuffle: Randomizes grid positions of remaining unflipped cards.
          try { window.pokeSfx?.play?.('whoosh'); } catch (e) {}
          playGameSound('select');
          if (activeGamePlayers.length) {
            activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
            updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
          }
          const status = modal.querySelector('#memory-status');
          if (status) {
            status.innerHTML = '<span class="text-purple-400 font-extrabold text-xl">🔄 Shuffle! Cards rearranged!</span>';
          }
          grid.style.pointerEvents = 'none';
          setTimeout(() => {
            const remainingCards = [...grid.querySelectorAll('.memory-card')].filter(c => {
              const i = Number(c.dataset.index);
              return !matched.has(i) && !c.classList.contains('memory-card-disappeared');
            });
            if (remainingCards.length > 1) {
              remainingCards.forEach(c => c.classList.add('ga-ditto-wobble'));
              const shuffledNodes = remainingCards.slice().sort(() => Math.random() - 0.5);
              shuffledNodes.forEach(node => grid.appendChild(node));
              setTimeout(() => {
                remainingCards.forEach(c => c.classList.remove('ga-ditto-wobble'));
                grid.style.pointerEvents = '';
                syncCardFaces();
              }, 450);
            } else {
              grid.style.pointerEvents = '';
            }
          }, 350);
        }
      } else {
        // Standard vocab match
        playGameSound('success');
        if (activeGamePlayers.length) activeGameScores[activeGamePlayerIndex] += 1;
        updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
        showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
      }

      [card1, card2].forEach(c => {
        if (!c) return;
        c.classList.add('memory-card-matched');
        c.setAttribute('aria-pressed', 'true');
        c.style.pointerEvents = 'none';
      });

      // Both cards vanish completely after celebration pulse
      setTimeout(() => {
        if (!document.body.contains(modal)) return;
        [card1, card2].forEach(c => {
          if (!c) return;
          c.classList.remove('memory-card-matched');
          c.classList.add('memory-card-disappeared');
          c.style.setProperty('visibility', 'hidden', 'important');
          c.style.setProperty('opacity', '0', 'important');
          c.style.setProperty('pointer-events', 'none', 'important');
          c.querySelectorAll('*').forEach(child => {
            child.style.setProperty('visibility', 'hidden', 'important');
            child.style.setProperty('opacity', '0', 'important');
            child.style.setProperty('pointer-events', 'none', 'important');
          });
        });
        syncCardFaces();
      }, 420);

      if (matched.size === pairs.length) {
        playGameSound('complete');
        setTimeout(() => {
          modal.querySelector('#memory-status').textContent = '🎉 Perfect! All pairs matched!';
          modal.querySelector('#memory-status').style.fontSize = '24px';
          setTimeout(() => showGameCelebration(modal, 'Memory master!'), 650);
          modal.querySelector('#memory-status').style.color = '#7c3aed';
        }, 500);
      } else {
        setTimeout(() => {
          const status = modal.querySelector('#memory-status');
          if (status && !status.textContent.includes('🎉')) status.textContent = '';
        }, 1200);
      }
    } else {
      // Wrong match - pass turn and flip back cleanly
      playGameSound('wrong');
      const prevTurnIndex = activeGamePlayerIndex;
      advanceGameTurn();
      updateGamePlayerHud(modal, selectedWords.length, activeGamePlayerIndex);
      showWrongAnswerCelebration(modal, prevTurnIndex);

      if (card1) card1.classList.add('memory-card-mismatch');
      if (card2) card2.classList.add('memory-card-mismatch');

      const status = modal.querySelector('#memory-status');
      if (status) status.textContent = '';

      clearMemoryRoundTimers();
      mismatchLocked = true;
      grid._memoryLockAt = Date.now();
      mismatchTimer = setTimeout(() => {
        resetMismatchState();
      }, 500);
    }
  }
  
  grid.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(card.dataset.index, 10);
      if (isNaN(idx) || !pairs[idx] || matched.has(idx)) return;

      // If cards are currently in a mismatch state:
      // When clicking a new unrevealed card, instantly resolve previous mismatch
      // so the game feels immediate, smooth, and never stuck!
      if (mismatchLocked || flipped.length >= 2) {
        if (flipped.includes(idx)) return; // clicking one of the current mismatch pair does nothing
        clearMemoryRoundTimers();
        resetMismatchState();
      }

      // Cannot click a card that is already selected
      if (flipped.includes(idx)) return;

      // Flip the card and sync DOM
      flipped.push(idx);
      botMemory.set(idx, pairs[idx]?.pairId);
      syncCardFaces();
      unlockGameSound();
      playGameSound('select');

      if (flipped.length === 2) {
        mismatchLocked = true;
        grid._memoryLockAt = Date.now();
        clearMemoryRoundTimers();
        checkTimer = setTimeout(runMemoryCheck, 300);
      }
    });
  });
  
  modal.querySelectorAll('.memory-card').forEach(card => card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
  }));
  checkMemoryBotTurn();
  modal.querySelector('#game-close').addEventListener('click', () => { clearMemoryRoundTimers(); clearMemoryBot(); roundToken = `${Date.now()}-${Math.random()}`; modal.remove(); });
  modal.addEventListener('remove', () => { clearMemoryRoundTimers(); clearMemoryBot(); roundToken = `${Date.now()}-${Math.random()}`; });
  modal.addEventListener('click', e => { /* Outside clicks intentionally do not close the game. */ });
}
window.openGameMemory = openGameMemory;
