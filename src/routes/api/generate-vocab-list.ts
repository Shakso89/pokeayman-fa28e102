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
          const requestedCount = Number(input.ruleCount) || 0;
          if (!topic) {
            return Response.json({ message: "Please provide a grammar topic." }, { status: 400, headers: CORS });
          }

          const countInstruction = (requestedCount >= 2 && requestedCount <= 6)
            ? `Generate exactly ${requestedCount} distinct, pedagogically clear rules for "${topic}".`
            : `Generate between 2 and 4 distinct, pedagogically clear rules that naturally cover "${topic}" (e.g. Affirmative, Negative, Question form, or essential variations).`;

          const prompt = `You are an expert ESL/EFL English language curriculum developer and teacher for young elementary students.
The teacher wants a Grammar Pattern Deck strictly for the topic: "${topic}" (Target Level: ${level}).

CRITICAL INSTRUCTIONS:
1. ALL generated rules, formulas, sentences, mistakes, and quizzes MUST strictly match and teach "${topic}".
   - If the topic is about Future (e.g. "Simple future", "will", "going to"), EVERY rule MUST teach future forms (e.g. "will + base verb", "will not / won't + base verb", "am/is/are going to + base verb", "Will + Subject + base verb?"). NEVER generate present or past sentences for future topics!
   - If the topic is about Past, teach past forms (regular -ed, irregular past, didn't + base verb).
   - If the topic is about Present Simple, teach habitual actions / facts with base verb / -s / -es and do/does.
   - If the topic is about Present Continuous, teach ongoing actions with am/is/are + verb-ing.
   - If the topic specifies questions (e.g. "What, Where, How many"), generate one rule per specified question word.
2. ${countInstruction}
   - Rule 1: Affirmative / Core Pattern
   - Rule 2: Negative Form (e.g. won't / didn't / is not)
   - Rule 3: Question Form / Word Order Inversion (e.g. Will you...? / Did you...?)
3. DIVERSITY AND CREATIVITY REQUIREMENT:
   - Every rule MUST have a completely UNIQUE, vivid, concrete example sentence featuring distinct characters (e.g. astronaut, chef, detective, scientist, gardener, musician, explorer), animals (e.g. dolphin, panda, tiger, eagle), or colorful locations (e.g. aquarium, spaceship, castle, planetarium, forest).
   - Do NOT use repetitive or generic sentences. Every generation must feel fresh, exciting, and varied!
4. For EACH rule:
   - "title": A clear educational title matching ${topic} (e.g. "Simple Future (will + Base Verb)", "Negative Future (won't)").
   - "formula": The exact formula with "+" signs (e.g. "Subject + will + Base Verb" or "Subject + will not (won't) + Base Verb" or "Will + Subject + Base Verb ?"). NEVER use a generic "Subject + Verb + Object"!
   - "sentence": A concrete, natural, engaging sentence illustrating this exact rule for young learners with vivid nouns/actions.
   - "context_clue": A concise 3-7 word tip (e.g. "Use 'will' for predictions and promises").
   - "mistake_bad": A realistic student mistake for this exact rule.
   - "mistake_good": The corrected sentence.
   - "quiz_question": A fill-in-the-blank question testing this exact rule with parenthesized base verb.
   - "quiz_options": Array of 3 distinct choices.
   - "quiz_answer": The exact correct option.
   - "words_blue": The exact word(s) from sentence matching Part 1 of formula.
   - "words_amber": The exact word(s) from sentence matching Part 2 of formula.
   - "words_green": The exact word(s) from sentence matching Part 3 of formula.
   - "image_keywords": A SINGLE concrete noun (1-2 words only, e.g. "astronaut", "robot", "spaceship", "chef", "beach", "guitar", "castle", "dolphin") drawn from the sentence that will guarantee a great stock photo result.

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
      "words_blue": "...",
      "words_amber": "...",
      "words_green": "...",
      "image_keywords": "..."
    }
  ]
}`;

          try {
            const rawText = await callGemini({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, responseMimeType: "application/json", maxOutputTokens: 2500 },
            });
            const parsed = parseJson(rawText) as any;
            let rules = Array.isArray(parsed?.rules) ? parsed.rules : (Array.isArray(parsed) ? parsed : []);

            if (rules.length === 0) {
              throw new Error("No rules returned by AI model.");
            }

            // Expanded diverse fallback photo library (24 distinct high-resolution educational images)
            const diverseCuratedImages = [
              'https://cdn.pixabay.com/photo/2017/10/04/09/56/laboratory-2815641_640.jpg',
              'https://cdn.pixabay.com/photo/2022/10/15/16/44/night-view-7523474_640.jpg',
              'https://cdn.pixabay.com/photo/2018/07/20/14/01/grapes-3550729_640.jpg',
              'https://cdn.pixabay.com/photo/2019/06/13/09/41/business-4271251_640.png',
              'https://cdn.pixabay.com/photo/2016/11/29/09/32/concept-1868728_640.jpg',
              'https://cdn.pixabay.com/photo/2020/04/19/08/17/watercolor-5062356_640.jpg',
              'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_640.jpg',
              'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_640.jpg',
              'https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_640.jpg',
              'https://cdn.pixabay.com/photo/2017/09/08/00/38/friend-2727307_640.jpg',
              'https://cdn.pixabay.com/photo/2016/11/14/05/15/boy-1822614_640.jpg',
              'https://cdn.pixabay.com/photo/2016/01/19/17/48/woman-1149911_640.jpg',
              'https://cdn.pixabay.com/photo/2016/03/27/19/31/fashion-1283863_640.jpg',
              'https://cdn.pixabay.com/photo/2017/08/01/20/06/city-2567670_640.jpg',
              'https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_640.jpg',
              'https://cdn.pixabay.com/photo/2017/05/13/15/18/dear-2309801_640.jpg',
              'https://cdn.pixabay.com/photo/2017/06/20/22/14/man-2425121_640.jpg',
              'https://cdn.pixabay.com/photo/2018/03/30/15/11/deer-3275594_640.jpg',
              'https://cdn.pixabay.com/photo/2019/05/24/10/59/books-4226038_640.jpg',
              'https://cdn.pixabay.com/photo/2020/05/17/20/34/concept-5183469_640.jpg',
              'https://cdn.pixabay.com/photo/2017/07/31/11/31/laptop-2557468_640.jpg',
              'https://cdn.pixabay.com/photo/2016/11/29/12/30/phone-1869510_640.jpg',
              'https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_640.jpg',
              'https://cdn.pixabay.com/photo/2016/11/29/06/18/home-office-1867761_640.jpg'
            ];

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
              const searchCandidates: string[] = [];

              if (r.image_keywords) {
                const cleanKw = String(r.image_keywords).trim();
                searchCandidates.push(cleanKw);
                cleanKw.split(/\s+/).forEach((w: string) => {
                  if (w.length > 2 && w !== cleanKw) searchCandidates.push(w);
                });
              }

              const kwFromSentence = extractKeywordsFromSentence(r.sentence);
              if (kwFromSentence) {
                kwFromSentence.split(/\s+/).forEach((w: string) => {
                  if (w.length > 2 && !searchCandidates.includes(w)) searchCandidates.push(w);
                });
              }
              if (!searchCandidates.includes(topic)) searchCandidates.push(topic);

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
                r.image = diverseCuratedImages[(i * 3 + Math.floor(Math.random() * 3)) % diverseCuratedImages.length];
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
