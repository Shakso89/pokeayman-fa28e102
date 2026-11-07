import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Global Leaderboard Card Top Metrics', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../public/pokeayman/index.html'), 'utf8');

  it('removes purple heart and score from top global rank row while preserving bottom value metric', () => {
    // 1. global-rank-row must not have purple heart or score
    expect(indexHtml).not.toContain('<div class="global-rank-row"><span class="global-rank-badge">#${index+1}</span><strong class="text-amber-100 whitespace-nowrap">${score} 💜</strong></div>');

    // 2. global-rank-row must only render the rank badge
    expect(indexHtml).toContain('<div class="global-rank-row"><span class="global-rank-badge">#${index+1}</span></div>');

    // 3. Bottom metrics must retain the value metric
    expect(indexHtml).toContain('<span><strong class="block text-indigo-100">${score}</strong>value</span>');
  });
});
