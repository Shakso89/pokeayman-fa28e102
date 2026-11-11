import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route } from '../routes/api/generate-vocab-list';
import * as vocabSentences from '../lib/vocab-sentences';

describe('Route /api/generate-vocab-list', () => {
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
  });

  it('generates sentences for word items when Gemini returns a JSON array', async () => {
    vi.spyOn(vocabSentences, 'askSentenceModel').mockResolvedValue(
      JSON.stringify([
        { i: 1, sentence: 'Rain falls gently on the blue umbrella.' },
        { i: 2, sentence: 'A cozy cat naps on the warm sofa.' },
        { i: 3, sentence: 'Shoes rest quietly next to the door.' },
      ])
    );

    const res = await post({
      mode: 'words',
      items: [
        { word: 'umbrella', picture: '' },
        { word: 'sofa', picture: '' },
        { word: 'next to', picture: '' },
      ],
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe('ai');
    expect(data.count).toBe(3);
    expect(data.items).toHaveLength(3);
    expect(data.items[0]).toEqual({
      word: 'umbrella',
      sentence: 'Rain falls gently on the blue umbrella.',
    });
    expect(data.items[2]).toEqual({
      word: 'next to',
      sentence: 'Shoes rest quietly next to the door.',
    });
  });

  it('handles Gemini responses wrapped in an object with items or sentences array', async () => {
    vi.spyOn(vocabSentences, 'askSentenceModel').mockResolvedValue(
      JSON.stringify({
        items: [
          { i: 1, sentence: 'The hot soup sits on the table.' },
        ],
      })
    );

    const res = await post({
      mode: 'words',
      words: ['table'],
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].word).toBe('table');
    expect(data.items[0].sentence).toBe('The hot soup sits on the table.');
  });

  it('handles words provided as comma-separated string', async () => {
    vi.spyOn(vocabSentences, 'askSentenceModel').mockResolvedValue(
      JSON.stringify([
        { i: 1, sentence: 'Look at the tall vase.' },
        { i: 2, sentence: 'Puppies hide under the bed.' },
      ])
    );

    const res = await post({
      mode: 'words',
      words: 'vase, under',
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(2);
    expect(data.items[0].word).toBe('vase');
    expect(data.items[1].word).toBe('under');
  });

  it('returns 502 with informative message if AI model is unreachable', async () => {
    vi.spyOn(vocabSentences, 'askSentenceModel').mockRejectedValue(
      new vocabSentences.SentenceAiError('Gemini is busy right now. Please try again in a minute.')
    );

    const res = await post({
      mode: 'words',
      items: [{ word: 'violin', picture: '' }],
    });

    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.message).toBe('Gemini is busy right now. Please try again in a minute.');
  });

  it('returns 400 when no valid words are provided', async () => {
    const res = await post({
      mode: 'words',
      words: '',
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain('Please enter at least one word');
  });
});
