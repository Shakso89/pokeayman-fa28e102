/**
 * Shared rules for vocabulary example sentences.
 *
 * Every sentence in the app is written by Gemini. The only thing this module
 * decides is whether a sentence the model returned can be trusted: it has to be
 * about the teacher's own word, not some other word the model chose instead.
 */

export const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];

export function normalizeWord(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True when `sentence` uses `word` (or its plural / simple inflection) rather
 * than some other word the model decided to talk about.
 */
export function sentenceHasWord(sentence: string, word: string): boolean {
  const text = normalizeWord(sentence);
  const target = normalizeWord(word);
  if (!text || !target) return false;

  if (target.includes(" ")) {
    return new RegExp(`(^|[^a-z])${escapeRegExp(target)}([^a-z]|$)`).test(text);
  }

  const variants = new Set<string>([target, `${target}s`, `${target}es`, `${target}ed`, `${target}ing`]);
  if (target.length > 2) {
    const stem = target.replace(/[^a-z]$/, "");
    if (target.endsWith("y")) {
      variants.add(`${stem}ies`);
      variants.add(`${stem}ied`);
    }
    if (target.endsWith("e")) variants.add(`${target.slice(0, -1)}ing`);
    variants.add(`${stem}er`);
    variants.add(`${stem}ers`);
  }

  const tokens = text.match(/[a-z0-9']+/g) || [];
  return tokens.some((token) => variants.has(token));
}
