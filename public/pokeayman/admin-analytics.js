/* Admin Hub Analytics: Smart Active Timer, Feature Tracker, Historical Backfill & Week/Month/Year Charts */
(function () {
  const IDLE_LIMIT_MS = 120 * 1000; // 2 minutes idle cutoff
  const FLUSH_INTERVAL_MS = 30 * 1000; // sync to dataSdk every 30s
  const LOCAL_CACHE_KEY = 'pokeayman-analytics-buffer-v1';

  const TEACHER_FEATURES = [
    { key: 'roster', icon: '👩‍🎓', label: 'Class Roster & Awards' },
    { key: 'quiz', icon: '📝', label: 'Quizzes' },
    { key: 'vocab', icon: '📚', label: 'Class Vocabulary' },
    { key: 'games', icon: '🎮', label: 'Classroom Games' },
    { key: 'battle', icon: '⚔️', label: 'Battle Arena' },
    { key: 'schedule', icon: '🗓️', label: 'Teacher Zone · Schedule' },
    { key: 'financial', icon: '💰', label: 'Teacher Zone · Financial' },
    { key: 'vb', icon: '🔖', label: 'Teacher Zone · Word Bank (VB)' },
    { key: 'claims', icon: '🛡️', label: 'Teacher Zone · Battle Claims' },
  ];

  const STUDENT_FEATURES = [
    { key: 'collection', icon: '📚', label: 'Pokémon Collection' },
    { key: 'shop', icon: '🛍️', label: 'Pokémon Shop' },
    { key: 'catchdex', icon: '🎯', label: 'Catchdex (Listen & Catch)' },
    { key: 'quizzes', icon: '❓', label: 'Class Quizzes' },
    { key: 'vocabulary', icon: '📖', label: 'Vocabulary Flashcards' },
    { key: 'games', icon: '🎮', label: 'Games & Poké Battle' },
  ];

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

  function formatShortDuration(totalSeconds) {
    const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (secs === 0) return '';
    const mins = Math.max(1, Math.round(secs / 60));
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1).replace(/\.0$/, '');
    return `${hrs}h`;
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
      // Keep dirtyKeys for next retry
    } finally {
      syncInFlight = false;
    }
  }

  // Interaction listeners for Smart Active Timer
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
        const label = i % 3 === 0 || i === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getDate()}`;
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

    // Seed directory with known Teachers or Students
    if (role === 'teacher') {
      const teachers = safe(() => getTeachers(), []) || [];
      teachers.forEach((t) => {
        if (!t.teacher_name) return;
        const roleTag = t.teacher_name === 'Ayman' ? 'Admin' : t.teacher_pro ? 'Pro Teacher' : 'Teacher';
        ensureUserSummary(t.teacher_name, t.teacher_name, roleTag);
      });
    } else {
      const students = safe(() => getAllStudents(), []) || [];
      students.forEach((s) => {
        if (!s.student_name) return;
        const meta = [s.school_name, s.class_name].filter(Boolean).join(' · ') || 'Student';
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

    // 1. Collect persisted + local `user_analytics` daily maps per user
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

    // Apply tracked daily data
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

    // Helper to record historical backfill activity when live telemetry isn't recorded for that event
    const addHistoricalActivity = (uKey, uName, dayKey, fKey, estSeconds, trackedFlag) => {
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

    // 2. Scan existing records in `allData` for Credits / Coins & Historical Feature Backfill
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
        // STUDENT ANALYTICS
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
              label: meta ? `${meta.icon} ${meta.label}` : fKey,
              score,
            };
          }
        });
        return {
          ...u,
          activeDaysCount: u.activeDays.size,
          topFeatureLabel: topFeat ? topFeat.label : 'No activity yet',
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

  // ---- UI State & Rendering ----
  const uiState = {
    role: 'teacher', // 'teacher' | 'student'
    period: 'week', // 'week' | 'month' | 'year'
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

    const maxTimeVal = Math.max(60, ...data.timeline.map((b) => b.seconds));
    const maxCreditVal = Math.max(
      10,
      ...data.timeline.map((b) => (isTeacher ? b.creditsSpent : Math.max(b.coinsEarned, b.coinsSpent)))
    );
    const maxFeatureScore = Math.max(
      1,
      ...data.rankedFeatures.map((f) => f.seconds + f.visits * 60)
    );

    const actionChipsHtml = Object.entries(data.creditActions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(
        ([act, val]) =>
          `<span class="pk-credit-chip"><span>${esc(act)}</span><strong>${Number(val).toLocaleString()} ${
            isTeacher ? '💳' : '🪙'
          }</strong></span>`
      )
      .join('');

    host.innerHTML = `
      <div class="pk-analytics-shell">
        <header class="pk-analytics-toolbar">
          <div class="pk-analytics-toolbar-top">
            <div class="pk-analytics-title-group">
              <span class="pk-analytics-kicker">ADMIN INTELLIGENCE · ${esc(periodLabel.toUpperCase())}</span>
              <h3 class="pk-analytics-heading">
                ${
                  selectedUserObj
                    ? `${isTeacher ? '👨‍🏫' : '👩‍🎓'} ${esc(selectedUserObj.name)} — Analytics`
                    : `${isTeacher ? '👨‍🏫 Teacher' : '👩‍🎓 Student'} Engagement & Credit Analytics`
                }
              </h3>
              <p class="pk-analytics-subtitle">
                Track active time spent, ${isTeacher ? 'credits used' : 'coins earned & spent'}, and top features across Week, Month, and Year.
              </p>
            </div>
            <div class="pk-analytics-segmented pk-analytics-period-group" role="tablist" aria-label="Analytics time range">
              <button type="button" class="pk-analytics-seg-btn ${uiState.period === 'week' ? 'is-active' : ''}" data-an-period="week">Last Week</button>
              <button type="button" class="pk-analytics-seg-btn ${uiState.period === 'month' ? 'is-active' : ''}" data-an-period="month">Last Month</button>
              <button type="button" class="pk-analytics-seg-btn ${uiState.period === 'year' ? 'is-active' : ''}" data-an-period="year">Last Year</button>
            </div>
          </div>

          <div class="pk-analytics-controls-row">
            <div class="pk-analytics-segmented" role="tablist" aria-label="Select user role">
              <button type="button" class="pk-analytics-seg-btn ${isTeacher ? 'is-active' : ''}" data-an-role="teacher">👨‍🏫 Teachers (${
      safe(() => getTeachers().length, 0)
    })</button>
              <button type="button" class="pk-analytics-seg-btn ${!isTeacher ? 'is-active' : ''}" data-an-role="student">👩‍🎓 Students (${
      safe(() => getAllStudents().length, 0)
    })</button>
            </div>

            <div class="pk-analytics-user-filter">
              <input
                type="search"
                id="pk-analytics-search"
                class="pk-analytics-search-input"
                placeholder="Filter ${isTeacher ? 'teacher' : 'student'}..."
                value="${esc(uiState.searchQuery)}"
                aria-label="Filter ${isTeacher ? 'teachers' : 'students'}"
              >
              <select id="pk-analytics-user-select" class="pk-analytics-user-select" aria-label="Select specific ${
                isTeacher ? 'teacher' : 'student'
              }">
                <option value="__all__" ${uiState.selectedUser === '__all__' ? 'selected' : ''}>
                  All ${isTeacher ? 'Teachers' : 'Students'} (${filteredUsers.length})
                </option>
                ${filteredUsers
                  .map(
                    (u) =>
                      `<option value="${esc(u.key)}" ${uiState.selectedUser === u.key ? 'selected' : ''}>${esc(
                        u.name
                      )}${u.meta ? ` (${esc(u.meta)})` : ''}</option>`
                  )
                  .join('')}
              </select>
            </div>

            ${
              selectedUserObj
                ? `<button type="button" class="pk-analytics-seg-btn is-active" data-an-reset-user="1">← Show All ${
                    isTeacher ? 'Teachers' : 'Students'
                  }</button>`
                : ''
            }
          </div>
        </header>

        <!-- KPI Summary Row -->
        <section class="pk-analytics-kpi-grid" aria-label="Key metrics summary">
          <article class="pk-analytics-kpi-card">
            <div class="pk-analytics-kpi-head">
              <span class="pk-analytics-kpi-label">Time Spent (${esc(periodLabel)})</span>
              <span class="pk-analytics-kpi-icon" aria-hidden="true">⏱️</span>
            </div>
            <div class="pk-analytics-kpi-value">${formatDuration(data.totalSeconds)}</div>
            <div class="pk-analytics-kpi-sub">
              Avg ${formatDuration(
                Math.round(data.totalSeconds / Math.max(1, uiState.period === 'week' ? 7 : uiState.period === 'month' ? 30 : 12))
              )} per ${uiState.period === 'year' ? 'month' : 'day'}
            </div>
          </article>

          <article class="pk-analytics-kpi-card">
            <div class="pk-analytics-kpi-head">
              <span class="pk-analytics-kpi-label">${
                isTeacher ? 'Credits Used' : 'Coins Spent / Earned'
              }</span>
              <span class="pk-analytics-kpi-icon" aria-hidden="true">${isTeacher ? '💳' : '🪙'}</span>
            </div>
            <div class="pk-analytics-kpi-value">
              ${
                isTeacher
                  ? `${data.totalCreditsSpent.toLocaleString()} 💳`
                  : `${data.totalCoinsSpent.toLocaleString()} / +${data.totalCoinsEarned.toLocaleString()}`
              }
            </div>
            <div class="pk-analytics-kpi-sub">
              ${
                isTeacher
                  ? `Spent across classroom rewards & quizzes`
                  : `Spent in Shop & Claims vs. Earned`
              }
            </div>
          </article>

          <article class="pk-analytics-kpi-card">
            <div class="pk-analytics-kpi-head">
              <span class="pk-analytics-kpi-label">Most Used Feature</span>
              <span class="pk-analytics-kpi-icon" aria-hidden="true">${topFeature ? topFeature.icon : '🔥'}</span>
            </div>
            <div class="pk-analytics-kpi-value" style="font-size:1.18rem;">
              ${topFeature && (topFeature.seconds > 0 || topFeature.visits > 0) ? esc(topFeature.label) : 'No feature data yet'}
            </div>
            <div class="pk-analytics-kpi-sub">
              ${
                topFeature && (topFeature.seconds > 0 || topFeature.visits > 0)
                  ? `${formatDuration(topFeature.seconds)} spent · ${topFeature.visits} uses`
                  : 'Opens & active time will appear here'
              }
            </div>
          </article>

          <article class="pk-analytics-kpi-card">
            <div class="pk-analytics-kpi-head">
              <span class="pk-analytics-kpi-label">${
                selectedUserObj ? 'Active Days' : `Active ${isTeacher ? 'Teachers' : 'Students'}`
              }</span>
              <span class="pk-analytics-kpi-icon" aria-hidden="true">📈</span>
            </div>
            <div class="pk-analytics-kpi-value">
              ${
                selectedUserObj
                  ? `${selectedUserObj.activeDaysCount} day${selectedUserObj.activeDaysCount === 1 ? '' : 's'}`
                  : `${activeUsersCount} / ${data.userDirectory.length}`
              }
            </div>
            <div class="pk-analytics-kpi-sub">
              ${
                selectedUserObj
                  ? esc(selectedUserObj.meta || 'Tracked in selected range')
                  : `With recorded activity in ${esc(periodLabel.toLowerCase())}`
              }
            </div>
          </article>
        </section>

        <!-- Charts Grid -->
        <div class="pk-analytics-charts-grid">
          <!-- Chart 1: Time Spent Graph -->
          <section class="pk-analytics-card" aria-label="Time spent chart">
            <div class="pk-analytics-card-header">
              <div>
                <h4 class="pk-analytics-card-title"><span>⏱️</span><span>Time Spent on App (${esc(periodLabel)})</span></h4>
                <p class="pk-analytics-card-desc">Active time tracked while using features (pauses automatically when idle).</p>
              </div>
              <div class="pk-analytics-legend">
                <span class="pk-analytics-legend-item"><span class="pk-analytics-legend-dot" style="background:#38bdf8"></span>Active Time</span>
              </div>
            </div>
            <div class="pk-chart-timeline">
              <div class="pk-chart-bars-wrap">
                ${data.timeline
                  .map((b) => {
                    const pct = b.seconds > 0 ? Math.max(8, Math.round((b.seconds / maxTimeVal) * 100)) : 3;
                    const topVal = formatShortDuration(b.seconds);
                    return `
                      <div class="pk-chart-col" title="${esc(b.fullLabel)}: ${formatDuration(b.seconds)}">
                        <span class="pk-chart-val-top">${esc(topVal)}</span>
                        <div class="pk-chart-col-bars">
                          <div class="pk-chart-bar ${b.seconds > 0 ? 'is-time' : 'is-zero'}" style="height:${pct}%"></div>
                        </div>
                        <span class="pk-chart-label">${esc(b.label)}</span>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          </section>

          <!-- Chart 2: Credit / Coin Usage Graph -->
          <section class="pk-analytics-card" aria-label="Credit usage chart">
            <div class="pk-analytics-card-header">
              <div>
                <h4 class="pk-analytics-card-title">
                  <span>${isTeacher ? '💳' : '🪙'}</span>
                  <span>${isTeacher ? 'Credits Used' : 'Coins Spent vs. Earned'} (${esc(periodLabel)})</span>
                </h4>
                <p class="pk-analytics-card-desc">
                  ${
                    isTeacher
                      ? 'Teacher credits spent on student awards, class gifts, and quizzes.'
                      : 'Comparison of coins spent in the Shop/Claims vs. coins earned from classes.'
                  }
                </p>
              </div>
              <div class="pk-analytics-legend">
                ${
                  isTeacher
                    ? `<span class="pk-analytics-legend-item"><span class="pk-analytics-legend-dot" style="background:#fbbf24"></span>Credits Spent</span>`
                    : `<span class="pk-analytics-legend-item"><span class="pk-analytics-legend-dot" style="background:#fbbf24"></span>Spent</span>
                       <span class="pk-analytics-legend-item"><span class="pk-analytics-legend-dot" style="background:#34d399"></span>Earned</span>`
                }
              </div>
            </div>
            <div class="pk-chart-timeline">
              <div class="pk-chart-bars-wrap">
                ${data.timeline
                  .map((b) => {
                    if (isTeacher) {
                      const pct =
                        b.creditsSpent > 0 ? Math.max(8, Math.round((b.creditsSpent / maxCreditVal) * 100)) : 3;
                      return `
                        <div class="pk-chart-col" title="${esc(b.fullLabel)}: ${b.creditsSpent.toLocaleString()} credits spent">
                          <span class="pk-chart-val-top">${b.creditsSpent > 0 ? b.creditsSpent.toLocaleString() : ''}</span>
                          <div class="pk-chart-col-bars">
                            <div class="pk-chart-bar ${b.creditsSpent > 0 ? 'is-spent' : 'is-zero'}" style="height:${pct}%"></div>
                          </div>
                          <span class="pk-chart-label">${esc(b.label)}</span>
                        </div>
                      `;
                    }
                    const spentPct =
                      b.coinsSpent > 0 ? Math.max(8, Math.round((b.coinsSpent / maxCreditVal) * 100)) : 3;
                    const earnedPct =
                      b.coinsEarned > 0 ? Math.max(8, Math.round((b.coinsEarned / maxCreditVal) * 100)) : 3;
                    const topLabel =
                      b.coinsSpent > 0 || b.coinsEarned > 0
                        ? `${b.coinsSpent || 0}/${b.coinsEarned || 0}`
                        : '';
                    return `
                      <div class="pk-chart-col" title="${esc(b.fullLabel)} — Spent: ${b.coinsSpent.toLocaleString()} 🪙 | Earned: +${b.coinsEarned.toLocaleString()} 🪙">
                        <span class="pk-chart-val-top">${esc(topLabel)}</span>
                        <div class="pk-chart-col-bars">
                          <div class="pk-chart-bar ${b.coinsSpent > 0 ? 'is-spent' : 'is-zero'}" style="height:${spentPct}%"></div>
                          <div class="pk-chart-bar ${b.coinsEarned > 0 ? 'is-earned' : 'is-zero'}" style="height:${earnedPct}%"></div>
                        </div>
                        <span class="pk-chart-label">${esc(b.label)}</span>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
              ${actionChipsHtml ? `<div class="pk-credit-breakdown">${actionChipsHtml}</div>` : ''}
            </div>
          </section>

          <!-- Chart 3: Most Used Features Breakdown -->
          <section class="pk-analytics-card is-full" aria-label="Most used features">
            <div class="pk-analytics-card-header">
              <div>
                <h4 class="pk-analytics-card-title"><span>🔥</span><span>Most Used Features (${esc(periodLabel)})</span></h4>
                <p class="pk-analytics-card-desc">
                  Ranked by active time spent and number of visits/actions across ${
                    isTeacher
                      ? 'Classroom & Teacher Zone (Financial, Word Bank/VB, Schedule, Games, Quizzes)'
                      : 'Student Dashboard (Shop, Collection, Catchdex, Vocabulary, Quizzes, Games)'
                  }.
                </p>
              </div>
            </div>
            <div class="pk-feature-list">
              ${data.rankedFeatures
                .map((f, idx) => {
                  const score = f.seconds + f.visits * 60;
                  const pct = score > 0 ? Math.max(4, Math.min(100, Math.round((score / maxFeatureScore) * 100))) : 0;
                  const sharePct =
                    data.totalSeconds > 0 ? Math.round((f.seconds / data.totalSeconds) * 100) : 0;
                  return `
                    <div class="pk-feature-row">
                      <div class="pk-feature-row-top">
                        <span class="pk-feature-name">
                          <span class="pk-feature-rank-badge">#${idx + 1}</span>
                          <span aria-hidden="true">${f.icon}</span>
                          <span>${esc(f.label)}</span>
                        </span>
                        <span class="pk-feature-metrics">
                          <span>⏱️ ${formatDuration(f.seconds)}</span>
                          <span class="pk-feature-pill">${f.visits} ${f.visits === 1 ? 'use' : 'uses'}</span>
                          ${sharePct > 0 ? `<span>${sharePct}% of time</span>` : ''}
                        </span>
                      </div>
                      <div class="pk-feature-track" aria-hidden="true">
                        <div class="pk-feature-fill" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>

          <!-- Per-User Breakdown / Quick Drilldown Directory -->
          <section class="pk-analytics-card is-full" aria-label="${isTeacher ? 'Teacher' : 'Student'} breakdown">
            <div class="pk-analytics-card-header">
              <div>
                <h4 class="pk-analytics-card-title">
                  <span>${isTeacher ? '👨‍🏫' : '👩‍🎓'}</span>
                  <span>${isTeacher ? 'Teachers' : 'Students'} Breakdown (${esc(periodLabel)})</span>
                </h4>
                <p class="pk-analytics-card-desc">Click any ${
                  isTeacher ? 'teacher' : 'student'
                } below to drill down into their individual graphs.</p>
              </div>
            </div>
            <div class="pk-analytics-roster-list">
              ${
                filteredUsers.length
                  ? filteredUsers
                      .map(
                        (u) => `
                    <button type="button" class="pk-analytics-user-row" data-an-pick-user="${esc(u.key)}">
                      <div class="pk-analytics-user-row-main">
                        <span class="pk-analytics-user-row-name">${esc(u.name)}</span>
                        <span class="pk-analytics-user-row-meta">${esc(u.meta)} · Top: ${esc(u.topFeatureLabel)}</span>
                      </div>
                      <div class="pk-analytics-user-row-stats">
                        <span class="pk-analytics-user-row-time">⏱️ ${formatDuration(u.seconds)}</span>
                        <span class="pk-analytics-user-row-credits">
                          ${
                            isTeacher
                              ? `${u.creditsSpent.toLocaleString()} 💳 spent`
                              : `${u.coinsSpent.toLocaleString()} spent · +${u.coinsEarned.toLocaleString()} 🪙`
                          }
                        </span>
                      </div>
                    </button>
                  `
                      )
                      .join('')
                  : `<p class="text-sm text-slate-400 py-4">No ${
                      isTeacher ? 'teachers' : 'students'
                    } match your filter.</p>`
              }
            </div>
          </section>
        </div>
      </div>
    `;

    // Wire up interactive controls inside `#admin-subtab-analytics`
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

    host.querySelectorAll('[data-an-pick-user]').forEach((rowBtn) => {
      rowBtn.addEventListener('click', () => {
        uiState.selectedUser = rowBtn.dataset.anPickUser;
        renderAdminAnalytics();
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
