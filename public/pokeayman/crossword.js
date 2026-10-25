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
    modal.innerHTML = `<section class="crossword-game-shell"><header class="crossword-header"><div><p>VOCABULARY CROSSWORD</p><h2>Crosswords</h2></div><button type="button" id="crossword-close" aria-label="Close game">×</button></header><div class="crossword-content"><div class="game-player-hud-slot"></div><p class="crossword-instructions">Use the clues to fill the intersecting words. Select a clue to highlight its cells.</p><div class="crossword-layout"><div class="crossword-board-scroll"><div id="crossword-grid" class="crossword-grid" role="group" aria-label="Crossword puzzle"></div></div><aside class="crossword-clues"><section><h3>Across</h3>${puzzle.across.map((word, index) => clueRow(word, index, 'across')).join('')}</section><section><h3>Down</h3>${puzzle.down.map((word, index) => clueRow(word, index, 'down')).join('')}</section></aside></div><div class="crossword-actions"><p id="crossword-feedback" aria-live="polite">${puzzle.across.length + puzzle.down.length} clues · ${puzzle.cells.size} letters</p><button type="button" id="crossword-check" class="btn-primary">Check crossword</button></div></div></section>`;
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
    const selectWord = word => {
      selectedWord = word;
      modal.querySelectorAll('.crossword-cell.is-active').forEach(cell => cell.classList.remove('is-active'));
      modal.querySelectorAll('.crossword-clue.is-active').forEach(button => button.classList.remove('is-active'));
      modal.querySelector(`.crossword-clue[data-word-id="${word.id}"][data-group="${word.direction}"]`)?.classList.add('is-active');
      for (let i = 0; i < word.answer.length; i++) {
        const row = word.row + (word.direction === 'down' ? i : 0), col = word.col + (word.direction === 'across' ? i : 0);
        modal.querySelector(`.crossword-cell[data-cell="${coordKey(row, col)}"]`)?.classList.add('is-active');
      }
    };
    modal.querySelectorAll('.crossword-clue').forEach(button => button.addEventListener('click', () => {
      const group = button.dataset.group === 'down' ? puzzle.down : puzzle.across;
      const word = group.find(item => item.id === Number(button.dataset.wordId));
      if (!word) return;
      selectWord(word);
      const firstCell = modal.querySelector(`.crossword-cell[data-cell="${coordKey(word.row, word.col)}"] input`);
      firstCell?.focus();
    }));
    grid.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => {
        const cell = puzzle.cells.get(input.dataset.cellKey);
        const word = [selectedWord, ...[...puzzle.across, ...puzzle.down].filter(item => cell.wordIds.includes(item.id))].find(item => cell.wordIds.includes(item.id));
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
          const nextKey = coordKey(selectedWord.row + (selectedWord.direction === 'down' ? index + 1 : 0), selectedWord.col + (selectedWord.direction === 'across' ? index + 1 : 0));
          modal.querySelector(`input[data-cell-key="${nextKey}"]`)?.focus();
        }
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && input.value) { input.value = ''; inputState.set(input.dataset.cellKey, ''); return; }
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const [row, col] = input.dataset.cellKey.split(',').map(Number);
        const delta = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[event.key];
        modal.querySelector(`input[data-cell-key="${coordKey(row + delta[0], col + delta[1])}"]`)?.focus();
      });
    });
    selectWord(selectedWord);
    const allWords = [...puzzle.across, ...puzzle.down];
    modal.querySelector('#crossword-check').addEventListener('click', () => {
      const wrong = new Set();
      let complete = true;
      allWords.forEach(word => {
        let correct = true;
        for (let i = 0; i < word.answer.length; i++) {
          const key = coordKey(word.row + (word.direction === 'down' ? i : 0), word.col + (word.direction === 'across' ? i : 0));
          if (inputState.get(key) !== word.answer[i]) { complete = false; correct = false; wrong.add(key); }
        }
        modal.querySelector(`.crossword-clue[data-word-id="${word.id}"][data-group="${word.direction}"]`)?.classList.toggle('is-wrong', !correct);
      });
      modal.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.toggle('is-wrong', wrong.has(cell.dataset.cell));
        cell.classList.toggle('is-correct', !wrong.has(cell.dataset.cell) && Boolean(inputState.get(cell.dataset.cell)));
      });
      if (complete) {
        const winnerIndex = activeGamePlayerIndex;
        activeGameScores[winnerIndex] = 1;
        updateGamePlayerHud(modal, 1, winnerIndex);
        window.pokeSfx?.play?.('victory');
        showGameCelebration(modal, 'Crossword solved!', '', activeGamePlayers[winnerIndex]);
        return;
      }
      feedback.textContent = 'Some letters need another look. The next player is up.';
      feedback.classList.add('is-error');
      window.pokeSfx?.play?.('wrong');
      advanceGameTurn();
      updateGamePlayerHud(modal, 1, activeGamePlayerIndex);
    });
    modal.querySelector('#crossword-close').addEventListener('click', () => { modal._stopPlayerTurnTimer?.(); modal.remove(); returnToGamesTab(); });
  };
})();