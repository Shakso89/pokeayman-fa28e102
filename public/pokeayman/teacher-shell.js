/* Teacher 3-column shell: left sidebar + right utility rail. Drives the existing tabs/forms only. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const g = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };

  const CLASS_ITEMS = [
    ['students', '👩‍🎓', 'Class Roster'], ['quiz', '📝', 'Quizzes'], ['vocab', '📚', 'Vocabulary'],
    ['games', '🎁', 'Games'], ['battle', '⚔️', 'Battle Arena'],
  ];
  const ZONE_ITEMS = [
    ['schedule', '🗓️', 'Schedule'], ['financial', '💰', 'Financial'], ['history', '🕘', 'History'],
    ['vb-lists', '🔖', 'My Word Banks'], ['profile', '🎓', 'Trainer Card'],
  ];

  function build() {
    if ($('ts-sidebar')) return;
    const side = document.createElement('aside');
    side.id = 'ts-sidebar';
    side.setAttribute('aria-label', 'Teacher navigation');
    side.innerHTML = `
      <div class="ts-brand"><span class="ts-ball" aria-hidden="true"></span><span>PokéAyman<small>Academy</small></span></div>
      <button type="button" class="ts-switch" data-ts="schools"><span class="ts-switch-label">Current class</span><strong id="ts-current">Choose a class</strong><span aria-hidden="true">▾</span></button>
      <nav class="ts-nav">
        <p class="ts-head">Classroom</p>
        ${CLASS_ITEMS.map(([k, i, l]) => `<button type="button" class="ts-item" data-ts-class="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join('')}
        <div id="ts-zone"><p class="ts-head">Teacher Zone</p>
        ${ZONE_ITEMS.map(([k, i, l]) => `<button type="button" class="ts-item" data-ts-zone="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join('')}</div>
        <div id="ts-admin"><p class="ts-head">Admin Hub</p>
        <button type="button" class="ts-item" data-ts="admin"><span aria-hidden="true">⚙️</span>Admin Console</button>
        <button type="button" class="ts-item" data-ts="leaders"><span aria-hidden="true">🏆</span>Global Top 10</button></div>
      </nav>
      <div class="ts-me"><button type="button" class="ts-me-main" data-ts-zone="profile"><span id="ts-avatar" class="ts-avatar"></span><span class="ts-me-info"><strong id="ts-name"></strong><small id="ts-role"></small></span></button>
      <button type="button" class="ts-logout" data-ts="logout" aria-label="Log out" title="Log out">↪</button></div>`;
    const rail = document.createElement('aside');
    rail.id = 'ts-rail';
    rail.setAttribute('aria-label', 'Class tools');
    rail.innerHTML = `
      <section class="ts-card"><h3>⚡ Quick Award</h3><p>Give coins to a student instantly</p>
        <label class="sr-only" for="ts-award-student">Student</label><select id="ts-award-student"></select>
        <div class="ts-amounts">${[10, 50, 100].map((n) => `<button type="button" data-amt="${n}"${n === 10 ? ' class="on"' : ''}>+${n}</button>`).join('')}</div>
        <button type="button" class="ts-award-go" id="ts-award-go">Award coins</button></section>
      <section class="ts-card"><h3>🏆 Top 3 Students</h3><ol id="ts-top3" class="ts-top3"></ol></section>
      <section class="ts-card ts-gift"><h3>🎁 Surprise Boxes</h3><p>Launch a special box game for your class!</p>
        <button type="button" class="ts-award-go" data-ts-class="games">Launch game</button></section>`;
    document.body.append(side, rail);

    side.addEventListener('click', onNav);
    rail.addEventListener('click', onRail);
  }

  function needClass() {
    if (g(() => navClass, null)) return false;
    g(() => showMainTab('dashboard'));
    g(() => toast('Pick a class first'));
    return true;
  }

  function onNav(e) {
    const b = e.target.closest('button'); if (!b) return;
    const cls = b.dataset.tsClass, zone = b.dataset.tsZone, act = b.dataset.ts;
    if (cls) {
      if (needClass()) return;
      if (g(() => activeMainTab) !== 'dashboard') { const s = navSchool, c = navClass; showMainTab('dashboard'); navigateTo('students', s, c); }
      if ($('view-students')?.classList.contains('hidden')) navigateTo('students', navSchool, navClass);
      document.querySelector(`#class-tabs-container [data-classtab="${cls}"]`)?.click();
    } else if (zone) {
      g(() => showMainTab('teacher-zone'));
      $(`teacher-zone-${zone}-tab`)?.click();
    } else if (act === 'schools') { g(() => showMainTab('dashboard')); }
    else if (act === 'admin') { g(() => showMainTab('admin')); }
    else if (act === 'leaders') { $('global-leaderboard-trigger')?.click(); }
    else if (act === 'logout') { ($('header-logout') || $('logout-btn'))?.click(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(sync, 50);
  }

  let amount = 10;
  function onRail(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.amt) { amount = +b.dataset.amt; b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); return; }
    if (b.dataset.tsClass) return onNav(e);
    if (b.id === 'ts-award-go') {
      const sel = $('award-student'), amt = $('award-amount'), form = $('award-form');
      const pick = $('ts-award-student').value;
      if (!sel || !form || !pick) { g(() => toast('Pick a student first')); return; }
      sel.value = pick; amt.value = amount;
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }

  let lastOpts = '', lastTop = '';
  function sync() {
    const app = $('app-screen');
    const on = !!app && !app.classList.contains('hidden') && g(() => currentRole) === 'teacher';
    document.body.classList.toggle('ts-on', on);
    if (!on) return;
    build();
    const tab = g(() => activeMainTab, 'dashboard');
    const inClass = tab === 'dashboard' && !$('view-students')?.classList.contains('hidden') && g(() => navClass, null);
    document.body.classList.toggle('ts-rail-on', !!inClass);
    $('ts-current').textContent = g(() => navClass, null) ? `${navSchool} · ${navClass}` : 'Choose a class';

    const activeClassTab = document.querySelector('#class-tabs-container .class-view-tab[class*="-active"]:not([class*="inactive"])')?.dataset.classtab;
    const zoneTab = document.querySelector('.teacher-zone-tab[aria-selected="true"]')?.id?.replace(/^teacher-zone-|-tab$/g, '');
    document.querySelectorAll('#ts-sidebar .ts-item, #ts-sidebar .ts-switch').forEach((b) => {
      let a = false;
      if (b.dataset.tsClass) a = !!inClass && activeClassTab === b.dataset.tsClass;
      else if (b.dataset.tsZone) a = tab === 'teacher-zone' && zoneTab === b.dataset.tsZone;
      else if (b.dataset.ts === 'admin') a = tab === 'admin';
      else if (b.dataset.ts === 'schools') a = tab === 'dashboard' && !inClass;
      b.classList.toggle('active', a);
      if (b.dataset.tsClass) b.classList.toggle('dim', !g(() => navClass, null));
    });
    $('ts-zone').hidden = !g(() => canAccessTeacherZone(), false);
    $('ts-admin').querySelector('[data-ts="admin"]').hidden = !g(() => canAccessAdmin(), false);
    ['financial', 'history'].forEach((k) => {
      const src = $(`teacher-zone-${k}-tab`);
      const hide = !src || src.classList.contains('hidden') || src.style.display === 'none';
      document.querySelector(`[data-ts-zone="${k}"]`).hidden = hide;
    });

    $('ts-name').textContent = $('logged-in-name-nav')?.textContent || g(() => currentTeacher, '') || 'Teacher';
    $('ts-role').textContent = g(() => canAccessAdmin(), false) ? 'Admin' : ($('credit-balance-nav')?.textContent || 'Teacher');
    const av = $('teacher-account-avatar')?.innerHTML || '🎓';
    if ($('ts-avatar').innerHTML !== av) $('ts-avatar').innerHTML = av;

    if (inClass) {
      const src = $('award-student');
      const opts = src ? src.innerHTML : '';
      if (opts !== lastOpts) { const keep = $('ts-award-student').value; $('ts-award-student').innerHTML = opts; if (keep) $('ts-award-student').value = keep; lastOpts = opts; }
      const list = g(() => getStudents(navSchool, navClass), []).slice().sort((a, b) => (Number(b.coins) || 0) - (Number(a.coins) || 0)).slice(0, 3);
      const html = list.map((s, i) => `<li class="m${i + 1}"><span class="ts-medal">${i + 1}</span><span><strong>${esc(s.student_name)}</strong><small>🪙 ${Number(s.coins || 0).toLocaleString()} coins</small></span></li>`).join('') || '<li class="ts-empty">No students yet</li>';
      if (html !== lastTop) { $('ts-top3').innerHTML = html; lastTop = html; }
    }
  }

  function start() { sync(); setInterval(sync, 700); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
