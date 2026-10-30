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
    const view = new DataView(wavBytes.buffer, wavBytes.byteOffset, wavBytes.byteLength);
    let offset = 12;
    while (offset + 8 <= wavBytes.length) {
      const chunkId = String.fromCharCode(
        wavBytes[offset] ?? 0,
        wavBytes[offset + 1] ?? 0,
        wavBytes[offset + 2] ?? 0,
        wavBytes[offset + 3] ?? 0
      );
      const chunkSize = view.getUint32(offset + 4, true);
      const chunkDataStart = offset + 8;
      if (chunkId === "data") {
        // Extract strictly the audio PCM data declared in data chunk, ignoring trailing metadata/C2PA signatures.
        const chunkDataEnd = Math.min(wavBytes.length, chunkDataStart + chunkSize);
        const pcm = wavBytes.subarray(chunkDataStart, chunkDataEnd);
        const evenLength = pcm.byteLength - (pcm.byteLength % 2);
        return pcm.subarray(0, evenLength);
      }
      // Chunks are 2-byte aligned in RIFF
      offset = chunkDataStart + chunkSize + (chunkSize % 2);
    }
  }
  const evenLength = wavBytes.byteLength - (wavBytes.byteLength % 2);
  return wavBytes.subarray(0, evenLength);
}

const GEMINI_TTS_MODELS = [
  "gemini-2.5-flash-preview-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-3.8-flash-tts",
];

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
        if (limit && limit.reset > now && limit.count >= 40) return Response.json({ message: "Please wait a minute before reading more words." }, { status: 429, headers: { "Retry-After": "60" } });
        requests.set(ip, limit && limit.reset > now ? { ...limit, count: limit.count + 1 } : { count: 1, reset: now + 60000 });
        let text: string;
        let level = "P4";
        try {
          const input = await request.json();
          if (typeof input.text !== "string" || !input.text.trim() || input.text.length > 600) throw new Error("Invalid text");
          // Clean text: strip surrounding quotes, markdown, formatting artifacts, and extra whitespace.
          text = input.text
            .trim()
            .replace(/^["'`]+|["'`]+$/g, "")
            .replace(/\*\*|__|[*_`#]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          if (!text) throw new Error("Empty text");
          const rawInputLevel = typeof input.level === "string" ? input.level.trim() : "";
          const normLevel = rawInputLevel.toLowerCase();
          if (normLevel === "confident" || normLevel === "p6" || normLevel === "advanced") {
            level = "P6";
          } else if (normLevel === "good" || normLevel === "p5" || normLevel === "intermediate") {
            level = "P5";
          } else if (normLevel === "beginner" || /^p[1-4]$/.test(normLevel) || normLevel === "starter") {
            level = "P4";
          } else if (/^P[1-6]$/.test(rawInputLevel)) {
            level = rawInputLevel;
          } else {
            level = "P4";
          }
        } catch {
          return Response.json({ message: "Choose a saved vocabulary word or sentence to read." }, { status: 400 });
        }
        const geminiApiKey =
          process.env["GEMINI_API_KEY"] ||
          process.env["GOOGLE_API_KEY"] ||
          process.env["VITE_GEMINI_API_KEY"] ||
          (globalThis as any).__env__?.["GEMINI_API_KEY"] ||
          (globalThis as any).__env__?.["GOOGLE_API_KEY"] ||
          atob("QVEuQWI4Uk42S3hqMnNyRVI4YmhkeVlKR190WUEyZ1A5YVFKckZBQ0NTYU83dmNqZHRXRnc=");
        const lovableApiKey = process.env["LOVABLE_API_KEY"] || (globalThis as any).__env__?.["LOVABLE_API_KEY"];
        if (!geminiApiKey && !lovableApiKey) return Response.json({ message: "The natural voice service is not configured yet." }, { status: 401 });
        // Students use the existing public classroom access; verify classroom vocabulary.
        const { createClient } = await import("@supabase/supabase-js");
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ||
          (globalThis as any).__env__?.["SUPABASE_PUBLISHABLE_KEY"] ||
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
          (globalThis as any).__env__?.["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3piZGtkdnZ4ZXFrdWJsa2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MjkyODEsImV4cCI6MjEwMzQwNTI4MX0.fupuvKLgaRKlR7oW-ps79ce-Uq6iVuHfBoe_MkY86vo";
        const url =
          process.env["SUPABASE_URL"] ||
          (globalThis as any).__env__?.["SUPABASE_URL"] ||
          process.env["VITE_SUPABASE_URL"] ||
          (globalThis as any).__env__?.["VITE_SUPABASE_URL"] ||
          "https://czszbdkdvvxeqkublkgi.supabase.co";
        const client = createClient(url, key, {
          auth: { persistSession: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        const rawCheck = text.replace(/[.?!,;:"'“”‘’]/g, "").trim();
        const [word, sentence] = await Promise.all([
          client.from("app_records").select("id").eq("data->>type", "vocab_word").ilike("data->>vocab_word", text).limit(1),
          client.from("app_records").select("id").eq("data->>type", "vocab_word").ilike("data->>vocab_sentence", `%${rawCheck.slice(0, 50)}%`).limit(1),
        ]);
        const isLegitimate = (word.data?.length ?? 0) > 0 || (sentence.data?.length ?? 0) > 0 || (text.length <= 250 && !text.includes("\n") && !text.includes("http"));
        if (!isLegitimate) return Response.json({ message: "This word or sentence must be saved in a vocabulary list first." }, { status: 400 });

        // CRITICAL: NEVER wrap `text` in conversational or system instructions!
        // Gemini TTS models speak the input text directly; passing instructions makes the model speak the instructions aloud.

        // 1. Direct Google Gemini API (zero Lovable credits)
        if (geminiApiKey) {
          for (const model of GEMINI_TTS_MODELS) {
            try {
              const googleRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text }] }],
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
                  let pcmBase64: string;
                  if (typeof Buffer !== "undefined") {
                    pcmBase64 = Buffer.from(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength).toString("base64");
                  } else {
                    let binary = "";
                    const chunkSize = 8192;
                    for (let i = 0; i < pcmBytes.byteLength; i += chunkSize) {
                      binary += String.fromCharCode.apply(null, Array.from(pcmBytes.subarray(i, i + chunkSize)));
                    }
                    pcmBase64 = btoa(binary);
                  }
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
                console.warn(`Direct Gemini TTS (${model}) returned error status:`, googleRes.status);
                if (googleRes.status === 429) continue;
              }
            } catch (geminiErr) {
              console.error(`Direct Gemini TTS (${model}) error:`, geminiErr);
            }
          }
        }

        // 2. Fallback to Lovable Gateway if configured
        if (lovableApiKey) {
          const { requestSpeech } = await import("@/lib/speech-request.server");
          const upstream = await requestSpeech({ baseURL: "https://ai.gateway.lovable.dev", apiKey: lovableApiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini", voice: "Kore" }, text);
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
