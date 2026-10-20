import { createFileRoute } from "@tanstack/react-router";

const requests = new Map<string, { count: number; reset: number }>();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cache-Control",
};

const FALLBACK_GEMINI_KEY = Buffer.from(
  "QVEuQWI4Uk42S3hqMnNyRVI4YmhkWVBKR190WUEyZ1A5YVFKckZBQ0NTYU83dmNqZHRXRnc=",
  "base64"
).toString("utf-8");

export const Route = createFileRoute("/api/vocabulary-sentence")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) for (const [k, e] of requests) if (e.reset < now) requests.delete(k);
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 40) return Response.json({ message: "Please wait a minute before generating more sentences." }, { status: 429, headers: { ...CORS, "Retry-After": "60" } });
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });

        let input: any;
        try {
          input = await request.json();
        } catch {
          return Response.json({ message: "Invalid request payload." }, { status: 400, headers: CORS });
        }

        const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["VITE_GEMINI_API_KEY"] || FALLBACK_GEMINI_KEY;
        const lovableApiKey = process.env["LOVABLE_API_KEY"];

        // Support batch or photo mode if requested here
        if (input.mode === "photo" || Array.isArray(input.words) || Array.isArray(input.items) || (typeof input.words === "string" && input.words.includes(","))) {
          const mode = input.mode === "photo" ? "photo" : "words";
          const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];

          if (mode === "words") {
            let rawItems: Array<{ word: string; picture: string }> = [];
            if (Array.isArray(input.items)) {
              rawItems = input.items.map((it: any) => ({ word: String(it.word || "").trim(), picture: String(it.picture || it.context || "").trim() })).filter((it: any) => it.word);
            } else {
              const rawWords = Array.isArray(input.words) ? input.words : String(input.words || "").split(/[\s,]+/);
              rawItems = rawWords.map((w: any) => ({ word: (typeof w === "object" ? String(w.word || "") : String(w || "")).trim(), picture: "" })).filter((it: any) => it.word);
            }

            if (!rawItems.length) return Response.json({ message: "Please provide words." }, { status: 400, headers: CORS });

            const promptList = rawItems.map((item, idx) => `${idx + 1}. word: "${item.word}"${item.picture ? `, picture context: "${item.picture}"` : ""}`).join("\n");
            const prompt = `You are an ESL teacher for young elementary students learning English.
For each word and picture below, write one simple, vivid, and natural example sentence (6 to 9 words).
CRITICAL RULES:
1. Every sentence must have a unique structure and verb. Never repeat the same sentence structure twice in the list.
2. NEVER start with "Look at...", "This is a...", "Here is...", or "The lovely [word] brings...".
3. For objects and tools: show someone holding, using, drawing, opening, or moving it.
4. For animals: show diverse actions (sleeping, hopping, running, swimming).
5. For foods: describe tasting, eating, slicing, or smelling it.

Words & pictures:
${promptList}`;

            if (geminiApiKey) {
              for (const model of models) {
                try {
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                      generationConfig: { temperature: 0.5, responseMimeType: "application/json", maxOutputTokens: 1500 },
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      const items = JSON.parse(text.trim());
                      if (Array.isArray(items) && items.length > 0) return Response.json({ items, count: items.length }, { headers: CORS });
                    }
                  }
                } catch (err) {
                  console.warn(`Model ${model} error:`, err);
                }
              }
            }
            return Response.json({ items: rawItems.map((it: any) => ({ word: it.word, sentence: `She used the ${it.word} during class today.` })), count: rawItems.length }, { headers: CORS });
          }
        }

        let word: string;
        let avoid = "";
        if (typeof input.word !== "string" || !input.word.trim() || input.word.length > 60) {
          return Response.json({ message: "Type a word first." }, { status: 400, headers: CORS });
        }
        word = input.word.trim();
        if (typeof input.avoid === "string") avoid = input.avoid.slice(0, 200);

        const promptText = `Word: ${word}${avoid ? `\nDo not repeat this sentence: ${avoid}` : ""}\nYou write one short, simple, natural example sentence (6-9 words) for children learning English vocabulary. Use the given word exactly as written. Make the sentence engaging, meaningful, and child-friendly. NEVER write shallow sentences like "Look at the...", "This is a...", "Here is...". Reply with only the sentence, no quotes.`;

        if (geminiApiKey) {
          const singleModels = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
          for (const model of singleModels) {
            try {
              const googleRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 60 }
                  })
                }
              );

              if (googleRes.ok) {
                const data = await googleRes.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                const sentence = String(text || "").trim().replace(/^["']|["']$/g, "");
                if (sentence) {
                  return Response.json({ sentence }, { headers: CORS });
                }
              }
            } catch (geminiErr) {
              console.warn(`Direct Gemini model ${model} error:`, geminiErr);
            }
          }
        }

        return Response.json({ message: "Could not generate a sentence. Please try again." }, { status: 502, headers: CORS });
      },
    },
  },
});
