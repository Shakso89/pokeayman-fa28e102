import { createParser } from "eventsource-parser";
import {
  getCachedAudio,
  saveCachedAudio,
  pcmToWavBlob,
  requestPersistentStorage,
  getAudioCacheStats,
  clearAudioCache,
} from "./audio-cache";

export {
  getCachedAudio,
  saveCachedAudio,
  pcmToWavBlob,
  requestPersistentStorage,
  getAudioCacheStats,
  clearAudioCache,
};

export function decodePCM(pending: Uint8Array, incoming: Uint8Array) {
  const bytes = new Uint8Array(pending.length + incoming.length);
  bytes.set(pending);
  bytes.set(incoming, pending.length);
  const usable = bytes.length - (bytes.length % 2);
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(usable / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
  return { samples, pending: bytes.slice(usable) };
}

export async function streamSpeech(endpoint: string, text: string, level = "P3", signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  const cleanText = text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\*\*|__|[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanText) return;

  const context = new AudioContext({ sampleRate: 24000 });
  const masterGain = context.createGain();
  masterGain.connect(context.destination);

  const sources = new Set<AudioBufferSourceNode>();
  let playhead = 0;
  let pending = new Uint8Array(0);
  let completed = false;
  let samplesPlayed = 0;
  const controller = new AbortController();
  const abort = () => {
    controller.abort(signal?.reason);
    try {
      masterGain.gain.setValueAtTime(masterGain.gain.value, context.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.01);
    } catch {}
    for (const source of sources) {
      try { source.stop(); } catch {}
    }
  };
  signal?.addEventListener("abort", abort, { once: true });
  let playback: Promise<void> = Promise.resolve();

  try {
    if (context.state === "suspended") await context.resume();
    const normalizedLevel = /^P[1-6]$/.test(level) ? level : "P3";

    // 1. Check permanent IndexedDB audio cache (0ms latency, survives browser restarts)
    const cachedBlob = await getCachedAudio(cleanText, normalizedLevel, "kore").catch(() => null);
    if (cachedBlob) {
      try {
        const arrayBuffer =
          typeof cachedBlob.arrayBuffer === "function"
            ? await cachedBlob.arrayBuffer()
            : await new Response(cachedBlob).arrayBuffer();
        const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          const promise = context.decodeAudioData(arrayBuffer, resolve, reject);
          if (promise && typeof promise.then === "function") {
            promise.then(resolve, reject);
          }
        });

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(masterGain);
        sources.add(source);

        playback = new Promise<void>((resolve) => {
          source.onended = () => {
            sources.delete(source);
            resolve();
          };
        });

        playhead = Math.max(context.currentTime + 0.02, 0);
        source.start(playhead);
        playhead += audioBuffer.duration;

        if (playhead > context.currentTime) {
          const fadeStart = Math.max(context.currentTime, playhead - 0.02);
          masterGain.gain.setValueAtTime(1, fadeStart);
          masterGain.gain.linearRampToValueAtTime(0, playhead);
        }

        await playback;
        signal?.throwIfAborted();
        await new Promise((r) => setTimeout(r, 60));
        return;
      } catch (cacheDecodeErr) {
        console.warn("[vocabulary-speech] Cached audio playback fallback to network:", cacheDecodeErr);
      }
    }

    // 2. Fallback to CacheStorage or network streaming
    const cacheKey = new Request(`${location.origin}/__vocabulary_audio/kore-v4/${normalizedLevel}/${encodeURIComponent(cleanText)}`);
    const cache = await caches.open("pokeayman-natural-voice-v4").catch(() => null);
    const cached = await cache?.match(cacheKey);
    const response = cached || await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, level: normalizedLevel }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      const body = await response.text();
      let message = "The reading voice is unavailable right now.";
      try {
        const error = JSON.parse(body);
        message = error.message || error.error?.message || message;
      } catch { /* Never expose an HTML error page. */ }
      throw new Error(message);
    }
    const reusable = cached ? null : response.clone();
    const pcmChunks: Uint8Array[] = [];

    const parser = createParser({
      onEvent(event) {
        const payload = JSON.parse(event.data) as { type: string; audio?: string; message?: string; error?: { message?: string } };
        if (payload.type === "error" || payload.error) throw new Error(payload.error?.message || payload.message || "The reading voice could not finish this audio.");
        if (payload.type === "speech.audio.done") {
          completed = true;
          return;
        }
        if (payload.type !== "speech.audio.delta") return;
        if (completed || !payload.audio) throw new Error("Invalid speech audio event");

        const rawChunk = Uint8Array.from(atob(payload.audio), (c) => c.charCodeAt(0));
        pcmChunks.push(rawChunk);

        const decoded = decodePCM(
          pending,
          rawChunk,
        );
        pending = new Uint8Array(decoded.pending);
        if (!decoded.samples.length) return;
        samplesPlayed += decoded.samples.length;
        const buffer = context.createBuffer(1, decoded.samples.length, 24000);
        buffer.copyToChannel(decoded.samples, 0);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(masterGain);
        sources.add(source);
        playback = new Promise<void>((resolve) => {
          source.onended = () => {
            sources.delete(source);
            resolve();
          };
        });
        // Device startup can clip audio scheduled exactly at currentTime.
        playhead = Math.max(playhead, context.currentTime + 0.05);
        source.start(playhead);
        playhead += buffer.duration;
      },
    });
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        parser.feed(next.value);
      }
      parser.reset({ consume: true });
    } finally {
      reader.releaseLock();
    }
    if (!completed || !samplesPlayed || pending.length) throw new Error("Incomplete speech stream");
    if (cache && reusable) await cache.put(cacheKey, reusable).catch(() => {});

    // Save permanently to IndexedDB so subsequent plays are instant and offline-ready
    if (pcmChunks.length > 0) {
      const totalBytes = pcmChunks.reduce((sum, c) => sum + c.byteLength, 0);
      const combinedPcm = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of pcmChunks) {
        combinedPcm.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const wavBlob = pcmToWavBlob(combinedPcm, 24000);
      saveCachedAudio(cleanText, normalizedLevel, wavBlob, "kore").catch(() => {});
    }

    // Smooth de-click fade at the end of the scheduled audio to prevent DC offset clicks
    if (playhead > context.currentTime) {
      const fadeStart = Math.max(context.currentTime, playhead - 0.02);
      masterGain.gain.setValueAtTime(1, fadeStart);
      masterGain.gain.linearRampToValueAtTime(0, playhead);
    }

    await playback;
    signal?.throwIfAborted();
    // Allow hardware audio ring buffers (e.g. WASAPI / CoreAudio) to fully flush before tearing down audio context
    await new Promise((r) => setTimeout(r, 60));
  } catch (err) {
    if (signal?.aborted) return;
    throw err;
  } finally {
    signal?.removeEventListener("abort", abort);
    controller.abort();
    for (const source of sources) {
      try { source.stop(); } catch {}
    }
    await context.close().catch(() => {});
  }
}

