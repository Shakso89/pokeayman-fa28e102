/* Match Words game module: setup modal and matching gameplay */
// Match Words Game - choose a word count, then match words with images
function chooseMatchWordCount(listName) {
  if (currentRole === 'student') { window.gaStudentSetup(listName, 'chooseMatchWordCount'); return; }
  const available = getGameWords(listName, true).filter(w => w.vocab_image && w.vocab_image.trim());
  if (available.length < 2) { toast('List needs at least 2 words with images'); return; }
    const totalAvailable = available.length;
  const wordCountSteps = [5, 8, 10, 12, 15, 18, 20, 25, 30];
  const wordCountOptions = Array.from(new Set([...wordCountSteps, totalAvailable])).sort((a, b) => a - b);
  let curIndex = wordCountOptions.indexOf(totalAvailable);
  if (curIndex < 0) curIndex = 0;
  let selectedMatchWordCount = wordCountOptions[curIndex];

  const modal = document.createElement('div');
  modal.className = 'game-inline-view game-setup-panel mx-auto my-4';
  modal.innerHTML = `<div class="game-setup-panel text-center">
    <h2 class="heading-font text-2xl font-bold text-amber-100 mb-2">🎯 Match Words</h2>
    <div class="ga-match-word-count-panel w-full bg-[#111928]/80 border border-slate-800/80 rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-all hover:border-yellow-500/50 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-yellow-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
          </svg>
        </div>
        <span class="font-bold text-white text-sm">Word count</span>
      </div>
      <div class="bg-[#0b1120] border border-slate-800 rounded-xl p-1 flex items-center gap-1.5">
        <button type="button" class="ga-word-count-dec w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95" aria-label="Decrease word count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <div class="ga-word-count-val min-w-[80px] px-3 py-1.5 bg-slate-800/70 rounded-lg border border-slate-700/40 text-xs font-bold text-slate-100 text-center select-none">
          All (${totalAvailable})
        </div>
        <button type="button" class="ga-word-count-inc w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95" disabled aria-disabled="true" aria-label="Increase word count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
    
    <div class="flex gap-2"><button type="button" id="match-count-start" class="flex-1 btn-primary">Start Game</button><button type="button" id="match-count-cancel" class="flex-1 btn-outline">Cancel</button></div>
  </div>`;
  document.body.appendChild(modal);

  const decBtn = modal.querySelector('.ga-word-count-dec');
  const incBtn = modal.querySelector('.ga-word-count-inc');
  const valSpan = modal.querySelector('.ga-word-count-val');

  const updateWordCountUI = () => {
    const c = wordCountOptions[curIndex];
    selectedMatchWordCount = c;
    modal.dataset.gaMatchWordCount = String(c);
    if (valSpan) {
      if (c === totalAvailable) {
        valSpan.textContent = `All (${c})`;
      } else if (c > totalAvailable) {
        valSpan.textContent = `${c} cards`;
      } else {
        valSpan.textContent = `${c} words`;
      }
    }
    if (decBtn) {
      decBtn.disabled = curIndex <= 0;
      decBtn.setAttribute('aria-disabled', String(curIndex <= 0));
    }
    if (incBtn) {
      incBtn.disabled = curIndex >= wordCountOptions.length - 1;
      incBtn.setAttribute('aria-disabled', String(curIndex >= wordCountOptions.length - 1));
    }
  };
  decBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (curIndex > 0) { curIndex--; updateWordCountUI(); }
  });
  incBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (curIndex < wordCountOptions.length - 1) { curIndex++; updateWordCountUI(); }
  });
  updateWordCountUI();
  modal.querySelector('#match-count-start').addEventListener('click', async () => {
    const count = selectedMatchWordCount;
    const rewardInput = modal.querySelector('#match-reward-coins');
    const rewardRaw = rewardInput?.value.trim() || '0';
    const reward = Number(rewardRaw);
    if (!Number.isInteger(reward) || reward < 0 || reward > getTeacherCredits()) { toast('Reward must be a non-negative whole number within your available credits.'); rewardInput?.focus(); return; }
    pendingGameReward = reward;
    if (pendingGameReward > 0 && !(await deductTeacherCredits(pendingGameReward))) return;
    activeGameReward = pendingGameReward;
    activeGameRewardClaimed = false;
    const timerSeconds = Number.isFinite(Number(pendingGameTimerSeconds)) ? Number(pendingGameTimerSeconds) : 0;
    modal.remove();
    openGameMatch(listName, count, timerSeconds);
  });
  modal.querySelector('#match-count-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
window.chooseMatchWordCount = chooseMatchWordCount;

function openGameMatch(listName, wordCount = null, timerSeconds = 0) {
  const escapeText = typeof escapeHtml === 'function' ? escapeHtml : s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  setGameReplay(() => { resetGameTurnState(); openGameMatch(listName, wordCount, timerSeconds); });
  const words = getGameWords(listName);
  if (words.length < 2) { toast('My lists launch failed: the selected source has fewer than 2 valid words.'); return; }
  
  // Filter words that have images
  const wordsWithImages = words.filter(w => w.vocab_image && w.vocab_image.trim());
  if (wordsWithImages.length < 2) { toast('List needs at least 2 words with images'); return; }
  
  // Select the requested number of words for this round.
  // If the list word count does not cover the requested amount of cards, repeat words to reach the count.
  const requestedCount = Number(wordCount) && Number(wordCount) > 0 ? Number(wordCount) : wordsWithImages.length;
  const shuffledAvailable = wordsWithImages.slice().sort(() => Math.random() - 0.5);
  const selectedItems = [];
  if (requestedCount <= shuffledAvailable.length) {
    selectedItems.push(...shuffledAvailable.slice(0, requestedCount));
  } else {
    for (let i = 0; i < requestedCount; i++) {
      selectedItems.push(shuffledAvailable[i % shuffledAvailable.length]);
    }
  }
  const totalWords = selectedItems.length;

  // Target picture cards: stationary cards shuffled into random order
  const targetCards = selectedItems.slice().sort(() => Math.random() - 0.5).map((w, index) => ({
    targetId: index,
    vocab_word: w.vocab_word,
    vocab_image: w.vocab_image
  }));

  // Word bank: draggable word chips shuffled into a different random order
  const bankWords = selectedItems.slice().sort(() => Math.random() - 0.5).map((w, index) => ({
    wordId: index,
    vocab_word: w.vocab_word
  }));

  // Game state
  const placements = new Map(); // targetIndex -> bankWordId
  const matchedTargets = new Set(); // verified correct target indices
  const wrongTargets = new Set(); // target indices marked wrong
  let selectedWordId = null; // for tap-to-place fallback
  let correctAnswers = 0;
  let isEvaluating = false;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 z-50 p-4 game-match-root';
  modal.innerHTML = `<section class="match-game-shell" aria-label="Match Words game">
    <header class="match-game-header sticky top-0">
      <div class="match-game-heading">
        <h2><span>🎯</span> <span>Match Words</span></h2>
        <p>Drag each word and drop it onto its matching picture</p>
      </div>
      <div class="match-game-tools">
        ${gameSoundControls()}
        <div class="match-game-density" role="group" aria-label="Tile size">
          <button type="button" id="match-size-decrease" aria-label="Show fewer cards per row" title="Fewer cards">−</button>
          <button type="button" id="match-size-increase" aria-label="Show more cards per row" title="More cards">+</button>
        </div>
        <button type="button" id="game-close" aria-label="Close game" title="Close">×</button>
      </div>
    </header>
    <main class="match-game-content">
      <div class="match-game-summary">
        <div class="game-player-hud-slot"></div>
        <div class="match-game-progress" role="status" aria-live="polite">
          <div class="match-game-progress-copy">
            <strong id="match-progress-current">0</strong>
            <span>of ${totalWords} pairs matched</span>
            <span id="match-status">Drag each word and drop it onto its matching picture!</span>
          </div>
          <div class="match-game-progress-track">
            <span id="match-progress-fill"></span>
          </div>
        </div>
      </div>
      <div class="match-targets-scroll">
        <div id="match-board" class="match-targets-grid" role="group" aria-label="Picture target cards"></div>
      </div>
      <div class="match-bank-tray" role="region" aria-label="Word Bank">
        <div class="match-bank-header">
          <div class="match-bank-info">
            <span class="match-bank-title">🔤 Word Bank</span>
            <span id="match-bank-counter" class="match-bank-counter">${totalWords} remaining</span>
          </div>
        </div>
        <div id="match-bank-chips" class="match-bank-chips" role="group" aria-label="Draggable word tiles"></div>
      </div>
    </main>
  </section>`;

  document.body.appendChild(modal);
  attachGameSoundControls(modal);
  attachGameFullscreen(modal);
  renderGamePlayerHud(modal, totalWords, 0);
  startPlayerTurnTimer(modal, timerSeconds);
  window.gaMountStage?.(modal);

  const board = modal.querySelector('#match-board');
  const bankChipsContainer = modal.querySelector('#match-bank-chips');
  const statusEl = modal.querySelector('#match-status');
  const progressCurrentEl = modal.querySelector('#match-progress-current');
  const progressFillEl = modal.querySelector('#match-progress-fill');
  const bankCounterEl = modal.querySelector('#match-bank-counter');

  let matchGridColumns = window.matchMedia('(max-width: 640px)').matches ? 2 : window.matchMedia('(max-width: 900px)').matches ? 3 : 4;
  const updateMatchGridDensity = () => {
    if (board) board.style.gridTemplateColumns = `repeat(${matchGridColumns}, minmax(0, 1fr))`;
  };
  modal.querySelector('#match-size-decrease').addEventListener('click', () => { matchGridColumns = Math.max(2, matchGridColumns - 1); updateMatchGridDensity(); });
  modal.querySelector('#match-size-increase').addEventListener('click', () => { matchGridColumns = Math.min(6, matchGridColumns + 1); updateMatchGridDensity(); });

  // Pointer drag state variables
  let activePointerId = null;
  let dragSource = null;
  let ghostEl = null;
  let startX = 0, startY = 0;
  let hasDragged = false;
  let hoveredCardEl = null;

  function renderBoard() {
    const placedWordIds = new Set(placements.values());
    const remainingCount = bankWords.filter(w => !placedWordIds.has(w.wordId)).length;

    // Render target cards: each entire card is an interactive drop target
    board.innerHTML = targetCards.map((target, index) => {
      const isMatched = matchedTargets.has(index);
      const isWrong = wrongTargets.has(index);
      const placedWordId = placements.get(index);
      const placedWord = placedWordId !== undefined ? bankWords[placedWordId] : null;

      return `<div class="match-target-card${isMatched ? ' is-matched is-correct' : ''}${isWrong ? ' is-wrong' : ''}" data-target-index="${index}" role="button" aria-label="Picture card ${index + 1} for ${escapeText(target.vocab_word)}">
        <div class="match-target-img-wrap pointer-events-none">
          <img class="match-target-img" src="${target.vocab_image}" alt="Picture for ${escapeText(target.vocab_word)}" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found'">
          ${isMatched ? '<span class="match-card-badge check" aria-label="Correct match">✓</span>' : ''}
          ${isWrong ? '<span class="match-card-badge cross" aria-label="Wrong match">✕</span>' : ''}
        </div>
        <div class="match-drop-slot${placedWord ? ' has-word' : ' is-empty'}${isMatched ? ' is-matched' : ''}" data-target-index="${index}" role="region" aria-label="Drop target for picture ${index + 1}">
          ${placedWord ? `
            <div class="match-placed-chip is-locked" data-word-id="${placedWord.wordId}" data-target-index="${index}" role="status" aria-label="Matched word: ${escapeText(placedWord.vocab_word)}">
              <svg class="match-grip-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle>
                <circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle>
              </svg>
              <span class="match-word-text">${escapeText(placedWord.vocab_word)}</span>
            </div>
          ` : `
            <div class="match-slot-placeholder pointer-events-none">
              <span class="match-slot-icon">⬇</span>
              <span class="match-slot-text">Drop word here</span>
            </div>
          `}
        </div>
      </div>`;
    }).join('');

    // Render bank chips: clean pill with grip dots (no speaker icon)
    bankChipsContainer.innerHTML = bankWords.map(word => {
      const isPlaced = placedWordIds.has(word.wordId);
      const isSelected = selectedWordId === word.wordId;

      return `<div class="match-word-chip${isPlaced ? ' is-placed' : ''}${isSelected ? ' is-selected' : ''}"
                   data-word-id="${word.wordId}"
                   role="button"
                   tabindex="${isPlaced ? '-1' : '0'}"
                   aria-disabled="${isPlaced}"
                   aria-pressed="${isSelected}"
                   aria-label="Draggable word: ${escapeText(word.vocab_word)}">
        <svg class="match-grip-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle>
          <circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle>
        </svg>
        <span class="match-word-text">${escapeText(word.vocab_word)}</span>
      </div>`;
    }).join('');

    // Update status and stats
    progressCurrentEl.textContent = String(correctAnswers);
    progressFillEl.style.width = `${Math.round((correctAnswers / totalWords) * 100)}%`;
    bankCounterEl.textContent = `${remainingCount} remaining`;

    if (!isEvaluating) {
      if (correctAnswers === totalWords) {
        statusEl.textContent = '🎉 Perfect! All words correctly matched!';
      } else if (correctAnswers > 0) {
        statusEl.textContent = `${correctAnswers} of ${totalWords} pairs matched. Keep going!`;
      } else {
        statusEl.textContent = 'Drag each word and drop it onto its matching picture!';
      }
    }

    bindInteractions();
  }

  function bindInteractions() {
    // Bank chips drag & tap
    bankChipsContainer.querySelectorAll('.match-word-chip:not(.is-placed)').forEach(chip => {
      const wordId = Number(chip.dataset.wordId);
      const wordObj = bankWords[wordId];

      chip.addEventListener('pointerdown', e => {
        initDrag(e, { type: 'bank', wordId, vocab_word: wordObj.vocab_word, el: chip });
      });

      chip.addEventListener('click', () => {
        if (hasDragged) return;
        handleTapBank(wordId);
      });
    });

    // Picture target cards: tap anywhere on card to place selected word
    board.querySelectorAll('.match-target-card').forEach(card => {
      const targetIndex = Number(card.dataset.targetIndex);
      card.addEventListener('click', () => {
        if (hasDragged || isEvaluating) return;
        if (matchedTargets.has(targetIndex)) return;
        if (selectedWordId !== null) {
          handleDropOnTarget(targetIndex, { type: 'bank', wordId: selectedWordId, vocab_word: bankWords[selectedWordId].vocab_word });
        }
      });
    });
  }

  function initDrag(e, source) {
    if (isEvaluating) return;
    if (activePointerId !== null) return;

    activePointerId = e.pointerId;
    dragSource = source;
    startX = e.clientX;
    startY = e.clientY;
    hasDragged = false;

    const sourceEl = source.el;
    try { sourceEl.setPointerCapture?.(e.pointerId); } catch (_) {}

    function onPointerMove(ev) {
      if (ev.pointerId !== activePointerId) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!hasDragged && Math.hypot(dx, dy) > 5) {
        hasDragged = true;
        sourceEl.classList.add('is-being-dragged');

        ghostEl = document.createElement('div');
        ghostEl.className = 'match-drag-ghost';
        ghostEl.innerHTML = `
          <svg class="match-grip-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle>
            <circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle>
          </svg>
          <span class="match-word-text">${escapeText(source.vocab_word)}</span>
        `;
        ghostEl.style.left = `${ev.clientX}px`;
        ghostEl.style.top = `${ev.clientY}px`;
        document.body.appendChild(ghostEl);
      }

      if (hasDragged && ghostEl) {
        ghostEl.style.left = `${ev.clientX}px`;
        ghostEl.style.top = `${ev.clientY}px`;

        // Detect hover over the entire card container
        const elements = typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(ev.clientX, ev.clientY) : [];
        let card = elements.find(el => el.classList && el.classList.contains('match-target-card'));
        if (!card) {
          const inner = elements.find(el => el.closest && el.closest('.match-target-card'));
          if (inner) card = inner.closest('.match-target-card');
        }

        if (hoveredCardEl && hoveredCardEl !== card) {
          hoveredCardEl.classList.remove('is-drag-over');
          hoveredCardEl = null;
        }

        if (card) {
          const tIdx = Number(card.dataset.targetIndex);
          if (!matchedTargets.has(tIdx)) {
            hoveredCardEl = card;
            card.classList.add('is-drag-over');
          }
        }
      }
    }

    function onPointerEnd(ev) {
      if (ev.pointerId !== activePointerId) return;
      sourceEl.removeEventListener('pointermove', onPointerMove);
      sourceEl.removeEventListener('pointerup', onPointerEnd);
      sourceEl.removeEventListener('pointercancel', onPointerEnd);
      try { sourceEl.releasePointerCapture?.(ev.pointerId); } catch (_) {}

      if (hoveredCardEl) {
        hoveredCardEl.classList.remove('is-drag-over');
        hoveredCardEl = null;
      }

      if (hasDragged) {
        sourceEl.classList.remove('is-being-dragged');
        if (ghostEl) { ghostEl.remove(); ghostEl = null; }

        const elements = typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(ev.clientX, ev.clientY) : [];
        let card = elements.find(el => el.classList && el.classList.contains('match-target-card'));
        if (!card) {
          const inner = elements.find(el => el.closest && el.closest('.match-target-card'));
          if (inner) card = inner.closest('.match-target-card');
        }

        if (card) {
          const targetIndex = Number(card.dataset.targetIndex);
          if (!matchedTargets.has(targetIndex)) {
            handleDropOnTarget(targetIndex, dragSource);
          }
        }
      }

      activePointerId = null;
      dragSource = null;
    }

    sourceEl.addEventListener('pointermove', onPointerMove);
    sourceEl.addEventListener('pointerup', onPointerEnd);
    sourceEl.addEventListener('pointercancel', onPointerEnd);
  }

  function handleTapBank(wordId) {
    if (selectedWordId === wordId) {
      selectedWordId = null;
    } else {
      selectedWordId = wordId;
      unlockGameSound();
      playGameSound('select');
    }
    renderBoard();
  }

  function handleDropOnTarget(targetIndex, source) {
    if (matchedTargets.has(targetIndex) || isEvaluating) return;
    const target = targetCards[targetIndex];
    const wordObj = bankWords[source.wordId];
    if (!target || !wordObj) return;

    selectedWordId = null;

    const normMatch = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCorrect = normMatch(target.vocab_word) === normMatch(wordObj.vocab_word);

    if (isCorrect) {
      // 1. Correct Match: Immediately lock into slot & badge
      matchedTargets.add(targetIndex);
      placements.set(targetIndex, source.wordId);
      wrongTargets.delete(targetIndex);
      correctAnswers++;

      const isBombWord = /^(?:bomb|mega[\s_-]?bomb|💣)$/i.test(String(target.vocab_word || '').trim()) ||
                         /^(?:bomb|mega[\s_-]?bomb|💣)$/i.test(String(wordObj.vocab_word || '').trim()) ||
                         Boolean(target.isBomb || wordObj.isBomb);

      if (isBombWord) {
        try { playTransactionSound('deduction'); } catch (_) {}
        const shell = modal.querySelector('.match-game-shell') || board;
        shell?.classList.remove('ga-board-shake');
        void shell?.offsetWidth;
        shell?.classList.add('ga-board-shake');
        setTimeout(() => shell?.classList.remove('ga-board-shake'), 650);

        if (activeGamePlayers.length > 1) {
          activeGamePlayers.forEach((p, idx) => {
            if (idx !== activeGamePlayerIndex) {
              activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);
            }
          });
        } else if (activeGamePlayers.length === 1) {
          activeGameScores[0] = Math.max(0, (activeGameScores[0] || 0) - 1);
        }

        if (activeGamePlayers.length === 2) {
          const otherIdx = activeGamePlayerIndex === 0 ? 1 : 0;
          const otherName = activeGamePlayers[otherIdx]?.student_name || 'Opponent';
          statusEl.innerHTML = `<span class="text-rose-500 font-extrabold animate-bounce">💣 BOOM! -1 Point to ${escapeText(otherName)}!</span>`;
        } else if (activeGamePlayers.length > 2) {
          statusEl.innerHTML = '<span class="text-rose-500 font-extrabold animate-bounce">💣 BOOM! -1 Point to each other player!</span>';
        } else {
          statusEl.innerHTML = '<span class="text-rose-500 font-extrabold animate-bounce">💣 BOOM! -1 Point!</span>';
        }

        if (activeGamePlayers.length > 1) {
          advanceGameTurn();
        }
      } else {
        if (activeGamePlayers.length) {
          activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
        }

        unlockGameSound();
        playGameSound('success');
        showCorrectAnswerCelebration(modal, activeGamePlayerIndex);
        statusEl.textContent = `✅ Correct! "${target.vocab_word}" matched!`;
      }

      updateGamePlayerHud(modal, totalWords, activeGamePlayerIndex);
      renderBoard();

      // Auto-Completion: Trigger victory modal when all pairs matched
      if (correctAnswers === totalWords) {
        statusEl.textContent = '🎉 Perfect! All words correctly matched!';
        playGameSound('complete');
        setTimeout(() => showGameCelebration(modal, 'Perfect match!'), 520);
      }
    } else {
      // 2. Incorrect Match: Gentle bounce, shake, return pill to bank
      unlockGameSound();
      playGameSound('wrong');

      const prevPlayer = activeGamePlayerIndex;
      if (activeGamePlayers.length > 1) {
        advanceGameTurn();
        updateGamePlayerHud(modal, totalWords, activeGamePlayerIndex);
        showWrongAnswerCelebration(modal, prevPlayer);
      }

      statusEl.textContent = `❌ Try again! That's not "${wordObj.vocab_word}".`;

      const cardEl = board.querySelector(`.match-target-card[data-target-index="${targetIndex}"]`);
      if (cardEl) {
        cardEl.classList.add('is-wrong');
        const slotEl = cardEl.querySelector('.match-drop-slot');
        if (slotEl) slotEl.classList.add('is-wrong');
      }

      // Do NOT dock into slot
      placements.delete(targetIndex);

      setTimeout(() => {
        if (cardEl) {
          cardEl.classList.remove('is-wrong');
          const slotEl = cardEl.querySelector('.match-drop-slot');
          if (slotEl) slotEl.classList.remove('is-wrong');
        }
        renderBoard();
      }, 650);
    }
  }

  updateMatchGridDensity();
  renderBoard();

  modal.querySelector('#game-close').addEventListener('click', () => {
    modal._cleanupMemoryFit?.();
    modal.remove();
  });
  modal.addEventListener('click', e => { /* Outside clicks do not close game */ });
}
window.openGameMatch = openGameMatch;

// Memory Game word-count chooser
