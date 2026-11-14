/**
 * Grammar blueprint engine.
 *
 * Turns a free-text grammar topic ("past continues", "presnt simpl", ...) into a
 * concrete, ordered list of grammar slots: one slot per rule the deck must contain.
 * The AI model is then only asked to invent *examples* for those slots, and every
 * sentence it returns is checked against the slot before it can reach the deck.
 *
 * This keeps decks on-topic (no past-simple rules inside a Past Continuous deck)
 * and makes the rule count a consequence of the grammar, not a guess.
 */

export type GrammarSlot = {
  key: string;
  title: string;
  formula: string;
  hint: string;
  must?: RegExp[];
  forbid?: RegExp[];
  answerFormula?: string;
};

export type GrammarPlan = {
  family: string;
  displayName: string;
  slots: GrammarSlot[];
  count: number;
  signals: string[];
};

/* ------------------------------------------------------------------ */
/* Typo-tolerant token normalisation                                    */
/* ------------------------------------------------------------------ */

const TYPO_ALIASES: Record<string, string> = {
  continues: 'continuous',
  continue: 'continuous',
  continued: 'continuous',
  continuing: 'continuous',
  continous: 'continuous',
  contineous: 'continuous',
  continuos: 'continuous',
  progresive: 'progressive',
  progessive: 'progressive',
  progressiv: 'progressive',
  presnt: 'present',
  preent: 'present',
  persent: 'present',
  pressent: 'present',
  simle: 'simple',
  smple: 'simple',
  simpel: 'simple',
  smiple: 'simple',
  futor: 'future',
  futre: 'future',
  futur: 'future',
  furture: 'future',
  pat: 'past',
  pas: 'past',
  comperative: 'comparative',
  comparitive: 'comparative',
  comparativ: 'comparative',
  compactive: 'comparative',
  superlativ: 'superlative',
  superlitive: 'superlative',
  superative: 'superlative',
  modle: 'modal',
  modals: 'modal',
  artical: 'article',
  artifle: 'article',
  prepositon: 'preposition',
  preposion: 'preposition',
  posessive: 'possessive',
  possessiv: 'possessive',
  pluals: 'plural',
  plurl: 'plural',
  questins: 'question',
  queston: 'question',
  negativ: 'negative',
  affirmativ: 'affirmative',
  perfet: 'perfect',
  prefect: 'perfect',
};

const KEYWORDS = [
  'past', 'present', 'future', 'simple', 'continuous', 'progressive', 'perfect',
  'question', 'negative', 'affirmative', 'comparative', 'superlative', 'modal',
  'article', 'determiner', 'preposition', 'place', 'possessive', 'plural', 'singular',
  'countable', 'uncountable', 'quantifier', 'there', 'adjective', 'order',
  'what', 'where', 'when', 'why', 'who', 'which', 'how', 'many', 'much',
  'will', 'going', 'can', 'could', 'should', 'must', 'may', 'might', 'shall',
  'do', 'does', 'did', 'have', 'has', 'had', 'is', 'are', 'am', 'was', 'were', 'be', 'ing',
];

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      curr[j] = Math.min(del, ins, sub);
    }
    const swap = prev;
    prev = curr;
    curr = swap;
  }
  return prev[b.length] ?? 0;
}