/**
 * Pre-caches audio for an array of vocabulary words in background without playing sound.
 * Checks IndexedDB first; if already cached, skips immediately to avoid regenerating.
 * If uncached, requests speech from /api/vocabulary-speech in parallel batches (concurrency: 3),
 * collects PCM audio chunks, converts to WAV blob, and saves directly to IndexedDB permanent audio cache.
 */
export async function prefetchVocabularySpeechList(
  words: (string | { vocab_word?: string; word?: string })[],
  level = "P3",
  onProgress?: (cachedCount: number, total: number) => void
): Promise<{ cached: number; fetched: number; total: number }> {
  const normalizedLevel = /^P[1-6]$/i.test(level) ? level.toUpperCase() : "P3";
  const uniqueWords: string[] = [];
  const seen = new Set<string>();

  for (const item of words) {
    const raw = typeof item === "string" ? item : (item?.vocab_word || item?.word || "");
    const clean = String(raw || "")
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\*\*|__|[*_`#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      uniqueWords.push(clean);
    }
  }

  const total = uniqueWords.length;
  if (!total) return { cached: 0, fetched: 0, total: 0 };

  let cachedCount = 0;
  let fetchedCount = 0;

  // 1. Instant check: which words are already cached?
  const uncachedWords: string[] = [];
  await Promise.all(
    uniqueWords.map(async (word) => {
      const existing = await getCachedAudio(word, normalizedLevel, "kore").catch(() => null);
      if (existing) {
        cachedCount++;
      } else {
        uncachedWords.push(word);
      }
    })
  );

  onProgress?.(cachedCount, total);

  if (!uncachedWords.length) {
    return { cached: cachedCount, fetched: 0, total };
  }

  // 2. Fetch uncached words concurrently (concurrency: 3)
  const queue = [...uncachedWords];
  const fetchSingleWord = async (word: string) => {
    try {
      const response = await fetch("/api/vocabulary-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, level: normalizedLevel }),
      });

      if (!response.ok || !response.body) {
        return;
      }

      const pcmChunks: Uint8Array[] = [];
      let completed = false;

      const parser = createParser({
        onEvent(event) {
          const payload = JSON.parse(event.data) as {
            type: string;
            audio?: string;
          };
          if (payload.type === "speech.audio.done") {
            completed = true;
            return;
          }
          if (payload.type !== "speech.audio.delta" || completed || !payload.audio) return;
          const rawChunk = Uint8Array.from(atob(payload.audio), (c) => c.charCodeAt(0));
          pcmChunks.push(rawChunk);
        },
      });

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          parser.feed(next.value);
        }
        parser.reset({ consume: true });
      } finally {
        reader.releaseLock();
      }

      if (pcmChunks.length > 0) {
        const totalBytes = pcmChunks.reduce((sum, c) => sum + c.byteLength, 0);
        const combinedPcm = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of pcmChunks) {
          combinedPcm.set(chunk, offset);
          offset += chunk.byteLength;
        }
        const wavBlob = pcmToWavBlob(combinedPcm, 24000);
        await saveCachedAudio(word, normalizedLevel, wavBlob, "kore").catch(() => {});
        fetchedCount++;
      }
    } catch (err) {
      console.warn(`[vocabulary-speech] Failed to pre-cache voice for "${word}":`, err);
    } finally {
      onProgress?.(cachedCount + fetchedCount, total);
    }
  };

  const concurrency = Math.min(3, queue.length);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const nextWord = queue.shift();
      if (!nextWord) break;
      await fetchSingleWord(nextWord);
    }
  });

  await Promise.all(workers);

  return { cached: cachedCount, fetched: fetchedCount, total };
}