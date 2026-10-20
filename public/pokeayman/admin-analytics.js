/* Admin Hub Analytics: Smart Active Timer, Feature Tracker, Historical Backfill & SaaS SVG Charts */
(function () {
  const IDLE_LIMIT_MS = 120 * 1000;
  const FLUSH_INTERVAL_MS = 30 * 1000;
  const LOCAL_CACHE_KEY = 'pokeayman-analytics-buffer-v1';

  const TEACHER_FEATURES = [
    { key: 'roster', label: 'Class Roster & Awards' },
    { key: 'quiz', label: 'Quizzes' },
    { key: 'vocab', label: 'Class Vocabulary' },
    { key: 'games', label: 'Classroom Games' },
    { key: 'battle', label: 'Battle Arena' },
    { key: 'schedule', label: 'Teacher Zone · Schedule' },
    { key: 'financial', label: 'Teacher Zone · Financial' },
    { key: 'vb', label: 'Teacher Zone · Word Bank (VB)' },
    { key: 'claims', label: 'Teacher Zone · Battle Claims' },
  ];

  const STUDENT_FEATURES = [
    { key: 'collection', label: 'Pokémon Collection' },
    { key: 'shop', label: 'Pokémon Shop' },
    { key: 'catchdex', label: 'Catchdex (Listen & Catch)' },
    { key: 'quizzes', label: 'Class Quizzes' },
    { key: 'vocabulary', label: 'Vocabulary Flashcards' },
    { key: 'games', label: 'Games & Poké Battle' },
  ];

  const ICONS = {
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    credit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    layers:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  };

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const safe = (fn, fallback) => {
    try {
      return fn();
    } catch (_) {
      return fallback;
    }
  };

  function toDayKey(dateInput) {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function toMonthKey(dateInput) {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function formatDuration(totalSeconds) {
    const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (secs === 0) return '0m';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }

  function formatAxisDuration(totalSeconds) {
    const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (secs === 0) return '0m';
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1).replace(/\.0$/, '');
    return `${hrs}h`;
  }

  function formatAxisNumber(val) {
    const n = Math.round(Number(val) || 0);
    if (n === 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(n);
  }

  function normalizeIdentity(val) {
    return String(val || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  }

  // ---- Local Buffer & Cloud Persistence ----
  let localStore = safe(() => JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '{}'), {}) || {};
  let dirtyKeys = new Set();
  let lastInteractionAt = Date.now();
  let lastTrackedFeatureKey = '';
  let syncInFlight = false;

  function saveLocalStore() {
    safe(() => localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(localStore)));
  }

  function getActiveIdentity() {
    const role = safe(() => currentRole, '');
    if (role === 'teacher') {
      const name = String(safe(() => currentTeacher, '') || '').trim();
      if (!name) return null;
      const teacherRec = safe(() => getTeachers().find((t) => normalizeIdentity(t.teacher_name) === normalizeIdentity(name)), null);
      const id = String(teacherRec?.__backendId || safe(() => currentTeacherRecordId, '') || name).trim();
      return { role: 'teacher', key: normalizeIdentity(name), id, name };
    }
    if (role === 'student') {
      const name = String(safe(() => currentStudent, '') || '').trim();
      if (!name) return null;
      const id = String(safe(() => currentStudentRecordId, '') || name).trim();
      return { role: 'student', key: normalizeIdentity(name), id, name };
    }
    return null;
  }

  function detectActiveFeature(role) {
    if (role === 'teacher') {
      const activeGame = document.querySelector('.game-popup-modal:not(.hidden), .memory-game-shell:not(.hidden), .hangman-game-shell:not(.hidden), .cipher-lab-shell:not(.hidden), .vb-overlay');
      if (activeGame) return 'games';
      const mainTab = safe(() => activeMainTab, 'dashboard');
      if (mainTab === 'teacher-zone') {
        const zTab = document.querySelector('.teacher-zone-tab[aria-selected="true"]')?.id || '';
        if (zTab.includes('financial')) return 'financial';
        if (zTab.includes('vb-lists')) return 'vb';
        if (zTab.includes('battle-claims')) return 'claims';
        if (zTab.includes('schedule')) return 'schedule';
        return 'schedule';
      }
      if (mainTab === 'dashboard') {
        const viewStudents = document.getElementById('view-students');
        if (viewStudents && !viewStudents.classList.contains('hidden')) {
          const activeClassBtn = document.querySelector('#class-tabs-container .class-view-tab[class*="-active"]:not([class*="inactive"])');
          const cTab = activeClassBtn?.dataset?.classtab || 'students';
          if (cTab === 'quiz') return 'quiz';
          if (cTab === 'vocab') return 'vocab';
          if (cTab === 'games') return 'games';
          if (cTab === 'battle') return 'battle';
          return 'roster';
        }
        return 'roster';
      }
      return '';
    }

    if (role === 'student') {
      const activeGame = document.querySelector('.game-popup-modal:not(.hidden), .memory-game-shell:not(.hidden), .hangman-game-shell:not(.hidden), .cipher-lab-shell:not(.hidden), .vb-overlay');
      if (activeGame) return 'games';
      const activeTabBtn = document.querySelector('.student-dashboard-tab.student-dashboard-tab-active');
      const sTab = activeTabBtn?.dataset?.tab || 'collection';
      if (sTab === 'shop') return 'shop';
      if (sTab === 'catchdex') return 'catchdex';
      if (sTab === 'quizzes') return 'quizzes';
      if (sTab === 'vocabulary') return 'vocabulary';
      if (sTab === 'games') return 'games';
      return 'collection';
    }
    return '';
  }

  function ensureUserBucket(identity, dayKey) {
    const storeKey = `${identity.role}:${identity.key}`;
    if (!localStore[storeKey]) {
      localStore[storeKey] = {
        role: identity.role,
        user_key: identity.key,
        user_id: identity.id,
        user_name: identity.name,
        daily: {},
      };
    }
    const entry = localStore[storeKey];
    entry.user_name = identity.name || entry.user_name;
    entry.user_id = identity.id || entry.user_id;
    if (!entry.daily[dayKey]) {
      entry.daily[dayKey] = { seconds: 0, features: {} };
    }
    return { storeKey, dayBucket: entry.daily[dayKey] };
  }

  function recordFeatureVisit(identity, featureKey) {
    if (!identity || !featureKey) return;
    const dayKey = toDayKey(new Date());
    const { storeKey, dayBucket } = ensureUserBucket(identity, dayKey);
    if (!dayBucket.features[featureKey]) {
      dayBucket.features[featureKey] = { seconds: 0, visits: 0 };
    }
    dayBucket.features[featureKey].visits = (Number(dayBucket.features[featureKey].visits) || 0) + 1;
    dirtyKeys.add(storeKey);
    saveLocalStore();
  }

  function tickActiveSecond() {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastInteractionAt > IDLE_LIMIT_MS) return;
    const identity = getActiveIdentity();
    if (!identity) return;
    const featureKey = detectActiveFeature(identity.role);
    const dayKey = toDayKey(new Date());
    const { storeKey, dayBucket } = ensureUserBucket(identity, dayKey);
    dayBucket.seconds = (Number(dayBucket.seconds) || 0) + 1;
    if (featureKey) {
      if (!dayBucket.features[featureKey]) {
        dayBucket.features[featureKey] = { seconds: 0, visits: 1 };
      }
      dayBucket.features[featureKey].seconds = (Number(dayBucket.features[featureKey].seconds) || 0) + 1;
      const compositeFeature = `${identity.role}:${identity.key}:${featureKey}`;
      if (lastTrackedFeatureKey !== compositeFeature) {
        if (lastTrackedFeatureKey) {
          dayBucket.features[featureKey].visits = (Number(dayBucket.features[featureKey].visits) || 0) + 1;
        }
        lastTrackedFeatureKey = compositeFeature;
      }
    }
    dirtyKeys.add(storeKey);
    saveLocalStore();
  }

  function mergeDailyMaps(targetDaily, sourceDaily) {
    const out = { ...(targetDaily || {}) };
    Object.entries(sourceDaily || {}).forEach(([dayKey, srcDay]) => {
      if (!srcDay || typeof srcDay !== 'object') return;
      const existing = out[dayKey] || { seconds: 0, features: {} };
      const mergedFeatures = { ...(existing.features || {}) };
      Object.entries(srcDay.features || {}).forEach(([fKey, fVal]) => {
        const prev = mergedFeatures[fKey] || { seconds: 0, visits: 0 };
        mergedFeatures[fKey] = {
          seconds: Math.max(Number(prev.seconds) || 0, Number(fVal?.seconds) || 0),
          visits: Math.max(Number(prev.visits) || 0, Number(fVal?.visits) || 0),
        };
      });
      out[dayKey] = {
        seconds: Math.max(Number(existing.seconds) || 0, Number(srcDay.seconds) || 0),
        features: mergedFeatures,
      };
    });
    return out;
  }

  async function flushAnalyticsToCloud() {
    if (syncInFlight || !dirtyKeys.size || !window.dataSdk || typeof allData === 'undefined') return;
    syncInFlight = true;
    const keysToSync = [...dirtyKeys];
    try {
      for (const storeKey of keysToSync) {
        const localEntry = localStore[storeKey];
        if (!localEntry) continue;
        const existingRecord = allData.find(
          (r) =>
            r.type === 'user_analytics' &&
            r.role === localEntry.role &&
            normalizeIdentity(r.user_key || r.user_name) === localEntry.user_key
        );
        let remoteDaily = {};
        if (existingRecord?.analytics_json) {
          remoteDaily = safe(() => JSON.parse(existingRecord.analytics_json), {}) || {};
        }
        const mergedDaily = mergeDailyMaps(remoteDaily, localEntry.daily);
        localEntry.daily = mergedDaily;
        const payload = {
          type: 'user_analytics',
          role: localEntry.role,
          user_key: localEntry.user_key,
          user_id: localEntry.user_id || '',
          user_name: localEntry.user_name || '',
          analytics_json: JSON.stringify(mergedDaily),
          updated_at: new Date().toISOString(),
          created_at: existingRecord?.created_at || new Date().toISOString(),
        };
        if (existingRecord) {
          await window.dataSdk.update({ ...existingRecord, ...payload }, { notify: false });
        } else {
          await window.dataSdk.create(payload, { notify: false });
        }
        dirtyKeys.delete(storeKey);
      }
      saveLocalStore();
    } catch (_) {
      // Retry on next flush cycle
    } finally {
      syncInFlight = false;
    }
  }

  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        lastInteractionAt = Date.now();
      },
      { passive: true, capture: true }
    );
  });

  let lastMouseMove = 0;
  window.addEventListener(
    'mousemove',
    () => {
      const now = Date.now();
      if (now - lastMouseMove > 2500) {
        lastMouseMove = now;
        lastInteractionAt = now;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'click',
    (e) => {
      lastInteractionAt = Date.now();
      const btn = e.target.closest?.(
        '.class-view-tab, .teacher-zone-tab, .student-dashboard-tab, [data-ts-class], [data-ts-zone]'
      );
      if (btn) {
        setTimeout(() => {
          const identity = getActiveIdentity();
          if (identity) {
            const feat = detectActiveFeature(identity.role);
            if (feat) recordFeatureVisit(identity, feat);
          }
        }, 40);
      }
    },
    true
  );

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAnalyticsToCloud();
    } else {
      lastInteractionAt = Date.now();
    }
  });

  setInterval(tickActiveSecond, 1000);
  setInterval(flushAnalyticsToCloud, FLUSH_INTERVAL_MS);

  // ---- Analytics Data Aggregation & Historical Backfill ----
  function extractRecordTimestamp(r) {
    if (!r || typeof r !== 'object') return 0;
    const raw =
      r.created_at ||
      r.updated_at ||
      r.timestamp ||
      r.date ||
      r.awarded_at ||
      r.purchased_at ||
      r.transaction_time ||
      r.activity_at ||
      r.claimed_at;
    if (!raw) return 0;
    const ms = Date.parse(String(raw));
    return Number.isFinite(ms) ? ms : 0;
  }

  function buildTimeBuckets(period) {
    const now = new Date();
    const buckets = [];
    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = toDayKey(d);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        buckets.push({ key, label, fullLabel, mode: 'day' });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = toDayKey(d);
        const label = i % 5 === 0 || i === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '';
        const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        buckets.push({ key, label, fullLabel, mode: 'day' });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = toMonthKey(d);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const fullLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        buckets.push({ key, label, fullLabel, mode: 'month' });
      }
    }
    return buckets;
  }

  function computeAnalyticsDataset(role, selectedUserKey, period) {
    const rows = safe(() => allData, []) || [];
    const buckets = buildTimeBuckets(period);
    const bucketMap = new Map(
      buckets.map((b) => [
        b.key,
        {
          ...b,
          seconds: 0,
          creditsSpent: 0,
          coinsEarned: 0,
          coinsSpent: 0,
        },
      ])
    );

    const featureMetaList = role === 'teacher' ? TEACHER_FEATURES : STUDENT_FEATURES;
    const featureStats = {};
    featureMetaList.forEach((f) => {
      featureStats[f.key] = { ...f, seconds: 0, visits: 0 };
    });

    const creditActions = {};
    const perUserMap = new Map();

    const ensureUserSummary = (uKey, uName, uMeta = '') => {
      const k = normalizeIdentity(uKey || uName);
      if (!k) return null;
      if (!perUserMap.has(k)) {
        perUserMap.set(k, {
          key: k,
          name: uName || uKey,
          meta: uMeta,
          seconds: 0,
          creditsSpent: 0,
          coinsEarned: 0,
          coinsSpent: 0,
          features: {},
          activeDays: new Set(),
        });
      }
      const item = perUserMap.get(k);
      if (uName && (!item.name || item.name === item.key)) item.name = uName;
      if (uMeta && !item.meta) item.meta = uMeta;
      return item;
    };

    if (role === 'teacher') {
      const teachers = safe(() => getTeachers(), []) || [];
      teachers.forEach((t) => {
        if (!t.teacher_name) return;
        const roleTag = t.teacher_name === 'Ayman' ? 'Administrator' : t.teacher_pro ? 'Pro Teacher' : 'Teacher';
        ensureUserSummary(t.teacher_name, t.teacher_name, roleTag);
      });
    } else {
      const students = safe(() => getAllStudents(), []) || [];
      students.forEach((s) => {
        if (!s.student_name) return;
        const meta = [s.school_name, s.class_name].filter(Boolean).join(' / ') || 'Student';
        ensureUserSummary(s.student_name, s.student_name, meta);
      });
    }

    const matchesSelectedUser = (uKey) => {
      if (!selectedUserKey || selectedUserKey === '__all__') return true;
      return normalizeIdentity(uKey) === normalizeIdentity(selectedUserKey);
    };

    const matchBucketForDayKey = (dayKey) => {
      if (!dayKey) return null;
      if (period === 'year') {
        const monthKey = dayKey.slice(0, 7);
        return bucketMap.get(monthKey) || null;
      }
      return bucketMap.get(dayKey) || null;
    };

    const combinedUserDaily = new Map();
    rows
      .filter((r) => r.type === 'user_analytics' && r.role === role)
      .forEach((r) => {
        const uKey = normalizeIdentity(r.user_key || r.user_name);
        if (!uKey) return;
        ensureUserSummary(uKey, r.user_name || uKey);
        const parsed = safe(() => JSON.parse(r.analytics_json || '{}'), {}) || {};
        combinedUserDaily.set(uKey, mergeDailyMaps(combinedUserDaily.get(uKey), parsed));
      });

    Object.values(localStore).forEach((entry) => {
      if (!entry || entry.role !== role) return;
      const uKey = normalizeIdentity(entry.user_key || entry.user_name);
      if (!uKey) return;
      ensureUserSummary(uKey, entry.user_name || uKey);
      combinedUserDaily.set(uKey, mergeDailyMaps(combinedUserDaily.get(uKey), entry.daily));
    });

    combinedUserDaily.forEach((dailyMap, uKey) => {
      const uSummary = ensureUserSummary(uKey, uKey);
      Object.entries(dailyMap || {}).forEach(([dayKey, dayData]) => {
        const b = matchBucketForDayKey(dayKey);
        if (!b) return;
        const secs = Math.max(0, Number(dayData?.seconds) || 0);
        if (uSummary && secs > 0) {
          uSummary.seconds += secs;
          uSummary.activeDays.add(dayKey);
        }
        if (matchesSelectedUser(uKey)) {
          b.seconds += secs;
        }
        Object.entries(dayData?.features || {}).forEach(([fKey, fVal]) => {
          const fSecs = Math.max(0, Number(fVal?.seconds) || 0);
          const fVisits = Math.max(0, Number(fVal?.visits) || 0);
          if (uSummary) {
            const prevF = uSummary.features[fKey] || { seconds: 0, visits: 0 };
            uSummary.features[fKey] = {
              seconds: prevF.seconds + fSecs,
              visits: prevF.visits + fVisits,
            };
          }
          if (matchesSelectedUser(uKey) && featureStats[fKey]) {
            featureStats[fKey].seconds += fSecs;
            featureStats[fKey].visits += fVisits;
          }
        });
      });
    });

    const addHistoricalActivity = (uKey, uName, dayKey, fKey, estSeconds) => {
      const b = matchBucketForDayKey(dayKey);
      if (!b) return;
      const uSummary = ensureUserSummary(uKey, uName || uKey);
      const hasLiveThatDay = Number(combinedUserDaily.get(normalizeIdentity(uKey))?.[dayKey]?.seconds) > 0;
      const addSecs = hasLiveThatDay ? 0 : estSeconds;

      if (uSummary) {
        uSummary.seconds += addSecs;
        if (dayKey) uSummary.activeDays.add(dayKey);
        if (fKey) {
          const prevF = uSummary.features[fKey] || { seconds: 0, visits: 0 };
          uSummary.features[fKey] = {
            seconds: prevF.seconds + addSecs,
            visits: prevF.visits + (hasLiveThatDay ? 0 : 1),
          };
        }
      }
      if (matchesSelectedUser(uKey)) {
        b.seconds += addSecs;
        if (fKey && featureStats[fKey]) {
          featureStats[fKey].seconds += addSecs;
          if (!hasLiveThatDay) featureStats[fKey].visits += 1;
        }
      }
    };

    rows.forEach((r) => {
      const type = String(r.type || '');
      const ts = extractRecordTimestamp(r);
      const dayKey = ts ? toDayKey(new Date(ts)) : '';
      const b = dayKey ? matchBucketForDayKey(dayKey) : null;

      if (role === 'teacher') {
        if (type === 'credit_log' || type === 'credit_transaction') {
          const tName = String(r.teacher_name || r.created_by || '').trim();
          const tKey = normalizeIdentity(tName);
          if (!tKey || !b) return;
          const rawAmt = Number(r.log_amount ?? r.amount ?? 0);
          const spent = Math.abs(rawAmt);
          const action = String(r.log_action || r.action || 'Award').trim();
          const fKey = /quick|quiz/i.test(action)
            ? 'quiz'
            : /claim|battle/i.test(action)
            ? 'claims'
            : 'roster';

          const uSummary = ensureUserSummary(tKey, tName);
          if (uSummary && rawAmt > 0) {
            uSummary.creditsSpent += spent;
          }
          if (matchesSelectedUser(tKey) && rawAmt > 0) {
            b.creditsSpent += spent;
            creditActions[action] = (creditActions[action] || 0) + spent;
          }
          addHistoricalActivity(tKey, tName, dayKey, fKey, 120);
        } else if (type === 'quiz') {
          const tName = String(r.quiz_created_by || r.teacher_name || '').trim();
          const tKey = normalizeIdentity(tName);
          if (!tKey || !b) return;
          const reward = Math.max(0, Number(r.quiz_reward) || 0);
          const uSummary = ensureUserSummary(tKey, tName);
          if (uSummary && reward > 0) uSummary.creditsSpent += reward;
          if (matchesSelectedUser(tKey) && reward > 0) {
            b.creditsSpent += reward;
            creditActions['Quiz Posted'] = (creditActions['Quiz Posted'] || 0) + reward;
          }
          addHistoricalActivity(tKey, tName, dayKey, 'quiz', 240);
        } else if (type === 'vocab_list') {
          const tName = String(r.created_by || r.teacher_name || '').trim();
          const tKey = normalizeIdentity(tName);
          if (!tKey || !b) return;
          addHistoricalActivity(tKey, tName, dayKey, 'vb', 300);
        } else if (type === 'teacher_schedule') {
          const tName = String(r.teacher_name || r.created_by || '').trim();
          const tKey = normalizeIdentity(tName);
          if (!tKey || !b) return;
          addHistoricalActivity(tKey, tName, dayKey, 'schedule', 180);
        } else if (type === 'battle_claim' && (r.status === 'approved' || r.status === 'declined')) {
          const tName = String(r.reviewed_by || r.teacher_name || '').trim();
          const tKey = normalizeIdentity(tName);
          if (!tKey || !b) return;
          addHistoricalActivity(tKey, tName, dayKey, 'claims', 120);
        }
      } else {
        if (type === 'credit_log' || type === 'credit_transaction') {
          const target = String(r.log_target || r.student_name || '').trim();
          if (!target || !b || /\(\d+\s*students\)/i.test(target)) return;
          const sKey = normalizeIdentity(target);
          const amt = Number(r.log_amount ?? r.amount ?? 0);
          const uSummary = ensureUserSummary(sKey, target);
          if (amt > 0) {
            if (uSummary) uSummary.coinsEarned += amt;
            if (matchesSelectedUser(sKey)) {
              b.coinsEarned += amt;
              creditActions[r.log_action || 'Teacher Award'] =
                (creditActions[r.log_action || 'Teacher Award'] || 0) + amt;
            }
          } else if (amt < 0) {
            const spent = Math.abs(amt);
            if (uSummary) uSummary.coinsSpent += spent;
            if (matchesSelectedUser(sKey)) {
              b.coinsSpent += spent;
            }
          }
          const fKey = /quick|quiz/i.test(String(r.log_action || '')) ? 'quizzes' : 'collection';
          addHistoricalActivity(sKey, target, dayKey, fKey, 150);
        } else if (type === 'pokemon' || type === 'purchase_transaction') {
          const owner = String(r.owner || r.student_name || r.owner_display_name || '').trim();
          if (!owner || !b) return;
          const sKey = normalizeIdentity(owner);
          const price = Math.max(0, Number(r.pokemon_price ?? r.price ?? r.amount ?? 0));
          const isCatch = /catch/i.test(String(r.source || r.acquired_via || ''));
          const fKey = isCatch ? 'catchdex' : 'shop';
          const uSummary = ensureUserSummary(sKey, owner);
          if (price > 0 && !isCatch) {
            if (uSummary) uSummary.coinsSpent += price;
            if (matchesSelectedUser(sKey)) {
              b.coinsSpent += price;
              creditActions['Shop Purchase'] = (creditActions['Shop Purchase'] || 0) + price;
            }
          }
          addHistoricalActivity(sKey, owner, dayKey, fKey, 210);
        } else if (type === 'quiz' && r.quiz_solved_by) {
          const solver = String(r.quiz_solved_by).trim();
          const sKey = normalizeIdentity(solver);
          if (!sKey || !b) return;
          const reward = Math.max(0, Number(r.quiz_reward) || 0);
          const uSummary = ensureUserSummary(sKey, solver);
          if (uSummary && reward > 0) uSummary.coinsEarned += reward;
          if (matchesSelectedUser(sKey) && reward > 0) {
            b.coinsEarned += reward;
            creditActions['Quiz Solved'] = (creditActions['Quiz Solved'] || 0) + reward;
          }
          addHistoricalActivity(sKey, solver, dayKey, 'quizzes', 240);
        } else if (type === 'battle_log') {
          const sName = String(r.student_name || '').trim();
          const sKey = normalizeIdentity(sName);
          if (!sKey || !b) return;
          addHistoricalActivity(sKey, sName, dayKey, 'games', 300);
        } else if (type === 'battle_claim') {
          const sName = String(r.student_name || '').trim();
          const sKey = normalizeIdentity(sName);
          if (!sKey || !b) return;
          const cost = r.status === 'approved' ? Math.max(0, Number(r.price || r.pokemon_price || 0)) : 0;
          const uSummary = ensureUserSummary(sKey, sName);
          if (cost > 0) {
            if (uSummary) uSummary.coinsSpent += cost;
            if (matchesSelectedUser(sKey)) {
              b.coinsSpent += cost;
              creditActions['Battle Claim'] = (creditActions['Battle Claim'] || 0) + cost;
            }
          }
          addHistoricalActivity(sKey, sName, dayKey, 'games', 240);
        } else if (type === 'listen_catch_progress') {
          const sName = String(r.student_name || '').trim();
          const sKey = normalizeIdentity(sName);
          if (!sKey || !b) return;
          addHistoricalActivity(sKey, sName, dayKey, 'catchdex', 240);
        }
      }
    });

    const timeline = [...bucketMap.values()];
    const totalSeconds = timeline.reduce((sum, item) => sum + item.seconds, 0);
    const totalCreditsSpent = timeline.reduce((sum, item) => sum + item.creditsSpent, 0);
    const totalCoinsEarned = timeline.reduce((sum, item) => sum + item.coinsEarned, 0);
    const totalCoinsSpent = timeline.reduce((sum, item) => sum + item.coinsSpent, 0);

    const rankedFeatures = Object.values(featureStats).sort(
      (a, b) => b.seconds - a.seconds || b.visits - a.visits
    );

    const userDirectory = [...perUserMap.values()]
      .map((u) => {
        let topFeat = null;
        Object.entries(u.features).forEach(([fKey, fVal]) => {
          const score = (Number(fVal.seconds) || 0) + (Number(fVal.visits) || 0) * 30;
          if (!topFeat || score > topFeat.score) {
            const meta = featureMetaList.find((m) => m.key === fKey);
            topFeat = {
              key: fKey,
              label: meta ? meta.label : fKey,
              score,
            };
          }
        });
        return {
          ...u,
          activeDaysCount: u.activeDays.size,
          topFeatureLabel: topFeat ? topFeat.label : '—',
        };
      })
      .sort(
        (a, b) =>
          b.seconds - a.seconds ||
          b.creditsSpent + b.coinsSpent + b.coinsEarned - (a.creditsSpent + a.coinsSpent + a.coinsEarned) ||
          String(a.name).localeCompare(String(b.name))
      );

    return {
      timeline,
      totalSeconds,
      totalCreditsSpent,
      totalCoinsEarned,
      totalCoinsSpent,
      rankedFeatures,
      creditActions,
      userDirectory,
    };
  }

  // ---- SVG Precision Chart Builder ----
  function buildSvgChart(timeline, mode, isTeacher) {
    const width = 540;
    const height = 192;
    const padLeft = 42;
    const padRight = 10;
    const padTop = 14;
    const plotBottom = 160;
    const plotHeight = plotBottom - padTop;
    const plotWidth = width - padLeft - padRight;

    const rawMax =
      mode === 'time'
        ? Math.max(1800, ...timeline.map((b) => b.seconds))
        : Math.max(
            50,
            ...timeline.map((b) => (isTeacher ? b.creditsSpent : Math.max(b.coinsSpent, b.coinsEarned)))
          );

    // Nice upper bound for 4 ticks
    const step = Math.ceil(rawMax / 4 / 10) * 10 || 1;
    const maxVal = step * 4;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = Math.round(maxVal * ratio);
      const y = Math.round(plotBottom - ratio * plotHeight);
      const label = mode === 'time' ? formatAxisDuration(val) : formatAxisNumber(val);
      return { y, label, isBase: ratio === 0 };
    });

    const n = Math.max(1, timeline.length);
    const slotW = plotWidth / n;
    const barMaxW = n > 15 ? Math.max(4, Math.floor(slotW * 0.62)) : Math.min(24, Math.floor(slotW * 0.52));

    const gridSvg = ticks
      .map(
        (t) => `
        <line x1="${padLeft}" y1="${t.y}" x2="${width - padRight}" y2="${t.y}" class="${
          t.isBase ? 'pk-an-svg-baseline' : 'pk-an-svg-gridline'
        }" />
        <text x="${padLeft - 8}" y="${t.y + 3}" text-anchor="end" class="pk-an-svg-axis-text">${esc(t.label)}</text>
      `
      )
      .join('');

    const colsSvg = timeline
      .map((b, i) => {
        const cx = padLeft + i * slotW + slotW / 2;
        if (mode === 'time') {
          const h = b.seconds > 0 ? Math.max(3, Math.round((b.seconds / maxVal) * plotHeight)) : 2;
          const y = plotBottom - h;
          const x = Math.round(cx - barMaxW / 2);
          return `
            <g class="pk-an-svg-col-group">
              <title>${esc(b.fullLabel)}: ${esc(formatDuration(b.seconds))}</title>
              <rect x="${x}" y="${y}" width="${barMaxW}" height="${h}" rx="2.5" class="${
            b.seconds > 0 ? 'pk-an-svg-bar-time' : 'pk-an-svg-bar-empty'
          }" />
              ${
                b.label
                  ? `<text x="${Math.round(cx)}" y="${height - 8}" text-anchor="middle" class="pk-an-svg-axis-text">${esc(
                      b.label
                    )}</text>`
                  : ''
              }
            </g>
          `;
        }

        if (isTeacher) {
          const h = b.creditsSpent > 0 ? Math.max(3, Math.round((b.creditsSpent / maxVal) * plotHeight)) : 2;
          const y = plotBottom - h;
          const x = Math.round(cx - barMaxW / 2);
          return `
            <g class="pk-an-svg-col-group">
              <title>${esc(b.fullLabel)}: ${b.creditsSpent.toLocaleString()} credits spent</title>
              <rect x="${x}" y="${y}" width="${barMaxW}" height="${h}" rx="2.5" class="${
            b.creditsSpent > 0 ? 'pk-an-svg-bar-spent' : 'pk-an-svg-bar-empty'
          }" />
              ${
                b.label
                  ? `<text x="${Math.round(cx)}" y="${height - 8}" text-anchor="middle" class="pk-an-svg-axis-text">${esc(
                      b.label
                    )}</text>`
                  : ''
              }
            </g>
          `;
        }

        // Student dual bar: Spent vs Earned
        const pairW = Math.max(3, Math.floor((barMaxW - 2) / 2));
        const hSpent = b.coinsSpent > 0 ? Math.max(3, Math.round((b.coinsSpent / maxVal) * plotHeight)) : 2;
        const hEarned = b.coinsEarned > 0 ? Math.max(3, Math.round((b.coinsEarned / maxVal) * plotHeight)) : 2;
        const xSpent = Math.round(cx - pairW - 1);
        const xEarned = Math.round(cx + 1);
        return `
          <g class="pk-an-svg-col-group">
            <title>${esc(b.fullLabel)} — Spent: ${b.coinsSpent.toLocaleString()} | Earned: +${b.coinsEarned.toLocaleString()}</title>
            <rect x="${xSpent}" y="${plotBottom - hSpent}" width="${pairW}" height="${hSpent}" rx="2" class="${
          b.coinsSpent > 0 ? 'pk-an-svg-bar-spent' : 'pk-an-svg-bar-empty'
        }" />
            <rect x="${xEarned}" y="${plotBottom - hEarned}" width="${pairW}" height="${hEarned}" rx="2" class="${
          b.coinsEarned > 0 ? 'pk-an-svg-bar-earned' : 'pk-an-svg-bar-empty'
        }" />
            ${
              b.label
                ? `<text x="${Math.round(cx)}" y="${height - 8}" text-anchor="middle" class="pk-an-svg-axis-text">${esc(
                    b.label
                  )}</text>`
                : ''
            }
          </g>
        `;
      })
      .join('');

    return `<svg viewBox="0 0 ${width} ${height}" class="pk-an-svg-chart" role="img" aria-label="${
      mode === 'time' ? 'Time spent chart' : 'Credits and coins usage chart'
    }">${gridSvg}${colsSvg}</svg>`;
  }

  // ---- UI State & Rendering ----
  const uiState = {
    role: 'teacher',
    period: 'week',
    selectedUser: '__all__',
    searchQuery: '',
  };

  function renderAdminAnalytics() {
    const host = document.getElementById('admin-subtab-analytics');
    if (!host) return;

    const data = computeAnalyticsDataset(uiState.role, uiState.selectedUser, uiState.period);
    const isTeacher = uiState.role === 'teacher';
    const periodLabel =
      uiState.period === 'week'
        ? 'Last 7 Days'
        : uiState.period === 'month'
        ? 'Last 30 Days'
        : 'Last 12 Months';

    const filteredUsers = data.userDirectory.filter(
      (u) =>
        !uiState.searchQuery ||
        normalizeIdentity(u.name).includes(normalizeIdentity(uiState.searchQuery)) ||
        normalizeIdentity(u.meta).includes(normalizeIdentity(uiState.searchQuery))
    );

    if (
      uiState.selectedUser !== '__all__' &&
      !data.userDirectory.some((u) => u.key === uiState.selectedUser)
    ) {
      uiState.selectedUser = '__all__';
    }

    const selectedUserObj =
      uiState.selectedUser === '__all__'
        ? null
        : data.userDirectory.find((u) => u.key === uiState.selectedUser);

    const topFeature =
      data.rankedFeatures.find((f) => f.seconds > 0 || f.visits > 0) || data.rankedFeatures[0];

    const activeUsersCount = data.userDirectory.filter(
      (u) => u.seconds > 0 || u.creditsSpent > 0 || u.coinsEarned > 0 || u.coinsSpent > 0
    ).length;

    const maxFeatureScore = Math.max(
      1,
      ...data.rankedFeatures.map((f) => f.seconds + f.visits * 60)
    );

    const ledgerItemsHtml = Object.entries(data.creditActions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(
        ([act, val]) =>
          `<span class="pk-an-ledger-item"><span>${esc(act)}:</span><strong>${Number(val).toLocaleString()}</strong></span>`
      )
      .join('');

    const teacherCount = safe(() => getTeachers().length, 0);
    const studentCount = safe(() => getAllStudents().length, 0);

    host.innerHTML = `
      <div class="pk-an-workspace">
        <header class="pk-an-header">
          <div class="pk-an-header-top">
            <div class="pk-an-title-stack">
              <p class="pk-an-eyebrow">Admin Hub · Usage &amp; Credit Telemetry · ${esc(periodLabel)}</p>
              <h3 class="pk-an-title">
                ${
                  selectedUserObj
                    ? `${esc(selectedUserObj.name)} — ${isTeacher ? 'Teacher' : 'Student'} Analytics`
                    : `${isTeacher ? 'Teacher' : 'Student'} Analytics Overview`
                }
              </h3>
            </div>

            <div class="pk-an-segmented" role="tablist" aria-label="Time range">
              <button type="button" class="pk-an-seg-btn ${uiState.period === 'week' ? 'is-active' : ''}" data-an-period="week" aria-selected="${uiState.period === 'week'}">7D</button>
              <button type="button" class="pk-an-seg-btn ${uiState.period === 'month' ? 'is-active' : ''}" data-an-period="month" aria-selected="${uiState.period === 'month'}">30D</button>
              <button type="button" class="pk-an-seg-btn ${uiState.period === 'year' ? 'is-active' : ''}" data-an-period="year" aria-selected="${uiState.period === 'year'}">12M</button>
            </div>
          </div>

          <div class="pk-an-toolbar">
            <div class="pk-an-toolbar-left">
              <div class="pk-an-segmented" role="tablist" aria-label="Account type">
                <button type="button" class="pk-an-seg-btn ${isTeacher ? 'is-active' : ''}" data-an-role="teacher" aria-selected="${isTeacher}">
                  <span>Teachers</span>
                  <span class="pk-an-seg-count">${teacherCount}</span>
                </button>
                <button type="button" class="pk-an-seg-btn ${!isTeacher ? 'is-active' : ''}" data-an-role="student" aria-selected="${!isTeacher}">
                  <span>Students</span>
                  <span class="pk-an-seg-count">${studentCount}</span>
                </button>
              </div>

              <div class="pk-an-filter-group">
                <input
                  type="search"
                  id="pk-analytics-search"
                  class="pk-an-input"
                  placeholder="Filter by name..."
                  value="${esc(uiState.searchQuery)}"
                  aria-label="Filter ${isTeacher ? 'teachers' : 'students'}"
                >
                <select id="pk-analytics-user-select" class="pk-an-select" aria-label="Select specific ${isTeacher ? 'teacher' : 'student'}">
                  <option value="__all__" ${uiState.selectedUser === '__all__' ? 'selected' : ''}>
                    All ${isTeacher ? 'Teachers' : 'Students'} (${filteredUsers.length})
                  </option>
                  ${filteredUsers
                    .map(
                      (u) =>
                        `<option value="${esc(u.key)}" ${uiState.selectedUser === u.key ? 'selected' : ''}>${esc(
                          u.name
                        )}${u.meta ? ` · ${esc(u.meta)}` : ''}</option>`
                    )
                    .join('')}
                </select>
              </div>
            </div>

            ${
              selectedUserObj
                ? `<div class="pk-an-toolbar-right">
                     <button type="button" class="pk-an-reset-btn" data-an-reset-user="1">All ${
                       isTeacher ? 'Teachers' : 'Students'
                     }</button>
                   </div>`
                : ''
            }
          </div>
        </header>

        <!-- Unified 4-Column KPI Strip -->
        <section class="pk-an-kpi-strip" aria-label="Summary metrics">
          <div class="pk-an-kpi-cell">
            <p class="pk-an-kpi-label"><span>Active Time</span>${ICONS.clock}</p>
            <div class="pk-an-kpi-value">${formatDuration(data.totalSeconds)}</div>
            <p class="pk-an-kpi-meta">
              Avg ${formatDuration(
                Math.round(
                  data.totalSeconds /
                    Math.max(1, uiState.period === 'week' ? 7 : uiState.period === 'month' ? 30 : 12)
                )
              )} / ${uiState.period === 'year' ? 'mo' : 'day'}
            </p>
          </div>

          <div class="pk-an-kpi-cell">
            <p class="pk-an-kpi-label">
              <span>${isTeacher ? 'Credits Spent' : 'Coins Spent / Earned'}</span>
              ${ICONS.credit}
            </p>
            <div class="pk-an-kpi-value">
              ${
                isTeacher
                  ? data.totalCreditsSpent.toLocaleString()
                  : `${data.totalCoinsSpent.toLocaleString()} / +${data.totalCoinsEarned.toLocaleString()}`
              }
            </div>
            <p class="pk-an-kpi-meta">
              ${
                isTeacher
                  ? `${Object.keys(data.creditActions).length} active categories`
                  : 'Shop & claims vs. classroom rewards'
              }
            </p>
          </div>

          <div class="pk-an-kpi-cell">
            <p class="pk-an-kpi-label"><span>Top Feature</span>${ICONS.layers}</p>
            <div class="pk-an-kpi-value is-text">
              ${
                topFeature && (topFeature.seconds > 0 || topFeature.visits > 0)
                  ? esc(topFeature.label)
                  : 'No activity recorded'
              }
            </div>
            <p class="pk-an-kpi-meta">
              ${
                topFeature && (topFeature.seconds > 0 || topFeature.visits > 0)
                  ? `${formatDuration(topFeature.seconds)} · ${topFeature.visits} sessions`
                  : 'Awaiting session telemetry'
              }
            </p>
          </div>

          <div class="pk-an-kpi-cell">
            <p class="pk-an-kpi-label">
              <span>${selectedUserObj ? 'Active Days' : `Active ${isTeacher ? 'Teachers' : 'Students'}`}</span>
              ${ICONS.users}
            </p>
            <div class="pk-an-kpi-value">
              ${
                selectedUserObj
                  ? `${selectedUserObj.activeDaysCount}d`
                  : `${activeUsersCount} / ${data.userDirectory.length}`
              }
            </div>
            <p class="pk-an-kpi-meta">
              ${
                selectedUserObj
                  ? esc(selectedUserObj.meta || 'Tracked in window')
                  : `${
                      data.userDirectory.length
                        ? Math.round((activeUsersCount / data.userDirectory.length) * 100)
                        : 0
                    }% active in ${esc(periodLabel.toLowerCase())}`
              }
            </p>
          </div>
        </section>

        <!-- 2-Column SVG Charts Grid -->
        <div class="pk-an-charts-grid">
          <section class="pk-an-panel" aria-label="Time spent chart">
            <div class="pk-an-panel-head">
              <div>
                <h4 class="pk-an-panel-title">Time Spent (${esc(periodLabel)})</h4>
                <p class="pk-an-panel-sub">Active session duration (auto-pauses after 2m idle)</p>
              </div>
              <div class="pk-an-legend">
                <span class="pk-an-legend-item">
                  <span class="pk-an-legend-swatch" style="background:var(--color-brand-secondary, #5b8def)"></span>
                  <span>Duration</span>
                </span>
              </div>
            </div>
            <div class="pk-an-chart-body">
              ${buildSvgChart(data.timeline, 'time', isTeacher)}
            </div>
          </section>

          <section class="pk-an-panel" aria-label="Credit usage chart">
            <div class="pk-an-panel-head">
              <div>
                <h4 class="pk-an-panel-title">
                  ${isTeacher ? 'Credits Spent' : 'Coins Spent vs. Earned'} (${esc(periodLabel)})
                </h4>
                <p class="pk-an-panel-sub">
                  ${
                    isTeacher
                      ? 'Credits deducted for awards, gifts, and quizzes'
                      : 'Shop & battle claim spend vs. earned rewards'
                  }
                </p>
              </div>
              <div class="pk-an-legend">
                ${
                  isTeacher
                    ? `<span class="pk-an-legend-item">
                         <span class="pk-an-legend-swatch" style="background:var(--color-brand, #f4c542)"></span>
                         <span>Spent</span>
                       </span>`
                    : `<span class="pk-an-legend-item">
                         <span class="pk-an-legend-swatch" style="background:var(--color-brand, #f4c542)"></span>
                         <span>Spent</span>
                       </span>
                       <span class="pk-an-legend-item">
                         <span class="pk-an-legend-swatch" style="background:var(--color-success, #42c98a)"></span>
                         <span>Earned</span>
                       </span>`
                }
              </div>
            </div>
            <div class="pk-an-chart-body">
              ${buildSvgChart(data.timeline, 'credit', isTeacher)}
              ${ledgerItemsHtml ? `<div class="pk-an-ledger-strip">${ledgerItemsHtml}</div>` : ''}
            </div>
          </section>
        </div>

        <!-- Structured Feature Utilization Table -->
        <section class="pk-an-panel" aria-label="Feature utilization breakdown">
          <div class="pk-an-panel-head">
            <div>
              <h4 class="pk-an-panel-title">Feature Utilization (${esc(periodLabel)})</h4>
              <p class="pk-an-panel-sub">
                Ranked by active duration and session count across ${
                  isTeacher ? 'Classroom & Teacher Zone modules' : 'Student Dashboard modules'
                }
              </p>
            </div>
          </div>
          <div class="pk-an-table-wrap">
            <table class="pk-an-table">
              <thead>
                <tr>
                  <th style="width:48px">#</th>
                  <th>Feature Module</th>
                  <th style="width:220px">Share of Time</th>
                  <th class="is-num" style="width:120px">Active Time</th>
                  <th class="is-num" style="width:110px">Sessions</th>
                </tr>
              </thead>
              <tbody>
                ${data.rankedFeatures
                  .map((f, idx) => {
                    const score = f.seconds + f.visits * 60;
                    const barPct =
                      score > 0 ? Math.max(3, Math.min(100, Math.round((score / maxFeatureScore) * 100))) : 0;
                    const sharePct =
                      data.totalSeconds > 0 ? Math.round((f.seconds / data.totalSeconds) * 100) : 0;
                    return `
                      <tr>
                        <td><span class="pk-an-rank-num">${String(idx + 1).padStart(2, '0')}</span></td>
                        <td><span class="pk-an-feat-name">${esc(f.label)}</span></td>
                        <td>
                          <div class="pk-an-share-cell">
                            <div class="pk-an-bar-track" aria-hidden="true">
                              <div class="pk-an-bar-fill" style="width:${barPct}%"></div>
                            </div>
                            <span class="pk-an-share-pct">${sharePct}%</span>
                          </div>
                        </td>
                        <td class="is-num">${formatDuration(f.seconds)}</td>
                        <td class="is-num pk-an-muted">${f.visits.toLocaleString()}</td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <!-- Structured Per-User Directory Table -->
        <section class="pk-an-panel" aria-label="${isTeacher ? 'Teacher' : 'Student'} breakdown">
          <div class="pk-an-panel-head">
            <div>
              <h4 class="pk-an-panel-title">${isTeacher ? 'Teacher' : 'Student'} Directory (${esc(periodLabel)})</h4>
              <p class="pk-an-panel-sub">Select any row to filter all charts to that individual account</p>
            </div>
          </div>
          <div class="pk-an-table-wrap">
            <table class="pk-an-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>${isTeacher ? 'Role' : 'School / Class'}</th>
                  <th>Top Feature</th>
                  <th class="is-num">Active Days</th>
                  <th class="is-num">Active Time</th>
                  <th class="is-num">${isTeacher ? 'Credits Spent' : 'Spent / Earned'}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filteredUsers.length
                    ? filteredUsers
                        .map(
                          (u) => `
                        <tr class="is-interactive" data-an-pick-user="${esc(u.key)}" tabindex="0" role="button" aria-label="Inspect ${esc(u.name)}">
                          <td><span class="pk-an-feat-name">${esc(u.name)}</span></td>
                          <td><span class="pk-an-badge">${esc(u.meta || '—')}</span></td>
                          <td class="pk-an-muted">${esc(u.topFeatureLabel)}</td>
                          <td class="is-num pk-an-muted">${u.activeDaysCount}d</td>
                          <td class="is-num">${formatDuration(u.seconds)}</td>
                          <td class="is-num">
                            ${
                              isTeacher
                                ? u.creditsSpent.toLocaleString()
                                : `${u.coinsSpent.toLocaleString()} / +${u.coinsEarned.toLocaleString()}`
                            }
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                    : `<tr><td colspan="6" class="pk-an-muted" style="text-align:center;padding:24px;">No matching ${
                        isTeacher ? 'teachers' : 'students'
                      } found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;

    host.querySelectorAll('[data-an-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        uiState.period = btn.dataset.anPeriod;
        renderAdminAnalytics();
      });
    });

    host.querySelectorAll('[data-an-role]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (uiState.role === btn.dataset.anRole) return;
        uiState.role = btn.dataset.anRole;
        uiState.selectedUser = '__all__';
        uiState.searchQuery = '';
        renderAdminAnalytics();
      });
    });

    host.querySelector('#pk-analytics-user-select')?.addEventListener('change', (e) => {
      uiState.selectedUser = e.target.value;
      renderAdminAnalytics();
    });

    const searchInput = host.querySelector('#pk-analytics-search');
    searchInput?.addEventListener('input', (e) => {
      uiState.searchQuery = e.target.value;
      const pos = e.target.selectionStart || 0;
      renderAdminAnalytics();
      const nextInput = document.getElementById('pk-analytics-search');
      if (nextInput) {
        nextInput.focus();
        safe(() => nextInput.setSelectionRange(pos, pos));
      }
    });

    host.querySelector('[data-an-reset-user]')?.addEventListener('click', () => {
      uiState.selectedUser = '__all__';
      renderAdminAnalytics();
    });

    host.querySelectorAll('[data-an-pick-user]').forEach((row) => {
      const activate = () => {
        uiState.selectedUser = row.dataset.anPickUser;
        renderAdminAnalytics();
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      row.addEventListener('click', activate);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function selectAnalyticsSubtab() {
    if (safe(() => activeMainTab) === 'teacher-zone') return;
    if (!safe(() => canAccessAdmin(), false)) {
      document.querySelector('[data-tab="dashboard"]')?.click();
      return;
    }
    document.querySelectorAll('.admin-sub-tab').forEach((tab) => {
      const active = tab.dataset.subtab === 'analytics';
      tab.classList.toggle('admin-sub-tab-active', active);
      tab.classList.toggle('admin-sub-tab-inactive', !active);
    });
    document.querySelectorAll('.admin-subtab-content').forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== 'admin-subtab-analytics');
    });
    renderAdminAnalytics();
  }

  window.renderAdminAnalytics = renderAdminAnalytics;
  window.selectAnalyticsSubtab = selectAnalyticsSubtab;

  function initAnalyticsBindings() {
    document.querySelectorAll('.admin-sub-tab[data-subtab="analytics"]').forEach((tab) => {
      if (tab.dataset.analyticsBound === '1') return;
      tab.dataset.analyticsBound = '1';
      tab.addEventListener('click', () => selectAnalyticsSubtab());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalyticsBindings);
  } else {
    initAnalyticsBindings();
  }
})();
