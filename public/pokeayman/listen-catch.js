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
    try { const state = { album: [], balls: 0, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], mysteryBoxChallengeIds: [], openedBoxChallengeIds: [], dailyBallDate: '', dailyBallsEarned: 0, ...JSON.parse(record?.listen_catch_data || '{}') }; state.mysteryBoxes = Math.max(0, Number(state.mysteryBoxes) || 0); return state; }
    catch (_) { return { album: [], balls: 0, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], mysteryBoxChallengeIds: [], openedBoxChallengeIds: [], dailyBallDate: '', dailyBallsEarned: 0 }; }
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
  function challengeRows() {
    return (typeof allData === 'undefined' ? [] : allData)
      .filter(row => String(row.type || row.record_type || row.category || '').trim().toLowerCase().replace(/[ -]+/g, '_') === 'listen_catch_challenge');
  }
  function challengeStartValue(setting) {
    return setting?.challenge_start ?? setting?.challenge_start_date ?? setting?.start_date ?? setting?.starts_at ?? '';
  }
  function challengeDate(value) {
    if (value instanceof Date && Number.isFinite(value.getTime())) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    if (typeof value === 'number' && Number.isFinite(value) && value > 20000 && value < 100000) {
      const serialDate = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
      return new Date(serialDate.getUTCFullYear(), serialDate.getUTCMonth(), serialDate.getUTCDate());
    }
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
    const parsed = new Date(raw);
    return Number.isFinite(parsed.getTime()) ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null;
  }
  function challengeWindow(setting, now = new Date()) {
    const start = challengeDate(challengeStartValue(setting));
    if (!start || !Number.isFinite(start.getTime())) return null;
    const explicitEnd = challengeDate(setting.challenge_end ?? setting.challenge_end_date ?? setting.end_date ?? setting.ends_at);
    const end = explicitEnd || new Date(start);
    if (!explicitEnd) end.setDate(end.getDate() + 6);
    const endExclusive = new Date(end); endExclusive.setDate(endExclusive.getDate() + 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end, active: today >= start && today < endExclusive };
  }
  function challengeSetting() {
    const settings = challengeRows().sort((a, b) => {
      const aTime = Date.parse(a.updated_at || a.created_at || '') || 0;
      const bTime = Date.parse(b.updated_at || b.created_at || '') || 0;
      return bTime - aTime;
    });
    // A later scheduled challenge must not hide the challenge that is live now.
    return settings.find(setting => challengeWindow(setting)?.active) || settings[0] || null;
  }
  function activeChallenge() {
    const setting = challengeSetting(); if (!setting) return null;
    const window = challengeWindow(setting); if (!window?.active) return null;
    const { start, end } = window;
    const type = POKEMON_TYPES.includes(String(setting.challenge_type || '').toLowerCase()) ? String(setting.challenge_type).toLowerCase() : '';
    const tier = POKEMON_TIERS.includes(String(setting.challenge_tier || '').toLowerCase()) ? String(setting.challenge_tier).toLowerCase() : '';
    const goal = Math.max(1, Math.min(200, Number(setting.challenge_goal ?? setting.goal) || DEFAULT_CHALLENGE_GOAL));
    const startKey = dateInput(start);
    return { id: String(setting.challenge_id || `week-${startKey}`), title: String(setting.challenge_title || setting.title || 'Weekly Catchdex Challenge'), type, tier, goal, start: startKey, end: dateInput(end), setting };
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
  function randomPokemon(source = 'catch-ball') {
    const pool = catalog().filter(item => Number(item.id) > 0);
    if (!pool.length) return null;
    const roll = Math.random() * 10000;
    // Mystery Boxes are a celebration reward, so keep their high rarities scarce:
    // 82.75% common, 15% uncommon, 2% rare, and 0.25% legendary.
    const rarity = source === 'mystery-box'
      ? (roll < 25 ? 'legendary' : roll < 225 ? 'rare' : roll < 1725 ? 'uncommon' : 'common')
      : (roll < 6800 ? 'common' : roll < 9100 ? 'uncommon' : roll < 9900 ? 'rare' : 'legendary');
    let tier = pool.filter(item => String(item.rarity || '').toLowerCase() === rarity);
    if (!tier.length && source === 'mystery-box') {
      const fallback = { legendary: ['rare', 'uncommon', 'common'], rare: ['uncommon', 'common'], uncommon: ['common'], common: ['uncommon', 'rare', 'legendary'] }[rarity] || [];
      tier = fallback.map(name => pool.filter(item => String(item.rarity || '').toLowerCase() === name)).find(group => group.length) || [];
    }
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
  function studentAlreadyOwnsPokemon(item, record) {
    const recordId = identity(record);
    const recordName = String(record?.student_name || '').trim().toLocaleLowerCase();
    const school = String(record?.school_name || '').trim().toLocaleLowerCase();
    const className = String(record?.class_name || '').trim().toLocaleLowerCase();
    return (typeof allData === 'undefined' ? [] : allData).some(row => {
      if (row.type !== 'pokemon' || Number(row.pokemon_id) !== Number(item.id)) return false;
      const ownerId = String(row.student_id || row.canonical_student_id || '').trim();
      if (ownerId && recordId) return ownerId === recordId;
      const ownerName = String(row.owner || row.student_name || '').trim().toLocaleLowerCase();
      if (!recordName || ownerName !== recordName) return false;
      const ownerSchool = String(row.school_name || '').trim().toLocaleLowerCase();
      const ownerClass = String(row.class_name || '').trim().toLocaleLowerCase();
      return (!school || !ownerSchool || ownerSchool === school) && (!className || !ownerClass || ownerClass === className);
    });
  }
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
    else refreshViewer(record);
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
    // The student Catchdex uses this flag to decide whether to render the live challenge.
    // activeChallenge() has already applied the shared schedule window, so this result is live.
    const pendingBoxes = Array.isArray(state.mysteryBoxChallengeIds) ? state.mysteryBoxChallengeIds : [];
    const openedBoxes = Array.isArray(state.openedBoxChallengeIds) ? state.openedBoxChallengeIds : [];
    const recoverable = claimed && !Number(state.mysteryBoxes) && !pendingBoxes.includes(active.id) && !openedBoxes.includes(active.id);
    return { ...active, active: true, unique: claimed ? active.goal : unique, ready: unique >= active.goal && !claimed, claimed, recoverable, qualifying };
  }
  function canManageCatchdex(record) {
    return Boolean(record && ((currentRole === 'student' && identity(student()) === identity(record)) || (currentRole === 'teacher' && albumViewer?.readOnly && identity(albumViewer.record) === identity(record))));
  }
  const claimingChallengeIds = new Set();
  async function claimChallenge(record = student()) {
    if (!canManageCatchdex(record)) return;
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    const recovery = Boolean(goal.recoverable && goal.id);
    if ((!goal.ready && !recovery) || !goal.id || (goal.claimed && !recovery) || (hasClaimedChallenge(state, goal.id) && !recovery)) return;
    const claimKey = `${identity(record)}:${goal.id}`;
    if (claimingChallengeIds.has(claimKey)) return;
    claimingChallengeIds.add(claimKey);
    const consumed = recovery ? [] : goal.qualifying;
    if (!recovery) {
      const consumedIds = new Set(consumed.map(entry => Number(entry.pokemon_id)));
      state.album = state.album.filter(entry => !consumedIds.has(Number(entry.pokemon_id)));
      state.claimedChallengeIds = [...new Set([...(Array.isArray(state.claimedChallengeIds) ? state.claimedChallengeIds : []), goal.id])];
      // Keep the legacy claim marker in sync for older dashboard bundles.
      state.openedChallengeIds = [...new Set([...(Array.isArray(state.openedChallengeIds) ? state.openedChallengeIds : []), goal.id])];
    }
    state.mysteryBoxChallengeIds = [...new Set([...(Array.isArray(state.mysteryBoxChallengeIds) ? state.mysteryBoxChallengeIds : []), goal.id])];
    state.mysteryBoxes += 1;
    state.lastChallengeReward = { ...(state.lastChallengeReward || {}), challengeId: goal.id, consumed: recovery ? (state.lastChallengeReward?.consumed || 0) : consumed.length, claimedAt: state.lastChallengeReward?.claimedAt || new Date().toISOString(), ...(recovery ? { recoveredAt: new Date().toISOString() } : {}) };
    try { await save(record, state); }
    catch (_) { claimingChallengeIds.delete(claimKey); return toast('Could not claim the Mystery Box. Your Catchdex stickers are safe; please try again.'); }
    claimingChallengeIds.delete(claimKey);
    if (currentRole === 'student') renderCatchdexTab();
    else refreshViewer(record);
    mountCards();
    toast(recovery ? 'Your missing Mystery Box has been restored.' : 'Mystery Box added to your Catchdex.');
  }
  const openingBoxIds = new Set();
  async function openMysteryBox(record = student()) {
    if (!canManageCatchdex(record)) return;
    const recordId = identity(record);
    if (!recordId || openingBoxIds.has(recordId)) return;
    const state = parseProgress(progressFor(record));
    if (state.mysteryBoxes < 1) return toast('Claim a challenge Mystery Box before opening one.');
    const item = randomPokemon('mystery-box'); if (!item) return toast('The Pokémon collection is loading. Try again in a moment.');
    const alreadyOwned = studentAlreadyOwnsPokemon(item, record);
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
      const pendingChallengeBoxes = Array.isArray(state.mysteryBoxChallengeIds) ? [...state.mysteryBoxChallengeIds] : [];
      const openedChallengeId = pendingChallengeBoxes.shift() || [...(Array.isArray(state.claimedChallengeIds) ? state.claimedChallengeIds : []), ...(Array.isArray(state.openedChallengeIds) ? state.openedChallengeIds : [])].reverse().find(id => !(state.openedBoxChallengeIds || []).includes(id));
      state.mysteryBoxChallengeIds = pendingChallengeBoxes;
      if (openedChallengeId) state.openedBoxChallengeIds = [...new Set([...(Array.isArray(state.openedBoxChallengeIds) ? state.openedBoxChallengeIds : []), openedChallengeId])];
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
    else refreshViewer(record);
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
    const existing = challengeSetting();
    const oldStart = challengeDate(challengeStartValue(existing));
    const sameChallengeWindow = oldStart && dateInput(oldStart) === start;
    const challengeId = sameChallengeWindow && existing.challenge_id ? String(existing.challenge_id) : `week-${start}`;
    const payload = { ...(existing || {}), type: 'listen_catch_challenge', challenge_id: challengeId, challenge_title: String(data.get('title') || '').trim() || 'Weekly Catchdex Challenge', challenge_type: String(data.get('pokemonType') || ''), challenge_tier: String(data.get('pokemonTier') || ''), challenge_goal: Math.max(1, Math.min(200, Number(data.get('goal')) || DEFAULT_CHALLENGE_GOAL)), challenge_start: start, updated_at: new Date().toISOString() };
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
      panel.innerHTML = `<header><span>LISTEN AND CATCH</span><h3>Weekly Catchdex challenge</h3><p>This is the single shared source for every student's Catchdex challenge. It runs for seven days from the selected start date. Choose a type, a tier, or both.</p></header><form class="lc-admin-form"><label>Challenge name<input name="title" maxlength="48" placeholder="Green Explorer" required></label><label>Pokémon type<select name="pokemonType"><option value="">Any type</option>${POKEMON_TYPES.map(type => `<option value="${type}">${type[0].toUpperCase()}${type.slice(1)}</option>`).join('')}</select></label><label>Pokémon tier<select name="pokemonTier"><option value="">Any tier</option>${POKEMON_TIERS.map(tier => `<option value="${tier}">${tier[0].toUpperCase()}${tier.slice(1)}</option>`).join('')}</select></label><label>Unique Pokémon needed<input name="goal" type="number" min="1" max="200" value="${DEFAULT_CHALLENGE_GOAL}" required></label><label>Week starts<input name="start" type="date" value="${start}" required></label><button type="submit" class="lc-primary">Save weekly challenge</button></form><p class="lc-admin-status" aria-live="polite"></p>`;
      panel.querySelector('form').addEventListener('submit', event => { event.preventDefault(); saveChallengeConfig(event.currentTarget); });
    }
    if (panel.parentElement !== host) host.appendChild(panel);
    const setting = challengeSetting(); const active = activeChallenge(); const form = panel.querySelector('form');
    if (!form.dataset.loaded) {
      if (setting) { form.elements.title.value = setting.challenge_title || ''; form.elements.pokemonType.value = POKEMON_TYPES.includes(setting.challenge_type) ? setting.challenge_type : ''; form.elements.pokemonTier.value = POKEMON_TIERS.includes(setting.challenge_tier) ? setting.challenge_tier : ''; form.elements.goal.value = Number(setting.challenge_goal) || DEFAULT_CHALLENGE_GOAL; form.elements.start.value = challengeStartValue(setting) || dateInput(weekStart()); }
      else { form.elements.title.value = ''; form.elements.pokemonType.value = ''; form.elements.pokemonTier.value = ''; form.elements.goal.value = DEFAULT_CHALLENGE_GOAL; form.elements.start.value = dateInput(weekStart()); }
      form.dataset.loaded = 'true';
    }
    const status = panel.querySelector('.lc-admin-status');
    status.textContent = setting ? '' : 'No challenge is posted. Set this week’s challenge to get students started.';
    let posted = panel.querySelector('.lc-admin-posted');
    if (!posted) { posted = document.createElement('section'); posted.className = 'lc-admin-posted'; panel.appendChild(posted); posted.addEventListener('click', e => { if (e.target.closest('[data-lc-delete]')) deleteChallenge(); }); }
    if (!setting) { posted.innerHTML = ''; return; }
    const id = String(setting.challenge_id || `week-${challengeDate(setting.challenge_start) ? dateInput(challengeDate(setting.challenge_start)) : setting.challenge_start}`);
    const done = []; const ready = [];
    (typeof allData === 'undefined' ? [] : allData).filter(r => r.type === 'listen_catch_progress').forEach(r => {
      const state = parseProgress(r); const rec = (typeof getStudentRecordByStableId === 'function' && getStudentRecordByStableId(r.student_id)) || r; const name = rec.student_name || r.student_name || 'Student';
      const cls = [rec.school_name || r.school_name, rec.class_name || r.class_name].filter(Boolean).join(' · ');
      if (hasClaimedChallenge(state, id)) done.push({ name, cls }); else if (active && challenge(state).ready) ready.push({ name, cls });
    });
    const row = (s, tag) => `<li><b>${esc(s.name)}</b><span>${esc(s.cls)}</span><em>${tag}</em></li>`;
    const crit = challengeCriteria({ type: setting.challenge_type, tier: setting.challenge_tier });
    posted.innerHTML = `<header><div><span>${active ? 'LIVE NOW' : 'POSTED CHALLENGE'}</span><h4>${esc(setting.challenge_title || 'Weekly Catchdex Challenge')}</h4><p>Collect ${Number(setting.challenge_goal) || DEFAULT_CHALLENGE_GOAL} unique Pokémon · ${esc(crit)} · starts ${esc(setting.challenge_start)}</p></div><button type="button" class="lc-admin-delete" data-lc-delete>Delete challenge</button></header><h5>Completed (${done.length + ready.length})</h5>${done.length + ready.length ? `<ul>${done.map(s => row(s, 'Box claimed')).join('')}${ready.map(s => row(s, 'Ready to claim')).join('')}</ul>` : '<p class="lc-admin-empty">No students have completed this challenge yet.</p>'}`;
  }
  async function deleteChallenge() {
    const setting = challengeSetting(); if (!setting || !canAccessAdmin()) return;
    if (!confirm('Delete this challenge? You can then post a new one.')) return;
    let result; try { result = await window.dataSdk.delete(setting); } catch (_) { result = null; }
    if (!result?.isOk) return toast('Challenge could not be deleted. Try again.');
    allData = allData.filter(r => r !== setting && r.type !== 'listen_catch_challenge');
    const form = document.querySelector('#listen-catch-admin form'); if (form) { form.reset(); form.elements.goal.value = DEFAULT_CHALLENGE_GOAL; form.elements.start.value = dateInput(weekStart()); }
    toast('Challenge deleted. You can post a new one.'); renderAdminChallenge(); mountCards();
  }
  function refreshViewer(record) {
    const modal = document.getElementById('catchdex-modal');
    if (modal && !modal.classList.contains('hidden')) renderAlbumModal(record, true);
    const root = document.getElementById('profile-catchdex-root'); if (root) root.dataset.catchdexSig = '';
  }
  function closeGame() { session?.root?.remove(); session = null; }
  function speak(word) {
    window.speechSynthesis?.cancel();
    if (typeof window.readNaturalVocabulary === 'function') window.readNaturalVocabulary(word, null, { level: window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P4' });
    else { const level = window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P4'; const rates = { P4: .92, P5: 1, P6: 1.08 }; const utterance = new SpeechSynthesisUtterance(word); utterance.rate = rates[level] || .92; window.speechSynthesis?.speak(utterance); }
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
    if (ok) { selected.classList.add('is-correct'); session.correct += 1; if (session.earned < session.dailyAllowance) { session.earned += 1; const ballCount = session.root.querySelector('.lc-balls'); if (ballCount) ballCount.textContent = session.earned; const rewardFill = session.root.querySelector('.lc-reward-fill'); if (rewardFill) rewardFill.style.width = `${Math.min(100, session.earned / session.words.length * 100)}%`; const rewardStatus = session.root.querySelector('.lc-reward-status'); if (rewardStatus) rewardStatus.textContent = `${session.earned} of ${session.words.length} round${session.words.length === 1 ? '' : 's'} rewarded`; const dailyTotal = session.dailyEarnedBefore + session.earned; const dailyCap = session.root.querySelector('.lc-daily-cap'); dailyCap.textContent = dailyTotal >= DAILY_BALL_LIMIT ? `Daily limit reached (${DAILY_BALL_LIMIT}/${DAILY_BALL_LIMIT}). Come back tomorrow for more Catch Balls.` : `Today: ${dailyTotal} / ${DAILY_BALL_LIMIT} Catch Balls`; dailyCap.classList.toggle('is-limit', dailyTotal >= DAILY_BALL_LIMIT); session.root.querySelector('.lc-prompt').textContent = 'Caught it! You earned a Catch Ball.'; } else session.root.querySelector('.lc-prompt').textContent = 'Correct! You have reached today’s 10-ball limit.'; }
    else { selected.classList.add('is-wrong'); buttons.find(button => button.textContent.trim().toLowerCase() === String(correct.vocab_word).trim().toLowerCase())?.classList.add('is-correct'); session.root.querySelector('.lc-prompt').textContent = `The answer was “${correct.vocab_word}”.`; }
    setTimeout(() => { session.index += 1; session.index < session.words.length ? startRound() : finishGame(); }, 900);
  }
  async function finishGame() {
    const record = student(); const state = parseProgress(progressFor(record));
    const today = localDayKey(); const alreadyEarned = state.dailyBallDate === today ? Math.min(DAILY_BALL_LIMIT, Number(state.dailyBallsEarned) || 0) : 0;
    const awarded = Math.min(session.correct, DAILY_BALL_LIMIT - alreadyEarned);
    state.balls += awarded; state.dailyBallDate = today; state.dailyBallsEarned = alreadyEarned + awarded; await save(record, state);
    session.earned = awarded;
    session.root.querySelector('.lc-play').innerHTML = `<section class="lc-result"><div class="lc-result-ball">◓</div><h2>${awarded ? `${awarded} Catch Ball${awarded === 1 ? '' : 's'} earned!` : 'Keep listening — you will catch the next one.'}</h2><p>${awarded < session.correct ? `Daily limit reached. You have earned ${state.dailyBallsEarned} of ${DAILY_BALL_LIMIT} balls today. ` : ''}Open your balls now, or find them later in your Catchdex.</p><div class="lc-result-actions"><button type="button" class="lc-primary" data-lc="open">Open Catchdex</button><button type="button" class="lc-secondary" data-lc="close">Back to games</button></div></section>`;
    mountCards();
  }
  function launchForStudent(listName, record) {
    if (currentRole === 'student') listName = studentClassListRefs(record);
    const words = gameWords(listName);
    if (words.length < 2) return toast(currentRole === 'student' ? 'Your class needs at least two vocabulary words to play.' : 'This list needs at least two words.');
    closeGame();
    const root = document.createElement('div'); root.className = 'lc-stage'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Listen and Catch');
    const saved = parseProgress(progressFor(record)); const dailyEarnedBefore = ballsEarnedToday(saved); const dailyAllowance = Math.max(0, DAILY_BALL_LIMIT - dailyEarnedBefore);
    const dailyBefore = ballsEarnedToday(saved);
    const dailyAtLimit = dailyBefore >= DAILY_BALL_LIMIT;
    root.innerHTML = `<main class="lc-play"><header class="lc-head"><div><span>LISTENING QUEST</span><h1>Listen and Catch</h1></div><div class="lc-hud"><b class="lc-round">1 / ${words.length}</b><button type="button" data-lc="close" aria-label="Close game">×</button></div></header><section class="lc-main"><button type="button" class="lc-listen" data-lc="listen"><span aria-hidden="true">🔊</span><span class="lc-listen-label">Hear the sentence</span></button><p class="lc-prompt" aria-live="polite"></p><div class="lc-options"></div><section class="lc-reward-panel" aria-label="Catch Balls earned during this game"><div class="lc-reward-icon"><img src="/pokeayman/assets/catch-ball.png" alt=""></div><div class="lc-reward-copy"><span>ROUND REWARDS</span><strong><b class="lc-balls">0</b> Catch Balls this game</strong><div class="lc-reward-track"><i class="lc-reward-fill"></i></div><small class="lc-reward-status">0 of ${words.length} rounds rewarded</small><small class="lc-daily-cap${dailyAtLimit ? ' is-limit' : ''}">${dailyAtLimit ? `Daily limit reached (${dailyBefore}/${DAILY_BALL_LIMIT}). Come back tomorrow for more Catch Balls.` : `Today: ${dailyBefore} / ${DAILY_BALL_LIMIT} Catch Balls`}</small></div></section></section></main>`;
    const gameMain = root.querySelector('.lc-main');
    const rewardPanel = gameMain?.querySelector('.lc-reward-panel');
    if (gameMain && rewardPanel) gameMain.insertBefore(rewardPanel, gameMain.firstChild);
    document.body.appendChild(root); activeStudent = record; session = { root, listName, words, index: 0, earned: 0, correct: 0, dailyAllowance, dailyEarnedBefore, options: [], student: record };
    root.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.lc === 'close') closeGame(); else if (button.dataset.lc === 'listen') { const word = session.words[session.index]; speak(String(word.vocab_sentence || word.vocab_word)); } else if (button.dataset.lc === 'open') { const playedStudent = session.student; closeGame(); if (currentRole === 'student') window.openCatchdex(); else window.openCatchdexFor?.(playedStudent, true); } else if (button.dataset.choice !== undefined) answer(Number(button.dataset.choice)); });
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
    if (!window.canUseProGames?.()) { window.requireProGame?.('Listen and Catch'); return; }
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
    document.getElementById('catchdex-profile-card')?.remove();
    const profileRoot = document.getElementById('profile-catchdex-root');
    if (profile && profileRoot) {
      const profileState = parseProgress(progressFor(profile)); const profileGoal = challenge(profileState);
      const sig = `${identity(profile)}:${profileState.album.length}:${profileState.balls}:${profileState.mysteryBoxes}:${profileGoal.id}:${profileGoal.title}:${profileGoal.start}:${profileGoal.end}:${profileGoal.type}:${profileGoal.tier}:${profileGoal.goal}:${profileGoal.unique}:${profileGoal.claimed}:${profileState.last?.item?.id || ''}`;
      if (profileRoot.dataset.catchdexSig !== sig) {
        albumViewer = { record: profile, readOnly: true };
        profileRoot.innerHTML = `<section class="catchdex-tab-card">${renderCatchdexContents(profile, true).replace('<button type="button" data-catchdex="close" aria-label="Close Catchdex">×</button>', '')}</section>`;
        profileRoot.dataset.catchdexSig = sig; bindCatchdexContents(profileRoot, profile, true);
      }
    }
  }
  function renderCatchdexContents(record, readOnly) {
    const state = parseProgress(progressFor(record)); const goal = challenge(state);
    const cards = state.album.length ? state.album.map(entry => {
      const qualifies = goal.active && !goal.claimed && matchesChallenge(entry, goal);
      return `<article class="cdx-sticker${qualifies ? ' is-match' : ''}"${qualifies ? ' aria-label="Matches the active challenge"' : ''}>
        ${qualifies ? '<span class="cdx-match-tag" aria-label="Challenge sticker">✓ Needed</span>' : ''}
        <img src="${art(entry.pokemon_id)}" alt="${esc(entry.pokemon_name)} sticker" loading="lazy">
        <b>${esc(entry.pokemon_name)}</b><span>${esc(entry.pokemon_type)}</span>
      </article>`;
    }).join('') : '<div class="cdx-empty"><span aria-hidden="true">🗂️</span><b>Your sticker album is empty</b><p>Play Listen and Catch to earn Catch Balls, then open them to discover Pokémon stickers.</p></div>';
    const progress = Math.min(goal.unique, goal.goal);
    const pct = goal.goal ? Math.min(100, progress / goal.goal * 100) : 0;
    const challengeMarkup = goal.active
      ? `<section class="cdx-challenge${goal.ready ? ' is-ready' : ''}${goal.claimed ? ' is-claimed' : ''}" aria-labelledby="cdx-challenge-title">
          <div class="cdx-challenge-top"><div><span class="cdx-eyebrow">${goal.claimed ? 'CHALLENGE COMPLETE' : 'ACTIVE COLLECTION CHALLENGE'}</span><h3 id="cdx-challenge-title">${esc(goal.title)}</h3><p>Collect <strong>${goal.goal} unique Pokémon</strong> matching <strong>${esc(challengeCriteria(goal))}</strong>.</p></div><span class="cdx-challenge-mark" aria-hidden="true">${goal.claimed ? '✓' : '🎯'}</span></div>
          <div class="cdx-progress-row"><div class="cdx-progress-label"><b>${progress}<span> / ${goal.goal}</span></b><span>${goal.recoverable ? 'Mystery Box missing' : goal.claimed && state.mysteryBoxes ? 'Mystery Box ready to open' : goal.claimed ? 'Reward claimed' : goal.ready ? 'Ready to claim!' : `${Math.max(0, goal.goal - goal.unique)} more needed`}</span></div><div class="cdx-progress-track" role="progressbar" aria-label="${esc(goal.title)} progress" aria-valuemin="0" aria-valuemax="${goal.goal}" aria-valuenow="${progress}"><span style="width:${pct}%"></span></div></div>
          <div class="cdx-challenge-foot"><small>${goal.end ? `Challenge ends ${esc(goal.end)}` : 'Limited-time challenge'}</small>${goal.ready ? '<button type="button" class="cdx-button is-gold" data-catchdex="claim">🎁 Claim Mystery Box</button>' : ''}${goal.recoverable ? '<button type="button" class="cdx-button is-gold" data-catchdex="claim">🎁 Restore Mystery Box</button>' : ''}${goal.claimed && state.mysteryBoxes ? '<button type="button" class="cdx-button is-gold" data-catchdex="boxes">🎁 Open a Mystery Box</button>' : ''}</div>
          ${goal.recoverable ? '<p class="cdx-hint">Your challenge was marked complete, but no box is in your inventory. Restore the missing Mystery Box here.</p>' : goal.claimed ? '<p class="cdx-claimed">✓ Reward claimed. The challenge stickers have been removed from your album.</p>' : '<p class="cdx-hint">Stickers that count toward this challenge are highlighted in your album below.</p>'}
        </section>`
      : '<section class="cdx-challenge is-inactive"><span class="cdx-challenge-mark" aria-hidden="true">🗓️</span><div><span class="cdx-eyebrow">WEEKLY CHALLENGE</span><h3>No active challenge</h3><p>Your next Catchdex challenge will appear here when the admin schedules it.</p></div></section>';
    return `<div class="cdx-view">
      <header class="cdx-header"><div><span class="cdx-eyebrow">YOUR GAME COLLECTION</span><h2>${readOnly ? `${esc(record?.student_name || 'Student')}'s Catchdex` : 'Catchdex'}</h2><p>Every sticker you discover lives here.</p></div>${readOnly ? '<button type="button" class="cdx-close" data-catchdex="close" aria-label="Close Catchdex">×</button>' : ''}</header>
      <section class="cdx-wallet" aria-label="Catchdex inventory">
        <article class="cdx-stat"><span class="cdx-stat-icon"><img src="assets/catch-ball.png" alt="Catch Ball"></span><div><span class="cdx-stat-label">CATCH BALLS</span><b>${state.balls}</b><small>${readOnly ? 'Ready to open' : `${ballsEarnedToday(state)} / ${DAILY_BALL_LIMIT} earned today`}</small></div>${state.balls ? '<button type="button" class="cdx-button" data-catchdex="balls">Open balls</button>' : ''}</article>
        <article class="cdx-stat is-box"><span class="cdx-stat-icon" aria-hidden="true">🎁</span><div><span class="cdx-stat-label">MYSTERY BOXES</span><b>${state.mysteryBoxes}</b><small>${state.mysteryBoxes ? 'A surprise Pokémon awaits' : 'Earn one from a challenge'}</small></div>${state.mysteryBoxes ? '<button type="button" class="cdx-button is-gold" data-catchdex="boxes">Open box</button>' : ''}</article>
      </section>
      ${state.last ? `<div class="cdx-discovery${state.last.duplicate ? ' is-duplicate' : ''}"><span aria-hidden="true">${state.last.duplicate ? '🪙' : '✨'}</span><div><b>${state.last.duplicate ? 'Sticker converted' : 'New discovery'}</b><span>${state.last.duplicate ? `${esc(state.last.item.name)} was already in your album · +${state.last.coins} coins` : esc(state.last.item.name)}</span></div></div>` : ''}
      ${challengeMarkup}
      <section class="cdx-collection"><header class="cdx-collection-head"><div><span class="cdx-eyebrow">STICKER ALBUM</span><h3>Your collection</h3></div><span class="cdx-count">${state.album.length} ${state.album.length === 1 ? 'sticker' : 'stickers'}</span></header>
        ${goal.active && !goal.claimed ? '<p class="cdx-legend"><span></span>Needed for this challenge</p>' : ''}<div class="cdx-sticker-grid">${cards}</div>
      </section>
    </div>`;
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
    const signature = `${identity(record)}:${state.album.length}:${state.balls}:${state.mysteryBoxes}:${goal.id}:${goal.title}:${goal.start}:${goal.end}:${goal.type}:${goal.tier}:${goal.goal}:${goal.unique}:${goal.claimed}:${goal.recoverable}:${state.last?.item?.id || ''}`;
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
    overlay.innerHTML = `<section class="lc-box-inventory-card"><button type="button" class="lc-mystery-close" data-box-close aria-label="Close">×</button><span class="lc-mystery-kicker">CATCHDEX REWARDS</span><h2>${esc(record.student_name || 'Student')} has ${count} Mystery Box${count === 1 ? '' : 'es'}</h2><p>Open one box to reveal a random Pokémon. Each box has a 2% rare and 0.25% legendary chance. If you already own the Pokémon, it becomes coins instead.</p><button type="button" class="lc-primary" data-box-open>Open one box</button></section>`;
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
