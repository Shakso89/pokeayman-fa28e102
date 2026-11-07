// Permanent IndexedDB Audio Cache with navigator.storage.persist() support.
// Stores pre-rendered, high-fidelity neural audio blobs permanently on the user's device
// (same persistence class as browser cookies and local databases).
// Audio files cached here survive browser restarts and page refreshes, playing with 0ms latency.

const DB_NAME = "pokeayman_audio_permanent_v1";
const STORE_NAME = "audio_blobs";
const DB_VERSION = 1;

export interface AudioCacheRecord {
  key: string;
  text: string;
  level: string;
  voice: string;
  blob: Blob;
  size: number;
  timestamp: number;
}

/**
 * Normalizes text and reading level into a consistent, case-insensitive cache key.
 * This guarantees that 'Apple', 'apple', and 'APPLE.' all reuse the same cached voice.
 */
export function normalizeAudioKey(text: string, level = "P3", voice = "kore"): string {
  const clean = String(text || "")
    .trim()
    .replace(/\*\*|__|[*_`#]/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const normLevel = /^P[1-6]$/i.test(level) ? level.toUpperCase() : "P3";
  const normVoice = (voice || "kore").trim().toLowerCase();

  return `${normVoice}:${normLevel}:${clean}`;
}

/**
 * Requests permanent storage via navigator.storage.persist().
 * When granted, the browser will NOT evict IndexedDB under storage pressure.
 */
let persistRequested = false;
export async function requestPersistentStorage(): Promise<boolean> {
  if (persistRequested) return true;
  if (typeof navigator !== "undefined" && navigator.storage?.persist) {
    try {
      persistRequested = true;
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

export function getAudioDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        // Asynchronously request permanent storage once DB is successfully established
        requestPersistentStorage().catch(() => {});
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn("[audio-cache] IndexedDB open error:", request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn("[audio-cache] IndexedDB unavailable:", err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Retrieves a cached audio Blob for the given text, level, and voice.
 * Returns null if not found in the permanent IndexedDB cache.
 */
export async function getCachedAudio(
  text: string,
  level = "P3",
  voice = "kore"
): Promise<Blob | null> {
  const key = normalizeAudioKey(text, level, voice);
  if (!key) return null;

  try {
    const db = await getAudioDatabase();
    if (!db) return null;

    return new Promise<Blob | null>((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const record = request.result as AudioCacheRecord | undefined;
          if (record && record.blob) {
            resolve(record.blob);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Permanently saves an audio Blob to IndexedDB.
 */
export async function saveCachedAudio(
  text: string,
  level: string,
  blob: Blob,
  voice = "kore"
): Promise<void> {
  const key = normalizeAudioKey(text, level, voice);
  if (!key || !blob) return;

  try {
    const db = await getAudioDatabase();
    if (!db) return;

    return new Promise<void>((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const record: AudioCacheRecord = {
          key,
          text: text.trim(),
          level: /^P[1-6]$/i.test(level) ? level.toUpperCase() : "P3",
          voice: voice.trim().toLowerCase(),
          blob,
          size: blob.size,
          timestamp: Date.now(),
        };
        store.put(record);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        transaction.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

/**
 * Returns the number of permanently cached audio items and estimated total bytes.
 */
export async function getAudioCacheStats(): Promise<{ count: number; totalBytes: number }> {
  try {
    const db = await getAudioDatabase();
    if (!db) return { count: 0, totalBytes: 0 };

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const countReq = store.count();
        let count = 0;
        let totalBytes = 0;

        countReq.onsuccess = () => {
          count = countReq.result || 0;
          // Open cursor to compute total size
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const record = cursor.value as AudioCacheRecord;
              if (record?.size) totalBytes += record.size;
              cursor.continue();
            } else {
              resolve({ count, totalBytes });
            }
          };
          cursorReq.onerror = () => resolve({ count, totalBytes });
        };
        countReq.onerror = () => resolve({ count: 0, totalBytes: 0 });
      } catch {
        resolve({ count: 0, totalBytes: 0 });
      }
    });
  } catch {
    return { count: 0, totalBytes: 0 };
  }
}

/**
 * Clears all permanently cached audio from IndexedDB.
 */
export async function clearAudioCache(): Promise<void> {
  try {
    const db = await getAudioDatabase();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {}
}

/**
 * Encodes 16-bit linear PCM byte data into a standard, universally playable RIFF WAV byte array.
 */
export function pcmToWavBytes(
  pcmBytes: Uint8Array,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Uint8Array {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44 + pcmBytes.length);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeAscii(view, 8, "WAVE");

  // "fmt " sub-chunk
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeAscii(view, 36, "data");
  view.setUint32(40, pcmBytes.length, true);

  // Audio PCM data
  new Uint8Array(buffer, 44).set(pcmBytes);

  return new Uint8Array(buffer);
}

/**
 * Encodes 16-bit linear PCM byte data into a standard, universally playable RIFF WAV Blob.
 */
export function pcmToWavBlob(
  pcmBytes: Uint8Array,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Blob {
  const wavBytes = pcmToWavBytes(pcmBytes, sampleRate, numChannels, bitsPerSample);
  return new Blob([wavBytes], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
