import { createFileRoute } from "@tanstack/react-router";
import { SentenceAiError, askSentenceModel, normalizeWord, sentenceHasWord, callGemini } from "@/lib/vocab-sentences";
import { matchVocabularyMedia } from "@/lib/vocab-media";
import { isMediaType, searchStockMedia } from "@/lib/stock-media";

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

        
        const extractKeywordsFromSentence = (sentence: string): string => {
          if (!sentence) return '';
          const clean = sentence.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
          const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
            'will', 'going', 'not', 'won', 't', 'don', 'doesn', 'didn', 'can', 'could', 'should', 'would',
            'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
            'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'we', 'they', 'you',
            'he', 'she', 'it', 'me', 'him', 'us', 'them', 'tomorrow', 'yesterday', 'today', 'now', 'soon'
          ]);
          const words = clean.split(' ').filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
          return words.slice(0, 2).join(' ');
        };

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
The teacher wants a Grammar Pattern Deck strictly for the topic: "${topic}" (Target Level: ${level}).

CRITICAL INSTRUCTIONS:
1. ALL generated rules, formulas, sentences, mistakes, and quizzes MUST strictly match and teach "${topic}".
   - For example:
     - If the topic is about Future (e.g. "Simple future", "will", "going to"), EVERY rule MUST teach future forms (e.g. "will + base verb", "will not / won't + base verb", "am/is/are going to + base verb", "Will + Subject + base verb?"). NEVER generate present simple or present continuous sentences for a future topic!
     - If the topic is about Past (e.g. "Past simple", "irregular past"), EVERY rule MUST teach past tense (regular -ed, irregular past, didn't + base verb).
     - If the topic is about Present Simple, teach habitual facts with base verb / -s / -es and do/does.
     - If the topic is about Present Continuous, teach actions happening right now with am/is/are + verb-ing.
     - If the topic specifies questions (e.g. "What, Where, How many"), generate one rule per specified question word.
2. Generate 2 to 4 distinct, pedagogically clear rules for "${topic}":
   - Rule 1: Affirmative / Core Pattern
   - Rule 2: Negative Form (e.g. won't / didn't / is not)
   - Rule 3: Question Form / Word Order Inversion (e.g. Will you...? / Did you...?)
3. For EACH rule:
   - "title": A clear educational title matching ${topic} (e.g. "Simple Future (will + Base Verb)", "Negative Future (won't)").
   - "formula": The exact formula with "+" signs (e.g. "Subject + will + Base Verb" or "Subject + will not (won't) + Base Verb" or "Will + Subject + Base Verb ?"). NEVER use a generic "Subject + Verb + Object" unless teaching basic SVO!
   - "sentence": A clear, natural, concrete sentence illustrating this exact rule for young learners with vivid nouns/actions (e.g. "Tomorrow, the students will build a robot in science class." or "She will read a book about dinosaurs tonight.").
   - "context_clue": A concise 3-7 word tip (e.g. "Use 'will' for future predictions or promises").
   - "mistake_bad": A realistic student mistake for this exact rule (e.g. "She will visits the zoo tomorrow.").
   - "mistake_good": The corrected sentence (e.g. "She will visit the zoo tomorrow.").
   - "quiz_question": A fill-in-the-blank question testing this exact rule (e.g. "Tomorrow, the astronaut _____ (travel) to the Moon.").
   - "quiz_options": Array of 3 distinct choices (e.g. ["will travel", "traveling", "traveled"]).
   - "quiz_answer": The exact correct option (e.g. "will travel").
   - "image_keywords": 2 to 3 concrete nouns/verbs taken directly from the example sentence to find a photo illustrating that specific sentence (e.g. "robot build", "space astronaut", "dinosaur book").

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
      "image_keywords": "..."
    }
  ]
}`;

          try {
            const rawText = await callGemini({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 2500 },
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

              // Pick photo strictly related to the example sentence
              let photoFound = false;
              const searchCandidates = [
                String(r.image_keywords || '').trim(),
                extractKeywordsFromSentence(r.sentence),
                topic
              ].filter(Boolean);

              for (const queryStr of searchCandidates) {
                try {
                  const stock = await searchStockMedia(queryStr, "all", 6);
                  const goodPhoto = stock?.photos?.find((p: any) => {
                    const url = p?.src?.medium || p?.src?.large;
                    return url && !url.includes('pixabay.com/get/');
                  });
                  if (goodPhoto) {
                    r.image = goodPhoto.src.medium || goodPhoto.src.large;
                    photoFound = true;
                    break;
                  }
                } catch (e) {
                  console.warn(`[grammar-ai] Stock search failed for "${queryStr}":`, e);
                }
              }

              if (!photoFound || !r.image) {
                const curated = [
                  'https://cdn.pixabay.com/photo/2026/02/01/09/12/elephant-10098979_640.jpg',
                  'https://cdn.pixabay.com/photo/2021/02/08/16/03/dinosaur-5995333_640.png',
                  'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg',
                  'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg'
                ];
                r.image = curated[i % curated.length];
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
