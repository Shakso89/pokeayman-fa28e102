import { createFileRoute } from "@tanstack/react-router";
import { SentenceAiError, askSentenceModel, normalizeWord, sentenceHasWord } from "@/lib/vocab-sentences";
import { matchVocabularyMedia } from "@/lib/vocab-media";
import { isMediaType } from "@/lib/stock-media";

const requests = new Map<string, { count: number; reset: number }>();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control",
};


export const Route = createFileRoute("/api/generate-vocab-list")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => { try { return await (async () => {
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) {
          for (const [k, e] of requests) if (e.reset < now) requests.delete(k);
        }
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 40) {
          return Response.json(
            { message: "Please wait a minute before generating more vocabulary lists." },
            { status: 429, headers: { ...CORS, "Retry-After": "60" } }
          );
        }
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });

        let input: any;
        try {
          input = await request.json();
        } catch {
          return Response.json({ message: "Invalid request payload." }, { status: 400, headers: CORS });
        }

        if (input?.mode === "media") {
          const id = typeof input.id === "string" ? input.id.trim() : "";
          const word = typeof input.word === "string" ? input.word.trim() : "";
          const sentence = typeof input.sentence === "string" ? input.sentence.trim() : "";
          if (!id || id.length > 100 || !word || word.length > 60 || !sentence || sentence.length > 500 || !sentenceHasWord(sentence, word)) {
            return Response.json({ message: "Provide an item ID, word and final sentence containing that word." }, { status: 400, headers: CORS });
          }
          const result = await matchVocabularyMedia({
            id, word, sentence,
            ...(input.action === "search" ? { action: "search" as const } : {}),
            ...(typeof input.query === "string" ? { query: input.query.slice(0, 100) } : {}),
            ...(isMediaType(input.imageType) ? { imageType: input.imageType } : {}),
            page: Math.min(Math.max(Math.floor(Number(input.page) || 1), 1), 50),
          });
          return Response.json(result, { headers: { ...CORS, "Cache-Control": "no-store" } });
        }

        
        // askGemini defined above

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

        if (input?.mode === "grammar") {
          const topic = String(input.topic || "").trim().slice(0, 150);
          const level = String(input.level || "Beginner").trim();
          if (!topic) {
            return Response.json({ message: "Please provide a grammar topic." }, { status: 400, headers: CORS });
          }

          const prompt = `You are an expert ESL/EFL English language curriculum developer and teacher for young elementary students.
The teacher wants a Grammar Pattern Deck for the topic: "${topic}" (Target Level: ${level}).

Generate between 2 to 4 distinct, pedagogically sound grammar rules / patterns for this topic.
CRITICAL PEDAGOGICAL INSTRUCTIONS:
1. If the topic mentions specific question words or structures (such as "What, Where, What color, How many", etc.), generate ONE separate, focused rule for EACH specified question word / structure.
2. If the topic is a tense or grammatical category (such as "Present Continuous", "Past Simple", "Comparatives", etc.), generate:
   - Rule 1: Affirmative / Core Pattern
   - Rule 2: Negative Form or Common Exception
   - Rule 3: Question Form / Word Order Inversion
3. For each rule:
   - "title": A clear educational title (e.g. "Asking with 'Where' (Places and Locations)" or "Affirmative Actions (Happening Now)").
   - "formula": The exact formula with "+" signs (e.g. "Where + is / are + Subject ?" or "Subject + am / is / are + Verb-ing" or "How many + Plural Noun + are there ?"). NEVER use a generic "Subject + Verb + Object" unless teaching basic SVO!
   - "sentence": A realistic, natural, kid-friendly example sentence demonstrating this exact rule (e.g. "Where is the sleeping cat?" or "What color is your bicycle?" or "The elephant is walking slowly in the grass."). NEVER write meta-sentences like "The students practiced..." or "This is a rule."!
   - "context_clue": A 3 to 7 word helpful hint explaining when or why to use this rule (e.g. "Use 'Where' to ask about places" or "Use for actions happening right now").
   - "mistake_bad": A realistic common student error (e.g. "Where is your favorite color?" or "The dinosaur not sleeping today." or "How many pencils does you have?").
   - "mistake_good": The exact corrected sentence (e.g. "What is your favorite color?" or "The dinosaur is not sleeping today." or "How many pencils do you have?").
   - "quiz_question": A fill-in-the-blank or multiple choice challenge question testing this exact rule (e.g. "_____ are the keys? - In my pocket." or "Look! The monkey _____ (climb) the tree!").
   - "quiz_options": Array of 3 distinct, plausible answer choices (e.g. ["Where", "What", "How many"] or ["is climbing", "are climbing", "climbs"]).
   - "quiz_answer": The exact string matching the correct option.
   - "image_search": 2-3 word query to find a matching photo (e.g. "sleeping cat", "school backpack", "colorful bicycle", "colored pencils").

Reply with valid JSON only in this exact format:
{
  "deck_name": "${topic}",
  "rules": [
    {
      "title": "...",
      "formula": "...",
      "sentence": "...",
      "context_clue": "...",
      "mistake_bad": "...",
      "mistake_good": "...",
      "quiz_question": "...",
      "quiz_options": ["...", "...", "..."],
      "quiz_answer": "...",
      "image_search": "..."
    }
  ]
}`;

          try {
            const rawText = await askGemini({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, responseMimeType: "application/json", maxOutputTokens: 2500 },
            });
            const parsed = parseJson(rawText) as any;
            let rules = Array.isArray(parsed?.rules) ? parsed.rules : (Array.isArray(parsed) ? parsed : []);

            if (rules.length === 0) {
              throw new Error("No rules returned by AI model.");
            }

            for (let i = 0; i < rules.length; i++) {
              const r = rules[i];
              r.rule_id = `rule-gen-${i + 1}-${Date.now()}`;
              if (!r.title) r.title = `Rule ${i + 1}`;
              if (!r.formula) r.formula = 'Pattern';
              if (!r.sentence) r.sentence = 'Example sentence.';
              if (!Array.isArray(r.quiz_options) || r.quiz_options.length === 0) {
                r.quiz_options = [r.quiz_answer || 'Option A', 'Option B', 'Option C'];
              }
              if (!r.quiz_answer) r.quiz_answer = r.quiz_options[0];

              // Try finding image
              const query = String(r.image_search || r.sentence.slice(0, 30) || topic).trim();
              try {
                const stock = await matchVocabularyMedia({
                  id: r.rule_id,
                  word: query.split(' ')[0] || 'study',
                  sentence: r.sentence,
                  action: 'search',
                  query: query,
                  page: 1
                });
                const goodPhoto = stock?.candidates?.find((p: any) => p.imageUrl && !p.imageUrl.includes('pixabay.com/get/'));
                if (goodPhoto) {
                  r.image = goodPhoto.imageUrl;
                }
              } catch (_) {}
              if (!r.image) {
                const fallbacks = [
                  'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
                  'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png',
                  'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg',
                  'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
                ];
                r.image = fallbacks[i % fallbacks.length];
              }
            }

            return Response.json({
              deck_name: String(parsed?.deck_name || topic).trim(),
              rules
            }, { headers: { ...CORS, "Cache-Control": "no-store" } });
          } catch (err: any) {
            console.error("[grammar-ai] Error:", err);
            return Response.json({ message: err?.message || "Failed to generate grammar deck with AI." }, { status: 500, headers: CORS });
          }
        }

        const mode = input?.mode === "photo" ? "photo" : "words";

        

        if (mode === "words") {
          let rawItems: Array<{ word: string; picture: string }> = [];

          if (Array.isArray(input.items)) {
            rawItems = input.items
              .map((it: any) => ({
                word: String(it.word || "").trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""),
                picture: String(it.picture || it.context || it.tags || "").trim().slice(0, 150),
              }))
              .filter((it: any) => it.word.length > 0 && it.word.length <= 60)
              .slice(0, 30);
          } else if (Array.isArray(input.words)) {
            rawItems = input.words
              .map((w: any) => ({
                word: (typeof w === "object" ? String(w.word || "") : String(w || "")).trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""),
                picture: typeof w === "object" ? String(w.picture || w.tags || "").trim() : "",
              }))
              .filter((it: any) => it.word.length > 0 && it.word.length <= 60)
              .slice(0, 30);
          } else if (typeof input.words === "string") {
            const clean = input.words.replace(/\.+$/, "").trim();
            const wordsList = (clean.includes(",") || clean.includes("\n"))
              ? clean.split(/[\n,]+/).map((w: string) => w.trim()).filter((w: string) => w.length > 0)
              : clean.split(/\s+/).map((w: string) => w.trim()).filter((w: string) => w.length > 0);
            rawItems = wordsList
              .map((w: string) => ({ word: w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").trim(), picture: "" }))
              .filter((it: any) => it.word.length > 0 && it.word.length <= 60)
              .slice(0, 30);
          }

          if (rawItems.length === 0) {
            return Response.json({ message: "Please enter at least one word to generate a list." }, { status: 400, headers: CORS });
          }

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

          const buildPrompt = (indexes: number[]) => {
            const list = indexes
              .map((i) => `${i + 1}. word: "${rawItems[i]!.word}"${rawItems[i]!.picture ? ` | picture: "${rawItems[i]!.picture}"` : ""}`)
              .join("\n");
            return `You are an English language teacher for young ESL elementary students.
Write one simple, natural example sentence (6 to 9 words) for every numbered item below.

RULES:
1. Use the exact word given for that item. Never pluralise it, never shorten it, never swap it for a synonym or a related word.
2. When a picture description is given, the sentence must match what that picture really shows.
3. Every sentence needs a different structure and verb. Never repeat a pattern inside one list.
4. Never start with "Look at...", "This is a...", "Here is...", "I see a...".
5. Animals only do what they can really do. Food is cooked, served, tasted or eaten, never used as a tool.
6. Reply with JSON only: an array of {"i": <item number>, "sentence": "<sentence>"} using the numbers below.

Items:
${list}`;
          };

          const askForIndexes = async (indexes: number[], maxOutputTokens: number) => {
            const text = await askGemini({
              contents: [{ parts: [{ text: buildPrompt(indexes) }] }],
              generationConfig: { temperature: 0.5, responseMimeType: "application/json", maxOutputTokens },
            });
            if (!text) return;
            collectSentences(parseJson(text));
          };

          const allIndexes = rawItems.map((_, i) => i);
          await askForIndexes(allIndexes, 1500);

          // One focused retry for anything the first pass missed or wrote wrongly.
          let missing = allIndexes.filter((i) => !sentences.has(i));
          if (missing.length > 0 && missing.length < allIndexes.length) {
            await askForIndexes(missing, 900);
            missing = allIndexes.filter((i) => !sentences.has(i));
          }

          if (missing.length === allIndexes.length) {
            return Response.json(
              { message: "Gemini could not write those sentences right now. Please try again." },
              { status: 502, headers: CORS }
            );
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

        if (mode === "photo") {
          let base64Data = "";
          let mimeType = "image/jpeg";

          if (typeof input.image === "string" && input.image) {
            const match = input.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1]!;
              base64Data = match[2]!;
            } else {
              base64Data = input.image.trim();
              if (typeof input.mimeType === "string") mimeType = input.mimeType;
            }
          }

          if (!base64Data) {
            return Response.json({ message: "Please upload a photo first." }, { status: 400, headers: CORS });
          }

          const isAll = input.count === 'all' || input.count === 'All' || input.count === 0 || input.all === true;
          const targetCount = isAll ? 0 : Math.min(Math.max(Number(input.count) || 5, 1), 30);
          const prompt = isAll
            ? `You are an English language teacher for young ESL elementary students.
Analyze this photo and identify all clear, prominent vocabulary objects, animals, food, or actions in the picture (up to 15 key words).
For each item:
1. Provide the main vocabulary word.
2. Write one simple, vivid, natural sentence (6 to 9 words) describing that object or action in the photo.
3. The sentence must contain the vocabulary word exactly as you wrote it.
4. Every sentence MUST be unique! NEVER repeat the same sentence structure or pattern.
5. NEVER write lazy or shallow sentences like "Look at the...", "This is a...", "Here is...", "I see a...".
6. Return ONLY a valid JSON array of objects with keys "word" and "sentence".`
            : `You are an English language teacher for young ESL elementary students.
Analyze this photo and identify exactly ${targetCount} clear, visible objects, animals, food, or actions in the picture.
For each item:
1. Provide the main vocabulary word.
2. Write one simple, vivid, natural sentence (6 to 9 words) describing that object or action in the photo.
3. The sentence must contain the vocabulary word exactly as you wrote it.
4. Every sentence MUST be unique! NEVER repeat the same sentence structure or pattern.
5. NEVER write lazy or shallow sentences like "Look at the...", "This is a...", "Here is...", "I see a...".
6. Return ONLY a valid JSON array of objects with keys "word" and "sentence".`;

          const text = await askGemini({
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }],
            generationConfig: { temperature: 0.5, responseMimeType: "application/json", maxOutputTokens: 1500 },
          });

          const parsed = text ? parseJson(text) : null;
          const items = Array.isArray(parsed)
            ? parsed
                .map((item: any) => ({
                  word: String(item.word || "").trim(),
                  sentence: String(item.sentence || "").trim().replace(/^["']|["']$/g, ""),
                }))
                .filter((item: any) => item.word && item.sentence && sentenceHasWord(item.sentence, item.word))
            : [];

          if (items.length === 0) {
            return Response.json(
              { message: "Could not identify vocabulary from this photo. Please try another photo or enter words directly." },
              { status: 502, headers: CORS }
            );
          }

          return Response.json({ items, count: items.length, source: "ai" }, { headers: CORS });
        }

        return Response.json({ message: "Unsupported mode." }, { status: 400, headers: CORS });
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
