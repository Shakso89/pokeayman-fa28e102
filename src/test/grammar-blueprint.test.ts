import { describe, expect, it } from 'vitest';
import { buildGrammarPlan, formulaSegments, slotProblems } from '../lib/grammar-blueprint';

describe('grammar blueprint engine', () => {
  it('reads a typo topic as Past Continuous and builds past-continuous forms only', () => {
    const plan = buildGrammarPlan('past continues');
    expect(plan.family).toBe('past_continuous');
    expect(plan.displayName).toBe('Past Continuous');
    expect(plan.count).toBeGreaterThanOrEqual(4);
    for (const slot of plan.slots) {
      expect(slot.formula).toMatch(/was|were/i);
      expect(slot.formula).toMatch(/ing/i);
    }
  });

  it('tolerates typos for present simple and keeps its -s / do / does forms', () => {
    const plan = buildGrammarPlan('presnt simpl');
    expect(plan.family).toBe('present_simple');
    const formulas = plan.slots.map((s) => s.formula.toLowerCase()).join(' | ');
    expect(formulas).toContain('base verb');
    expect(formulas).toContain('verb-s');
    expect(formulas).toContain('do ');
  });

  it('builds one rule per requested wh- word', () => {
    const plan = buildGrammarPlan('wh questions what where when');
    expect(plan.family).toBe('wh_questions');
    expect(plan.count).toBe(3);
    expect(plan.slots.map((s) => s.title)).toEqual([
      'Asking with "What"',
      'Asking with "Where"',
      'Asking with "When"',
    ]);
  });

  it('drops the regular -ed rule when the teacher asks for irregular verbs only', () => {
    const plan = buildGrammarPlan('past irregular verbs');
    expect(plan.family).toBe('past_simple');
    expect(plan.slots.some((s) => s.key === 'regular')).toBe(false);
  });

  it('rejects a past-simple sentence for a past-continuous slot and accepts a real one', () => {
    const [affirmative] = buildGrammarPlan('past continuous').slots;
    expect(affirmative).toBeDefined();
    expect(slotProblems('Yesterday, the children played soccer in the park.', affirmative!)).not.toHaveLength(0);
    expect(slotProblems('At eight o clock the twins were building a cardboard castle.', affirmative!)).toHaveLength(0);
  });

  it('keeps every blueprint between 3 and 5 rules and splits formulas into segments', () => {
    for (const topic of ['past continuous', 'present simple', 'comparative adjectives', 'future will', 'there is there are']) {
      const plan = buildGrammarPlan(topic);
      expect(plan.count).toBeGreaterThanOrEqual(3);
      expect(plan.count).toBeLessThanOrEqual(5);
      for (const slot of plan.slots) {
        expect(formulaSegments(slot.formula).length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
