import { afterEach, describe, expect, it, vi } from "vitest";
import { readStockImage, searchStockMedia } from "./stock-media";
import type { StockPhoto } from "./stock-media";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("stock provider boundaries", () => {
  it.each(["vector", "illustration"] as const)(
    "never falls back to Pexels for %s",
    async (type) => {
      vi.stubEnv("PEXELS_API_KEY", "test-key");
      const fetcher = vi.fn().mockRejectedValue(new Error("Pixabay unavailable"));
      vi.stubGlobal("fetch", fetcher);
      expect((await searchStockMedia(`no-fallback-${type}`, type)).photos).toEqual([]);
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );

  it("tries the secondary photo provider for an empty primary search", async () => {
    vi.stubEnv("PEXELS_API_KEY", "test-key");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ hits: [], totalHits: 0 }))
      .mockResolvedValueOnce(
        Response.json({
          photos: [{ id: 5, src: { medium: "https://images.pexels.com/test.jpg" } }],
          total_results: 1,
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const answer = await searchStockMedia("secondary-photo", "photo");
    expect(answer.photos[0]).toMatchObject({ id: 5, type: "photo" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("respects SafeSearch and type, and caches the same search for 24 hours", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({
          hits: [{ id: 7, type: "vector", previewURL: "https://cdn.pixabay.com/image.png" }],
          totalHits: 1,
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const first = await searchStockMedia("cached-vector", "vector");
    const second = await searchStockMedia("cached-vector", "vector");
    expect(first).toEqual(second);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0]![0])).toContain("safesearch=true");
    expect(String(fetcher.mock.calls[0]![0])).toContain("image_type=vector");
  });

  const image = (url: string) => ({ src: { medium: url } }) as StockPhoto;
  it.each([
    "http://cdn.pixabay.com/a.jpg",
    "https://localhost/a.jpg",
    "https://cdn.pixabay.com.evil.test/a.jpg",
    "https://cdn.pixabay.com:8080/a.jpg",
    "https://user@cdn.pixabay.com/a.jpg",
  ])("rejects unsafe image URL %s before fetching", async (url) => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await readStockImage(image(url))).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("stores provider pixels and rejects non-images or oversized responses", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("actual pixels", { headers: { "Content-Type": "image/png" } }),
      )
      .mockResolvedValueOnce(new Response("html", { headers: { "Content-Type": "text/html" } }))
      .mockResolvedValueOnce(
        new Response("large", {
          headers: { "Content-Type": "image/jpeg", "Content-Length": "2000000" },
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await readStockImage(image("https://cdn.pixabay.com/a.png"))).toEqual({
      mimeType: "image/png",
      data: Buffer.from("actual pixels").toString("base64"),
    });
    expect(await readStockImage(image("https://cdn.pixabay.com/a.png"))).toBeNull();
    expect(await readStockImage(image("https://cdn.pixabay.com/a.png"))).toBeNull();
    expect(fetcher.mock.calls[0]![1]).toMatchObject({ redirect: "error" });
  });
});
