import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Find Me Theme Feedback Animations & Overrides', () => {
  const root = process.cwd();
  const css = readFileSync(path.join(root, 'public', 'pokeayman', 'games-arcade.css'), 'utf8');
  const html = readFileSync(path.join(root, 'public', 'pokeayman', 'index.html'), 'utf8');

  it('protects theme base and hover styles so they never override correct or wrong feedback', () => {
    // Classroom (Chalkboard)
    expect(css).toMatch(/\[data-ga-theme="classroom"\] \.find-me-word:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
    // Toybox
    expect(css).toMatch(/\[data-ga-theme="toybox"\] \.find-me-word:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
    // Toybox later override & hover
    expect(css).toMatch(/\[data-ga-theme="toybox"\]:not\(\[data-ga-theme="classic"\]\) \.find-me-word:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
    expect(css).toMatch(/\.find-me-word:hover:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
    // Jungle
    expect(css).toMatch(/\[data-ga-theme="jungle"\] \.find-me-word:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
    // Halloween
    expect(css).toMatch(/\[data-ga-theme="halloween"\]:not\(\[data-ga-theme="classic"\]\) \.find-me-word:not\(\.find-me-word--correct\):not\(\.find-me-word--wrong\)/);
  });

  it('defines universal ultra-specificity feedback overrides for all themes in games-arcade.css', () => {
    // Universal correct block
    expect(css).toContain('.find-me-word:is(.find-me-word--correct, .is-correct, [data-status="correct"])');
    expect(css).toContain('background: linear-gradient(180deg, #34d399 0%, #059669 100%) !important');
    expect(css).toContain('0 0 0 4px #34d399');

    // Universal wrong block
    expect(css).toContain('.find-me-word:is(.find-me-word--wrong, .is-wrong, [data-status="wrong"])');
    expect(css).toContain('background: linear-gradient(180deg, #f87171 0%, #dc2626 100%) !important');
    expect(css).toContain('0 0 0 4px #f43f5e');

    // Universal hint block
    expect(css).toContain('.find-me-word:is(.find-me-word--hint, [data-status="hint"])');
  });

  it('defines required bounce and shake keyframes and utility classes', () => {
    expect(css).toContain('@keyframes bounce-short');
    expect(css).toContain('@keyframes shake');
    expect(css).toContain('@keyframes findMeCorrectBurst');
    expect(css).toContain('@keyframes findMeWrongShake');
    expect(css).toContain('.animate-bounce-short');
    expect(css).toContain('.animate-shake');
  });

  it('applies unified feedback classes and state attributes in index.html click handlers', () => {
    // Correct handler
    expect(html).toContain("btn.dataset.status = 'correct'");
    expect(html).toContain("'animate-bounce-short'");
    expect(html).toContain("'ring-emerald-400'");
    expect(html).toContain("'find-me-word--correct'");
    expect(html).toContain("'is-correct'");

    // Wrong handler
    expect(html).toContain("btn.dataset.status = 'wrong'");
    expect(html).toContain("'animate-shake'");
    expect(html).toContain("'ring-rose-500'");
    expect(html).toContain("'find-me-word--wrong'");
    expect(html).toContain("'is-wrong'");

    // Motion loop pauses active feedback tiles so they do not drift while animating
    expect(html).toContain("box.querySelectorAll('.find-me-word:not(.find-me-word--correct):not(.find-me-word--wrong):not([data-status=\"correct\"]):not([data-status=\"wrong\"])')");
  });

  it('provides emerald correct and rose wrong inline fallback styles in index.html', () => {
    expect(html).toMatch(/\.find-me-word--correct[^}]*#34d399/);
    expect(html).toMatch(/\.find-me-word--wrong[^}]*#f87171/);
    expect(html).toContain('@keyframes bounce-short');
    expect(html).toContain('@keyframes shake');
  });
});
