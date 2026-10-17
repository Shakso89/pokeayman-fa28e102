/* Listen and Catch: a student-only listening game with a separate Catchdex. */
(function () {
  const ROUNDS = 5;
  const DAILY_BALL_LIMIT = 10;
  const POKEMON_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const BALL_TIERS = ['common', 'uncommon', 'rare', 'legendary'];
  const BALL_ASSETS = { common: '1.png', uncommon: '11.png', rare: '4.png', legendary: '6.png' };
  const BALL_WEIGHTS = { common: 80, uncommon: 15, rare: 4, legendary: 1 };
  const DEFAULT_GUARANTEED_THROWS = 20;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const art = id => `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@2.0.0/sprites/pokemon/other/official-artwork/${id}.png`;
  const identity = student => String(student?.__backendId || student?.student_id || '').trim();
  const shuffle = list => { const items = [...list]; for (let i = items.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; };
  let session = null;
  let catchdexViewer = null;
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
  const progressMigrations = new Map();
  function parseProgress(record) {
    try {
      const stored = JSON.parse(record?.listen_catch_data || '{}');
      const oldCaughtPokemon = Array.isArray(stored.album) ? stored.album : [];
      const state = { balls: 0, ballTiers: null, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], mysteryBoxChallengeIds: [], openedBoxChallengeIds: [], challengeThrows: {}, challengeWins: [], dailyBallDate: '', dailyBallsEarned: 0, catchdexBallConversionVersion: 0, ...stored };
      state.mysteryBoxes = Math.max(0, Number(state.mysteryBoxes) || 0);
      state.balls = Math.max(0, Number(state.balls) || 0) + (Number(stored.catchdexDataVersion) >= 2 ? 0 : oldCaughtPokemon.length);
      if (!state.ballTiers || typeof state.ballTiers !== 'object') state.ballTiers = { common: state.balls, uncommon: 0, rare: 0, legendary: 0 };
      BALL_TIERS.forEach(tier => { state.ballTiers[tier] = Math.max(0, Number(state.ballTiers[tier]) || 0); });
      state.balls = totalBalls(state);
      if (!state.challengeThrows || typeof state.challengeThrows !== 'object') state.challengeThrows = {};
      // Older Catchdex saves kept ball rewards in an album. Convert each entry
      // into one usable Catch Ball, then drop that obsolete collection field.
      delete state.album;
      Object.keys(state).filter(key => key.startsWith('legacy')).forEach(key => delete state[key]);
      state.catchdexDataVersion = 2;
      return state;
    }
    catch (_) { return { balls: 0, ballTiers: { common: 0, uncommon: 0, rare: 0, legendary: 0 }, mysteryBoxes: 0, openedChallengeIds: [], claimedChallengeIds: [], mysteryBoxChallengeIds: [], openedBoxChallengeIds: [], challengeThrows: {}, challengeWins: [], dailyBallDate: '', dailyBallsEarned: 0, catchdexDataVersion: 2, catchdexBallConversionVersion: 0 }; }
  }
  function stateFor(record) {
    const source = progressFor(record) || record;
    const state = parseProgress(source);
    if (record && source && !progressMigrations.has(identity(record)) && hasUnmigratedProgress(source)) {
      const id = identity(record);
      const task = Promise.resolve().then(() => save(record, state)).catch(() => {}).finally(() => progressMigrations.delete(id));
      progressMigrations.set(id, task);
    }
    return state;
  }
  function hasUnmigratedProgress(source) {
    try { const data = JSON.parse(source?.listen_catch_data || '{}'); return Number(data.catchdexDataVersion) < 2 && Array.isArray(data.album); }
    catch (_) { return false; }
  }
  function localDayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function ballsEarnedToday(state) { return state.dailyBallDate === localDayKey() ? Math.min(DAILY_BALL_LIMIT, Number(state.dailyBallsEarned) || 0) : 0; }
  function totalBalls(state) { return BALL_TIERS.reduce((sum, tier) => sum + Math.max(0, Number(state.ballTiers?.[tier]) || 0), 0); }
  function ballCount(state, tier) { return Math.max(0, Number(state.ballTiers?.[tier]) || 0); }
  function addEarnedBalls(state, count) {
    state.ballTiers ||= { common: Math.max(0, Number(state.balls) || 0), uncommon: 0, rare: 0, legendary: 0 };
    for (let i = 0; i < count; i += 1) {
      const roll = Math.random() * 100; let cursor = 0;
      const tier = BALL_TIERS.find(name => (cursor += BALL_WEIGHTS[name]) > roll) || 'common';
      state.ballTiers[tier] = ballCount(state, tier) + 1;
    }
    state.balls = totalBalls(state);
  }
  function ballArt(tier) { return `/pokeayman/assets/balls/${BALL_ASSETS[tier] || BALL_ASSETS.common}`; }
  function rarityLabel(tier) { return `${String(tier || 'common').slice(0, 1).toUpperCase()}${String(tier || 'common').slice(1)}`; }
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
    const types = parseTypes(setting.challenge_type); const type = types.join(',');
    const guaranteedThrows = Math.max(1, Math.min(100, Number(setting.challenge_max_throws ?? setting.challenge_goal ?? setting.goal) || DEFAULT_GUARANTEED_THROWS));
    const pokemonId = Number(setting.challenge_pokemon_id) || 0;
    const targetPokemon = pokemonId ? catalog().find(item => Number(item.id) === pokemonId) : null;
    const tier = BALL_TIERS.includes(String(setting.challenge_tier || '').toLowerCase()) ? String(setting.challenge_tier).toLowerCase() : String(targetPokemon?.rarity || 'common').toLowerCase();
    const startKey = dateInput(start);
    return { id: String(setting.challenge_id || `week-${startKey}`), title: String(setting.challenge_title || setting.title || 'Weekly Catchdex Challenge'), type, types, guaranteedThrows, pokemonId, pokemonName: String(setting.challenge_pokemon_name || targetPokemon?.name || ''), tier, start: startKey, end: dateInput(end), setting };
  }
  function parseTypes(value) { return [...new Set(String(value || '').toLowerCase().split(/[,|/ ]+/).filter(t => POKEMON_TYPES.includes(t)))].slice(0, 2); }
  function typeOf(item) {
    const type = typeof getPokemonTypes === 'function' ? getPokemonTypes(item).find(value => value !== 'unknown') : '';
    return type || 'normal';
  }
  function challengeCriteria(active) {
    const types = active.types || parseTypes(active.type); return types.length ? `${types.join(' or ')} type` : 'any type';
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
  function pokemonOwnerElsewhere(item, record) {
    const recordId = identity(record); const recordName = String(record?.student_name || '').trim().toLocaleLowerCase();
    const row = (typeof allData === 'undefined' ? [] : allData).find(r => r.type === 'pokemon' && Number(r.pokemon_id) === Number(item.id) && !studentAlreadyOwnsPokemon(item, record) && ((String(r.student_id || '').trim() && String(r.student_id).trim() !== recordId) || String(r.owner || '').trim().toLocaleLowerCase() !== recordName));
    return row ? (row.owner || 'another student') : '';
  }
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
  const catchdexConversionTasks = new Map();
  async function convertLegacyCatchdexPokemon(record) {
    const recordId = identity(record);
    if (!recordId) return false;
    let state = stateFor(record);
    const progressTask = progressMigrations.get(recordId);
    if (progressTask) { await progressTask; state = stateFor(record); }
    if (Number(state.catchdexBallConversionVersion) >= 1) return false;
    const studentName = String(record.student_name || '').trim().toLocaleLowerCase();
    const school = String(record.school_name || '').trim().toLocaleLowerCase();
    const className = String(record.class_name || '').trim().toLocaleLowerCase();
    const ownedRows = typeof getOwnedPokemonForStudent === 'function'
      ? getOwnedPokemonForStudent(record)
      : (typeof allData === 'undefined' ? [] : allData).filter(row => {
        if (row.type !== 'pokemon') return false;
        const ownerId = String(row.student_id || row.owner_id || row.canonical_student_id || '').trim();
        if (ownerId) return ownerId === recordId;
        const ownerName = String(row.owner || row.student_name || '').trim().toLocaleLowerCase();
        return Boolean(studentName && ownerName === studentName && (!school || !row.school_name || String(row.school_name).trim().toLocaleLowerCase() === school) && (!className || !row.class_name || String(row.class_name).trim().toLocaleLowerCase() === className));
      });
    const legacyRows = ownedRows.filter(row => row.catch_ball_reward || row.catchdex_box_reward || row.catchdex_challenge_id);
    const archived = [];
    const original = JSON.stringify(state);
    try {
      const species = new Set();
      for (const row of legacyRows) {
        const backendId = row.__backendId || row.id;
        const speciesId = Number(row.pokemon_id) || String(backendId || row.pokemon_name || Math.random());
        const key = String(speciesId);
        const tier = BALL_TIERS.includes(String(row.pokemon_rarity || '').toLowerCase()) ? String(row.pokemon_rarity).toLowerCase() : 'common';
        const result = await window.dataSdk.update({ ...row, type: 'catchdex_ball_conversion', original_type: 'pokemon', catchdex_converted_to_ball: tier, catchdex_converted_at: new Date().toISOString(), __backendId: row.__backendId || row.id });
        if (!result?.isOk) throw new Error('legacy Pokémon conversion failed');
        archived.push({ row, key, tier });
        if (!species.has(key)) {
          species.add(key);
          state.ballTiers[tier] = ballCount(state, tier) + 1;
        }
      }
      state.balls = totalBalls(state);
      state.catchdexBallConversionVersion = 1;
      await save(record, state);
      if (typeof allData !== 'undefined') archived.forEach(({ row }) => Object.assign(row, { type: 'catchdex_ball_conversion', original_type: 'pokemon' }));
      return archived.length > 0;
    } catch (_) {
      await Promise.all(archived.map(async ({ row }) => { try { await window.dataSdk.update(row); } catch (_) {} }));
      Object.assign(state, JSON.parse(original));
      return false;
    }
  }
  function scheduleLegacyCatchdexConversion(record) {
    if (!canManageCatchdex(record)) return Promise.resolve(false);
    const recordId = identity(record);
    if (catchdexConversionTasks.has(recordId)) return catchdexConversionTasks.get(recordId);
    const task = convertLegacyCatchdexPokemon(record).then(converted => {
      if (!converted) return;
      if (currentRole === 'student' && identity(student()) === recordId) renderCatchdexTab();
      if (typeof profileStudent !== 'undefined' && identity(profileStudent) === recordId) renderProfileCatchdex(record);
      const modal = document.getElementById('catchdex-modal');
      if (modal && !modal.classList.contains('hidden') && identity(catchdexViewer?.record) === recordId) renderCatchdexModal(record, true);
      mountCards();
      return converted;
    }).finally(() => catchdexConversionTasks.delete(recordId));
    catchdexConversionTasks.set(recordId, task);
    return task;
  }
  const BALL_AWARD_PRICES = { common: 2, uncommon: 5, rare: 10, legendary: 20 };
  function winnerRows() {
    return (typeof allData === 'undefined' ? [] : allData).filter(row => String(row.type || '') === 'listen_catch_winner');
  }
  function challengeWinner(challengeId) {
    if (!challengeId) return null;
    return winnerRows().filter(row => String(row.challenge_id) === String(challengeId))
      .sort((a, b) => (Date.parse(a.won_at || a.created_at || '') || 0) - (Date.parse(b.won_at || b.created_at || '') || 0))[0] || null;
  }
  window.pkChallengeWinnerRows = winnerRows;
  function askBallQuantity(record, tier, price) {
    return new Promise(resolve => {
      document.querySelector('.cdx-gift-overlay')?.remove();
      const name = String(record.student_name || 'this student').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const overlay = document.createElement('div');
      overlay.className = 'cdx-gift-overlay';
      overlay.innerHTML = `<div class="cdx-gift-card cdx-tier-${tier}" role="dialog" aria-modal="true" aria-label="Gift Catch Balls">
        <img class="cdx-gift-ball" src="${ballArt(tier)}" alt="">
        <h2>Gift ${rarityLabel(tier)} Balls</h2>
        <p>To <strong>${name}</strong> · ${price} credits each</p>
        <div class="cdx-gift-stepper"><button type="button" data-step="-1" aria-label="Fewer">−</button><input type="number" min="1" max="99" value="1" aria-label="Number of balls"><button type="button" data-step="1" aria-label="More">+</button></div>
        <div class="cdx-gift-quick">${[1, 3, 5, 10].map(n => `<button type="button" data-set="${n}">${n}</button>`).join('')}</div>
        <p class="cdx-gift-total"></p>
        <div class="cdx-gift-actions"><button type="button" class="cdx-gift-cancel">Cancel</button><button type="button" class="cdx-gift-ok">Gift</button></div>
      </div>`;
      document.body.appendChild(overlay);
      const input = overlay.querySelector('input'); const total = overlay.querySelector('.cdx-gift-total');
      const qty = () => Math.max(1, Math.min(99, Math.floor(Number(input.value) || 1)));
      const update = () => { const q = qty(); total.textContent = `${q} × ${price} = ${q * price} credits`; overlay.querySelectorAll('[data-set]').forEach(b => b.classList.toggle('is-active', Number(b.dataset.set) === q)); };
      const close = value => { overlay.remove(); resolve(value); };
      overlay.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { input.value = Math.max(1, Math.min(99, qty() + Number(b.dataset.step))); update(); }));
      overlay.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.set; update(); }));
      input.addEventListener('input', update);
      input.addEventListener('blur', () => { input.value = qty(); update(); });
      overlay.querySelector('.cdx-gift-cancel').addEventListener('click', () => close(0));
      overlay.querySelector('.cdx-gift-ok').addEventListener('click', () => close(qty()));
      update(); input.focus(); input.select();
    });
  }
  async function awardBall(record, tier) {
    if (currentRole !== 'teacher' || !BALL_TIERS.includes(tier)) return;
    const price = BALL_AWARD_PRICES[tier];
    const quantity = await askBallQuantity(record, tier, price);
    if (!quantity) return;
    const cost = price * quantity;
    const paid = typeof deductTeacherCredits === 'function' ? await deductTeacherCredits(cost) : false;
    if (!paid) return;
    const state = stateFor(record);
    state.ballTiers[tier] = ballCount(state, tier) + quantity; state.balls = totalBalls(state);
    try { await save(record, state); }
    catch (_) { if (typeof refundTeacherCredits === 'function') await refundTeacherCredits(cost, currentTeacher); return toast('The balls could not be saved. Your credits were returned.'); }
    if (typeof updateTeacherCreditBalance === 'function') updateTeacherCreditBalance();
    toast(`${quantity} ${rarityLabel(tier)} ball${quantity > 1 ? 's' : ''} given to ${record.student_name || 'student'}!`);
    refreshViewer(record);
  }
  function challenge(state) {
    const active = activeChallenge();
    if (!active) return { id: '', title: 'No challenge this week', type: '', types: [], guaranteedThrows: DEFAULT_GUARANTEED_THROWS, throws: 0, canThrow: false, claimed: false, active: null };
    const savedThrows = Number(state.challengeThrows?.[active.id]) || 0;
    const throws = Math.min(active.guaranteedThrows, Math.max(0, savedThrows));
    const won = (Array.isArray(state.challengeWins) && state.challengeWins.some(id => String(id) === active.id)) || hasClaimedChallenge(state, active.id);
    const winner = challengeWinner(active.id);
    const lockedByOther = Boolean(winner && !won);
    return { ...active, active: true, throws, winner, lockedByOther, canThrow: !won && !lockedByOther && ballCount(state, active.tier) > 0, ballCount: ballCount(state, active.tier), claimed: won };
  }
  function canManageCatchdex(record) {
    return Boolean(record && ((currentRole === 'student' && identity(student()) === identity(record)) || (currentRole === 'teacher' && catchdexViewer?.readOnly && identity(catchdexViewer.record) === identity(record))));
  }
  function challengePokemonPool(goal) {
    if (goal.pokemonId) return catalog().filter(item => Number(item.id) === Number(goal.pokemonId));
    const types = goal.types?.length ? goal.types : parseTypes(goal.type);
    return catalog().filter(item => {
      if (!(Number(item.id) > 0)) return false;
      if (String(item.rarity || 'common').toLowerCase() !== goal.tier) return false;
      const itemTypes = typeof getPokemonTypes === 'function' ? getPokemonTypes(item) : [item.type || item.pokemon_type];
      return !types.length || itemTypes.some(type => types.includes(String(type || '').toLowerCase()));
    });
  }
  const throwingChallengeIds = new Set();
  async function throwChallengeBall(record = student()) {
    if (!canManageCatchdex(record)) return;
    const recordId = identity(record);
    if (!recordId) return;
    await scheduleLegacyCatchdexConversion(record);
    const state = stateFor(record); const goal = challenge(state);
    if (!goal.active || goal.claimed) return toast('This type-ball challenge has already been completed.');
    if (goal.lockedByOther) return toast(`${goal.winner.student_name || 'Another student'} already caught this Pokémon. Watch for the next challenge!`);
    if (!ballCount(state, goal.tier)) return toast(`You need a ${rarityLabel(goal.tier)} ball for this challenge. Earn more Catch Balls by playing Listen and Catch.`);
    const throwKey = `${recordId}:${goal.id}`;
    if (throwingChallengeIds.has(throwKey)) return;
    const pool = challengePokemonPool(goal);
    if (!pool.length) return toast(`No ${challengeCriteria(goal)} Pokémon are available yet.`);
    const freePool = pool.filter(item => !pokemonOwnerElsewhere(item, record));
    if (!freePool.length) return toast(`${pool[0].name} is already owned by ${pokemonOwnerElsewhere(pool[0], record)}. Each Pokémon can have only one owner.`);
    const candidate = freePool[Math.floor(Math.random() * freePool.length)];
    const attempt = goal.throws + 1;
    const guaranteed = attempt >= goal.guaranteedThrows;
    const caught = guaranteed || (attempt < goal.guaranteedThrows && Math.random() < 0.05);
    const alreadyOwned = caught && studentAlreadyOwnsPokemon(candidate, record);
    const coins = alreadyOwned ? duplicateCoins(candidate) : 0;
    const originalData = JSON.stringify(state);
    const createdAt = new Date().toISOString();
    const pokemonRecord = {
      type: 'pokemon', student_id: recordId, school_name: record.school_name || '', class_name: record.class_name || '',
      student_name: '', coins: 0, owner: record.student_name || '', pokemon_id: Number(candidate.id), pokemon_name: candidate.name,
      pokemon_rarity: candidate.rarity || 'common', pokemon_price: Number(candidate.price) || 0, pokemon_power: Number(candidate.power) || 0,
      current_hp: Number(candidate.hp) || (Number(candidate.power) || 0) + 30, last_battle_time: '', created_at: createdAt,
      catchdex_challenge_id: goal.id, catchdex_challenge_type: goal.types.join(','), catchdex_challenge_tier: goal.tier
    };
    state.ballTiers[goal.tier] -= 1; state.balls = totalBalls(state);
    state.challengeThrows = { ...(state.challengeThrows || {}), [goal.id]: attempt };
    if (caught) state.challengeWins = [...new Set([...(Array.isArray(state.challengeWins) ? state.challengeWins : []), goal.id])];
    throwingChallengeIds.add(throwKey);
    let createdPokemon = null; let coinsAwarded = false;
    try {
      if (caught && !alreadyOwned) {
        const result = await window.dataSdk.create(pokemonRecord);
        if (!result?.isOk) throw new Error('pokemon create failed');
        createdPokemon = result.data || result;
      } else if (alreadyOwned) { await addCoins(record, coins); coinsAwarded = true; }
      await save(record, state);
      if (caught) {
        const winnerRecord = { type: 'listen_catch_winner', challenge_id: goal.id, challenge_title: goal.title, student_id: recordId, student_name: record.student_name || '', class_name: record.class_name || '', school_name: record.school_name || '', pokemon_id: Number(candidate.id), pokemon_name: candidate.name, won_at: createdAt, created_at: createdAt };
        try { const res = await window.dataSdk.create(winnerRecord); if (res?.isOk && typeof allData !== 'undefined' && !allData.some(r => r.__backendId && r.__backendId === (res.data?.__backendId))) allData.push({ ...winnerRecord, __backendId: res.data?.__backendId || res.data?.id || '' }); } catch (_) {}
        window.pkApplyBadgePins?.();
      }
      if (createdPokemon && typeof allData !== 'undefined') allData.push({ ...pokemonRecord, __backendId: createdPokemon.__backendId || createdPokemon.id || '' });
    } catch (_) {
      if (createdPokemon && (createdPokemon.__backendId || createdPokemon.id)) { try { await window.dataSdk.delete(createdPokemon); } catch (_) {} }
      if (coinsAwarded) { try { await addCoins(record, -coins); } catch (_) {} }
      try { await save(record, JSON.parse(originalData)); } catch (_) {}
      throwingChallengeIds.delete(throwKey);
      return toast('The Poké Ball could not be saved. It is still available; please try again.');
    }
    throwingChallengeIds.delete(throwKey);
    if (currentRole === 'student') renderCatchdexTab(); else refreshViewer(record);
    mountCards();
    if (caught && currentRole === 'student' && typeof renderStudentDashboard === 'function') renderStudentDashboard();
    showChallengeThrow(candidate, { caught, alreadyOwned, coins, attempt, target: goal.guaranteedThrows, type: goal.tier, ballImage: ballArt(goal.tier) });
  }
  function showChallengeThrow(item, result) {
    document.getElementById('lc-challenge-throw')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-challenge-throw'; overlay.className = 'lc-throw-overlay';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', `${result.type} Poké Ball throw`);
    const title = result.caught ? `Gotcha! You caught ${esc(item.name)} and won the challenge!` : `${esc(item.name)} dodged it!`;
    const description = result.caught
      ? result.alreadyOwned ? `${esc(item.name)} is already yours. The Catchdex challenge is complete.` : `${esc(item.name)} was added to your Pokémon collection.`
      : `Throw ${result.attempt} of ${result.target} missed. There is a 95% chance to miss before the guaranteed final throw.`;
    overlay.innerHTML = `<section class="lc-throw-card lc-tier-${esc(result.type)} is-animating${result.caught ? ' result-caught' : ' result-missed'}"><button type="button" class="lc-mystery-close" data-throw-close aria-label="Close">×</button><span class="lc-mystery-kicker">${rarityLabel(result.type).toUpperCase()} POKÉ BALL · THROW ${result.attempt}/${result.target}</span><div class="lc-throw-scene"><span class="lc-throw-target" aria-label="${esc(item.name)}"><img src="${art(item.id)}" alt="${esc(item.name)}" loading="eager"></span><span class="lc-throw-ball" aria-hidden="true"><img src="${result.ballImage || ballArt(result.type)}" alt=""></span><span class="lc-throw-impact" aria-hidden="true">✦</span>${result.caught ? '<span class="lc-confetti" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('') + '</span><span class="lc-gotcha" aria-hidden="true">Gotcha!</span>' : '<span class="lc-dust" aria-hidden="true"></span><span class="lc-broke" aria-hidden="true">Broke free!</span>'}</div><h2>${title}</h2><p>${description}</p><button type="button" class="lc-primary" data-throw-close>${result.caught ? 'Awesome!' : 'Try another ball'}</button></section>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.querySelector('.lc-throw-card')?.classList.add(result.caught ? 'is-caught' : 'is-missed'));
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-throw-close]')) overlay.remove(); });
  }
  const openingBoxIds = new Set();
  async function openMysteryBox(record = student()) {
    if (!canManageCatchdex(record)) return;
    const recordId = identity(record);
    if (!recordId || openingBoxIds.has(recordId)) return;
    await scheduleLegacyCatchdexConversion(record);
    const state = stateFor(record);
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
      if (caught) {
        const winnerRecord = { type: 'listen_catch_winner', challenge_id: goal.id, challenge_title: goal.title, student_id: recordId, student_name: record.student_name || '', class_name: record.class_name || '', school_name: record.school_name || '', pokemon_id: Number(candidate.id), pokemon_name: candidate.name, won_at: createdAt, created_at: createdAt };
        try { const res = await window.dataSdk.create(winnerRecord); if (res?.isOk && typeof allData !== 'undefined' && !allData.some(r => r.__backendId && r.__backendId === (res.data?.__backendId))) allData.push({ ...winnerRecord, __backendId: res.data?.__backendId || res.data?.id || '' }); } catch (_) {}
        window.pkApplyBadgePins?.();
      }
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
    const selectedPokemon = catalog().find(item => Number(item.id) === Number(data.get('pokemonId')));
    if (!selectedPokemon) return toast('Choose a Pokémon for the challenge.');
    const selectedType = (typeof getPokemonTypes === 'function' ? getPokemonTypes(selectedPokemon)[0] : '') || selectedPokemon.type || selectedPokemon.pokemon_type || 'normal';
    const selectedTier = BALL_TIERS.includes(String(selectedPokemon.rarity || '').toLowerCase()) ? String(selectedPokemon.rarity).toLowerCase() : 'common';
    const existing = challengeSetting();
    const oldStart = challengeDate(challengeStartValue(existing));
    const sameChallengeWindow = oldStart && dateInput(oldStart) === start;
    const guaranteedThrows = Math.max(1, Math.min(100, Number(data.get('maxThrows')) || DEFAULT_GUARANTEED_THROWS));
    const sameCriteria = existing && existing.challenge_max_throws != null && Number(existing.challenge_pokemon_id) === Number(selectedPokemon.id) && Number(existing.challenge_max_throws) === guaranteedThrows;
    const challengeId = sameChallengeWindow && sameCriteria && existing.challenge_id ? String(existing.challenge_id) : `ch-${start}-${Date.now().toString(36)}`;
    const payload = { ...(existing || {}), type: 'listen_catch_challenge', challenge_id: challengeId, challenge_title: String(data.get('title') || '').trim() || 'Weekly Catchdex Challenge', challenge_pokemon_id: Number(selectedPokemon.id), challenge_pokemon_name: selectedPokemon.name, challenge_type: selectedType, challenge_tier: selectedTier, challenge_goal: guaranteedThrows, challenge_max_throws: guaranteedThrows, challenge_start: start, updated_at: new Date().toISOString() };
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    let result;
    try { result = existing ? await window.dataSdk.update({ ...payload, __backendId: existing.__backendId }) : await window.dataSdk.create(payload); }
    catch (_) { result = null; }
    button.disabled = false;
    if (!result?.isOk) return toast('Challenge could not be saved. Try again.');
    if (existing) Object.assign(existing, payload); else allData.push({ ...payload, __backendId: (result.data || result).__backendId || (result.data || result).id || '' });
    toast('Weekly Catchdex challenge saved.'); renderAdminChallenge(); mountCards();
    const modal = document.getElementById('catchdex-modal'); if (modal && !modal.classList.contains('hidden')) renderCatchdexModal();
  }

  function renderAdminChallenge() {
    if (typeof canAccessAdmin !== 'function' || !canAccessAdmin()) { document.getElementById('listen-catch-admin')?.remove(); return; }
    const host = document.getElementById('admin-subtab-challenges'); if (!host) return;
    let panel = document.getElementById('listen-catch-admin');
    if (!panel) {
      panel = document.createElement('section'); panel.id = 'listen-catch-admin'; panel.className = 'lc-admin-panel';
      const start = dateInput(weekStart());
      const options = catalog().filter(item => Number(item.id) > 0).map(item => `<option value="${esc(item.name)} (#${Number(item.id)})"></option>`).join('');
      panel.innerHTML = `<header><span>LISTEN AND CATCH</span><h3>Weekly Catchdex challenge</h3><p>Choose one Pokémon. Students can throw only balls matching its rarity. Catch chances start at 95% of the target, and the Pokémon is guaranteed on the final throw.</p></header><form class="lc-admin-form"><label>Challenge name<input name="title" maxlength="48" placeholder="Happy Halloween" required></label><label>Challenge Pokémon<input name="pokemonSearch" list="lc-challenge-pokemon-list" placeholder="Search Pokémon by name" autocomplete="off" required><input name="pokemonId" type="hidden"><datalist id="lc-challenge-pokemon-list">${options}</datalist><small class="lc-admin-pokemon-meta">Choose a Pokémon to see its type and rarity.</small></label><label>Guaranteed catch by throw<input name="maxThrows" type="number" min="2" max="100" value="${DEFAULT_GUARANTEED_THROWS}" required><small>Early catch chance is only available after 95% of the target throws.</small></label><label>Challenge starts<input name="start" type="date" value="${start}" required></label><button type="submit" class="lc-primary">Save weekly challenge</button></form><p class="lc-admin-status" aria-live="polite"></p>`;
      const form = panel.querySelector('form');
      form.elements.pokemonSearch.addEventListener('input', () => {
        const match = form.elements.pokemonSearch.value.match(/\(#(\d+)\)$/); const item = match && catalog().find(entry => Number(entry.id) === Number(match[1]));
        form.elements.pokemonId.value = item ? item.id : '';
        form.querySelector('.lc-admin-pokemon-meta').textContent = item ? `${(typeof getPokemonTypes === 'function' ? getPokemonTypes(item)[0] : item.type || item.pokemon_type || 'normal')} type · ${rarityLabel(item.rarity)} Poké Ball` : 'Choose a Pokémon to see its type and rarity.';
      });
      panel.querySelector('form').addEventListener('submit', event => { event.preventDefault(); saveChallengeConfig(event.currentTarget); });
    }
    if (panel.parentElement !== host) host.appendChild(panel);
    const setting = challengeSetting(); const active = activeChallenge(); const form = panel.querySelector('form');
    if (!form.dataset.loaded) {
      if (setting) {
        const item = catalog().find(entry => Number(entry.id) === Number(setting.challenge_pokemon_id));
        form.elements.title.value = setting.challenge_title || ''; form.elements.pokemonId.value = item?.id || '';
        form.elements.pokemonSearch.value = item ? `${item.name} (#${item.id})` : '';
        form.elements.maxThrows.value = Math.max(2, Number(setting.challenge_max_throws ?? setting.challenge_goal) || DEFAULT_GUARANTEED_THROWS); form.elements.start.value = challengeStartValue(setting) || dateInput(weekStart());
        form.elements.pokemonSearch.dispatchEvent(new Event('input', { bubbles: true }));
      }
      else { form.elements.title.value = ''; form.elements.pokemonId.value = ''; form.elements.pokemonSearch.value = ''; form.elements.maxThrows.value = DEFAULT_GUARANTEED_THROWS; form.elements.start.value = dateInput(weekStart()); }
      form.dataset.loaded = 'true';
    }
    const status = panel.querySelector('.lc-admin-status');
    status.textContent = setting ? '' : 'No challenge is posted. Set this week’s challenge to get students started.';
    let posted = panel.querySelector('.lc-admin-posted');
    if (!posted) { posted = document.createElement('section'); posted.className = 'lc-admin-posted'; panel.appendChild(posted); posted.addEventListener('click', e => { if (e.target.closest('[data-lc-delete]')) deleteChallenge(); }); }
    if (!setting) { posted.innerHTML = ''; return; }
    const id = String(setting.challenge_id || `week-${challengeDate(setting.challenge_start) ? dateInput(challengeDate(setting.challenge_start)) : setting.challenge_start}`);
    const done = []; const participants = [];
    (typeof allData === 'undefined' ? [] : allData).filter(r => r.type === 'listen_catch_progress').forEach(r => {
      const state = parseProgress(r); const rec = (typeof getStudentRecordByStableId === 'function' && getStudentRecordByStableId(r.student_id)) || r; const name = rec.student_name || r.student_name || 'Student';
      const cls = [rec.school_name || r.school_name, rec.class_name || r.class_name].filter(Boolean).join(' · ');
      const playerChallenge = challenge(state);
      if (hasClaimedChallenge(state, id) || playerChallenge.claimed) done.push({ name, cls });
      else if (active && playerChallenge.throws > 0) participants.push({ name, cls, throws: playerChallenge.throws });
    });
    const row = (s, tag) => `<li><b>${esc(s.name)}</b><span>${esc(s.cls)}</span><em>${tag}</em></li>`;
    const crit = setting.challenge_pokemon_name || catalog().find(item => Number(item.id) === Number(setting.challenge_pokemon_id))?.name || challengeCriteria({ type: setting.challenge_type, tier: setting.challenge_tier });
    const maxThrows = Number(setting.challenge_max_throws ?? setting.challenge_goal) || DEFAULT_GUARANTEED_THROWS;
    posted.innerHTML = `<header><div><span>${active ? 'LIVE NOW' : 'POSTED CHALLENGE'}</span><h4>${esc(setting.challenge_title || 'Weekly Catchdex Challenge')}</h4><p>Catch ${esc(crit)} · ${rarityLabel(setting.challenge_tier).toLowerCase()} balls only · ${maxThrows} throws maximum · starts ${esc(setting.challenge_start)}</p></div><button type="button" class="lc-admin-delete" data-lc-delete>Delete challenge</button></header>${(() => { const w = challengeWinner(setting.challenge_id || activeChallenge()?.id); return w ? `<p class="lc-admin-winner">🏆 Won by <strong>${esc(w.student_name)}</strong>${w.class_name ? ` (${esc(w.class_name)})` : ''}</p>` : ''; })()}<h5>Caught (${done.length})</h5>${done.length || participants.length ? `<ul>${done.map(s => row(s, 'Pokémon caught')).join('')}${participants.map(s => row(s, `${s.throws}/${maxThrows} throws`)).join('')}</ul>` : '<p class="lc-admin-empty">Students can use matching rarity Catch Balls to try the challenge.</p>'}${winnerRows().length ? `<h5>Hall of Fame</h5><ul class="lc-hall">${winnerRows().slice().sort((a, b) => String(b.won_at || '').localeCompare(String(a.won_at || ''))).map(w => `<li><img src="${art(w.pokemon_id)}" alt=""><span><b>${esc(w.student_name)}</b> caught ${esc(w.pokemon_name)}</span><small>${esc(String(w.won_at || '').slice(0, 10))}</small></li>`).join('')}</ul>` : ''}`;
  }
  async function deleteChallenge() {
    const setting = challengeSetting(); if (!setting || !canAccessAdmin()) return;
    if (!confirm('Delete this challenge? You can then post a new one.')) return;
    let result; try { result = await window.dataSdk.delete(setting); } catch (_) { result = null; }
    if (!result?.isOk) return toast('Challenge could not be deleted. Try again.');
    allData = allData.filter(r => r !== setting && r.type !== 'listen_catch_challenge');
    const form = document.querySelector('#listen-catch-admin form'); if (form) { form.reset(); form.elements.maxThrows.value = DEFAULT_GUARANTEED_THROWS; form.elements.start.value = dateInput(weekStart()); }
    toast('Challenge deleted. You can post a new one.'); renderAdminChallenge(); mountCards();
  }
  function refreshViewer(record) {
    const modal = document.getElementById('catchdex-modal');
    if (modal && !modal.classList.contains('hidden')) renderCatchdexModal(record, true);
    const root = document.getElementById('profile-catchdex-root'); if (root) root.dataset.catchdexSig = '';
  }
  function closeGame() { session?.root?.remove(); session = null; activeStudent = null; }
  function speak(word) {
    window.speechSynthesis?.cancel();
    if (typeof window.readNaturalVocabulary === 'function') window.readNaturalVocabulary(word, null, { level: window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P4' });
    else { const level = window.getClassReadingLevel?.(student()?.school_name, student()?.class_name) || 'P4'; const rates = { P4: .92, P5: 1, P6: 1.08 }; const utterance = new SpeechSynthesisUtterance(word); utterance.rate = rates[level] || .92; window.speechSynthesis?.speak(utterance); }
  }
  function gameWords(listName) {
    // A previous teacher session can leave the global list source set to
    // "my_lists". Students must always resolve vocabulary from their class.
    if (currentRole === 'student' && typeof selectedGameSource !== 'undefined') selectedGameSource = 'class';
    let words = [];
    const refs = Array.isArray(listName) ? listName : listName ? [listName] : [];
    const scopedRefs = currentRole === 'student' && refs.length && refs.every(ref => ref && typeof ref === 'object' && ref.school_name && ref.class_name);
    if (scopedRefs) {
      const groups = new Map();
      refs.forEach(ref => {
        const key = `${ref.school_name}||${ref.class_name}`;
        if (!groups.has(key)) groups.set(key, { school: ref.school_name, className: ref.class_name, refs: [] });
        groups.get(key).refs.push(ref);
      });
      const previousSchool = navSchool; const previousClass = navClass;
      try {
        groups.forEach(group => {
          navSchool = group.school; navClass = group.className;
          words.push(...getGameWords(group.refs, false));
        });
      } finally { navSchool = previousSchool; navClass = previousClass; }
    } else words = getGameWords(listName, false);
    const uniqueWords = new Map();
    words.filter(word => String(word.vocab_word || '').trim()).forEach(word => {
      const key = String(word.vocab_word).trim().toLocaleLowerCase();
      if (!uniqueWords.has(key)) uniqueWords.set(key, word);
    });
    return shuffle([...uniqueWords.values()]).slice(0, ROUNDS);
  }
  function studentClassListRefs(record, includeAllClasses = false) {
    const enrolled = typeof getStudentEnrolledClasses === 'function' ? getStudentEnrolledClasses() : [];
    const primaryKey = `${record?.school_name || ''}||${record?.class_name || ''}`;
    const selectedKey = String(selectedStudentGamesClassKey || primaryKey);
    const selected = enrolled.find(item => `${item.school_name}||${item.class_name}` === selectedKey)
      || enrolled.find(item => `${item.school_name}||${item.class_name}` === primaryKey)
      || enrolled[0];
    const classes = includeAllClasses && typeof selectedStudentGamesScope !== 'undefined' && selectedStudentGamesScope === 'all'
      ? enrolled : selected ? [selected] : [];
    const refs = classes.flatMap(item => getVocabLists(item.school_name, item.class_name).map(list => ({
      vocab_list_id: list.vocab_list_id || list.__backendId,
      vocab_list_name: list.vocab_list_name,
      school_name: item.school_name,
      class_name: item.class_name,
    })));
    if (selected?.school_name && selected?.class_name) { navSchool = selected.school_name; navClass = selected.class_name; }
    return refs;
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
    const record = student(); const state = stateFor(record);
    const today = localDayKey(); const alreadyEarned = state.dailyBallDate === today ? Math.min(DAILY_BALL_LIMIT, Number(state.dailyBallsEarned) || 0) : 0;
    const awarded = Math.min(session.correct, DAILY_BALL_LIMIT - alreadyEarned);
    addEarnedBalls(state, awarded); state.dailyBallDate = today; state.dailyBallsEarned = alreadyEarned + awarded; await save(record, state);
    session.earned = awarded;
    session.root.querySelector('.lc-play').innerHTML = `<section class="lc-result"><div class="lc-result-ball">◓</div><h2>${awarded ? `${awarded} Catch Ball${awarded === 1 ? '' : 's'} earned!` : 'Keep listening — you will catch the next one.'}</h2><p>${awarded ? 'Each ball has a rarity tier. Match its tier to the featured Pokémon in a Catchdex challenge.' : ''} ${awarded < session.correct ? `Daily limit reached. You have earned ${state.dailyBallsEarned} of ${DAILY_BALL_LIMIT} balls today. ` : ''}Open your balls now, or find them later in your Catchdex.</p><div class="lc-result-actions"><button type="button" class="lc-primary" data-lc="open">Open Catchdex</button><button type="button" class="lc-secondary" data-lc="close">Back to games</button></div></section>`;
    mountCards();
  }
  function launchForStudent(listName, record) {
    if (currentRole === 'student') {
      const selectedLists = Array.isArray(listName) ? listName.filter(Boolean) : listName ? [listName] : [];
      let classLists = studentClassListRefs(record, !selectedLists.length);
      listName = selectedLists.length ? selectedLists : classLists;
      let selectedWords = gameWords(listName);
      if (selectedWords.length < 2 && selectedLists.length) {
        classLists = studentClassListRefs(record, true);
        listName = classLists;
        selectedWords = gameWords(listName);
      }
      if (selectedWords.length < 2 && !selectedLists.length && typeof selectedStudentGamesScope !== 'undefined' && selectedStudentGamesScope !== 'all') {
        listName = studentClassListRefs(record, true);
        selectedWords = gameWords(listName);
      }
      if (selectedWords.length < 2) {
        window.__listenCatchDiagnostics = { role: currentRole, selectedListCount: selectedLists.length, classListCount: classLists.length, loadedWords: selectedWords.length, school: navSchool || '', className: navClass || '' };
        return toast('Listen and Catch needs at least 2 words in your selected lists or class lists. Ask your teacher to add vocabulary.');
      }
      return launchGame(listName, selectedWords, record);
    }
    const words = gameWords(listName);
    if (words.length < 2) return toast('This list needs at least two words.');
    return launchGame(listName, words, record);
  }
  function launchGame(listName, words, record) {
    closeGame();
    const root = document.createElement('div'); root.className = 'lc-stage'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Listen and Catch');
    const saved = stateFor(record); const dailyEarnedBefore = ballsEarnedToday(saved); const dailyAllowance = Math.max(0, DAILY_BALL_LIMIT - dailyEarnedBefore);
    const dailyBefore = ballsEarnedToday(saved);
    const dailyAtLimit = dailyBefore >= DAILY_BALL_LIMIT;
    root.innerHTML = `<main class="lc-play"><header class="lc-head"><div><span>LISTENING QUEST</span><h1>Listen and Catch</h1></div><div class="lc-hud"><b class="lc-round">1 / ${words.length}</b><button type="button" data-lc="close" aria-label="Close game">×</button></div></header><section class="lc-main"><button type="button" class="lc-listen" data-lc="listen"><span aria-hidden="true">🔊</span><span class="lc-listen-label">Hear the sentence</span></button><p class="lc-prompt" aria-live="polite"></p><div class="lc-options"></div><section class="lc-reward-panel" aria-label="Catch Balls earned during this game"><div class="lc-reward-icon"><img src="/pokeayman/assets/catch-ball.png" alt=""></div><div class="lc-reward-copy"><span>ROUND REWARDS</span><strong><b class="lc-balls">0</b> Catch Balls this game</strong><div class="lc-reward-track"><i class="lc-reward-fill"></i></div><small class="lc-reward-status">0 of ${words.length} rounds rewarded</small><small class="lc-daily-cap${dailyAtLimit ? ' is-limit' : ''}">${dailyAtLimit ? `Daily limit reached (${dailyBefore}/${DAILY_BALL_LIMIT}). Come back tomorrow for more Catch Balls.` : `Today: ${dailyBefore} / ${DAILY_BALL_LIMIT} Catch Balls`}</small></div></section></section></main>`;
    const gameMain = root.querySelector('.lc-main');
    const rewardPanel = gameMain?.querySelector('.lc-reward-panel');
    if (gameMain && rewardPanel) gameMain.insertBefore(rewardPanel, gameMain.firstChild);
    document.body.appendChild(root); activeStudent = record; session = { root, listName, words, index: 0, earned: 0, correct: 0, dailyAllowance, dailyEarnedBefore, options: [], student: record };
    root.addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.lc === 'close') closeGame(); else if (button.dataset.lc === 'listen') { const word = session.words[session.index]; speak(String(word.vocab_sentence || word.vocab_word)); } else if (button.dataset.lc === 'open') { const playedStudent = session.student; closeGame(); if (currentRole === 'student') window.openCatchdex(); else window.openCatchdexFor?.(playedStudent, true); } else if (button.dataset.choice !== undefined) answer(Number(button.dataset.choice)); });
    window.__listenCatchDiagnostics = { role: currentRole, selectedListCount: Array.isArray(listName) ? listName.length : 1, loadedWords: words.length, school: record.school_name || '', className: record.class_name || '', launched: true };
    startRound();
  }
  function chooseStudent(listName) {
    const school = typeof navSchool !== 'undefined' ? navSchool : '';
    const className = typeof navClass !== 'undefined' ? navClass : '';
    const roster = school && className && typeof getStudents === 'function' ? getStudents(school, className).filter(record => record.student_name) : [];
    if (!roster.length) return toast('Open a class first to choose a student for Listen and Catch.');
    const picker = document.createElement('div'); picker.className = 'lc-stage'; picker.setAttribute('role', 'dialog'); picker.setAttribute('aria-modal', 'true'); picker.setAttribute('aria-label', 'Choose student');
    picker.innerHTML = `<section class="lc-picker"><header><div><span>CLASS GAME</span><h2>Who is catching?</h2></div><button type="button" data-lcpick="close" aria-label="Close">×</button></header><p>Catch Ball rewards and Pokémon collection progress will be saved to their account.</p><div class="lc-roster">${roster.map((record,index)=>`<button type="button" data-lcpick="${index}">${esc(record.student_name)}</button>`).join('')}</div></section>`;
    document.body.appendChild(picker);
    picker.addEventListener('click', event => { const button=event.target.closest('[data-lcpick]');if(!button)return;const choice=button.dataset.lcpick;picker.remove();if(choice==='close')return;const record=roster[Number(choice)];launchForStudent(listName,{...record,school_name:record.school_name||school,class_name:record.class_name||className}); });
  }
  window.startListenCatch = function (listName) {
    if (typeof window.canUseProGames === 'function' && !window.canUseProGames()) { window.requireProGame?.('Listen and Catch'); return; }
    if (currentRole === 'student') {
      const record = typeof getCurrentStudentRecord === 'function' ? getCurrentStudentRecord() : null;
      if (!record) return toast('Signed-in student was not found.');
      try { return launchForStudent(listName, record); }
      catch (error) { console.error('Listen and Catch could not start:', error); window.__listenCatchDiagnostics = { role: currentRole, error: String(error?.message || error), launched: false }; return toast('Listen and Catch could not start. Refresh the page and try again.'); }
    }
    if (currentRole === 'teacher') return chooseStudent(listName);
    toast('Sign in as a student or teacher to play.');
  };
  function catchdexCard(state, compact = false) {
    const goal = challenge(state);
    return `<section class="catchdex-card ${compact ? 'catchdex-compact' : ''}"><div class="catchdex-copy"><span class="catchdex-kicker">LISTEN AND CATCH</span><h3>Catchdex</h3><p>${state.balls} Catch Ball${state.balls === 1 ? '' : 's'} ready · four rarity tiers</p></div><div class="catchdex-goal"><b>${goal.throws} / ${goal.guaranteedThrows}</b><span>${goal.active ? `${goal.pokemonName || challengeCriteria(goal)} · ${rarityLabel(goal.tier)} balls` : 'weekly challenge inactive'}</span></div><button type="button" data-catchdex-profile>View Catchdex</button></section>`;
  }
  function mountCards() {
    const state = stateFor(student());
    document.getElementById('catchdex-dashboard-card')?.remove();
    const tabRoot = document.getElementById('student-catchdex-root');
    if (currentRole === 'student' && tabRoot) renderCatchdexTab();
    const profile = typeof profileStudent !== 'undefined' ? profileStudent : null;
    document.getElementById('catchdex-profile-card')?.remove();
    const profileRoot = document.getElementById('profile-catchdex-root');
    if (profile && profileRoot) {
      const profileState = stateFor(profile); const profileGoal = challenge(profileState);
      const sig = `${identity(profile)}:${profileState.balls}:${profileState.mysteryBoxes}:${profileGoal.id}:${profileGoal.title}:${profileGoal.start}:${profileGoal.end}:${profileGoal.type}:${profileGoal.tier}:${profileGoal.pokemonId}:${profileGoal.guaranteedThrows}:${profileGoal.throws}:${profileGoal.claimed}`;
      if (profileRoot.dataset.catchdexSig !== sig) {
        catchdexViewer = { record: profile, readOnly: true };
        profileRoot.innerHTML = `<section class="catchdex-tab-card">${renderCatchdexContents(profile, true).replace('<button type="button" data-catchdex="close" aria-label="Close Catchdex">×</button>', '')}</section>`;
        profileRoot.dataset.catchdexSig = sig; bindCatchdexContents(profileRoot, profile, true);
      }
    }
  }
  function renderCatchdexContents(record, readOnly) {
    const state = stateFor(record); const goal = challenge(state);
    scheduleLegacyCatchdexConversion(record);
    const progress = Math.min(goal.throws, goal.guaranteedThrows);
    const pct = goal.guaranteedThrows ? Math.min(100, progress / goal.guaranteedThrows * 100) : 0;
    const typeName = goal.types.length ? goal.types[0] : 'any';
    const challengeMarkup = goal.active
      ? `<section class="cdx-challenge cdx-type-challenge cdx-tier-${esc(goal.tier)}${goal.claimed ? ' is-claimed' : ''}" aria-labelledby="cdx-challenge-title">
          <div class="cdx-challenge-top"><div><span class="cdx-eyebrow">${goal.claimed ? 'CHALLENGE COMPLETE' : 'ACTIVE CATCH CHALLENGE'}</span><h3 id="cdx-challenge-title">${esc(goal.title)}</h3><div class="cdx-challenge-tags"${goal.winner ? ' hidden' : ''}><span class="cdx-tag">${esc(goal.types.length ? goal.types.join(' / ') : 'Any')} type</span><span class="cdx-tag cdx-tag-ball cdx-tier-${esc(goal.tier)}"><img src="${ballArt(goal.tier)}" alt="">${esc(rarityLabel(goal.tier))} ball</span></div></div><figure class="cdx-reward cdx-reward-${esc(goal.tier)}">${goal.pokemonId ? `<img src="${art(goal.pokemonId)}" alt="${esc(goal.pokemonName)}">` : `<img src="${ballArt(goal.tier)}" alt="">`}<figcaption>Reward: ${esc(goal.pokemonName || 'Mystery Pokémon')}<small>${esc(rarityLabel(goal.tier))} tier</small></figcaption></figure></div>
          ${goal.winner ? `<div class="cdx-caught-celebration" role="status"><span class="cdx-caught-confetti" aria-hidden="true">${Array.from({length:14},(_,k)=>`<i style="--i:${k}"></i>`).join('')}</span><span class="cdx-caught-kicker">🎉 GOTCHA! 🎉</span><strong>${esc(goal.winner.pokemon_name || goal.pokemonName || 'Pokémon')} was caught by</strong><b class="cdx-caught-name">${goal.claimed ? 'You!' : esc(goal.winner.student_name || 'a student')}</b>${goal.winner.class_name && !goal.claimed ? `<small>from ${esc(goal.winner.class_name)}</small>` : ''}</div>` : `
          <div class="cdx-progress-row"><div class="cdx-progress-label"><b>${progress}<span> / ${goal.guaranteedThrows} throws</span></b><span>${Math.max(0, goal.guaranteedThrows - goal.throws)} throws until guaranteed</span></div><div class="cdx-progress-track" role="progressbar" aria-label="${esc(goal.title)} throws until guaranteed catch" aria-valuemin="0" aria-valuemax="${goal.guaranteedThrows}" aria-valuenow="${progress}"><span style="width:${pct}%"></span></div></div>
          <div class="cdx-challenge-foot"><small>${goal.end ? `Challenge ends ${esc(goal.end)}` : 'Limited-time challenge'} · ${goal.ballCount} matching balls available</small></div>
          ${goal.ballCount ? '<p class="cdx-hint">Choose the matching ball below to throw at this Pokémon.</p>' : `<p class="cdx-hint">No ${esc(rarityLabel(goal.tier).toLowerCase())} balls available. Listen and Catch rewards balls of different rarity tiers.</p>`}`}
        </section>`
      : '<section class="cdx-challenge is-inactive"><span class="cdx-challenge-mark" aria-hidden="true">🗓️</span><div><span class="cdx-eyebrow">WEEKLY CHALLENGE</span><h3>No active challenge</h3><p>Your next Catchdex challenge will appear here when the admin schedules it.</p></div></section>';
    return `<div class="cdx-view">
      <header class="cdx-header"><div><span class="cdx-eyebrow">CATCHDEX CHALLENGE</span><h2>${readOnly ? `${esc(record?.student_name || 'Student')}'s Catchdex` : 'Catchdex'}</h2><p>Use matching rarity balls to catch the featured Pokémon.</p></div>${readOnly ? '<button type="button" class="cdx-close" data-catchdex="close" aria-label="Close Catchdex">×</button>' : ''}</header>
      <section class="cdx-wallet" aria-label="Catchdex inventory">
        ${BALL_TIERS.map(tier => { const matches = goal.active && !goal.winner && goal.tier === tier; return `<article class="cdx-stat cdx-tier-stat cdx-tier-${tier}${matches ? ' is-challenge-tier' : (goal.active && !goal.winner ? ' is-dimmed' : '')}"><span class="cdx-stat-icon"><img src="${ballArt(tier)}" alt=""></span><div><span class="cdx-stat-label">${esc(rarityLabel(tier).toUpperCase())} BALLS</span><b>${ballCount(state, tier)}</b><small>${matches ? `Throw at ${esc(goal.pokemonName || 'Pokémon')}` : goal.active && !goal.winner ? "Can't be thrown" : 'Ready for a challenge'}</small></div>${matches && ballCount(state, tier) ? `<button type="button" class="cdx-button is-gold" data-catchdex="throw" aria-label="Throw a ${esc(rarityLabel(tier))} ball at ${esc(goal.pokemonName || 'Pokémon')}">Throw ball</button>` : ''}</article>`; }).join('')}
        ${state.mysteryBoxes ? `<article class="cdx-stat is-box"><span class="cdx-stat-icon" aria-hidden="true">🎁</span><div><span class="cdx-stat-label">MYSTERY BOXES</span><b>${state.mysteryBoxes}</b><small>Ready to open</small></div><button type="button" class="cdx-button is-gold" data-catchdex="boxes">Open box</button></article>` : ''}
      </section>
      ${challengeMarkup}
      ${readOnly && currentRole === 'teacher' ? `<section class="cdx-award" aria-label="Award Catch Balls"><h3>Award Catch Balls</h3><div>${BALL_TIERS.map(tier => `<button type="button" class="cdx-award-btn cdx-tier-${tier}" data-award-ball="${tier}"><img src="${ballArt(tier)}" alt=""><span>${rarityLabel(tier)}</span><small>${BALL_AWARD_PRICES[tier]} credits</small></button>`).join('')}</div></section>` : ''}
    </div>`;
  }
  function bindCatchdexContents(root, record, readOnly) {
    root.querySelector('[data-catchdex="close"]')?.addEventListener('click', () => document.getElementById('catchdex-modal')?.classList.add('hidden'));
    root.querySelectorAll('[data-catchdex="throw"]').forEach(button => button.addEventListener('click', () => throwChallengeBall(record)));
    root.querySelectorAll('[data-award-ball]').forEach(button => button.addEventListener('click', () => awardBall(record, button.dataset.awardBall)));
    root.querySelector('[data-catchdex="boxes"]')?.addEventListener('click', () => showBoxCountPopup(record));
  }
  function renderProfileCatchdex(record = typeof profileStudent !== 'undefined' ? profileStudent : null) {
    const root = document.getElementById('profile-catchdex-root');
    if (!root || !record) return;
    try {
      catchdexViewer = { record, readOnly: true };
      root.innerHTML = `<section class="catchdex-tab-card">${renderCatchdexContents(record, true).replace('<button type="button" class="cdx-close" data-catchdex="close" aria-label="Close Catchdex">×</button>', '')}</section>`;
      const state = stateFor(record); const goal = challenge(state);
      root.dataset.catchdexSig = `${identity(record)}:${state.balls}:${state.mysteryBoxes}:${goal.id}:${goal.throws}`;
      bindCatchdexContents(root, record, true);
    } catch (error) {
      console.error('Student profile Catchdex could not render:', error);
      root.innerHTML = '<section class="catchdex-tab-card"><div class="cdx-empty" role="alert"><b>This Catchdex could not load</b><p>Return to the roster and reopen this student profile to try again.</p></div></section>';
    }
  }
  function renderCatchdexTab() {
    const root = document.getElementById('student-catchdex-root'); const record = student(); if (!root) return;
    if (!record) {
      root.innerHTML = `<section class="catchdex-tab-card"><div class="cdx-empty"><b>${typeof currentStudentLoading !== 'undefined' && currentStudentLoading ? 'Loading your Catchdex…' : 'Student profile unavailable'}</b><p>${typeof currentStudentLoading !== 'undefined' && currentStudentLoading ? 'Your saved collection will appear here in a moment.' : 'Sign in again to load your Pokémon collection.'}</p></div></section>`;
      root.dataset.catchdexSig = '';
      return;
    }
    try {
      const state = stateFor(record); const goal = challenge(state);
      root.innerHTML = `<section class="catchdex-tab-card">${renderCatchdexContents(record, false)}</section>`;
      root.dataset.catchdexSig = `${identity(record)}:${state.balls}:${state.mysteryBoxes}:${goal.id}:${goal.throws}`;
      bindCatchdexContents(root, record, false);
    } catch (error) {
      console.error('Catchdex could not render:', error);
      root.dataset.catchdexSig = '';
      root.innerHTML = '<section class="catchdex-tab-card"><div class="cdx-empty" role="alert"><b>Your Catchdex could not load</b><p>Refresh the page to reconnect your student profile and Pokémon collection.</p></div></section>';
    }
  }
  function renderCatchdexModal(record = catchdexViewer?.record || student(), readOnly = Boolean(catchdexViewer?.readOnly)) {
    const modal = document.getElementById('catchdex-modal'); if (!modal) return;
    modal.innerHTML = `<div class="catchdex-modal-card">${renderCatchdexContents(record, readOnly)}</div>`;
    modal.classList.remove('hidden');
    bindCatchdexContents(modal, record, readOnly);
  }
  function showBoxCountPopup(record) {
    if (!canManageCatchdex(record)) return;
    const count = stateFor(record).mysteryBoxes;
    if (!count) return toast('No Mystery Boxes to open yet. Claim a completed challenge first.');
    document.getElementById('lc-box-inventory')?.remove();
    const overlay = document.createElement('div'); overlay.id = 'lc-box-inventory'; overlay.className = 'lc-box-inventory'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Mystery Box inventory');
    overlay.innerHTML = `<section class="lc-box-inventory-card"><button type="button" class="lc-mystery-close" data-box-close aria-label="Close">×</button><span class="lc-mystery-kicker">CATCHDEX REWARDS</span><h2>${esc(record.student_name || 'Student')} has ${count} Mystery Box${count === 1 ? '' : 'es'}</h2><p>Open one box to reveal a random Pokémon. Each box has a 2% rare and 0.25% legendary chance. If you already own the Pokémon, it becomes coins instead.</p><button type="button" class="lc-primary" data-box-open>Open one box</button></section>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', event => { if (event.target === overlay || event.target.closest('[data-box-close]')) close(); });
    overlay.querySelector('[data-box-open]').addEventListener('click', () => { close(); openMysteryBox(record); });
  }
  window.openCatchdex = function () { const tab = document.querySelector('.student-dashboard-tab[data-tab="catchdex"]'); if (currentRole === 'student' && tab) tab.click(); else if (catchdexViewer?.record) renderCatchdexModal(catchdexViewer.record, true); };
  window.openCatchdexFor = function (record, readOnly = true) { catchdexViewer = { record, readOnly }; let modal = document.getElementById('catchdex-modal'); if (!modal) { modal = document.createElement('div'); modal.id = 'catchdex-modal'; modal.className = 'catchdex-modal'; document.body.appendChild(modal); modal.addEventListener('click', event => { if (event.target === modal) modal.classList.add('hidden'); }); } renderCatchdexModal(record, readOnly); };
  window.listenCatchRefresh = mountCards;
  window.renderListenCatchTab = renderCatchdexTab;
  window.renderListenCatchProfile = renderProfileCatchdex;
  window.listenCatchAdminRefresh = renderAdminChallenge;
  document.addEventListener('DOMContentLoaded', () => { mountCards(); renderAdminChallenge(); });
})();
