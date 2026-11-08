/**
 * PokéAyman - Grammar Decks & Pattern Cards System
 * Implements Grammar Decks in Class view and Teacher Zone Grammar Bank (School vs Mine).
 */

(function(window) {
  'use strict';

  // Seed starter decks so teachers immediately have rich content to explore & practice
  const STARTER_GRAMMAR_DECKS = [
    {
      __backendId: 'starter-grammar-present-continuous',
      id: 'starter-grammar-present-continuous',
      grammar_deck_id: 'starter-grammar-present-continuous',
      grammar_deck_name: 'Present Continuous (Actions Now)',
      deck_name: 'Present Continuous (Actions Now)',
      school_name: 'Daya Stanford',
      class_name: 'ESL2',
      teacher_name: 'Teacher Ayman',
      owner: 'Teacher Ayman',
      created_by: 'Teacher Ayman',
      created_at: '2026-11-01T10:00:00.000Z',
      cover_image_url: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
      type: 'grammar_deck',
      rules: [
        {
          rule_id: 'pc-rule-1',
          title: 'Actions Happening Right Now (Affirmative)',
          formula: 'Subject + am / is / are + Verb-ing',
          sentence: 'The elephant is walking slowly in the grass.',
          words_blue: 'The elephant',
          words_amber: 'is',
          words_green: 'walking',
          context_clue: 'Right now at this moment',
          image: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
          mistake_bad: 'The elephant walking.',
          mistake_good: 'The elephant is walking.',
          quiz_question: 'Look! The monkeys _____ (climb) the tall tree!',
          quiz_options: ['climbs', 'are climbing', 'is climbing'],
          quiz_answer: 'are climbing'
        },
        {
          rule_id: 'pc-rule-2',
          title: 'Negative Actions (Not Happening)',
          formula: 'Subject + am / is / are + NOT + Verb-ing',
          sentence: 'The dinosaur is not sleeping today.',
          words_blue: 'The dinosaur',
          words_amber: 'is not',
          words_green: 'sleeping',
          context_clue: 'Saying NO to an action right now',
          image: 'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png',
          mistake_bad: 'The dinosaur not sleeping.',
          mistake_good: 'The dinosaur is not sleeping.',
          quiz_question: 'I am busy; I _____ (not watch) TV right now.',
          quiz_options: ['am not watching', 'not watching', "don't watching"],
          quiz_answer: 'am not watching'
        },
        {
          rule_id: 'pc-rule-3',
          title: 'Asking Questions (Word Order Swap)',
          formula: 'Am / Is / Are + Subject + Verb-ing ?',
          sentence: 'Are you studying for the quiz right now?',
          words_blue: 'Are',
          words_amber: 'you',
          words_green: 'studying',
          context_clue: 'Move the helping verb to the front!',
          image: 'https://cdn.pixabay.com/photo/2019/06/13/09/41/business-4271251_640.png',
          mistake_bad: 'You are studying for the quiz?',
          mistake_good: 'Are you studying for the quiz?',
          quiz_question: '_____ Pikachu _____ (eat) an apple right now?',
          quiz_options: ['Is / eating', 'Does / eating', 'Are / eat'],
          quiz_answer: 'Is / eating'
        }
      ]
    },
    {
      __backendId: 'starter-grammar-past-simple',
      id: 'starter-grammar-past-simple',
      grammar_deck_id: 'starter-grammar-past-simple',
      grammar_deck_name: 'Past Simple (-ed & Irregular)',
      deck_name: 'Past Simple (-ed & Irregular)',
      school_name: 'Daya Stanford',
      class_name: 'ESL2',
      teacher_name: 'Teacher Ayman',
      owner: 'Teacher Ayman',
      created_by: 'Teacher Ayman',
      created_at: '2026-11-02T10:00:00.000Z',
      cover_image_url: 'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg',
      type: 'grammar_deck',
      rules: [
        {
          rule_id: 'ps-rule-1',
          title: 'Regular Verbs in the Past (-ed)',
          formula: 'Subject + Verb-ed',
          sentence: 'Yesterday, the students visited the science museum.',
          context_clue: 'Finished action in the past (yesterday, last week)',
          image: 'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg',
          mistake_bad: 'Yesterday, they visit the museum.',
          mistake_good: 'Yesterday, they visited the museum.',
          quiz_question: 'Last night, Ash _____ (watch) the Pokémon battle.',
          quiz_options: ['watches', 'watched', 'watching'],
          quiz_answer: 'watched'
        },
        {
          rule_id: 'ps-rule-2',
          title: 'Irregular Verbs (Word Change)',
          formula: 'Subject + Irregular Past Form',
          sentence: 'She ate a delicious apple this morning.',
          context_clue: 'No -ed! Memorize the special past form (eat -> ate)',
          image: 'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg',
          mistake_bad: 'She eated an apple.',
          mistake_good: 'She ate an apple.',
          quiz_question: 'Yesterday, we _____ (see) a wild Pikachu in the forest.',
          quiz_options: ['seed', 'saw', 'seen'],
          quiz_answer: 'saw'
        }
      ]
    }
  ];

  window.grammarDecksMode = 'mine'; // 'mine' | 'school'

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Helper to extract clean search keywords for grammar rules
  function extractKeywordsForGrammarRule(rule, deck) {
    const sentence = (rule?.sentence || '').trim();
    const title = (rule?.title || '').trim();
    const text = sentence || title || (deck?.grammar_deck_name || deck?.deck_name || '');
    if (!text) return 'grammar';
    const clean = text.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
      'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which',
      'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      'can', 'will', 'just', 'should', 'now', 'today', 'right', 'rule', 'formula', 'practice'
    ]);
    const words = clean.split(' ').filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
    if (words.length >= 2) return `${words[0]} ${words[1]}`;
    if (words.length === 1) return words[0];
    return clean.split(' ').slice(0, 2).join(' ') || 'classroom';
  }

  // Robust photo and clipart search for grammar deck rules
  async function fetchMediaForGrammarSearch(query, type = 'all', page = 1) {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) return { photos: [], hasMore: false };

    // 1. First try backend endpoint
    try {
      const typeParam = type && type !== 'all' ? `&image_type=${encodeURIComponent(type)}` : '';
      const endpoint = `/api/public/pexels?query=${encodeURIComponent(cleanQuery)}${typeParam}&per_page=16&page=${page}`;
      let res;
      if (typeof window !== 'undefined' && typeof window.pexelsFetch === 'function') {
        res = await window.pexelsFetch(endpoint, { headers: { 'Authorization': '' } });
      } else {
        res = await fetch(endpoint);
      }
      if (res && res.ok) {
        const data = await res.json();
        const rawPhotos = Array.isArray(data.photos) ? data.photos : [];
        const photos = rawPhotos.map((p, idx) => {
          let fullUrl = p.src?.large || p.src?.medium || p.src?.original || p.webformatURL || p.largeImageURL || p.previewURL || '';
          let thumbUrl = p.src?.medium || p.src?.small || p.src?.tiny || p.previewURL || fullUrl;
          if (fullUrl.includes('pixabay.com') && fullUrl.includes('_150.')) {
            fullUrl = fullUrl.replace('_150.', '_640.');
          }
          return {
            id: String(p.id || idx),
            url: fullUrl,
            thumb: thumbUrl,
            photographer: p.photographer || p.user || 'Artist'
          };
        }).filter(p => p.url && !p.url.includes('pixabay.com/get/'));
        if (photos.length > 0) {
          return { photos, hasMore: Boolean(data.next_page) && photos.length >= 8 };
        }
      }
    } catch (_) {}

    // 2. Direct Pixabay API fallback for 100% reliable image fetching
    try {
      const pixType = (type === 'illustration' || type === 'clipart') ? 'illustration' : (type === 'photo' ? 'photo' : 'all');
      const params = new URLSearchParams({
        key: '48270557-5507ff5b3f742f1cf5b2d7cb7',
        q: cleanQuery,
        image_type: pixType,
        per_page: '16',
        page: String(page),
        safesearch: 'true'
      });
      const res = await fetch(`https://pixabay.com/api/?${params.toString()}`);
      if (res && res.ok) {
        const data = await res.json();
        const hits = Array.isArray(data.hits) ? data.hits : [];
        const photos = hits.map((hit, idx) => {
          let permanentUrl = '';
          const preview = hit.previewURL || '';
          if (preview.includes('cdn.pixabay.com')) {
            const ext = preview.slice(preview.lastIndexOf('.'));
            const base = preview.slice(0, preview.lastIndexOf('_'));
            if (base) permanentUrl = `${base}_640${ext}`;
          }
          if (!permanentUrl) {
            const wf = hit.webformatURL || '';
            if (wf.includes('cdn.pixabay.com')) permanentUrl = wf;
          }
          const finalUrl = permanentUrl || (!hit.previewURL?.includes('pixabay.com/get/') ? hit.previewURL : hit.webformatURL || hit.largeImageURL || '');
          return {
            id: String(hit.id || idx),
            url: finalUrl,
            thumb: preview || finalUrl,
            photographer: hit.user || 'Pixabay Artist'
          };
        }).filter(p => p.url && !p.url.includes('pixabay.com/get/'));
        return {
          photos,
          hasMore: photos.length >= 8
        };
      }
    } catch (_) {}

    return { photos: [], hasMore: false };
  }


  // Retrieve all grammar decks from allData (with starter fallback)
  window.getAllGrammarDecks = function(schoolName = '', className = '') {
    const list = (typeof allData !== 'undefined' && Array.isArray(allData)) ? allData : [];
    const customDecks = list.filter(r => r && (r.type === 'grammar_deck' || r.type === 'grammar_list'));
    
    // Merge starter decks if not already saved to allData
    const all = [...customDecks];
    STARTER_GRAMMAR_DECKS.forEach(starter => {
      if (!all.some(d => d.__backendId === starter.__backendId || d.grammar_deck_id === starter.grammar_deck_id)) {
        all.push(starter);
      }
    });

    const sNorm = String(schoolName || '').trim().toLowerCase();
    const cNorm = String(className || '').trim().toLowerCase();

    return all.filter(deck => {
      if (!deck) return false;
      const isStarter = Boolean(deck.__backendId?.startsWith('starter-') || deck.id?.startsWith('starter-') || deck.grammar_deck_id?.startsWith('starter-'));
      if (isStarter) return true;

      const dSchool = String(deck.school_name || deck.grammar_deck_school || '').trim().toLowerCase();
      const dClass = String(deck.class_name || deck.grammar_deck_class || '').trim().toLowerCase();
      const shared = Array.isArray(deck.shared_classes) ? deck.shared_classes.map(c => String(c).trim().toLowerCase()) : [];

      if (sNorm && dSchool && dSchool !== sNorm) return false;
      if (cNorm && dClass && dClass !== cNorm && !shared.includes(cNorm)) return false;
      return true;
    });
  };

  function isCurrentTeacherOwner(deck) {
    if (!deck) return false;
    if (typeof isAymanTeacher === 'function' && isAymanTeacher()) return true;

    const norm = n => String(n || '').trim().toLowerCase().replace(/^teacher\s+/i, '');
    const currentName = norm(typeof currentTeacher !== 'undefined' ? currentTeacher : '');
    const currentId = String(typeof currentTeacherRecordId !== 'undefined' ? currentTeacherRecordId : (typeof verifiedTeacherIdentity === 'function' ? verifiedTeacherIdentity() : '')).trim();

    const deckTeacher = norm(deck.teacher_name || deck.created_by || deck.owner || '');
    const deckOwnerId = String(deck.owner_id || deck.teacher_id || deck.cloud_user_id || '').trim();

    // If starter deck, allow teacher to customize and edit
    if (deck.__backendId?.startsWith('starter-') || deck.id?.startsWith('starter-') || deck.grammar_deck_id?.startsWith('starter-')) {
      return true;
    }

    if (currentName && deckTeacher && currentName === deckTeacher) return true;
    if (currentId && deckOwnerId && currentId === deckOwnerId) return true;
    if (deck.created_by === currentTeacher || deck.owner === currentTeacher) return true;
    return false;
  }

  // ==========================================
  // RENDER: Class Subtab Grammar
  // ==========================================
  window.renderClassGrammarDecks = function() {
    const container = document.getElementById('grammar-decks-container');
    const emptyEl = document.getElementById('grammar-decks-empty');
    if (!container) return;

    const currentSchool = typeof navSchool !== 'undefined' ? navSchool : '';
    const currentClass = typeof navClass !== 'undefined' ? navClass : '';
    const decks = window.getAllGrammarDecks(currentSchool, currentClass);

    if (!decks.length) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    container.innerHTML = decks.map(deck => {
      const deckId = deck.__backendId || deck.id || deck.grammar_deck_id;
      const name = deck.grammar_deck_name || deck.deck_name || 'Grammar Deck';
      const teacher = deck.teacher_name || deck.created_by || 'Teacher Ayman';
      const rules = Array.isArray(deck.rules) ? deck.rules : [];
      const cover = deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg';
      const isOwner = isCurrentTeacherOwner(deck);

      return `
        <div class="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition shadow-lg" data-grammar-deck-id="${escapeHtml(deckId)}">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative cursor-pointer" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
              <img src="${escapeHtml(cover)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover">
              <span class="absolute bottom-1 right-1 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-1.5 py-0.5 rounded">${rules.length} rules</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">Grammar</span>
                <span class="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                  <span>👤</span> By <b class="text-amber-300 font-semibold">${escapeHtml(teacher)}</b>
                </span>
              </div>
              <h4 class="text-base sm:text-lg font-bold text-white truncate cursor-pointer hover:text-amber-300 transition" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
                ${escapeHtml(name)}
              </h4>
              <p class="text-xs text-slate-400 mt-0.5 truncate">
                ${rules.length > 0 ? escapeHtml(rules[0].title || rules[0].formula) : 'No rules added yet'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <button type="button" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm active:scale-95 flex items-center gap-1.5" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
              <span>📖</span> Practice
            </button>
            <button type="button" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition" onclick="window.openGrammarSharePopupFor('${escapeHtml(deckId)}', '${escapeHtml(name)}')">
              Assign
            </button>
            ${isOwner ? `
              <button type="button" class="cg-edit-btn p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer" data-deck-id="${escapeHtml(deckId)}" data-deck-name="${escapeHtml(name)}" title="Edit Deck">
                ✏️
              </button>
              <button type="button" class="cg-del-btn p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition cursor-pointer" data-deck-id="${escapeHtml(deckId)}" title="Delete Deck">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.cg-edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.openGrammarDeckEditor(btn.dataset.deckId, btn.dataset.deckName);
      };
    });
    container.querySelectorAll('.cg-del-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.deleteGrammarDeck(btn.dataset.deckId);
      };
    });
  };

  // ==========================================
  // RENDER: Teacher Zone Grammar Bank (School vs Mine)
  // ==========================================
  window.renderTeacherOwnedGrammarDecks = function() {
    const grid = document.getElementById('teacher-grammar-decks-grid');
    const status = document.getElementById('teacher-grammar-decks-status');
    if (!grid || !status) return;

    const schoolMode = window.grammarDecksMode === 'school';
    const mineBtn = document.getElementById('teacher-grammar-mode-mine');
    const schoolBtn = document.getElementById('teacher-grammar-mode-school');

    if (mineBtn) {
      mineBtn.setAttribute('aria-pressed', String(!schoolMode));
      mineBtn.classList.toggle('is-active', !schoolMode);
      mineBtn.classList.toggle('btn-primary', !schoolMode);
      mineBtn.classList.toggle('btn-secondary', schoolMode);
    }
    if (schoolBtn) {
      schoolBtn.setAttribute('aria-pressed', String(schoolMode));
      schoolBtn.classList.toggle('is-active', schoolMode);
      schoolBtn.classList.toggle('btn-primary', schoolMode);
      schoolBtn.classList.toggle('btn-secondary', !schoolMode);
    }

    const titleEl = document.getElementById('teacher-grammar-decks-title');
    const descEl = document.getElementById('teacher-grammar-decks-description');
    if (titleEl) titleEl.textContent = schoolMode ? 'School Grammar Decks' : 'All Grammar Decks';
    if (descEl) descEl.textContent = schoolMode ? 'Browse and use grammar decks other teachers in your school have made available.' : 'Review, practice, edit, or delete your own and AI-generated grammar decks.';

    const allDecks = window.getAllGrammarDecks('', '');
    const query = String(document.getElementById('teacher-grammar-search-query')?.value || '').trim().toLowerCase();
    const searchField = document.getElementById('teacher-grammar-search-field')?.value || 'all';

    let filtered = allDecks.filter(deck => {
      const isMine = isCurrentTeacherOwner(deck);
      const isStarter = Boolean(deck.__backendId?.startsWith('starter-') || deck.id?.startsWith('starter-') || deck.grammar_deck_id?.startsWith('starter-'));
      if (schoolMode) {
        return (!isMine && !isStarter) || (isStarter && !isMine);
      } else {
        return isMine || isStarter;
      }
    });

    if (query) {
      filtered = filtered.filter(deck => {
        const name = String(deck.grammar_deck_name || deck.deck_name || '').toLowerCase();
        const teacher = String(deck.teacher_name || deck.created_by || '').toLowerCase();
        const rulesText = (deck.rules || []).map(r => `${r.title || ''} ${r.formula || ''} ${r.sentence || ''}`).join(' ').toLowerCase();

        if (searchField === 'deck') return name.includes(query);
        if (searchField === 'teacher') return teacher.includes(query);
        if (searchField === 'rule') return rulesText.includes(query);
        return name.includes(query) || teacher.includes(query) || rulesText.includes(query);
      });
    }

    if (!filtered.length) {
      status.classList.remove('hidden');
      status.textContent = schoolMode 
        ? 'No grammar decks shared by other teachers yet.' 
        : (query ? 'No matching grammar decks found.' : 'You have no grammar decks yet. Click "+ Create deck" or "Generate with AI" above!');
      grid.innerHTML = '';
      return;
    }

    status.classList.add('hidden');
    grid.innerHTML = filtered.map(deck => {
      const deckId = deck.__backendId || deck.id || deck.grammar_deck_id;
      const name = deck.grammar_deck_name || deck.deck_name || 'Grammar Deck';
      const teacher = deck.teacher_name || deck.created_by || 'Teacher Ayman';
      const school = deck.school_name || 'Daya Stanford';
      const cls = deck.class_name || 'All Classes';
      const rules = Array.isArray(deck.rules) ? deck.rules : [];
      const cover = deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg';
      const isOwner = isCurrentTeacherOwner(deck);

      return `
        <article class="vocab-list-card teacher-zone-wordbank-card grammar-deck-card rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-xl space-y-3" data-grammar-deck-id="${escapeHtml(deckId)}">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">Grammar</span>
              <span class="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">${rules.length} rules</span>
            </div>
            
            <h4 class="text-base font-bold text-white truncate hover:text-amber-300 transition cursor-pointer tg-open-practice" data-deck-id="${escapeHtml(deckId)}">
              ${escapeHtml(name)}
            </h4>
            
            <!-- Marked by the teacher who created it -->
            <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-1 mb-2.5">
              <span>👤</span> By <span class="text-amber-300 font-semibold">${escapeHtml(teacher)}</span> · <span class="text-slate-500">${escapeHtml(cls)}</span>
            </div>

            <!-- Compact Cover Image Preview -->
            <div class="grammar-cover-box relative group/cover rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer tg-open-practice" data-deck-id="${escapeHtml(deckId)}" style="height: 145px; max-height: 145px;">
              <img src="${escapeHtml(cover)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105">
              <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/cover:opacity-100 transition flex items-center justify-center">
                <span class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">Open Practice</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
            <div class="flex items-center gap-1.5">
              <button type="button" class="tg-practice-btn px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer" data-deck-id="${escapeHtml(deckId)}">
                Practice
              </button>
              <button type="button" class="tg-assign-btn px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer" data-deck-id="${escapeHtml(deckId)}" data-deck-name="${escapeHtml(name)}">
                Assign
              </button>
            </div>
            ${isOwner ? `
              <div class="flex items-center gap-1">
                <button type="button" class="tg-edit-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs cursor-pointer" data-deck-id="${escapeHtml(deckId)}" data-deck-name="${escapeHtml(name)}" title="Edit Deck">
                  ✏️
                </button>
                <button type="button" class="tg-del-btn p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition text-xs cursor-pointer" data-deck-id="${escapeHtml(deckId)}" title="Delete Deck">
                  🗑️
                </button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Wire listeners
    grid.querySelectorAll('.tg-edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.openGrammarDeckEditor(btn.dataset.deckId, btn.dataset.deckName);
      };
    });
    grid.querySelectorAll('.tg-del-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.deleteGrammarDeck(btn.dataset.deckId);
      };
    });
    grid.querySelectorAll('.tg-practice-btn, .tg-open-practice').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.openGrammarDeckPracticeById(btn.dataset.deckId);
      };
    });
    grid.querySelectorAll('.tg-assign-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.openGrammarSharePopupFor(btn.dataset.deckId, btn.dataset.deckName);
      };
    });
  };

  // ==========================================
  // INTERACTIVE PRACTICE MODAL (Pattern Cards)
  // ==========================================
  window.openGrammarDeckPracticeById = function(deckId) {
    const deck = window.getAllGrammarDecks().find(d => (d.__backendId === deckId || d.id === deckId || d.grammar_deck_id === deckId));
    if (!deck) {
      if (typeof toast === 'function') toast('Grammar deck not found.');
      return;
    }
    window.openGrammarDeckPractice(deck);
  };

  // Helper: syntax-highlight target sentence according to English grammar patterns or teacher custom assignment
  function formatSyntaxHighlightedSentence(sentence, formula = '', rule = null) {
    if (!sentence) return '';
    const clean = String(sentence).trim();
    const rawWords = clean.split(/\s+/);
    if (rawWords.length <= 1) return escapeHtml(clean);

    // 1. Check if custom teacher word role assignment is provided in rule
    const customBlue = (rule?.words_blue || rule?.highlight_blue || '').trim().toLowerCase();
    const customAmber = (rule?.words_amber || rule?.highlight_amber || '').trim().toLowerCase();
    const customGreen = (rule?.words_green || rule?.highlight_green || '').trim().toLowerCase();

    if (customBlue || customAmber || customGreen) {
      const cleanWord = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');

      const parseWordsAndPhrases = (str) => {
        if (!str) return { phrases: [], words: new Set() };
        const rawItems = str.split(/[,;\n+]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
        const words = new Set();
        const phrases = [];
        rawItems.forEach(item => {
          phrases.push(item);
          item.split(/\s+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw) words.add(cw);
          });
        });
        return { phrases, words };
      };

      const blueData = parseWordsAndPhrases(customBlue);
      const amberData = parseWordsAndPhrases(customAmber);
      const greenData = parseWordsAndPhrases(customGreen);

      return rawWords.map((w) => {
        const cw = cleanWord(w);
        if (!cw) return `<span class="text-white font-extrabold">${escapeHtml(w)}</span>`;

        if (blueData.words.has(cw)) {
          return `<span class="text-sky-300 font-black">${escapeHtml(w)}</span>`;
        }
        if (amberData.words.has(cw)) {
          return `<span class="text-amber-400 font-black">${escapeHtml(w)}</span>`;
        }
        if (greenData.words.has(cw)) {
          return `<span class="text-emerald-400 font-black">${escapeHtml(w)}</span>`;
        }
        return `<span class="text-white font-extrabold">${escapeHtml(w)}</span>`;
      }).join(' ');
    }

    const AUX_VERBS = new Set([
      'am', 'is', 'are', 'was', 'were', 'will', 'shall', 'has', 'have', 'had',
      'do', 'does', 'did', 'can', 'could', 'would', 'should', 'might', 'must',
      "isn't", "aren't", "wasn't", "weren't", "won't", "haven't", "hasn't", "hadn't",
      "don't", "doesn't", "didn't", "can't", "couldn't"
    ]);

    const QUESTION_WORDS = new Set([
      'what', 'where', 'when', 'why', 'who', 'whom', 'whose', 'which', 'how'
    ]);

    // Words that are function words, articles, prepositions, pronouns, or nouns that MUST NEVER be colored as action verbs
    const NON_VERB_WORDS = new Set([
      'the', 'a', 'an',
      'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'into', 'through', 'over', 'under', 'between', 'among', 'out', 'off', 'above', 'below', 'behind', 'near', 'across', 'up', 'down',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
      'this', 'that', 'these', 'those', 'there', 'here',
      'some', 'any', 'many', 'much', 'few', 'little', 'all', 'every', 'each', 'both', 'either', 'neither', 'no',
      'what', 'where', 'when', 'why', 'who', 'whom', 'whose', 'which', 'how',
      'and', 'but', 'or', 'so', 'because', 'if', 'while', 'as', 'than',
      'not', 'very', 'too', 'quite', 'just', 'already', 'still', 'yet', 'always', 'never', 'often', 'sometimes',
      'color', 'basket', 'bicycle', 'shirt', 'cat', 'dog', 'apples', 'today', 'tomorrow', 'yesterday', 'now', 'right'
    ]);

    const cleanWords = rawWords.map(w => w.toLowerCase().replace(/[^a-z']/g, ''));

    // Check if sentence is an inverted question: starts with Aux verb (e.g. "Are you studying...")
    const startsWithAux = cleanWords.length > 1 && AUX_VERBS.has(cleanWords[0]);

    // Check if sentence starts with question word (e.g. "Where is...", "What color is...", "How many...")
    const startsWithQuestion = cleanWords.length > 1 && QUESTION_WORDS.has(cleanWords[0]);

    if (startsWithAux) {
      // INVERTED QUESTION: [Aux] (Blue) + [Subject] (Amber) + [Verb-ing/Base] (Green) + [Rest] (White)
      // Matches formula: [Am / Is / Are] (Blue) + [Subject] (Amber) + [Verb-ing ?] (Green)
      let verbIdx = -1;
      for (let i = 2; i < cleanWords.length; i++) {
        const w = cleanWords[i];
        if ((w.endsWith('ing') || w.endsWith('ed')) && !NON_VERB_WORDS.has(w)) {
          verbIdx = i;
          break;
        }
      }
      if (verbIdx === -1) {
        for (let i = 2; i < cleanWords.length; i++) {
          if (!NON_VERB_WORDS.has(cleanWords[i])) {
            verbIdx = i;
            break;
          }
        }
      }

      return rawWords.map((w, i) => {
        if (i === 0) {
          // Aux in inverted question corresponds to Part 0 of formula [Am / Is / Are] -> Blue
          return `<span class="text-sky-300 font-black">${escapeHtml(w)}</span>`;
        }
        if (i === 1 || (verbIdx !== -1 && i > 0 && i < verbIdx)) {
          // Subject corresponds to Part 1 of formula [Subject] -> Amber
          return `<span class="text-amber-400 font-black">${escapeHtml(w)}</span>`;
        }
        if (i === verbIdx) {
          // Verb corresponds to Part 2 of formula [Verb-ing] -> Green
          return `<span class="text-emerald-400 font-black">${escapeHtml(w)}</span>`;
        }
        return `<span class="text-white font-extrabold">${escapeHtml(w)}</span>`;
      }).join(' ');
    }

    if (startsWithQuestion) {
      // WH-QUESTION: [Question Phrase] (Blue) + [Aux] (Amber) + [Rest / Lexical Verb] (White / Green)
      // Example: "Where is the sleeping cat?", "What color is your bicycle?", "How many apples are in the basket?"
      let auxIdx = -1;
      for (let i = 1; i < cleanWords.length; i++) {
        if (AUX_VERBS.has(cleanWords[i])) {
          auxIdx = i;
          break;
        }
      }

      // Check if there is an actual action verb (like "sleeping", "located")
      let verbIdx = -1;
      if (auxIdx !== -1) {
        for (let i = auxIdx + 1; i < cleanWords.length; i++) {
          const w = cleanWords[i];
          if ((w.endsWith('ing') || w.endsWith('ed')) && !NON_VERB_WORDS.has(w)) {
            verbIdx = i;
            break;
          }
        }
      }

      return rawWords.map((w, i) => {
        if (auxIdx !== -1 && i < auxIdx) {
          // Question phrase (e.g. "Where", "What color", "How many apples") -> Blue
          return `<span class="text-sky-300 font-black">${escapeHtml(w)}</span>`;
        }
        if (i === auxIdx) {
          // Helping verb / be verb (e.g. "is", "are") -> Amber
          return `<span class="text-amber-400 font-black">${escapeHtml(w)}</span>`;
        }
        if (i === verbIdx) {
          // Only actual action verb (e.g. "sleeping") -> Green
          return `<span class="text-emerald-400 font-black">${escapeHtml(w)}</span>`;
        }
        // Function words, prepositions, pronouns, articles, nouns -> White
        return `<span class="text-white font-extrabold">${escapeHtml(w)}</span>`;
      }).join(' ');
    }

    // STANDARD AFFIRMATIVE / NEGATIVE SENTENCE
    // Example: "The elephant is walking slowly." or "The dinosaur is not sleeping today."
    let auxIdx = -1;
    for (let i = 0; i < cleanWords.length; i++) {
      if (AUX_VERBS.has(cleanWords[i])) {
        auxIdx = i;
        break;
      }
    }

    let verbIdx = -1;
    if (auxIdx !== -1) {
      for (let i = auxIdx + 1; i < cleanWords.length; i++) {
        const w = cleanWords[i];
        if (w === 'not') continue;
        if ((w.endsWith('ing') || w.endsWith('ed')) && !NON_VERB_WORDS.has(w)) {
          verbIdx = i;
          break;
        }
      }
      if (verbIdx === -1) {
        // Base verb (e.g. "will play", "can run")
        for (let i = auxIdx + 1; i < cleanWords.length; i++) {
          const w = cleanWords[i];
          if (w !== 'not' && !NON_VERB_WORDS.has(w)) {
            verbIdx = i;
            break;
          }
        }
      }
    } else {
      // Present Simple without aux (e.g. "Pikachu runs happily.")
      for (let i = 1; i < cleanWords.length; i++) {
        const w = cleanWords[i];
        if (!NON_VERB_WORDS.has(w)) {
          verbIdx = i;
          break;
        }
      }
    }

    return rawWords.map((w, i) => {
      const wNorm = cleanWords[i];
      if (wNorm === 'not') {
        return `<span class="text-rose-400 font-black">${escapeHtml(w)}</span>`;
      }
      if (i === auxIdx) {
        return `<span class="text-amber-400 font-black">${escapeHtml(w)}</span>`;
      }
      if (i === verbIdx) {
        return `<span class="text-emerald-400 font-black">${escapeHtml(w)}</span>`;
      }
      if ((auxIdx !== -1 && i < auxIdx) || (auxIdx === -1 && verbIdx !== -1 && i < verbIdx)) {
        return `<span class="text-sky-300 font-black">${escapeHtml(w)}</span>`;
      }
      return `<span class="text-white font-extrabold">${escapeHtml(w)}</span>`;
    }).join(' ');
  }

  // Helper: format formula into distinct color pill chips centered
  function formatFormulaChips(formulaStr) {
    const parts = String(formulaStr || 'Subject + Verb').split('+').map(p => p.trim()).filter(Boolean);
    const colorStyles = [
      'border-sky-400 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]',
      'border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      'border-purple-400 bg-purple-500/15 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      'border-rose-400 bg-rose-500/15 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
    ];

    return parts.map((part, idx) => {
      const style = colorStyles[idx % colorStyles.length];
      const displayPart = part.startsWith('[') && part.endsWith(']') ? part : `[${part}]`;
      return `<span class="px-3.5 sm:px-4 py-1.5 rounded-full border ${style} font-bold text-xs sm:text-sm tracking-wide inline-block">${escapeHtml(displayPart)}</span>`;
    }).join('<span class="text-slate-400 font-bold text-base sm:text-lg mx-1.5">+</span>');
  }

  window.formatSyntaxHighlightedSentence = formatSyntaxHighlightedSentence;
  window.formatFormulaChips = formatFormulaChips;

  window.openGrammarDeckPractice = function(deck) {
    document.querySelectorAll('#grammar-practice-modal').forEach(m => m.remove());

    const rules = Array.isArray(deck.rules) && deck.rules.length ? deck.rules : [
      {
        title: 'Present Continuous',
        formula: 'Subject + am / is / are + Verb + -ing',
        sentence: 'The elephant is walking slowly.',
        context_clue: 'Right Now',
        image: deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        mistake_bad: 'The elephant walking.',
        mistake_good: 'The elephant is walking.',
        quiz_question: 'Look! The monkeys ______ the tall tree!',
        quiz_options: ['climbs', 'are climbing', 'is climbing'],
        quiz_answer: 'are climbing'
      }
    ];

    let currentIndex = 0;
    const currentDeckId = deck.__backendId || deck.id || deck.grammar_deck_id;
    const deckName = deck.grammar_deck_name || deck.deck_name || 'Grammar Deck';
    const isOwner = isCurrentTeacherOwner(deck);
    const rewardedRuleIndices = new Set();

    // Helper: award student coins for answering grammar quick checks correctly
    async function awardCoinsForGrammarPractice(amount = 5) {
      let student = null;
      if (typeof getCurrentStudentRecord === 'function') {
        try { student = getCurrentStudentRecord(); } catch (_) {}
      }
      if (!student && typeof currentStudentRecordId !== 'undefined' && currentStudentRecordId) {
        if (typeof allData !== 'undefined' && Array.isArray(allData)) {
          student = allData.find(r => (r.__backendId === currentStudentRecordId || r.student_id === currentStudentRecordId) && r.type === 'student') || null;
        }
      }
      if (!student && typeof currentStudent !== 'undefined' && currentStudent) {
        if (typeof allData !== 'undefined' && Array.isArray(allData)) {
          student = allData.find(r => r.type === 'student' && r.student_name === currentStudent) || null;
        }
      }

      const oldCoins = Number(student?.coins) || 0;
      const newCoins = oldCoins + amount;

      if (student) {
        if (typeof persistCanonicalStudentPatch === 'function') {
          try {
            await persistCanonicalStudentPatch(student, { coins: newCoins }, 'Could not save grammar coins.');
          } catch (e) {
            console.warn('[Grammar] Error persisting coins:', e);
          }
        } else if (window.dataSdk?.update) {
          try {
            const updated = { ...student, coins: newCoins };
            await window.dataSdk.update(updated, { notify: false });
            if (typeof allData !== 'undefined') {
              allData = allData.map(r => r.__backendId === student.__backendId ? updated : r);
            }
            if (typeof setCurrentStudentRecord === 'function') {
              setCurrentStudentRecord(updated);
            }
          } catch (e) {
            console.warn('[Grammar] Error updating dataSdk coins:', e);
          }
        }

        // Update DOM coin counters
        if (typeof updateVisibleStudentCoinLabels === 'function') {
          try { updateVisibleStudentCoinLabels({ ...student, coins: newCoins }); } catch (_) {}
        } else {
          const myCoinsNode = document.getElementById('my-coins');
          if (myCoinsNode) myCoinsNode.textContent = String(newCoins);
        }

        if (typeof renderStudentDashboard === 'function' && typeof currentRole !== 'undefined' && currentRole === 'student') {
          try { renderStudentDashboard(); } catch (_) {}
        }

        if (typeof showStudentAwardCelebration === 'function') {
          try { showStudentAwardCelebration({ ...student, coins: newCoins }, amount); } catch (_) {}
        }
      }

      if (typeof triggerCoinSound === 'function') {
        try { triggerCoinSound(); } catch (_) {}
      } else if (window.pokeSfx?.play) {
        try { window.pokeSfx.play('coin'); } catch (_) {}
      }

      if (typeof toast === 'function') {
        if (student) {
          toast(`✨ Correct! +${amount} coins awarded! (Total: ${newCoins} 🪙)`);
        } else {
          toast(`✨ Correct! (+${amount} coins awarded in student mode)`);
        }
      }

      return { student, newCoins };
    }
    window.awardCoinsForGrammarPractice = awardCoinsForGrammarPractice;

    const modal = document.createElement('div');
    modal.id = 'grammar-practice-modal';
    modal.className = 'fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[10000] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200';
    
    function renderCard(idx) {
      const r = rules[idx];
      const isFirst = idx === 0;
      const isLast = idx === rules.length - 1;

      // Clean context clue for top-left glass pill
      let cleanClue = (r.context_clue || 'Right Now').trim();
      if (cleanClue.toLowerCase().startsWith('level:')) {
        cleanClue = cleanClue.replace(/level:\s*/i, '');
      }

      // Check if mistake sentences are long to place them under each other
      const badText = String(r.mistake_bad || 'Mistake');
      const goodText = String(r.mistake_good || 'Correct');
      const isLongMistake = badText.length > 20 || goodText.length > 20 || (badText.length + goodText.length > 35);

      // Quiz options fallback
      const options = Array.isArray(r.quiz_options) && r.quiz_options.length 
        ? r.quiz_options 
        : [r.quiz_answer || 'are climbing', 'climbs', 'is climbing'];

      // All decks for Deck Preview strip
      const allDecks = typeof window.getAllGrammarDecks === 'function' ? window.getAllGrammarDecks('', '') : [deck];

      modal.innerHTML = `
        <div class="w-full max-w-5xl flex flex-col items-center my-auto py-4">
          <!-- Main Carousel Container: Left Arrow + Amber Glow Card + Right Arrow -->
          <div class="flex items-center justify-center gap-2 sm:gap-5 w-full">
            <!-- Left Circular Arrow -->
            <button type="button" id="gp-prev-btn" class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white flex items-center justify-center font-bold text-xl sm:text-2xl transition shadow-xl shrink-0 cursor-pointer ${isFirst ? 'opacity-25 pointer-events-none' : 'active:scale-95'}" aria-label="Previous rule">
              ‹
            </button>

            <!-- PokéAyman Amber Gold Bordered Practice Card -->
            <div id="gp-practice-card" class="gp-practice-card flex-1 min-w-0 rounded-3xl bg-[#0d1527]/95 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.22)] p-5 sm:p-7 space-y-5 relative backdrop-blur-xl">
              <!-- Top Header: Deck Name · Rule X of Y: Rule Title + Actions -->
              <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 class="text-base sm:text-xl font-bold text-white tracking-tight truncate mr-3">
                  ${escapeHtml(deckName)} · Rule ${idx + 1} of ${rules.length}: <span class="text-slate-100 font-extrabold">${escapeHtml(r.title || 'Rule')}</span>
                </h3>
                <div class="flex items-center gap-2 shrink-0">
                  <button type="button" id="gp-read-rule-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center justify-center transition border border-slate-700 cursor-pointer" title="Listen to sentence">
                    🔊
                  </button>
                  ${isOwner ? `
                    <button type="button" id="gp-edit-deck-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center transition border border-slate-700 cursor-pointer text-xs" title="Edit this deck">
                      ✏️
                    </button>
                  ` : ''}
                  <button type="button" id="gp-close-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold flex items-center justify-center transition border border-slate-700 cursor-pointer text-sm" aria-label="Close">
                    ✕
                  </button>
                </div>
              </div>

              <!-- Centered Multi-Color Grammar Formula Bar -->
              <div id="gp-formula-bar" class="gp-formula-bar flex items-center justify-center flex-wrap gap-2 py-1">
                ${formatFormulaChips(r.formula)}
              </div>

              <!-- Side-by-Side 2-Column Hero -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
                <!-- Left: Illustration Card with Floating Context Pill -->
                <div id="gp-illustration-card" class="gp-illustration-card md:col-span-5 relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[4/3] shadow-xl group">
                  <img src="${escapeHtml(r.image || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg')}" alt="${escapeHtml(r.title || 'Grammar Illustration')}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                  <div class="absolute top-3 left-3 max-w-[88%] px-3 py-1 rounded-full bg-slate-950/85 border border-slate-700/80 text-[11px] font-semibold text-slate-300 backdrop-blur-md shadow-md flex items-center gap-1.5 truncate">
                    <span class="shrink-0 text-slate-400">Context:</span> <span class="text-amber-300 font-bold truncate">${escapeHtml(cleanClue)}</span>
                  </div>
                </div>

                <!-- Right: High-Contrast Target Sentence & Common Mistake Card -->
                <div class="md:col-span-7 flex flex-col justify-center space-y-4">
                  <!-- Large Target Sentence with Highlighted Syntax -->
                  <div id="gp-target-sentence" class="gp-target-sentence text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                    ${formatSyntaxHighlightedSentence(r.sentence || '', r.formula || '', r)}
                  </div>

                  <!-- Common Mistake Container: Stacked under each other if long so sentences are never cut off -->
                  <div id="gp-mistake-box" class="gp-mistake-box rounded-2xl bg-slate-950/70 border border-slate-800/90 p-3.5 sm:p-4 space-y-2 shadow-inner">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Common Mistake</div>
                    <div class="flex flex-col ${isLongMistake ? '' : 'sm:flex-row sm:items-center sm:gap-6'} gap-2 text-sm">
                      <div class="text-rose-400 font-bold flex items-start gap-2 leading-snug">
                        <span class="shrink-0 text-sm leading-none pt-0.5">❌</span>
                        <span class="break-words">${escapeHtml(badText)}</span>
                      </div>
                      <div class="text-emerald-400 font-bold flex items-start gap-2 leading-snug">
                        <span class="shrink-0 text-sm leading-none pt-0.5">✅</span>
                        <span class="break-words">${escapeHtml(goodText)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sleek Quick Check Inline Bar -->
              <div id="gp-quick-check-box" class="gp-quick-check-box rounded-2xl bg-slate-950/70 border border-slate-800/90 p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-inner">
                <div class="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 min-w-0">
                  <span class="text-amber-400 font-black shrink-0">⚡ Quick Check:</span>
                  <span class="text-white font-bold break-words">${escapeHtml(r.quiz_question || 'Choose the correct form:')}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2 shrink-0" id="gp-options-row">
                  ${options.map(opt => `
                    <button type="button" class="gp-quiz-opt px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-700 bg-slate-800/80 text-slate-200 hover:border-cyan-400 hover:text-white transition active:scale-95 cursor-pointer" data-val="${escapeHtml(opt)}">
                      [${escapeHtml(opt)}]
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right Circular Arrow with Glowing Cyan Button -->
            <button type="button" id="gp-next-btn" class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center transition shadow-[0_0_25px_rgba(6,182,212,0.6)] shrink-0 cursor-pointer active:scale-95" aria-label="Next rule">
              ›
            </button>
          </div>

          <!-- Bottom Rule Selector Strip: Shows all rules of THIS grammar deck -->
          <div class="w-full space-y-2 mt-4 px-2 sm:px-14">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Deck Rules (${rules.length})</span>
              <span class="text-[10px] text-slate-500 font-medium">Click any rule to jump directly</span>
            </div>
            <div class="flex items-center gap-3 overflow-x-auto pb-2" id="gp-deck-previews-strip">
              ${rules.map((ruleItem, rIdx) => {
                const isCurrent = (rIdx === currentIndex);
                const rTitle = ruleItem.title || `Rule ${rIdx + 1}`;
                const rFormula = ruleItem.formula || ruleItem.sentence || '';
                const rThumb = ruleItem.image || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg';
                return `
                  <div class="gp-switch-rule-btn flex items-center gap-2.5 p-2 rounded-2xl shrink-0 cursor-pointer transition ${isCurrent ? 'border-2 border-amber-400/90 bg-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50' : 'border border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'}" data-rule-idx="${rIdx}">
                    <img src="${escapeHtml(rThumb)}" class="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0" alt="${escapeHtml(rTitle)}">
                    <div class="min-w-0 pr-1.5">
                      <div class="text-xs font-bold text-white truncate max-w-[150px]">${rIdx + 1}. ${escapeHtml(rTitle)}</div>
                      <div class="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">${escapeHtml(rFormula)}</div>
                    </div>
                  </div>
                `;
              }).join('')}
              ${isOwner ? `
                <button type="button" id="gp-bottom-add-rule-btn" class="px-3.5 py-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition">
                  <span>＋</span> <span>Edit / Add Rules</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      // Wire close
      modal.querySelector('#gp-close-btn').onclick = () => modal.remove();
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

      // Wire navigation
      modal.querySelector('#gp-prev-btn').onclick = () => {
        if (currentIndex > 0) {
          currentIndex--;
          renderCard(currentIndex);
        }
      };
      modal.querySelector('#gp-next-btn').onclick = () => {
        if (currentIndex < rules.length - 1) {
          currentIndex++;
          renderCard(currentIndex);
        } else {
          if (typeof toast === 'function') toast('🎉 You completed all rules in this deck!');
          modal.remove();
        }
      };

      // Wire edit deck button
      const editBtn = modal.querySelector('#gp-edit-deck-btn');
      if (editBtn) {
        editBtn.onclick = () => {
          modal.remove();
          window.openGrammarDeckEditor(deck);
        };
      }

      // Wire audio pronunciation
      modal.querySelector('#gp-read-rule-btn').onclick = () => {
        const textToSpeak = `${r.title}. Formula: ${r.formula}. Example: ${r.sentence}`;
        if (typeof playVocabPronunciation === 'function') {
          playVocabPronunciation(r.sentence || r.title);
        } else if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(textToSpeak);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
        }
        if (typeof toast === 'function') toast('🔊 Playing sentence pronunciation…');
      };

      // Wire Quick Check quiz options
      modal.querySelectorAll('.gp-quiz-opt').forEach(btn => {
        btn.onclick = async () => {
          const chosen = btn.dataset.val;
          const correct = r.quiz_answer;

          modal.querySelectorAll('.gp-quiz-opt').forEach(b => {
            b.classList.remove('border-cyan-400', 'bg-cyan-950/90', 'text-cyan-200', 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', 'border-rose-500', 'bg-rose-950/90', 'text-rose-200');
          });

          if (chosen === correct) {
            btn.className = 'gp-quiz-opt px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/90 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition cursor-pointer';
            if (!rewardedRuleIndices.has(idx)) {
              rewardedRuleIndices.add(idx);
              await awardCoinsForGrammarPractice(5);
            } else {
              if (typeof triggerCoinSound === 'function') triggerCoinSound();
              if (typeof toast === 'function') toast('✨ Correct! (Already rewarded for this rule)');
            }
          } else {
            btn.className = 'gp-quiz-opt px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-rose-500 ring-2 ring-rose-500/50 bg-rose-950/90 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition cursor-pointer';
            if (window.pokeSfx?.play) {
              try { window.pokeSfx.play('wrong'); } catch (_) {}
            }
          }
        };
      });

      // Wire Rule Selectors in the bottom strip
      modal.querySelectorAll('.gp-switch-rule-btn').forEach(btn => {
        btn.onclick = () => {
          const targetIdx = Number(btn.dataset.ruleIdx);
          if (targetIdx >= 0 && targetIdx < rules.length && targetIdx !== currentIndex) {
            currentIndex = targetIdx;
            renderCard(currentIndex);
          }
        };
      });

      // Wire bottom Edit / Add Rules button
      const bottomAddBtn = modal.querySelector('#gp-bottom-add-rule-btn');
      if (bottomAddBtn) {
        bottomAddBtn.onclick = () => {
          modal.remove();
          window.openGrammarDeckEditor(deck);
        };
      }
    }

    renderCard(currentIndex);
    document.body.appendChild(modal);
  };

  // ==========================================
  // PERSISTENCE HELPER: Supabase app_records
  // ==========================================
  window.saveOrUpdateGrammarDeck = async function(deck) {
    if (!deck) return { isOk: false };
    const deckId = String(deck.__backendId || deck.id || deck.grammar_deck_id || ('grammar-deck-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)));
    deck.__backendId = deckId;
    deck.id = deckId;
    deck.grammar_deck_id = deckId;
    deck.type = 'grammar_deck';
    deck.updated_at = new Date().toISOString();
    deck.rules = Array.isArray(deck.rules) ? deck.rules : [];

    let res = null;
    if (window.dataSdk?.update) {
      try {
        res = await window.dataSdk.update(deck);
      } catch (e) {
        console.warn('dataSdk.update failed, trying create:', e);
      }
    }
    // If update returned false (e.g. record wasn't in Supabase app_records yet because it was a starter deck)
    if (!res || !res.isOk) {
      if (window.dataSdk?.create) {
        try {
          res = await window.dataSdk.create(deck);
        } catch (e) {
          console.error('dataSdk.create error:', e);
        }
      }
    }

    // Keep allData in sync immediately
    if (typeof allData !== 'undefined' && Array.isArray(allData)) {
      const idx = allData.findIndex(d => d && (d.__backendId === deckId || d.id === deckId || d.grammar_deck_id === deckId));
      if (idx >= 0) {
        allData[idx] = { ...allData[idx], ...deck };
      } else {
        allData.push(deck);
      }
      window.allData = allData;
    }

    // Also update in-memory starter decks so local fallback retains changes
    const starterIdx = STARTER_GRAMMAR_DECKS.findIndex(s => s.__backendId === deckId || s.id === deckId || s.grammar_deck_id === deckId);
    if (starterIdx >= 0) {
      STARTER_GRAMMAR_DECKS[starterIdx] = { ...STARTER_GRAMMAR_DECKS[starterIdx], ...deck };
    }

    if (typeof window.renderClassGrammarDecks === 'function') window.renderClassGrammarDecks();
    if (typeof window.renderTeacherOwnedGrammarDecks === 'function') window.renderTeacherOwnedGrammarDecks();
    return res || { isOk: true, data: deck };
  };

  // ==========================================
  // CREATE & EDIT GRAMMAR DECK
  // ==========================================
  window.openGrammarDeckEditor = function(deckId, deckName) {
    document.querySelectorAll('#grammar-editor-modal').forEach(m => m.remove());

    const all = typeof window.getAllGrammarDecks === 'function' ? window.getAllGrammarDecks('', '') : [];
    const targetId = typeof deckId === 'object' && deckId !== null ? (deckId.__backendId || deckId.id || deckId.grammar_deck_id) : deckId;
    const deck = (typeof deckId === 'object' && deckId !== null)
      ? deckId
      : all.find(d => String(d.__backendId) === String(targetId) || String(d.id) === String(targetId) || String(d.grammar_deck_id) === String(targetId));

    if (!deck) {
      console.warn('openGrammarDeckEditor: deck not found for id', deckId);
      if (typeof toast === 'function') toast('Deck not found.');
      return;
    }

    const rules = Array.isArray(deck.rules) ? [...deck.rules] : [];
    let currentDeckName = deck.grammar_deck_name || deck.deck_name || deckName || 'Grammar Deck';
    let editingRuleIndex = -1; // -1 = adding new rule, >= 0 = editing existing rule

    const modal = document.createElement('div');
    modal.id = 'grammar-editor-modal';
    modal.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto';
    
    function renderEditor() {
      const isEditing = editingRuleIndex >= 0 && editingRuleIndex < rules.length;
      const activeRule = isEditing ? rules[editingRuleIndex] : null;

      // Extract options for active rule
      const existingOptions = Array.isArray(activeRule?.quiz_options) ? activeRule.quiz_options : [];
      const activeAnswer = activeRule?.quiz_answer || existingOptions[0] || '';
      const remainingWrong = existingOptions.filter((opt, i) => opt !== activeAnswer || i > 0);
      const activeOpt2 = remainingWrong[0] || (existingOptions[1] && existingOptions[1] !== activeAnswer ? existingOptions[1] : (existingOptions[0] && existingOptions[0] !== activeAnswer ? existingOptions[0] : ''));
      const activeOpt3 = remainingWrong[1] || (existingOptions[2] && existingOptions[2] !== activeAnswer && existingOptions[2] !== activeOpt2 ? existingOptions[2] : '');

      modal.innerHTML = `
        <div class="max-w-3xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
          <!-- Header with Editable Deck Title -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="text-xl shrink-0">✏️</span>
              <div class="flex-1 min-w-0">
                <input id="ge-deck-name-input" type="text" value="${escapeHtml(currentDeckName)}" class="quiz-input font-bold text-white text-base w-full" placeholder="Deck Name" maxlength="80">
              </div>
              <button type="button" id="ge-save-deck-name-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 shrink-0 transition" title="Save deck name">
                Save Name
              </button>
            </div>
            <button type="button" id="ge-close-btn" class="text-slate-400 hover:text-white font-bold text-2xl px-2 shrink-0 leading-none">&times;</button>
          </div>

          <!-- Add / Edit Rule Form -->
          <div id="ge-rule-form-box" class="p-4 rounded-2xl ${isEditing ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' : 'bg-slate-950/60 border-slate-800'} border space-y-3 transition">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold ${isEditing ? 'text-amber-400' : 'text-amber-300'} uppercase tracking-wider flex items-center gap-1.5">
                <span>${isEditing ? '✏️' : '➕'}</span>
                <span>${isEditing ? `Editing Rule #${editingRuleIndex + 1}: ${escapeHtml(activeRule?.title || 'Rule')}` : 'Add New Grammar Rule'}</span>
              </h4>
              ${isEditing ? `
                <button type="button" id="ge-cancel-edit-btn" class="text-xs text-slate-400 hover:text-white underline cursor-pointer">
                  Cancel edit
                </button>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label for="ge-rule-title" class="text-[11px] text-slate-400 font-semibold block">Rule Title *</label>
                <input id="ge-rule-title" type="text" placeholder="e.g. Actions Happening Right Now" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.title || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-formula" class="text-[11px] text-slate-400 font-semibold block">Formula / Pattern</label>
                <input id="ge-rule-formula" type="text" placeholder="e.g. Subject + am/is/are + Verb-ing" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.formula || '')}">
              </div>
              <div class="space-y-1 sm:col-span-2">
                <label for="ge-rule-sentence" class="text-[11px] text-slate-400 font-semibold block">Example Sentence *</label>
                <input id="ge-rule-sentence" type="text" placeholder="e.g. The elephant is walking slowly in the grass." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.sentence || '')}">
              </div>

              <!-- Word Color & Formula Role Assignment -->
              <div class="sm:col-span-2 space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎨</span> Assign Sentence Words to Formula Parts
                  </div>
                  <span class="text-[10px] text-slate-400">Click words below to cycle role: <span class="text-sky-300 font-bold">Blue</span> → <span class="text-amber-400 font-bold">Amber</span> → <span class="text-emerald-400 font-bold">Green</span> → <span class="text-slate-400 font-bold">Reset</span></span>
                </div>

                <!-- Interactive word chips -->
                <div id="ge-sentence-word-chips" class="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 min-h-[40px]">
                  <!-- Populated dynamically -->
                </div>

                <!-- 3 Role Inputs -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div class="space-y-1">
                    <label for="ge-rule-words-blue" class="text-[10px] text-sky-300 font-bold flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-sky-400 inline-block shadow-[0_0_6px_rgba(56,189,248,0.8)]"></span> Part 1 (Blue) Words
                    </label>
                    <input id="ge-rule-words-blue" type="text" placeholder="e.g. Where or The elephant" class="quiz-input text-xs w-full font-medium" value="${escapeHtml(activeRule?.words_blue || activeRule?.highlight_blue || '')}">
                  </div>
                  <div class="space-y-1">
                    <label for="ge-rule-words-amber" class="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_rgba(251,191,36,0.8)]"></span> Part 2 (Amber) Words
                    </label>
                    <input id="ge-rule-words-amber" type="text" placeholder="e.g. is or is walking" class="quiz-input text-xs w-full font-medium" value="${escapeHtml(activeRule?.words_amber || activeRule?.highlight_amber || '')}">
                  </div>
                  <div class="space-y-1">
                    <label for="ge-rule-words-green" class="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span> Part 3 (Green) Words
                    </label>
                    <input id="ge-rule-words-green" type="text" placeholder="e.g. the sleeping cat or slowly" class="quiz-input text-xs w-full font-medium" value="${escapeHtml(activeRule?.words_green || activeRule?.highlight_green || '')}">
                  </div>
                </div>
              </div>

              <div class="space-y-1 sm:col-span-2">
                <label for="ge-rule-clue" class="text-[11px] text-slate-400 font-semibold block">Context Clue / Hint</label>
                <input id="ge-rule-clue" type="text" placeholder="e.g. Right now at this moment" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.context_clue || '')}">
              </div>
              <!-- Rule Image Search & Picker (matching vocab lists) -->
              <div class="sm:col-span-2 space-y-2 pt-2 border-t border-slate-800/80">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🖼️</span> Rule Image & Clipart
                  </label>
                  <span id="ge-image-status" class="text-[11px] text-slate-400 font-semibold"></span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  <!-- Selected Image Preview & Direct URL Fallback -->
                  <div class="md:col-span-5 rounded-xl p-3 border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-2.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Image</span>
                      <span id="ge-image-badge" class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeRule?.image ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                        ${activeRule?.image ? '✓ Ready' : 'No image'}
                      </span>
                    </div>

                    <div id="ge-image-preview-container" class="w-full h-32 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center p-1.5 overflow-hidden relative group">
                      ${activeRule?.image ? `
                        <img id="ge-image-preview-img" src="${escapeHtml(activeRule.image)}" class="w-full h-full object-contain rounded" alt="Rule image preview" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'text-xs text-rose-400 font-medium\\'>Invalid image link</span>';">
                      ` : `
                        <div id="ge-image-placeholder" class="text-xs text-slate-500 flex flex-col items-center gap-1">
                          <svg class="w-7 h-7 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span>Choose clipart or photo</span>
                        </div>
                      `}
                    </div>

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <label for="ge-rule-image" class="text-[11px] text-slate-400 font-medium">Or paste image URL directly:</label>
                        <button type="button" id="ge-image-clear-btn" class="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer ${activeRule?.image ? '' : 'hidden'}">Remove</button>
                      </div>
                      <input id="ge-rule-image" type="url" placeholder="https://cdn.pixabay.com/..." class="quiz-input text-xs w-full font-mono text-[11px]" value="${escapeHtml(activeRule?.image || '')}">
                    </div>
                  </div>

                  <!-- Search Clipart & Photos -->
                  <div class="md:col-span-7 space-y-2 flex flex-col">
                    <!-- Search Input + Action Buttons -->
                    <div class="flex gap-1.5">
                      <div class="relative flex-1">
                        <input id="ge-image-search" type="text" placeholder="Search clipart or photos..." class="quiz-input text-xs w-full pr-7" value="${escapeHtml(extractKeywordsForGrammarRule(activeRule, deck))}">
                        <button type="button" id="ge-image-search-clear" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold p-1 cursor-pointer" style="${extractKeywordsForGrammarRule(activeRule, deck) ? '' : 'display:none;'}" aria-label="Clear">✕</button>
                      </div>
                      <button type="button" id="ge-image-search-btn" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1 shadow-sm">
                        <span>🔍</span>
                        <span>Search</span>
                      </button>
                      <button type="button" id="ge-image-suggest-btn" class="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1" title="Extract search keywords from sentence or rule">
                        <span>↳ Use Text</span>
                      </button>
                    </div>

                    <!-- Type Filter Pills -->
                    <div id="ge-image-type-pills" class="flex items-center gap-1.5">
                      <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 cursor-pointer transition shadow-sm" data-image-type="all">✨ All</button>
                      <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition" data-image-type="illustration">🎨 Clipart</button>
                      <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition" data-image-type="photo">📸 Photos</button>
                    </div>

                    <!-- Results Grid -->
                    <div id="ge-image-results" class="grid grid-cols-3 sm:grid-cols-4 gap-2 min-h-[140px] max-h-[185px] overflow-y-auto p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                        <span class="text-2xl opacity-60">📷</span>
                        <p class="font-medium">Click <b>Search</b> to find matching photos & clipart</p>
                      </div>
                    </div>

                    <!-- Load More Pill -->
                    <div class="flex justify-center pt-0.5">
                      <button type="button" id="ge-image-load-more" class="text-[11px] font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer" style="display: none;">
                        ⬇ Load more images
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="space-y-1">
                <label for="ge-rule-bad" class="text-[11px] text-rose-300 font-semibold block">❌ Common Mistake</label>
                <input id="ge-rule-bad" type="text" placeholder="e.g. The elephant walking." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.mistake_bad || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-good" class="text-[11px] text-emerald-300 font-semibold block">✅ Correct Form</label>
                <input id="ge-rule-good" type="text" placeholder="e.g. The elephant is walking." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.mistake_good || '')}">
              </div>
              <div class="space-y-1 sm:col-span-2 pt-2 border-t border-slate-800/80">
                <label for="ge-rule-question" class="text-[11px] text-slate-400 font-semibold block">Quick Check Question</label>
                <input id="ge-rule-question" type="text" placeholder="e.g. Look! The monkeys _____ the tall tree!" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.quiz_question || '')}">
              </div>
              <div class="sm:col-span-2 space-y-1">
                <div class="flex items-center justify-between">
                  <label class="text-[11px] text-slate-400 font-semibold block">⚡ Quick Check Practice Options (3 Choices)</label>
                  <span class="text-[10px] text-slate-500">Correct choice awards coins in student practice</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div class="space-y-1">
                    <label for="ge-rule-answer" class="text-[10px] text-cyan-300 font-bold block flex items-center gap-1">
                      <span>✅</span> Correct Answer *
                    </label>
                    <input id="ge-rule-answer" type="text" placeholder="e.g. are climbing" class="quiz-input text-xs w-full border-cyan-500/50" value="${escapeHtml(activeAnswer)}">
                  </div>
                  <div class="space-y-1">
                    <label for="ge-rule-opt2" class="text-[10px] text-rose-300 font-bold block flex items-center gap-1">
                      <span>❌</span> Wrong Option 2
                    </label>
                    <input id="ge-rule-opt2" type="text" placeholder="e.g. climbs" class="quiz-input text-xs w-full" value="${escapeHtml(activeOpt2 || '')}">
                  </div>
                  <div class="space-y-1">
                    <label for="ge-rule-opt3" class="text-[10px] text-rose-300 font-bold block flex items-center gap-1">
                      <span>❌</span> Wrong Option 3
                    </label>
                    <input id="ge-rule-opt3" type="text" placeholder="e.g. is climbing" class="quiz-input text-xs w-full" value="${escapeHtml(activeOpt3 || '')}">
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button type="button" id="ge-save-rule-btn" class="px-4 py-2 rounded-xl ${isEditing ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black' : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'} text-xs transition flex items-center gap-1.5 shadow active:scale-95 cursor-pointer">
                <span>${isEditing ? '💾' : '➕'}</span>
                <span>${isEditing ? 'Save Rule Changes' : 'Add Rule'}</span>
              </button>
              ${isEditing ? `
                <button type="button" id="ge-cancel-rule-btn" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer">
                  Cancel
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Existing Rules List with Edit and Delete Buttons -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Rules (${rules.length})</h4>
              <span class="text-[11px] text-slate-500">Click ✏️ Edit to modify any rule</span>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              ${rules.length === 0 ? `
                <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                  No rules in this deck yet. Use the form above to add your first rule!
                </div>
              ` : rules.map((r, i) => `
                <div class="p-3 rounded-xl bg-slate-950 border ${editingRuleIndex === i ? 'border-amber-400 bg-amber-950/20 ring-1 ring-amber-400/40' : 'border-slate-800'} flex items-center justify-between gap-3 text-xs transition">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    ${r.image ? `
                      <img src="${escapeHtml(r.image)}" alt="Rule thumbnail" class="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-900" onerror="this.style.display='none'">
                    ` : `
                      <div class="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">📖</div>
                    `}
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <p class="font-bold text-white truncate">${i + 1}. ${escapeHtml(r.title || 'Rule')}</p>
                        ${editingRuleIndex === i ? '<span class="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">EDITING</span>' : ''}
                      </div>
                      <p class="text-slate-400 truncate mt-0.5">${escapeHtml(r.sentence || r.formula || '')}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" class="ge-edit-rule px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold border border-amber-400/30 transition flex items-center gap-1 cursor-pointer" data-rule-idx="${i}" title="Edit Rule">
                      <span>✏️</span> Edit
                    </button>
                    <button type="button" class="ge-del-rule p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 font-bold transition cursor-pointer" data-rule-idx="${i}" title="Delete Rule">
                      🗑️
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" id="ge-cancel-btn" class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer">Done</button>
          </div>
        </div>
      `;

      
      // Image Picker Logic (like Vocab Lists)
      let currentSearchType = 'all';
      let currentSearchPage = 1;
      let currentPhotos = [];
      let isSearching = false;
      let hasMorePhotos = false;
      let selectedImageUrl = activeRule?.image || '';

      const searchInput = modal.querySelector('#ge-image-search');
      const searchClearBtn = modal.querySelector('#ge-image-search-clear');
      const searchBtn = modal.querySelector('#ge-image-search-btn');
      const suggestBtn = modal.querySelector('#ge-image-suggest-btn');
      const resultsContainer = modal.querySelector('#ge-image-results');
      const loadMoreBtn = modal.querySelector('#ge-image-load-more');
      const statusLabel = modal.querySelector('#ge-image-status');
      const ruleImageInput = modal.querySelector('#ge-rule-image');
      const previewContainer = modal.querySelector('#ge-image-preview-container');
      const imageBadge = modal.querySelector('#ge-image-badge');
      const imageClearBtn = modal.querySelector('#ge-image-clear-btn');
      const typePills = modal.querySelectorAll('#ge-image-type-pills .ge-type-pill');

      const updatePreview = (url) => {
        selectedImageUrl = (url || '').trim();
        ruleImageInput.value = selectedImageUrl;
        if (selectedImageUrl) {
          previewContainer.innerHTML = `<img id="ge-image-preview-img" src="${escapeHtml(selectedImageUrl)}" class="w-full h-full object-contain rounded" alt="Selected Rule Image" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\\'text-xs text-rose-400 font-medium\\\'>Invalid image link</span>';">`;
          imageBadge.textContent = '✓ Ready';
          imageBadge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          imageClearBtn?.classList.remove('hidden');
        } else {
          previewContainer.innerHTML = `
            <div id="ge-image-placeholder" class="text-xs text-slate-500 flex flex-col items-center gap-1">
              <svg class="w-7 h-7 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>Choose clipart or photo</span>
            </div>
          `;
          imageBadge.textContent = 'No image';
          imageBadge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400';
          imageClearBtn?.classList.add('hidden');
        }
        resultsContainer.querySelectorAll('.ge-photo-pick-card').forEach(card => {
          const isMatch = selectedImageUrl && card.dataset.photoUrl === selectedImageUrl;
          card.classList.toggle('ring-2', isMatch);
          card.classList.toggle('ring-amber-400', isMatch);
          card.classList.toggle('border-amber-400', isMatch);
          const badgeEl = card.querySelector('.ge-check-badge');
          if (badgeEl) badgeEl.style.display = isMatch ? 'flex' : 'none';
        });
      };

      const renderResultsGrid = () => {
        if (currentPhotos.length === 0) {
          resultsContainer.innerHTML = `
            <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
              <span class="text-2xl opacity-60">🔍</span>
              <p class="font-medium">No images found. Try a different keyword.</p>
            </div>
          `;
          if (statusLabel) statusLabel.textContent = '0 results';
          if (loadMoreBtn) loadMoreBtn.style.display = 'none';
          return;
        }

        resultsContainer.innerHTML = currentPhotos.map(photo => {
          const isMatch = selectedImageUrl && photo.url === selectedImageUrl;
          return `
            <button type="button" class="ge-photo-pick-card relative aspect-video rounded-lg overflow-hidden border ${isMatch ? 'border-amber-400 ring-2 ring-amber-400 bg-amber-950/20' : 'border-slate-800 hover:border-amber-400/70 bg-slate-900'} group cursor-pointer transition text-left" data-photo-url="${escapeHtml(photo.url)}" title="By ${escapeHtml(photo.photographer)}">
              <img src="${escapeHtml(photo.thumb)}" alt="${escapeHtml(photo.photographer)}" class="w-full h-full object-cover">
              <span class="ge-check-badge absolute top-1 right-1 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow" style="${isMatch ? '' : 'display:none;'}">✓</span>
              <span class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold">Select</span>
            </button>
          `;
        }).join('');

        resultsContainer.querySelectorAll('.ge-photo-pick-card').forEach(card => {
          card.addEventListener('click', () => {
            const url = card.dataset.photoUrl;
            updatePreview(url);
            if (typeof toast === 'function') toast('Selected image for this rule!');
          });
        });

        if (statusLabel) statusLabel.textContent = `${currentPhotos.length} images`;
        if (loadMoreBtn) {
          loadMoreBtn.style.display = hasMorePhotos && currentPhotos.length < 80 ? 'inline-block' : 'none';
        }
      };

      const executeSearch = async (reset = false) => {
        const query = (searchInput?.value || '').trim();
        if (!query) {
          if (typeof toast === 'function') toast('Enter a keyword to search.');
          searchInput?.focus();
          return;
        }
        if (isSearching) return;
        if (reset) {
          currentSearchPage = 1;
          currentPhotos = [];
          hasMorePhotos = true;
          resultsContainer.innerHTML = `
            <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
              <span class="animate-spin text-2xl">⏳</span>
              <p class="font-medium">Searching ${currentSearchType === 'illustration' ? 'clipart' : currentSearchType === 'photo' ? 'photos' : 'images'} for &ldquo;${escapeHtml(query)}&rdquo;…</p>
            </div>
          `;
          if (statusLabel) statusLabel.textContent = 'Searching…';
        }

        isSearching = true;
        searchBtn.disabled = true;
        searchBtn.innerHTML = `<span>⏳</span><span>...</span>`;
        if (loadMoreBtn) {
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = 'Loading more…';
        }

        try {
          const data = await fetchMediaForGrammarSearch(query, currentSearchType, currentSearchPage);
          const seen = new Set(currentPhotos.map(p => p.url));
          const newItems = data.photos.filter(p => !seen.has(p.url));
          currentPhotos.push(...newItems);
          currentSearchPage++;
          hasMorePhotos = data.hasMore && newItems.length > 0;
          renderResultsGrid();
        } catch (err) {
          console.error('Grammar image search error:', err);
          if (currentPhotos.length === 0) {
            resultsContainer.innerHTML = `
              <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-rose-400 text-xs">
                <span>⚠️ Search could not complete. Try another term or paste URL.</span>
              </div>
            `;
          }
        } finally {
          isSearching = false;
          searchBtn.disabled = false;
          searchBtn.innerHTML = `<span>🔍</span><span>Search</span>`;
          if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = '⬇ Load more images';
          }
        }
      };

      searchBtn?.addEventListener('click', () => executeSearch(true));
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeSearch(true);
        }
      });
      searchInput?.addEventListener('input', () => {
        if (searchClearBtn) searchClearBtn.style.display = searchInput.value ? 'block' : 'none';
      });
      searchClearBtn?.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchClearBtn.style.display = 'none';
          searchInput.focus();
        }
      });

      suggestBtn?.addEventListener('click', () => {
        const sentenceVal = modal.querySelector('#ge-rule-sentence')?.value || '';
        const titleVal = modal.querySelector('#ge-rule-title')?.value || '';
        const kw = extractKeywordsForGrammarRule({ sentence: sentenceVal, title: titleVal }, deck);
        if (searchInput) {
          searchInput.value = kw;
          if (searchClearBtn) searchClearBtn.style.display = kw ? 'block' : 'none';
        }
        executeSearch(true);
      });

      typePills.forEach(pill => {
        pill.addEventListener('click', () => {
          typePills.forEach(p => {
            p.className = 'ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition';
          });
          pill.className = 'ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 cursor-pointer transition shadow-sm';
          currentSearchType = pill.dataset.imageType || 'all';
          executeSearch(true);
        });
      });

      loadMoreBtn?.addEventListener('click', () => executeSearch(false));

      ruleImageInput?.addEventListener('input', () => {
        updatePreview(ruleImageInput.value);
      });

      imageClearBtn?.addEventListener('click', () => {
        updatePreview('');
      });

      // Auto-trigger search if keywords exist
      if (searchInput && searchInput.value.trim()) {
        executeSearch(true);
      }

      // Interactive Word Chips & Color Assignment Synchronization
      const sentenceInput = modal.querySelector('#ge-rule-sentence');
      const blueInput = modal.querySelector('#ge-rule-words-blue');
      const amberInput = modal.querySelector('#ge-rule-words-amber');
      const greenInput = modal.querySelector('#ge-rule-words-green');
      const wordChipsContainer = modal.querySelector('#ge-sentence-word-chips');

      function syncWordChips() {
        if (!wordChipsContainer || !sentenceInput) return;
        const text = sentenceInput.value.trim();
        if (!text) {
          wordChipsContainer.innerHTML = '<span class="text-xs text-slate-500 italic">Type an example sentence above to click and assign word colors</span>';
          return;
        }

        const cleanWord = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
        const parseWordsSet = (inp) => {
          const s = new Set();
          if (!inp) return s;
          inp.value.split(/[,;\s+]+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw) s.add(cw);
          });
          return s;
        };

        const blueSet = parseWordsSet(blueInput);
        const amberSet = parseWordsSet(amberInput);
        const greenSet = parseWordsSet(greenInput);

        const tokens = text.split(/\s+/).filter(Boolean);
        wordChipsContainer.innerHTML = tokens.map((tok, i) => {
          const cw = cleanWord(tok);
          let colorClass = 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white';
          let state = 'none';

          if (blueSet.has(cw)) {
            colorClass = 'border-sky-400 bg-sky-500/20 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)] font-bold';
            state = 'blue';
          } else if (amberSet.has(cw)) {
            colorClass = 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.3)] font-bold';
            state = 'amber';
          } else if (greenSet.has(cw)) {
            colorClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.3)] font-bold';
            state = 'green';
          }

          return `
            <button type="button" class="ge-word-chip px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer active:scale-95 ${colorClass}" data-index="${i}" data-token="${escapeHtml(tok)}" data-clean="${escapeHtml(cw)}" data-state="${state}">
              ${escapeHtml(tok)}
            </button>
          `;
        }).join('');

        // Wire click handler on word chips
        wordChipsContainer.querySelectorAll('.ge-word-chip').forEach(btn => {
          btn.onclick = () => {
            const clean = btn.dataset.clean;
            const current = btn.dataset.state;

            // Remove clean from all inputs first
            const removeFromInput = (inp) => {
              if (!inp) return;
              const currentTokens = inp.value.split(/[,;\s+]+/).filter(w => cleanWord(w) !== clean && Boolean(w));
              inp.value = currentTokens.join(', ');
            };
            const addToInput = (inp) => {
              if (!inp) return;
              const currentTokens = inp.value.split(/[,;\s+]+/).filter(Boolean);
              if (!currentTokens.some(w => cleanWord(w) === clean)) {
                currentTokens.push(btn.dataset.token.replace(/[^a-zA-Z0-9']/g, ''));
              }
              inp.value = currentTokens.join(', ');
            };

            removeFromInput(blueInput);
            removeFromInput(amberInput);
            removeFromInput(greenInput);

            // Cycle: none -> blue -> amber -> green -> none
            if (current === 'none') {
              addToInput(blueInput);
            } else if (current === 'blue') {
              addToInput(amberInput);
            } else if (current === 'amber') {
              addToInput(greenInput);
            } // else green -> none (already removed)

            syncWordChips();
          };
        });
      }

      sentenceInput?.addEventListener('input', syncWordChips);
      blueInput?.addEventListener('input', syncWordChips);
      amberInput?.addEventListener('input', syncWordChips);
      greenInput?.addEventListener('input', syncWordChips);
      syncWordChips();

      modal.querySelector('#ge-close-btn').onclick = () => modal.remove();
      modal.querySelector('#ge-cancel-btn').onclick = () => modal.remove();

      // Rename Deck
      modal.querySelector('#ge-save-deck-name-btn').onclick = async () => {
        const newName = modal.querySelector('#ge-deck-name-input').value.trim();
        if (!newName) {
          if (typeof toast === 'function') toast('Please enter a deck name.');
          return;
        }
        currentDeckName = newName;
        deck.grammar_deck_name = newName;
        deck.deck_name = newName;
        await window.saveOrUpdateGrammarDeck(deck);
        if (typeof toast === 'function') toast('Deck name updated!');
        renderEditor();
      };

      // Cancel Rule Edit
      modal.querySelector('#ge-cancel-edit-btn')?.addEventListener('click', () => {
        editingRuleIndex = -1;
        renderEditor();
      });
      modal.querySelector('#ge-cancel-rule-btn')?.addEventListener('click', () => {
        editingRuleIndex = -1;
        renderEditor();
      });

      // Add or Save Rule
      modal.querySelector('#ge-save-rule-btn').onclick = async () => {
        const title = modal.querySelector('#ge-rule-title').value.trim();
        const formula = modal.querySelector('#ge-rule-formula').value.trim();
        const sentence = modal.querySelector('#ge-rule-sentence').value.trim();
        const wordsBlue = modal.querySelector('#ge-rule-words-blue')?.value.trim() || '';
        const wordsAmber = modal.querySelector('#ge-rule-words-amber')?.value.trim() || '';
        const wordsGreen = modal.querySelector('#ge-rule-words-green')?.value.trim() || '';
        const clue = modal.querySelector('#ge-rule-clue').value.trim();
        const img = modal.querySelector('#ge-rule-image').value.trim();
        const bad = modal.querySelector('#ge-rule-bad').value.trim();
        const good = modal.querySelector('#ge-rule-good').value.trim();
        const question = modal.querySelector('#ge-rule-question').value.trim();
        const answer = modal.querySelector('#ge-rule-answer').value.trim();
        const opt2 = modal.querySelector('#ge-rule-opt2')?.value.trim() || '';
        const opt3 = modal.querySelector('#ge-rule-opt3')?.value.trim() || '';

        if (!title || !sentence) {
          if (typeof toast === 'function') toast('Please enter a rule title and example sentence.');
          modal.querySelector('#ge-rule-title').focus();
          return;
        }

        // Build 3 distinct choices without placeholders
        const quizOptions = [answer];
        if (opt2) quizOptions.push(opt2);
        if (opt3) quizOptions.push(opt3);
        if (quizOptions.length === 1 && answer) {
          quizOptions.push(answer.endsWith('s') ? answer.slice(0, -1) : answer + 's');
          quizOptions.push('not ' + answer);
        }

        if (isEditing) {
          // Update existing rule
          rules[editingRuleIndex] = {
            ...rules[editingRuleIndex],
            title,
            formula: formula || 'Subject + Verb',
            sentence,
            words_blue: wordsBlue,
            words_amber: wordsAmber,
            words_green: wordsGreen,
            highlight_blue: wordsBlue,
            highlight_amber: wordsAmber,
            highlight_green: wordsGreen,
            context_clue: clue || 'Grammar practice',
            image: img || rules[editingRuleIndex].image || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
            mistake_bad: bad || 'Mistake',
            mistake_good: good || sentence,
            quiz_question: question || 'Complete the sentence:',
            quiz_answer: answer || 'Option 1',
            quiz_options: quizOptions
          };
          deck.rules = rules;
          await window.saveOrUpdateGrammarDeck(deck);
          if (typeof toast === 'function') toast(`Rule #${editingRuleIndex + 1} updated and saved!`);
          editingRuleIndex = -1;
        } else {
          // Add new rule
          const newRule = {
            rule_id: 'rule-' + Date.now(),
            title,
            formula: formula || 'Subject + Verb',
            sentence,
            words_blue: wordsBlue,
            words_amber: wordsAmber,
            words_green: wordsGreen,
            highlight_blue: wordsBlue,
            highlight_amber: wordsAmber,
            highlight_green: wordsGreen,
            context_clue: clue || 'Grammar practice',
            image: img || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
            mistake_bad: bad || 'Mistake',
            mistake_good: good || sentence,
            quiz_question: question || 'Complete the sentence:',
            quiz_options: quizOptions,
            quiz_answer: answer || 'Option 1'
          };
          rules.push(newRule);
          deck.rules = rules;
          await window.saveOrUpdateGrammarDeck(deck);
          if (typeof toast === 'function') toast('New rule added and saved!');
        }

        renderEditor();
      };

      // Click Edit on a Rule
      modal.querySelectorAll('.ge-edit-rule').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.ruleIdx);
          if (idx >= 0 && idx < rules.length) {
            editingRuleIndex = idx;
            renderEditor();
            modal.querySelector('#ge-rule-form-box')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            modal.querySelector('#ge-rule-title')?.focus();
          }
        };
      });

      // Click Delete on a Rule
      modal.querySelectorAll('.ge-del-rule').forEach(btn => {
        btn.onclick = async () => {
          const idx = Number(btn.dataset.ruleIdx);
          if (confirm('Are you sure you want to delete this rule?')) {
            rules.splice(idx, 1);
            if (editingRuleIndex === idx) editingRuleIndex = -1;
            else if (editingRuleIndex > idx) editingRuleIndex--;
            deck.rules = rules;
            await window.saveOrUpdateGrammarDeck(deck);
            if (typeof toast === 'function') toast('Rule deleted.');
            renderEditor();
          }
        };
      });
    }

    renderEditor();
    document.body.appendChild(modal);
  };

  // Delete Deck
  window.deleteGrammarDeck = async function(deckId) {
    if (!confirm('Are you sure you want to delete this grammar deck?')) return;
    
    // Find record
    const all = (typeof allData !== 'undefined' && Array.isArray(allData)) ? allData : [];
    const rec = all.find(r => r.__backendId === deckId || r.id === deckId || r.grammar_deck_id === deckId);
    
    if (rec && window.dataSdk?.delete) {
      await window.dataSdk.delete(rec);
    }
    // Remove from in-memory array if starter
    const starterIdx = STARTER_GRAMMAR_DECKS.findIndex(s => s.__backendId === deckId);
    if (starterIdx >= 0) STARTER_GRAMMAR_DECKS.splice(starterIdx, 1);

    if (typeof allData !== 'undefined' && Array.isArray(allData)) {
      allData = allData.filter(r => r.__backendId !== deckId && r.grammar_deck_id !== deckId);
      window.allData = allData;
    }

    if (typeof toast === 'function') toast('Grammar deck deleted.');
    window.renderClassGrammarDecks();
    window.renderTeacherOwnedGrammarDecks();
  };

  // Share / Assign to Other Classes
  window.openGrammarSharePopupFor = function(deckId, deckName) {
    const deck = window.getAllGrammarDecks().find(d => (d.__backendId === deckId || d.id === deckId || d.grammar_deck_id === deckId));
    if (!deck) return;

    const allClasses = typeof getAllTeacherClasses === 'function' ? getAllTeacherClasses() : [];
    const currentShared = Array.isArray(deck.shared_classes) ? deck.shared_classes : [];

    const popup = document.createElement('div');
    popup.id = 'grammar-share-popup';
    popup.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    popup.innerHTML = `
      <div class="vocab-share-popup-card grammar-share-popup-card max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
        <h4 class="font-bold text-white text-base">Assign "${escapeHtml(deckName)}" to Classes</h4>
        <p class="text-xs text-slate-400">Select which classes can practice this grammar deck:</p>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${allClasses.map(c => `
            <label class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50">
              <input type="checkbox" class="grammar-share-cls-checkbox" value="${escapeHtml(c.class_name)}" ${currentShared.includes(c.class_name) ? 'checked' : ''}>
              <span>${escapeHtml(c.class_name)} (${escapeHtml(c.school_name)})</span>
            </label>
          `).join('')}
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" id="g-share-cancel" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Cancel</button>
          <button type="button" id="g-share-save" class="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">Save Assignment</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    popup.querySelector('#g-share-cancel').onclick = () => popup.remove();
    popup.querySelector('#g-share-save').onclick = async () => {
      const selected = Array.from(popup.querySelectorAll('.grammar-share-cls-checkbox:checked')).map(cb => cb.value);
      deck.shared_classes = selected;
      await window.saveOrUpdateGrammarDeck(deck);
      popup.remove();
      if (typeof toast === 'function') toast('Classes updated!');
      window.renderClassGrammarDecks();
      window.renderTeacherOwnedGrammarDecks();
    };
  };

  // AI Generator Modal for Grammar Decks
  window.openGrammarAiGeneratorModal = function(defaultTopic = '') {
    document.querySelectorAll('#grammar-ai-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.id = 'grammar-ai-modal';
    modal.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto';
    modal.innerHTML = `
      <div class="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 my-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">✨</span>
            <h3 class="text-base font-bold text-white">Generate Grammar Deck with AI</h3>
          </div>
          <button type="button" id="g-ai-close" class="text-slate-400 hover:text-white font-bold text-xl">&times;</button>
        </div>

        <p class="text-xs text-slate-400">Describe what grammar topic you want to teach. AI will generate rules, color-coded formulas, examples, and challenge questions.</p>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Grammar Topic or Skill</label>
            <input id="g-ai-topic" type="text" placeholder="e.g. Comparative Adjectives (-er / more)" class="quiz-input text-xs w-full" value="${escapeHtml(defaultTopic)}">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Target Grade / Level</label>
            <select id="g-ai-level" class="quiz-input text-xs w-full">
              <option value="Beginner">Beginner (ESL / Grade 2-3)</option>
              <option value="Intermediate" selected>Intermediate (ESL / Grade 4-5)</option>
              <option value="Confident">Confident (Grade 6+)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button type="button" id="g-ai-cancel" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
          <button type="button" id="g-ai-submit" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
            <span>✨</span> Generate Deck
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#g-ai-close').onclick = () => modal.remove();
    modal.querySelector('#g-ai-cancel').onclick = () => modal.remove();

    modal.querySelector('#g-ai-submit').onclick = async () => {
      const topic = modal.querySelector('#g-ai-topic').value.trim();
      const level = modal.querySelector('#g-ai-level').value;
      if (!topic) {
        if (typeof toast === 'function') toast('Please enter a grammar topic.');
        return;
      }

      const btn = modal.querySelector('#g-ai-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin">✨</span> Generating with AI…';

      const currentTeacherName = typeof currentTeacher !== 'undefined' ? currentTeacher : 'Teacher Ayman';
      const currentSchool = typeof navSchool !== 'undefined' && navSchool ? navSchool : 'Daya Stanford';
      const currentClass = typeof navClass !== 'undefined' && navClass ? navClass : 'ESL2';
      const newDeckId = 'grammar-deck-' + Date.now();

      let generatedRules = [];
      let finalDeckName = topic;

      // 1. Try real server AI generation via /api/generate-vocab-list (mode: "grammar")
      try {
        const res = await fetch('/api/generate-vocab-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'grammar', topic, level })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.rules) && data.rules.length > 0) {
            generatedRules = data.rules;
            if (data.deck_name) finalDeckName = data.deck_name;
          }
        }
      } catch (err) {
        console.warn('API grammar generation failed, using intelligent pedagogical synthesizer:', err);
      }

      // 2. High-quality pedagogical fallback if AI endpoint did not return rules
      if (!generatedRules.length) {
        generatedRules = synthesizeGrammarRules(topic, level);
      }

      // 3. Ensure each rule has a photo directly matching its example sentence
      for (let i = 0; i < generatedRules.length; i++) {
        const r = generatedRules[i];
        if (!r.image || r.image.includes('elephant-10098979') || r.image.includes('dinosaur-5995333')) {
          try {
            const kw = extractKeywordsForGrammarRule(r, { grammar_deck_name: finalDeckName });
            const media = await fetchMediaForGrammarSearch(kw, 'all', 1);
            if (media.photos && media.photos.length > 0) {
              r.image = media.photos[0].url;
            }
          } catch (_) {}
        }
      }

      const generatedDeck = {
        __backendId: newDeckId,
        id: newDeckId,
        grammar_deck_id: newDeckId,
        grammar_deck_name: finalDeckName,
        deck_name: finalDeckName,
        school_name: currentSchool,
        class_name: currentClass,
        teacher_name: currentTeacherName,
        owner: currentTeacherName,
        created_by: currentTeacherName,
        created_at: new Date().toISOString(),
        cover_image_url: generatedRules[0]?.image || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        type: 'grammar_deck',
        rules: generatedRules
      };

      await window.saveOrUpdateGrammarDeck(generatedDeck);

      modal.remove();
      if (typeof toast === 'function') toast(`Generated grammar deck "${finalDeckName}"!`);
      window.renderClassGrammarDecks();
      window.renderTeacherOwnedGrammarDecks();
      window.openGrammarDeckEditor(newDeckId, finalDeckName);
    };
  };

  // ==========================================
  // PEDAGOGICAL GRAMMAR SYNTHESIZER
  // ==========================================
  function synthesizeGrammarRules(topic, level) {
    const t = topic.toLowerCase();
    const rules = [];

    // Check for specific Wh- question components
    const hasWhatColor = t.includes('what color') || t.includes('what colour');
    const hasHowMany = t.includes('how many') || t.includes('how much');
    const hasWhat = t.includes('what') && !hasWhatColor;
    const hasWhere = t.includes('where');
    const hasWhen = t.includes('when');
    const hasWhy = t.includes('why');
    const hasWho = t.includes('who');

    if (hasWhat || hasWhere || hasWhatColor || hasHowMany || hasWhen || hasWhy || hasWho) {
      if (hasWhat) {
        rules.push({
          rule_id: 'rule-gen-what-' + Date.now(),
          title: 'Asking with "What" (Things & Objects)',
          formula: 'What + is / are + Subject ?',
          sentence: 'What is inside your school backpack?',
          words_blue: 'What',
          words_amber: 'is',
          words_green: 'inside your school backpack',
          context_clue: 'Use "What" to ask about things, objects, or actions.',
          mistake_bad: 'Where is your favorite movie?',
          mistake_good: 'What is your favorite movie?',
          quiz_question: '_____ is your favorite animal in the zoo?',
          quiz_options: ['What', 'Where', 'How many'],
          quiz_answer: 'What',
          image: 'https://cdn.pixabay.com/photo/2019/06/13/09/41/business-4271251_640.png'
        });
      }
      if (hasWhere) {
        rules.push({
          rule_id: 'rule-gen-where-' + Date.now(),
          title: 'Asking with "Where" (Places & Locations)',
          formula: 'Where + is / are + Subject ?',
          sentence: 'Where is the sleeping cat?',
          words_blue: 'Where',
          words_amber: 'is',
          words_green: 'the sleeping cat',
          context_clue: 'Use "Where" to ask about places or locations.',
          mistake_bad: 'What is the library located?',
          mistake_good: 'Where is the library located?',
          quiz_question: '_____ are the students playing soccer?',
          quiz_options: ['Where', 'What color', 'How many'],
          quiz_answer: 'Where',
          image: 'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg'
        });
      }
      if (hasWhatColor) {
        rules.push({
          rule_id: 'rule-gen-color-' + Date.now(),
          title: 'Asking with "What color" (Colors & Shades)',
          formula: 'What color + is / are + Subject ?',
          sentence: 'What color is your bicycle?',
          words_blue: 'What color',
          words_amber: 'is',
          words_green: 'your bicycle',
          context_clue: 'Use "What color" to ask about appearance and shades.',
          mistake_bad: 'How many is your new shirt?',
          mistake_good: 'What color is your new shirt?',
          quiz_question: '_____ is the sky on a sunny afternoon?',
          quiz_options: ['What color', 'Where', 'What'],
          quiz_answer: 'What color',
          image: 'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
        });
      }
      if (hasHowMany) {
        rules.push({
          rule_id: 'rule-gen-many-' + Date.now(),
          title: 'Asking with "How many" (Countable Quantities)',
          formula: 'How many + Plural Noun + are there ?',
          sentence: 'How many apples are in the basket?',
          words_blue: 'How many',
          words_amber: 'are in the basket',
          words_green: 'apples',
          context_clue: 'Use "How many" to ask about numbers of countable items.',
          mistake_bad: 'Where pencils do you have in your bag?',
          mistake_good: 'How many pencils do you have in your bag?',
          quiz_question: '_____ pencils are on the teacher\'s desk?',
          quiz_options: ['How many', 'What color', 'Where'],
          quiz_answer: 'How many',
          image: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg'
        });
      }
      if (hasWhen) {
        rules.push({
          rule_id: 'rule-gen-when-' + Date.now(),
          title: 'Asking with "When" (Time & Occasions)',
          formula: 'When + does / do + Subject + Verb ?',
          sentence: 'When does the English lesson begin?',
          words_blue: 'When',
          words_amber: 'does',
          words_green: 'the English lesson begin',
          context_clue: 'Use "When" to ask about time, days, or moments.',
          mistake_bad: 'Where time does the lesson start?',
          mistake_good: 'When does the lesson start?',
          quiz_question: '_____ do you eat lunch at school?',
          quiz_options: ['When', 'What color', 'Where'],
          quiz_answer: 'When',
          image: 'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg'
        });
      }
      if (hasWhy) {
        rules.push({
          rule_id: 'rule-gen-why-' + Date.now(),
          title: 'Asking with "Why" (Reasons & Explanations)',
          formula: 'Why + is / are + Subject + ... ?',
          sentence: 'Why are you smiling so brightly today?',
          words_blue: 'Why',
          words_amber: 'are',
          words_green: 'you smiling so brightly',
          context_clue: 'Use "Why" to ask for reasons (answered with "Because").',
          mistake_bad: 'What are you happy today?',
          mistake_good: 'Why are you happy today?',
          quiz_question: '_____ are the children wearing raincoats?',
          quiz_options: ['Why', 'How many', 'What color'],
          quiz_answer: 'Why',
          image: 'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png'
        });
      }
      if (hasWho) {
        rules.push({
          rule_id: 'rule-gen-who-' + Date.now(),
          title: 'Asking with "Who" (People & Characters)',
          formula: 'Who + is / are + Subject ?',
          sentence: 'Who is the friendly new student?',
          words_blue: 'Who',
          words_amber: 'is',
          words_green: 'the friendly new student',
          context_clue: 'Use "Who" to ask about a person.',
          mistake_bad: 'What is sitting next to you?',
          mistake_good: 'Who is sitting next to you?',
          quiz_question: '_____ is your partner for the game?',
          quiz_options: ['Who', 'Where', 'What color'],
          quiz_answer: 'Who',
          image: 'https://cdn.pixabay.com/photo/2019/06/13/09/41/business-4271251_640.png'
        });
      }
    }

    if (!rules.length) {
      const isFuture = t.includes('future') || t.includes('will') || t.includes('going to') || t.includes('tomorrow');
      const isPast = t.includes('past') || t.includes('yesterday') || t.includes('did');
      const isContinuous = t.includes('continuous') || t.includes('progressive') || (t.includes('ing') && !isFuture);
      const isPresentSimple = t.includes('simple present') || t.includes('present simple') || t.includes('habit') || t.includes('routine');
      const isComparative = t.includes('comparative') || t.includes('than') || t.includes('superlative');
      const isModal = t.includes('can') || t.includes('modal') || t.includes('should') || t.includes('must');

      if (isFuture) {
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: 'Simple Future (will + Base Verb)',
          formula: 'Subject + will + Base Verb',
          sentence: 'Tomorrow, the students will build a robot in science class.',
          context_clue: 'Use "will" + base verb for future predictions and promises.',
          mistake_bad: 'The students will builds a robot.',
          mistake_good: 'The students will build a robot.',
          quiz_question: 'Tomorrow, our class _____ (visit) the science museum.',
          quiz_options: ['will visit', 'visiting', 'visited'],
          quiz_answer: 'will visit',
          image: 'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: 'Negative Future (will not / won\'t)',
          formula: 'Subject + will not (won\'t) + Base Verb',
          sentence: 'The astronaut won\'t leave Earth until the spaceship is ready.',
          context_clue: 'Use "will not" or "won\'t" for things that will not happen.',
          mistake_bad: 'The astronaut won\'t to leave Earth.',
          mistake_good: 'The astronaut won\'t leave Earth.',
          quiz_question: 'Liam _____ (not forget) to bring his jacket tomorrow.',
          quiz_options: ['won\'t forget', 'not will forget', 'forgetting'],
          quiz_answer: 'won\'t forget',
          image: 'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-3-' + Date.now(),
          title: 'Future with "be going to" (Planned Actions)',
          formula: 'Subject + am / is / are + going to + Base Verb',
          sentence: 'They are going to travel to the sunny beach next Saturday.',
          context_clue: 'Use "going to" for plans already decided.',
          mistake_bad: 'They are going to traveling to the beach.',
          mistake_good: 'They are going to travel to the beach.',
          quiz_question: 'Look at those dark clouds! It is _____ rain.',
          quiz_options: ['going to', 'will to', 'go to'],
          quiz_answer: 'going to',
          image: 'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-4-' + Date.now(),
          title: 'Asking Questions with "Will" (Future Inversion)',
          formula: 'Will + Subject + Base Verb ?',
          sentence: 'Will the chef bake a chocolate cake for the party?',
          context_clue: 'Move "Will" to the front of the sentence to ask.',
          mistake_bad: 'You will bake a cake?',
          mistake_good: 'Will you bake a cake?',
          quiz_question: '_____ the doctor see the patient soon?',
          quiz_options: ['Will', 'Are', 'Is'],
          quiz_answer: 'Will',
          image: 'https://cdn.pixabay.com/photo/2019/06/13/09/41/business-4271251_640.png'
        });
      } else if (isPresentSimple) {
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: 'Present Simple (He / She / It + -s / -es)',
          formula: 'He / She / It + Verb-s / Verb-es',
          sentence: 'The chef bakes fresh bread every morning.',
          context_clue: 'Add -s or -es for he, she, or it in the present.',
          mistake_bad: 'The chef bake fresh bread every morning.',
          mistake_good: 'The chef bakes fresh bread every morning.',
          quiz_question: 'My sister _____ (read) a story before bedtime.',
          quiz_options: ['reads', 'read', 'reading'],
          quiz_answer: 'reads',
          image: 'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: 'Negative Present Simple (don\'t / doesn\'t)',
          formula: 'Subject + don\'t / doesn\'t + Base Verb',
          sentence: 'Lions do not eat plants or grass.',
          context_clue: 'Use "doesn\'t" for he/she/it, "don\'t" for others.',
          mistake_bad: 'He doesn\'t likes broccoli.',
          mistake_good: 'He doesn\'t like broccoli.',
          quiz_question: 'Sarah _____ (not like) cold winter mornings.',
          quiz_options: ['doesn\'t like', 'don\'t like', 'not likes'],
          quiz_answer: 'doesn\'t like',
          image: 'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png'
        });
      } else

      if (isPast) {
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: 'Past Regular Verbs (-ed)',
          formula: 'Subject + Verb-ed',
          sentence: 'Yesterday, the children played soccer in the park.',
          context_clue: 'Use -ed for finished actions in the past.',
          mistake_bad: 'Yesterday, they play soccer.',
          mistake_good: 'Yesterday, they played soccer.',
          quiz_question: 'Last night, Liam _____ (watch) a cartoon.',
          quiz_options: ['watched', 'watches', 'watching'],
          quiz_answer: 'watched',
          image: 'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: 'Past Irregular Verbs (Special Changes)',
          formula: 'Subject + Irregular Past Form',
          sentence: 'Maya went to the library this morning.',
          context_clue: 'No -ed! Memorize special past words (go -> went, eat -> ate).',
          mistake_bad: 'Maya goed to the library.',
          mistake_good: 'Maya went to the library.',
          quiz_question: 'He _____ (see) a funny bird in the garden.',
          quiz_options: ['saw', 'seed', 'seen'],
          quiz_answer: 'saw',
          image: 'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-3-' + Date.now(),
          title: 'Negative Past Actions (did not + base verb)',
          formula: 'Subject + did not (didn\'t) + Base Verb',
          sentence: 'We did not eat ice cream yesterday.',
          context_clue: 'After "did not", keep the verb in base form!',
          mistake_bad: 'We did not ate ice cream.',
          mistake_good: 'We did not eat ice cream.',
          quiz_question: 'She didn\'t _____ (finish) her homework yet.',
          quiz_options: ['finish', 'finished', 'finishing'],
          quiz_answer: 'finish',
          image: 'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
        });
      } else if (isComparative) {
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: 'Short Adjectives (-er + than)',
          formula: 'Subject + is / are + Adjective-er + than + Noun',
          sentence: 'The giraffe is taller than the elephant.',
          context_clue: 'Add -er and "than" to compare two things.',
          mistake_bad: 'The giraffe is more tall than the elephant.',
          mistake_good: 'The giraffe is taller than the elephant.',
          quiz_question: 'An airplane is _____ (fast) than a bicycle.',
          quiz_options: ['faster', 'more fast', 'fastest'],
          quiz_answer: 'faster',
          image: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: 'Long Adjectives (more + Adjective + than)',
          formula: 'Subject + is / are + more + Adjective + than + Noun',
          sentence: 'The butterfly is more colorful than the moth.',
          context_clue: 'Use "more" for long words (2+ syllables).',
          mistake_bad: 'The butterfly is colorfuler than the moth.',
          mistake_good: 'The butterfly is more colorful than the moth.',
          quiz_question: 'Science is _____ (interesting) than maths.',
          quiz_options: ['more interesting', 'interestinger', 'most interesting'],
          quiz_answer: 'more interesting',
          image: 'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
        });
      } else if (isModal) {
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: 'Ability with "Can" (Base Verb)',
          formula: 'Subject + can + Base Verb',
          sentence: 'The little bird can sing a sweet song.',
          context_clue: 'Use "can" for abilities. Never add -s to the verb!',
          mistake_bad: 'The bird can sings a song.',
          mistake_good: 'The bird can sing a song.',
          quiz_question: 'Dolphins can _____ (swim) very fast.',
          quiz_options: ['swim', 'swims', 'swimming'],
          quiz_answer: 'swim',
          image: 'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: 'Negative Ability (cannot / can\'t)',
          formula: 'Subject + cannot (can\'t) + Base Verb',
          sentence: 'Penguins cannot fly in the sky.',
          context_clue: 'Saying NO to an ability.',
          mistake_bad: 'Penguins can\'t flying.',
          mistake_good: 'Penguins can\'t fly.',
          quiz_question: 'Elephants _____ jump high into the air.',
          quiz_options: ['cannot', 'can', 'not can'],
          quiz_answer: 'cannot',
          image: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg'
        });
      } else {
        // Core Affirmative, Negative, and Inversion patterns
        rules.push({
          rule_id: 'rule-gen-1-' + Date.now(),
          title: `${topic} · Affirmative Pattern`,
          formula: 'Subject + Helping Verb + Main Verb',
          sentence: 'The cheerful puppy is running in the yard.',
          context_clue: 'Positive statement demonstrating the core pattern.',
          mistake_bad: 'The puppy running in the yard.',
          mistake_good: 'The puppy is running in the yard.',
          quiz_question: 'The students _____ working quietly on their project.',
          quiz_options: ['are', 'is', 'am'],
          quiz_answer: 'are',
          image: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg'
        });
        rules.push({
          rule_id: 'rule-gen-2-' + Date.now(),
          title: `${topic} · Negative Pattern`,
          formula: 'Subject + Helping Verb + NOT + Main Verb',
          sentence: 'The kitten is not making any noise right now.',
          context_clue: 'Insert "not" after the helping verb.',
          mistake_bad: 'The kitten not is making noise.',
          mistake_good: 'The kitten is not making noise.',
          quiz_question: 'They are _____ playing video games right now.',
          quiz_options: ['not', 'no', 'don\'t'],
          quiz_answer: 'not',
          image: 'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png'
        });
        rules.push({
          rule_id: 'rule-gen-3-' + Date.now(),
          title: `${topic} · Question Form (Inversion)`,
          formula: 'Helping Verb + Subject + Main Verb ?',
          sentence: 'Are you listening carefully to the instructions?',
          context_clue: 'Move the helping verb to the front to ask a question.',
          mistake_bad: 'You are listening carefully?',
          mistake_good: 'Are you listening carefully?',
          quiz_question: '_____ the train arriving on platform two?',
          quiz_options: ['Is', 'Are', 'Do'],
          quiz_answer: 'Is',
          image: 'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg'
        });
      }
    }

    return rules;
  }

  // Wire creation buttons
  window.initGrammarDecksListeners = function() {
    // Mode toggles in Teacher Zone
    document.getElementById('teacher-grammar-mode-mine')?.addEventListener('click', () => {
      window.grammarDecksMode = 'mine';
      window.renderTeacherOwnedGrammarDecks();
    });
    document.getElementById('teacher-grammar-mode-school')?.addEventListener('click', () => {
      window.grammarDecksMode = 'school';
      window.renderTeacherOwnedGrammarDecks();
    });

    // Search query in Teacher Zone
    document.getElementById('teacher-grammar-search-query')?.addEventListener('input', () => {
      window.renderTeacherOwnedGrammarDecks();
    });
    document.getElementById('teacher-grammar-search-field')?.addEventListener('change', () => {
      window.renderTeacherOwnedGrammarDecks();
    });

    // Open AI Generator
    document.getElementById('teacher-grammar-open-ai')?.addEventListener('click', () => {
      window.openGrammarAiGeneratorModal();
    });
    document.getElementById('generate-grammar-deck-btn')?.addEventListener('click', () => {
      const classInput = document.getElementById('new-grammar-deck-name')?.value || '';
      window.openGrammarAiGeneratorModal(classInput);
    });

    // Create Deck in Class subtab
    document.getElementById('create-grammar-deck-btn')?.addEventListener('click', async () => {
      const input = document.getElementById('new-grammar-deck-name');
      const name = String(input?.value || '').trim();
      if (!name) {
        if (typeof toast === 'function') toast('Please enter a grammar deck name.');
        return;
      }

      const newDeckId = 'grammar-deck-' + Date.now();
      const currentTeacherName = typeof currentTeacher !== 'undefined' ? currentTeacher : 'Teacher Ayman';
      const currentSchool = typeof navSchool !== 'undefined' ? navSchool : '';
      const currentClass = typeof navClass !== 'undefined' ? navClass : '';

      const newDeck = {
        __backendId: newDeckId,
        id: newDeckId,
        grammar_deck_id: newDeckId,
        grammar_deck_name: name,
        deck_name: name,
        school_name: currentSchool,
        class_name: currentClass,
        teacher_name: currentTeacherName,
        owner: currentTeacherName,
        created_by: currentTeacherName,
        created_at: new Date().toISOString(),
        cover_image_url: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        type: 'grammar_deck',
        rules: []
      };

      await window.saveOrUpdateGrammarDeck(newDeck);
      input.value = '';
      if (typeof toast === 'function') toast(`Created grammar deck "${name}"!`);
      window.openGrammarDeckEditor(newDeckId, name);
    });

    // Helper for creating and opening grammar deck
    async function createAndOpenTeacherGrammarDeck(name, school, cls) {
      const currentSchool = school || (typeof navSchool !== 'undefined' && navSchool ? navSchool : 'Daya Stanford');
      const currentClass = cls || (typeof navClass !== 'undefined' && navClass ? navClass : 'ESL2');
      const currentTeacherName = typeof currentTeacher !== 'undefined' ? currentTeacher : 'Teacher Ayman';
      const newDeckId = 'grammar-deck-' + Date.now();

      const newDeck = {
        __backendId: newDeckId,
        id: newDeckId,
        grammar_deck_id: newDeckId,
        grammar_deck_name: name.trim(),
        deck_name: name.trim(),
        school_name: currentSchool,
        class_name: currentClass,
        teacher_name: currentTeacherName,
        owner: currentTeacherName,
        created_by: currentTeacherName,
        created_at: new Date().toISOString(),
        cover_image_url: 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        type: 'grammar_deck',
        rules: []
      };

      await window.saveOrUpdateGrammarDeck(newDeck);
      if (typeof toast === 'function') toast(`Created grammar deck "${name.trim()}"!`);
      window.openGrammarDeckEditor(newDeckId, name.trim());
    }

    // Create Deck in Teacher Zone modal
    const teacherGrammarModal = document.getElementById('teacher-grammar-create-modal');
    const closeTeacherGrammarModal = () => { teacherGrammarModal?.classList.add('hidden'); };

    document.getElementById('teacher-grammar-open-create')?.addEventListener('click', () => {
      if (teacherGrammarModal) {
        const classSelect = document.getElementById('teacher-grammar-create-class');
        if (classSelect && typeof getAllTeacherClasses === 'function') {
          const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
          const managedClasses = getAllTeacherClasses().filter(cls => typeof canManageClass === 'function' ? canManageClass(cls.school_name, cls.class_name) : true);
          classSelect.innerHTML = '<option value="">Choose a class</option>' + managedClasses.map(cls => 
            `<option value="${esc(cls.__backendId || cls.id)}">${esc(cls.class_name)} · ${esc(cls.school_name)}</option>`
          ).join('');
        }
        const nameInput = document.getElementById('teacher-grammar-create-name');
        if (nameInput) nameInput.value = '';
        teacherGrammarModal.classList.remove('hidden');
        nameInput?.focus();
      } else {
        const name = prompt('Enter new grammar deck name:');
        if (!name || !name.trim()) return;
        createAndOpenTeacherGrammarDeck(name.trim(), '', '');
      }
    });

    document.getElementById('teacher-grammar-create-close')?.addEventListener('click', closeTeacherGrammarModal);
    teacherGrammarModal?.addEventListener('click', event => { if (event.target === teacherGrammarModal) closeTeacherGrammarModal(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && teacherGrammarModal && !teacherGrammarModal.classList.contains('hidden')) {
        closeTeacherGrammarModal();
      }
    });

    document.getElementById('teacher-grammar-create-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const input = document.getElementById('teacher-grammar-create-name');
      const select = document.getElementById('teacher-grammar-create-class');
      const name = input ? input.value.trim() : '';
      if (!name) {
        if (typeof toast === 'function') toast('Please enter a grammar deck name.');
        input?.focus();
        return;
      }

      let chosenSchool = typeof navSchool !== 'undefined' ? navSchool : 'Daya Stanford';
      let chosenClass = typeof navClass !== 'undefined' ? navClass : 'ESL2';
      if (select && select.value && typeof allData !== 'undefined' && Array.isArray(allData)) {
        const found = allData.find(row => (row.__backendId === select.value || row.id === select.value) && row.type === 'class');
        if (found) {
          chosenSchool = found.school_name || chosenSchool;
          chosenClass = found.class_name || chosenClass;
        }
      }

      closeTeacherGrammarModal();
      await createAndOpenTeacherGrammarDeck(name, chosenSchool, chosenClass);
    });
  };

  // Auto-init on DOMContentLoaded or immediate if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.initGrammarDecksListeners();
    });
  } else {
    window.initGrammarDecksListeners();
  }

})(window);
