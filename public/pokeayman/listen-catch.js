/* Listen and Catch: a student-only listening game with a separate Catchdex. */
(function () {
  const ROUNDS = 5;
  const CHALLENGE_TYPE = 'grass';
  const CHALLENGE_GOAL = 20;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const art = id => `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${id}.png`;
  const identity = student => String(student?.__backendId || student?.student_id || '').trim();
  const shuffle = list => { const items = [...list]; for (let i = items.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; };
  let session = null;
  let albumViewer = null;

  function student() {
    return typeof getCurrentStudentRecord === 'function' ? getCurrentStudentRecord() : null;
  }
  function progressFor(record = student()) {
    const id = identity(record);
    return (typeof allData === 'undefined' ? [] : allData).find(row => row.type === 'listen_catch_progress' && String(row.student_id || '') === id) || null;
  }
  function parseProgress(record) {
    try { return { album: [], balls: 0, openedChallengeIds: [], ...JSON.parse(record?.listen_catch_data || '{}') }; }
    catch (_) { return { album: [], balls: 0, openedChallengeIds: [] }; }
  }
  function typeOf(item) {
    const type = typeof getPokemonTypes === 'function' ? getPokemonTypes(item).find(value => value !== 'unknown') : '';
    return type || 'normal';
  }
  function catalog() { return Array.isArray(window.pokemonCatalog) ? window.pokemonCatalog : (typeof pokemonCatalog !== 'undefined' ? pokemonCatalog : []); }
  function randomPokemon() {
    const pool = catalog().filter(item => Number(item.id) > 0);
    if (!pool.length) return null;
    const roll = Math.random() * 100;
    const rarity = roll < 68 ? 'common' : roll < 91 ? 'uncommon' : roll < 99 ? 'rare' : 'legendary';
    const tier = pool.filter(item => item.rarity === rarity);
    return (tier.length ? tier : pool)[Math.floor(Math.random() * (tier.length || pool.length))];
  }
  async function save(record, data) {
    const current = progressFor(record);
    const payload = {
      ...(current || {}), type: 'listen_catch_progress', student_id: identity(record), student_name: record.student_name || '',
      school_name: record.school_name || '', class_name: record.class_name || '', listen_catch_data: JSON.stringify(data), updated_at: new Date().toISOString(), created_at: current?.created_at || new Date().toISOString()
    };
    const result = current ? await window.dataSdk.update({ ...payload, __backendId: current.__backendId }) : await window.dataSdk.create(payload);
    if (!result?.isOk) throw new Error('save failed');
    const saved = result.data || result;
    if (current) Object.assign(current, payload);
    else if (typeof allData !== 'undefined') allData.push({ ...payload, __backendId: saved.__backendId || saved.id || '' });
    return data;
  }
  function duplicateCoins(item) { return item.rarity === 'legendary' ? 12 : item.rarity === 'rare' ? 7 : item.rarity === 'uncommon' ? 4 : 2; }
  async function addCoins(record, amount) {
    const latest = (typeof getStudentRecordByStableId === 'function' && getStudentRecordByStableId(identity(record))) || record;
    const update = { ...latest, coins: Number(latest.coins || 0) + amount, __backendId: latest.__backendId };
    const result = await window.dataSdk.update(update);
    if (!result?.isOk) throw new Error('coin update failed');
    if (typeof allData !== 'undefined') allData = allData.map(row => row.__backendId === latest.__backendId ? update : row);
    if (typeof setCurrentStudentRecord === 'function' && identity(latest) === String(currentStudentRecordId || '')) setCurrentStudentRecord(update);
    if (currentRole === 'student' && typeof renderStudentDashboard === 'function') renderStudentDashboard();
  }
  async function openBall() {
    const record = student(); const state = parseProgress(progressFor(record));
    if (!record || !state.balls) return;
    const item = randomPokemon(); if (!item) return toast('The Catchdex is loading. Try again in a moment.');
    const caught = state.album.some(entry => Number(entry.pokemon_id) === Number(item.id));
    state.balls -= 1;
    if (caught) { const coins = duplicateCoins(item); await addCoins(record, coins); state.last = { item, duplicate: true, coins }; }
    else { state.album.push({ pokemon_id: Number(item.id), pokemon_name: item.name, rarity: item.rarity || 'common', pokemon_type: typeOf(item), caught_at: new Date().toISOString() }); state.last = { item, duplicate: false }; }
    await save(record, state);
    renderAlbumModal(); mountCards();
  }
  function challenge(state) {
    const unique = new Set(state.album.filter(entry => entry.pokemon_type === CHALLENGE_TYPE).map(entry => Number(entry.pokemon_id))).size;
    return { id: `type-${CHALLENGE_TYPE}-${CHALLENGE_GOAL}`, unique, ready: unique >= CHALLENGE_GOAL && !state.openedChallengeIds.includes(`type-${CHALLENGE_TYPE}-${CHALLENGE_GOAL}`) };
  }
  async function requestMysteryReward() {
    const record = student(); const state = parseProgress(progressFor(record)); const goal = challenge(state);
    if (!goal.ready) return;
    const item = randomPokemon(); if (!item) return;
    const existing = allData.find(row => row.type === 'battle_claim' && row.status === 'pending' && row.claim_source === 'listen_catch_mystery' && row.student_id === identity(record));
    if (existing) return toast('Your Mystery Box reward is already waiting for teacher approval.');
    const claim = { type: 'battle_claim', status: 'pending', claim_source: 'listen_catch_mystery', claim_id: `catchdex-${identity(record)}-${Date.now()}`,
      student_id: identity(record), student_name: record.student_name, school_name: record.school_name || '', class_name: record.class_name || '',
      shop_record_id: `catalog-${item.id}`, pokemon_id: Number(item.id), pokemon_name: item.name, pokemon_rarity: item.rarity || 'common', pokemon_price: Number(item.price) || 0, pokemon_power: Number(item.power) || 0, created_at: new Date().toISOString() };
    const result = await window.dataSdk.create(claim);
    if (!result?.isOk) return toast('Could not send the Mystery Box reward. Please try again.');
    state.openedChallengeIds.push(goal.id); await save(record, state); renderAlbumModal(); mountCards();
    toast('Mystery Box opened! Your teacher can now approve the Pokémon reward.');
  }
  function closeGame() { session?.root?.remove(); session = null; }
  function speak(word) {
    window.speechSynthesis?.cancel();
    if (typeof window.readNaturalVocabulary === 'function') window.readNaturalVocabulary(word);
    else { const utterance = new SpeechSynthesisUtterance(word); utterance.rate = .78; window.speechSynthesis?.speak(utterance); }
  }
  function gameWords(listName) {
    return shuffle(getGameWords(listName, false).filter(word => String(word.vocab_word || '').trim())).slice(0, ROUNDS);
  }
  function startRound() {
    const word = session.words[session.index];
    const pool = getGameWords(session.listName, false).filter(entry => String(entry.vocab_word || '').trim().toLocaleLowerCase() !== String(word.vocab_word).trim().toLocaleLowerCase());
    const decoys = shuffle(pool).slice(0, 3);
    while (decoys.length < 3) decoys.push({ vocab_word: `Choice ${decoys.length + 1}` });
    session.options = shuffle([word, ...decoys]);
    session.root.querySelector('.lc-round').textContent = `${session.index + 1} / ${session.words.length}`;
    session.root.querySelector('.lc-prompt').textContent = 'Listen carefully, then catch the matching word.';
    session.root.querySelector('.lc-options').innerHTML = session.options.map((option, index) => `<button type="button" class="lc-option" data-choice="${index}">${esc(option.vocab_word)}</button>`).join('');
    session.root.querySelector('.lc-listen').disabled = false;
    setTimeout(() => speak(word.vocab_word), 150);
  }
  function answer(index) {
    const option = session.options[index]; const correct = session.words[session.index]; const buttons = [...session.root.querySelectorAll('.lc-option')];
    buttons.forEach(button => button.disabled = true);
    const selected = buttons[index]; const ok = String(option.vocab_word).trim().toLowerCase() === String(correct.vocab_word).trim().toLowerCase();
    if (ok) { selected.classList.add('is-correct'); session.earned += 1; session.root.querySelector('.lc-balls').textContent = session.earned; session.root.querySelector('.lc-prompt').textContent = 'Caught it! You earned a Catch Ball.'; }
    else { selected.classList.add('is-wrong'); buttons.find(button => button.textContent.trim().toLowerCase() === String(correct.vocab_word).trim().toLowerCase())?.classList.add('is-correct'); session.root.querySelector('.lc-prompt').textContent = `The answer was “${correct.vocab_word}”.`; }
    setTimeout(() => { session.index += 1; session.index < session.words.length ? startRound() : finishGame(); }, 900);
  }
  async function finishGame() {
    const record = student(); const state = parseProgress(progressFor(record)); state.balls += session.earned; await save(record, state);
    session.root.querySelector('.lc-play').innerHTML = `<section class="lc-result"><div class="lc-result-ball">◓</div><h2>${session.earned ? `${session.earned} Catch Ball${session.earned === 1 ? '' : 's'} earned!` : 'Keep listening — you will catch the next one.'}</h2><p>Open your balls now, or find them later in your Catchdex.</p><div><button type="button" class="lc-primary" data-lc="open">Open Catchdex</button><button type="button" class="lc-secondary" data-lc="close">Back to games</button></div></section>`;
    mountCards();
  }
  window.startListenCatch = function (listName) {
    if (currentRole !== 'student') return toast('Listen and Catch is for students.');
    const words = gameWords(listName); if (words.length < 2) return toast('This list needs at least two words.');
    closeGame();
    const root = document.createElement('div'); root.className = 'lc-stage'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Listen and Catch');
    root.innerHTML = `<main class="lc-play"><header class="lc-head"><div><span>LISTENING QUEST</span><h1>Listen and Catch</h1></div><div class="lc-hud"><b class="lc-round">1 / ${words.length}</b><b>◓ <span class="lc-balls">0</span></b><button type="button" data-lc="close" aria-label="Close game">×</button></div></header><section class="lc-main"><button type="button" class="lc-listen" data-lc="listen"><span>🔊</span> Hear the word</button><p class="lc-prompt" aria-live="polite"></p><div class="lc-options"></div></section></main>`;
    document.body.appendChild(root); session = { root, listName, words, index: 0, earned: 0, options: [] };
    root.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.lc === 'close') closeGame(); else if (button.dataset.lc === 'listen') speak(session.words[session.index].vocab_word); else if (button.dataset.lc === 'open') { closeGame(); window.openCatchdex(); } else if (button.dataset.choice !== undefined) answer(Number(button.dataset.choice)); });
    startRound();
  };
  function albumCard(state, compact = false, viewOnly = false) {
    const goal = challenge(state); const unique = new Set(state.album.map(entry => Number(entry.pokemon_id))).size;
    return `<section class="catchdex-card ${compact ? 'catchdex-compact' : ''}"><div class="catchdex-copy"><span class="catchdex-kicker">LISTEN AND CATCH</span><h3>Catchdex</h3><p>${unique} Pokémon discovered · ${state.balls} Catch Ball${state.balls === 1 ? '' : 's'}</p></div><div class="catchdex-goal"><b>${goal.unique} / ${CHALLENGE_GOAL}</b><span>unique Grass Pokémon</span></div><button type="button" ${viewOnly ? 'data-catchdex-profile' : 'data-catchdex-open'}>${viewOnly ? 'View Catchdex' : 'Open Catchdex'}</button></section>`;
  }
  function mountCards() {
    const state = parseProgress(progressFor(student()));
    const dashboard = document.querySelector('#student-dashboard .max-w-5xl');
    const dashSignature = `${state.album.length}:${state.balls}:${challenge(state).unique}`;
    if (currentRole === 'student' && dashboard && dashboard.querySelector('#catchdex-dashboard-card')?.dataset.catchdexSig !== dashSignature) { dashboard.querySelector('#catchdex-dashboard-card')?.remove(); const holder = document.createElement('div'); holder.id = 'catchdex-dashboard-card'; holder.dataset.catchdexSig = dashSignature; holder.innerHTML = albumCard(state, true); dashboard.appendChild(holder); }
    document.querySelectorAll('[data-catchdex-open]').forEach(button => button.onclick = () => window.openCatchdex());
    const profile = typeof profileStudent !== 'undefined' ? profileStudent : null;
    const content = document.querySelector('#view-student-profile .cp-content');
    const profileState = parseProgress(progressFor(profile)); const profileSignature = `${identity(profile)}:${profileState.album.length}:${profileState.balls}:${challenge(profileState).unique}`;
    if (profile && content && content.querySelector('#catchdex-profile-card')?.dataset.catchdexSig !== profileSignature) { content.querySelector('#catchdex-profile-card')?.remove(); const holder = document.createElement('div'); holder.id = 'catchdex-profile-card'; holder.dataset.catchdexSig = profileSignature; holder.innerHTML = albumCard(profileState, true, true); content.prepend(holder); }
    document.querySelectorAll('[data-catchdex-profile]').forEach(button => button.onclick = () => window.openCatchdexFor(profile, true));
  }
  function renderAlbumModal(record = albumViewer?.record || student(), readOnly = Boolean(albumViewer?.readOnly)) {
    const modal = document.getElementById('catchdex-modal'); if (!modal) return;
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    const cards = state.album.length ? state.album.map(entry => `<article class="catchdex-mon"><img src="${art(entry.pokemon_id)}" alt="${esc(entry.pokemon_name)}" loading="lazy"><b>${esc(entry.pokemon_name)}</b><span>${esc(entry.pokemon_type)}</span></article>`).join('') : '<p class="catchdex-empty">Win a Catch Ball in Listen and Catch, then open it here.</p>';
    modal.innerHTML = `<div class="catchdex-modal-card"><header><div><span>GAME COLLECTION</span><h2>${readOnly ? `${esc(record?.student_name || 'Student')}'s Catchdex` : 'Catchdex'}</h2></div><button type="button" data-catchdex="close" aria-label="Close Catchdex">×</button></header><section class="catchdex-summary"><div><b>${state.balls}</b><span>Catch Balls</span></div>${readOnly ? '' : `<button type="button" class="lc-primary" data-catchdex="ball" ${state.balls ? '' : 'disabled'}>Open a Catch Ball</button>`}</section>${state.last ? `<p class="catchdex-last ${state.last.duplicate ? 'is-duplicate' : ''}">${state.last.duplicate ? `Duplicate ${esc(state.last.item.name)} became ${state.last.coins} coins.` : `New discovery: ${esc(state.last.item.name)}!`}</p>` : ''}<section class="catchdex-challenge"><div><span>ACTIVE CHALLENGE</span><h3>Green Explorer</h3><p>Collect ${CHALLENGE_GOAL} unique Grass-type Pokémon.</p></div><b>${goal.unique} / ${CHALLENGE_GOAL}</b>${goal.ready && !readOnly ? '<button type="button" class="lc-primary" data-catchdex="reward">Open Mystery Box</button>' : ''}</section><section class="catchdex-grid">${cards}</section></div>`;
    modal.classList.remove('hidden');
    modal.querySelector('[data-catchdex="close"]').onclick = () => modal.classList.add('hidden');
    modal.querySelector('[data-catchdex="ball"]')?.addEventListener('click', openBall);
    modal.querySelector('[data-catchdex="reward"]')?.addEventListener('click', requestMysteryReward);
  }
  window.openCatchdex = function () { albumViewer = { record: student(), readOnly: false }; let modal = document.getElementById('catchdex-modal'); if (!modal) { modal = document.createElement('div'); modal.id = 'catchdex-modal'; modal.className = 'catchdex-modal'; document.body.appendChild(modal); modal.addEventListener('click', event => { if (event.target === modal) modal.classList.add('hidden'); }); } renderAlbumModal(); };
  window.openCatchdexFor = function (record, readOnly = true) { albumViewer = { record, readOnly }; let modal = document.getElementById('catchdex-modal'); if (!modal) { modal = document.createElement('div'); modal.id = 'catchdex-modal'; modal.className = 'catchdex-modal'; document.body.appendChild(modal); modal.addEventListener('click', event => { if (event.target === modal) modal.classList.add('hidden'); }); } renderAlbumModal(record, readOnly); };
  window.listenCatchRefresh = mountCards;
  document.addEventListener('DOMContentLoaded', () => { const observer = new MutationObserver(() => { mountCards(); }); observer.observe(document.body, { childList: true, subtree: true }); });
})();
