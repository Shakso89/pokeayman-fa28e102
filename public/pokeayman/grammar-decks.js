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
          formula_parts: [
            { name: 'Subject', colorIndex: 0, alternatives: ['The elephant', 'The clever monkey', 'The playful puppy', 'The astronaut'] },
            { name: 'am / is / are', colorIndex: 1, alternatives: ['is', 'was'] },
            { name: 'Verb-ing', colorIndex: 2, alternatives: ['walking', 'climbing', 'running', 'sleeping'] }
          ],
          suffix_color: 3,
          sentence: 'The elephant is walking slowly in the grass.',
          word_assignments: [
            { token: 'The', text: 'The', color: 0 },
            { token: 'elephant', text: 'elephant', color: 0 },
            { token: 'is', text: 'is', color: 1 },
            {
              token: 'walking',
              isSplit: true,
              segments: [
                { text: 'walk', color: 2 },
                { text: 'ing', color: 3 }
              ]
            },
            { token: 'slowly', text: 'slowly', color: -1 },
            { token: 'in', text: 'in', color: -1 },
            { token: 'the', text: 'the', color: -1 },
            { token: 'grass.', text: 'grass', color: -1, punct: '.' }
          ],
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
          formula_parts: [
            { name: 'Subject', colorIndex: 0, alternatives: ['The dinosaur', 'The little panda', 'The friendly robot', 'The astronaut'] },
            { name: 'am / is / are + NOT', colorIndex: 1, alternatives: ['is not', 'was not', 'is definitely not'] },
            { name: 'Verb-ing', colorIndex: 2, alternatives: ['sleeping', 'eating', 'crying', 'playing'] }
          ],
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
          formula_parts: [
            { name: 'Am / Is / Are', colorIndex: 1, alternatives: ['Are', 'Were'] },
            { name: 'Subject', colorIndex: 0, alternatives: ['you', 'they', 'the students'] },
            { name: 'Verb-ing', colorIndex: 2, alternatives: ['studying', 'practicing', 'preparing', 'reading'] }
          ],
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
    if (rule?.image_keywords && typeof rule.image_keywords === 'string' && rule.image_keywords.trim()) {
      return rule.image_keywords.trim();
    }
    const sentence = (rule?.sentence || '').trim();
    const title = (rule?.title || '').trim();
    const text = sentence || title || (deck?.grammar_deck_name || deck?.deck_name || '');
    if (!text) return 'classroom';
    const clean = text.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
      'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which',
      'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      'can', 'will', 'just', 'should', 'now', 'today', 'tomorrow', 'yesterday', 'right', 'rule', 'formula',
      'practice', 'students', 'student', 'people', 'person', 'they', 'them', 'someone', 'something', 'anything',
      'does', 'doing', 'have', 'having', 'make', 'making', 'take', 'taking', 'look', 'see', 'want', 'like'
    ]);
    const words = clean.split(' ').filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
    if (words.length > 0) {
      // Pick a distinctive concrete noun (often appearing toward object or subject)
      return words[words.length - 1] || words[0];
    }
    return clean.split(' ').slice(0, 1)[0] || 'classroom';
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

    // Sanitize any accidental "+ Part 4" placeholder from rules where the formula already has real parts
    all.forEach(deck => {
      if (Array.isArray(deck.rules)) {
        deck.rules.forEach(rule => {
          if (rule && typeof rule.formula === 'string' && /\+\s*part\s*\d+/i.test(rule.formula)) {
            rule.formula = rule.formula.replace(/\s*\+\s*part\s*\d+/gi, '').trim();
          }
          if (rule && Array.isArray(rule.formula_parts) && rule.formula_parts.length > 3) {
            rule.formula_parts = rule.formula_parts.filter(p => !/^part\s*\d+$/i.test(String(p.name || '').trim()));
          }
        });
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

    const norm = n => String(n || '').trim().toLowerCase().replace(/^(teacher|tr\.?)\s+/i, '');
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

    // Assigned class check: if this teacher manages the class of this deck, they are an owner/manager
    const sName = deck.school_name || (typeof navSchool !== 'undefined' ? navSchool : '');
    const cName = deck.class_name || (typeof navClass !== 'undefined' ? navClass : '');
    if (sName && cName) {
      if (typeof window.canOpenClass === 'function' && window.canOpenClass(sName, cName)) return true;
      if (typeof window.canManageClass === 'function' && window.canManageClass(sName, cName)) return true;
    }
    return false;
  }

  // ==========================================
  // RENDER: Class Subtab Grammar
  // ==========================================
  window.renderClassGrammarDecks = function() {
    if (typeof updateGrammarAiAdminVisibility === 'function') {
      updateGrammarAiAdminVisibility();
    }
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
      const safeName = String(name).replace(/'/g, "\\'");

      return `
        <div class="vocab-list-card canva-card p-4 sm:p-5 flex flex-col justify-between" data-grammar-deck-id="${escapeHtml(deckId)}">
          <!-- 1. Header: Title, Count, Origin on Left; Ghost Icons on Right (Matches VB Lists) -->
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex-1 min-w-0">
              <h4 class="vocab-list-name text-sm sm:text-base font-bold text-white truncate flex items-center gap-1.5" title="${escapeHtml(name)}">
                ${escapeHtml(name)}
              </h4>
              <div class="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-slate-400">
                <span>${rules.length} rule${rules.length !== 1 ? 's' : ''}</span>
                ${teacher ? `<span>•</span><span>By <b class="text-amber-300 font-semibold">${escapeHtml(teacher)}</b></span>` : ''}
              </div>
            </div>

            <!-- Ghost Quick Action Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              ${isOwner ? `
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer cg-edit-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Edit ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer cg-share-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Assign ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
                <button 
                  type="button" 
                  class="vb-ghost-action-btn vb-ghost-delete-btn p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 transition active:scale-95 cursor-pointer cg-del-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  title="Delete ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              ` : `
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer cg-share-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Assign ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              `}
            </div>
          </div>

          <!-- 2. Image Preview with Hover Change Cover Overlay (Exact Match with Image 1) -->
          <div class="relative group/cover rounded-xl overflow-hidden aspect-[16/10] bg-slate-900/60 border border-slate-700/50 flex items-center justify-center my-2 cursor-pointer" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
            ${cover
              ? `<img src="${escapeHtml(cover)}" alt="Cover for ${escapeHtml(name)}" class="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105" loading="lazy">`
              : `<div class="text-slate-500 text-xs font-semibold flex items-center gap-1.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> No cover image</div>`
            }
            ${isOwner ? `
              <div class="vocab-cover-hover-overlay absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <button 
                  type="button" 
                  onclick="event.stopPropagation();window.openGrammarDeckEditor('${escapeHtml(deckId)}','${safeName}')" 
                  class="vocab-change-cover-btn py-1.5 px-3 rounded-xl bg-white/95 text-slate-800 border border-amber-400/80 shadow-md text-xs font-bold flex items-center gap-1.5 hover:bg-white hover:scale-105 active:scale-95 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span>Change Cover</span>
                </button>
              </div>
            ` : ''}
          </div>

          <!-- 3. Bottom Controls: Single Clean Row (Practice & Assign / Matches Image 1) -->
          <div class="vocab-card-bottom-bar flex items-center gap-2 mt-auto pt-2">
            <button
              type="button"
              onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')"
              class="vocab-flashcard-pill flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 bg-amber-50 border-amber-300/80 text-amber-800 hover:bg-amber-100/70 shadow-sm dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-300 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Practice</span>
            </button>

            <button
              type="button"
              onclick="event.stopPropagation();window.openGrammarSharePopupFor('${escapeHtml(deckId)}','${safeName}')"
              class="vocab-game-pill flex-1 py-2 px-3 rounded-xl border transition active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>Assign</span>
            </button>
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
    container.querySelectorAll('.cg-share-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.openGrammarSharePopupFor(btn.dataset.deckId, btn.dataset.deckName);
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
    if (typeof updateGrammarAiAdminVisibility === 'function') {
      updateGrammarAiAdminVisibility();
    }
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
      const safeName = String(name).replace(/'/g, "\\'");

      return `
        <div class="vocab-list-card canva-card p-4 sm:p-5 flex flex-col justify-between" data-grammar-deck-id="${escapeHtml(deckId)}">
          <!-- 1. Header: Title, Count, Origin on Left; Ghost Icons on Right (Matches VB Lists) -->
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex-1 min-w-0">
              <h4 class="vocab-list-name text-sm sm:text-base font-bold text-white truncate flex items-center gap-1.5" title="${escapeHtml(name)}">
                ${escapeHtml(name)}
              </h4>
              <div class="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-slate-400">
                <span>${rules.length} rule${rules.length !== 1 ? 's' : ''}</span>
                ${teacher ? `<span>•</span><span>By <b class="text-amber-300 font-semibold">${escapeHtml(teacher)}</b></span>` : ''}
              </div>
            </div>

            <!-- Ghost Quick Action Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              ${isOwner ? `
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer tg-edit-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Edit ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer tg-assign-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Assign ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
                <button 
                  type="button" 
                  class="vb-ghost-action-btn vb-ghost-delete-btn p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 transition active:scale-95 cursor-pointer tg-del-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  title="Delete ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              ` : `
                <button 
                  type="button" 
                  class="vb-ghost-action-btn p-1.5 rounded-lg text-slate-400 hover:text-white transition active:scale-95 cursor-pointer tg-assign-btn" 
                  data-deck-id="${escapeHtml(deckId)}" 
                  data-deck-name="${escapeHtml(name)}" 
                  title="Assign ${escapeHtml(name)}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              `}
            </div>
          </div>

          <!-- 2. Image Preview with Hover Change Cover Overlay (Exact Match with Image 1) -->
          <div class="relative group/cover rounded-xl overflow-hidden aspect-[16/10] bg-slate-900/60 border border-slate-700/50 flex items-center justify-center my-2 cursor-pointer" onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')">
            ${cover
              ? `<img src="${escapeHtml(cover)}" alt="Cover for ${escapeHtml(name)}" class="w-full h-full object-cover transition duration-300 group-hover/cover:scale-105" loading="lazy">`
              : `<div class="text-slate-500 text-xs font-semibold flex items-center gap-1.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> No cover image</div>`
            }
            ${isOwner ? `
              <div class="vocab-cover-hover-overlay absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <button 
                  type="button" 
                  onclick="event.stopPropagation();window.openGrammarDeckEditor('${escapeHtml(deckId)}','${safeName}')" 
                  class="vocab-change-cover-btn py-1.5 px-3 rounded-xl bg-white/95 text-slate-800 border border-amber-400/80 shadow-md text-xs font-bold flex items-center gap-1.5 hover:bg-white hover:scale-105 active:scale-95 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span>Change Cover</span>
                </button>
              </div>
            ` : ''}
          </div>

          <!-- 3. Bottom Controls: Single Clean Row (Practice & Assign / Matches Image 1) -->
          <div class="vocab-card-bottom-bar flex items-center gap-2 mt-auto pt-2">
            <button
              type="button"
              onclick="window.openGrammarDeckPracticeById('${escapeHtml(deckId)}')"
              class="vocab-flashcard-pill flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 bg-amber-50 border-amber-300/80 text-amber-800 hover:bg-amber-100/70 shadow-sm dark:bg-amber-400/15 dark:border-amber-400/40 dark:text-amber-300 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Practice</span>
            </button>

            <button
              type="button"
              onclick="event.stopPropagation();window.openGrammarSharePopupFor('${escapeHtml(deckId)}','${safeName}')"
              class="vocab-game-pill flex-1 py-2 px-3 rounded-xl border transition active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>Assign</span>
            </button>
          </div>
        </div>
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

  // Comprehensive English Verb Inflection & Suffix Detection Engine
  // Covers: -s, -es, -ies, -ed, -ied, -ing, contractions (n't), participles (-en), comparatives/superlatives (-er, -est, -ier, -iest)
  // and CVC doubled consonants before -ing and -ed (-ping, -ning, -ting, -ming, -ging, -ding, -bing, -ped, -ned, -ged, etc.)
  function detectSuffix(core, formulaParts = []) {
    if (!core || typeof core !== 'string') return null;
    const clean = core.replace(/[^a-zA-Z']/g, '');
    if (clean.length < 3) return null;
    const lower = clean.toLowerCase();

    // 1. Explicit hyphen or plus split (e.g. walk-ing, play-ed, stop-ping, study+ies)
    if (clean.includes('-') || clean.includes('+')) {
      const sep = clean.includes('-') ? '-' : '+';
      const parts = clean.split(sep);
      if (parts.length === 2 && parts[0] && parts[1]) {
        return { root: parts[0], suffix: parts[1] };
      }
    }

    // 2. Contractions with n't (e.g. isn't -> is + n't, doesn't -> does + n't, didn't -> did + n't)
    if (lower.endsWith("n't") && lower.length >= 4) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 3. Consonant + y -> -ies (e.g. studies -> stud + ies, cries -> cr + ies, flies -> fl + ies, tries -> tr + ies)
    const NOT_IES = new Set(['species', 'series', 'pies', 'ties', 'dies', 'lies']);
    if (lower.endsWith('ies') && lower.length >= 5 && !NOT_IES.has(lower)) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 4. Consonant + y -> -ied (e.g. studied -> stud + ied, cried -> cr + ied, tried -> tr + ied, carried -> carr + ied)
    const NOT_IED = new Set(['died', 'tied', 'lied']);
    if (lower.endsWith('ied') && lower.length >= 5 && !NOT_IED.has(lower)) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // Base twin-consonant roots ending in -ll, -ss, -zz before -ing
    // e.g. falling -> fall + ing, calling -> call + ing, telling -> tell + ing, passing -> pass + ing, buzzing -> buzz + ing
    if ((lower.endsWith('lling') || lower.endsWith('ssing') || lower.endsWith('zzing')) && lower.length >= 6) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 5. CVC Doubled consonant before -ing (e.g. stopping -> stop + ping, running -> run + ning, swimming -> swim + ming, sitting -> sit + ting)
    // Consonants doubled in CVC: p, t, n, m, g, d, b, r
    const cvcIngMatch = lower.match(/^([a-z]+?)([bdfgmnprt])\2ing$/i);
    if (cvcIngMatch) {
      const rootLen = clean.length - 4; // root keeps 1 consonant; suffix gets doubled letter + ing (4 chars)
      if (rootLen >= 2) {
        return { root: clean.slice(0, rootLen), suffix: clean.slice(rootLen) };
      }
    }

    // 6. Regular, silent -e dropped, or -ie -> -y before -ing (e.g. walking -> walk + ing, dancing -> danc + ing, writing -> writ + ing, lying -> ly + ing)
    const NOT_ING = new Set(['bring', 'spring', 'string', 'thing', 'during', 'ring', 'sing', 'king', 'wing', 'morning', 'evening', 'ceiling', 'pudding']);
    if (lower.endsWith('ing') && lower.length >= 5 && !NOT_ING.has(lower)) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // Base twin-consonant roots ending in -ll, -ss, -zz before -ed
    // e.g. called -> call + ed, passed -> pass + ed, buzzed -> buzz + ed
    if ((lower.endsWith('lled') || lower.endsWith('ssed') || lower.endsWith('zzed')) && lower.length >= 5) {
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 7. CVC Doubled consonant before -ed (e.g. stopped -> stop + ped, planned -> plan + ned, jogged -> jog + ged, clapped -> clap + ped)
    const cvcEdMatch = lower.match(/^([a-z]+?)([bdfgmnprt])\2ed$/i);
    if (cvcEdMatch) {
      const rootLen = clean.length - 3; // root keeps 1 consonant; suffix gets doubled letter + ed (3 chars)
      if (rootLen >= 2) {
        return { root: clean.slice(0, rootLen), suffix: clean.slice(rootLen) };
      }
    }

    // 8. Regular -ed and silent -e + -d (e.g. walked -> walk + ed, played -> play + ed, danced -> danc + ed, lived -> liv + ed)
    const NOT_ED = new Set(['speed', 'bleed', 'breed', 'agreed', 'freed', 'bed', 'red', 'fed', 'shed', 'need', 'seed', 'weed', 'feed', 'hundred']);
    if (lower.endsWith('ed') && lower.length >= 5 && !NOT_ED.has(lower)) {
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 9. -es suffix (sibilants ch, sh, ss, x, zz, or o: watches -> watch + es, washes -> wash + es, fixes -> fix + es, goes -> go + es, does -> do + es)
    const NOT_ES = new Set(['shoes', 'eyes', 'sometimes', 'yes', 'clothes', 'these', 'whose', 'glasses', 'james']);
    const SIBILANT_OR_O_ES = /(?:ch|sh|ss|x|z|zz|[bcdfghjklmnpqrstvwxyz]o)es$/i;
    if (lower.endsWith('es') && lower.length >= 4 && !NOT_ES.has(lower) && SIBILANT_OR_O_ES.test(lower)) {
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 10. Participle -en (eaten -> eat + en, written -> writ + ten, bitten -> bit + ten, broken -> brok + en)
    const doubledEnMatch = lower.match(/^([a-z]+?)([bdfgmnprt])\2en$/i);
    if (doubledEnMatch && lower.length >= 6) {
      const rootLen = clean.length - 3;
      if (rootLen >= 3) {
        return { root: clean.slice(0, rootLen), suffix: clean.slice(rootLen) };
      }
    }
    const PARTICIPLE_EN = new Set(['eaten', 'broken', 'spoken', 'chosen', 'frozen', 'fallen', 'given', 'taken', 'driven', 'stolen', 'hidden', 'ridden', 'beaten', 'shaken']);
    if (PARTICIPLE_EN.has(lower) || (lower.endsWith('en') && formulaParts.some(p => String(p || '').toLowerCase().includes('en')))) {
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 11. Comparatives / Superlatives (-er, -est, -ier, -iest, doubled consonants: bigger -> big + ger, happiest -> happ + iest)
    const doubledErMatch = lower.match(/^([a-z]+?)([bdfgmnprt])\2er$/i);
    if (doubledErMatch && lower.length >= 6) {
      const rootLen = clean.length - 3;
      if (rootLen >= 2) return { root: clean.slice(0, rootLen), suffix: clean.slice(rootLen) };
    }
    const doubledEstMatch = lower.match(/^([a-z]+?)([bdfgmnprt])\2est$/i);
    if (doubledEstMatch && lower.length >= 7) {
      const rootLen = clean.length - 4;
      if (rootLen >= 2) return { root: clean.slice(0, rootLen), suffix: clean.slice(rootLen) };
    }
    if (lower.endsWith('ier') && lower.length >= 5) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }
    if (lower.endsWith('iest') && lower.length >= 6) {
      const splitIdx = clean.length - 4;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }
    const NOT_ER = new Set(['water', 'paper', 'river', 'never', 'after', 'under', 'over', 'other', 'mother', 'father', 'brother', 'sister', 'winter', 'summer', 'number', 'finger', 'dinner', 'butter', 'letter']);
    const formulaMentionsEr = formulaParts.some(p => String(p || '').toLowerCase().includes('er'));
    if (lower.endsWith('er') && lower.length >= 5 && (formulaMentionsEr || lower.length >= 6) && !NOT_ER.has(lower)) {
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }
    const formulaMentionsEst = formulaParts.some(p => String(p || '').toLowerCase().includes('est'));
    if (lower.endsWith('est') && lower.length >= 5 && (formulaMentionsEst || lower.length >= 6)) {
      const splitIdx = clean.length - 3;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 12. Standard third-person singular -s (e.g. walks -> walk + s, plays -> play + s, runs -> run + s, eats -> eat + s)
    const NOT_S = new Set([
      'this', 'always', 'plus', 'yes', 'has', 'is', 'as', 'us',
      'was', 'his', 'its', 'grass', 'glass', 'class', 'dress', 'across', 'bus',
      'gas', 'chess', 'boss', 'mess', 'pass', 'less', 'press', 'miss', 'kiss',
      'business'
    ]);
    if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length >= 4 && !NOT_S.has(lower)) {
      const splitIdx = clean.length - 1;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    // 13. Adverbial -ly suffix (e.g. slowly -> slow + ly, quickly -> quick + ly, happily -> happi + ly)
    const NOT_LY = new Set([
      'family', 'fly', 'rely', 'apply', 'reply', 'supply', 'multiply', 'imply',
      'jelly', 'belly', 'early', 'silly', 'ugly', 'holy', 'only', 'daily', 'italy',
      'bully', 'ally', 'rally'
    ]);
    if (lower.endsWith('ly') && lower.length >= 5 && !NOT_LY.has(lower)) {
      if (lower.endsWith('ily') && lower.length >= 6) {
        const splitIdx = clean.length - 3;
        return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
      }
      const splitIdx = clean.length - 2;
      return { root: clean.slice(0, splitIdx), suffix: clean.slice(splitIdx) };
    }

    return null;
  }

  // Helper: syntax-highlight target sentence according to English grammar patterns or teacher custom assignment

  // ==========================================
  // DYNAMIC WORD SUBSTITUTION HELPER
  // ==========================================
  function initSubstitutionPills(container, rule) {
    if (!container || !rule) return;

    container.querySelectorAll('.gp-subst-pill').forEach(pill => {
      pill.onclick = (e) => {
        e.stopPropagation();
        const pIdx = Number(pill.dataset.partIdx);
        const part = (rule.formula_parts && rule.formula_parts[pIdx]) ? rule.formula_parts[pIdx] : null;
        let alts = Array.isArray(part?.alternatives) ? [...part.alternatives] : [];
        if (!alts.length && rule.part_alternatives && Array.isArray(rule.part_alternatives[pIdx])) {
          alts = [...rule.part_alternatives[pIdx]];
        }

        const labelEl = pill.querySelector('.gp-pill-text');
        const activeText = pill.dataset.activeVal || labelEl?.textContent?.trim() || '';

        if (activeText && !alts.includes(activeText)) {
          alts.unshift(activeText);
        }

        if (alts.length <= 1) return;

        alts = normalizeAlternatives(alts);

        // If activeText is a multi-word blob containing multiple alternatives, isolate the current one
        let currentChoice = activeText;
        if (!alts.includes(currentChoice) && alts.length > 0) {
          const match = alts.find(a => currentChoice.toLowerCase().includes(a.toLowerCase()));
          currentChoice = match || alts[0];
        }

        if (currentChoice && !alts.includes(currentChoice)) {
          alts.unshift(currentChoice);
        }

        if (alts.length <= 1) return;

        // Auto-cycle in place: swap one at a time
        const curIdx = alts.indexOf(currentChoice);
        const nextIdx = (curIdx + 1) % alts.length;
        const nextVal = alts[nextIdx];

        pill.dataset.activeVal = nextVal;

        // If the pill was split with a distinct suffix color, preserve segmentation
        const isSplit = pill.dataset.isSplit === 'true';
        const suffixText = pill.dataset.suffixText || '';
        const rootCls = pill.dataset.rootCls || '';
        const suffixCls = pill.dataset.suffixCls || '';

        if (isSplit && labelEl) {
          labelEl.innerHTML = renderSplitWordHtml(nextVal, suffixText, rootCls, suffixCls);
        } else if (labelEl) {
          labelEl.textContent = nextVal;
        }

        // Tactile micro-animation
        pill.classList.remove('scale-105');
        void pill.offsetWidth;
        pill.classList.add('scale-105');
        setTimeout(() => pill.classList.remove('scale-105'), 180);

        if (typeof toast === 'function') {
          const displayStr = isSplit ? renderSplitWordHtml(nextVal, suffixText, '', '').replace(/<[^>]*>/g, '') : nextVal;
          toast(`Swapped to: ${displayStr}`);
        }
      };
    });
  }

  // Document listener to close substitution dropdown on outside click
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gp-subst-pill') && !e.target.closest('.gp-subst-dropdown')) {
        document.querySelectorAll('.gp-subst-dropdown').forEach(d => d.remove());
      }
    });
  }

    // Helper: parse alternative words separated by commas, semicolons, slashes, or spaces
  function parseAlternativesInput(val) {
    if (!val || typeof val !== 'string') return [];
    const raw = val.trim();
    if (!raw) return [];
    if (/[,;/]/.test(raw)) {
      return raw.split(/[,;/]+/).map(s => s.trim()).filter(Boolean);
    }
    return raw.split(/\s+/).map(s => s.trim()).filter(Boolean);
  }

  // Helper: normalize any alternatives array or string into clean distinct items
  function normalizeAlternatives(alts) {
    if (!alts) return [];
    const list = Array.isArray(alts) ? alts : [alts];
    const result = [];
    list.forEach(item => {
      if (typeof item === 'string') {
        const parsed = parseAlternativesInput(item);
        result.push(...parsed);
      }
    });
    return [...new Set(result)];
  }

    // Helper: render a word split into root and suffix with proper English inflection and colors
  function renderSplitWordHtml(word, suffixPattern, rootCls, suffixCls) {
    if (!word) return '';
    const cleanWord = String(word).trim();
    if (!cleanWord) return '';

    if (!suffixPattern) {
      return `<span class="${rootCls}">${escapeHtml(cleanWord)}</span>`;
    }

    const cleanSfx = String(suffixPattern).replace(/^[-+]/, '').trim();
    const sfxLower = cleanSfx.toLowerCase();
    const wordLower = cleanWord.toLowerCase();

    let rootPart = cleanWord;
    let sfxPart = cleanSfx;

    // 1. Explicit hyphen or plus in word (e.g. strong-er or strong+er)
    if (cleanWord.includes('-') || cleanWord.includes('+')) {
      const parts = cleanWord.split(/[-+]/);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        rootPart = parts[0];
        sfxPart = parts.slice(1).join('');
        return `<span class="${rootCls}">${escapeHtml(rootPart)}</span><span class="${suffixCls}">${escapeHtml(sfxPart)}</span>`;
      }
    }

    // 2. Word already ends with the suffix (e.g. "stronger" when suffix is "er")
    if (sfxLower && wordLower.endsWith(sfxLower) && wordLower.length > sfxLower.length) {
      rootPart = cleanWord.slice(0, cleanWord.length - cleanSfx.length);
      sfxPart = cleanWord.slice(cleanWord.length - cleanSfx.length);
      return `<span class="${rootCls}">${escapeHtml(rootPart)}</span><span class="${suffixCls}">${escapeHtml(sfxPart)}</span>`;
    }

    // 3. Word is base form, attach suffix with proper English inflection rules
    if (sfxLower === 'er' || sfxLower === 'est') {
      if (wordLower.endsWith('e') && wordLower.length > 2) {
        rootPart = cleanWord.slice(0, -1);
      } else if (wordLower.endsWith('y') && wordLower.length > 2 && !/[aeiou]y$/.test(wordLower)) {
        rootPart = cleanWord.slice(0, -1) + 'i';
      } else if (/^([a-z]*[bcdfghjklmnpqrstvwxyz][aeiou][bdfgmnprt])$/i.test(wordLower) && wordLower.length <= 4) {
        rootPart = cleanWord + cleanWord.slice(-1);
      } else {
        rootPart = cleanWord;
      }
      sfxPart = cleanSfx;
    } else if (sfxLower === 'ing') {
      if (wordLower.endsWith('ie') && wordLower.length > 2) {
        rootPart = cleanWord.slice(0, -2) + 'y';
      } else if (wordLower.endsWith('e') && wordLower.length > 2 && !wordLower.endsWith('ee')) {
        rootPart = cleanWord.slice(0, -1);
      } else if (/^([a-z]*[bcdfghjklmnpqrstvwxyz][aeiou][bdfgmnprt])$/i.test(wordLower) && wordLower.length <= 4) {
        rootPart = cleanWord + cleanWord.slice(-1);
      } else {
        rootPart = cleanWord;
      }
      sfxPart = cleanSfx;
    } else if (sfxLower === 'ed') {
      if (wordLower.endsWith('e') && wordLower.length > 2) {
        rootPart = cleanWord.slice(0, -1);
      } else if (wordLower.endsWith('y') && wordLower.length > 2 && !/[aeiou]y$/.test(wordLower)) {
        rootPart = cleanWord.slice(0, -1) + 'i';
      } else if (/^([a-z]*[bcdfghjklmnpqrstvwxyz][aeiou][bdfgmnprt])$/i.test(wordLower) && wordLower.length <= 4) {
        rootPart = cleanWord + cleanWord.slice(-1);
      } else {
        rootPart = cleanWord;
      }
      sfxPart = cleanSfx;
    } else if (sfxLower === 's' || sfxLower === 'es') {
      if (/(s|sh|ch|x|z)$/i.test(wordLower)) {
        rootPart = cleanWord;
        sfxPart = 'es';
      } else if (wordLower.endsWith('y') && wordLower.length > 2 && !/[aeiou]y$/.test(wordLower)) {
        rootPart = cleanWord.slice(0, -1);
        sfxPart = 'ies';
      } else {
        rootPart = cleanWord;
        sfxPart = 's';
      }
    } else {
      rootPart = cleanWord;
      sfxPart = cleanSfx;
    }

    return `<span class="${rootCls}">${escapeHtml(rootPart)}</span><span class="${suffixCls}">${escapeHtml(sfxPart)}</span>`;
  }

  function ensureRuleStructuredFields(rule) {
    if (!rule || typeof rule !== 'object') return;

    // 1. Ensure formula_parts exists
    if (!Array.isArray(rule.formula_parts) || rule.formula_parts.length === 0) {
      const rawFormula = String(rule.formula || 'Subject + Verb').trim();
      const parts = rawFormula.split('+').map(p => p.trim()).filter(Boolean);
      rule.formula_parts = parts.map((name, idx) => ({
        id: `part-${idx + 1}-${Date.now()}`,
        name: name,
        colorIndex: idx % 10,
        alternatives: (rule.part_alternatives && Array.isArray(rule.part_alternatives[idx])) ? [...rule.part_alternatives[idx]] : []
      }));
    }

    // 2. If word_assignments already populated with active colors, return early
    const hasAssignmentsWithColor = Array.isArray(rule.word_assignments) && rule.word_assignments.length > 0 &&
      rule.word_assignments.some(w => (typeof w.color === 'number' && w.color >= 0) || (Array.isArray(w.segments) && w.segments.some(s => s.color >= 0)));
    if (hasAssignmentsWithColor) return;

    // 3. Otherwise, synthesize word_assignments matching formula_parts and sentence
    const sentence = String(rule.sentence || '').trim();
    if (!sentence) return;

    const rawTokens = sentence.split(/\s+/).filter(Boolean);
    const cleanWord = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
    const cleanWords = rawTokens.map(tok => {
      const match = tok.match(/^([^.,!?;:]*)([.,!?;:]*)$/);
      return cleanWord(match ? match[1] : tok);
    });

    const extractWordList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(cleanWord).filter(Boolean);
      return String(val).split(/[,;\s+]+/).map(cleanWord).filter(Boolean);
    };

    const blueWords = extractWordList(rule.words_blue || rule.highlight_blue);
    const amberWords = extractWordList(rule.words_amber || rule.highlight_amber);
    const greenWords = extractWordList(rule.words_green || rule.highlight_green);

    const fpList = rule.formula_parts;
    const formulaPartNames = fpList.map(p => String(p.name || '').trim().toLowerCase());
    const tokenPartMap = new Array(rawTokens.length).fill(-1);

    // Map explicit words from formula_parts
    fpList.forEach((fp, pIdx) => {
      const pWords = extractWordList(fp.words || fp.name);
      cleanWords.forEach((cw, tIdx) => {
        if (pWords.includes(cw) && tokenPartMap[tIdx] === -1) {
          tokenPartMap[tIdx] = pIdx;
        }
      });
    });

    if (blueWords.length) {
      cleanWords.forEach((cw, tIdx) => {
        if (blueWords.includes(cw) && tokenPartMap[tIdx] === -1) tokenPartMap[tIdx] = 0;
      });
    }
    if (amberWords.length) {
      cleanWords.forEach((cw, tIdx) => {
        if (amberWords.includes(cw) && tokenPartMap[tIdx] === -1) tokenPartMap[tIdx] = 1;
      });
    }
    if (greenWords.length) {
      cleanWords.forEach((cw, tIdx) => {
        if (greenWords.includes(cw) && tokenPartMap[tIdx] === -1) tokenPartMap[tIdx] = 2;
      });
    }

    const subjectPartIdx = formulaPartNames.findIndex(n => n.includes('subject'));
    const verbPartIdx = formulaPartNames.findIndex(n => n.includes('verb'));
    const ifPartIdx = formulaPartNames.findIndex(n => n === 'if' || n.includes('if clause'));

    const AUX_VERBS = new Set([
      'am', 'is', 'are', 'was', 'were', 'will', 'shall', 'has', 'have', 'had',
      'do', 'does', 'did', 'can', 'could', 'would', 'should', 'might', 'must',
      "isn't", "aren't", "wasn't", "weren't", "won't", "haven't", "hasn't", "hadn't",
      "don't", "doesn't", "didn't", "can't", "couldn't"
    ]);

    // Inverted question pattern: starts with Aux verb
    if (cleanWords.length > 2 && AUX_VERBS.has(cleanWords[0])) {
      if (tokenPartMap[0] === -1) tokenPartMap[0] = 0;

      let verbPos = -1;
      for (let t = 1; t < cleanWords.length; t++) {
        if (tokenPartMap[t] === verbPartIdx && verbPartIdx !== -1) {
          verbPos = t;
          break;
        }
        if (amberWords.includes(cleanWords[t])) {
          verbPos = t;
          break;
        }
      }
      if (verbPos === -1 && verbPartIdx !== -1) {
        const DETERMINERS_AND_ADJS = new Set([
          'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their',
          'brave', 'young', 'clever', 'little', 'big', 'old', 'new', 'good', 'bad', 'smart', 'tall', 'slow', 'fast'
        ]);
        const COMMON_NOUNS = new Set([
          'knight', 'princess', 'prince', 'king', 'queen', 'hero', 'dragon', 'monster',
          'boy', 'girl', 'man', 'woman', 'child', 'children', 'baby', 'student', 'teacher',
          'dog', 'cat', 'puppy', 'kitten', 'elephant', 'monkey', 'panda', 'tiger', 'lion',
          'bird', 'fish', 'dolphin', 'whale', 'astronaut', 'robot', 'chef', 'doctor',
          'friend', 'friends', 'person', 'people', 'animal', 'animals', 'wizard', 'warrior'
        ]);
        for (let t = 2; t < cleanWords.length; t++) {
          const w = cleanWords[t];
          if (DETERMINERS_AND_ADJS.has(w) || COMMON_NOUNS.has(w)) {
            continue;
          }
          verbPos = t;
          tokenPartMap[t] = verbPartIdx;
          break;
        }
      }

      // Everything between Aux and Verb is the Subject!
      if (subjectPartIdx !== -1 && verbPos > 1) {
        for (let t = 1; t < verbPos; t++) {
          tokenPartMap[t] = subjectPartIdx;
        }
      }
    } else {
      // Affirmative: Subject comes first
      if (subjectPartIdx === 0) {
        let firstVerbOrAux = -1;
        for (let t = 0; t < cleanWords.length; t++) {
          if (tokenPartMap[t] > 0 || AUX_VERBS.has(cleanWords[t])) {
            firstVerbOrAux = t;
            break;
          }
        }
        if (firstVerbOrAux > 0) {
          for (let t = 0; t < firstVerbOrAux; t++) {
            if (tokenPartMap[t] === -1) tokenPartMap[t] = 0;
          }
        }
      }
    }

    // Check for "if" clause
    const ifTokenIdx = cleanWords.indexOf('if');
    if (ifTokenIdx !== -1 && ifPartIdx !== -1) {
      tokenPartMap[ifTokenIdx] = ifPartIdx;
      const presPartIdx = formulaPartNames.findIndex(n => n.includes('present') || n.includes('simple') || n.includes('condition'));
      if (presPartIdx !== -1) {
        for (let t = ifTokenIdx + 1; t < cleanWords.length; t++) {
          if (tokenPartMap[t] === -1) {
            tokenPartMap[t] = presPartIdx;
          }
        }
      }
    }

    const formulaPartNamesRaw = fpList.map(p => p.name);
    rule.word_assignments = rawTokens.map((tok, tIdx) => {
      const match = tok.match(/^([^.,!?;:]*)([.,!?;:]*)$/);
      const core = match ? match[1] : tok;
      const punct = match ? match[2] : '';
      const partIdx = tokenPartMap[tIdx];

      const sInfo = detectSuffix(core, formulaPartNamesRaw);
      const isVerbOrAdjPart = partIdx !== -1 && (
        formulaPartNames[partIdx]?.includes('verb') ||
        formulaPartNames[partIdx]?.includes('adj') ||
        formulaPartNames[partIdx]?.includes('ing') ||
        formulaPartNames[partIdx]?.includes('ed') ||
        formulaPartNames[partIdx]?.includes('er') ||
        formulaPartNames[partIdx]?.includes('es') ||
        formulaPartNames[partIdx]?.includes('s')
      );

      if (sInfo && (isVerbOrAdjPart || partIdx === 2 || partIdx === 1)) {
        const rootColor = partIdx !== -1 ? partIdx : (fpList.length > 2 ? 2 : 0);
        let sfxColor = typeof rule.suffix_color === 'number' ? rule.suffix_color : 4;
        if (sfxColor === rootColor) sfxColor = (rootColor === 4) ? 3 : 4;

        return {
          token: tok,
          text: core,
          punct: punct,
          isSplit: true,
          segments: [
            { text: sInfo.root, color: rootColor },
            { text: sInfo.suffix, color: sfxColor }
          ],
          color: rootColor
        };
      }

      return {
        token: tok,
        text: core,
        punct: punct,
        isSplit: false,
        color: partIdx
      };
    });
  }
  window.ensureRuleStructuredFields = ensureRuleStructuredFields;

  function formatSyntaxHighlightedSentence(sentence, formula = '', rule = null) {
    if (!sentence) return '';
    if (rule) {
      ensureRuleStructuredFields(rule);
    }
    const clean = String(sentence).trim();
    const rawWords = clean.split(/\s+/);
    if (rawWords.length <= 1) return escapeHtml(clean);

    const COLOR_CLASSES = [
      'text-sky-300 font-black',     // 0: Sky Blue
      'text-amber-400 font-black',   // 1: Amber
      'text-emerald-400 font-black', // 2: Emerald Green
      'text-purple-300 font-black',  // 3: Purple
      'text-rose-400 font-black',    // 4: Rose Pink
      'text-orange-400 font-black',  // 5: Orange
      'text-cyan-300 font-black',    // 6: Cyan
      'text-fuchsia-300 font-black', // 7: Fuchsia
      'text-lime-300 font-black',    // 8: Lime
      'text-yellow-300 font-black'   // 9: Yellow
    ];
    const getColorCls = (partOrColorIdx, isSuffix = false) => {
      if (typeof partOrColorIdx !== 'number' || partOrColorIdx < 0) return 'text-white font-extrabold';
      let c = partOrColorIdx;
      if (rule && Array.isArray(rule.formula_parts) && rule.formula_parts[partOrColorIdx]) {
        const fp = rule.formula_parts[partOrColorIdx];
        if (typeof fp.colorIndex === 'number') {
          c = fp.colorIndex;
        }
      } else if (isSuffix && rule && typeof rule.suffix_color === 'number') {
        c = rule.suffix_color;
      }
      return (c >= 0 && c < COLOR_CLASSES.length) ? COLOR_CLASSES[c] : COLOR_CLASSES[c % COLOR_CLASSES.length];
    };

    const hasAlternatives = (pIdx) => {
      if (typeof pIdx !== 'number' || pIdx < 0) return false;
      const fp = rule?.formula_parts?.[pIdx];
      if (Array.isArray(fp?.alternatives) && fp.alternatives.length > 0) return true;
      if (Array.isArray(rule?.part_alternatives?.[pIdx]) && rule.part_alternatives[pIdx].length > 0) return true;
      return false;
    };

    // 1. Check if structured word_assignments with multi-color and suffix splitting are present
    if (rule && Array.isArray(rule.word_assignments) && rule.word_assignments.length > 0) {
      const resultHtml = [];
      let i = 0;
      while (i < rule.word_assignments.length) {
        const item = rule.word_assignments[i];
        const pColor = (Array.isArray(item.segments) && item.segments.length > 0) ? item.segments[0].color : item.color;

        if (typeof pColor === 'number' && pColor >= 0 && hasAlternatives(pColor)) {
          // Group consecutive tokens belonging to this part into an interactive pill
          const groupTokens = [];
          let lastPunct = '';
          while (i < rule.word_assignments.length) {
            const cur = rule.word_assignments[i];
            const curColor = (Array.isArray(cur.segments) && cur.segments.length > 0) ? cur.segments[0].color : cur.color;
            if (curColor !== pColor) break;
            const tokenText = (Array.isArray(cur.segments) && cur.segments.length > 0)
              ? cur.segments.map(s => s.text).join('')
              : (cur.text || cur.token || '');
            groupTokens.push(tokenText);
            if (cur.punct) lastPunct = cur.punct;
            i++;
          }
          const phrase = groupTokens.join(' ').trim();
          const cls = getColorCls(pColor, false);
          let hasSplit = false;
          let firstRootCls = '';
          let firstSuffixCls = '';
          let pillInnerHtml = '';

          // Normalize alternatives for this part
          const fp = rule?.formula_parts?.[pColor];
          let partAlts = Array.isArray(fp?.alternatives) ? fp.alternatives : (Array.isArray(rule?.part_alternatives?.[pColor]) ? rule.part_alternatives[pColor] : []);
          partAlts = normalizeAlternatives(partAlts);

          // If the phrase contains multiple alternatives separated by spaces (e.g. 'smart tall slow strong weak'), display only the first one!
          let displayWord = phrase;
          if (partAlts.length > 0 && !partAlts.includes(phrase)) {
            const words = phrase.split(/\s+/).filter(Boolean);
            if (words.length > 1 && partAlts.some(a => words.includes(a))) {
              displayWord = partAlts[0];
            } else if (!phrase) {
              displayWord = partAlts[0];
            }
          }

          // Check if any token in this part was split
          let splitSuffix = '';
          groupTokens.forEach((tokText, tIdx) => {
            const origItem = rule.word_assignments.find(w => (w.text === tokText || w.token === tokText || (Array.isArray(w.segments) && w.segments.map(s => s.text).join('') === tokText)));
            if (origItem && Array.isArray(origItem.segments) && origItem.segments.length > 1) {
              hasSplit = true;
              firstRootCls = getColorCls(origItem.segments[0].color, false);
              firstSuffixCls = getColorCls(origItem.segments[1].color, true);
              splitSuffix = origItem.segments[1].text || '';
              pillInnerHtml += (tIdx > 0 ? ' ' : '') + `<span class="${firstRootCls}">${escapeHtml(origItem.segments[0].text || '')}</span><span class="${firstSuffixCls}">${escapeHtml(origItem.segments[1].text || '')}</span>`;
            } else {
              pillInnerHtml += (tIdx > 0 ? ' ' : '') + escapeHtml(tokText);
            }
          });

          // Fallback detection for split suffix from rule word_assignments by part color or formula part name
          if (!splitSuffix && Array.isArray(rule.word_assignments)) {
            const splitAssigned = rule.word_assignments.find(w => Array.isArray(w.segments) && w.segments.length > 1 && (w.segments[0].color === pColor || w.color === pColor));
            if (splitAssigned) {
              hasSplit = true;
              firstRootCls = getColorCls(splitAssigned.segments[0].color, false);
              firstSuffixCls = getColorCls(splitAssigned.segments[1].color, true);
              splitSuffix = splitAssigned.segments[1].text || '';
            }
          }
          if (!splitSuffix && fp && typeof fp.name === 'string') {
            const m = fp.name.match(/[+\-]([a-zA-Z']+)/);
            if (m) {
              hasSplit = true;
              splitSuffix = m[1];
              if (!firstRootCls) firstRootCls = getColorCls(pColor, false);
              if (!firstSuffixCls) firstSuffixCls = getColorCls(typeof rule.suffix_color === 'number' ? rule.suffix_color : 4, true);
            }
          }

          let renderedText = '';
          if (hasSplit && splitSuffix) {
            renderedText = renderSplitWordHtml(displayWord, splitSuffix, firstRootCls, firstSuffixCls);
          } else {
            renderedText = (displayWord !== phrase) ? escapeHtml(displayWord) : (pillInnerHtml || escapeHtml(phrase));
          }

          resultHtml.push(`
            <span class="gp-subst-pill group/pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-800 transition cursor-pointer select-none ${cls} font-black relative align-baseline mx-0.5 shadow-sm active:scale-95" data-part-idx="${pColor}" data-active-val="${escapeHtml(displayWord)}" data-is-split="${hasSplit ? 'true' : 'false'}" data-suffix-text="${escapeHtml(splitSuffix)}" data-root-cls="${firstRootCls}" data-suffix-cls="${firstSuffixCls}" title="Click to cycle word">
              <span class="gp-pill-text">${renderedText}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 group-hover/pill:text-amber-400 transition shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </span>${lastPunct ? `<span class="text-white font-extrabold">${escapeHtml(lastPunct)}</span>` : ''}
          `);
        } else {
          // Standard token rendering
          if (Array.isArray(item.segments) && item.segments.length > 0) {
            const segsHtml = item.segments.map((seg, sIdx) => {
              const isSuffix = sIdx > 0;
              const cls = getColorCls(seg.color, isSuffix);
              return `<span class="${cls}">${escapeHtml(seg.text || '')}</span>`;
            }).join('');
            const punctHtml = item.punct ? `<span class="text-white font-extrabold">${escapeHtml(item.punct)}</span>` : '';
            resultHtml.push(segsHtml + punctHtml);
          } else {
            const cls = getColorCls(item.color, false);
            const punctHtml = item.punct ? `<span class="text-white font-extrabold">${escapeHtml(item.punct)}</span>` : '';
            resultHtml.push(`<span class="${cls}">${escapeHtml(item.text || item.token || '')}</span>` + punctHtml);
          }
          i++;
        }
      }
      return resultHtml.join(' ');
    }

    // 2. Check if legacy custom teacher word role assignment is provided in rule (words_blue, words_amber, words_green)
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
  function formatFormulaChips(formulaStr, rule = null) {
    let parts = (rule && Array.isArray(rule.formula_parts) && rule.formula_parts.length > 0)
      ? rule.formula_parts.map(p => p.name)
      : String(formulaStr || 'Subject + Verb').split('+').map(p => p.trim()).filter(Boolean);

    // Filter out accidental placeholder parts like "Part 4", "Part 5" if earlier parts already cover the formula
    if (parts.length > 3 && parts.some(p => /^part\s*\d+$/i.test(p.trim()))) {
      const filtered = parts.filter(p => !/^part\s*\d+$/i.test(p.trim()));
      if (filtered.length >= 2) parts = filtered;
    }

    const colorStyles = [
      'border-sky-400 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]',
      'border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      'border-purple-400 bg-purple-500/15 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      'border-rose-400 bg-rose-500/15 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      'border-orange-400 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.25)]',
      'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]',
      'border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.25)]',
      'border-lime-400 bg-lime-500/15 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.25)]',
      'border-yellow-400 bg-yellow-500/15 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
    ];

    return parts.map((part, idx) => {
      let styleIdx = idx % colorStyles.length;
      if (rule && Array.isArray(rule.formula_parts) && rule.formula_parts[idx]) {
        const fp = rule.formula_parts[idx];
        if (typeof fp.colorIndex === 'number') {
          styleIdx = fp.colorIndex % colorStyles.length;
        }
      }
      const style = colorStyles[styleIdx];
      const cleanPart = part.replace(/^\[+|\]+$/g, '').trim();

      // Check if part contains a suffix addition like "Verb-ing", "Verb-ed", "Verb-s", "Verb-ies", "Adjective-er", "Adjective-est", "Adverb-ly", etc.
      const sfxMatch = cleanPart.match(/^([a-z]+)[-\s+](ing|ed|ied|es|ies|s|d|en|er|est|ier|iest|ly|ily|ping|ning|ting|ming|ging|bing|ped|ned|ged|ted|ded|s\/es|s\/es\/ies)$/i);
      let innerHtml = escapeHtml(`[${cleanPart}]`);
      if (sfxMatch) {
        const rootWord = sfxMatch[1];
        const sfxWord = '-' + sfxMatch[2];
        const sfxColorIdx = (typeof rule?.suffix_color === 'number') ? rule.suffix_color : styleIdx;
        const sfxColorCls = [
          'text-sky-300', 'text-amber-300', 'text-emerald-300', 'text-purple-300',
          'text-rose-300', 'text-orange-300', 'text-cyan-300', 'text-fuchsia-300',
          'text-lime-300', 'text-yellow-300'
        ][sfxColorIdx % 10];
        innerHtml = `[${escapeHtml(rootWord)}<span class="${sfxColorCls} font-black">${escapeHtml(sfxWord)}</span>]`;
      }

      return `<span class="px-3.5 sm:px-4 py-1.5 rounded-full border ${style} font-bold text-xs sm:text-sm tracking-wide inline-block">${innerHtml}</span>`;
    }).join('<span class="text-slate-400 font-bold text-base sm:text-lg mx-1.5">+</span>');
  }

  window.formatSyntaxHighlightedSentence = formatSyntaxHighlightedSentence;
  window.formatFormulaChips = formatFormulaChips;
  window.detectSuffix = detectSuffix;

  window.openGrammarDeckPractice = function(deck) {
    document.querySelectorAll('#grammar-practice-modal').forEach(m => m.remove());

    const rules = Array.isArray(deck.rules) && deck.rules.length ? deck.rules : [
      {
        title: 'Present Continuous',
        formula: 'Subject + am / is / are + Verb + -ing',
        sentence: 'The elephant is walking slowly in the grass.',
        formula_parts: [
          { name: 'Subject', colorIndex: 0, alternatives: ['The elephant', 'The clever monkey', 'The playful puppy', 'The astronaut'] },
          { name: 'am / is / are', colorIndex: 1, alternatives: ['is', 'was'] },
          { name: 'Verb-ing', colorIndex: 2, alternatives: ['walking', 'climbing', 'running', 'sleeping'] }
        ],
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

    // Reset shuffled options on practice open so options are freshly randomized
    rules.forEach(r => { if (r) delete r._shuffledOptions; });

    // Helper: award student coins for answering grammar quick checks correctly
    // Grammar practice is purely educational practice: NO coins awarded
    async function awardCoinsForGrammarPractice(amount = 0) {
      if (typeof toast === 'function') {
        toast('Correct! Great job!');
      }
      return { student: null, newCoins: 0 };
    }
    window.awardCoinsForGrammarPractice = awardCoinsForGrammarPractice;

    const modal = document.createElement('div');
    modal.id = 'grammar-practice-modal';
    modal.className = 'fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[10000] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200';

    function renderCard(idx) {
      const r = rules[idx];
      const isFirst = idx === 0;
      const isLast = idx === rules.length - 1;

      let cleanClue = (r.context_clue || 'Right Now').trim();
      if (cleanClue.toLowerCase().startsWith('level:')) {
        cleanClue = cleanClue.replace(/level:\s*/i, '');
      }

      const badText = String(r.mistake_bad || 'Mistake');
      const goodText = String(r.mistake_good || 'Correct');

      // Helper: Fisher-Yates shuffle array so options are randomly placed
      function shuffleOptions(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }

      let rawOptions = Array.isArray(r.quiz_options) && r.quiz_options.length 
        ? [...r.quiz_options] 
        : [r.quiz_answer || 'are climbing', 'climbs', 'is climbing'];

      // Deduplicate options to prevent duplicates like [won't] [won't]
      rawOptions = Array.from(new Set(rawOptions.map(o => String(o || '').trim()).filter(Boolean)));
      if (r.quiz_answer && !rawOptions.includes(r.quiz_answer)) {
        rawOptions.unshift(r.quiz_answer);
      }
      while (rawOptions.length < 3) {
        const fallbacks = ["won't", "will not", "will", "would not", "is climbing", "climbs"];
        const next = fallbacks.find(f => !rawOptions.includes(f)) || `choice_${rawOptions.length + 1}`;
        rawOptions.push(next);
      }

      if (!r._shuffledOptions || !Array.isArray(r._shuffledOptions)) {
        r._shuffledOptions = shuffleOptions(rawOptions);
      }
      const options = r._shuffledOptions;

      modal.innerHTML = `
        <div class="w-full max-w-5xl flex flex-col items-center my-auto py-4">
          <!-- Main Carousel Container: Left Arrow + Amber Glow Card + Right Arrow -->
          <div class="flex items-center justify-center gap-2 sm:gap-5 w-full">
            <!-- Left Circular Arrow -->
            <button type="button" id="gp-prev-btn" class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white flex items-center justify-center font-bold text-xl sm:text-2xl transition shadow-xl shrink-0 cursor-pointer ${isFirst ? 'opacity-25 pointer-events-none' : 'active:scale-95'}" aria-label="Previous rule">
              ‹
            </button>

            <!-- PokéAyman Amber Gold Bordered Practice Card -->
            <div class="relative w-full max-w-3xl rounded-3xl bg-slate-900/98 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.22)] p-4 sm:p-7 flex flex-col gap-4 text-white">
              
              <!-- Top Bar: Deck Name & Counter & Close -->
              <div class="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-xs uppercase font-extrabold tracking-widest text-amber-400/90 truncate">${escapeHtml(deckName)}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${idx + 1} / ${rules.length}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  ${isOwner ? `
                    <button type="button" id="gp-edit-deck-btn" class="gp-edit-deck-btn px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer" title="Edit this rule in Deck Editor">
                      <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      Edit Rule
                    </button>
                  ` : ''}
                  <button type="button" id="gp-fullscreen-btn" class="gp-fullscreen-btn w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer" title="Fullscreen" aria-label="Fullscreen">
                    <svg class="w-4 h-4 gp-fs-expand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                    </svg>
                    <svg class="w-4 h-4 gp-fs-compress hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 10V4m0 6h6m-6 0l7-7M10 10V4m0 6H4m6 0L3 3" />
                    </svg>
                  </button>
                  <button type="button" id="gp-close-btn" class="gp-close-btn w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg transition cursor-pointer" aria-label="Close practice">
                    ✕
                  </button>
                </div>
              </div>

              <!-- Rule Title & Formula Banner (PROMINENT & CLEAR) -->
              <div class="space-y-2.5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 class="text-base sm:text-xl font-black text-amber-300 tracking-wide">${escapeHtml(r.title)}</h3>
                  ${cleanClue ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 self-start sm:self-auto">${escapeHtml(cleanClue)}</span>` : ''}
                </div>
                <div class="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                  <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    ${formatFormulaChips(r.formula, r)}
                  </div>
                </div>
              </div>

              <!-- Main Arena: Grammar Sentence is the Hero + Compact Visual Cue -->
              <div class="p-5 sm:p-6 rounded-2xl bg-slate-950/85 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                <!-- Left / Center: Big commanding syntax-highlighted sentence -->
                <div class="flex-1 text-center md:text-left min-w-0">
                  <div class="flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                    <span>Master Example</span>
                    <span class="text-slate-600">•</span>
                    <span class="text-slate-400 font-normal">Click word to cycle alternatives</span>
                  </div>
                  <p class="gp-hero-sentence text-2xl sm:text-3xl md:text-4xl font-black text-white leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    ${formatSyntaxHighlightedSentence(r.sentence, r.formula, r)}
                  </p>
                </div>

                <!-- Right: Compact Visual Cue Thumbnail (Supporting cue, not the hero) -->
                ${r.image ? `
                  <div class="relative w-28 h-24 sm:w-36 sm:h-28 rounded-2xl overflow-hidden border border-slate-700/80 shadow-md shrink-0 group bg-slate-900">
                    <img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                ` : ''}
              </div>

              <!-- Side-by-Side Mistake vs. Correct Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <!-- Common Mistake Card -->
                <div class="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 flex flex-col justify-between gap-1 shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400 text-[11px]">
                      <span class="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-black">✕</span>
                      Avoid This Mistake
                    </span>
                    <span class="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">INCORRECT</span>
                  </div>
                  <p class="text-sm font-semibold text-rose-200 opacity-95 my-0.5">
                    ${escapeHtml(badText)}
                  </p>
                </div>

                <!-- Correct Form Card -->
                <div class="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex flex-col justify-between gap-1 shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400 text-[11px]">
                      <span class="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black">✓</span>
                      Correct Usage
                    </span>
                    <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">CORRECT</span>
                  </div>
                  <p class="text-sm font-bold text-emerald-200 my-0.5">
                    ${escapeHtml(goodText)}
                  </p>
                </div>
              </div>

              <!-- Let's Practice Centered Header & Question Container -->
              <div class="space-y-2">
                <div class="flex items-center justify-center">
                  <span class="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
                    Let's Practice
                  </span>
                </div>
                <div id="gp-quick-check-box" class="gp-quick-check-box rounded-2xl bg-slate-950/70 border border-slate-800/90 p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-inner">
                  <div class="text-xs sm:text-sm font-semibold text-slate-200 min-w-0 flex-1 text-center lg:text-left">
                    <span class="text-slate-200 break-words leading-relaxed">${escapeHtml(r.quiz_question || 'Fill in the blank with the correct form:')}</span>
                  </div>
                  <div class="flex flex-wrap items-center justify-center gap-2 shrink-0" id="gp-options-row">
                    ${options.map(opt => `
                      <button type="button" class="gp-quiz-opt px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-700 bg-slate-800/80 text-slate-200 hover:border-cyan-400 hover:text-white transition active:scale-95 cursor-pointer" data-val="${escapeHtml(opt)}">
                        [${escapeHtml(opt)}]
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Deck Rules Strip -->
              <div class="border-t border-slate-800/80 pt-3 space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Deck Rules (${rules.length})</span>
                  <span>Click to Jump</span>
                </div>
                <div class="gp-deck-previews-strip grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  ${rules.map((ruleItem, rIdx) => {
                    const isActive = rIdx === currentIndex;
                    return `
                      <button type="button" class="gp-switch-rule-btn p-2 rounded-2xl border text-left transition flex items-center gap-2 cursor-pointer ${isActive ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'}" data-rule-idx="${rIdx}">
                        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}">${rIdx + 1}</span>
                        <span class="text-xs font-bold truncate">${escapeHtml(ruleItem.title)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Right Circular Arrow with Glowing Cyan Button -->
            <button type="button" id="gp-next-btn" class="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center transition shadow-[0_0_25px_rgba(6,182,212,0.6)] shrink-0 cursor-pointer active:scale-95" aria-label="Next rule">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      `;

      // Wire close button, backdrop click & fullscreen cleanup
      const closeModal = () => {
        if (document.fullscreenElement) {
          try { document.exitFullscreen().catch(() => {}); } catch (_) {}
        }
        modal.remove();
        if (modal._onEsc) document.removeEventListener('keydown', modal._onEsc);
        if (modal._onFsChange) {
          document.removeEventListener('fullscreenchange', modal._onFsChange);
          document.removeEventListener('webkitfullscreenchange', modal._onFsChange);
        }
      };
      modal.querySelector('#gp-close-btn').onclick = closeModal;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      const onEsc = (e) => {
        if (e.key === 'Escape') closeModal();
      };
      if (modal._onEsc) document.removeEventListener('keydown', modal._onEsc);
      modal._onEsc = onEsc;
      document.addEventListener('keydown', onEsc);

      // Wire Fullscreen Button
      const fsBtn = modal.querySelector('#gp-fullscreen-btn');
      const updateFsState = () => {
        const isFs = Boolean(document.fullscreenElement === modal || document.fullscreenElement);
        if (fsBtn) {
          fsBtn.title = isFs ? 'Exit fullscreen' : 'Fullscreen';
          fsBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Fullscreen');
          fsBtn.querySelector('.gp-fs-expand')?.classList.toggle('hidden', isFs);
          fsBtn.querySelector('.gp-fs-compress')?.classList.toggle('hidden', !isFs);
        }
      };
      updateFsState();

      if (fsBtn) {
        fsBtn.onclick = async (e) => {
          e.stopPropagation();
          try {
            if (document.fullscreenElement) {
              await document.exitFullscreen();
            } else {
              if (modal.requestFullscreen) {
                await modal.requestFullscreen();
              } else if (modal.webkitRequestFullscreen) {
                await modal.webkitRequestFullscreen();
              } else if (modal.msRequestFullscreen) {
                await modal.msRequestFullscreen();
              }
            }
          } catch (_) {
            modal.classList.toggle('gp-fullscreen-active');
            updateFsState();
          }
        };
      }
      const onFsChange = () => updateFsState();
      if (modal._onFsChange) {
        document.removeEventListener('fullscreenchange', modal._onFsChange);
        document.removeEventListener('webkitfullscreenchange', modal._onFsChange);
      }
      modal._onFsChange = onFsChange;
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);

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
          if (typeof toast === 'function') toast('You completed all rules in this deck!');
          closeModal();
        }
      };

      // Wire edit deck button
      const editBtn = modal.querySelector('#gp-edit-deck-btn');
      if (editBtn) {
        editBtn.onclick = () => {
          closeModal();
          window.openGrammarDeckEditor(deck, deckName, currentIndex);
        };
      }

      // Wire Quick Check quiz options (Practice only: no coins awarded)
      modal.querySelectorAll('.gp-quiz-opt').forEach(btn => {
        btn.onclick = async () => {
          const chosen = btn.dataset.val;
          const correct = r.quiz_answer;

          modal.querySelectorAll('.gp-quiz-opt').forEach(b => {
            b.classList.remove('border-cyan-400', 'bg-cyan-950/90', 'text-cyan-200', 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', 'border-rose-500', 'bg-rose-950/90', 'text-rose-200');
          });

          if (chosen === correct) {
            btn.className = 'gp-quiz-opt px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/90 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition cursor-pointer';
            if (window.pokeSfx?.play) {
              try { window.pokeSfx.play('correct'); } catch (_) {}
            }
            if (typeof toast === 'function') {
              toast('Correct! Great job!');
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

      // Initialize interactive substitution pills
      initSubstitutionPills(modal, r);
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
  window.openGrammarDeckEditor = function(deckId, deckName, initialRuleIndex = -1) {
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
    let currentDeckName = deck.grammar_deck_name || deck.deck_name || (typeof deckName === 'string' ? deckName : '') || 'Grammar Deck';

    let targetRuleIdx = (typeof initialRuleIndex === 'number' && initialRuleIndex >= 0)
      ? initialRuleIndex
      : (typeof deckName === 'number' && deckName >= 0 ? deckName : -1);

    let editingRuleIndex = (targetRuleIdx >= 0 && targetRuleIdx < rules.length) ? targetRuleIdx : -1;
    let isRuleFormOpen = editingRuleIndex >= 0 || rules.length === 0;
    let isImagePickerOpen = false;

    const modal = document.createElement('div');
    modal.id = 'grammar-editor-modal';
    modal.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200';
    
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
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              <div class="flex-1 min-w-0">
                <input id="ge-deck-name-input" type="text" value="${escapeHtml(currentDeckName)}" class="quiz-input font-bold text-white text-base w-full" placeholder="Deck Name" maxlength="80">
              </div>
              <button type="button" id="ge-save-deck-name-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 shrink-0 transition" title="Save deck name">
                Save Name
              </button>
            </div>
            <button type="button" id="ge-close-btn" class="text-slate-400 hover:text-white font-bold text-2xl px-2 shrink-0 leading-none">&times;</button>
          </div>

          <!-- Add Rule Trigger Bar (Shown when form is collapsed) -->
          <div id="ge-add-rule-trigger-bar" class="${isRuleFormOpen ? 'hidden' : 'flex'} items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-sm transition">
            <div class="flex items-center gap-2.5">
              <span class="text-xl"></span>
              <div>
                <div class="text-xs font-bold text-white">Deck Grammar Rules (${rules.length})</div>
                <p class="text-[11px] text-slate-400">Click ➕ Add New Rule or edit any rule below</p>
              </div>
            </div>
            <button type="button" id="ge-open-add-rule-btn" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95">
              <span>➕</span>
              <span>Add New Rule</span>
            </button>
          </div>

          <!-- Add / Edit Rule Form (Collapsible) -->
          <div id="ge-rule-form-box" class="${isRuleFormOpen ? 'block' : 'hidden'} p-4 rounded-2xl ${isEditing ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' : 'bg-slate-950/60 border-slate-800'} border space-y-3 transition">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h4 class="text-xs font-bold ${isEditing ? 'text-amber-400' : 'text-amber-300'} uppercase tracking-wider flex items-center gap-1.5">
                <span>${isEditing ? '' : '➕'}</span>
                <span>${isEditing ? `Editing Rule #${editingRuleIndex + 1}: ${escapeHtml(activeRule?.title || 'Rule')}` : 'Add New Grammar Rule'}</span>
              </h4>
              <button type="button" id="ge-collapse-form-btn" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1" title="Collapse form">
                <span>✕</span>
                <span>${isEditing ? 'Cancel Edit' : 'Collapse Form'}</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label for="ge-rule-title" class="text-[11px] text-slate-400 font-semibold block">Rule Title *</label>
                <input id="ge-rule-title" type="text" placeholder="e.g. Actions Happening Right Now" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.title || '')}">
              </div>
              <div class="space-y-1">
                <label for="ge-rule-formula" class="text-[11px] text-slate-400 font-semibold block">Formula / Pattern</label>
                <input id="ge-rule-formula" type="text" placeholder="e.g. Subject + am/is/are + Verb + -ing" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.formula || '')}">
              </div>
              <div class="space-y-1 sm:col-span-2">
                <label for="ge-rule-sentence" class="text-[11px] text-slate-400 font-semibold block">Example Sentence *</label>
                <input id="ge-rule-sentence" type="text" placeholder="e.g. The elephant is walking slowly in the grass." class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.sentence || '')}">
              </div>

              <!-- Word Color & Formula Role Assignment -->
              <div class="sm:col-span-2 space-y-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span></span> Assign Words & Suffixes to Formula Parts
                  </div>
                  <span class="text-[10px] text-slate-400">Click a part dot to change color &bull; Click &ldquo;+ Add Part&rdquo; to add more &bull; Click words to cycle</span>
                </div>

                <!-- Dynamic Formula Parts Legend Bar -->
                <div id="ge-formula-parts-legend" class="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <!-- Dynamically populated from formula parts -->
                </div>

                <!-- Interactive word and suffix chips -->
                <div id="ge-sentence-word-chips" class="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 min-h-[46px]">
                  <!-- Populated dynamically with segmented suffix pills -->
                </div>

                <!-- Hidden inputs for legacy compatibility -->
                <input type="hidden" id="ge-rule-words-blue" value="${escapeHtml(activeRule?.words_blue || activeRule?.highlight_blue || '')}">
                <input type="hidden" id="ge-rule-words-amber" value="${escapeHtml(activeRule?.words_amber || activeRule?.highlight_amber || '')}">
                <input type="hidden" id="ge-rule-words-green" value="${escapeHtml(activeRule?.words_green || activeRule?.highlight_green || '')}">
              </div>

              <!-- Word Choices & Substitutions Section (Interactive in Practice) -->
              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 sm:col-span-2">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                    Word Choices & Substitutions (Subjects, Verbs, Nouns, Adjectives)
                  </div>
                  <span class="text-[11px] text-slate-400">Students click these in practice to swap words</span>
                </div>
                <p class="text-[11px] text-slate-400">Add alternative words for each formula part (comma-separated). When students click the part during practice, a dropdown lets them swap it:</p>
                <div id="ge-formula-part-alternatives-list" class="space-y-2">
                  <!-- Populated dynamically per formula part -->
                </div>
              </div>

              <div class="space-y-1 sm:col-span-2">
                <label for="ge-rule-clue" class="text-[11px] text-slate-400 font-semibold block">Context Clue / Hint</label>
                <input id="ge-rule-clue" type="text" placeholder="e.g. Right now at this moment" class="quiz-input text-xs w-full" value="${escapeHtml(activeRule?.context_clue || '')}">
              </div>

              <!-- Rule Image & Clipart (Collapsible Section) -->
              <div class="sm:col-span-2 space-y-2 pt-2 border-t border-slate-800/80">
                <!-- Compact Summary Bar -->
                <div class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div id="ge-image-thumb-box" class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      ${activeRule?.image ? `
                        <img src="${escapeHtml(activeRule.image)}" class="w-full h-full object-cover" alt="Rule image">
                      ` : `
                        <span class="text-xl opacity-60"></span>
                      `}
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <span>Rule Image & Clipart</span>
                        <span id="ge-image-badge" class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeRule?.image ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                          ${activeRule?.image ? '✓ Ready' : 'No image'}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 truncate mt-0.5">${activeRule?.image ? escapeHtml(activeRule.image) : 'Click Add Image to search clipart & photos'}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button type="button" id="ge-toggle-image-picker-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
                      <span></span>
                      <span>${isImagePickerOpen ? 'Hide Search' : (activeRule?.image ? 'Change Image' : 'Add Image')}</span>
                    </button>
                    <button type="button" id="ge-image-clear-btn" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 hover:border-rose-500/30 transition cursor-pointer ${activeRule?.image ? '' : 'hidden'}" title="Remove image">
                      Remove
                    </button>
                  </div>
                </div>

                <!-- Expanded Image Picker Drawer -->
                <div id="ge-image-drawer" class="${isImagePickerOpen ? 'block' : 'hidden'} space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 transition">
                  <div class="flex items-center justify-between pb-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Clipart & Photos</span>
                    <span id="ge-image-status" class="text-[11px] text-slate-400 font-semibold"></span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <!-- Selected Image Preview & Direct URL Fallback -->
                    <div class="md:col-span-5 rounded-xl p-3 border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Preview</span>
                        <span class="text-[10px] text-slate-500">Auto-saves to rule</span>
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
                        <label for="ge-rule-image" class="text-[11px] text-slate-400 font-medium">Or paste image URL directly:</label>
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
                          <span></span>
                          <span>Search</span>
                        </button>
                        <button type="button" id="ge-image-suggest-btn" class="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition active:scale-95 shrink-0 cursor-pointer flex items-center gap-1" title="Extract search keywords from sentence or rule">
                          <span>↳ Use Text</span>
                        </button>
                      </div>

                      <!-- Type Filter Pills -->
                      <div id="ge-image-type-pills" class="flex items-center gap-1.5">
                        <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-400 bg-amber-400 text-slate-950 cursor-pointer transition shadow-sm" data-image-type="all"> All</button>
                        <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition" data-image-type="illustration"> Clipart</button>
                        <button type="button" class="ge-type-pill text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition" data-image-type="photo"> Photos</button>
                      </div>

                      <!-- Results Grid -->
                      <div id="ge-image-results" class="grid grid-cols-3 sm:grid-cols-4 gap-2 min-h-[140px] max-h-[185px] overflow-y-auto p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                          <span class="text-2xl opacity-60"></span>
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
                  <label class="text-[11px] text-slate-400 font-semibold block"> Quick Check Practice Options (3 Choices)</label>
                  <span class="text-[10px] text-slate-500">Option 1 is correct answer; options are placed randomly during student practice (no coins awarded)</span>
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
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  ${isEditing ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
                </svg>
                <span>${isEditing ? 'Save Rule Changes' : 'Add Rule'}</span>
              </button>
              <button type="button" id="ge-cancel-rule-btn" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>

          <!-- Existing Rules List with Edit and Delete Buttons -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Rules (${rules.length})</h4>
              <span class="text-[11px] text-slate-500">Click Edit to modify any rule</span>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              ${rules.length === 0 ? `
                <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                  No rules in this deck yet. Use the form above to add your first rule!
                </div>
              ` : rules.map((r, i) => `
                <div class="ge-rule-card p-3 rounded-xl bg-white dark:bg-slate-950 border ${editingRuleIndex === i ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/40' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between gap-3 text-xs transition">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    ${r.image ? `
                      <img src="${escapeHtml(r.image)}" alt="Rule thumbnail" class="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900" onerror="this.style.display='none'">
                    ` : `
                      <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-sm shrink-0"></div>
                    `}
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <p class="ge-rule-title font-bold text-slate-900 dark:text-white truncate">${i + 1}. ${escapeHtml(r.title || 'Rule')}</p>
                        ${editingRuleIndex === i ? '<span class="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">EDITING</span>' : ''}
                      </div>
                      <p class="ge-rule-subtitle text-slate-600 dark:text-slate-400 truncate mt-0.5">${escapeHtml(r.sentence || r.formula || '')}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" class="ge-edit-rule px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 dark:text-amber-300 dark:border-amber-400/30 font-bold transition flex items-center gap-1.5 cursor-pointer" data-rule-idx="${i}" title="Edit Rule">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      <span>Edit</span>
                    </button>
                    <button type="button" class="ge-del-rule p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-400 dark:border-slate-700 dark:hover:border-rose-500/30 font-bold transition cursor-pointer" data-rule-idx="${i}" title="Delete Rule">
                      <svg class="w-4 h-4 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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
        if (ruleImageInput) ruleImageInput.value = selectedImageUrl;

        // Update compact summary bar thumbnail and badge
        const thumbBox = modal.querySelector('#ge-image-thumb-box');
        if (thumbBox) {
          if (selectedImageUrl) {
            thumbBox.innerHTML = `<img src="${escapeHtml(selectedImageUrl)}" class="w-full h-full object-cover" alt="Rule image">`;
          } else {
            thumbBox.innerHTML = `<span class="text-xl opacity-60"></span>`;
          }
        }
        const summaryBadge = modal.querySelector('#ge-image-badge');
        if (summaryBadge) {
          summaryBadge.textContent = selectedImageUrl ? '✓ Ready' : 'No image';
          summaryBadge.className = `text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedImageUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`;
        }
        if (imageClearBtn) {
          imageClearBtn.classList.toggle('hidden', !selectedImageUrl);
        }
        const toggleBtn = modal.querySelector('#ge-toggle-image-picker-btn');
        if (toggleBtn) {
          toggleBtn.innerHTML = `<span></span><span>${isImagePickerOpen ? 'Hide Search' : (selectedImageUrl ? 'Change Image' : 'Add Image')}</span>`;
        }

        // Inside drawer preview container
        if (previewContainer) {
          if (selectedImageUrl) {
            previewContainer.innerHTML = `<img id="ge-image-preview-img" src="${escapeHtml(selectedImageUrl)}" class="w-full h-full object-contain rounded" alt="Selected Rule Image" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\\'text-xs text-rose-400 font-medium\\\'>Invalid image link</span>';">`;
          } else {
            previewContainer.innerHTML = `
              <div id="ge-image-placeholder" class="text-xs text-slate-500 flex flex-col items-center gap-1">
                <svg class="w-7 h-7 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>Choose clipart or photo</span>
              </div>
            `;
          }
        }

        resultsContainer?.querySelectorAll('.ge-photo-pick-card').forEach(card => {
          const isMatch = selectedImageUrl && card.dataset.photoUrl === selectedImageUrl;
          card.classList.toggle('ring-2', isMatch);
          card.classList.toggle('ring-amber-400', isMatch);
          card.classList.toggle('border-amber-400', isMatch);
          const badgeEl = card.querySelector('.ge-check-badge');
          if (badgeEl) badgeEl.style.display = isMatch ? 'flex' : 'none';
        });
      };

      // Toggle Image Picker Drawer (Collapsible)
      const toggleImagePickerBtn = modal.querySelector('#ge-toggle-image-picker-btn');
      const imageDrawer = modal.querySelector('#ge-image-drawer');
      toggleImagePickerBtn?.addEventListener('click', () => {
        isImagePickerOpen = !isImagePickerOpen;
        if (imageDrawer) {
          imageDrawer.classList.toggle('hidden', !isImagePickerOpen);
          imageDrawer.classList.toggle('block', isImagePickerOpen);
        }
        if (toggleImagePickerBtn) {
          toggleImagePickerBtn.innerHTML = `<span></span><span>${isImagePickerOpen ? 'Hide Search' : (selectedImageUrl ? 'Change Image' : 'Add Image')}</span>`;
        }
        if (isImagePickerOpen && currentPhotos.length === 0 && searchInput?.value.trim()) {
          executeSearch(true);
        }
      });

      const renderResultsGrid = () => {
        if (currentPhotos.length === 0) {
          resultsContainer.innerHTML = `
            <div class="col-span-full py-8 text-center flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
              <span class="text-2xl opacity-60"></span>
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
            // Auto-collapse picker drawer upon selection to keep UI compact
            isImagePickerOpen = false;
            if (imageDrawer) {
              imageDrawer.classList.add('hidden');
              imageDrawer.classList.remove('block');
            }
            if (toggleImagePickerBtn) {
              toggleImagePickerBtn.innerHTML = `<span></span><span>Change Image</span>`;
            }
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
                <span> Search could not complete. Try another term or paste URL.</span>
              </div>
            `;
          }
        } finally {
          isSearching = false;
          searchBtn.disabled = false;
          searchBtn.innerHTML = `<span></span><span>Search</span>`;
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
        if (typeof toast === 'function') toast('Image removed');
      });

      // Auto-trigger search if keywords exist
      if (searchInput && searchInput.value.trim() && isImagePickerOpen) {
        executeSearch(true);
      }

      // ==========================================
      // DYNAMIC FORMULA PARTS & SUFFIX COLORING (Option A)
      // ==========================================
      const COLOR_PALETTE = [
        { id: 0, name: 'Sky Blue', hex: '#38bdf8', chipClass: 'ge-palette-0 border-sky-400 bg-sky-500/20 text-sky-800 dark:text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)] font-black', dotBg: 'bg-sky-400', badgeClass: 'bg-sky-400 text-slate-950' },
        { id: 1, name: 'Amber Gold', hex: '#fbbf24', chipClass: 'ge-palette-1 border-amber-400 bg-amber-500/20 text-amber-900 dark:text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.3)] font-black', dotBg: 'bg-amber-400', badgeClass: 'bg-amber-400 text-slate-950' },
        { id: 2, name: 'Emerald Green', hex: '#34d399', chipClass: 'ge-palette-2 border-emerald-400 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.3)] font-black', dotBg: 'bg-emerald-400', badgeClass: 'bg-emerald-400 text-slate-950' },
        { id: 3, name: 'Violet Purple', hex: '#c084fc', chipClass: 'ge-palette-3 border-purple-400 bg-purple-500/20 text-purple-900 dark:text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.3)] font-black', dotBg: 'bg-purple-400', badgeClass: 'bg-purple-400 text-slate-950' },
        { id: 4, name: 'Rose Pink', hex: '#fb7185', chipClass: 'ge-palette-4 border-rose-400 bg-rose-500/20 text-rose-900 dark:text-rose-200 shadow-[0_0_8px_rgba(251,113,133,0.3)] font-black', dotBg: 'bg-rose-400', badgeClass: 'bg-rose-400 text-slate-950' },
        { id: 5, name: 'Bright Orange', hex: '#fb923c', chipClass: 'ge-palette-5 border-orange-400 bg-orange-500/20 text-orange-900 dark:text-orange-200 shadow-[0_0_8px_rgba(251,146,60,0.3)] font-black', dotBg: 'bg-orange-400', badgeClass: 'bg-orange-400 text-slate-950' },
        { id: 6, name: 'Cyan Blue', hex: '#22d3ee', chipClass: 'ge-palette-6 border-cyan-400 bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.3)] font-black', dotBg: 'bg-cyan-400', badgeClass: 'bg-cyan-400 text-slate-950' },
        { id: 7, name: 'Fuchsia Magenta', hex: '#e879f9', chipClass: 'ge-palette-7 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-900 dark:text-fuchsia-200 shadow-[0_0_8px_rgba(232,121,249,0.3)] font-black', dotBg: 'bg-fuchsia-400', badgeClass: 'bg-fuchsia-400 text-slate-950' },
        { id: 8, name: 'Lime Green', hex: '#a3e635', chipClass: 'ge-palette-8 border-lime-400 bg-lime-500/20 text-lime-900 dark:text-lime-200 shadow-[0_0_8px_rgba(163,230,53,0.3)] font-black', dotBg: 'bg-lime-400', badgeClass: 'bg-lime-400 text-slate-950' },
        { id: 9, name: 'Bright Yellow', hex: '#facc15', chipClass: 'ge-palette-9 border-yellow-400 bg-yellow-500/20 text-yellow-900 dark:text-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.3)] font-black', dotBg: 'bg-yellow-400', badgeClass: 'bg-yellow-400 text-slate-950' }
      ];

      let currentWordAssignments = [];
      let currentFormulaParts = [];
      const formulaInput = modal.querySelector('#ge-rule-formula');
      const sentenceInput = modal.querySelector('#ge-rule-sentence');
      const legendContainer = modal.querySelector('#ge-formula-parts-legend');
      const wordChipsContainer = modal.querySelector('#ge-sentence-word-chips');

      function initFormulaParts() {
        if (activeRule && Array.isArray(activeRule.formula_parts) && activeRule.formula_parts.length > 0) {
          let rawList = activeRule.formula_parts;
          if (rawList.length > 3 && rawList.some(p => /^part\s*\d+$/i.test(String(p.name || '').trim()))) {
            rawList = rawList.filter(p => !/^part\s*\d+$/i.test(String(p.name || '').trim()));
          }
          currentFormulaParts = rawList.map((p, idx) => {
            let alts = Array.isArray(p.alternatives) && p.alternatives.length > 0 ? [...p.alternatives] : [];
            if (!alts.length && activeRule.part_alternatives && Array.isArray(activeRule.part_alternatives[idx])) {
              alts = [...activeRule.part_alternatives[idx]];
            }
            return {
              id: p.id || ('part-' + idx + '-' + Math.random().toString(36).slice(2, 6)),
              name: String(p.name || `Part ${idx + 1}`).trim(),
              colorIndex: (typeof p.colorIndex === 'number' && p.colorIndex >= 0) ? (p.colorIndex % COLOR_PALETTE.length) : (idx % COLOR_PALETTE.length),
              alternatives: alts
            };
          });
        } else {
          let rawFormula = (formulaInput?.value || activeRule?.formula || 'Subject + am / is / are + Verb-ing').trim();
          rawFormula = rawFormula.replace(/\s*\+\s*part\s*\d+/gi, '').trim();
          const parts = rawFormula ? rawFormula.split('+').map(p => p.trim()).filter(Boolean) : ['Subject', 'Verb'];
          currentFormulaParts = parts.map((name, idx) => {
            let alts = [];
            if (activeRule && activeRule.part_alternatives && Array.isArray(activeRule.part_alternatives[idx])) {
              alts = [...activeRule.part_alternatives[idx]];
            }
            return {
              id: 'part-' + idx + '-' + Math.random().toString(36).slice(2, 6),
              name,
              colorIndex: idx % COLOR_PALETTE.length,
              alternatives: alts
            };
          });
        }
      }
      initFormulaParts();

      let suffixColorIndex = (typeof activeRule?.suffix_color === 'number') ? activeRule.suffix_color : 3;

      function syncFormulaInput() {
        if (formulaInput) {
          formulaInput.value = currentFormulaParts.map(p => p.name).join(' + ');
        }
      }

      function getFormulaParts() {
        return currentFormulaParts.map(p => p.name);
      }

      function initAssignmentsFromRule() {
        if (activeRule) {
          ensureRuleStructuredFields(activeRule);
        }
        const formulaParts = getFormulaParts();
        if (activeRule && Array.isArray(activeRule.word_assignments) && activeRule.word_assignments.length > 0) {
          currentWordAssignments = activeRule.word_assignments.map(item => {
            const isSplit = Array.isArray(item.segments) && item.segments.length >= 2;
            const rColor = isSplit ? item.segments[0].color : -1;
            const sColor = isSplit ? item.segments[1].color : -1;
            if (isSplit && typeof sColor === 'number' && sColor >= 0) {
              suffixColorIndex = sColor;
            }
            return {
              token: item.token || '',
              core: item.text || (item.token ? item.token.replace(/[.,!?;:]*$/, '') : ''),
              punct: item.punct || '',
              isSplit: isSplit,
              root: isSplit ? item.segments[0].text : '',
              suffix: isSplit ? item.segments[1].text : '',
              rootColor: rColor,
              suffixColor: sColor,
              color: !isSplit ? (typeof item.color === 'number' ? item.color : -1) : -1
            };
          });
          return;
        }

        // Fallback: parse from sentence & legacy colors
        const text = (sentenceInput?.value || activeRule?.sentence || '').trim();
        if (!text) {
          currentWordAssignments = [];
          return;
        }

        const cleanWord = (w) => String(w || '').toLowerCase().replace(/[^a-z0-9']/g, '');
        const parseLegacySet = (str) => {
          const s = new Set();
          if (!str) return s;
          str.split(/[,;\s+]+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw) s.add(cw);
          });
          return s;
        };
        const blueSet = parseLegacySet(activeRule?.words_blue || activeRule?.highlight_blue);
        const amberSet = parseLegacySet(activeRule?.words_amber || activeRule?.highlight_amber);
        const greenSet = parseLegacySet(activeRule?.words_green || activeRule?.highlight_green);

        const rawTokens = text.split(/\s+/).filter(Boolean);
        currentWordAssignments = rawTokens.map(tok => {
          const match = tok.match(/^([^.,!?;:]*)([.,!?;:]*)$/);
          const core = match ? match[1] : tok;
          const punct = match ? match[2] : '';
          const cw = cleanWord(core);

          let initialColor = -1;
          if (blueSet.has(cw)) initialColor = 0;
          else if (amberSet.has(cw)) initialColor = 1;
          else if (greenSet.has(cw)) initialColor = 2;

          const sInfo = detectSuffix(core, formulaParts);
          const formulaMentionsSuffix = sInfo && formulaParts.some(p => {
            const pNorm = String(p || '').toLowerCase();
            const sNorm = sInfo.suffix.toLowerCase();
            return pNorm.includes(sNorm) ||
                   (sNorm.endsWith('ing') && pNorm.includes('ing')) ||
                   (sNorm.endsWith('ed') && pNorm.includes('ed')) ||
                   (sNorm.endsWith('er') && pNorm.includes('er')) ||
                   (sNorm.endsWith('est') && pNorm.includes('est')) ||
                   (sNorm.endsWith('ly') && pNorm.includes('ly'));
          });

          if (sInfo && (formulaMentionsSuffix || (initialColor !== -1 && initialColor === 2))) {
            const rootColor = initialColor !== -1 ? initialColor : (currentFormulaParts.length > 2 ? 2 : 0);
            let defSuffixColor = (typeof suffixColorIndex === 'number' && suffixColorIndex >= 0) ? suffixColorIndex : 4;
            if (defSuffixColor === rootColor) {
              defSuffixColor = (rootColor === 4) ? 3 : 4;
            }
            return {
              token: tok,
              core: core,
              punct: punct,
              isSplit: true,
              root: sInfo.root,
              suffix: sInfo.suffix,
              rootColor: rootColor,
              suffixColor: defSuffixColor,
              color: rootColor
            };
          }

          return {
            token: tok,
            core: core,
            punct: punct,
            isSplit: false,
            root: '',
            suffix: '',
            rootColor: -1,
            suffixColor: -1,
            color: initialColor
          };
        });
      }

      initAssignmentsFromRule();

      
      function syncAlternativesList() {
        const altsListContainer = modal.querySelector('#ge-formula-part-alternatives-list');
        if (!altsListContainer) return;

        altsListContainer.innerHTML = currentFormulaParts.map((part, idx) => {
          const col = COLOR_PALETTE[part.colorIndex % COLOR_PALETTE.length];
          const normAlts = normalizeAlternatives(part.alternatives);
          part.alternatives = normAlts;
          const val = normAlts.join(', ');
          const nameLower = String(part.name || '').toLowerCase();
          let egPlaceholder = 'The elephant, The clever monkey, The boy';
          if (nameLower.includes('verb')) {
            egPlaceholder = nameLower.includes('ing') ? 'walking, climbing, running, sleeping' : 'arrives, departs, stops, passes';
          } else if (nameLower.includes('adj')) {
            egPlaceholder = 'smart, tall, slow, strong, weak';
          } else if (nameLower.includes('noun') || nameLower.includes('object')) {
            egPlaceholder = 'warm tea, hot coffee, fresh juice';
          } else if (nameLower.includes('is') || nameLower.includes('are') || nameLower.includes('am')) {
            egPlaceholder = 'is, was, will be';
          }
          return `
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
              <div class="flex items-center gap-2 shrink-0 sm:w-52">
                <span class="w-3 h-3 rounded-full ${col.dotBg} shrink-0 ring-1 ring-white/30"></span>
                <span class="text-xs font-bold text-slate-200 truncate" title="${escapeHtml(part.name)}">
                  Part ${idx + 1}: ${escapeHtml(part.name)}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <input type="text" class="ge-part-alts-input quiz-input text-xs w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700/80 focus:border-amber-400 text-white" data-part-idx="${idx}" value="${escapeHtml(val)}" placeholder="Alternatives (separated by space or comma): e.g. ${egPlaceholder}">
              </div>
            </div>
          `;
        }).join('');

        altsListContainer.querySelectorAll('.ge-part-alts-input').forEach(inp => {
          inp.oninput = () => {
            const pIdx = Number(inp.dataset.partIdx);
            if (currentFormulaParts[pIdx]) {
              currentFormulaParts[pIdx].alternatives = parseAlternativesInput(inp.value);
            }
          };
          inp.onblur = () => {
            const pIdx = Number(inp.dataset.partIdx);
            if (currentFormulaParts[pIdx]) {
              currentFormulaParts[pIdx].alternatives = normalizeAlternatives(currentFormulaParts[pIdx].alternatives);
              inp.value = currentFormulaParts[pIdx].alternatives.join(', ');
            }
          };
        });
      }

      function syncWordChips() {
        if (!wordChipsContainer || !legendContainer) return;

        // Render Formula Parts Legend with:
        // 1. Clickable color dot that toggles color popover
        // 2. Editable part name input
        // 3. Remove button (if > 1 part)
        // 4. Color popover with 10 swatch buttons
        // 5. Dedicated Suffix Accent pill (Does NOT add Part 4 to formula!)
        // 6. "+ Add Part" button
        const partsHtml = currentFormulaParts.map((part, idx) => {
          const col = COLOR_PALETTE[part.colorIndex % COLOR_PALETTE.length];
          return `
            <div class="ge-part-pill relative group/part inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${col.chipClass} shadow-sm" data-part-idx="${idx}">
              <!-- Clickable Color Dot -->
              <button type="button" class="ge-part-color-btn w-3.5 h-3.5 rounded-full ${col.dotBg} ring-2 ring-white/60 hover:scale-125 transition cursor-pointer shrink-0 shadow-sm" data-part-idx="${idx}" title="Click to change color for Part ${idx + 1} (${col.name})">
              </button>

              <span class="text-[10px] uppercase opacity-75 whitespace-nowrap">Part ${idx + 1}:</span>

              <!-- Editable Part Name -->
              <input type="text" class="ge-part-name-input bg-transparent border-b border-white/20 hover:border-white/70 focus:border-white focus:outline-none text-xs font-bold px-0.5 py-0 min-w-[50px] max-w-[130px]" value="${escapeHtml(part.name)}" data-part-idx="${idx}" title="Click to edit part name" placeholder="Part name">

              <!-- Remove Part Button (when > 1 part) -->
              ${currentFormulaParts.length > 1 ? `
                <button type="button" class="ge-part-remove-btn opacity-60 hover:opacity-100 hover:text-rose-300 text-xs px-0.5 transition cursor-pointer ml-0.5" data-part-idx="${idx}" title="Remove Part ${idx + 1}">
                  ✕
                </button>
              ` : ''}

              <!-- Color Picker Popover (Floating Palette) -->
              <div class="ge-color-popover hidden absolute top-full left-0 mt-2 z-40 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_10px_25px_rgba(0,0,0,0.8)] grid grid-cols-5 gap-2 w-[165px]" data-part-idx="${idx}">
                ${COLOR_PALETTE.map((cp, cIdx) => `
                  <button type="button" class="ge-color-swatch-btn w-5 h-5 rounded-full ${cp.dotBg} hover:scale-125 transition ring-1 ring-white/30 cursor-pointer ${cIdx === (part.colorIndex % COLOR_PALETTE.length) ? 'ring-2 ring-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.9)]' : ''}" data-part-idx="${idx}" data-color-idx="${cIdx}" title="${cp.name}">
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }).join('');

        const addPartBtnHtml = `
          <button type="button" id="ge-add-part-btn" class="px-2.5 py-1 rounded-xl text-xs font-bold border border-dashed border-amber-400/70 bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 hover:text-white transition cursor-pointer flex items-center gap-1 shadow-sm active:scale-95" title="Add a new formula part">
            <span class="text-sm font-black leading-none">+</span>
            <span>Add Part</span>
          </button>
        `;

        legendContainer.innerHTML = partsHtml + addPartBtnHtml;

        // Wire Legend Buttons
        legendContainer.querySelectorAll('.ge-part-color-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const pIdx = Number(btn.dataset.partIdx);
            const popover = legendContainer.querySelector(`.ge-color-popover[data-part-idx="${pIdx}"]`);
            if (!popover) return;
            const isHidden = popover.classList.contains('hidden');
            legendContainer.querySelectorAll('.ge-color-popover').forEach(p => p.classList.add('hidden'));
            if (isHidden) {
              popover.classList.remove('hidden');
            }
          };
        });

        legendContainer.querySelectorAll('.ge-color-swatch-btn').forEach(swatch => {
          swatch.onclick = (e) => {
            e.stopPropagation();
            const pIdx = Number(swatch.dataset.partIdx);
            const cIdx = Number(swatch.dataset.colorIdx);
            if (currentFormulaParts[pIdx]) {
              currentFormulaParts[pIdx].colorIndex = cIdx;
              syncWordChips();
            }
          };
        });

        legendContainer.querySelectorAll('.ge-part-name-input').forEach(input => {
          input.oninput = () => {
            const pIdx = Number(input.dataset.partIdx);
            if (currentFormulaParts[pIdx]) {
              currentFormulaParts[pIdx].name = input.value;
              syncFormulaInput();
            }
          };
          input.onclick = (e) => e.stopPropagation();
        });

        legendContainer.querySelectorAll('.ge-part-remove-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const pIdx = Number(btn.dataset.partIdx);
            if (currentFormulaParts.length > 1) {
              currentFormulaParts.splice(pIdx, 1);
              currentWordAssignments.forEach(item => {
                const adjust = (c) => {
                  if (typeof c !== 'number' || c === -1) return c;
                  if (c === pIdx) return -1;
                  if (c > pIdx) return c - 1;
                  return c;
                };
                if (item.isSplit) {
                  item.rootColor = adjust(item.rootColor);
                  item.suffixColor = adjust(item.suffixColor);
                } else {
                  item.color = adjust(item.color);
                }
              });
              syncFormulaInput();
              syncWordChips();
            }
          };
        });

        const addPartBtn = legendContainer.querySelector('#ge-add-part-btn');
        if (addPartBtn) {
          addPartBtn.onclick = (e) => {
            e.stopPropagation();
            const nextIdx = currentFormulaParts.length;
            currentFormulaParts.push({
              id: 'part-' + nextIdx + '-' + Math.random().toString(36).slice(2, 6),
              name: `Part ${nextIdx + 1}`,
              colorIndex: nextIdx % COLOR_PALETTE.length
            });
            syncFormulaInput();
            syncWordChips();
          };
        }

        if (currentWordAssignments.length === 0) {
          wordChipsContainer.innerHTML = '<span class="text-xs text-slate-500 italic">Type an example sentence above to assign colors and split suffixes</span>';
          return;
        }

        const getStyle = (colorVal, isSuffix = false) => {
          if (typeof colorVal === 'number' && colorVal >= 0) {
            if (!isSuffix && currentFormulaParts[colorVal]) {
              const colIdx = currentFormulaParts[colorVal].colorIndex;
              return COLOR_PALETTE[colIdx % COLOR_PALETTE.length].chipClass;
            }
            return COLOR_PALETTE[colorVal % COLOR_PALETTE.length].chipClass;
          }
          return 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white';
        };

        const getPartTooltip = (colorVal, isSuffix = false) => {
          if (typeof colorVal === 'number' && colorVal >= 0) {
            const col = COLOR_PALETTE[colorVal % COLOR_PALETTE.length];
            if (isSuffix) {
              return `Suffix Color: ${col.name} (Independent from formula parts). Click or choose below to change.`;
            }
            if (currentFormulaParts[colorVal]) {
              const p = currentFormulaParts[colorVal];
              return `Assigned to Part ${colorVal + 1}: ${p.name} (${col.name}). Click to cycle part.`;
            }
            return `Color: ${col.name}. Click to cycle.`;
          }
          return 'Unassigned. Click to assign.';
        };

        const hasAnySplit = currentWordAssignments.some(item => item.isSplit);
        const chipsHtml = currentWordAssignments.map((item, i) => {
          const rawCore = String(item.core || item.token || '').trim();
          const punctMatch = rawCore.match(/[.,!?;:]+$/);
          const coreClean = punctMatch ? rawCore.slice(0, -punctMatch[0].length) : rawCore;
          const effectivePunct = item.punct || (punctMatch ? punctMatch[0] : '');

          if (item.isSplit) {
            return `
              <div class="ge-token-wrapper inline-flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-0.5 shadow-sm">
                <button type="button" class="ge-token-btn px-2.5 py-1 rounded-l-lg text-xs font-bold transition cursor-pointer active:scale-95 ${getStyle(item.rootColor, false)}" data-token-idx="${i}" data-segment="root" title="${getPartTooltip(item.rootColor, false)}">
                  ${escapeHtml(item.root)}
                </button>
                <button type="button" class="ge-token-btn ge-suffix-token-btn px-2 py-1 rounded-r-lg text-xs font-bold transition cursor-pointer active:scale-95 border-l border-slate-700/80 ${getStyle(item.suffixColor, true)}" data-token-idx="${i}" data-segment="suffix" title="${getPartTooltip(item.suffixColor, true)}">
                  ${item.suffix && item.suffix.startsWith("'") ? '' : '-'}${escapeHtml(item.suffix)}
                </button>
                <button type="button" class="ge-split-toggle px-1 text-slate-400 hover:text-white transition cursor-pointer" title="Merge root and suffix into whole word" data-token-idx="${i}" aria-label="Merge word">
                  <svg class="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                </button>
                ${effectivePunct ? `<span class="ge-token-punct text-slate-400 font-bold text-xs pr-1 select-none">${escapeHtml(effectivePunct)}</span>` : ''}
              </div>
            `;
          } else {
            // If the token is purely punctuation (e.g. "?"), render as standalone clean punctuation rather than an empty button + double punct!
            if (!coreClean && effectivePunct) {
              return `<span class="ge-standalone-punct text-slate-400 font-black text-sm px-1.5 self-center select-none">${escapeHtml(effectivePunct)}</span>`;
            }
            const canSplit = Boolean(detectSuffix(item.core, getFormulaParts()));
            return `
              <div class="ge-token-wrapper inline-flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-0.5 shadow-sm">
                <button type="button" class="ge-token-btn px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${getStyle(item.color)}" data-token-idx="${i}" data-segment="whole" title="${getPartTooltip(item.color, false)}">
                  ${escapeHtml(coreClean)}
                </button>
                ${canSplit ? `
                  <button type="button" class="ge-split-toggle px-1 text-slate-400 hover:text-amber-300 transition cursor-pointer" title="Split grammatical suffix (-ing, -ed, -s, -er, -est, -ly)" data-token-idx="${i}" aria-label="Split suffix">
                    <svg class="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242 3 3 0 014.242 0L12 12zm0 0L9.121 9.121a3 3 0 10-4.242 4.242 3 3 0 004.242 0L12 12z"/></svg>
                  </button>
                ` : ''}
                ${effectivePunct ? `<span class="ge-token-punct text-slate-400 font-bold text-xs pr-1 select-none">${escapeHtml(effectivePunct)}</span>` : ''}
              </div>
            `;
          }
        }).join('');

        const suffixPaletteHtml = hasAnySplit ? `
          <div class="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-800/90 flex-wrap">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <span class="w-2.5 h-2.5 rounded-full ${COLOR_PALETTE[suffixColorIndex % COLOR_PALETTE.length].dotBg} ring-1 ring-white/30"></span>
              <span>Suffix Color:</span>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${COLOR_PALETTE.map(cp => `
                <button type="button" class="ge-suffix-color-swatch w-5 h-5 rounded-full ${cp.dotBg} transition cursor-pointer hover:scale-125 active:scale-95 ${suffixColorIndex === cp.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'}" data-color-id="${cp.id}" title="${cp.name}"></button>
              `).join('')}
            </div>
            <span class="text-xs font-bold text-amber-300">
              ${COLOR_PALETTE[suffixColorIndex % COLOR_PALETTE.length].name}
            </span>
            <span class="text-[11px] text-slate-400 italic ml-auto">
              (Independent from formula parts)
            </span>
          </div>
        ` : '';

        wordChipsContainer.innerHTML = '<div class="flex flex-wrap items-center gap-1.5">' + chipsHtml + '</div>' + suffixPaletteHtml;

        const getCycleOptions = () => {
          const opts = [];
          for (let i = 0; i < currentFormulaParts.length; i++) {
            opts.push(i);
          }
          opts.push(-1);
          return opts;
        };

        const nextColorVal = (curr) => {
          const opts = getCycleOptions();
          const c = (typeof curr === 'number') ? curr : -1;
          const idx = opts.indexOf(c);
          if (idx === -1 || idx >= opts.length - 1) {
            return opts[0];
          }
          return opts[idx + 1];
        };

        // Wire click handlers for cycling formula parts
        wordChipsContainer.querySelectorAll('.ge-token-btn').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.dataset.tokenIdx);
            const seg = btn.dataset.segment;
            const item = currentWordAssignments[idx];
            if (!item) return;

            if (seg === 'root') {
              item.rootColor = nextColorVal(item.rootColor);
            } else if (seg === 'suffix') {
              // Suffix color can be ANY color in COLOR_PALETTE (0..9), completely independent of formula parts!
              const cur = (typeof item.suffixColor === 'number' && item.suffixColor >= 0) ? item.suffixColor : suffixColorIndex;
              const nextColor = (cur + 1) % COLOR_PALETTE.length;
              item.suffixColor = nextColor;
              suffixColorIndex = nextColor;
            } else {
              item.color = nextColorVal(item.color);
            }
            syncWordChips();
          };
        });

        // Wire click handler for Suffix Color palette swatches
        wordChipsContainer.querySelectorAll('.ge-suffix-color-swatch').forEach(swatch => {
          swatch.onclick = (e) => {
            e.stopPropagation();
            const cId = Number(swatch.dataset.colorId);
            suffixColorIndex = cId;
            currentWordAssignments.forEach(w => {
              if (w.isSplit) {
                w.suffixColor = cId;
              }
            });
            syncWordChips();
          };
        });

        // Wire toggle button for splitting / merging suffix
        wordChipsContainer.querySelectorAll('.ge-split-toggle').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.dataset.tokenIdx);
            const item = currentWordAssignments[idx];
            if (!item) return;

            if (item.isSplit) {
              item.isSplit = false;
              item.color = typeof item.rootColor === 'number' && item.rootColor !== -1 ? item.rootColor : item.suffixColor;
            } else {
              const sInfo = detectSuffix(item.core, getFormulaParts());
              if (!sInfo) return; // Strict: do not split words that lack a recognized suffix
              item.isSplit = true;
              item.root = sInfo.root;
              item.suffix = sInfo.suffix;
              const partIdx = (typeof item.color === 'number' && item.color !== -1) ? item.color : 0;
              item.rootColor = partIdx;
              
              // Suffix / extra part (-ing, -ed, -s, -er, etc.) MUST by default be in a DIFFERENT color!
              let defSuffixColor = (typeof suffixColorIndex === 'number' && suffixColorIndex >= 0) ? suffixColorIndex : 4;
              if (defSuffixColor === partIdx) {
                defSuffixColor = (partIdx === 4) ? 3 : 4;
              }
              item.suffixColor = defSuffixColor;
            }
            syncWordChips();
          };
        });
      }

      sentenceInput?.addEventListener('input', () => {
        const text = sentenceInput.value.trim();
        const rawTokens = text.split(/\s+/).filter(Boolean);
        const formulaParts = getFormulaParts();

        const existingMap = new Map();
        currentWordAssignments.forEach(item => {
          existingMap.set(item.core, item);
        });

        currentWordAssignments = rawTokens.map(tok => {
          const match = tok.match(/^([^.,!?;:]*)([.,!?;:]*)$/);
          const core = match ? match[1] : tok;
          const punct = match ? match[2] : '';
          const existing = existingMap.get(core);

          if (existing) {
            return {
              ...existing,
              token: tok,
              punct: punct
            };
          }

          const sInfo = detectSuffix(core, formulaParts);
          const formulaMentionsSuffix = sInfo && formulaParts.some(p => {
            const pNorm = String(p || '').toLowerCase();
            const sNorm = sInfo.suffix.toLowerCase();
            return pNorm.includes(sNorm) ||
                   (sNorm.endsWith('ing') && pNorm.includes('ing')) ||
                   (sNorm.endsWith('ed') && pNorm.includes('ed')) ||
                   (sNorm.endsWith('er') && pNorm.includes('er')) ||
                   (sNorm.endsWith('est') && pNorm.includes('est')) ||
                   (sNorm.endsWith('ly') && pNorm.includes('ly'));
          });

          if (sInfo && formulaMentionsSuffix) {
            let partIdx = currentFormulaParts.findIndex(p => {
              const pNorm = p.name.toLowerCase();
              const sNorm = sInfo.suffix.toLowerCase();
              return pNorm.includes(sNorm) || (/verb/i.test(pNorm) && /(?:ing|ed|es|s)$/i.test(sNorm)) || (/adj/i.test(pNorm) && /(?:er|est)$/i.test(sNorm));
            });
            if (partIdx === -1 && currentFormulaParts.length > 2) partIdx = 2;
            else if (partIdx === -1 && currentFormulaParts.length > 1) partIdx = 1;
            else if (partIdx === -1) partIdx = 0;

            let defSuffixColor = (typeof suffixColorIndex === 'number' && suffixColorIndex >= 0) ? suffixColorIndex : 4;
            if (defSuffixColor === partIdx) {
              defSuffixColor = (partIdx === 4) ? 3 : 4;
            }

            return {
              token: tok,
              core: core,
              punct: punct,
              isSplit: true,
              root: sInfo.root,
              suffix: sInfo.suffix,
              rootColor: partIdx,
              suffixColor: defSuffixColor,
              color: partIdx
            };
          }

          return {
            token: tok,
            core: core,
            punct: punct,
            isSplit: false,
            root: '',
            suffix: '',
            rootColor: -1,
            suffixColor: -1,
            color: -1
          };
        });

        syncWordChips();
      });

      formulaInput?.addEventListener('input', () => {
        const text = (formulaInput.value || '').trim();
        const rawParts = text ? text.split('+').map(p => p.trim()).filter(Boolean) : [];
        if (rawParts.length > 0) {
          currentFormulaParts = rawParts.map((p, idx) => {
            const existing = currentFormulaParts[idx];
            return {
              id: existing?.id || ('part-' + idx + '-' + Math.random().toString(36).slice(2, 6)),
              name: p,
              colorIndex: (existing && typeof existing.colorIndex === 'number') ? existing.colorIndex : (idx % COLOR_PALETTE.length)
            };
          });
          syncWordChips();
        }
      });

      // Global click on modal to dismiss open color popovers
      modal.addEventListener('click', (e) => {
        if (!e.target.closest('.ge-color-popover') && !e.target.closest('.ge-part-color-btn')) {
          legendContainer?.querySelectorAll('.ge-color-popover').forEach(p => p.classList.add('hidden'));
        }
      });

      syncAlternativesList();

      syncWordChips();

      

      modal.querySelector('#ge-close-btn').onclick = () => modal.remove();
      modal.querySelector('#ge-cancel-btn').onclick = () => modal.remove();

      // Open Add New Rule Form Button
      modal.querySelector('#ge-open-add-rule-btn')?.addEventListener('click', () => {
        editingRuleIndex = -1;
        isRuleFormOpen = true;
        isImagePickerOpen = false;
        renderEditor();
        modal.querySelector('#ge-rule-form-box')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        modal.querySelector('#ge-rule-title')?.focus();
      });

      // Collapse / Cancel Form Buttons
      modal.querySelector('#ge-collapse-form-btn')?.addEventListener('click', () => {
        editingRuleIndex = -1;
        isRuleFormOpen = false;
        isImagePickerOpen = false;
        renderEditor();
      });
      modal.querySelector('#ge-cancel-rule-btn')?.addEventListener('click', () => {
        editingRuleIndex = -1;
        isRuleFormOpen = false;
        isImagePickerOpen = false;
        renderEditor();
      });

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

        // Prepare saved word assignments with sub-word suffix support
        const savedWordAssignments = currentWordAssignments.map(item => {
          if (item.isSplit) {
            return {
              token: item.token,
              punct: item.punct,
              segments: [
                { text: item.root, color: item.rootColor },
                { text: item.suffix, color: item.suffixColor }
              ]
            };
          } else {
            return {
              token: item.token,
              text: item.core,
              punct: item.punct,
              color: item.color
            };
          }
        });

        // Compute legacy strings for backwards compatibility
        const wordsBlue = [];
        const wordsAmber = [];
        const wordsGreen = [];
        savedWordAssignments.forEach(item => {
          const checkColor = (text, pIdx) => {
            if (typeof pIdx !== 'number' || pIdx < 0) return;
            const actualColor = (currentFormulaParts[pIdx] && typeof currentFormulaParts[pIdx].colorIndex === 'number')
              ? currentFormulaParts[pIdx].colorIndex
              : pIdx;
            if (actualColor === 0) wordsBlue.push(text);
            else if (actualColor === 1) wordsAmber.push(text);
            else if (actualColor === 2) wordsGreen.push(text);
          };
          if (item.segments) {
            item.segments.forEach(seg => checkColor(seg.text, seg.color));
          } else {
            checkColor(item.text, item.color);
          }
        });
        const wordsBlueStr = wordsBlue.join(', ');
        const wordsAmberStr = wordsAmber.join(', ');
        const wordsGreenStr = wordsGreen.join(', ');
        const finalFormula = currentFormulaParts.map(p => p.name).join(' + ') || formula || 'Subject + Verb';

        if (isEditing) {
          // Update existing rule
          rules[editingRuleIndex] = {
            ...rules[editingRuleIndex],
            title,
            formula: finalFormula,
            formula_parts: currentFormulaParts,
            suffix_color: suffixColorIndex,
            sentence,
            word_assignments: savedWordAssignments,
            words_blue: wordsBlueStr,
            words_amber: wordsAmberStr,
            words_green: wordsGreenStr,
            highlight_blue: wordsBlueStr,
            highlight_amber: wordsAmberStr,
            highlight_green: wordsGreenStr,
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
          isRuleFormOpen = false;
          isImagePickerOpen = false;
        } else {
          // Add new rule
          const newRule = {
            rule_id: 'rule-' + Date.now(),
            title,
            formula: finalFormula,
            formula_parts: currentFormulaParts,
            suffix_color: suffixColorIndex,
            sentence,
            word_assignments: savedWordAssignments,
            words_blue: wordsBlueStr,
            words_amber: wordsAmberStr,
            words_green: wordsGreenStr,
            highlight_blue: wordsBlueStr,
            highlight_amber: wordsAmberStr,
            highlight_green: wordsGreenStr,
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
          editingRuleIndex = -1;
          isRuleFormOpen = false;
          isImagePickerOpen = false;
        }

        renderEditor();
      };

      // Click Edit on a Rule
      modal.querySelectorAll('.ge-edit-rule').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.ruleIdx);
          if (idx >= 0 && idx < rules.length) {
            editingRuleIndex = idx;
            isRuleFormOpen = true;
            isImagePickerOpen = false;
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

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    const onEditorEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', onEditorEsc);
      }
    };
    document.addEventListener('keydown', onEditorEsc);

    renderEditor();
    document.body.appendChild(modal);

    if (editingRuleIndex >= 0) {
      setTimeout(() => {
        const formBox = modal.querySelector('#ge-rule-form-box');
        if (formBox) {
          formBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 70);
    }
  };

  // Delete Deck
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

  // Admin check for AI generation exclusively
  function isGrammarAdmin() {
    if (typeof window.isAymanTeacher === 'function' && window.isAymanTeacher()) return true;
    if (typeof window.canAccessAdmin === 'function' && window.canAccessAdmin()) return true;
    const identity = String(window.currentTeacher || '').trim().toLowerCase();
    if (identity === 'ayman' || identity === 'teacher ayman') return true;
    if (typeof window.getEffectiveTeacherRole === 'function' && window.getEffectiveTeacherRole(window.currentTeacher) === 'admin') return true;
    if (typeof window.isTeacherAdminRecord === 'function' && window.isTeacherAdminRecord(window.currentTeacher)) return true;
    const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : (typeof window.findMyTeacherRecord === 'function' ? window.findMyTeacherRecord() : null);
    if (rec && (rec.teacher_role === 'admin' || rec.teacher_credits === -1)) return true;
    const creds = typeof window.getTeacherCredits === 'function' ? window.getTeacherCredits() : null;
    if (creds === Infinity) return true;
    return false;
  }
  window.isGrammarAdmin = isGrammarAdmin;

  function updateGrammarAiAdminVisibility() {
    const isAdmin = isGrammarAdmin();
    const classBtn = document.getElementById('generate-grammar-deck-btn');
    if (classBtn) {
      if (isAdmin) {
        classBtn.classList.remove('hidden', 'is-admin-only');
        classBtn.style.setProperty('display', 'inline-flex', 'important');
      } else {
        classBtn.classList.add('hidden', 'is-admin-only');
        classBtn.style.setProperty('display', 'none', 'important');
      }
    }
    const bankBtn = document.getElementById('teacher-grammar-open-ai');
    if (bankBtn) {
      if (isAdmin) {
        bankBtn.classList.remove('hidden', 'is-admin-only');
        bankBtn.style.setProperty('display', 'inline-flex', 'important');
      } else {
        bankBtn.classList.add('hidden', 'is-admin-only');
        bankBtn.style.setProperty('display', 'none', 'important');
      }
    }
  }
  window.updateGrammarAiAdminVisibility = updateGrammarAiAdminVisibility;

  // Immediate and event-driven admin button visibility sync
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateGrammarAiAdminVisibility);
    } else {
      updateGrammarAiAdminVisibility();
    }
    window.addEventListener('load', updateGrammarAiAdminVisibility);
    window.addEventListener('teacher-credits-updated', updateGrammarAiAdminVisibility);
  }

  // AI Generator Modal for Grammar Decks (Admin Exclusive)
  window.openGrammarAiGeneratorModal = function(defaultTopic = '') {
    if (!isGrammarAdmin()) {
      if (typeof toast === 'function') toast('AI generation is exclusively reserved for administrators.');
      return;
    }
    document.querySelectorAll('#grammar-ai-modal').forEach(m => m.remove());

    const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : (typeof window.getTeacherCredits === 'function' ? window.getTeacherCredits() : 100);

    const modal = document.createElement('div');
    modal.id = 'grammar-ai-modal';
    modal.className = 'fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto';
    modal.innerHTML = `
      <div class="max-w-xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 my-auto relative">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
              <svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </span>
            <h3 class="text-base font-bold text-white">Generate Grammar Deck with AI</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>
              <span id="g-ai-balance-val">${availableCredits}</span> Credits
            </span>
            <button type="button" id="g-ai-close" class="text-slate-400 hover:text-white font-bold text-xl cursor-pointer transition px-1">&times;</button>
          </div>
        </div>

        <!-- Step 1: Initial Topic Formulation Screen -->
        <div id="g-ai-form-wrap" class="space-y-4">
          <p class="text-xs text-slate-400">Describe what grammar topic you want to teach. AI will search curriculum standards and recommend the best rules, formulas, examples, and visuals for your review.</p>

          <div id="g-ai-error-banner" class="hidden p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"></div>

          <div class="space-y-3">
            <div>
              <label for="g-ai-topic" class="block text-xs font-semibold text-slate-300 mb-1">Grammar Topic or Skill *</label>
              <input id="g-ai-topic" type="text" placeholder="e.g. Simple Future (will / going to), Past Irregular, Comparative Adjectives" class="quiz-input text-xs w-full" value="${escapeHtml(defaultTopic)}">
            </div>

            <div>
              <label for="g-ai-level" class="block text-xs font-semibold text-slate-300 mb-1">Target Grade / Level</label>
              <select id="g-ai-level" class="quiz-input text-xs w-full cursor-pointer">
                <option value="Beginner">Beginner (ESL / Grade 2-3)</option>
                <option value="Intermediate" selected>Intermediate (ESL / Grade 4-5)</option>
                <option value="Confident">Confident (Grade 6+)</option>
              </select>
            </div>

            <!-- Pricing Notice Banner -->
            <div id="g-ai-cost-banner" class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <span class="flex items-center gap-2 text-slate-300">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Rate: <strong class="text-white">5 credits per rule</strong></span>
              </span>
              <span class="text-slate-400 text-[11px]">AI researches rules first • choose how many on next step</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" id="g-ai-cancel" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer">Cancel</button>
            <button type="button" id="g-ai-submit" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span>Search Recommended Rules</span>
            </button>
          </div>
        </div>

        <!-- Generating Screen with Dexter-st Bright-Lizard-8 AI Orb Animation -->
        <div id="g-ai-progress-wrap" class="vocab-gen-generating-screen" style="display:none;">
          <div class="loader-wrapper bl8-loader-wrapper">
            <span class="loader-letter bl8-loader-letter">S</span>
            <span class="loader-letter bl8-loader-letter">e</span>
            <span class="loader-letter bl8-loader-letter">a</span>
            <span class="loader-letter bl8-loader-letter">r</span>
            <span class="loader-letter bl8-loader-letter">c</span>
            <span class="loader-letter bl8-loader-letter">h</span>
            <span class="loader-letter bl8-loader-letter">i</span>
            <span class="loader-letter bl8-loader-letter">n</span>
            <span class="loader-letter bl8-loader-letter">g</span>
            <div class="loader bl8-loader"></div>
          </div>

          <div id="g-ai-status-badge" class="vocab-gen-status-badge">
            <span class="ai-sparkle-pulse">
              <svg class="w-3.5 h-3.5 inline-block text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </span>
            <span id="g-ai-status-text">Step 1/2: Researching curriculum rules with AI...</span>
          </div>

          <div class="vocab-gen-progress-track">
            <div id="g-ai-progress-fill" class="vocab-gen-progress-bar" style="width: 25%;"></div>
          </div>

          <div id="g-ai-subhint" class="vocab-gen-generating-subhint">
            Analyzing curriculum standards and discovering recommended rules...
          </div>
        </div>

        <!-- Step 2: Recommendations & Rule Selection Screen -->
        <div id="g-ai-review-wrap" class="space-y-4" style="display:none;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>AI Recommendations for <span id="g-ai-review-topic-name" class="text-purple-300">Topic</span></span>
              </h4>
              <p class="text-xs text-slate-400 mt-0.5">Select how many rules you want in this deck (5 credits per rule):</p>
            </div>
          </div>

          <!-- Preset Selector: Less, Recommended, More, All -->
          <div id="g-ai-preset-tabs" class="grid grid-cols-4 gap-2">
            <button type="button" data-count="2" class="g-ai-preset-btn p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700 text-center transition cursor-pointer">
              <div class="text-[11px] font-bold text-slate-300">Less</div>
              <div class="text-[10px] text-slate-500">2 Rules (10 Cr)</div>
            </button>
            <button type="button" data-count="3" class="g-ai-preset-btn active p-2 rounded-xl border border-purple-500/50 bg-purple-500/15 text-purple-200 text-center transition cursor-pointer ring-1 ring-purple-500/30">
              <div class="text-[11px] font-bold text-purple-300">Recommended</div>
              <div class="text-[10px] text-purple-300/80">3 Rules (15 Cr)</div>
            </button>
            <button type="button" data-count="4" class="g-ai-preset-btn p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700 text-center transition cursor-pointer">
              <div class="text-[11px] font-bold text-slate-300">More</div>
              <div class="text-[10px] text-slate-500">4 Rules (20 Cr)</div>
            </button>
            <button type="button" data-count="5" class="g-ai-preset-btn p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700 text-center transition cursor-pointer">
              <div class="text-[11px] font-bold text-slate-300">All</div>
              <div class="text-[10px] text-slate-500">5 Rules (25 Cr)</div>
            </button>
          </div>

          <div id="g-ai-review-error" class="hidden p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"></div>

          <!-- Rules List Container -->
          <div id="g-ai-rules-list" class="space-y-2 max-h-72 overflow-y-auto pr-1"></div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-800">
            <button type="button" id="g-ai-review-back" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
              <span>Change Topic</span>
            </button>
            <div class="flex items-center gap-3">
              <span id="g-ai-review-cost-pill" class="text-amber-300 font-bold text-xs bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/25">
                Cost: 15 Credits
              </span>
              <button type="button" id="g-ai-review-confirm" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95">
                <svg class="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                <span id="g-ai-confirm-text">Create Deck (3 Rules)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#g-ai-close').onclick = () => modal.remove();
    modal.querySelector('#g-ai-cancel').onclick = () => modal.remove();

    const formWrap = modal.querySelector('#g-ai-form-wrap');
    const progressWrap = modal.querySelector('#g-ai-progress-wrap');
    const reviewWrap = modal.querySelector('#g-ai-review-wrap');
    const statusText = modal.querySelector('#g-ai-status-text');
    const progressFill = modal.querySelector('#g-ai-progress-fill');
    const subhint = modal.querySelector('#g-ai-subhint');
    const errorBanner = modal.querySelector('#g-ai-error-banner');
    const reviewError = modal.querySelector('#g-ai-review-error');
    const reviewTopicName = modal.querySelector('#g-ai-review-topic-name');
    const rulesListEl = modal.querySelector('#g-ai-rules-list');
    const costPill = modal.querySelector('#g-ai-review-cost-pill');
    const confirmBtn = modal.querySelector('#g-ai-review-confirm');
    const confirmText = modal.querySelector('#g-ai-confirm-text');
    const presetBtns = modal.querySelectorAll('.g-ai-preset-btn');

    let candidateRules = [];
    let selectedIndices = new Set([0, 1, 2]); // default to AI Recommended 3 rules
    let finalDeckName = '';

    const updateProgress = (pct, step, hint) => {
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (statusText) statusText.textContent = step;
      if (hint && subhint) subhint.textContent = hint;
    };

    function updatePresetHighlight() {
      const count = selectedIndices.size;
      const isConsecutiveFromZero = count > 0 && Array.from(selectedIndices).sort((a,b) => a - b).every((val, idx) => val === idx);

      presetBtns.forEach(btn => {
        const btnCount = Number(btn.dataset.count);
        if (isConsecutiveFromZero && btnCount === count) {
          btn.className = 'g-ai-preset-btn active p-2 rounded-xl border border-purple-500/50 bg-purple-500/15 text-purple-200 text-center transition cursor-pointer ring-1 ring-purple-500/30';
          btn.querySelector('div:first-child').className = 'text-[11px] font-bold text-purple-300';
          btn.querySelector('div:last-child').className = 'text-[10px] text-purple-300/80';
        } else {
          btn.className = 'g-ai-preset-btn p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700 text-center transition cursor-pointer';
          btn.querySelector('div:first-child').className = 'text-[11px] font-bold text-slate-300';
          btn.querySelector('div:last-child').className = 'text-[10px] text-slate-500';
        }
      });
    }

    function renderRulesList() {
      if (!rulesListEl) return;
      rulesListEl.innerHTML = '';

      candidateRules.forEach((rule, idx) => {
        const isSelected = selectedIndices.has(idx);
        const isCore = idx < 3;

        const item = document.createElement('label');
        item.className = `g-ai-rule-item flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
          isSelected 
            ? 'border-purple-500/40 bg-purple-950/20 ring-1 ring-purple-500/30' 
            : 'border-slate-800/80 bg-slate-950/40 opacity-70 hover:opacity-100 hover:border-slate-700'
        }`;

        item.innerHTML = `
          <input type="checkbox" class="mt-1 w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 cursor-pointer shrink-0" ${isSelected ? 'checked' : ''} data-index="${idx}">
          <img src="${escapeHtml(rule.image || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg')}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800" alt="">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="text-xs font-bold text-white">${idx + 1}. ${escapeHtml(rule.title)}</span>
              ${isCore 
                ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">Recommended</span>'
                : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 border border-sky-500/30 text-sky-300 shrink-0">Extension</span>'
              }
            </div>
            <div class="text-[11px] text-slate-300 italic mb-1 truncate font-sans">"${escapeHtml(rule.sentence || '')}"</div>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
              <span class="px-1.5 py-0.5 rounded bg-slate-800/90 text-purple-300 font-mono text-[10px]">${escapeHtml(rule.formula || '')}</span>
              ${rule.context_clue ? `<span class="text-slate-400 text-[10px] truncate max-w-[200px]">${escapeHtml(rule.context_clue)}</span>` : ''}
            </div>
          </div>
        `;

        const checkEl = item.querySelector('input[type="checkbox"]');
        checkEl.addEventListener('change', (e) => {
          e.stopPropagation();
          if (checkEl.checked) {
            selectedIndices.add(idx);
          } else {
            selectedIndices.delete(idx);
          }
          syncReviewState(false);
          updateCardClasses(item, checkEl.checked);
        });

        item.addEventListener('click', (e) => {
          if (e.target.tagName.toLowerCase() === 'input') return;
          e.preventDefault();
          checkEl.checked = !checkEl.checked;
          if (checkEl.checked) {
            selectedIndices.add(idx);
          } else {
            selectedIndices.delete(idx);
          }
          syncReviewState(false);
          updateCardClasses(item, checkEl.checked);
        });

        rulesListEl.appendChild(item);
      });

      syncReviewState(false);
    }

    function updateCardClasses(cardEl, isChecked) {
      if (isChecked) {
        cardEl.className = 'g-ai-rule-item flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none border-purple-500/40 bg-purple-950/20 ring-1 ring-purple-500/30';
      } else {
        cardEl.className = 'g-ai-rule-item flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none border-slate-800/80 bg-slate-950/40 opacity-70 hover:opacity-100 hover:border-slate-700';
      }
    }

    function syncReviewState(reRenderList = true) {
      const count = selectedIndices.size;
      const cost = count * 5;

      if (costPill) costPill.textContent = `Cost: ${cost} Credits`;
      if (confirmText) confirmText.textContent = `Create Deck (${count} Rule${count === 1 ? '' : 's'} • ${cost} Cr)`;
      if (confirmBtn) {
        confirmBtn.disabled = count === 0;
        confirmBtn.classList.toggle('opacity-50', count === 0);
      }

      updatePresetHighlight();
      if (reRenderList) {
        renderRulesList();
      }
    }

    // Preset button listeners (Less 2, Recommended 3, More 4, All 5)
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const count = Math.min(Number(btn.dataset.count) || 3, candidateRules.length);
        selectedIndices = new Set();
        for (let i = 0; i < count; i++) {
          selectedIndices.add(i);
        }
        renderRulesList();
      });
    });

    // Back button in review screen
    modal.querySelector('#g-ai-review-back').onclick = () => {
      reviewWrap.style.display = 'none';
      formWrap.style.display = 'block';
      if (reviewError) reviewError.classList.add('hidden');
    };

    // Step 1 Submit: Search & Recommend Rules
    modal.querySelector('#g-ai-submit').onclick = async () => {
      const topic = modal.querySelector('#g-ai-topic').value.trim();
      const level = modal.querySelector('#g-ai-level').value;

      if (!topic) {
        if (errorBanner) {
          errorBanner.textContent = 'Please enter a grammar topic.';
          errorBanner.classList.remove('hidden');
        } else if (typeof toast === 'function') {
          toast('Please enter a grammar topic.');
        }
        return;
      }

      if (errorBanner) errorBanner.classList.add('hidden');

      formWrap.style.display = 'none';
      progressWrap.style.display = 'flex';
      updateProgress(25, `Step 1/2: Researching curriculum rules for "${topic}"...`, 'Analyzing grammar progression and formulating recommended rules...');

      candidateRules = [];
      finalDeckName = topic;

      try {
        // 1. Server AI generation via /api/generate-vocab-list (mode: "grammar")
        const res = await fetch('/api/generate-vocab-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'grammar', topic, level, ruleCount: 5 })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.rules) && data.rules.length > 0) {
            candidateRules = data.rules;
            if (data.deck_name) finalDeckName = data.deck_name;
          }
        }
      } catch (err) {
        console.warn('API grammar generation failed, using intelligent pedagogical synthesizer:', err);
      }

      // 2. High-quality pedagogical fallback if server did not return rules
      if (!candidateRules.length) {
        candidateRules = synthesizeGrammarRules(topic, level, 5);
      }

      updateProgress(65, 'Step 2/2: Finding matching stock photos...', 'Curating visual prompts for each rule...');

      // 3. Ensure each rule has a distinct photo directly matching its example sentence
      const usedUrls = new Set();
      for (let i = 0; i < candidateRules.length; i++) {
        const r = candidateRules[i];
        const pct = 65 + Math.round(((i + 1) / candidateRules.length) * 25);
        updateProgress(pct, `Step 2/2: Visual matching (${i + 1}/${candidateRules.length})...`, `Searching: "${(r.sentence || r.title || '').slice(0, 34)}..."`);

        const isCuratedDefault = !r.image ||
          r.image.includes('elephant-10098979') ||
          r.image.includes('dinosaur-5995333') ||
          r.image.includes('laboratory-2815641') ||
          r.image.includes('night-view-7523474') ||
          r.image.includes('grapes-3550729') ||
          r.image.includes('business-4271251');

        if (isCuratedDefault || usedUrls.has(r.image)) {
          try {
            const kw = extractKeywordsForGrammarRule(r, { grammar_deck_name: finalDeckName });
            const media = await fetchMediaForGrammarSearch(kw, 'all', 1);
            if (media.photos && media.photos.length > 0) {
              const unique = media.photos.find(p => !usedUrls.has(p.url));
              r.image = unique ? unique.url : media.photos[0].url;
            }
          } catch (_) {}
        }
        if (r.image) usedUrls.add(r.image);
      }

      updateProgress(100, 'Ready!', 'Presenting AI recommendations...');

      setTimeout(() => {
        progressWrap.style.display = 'none';
        reviewWrap.style.display = 'block';

        if (reviewTopicName) reviewTopicName.textContent = finalDeckName || topic;

        // Default selection: 3 rules (AI Recommended) or up to candidateRules.length
        const defaultCount = Math.min(3, candidateRules.length);
        selectedIndices = new Set();
        for (let i = 0; i < defaultCount; i++) {
          selectedIndices.add(i);
        }

        renderRulesList();
      }, 350);
    };

    // Step 2 Confirm: Deduct Credits & Save Deck
    modal.querySelector('#g-ai-review-confirm').onclick = async () => {
      const selectedRules = candidateRules.filter((_, idx) => selectedIndices.has(idx));
      if (!selectedRules.length) {
        if (reviewError) {
          reviewError.textContent = 'Please select at least 1 rule to include in your deck.';
          reviewError.classList.remove('hidden');
        }
        return;
      }

      const totalCost = selectedRules.length * 5;
      const currentCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : (typeof window.getTeacherCredits === 'function' ? window.getTeacherCredits() : 100);

      if (currentCredits < totalCost) {
        if (reviewError) {
          reviewError.textContent = `You need ${totalCost} credits for ${selectedRules.length} rules (5 credits per rule). You currently have ${currentCredits} credits.`;
          reviewError.classList.remove('hidden');
        } else if (typeof toast === 'function') {
          toast(`Not enough credits. You need ${totalCost} credits.`);
        }
        return;
      }

      if (reviewError) reviewError.classList.add('hidden');

      // Deduct credits
      if (typeof window.deductTeacherCredits === 'function') {
        const paid = await window.deductTeacherCredits(totalCost);
        if (!paid) {
          if (reviewError) {
            reviewError.textContent = `Could not deduct ${totalCost} credits. Please check your credit balance and retry.`;
            reviewError.classList.remove('hidden');
          }
          return;
        }
      }

      if (typeof window.logCredit === 'function') {
        try {
          await window.logCredit(totalCost, 'spent', `AI Grammar Deck: ${finalDeckName} (${selectedRules.length} rules)`);
        } catch (_) {}
      }

      const currentTeacherName = typeof currentTeacher !== 'undefined' ? currentTeacher : 'Teacher Ayman';
      const currentSchool = typeof navSchool !== 'undefined' && navSchool ? navSchool : 'Daya Stanford';
      const currentClass = typeof navClass !== 'undefined' && navClass ? navClass : 'ESL2';
      const newDeckId = 'grammar-deck-' + Date.now();

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
        cover_image_url: selectedRules[0]?.image || 'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
        type: 'grammar_deck',
        rules: selectedRules
      };

      await window.saveOrUpdateGrammarDeck(generatedDeck);

      modal.remove();
      if (typeof toast === 'function') toast(`Generated grammar deck "${finalDeckName}" (${selectedRules.length} rules • ${totalCost} credits deducted)!`);
      window.renderClassGrammarDecks();
      window.renderTeacherOwnedGrammarDecks();
      window.openGrammarDeckEditor(newDeckId, finalDeckName);
    };
  };

  // PEDAGOGICAL GRAMMAR SYNTHESIZER
  // ==========================================
  function synthesizeGrammarRules(topic, level, requestedCount = 0) {
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

    if (requestedCount > 0 && rules.length > requestedCount) {
      return rules.slice(0, requestedCount);
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

    // Open AI Generator (Teacher Zone Grammar Bank & Classroom Grammar Subtab - Admin Exclusive)
    document.getElementById('teacher-grammar-open-ai')?.addEventListener('click', () => {
      window.openGrammarAiGeneratorModal();
    });
    document.getElementById('generate-grammar-deck-btn')?.addEventListener('click', () => {
      window.openGrammarAiGeneratorModal();
    });
    updateGrammarAiAdminVisibility();

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
