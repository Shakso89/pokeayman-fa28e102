/** BACKUP OF GRAMMAR AI GENERATOR */
  window.openGrammarAiGeneratorModal = function(defaultTopic = '') {
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

  