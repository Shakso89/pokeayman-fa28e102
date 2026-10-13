/* Listen and Catch: a student-only listening game with a separate Catchdex. */
(function () {
  const ROUNDS = 5;
  const DAILY_BALL_LIMIT = 10;
  const POKEMON_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const POKEMON_TIERS = ['common', 'uncommon', 'rare', 'legendary'];
  const DEFAULT_CHALLENGE_GOAL = 20;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const art = id => `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${id}.png`;
  const identity = student => String(student?.__backendId || student?.student_id || '').trim();
  const shuffle = list => { const items = [...list]; for (let i = items.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; };
  let session = null;
  let albumViewer = null;
  let activeStudent = null;

  function student() {
    if (activeStudent) return activeStudent;
    if (typeof currentRole === 'undefined' || currentRole !== 'student') return null;
    return typeof getCurrentStudentRecord === 'function' ? getCurrentStudentRecord() : null;
  }
  function progressFor(record = student()) {
    const id = identity(record);
    return (typeof allData === 'undefined' ? [] : allData).find(row => row.type === 'listen_catch_progress' && String(row.student_id || '') === id) || null;
  }
  function parseProgress(record) {
    try { const state = { album: [], balls: 0, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], dailyBallDate: '', dailyBallsEarned: 0, ...JSON.parse(record?.listen_catch_data || '{}') }; state.mysteryBoxes = Math.max(0, Number(state.mysteryBoxes) || 0); return state; }
    catch (_) { return { album: [], balls: 0, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], dailyBallDate: '', dailyBallsEarned: 0 }; }
  }
  function localDayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function ballsEarnedToday(state) { return state.dailyBallDate === localDayKey() ? Math.min(DAILY_BALL_LIMIT, Number(state.dailyBallsEarned) || 0) : 0; }
  function hasType(entry, type) {
    const types = Array.isArray(entry.pokemon_types) ? [...entry.pokemon_types] : [entry.pokemon_type];
    const species = catalog().find(item => Number(item.id) === Number(entry.pokemon_id));
    if (species && typeof getPokemonTypes === 'function') types.push(...getPokemonTypes(species));
    return types.some(value => String(value || '').toLowerCase() === type);
  }
  function weekStart(date = new Date()) { const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()); day.setDate(day.getDate() - ((day.getDay() + 6) % 7)); return day; }
  function dateInput(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function challengeSetting() { return (typeof allData === 'undefined' ? [] : allData).find(row => row.type === 'listen_catch_challenge') || null; }
  function activeChallenge() {
    const setting = challengeSetting(); if (!setting?.challenge_start) return null;
    const start = new Date(`${setting.challenge_start}T00:00:00`); const end = new Date(start); end.setDate(end.getDate() + 7);
    const now = new Date(); if (!Number.isFinite(start.getTime()) || now < start || now >= end) return null;
    const type = POKEMON_TYPES.includes(String(setting.challenge_type || '').toLowerCase()) ? String(setting.challenge_type).toLowerCase() : '';
    const tier = POKEMON_TIERS.includes(String(setting.challenge_tier || '').toLowerCase()) ? String(setting.challenge_tier).toLowerCase() : '';
    const goal = Math.max(1, Math.min(200, Number(setting.challenge_goal) || DEFAULT_CHALLENGE_GOAL));
    const lastDay = new Date(end); lastDay.setDate(lastDay.getDate() - 1);
    return { id: `week-${setting.challenge_start}`, title: String(setting.challenge_title || 'Weekly Catchdex Challenge'), type, tier, goal, start: setting.challenge_start, end: dateInput(lastDay), setting };
  }
  function typeOf(item) {
    const type = typeof getPokemonTypes === 'function' ? getPokemonTypes(item).find(value => value !== 'unknown') : '';
    return type || 'normal';
  }
  function tierOf(entry) {
    const species = catalog().find(item => Number(item.id) === Number(entry.pokemon_id));
    const tier = String(entry.rarity || species?.rarity || '').toLowerCase();
    return POKEMON_TIERS.includes(tier) ? tier : 'common';
  }
  function matchesChallenge(entry, active) {
    return (!active.type || hasType(entry, active.type)) && (!active.tier || tierOf(entry) === active.tier);
  }
  function challengeCriteria(active) {
    return [active.type && `${active.type} type`, active.tier && `${active.tier} tier`].filter(Boolean).join(' · ') || 'any type or tier';
  }
  function hasClaimedChallenge(state, challengeId) {
    if (!challengeId) return false;
    const claimed = [...(Array.isArray(state.claimedChallengeIds) ? state.claimedChallengeIds : []), ...(Array.isArray(state.openedChallengeIds) ? state.openedChallengeIds : [])];
    return claimed.some(id => String(id) === String(challengeId)) || String(state.lastChallengeReward?.challengeId || '') === String(challengeId);
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
  const openingBallIds = new Set();
  async function openBall(record = student()) {
    if (!canManageCatchdex(record)) return;
    const recordId = identity(record);
    if (!recordId || openingBallIds.has(recordId)) return;
    const state = parseProgress(progressFor(record));
    if (!state.balls) return toast('No Catch Balls are available to open.');
    const item = randomPokemon(); if (!item) return toast('The Catchdex is loading. Try again in a moment.');
    const caught = state.album.some(entry => Number(entry.pokemon_id) === Number(item.id));
    state.balls -= 1;
    const coins = caught ? duplicateCoins(item) : 0;
    if (caught) state.last = { item, duplicate: true, coins };
    else { const types = typeof getPokemonTypes === 'function' ? getPokemonTypes(item).filter(value => value !== 'unknown') : [typeOf(item)]; state.album.push({ pokemon_id: Number(item.id), pokemon_name: item.name, rarity: item.rarity || 'common', pokemon_type: types[0] || typeOf(item), pokemon_types: types, caught_at: new Date().toISOString() }); state.last = { item, duplicate: false }; }
    openingBallIds.add(recordId);
    let coinsAwarded = false;
    try {
      await save(record, state);
      if (caught) { await addCoins(record, coins); coinsAwarded = true; }
    } catch (_) {
      state.balls += 1;
      if (!caught) state.album = state.album.filter(entry => Number(entry.pokemon_id) !== Number(item.id));
      if (coinsAwarded) { try { await addCoins(record, -coins); } catch (_) {} }
      try { await save(record, state); } catch (_) {}
      openingBallIds.delete(recordId);
      return toast('Could not open the Catch Ball. It is still available; please try again.');
    }
    openingBallIds.delete(recordId);
    if (currentRole === 'student') renderCatchdexTab();
    else renderAlbumModal(record, true);
    mountCards(); showReveal(item, caught, coins);
  }
  function showReveal(item, duplicate, coins) {
    document.getElementById('lc-reveal')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-reveal'; overlay.className = 'lc-reveal'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Catch Ball reveal');
    overlay.innerHTML = `<section class="lc-reveal-card"><button type="button" class="lc-reveal-close" data-reveal-close aria-label="Close">×</button><span class="lc-reveal-kicker">CATCH BALL</span><div class="lc-reveal-orb" aria-hidden="true"><span class="lc-reveal-pokeball">◓</span><img src="${art(item.id)}" alt="${esc(item.name)} sticker" loading="eager"></div><h2>${duplicate ? 'A duplicate!' : 'New sticker!'}</h2><p>${duplicate ? `${esc(item.name)} was already in your Catchdex, so you earned ${coins} coins.` : `${esc(item.name)} joined your Catchdex!`}</p><button type="button" class="lc-primary" data-reveal-close>Nice!</button></section>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-revealed'));
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-reveal-close]')) overlay.remove(); });
  }
  function challenge(state) {
    const active = activeChallenge();
    if (!active) return { id: '', title: 'No challenge this week', type: '', goal: DEFAULT_CHALLENGE_GOAL, unique: 0, ready: false, claimed: false, active: null };
    const qualifying = state.album.filter(entry => matchesChallenge(entry, active));
    const unique = new Set(qualifying.map(entry => Number(entry.pokemon_id))).size;
    const claimed = hasClaimedChallenge(state, active.id);
    return { ...active, unique: claimed ? active.goal : unique, ready: unique >= active.goal && !claimed, claimed, qualifying };
  }
  function canManageCatchdex(record) {
    return Boolean(record && ((currentRole === 'student' && identity(student()) === identity(record)) || (currentRole === 'teacher' && albumViewer?.readOnly && identity(albumViewer.record) === identity(record))));
  }
  const claimingChallengeIds = new Set();
  async function claimChallenge(record = student()) {
    if (!canManageCatchdex(record)) return;
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    if (!goal.ready || !goal.id || goal.claimed || hasClaimedChallenge(state, goal.id)) return;
    const claimKey = `${identity(record)}:${goal.id}`;
    if (claimingChallengeIds.has(claimKey)) return;
    claimingChallengeIds.add(claimKey);
    const consumed = goal.qualifying.slice(0, goal.goal); const consumedIds = new Set(consumed.map(entry => Number(entry.pokemon_id)));
    state.album = state.album.filter(entry => !consumedIds.has(Number(entry.pokemon_id)) || !matchesChallenge(entry, goal));
    state.claimedChallengeIds = [...new Set([...(Array.isArray(state.claimedChallengeIds) ? state.claimedChallengeIds : []), goal.id])];
    // Keep the legacy marker in sync so older dashboard bundles also treat this
    // student's challenge as already claimed after a reload.
    state.openedChallengeIds = [...new Set([...(Array.isArray(state.openedChallengeIds) ? state.openedChallengeIds : []), goal.id])];
    state.mysteryBoxes += 1;
    state.lastChallengeReward = { challengeId: goal.id, consumed: consumed.length, claimedAt: new Date().toISOString() };
    try { await save(record, state); }
    catch (_) { claimingChallengeIds.delete(claimKey); return toast('Could not claim the Mystery Box. Your Catchdex stickers are safe; please try again.'); }
    claimingChallengeIds.delete(claimKey);
    if (currentRole === 'student') renderCatchdexTab();
    else if (albumViewer?.record) renderAlbumModal(record, true);
    mountCards();
    toast('Mystery Box added to your Catchdex.');
  }
  const openingBoxIds = new Set();
  async function openMysteryBox(record = student()) {
    if (!canManageCatchdex(record)) return;
    const recordId = identity(record);
    if (!recordId || openingBoxIds.has(recordId)) return;
    const state = parseProgress(progressFor(record));
    if (state.mysteryBoxes < 1) return toast('Claim a challenge Mystery Box before opening one.');
    const item = randomPokemon(); if (!item) return toast('The Pokémon collection is loading. Try again in a moment.');
    const alreadyOwned = (typeof allData === 'undefined' ? [] : allData).some(row => row.type === 'pokemon' && Number(row.pokemon_id) === Number(item.id));
    const now = new Date().toISOString();
    const pokemonRecord = { type: 'pokemon', student_id: recordId, school_name: record.school_name || '', class_name: record.class_name || '', student_name: '', coins: 0, owner: record.student_name || '', pokemon_id: Number(item.id), pokemon_name: item.name, pokemon_rarity: item.rarity || 'common', pokemon_price: Number(item.price) || 0, pokemon_power: Number(item.power) || 0, current_hp: Number(item.hp) || (Number(item.power) || 0) + 30, last_battle_time: '', created_at: now, catchdex_box_reward: true };
    const coins = alreadyOwned ? duplicateCoins(item) : 0;
    openingBoxIds.add(recordId);
    let createdPokemon = null;
    let coinsAwarded = false;
    try {
      if (!alreadyOwned) {
        const result = await window.dataSdk.create(pokemonRecord);
        if (!result?.isOk) throw new Error('pokemon create failed');
        createdPokemon = result.data || result;
      } else { await addCoins(record, coins); coinsAwarded = true; }
      state.mysteryBoxes -= 1;
      await save(record, state);
      if (createdPokemon && typeof allData !== 'undefined') allData.push({ ...pokemonRecord, __backendId: createdPokemon.__backendId || createdPokemon.id || '' });
    } catch (_) {
      if (createdPokemon && (createdPokemon.__backendId || createdPokemon.id)) { try { await window.dataSdk.delete(createdPokemon); } catch (_) {} }
      if (coinsAwarded) { try { await addCoins(record, -coins); } catch (_) {} }
      openingBoxIds.delete(recordId);
      return toast('Could not open the Mystery Box. It is still in your Catchdex; please try again.');
    }
    openingBoxIds.delete(recordId);
    if (currentRole === 'student') renderCatchdexTab();
    else renderAlbumModal(record, true);
    mountCards();
    if (currentRole === 'student' && typeof renderStudentDashboard === 'function') renderStudentDashboard();
    showMysteryReveal(item, alreadyOwned, coins, record.student_name || 'Mystery Box');
  }
  function showMysteryReveal(item, duplicate, coins, title) {
    document.getElementById('lc-mystery-reveal')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-mystery-reveal'; overlay.className = 'lc-mystery-reveal'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Mystery Box reward');
    overlay.innerHTML = `<section class="lc-mystery-card"><button type="button" class="lc-mystery-close" data-mystery-close aria-label="Close">×</button><span class="lc-mystery-kicker">${esc(title)} · MYSTERY BOX</span><div class="lc-mystery-scene"><div class="lc-mystery-burst"></div><div class="lc-mystery-box"><span class="lc-mystery-box-lid"></span><span class="lc-mystery-box-body"><b>?</b></span></div><img class="lc-mystery-pokemon" src="${art(item.id)}" alt="${esc(item.name)}" loading="eager"></div><h2>${duplicate ? `Duplicate · ${coins} coins` : `${esc(item.name)}!`}</h2><p>${duplicate ? `${esc(item.name)} is already owned, so this box converted it into ${coins} coins.` : `${esc(item.name)} is new and has been added to the Pokémon collection.`}</p><button type="button" class="lc-primary" data-mystery-close>Awesome!</button></section>`;
    document.body.appendChild(overlay); requestAnimationFrame(() => overlay.classList.add('is-opening'));
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-mystery-close]')) overlay.remove(); });
  }

  async function saveChallengeConfig(form) {
    if (typeof canAccessAdmin !== 'function' || !canAccessAdmin()) return;
    const data = new FormData(form); const start = String(data.get('start') || '');
    if (!start || !Number.isFinite(new Date(`${start}T00:00:00`).getTime())) return toast('Choose a valid challenge start date.');
    const existing = challengeSetting(); const payload = { ...(existing || {}), type: 'listen_catch_challenge', challenge_title: String(data.get('title') || '').trim() || 'Weekly Catchdex Challenge', challenge_type: String(data.get('pokemonType') || ''), challenge_tier: String(data.get('pokemonTier') || ''), challenge_goal: Math.max(1, Math.min(200, Number(data.get('goal')) || DEFAULT_CHALLENGE_GOAL)), challenge_start: start, updated_at: new Date().toISOString() };
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    let result;
    try { result = existing ? await window.dataSdk.update({ ...payload, __backendId: existing.__backendId }) : await window.dataSdk.create(payload); }
    catch (_) { result = null; }
    button.disabled = false;
    if (!result?.isOk) return toast('Challenge could not be saved. Try again.');
    if (existing) Object.assign(existing, payload); else allData.push({ ...payload, __backendId: (result.data || result).__backendId || (result.data || result).id || '' });
    toast('Weekly Catchdex challenge saved.'); renderAdminChallenge(); mountCards();
    const modal = document.getElementById('catchdex-modal'); if (modal && !modal.classList.contains('hidden')) renderAlbumModal();
  }

  function renderAdminChallenge() {
    if (typeof canAccessAdmin !== 'function' || !canAccessAdmin()) { document.getElementById('listen-catch-admin')?.remove(); return; }
    const host = document.getElementById('admin-subtab-challenges'); if (!host) return;
    let panel = document.getElementById('listen-catch-admin');
    if (!panel) {
      panel = document.createElement('section'); panel.id = 'listen-catch-admin'; panel.className = 'lc-admin-panel';
      const start = dateInput(weekStart());
      panel.innerHTML = `<header><span>LISTEN AND CATCH</span><h3>Weekly Catchdex challenge</h3><p>Set one shared challenge for every student. It runs for seven days from the selected start date. Choose a type, a tier, or both.</p></header><form class="lc-admin-form"><label>Challenge name<input name="title" maxlength="48" placeholder="Green Explorer" required></label><label>Pokémon type<select name="pokemonType"><option value="">Any type</option>${POKEMON_TYPES.map(type => `<option value="${type}">${type[0].toUpperCase()}${type.slice(1)}</option>`).join('')}</select></label><label>Pokémon tier<select name="pokemonTier"><option value="">Any tier</option>${POKEMON_TIERS.map(tier => `<option value="${tier}">${tier[0].toUpperCase()}${tier.slice(1)}</option>`).join('')}</select></label><label>Unique Pokémon needed<input name="goal" type="number" min="1" max="200" value="${DEFAULT_CHALLENGE_GOAL}" required></label><label>Week starts<input name="start" type="date" value="${start}" required></label><button type="submit" class="lc-primary">Save weekly challenge</button></form><p class="lc-admin-status" aria-live="polite"></p>`;
      panel.querySelector('form').addEventListener('submit', event => { event.preventDefault(); saveChallengeConfig(event.currentTarget); });
    }
    if (panel.parentElement !== host) host.appendChild(panel);
    const setting = challengeSetting(); const active = activeChallenge(); const form = panel.querySelector('form');
    if (!form.dataset.loaded) {
      if (setting) { form.elements.title.value = setting.challenge_title || ''; form.elements.pokemonType.value = POKEMON_TYPES.includes(setting.challenge_type) ? setting.challenge_type : ''; form.elements.pokemonTier.value = POKEMON_TIERS.includes(setting.challenge_tier) ? setting.challenge_tier : ''; form.elements.goal.value = Number(setting.challenge_goal) || DEFAULT_CHALLENGE_GOAL; form.elements.start.value = setting.challenge_start || dateInput(weekStart()); }
      else { form.elements.title.value = ''; form.elements.pokemonType.value = ''; form.elements.pokemonTier.value = ''; form.elements.goal.value = DEFAULT_CHALLENGE_GOAL; form.elements.start.value = dateInput(weekStart()); }
      form.dataset.loaded = 'true';
    }
    const status = panel.querySelector('.lc-admin-status');
    status.textContent = active ? `Live now: ${active.title} · collect ${active.goal} unique Pokémon matching ${challengeCriteria(active)} · ${active.start} through ${active.end}.` : `No challenge is active. Set this week’s challenge to get students started.`;
  }
  function closeGame() { session?.root?.remove(); session = null; }
  function speak(word) {
    window.speechSynthesis?.cancel();
    if (typeof window.readNaturalVocabulary === 'function') window.readNaturalVocabulary(word, null, { level: window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P3' });
    else { const level = window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P3'; const rates = { P1: .62, P2: .72, P3: .82, P4: .92, P5: 1, P6: 1.08 }; const utterance = new SpeechSynthesisUtterance(word); utterance.rate = rates[level] || .82; window.speechSynthesis?.speak(utterance); }
  }
  function gameWords(listName) {
    return shuffle(getGameWords(listName, false).filter(word => String(word.vocab_word || '').trim())).slice(0, ROUNDS);
  }
  function studentClassListRefs(record) {
    const enrolled = typeof getStudentEnrolledClasses === 'function' ? getStudentEnrolledClasses() : [];
    const primaryKey = `${record?.school_name || ''}||${record?.class_name || ''}`;
    const selectedKey = typeof selectedStudentGamesScope !== 'undefined' && selectedStudentGamesScope === 'class'
      ? String(selectedStudentGamesClassKey || '') : primaryKey;
    const selected = enrolled.find(item => `${item.school_name}||${item.class_name}` === selectedKey)
      || enrolled.find(item => `${item.school_name}||${item.class_name}` === primaryKey)
      || enrolled[0];
    if (!selected?.school_name || !selected?.class_name) return [];
    navSchool = selected.school_name;
    navClass = selected.class_name;
    return getVocabLists(selected.school_name, selected.class_name).map(list => ({
      vocab_list_id: list.vocab_list_id || list.__backendId,
      vocab_list_name: list.vocab_list_name,
    }));
  }
  function startRound() {
    const word = session.words[session.index];
    const pool = getGameWords(session.listName, false).filter(entry => String(entry.vocab_word || '').trim().toLocaleLowerCase() !== String(word.vocab_word).trim().toLocaleLowerCase());
    const decoys = shuffle(pool).slice(0, 3);
    while (decoys.length < 3) decoys.push({ vocab_word: `Choice ${decoys.length + 1}` });
    session.options = shuffle([word, ...decoys]);
    session.root.querySelector('.lc-round').textContent = `${session.index + 1} / ${session.words.length}`;
    const sentence = String(word.vocab_sentence || '').trim();
    session.root.querySelector('.lc-prompt').textContent = sentence ? 'Listen to the full sentence, then choose the vocabulary word you hear.' : 'Listen carefully, then catch the matching word.';
    session.root.querySelector('.lc-options').innerHTML = session.options.map((option, index) => `<button type="button" class="lc-option" data-choice="${index}">${esc(option.vocab_word)}</button>`).join('');
    session.root.querySelector('.lc-listen').disabled = false;
    session.root.querySelector('.lc-listen').setAttribute('aria-label', sentence ? `Hear sentence: ${sentence}` : `Hear word: ${word.vocab_word}`);
    session.root.querySelector('.lc-listen-label').textContent = sentence ? 'Hear the sentence' : 'Hear the word';
    setTimeout(() => speak(sentence || word.vocab_word), 150);
  }
  function answer(index) {
    const option = session.options[index]; const correct = session.words[session.index]; const buttons = [...session.root.querySelectorAll('.lc-option')];
    buttons.forEach(button => button.disabled = true);
    const selected = buttons[index]; const ok = String(option.vocab_word).trim().toLowerCase() === String(correct.vocab_word).trim().toLowerCase();
    if (ok) { selected.classList.add('is-correct'); session.correct += 1; if (session.earned < session.dailyAllowance) { session.earned += 1; session.root.querySelector('.lc-balls').textContent = session.earned; session.root.querySelector('.lc-daily-cap').textContent = `Catch Balls today: ${session.dailyEarnedBefore + session.earned} / ${DAILY_BALL_LIMIT}`; session.root.querySelector('.lc-prompt').textContent = 'Caught it! You earned a Catch Ball.'; } else session.root.querySelector('.lc-prompt').textContent = 'Correct! You have reached today’s 10-ball limit.'; }
    else { selected.classList.add('is-wrong'); buttons.find(button => button.textContent.trim().toLowerCase() === String(correct.vocab_word).trim().toLowerCase())?.classList.add('is-correct'); session.root.querySelector('.lc-prompt').textContent = `The answer was “${correct.vocab_word}”.`; }
    setTimeout(() => { session.index += 1; session.index < session.words.length ? startRound() : finishGame(); }, 900);
  }
  async function finishGame() {
    const record = student(); const state = parseProgress(progressFor(record));
    const today = localDayKey(); const alreadyEarned = state.dailyBallDate === today ? Math.min(DAILY_BALL_LIMIT, Number(state.dailyBallsEarned) || 0) : 0;
    const awarded = Math.min(session.correct, DAILY_BALL_LIMIT - alreadyEarned);
    state.balls += awarded; state.dailyBallDate = today; state.dailyBallsEarned = alreadyEarned + awarded; await save(record, state);
    session.earned = awarded;
    session.root.querySelector('.lc-play').innerHTML = `<section class="lc-result"><div class="lc-result-ball">◓</div><h2>${awarded ? `${awarded} Catch Ball${awarded === 1 ? '' : 's'} earned!` : 'Keep listening — you will catch the next one.'}</h2><p>${awarded < session.correct ? `Daily limit reached. You have earned ${state.dailyBallsEarned} of ${DAILY_BALL_LIMIT} balls today. ` : ''}Open your balls now, or find them later in your Catchdex.</p><div><button type="button" class="lc-primary" data-lc="open">Open Catchdex</button><button type="button" class="lc-secondary" data-lc="close">Back to games</button></div></section>`;
    mountCards();
  }
  function launchForStudent(listName, record) {
    if (currentRole === 'student') listName = studentClassListRefs(record);
    const words = gameWords(listName);
    if (words.length < 2) return toast(currentRole === 'student' ? 'Your class needs at least two vocabulary words to play.' : 'This list needs at least two words.');
    closeGame();
    const root = document.createElement('div'); root.className = 'lc-stage'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Listen and Catch');
    const saved = parseProgress(progressFor(record)); const dailyEarnedBefore = ballsEarnedToday(saved); const dailyAllowance = Math.max(0, DAILY_BALL_LIMIT - dailyEarnedBefore);
    root.innerHTML = `<main class="lc-play"><header class="lc-head"><div><span>LISTENING QUEST</span><h1>Listen and Catch</h1></div><div class="lc-hud"><b class="lc-round">1 / ${words.length}</b><b>◓ <span class="lc-balls">0</span></b><button type="button" data-lc="close" aria-label="Close game">×</button></div></header><section class="lc-main"><button type="button" class="lc-listen" data-lc="listen"><span>🔊</span><span class="lc-listen-label">Hear the sentence</span></button><p class="lc-prompt" aria-live="polite"></p><div class="lc-options"></div><small class="lc-daily-cap">Catch Balls today: ${ballsEarnedToday(saved)} / ${DAILY_BALL_LIMIT}</small></section></main>`;
    document.body.appendChild(root); activeStudent = record; session = { root, listName, words, index: 0, earned: 0, correct: 0, dailyAllowance, dailyEarnedBefore, options: [], student: record };
    root.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.lc === 'close') closeGame(); else if (button.dataset.lc === 'listen') { const word = session.words[session.index]; speak(String(word.vocab_sentence || word.vocab_word)); } else if (button.dataset.lc === 'open') { closeGame(); window.openCatchdex(); } else if (button.dataset.choice !== undefined) answer(Number(button.dataset.choice)); });
    startRound();
  }
  function chooseStudent(listName) {
    const school = typeof navSchool !== 'undefined' ? navSchool : '';
    const className = typeof navClass !== 'undefined' ? navClass : '';
    const roster = school && className && typeof getStudents === 'function' ? getStudents(school, className).filter(record => record.student_name) : [];
    if (!roster.length) return toast('Open a class first to choose a student for Listen and Catch.');
    const picker = document.createElement('div'); picker.className = 'lc-stage'; picker.setAttribute('role', 'dialog'); picker.setAttribute('aria-modal', 'true'); picker.setAttribute('aria-label', 'Choose student');
    picker.innerHTML = `<section class="lc-picker"><header><div><span>CLASS GAME</span><h2>Who is catching?</h2></div><button type="button" data-lcpick="close" aria-label="Close">×</button></header><p>Choose a student. Catch Balls and album progress will be saved to their account.</p><div class="lc-roster">${roster.map((record,index)=>`<button type="button" data-lcpick="${index}">${esc(record.student_name)}</button>`).join('')}</div></section>`;
    document.body.appendChild(picker);
    picker.addEventListener('click', event => { const button=event.target.closest('[data-lcpick]');if(!button)return;const choice=button.dataset.lcpick;picker.remove();if(choice==='close')return;const record=roster[Number(choice)];launchForStudent(listName,{...record,school_name:record.school_name||school,class_name:record.class_name||className}); });
  }
  window.startListenCatch = function (listName) {
    if (currentRole === 'student') {
      const record = typeof getCurrentStudentRecord === 'function' ? getCurrentStudentRecord() : null;
      if (!record) return toast('Signed-in student was not found.');
      return launchForStudent(null, record);
    }
    if (currentRole === 'teacher') return chooseStudent(listName);
    toast('Sign in as a student or teacher to play.');
  };
  function albumCard(state, compact = false) {
    const goal = challenge(state); const unique = new Set(state.album.map(entry => Number(entry.pokemon_id))).size;
    return `<section class="catchdex-card ${compact ? 'catchdex-compact' : ''}"><div class="catchdex-copy"><span class="catchdex-kicker">LISTEN AND CATCH</span><h3>Catchdex</h3><p>${unique} Pokémon discovered · ${state.balls} Catch Ball${state.balls === 1 ? '' : 's'}</p></div><div class="catchdex-goal"><b>${goal.unique} / ${goal.goal}</b><span>${goal.active ? `unique ${challengeCriteria(goal)} Pokémon` : 'weekly challenge inactive'}</span></div><button type="button" data-catchdex-profile>View Catchdex</button></section>`;
  }
  function mountCards() {
    const state = parseProgress(progressFor(student()));
    document.getElementById('catchdex-dashboard-card')?.remove();
    const tabRoot = document.getElementById('student-catchdex-root');
    if (currentRole === 'student' && tabRoot) renderCatchdexTab();
    const profile = typeof profileStudent !== 'undefined' ? profileStudent : null;
    const content = document.querySelector('#view-student-profile .cp-content');
    const profileState = parseProgress(progressFor(profile)); const profileGoal = challenge(profileState); const profileSignature = `${identity(profile)}:${profileState.album.length}:${profileState.balls}:${profileState.mysteryBoxes}:${profileGoal.id}:${profileGoal.unique}:${profileGoal.claimed}`;
    if (profile && content && content.querySelector('#catchdex-profile-card')?.dataset.catchdexSig !== profileSignature) { content.querySelector('#catchdex-profile-card')?.remove(); const holder = document.createElement('div'); holder.id = 'catchdex-profile-card'; holder.dataset.catchdexSig = profileSignature; holder.innerHTML = albumCard(profileState, true); content.prepend(holder); }
    document.querySelectorAll('[data-catchdex-profile]').forEach(button => button.onclick = () => window.openCatchdexFor(profile, true));
  }
  function renderCatchdexContents(record, readOnly) {
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    const cards = state.album.length ? state.album.map(entry => `<article class="catchdex-mon"><img src="${art(entry.pokemon_id)}" alt="${esc(entry.pokemon_name)}" loading="lazy"><b>${esc(entry.pokemon_name)}</b><span>${esc(entry.pokemon_type)}</span></article>`).join('') : '<p class="catchdex-empty">Win a Catch Ball in Listen and Catch, then open it here.</p>';
    const challengeMarkup = goal.active
      ? `<section class="catchdex-challenge"><div><span>WEEKLY CHALLENGE${goal.claimed ? ' · COMPLETE' : ''}</span><h3>${esc(goal.title)}</h3><p>Collect ${goal.goal} unique Pokémon matching ${esc(challengeCriteria(goal))} · ${goal.start} – ${goal.end}</p></div><b>${Math.min(goal.unique, goal.goal)} / ${goal.goal}</b>${goal.ready ? '<button type="button" class="lc-primary" data-catchdex="claim">Claim Mystery Box</button>' : ''}${goal.claimed ? '<p class="lc-challenge-claimed">Mystery Box claimed · qualifying stickers were used.</p>' : ''}</section>`
      : '<section class="catchdex-challenge is-inactive"><div><span>WEEKLY CHALLENGE</span><h3>No active challenge</h3><p>Your next Catchdex challenge will appear here when the admin schedules it.</p></div></section>';
    return `<div class="catchdex-content"><header><div><span>GAME COLLECTION</span><h2>${readOnly ? `${esc(record?.student_name || 'Student')}'s Catchdex` : 'Catchdex'}</h2></div>${readOnly ? '<button type="button" data-catchdex="close" aria-label="Close Catchdex">×</button>' : ''}</header><section class="catchdex-summary"><div><b>${state.balls}</b><span>Catch Balls</span>${readOnly ? '' : `<small class="catchdex-daily">${ballsEarnedToday(state)} / ${DAILY_BALL_LIMIT} balls earned today · unopened balls have no daily limit</small>`}</div><div><b>${state.mysteryBoxes}</b><span>Mystery Boxes</span></div><div class="catchdex-actions">${state.balls ? '<button type="button" class="lc-primary" data-catchdex="balls">Open Catch Balls</button>' : ''}${state.mysteryBoxes ? '<button type="button" class="lc-primary" data-catchdex="boxes">Open Mystery Boxes</button>' : ''}</div></section>${state.last ? `<p class="catchdex-last ${state.last.duplicate ? 'is-duplicate' : ''}">${state.last.duplicate ? `Duplicate ${esc(state.last.item.name)} became ${state.last.coins} coins.` : `New discovery: ${esc(state.last.item.name)}!`}</p>` : ''}${challengeMarkup}<section class="catchdex-grid">${cards}</section></div>`;
  }
  function bindCatchdexContents(root, record, readOnly) {
    root.querySelector('[data-catchdex="close"]')?.addEventListener('click', () => document.getElementById('catchdex-modal')?.classList.add('hidden'));
    root.querySelector('[data-catchdex="balls"]')?.addEventListener('click', () => showBallCountPopup(record));
    root.querySelector('[data-catchdex="claim"]')?.addEventListener('click', () => claimChallenge(record));
    root.querySelector('[data-catchdex="boxes"]')?.addEventListener('click', () => showBoxCountPopup(record));
  }
  function renderCatchdexTab() {
    const root = document.getElementById('student-catchdex-root'); const record = student(); if (!root || !record) return;
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    const signature = `${identity(record)}:${state.album.length}:${state.balls}:${state.mysteryBoxes}:${goal.id}:${goal.unique}:${goal.claimed}:${state.last?.item?.id || ''}`;
    if (root.dataset.catchdexSig === signature) return;
    root.innerHTML = `<section class="catchdex-tab-card">${renderCatchdexContents(record, false)}</section>`;
    root.dataset.catchdexSig = signature; bindCatchdexContents(root, record, false);
  }
  function renderAlbumModal(record = albumViewer?.record || student(), readOnly = Boolean(albumViewer?.readOnly)) {
    const modal = document.getElementById('catchdex-modal'); if (!modal) return;
    modal.innerHTML = `<div class="catchdex-modal-card">${renderCatchdexContents(record, readOnly)}</div>`;
    modal.classList.remove('hidden');
    bindCatchdexContents(modal, record, readOnly);
  }
  function showBoxCountPopup(record) {
    if (!canManageCatchdex(record)) return;
    const count = parseProgress(progressFor(record)).mysteryBoxes;
    if (!count) return toast('No Mystery Boxes to open yet. Claim a completed challenge first.');
    document.getElementById('lc-box-inventory')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-box-inventory'; overlay.className = 'lc-box-inventory'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Mystery Box inventory');
    overlay.innerHTML = `<section class="lc-box-inventory-card"><button type="button" class="lc-mystery-close" data-box-close aria-label="Close">×</button><span class="lc-mystery-kicker">CATCHDEX REWARDS</span><h2>${esc(record.student_name || 'Student')} has ${count} Mystery Box${count === 1 ? '' : 'es'}</h2><p>Open one box to reveal a Pokémon. If it is already in a student collection, it becomes coins instead.</p><button type="button" class="lc-primary" data-box-open>Open one box</button></section>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-box-close]')) close(); });
    overlay.querySelector('[data-box-open]').addEventListener('click', () => { close(); openMysteryBox(record); });
  }
  function showBallCountPopup(record) {
    if (!canManageCatchdex(record)) return;
    const count = parseProgress(progressFor(record)).balls;
    if (!count) return toast('No Catch Balls are available to open.');
    document.getElementById('lc-ball-inventory')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-ball-inventory'; overlay.className = 'lc-box-inventory'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Catch Ball inventory');
    overlay.innerHTML = `<section class="lc-box-inventory-card"><button type="button" class="lc-mystery-close" data-ball-close aria-label="Close">×</button><span class="lc-mystery-kicker">CATCHDEX REWARDS</span><h2>${esc(record.student_name || 'Student')} has ${count} Catch Ball${count === 1 ? '' : 's'}</h2><p>Open a ball to reveal a Pokémon sticker. Duplicates convert into coins for this student.</p><button type="button" class="lc-primary" data-ball-open>Open one Catch Ball</button></section>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-ball-close]')) close(); });
    overlay.querySelector('[data-ball-open]').addEventListener('click', () => { close(); openBall(record); });
  }
  window.openCatchdex = function () { const tab = document.querySelector('.student-dashboard-tab[data-tab="catchdex"]'); if (currentRole === 'student' && tab) tab.click(); else if (albumViewer?.record) renderAlbumModal(albumViewer.record, true); };
  window.openCatchdexFor = function (record, readOnly = true) { albumViewer = { record, readOnly }; let modal = document.getElementById('catchdex-modal'); if (!modal) { modal = document.createElement('div'); modal.id = 'catchdex-modal'; modal.className = 'catchdex-modal'; document.body.appendChild(modal); modal.addEventListener('click', event => { if (event.target === modal) modal.classList.add('hidden'); }); } renderAlbumModal(record, readOnly); };
  window.listenCatchRefresh = mountCards;
  window.renderListenCatchTab = renderCatchdexTab;
  window.listenCatchAdminRefresh = renderAdminChallenge;
  document.addEventListener('DOMContentLoaded', () => { mountCards(); renderAdminChallenge(); });
})();
