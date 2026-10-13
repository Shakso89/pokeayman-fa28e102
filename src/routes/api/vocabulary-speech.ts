import { createFileRoute } from "@tanstack/react-router";

const requests = new Map<string, { count: number; reset: number }>();

export const Route = createFileRoute("/api/vocabulary-speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return Response.json({ message: "This voice is available inside PokéAyman only." }, { status: 403 });
        const ip = request.headers.get("cf-connecting-ip") || "preview";
        const now = Date.now();
        if (requests.size > 1000) for (const [key, entry] of requests) if (entry.reset < now) requests.delete(key);
        const limit = requests.get(ip);
        if (limit && limit.reset > now && limit.count >= 30) return Response.json({ message: "Please wait a minute before reading more words." }, { status: 429, headers: { "Retry-After": "60" } });
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });
        let text: string;
        let level = "P3";
        try {
          const input = await request.json();
          if (typeof input.text !== "string" || !input.text.trim() || input.text.length > 600) throw new Error("Invalid text");
          text = input.text.trim();
          level = typeof input.level === "string" && /^P[1-6]$/.test(input.level) ? input.level : "P3";
        } catch {
          return Response.json({ message: "Choose a saved vocabulary word or sentence to read." }, { status: 400 });
        }
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ message: "The natural voice service is not configured yet." }, { status: 401 });
        // Students use the existing public classroom access; never allow arbitrary paid synthesis.
        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
        const client = createClient(url, key, {
          auth: { persistSession: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        const [word, sentence] = await Promise.all([
          client.from("app_records").select("id").eq("data->>type", "vocab_word").eq("data->>vocab_word", text).limit(1),
          client.from("app_records").select("id").eq("data->>type", "vocab_word").eq("data->>vocab_sentence", text).limit(1),
        ]);
        if (word.error || sentence.error) return Response.json({ message: "Could not load this vocabulary. Please try again later." }, { status: 503 });
        if (!word.data?.length && !sentence.data?.length) return Response.json({ message: "This word or sentence must be saved in a vocabulary list first." }, { status: 400 });
        const { requestSpeech } = await import("@/lib/speech-request.server");
        const pacing: Record<string, string> = { P1: "Speak very slowly, with clear pauses between words.", P2: "Speak slowly and clearly, with a little space between words.", P3: "Speak at a gentle, clear classroom pace.", P4: "Speak at a steady, natural classroom pace.", P5: "Speak at a confident, natural pace.", P6: "Speak at a fluent, natural pace." };
        const upstream = await requestSpeech({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini", voice: "Kore" }, `Read only the text below in warm, natural, clear English for a child learning vocabulary. ${pacing[level]} Use accurate pronunciation and no introduction or extra words.\n\n${text}`);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: { "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream", "Cache-Control": "no-cache", ...(upstream.headers.has("Retry-After") ? { "Retry-After": upstream.headers.get("Retry-After") || "60" } : {}) },
        });
      },
    },
  },
});
