import { createFileRoute } from "@tanstack/react-router";

const requests = new Map<string, { count: number; reset: number }>();

export const Route = createFileRoute("/api/generate-vocab-list")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
          return Response.json({ message: "Available inside PokéAyman only." }, { status: 403 });
        }
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) {
          for (const [k, e] of requests) if (e.reset < now) requests.delete(k);
        }
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 25) {
          return Response.json(
            { message: "Please wait a minute before generating more vocabulary lists." },
            { status: 429, headers: { "Retry-After": "60" } }
          );
        }
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });

        let input: any;
        try {
          input = await request.json();
        } catch {
          return Response.json({ message: "Invalid request payload." }, { status: 400 });
        }

        const mode = input?.mode === "photo" ? "photo" : "words";
        const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];

        if (!geminiApiKey) {
          return Response.json({ message: "Vocabulary AI generator is not configured yet (missing Gemini key)." }, { status: 401 });
        }

        const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];

        if (mode === "words") {
          let words: string[] = [];
          if (Array.isArray(input.words)) {
            words = input.words
              .map((w: any) => String(w || "").trim())
              .filter((w: string) => w.length > 0 && w.length <= 60)
              .slice(0, 30);
          } else if (typeof input.words === "string") {
            words = input.words
              .split(/[\n,]+/)
              .map((w: string) => w.trim())
              .filter((w: string) => w.length > 0 && w.length <= 60)
              .slice(0, 30);
          }

          if (words.length === 0) {
            return Response.json({ message: "Please enter at least one word to generate a list." }, { status: 400 });
          }

          const prompt = `You are an English language teacher for young ESL elementary students.
For each of the following words, write one short, clear, natural, and simple example sentence (5 to 8 words maximum).
Requirements:
1. Use simple everyday words that elementary school students easily understand.
2. The sentence MUST contain the main word.
3. Make each sentence descriptive and visual (e.g. "The red apple is very sweet.").
4. Avoid complex or confusing grammar.
5. Return ONLY a valid JSON array of objects with keys "word" and "sentence".

Words: ${words.join(", ")}`;

          let items: Array<{ word: string; sentence: string }> = [];
          for (const model of models) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                      temperature: 0.4,
                      responseMimeType: "application/json",
                      maxOutputTokens: 1024,
                    },
                  }),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  const parsed = JSON.parse(rawText.trim());
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    items = parsed
                      .map((item: any) => ({
                        word: String(item.word || "").trim(),
                        sentence: String(item.sentence || "").trim().replace(/^["']|["']$/g, ""),
                      }))
                      .filter((item: any) => item.word && item.sentence);
                    if (items.length > 0) break;
                  }
                }
              }
            } catch (err) {
              console.warn(`Model ${model} failed in words mode:`, err);
            }
          }

          if (items.length === 0) {
            // Fallback generation
            items = words.map(w => ({
              word: w,
              sentence: `Look at the ${w}.`,
            }));
          }

          return Response.json({ items, count: items.length });
        }

        if (mode === "photo") {
          let base64Data = "";
          let mimeType = "image/jpeg";

          if (typeof input.image === "string" && input.image) {
            const match = input.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64Data = match[2];
            } else {
              base64Data = input.image.trim();
              if (typeof input.mimeType === "string") mimeType = input.mimeType;
            }
          }

          if (!base64Data) {
            return Response.json({ message: "Please upload a photo first." }, { status: 400 });
          }

          const targetCount = Math.min(Math.max(Number(input.count) || 5, 2), 15);
          const prompt = `You are an English language teacher for young ESL elementary students.
Analyze this photo and identify exactly ${targetCount} clear, visible objects, actions, or kid-friendly vocabulary items in the picture.
For each item:
1. Provide the main vocabulary word (single word or common 2-word compound noun).
2. Write one short, simple, and clear example sentence (5 to 8 words maximum) describing what is seen or happening in the photo.
3. Keep sentences short, vivid, and easy to understand for young children.
4. Return ONLY a valid JSON array of objects with keys "word" and "sentence".`;

          let items: Array<{ word: string; sentence: string }> = [];
          for (const model of models) {
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [
                      {
                        parts: [
                          { text: prompt },
                          {
                            inlineData: {
                              mimeType,
                              data: base64Data,
                            },
                          },
                        ],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.4,
                      responseMimeType: "application/json",
                      maxOutputTokens: 1024,
                    },
                  }),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  const parsed = JSON.parse(rawText.trim());
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    items = parsed
                      .map((item: any) => ({
                        word: String(item.word || "").trim(),
                        sentence: String(item.sentence || "").trim().replace(/^["']|["']$/g, ""),
                      }))
                      .filter((item: any) => item.word && item.sentence);
                    if (items.length > 0) break;
                  }
                }
              }
            } catch (err) {
              console.warn(`Model ${model} failed in photo mode:`, err);
            }
          }

          if (items.length === 0) {
            return Response.json(
              { message: "Could not identify vocabulary from this photo. Please try another photo or enter words directly." },
              { status: 502 }
            );
          }

          return Response.json({ items, count: items.length });
        }

        return Response.json({ message: "Unsupported mode." }, { status: 400 });
      },
    },
  },
});
