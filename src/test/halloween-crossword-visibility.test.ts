import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Halloween Theme Crossword Unconfirmed Text Color Visibility', () => {
  const root = process.cwd();
  const crosswordCss = readFileSync(path.join(root, 'public', 'pokeayman', 'crossword.css'), 'utf8');
  const arcadeCss = readFileSync(path.join(root, 'public', 'pokeayman', 'games-arcade.css'), 'utf8');

  it('ensures unconfirmed text in Halloween crosswords uses high-contrast bright warm white with webkit-text-fill-color in crossword.css', () => {
    expect(crosswordCss).toContain('html body > .ga-stage[data-ga-theme="halloween"] .crossword-cell:not(.is-correct):not(.is-wrong) input');
    expect(crosswordCss).toContain('-webkit-text-fill-color: #fff7ed !important');
    expect(crosswordCss).toContain('color: #fff7ed !important');
  });

  it('ensures unconfirmed text in Halloween crosswords overrides generic navy blue fill in games-arcade.css', () => {
    expect(arcadeCss).toContain('html body > .ga-stage[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .crossword-cell:not(.is-correct):not(.is-wrong) input');
    expect(arcadeCss).toContain('-webkit-text-fill-color: #fff7ed !important');
    expect(arcadeCss).toContain('color: #fff7ed !important');
  });
});
