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

        let word: string;
        let avoid = "";
        try {
          const input = await request.json();
          if (typeof input.word !== "string" || !input.word.trim() || input.word.length > 60) throw new Error();
          word = input.word.trim();
          if (typeof input.avoid === "string") avoid = input.avoid.slice(0, 200);
        } catch {
          return Response.json({ message: "Type a word first." }, { status: 400 });
        }
        const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!geminiApiKey && !lovableApiKey) return Response.json({ message: "Sentence generator is not configured yet." }, { status: 401 });

        const promptText = `Word: ${word}${avoid ? `\nDo not repeat this sentence: ${avoid}` : ""}\nYou write one short, simple, natural example sentence (6-12 words) for children learning English vocabulary. Use the given word exactly as written. Reply with only the sentence, no quotes.`;

        // 1. Direct Google Gemini API (zero Lovable credits)
        if (geminiApiKey) {
          try {
            const googleRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        { text: promptText }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 60
                  }
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
            } else {
              console.warn("Direct Gemini sentence generator returned error status:", googleRes.status);
            }
          } catch (geminiErr) {
            console.error("Direct Gemini sentence generator error:", geminiErr);
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
