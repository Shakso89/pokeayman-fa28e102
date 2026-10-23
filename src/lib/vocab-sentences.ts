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
  generationConfig?: { temperature?: number; maxOutputTokens?: number };
};

/**
 * Ask Gemini directly when GEMINI_API_KEY is set; otherwise use the built-in
 * Lovable AI Gateway (Gemini models). Returns "" when nothing usable came back.
 */
export async function askSentenceModel(body: GeminiBody): Promise<string> {
  const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
  if (geminiApiKey) {
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, generationConfig: { ...body.generationConfig, responseMimeType: "application/json" } }) }
        );
        if (!res.ok) continue;
        const data: any = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return String(text);
      } catch {}
    }
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!lovableKey) return "";
  const content = (body.contents[0]?.parts || []).map((p) =>
    p.inlineData
      ? { type: "image_url", image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } }
      : { type: "text", text: p.text || "" }
  );
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
        temperature: body.generationConfig?.temperature,
      }),
    });
    if (!res.ok) {
      console.warn(`[vocab] AI gateway -> HTTP ${res.status}`);
      return "";
    }
    const data: any = await res.json();
    return String(data?.choices?.[0]?.message?.content || "");
  } catch (err) {
    console.warn("[vocab] AI gateway failed:", err);
    return "";
  }
}
