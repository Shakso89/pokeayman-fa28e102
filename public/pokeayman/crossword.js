/* Vocabulary crossword game. Uses the shared arcade player, timer, reward and theme systems. */
(() => {
  const cleanAnswer = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
  const escCrossword = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const crosswordWords = listName => {
    const seen = new Set();
    return (typeof getGameWords === 'function' ? getGameWords(listName) : []).map(record => {
      const answer = cleanAnswer(record.vocab_word);
      if (answer.length < 2 || seen.has(answer)) return null;
      seen.add(answer);
      const rawClue = record.vocab_translation || record.vocab_meaning || record.vocab_definition || record.definition || record.example_sentence || record.vocab_sentence || '';
      const clueText = String(rawClue).trim().replace(new RegExp(String(record.vocab_word || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '_____');
      return { answer, word: String(record.vocab_word || answer), clue: clueText, image: String(record.vocab_image || '') };
    }).filter(Boolean).slice(0, 12);
  };
  const coordKey = (row, col) => `${row},${col}`;
  function buildCrossword(entries) {
    const words = entries.slice().sort((a, b) => b.answer.length - a.answer.length);
    const placed = [];
    const cells = new Map();
    const canPlace = (entry, row, col, direction) => {
      const dr = direction === 'down' ? 1 : 0, dc = direction === 'across' ? 1 : 0;
      const before = cells.get(coordKey(row - dr, col - dc));
      const after = cells.get(coordKey(row + dr * entry.answer.length, col + dc * entry.answer.length));
      if (before || after) return false;
      let crossings = 0;
      for (let i = 0; i < entry.answer.length; i++) {
        const r = row + dr * i, c = col + dc * i, existing = cells.get(coordKey(r, c));
        if (existing) {
          if (existing.letter !== entry.answer[i]) return false;
          crossings++;
        } else {
          const sideA = cells.get(coordKey(r + (direction === 'across' ? -1 : 0), c + (direction === 'down' ? -1 : 0)));
          const sideB = cells.get(coordKey(r + (direction === 'across' ? 1 : 0), c + (direction === 'down' ? 1 : 0)));
          if (sideA || sideB) return false;
        }
      }
      return crossings > 0;
    };
    const place = (entry, row, col, direction) => {
      const dr = direction === 'down' ? 1 : 0, dc = direction === 'across' ? 1 : 0;
      for (let i = 0; i < entry.answer.length; i++) {
        const r = row + dr * i, c = col + dc * i, key = coordKey(r, c);
        if (!cells.has(key)) cells.set(key, { row: r, col: c, letter: entry.answer[i], wordIds: [] });
        cells.get(key).wordIds.push(entry.id);
      }
      placed.push({ ...entry, row, col, direction });
    };
    const first = words[0];
    first.id = 0; place(first, 12, 12, 'across');
    for (const entry of words.slice(1)) {
      let best = null;
      for (const current of placed) {
        const direction = current.direction === 'across' ? 'down' : 'across';
        for (let i = 0; i < current.answer.length; i++) for (let j = 0; j < entry.answer.length; j++) {
          if (current.answer[i] !== entry.answer[j]) continue;
          const row = current.row + (current.direction === 'down' ? i : 0) - (direction === 'down' ? j : 0);
          const col = current.col + (current.direction === 'across' ? i : 0) - (direction === 'across' ? j : 0);
          if (canPlace(entry, row, col, direction)) { best = { row, col, direction }; break; }
        }
        if (best) break;
      }
      if (best) { entry.id = placed.length; place(entry, best.row, best.col, best.direction); }
    }
    if (placed.length < 2) return null;
    const minRow = Math.min(...Array.from(cells.values(), cell => cell.row));
    const maxRow = Math.max(...Array.from(cells.values(), cell => cell.row));
    const minCol = Math.min(...Array.from(cells.values(), cell => cell.col));
    const maxCol = Math.max(...Array.from(cells.values(), cell => cell.col));
    const rowOffset = 1 - minRow, colOffset = 1 - minCol;
    placed.forEach(word => { word.row += rowOffset; word.col += colOffset; });
    const shifted = new Map();
    cells.forEach(cell => { cell.row += rowOffset; cell.col += colOffset; shifted.set(coordKey(cell.row, cell.col), cell); });
    const startKeys = [...new Set(placed.map(word => coordKey(word.row, word.col)))].sort((a, b) => { const [ar, ac] = a.split(',').map(Number), [br, bc] = b.split(',').map(Number); return ar - br || ac - bc; });
    const starts = new Map(startKeys.map((key, index) => [key, index + 1]));
    placed.forEach(word => { word.number = starts.get(coordKey(word.row, word.col)); });
    const across = placed.filter(word => word.direction === 'across').sort((a, b) => a.number - b.number);
    const down = placed.filter(word => word.direction === 'down').sort((a, b) => a.number - b.number);
    return { cells: shifted, across, down, rows: maxRow - minRow + 3, cols: maxCol - minCol + 3 };
  }
  window.chooseCrossword = function (listName) {
    const words = crosswordWords(listName);
    if (words.length < 2 || !buildCrossword(words)) { toast('Choose a vocabulary list with at least two words that can cross.'); return; }
    // Route student launches through shared setup so the signed-in student becomes the solo player.
    if (currentRole === 'student') { chooseGamePlayers(listName, window.chooseCrossword); return; }
    chooseGamePlayers(listName, window.chooseCrossword);
  };
  window.openGameCrossword = function (listName, timerSeconds = 0) {
    const entries = crosswordWords(listName);
    const puzzle = buildCrossword(entries);
    if (!puzzle) { toast('These vocabulary words do not share enough letters for a crossword. Choose a different list.'); return; }
    if (!Array.isArray(activeGamePlayers) || !activeGamePlayers.length) { toast('Select at least one student to play Crosswords.'); return; }
    setGameReplay(() => { resetGameTurnState(); window.openGameCrossword(listName, timerSeconds); });
    activeGameScores = activeGamePlayers.map(() => 0);
    const modal = document.createElement('div');
    modal.className = 'game-popup-modal crossword-game-root fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3';
    modal.dataset.noWinnerOnTimeout = 'true';
    const clueRow = (word, index, group) => `<button type="button" class="crossword-clue" data-word-id="${word.id}" data-group="${group}"><span class="crossword-clue-number">${word.number}</span><span class="crossword-clue-copy">${word.clue ? escCrossword(word.clue) : word.image ? `<img src="${escCrossword(word.image)}" alt="Picture clue for ${escCrossword(word.word)}" loading="lazy">` : `Word with ${word.answer.length} letters`}</span></button>`;
    modal.innerHTML = `<section class="crossword-game-shell"><header class="crossword-header"><div><p>VOCABULARY CROSSWORD</p><h2>Crosswords</h2></div><div class="crossword-header-actions"><button type="button" id="crossword-keyboard-toggle" aria-expanded="false">Touch keyboard</button><button type="button" id="crossword-close" aria-label="Close game">×</button></div></header><div class="crossword-content"><div class="game-player-hud-slot"></div><p class="crossword-instructions">Choose a clue, zoom in, then enter its answer. A correct word earns one point.</p><div class="crossword-layout"><div class="crossword-board-scroll"><div class="crossword-grid" id="crossword-grid" role="group" aria-label="Crossword puzzle"></div><button type="button" id="crossword-board-reset" class="crossword-board-reset" hidden>Show full board</button></div><aside class="crossword-clues"><section><h3>Across</h3>${puzzle.across.map((word, index) => clueRow(word, index, 'across')).join('')}</section><section><h3>Down</h3>${puzzle.down.map((word, index) => clueRow(word, index, 'down')).join('')}</section></aside></div><div class="crossword-actions"><p id="crossword-feedback" aria-live="polite">${puzzle.across.length + puzzle.down.length} words to solve · 0 points</p><button type="button" id="crossword-check" class="btn-primary">Check word</button></div><div id="crossword-virtual-keyboard" class="crossword-virtual-keyboard" hidden><button type="button" class="crossword-keyboard-drag">Move keyboard</button><div class="crossword-keyboard-keys">${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(letter => `<button type="button" data-key="${letter}">${letter}</button>`).join('')}<button type="button" data-key="BACKSPACE" aria-label="Backspace">⌫</button><button type="button" data-key="ENTER">Enter</button></div></div></div></section>`;
    document.body.appendChild(modal);
    if (typeof attachGameFullscreen === 'function') attachGameFullscreen(modal);
    renderGamePlayerHud(modal, 1, 0);
    startPlayerTurnTimer(modal, timerSeconds);
    const grid = modal.querySelector('#crossword-grid'), feedback = modal.querySelector('#crossword-feedback');
    grid.style.setProperty('--crossword-cols', puzzle.cols);
    grid.style.setProperty('--crossword-rows', puzzle.rows);
    const inputState = new Map();
    puzzle.cells.forEach((cell, key) => inputState.set(key, ''));
    const startNumbers = new Map();
    [...puzzle.across, ...puzzle.down].forEach(word => startNumbers.set(coordKey(word.row, word.col), word.number));
    for (let row = 0; row < puzzle.rows; row++) for (let col = 0; col < puzzle.cols; col++) {
      const key = coordKey(row, col), cell = puzzle.cells.get(key);
      if (!cell) { grid.insertAdjacentHTML('beforeend', '<span class="crossword-void" aria-hidden="true"></span>'); continue; }
      const number = startNumbers.get(key);
      grid.insertAdjacentHTML('beforeend', `<label class="crossword-cell" data-cell="${key}">${number ? `<small>${number}</small>` : ''}<input type="text" maxlength="1" autocomplete="off" autocapitalize="characters" data-cell-key="${key}" aria-label="Row ${row}, column ${col}" data-words="${cell.wordIds.join(',')}"></label>`);
    }
    let selectedWord = puzzle.across[0] || puzzle.down[0];
    const completedWords = new Set();
    const allWords = [...puzzle.across, ...puzzle.down];
    let activeInput = null;
    let checkLocked = false;
    const boardViewport = modal.querySelector('.crossword-board-scroll');
    const resetZoomButton = modal.querySelector('#crossword-board-reset');
    const setZoom = enabled => {
      boardViewport.classList.toggle('is-zoomed', enabled);
      resetZoomButton.hidden = !enabled;
      if (!enabled || !selectedWord) { boardViewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); return; }
      const mid = Math.floor(selectedWord.answer.length / 2);
      const row = selectedWord.row + (selectedWord.direction === 'down' ? mid : 0), col = selectedWord.col + (selectedWord.direction === 'across' ? mid : 0);
      modal.querySelector(`.crossword-cell[data-cell="${coordKey(row, col)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    const selectWord = word => {
      if (!word || completedWords.has(word.id)) return;
      selectedWord = word;
      modal.querySelectorAll('.crossword-cell.is-active').forEach(cell => cell.classList.remove('is-active'));
      modal.querySelectorAll('.crossword-clue.is-active').forEach(button => button.classList.remove('is-active'));
      modal.querySelector(`.crossword-clue[data-word-id="${word.id}"][data-group="${word.direction}"]`)?.classList.add('is-active');
      for (let i = 0; i < word.answer.length; i++) {
        const row = word.row + (word.direction === 'down' ? i : 0), col = word.col + (word.direction === 'across' ? i : 0);
        modal.querySelector(`.crossword-cell[data-cell="${coordKey(row, col)}"]`)?.classList.add('is-active');
      }
      setZoom(true);
    };
    modal.querySelectorAll('.crossword-clue').forEach(button => button.addEventListener('click', () => {
      const group = button.dataset.group === 'down' ? puzzle.down : puzzle.across;
      const word = group.find(item => item.id === Number(button.dataset.wordId));
      if (!word || completedWords.has(word.id)) return;
      selectWord(word);
      const wordInputs = Array.from({ length: word.answer.length }, (_, i) => modal.querySelector(`input[data-cell-key="${coordKey(word.row + (word.direction === 'down' ? i : 0), word.col + (word.direction === 'across' ? i : 0))}"]`)).filter(Boolean);
      activeInput = wordInputs.find(input => !input.readOnly) || wordInputs[0];
      activeInput?.focus({ preventScroll: true });
    }));
    const solveActiveWord = () => {
      if (!selectedWord || completedWords.has(selectedWord.id) || checkLocked) return;
      const word = selectedWord;
      const keys = Array.from({ length: word.answer.length }, (_, i) => coordKey(word.row + (word.direction === 'down' ? i : 0), word.col + (word.direction === 'across' ? i : 0)));
      if (keys.some(key => !inputState.get(key))) { feedback.textContent = 'Finish entering this word first.'; feedback.classList.add('is-error'); return; }
      const correct = keys.every((key, i) => inputState.get(key) === word.answer[i]);
      checkLocked = true;
      const clue = modal.querySelector(`.crossword-clue[data-word-id="${word.id}"][data-group="${word.direction}"]`);
      const wordCells = keys.map(key => modal.querySelector(`.crossword-cell[data-cell="${key}"]`)).filter(Boolean);
      feedback.classList.remove('is-error');
      if (correct) {
        completedWords.add(word.id);
        wordCells.forEach(cell => { cell.classList.add('is-correct'); const input = cell.querySelector('input'); if (input) input.readOnly = true; });
        clue?.classList.add('is-solved');
        activeGameScores[activeGamePlayerIndex] = (activeGameScores[activeGamePlayerIndex] || 0) + 1;
        updateGamePlayerHud(modal, allWords.length, activeGamePlayerIndex);
        feedback.textContent = `Correct! ${completedWords.size} of ${allWords.length} words solved · ${activeGameScores[activeGamePlayerIndex]} point${activeGameScores[activeGamePlayerIndex] === 1 ? '' : 's'}.`;
        window.pokeSfx?.play?.('correct');
        if (completedWords.size === allWords.length) {
          window.pokeSfx?.play?.('victory');
          showGameCelebration(modal, 'Crossword solved!', '', activeGamePlayers[activeGamePlayerIndex]);
          return;
        }
        const nextWord = allWords.find(item => !completedWords.has(item.id));
        selectWord(nextWord);
        const nextInputs = Array.from({ length: nextWord.answer.length }, (_, i) => modal.querySelector(`input[data-cell-key="${coordKey(nextWord.row + (nextWord.direction === 'down' ? i : 0), nextWord.col + (nextWord.direction === 'across' ? i : 0))}"]`)).filter(Boolean);
        activeInput = nextInputs.find(input => !input.readOnly) || nextInputs[0];
        activeInput?.focus({ preventScroll: true });
      } else {
        wordCells.forEach(cell => { if (!cell.classList.contains('is-correct')) cell.classList.add('is-wrong', 'is-shaking'); });
        clue?.classList.add('is-wrong');
        feedback.textContent = 'Not quite. Your turn ends; the next player can try this word.';
        feedback.classList.add('is-error');
        window.pokeSfx?.play?.('wrong');
        advanceGameTurn();
        updateGamePlayerHud(modal, allWords.length, activeGamePlayerIndex);
        window.setTimeout(() => {
          wordCells.forEach(cell => {
            cell.classList.remove('is-wrong', 'is-shaking');
            const key = cell.dataset.cell;
            if (!cell.classList.contains('is-correct') && !puzzle.cells.get(key).wordIds.some(id => completedWords.has(id))) {
              const input = cell.querySelector('input'); input.value = ''; inputState.set(key, '');
            }
          });
          clue?.classList.remove('is-wrong');
          feedback.classList.remove('is-error');
          feedback.textContent = `Next turn: ${activeGamePlayers[activeGamePlayerIndex]?.student_name || 'Player'}.`;
          const firstKey = keys.find(key => !modal.querySelector(`.crossword-cell[data-cell="${key}"]`)?.classList.contains('is-correct'));
          activeInput = modal.querySelector(`input[data-cell-key="${firstKey || keys[0]}"]`);
          activeInput?.focus({ preventScroll: true });
          checkLocked = false;
        }, 520);
        return;
      }
      checkLocked = false;
    };
    grid.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        activeInput = input;
        const cell = puzzle.cells.get(input.dataset.cellKey);
        const word = [selectedWord, ...allWords.filter(item => cell.wordIds.includes(item.id))].find(item => cell.wordIds.includes(item.id) && !completedWords.has(item.id));
        if (word) selectWord(word);
      });
      input.addEventListener('input', () => {
        const value = input.value.replace(/[^a-z0-9]/ig, '').slice(-1).toUpperCase();
        input.value = value;
        inputState.set(input.dataset.cellKey, value);
        input.closest('.crossword-cell').classList.remove('is-wrong', 'is-correct');
        if (!value || !selectedWord) return;
        const index = Array.from({ length: selectedWord.answer.length }, (_, i) => coordKey(selectedWord.row + (selectedWord.direction === 'down' ? i : 0), selectedWord.col + (selectedWord.direction === 'across' ? i : 0))).indexOf(input.dataset.cellKey);
        if (index >= 0 && index < selectedWord.answer.length - 1) {
          let nextIndex = index + 1;
          while (nextIndex < selectedWord.answer.length && modal.querySelector(`input[data-cell-key="${coordKey(selectedWord.row + (selectedWord.direction === 'down' ? nextIndex : 0), selectedWord.col + (selectedWord.direction === 'across' ? nextIndex : 0))}"]`)?.readOnly) nextIndex++;
          if (nextIndex < selectedWord.answer.length) {
            const nextKey = coordKey(selectedWord.row + (selectedWord.direction === 'down' ? nextIndex : 0), selectedWord.col + (selectedWord.direction === 'across' ? nextIndex : 0));
            modal.querySelector(`input[data-cell-key="${nextKey}"]`)?.focus();
          }
        }
        const selectedKeys = Array.from({ length: selectedWord.answer.length }, (_, i) => coordKey(selectedWord.row + (selectedWord.direction === 'down' ? i : 0), selectedWord.col + (selectedWord.direction === 'across' ? i : 0)));
        if (selectedKeys.every(key => inputState.get(key))) solveActiveWord();
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); solveActiveWord(); return; }
        if (event.key === 'Backspace' && input.value) { input.value = ''; inputState.set(input.dataset.cellKey, ''); return; }
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const [row, col] = input.dataset.cellKey.split(',').map(Number);
        const delta = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[event.key];
        modal.querySelector(`input[data-cell-key="${coordKey(row + delta[0], col + delta[1])}"]`)?.focus();
      });
    });
    selectWord(selectedWord);
    modal.querySelector('#crossword-check').addEventListener('click', solveActiveWord);
    resetZoomButton.addEventListener('click', () => setZoom(false));
    const keyboard = modal.querySelector('#crossword-virtual-keyboard');
    const keyboardToggle = modal.querySelector('#crossword-keyboard-toggle');
    keyboardToggle.addEventListener('click', () => {
      const open = keyboard.hidden;
      keyboard.hidden = !open;
      keyboardToggle.setAttribute('aria-expanded', String(open));
      keyboardToggle.textContent = open ? 'Hide keyboard' : 'Touch keyboard';
    });
    keyboard.querySelectorAll('[data-key]').forEach(button => {
      button.addEventListener('pointerdown', event => event.preventDefault());
      button.addEventListener('click', () => {
        if (button.dataset.key === 'ENTER') { solveActiveWord(); return; }
        if (!activeInput) activeInput = modal.querySelector('.crossword-cell.is-active input');
        if (!activeInput) return;
        activeInput.focus({ preventScroll: true });
        if (button.dataset.key === 'BACKSPACE') {
          activeInput.value = ''; inputState.set(activeInput.dataset.cellKey, '');
          activeInput.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        }
        activeInput.value = button.dataset.key;
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    const dragHandle = keyboard.querySelector('.crossword-keyboard-drag');
    dragHandle.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      const rect = keyboard.getBoundingClientRect();
      keyboard.style.transform = 'none';
      keyboard.style.left = `${rect.left}px`;
      keyboard._drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      dragHandle.setPointerCapture(event.pointerId);
    });
    dragHandle.addEventListener('pointermove', event => {
      const drag = keyboard._drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      keyboard.style.left = `${Math.max(8, Math.min(window.innerWidth - keyboard.offsetWidth - 8, drag.left + event.clientX - drag.x))}px`;
      keyboard.style.top = `${Math.max(8, Math.min(window.innerHeight - keyboard.offsetHeight - 8, drag.top + event.clientY - drag.y))}px`;
      keyboard.style.bottom = 'auto';
    });
    const stopKeyboardDrag = event => { if (keyboard._drag?.pointerId === event.pointerId) keyboard._drag = null; };
    dragHandle.addEventListener('pointerup', stopKeyboardDrag);
    dragHandle.addEventListener('pointercancel', stopKeyboardDrag);
    modal.querySelector('#crossword-close').addEventListener('click', () => { modal._stopPlayerTurnTimer?.(); modal.remove(); returnToGamesTab(); });
  };
})();