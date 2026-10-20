import { createFileRoute } from "@tanstack/react-router";

const requests = new Map<string, { count: number; reset: number }>();

export const Route = createFileRoute("/api/vocabulary-sentence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "Available inside PokéAyman only." }, { status: 403 });
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) for (const [k, e] of requests) if (e.reset < now) requests.delete(k);
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 20) return Response.json({ message: "Please wait a minute before generating more sentences." }, { status: 429, headers: { "Retry-After": "60" } });
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });

        let input: any;
        try {
          input = await request.json();
        } catch {
          return Response.json({ message: "Invalid request payload." }, { status: 400 });
        }

        const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!geminiApiKey && !lovableApiKey) return Response.json({ message: "Sentence generator is not configured yet." }, { status: 401 });

        // Support batch or photo mode if requested here
        if (input.mode === "photo" || Array.isArray(input.words) || (typeof input.words === "string" && input.words.includes(","))) {
          const mode = input.mode === "photo" ? "photo" : "words";
          const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];

          if (mode === "words") {
            const rawWords = Array.isArray(input.words) ? input.words : String(input.words || "").split(/[\n,]+/);
            const words = rawWords.map((w: any) => String(w || "").trim()).filter((w: string) => w.length > 0 && w.length <= 60).slice(0, 30);
            if (!words.length) return Response.json({ message: "Please provide words." }, { status: 400 });

            const prompt = `You are an ESL teacher for young elementary students learning English.
For each of the following words, write one short, clear, natural, and simple example sentence (5 to 8 words maximum).
Requirements:
1. Use simple everyday words that young children understand.
2. The sentence MUST contain the main word.
3. Make each sentence descriptive and visual.
4. Avoid complex grammar.
5. Return ONLY a valid JSON array of objects with keys "word" and "sentence".

Words: ${words.join(", ")}`;

            if (geminiApiKey) {
              for (const model of models) {
                try {
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                      generationConfig: { temperature: 0.4, responseMimeType: "application/json", maxOutputTokens: 1024 },
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      const items = JSON.parse(text.trim());
                      if (Array.isArray(items) && items.length > 0) return Response.json({ items, count: items.length });
                    }
                  }
                } catch (err) {
                  console.warn(`Model ${model} error:`, err);
                }
              }
            }
            return Response.json({ items: words.map((w: string) => ({ word: w, sentence: `Look at the ${w}.` })), count: words.length });
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
            if (!base64Data) return Response.json({ message: "No image provided." }, { status: 400 });

            const count = Math.min(Math.max(Number(input.count) || 5, 2), 15);
            const prompt = `You are an ESL teacher for elementary students.
Analyze this photo and identify exactly ${count} clear, kid-friendly vocabulary items in the picture.
For each item:
1. Provide the main vocabulary word.
2. Write one short, simple example sentence (5 to 8 words maximum) describing what is seen or happening in the photo.
3. Return ONLY a valid JSON array of objects with keys "word" and "sentence".`;

            if (geminiApiKey) {
              for (const model of models) {
                try {
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }],
                      generationConfig: { temperature: 0.4, responseMimeType: "application/json", maxOutputTokens: 1024 },
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      const items = JSON.parse(text.trim());
                      if (Array.isArray(items) && items.length > 0) return Response.json({ items, count: items.length });
                    }
                  }
                } catch (err) {
                  console.warn(`Photo mode model ${model} error:`, err);
                }
              }
            }
            return Response.json({ message: "Could not identify vocabulary from photo." }, { status: 502 });
          }
        }

        let word: string;
        let avoid = "";
        if (typeof input.word !== "string" || !input.word.trim() || input.word.length > 60) {
          return Response.json({ message: "Type a word first." }, { status: 400 });
        }
        word = input.word.trim();
        if (typeof input.avoid === "string") avoid = input.avoid.slice(0, 200);

        const promptText = `Word: ${word}${avoid ? `\nDo not repeat this sentence: ${avoid}` : ""}\nYou write one short, simple, natural example sentence (6-12 words) for children learning English vocabulary. Use the given word exactly as written. Reply with only the sentence, no quotes.`;

        // 1. Direct Google Gemini API (gemini-3.5-flash-lite first, then gemini-3.8-flash)
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
                  return Response.json({ sentence });
                }
              }
            } catch (geminiErr) {
              console.warn(`Direct Gemini model ${model} error:`, geminiErr);
            }
          }
        }

        // 2. Fallback to Lovable Gateway if configured
        if (lovableApiKey) {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableApiKey}`, "X-Lovable-AIG-SDK": "fetch" },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              stream: true,
              store: false,
              reasoning: { effort: "low" },
              instructions: "You write one short, simple, natural example sentence (6-12 words) for children learning English vocabulary. Use the given word exactly as written. Reply with only the sentence, no quotes.",
              input: `Word: ${word}${avoid ? `\nDo not repeat this sentence: ${avoid}` : ""}`,
            }),
          });
          if (upstream.ok && upstream.body) {
            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();
            let buf = "";
            let text = "";
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              let idx;
              while ((idx = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, idx).trim();
                buf = buf.slice(idx + 1);
                if (!line.startsWith("data:")) continue;
                const payload = line.slice(5).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const evt = JSON.parse(payload);
                  if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
                } catch { /* partial */ }
              }
            }
            const sentence = text.trim().replace(/^["']|["']$/g, "");
            if (sentence) return Response.json({ sentence });
          }
        }

        return Response.json({ message: "Could not generate a sentence. Please try again." }, { status: 502 });
      },
    },
  },
});
