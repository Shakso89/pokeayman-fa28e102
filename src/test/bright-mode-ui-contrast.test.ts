import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bright Mode UI Contrast & Legibility Fixes', () => {
  const brightFixesPath = path.resolve(process.cwd(), 'public/pokeayman/bright-fixes.css');
  const gamesArcadeCssPath = path.resolve(process.cwd(), 'public/pokeayman/games-arcade.css');
  const brightFixesCss = fs.readFileSync(brightFixesPath, 'utf8');
  const gamesArcadeCss = fs.readFileSync(gamesArcadeCssPath, 'utf8');

  it('ensures Vocab Battle Arena names remain light on dark battle stages in bright mode', () => {
    // games-arcade.css must only scope dark text to classroom or toybox themes, not default dark stages
    expect(gamesArcadeCss).toMatch(/html body\.ts-bright \.ga-stage\.vb-stage:is\(\[data-ga-theme="classroom"\],\s*\[data-ga-theme="toybox"\]\)/);
    
    // bright-fixes.css must have explicit light text overrides for dark stages in bright mode
    expect(brightFixesCss).toContain('.vb-matchup :is(.vb-partner-name, .vb-foe-name)');
    expect(brightFixesCss).toMatch(/\.ga-stage\.vb-stage:not\(\[data-ga-theme="classroom"\]\):not\(\[data-ga-theme="toybox"\]\)\s*\.vb-matchup\s*:is\(\.vb-partner-name,\s*\.vb-foe-name\)/);
    expect(brightFixesCss).toContain('color: #f8fafc !important;');
  });

  it('ensures Carousel Pro Gold Cards retain glowing gold title and subtitle in bright mode', () => {
    expect(brightFixesCss).toContain('.ga-pro-gold-card h3');
    expect(brightFixesCss).toMatch(/background:\s*linear-gradient\(90deg,\s*#fef08a\s*0%,\s*#fde047\s*50%,\s*#f59e0b\s*100%\)\s*!important/);
    expect(brightFixesCss).toMatch(/\.ga-pro-gold-card\s*:is\(p,\s*span,\s*\[class\*="text-amber-400"\]\)/);
    expect(brightFixesCss).toContain('color: #fbbf24 !important;');
  });

  it('ensures Stepper and counter pill controls have high contrast in bright mode', () => {
    expect(brightFixesCss).toContain('.ga-stepper-pill');
    expect(brightFixesCss).toMatch(/background:\s*#1e293b\s*!important/);
    expect(brightFixesCss).toMatch(/color:\s*#f8fafc\s*!important/);
    expect(brightFixesCss).toMatch(/color:\s*#cbd5e1\s*!important/);
  });

  it('ensures player picker Clear, Random, and vs Robot action buttons have crisp contrast', () => {
    expect(brightFixesCss).toContain('.ga-pick-clear-btn');
    expect(brightFixesCss).toContain('.ga-pick-random-btn');
    expect(brightFixesCss).toContain('.ga-pick-robot-btn');
    expect(brightFixesCss).toMatch(/color:\s*#e2e8f0\s*!important/);
    // games-arcade.css ga-pick-clear-btn should not have low contrast var(--ga-muted)
    expect(gamesArcadeCss).not.toContain('color: var(--ga-muted) !important;\n  border-color: var(--ga-border)');
  });
});