/** Map one raw word onto a known grammar keyword, tolerating small typos. */
function canonicalToken(raw: string): string {
  const word = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return '';
  const alias = TYPO_ALIASES[word];
  if (alias) return alias;
  if (KEYWORDS.includes(word)) return word;
  if (word.length < 4) return word;
  for (const kw of KEYWORDS) {
    if (kw.length < 4) continue;
    const distance = levenshtein(word, kw);
    const tolerance = kw.length >= 8 ? 2 : 1;
    if (distance <= tolerance) return kw;
    if (word.startsWith(kw.slice(0, 4)) && Math.abs(word.length - kw.length) <= 2) return kw;
  }
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(canonicalToken)
    .filter(Boolean);
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length <= 3 && ['and', 'or', 'of', 'in', 'to', 'the', 'a', 'an'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/* ------------------------------------------------------------------ */
/* Slot helpers                                                         */
/* ------------------------------------------------------------------ */

const ING = /\b[a-z]{3,}ing\b/i;
const PAST_ED = /\b[a-z]{3,}ed\b/i;
const IRREGULAR_PAST = /\b(went|saw|ate|made|took|gave|wrote|ran|bought|found|said|came|had|did|drank|sang|swam|flew|rode|met|thought|taught|caught|built|broke|chose|drove|felt|got|heard|held|kept|knew|left|lost|paid|read|slept|spoke|spent|stood|told|won|wore)\b/i;
const FREQUENCY = /\b(always|usually|often|sometimes|never|every day|every morning|each week|on Mondays|rarely|seldom)\b/i;
const TIME_PAST = /\b(yesterday|last night|last week|last year|last month|two days ago|this morning|earlier today)\b/i;
const TIME_FUTURE = /\b(tomorrow|next week|next year|soon|tonight|later|in two days)\b/i;
const WH_WORD = /\b(what|where|when|why|who|which|how)\b/i;

function slot(key: string, title: string, formula: string, hint: string, must: RegExp[] = [], forbid: RegExp[] = [], answerFormula?: string): GrammarSlot {
  return { key, title, formula, hint, must, forbid, ...(answerFormula ? { answerFormula } : {}) };
}

function tenseAspectBlueprint(family: string, displayName: string): GrammarSlot[] {
  switch (family) {
    case 'past_continuous':
      return [
        slot('affirmative', 'Affirmative Statement', 'Subject + was / were + Verb-ing', 'A finished action that was in progress at a past moment.', [/\b(was|were)\b/i, ING]),
        slot('negative', 'Negative Statement', "Subject + was not / were not (wasn't / weren't) + Verb-ing", 'Say what was NOT happening.', [/\b(was not|were not|wasn't|weren't)\b/i, ING], [/\bdid not\b/i, /\bdon't\b/i]),
        slot('question', 'Yes / No Question', 'Was / Were + Subject + Verb-ing ?', 'Invert was/were and the subject to ask.', [/\?\s*$/, /\b(was|were)\b/i, ING], [/\bdid\b/i], "Yes, + Subject + was / were . / No, + Subject + wasn't / weren't ."),
        slot('wh_question', 'Wh- Question', 'Wh-word + was / were + Subject + Verb-ing ?', 'Ask for details about a past ongoing action.', [/\?\s*$/, WH_WORD, /\b(was|were)\b/i, ING], [], "Subject + was / were + Verb-ing + Place / Time"),
        slot('contrast', 'While / When Contrast', 'While + Subject + was / were + Verb-ing, + Subject + Verb-ed', 'A long action interrupted by a short one.', [/\b(while|when)\b/i, /\b(was|were)\b/i, ING, PAST_ED]),
      ];
    case 'present_continuous':
      return [
        slot('affirmative', 'Affirmative Statement', 'Subject + am / is / are + Verb-ing', 'An action happening right now.', [/\b(am|is|are)\b/i, ING]),
        slot('negative', 'Negative Statement', 'Subject + am / is / are + not + Verb-ing', 'Say what is NOT happening now.', [/\b(am|is|are)\b/i, /\bnot\b/i, ING], [/\bdon't\b/i, /\bdoesn't\b/i]),
        slot('question', 'Yes / No Question', 'Am / Is / Are + Subject + Verb-ing ?', 'Invert the be-verb and the subject.', [/\?\s*$/, /\b(am|is|are)\b/i, ING], [/\bdo\b/i, /\bdoes\b/i], "Yes, + Subject + am / is / are . / No, + Subject + isn't / aren't ."),
        slot('wh_question', 'Wh- Question', 'Wh-word + am / is / are + Subject + Verb-ing ?', 'Ask for details about a current action.', [/\?\s*$/, WH_WORD, /\b(am|is|are)\b/i, ING], [], "Subject + am / is / are + Verb-ing + Object / Place"),
        slot('now_marker', 'Now Markers', 'Subject + am / is / are + Verb-ing + right now / at the moment', 'Signal words that prove the action is happening now.', [/\b(now|right now|at the moment|today|currently)\b/i, ING]),
      ];
    case 'past_simple':
      return [
        slot('regular', 'Regular Past Verbs (-ed)', 'Subject + Verb-ed', 'Add -ed to regular verbs for finished actions.', [PAST_ED], [/\b(is|are|am)\b/i]),
        slot('irregular', 'Irregular Past Verbs', 'Subject + irregular past verb', 'Irregular verbs change completely.', [IRREGULAR_PAST], [/\b(is|are|am)\b/i, /\bwill\b/i]),
        slot('negative', 'Negative Past (did not)', "Subject + did not (didn't) + Base Verb", 'Use did not + base verb, never the past form.', [/\b(did not|didn't)\b/i], [PAST_ED]),
        slot('question', 'Past Questions (Did ... ?)', 'Did + Subject + Base Verb ?', 'Start with Did and keep the verb in base form.', [/^did\b/i, /\?\s*$/], [PAST_ED], "Yes, + Subject + did . / No, + Subject + didn't ."),
        slot('time_marker', 'Past Time Expressions', 'Subject + Verb-ed + past time phrase', 'Time words that anchor the action in the past.', [TIME_PAST, PAST_ED]),
      ];
    case 'present_simple':
      return [
        slot('base', 'Facts & Habits (Base Verb)', 'Subject + Base Verb', 'Habits, routines and true facts.', [], [/\b(am|is|are)\b/i, ING, /\b(do|does|did)\b/i]),
        slot('third_person', 'Third Person -s / -es', 'He / She / It + Verb-s / -es', 'Add -s or -es for he, she and it.', [/\b[a-z]{3,}(s|es)\b/i], [/\b(am|is|are)\b/i, ING, /\b(do|does|did)\b/i]),
        slot('negative', 'Negative (do not / does not)', "Subject + do not (don't) / does not (doesn't) + Base Verb", 'Use do/does + not before the base verb.', [/\b(do not|does not|don't|doesn't)\b/i], [ING]),
        slot('question', 'Questions (Do / Does ... ?)', 'Do / Does + Subject + Base Verb ?', 'Start with Do or Does and keep the base verb.', [/^do(es)?\b/i, /\?\s*$/], [ING], "Yes, + Subject + do / does . / No, + Subject + don't / doesn't ."),
        slot('adverb', 'Frequency Adverbs', 'Subject + always / usually / often + Verb(-s)', 'Adverbs of frequency sit before the main verb.', [FREQUENCY], [ING]),
      ];
    case 'present_perfect':
      return [
        slot('affirmative', 'Affirmative (have / has + Past Participle)', 'Subject + have / has + Past Participle', 'A past action with a present result.', [/\b(have|has)\b/i, /\b[a-z]+(ed|en|wn|ne|rn)\b/i], [/\bwill\b/i]),
        slot('negative', 'Negative (have not / has not)', "Subject + have not / has not (haven't / hasn't) + Past Participle", 'Say what has not happened yet.', [/\b(have not|has not|haven't|hasn't)\b/i]),
        slot('question', 'Question (Have / Has ... ?)', 'Have / Has + Subject + Past Participle ?', 'Invert have/has and the subject.', [/^(have|has)\b/i, /\?\s*$/], [], "Yes, + Subject + have / has . / No, + Subject + haven't / hasn't ."),
        slot('markers', 'Ever / Never / Just / Already / Yet', 'Subject + have / has + ever / never / just / already / yet + Past Participle', 'Signal words that belong with the present perfect.', [/\b(ever|never|just|already|yet)\b/i, /\b(have|has)\b/i]),
      ];
    case 'future_will':
      return [
        slot('affirmative', 'Affirmative (will + Base Verb)', 'Subject + will + Base Verb', 'Predictions, promises and quick decisions.', [/\bwill\b/i], [/\bwon't\b/i]),
        slot('negative', 'Negative (will not / won\'t)', "Subject + will not (won't) + Base Verb", 'Say what will not happen.', [/\b(will not|won't)\b/i]),
        slot('question', 'Question (Will ... ?)', 'Will + Subject + Base Verb ?', 'Invert will and the subject.', [/^will\b/i, /\?\s*$/], [], "Yes, + Subject + will . / No, + Subject + won't ."),
        slot('time_marker', 'Future Time Expressions', 'Subject + will + Base Verb + future time phrase', 'Time words that point to the future.', [TIME_FUTURE, /\bwill\b/i]),
      ];
    case 'future_going_to':
      return [
        slot('affirmative', 'Affirmative (going to + Base Verb)', 'Subject + am / is / are + going to + Base Verb', 'Plans and intentions already decided.', [/\bgoing to\b/i]),
        slot('negative', 'Negative (not going to)', 'Subject + am / is / are + not + going to + Base Verb', 'Say what is not planned.', [/\bnot\b/i, /\bgoing to\b/i]),
        slot('question', 'Question (Are you going to ... ?)', 'Am / Is / Are + Subject + going to + Base Verb ?', 'Invert the be-verb and the subject.', [/^\s*(am|is|are)\b/i, /\?\s*$/, /\bgoing to\b/i], [], "Yes, + Subject + am / is / are . / No, + Subject + isn't / aren't ."),
        slot('time_marker', 'Future Plans with Time Words', 'Subject + am / is / are + going to + Base Verb + future time phrase', 'Anchor the plan in future time.', [TIME_FUTURE, /\bgoing to\b/i]),
      ];
    case 'future_mixed':
      return [
        slot('will', 'Will + Base Verb (Predictions)', 'Subject + will + Base Verb', 'Predictions and promises.', [/\bwill\b/i]),
        slot('going_to', 'Going to + Base Verb (Plans)', 'Subject + am / is / are + going to + Base Verb', 'Plans decided before speaking.', [/\bgoing to\b/i]),
        slot('negative', 'Negative Future', "Subject + will not (won't) / is not going to + Base Verb", 'Both negative forms.', [/\b(won't|will not|not going to)\b/i]),
        slot('question', 'Future Questions', 'Will / Are + Subject + Base Verb ?', 'Ask about the future.', [/\?\s*$/], [], "Yes, + Subject + will / is / are . / No, + Subject + won't / isn't / aren't ."),
      ];
    case 'past_perfect':
      return [
        slot('affirmative', 'Affirmative (had + Past Participle)', 'Subject + had + Past Participle', 'An action finished before another past action.', [/\bhad\b/i]),
        slot('negative', 'Negative (had not)', "Subject + had not (hadn't) + Past Participle", 'Say what had not happened yet.', [/\b(had not|hadn't)\b/i]),
        slot('question', 'Question (Had ... ?)', 'Had + Subject + Past Participle ?', 'Invert had and the subject.', [/^had\b/i, /\?\s*$/], [], "Yes, + Subject + had . / No, + Subject + hadn't ."),
      ];
    default:
      return [
        slot('affirmative', 'Affirmative Pattern', `Subject + ${displayName}`, 'The core positive pattern.', []),
        slot('negative', 'Negative Pattern', `Subject + not + ${displayName}`, 'The negative pattern.', []),
        slot('question', 'Question Pattern', `${displayName} + Subject ?`, 'The question pattern.', []),
      ];
  }
}

function whBlueprint(words: string[]): GrammarSlot[] {
  const unique = Array.from(new Set(words));
  const picks = unique.length ? unique : ['what', 'where', 'when', 'who'];
  return picks.slice(0, 5).map((word) => {
    const formula =
      word === 'who'
        ? 'Who + is / are + Subject ?'
        : word === 'how many'
          ? 'How many + plural noun + are there ?'
          : `${titleCase(word)} + is / are / do / does + Subject + ... ?`;
    const answerFormula =
      word === 'who'
        ? 'Subject + is / are + Person / Name'
        : word === 'how many'
          ? 'There are + Number + Plural Noun'
          : word === 'where'
            ? 'Subject + is / are + in / at / on + Place'
            : word === 'when'
              ? 'Subject + Verb + at / on / in + Time'
              : 'Subject + Verb + Answer Details';
    return slot(
      `wh_${word.replace(/\s+/g, '_')}`,
      `Asking with "${titleCase(word)}"`,
      formula,
      `One question about ${word} only.`,
      [new RegExp(`\\b${word.split(' ')[0]}\\b`, 'i'), /\?\s*$/],
      [],
      answerFormula,
    );
  });
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export function buildGrammarPlan(topic: string, search = ''): GrammarPlan {
  const tokens = tokenize(`${topic} ${search}`);
  const has = (word: string) => tokens.includes(word);
  const topicTokens = tokenize(topic);
  const hasTopic = (word: string) => topicTokens.includes(word);
  const signals: string[] = [];

  const tense = has('past') ? 'past' : has('future') ? 'future' : has('present') ? 'present' : '';
  const isPerfect = has('perfect');
  const isContinuous = has('continuous') || has('progressive') || has('ing');
  const isSimple = has('simple');
  const wantsQuestion = has('question') || has('questions');
  const whWords = ['what', 'where', 'when', 'why', 'who', 'which', 'how'].filter((w) => has(w));

  if (tense) signals.push(`tense:${tense}`);
  if (isContinuous) signals.push('aspect:continuous');
  if (isPerfect) signals.push('aspect:perfect');
  if (isSimple) signals.push('aspect:simple');
  if (whWords.length) signals.push(`wh:${whWords.join(',')}`);

  const finalize = (family: string, displayName: string, slots: GrammarSlot[]): GrammarPlan => {
    const cleaned = slots.filter((s) => s.title && s.formula);
    return { family, displayName, slots: cleaned, count: cleaned.length, signals };
  };

  // Wh- questions own the deck when there is no tense/aspect signal.
  if (whWords.length && !tense && !isContinuous && !isPerfect && !has('comparative') && !has('superlative')) {
    const extra = wantsQuestion ? [] : [];
    const slots = whBlueprint([...whWords, ...extra]);
    return finalize('wh_questions', slots.length > 1 ? 'Wh- Questions' : `${titleCase(whWords[0] ?? 'What')} Questions`, slots);
  }

  const irregularOnly = hasTopic('irregular');

  if (tense === 'past' && isPerfect) {
    return finalize('past_perfect', 'Past Perfect', tenseAspectBlueprint('past_perfect', 'Past Perfect'));
  }

  if (tense === 'past' && isContinuous) {
    return finalize('past_continuous', 'Past Continuous', tenseAspectBlueprint('past_continuous', 'Past Continuous'));
  }

  if (tense === 'present' && (isPerfect || has('has') || has('have'))) {
    return finalize('present_perfect', 'Present Perfect', tenseAspectBlueprint('present_perfect', 'Present Perfect'));
  }

  if (tense === 'present' && isContinuous) {
    return finalize('present_continuous', 'Present Continuous', tenseAspectBlueprint('present_continuous', 'Present Continuous'));
  }

  if (tense === 'past' || (irregularOnly && !tense)) {
    const pastSlots = tenseAspectBlueprint('past_simple', 'Past Simple');
    return finalize(
      'past_simple',
      irregularOnly ? 'Past Simple: Irregular Verbs' : 'Past Simple',
      irregularOnly ? pastSlots.filter((s) => s.key !== 'regular') : pastSlots,
    );
  }

  if (tense === 'present') {
    return finalize('present_simple', 'Present Simple', tenseAspectBlueprint('present_simple', 'Present Simple'));
  }

  if (tense === 'future') {
    const goingTo = has('going');
    const will = has('will');
    if (goingTo && will) return finalize('future_mixed', 'Future: Will & Going To', tenseAspectBlueprint('future_mixed', 'Future: Will & Going To'));
    if (goingTo) return finalize('future_going_to', 'Future: Going To', tenseAspectBlueprint('future_going_to', 'Future: Going To'));
    return finalize('future_will', 'Future: Will', tenseAspectBlueprint('future_will', 'Future: Will'));
  }

  if (has('superlative')) {
    return finalize('superlative', 'Superlative Adjectives', [
      slot('est', 'Short Adjectives (-est)', 'Subject + Verb + the + Adjective-est + in / of + group', 'The -est form for short adjectives.', [/\bthe\b/i, /\best\b/i]),
      slot('most', 'Long Adjectives (the most)', 'Subject + Verb + the most + Adjective + in / of + group', 'Use the most for long adjectives.', [/\bthe most\b/i]),
      slot('irregular', 'Irregular Superlatives', 'Subject + Verb + the best / the worst', 'Irregular forms change completely.', [/\bthe (best|worst|farthest|furthest|most)\b/i]),
    ]);
  }

  if (has('comparative')) {
    return finalize('comparative', 'Comparative Adjectives', [
      slot('er', 'Short Adjectives (-er than)', 'Subject + Verb + Adjective-er + than + Noun', 'Add -er than for short adjectives.', [/\bthan\b/i, /\b[a-z]{3,}er\b/i], [/\bthe\b/i]),
      slot('more', 'Long Adjectives (more ... than)', 'Subject + Verb + more + Adjective + than + Noun', 'Use more for long adjectives.', [/\bmore\b/i, /\bthan\b/i]),
      slot('irregular', 'Irregular Comparatives', 'Subject + Verb + better / worse + than + Noun', 'Irregular forms change completely.', [/\b(better|worse|farther|further)\b/i, /\bthan\b/i]),
      slot('as_as', 'Equality (as ... as)', 'Subject + Verb + as + Adjective + as + Noun', 'Compare two equal things.', [/\bas\b.*\bas\b/i]),
    ]);
  }

  const modalWords = ['can', 'could', 'should', 'must', 'may', 'might', 'shall'].filter((m) => has(m));
  if (has('modal') || modalWords.length) {
    const modal = modalWords[0] ?? 'can';
    return finalize('modals', `Modal Verb: ${titleCase(modal)}`, [
      slot('affirmative', `Affirmative (${modal} + Base Verb)`, `Subject + ${modal} + Base Verb`, `Ability, permission or obligation with "${modal}".`, [new RegExp(`\\b${modal}\\b`, 'i')]),
      slot('negative', `Negative (${modal === 'can' ? "cannot" : `${modal} not`})`, `Subject + ${modal === 'can' ? "cannot (can't)" : `${modal} not`} + Base Verb`, 'Say what is not allowed or not possible.', [/\bnot\b|cannot|can't|mustn't|shouldn't/i]),
      slot('question', `Question (${titleCase(modal)} ... ?)`, `${titleCase(modal)} + Subject + Base Verb ?`, 'Ask a question with the modal.', [new RegExp(`^\\s*${modal}`, 'i'), /\?\s*$/], [], `Yes, + Subject + ${modal} . / No, + Subject + ${modal === 'can' ? "can't" : modal + ' not'} .`),
    ]);
  }

  if (hasTopic('article') || hasTopic('determiner')) {
    return finalize('articles', 'Articles: a / an / the', [
      slot('a', 'a before a consonant sound', 'a + singular noun (consonant sound)', 'Use "a" before consonant sounds.', [/\ba\s+[bcdfghjklmnpqrstvwxyz]/i]),
      slot('an', 'an before a vowel sound', 'an + singular noun (vowel sound)', 'Use "an" before vowel sounds.', [/\ban\s+[aeiou]/i]),
      slot('the', 'the for something specific', 'the + noun (already known / unique)', 'Use "the" when both people know which one.', [/\bthe\b/i]),
      slot('zero', 'No article for general plurals', 'no article + plural noun (in general)', 'No article for general statements.', [], []),
    ]);
  }

  if (hasTopic('preposition')) {
    return finalize('prepositions', 'Prepositions of Place', [
      slot('in', 'in (inside something)', 'Subject + is + in + noun', 'Inside a space.', [/\bin\b/i]),
      slot('on', 'on (on a surface)', 'Subject + is + on + noun', 'On top of a surface.', [/\bon\b/i]),
      slot('under', 'under / behind / next to', 'Subject + is + under / behind / next to + noun', 'Position relative to another thing.', [/\b(under|behind|next to|beside|between)\b/i]),
      slot('question', 'Where questions', 'Where + is + Subject ?', 'Ask about location.', [/^\s*where\b/i, /\?\s*$/], [], 'Subject + is + in / on / under + Place'),
    ]);
  }

  if (hasTopic('possessive')) {
    return finalize('possessives', 'Possessive Forms', [
      slot('s', "Singular 's", "Noun + 's + object", 'One owner.', [/[a-z]'s\b/i]),
      slot('plural', "Plural s'", "Plural noun + ' + object", 'More than one owner.', [/s'\s/i]),
      slot('pronoun', 'Possessive pronouns', 'mine / yours / his / hers / ours / theirs', 'Possession without a noun.', [/\b(mine|yours|his|hers|ours|theirs)\b/i]),
    ]);
  }

  if (hasTopic('plural') || hasTopic('singular')) {
    return finalize('plurals', 'Plural Nouns', [
      slot('s', 'Regular plurals (-s)', 'noun + -s', 'Most nouns add -s.', [/[a-z]s\b/i]),
      slot('es', 'Plurals with -es', 'noun + -es (after s, x, ch, sh)', 'Add -es after hissing sounds.', [/\b[a-z]+(ches|shes|ses|xes|zes)\b/i]),
      slot('ies', 'Consonant + y -> -ies', 'verb + y -> -ies', 'Change y to ies.', [/\b[a-z]+ies\b/i]),
      slot('irregular', 'Irregular plurals', 'child -> children, mouse -> mice', 'Plurals that break the rule.', [/\b(children|mice|men|women|feet|teeth|geese|people)\b/i]),
    ]);
  }

  if (has('many') || has('much') || has('countable') || has('uncountable')) {
    return finalize('quantifiers', 'Countable & Uncountable (some / any / many / much)', [
      slot('some', 'some (positive)', 'some + plural / uncountable noun', 'Use some in positive sentences.', [/\bsome\b/i]),
      slot('any', 'any (negative & questions)', 'any + plural / uncountable noun', 'Use any in negatives and questions.', [/\bany\b/i]),
      slot('many', 'many (countable)', 'many + plural noun', 'Count things you can number.', [/\bmany\b/i]),
      slot('much', 'much (uncountable)', 'much + uncountable noun', 'Things you cannot count one by one.', [/\bmuch\b/i]),
    ]);
  }

  if (has('there')) {
    return finalize('there_is_are', 'There is / There are', [
      slot('is', 'There is (singular)', 'There is + singular noun', 'One thing exists.', [/\bthere is\b/i]),
      slot('are', 'There are (plural)', 'There are + plural noun', 'Several things exist.', [/\bthere are\b/i]),
      slot('negative', 'Negative form', 'There is not / There are not + noun', 'Say something does not exist.', [/\bthere (is not|isn't|are not|aren't)\b/i]),
      slot('question', 'Question form', 'Is / Are there + noun ?', 'Ask if something exists.', [/\bthere\b/i, /\?\s*$/], [], "Yes, + there is / are . / No, + there isn't / aren't ."),
    ]);
  }

  if (has('adjective') && has('order')) {
    return finalize('adjective_order', 'Adjective Order', [
      slot('size_colour', 'Size + Colour', 'Determiner + Size + Colour + Noun', 'Size comes before colour.', []),
      slot('opinion_size', 'Opinion + Size', 'Opinion + Size + Noun', 'Opinion comes first.', []),
      slot('number', 'Number + Adjective + Noun', 'Number + Adjective + Noun', 'Numbers come before adjectives.', []),
    ]);
  }

  if (wantsQuestion) {
    return finalize('yes_no_questions', 'Yes / No Questions', [
      slot('do', 'Do / Does (present)', 'Do / Does + Subject + Base Verb ?', 'Present simple questions.', [/^\s*(do|does)\b/i, /\?\s*$/], [], "Yes, + Subject + do / does . / No, + Subject + don't / doesn't ."),
      slot('did', 'Did (past)', 'Did + Subject + Base Verb ?', 'Past simple questions.', [/^\s*did\b/i, /\?\s*$/], [], "Yes, + Subject + did . / No, + Subject + didn't ."),
      slot('be', 'Be questions (is / are)', 'Is / Are + Subject + ... ?', 'Questions with the be-verb.', [/^\s*(is|are)\b/i, /\?\s*$/], [], "Yes, + Subject + is / are . / No, + Subject + isn't / aren't ."),
    ]);
  }

  // Nothing recognised: keep the teacher's topic but build a clean 3-form pattern deck.
  const pretty = titleCase(topic.replace(/[^a-zA-Z ]/g, ' ').replace(/\s+/g, ' ').trim()) || 'Grammar';
  return finalize('custom', pretty, [
    slot('affirmative', 'Affirmative Pattern', `Subject + ${pretty}`, 'The positive statement pattern.', []),
    slot('negative', 'Negative Pattern', `Subject + not + ${pretty}`, 'The negative statement pattern.', []),
    slot('question', 'Question Pattern', `${pretty} + Subject ?`, 'The question pattern.', [], [], "Yes, + Subject + ... / No, + Subject + ..."),
  ]);
}

/** Check one generated rule against its blueprint slot. */
export function slotProblems(sentence: string, slot: GrammarSlot): string[] {
  const text = String(sentence || '').trim();
  const problems: string[] = [];
  if (text.split(/\s+/).filter(Boolean).length < 5) problems.push('sentence is too short (needs 5+ words)');
  for (const rule of slot.must ?? []) {
    if (!rule.test(text)) problems.push(`sentence does not show ${rule.source}`);
  }
  for (const rule of slot.forbid ?? []) {
    if (rule.test(text)) problems.push(`sentence must not contain ${rule.source}`);
  }
  return problems;
}

/** Grammar-shaped distractor words for a quiz, so a filler never contradicts the deck. */
export function quizDistractors(formula: string): string[] {
  const f = formula.toLowerCase();
  if (f.includes('was / were')) return ['was', 'were', 'did'];
  if (f.includes('am / is / are')) return ['am', 'is', 'are'];
  if (f.includes('have / has')) return ['have', 'has', 'had'];
  if (f.includes('will')) return ['will', 'would', "won't"];
  if (f.includes('did')) return ['did', 'does', 'do'];
  if (f.includes('had')) return ['had', 'has', 'have'];
  if (f.includes('do / does')) return ['do', 'does', 'did'];
  if (f.includes('verb-ing')) return ['was going', 'were going', '"ing" form'];
  if (f.includes('verb-ed')) return ['play', 'played', 'playing'];
  if (f.includes('base verb')) return ['go', 'goes', 'went'];
  return ['was', 'were', 'did'];
}

/** Split a blueprint formula into display parts, reusing the model's words when possible. */
export function formulaSegments(formula: string): string[] {
  return formula
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);
}