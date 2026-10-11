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
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ message: "Sentence generator is not configured yet." }, { status: 401 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            instructions: "You write one short, simple, natural example sentence (6-12 words) for children learning English vocabulary. Use the given word exactly as written. Reply with only the sentence, no quotes.",
            input: `Word: ${word}${avoid ? `\nDo not repeat this sentence: ${avoid}` : ""}`,
          }),
        });
        if (!upstream.ok || !upstream.body) {
          let message = "Could not generate a sentence. Please try again.";
          try { const j = await upstream.json(); if (j?.message) message = j.message; else if (j?.error?.message) message = j.error.message; } catch { /* ignore */ }
          return Response.json({ message }, { status: upstream.status || 502 });
        }
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
        if (!sentence) return Response.json({ message: "Could not generate a sentence. Please try again." }, { status: 502 });
        return Response.json({ sentence });
      },
    },
  },
});
