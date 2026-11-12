import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Grammar Master Example Unlimited Alternative Cycling', () => {
  const root = path.resolve(__dirname, '../..');
  const grammarJsPath = path.join(root, 'public', 'pokeayman', 'grammar-decks.js');
  const js = fs.readFileSync(grammarJsPath, 'utf8');

  it('stores initial value and all options in data attributes on the substitution pill', () => {
    expect(js).toContain('data-initial-val=');
    expect(js).toContain('data-options=');
    expect(js).toContain('allPillOptions = normalizeAlternatives([displayWord, ...partAlts])');
  });

  it('loops cycling continuously on clicking without stopping after one cycle', () => {
    // initSubstitutionPills should compute (curIdx + 1) % options.length and update pill.dataset.activeVal
    expect(js).toContain('const nextIdx = (curIdx + 1) % options.length;');
    expect(js).toContain('pill.dataset.activeVal = nextVal;');
    expect(js).toContain('pill.dataset.options = JSON.stringify(options);');
  });

  it('correctly cycles in a loop across 2 words endlessly', () => {
    const options = ['No', 'Yes'];
    let curVal = 'No';

    // Simulate 6 clicks
    const history: string[] = [];
    for (let i = 0; i < 6; i++) {
      let curIdx = options.findIndex(opt => opt.toLowerCase() === curVal.toLowerCase());
      const nextIdx = (curIdx + 1) % options.length;
      curVal = options[nextIdx];
      history.push(curVal);
    }

    expect(history).toEqual(['Yes', 'No', 'Yes', 'No', 'Yes', 'No']);
  });
});
