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
    const currentName = String(typeof currentTeacher !== 'undefined' ? currentTeacher : '').trim().toLowerCase();
    const currentId = String(typeof currentTeacherRecordId !== 'undefined' ? currentTeacherRecordId : (typeof verifiedTeacherIdentity === 'function' ? verifiedTeacherIdentity() : '')).trim();
    if (typeof isAymanTeacher === 'function' && isAymanTeacher()) return true;

    const deckTeacher = String(deck.teacher_name || deck.created_by || deck.owner || '').trim().toLowerCase();
    const deckOwnerId = String(deck.owner_id || deck.teacher_id || deck.cloud_user_id || '').trim();

    if (currentName && deckTeacher === currentName) return true;
    if (currentId && deckOwnerId === currentId) return true;
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
              <button type="button" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition" title="Edit Deck" onclick="window.openGrammarDeckEditor('${escapeHtml(deckId)}', '${escapeHtml(name)}')">
                ✏️
              </button>
              <button type="button" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition" title="Delete Deck" onclick="window.deleteGrammarDeck('${escapeHtml(deckId)}')">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
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
        <div class="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-xl space-y-4" data-grammar-deck-id="${escapeHtml(deckId)}">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">Grammar</span>
              <span class="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">${rules.length} rules</span>
            </div>
            
            <h4 class="text-lg font-bold text-white truncate hover:text-amber-300 transition cursor-pointer" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
              ${escapeHtml(name)}
            </h4>
            
            <!-- Marked by the teacher who created it -->
            <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-1 mb-3">
              <span>👤</span> By <span class="text-amber-300 font-semibold">${escapeHtml(teacher)}</span> · <span class="text-slate-500">${escapeHtml(cls)} (${escapeHtml(school)})</span>
            </div>

            <!-- Cover Image Preview -->
            <div class="relative group/cover rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 cursor-pointer" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
              <img src="${escapeHtml(cover)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105">
              <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/cover:opacity-100 transition flex items-center justify-center">
                <span class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md">Open Practice</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <div class="flex items-center gap-1.5">
              <button type="button" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm active:scale-95" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
                Practice
              </button>
              <button type="button" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition" onclick="window.openGrammarSharePopupFor('${escapeHtml(deckId)}', '${escapeHtml(name)}')">
                Assign
              </button>
            </div>
            ${isOwner ? `
              <div class="flex items-center gap-1">
                <button type="button" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs" title="Edit Deck" onclick="window.openGrammarDeckEditor('${escapeHtml(deckId)}', '${escapeHtml(name)}')">
                  ✏️
                </button>
                <button type="button" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition text-xs" title="Delete Deck" onclick="window.deleteGrammarDeck('${escapeHtml(deckId)}')">
                  🗑️
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
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

  window.openGrammarDeckPractice = function(deck) {
    document.querySelectorAll('#grammar-practice-modal').forEach(m => m.remove());

    const rules = Array.isArray(deck.rules) && deck.rules.length ? deck.rules : [
      {
        title: 'Grammar Rule',
        formula: 'Subject + Verb',
        sentence: 'Pikachu runs happily.',
        context_clue: 'Action',
        image: deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        mistake_bad: 'Pikachu run.',
        mistake_good: 'Pikachu runs.',
        quiz_question: 'Ash _____ (train) his Pokémon every day.',
        quiz_options: ['train', 'trains', 'training'],
        quiz_answer: 'trains'
      }
    ];

    let currentIndex = 0;

    const modal = document.createElement('div');
    modal.id = 'grammar-practice-modal';
    modal.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200';
    
    function renderCard(idx) {
      const r = rules[idx];
      const isFirst = idx === 0;
      const isLast = idx === rules.length - 1;

      modal.innerHTML = `
        <div class="max-w-3xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
          <!-- Top Bar -->
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
                🧩
              </span>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/25">
                  ${escapeHtml(deck.grammar_deck_name || deck.deck_name || 'Grammar Deck')} · Rule ${idx + 1} of ${rules.length}
                </span>
                <h3 class="text-lg sm:text-xl font-black text-white mt-1">${escapeHtml(r.title || 'Grammar Rule')}</h3>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="gp-read-rule-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5">
                <span>🔊</span> <span>Read</span>
              </button>
              <button type="button" id="gp-close-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center transition" aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          <!-- Grammar Formula Chips -->
          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Grammar Formula</label>
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2 shadow-inner">
              ${escapeHtml(r.formula || '').split('+').map(part => `
                <span class="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-xs sm:text-sm">
                  ${escapeHtml(part.trim())}
                </span>
              `).join('<span class="text-slate-500 font-bold text-base">+</span>')}
            </div>
          </div>

          <!-- Photo & Target Sentence Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-44 flex items-center justify-center">
              <img src="${escapeHtml(r.image || deck.cover_image_url || '')}" alt="${escapeHtml(r.title)}" class="w-full h-full object-cover">
              ${r.context_clue ? `
                <div class="absolute bottom-2 inset-x-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 text-center">
                  <span class="text-[11px] text-amber-300 font-bold">Context: ${escapeHtml(r.context_clue)}</span>
                </div>
              ` : ''}
            </div>

            <div class="flex flex-col justify-between space-y-3">
              <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 flex-1 flex flex-col justify-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Target Sentence</span>
                <p class="text-base font-bold text-white leading-snug">${escapeHtml(r.sentence || '')}</p>
              </div>

              <!-- Watch Out Common Mistake Box -->
              <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                  <span>⚠️</span> Watch Out (Common Mistake)
                </span>
                <div class="grid grid-cols-2 gap-1.5 text-xs">
                  <div class="p-1.5 rounded-lg bg-slate-900 border border-rose-500/30 text-rose-300 flex items-center gap-1 truncate">
                    <span class="font-bold shrink-0">❌</span> <span class="truncate">${escapeHtml(r.mistake_bad || 'Mistake')}</span>
                  </div>
                  <div class="p-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 truncate">
                    <span class="font-bold shrink-0">✅</span> <span class="truncate font-semibold">${escapeHtml(r.mistake_good || 'Correct')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Check Challenge -->
          <div class="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <span>⚡</span> Quick Check
              </span>
              <span id="gp-check-feedback" class="text-xs font-bold hidden"></span>
            </div>
            <p class="text-sm font-bold text-white">${escapeHtml(r.quiz_question || 'Choose the correct form:')}</p>
            <div class="flex flex-wrap gap-2 pt-1" id="gp-options-row">
              ${(r.quiz_options || ['Option 1', 'Option 2']).map(opt => `
                <button type="button" class="gp-quiz-opt px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer" data-val="${escapeHtml(opt)}">
                  ${escapeHtml(opt)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Navigation Bar -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button type="button" id="gp-prev-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed" ${isFirst ? 'disabled' : ''}>
              ← Previous Rule
            </button>
            <div class="flex gap-1.5">
              ${rules.map((_, i) => `
                <span class="w-2.5 h-2.5 rounded-full transition ${i === idx ? 'bg-amber-400 scale-125' : 'bg-slate-700'}"></span>
              `).join('')}
            </div>
            <button type="button" id="gp-next-btn" class="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" ${isLast ? 'disabled' : ''}>
              Next Rule →
            </button>
          </div>
        </div>
      `;

      // Wire close
      modal.querySelector('#gp-close-btn').onclick = () => modal.remove();
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

      // Wire nav
      modal.querySelector('#gp-prev-btn').onclick = () => { if (currentIndex > 0) { currentIndex--; renderCard(currentIndex); } };
      modal.querySelector('#gp-next-btn').onclick = () => { if (currentIndex < rules.length - 1) { currentIndex++; renderCard(currentIndex); } };

      // Wire sound / speech
      modal.querySelector('#gp-read-rule-btn').onclick = () => {
        const textToSpeak = `${r.title}. Formula: ${r.formula}. Example: ${r.sentence}`;
        if (typeof playVocabPronunciation === 'function') {
          playVocabPronunciation(r.sentence || r.title);
        } else if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(textToSpeak);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
        }
        if (typeof toast === 'function') toast('Playing sentence pronunciation…');
      };

      // Wire Quick Check quiz options
      modal.querySelectorAll('.gp-quiz-opt').forEach(btn => {
        btn.onclick = () => {
          const chosen = btn.dataset.val;
          const correct = r.quiz_answer;
          const fb = modal.querySelector('#gp-check-feedback');
          fb.classList.remove('hidden');

          if (chosen === correct) {
            btn.classList.remove('bg-slate-800');
            btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-400');
            fb.innerHTML = '<span class="text-emerald-400">✨ Correct! +5 coins awarded!</span>';
            if (typeof triggerCoinSound === 'function') triggerCoinSound();
          } else {
            btn.classList.remove('bg-slate-800');
            btn.classList.add('bg-rose-500', 'text-white', 'border-rose-400');
            fb.innerHTML = `<span class="text-rose-400">❌ Not quite. Answer: <b>${escapeHtml(correct)}</b></span>`;
          }
        };
      });
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

    const deck = window.getAllGrammarDecks().find(d => (d.__backendId === deckId || d.id === deckId || d.grammar_deck_id === deckId));
    if (!deck) {
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

      modal.innerHTML = `
        <div class="max-w-2xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
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
              <div class="space-y-1">
                <label for="ge-rule-clue" class="text-[11px] text-slate-400 font-semibold block">Context Clue / Hint</label>
                <input id="ge-rule-clue" type="text" placeholder="e.g. Right now at this moment" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.context_clue || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-image" class="text-[11px] text-slate-400 font-semibold block">Rule Image URL</label>
                <input id="ge-rule-image" type="url" placeholder="https://cdn.pixabay.com/..." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.image || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-bad" class="text-[11px] text-rose-300 font-semibold block">❌ Common Mistake</label>
                <input id="ge-rule-bad" type="text" placeholder="e.g. The elephant walking." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.mistake_bad || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-good" class="text-[11px] text-emerald-300 font-semibold block">✅ Correct Form</label>
                <input id="ge-rule-good" type="text" placeholder="e.g. The elephant is walking." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.mistake_good || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-question" class="text-[11px] text-slate-400 font-semibold block">Quick Check Question</label>
                <input id="ge-rule-question" type="text" placeholder="e.g. Look! The monkeys _____ the tall tree!" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.quiz_question || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-answer" class="text-[11px] text-slate-400 font-semibold block">Correct Answer</label>
                <input id="ge-rule-answer" type="text" placeholder="e.g. are climbing" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.quiz_answer || '')}">
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
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-white truncate">${i + 1}. ${escapeHtml(r.title || 'Rule')}</p>
                      ${editingRuleIndex === i ? '<span class="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">EDITING</span>' : ''}
                    </div>
                    <p class="text-slate-400 truncate mt-0.5">${escapeHtml(r.sentence || r.formula || '')}</p>
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
        const clue = modal.querySelector('#ge-rule-clue').value.trim();
        const img = modal.querySelector('#ge-rule-image').value.trim();
        const bad = modal.querySelector('#ge-rule-bad').value.trim();
        const good = modal.querySelector('#ge-rule-good').value.trim();
        const question = modal.querySelector('#ge-rule-question').value.trim();
        const answer = modal.querySelector('#ge-rule-answer').value.trim();

        if (!title || !sentence) {
          if (typeof toast === 'function') toast('Please enter a rule title and example sentence.');
          modal.querySelector('#ge-rule-title').focus();
          return;
        }

        if (isEditing) {
          // Update existing rule
          rules[editingRuleIndex] = {
            ...rules[editingRuleIndex],
            title,
            formula: formula || 'Subject + Verb',
            sentence,
            context_clue: clue || 'Grammar practice',
            image: img || rules[editingRuleIndex].image || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
            mistake_bad: bad || 'Mistake',
            mistake_good: good || sentence,
            quiz_question: question || 'Complete the sentence:',
            quiz_answer: answer || 'Option 1',
            quiz_options: answer ? [answer, 'Option 2', 'Option 3'] : (rules[editingRuleIndex].quiz_options || ['Option 1', 'Option 2', 'Option 3'])
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
            context_clue: clue || 'Grammar practice',
            image: img || deck.cover_image_url || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
            mistake_bad: bad || 'Mistake',
            mistake_good: good || sentence,
            quiz_question: question || 'Complete the sentence:',
            quiz_options: [answer || 'Option 1', 'Option 2', 'Option 3'],
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
    popup.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    popup.innerHTML = `
      <div class="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
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
      const isPast = t.includes('past') || t.includes('yesterday') || t.includes('did');
      const isContinuous = t.includes('continuous') || t.includes('progressive') || t.includes('ing');
      const isComparative = t.includes('comparative') || t.includes('than') || t.includes('superlative');
      const isModal = t.includes('can') || t.includes('modal') || t.includes('should') || t.includes('must');

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
