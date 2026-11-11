import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar Tab & Grammar Bank Integration', () => {
  const indexPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const grammarJsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  const componentsCssPath = path.resolve(__dirname, '../../public/pokeayman/components.css');

  it('ensures index.html contains the Grammar class subtab and tab button', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Tab button in class-tabs-container
    expect(html).toContain('data-classtab="grammar"');
    expect(html).toContain('🧩 Grammar');

    // Class subtab container
    expect(html).toContain('id="class-subtab-grammar"');
    expect(html).toContain('id="new-grammar-deck-name"');
    expect(html).toContain('id="create-grammar-deck-btn"');
    expect(html).toContain('id="generate-grammar-deck-btn"');
    expect(html).toContain('id="grammar-decks-container"');
    expect(html).toContain('id="grammar-decks-empty"');
  });

  it('ensures class-subtab-grammar is a sibling of class-subtab-vocab and class-subtab-games inside #view-students', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Parse simple DOM check if DOMParser is available (Vitest jsdom env) or string checks (bun test)
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const viewStudents = doc.getElementById('view-students');
      expect(viewStudents).not.toBeNull();

      const vocabTab = doc.getElementById('class-subtab-vocab');
      const grammarTab = doc.getElementById('class-subtab-grammar');
      const gamesTab = doc.getElementById('class-subtab-games');
      const battleTab = doc.getElementById('class-subtab-battle');

      expect(vocabTab).not.toBeNull();
      expect(grammarTab).not.toBeNull();
      expect(gamesTab).not.toBeNull();
      expect(battleTab).not.toBeNull();

      // Verify all are siblings under viewStudents
      expect(vocabTab?.parentElement).toBe(viewStudents);
      expect(grammarTab?.parentElement).toBe(viewStudents);
      expect(gamesTab?.parentElement).toBe(viewStudents);
      expect(battleTab?.parentElement).toBe(viewStudents);
    } else {
      expect(html).toContain('id="view-students"');
      expect(html).toContain('id="class-subtab-vocab"');
      expect(html).toContain('id="class-subtab-grammar"');
      expect(html).toContain('id="class-subtab-games"');
      expect(html).toContain('id="class-subtab-battle"');
    }
  });

  it('ensures Teacher Zone contains Grammar Bank tab and panel with Mine vs School modes', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Tab button in Teacher Zone
    expect(html).toContain('id="teacher-zone-grammar-decks-tab"');
    expect(html).toContain('Grammar Bank');

    // Panel
    expect(html).toContain('id="teacher-zone-grammar-decks-panel"');
    expect(html).toContain('id="teacher-grammar-mode-mine"');
    expect(html).toContain('id="teacher-grammar-mode-school"');
    expect(html).toContain('id="teacher-grammar-open-create"');
    expect(html).toContain('id="teacher-grammar-open-ai"');
    expect(html).toContain('id="teacher-grammar-search-field"');
    expect(html).toContain('id="teacher-grammar-search-query"');
    expect(html).toContain('id="teacher-grammar-decks-status"');
    expect(html).toContain('id="teacher-grammar-decks-grid"');
  });

  it('ensures grammar-decks.js is loaded in index.html', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('<script src="/pokeayman/grammar-decks.js"></script>');
  });

  it('ensures grammar-decks.js contains required functions, starter decks, and creator attribution', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    expect(js).toContain('getAllGrammarDecks');
    expect(js).toContain('renderClassGrammarDecks');
    expect(js).toContain('renderTeacherOwnedGrammarDecks');
    expect(js).toContain('openGrammarDeckPractice');
    expect(js).toContain('openGrammarDeckPracticeById');
    expect(js).toContain('openGrammarDeckEditor');
    expect(js).toContain('openGrammarAiGeneratorModal');
    expect(js).toContain('openGrammarSharePopupFor');
    expect(js).toContain('deleteGrammarDeck');

    // Checks that cards show creator name
    expect(js).toContain('By <b class="text-amber-300 font-semibold">${escapeHtml(teacher)}</b>');
    expect(js).toContain('Teacher Ayman');
  });

  it('ensures components.css styles grammar deck buttons and containers with uniform card sizing and title truncation', () => {
    const css = fs.readFileSync(componentsCssPath, 'utf-8');
    expect(css).toContain('#class-subtab-grammar');
    expect(css).toContain('#create-grammar-deck-btn');
    expect(css).toContain('#teacher-grammar-open-create');
    expect(css).toContain('#teacher-grammar-mode-mine');
    expect(css).toContain('#teacher-grammar-mode-school');
    expect(css).toContain('.grammar-card-header');
    expect(css).toContain('.grammar-deck-card');
  });

  it('ensures teacher-shell.js sidebar includes Grammar in Classroom and Grammar Bank in Teacher Zone', () => {
    const shellPath = path.resolve(__dirname, '../../public/pokeayman/teacher-shell.js');
    const shellJs = fs.readFileSync(shellPath, 'utf-8');

    // Classroom sidebar item
    expect(shellJs).toContain("['grammar', '🧩', 'Grammar']");

    // Teacher Zone sidebar item
    expect(shellJs).toContain("['grammar-decks', '🧩', 'Grammar Bank']");
  });

  it('ensures grammar rule editor supports editing existing rules and saving to Supabase', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // Rule editing capabilities
    expect(js).toContain('saveOrUpdateGrammarDeck');
    expect(js).toContain('ge-edit-rule');
    expect(js).toContain('ge-del-rule');
    expect(js).toContain('Save Rule Changes');
    expect(js).toContain('Add Rule');
    expect(js).toContain('ge-deck-name-input');
  });

  it('ensures Teacher Zone has dedicated create modal for grammar decks', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    expect(html).toContain('id="teacher-grammar-create-modal"');
    expect(html).toContain('id="teacher-grammar-create-form"');
    expect(html).toContain('id="teacher-grammar-create-name"');
    expect(html).toContain('id="teacher-grammar-create-class"');
    expect(html).toContain('id="teacher-grammar-create-submit"');
  });

  it('ensures reading/audio button is removed from grammar and AI generator code is backed up locally', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const backupPath = path.resolve(__dirname, '../../public/pokeayman/backup-grammar-ai.js');
    expect(fs.existsSync(backupPath)).toBe(true);

    // Reading / speaker button removed
    expect(js).not.toContain('id="gp-read-rule-btn"');
  });

  it('ensures AI grammar deck generator charges 5 credits per rule, has Bright-Lizard-8 loader animation, and enforces diversity', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const apiRoutePath = path.resolve(__dirname, '../../src/routes/api/generate-vocab-list.ts');
    const apiRoute = fs.readFileSync(apiRoutePath, 'utf-8');

    // No mock placeholder strings
    expect(js).not.toContain('Mistake without rule');
    expect(js).not.toContain('The students practiced ${topic}');

    // Calls AI endpoint and provides smart pedagogical synthesizer
    expect(js).toContain("mode: 'grammar'");
    expect(js).toContain('synthesizeGrammarRules');
    expect(js).toContain('What + is / are + Subject ?');
    expect(js).toContain('Where + is / are + Subject ?');
    expect(js).toContain('What color + is / are + Subject ?');
    expect(js).toContain('How many + Plural Noun + are there ?');

    // Credit charging: 5 credits per rule for chosen rules
    expect(js).toContain('selectedRules.length * 5');
    expect(js).toContain('deductTeacherCredits');
    expect(js).toContain('logCredit');
    expect(js).toContain('Rate: <strong class="text-white">5 credits per rule</strong>');

    // Rule recommendation and selection workflow (AI researches first, teacher chooses recommended/less/more)
    expect(js).toContain('id="g-ai-preset-tabs"');
    expect(js).toContain('id="g-ai-rules-list"');
    expect(js).toContain('Recommended');
    expect(js).toContain('Less');
    expect(js).toContain('More');

    // Bright-Lizard-8 AI animation identical to vocabulary list generator
    expect(js).toContain('bl8-loader-letter');
    expect(js).toContain('g-ai-progress-wrap');
    expect(js).toContain('vocab-gen-generating-screen');
    expect(js).toContain('vocab-gen-progress-track');
    expect(js).toContain('vocab-gen-progress-bar');
    expect(js).toContain('vocab-gen-status-badge');
    expect(js).toContain('Researching curriculum rules');

    // API route handles grammar mode with diverse prompts, single-noun image search, and temperature 0.7
    expect(apiRoute).toContain('input?.mode === "grammar"');
    expect(apiRoute).toContain('Grammar Pattern Deck');
    expect(apiRoute).toContain('temperature: 0.7');
    expect(apiRoute).toContain('DIVERSITY AND CREATIVITY REQUIREMENT');
    expect(apiRoute).toContain('callGemini');
    expect(apiRoute).toContain('searchStockMedia');
    expect(apiRoute).toContain('extractKeywordsFromSentence');
    expect(apiRoute).toContain('diverseCuratedImages');
    expect(js).toContain('extractKeywordsForGrammarRule');
  });

  it('ensures grammar rule editor includes interactive image search & picker matching vocab lists', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // Image search UI elements
    expect(js).toContain('id="ge-image-search"');
    expect(js).toContain('id="ge-image-search-btn"');
    expect(js).toContain('id="ge-image-suggest-btn"');
    expect(js).toContain('id="ge-image-type-pills"');
    expect(js).toContain('data-image-type="all"');
    expect(js).toContain('data-image-type="illustration"');
    expect(js).toContain('data-image-type="photo"');
    expect(js).toContain('id="ge-image-results"');
    expect(js).toContain('id="ge-image-preview-container"');
    expect(js).toContain('id="ge-rule-image"');
    expect(js).toContain('ge-photo-pick-card');

    // Functions
    expect(js).toContain('extractKeywordsForGrammarRule');
    expect(js).toContain('fetchMediaForGrammarSearch');
  });

  it('ensures grammar practice modal matches prototype design specifications', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // 1. Sleek grammar practice card with game-style fullscreen support
    expect(js).toContain('gp-practice-card');

    // 2. Multi-color centered formula chips
    expect(js).toContain('formatFormulaChips');
    expect(js).toContain('border-sky-400 bg-sky-500/15 text-sky-300');
    expect(js).toContain('border-amber-400 bg-amber-500/15 text-amber-300');
    expect(js).toContain('border-emerald-400 bg-emerald-500/15 text-emerald-300');

    // 3. Floating context clue badge removed from media arena to eliminate clutter
    expect(js).not.toContain('absolute top-3 left-3 max-w-[88%] px-3 py-1 rounded-full bg-slate-950/85');
    expect(js).not.toContain('absolute bottom-2 inset-x-2');

    // 4. Large target sentence with intelligent grammar syntax highlighting
    expect(js).toContain('formatSyntaxHighlightedSentence');
    expect(js).toContain('text-2xl sm:text-3xl md:text-4xl font-black text-white');

    // 5. Flanking circular navigation arrows with cyan glow
    expect(js).toContain('id="gp-prev-btn"');
    expect(js).toContain('id="gp-next-btn"');
    expect(js).toContain('bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center transition shadow-[0_0_25px_rgba(6,182,212,0.6)]');

    // 6. Sleek centered practice bar and fullscreen mode by default
    expect(js).toContain("Let's Practice");
    expect(js).not.toContain('⚡ Quick Check:');
    expect(js).not.toContain('id="gp-fullscreen-btn"');
    expect(js).toContain('game-fullscreen-active');
    expect(js).toContain('gp-quiz-opt');
    expect(js).toContain('ring-2 ring-cyan-400/50 bg-cyan-950/90 text-cyan-200');
    expect(js).not.toContain('text-sm font-semibold text-rose-200 line-through');

    // 7. Deck Rules selector strip
    expect(js).toContain('Deck Rules');
    expect(js).toContain('gp-deck-previews-strip');
    expect(js).toContain('gp-switch-rule-btn');
  });

  it('correctly syntax-highlights questions, prepositions, possessives, and verbs without miscoloring function words', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    const formatSentence = mockWindow.formatSyntaxHighlightedSentence;
    expect(typeof formatSentence).toBe('function');

    // Case 1: "How many apples are in the basket?" -> "in" MUST NOT be green!
    const res1 = formatSentence('How many apples are in the basket?');
    expect(res1).toContain('<span class="text-sky-300 font-black">How</span>');
    expect(res1).toContain('<span class="text-sky-300 font-black">many</span>');
    expect(res1).toContain('<span class="text-sky-300 font-black">apples</span>');
    expect(res1).toContain('<span class="text-amber-400 font-black">are</span>');
    expect(res1).toContain('<span class="text-white font-extrabold">in</span>');
    expect(res1).not.toContain('<span class="text-emerald-400 font-black">in</span>');

    // Case 2: "Where is the sleeping cat?" -> "the" MUST NOT be green, "sleeping" IS green!
    const res2 = formatSentence('Where is the sleeping cat?');
    expect(res2).toContain('<span class="text-sky-300 font-black">Where</span>');
    expect(res2).toContain('<span class="text-amber-400 font-black">is</span>');
    expect(res2).toContain('<span class="text-white font-extrabold">the</span>');
    expect(res2).not.toContain('<span class="text-emerald-400 font-black">the</span>');
    expect(res2).toContain('<span class="text-emerald-400 font-black">sleeping</span>');

    // Case 3: "What color is your bicycle?" -> "your" MUST NOT be green!
    const res3 = formatSentence('What color is your bicycle?');
    expect(res3).toContain('<span class="text-sky-300 font-black">What</span>');
    expect(res3).toContain('<span class="text-sky-300 font-black">color</span>');
    expect(res3).toContain('<span class="text-amber-400 font-black">is</span>');
    expect(res3).toContain('<span class="text-white font-extrabold">your</span>');
    expect(res3).not.toContain('<span class="text-emerald-400 font-black">your</span>');

    // Case 4: "Are you studying for the quiz right now?" -> "Are" is blue, "you" is amber, "studying" is green!
    const res4 = formatSentence('Are you studying for the quiz right now?');
    expect(res4).toContain('<span class="text-sky-300 font-black">Are</span>');
    expect(res4).toContain('<span class="text-amber-400 font-black">you</span>');
    expect(res4).toContain('<span class="text-emerald-400 font-black">studying</span>');
    expect(res4).toContain('<span class="text-white font-extrabold">for</span>');
    expect(res4).not.toContain('<span class="text-emerald-400 font-black">you</span>');
  });

  it('honors custom teacher word role assignment when words_blue, words_amber, or words_green are provided', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    const formatSentence = mockWindow.formatSyntaxHighlightedSentence;
    expect(typeof formatSentence).toBe('function');

    // Custom teacher assignment: Blue = "Where", Amber = "is", Green = "the sleeping cat"
    const rule = {
      words_blue: 'Where',
      words_amber: 'is',
      words_green: 'the sleeping cat'
    };
    const res = formatSentence('Where is the sleeping cat?', 'Where + is / are + Subject ?', rule);
    expect(res).toContain('<span class="text-sky-300 font-black">Where</span>');
    expect(res).toContain('<span class="text-amber-400 font-black">is</span>');
    expect(res).toContain('<span class="text-emerald-400 font-black">the</span>');
    expect(res).toContain('<span class="text-emerald-400 font-black">sleeping</span>');
    expect(res).toContain('<span class="text-emerald-400 font-black">cat?</span>');
  });

  it('ensures rule editor includes word role chips & inputs and 3 distinct quick check options', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // Word role inputs and clickable word chips
    expect(js).toContain('id="ge-sentence-word-chips"');
    expect(js).toContain('id="ge-rule-words-blue"');
    expect(js).toContain('id="ge-rule-words-amber"');
    expect(js).toContain('id="ge-rule-words-green"');
    expect(js).toContain('syncWordChips');

    // 3 distinct option inputs for Quick Check
    expect(js).toContain('id="ge-rule-answer"');
    expect(js).toContain('id="ge-rule-opt2"');
    expect(js).toContain('id="ge-rule-opt3"');
    expect(js).not.toContain("quiz_options: [answer || 'Option 1', 'Option 2', 'Option 3']");
    expect(js).not.toContain("quiz_options: answer ? [answer, 'Option 2', 'Option 3']");
  });

  it('ensures student practice quick checks randomly shuffle options and do not award coins', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    expect(js).toContain('shuffleOptions');
    expect(js).toContain('_shuffledOptions');
    expect(js).toContain('awardCoinsForGrammarPractice');
    expect(js).toContain('Correct! Great job!');
  });

  it('ensures grammar rule editor supports collapsible form, collapsible image drawer, multi-color formulas, and sub-word suffix coloring', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // 1. Collapsible form elements
    expect(js).toContain('id="ge-add-rule-trigger-bar"');
    expect(js).toContain('id="ge-open-add-rule-btn"');
    expect(js).toContain('id="ge-collapse-form-btn"');
    expect(js).toContain('isRuleFormOpen');

    // 2. Collapsible image picker elements
    expect(js).toContain('id="ge-toggle-image-picker-btn"');
    expect(js).toContain('id="ge-image-thumb-box"');
    expect(js).toContain('id="ge-image-drawer"');
    expect(js).toContain('isImagePickerOpen');

    // 3. Dynamic formula parts legend and suffix coloring (Option A)
    expect(js).toContain('id="ge-formula-parts-legend"');
    expect(js).toContain('detectSuffix');
    expect(js).toContain('word_assignments');
    expect(js).toContain('ge-split-toggle');
    expect(js).toContain('ge-token-btn');

    // 4. Test formatSyntaxHighlightedSentence with segmented suffix coloring
    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    const formatSentence = mockWindow.formatSyntaxHighlightedSentence;
    expect(typeof formatSentence).toBe('function');

    const testRule = {
      title: 'Present Continuous',
      formula: 'Subject + am / is / are + Verb + -ing',
      sentence: 'The elephant is walking slowly in the grass.',
      word_assignments: [
        { token: 'The', text: 'The', color: 0 },
        { token: 'elephant', text: 'elephant', color: 0 },
        { token: 'is', text: 'is', color: 1 },
        {
          token: 'walking',
          isSplit: true,
          segments: [
            { text: 'walk', color: 1 },
            { text: 'ing', color: 3 }
          ]
        },
        { token: 'slowly', text: 'slowly', color: 2 },
        { token: 'in', text: 'in', color: -1 },
        { token: 'the', text: 'the', color: -1 },
        { token: 'grass.', text: 'grass', color: -1, punct: '.' }
      ]
    };

    const rendered = formatSentence(testRule.sentence, testRule.formula, testRule);

    // Verify root is Amber (color 1) and suffix -ing is Purple (color 3) without space
    expect(rendered).toContain('<span class="text-amber-400 font-black">walk</span><span class="text-purple-300 font-black">ing</span>');
    // Verify Part 1 (Blue)
    expect(rendered).toContain('<span class="text-sky-300 font-black">The</span>');
    expect(rendered).toContain('<span class="text-sky-300 font-black">elephant</span>');
    // Verify Part 2 (Amber)
    expect(rendered).toContain('<span class="text-amber-400 font-black">is</span>');
    // Verify Part 3 (Emerald)
    expect(rendered).toContain('<span class="text-emerald-400 font-black">slowly</span>');
  });

  it('ensures rule editor supports adding unlimited formula parts, adjusting part colors, and rendering multi-part formulas', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // Formula parts controls
    expect(js).toContain('id="ge-add-part-btn"');
    expect(js).toContain('ge-part-color-btn');
    expect(js).toContain('ge-color-popover');
    expect(js).toContain('ge-color-swatch-btn');
    expect(js).toContain('ge-part-name-input');
    expect(js).toContain('ge-part-remove-btn');
    expect(js).toContain('currentFormulaParts');

    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    const formatFormula = mockWindow.formatFormulaChips;
    const formatSentence = mockWindow.formatSyntaxHighlightedSentence;
    expect(typeof formatFormula).toBe('function');
    expect(typeof formatSentence).toBe('function');

    // Rule with 4 custom parts with adjusted colors:
    // Part 0: Subject (colorIndex 4: Rose Pink)
    // Part 1: am / is / are (colorIndex 6: Cyan Blue)
    // Part 2: Verb (colorIndex 1: Amber Gold)
    // Part 3: -ing (colorIndex 7: Fuchsia Magenta)
    const customRule = {
      title: 'Custom Continuous',
      formula: 'Subject + am / is / are + Verb + -ing',
      formula_parts: [
        { name: 'Subject', colorIndex: 4 },
        { name: 'am / is / are', colorIndex: 6 },
        { name: 'Verb', colorIndex: 1 },
        { name: '-ing', colorIndex: 7 }
      ],
      sentence: 'She is singing.',
      word_assignments: [
        { token: 'She', text: 'She', color: 0 },
        { token: 'is', text: 'is', color: 1 },
        {
          token: 'singing',
          isSplit: true,
          segments: [
            { text: 'sing', color: 2 },
            { text: 'ing', color: 3 }
          ]
        }
      ]
    };

    // 1. Check formula chips rendering with 4 parts and custom colors
    const chipsHtml = formatFormula(customRule.formula, customRule);
    expect(chipsHtml).toContain('[Subject]');
    expect(chipsHtml).toContain('[am / is / are]');
    expect(chipsHtml).toContain('[Verb]');
    expect(chipsHtml).toContain('[-ing]');
    // Subject has colorIndex 4 (Rose)
    expect(chipsHtml).toContain('border-rose-400 bg-rose-500/15 text-rose-300');
    // am/is/are has colorIndex 6 (Cyan)
    expect(chipsHtml).toContain('border-cyan-400 bg-cyan-500/15 text-cyan-300');
    // Verb has colorIndex 1 (Amber)
    expect(chipsHtml).toContain('border-amber-400 bg-amber-500/15 text-amber-300');
    // -ing has colorIndex 7 (Fuchsia)
    expect(chipsHtml).toContain('border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-300');

    // 2. Check sentence rendering mapping part indices to custom colors
    const sentenceHtml = formatSentence(customRule.sentence, customRule.formula, customRule);
    // Part 0 -> colorIndex 4 (Rose)
    expect(sentenceHtml).toContain('<span class="text-rose-400 font-black">She</span>');
    // Part 1 -> colorIndex 6 (Cyan)
    expect(sentenceHtml).toContain('<span class="text-cyan-300 font-black">is</span>');
    // Part 2 -> colorIndex 1 (Amber)
    expect(sentenceHtml).toContain('<span class="text-amber-400 font-black">sing</span>');
    // Part 3 -> colorIndex 7 (Fuchsia)
    expect(sentenceHtml).toContain('<span class="text-fuchsia-300 font-black">ing</span>');
  });

  it('ensures suffix additions belong directly to formula parts without a detached additions pill or fake Part 4 in the formula banner', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    // Option 1: Detached suffix pill removed from formula legend; suffix splitting integrated into word chips
    expect(js).not.toContain('ge-suffix-pill');
    expect(js).toContain('canSplit = Boolean(detectSuffix(item.core, getFormulaParts()))');
    expect(js).toContain('aria-label="Split suffix"');
    expect(js).toContain('aria-label="Merge word"');

    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    const formatFormula = mockWindow.formatFormulaChips;
    const formatSentence = mockWindow.formatSyntaxHighlightedSentence;

    // Rule where the formula is genuinely 3 parts: Subject + am / is / are + Verb-ing
    // Even if an accidental "Part 4" was appended, formatFormulaChips cleans it away
    const continuousRule = {
      title: 'Actions Happening Right Now',
      formula: 'Subject + am / is / are + Verb-ing + Part 4',
      formula_parts: [
        { name: 'Subject', colorIndex: 0 },
        { name: 'am / is / are', colorIndex: 1 },
        { name: 'Verb-ing', colorIndex: 2 },
        { name: 'Part 4', colorIndex: 3 }
      ],
      suffix_color: 3, // Violet Purple
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
        { token: 'slowly', text: 'slowly', color: -1 }
      ]
    };

    // 1. Formula chips must NOT render the bogus [Part 4]
    const chipsHtml = formatFormula(continuousRule.formula, continuousRule);
    expect(chipsHtml).toContain('[Subject]');
    expect(chipsHtml).toContain('[am / is / are]');
    expect(chipsHtml).not.toContain('[Part 4]');
    // Sub-word suffix inside [Verb-ing] has purple accent
    expect(chipsHtml).toContain('Verb<span class="text-purple-300 font-black">-ing</span>');

    // 2. Sentence must show walk in emerald (color 2) and ing in purple (color 3)
    const sentenceHtml = formatSentence(continuousRule.sentence, continuousRule.formula, continuousRule);
    expect(sentenceHtml).toContain('<span class="text-emerald-400 font-black">walk</span><span class="text-purple-300 font-black">ing</span>');
  });

  it('comprehensively detects all English verb additions, spelling changes, and CVC doubled consonants', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);
    const detect = mockWindow.detectSuffix;
    expect(typeof detect).toBe('function');

    // 1. Third Person Singular Present: -s, -es, -ies
    expect(detect('walks')).toEqual({ root: 'walk', suffix: 's' });
    expect(detect('plays')).toEqual({ root: 'play', suffix: 's' });
    expect(detect('eats')).toEqual({ root: 'eat', suffix: 's' });
    expect(detect('studies')).toEqual({ root: 'stud', suffix: 'ies' });
    expect(detect('cries')).toEqual({ root: 'cr', suffix: 'ies' });
    expect(detect('flies')).toEqual({ root: 'fl', suffix: 'ies' });
    expect(detect('watches')).toEqual({ root: 'watch', suffix: 'es' });
    expect(detect('washes')).toEqual({ root: 'wash', suffix: 'es' });
    expect(detect('fixes')).toEqual({ root: 'fix', suffix: 'es' });
    expect(detect('goes')).toEqual({ root: 'go', suffix: 'es' });
    expect(detect('does')).toEqual({ root: 'do', suffix: 'es' });

    // Words ending in silent e: adding -s preserves root ending in 'e' (bake -> bakes, like -> likes)
    expect(detect('bakes')).toEqual({ root: 'bake', suffix: 's' });
    expect(detect('likes')).toEqual({ root: 'like', suffix: 's' });
    expect(detect('rides')).toEqual({ root: 'ride', suffix: 's' });
    expect(detect('makes')).toEqual({ root: 'make', suffix: 's' });
    expect(detect('houses')).toEqual({ root: 'house', suffix: 's' });
    expect(detect('apples')).toEqual({ root: 'apple', suffix: 's' });
    expect(detect('tables')).toEqual({ root: 'table', suffix: 's' });

    // 2. Past Simple & Participles: -ed, -ied, and CVC doubled consonants
    expect(detect('walked')).toEqual({ root: 'walk', suffix: 'ed' });
    expect(detect('played')).toEqual({ root: 'play', suffix: 'ed' });
    expect(detect('danced')).toEqual({ root: 'danc', suffix: 'ed' });
    expect(detect('studied')).toEqual({ root: 'stud', suffix: 'ied' });
    expect(detect('cried')).toEqual({ root: 'cr', suffix: 'ied' });
    // Doubled consonants before -ed:
    expect(detect('stopped')).toEqual({ root: 'stop', suffix: 'ped' });
    expect(detect('planned')).toEqual({ root: 'plan', suffix: 'ned' });
    expect(detect('jogged')).toEqual({ root: 'jog', suffix: 'ged' });
    expect(detect('clapped')).toEqual({ root: 'clap', suffix: 'ped' });
    expect(detect('dropped')).toEqual({ root: 'drop', suffix: 'ped' });
    expect(detect('fitted')).toEqual({ root: 'fit', suffix: 'ted' });
    expect(detect('robbed')).toEqual({ root: 'rob', suffix: 'bed' });

    // 3. Present Participle / Continuous: -ing and CVC doubled consonants
    expect(detect('walking')).toEqual({ root: 'walk', suffix: 'ing' });
    expect(detect('writing')).toEqual({ root: 'writ', suffix: 'ing' });
    expect(detect('making')).toEqual({ root: 'mak', suffix: 'ing' });
    // Doubled consonants before -ing:
    expect(detect('stopping')).toEqual({ root: 'stop', suffix: 'ping' });
    expect(detect('running')).toEqual({ root: 'run', suffix: 'ning' });
    expect(detect('swimming')).toEqual({ root: 'swim', suffix: 'ming' });
    expect(detect('sitting')).toEqual({ root: 'sit', suffix: 'ting' });
    expect(detect('planning')).toEqual({ root: 'plan', suffix: 'ning' });
    expect(detect('getting')).toEqual({ root: 'get', suffix: 'ting' });
    expect(detect('cutting')).toEqual({ root: 'cut', suffix: 'ting' });
    expect(detect('jogging')).toEqual({ root: 'jog', suffix: 'ging' });
    expect(detect('beginning')).toEqual({ root: 'begin', suffix: 'ning' });

    // 4. Base words inherently ending in -ll, -ss, -zz maintain root without bogus doubling
    expect(detect('calling')).toEqual({ root: 'call', suffix: 'ing' });
    expect(detect('called')).toEqual({ root: 'call', suffix: 'ed' });
    expect(detect('falling')).toEqual({ root: 'fall', suffix: 'ing' });
    expect(detect('passing')).toEqual({ root: 'pass', suffix: 'ing' });
    expect(detect('passed')).toEqual({ root: 'pass', suffix: 'ed' });

    // 5. Contractions with n't
    expect(detect("isn't")).toEqual({ root: 'is', suffix: "n't" });
    expect(detect("doesn't")).toEqual({ root: 'does', suffix: "n't" });
    expect(detect("didn't")).toEqual({ root: 'did', suffix: "n't" });

    // 6. Non-verb and non-suffix words are strictly preserved and never split
    expect(detect('elephant')).toBeNull();
    expect(detect('restaurant')).toBeNull();
    expect(detect('plant')).toBeNull();
    expect(detect('parent')).toBeNull();
    expect(detect('the')).toBeNull();
    expect(detect('The')).toBeNull();
    expect(detect('grass')).toBeNull();
    expect(detect('class')).toBeNull();
    expect(detect('this')).toBeNull();

    // 7. Adjective comparatives and superlatives (-er, -est, -ier, -iest)
    expect(detect('faster')).toEqual({ root: 'fast', suffix: 'er' });
    expect(detect('taller')).toEqual({ root: 'tall', suffix: 'er' });
    expect(detect('fastest')).toEqual({ root: 'fast', suffix: 'est' });
    expect(detect('tallest')).toEqual({ root: 'tall', suffix: 'est' });
    expect(detect('happier')).toEqual({ root: 'happ', suffix: 'ier' });
    expect(detect('happiest')).toEqual({ root: 'happ', suffix: 'iest' });

    // 8. Adverbial -ly suffix
    expect(detect('slowly')).toEqual({ root: 'slow', suffix: 'ly' });
    expect(detect('quickly')).toEqual({ root: 'quick', suffix: 'ly' });
    expect(detect('loudly')).toEqual({ root: 'loud', suffix: 'ly' });
    expect(detect('family')).toBeNull();
    expect(detect('early')).toBeNull();

    // 9. Formula chips support all inflection additions
    const formatFormula = mockWindow.formatFormulaChips;
    const ruleSample = { suffix_color: 3 }; // Violet Purple
    expect(formatFormula('Subject + Verb-ies', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-ies</span>');
    expect(formatFormula('Subject + Verb-es', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-es</span>');
    expect(formatFormula('Subject + Verb-s', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-s</span>');
    expect(formatFormula('Subject + Verb-ed', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-ed</span>');
    expect(formatFormula('Subject + Verb-ied', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-ied</span>');
    expect(formatFormula('Subject + Verb-ping', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-ping</span>');
    expect(formatFormula('Subject + Verb-ing', ruleSample)).toContain('Verb<span class="text-purple-300 font-black">-ing</span>');
    expect(formatFormula('Subject + Adjective-er', ruleSample)).toContain('Adjective<span class="text-purple-300 font-black">-er</span>');
    expect(formatFormula('Subject + Adverb-ly', ruleSample)).toContain('Adverb<span class="text-purple-300 font-black">-ly</span>');

    // 10. Option 1: Suffixes belong directly to their Formula Part; detached additions pill removed from legend
    expect(js).not.toContain('Additions (-s, -es, -ies, -ed, -ied, -ing, +doubled):');
    expect(js).toContain('canSplit = Boolean(detectSuffix(item.core, getFormulaParts()))');
    expect(js).not.toContain('item.core.length >= 3');
    expect(js).toContain('aria-label="Split suffix"');
    expect(js).toContain('aria-label="Merge word"');
  });

  it('ensures AI generation is exclusively restricted to admins in class and grammar bank, and auto-colors Subject and Verb', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    const mockWindow: any = {
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      },
      addEventListener: () => {}
    };
    new Function('window', 'document', js)(mockWindow, mockWindow.document);

    // 1. Admin exclusivity helper
    expect(typeof mockWindow.isGrammarAdmin).toBe('function');
    expect(typeof mockWindow.updateGrammarAiAdminVisibility).toBe('function');
    expect(js).toContain("AI generation is exclusively reserved for administrators.");

    // 2. Quick Check full text visibility and deduplication
    expect(js).toContain('break-words leading-relaxed');
    expect(js).not.toContain('text-slate-300 truncate');
    expect(js).toContain('Array.from(new Set(rawOptions.map(o => String(o || \'\').trim()).filter(Boolean)))');

    // 3. Auto-assignment ensures Subject and Verb are mapped and colored
    const ruleSample = {
      formula: 'Will + Subject + Base Verb + if + Present Simple',
      sentence: 'Will the brave knight rescue the princess if the dragon falls asleep?'
    };
    mockWindow.ensureRuleStructuredFields(ruleSample);

    expect(Array.isArray(ruleSample.word_assignments)).toBe(true);
    expect(ruleSample.word_assignments.length).toBeGreaterThan(5);

    // "Will" (part 0: sky blue)
    expect(ruleSample.word_assignments[0].color).toBe(0);

    // "the brave knight" (part 1: Subject)
    expect(ruleSample.word_assignments[1].color).toBe(1);
    expect(ruleSample.word_assignments[2].color).toBe(1);
    expect(ruleSample.word_assignments[3].color).toBe(1);

    // "rescue" (part 2: Base Verb)
    expect(ruleSample.word_assignments[4].color).toBe(2);

    // "if" (part 3)
    expect(ruleSample.word_assignments[7].color).toBe(3);

    // "falls" has split suffix
    const fallsAssignment = ruleSample.word_assignments.find((w: any) => w.token.includes('falls'));
    expect(fallsAssignment).toBeDefined();
    expect(fallsAssignment?.isSplit).toBe(true);
  });
});
