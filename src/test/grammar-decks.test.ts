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

    // Parse simple DOM check
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

  it('ensures components.css styles grammar deck buttons and containers', () => {
    const css = fs.readFileSync(componentsCssPath, 'utf-8');
    expect(css).toContain('#class-subtab-grammar');
    expect(css).toContain('#create-grammar-deck-btn');
    expect(css).toContain('#teacher-grammar-open-create');
    expect(css).toContain('#teacher-grammar-mode-mine');
    expect(css).toContain('#teacher-grammar-mode-school');
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

  it('ensures AI grammar deck generator produces real pedagogical rules and does not use mock placeholders', () => {
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

    // API route handles grammar mode with Gemini and stock media sentence search
    expect(apiRoute).toContain('input?.mode === "grammar"');
    expect(apiRoute).toContain('Grammar Pattern Deck');
    expect(apiRoute).toContain('callGemini');
    expect(apiRoute).toContain('searchStockMedia');
    expect(apiRoute).toContain('extractKeywordsFromSentence');
    expect(js).toContain('Simple Future (will + Base Verb)');
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

    // 1. Amber gold glowing card border
    expect(js).toContain('border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.22)]');

    // 2. Multi-color centered formula chips
    expect(js).toContain('formatFormulaChips');
    expect(js).toContain('border-sky-400 bg-sky-500/15 text-sky-300');
    expect(js).toContain('border-amber-400 bg-amber-500/15 text-amber-300');
    expect(js).toContain('border-emerald-400 bg-emerald-500/15 text-emerald-300');

    // 3. Floating context clue badge without obscuring bottom banner
    expect(js).toContain('absolute top-3 left-3 max-w-[88%] px-3 py-1 rounded-full bg-slate-950/85');
    expect(js).not.toContain('absolute bottom-2 inset-x-2');

    // 4. Large target sentence with intelligent grammar syntax highlighting
    expect(js).toContain('formatSyntaxHighlightedSentence');
    expect(js).toContain('text-2xl sm:text-3xl md:text-4xl font-black text-white');

    // 5. Flanking circular navigation arrows with cyan glow
    expect(js).toContain('id="gp-prev-btn"');
    expect(js).toContain('id="gp-next-btn"');
    expect(js).toContain('bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center transition shadow-[0_0_25px_rgba(6,182,212,0.6)]');

    // 6. Sleek inline quick check bar
    expect(js).toContain('⚡ Quick Check:');
    expect(js).toContain('gp-quiz-opt');
    expect(js).toContain('ring-2 ring-cyan-400/50 bg-cyan-950/90 text-cyan-200');

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

  it('ensures student practice awards coins for correct quick check answers', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    expect(js).toContain('awardCoinsForGrammarPractice');
    expect(js).toContain('rewardedRuleIndices');
    expect(js).toContain('persistCanonicalStudentPatch');
    expect(js).toContain('updateVisibleStudentCoinLabels');
  });
});
