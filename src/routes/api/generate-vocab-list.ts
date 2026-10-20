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
        if (limit && limit.reset > now && limit.count >= 30) {
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
        const lovableApiKey = process.env["LOVABLE_API_KEY"];

        const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];

        if (mode === "words") {
          // Normalize words input: can be array of strings, or array of { word, picture }
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
            rawItems = input.words
              .split(/[\s,]+/)
              .map((w: string) => ({
                word: w.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""),
                picture: "",
              }))
              .filter((it: any) => it.word.length > 0 && it.word.length <= 60)
              .slice(0, 30);
          }

          if (rawItems.length === 0) {
            return Response.json({ message: "Please enter at least one word to generate a list." }, { status: 400 });
          }

          const promptList = rawItems
            .map((item, idx) => `${idx + 1}. word: "${item.word}"${item.picture ? `, picture shows: "${item.picture}"` : ""}`)
            .join("\n");

          const prompt = `You are an English language teacher for young ESL elementary students.
For each word and matching picture below, write one simple, vivid, natural example sentence (6 to 9 words).

CRITICAL REQUIREMENTS:
1. NEVER write shallow, repetitive, or robotic sentences like "Look at the...", "This is a...", "Here is a...", "I see a...". Make the sentence meaningful and active!
2. If the word is an animal: describe what the animal is doing or its gentle appearance based on the picture (e.g. "The fluffy cat sleeps peacefully on the sofa.", "A playful dog fetches the ball in the yard.").
3. If the word is a food: describe eating, tasting, or smelling it (e.g. "The sweet red apple tastes juicy and fresh.", "We slice the yellow banana for our breakfast.").
4. If the word is a color: describe a vivid object of that color (e.g. "A bright blue butterfly flutters over the flowers.", "The shiny yellow sun warms the morning air.").
5. If the word is an action or general noun: use it naturally in an everyday kid-friendly setting.
6. The target word MUST be used exactly as given.
7. Return ONLY a valid JSON array of objects with keys "word" and "sentence".

Words & pictures:
${promptList}`;

          let items: Array<{ word: string; sentence: string }> = [];

          // 1. Google Gemini Flash
          if (geminiApiKey) {
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
          }

          // 2. Fallback to Lovable Gateway if Gemini failed
          if (items.length === 0 && lovableApiKey) {
            try {
              const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${lovableApiKey}`,
                  "X-Lovable-AIG-SDK": "fetch",
                },
                body: JSON.stringify({
                  model: "openai/gpt-5-mini",
                  stream: false,
                  instructions: "You write simple, natural, vivid example sentences (6 to 9 words) for children learning English. NEVER start with 'Look at...' or 'This is a...'. Return ONLY valid JSON array with objects containing 'word' and 'sentence'.",
                  input: prompt,
                }),
              });
              if (upstream.ok) {
                const data = await upstream.json();
                const text = data?.output_text || data?.choices?.[0]?.message?.content || "";
                if (text) {
                  const parsed = JSON.parse(text.trim());
                  if (Array.isArray(parsed)) {
                    items = parsed.map((it: any) => ({
                      word: String(it.word || "").trim(),
                      sentence: String(it.sentence || "").trim().replace(/^["']|["']$/g, ""),
                    }));
                  }
                }
              }
            } catch (lovErr) {
              console.warn("Lovable gateway fallback failed:", lovErr);
            }
          }

          // 3. Fallback: Smart varied kid-friendly templates (NEVER "Look at...")
          if (items.length === 0) {
            items = rawItems.map(item => {
              const w = item.word;
              const lw = w.toLowerCase();
              let sentence = "";
              // Animals
              if (/^(cat|dog|bird|fish|lion|tiger|bear|horse|monkey|cow|pig|rabbit|duck|frog|elephant|giraffe|zebra|puppy|kitten|wolf|fox|deer|sheep|mouse|turtle)$/.test(lw)) {
                sentence = `The furry ${w} plays happily in the warm sun.`;
              }
              // Foods
              else if (/^(apple|banana|orange|grape|fruit|bread|pizza|cake|cookie|milk|water|rice|cheese|berry|mango|soup|sandwich|juice|egg|meat)$/.test(lw)) {
                sentence = `The sweet ${w} tastes fresh and delicious today.`;
              }
              // Colors
              else if (/^(red|blue|green|yellow|pink|purple|orange|white|black|brown|golden|gray|grey)$/.test(lw)) {
                sentence = `A lovely ${w} bird flies across the sunny garden.`;
              }
              // Verbs / Actions
              else if (/^(run|jump|play|sing|dance|swim|walk|read|write|sleep|eat|drink|smile|laugh)$/.test(lw)) {
                sentence = `Children love to ${w} together with their friends.`;
              }
              // General
              else {
                sentence = `The lovely ${w} brings a bright smile to everyone.`;
              }
              return { word: w, sentence };
            });
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
Analyze this photo and identify exactly ${targetCount} clear, visible objects, animals, food, or actions in the picture.
For each item:
1. Provide the main vocabulary word.
2. Write one simple, vivid, natural sentence (6 to 9 words) describing that object or action in the photo.
3. NEVER write lazy or shallow sentences like "Look at the...", "This is a...", "Here is a...", "I see a...".
4. Make sentences descriptive, friendly, and easy to understand for young children.
5. Return ONLY a valid JSON array of objects with keys "word" and "sentence".`;

          let items: Array<{ word: string; sentence: string }> = [];
          if (geminiApiKey) {
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
