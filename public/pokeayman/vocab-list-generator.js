// AI Vocabulary List Generator for PokéAyman
// Generates complete vocabulary lists from either words or uploaded photos using Gemini AI
// Context-aware image search + 1 credit per word charged ONLY upon success.

(function () {
  let isGenerating = false;
  let activeTab = 'words';
  let uploadedPhotoBase64 = '';
  let selectedPhotoWordCount = 5;

  function getTeacherBalance() {
    if (typeof window.getTeacherCredits === 'function') {
      return window.getTeacherCredits();
    }
    const identity = String(window.currentTeacher || '').trim().toLocaleLowerCase();
    if (identity === 'ayman' || identity === 'teacher ayman') return Infinity;
    const rec = typeof window.currentTeacherRec === 'function' ? window.currentTeacherRec() : null;
    return rec ? (rec.teacher_credits === -1 ? Infinity : (rec.teacher_credits || 0)) : 0;
  }

  function formatBalance(bal) {
    return bal === Infinity ? 'Unlimited' : `${bal} credit${bal === 1 ? '' : 's'}`;
  }

  async function searchContextImageForSentence(sentence, word) {
    // 1. Search using the full generated sentence context (e.g. "A red ball rolls across the grass")
    if (sentence && typeof window.pexelsFetch === 'function') {
      try {
        const cleanQuery = sentence.replace(/[.!?,"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
        const res = await window.pexelsFetch(`/api/public/pexels?query=${encodeURIComponent(cleanQuery)}&per_page=6`, {
          headers: { 'Authorization': '' }
        });
        if (res.ok) {
          const data = await res.json();
          const photo = data.photos?.[0];
          if (photo?.src?.large || photo?.src?.medium) {
            return photo.src.large || photo.src.medium;
          }
        }
      } catch (err) {
        console.warn('Sentence context image search error:', err);
      }
    }

    // 2. Fallback to searching the main word if full sentence returns 0 results
    if (word && typeof window.pexelsFetch === 'function') {
      try {
        const res = await window.pexelsFetch(`/api/public/pexels?query=${encodeURIComponent(word.trim())}&per_page=6`, {
          headers: { 'Authorization': '' }
        });
        if (res.ok) {
          const data = await res.json();
          const photo = data.photos?.[0];
          if (photo?.src?.large || photo?.src?.medium) {
            return photo.src.large || photo.src.medium;
          }
        }
      } catch (err) {
        console.warn('Word fallback image search error:', err);
      }
    }

    return '';
  }

  function openGenerateModal() {
    if (document.getElementById('vocab-generate-modal')) return;

    const school = window.navSchool;
    const className = window.navClass;

    if (!school || !className || (window.currentRole === 'teacher' && typeof window.canManageClass === 'function' && !window.canManageClass(school, className))) {
      if (typeof window.toast === 'function') {
        window.toast('Choose one of your managed classes before generating a vocabulary list.');
      } else {
        alert('Choose one of your managed classes before generating a vocabulary list.');
      }
      return;
    }

    // Pre-fill list name from input if present
    const existingName = document.getElementById('new-vocab-list-name')?.value?.trim() || '';

    activeTab = 'words';
    uploadedPhotoBase64 = '';
    selectedPhotoWordCount = 5;
    isGenerating = false;

    const modal = document.createElement('div');
    modal.id = 'vocab-generate-modal';
    modal.className = 'vocab-generate-backdrop';
    modal.innerHTML = `
      <div class="vocab-generate-card">
        <!-- Header -->
        <div class="vocab-generate-header flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <h2 class="text-base font-bold tracking-tight">Generate Vocab List with AI</h2>
              <p class="text-xs text-muted">Create simple, child-friendly sentences & matching pictures</p>
            </div>
          </div>
          <button type="button" id="vocab-gen-close-btn" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted hover:text-white transition cursor-pointer text-lg">&times;</button>
        </div>

        <!-- Scrollable Body -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <!-- List Name -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">List Name *</label>
            <input type="text" id="vocab-gen-name" class="quiz-input w-full px-3.5 py-2.5 text-sm rounded-lg" placeholder="e.g., 'Unit 5 Animals' or 'Kitchen Objects'" value="${existingName ? existingName.replace(/"/g, '&quot;') : ''}" required>
          </div>

          <!-- Mode Selector Tabs -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">Generation Source</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-black/25 rounded-xl border border-white/10">
              <button type="button" id="vocab-gen-tab-words" class="vocab-gen-tab-btn py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 active">
                <span>📝</span> Enter Words
              </button>
              <button type="button" id="vocab-gen-tab-photo" class="vocab-gen-tab-btn py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                <span>📷</span> Upload Photo
              </button>
            </div>
          </div>

          <!-- Words Section -->
          <div id="vocab-gen-panel-words" class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider opacity-90">Words to Include</label>
            <textarea id="vocab-gen-words-input" rows="4" class="quiz-input w-full px-3.5 py-2.5 text-sm rounded-lg resize-none" placeholder="Type words separated by commas or lines, e.g.:&#10;lion, elephant, giraffe, zebra, monkey"></textarea>
            <div class="text-xs text-muted flex items-center justify-between">
              <span id="vocab-gen-words-counter">0 words entered</span>
              <span class="text-indigo-400 font-medium">1 credit per word</span>
            </div>
          </div>

          <!-- Photo Section -->
          <div id="vocab-gen-panel-photo" class="space-y-4 hidden">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">Upload Photo</label>
              <div id="vocab-gen-dropzone" class="rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px]">
                <input type="file" id="vocab-gen-file-input" accept="image/*" class="hidden">
                <div id="vocab-gen-dropzone-prompt" class="space-y-1">
                  <div class="text-3xl mb-1">📸</div>
                  <p class="text-xs font-bold">Click or drag & drop a photo here</p>
                  <p class="text-[11px] text-muted">Classroom scene, textbook page, flashcard, or real object</p>
                </div>
                <div id="vocab-gen-preview-container" class="hidden relative w-full flex items-center justify-center">
                  <img id="vocab-gen-preview-img" src="" alt="Photo preview" class="max-h-44 max-w-full rounded-lg object-contain shadow-md">
                  <button type="button" id="vocab-gen-remove-photo" class="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded-md shadow cursor-pointer font-bold">✕ Remove</button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">Words to Extract from Photo</label>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="vocab-gen-count-pill px-3 py-1.5 text-xs font-bold" data-count="3">3 words</button>
                <button type="button" class="vocab-gen-count-pill px-3 py-1.5 text-xs font-bold is-selected" data-count="5">5 words (recommended)</button>
                <button type="button" class="vocab-gen-count-pill px-3 py-1.5 text-xs font-bold" data-count="8">8 words</button>
                <button type="button" class="vocab-gen-count-pill px-3 py-1.5 text-xs font-bold" data-count="10">10 words</button>
              </div>
            </div>
          </div>

          <!-- Credit Cost & Balance Status Banner -->
          <div id="vocab-gen-credit-banner" class="p-3.5 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">💳</span>
              <div>
                <div class="font-bold flex items-center gap-1.5">
                  <span>Cost: <span id="vocab-gen-cost-amount">0</span> credits</span>
                  <span class="text-[11px] font-normal text-muted">(1 credit / main word)</span>
                </div>
                <div class="text-muted text-[11px]">Your balance: <span id="vocab-gen-balance-display">...</span></div>
              </div>
            </div>
            <div id="vocab-gen-credit-badge" class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
              Ready
            </div>
          </div>

          <!-- Error message container -->
          <div id="vocab-gen-error" class="hidden p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium"></div>

          <!-- Progress / Loading state -->
          <div id="vocab-gen-progress-panel" class="hidden space-y-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p id="vocab-gen-status-text" class="text-xs font-bold text-indigo-200">Starting generation...</p>
            </div>
            <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div id="vocab-gen-progress-bar" class="bg-indigo-400 h-1.5 rounded-full transition-all duration-300" style="width: 15%"></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="vocab-generate-footer flex items-center justify-end gap-3">
          <button type="button" id="vocab-gen-cancel-btn" class="px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition">Cancel</button>
          <button type="button" id="vocab-gen-submit-btn" class="px-5 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer">
            <span>⚡</span> Generate List
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Elements
    const closeBtn = modal.querySelector('#vocab-gen-close-btn');
    const cancelBtn = modal.querySelector('#vocab-gen-cancel-btn');
    const submitBtn = modal.querySelector('#vocab-gen-submit-btn');
    const nameInput = modal.querySelector('#vocab-gen-name');
    const tabWords = modal.querySelector('#vocab-gen-tab-words');
    const tabPhoto = modal.querySelector('#vocab-gen-tab-photo');
    const panelWords = modal.querySelector('#vocab-gen-panel-words');
    const panelPhoto = modal.querySelector('#vocab-gen-panel-photo');
    const wordsInput = modal.querySelector('#vocab-gen-words-input');
    const wordsCounter = modal.querySelector('#vocab-gen-words-counter');
    const dropzone = modal.querySelector('#vocab-gen-dropzone');
    const fileInput = modal.querySelector('#vocab-gen-file-input');
    const dropzonePrompt = modal.querySelector('#vocab-gen-dropzone-prompt');
    const previewContainer = modal.querySelector('#vocab-gen-preview-container');
    const previewImg = modal.querySelector('#vocab-gen-preview-img');
    const removePhotoBtn = modal.querySelector('#vocab-gen-remove-photo');
    const costAmountEl = modal.querySelector('#vocab-gen-cost-amount');
    const balanceDisplayEl = modal.querySelector('#vocab-gen-balance-display');
    const creditBadge = modal.querySelector('#vocab-gen-credit-badge');
    const errorEl = modal.querySelector('#vocab-gen-error');
    const progressPanel = modal.querySelector('#vocab-gen-progress-panel');
    const statusText = modal.querySelector('#vocab-gen-status-text');
    const progressBar = modal.querySelector('#vocab-gen-progress-bar');
    const countPills = modal.querySelectorAll('.vocab-gen-count-pill');

    function closeModal() {
      if (isGenerating) return;
      modal.remove();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal && !isGenerating) closeModal();
    });

    function getParsedWords() {
      const raw = wordsInput.value || '';
      return raw.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
    }

    function calculateCost() {
      if (activeTab === 'words') {
        const words = getParsedWords();
        return words.length;
      } else {
        return uploadedPhotoBase64 ? selectedPhotoWordCount : 0;
      }
    }

    function updateCreditUI() {
      const balance = getTeacherBalance();
      const cost = calculateCost();

      balanceDisplayEl.textContent = formatBalance(balance);
      costAmountEl.textContent = String(cost);

      if (activeTab === 'words') {
        const count = getParsedWords().length;
        wordsCounter.textContent = `${count} word${count === 1 ? '' : 's'} entered`;
      }

      if (balance !== Infinity && balance < cost) {
        creditBadge.textContent = 'Insufficient credits';
        creditBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/20 text-red-300';
        submitBtn.disabled = true;
      } else {
        creditBadge.textContent = cost > 0 ? `${cost} credit${cost === 1 ? '' : 's'}` : 'Ready';
        creditBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300';
        submitBtn.disabled = cost === 0;
      }
    }

    // Tab switching
    tabWords.addEventListener('click', () => {
      if (isGenerating) return;
      activeTab = 'words';
      tabWords.classList.add('active');
      tabPhoto.classList.remove('active');
      panelWords.classList.remove('hidden');
      panelPhoto.classList.add('hidden');
      errorEl.classList.add('hidden');
      updateCreditUI();
    });

    tabPhoto.addEventListener('click', () => {
      if (isGenerating) return;
      activeTab = 'photo';
      tabPhoto.classList.add('active');
      tabWords.classList.remove('active');
      panelPhoto.classList.remove('hidden');
      panelWords.classList.add('hidden');
      errorEl.classList.add('hidden');
      updateCreditUI();
    });

    // Word count pills for photo mode
    countPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (isGenerating) return;
        countPills.forEach(p => p.classList.remove('is-selected'));
        pill.classList.add('is-selected');
        selectedPhotoWordCount = Number(pill.dataset.count) || 5;
        updateCreditUI();
      });
    });

    // Words input listener
    wordsInput.addEventListener('input', () => {
      errorEl.classList.add('hidden');
      updateCreditUI();
    });

    // Dropzone / File upload
    dropzone.addEventListener('click', (e) => {
      if (isGenerating || e.target === removePhotoBtn) return;
      fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#818cf8';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '';
      if (isGenerating) return;
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handlePhotoFile(file);
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) handlePhotoFile(file);
    });

    function handlePhotoFile(file) {
      if (file.size > 8 * 1024 * 1024) {
        errorEl.textContent = 'Photo must be under 8MB.';
        errorEl.classList.remove('hidden');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPhotoBase64 = e.target.result;
        previewImg.src = uploadedPhotoBase64;
        dropzonePrompt.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        errorEl.classList.add('hidden');
        updateCreditUI();
      };
      reader.readAsDataURL(file);
    }

    removePhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedPhotoBase64 = '';
      previewImg.src = '';
      fileInput.value = '';
      dropzonePrompt.classList.remove('hidden');
      previewContainer.classList.add('hidden');
      updateCreditUI();
    });

    function setGeneratingState(generating, status = '', progressPercent = 0) {
      isGenerating = generating;
      nameInput.disabled = generating;
      wordsInput.disabled = generating;
      tabWords.disabled = generating;
      tabPhoto.disabled = generating;
      submitBtn.disabled = generating;
      cancelBtn.disabled = generating;
      closeBtn.disabled = generating;

      if (generating) {
        progressPanel.classList.remove('hidden');
        statusText.textContent = status;
        progressBar.style.width = `${progressPercent}%`;
        submitBtn.innerHTML = `<span>⏳</span> Generating...`;
      } else {
        progressPanel.classList.add('hidden');
        submitBtn.innerHTML = `<span>⚡</span> Generate List`;
      }
    }

    // Submit / Generation Handler
    submitBtn.addEventListener('click', async () => {
      if (isGenerating) return;

      const listName = nameInput.value.trim().replace(/\s+/g, ' ');
      if (!listName) {
        errorEl.textContent = 'Please enter a name for the vocabulary list.';
        errorEl.classList.remove('hidden');
        nameInput.focus();
        return;
      }

      const existingLists = typeof window.getVocabLists === 'function' ? window.getVocabLists(school, className) : [];
      if (existingLists.some(l => l.vocab_list_name.toLocaleLowerCase() === listName.toLocaleLowerCase())) {
        errorEl.textContent = 'A vocabulary list with this name already exists in this class.';
        errorEl.classList.remove('hidden');
        return;
      }

      let words = [];
      if (activeTab === 'words') {
        words = getParsedWords();
        if (words.length === 0) {
          errorEl.textContent = 'Please enter at least one vocabulary word.';
          errorEl.classList.remove('hidden');
          wordsInput.focus();
          return;
        }
      } else {
        if (!uploadedPhotoBase64) {
          errorEl.textContent = 'Please choose or drop a photo first.';
          errorEl.classList.remove('hidden');
          return;
        }
      }

      const expectedCount = activeTab === 'words' ? words.length : selectedPhotoWordCount;
      const balance = getTeacherBalance();
      if (balance !== Infinity && balance < expectedCount) {
        errorEl.textContent = `Insufficient credits! You need ${expectedCount} credits, but you have ${balance}.`;
        errorEl.classList.remove('hidden');
        return;
      }

      errorEl.classList.add('hidden');
      setGeneratingState(true, '1/3 Generating simple, child-friendly sentences with Gemini...', 30);

      let generatedItems = [];
      try {
        const payload = activeTab === 'words'
          ? { mode: 'words', words }
          : { mode: 'photo', image: uploadedPhotoBase64, count: selectedPhotoWordCount };

        let res;
        try {
          res = await fetch('/api/generate-vocab-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (fetchErr) {
          console.warn('generate-vocab-list failed, trying vocabulary-sentence endpoint:', fetchErr);
        }

        if (!res || !res.ok) {
          res = await fetch('/api/vocabulary-sentence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Sentence generation failed. Please try again.');
        }

        const data = await res.json();
        generatedItems = Array.isArray(data.items) ? data.items : [];
        if (generatedItems.length === 0) {
          throw new Error('No vocabulary words could be generated.');
        }
      } catch (err) {
        console.error('AI Generation error:', err);
        setGeneratingState(false);
        errorEl.textContent = err.message || 'Generation failed. No credits were deducted.';
        errorEl.classList.remove('hidden');
        updateCreditUI();
        return;
      }

      // Step 2: Context image search using full sentence
      setGeneratingState(true, '2/3 Searching context-matched images for each sentence...', 65);
      const itemsWithImages = [];

      for (let i = 0; i < generatedItems.length; i++) {
        const item = generatedItems[i];
        setGeneratingState(
          true,
          `2/3 Finding context image for "${item.word}" (${i + 1}/${generatedItems.length})...`,
          65 + Math.round(((i + 1) / generatedItems.length) * 20)
        );

        let imageUrl = await searchContextImageForSentence(item.sentence, item.word);
        if (!imageUrl && activeTab === 'photo' && uploadedPhotoBase64) {
          imageUrl = uploadedPhotoBase64;
        }

        itemsWithImages.push({
          word: item.word,
          sentence: item.sentence,
          imageUrl: imageUrl || ''
        });
      }

      // Step 3: Database creation
      setGeneratingState(true, '3/3 Saving vocabulary list and words...', 90);

      const listId = `vocab-list-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const firstValidImage = itemsWithImages.find(it => it.imageUrl)?.imageUrl || uploadedPhotoBase64 || '';

      const listRecord = {
        type: 'vocab_list',
        vocab_list_id: listId,
        vocab_list_name: listName,
        vocab_list_school: school,
        vocab_list_class: className,
        school_name: school,
        class_name: className,
        owner: window.currentTeacher,
        teacher_name: window.currentTeacher,
        teacher_id: window.currentTeacherRecordId || '',
        created_at: new Date().toISOString(),
        vocab_word: '',
        vocab_image: '',
        vocab_cover_image_id: '',
        vocab_cover_image_url: firstValidImage, // Cover is one of the pictures inside the list
        student_name: '',
        coins: 0,
        pokemon_id: 0,
        pokemon_name: '',
        pokemon_rarity: '',
        pokemon_price: 0,
        pokemon_power: 0,
        quiz_question: '',
        quiz_answer: '',
        quiz_reward: 0,
        quiz_solved_by: '',
        quiz_type: '',
        quiz_options: '',
        quiz_image: '',
        teacher_pin: '',
        teacher_role: '',
        avatar_pokemon_id: 0,
        teacher_credits: 0,
        log_action: '',
        log_amount: 0,
        log_target: '',
        shop_pokemon_id: 0,
        shop_pokemon_name: '',
        shop_pokemon_rarity: '',
        shop_pokemon_price: 0,
        shop_pokemon_power: 0,
        shop_pokemon_hp: 0,
        quiz_folder: '',
        folder_name: '',
        archived: false,
        quiz_attempts: '',
        quiz_created_by: window.currentTeacher,
        quiz_class: className,
        quiz_submitted_answers: ''
      };

      try {
        if (!window.dataSdk || typeof window.dataSdk.create !== 'function') {
          throw new Error('Database SDK is not available.');
        }

        const listResult = await window.dataSdk.create(listRecord);
        if (!listResult?.isOk) {
          throw new Error('Could not save the vocabulary list to the database.');
        }

        for (const item of itemsWithImages) {
          const wordId = `vocab-word-${listId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const wordPayload = {
            type: 'vocab_word',
            vocab_list_id: listId,
            list_id: listId,
            vocabulary_list_id: listId,
            school_name: school,
            class_name: className,
            vocab_list_school: school,
            vocab_list_class: className,
            vocab_list_name: listName,
            vocab_word_id: wordId,
            word_id: wordId,
            vocab_word: item.word,
            vocab_image: item.imageUrl,
            vocab_sentence: item.sentence,
            created_at: new Date().toISOString(),
            teacher_name: window.currentTeacher,
            owner: window.currentTeacher
          };

          const wordResult = await window.dataSdk.create(wordPayload, { notify: false });
          if (!wordResult?.isOk) {
            console.warn(`Could not save word item "${item.word}"`);
          }
        }

        // Refresh dataSdk to populate allData and views
        if (typeof window.dataSdk.init === 'function' && window.handler) {
          await window.dataSdk.init(window.handler);
        }

        // Step 4: Deduct credits strictly AFTER successful creation
        const finalWordCount = itemsWithImages.length;
        if (typeof window.deductTeacherCredits === 'function') {
          await window.deductTeacherCredits(finalWordCount);
        }
        if (typeof window.logCredit === 'function') {
          await window.logCredit('generate_vocab_list', -finalWordCount, `Generated ${finalWordCount} words for "${listName}"`);
        }
        if (typeof window.updateTeacherCreditBalance === 'function') {
          window.updateTeacherCreditBalance();
        }

        // Clear create input
        const mainInput = document.getElementById('new-vocab-list-name');
        if (mainInput) mainInput.value = '';

        // Success UI updates
        isGenerating = false;
        modal.remove();

        if (typeof window.renderVocabLists === 'function') window.renderVocabLists();
        if (typeof window.renderGamesList === 'function') window.renderGamesList();

        if (typeof window.toast === 'function') {
          window.toast(`🎉 Generated "${listName}" with ${finalWordCount} words! (-${finalWordCount} credits)`);
        }
      } catch (saveErr) {
        console.error('Saving vocabulary list error:', saveErr);
        setGeneratingState(false);
        errorEl.textContent = saveErr.message || 'Failed to save list to database. No credits were deducted.';
        errorEl.classList.remove('hidden');
        updateCreditUI();
      }
    });

    updateCreditUI();
    nameInput.focus();
  }

  // Bind click event to Generate button
  function initGenerateButton() {
    const btn = document.getElementById('generate-vocab-list-btn');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openGenerateModal();
      });
    }
  }

  // MutationObserver to ensure button stays bound across DOM updates
  const observer = new MutationObserver(initGenerateButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  initGenerateButton();
})();
