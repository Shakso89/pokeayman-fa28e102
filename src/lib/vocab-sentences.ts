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

async function callGemini(body: GeminiBody): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new SentenceAiError("Gemini is not set up yet. Please add the Gemini key.");
  let lastStatus = 0;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ ...body, generationConfig: { ...body.generationConfig, responseMimeType: "application/json" } }),
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

type Review = { ok: boolean; feedback: string };

/** ChatGPT checks Gemini's answer for meaning, context, grammar and natural wording. */
async function reviewWithChatGpt(task: string, answer: string): Promise<Review> {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new SentenceAiError("ChatGPT checking is not set up yet. Please add the OpenAI key.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You review example sentences written for young ESL students. For every sentence check: it makes logical real-world sense; the target word is used in the correct context and intended meaning; grammar and structure are correct; it sounds natural, not artificial. Reply JSON only: {\"ok\": true} when every sentence passes, otherwise {\"ok\": false, \"feedback\": \"<which item numbers or words fail and exactly why>\"}.",
        },
        { role: "user", content: `TASK GIVEN TO THE WRITER:\n${task}\n\nWRITER'S ANSWER:\n${answer}` },
      ],
    }),
  });
  if (!res.ok) {
    console.warn(`[vocab] ChatGPT review -> HTTP ${res.status}`);
    throw new SentenceAiError(
      res.status === 429 ? "ChatGPT checking is out of credits or busy. Please check the OpenAI account and try again." : "ChatGPT could not check the sentences. Please try again."
    );
  }
  const data: any = await res.json();
  try {
    const parsed = JSON.parse(String(data?.choices?.[0]?.message?.content || "{}"));
    return { ok: parsed.ok === true, feedback: String(parsed.feedback || "") };
  } catch {
    return { ok: false, feedback: "The review could not be read." };
  }
}

const MAX_REVISIONS = 2;

/**
 * Gemini writes; ChatGPT reviews. When ChatGPT finds a problem, Gemini revises
 * with that feedback (at most MAX_REVISIONS times). Only approved text is
 * returned. Throws SentenceAiError when either service fails or nothing passes.
 */
export async function askSentenceModel(body: GeminiBody): Promise<string> {
  const task = (body.contents[0]?.parts || []).map((p) => p.text || "").join("\n");
  let current = body;
  for (let attempt = 0; attempt <= MAX_REVISIONS; attempt++) {
    const answer = await callGemini(current);
    const review = await reviewWithChatGpt(task, answer);
    if (review.ok) return answer;
    console.warn(`[vocab] ChatGPT rejected attempt ${attempt + 1}: ${review.feedback}`);
    current = {
      ...body,
      contents: [
        {
          parts: [
            ...(body.contents[0]?.parts || []),
            { text: `\n\nYour previous answer was:\n${answer}\n\nA reviewer found these problems:\n${review.feedback}\n\nRewrite the answer fixing them, following every original rule and the same JSON format.` },
          ],
        },
      ],
    };
  }
  throw new SentenceAiError("The sentences did not pass the ChatGPT check after several tries. Please try again.");
}
