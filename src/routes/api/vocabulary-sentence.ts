import { createFileRoute } from "@tanstack/react-router";
import { SentenceAiError, askSentenceModel, normalizeWord, sentenceHasWord } from "@/lib/vocab-sentences";

const requests = new Map<string, { count: number; reset: number }>();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control",
};


export const Route = createFileRoute("/api/vocabulary-sentence")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => { try { return await (async () => {
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) for (const [k, e] of requests) if (e.reset < now) requests.delete(k);
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 40) {
          return Response.json({ message: "Please wait a minute before generating more sentences." }, { status: 429, headers: { ...CORS, "Retry-After": "60" } });
        }
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });

        let input: any;
        try {
          input = await request.json();
        } catch {
          return Response.json({ message: "Invalid request payload." }, { status: 400, headers: CORS });
        }

        const askGemini = askSentenceModel;

        const parseJson = (text: string): unknown => {
          const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
          const start = Math.min(...[cleaned.indexOf("["), cleaned.indexOf("{")].filter((i) => i >= 0));
          const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
          const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
          try {
            return JSON.parse(slice);
          } catch {
            return null;
          }
        };

        // Batch mode: identical guarantees to /api/generate-vocab-list.
        if (Array.isArray(input.items) || Array.isArray(input.words) || (typeof input.words === "string" && input.words.includes(","))) {
          let rawItems: Array<{ word: string; picture: string }> = [];
          if (Array.isArray(input.items)) {
            rawItems = input.items.map((it: any) => ({
              word: String(it.word || "").trim(),
              picture: String(it.picture || it.context || "").trim().slice(0, 150),
            }));
          } else {
            let rawWords: string[] = [];
            if (Array.isArray(input.words)) {
              rawWords = input.words.map((w: any) => (typeof w === "object" ? String(w.word || "") : String(w || "")).trim());
            } else {
              const clean = String(input.words || "").replace(/\.+$/, "").trim();
              const wordsList = (clean.includes(",") || clean.includes("\n"))
                ? clean.split(/[\n,]+/).map((w) => w.trim()).filter((w) => w.length > 0)
                : clean.split(/\s+/).map((w) => w.trim()).filter((w) => w.length > 0);
              rawWords = wordsList.map((w) => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").trim());
            }
            rawItems = rawWords.map((w: any) => ({
              word: (typeof w === "object" ? String(w.word || "") : String(w || "")).trim(),
              picture: "",
            }));
          }
          rawItems = rawItems.filter((it) => it.word && it.word.length <= 60).slice(0, 30);
          if (!rawItems.length) return Response.json({ message: "Please provide words." }, { status: 400, headers: CORS });

          const sentences = new Map<number, string>();
          const collectSentences = (parsed: unknown) => {
            if (!Array.isArray(parsed)) return;
            parsed.forEach((entry: any, position: number) => {
              if (!entry || typeof entry !== "object") return;
              const numbered = Number(entry.i ?? entry.index ?? entry.n);
              let index =
                Number.isInteger(numbered) && numbered >= 1 && numbered <= rawItems.length ? numbered - 1 : position;
              const saidWord = normalizeWord(entry.word);
              if (saidWord) {
                const matched = rawItems.findIndex((item) => normalizeWord(item.word) === saidWord);
                if (matched >= 0) index = matched;
              }
              if (index < 0 || index >= rawItems.length || sentences.has(index)) return;
              const sentence = String(entry.sentence || "").trim().replace(/^["']|["']$/g, "");
              if (sentence && sentenceHasWord(sentence, rawItems[index]!.word)) sentences.set(index, sentence);
            });
          };

          const buildPrompt = (indexes: number[]) =>
            `You are an ESL teacher for young elementary students.
Write one simple, natural example sentence (6 to 9 words) for every numbered item below.

RULES:
1. Use the exact word given for that item. Never pluralise it or swap it for another word.
2. If a picture description is given, the sentence must match that picture.
3. Every sentence must have a different structure and verb.
4. Reply with JSON only: an array of {"i": <item number>, "sentence": "<sentence>"}.

Items:
${indexes.map((i) => `${i + 1}. word: "${rawItems[i]!.word}"${rawItems[i]!.picture ? ` | picture: "${rawItems[i]!.picture}"` : ""}`).join("\n")}`;

          const askForIndexes = async (indexes: number[], maxOutputTokens: number) => {
            const text = await askGemini({
              contents: [{ parts: [{ text: buildPrompt(indexes) }] }],
              generationConfig: { temperature: 0.5, responseMimeType: "application/json", maxOutputTokens },
            });
            if (text) collectSentences(parseJson(text));
          };

          const allIndexes = rawItems.map((_, i) => i);
          await askForIndexes(allIndexes, 1500);

          let missing = allIndexes.filter((i) => !sentences.has(i));
          if (missing.length > 0 && missing.length < allIndexes.length) {
            await askForIndexes(missing, 900);
            missing = allIndexes.filter((i) => !sentences.has(i));
          }

          if (missing.length > 0) {
            const names = missing.map((i) => `"${rawItems[i]!.word}"`).join(", ");
            return Response.json(
              { message: `Gemini could not write a sentence that uses ${names}. Please try again.` },
              { status: 502, headers: CORS }
            );
          }

          const items = allIndexes.map((i) => ({ word: rawItems[i]!.word, sentence: sentences.get(i)! }));
          return Response.json({ items, count: items.length, source: "ai" }, { headers: CORS });
        }

        // Single word mode: the "✨ Generate" button beside a sentence field.
        if (typeof input.word !== "string" || !input.word.trim() || input.word.length > 60) {
          return Response.json({ message: "Type a word first." }, { status: 400, headers: CORS });
        }
        const word = input.word.trim();
        const context = typeof input.context === "string" ? input.context.slice(0, 200) : "";
        const avoid = typeof input.avoid === "string" ? input.avoid.slice(0, 200) : "";

        const buildPrompt = (strict: boolean) => `Word: ${word}
${context ? `The sentence must describe this picture: ${context}` : ""}
${avoid ? `Do not repeat this sentence: ${avoid}` : ""}
You write one short, simple, natural example sentence (6-9 words) for children learning English.
Rules:
- The sentence MUST contain the word "${word}" exactly as written. Never pluralise it, never replace it with another word.
- If a picture is described, the sentence must match what the picture shows.
- Never write shallow sentences like "Look at the...", "This is a...", "Here is...".
${strict ? `- Your previous answer was rejected for not containing "${word}". Include "${word}" this time.` : ""}
Reply with JSON only: {"sentence": "<sentence>"}`;

        for (const strict of [false, true]) {
          const text = await askGemini({
            contents: [{ parts: [{ text: buildPrompt(strict) }] }],
            generationConfig: { temperature: strict ? 0.4 : 0.7, responseMimeType: "application/json", maxOutputTokens: 120 },
          });
          if (!text) continue;
          const parsed = parseJson(text) as any;
          const candidate = String(parsed?.sentence ?? parsed ?? "").trim().replace(/^["']|["']$/g, "");
          if (candidate && sentenceHasWord(candidate, word)) {
            return Response.json({ sentence: candidate, source: "ai" }, { headers: CORS });
          }
        }

        return Response.json(
          { message: `Gemini could not write a sentence that uses "${word}". Please try again.` },
          { status: 502, headers: CORS }
        );
        })();
        } catch (err) {
          const message = err instanceof SentenceAiError ? err.message : "Sentence generation failed. Please try again.";
          console.warn("[vocab] generation error:", err);
          return Response.json({ message }, { status: 502, headers: CORS });
        }
      },
    },
  },
});
