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

type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
type GeminiBody = {
  contents: Array<{ parts: GeminiPart[] }>;
  generationConfig?: { temperature?: number; maxOutputTokens?: number; responseMimeType?: string };
};

export class SentenceAiError extends Error {}

// Visual matching does not write or revise sentences. Keep it separate from the
// Gemini sentence generation below.
export async function callGemini(body: GeminiBody): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new SentenceAiError("Gemini is not set up yet. Please add the Gemini key.");
  let lastStatus = 0;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ ...body, generationConfig: { ...body.generationConfig, responseMimeType: "application/json" } }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        lastStatus = res.status;
        console.warn(`[vocab] Gemini ${model} -> HTTP ${res.status}`);
        continue;
      }
      const data: any = await res.json();
      const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join("");
      if (text) return text;
    } catch (err) {
      console.warn(`[vocab] Gemini ${model} failed:`, err);
    }
  }
  throw new SentenceAiError(lastStatus === 429 ? "Gemini is busy right now. Please try again in a minute." : "Gemini could not be reached. Please try again.");
}

/** Generate sentences with Gemini only; routes validate required target words. */
export async function askSentenceModel(body: GeminiBody): Promise<string> {
  return callGemini(body);
}
