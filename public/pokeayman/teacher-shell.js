/* Teacher 3-column shell: left sidebar + right utility rail. Drives the existing tabs/forms only. */
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const g = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };
  let bright = g(() => localStorage.getItem('pokeayman-teacher-theme') === 'bright', false);
  let collapsed = g(() => localStorage.getItem('pokeayman-sidebar-collapsed') === '1', false);
  let failedAvatarSrc = '';
  function applySidebar() {
    document.body.classList.toggle('ts-collapsed', collapsed);
    const control = $('ts-sidebar-toggle');
    if (control) { control.textContent = collapsed ? '☰' : '‹'; control.setAttribute('aria-expanded', String(!collapsed)); control.setAttribute('aria-label', collapsed ? 'Open sidebar' : 'Collapse sidebar'); control.title = control.getAttribute('aria-label'); }
    if ($('ts-sidebar')) $('ts-sidebar').inert = collapsed && !window.matchMedia('(max-width: 1024px)').matches;
  }
  function applyTheme() {
    document.body.classList.toggle('ts-bright', bright);
    document.documentElement.setAttribute('data-theme', bright ? 'light' : 'dark');
    const toggle = $('ts-theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(bright));
      toggle.setAttribute('aria-label', bright ? 'Switch to dark mode' : 'Switch to bright mode');
      toggle.title = bright ? 'Switch to dark mode' : 'Switch to bright mode';
      toggle.querySelector('.ts-theme-icon').textContent = bright ? '☀' : '☾';
    }
    const mobileToggle = document.querySelector('#ts-bottom [data-tsb="theme"]');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-checked', String(bright));
      mobileToggle.setAttribute('aria-label', bright ? 'Switch to dark mode' : 'Switch to bright mode');
      mobileToggle.title = bright ? 'Switch to dark mode' : 'Switch to bright mode';
      mobileToggle.querySelector('.tsb-ic').textContent = bright ? '☀' : '☾';
      mobileToggle.querySelector('.tsb-l').textContent = bright ? 'Dark' : 'Bright';
    }
    const studentToggle = $('student-theme-toggle');
    if (studentToggle) {
      studentToggle.setAttribute('aria-checked', String(bright));
      studentToggle.setAttribute('aria-label', 'Bright mode');
      studentToggle.title = bright ? 'Switch to dark mode' : 'Switch to bright mode';
      studentToggle.querySelector('.student-theme-icon').textContent = bright ? '☀' : '☾';
      studentToggle.querySelector('.student-theme-label').textContent = bright ? 'Bright mode' : 'Dark mode';
    }
  }
  applyTheme();
  function setThemeMode(nextBright) {
    bright = Boolean(nextBright);
    g(() => localStorage.setItem('pokeayman-teacher-theme', bright ? 'bright' : 'dark'));
    applyTheme();
  }
  window.setPokeaymanThemeMode = setThemeMode;

  const CLASS_ITEMS = [
    ['students', '👩‍🎓', 'Class Roster'], ['quiz', '📝', 'Quizzes'], ['vocab', '📚', 'Vocabulary'],
    ['games', '🎁', 'Games'], ['battle', '⚔️', 'Battle Arena'],
  ];
  const ZONE_ITEMS = [
    ['schedule', '🗓️', 'Schedule'], ['financial', '💰', 'Financial'], ['history', '🕘', 'History'],
    ['vb-lists', '🔖', 'Word Bank'], ['battle-claims', '⚔️', 'Battle Claims'], ['leaders', '🏆', 'Global Top 10'], ['profile', '🎓', 'Teacher Card'],
  ];

  function build() {
    if ($('ts-sidebar')) return;
    const side = document.createElement('aside');
    side.id = 'ts-sidebar';
    side.setAttribute('aria-label', 'Teacher navigation');
    side.innerHTML = `
      <div class="ts-me"><button type="button" class="ts-me-main" data-ts-zone="profile" title="Open teacher profile"><span class="ts-avatar-wrap"><span id="ts-avatar" class="ts-avatar"><span class="ts-avatar-fallback" role="img" aria-label="Teacher avatar loading">🎓</span></span><span id="ts-account-badge" class="ts-account-badge" hidden></span></span><span class="ts-me-info"><strong id="ts-name"></strong><small id="ts-role"></small></span></button></div>
      <button type="button" class="ts-logout" data-ts="logout"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H4v14h5M14 8l4 4-4 4M8 12h12"/></svg><span>Log out</span></button>
      <div class="ts-switch-wrap"><button type="button" class="ts-switch" data-ts="switch" aria-haspopup="dialog" aria-expanded="false"><span class="ts-switch-label" id="ts-current-school">Schools &amp; classes</span><strong id="ts-current">Choose a class</strong><span aria-hidden="true">⇄</span></button></div>
      <nav class="ts-nav">
        <div id="ts-class"><button type="button" class="ts-section-toggle" data-ts-toggle="class" aria-expanded="true" aria-controls="ts-class-content"><span>Classroom</span><span class="ts-chevron" aria-hidden="true">›</span></button><div id="ts-class-content">
        ${CLASS_ITEMS.map(([k, i, l]) => `<button type="button" class="ts-item" data-ts-class="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join('')}</div></div>
        <div id="ts-zone"><button type="button" class="ts-section-toggle" data-ts-toggle="zone" aria-expanded="false" aria-controls="ts-zone-content"><span>Teacher Zone</span><span class="ts-chevron" aria-hidden="true">›</span></button><div id="ts-zone-content" hidden>
        ${ZONE_ITEMS.map(([k, i, l]) => `<button type="button" class="ts-item" data-ts-zone="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join('')}</div></div>
        <div id="ts-admin" hidden><button type="button" class="ts-section-toggle" data-ts-toggle="admin" aria-expanded="false" aria-controls="ts-admin-content"><span>Admin Hub</span><span class="ts-chevron" aria-hidden="true">›</span></button><div id="ts-admin-content" hidden>
        <button type="button" class="ts-item" data-ts="admin-users">Users</button><button type="button" class="ts-item" data-ts="admin-controls">Controls</button></div></div>
      </nav>
`;
    const rail = document.createElement('aside');
    rail.id = 'ts-rail';
    rail.setAttribute('aria-label', 'Class tools');
    rail.innerHTML = `
      <button type="button" class="ts-award-go ts-rail-add" id="ts-rail-add">＋ Add student</button>
      <section class="ts-card"><h3>Quick Award</h3><p>Give coins to a student instantly</p>
        <label class="sr-only" for="ts-award-student">Student</label><select id="ts-award-student"></select>
        <div class="ts-amounts">${[10, 50, 100].map((n) => `<button type="button" data-amt="${n}"${n === 10 ? ' class="on"' : ''}>+${n}</button>`).join('')}</div>
        <button type="button" class="ts-award-go" id="ts-award-go">Award coins</button></section>
      <section class="ts-card"><h3>🏆 Top 3 Students</h3><ol id="ts-top3" class="ts-top3"></ol></section>
      <section class="ts-card ts-gift ts-streak"><button type="button" class="ts-streak-close" data-ts-streak-close aria-label="Close login streak card" title="Close">×</button><h3>🔥 Login Streak</h3><p id="ts-streak-text">Log in 7 days in a row to unlock a Streak Box</p>
        <div class="ts-streak-dots" id="ts-streak-dots"></div>
        <button type="button" class="ts-award-go" id="ts-box-open">🎁 Open Streak Box</button></section>`;
    document.body.append(side, rail);
    rail.querySelector('[data-ts-streak-close]')?.addEventListener('click', () => {
      const streakCard = rail.querySelector('.ts-streak');
      if (streakCard) streakCard.hidden = true;
    });
    const sidebarToggle = document.createElement('button');
    sidebarToggle.id = 'ts-sidebar-toggle'; sidebarToggle.type = 'button'; sidebarToggle.setAttribute('aria-controls', 'ts-sidebar');
    sidebarToggle.addEventListener('click', () => { collapsed = !collapsed; g(() => localStorage.setItem('pokeayman-sidebar-collapsed', collapsed ? '1' : '0')); applySidebar(); });
    document.body.appendChild(sidebarToggle); applySidebar();
    const theme = document.createElement('button');
    theme.id = 'ts-theme-toggle';
    theme.type = 'button';
    theme.setAttribute('role', 'switch');
    theme.setAttribute('aria-label', 'Bright mode');
    theme.innerHTML = '<span class="ts-theme-icon" aria-hidden="true"></span><span>Bright mode</span><span class="ts-theme-track" aria-hidden="true"><span></span></span>';
    const tools = document.createElement('div');
    tools.id = 'ts-sidebar-tools'; tools.className = 'ts-sidebar-tools';
    const notifications = document.createElement('button');
    notifications.type = 'button'; notifications.id = 'ts-notifications-toggle';
    notifications.className = 'ts-notification-button'; notifications.dataset.ts = 'notifications';
    notifications.setAttribute('aria-label', 'Open notifications'); notifications.title = 'Notifications';
    notifications.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg><strong id="ts-notification-count" class="ts-notification-count" aria-live="polite" hidden>0</strong>';
    tools.append(side.querySelector('.ts-logout'), theme, notifications);
    side.insertBefore(tools, side.querySelector('.ts-switch-wrap'));
    theme.addEventListener('click', () => {
      setThemeMode(!bright);
    });
    applyTheme();
    const chooser = document.createElement('dialog');
    chooser.id = 'ts-chooser';
    chooser.setAttribute('aria-labelledby', 'ts-chooser-title');
    chooser.innerHTML = `<header class="ts-chooser-header"><div><h2 id="ts-chooser-title">Schools &amp; classes</h2><p id="ts-chooser-count"></p></div><button type="button" data-ts-close aria-label="Close class chooser">×</button></header>
      <div class="ts-chooser-filters"><label class="sr-only" for="ts-class-search">Search schools or classes</label><input id="ts-class-search" type="search" placeholder="Search schools or classes…" autocomplete="off"><label class="sr-only" for="ts-school-filter">School</label><select id="ts-school-filter"><option value="">All schools</option></select></div>
      <div id="ts-class-results" class="ts-class-results"></div><footer><button type="button" class="ts-pop-all" data-ts="schools">Manage schools &amp; classes →</button></footer>`;
    document.body.appendChild(chooser);
    chooser.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b?.hasAttribute('data-ts-close') || e.target === chooser) return closePop();
      if (b?.dataset.tsGo) { const [sc, cl] = JSON.parse(b.dataset.tsGo); closePop(); switchClass(sc, cl); sync(); }
      else if (b?.dataset.tsSchool) { closePop(); showMainTab('dashboard'); navigateTo('classes', b.dataset.tsSchool); sync(); }
      else if (b?.dataset.ts === 'schools') { closePop(); showMainTab('dashboard'); navigateTo('schools'); sync(); }
    });
    chooser.addEventListener('close', () => document.querySelector('.ts-switch')?.setAttribute('aria-expanded', 'false'));
    $('ts-class-search').addEventListener('input', renderClassChoices);
    $('ts-school-filter').addEventListener('change', renderClassChoices);

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
    if (b.dataset.tsToggle) {
      const panel = $(b.getAttribute('aria-controls'));
      const open = panel.hidden;
      document.querySelectorAll('#ts-sidebar [data-ts-toggle]').forEach((t) => { const p = $(t.getAttribute('aria-controls')); if (p) p.hidden = true; t.setAttribute('aria-expanded', 'false'); });
      panel.hidden = !open; b.setAttribute('aria-expanded', String(open)); return;
    }
    const cls = b.dataset.tsClass, zone = b.dataset.tsZone, act = b.dataset.ts;
    if (act === 'switch') return togglePop();
    if (act === 'notifications') { if (window.matchMedia('(max-width: 1024px)').matches) closeSheet(); g(() => window.openTeacherNotificationCenter?.()); return; }
    if (act === 'admin-users' || act === 'admin-controls') {
      if (!g(() => canAccessAdmin(), false)) return;
      g(() => showMainTab('admin'));
      document.querySelector(`.admin-sub-tab[data-subtab="${act === 'admin-users' ? 'users' : 'controls'}"]`)?.click();
    }
    if (cls) {
      if (needClass()) return;
      if (g(() => activeMainTab) !== 'dashboard') { const s = navSchool, c = navClass; showMainTab('dashboard'); navigateTo('students', s, c); }
      if ($('view-students')?.classList.contains('hidden')) navigateTo('students', navSchool, navClass);
      document.querySelector(`#class-tabs-container [data-classtab="${cls}"]`)?.click();
    } else if (zone === 'leaders') {
      g(() => showMainTab('teacher-zone'));
      $('global-leaderboard-trigger')?.click();
    } else if (zone) {
      const isVocabLists = zone === 'vb-lists';
      if (isVocabLists) window.vbListsMode = 'mine';
      g(() => showMainTab('teacher-zone'));
      $(`teacher-zone-${zone}-tab`)?.click();
      if (isVocabLists) g(() => renderTeacherOwnedVocabLists());
    } else if (act === 'schools') { g(() => showMainTab('dashboard')); }
    else if (act === 'admin') { g(() => showMainTab('admin')); }
    else if (act === 'leaders') { $('global-leaderboard-trigger')?.click(); }
    else if (act === 'logout') { ($('header-logout') || $('logout-btn'))?.click(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(sync, 50);
  }

  function myClasses() {
    const all = g(() => allData.filter((r) => r.type === 'class'), []);
    if (g(() => canAccessAdmin(), false)) return all;
    const me = g(() => currentTeacher, '');
    const ac = g(() => getAssignedClasses(me), []), as = g(() => getAssignedSchools(me), []).map((a) => a.assigned_school || a.school_name);
    return all.filter((c) => as.includes(c.school_name) || ac.some((a) => (a.assigned_school || a.school_name) === c.school_name && (a.assigned_class || a.class_name) === c.class_name) || [c.created_by, c.teacher_name, c.assigned_teacher].includes(me));
  }
  function togglePop() {
    const pop = $('ts-chooser'), btn = document.querySelector('.ts-switch');
    if (pop.open) return closePop();
    $('ts-class-search').value = '';
    $('ts-school-filter').innerHTML = '<option value="">All schools</option>' + [...new Set(myClasses().map((c) => c.school_name))].sort().map((sc) => `<option value="${esc(sc)}">${esc(sc)}</option>`).join('');
    renderClassChoices();
    pop.showModal(); btn.setAttribute('aria-expanded', 'true'); $('ts-class-search').focus();
  }
  function renderClassChoices() {
    const groups = {};
    const query = $('ts-class-search').value.trim().toLocaleLowerCase(), school = $('ts-school-filter').value;
    const seen = new Set();
    const classes = myClasses().filter((c) => { const key = JSON.stringify([c.school_name, c.class_name]); if (seen.has(key)) return false; seen.add(key); return true; });
    $('ts-chooser-count').textContent = `${new Set(classes.map((c) => c.school_name)).size} schools · ${classes.length} classes`;
    classes.filter((c) => (!school || c.school_name === school) && `${c.school_name} ${c.class_name}`.toLocaleLowerCase().includes(query)).forEach((c) => { (groups[c.school_name] = groups[c.school_name] || []).push(c); });
    const cur = `${g(() => navSchool, '')}|${g(() => navClass, '')}`;
    $('ts-class-results').innerHTML = Object.keys(groups).sort().map((sc) => `<section class="ts-school-group"><div class="ts-school-heading"><h3>${esc(sc)}</h3><button type="button" data-ts-school="${esc(sc)}" aria-label="Open ${esc(sc)} school">Open school →</button></div>` + groups[sc].sort((a, b) => a.class_name.localeCompare(b.class_name)).map((c) => {
      const n = g(() => getStudents(sc, c.class_name).length, 0);
      return `<button type="button" class="ts-pop-item${cur === sc + '|' + c.class_name ? ' on' : ''}" aria-pressed="${cur === sc + '|' + c.class_name}" data-ts-go='${esc(JSON.stringify([sc, c.class_name]))}'><span>${esc(c.class_name)}</span><small>${n} students ${cur === sc + '|' + c.class_name ? '✓' : '→'}</small></button>`;
    }).join('') + '</section>').join('') || '<p class="ts-empty">No matching classes</p>';
  }
  function closePop() { $('ts-chooser')?.close(); document.querySelector('.ts-switch')?.setAttribute('aria-expanded', 'false'); }
  function switchClass(sc, cl) {
    const keep = document.querySelector('#class-tabs-container .class-view-tab[class*="-active"]:not([class*="inactive"])')?.dataset.classtab || 'students';
    if (g(() => activeMainTab) !== 'dashboard') g(() => showMainTab('dashboard'));
    g(() => navigateTo('students', sc, cl));
    document.querySelector(`#class-tabs-container [data-classtab="${keep}"]`)?.click();
  }

  /* ---- Unified class stage: hero banner + quick +/-10 on cards ---- */
  function hero(list = g(() => getStudents(navSchool, navClass), [])) {
    const sub = $('class-subtab-students'); if (!sub) return;
    let h = $('ts-hero');
    if (!h) {
      h = document.createElement('section'); h.id = 'ts-hero'; h.className = 'ts-hero';
      h.innerHTML = `<div class="ts-hero-text"><h2 id="ts-hero-title"></h2><p id="ts-hero-school"></p>
        <div class="ts-chips"><span class="ts-chip"><b id="ts-hero-count">0</b><small>Students</small></span><span class="ts-chip"><b id="ts-hero-coins">0</b><small>Total coins</small></span><span class="ts-chip" id="ts-hero-teacher-chip" hidden><b id="ts-hero-teacher"></b><small>Teacher</small></span></div></div>
        <div class="ts-hero-actions"><button type="button" class="ts-btn ghost" data-hero="gift">Gift whole class</button><button type="button" class="ts-btn" data-hero="add">＋ Add student</button></div>`;
      sub.prepend(h);
      h.querySelectorAll('[data-hero]').forEach(button => button.addEventListener('click', onHero));
    }
    const set = (id, v) => { const el = $(id); if (el.textContent !== v) el.textContent = v; };
    set('ts-hero-title', g(() => navClass, '') || ''); set('ts-hero-school', g(() => navSchool, '') || '');
    set('ts-hero-count', String(list.length));
    { const names = g(() => window.getClassTeacherNames(navSchool, navClass), []) || []; const chip = $('ts-hero-teacher-chip'); if (chip) { chip.hidden = !names.length; const html = names.map(n => { const src = g(() => window.classTeacherAvatarFor(n), ''); return (src ? `<img class="class-teacher-avatar" src="${esc(src)}" alt="">` : '🎓 ') + 'TR. ' + esc(n); }).join(', '); const el = $('ts-hero-teacher'); if (el.innerHTML !== html) el.innerHTML = html; } }
    set('ts-hero-coins', list.reduce((a, s) => a + (Number(s.coins) || 0), 0).toLocaleString());
  }
  function onHero(e) {
    const b = e.target.closest('[data-hero],[data-ts-add-student]'); if (!b) return;
    if (b.dataset.tsAddStudent !== undefined) { e.preventDefault(); return openHeroActionDialog('add', b); }
    e.preventDefault();
    openHeroActionDialog(b.dataset.hero, b);
  }
  function openHeroActionDialog(action, trigger) {
    let dialog = $('ts-hero-action-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'ts-hero-action-dialog';
      dialog.className = 'ts-action-dialog';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => dialog._trigger?.focus({ preventScroll:true }));
      dialog.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        if (!form.reportValidity()) return;
        const targetId = form.dataset.action === 'add' ? 'add-student-form' : 'gift-all-form';
        const source = form.elements.namedItem('value');
        const target = $(form.dataset.action === 'add' ? 'new-student-name' : 'gift-all-amount');
        if (!target || !source) return;
        target.value = source.value.trim();
        dialog.close();
        submit($(targetId));
      });
    }
    const add = action === 'add';
    dialog._trigger = trigger;
    dialog.innerHTML = `<form class="ts-action-dialog-form" data-action="${add ? 'add' : 'gift'}">
      <header><div><p class="ts-action-kicker">${add ? 'CLASS ROSTER' : 'CLASS REWARD'}</p><h2>${add ? 'Add a student' : 'Gift the whole class'}</h2></div><button class="ts-action-close" type="button" aria-label="Close">×</button></header>
      <p class="ts-action-copy">${add ? 'Add a student to the currently selected class.' : 'Give the same number of coins to every student in this class.'}</p>
      <label for="ts-action-value">${add ? 'Student name' : 'Coins per student'}</label>
      <input id="ts-action-value" name="value" type="${add ? 'text' : 'number'}" ${add ? 'maxlength="80" autocomplete="off" placeholder="Student name" required' : 'min="1" max="1000" step="1" value="10" required'}>
      <footer><button type="button" class="ts-action-cancel">Cancel</button><button type="submit" class="ts-action-confirm">${add ? 'Add student' : 'Gift coins'}</button></footer>
    </form>`;
    dialog.querySelector('.ts-action-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.ts-action-cancel').addEventListener('click', () => dialog.close());
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[name="value"]').focus();
  }
  const submit = (f) => f && (f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
  function cardButtons() {
    document.querySelectorAll('#students-list > .trainer-student-card').forEach((card) => {
      if (card.querySelector('.ts-quick') || !card.querySelector('.student-roster-edit')) return;
      const q = document.createElement('div'); q.className = 'ts-quick';
      q.innerHTML = `<button type="button" class="minus" data-q="-10" aria-label="Take 10 coins">−10</button><button type="button" class="plus" data-q="10" aria-label="Give 10 coins">+10</button>`;
      card.appendChild(q);
    });
  }
  let busy = false;
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('.ts-quick button'); if (!b) return;
    e.stopPropagation(); if (busy) return;
    const card = b.closest('.trainer-student-card'), name = card.dataset.studentName && card.querySelector('.student-roster-name')?.textContent;
    busy = true;
    try {
      if (b.dataset.q === '10') {
        const sel = $('award-student'); sel.value = name; $('award-amount').value = 10; submit($('award-form'));
      } else {
        const latest = g(() => getStudentRecordByStableId(card.dataset.studentId), null); if (!latest) return;
        const optimistic = { ...latest, coins: Math.max(0, (Number(latest.coins) || 0) - 10) };
        allData = allData.map((r) => r.__backendId === latest.__backendId ? optimistic : r);
        g(() => renderStudentDashboard());
        g(() => playTransactionSound('deduction')); g(() => showStudentAwardCelebration(optimistic, -10));
        persistCanonicalStudentPatch(latest.__backendId, { coins: optimistic.coins }, 'Could not save.').then((saved) => {
          if (!saved) { allData = allData.map((r) => r.__backendId === latest.__backendId ? latest : r); g(() => renderStudentDashboard()); g(() => toast('Could not save the deduction.')); return; }
          logCredit('-10 coins', -10, saved.student_name);
        });
      }
    } finally { setTimeout(() => { busy = false; }, 400); }
  }, true);

  let amount = 10;
  function onRail(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.amt) { amount = +b.dataset.amt; b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); return; }
    if (b.dataset.tsClass) return onNav(e);
    if (b.id === 'ts-rail-add') { openHeroActionDialog('add', b); return; }
    if (b.id === 'ts-box-open') { g(() => window.openTeacherSurpriseBox()); return; }
    if (b.id === 'ts-award-go') {
      const sel = $('award-student'), amt = $('award-amount'), form = $('award-form');
      const pick = $('ts-award-student').value;
      if (!g(() => canManageClass(navSchool, navClass), false)) { g(() => toast('Quick Award is available only for classes you manage.')); return; }
      if (!sel || !amt || !form || !pick) { g(() => toast('Pick a student first')); return; }
      if (![...sel.options].some(option => option.value === pick)) sel.add(new Option(pick, pick));
      sel.value = pick; amt.value = amount;
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }

  window.pokeaymanOpenAddStudent = (t) => openHeroActionDialog('add', t);
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-ts-add-student]'); if (b) { e.preventDefault(); openHeroActionDialog('add', b); } });
  let lastOpts = '', lastTop = '', lastClassKey = '';
  let lastClassData = null;
  function sync() {
    const app = $('app-screen');
    const on = !!app && !app.classList.contains('hidden') && g(() => currentRole) === 'teacher';
    document.body.classList.toggle('ts-on', on);
    if (!on) return;
    build();
    const tab = g(() => activeMainTab, 'dashboard');
    const inClass = tab === 'dashboard' && [...document.querySelectorAll('[id="view-students"]')].some(v => !v.classList.contains('hidden') && v.getClientRects().length) && g(() => navClass, null);
    document.body.classList.toggle('ts-rail-on', !!inClass);
    $('ts-current').textContent = g(() => navClass, null) || 'Choose a class';
    $('ts-current-school').textContent = g(() => navSchool, null) || 'Schools & classes';

    const activeClassTab = document.querySelector('#class-tabs-container .class-view-tab[class*="-active"]:not([class*="inactive"])')?.dataset.classtab;
    const zoneTab = document.querySelector('.teacher-zone-tab[aria-selected="true"]')?.id?.replace(/^teacher-zone-|-tab$/g, '');
    document.querySelectorAll('#ts-sidebar .ts-item, #ts-sidebar .ts-switch').forEach((b) => {
      let a = false;
      if (b.dataset.tsClass) a = !!inClass && activeClassTab === b.dataset.tsClass;
      else if (b.dataset.tsZone === 'vb-lists') a = tab === 'teacher-zone' && zoneTab === 'vb-lists';
      else if (b.dataset.tsZone) a = tab === 'teacher-zone' && zoneTab === b.dataset.tsZone;
      else if (b.dataset.ts === 'admin-users') a = tab === 'admin' && document.querySelector('.admin-sub-tab[data-subtab="users"]')?.classList.contains('admin-sub-tab-active');
      else if (b.dataset.ts === 'admin-controls') a = tab === 'admin' && document.querySelector('.admin-sub-tab[data-subtab="controls"]')?.classList.contains('admin-sub-tab-active');
      else if (b.dataset.ts === 'admin') a = tab === 'admin';
      else if (b.dataset.ts === 'schools') a = tab === 'dashboard' && !inClass;
      b.classList.toggle('active', a);
      if (b.dataset.tsClass) b.classList.toggle('dim', !g(() => navClass, null));
    });
    $('ts-zone').hidden = !g(() => canAccessTeacherZone(), false);
    $('ts-admin').hidden = !g(() => canAccessAdmin(), false);
    document.querySelector('[data-ts-toggle="zone"]').classList.toggle('current', tab === 'teacher-zone');
    document.querySelector('[data-ts-toggle="admin"]').classList.toggle('current', tab === 'admin');
    ['financial', 'history'].forEach((k) => {
      const src = $(`teacher-zone-${k}-tab`);
      const hide = !src || src.classList.contains('hidden') || src.style.display === 'none';
      document.querySelector(`[data-ts-zone="${k}"]`).hidden = hide;
    });

    $('ts-name').textContent = $('logged-in-name-nav')?.textContent || g(() => currentTeacher, '') || 'Teacher';
    $('ts-name').title = $('ts-name').textContent;
    const accountBadge = $('ts-account-badge');
    const isAdmin = g(() => canAccessAdmin(), false);
    const isPro = g(() => findMyTeacherRecord()?.teacher_pro === true, false);
    accountBadge.textContent = isAdmin ? 'ADMIN' : 'PRO';
    accountBadge.hidden = !isAdmin && !isPro;
    accountBadge.classList.toggle('is-admin', isAdmin);
    const credits = $('credit-balance-nav')?.textContent?.trim();
    $('ts-role').textContent = g(() => canAccessAdmin(), false) ? 'Unlimited credits' : (credits ? `${credits} credits available` : 'Credits unavailable');
    const unread = g(() => window.teacherUnreadNotificationCount?.(), 0) || 0;
    $('ts-notification-count').textContent = unread > 99 ? '99+' : String(unread);
    $('ts-notification-count').hidden = unread === 0;
    $('[data-ts="notifications"]').setAttribute('aria-label', unread ? `Open notifications, ${unread} unread` : 'Open notifications');
      const st = g(() => window.teacherStreakState(), null);
      if (st) {
        const dots = Array.from({ length: 7 }, (_, i) => `<span class="${i < st.count ? 'on' : ''}">${i + 1}</span>`).join('');
        if ($('ts-streak-dots').innerHTML !== dots) $('ts-streak-dots').innerHTML = dots;
        const txt = st.boxes > 0 ? `You have ${st.boxes} Streak Box${st.boxes > 1 ? 'es' : ''} to open!` : `${7 - st.count} more day${7 - st.count === 1 ? '' : 's'} to unlock a Streak Box`;
        if ($('ts-streak-text').textContent !== txt) $('ts-streak-text').textContent = txt;
        $('ts-box-open').textContent = st.boxes > 0 ? `🎁 Open Streak Box${st.boxes > 1 ? ` (${st.boxes})` : ''}` : 'No Streak Boxes Ready';
        $('ts-box-open').disabled = st.boxes < 1;
        $('ts-box-open').classList.toggle('ready', st.boxes > 0);
      }
    if (inClass) {
      cardButtons();
      const classKey = `${g(() => navSchool, '')}\u0000${g(() => navClass, '')}`;
      const students = g(() => getStudents(navSchool, navClass), []) || [];
      const rosterStudents = students.length ? students : [...document.querySelectorAll('#students-list > .trainer-student-card[data-student-id]')]
        .map(card => g(() => allData.find(row => row.__backendId === card.dataset.studentId), null) || { student_name: card.dataset.studentName, coins: Number(card.querySelector('[class*="coin"]')?.textContent.replace(/\D/g, '')) || 0 })
        .filter(Boolean);
      if (allData !== lastClassData || classKey !== lastClassKey || !$('ts-hero')?.isConnected || $('ts-hero')?.parentElement !== $('class-subtab-students')) {
        hero(students);
        lastClassData = allData;
        lastClassKey = classKey;
      }
      const list = rosterStudents.slice().sort((a, b) => (Number(b.coins) || 0) - (Number(a.coins) || 0) || String(a.student_name || '').localeCompare(String(b.student_name || ''))).slice(0, 3);
      const topHtml = list.map((s, i) => `<li class="m${i + 1}"><span class="ts-medal">${i + 1}</span><span><strong>${esc(s.student_name)}</strong><small>🪙 ${Number(s.coins || 0).toLocaleString()} coins</small></span></li>`).join('') || '<li class="ts-empty">No students yet</li>';
      if (topHtml !== lastTop) { $('ts-top3').innerHTML = topHtml; lastTop = topHtml; }
      const optionsHtml = '<option value="">Choose a student</option>' + rosterStudents.map(student => `<option value="${esc(student.student_name)}">${esc(student.student_name)}</option>`).join('');
      const sidebarSelect = $('ts-award-student');
      if (optionsHtml !== lastOpts || !sidebarSelect.options.length) {
        const keep = sidebarSelect.value;
        sidebarSelect.innerHTML = optionsHtml;
        if (keep && [...sidebarSelect.options].some(option => option.value === keep)) sidebarSelect.value = keep;
        lastOpts = optionsHtml;
      }
      const canAward = g(() => canManageClass(navSchool, navClass), false);
      sidebarSelect.disabled = !canAward || !rosterStudents.length;
      document.querySelectorAll('#ts-rail .ts-amounts button').forEach(button => { button.disabled = !canAward; });
      $('ts-award-go').disabled = !canAward || !rosterStudents.length;
    }
  }

  // Tablet/phone: bottom tab bar; the sidebar shows the current section's tools as a strip above it.
  const mq = window.matchMedia('(max-width: 1024px)');
  let meOpen = false;
  function syncAvatar() {
    const host = $('ts-avatar'); if (!host) return;
    const sourceAvatar = $('teacher-account-avatar')?.querySelector('img');
    const avatarRecord = g(() => isAymanTeacher() ? getAdminTeacherRecord() : findMyTeacherRecord(), null) || g(() => findMyTeacherRecord(), null);
    const avatarValue = avatarRecord?.teacher_avatar || (Number(avatarRecord?.avatar_pokemon_id) > 0 ? avatarRecord.avatar_pokemon_id : '');
    const avatarSrc = g(() => teacherAvatarSrc(avatarValue), '') || sourceAvatar?.currentSrc || sourceAvatar?.src || '';
    const avatarUrl = avatarSrc ? g(() => new URL(avatarSrc, document.baseURI).href, '') : '';
    const avatarAlt = avatarRecord?.teacher_name ? `${avatarRecord.teacher_name}'s avatar` : (sourceAvatar?.alt || 'Teacher avatar');
    if (avatarUrl && avatarUrl !== failedAvatarSrc) {
      const currentAvatar = host.querySelector('img');
      if (currentAvatar?.src !== avatarUrl) {
        failedAvatarSrc = '';
        host.innerHTML = `<img src="${esc(avatarUrl)}" alt="${esc(avatarAlt)}">`;
        host.querySelector('img')?.addEventListener('error', () => { failedAvatarSrc = avatarUrl; syncAvatar(); }, { once: true });
      }
    } else if (!host.querySelector('.ts-avatar-fallback')) {
      host.innerHTML = '<span class="ts-avatar-fallback" role="img" aria-label="Teacher avatar unavailable">🎓</span>';
    }
  }
  function closeSheet() { meOpen = false; syncBottom(); }
  function buildBottom() {
    if ($('ts-bottom') || !$('ts-sidebar')) return;
    const bar = document.createElement('nav');
    bar.id = 'ts-bottom'; bar.setAttribute('aria-label', 'Teacher navigation');
    bar.innerHTML = [['class', '', 'Class'], ['switch', '', 'Classes'], ['zone', '', 'Zone'], ['admin', '', 'Admin'], ['me', '', 'Me']]
      .map(([k, i, l]) => `<button type="button" data-tsb="${k}"><span class="tsb-ic" aria-hidden="true">${i}</span><span class="tsb-l">${l}</span></button>`).join('') +
      `<button type="button" data-tsb="theme" role="switch" aria-checked="${bright}" aria-label="${bright ? 'Switch to dark mode' : 'Switch to bright mode'}" title="${bright ? 'Switch to dark mode' : 'Switch to bright mode'}"><span class="tsb-ic" aria-hidden="true"></span><span class="tsb-l">${bright ? 'Dark' : 'Bright'}</span></button>`;
    const scrim = document.createElement('div'); scrim.id = 'ts-sheet-scrim';
    document.body.append(scrim, bar);
    scrim.addEventListener('click', closeSheet);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tsb]'); if (!b) return;
      const k = b.dataset.tsb;
      if (k === 'theme') {
        setThemeMode(!bright);
        return;
      }
      meOpen = k === 'me' ? !meOpen : false;
      if (k === 'switch') togglePop();
      else if (k === 'class') { if (!needClass()) { const s = navSchool, c = navClass; g(() => showMainTab('dashboard')); g(() => navigateTo('students', s, c)); } }
      else if (k === 'zone') { g(() => showMainTab('teacher-zone')); }
      else if (k === 'admin') { g(() => showMainTab('admin')); }
      syncBottom();
    });
    $('ts-sidebar').addEventListener('click', (e) => { if (mq.matches && e.target.closest('.ts-logout')) meOpen = false; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && meOpen) closeSheet(); });
  }
  function syncBottom() {
    if (document.body.classList.contains('ts-on') && !$('ts-sidebar')) build();
    buildBottom();
    const bar = $('ts-bottom'); if (!bar) return;
    bar.querySelector('[data-tsb="admin"]').hidden = !g(() => canAccessAdmin(), false);
    bar.querySelector('[data-tsb="zone"]').hidden = !g(() => canAccessTeacherZone(), false);
    const visibleItems = [...bar.querySelectorAll('[data-tsb]')].filter((button) => !button.hidden).length;
    bar.style.gridTemplateColumns = `repeat(${visibleItems}, minmax(0, 1fr))`;
    const tab = g(() => activeMainTab, 'dashboard');
    const sec = meOpen ? 'me' : ({ dashboard: 'class', 'teacher-zone': 'zone', admin: 'admin' }[tab] || 'class');
    if (document.body.dataset.tsSheet !== sec) document.body.dataset.tsSheet = sec;
    bar.querySelectorAll('[data-tsb]').forEach((b) => { const on = b.dataset.tsb === sec; b.classList.toggle('current', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    const av = $('ts-avatar')?.innerHTML;
    const me = bar.querySelector('[data-tsb="me"] .tsb-ic');
    if (av && me.innerHTML !== av) me.innerHTML = av;
    if (mq.matches && meOpen) document.body.style.setProperty('--ts-me-height', `${$('ts-sidebar').getBoundingClientRect().height}px`);
  }

  function refreshShell() {
    try { sync(); } catch (error) { console.error('Teacher sidebar refresh failed:', error); }
    try { syncAvatar(); } catch (error) { console.error('Teacher avatar refresh failed:', error); }
    try { syncBottom(); } catch (error) { console.error('Teacher navigation refresh failed:', error); }
  }
  function start() {
    const studentToggle = $('student-theme-toggle');
    studentToggle?.addEventListener('click', () => setThemeMode(!bright));
    refreshShell(); setInterval(refreshShell, 700); window.addEventListener('resize', refreshShell, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
