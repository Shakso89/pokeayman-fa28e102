import { createFileRoute } from "@tanstack/react-router";

const requests = new Map<string, { count: number; reset: number }>();

function extractPCMFromWav(wavBytes: Uint8Array): Uint8Array {
  if (
    wavBytes.length > 44 &&
    wavBytes[0] === 0x52 && // R
    wavBytes[1] === 0x49 && // I
    wavBytes[2] === 0x46 && // F
    wavBytes[3] === 0x46    // F
  ) {
    for (let i = 12; i < Math.min(wavBytes.length - 8, 200); i++) {
      if (
        wavBytes[i] === 0x64 &&     // d
        wavBytes[i + 1] === 0x61 && // a
        wavBytes[i + 2] === 0x74 && // t
        wavBytes[i + 3] === 0x61    // a
      ) {
        return wavBytes.slice(i + 8);
      }
    }
  }
  return wavBytes;
}

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
        let level = "P4";
        try {
          const input = await request.json();
          if (typeof input.text !== "string" || !input.text.trim() || input.text.length > 600) throw new Error("Invalid text");
          text = input.text.trim();
          level = typeof input.level === "string" && /^P[1-6]$/.test(input.level) ? input.level : "P4";
        } catch {
          return Response.json({ message: "Choose a saved vocabulary word or sentence to read." }, { status: 400 });
        }
        const geminiApiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!geminiApiKey && !lovableApiKey) return Response.json({ message: "The natural voice service is not configured yet." }, { status: 401 });
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

        // Map reading levels: P4 = Beginner, P5 = Good, P6 = Confident
        const pacing: Record<string, string> = {
          P1: "Speak slowly, distinctly, and clearly at a gentle beginner classroom pace, with a small pause between words.",
          P2: "Speak slowly, distinctly, and clearly at a gentle beginner classroom pace, with a small pause between words.",
          P3: "Speak at a gentle, clear classroom pace.",
          P4: "Speak slowly, distinctly, and clearly at a gentle beginner classroom pace, with brief pauses between words.",
          P5: "Speak at a steady, natural, clear classroom pace.",
          P6: "Speak at a fluent, lively, confident natural pace.",
        };
        const prompt = `Read only the text below in warm, natural, clear English for a child learning vocabulary. ${pacing[level] || pacing.P4} Use accurate pronunciation and no introduction or extra words.\n\n${text}`;

        // 1. Direct Google Gemini API (zero Lovable credits)
        if (geminiApiKey) {
          try {
            const googleRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" }
                      }
                    }
                  }
                })
              }
            );

            if (googleRes.ok) {
              const data = await googleRes.json();
              const b64Audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
              if (b64Audio) {
                const wavBytes = Uint8Array.from(atob(b64Audio), c => c.charCodeAt(0));
                const pcmBytes = extractPCMFromWav(wavBytes);
                let binary = "";
                for (let i = 0; i < pcmBytes.byteLength; i++) {
                  binary += String.fromCharCode(pcmBytes[i]);
                }
                const pcmBase64 = btoa(binary);
                const ssePayload = `data: ${JSON.stringify({ type: "speech.audio.delta", audio: pcmBase64 })}\n\ndata: ${JSON.stringify({ type: "speech.audio.done" })}\n\n`;

                return new Response(ssePayload, {
                  status: 200,
                  headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                  },
                });
              }
            } else {
              console.warn("Direct Gemini TTS returned error status:", googleRes.status);
            }
          } catch (geminiErr) {
            console.error("Direct Gemini TTS error:", geminiErr);
          }
        }

        // 2. Fallback to Lovable Gateway if configured
        if (lovableApiKey) {
          const { requestSpeech } = await import("@/lib/speech-request.server");
          const upstream = await requestSpeech({ baseURL: "https://ai.gateway.lovable.dev", apiKey: lovableApiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini", voice: "Kore" }, prompt);
          return new Response(upstream.body, {
            status: upstream.status,
            headers: { "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream", "Cache-Control": "no-cache", ...(upstream.headers.has("Retry-After") ? { "Retry-After": upstream.headers.get("Retry-After") || "60" } : {}) },
          });
        }

        return Response.json({ message: "Speech synthesis temporarily unavailable." }, { status: 503 });
      },
    },
  },
});
