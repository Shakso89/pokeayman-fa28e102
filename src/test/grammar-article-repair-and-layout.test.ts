import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Grammar Article Repair and Layout Fixes', () => {
  const root = path.resolve(__dirname, '../..');
  const grammarJsPath = path.join(root, 'public', 'pokeayman', 'grammar-decks.js');
  const js = fs.readFileSync(grammarJsPath, 'utf8');

  // Load repairDetachedArticleAlternatives from file using Function sandbox
  const match = js.match(/function repairDetachedArticleAlternatives\([\s\S]*?\n  \}/);
  expect(match).toBeTruthy();
  const repairFn = new Function(`${match![0]}; return repairDetachedArticleAlternatives;`)();

  it('correctly re-attaches detached "the" articles into complete noun phrases', () => {
    const raw = ['the', 'zookeeper', 'scientist', 'teacher'];
    const repaired = repairFn(raw, 'the marine biologist');
    expect(repaired).toEqual(['the zookeeper', 'the scientist', 'the teacher']);
  });

  it('correctly re-attaches detached "a" articles into complete noun phrases', () => {
    const raw = ['a', 'map', 'question', 'green coat'];
    const repaired = repairFn(raw, 'a camera');
    expect(repaired).toEqual(['a map', 'a question', 'a green coat']);
  });

  it('correctly handles capitalized "The" articles', () => {
    const raw = ['The', 'student', 'author', 'teacher'];
    const repaired = repairFn(raw, 'The astronaut');
    expect(repaired).toEqual(['The student', 'The author', 'The teacher']);
  });

  it('correctly handles mixed phrases like ["the", "The speaker", "narrator", "observer"]', () => {
    const raw = ['the', 'The speaker', 'narrator', 'observer'];
    const repaired = repairFn(raw, 'the narrator');
    expect(repaired).toEqual(['The speaker', 'the narrator', 'the observer']);
  });

  it('attaches article from phrase context if alternatives lack articles', () => {
    const raw = ['zookeeper', 'scientist', 'teacher'];
    const repaired = repairFn(raw, 'the marine biologist');
    expect(repaired).toEqual(['the zookeeper', 'the scientist', 'the teacher']);
  });

  it('leaves non-noun phrase alternatives intact (e.g. verbs, comparatives, auxiliaries)', () => {
    const comparatives = ['faster', 'smarter', 'quieter'];
    expect(repairFn(comparatives, 'faster')).toEqual(['faster', 'smarter', 'quieter']);

    const auxiliaries = ['Do', 'Does'];
    expect(repairFn(auxiliaries, 'Does')).toEqual(['Do', 'Does']);

    const verbs = ['need', 'want', 'like'];
    expect(repairFn(verbs, 'have')).toEqual(['need', 'want', 'like']);
  });

  it('ensures formatSyntaxHighlightedSentence preserves the phrase and does not truncate to "the" or "a"', () => {
    // Must NOT contain the old destructive check that overrode displayWord to partAlts[0]
    expect(js).not.toContain('words.length > 1 && partAlts.some(a => words.includes(a))');
    expect(js).toContain('let displayWord = phrase;');
    expect(js).toContain('allPillOptions = normalizeAlternatives([displayWord, ...partAlts])');
  });

  it('ensures Quick Check layout stacks prompt vertically above options with full width', () => {
    expect(js).toContain('id="gp-quick-check-box"');
    expect(js).toContain('id="gp-options-row"');
    expect(js).toContain('flex-direction:column!important');
    expect(js).toContain('width:100%!important');
  });
});
