import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route } from '../routes/api/generate-vocab-list';
import * as vocabSentences from '../lib/vocab-sentences';
import * as stockMedia from '../lib/stock-media';

describe('Route /api/generate-vocab-list grammar mode', () => {
  const post = (payload: unknown) =>
    (Route.options as any).server.handlers.POST({
      request: new Request('http://localhost/api/generate-vocab-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    }) as Promise<Response>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(stockMedia, 'searchStockMedia').mockResolvedValue({ photos: [] } as any);
  });

  it('detects the topic and drops a rule written in the wrong tense', async () => {
    vi.spyOn(vocabSentences, 'callGemini').mockResolvedValue(
      JSON.stringify({
        rules: [
          {
            title: 'Past Continuous',
            formula: 'Subject + was / were + Verb-ing',
            sentence: 'At noon, the twins were building a cardboard castle.',
            quiz_question: 'At noon, the twins _____ (build) a castle.',
            quiz_options: ['were building', 'built', 'build'],
            quiz_answer: 'were building',
          },
          {
            title: 'Past Simple (wrong on purpose)',
            formula: 'Subject + Verb-ed',
            sentence: 'Yesterday, the children played soccer in the park.',
            quiz_question: 'Yesterday, the children _____ (play) soccer.',
            quiz_options: ['played', 'playing', 'play'],
            quiz_answer: 'played',
          },
        ],
      })
    );

    const res = await post({ mode: 'grammar', topic: 'past continues', level: 'Intermediate', search: 'past continues' });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.grammar_focus).toBe('Past Continuous');
    expect(data.deck_name).toBe('Past Continuous');
    expect(data.rules).toHaveLength(1);
    expect(data.rules[0].sentence).toContain('were building');
    // the blueprint formula always wins over whatever the model wrote
    expect(data.rules[0].formula).toBe('Subject + was / were + Verb-ing');
    expect(data.recommended_count).toBe(1);
  });

  it('repairs a slot the model skipped instead of shipping a short deck', async () => {
    const good = (sentence: string, extra: Record<string, unknown> = {}) => ({
      sentence,
      quiz_question: 'blank ____ (verb)',
      quiz_options: ['a', 'b', 'c'],
      quiz_answer: 'a',
      ...extra,
    });

    vi.spyOn(vocabSentences, 'callGemini')
      // first pass: only the affirmative slot, written correctly
      .mockResolvedValueOnce(
        JSON.stringify({
          rules: [good('At seven the dolphins were jumping beside the boat.')],
        })
      )
      // repair pass: fill the remaining slots, still on topic
      .mockResolvedValueOnce(
        JSON.stringify([
          { i: 2, ...good('The chef was not baking bread at noon yesterday.') },
          { i: 3, ...good('Were the students drawing dinosaurs in the museum?') },
        ])
      )
      // second repair round: nothing left to fix
      .mockResolvedValue(JSON.stringify([]));

    const res = await post({ mode: 'grammar', topic: 'past continuous' });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.rules.length).toBeGreaterThanOrEqual(3);
    for (const rule of data.rules) {
      expect(rule.formula).toMatch(/was|were/i);
    }
  });
});
