import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  normalizeAudioKey,
  pcmToWavBytes,
  pcmToWavBlob,
  requestPersistentStorage,
  saveCachedAudio,
  getCachedAudio,
  getAudioCacheStats,
  clearAudioCache,
} from "@/lib/audio-cache";

describe("Permanent IndexedDB Audio Cache", () => {
  describe("normalizeAudioKey", () => {
    it("normalizes case, markdown, and whitespace to guarantee shared cache hits", () => {
      const key1 = normalizeAudioKey("Elephant", "p3", "kore");
      const key2 = normalizeAudioKey(" elephant ", "P3", "Kore");
      const key3 = normalizeAudioKey('**"Elephant"**', "P3", "kore");

      expect(key1).toBe("kore:P3:elephant");
      expect(key2).toBe("kore:P3:elephant");
      expect(key3).toBe("kore:P3:elephant");
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it("defaults to P3 and kore when omitted", () => {
      const key = normalizeAudioKey("kangaroo");
      expect(key).toBe("kore:P3:kangaroo");
    });

    it("preserves valid P1-P6 level identifiers", () => {
      expect(normalizeAudioKey("word", "P1")).toBe("kore:P1:word");
      expect(normalizeAudioKey("word", "p6")).toBe("kore:P6:word");
      expect(normalizeAudioKey("word", "invalid")).toBe("kore:P3:word");
    });
  });

  describe("pcmToWavBytes & pcmToWavBlob", () => {
    it("generates a valid RIFF WAVE header with standard PCM parameters", () => {
      // 480 bytes = 240 samples of 16-bit PCM at 24000Hz (0.01s)
      const fakePcm = new Uint8Array(480);
      for (let i = 0; i < fakePcm.length; i++) fakePcm[i] = i % 256;

      const wavBytes = pcmToWavBytes(fakePcm, 24000);
      expect(wavBytes.length).toBe(44 + 480);

      const blob = pcmToWavBlob(fakePcm, 24000);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("audio/wav");

      const view = new DataView(wavBytes.buffer, wavBytes.byteOffset, wavBytes.byteLength);

      // Verify RIFF header
      const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      expect(riff).toBe("RIFF");
      expect(view.getUint32(4, true)).toBe(36 + 480);

      const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
      expect(wave).toBe("WAVE");

      // Verify fmt subchunk
      const fmt = String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15));
      expect(fmt).toBe("fmt ");
      expect(view.getUint32(16, true)).toBe(16); // PCM header size
      expect(view.getUint16(20, true)).toBe(1); // AudioFormat 1 = PCM
      expect(view.getUint16(22, true)).toBe(1); // Mono channel
      expect(view.getUint32(24, true)).toBe(24000); // 24000 Hz sample rate
      expect(view.getUint32(28, true)).toBe(48000); // 48000 Byte rate
      expect(view.getUint16(32, true)).toBe(2); // Block align
      expect(view.getUint16(34, true)).toBe(16); // 16-bit

      // Verify data subchunk
      const data = String.fromCharCode(view.getUint8(36), view.getUint8(37), view.getUint8(38), view.getUint8(39));
      expect(data).toBe("data");
      expect(view.getUint32(40, true)).toBe(480);
    });
  });

  describe("requestPersistentStorage", () => {
    it("requests persistent storage from navigator.storage if available", async () => {
      const persistMock = vi.fn().mockResolvedValue(true);
      const persistedMock = vi.fn().mockResolvedValue(false);

      vi.stubGlobal("navigator", {
        storage: {
          persist: persistMock,
          persisted: persistedMock,
        },
      });

      const granted = await requestPersistentStorage();
      expect(persistedMock).toHaveBeenCalled();
      expect(persistMock).toHaveBeenCalled();
      expect(granted).toBe(true);
    });
  });

  describe("IndexedDB Store and Retrieval", () => {
    // In-memory mock IndexedDB for testing environment
    let storeMap = new Map<string, any>();

    beforeEach(() => {
      storeMap.clear();

      const fakeDb = {
        transaction: () => ({
          objectStore: () => ({
            get: (key: string) => {
              const req: any = { result: storeMap.get(key) };
              setTimeout(() => req.onsuccess?.({ target: req }), 0);
              return req;
            },
            put: (val: any) => {
              storeMap.set(val.key, val);
              const req: any = {};
              setTimeout(() => req.onsuccess?.({ target: req }), 0);
              return req;
            },
            count: () => {
              const req: any = { result: storeMap.size };
              setTimeout(() => req.onsuccess?.({ target: req }), 0);
              return req;
            },
            openCursor: () => {
              const entries = Array.from(storeMap.values());
              let idx = 0;
              const req: any = {};
              const advance = () => {
                if (idx < entries.length) {
                  req.result = {
                    value: entries[idx++],
                    continue: advance,
                  };
                  req.onsuccess?.({ target: req });
                } else {
                  req.result = null;
                  req.onsuccess?.({ target: req });
                }
              };
              setTimeout(advance, 0);
              return req;
            },
            clear: () => {
              storeMap.clear();
              const req: any = {};
              setTimeout(() => req.onsuccess?.({ target: req }), 0);
              return req;
            },
          }),
          oncomplete: null as any,
          onerror: null as any,
          onabort: null as any,
        }),
      };

      // Wrap transaction to trigger oncomplete
      const origTransaction = fakeDb.transaction;
      fakeDb.transaction = () => {
        const tx = origTransaction();
        setTimeout(() => tx.oncomplete?.(), 0);
        return tx;
      };

      vi.stubGlobal("indexedDB", {
        open: () => {
          const req: any = { result: fakeDb };
          setTimeout(() => req.onsuccess?.({ target: req }), 0);
          return req;
        },
      });
    });

    it("saves and retrieves cached audio blobs permanently", async () => {
      const blob = new Blob(["audio-bytes"], { type: "audio/wav" });
      await saveCachedAudio("telescope", "P4", blob);

      const retrieved = await getCachedAudio("telescope", "P4");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.size).toBe(blob.size);

      // Verify case-insensitive hit
      const caseInsensitiveHit = await getCachedAudio("TELESCOPE", "p4");
      expect(caseInsensitiveHit).not.toBeNull();
      expect(caseInsensitiveHit?.size).toBe(blob.size);
    });

    it("returns stats and clears audio cache accurately", async () => {
      const blob1 = new Blob(["12345"], { type: "audio/wav" });
      const blob2 = new Blob(["1234567890"], { type: "audio/wav" });

      await saveCachedAudio("word1", "P3", blob1);
      await saveCachedAudio("word2", "P3", blob2);

      const stats = await getAudioCacheStats();
      expect(stats.count).toBe(2);
      expect(stats.totalBytes).toBe(15);

      await clearAudioCache();
      const statsAfter = await getAudioCacheStats();
      expect(statsAfter.count).toBe(0);
      expect(statsAfter.totalBytes).toBe(0);
    });
  });
});
