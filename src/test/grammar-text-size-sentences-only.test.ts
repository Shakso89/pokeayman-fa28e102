import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar Practice Modal Text Size: Sentences Only Scale, Titles Stay Fixed', () => {
  const cssPath = path.resolve(__dirname, '../../public/pokeayman/components.css');
  const jsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');

  it('verifies hero sentence scales with --gp-text-zoom', () => {
    expect(css).toContain('#grammar-practice-modal .gp-hero-sentence');
    expect(css).toContain('font-size: calc(clamp(2rem, 3.8vw, 3.85rem) * var(--gp-text-zoom, 1)) !important;');
  });

  it('verifies master example title/label does NOT scale with --gp-text-zoom', () => {
    const labelMatch = css.match(/\.gp-practice-card \.gp-master-example-label\s*\{([^}]+)\}/);
    expect(labelMatch).not.toBeNull();
    const labelRules = labelMatch![1];
    expect(labelRules).not.toContain('var(--gp-text-zoom');
    expect(labelRules).toContain('clamp(0.6875rem, 0.72rem, 0.75rem)');
  });

  it('verifies rule title and clue do NOT scale with --gp-text-zoom', () => {
    const ruleTitleMatch = css.match(/\.gp-practice-card \.gp-rule-title\s*\{([^}]+)\}/);
    expect(ruleTitleMatch).not.toBeNull();
    expect(ruleTitleMatch![1]).not.toContain('var(--gp-text-zoom');
    expect(ruleTitleMatch![1]).toContain('1.25rem');

    const clueMatch = css.match(/\.gp-practice-card \.gp-rule-clue\s*\{([^}]+)\}/);
    expect(clueMatch).not.toBeNull();
    expect(clueMatch![1]).not.toContain('var(--gp-text-zoom');
  });

  it('verifies mistake and correct headings/badges do NOT scale with --gp-text-zoom', () => {
    const headingsMatch = css.match(/\.gp-practice-card \.gp-mistake-heading,\s*\.gp-practice-card \.gp-correct-heading\s*\{([^}]+)\}/);
    expect(headingsMatch).not.toBeNull();
    expect(headingsMatch![1]).not.toContain('var(--gp-text-zoom');

    const badgesMatch = css.match(/\.gp-practice-card \.gp-mistake-badge,\s*\.gp-practice-card \.gp-correct-badge\s*\{([^}]+)\}/);
    expect(badgesMatch).not.toBeNull();
    expect(badgesMatch![1]).not.toContain('var(--gp-text-zoom');
  });

  it('verifies mistake and correct sentence texts DO scale with --gp-text-zoom', () => {
    const textsMatch = css.match(/\.gp-practice-card \.gp-mistake-text,\s*\.gp-practice-card \.gp-correct-text\s*\{([^}]+)\}/);
    expect(textsMatch).not.toBeNull();
    expect(textsMatch![1]).toContain('calc(1rem * var(--gp-text-zoom, 1)) !important;');
  });

  it('verifies practice heading stays fixed while quiz sentences scale', () => {
    const practiceHeadingMatch = css.match(/\.gp-practice-card \.gp-practice-heading\s*\{([^}]+)\}/);
    expect(practiceHeadingMatch).not.toBeNull();
    expect(practiceHeadingMatch![1]).not.toContain('var(--gp-text-zoom');

    const quizPromptMatch = css.match(/\.gp-practice-card \.gp-quick-check-prompt\s*\{([^}]+)\}/);
    expect(quizPromptMatch).not.toBeNull();
    expect(quizPromptMatch![1]).toContain('var(--gp-text-zoom, 1)');

    const quizOptMatch = css.match(/\.gp-practice-card \.gp-quiz-opt\s*\{([^}]+)\}/);
    expect(quizOptMatch).not.toBeNull();
    expect(quizOptMatch![1]).toContain('var(--gp-text-zoom, 1)');
  });

  it('verifies UI tooltip and comments in grammar-decks.js reflect scaling sentences only', () => {
    expect(js).toContain('title="Adjust sentence text size"');
    expect(js).toContain('// Wire text size controller (scales sentence texts while keeping titles fixed)');
  });
});
