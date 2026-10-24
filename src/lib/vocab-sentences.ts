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
// Gemini + ChatGPT sentence approval pipeline below.
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

type Review = { ok: boolean; feedback: string };

/** ChatGPT checks Gemini's answer for meaning, context, grammar and natural wording. */
async function reviewWithChatGpt(task: string, answer: string): Promise<Review> {
  // Use the OpenAI API directly so review uses the configured OpenAI API account.
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new SentenceAiError("OpenAI sentence review is not configured. Add OPENAI_API_KEY as a server-side secret.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env["OPENAI_VOCAB_REVIEW_MODEL"] || "gpt-6-astra",
      reasoning_effort: "low",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "review",
          strict: true,
          schema: {
            type: "object",
            properties: { ok: { type: "boolean" }, feedback: { type: "string" } },
            required: ["ok", "feedback"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You review example sentences written for young ESL students. For every sentence check: it makes logical real-world sense; the target word is used in the correct context and intended meaning; grammar and structure are correct; it sounds natural, not artificial. Reply JSON: ok=true with empty feedback when every sentence passes, otherwise ok=false and feedback naming which items fail and exactly why.",
        },
        { role: "user", content: `TASK GIVEN TO THE WRITER:\n${task}\n\nWRITER'S ANSWER:\n${answer}` },
      ],
    }),
  });
  const responseText = await res.text();
  let data: any;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.warn(`[vocab] OpenAI review returned non-JSON HTTP ${res.status}:`, responseText.slice(0, 300));
    throw new SentenceAiError(`OpenAI sentence review returned an unexpected response (HTTP ${res.status}). Please try again.`);
  }
  if (!res.ok) {
    console.warn(`[vocab] OpenAI review -> HTTP ${res.status}`, JSON.stringify(data).slice(0, 300));
    throw new SentenceAiError(
      res.status === 401 || res.status === 403
        ? "OpenAI rejected the API key. Check the server-side OPENAI_API_KEY secret."
        : res.status === 429
          ? "OpenAI review is busy or the API account has reached its limit. Check OpenAI API billing and try again."
          : `OpenAI could not check the sentences (HTTP ${res.status}). Please try again.`
    );
  }
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

