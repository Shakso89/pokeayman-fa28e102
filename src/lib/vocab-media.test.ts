import { beforeEach, describe, expect, it, vi } from "vitest";
import { matchVocabularyMedia } from "./vocab-media";
import { callGemini } from "./vocab-sentences";
import { readStockImage, searchStockMedia } from "./stock-media";
import type { StockPhoto } from "./stock-media";
import { Route } from "../routes/api/generate-vocab-list";

vi.mock("./vocab-sentences", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vocab-sentences")>()),
  callGemini: vi.fn(),
}));
vi.mock("./stock-media", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./stock-media")>()),
  searchStockMedia: vi.fn(),
  readStockImage: vi.fn(),
}));
const model = vi.mocked(callGemini);
const search = vi.mocked(searchStockMedia);
const read = vi.mocked(readStockImage);
const input = { id: "item-1", word: "ball", sentence: "The boy kicks the red ball outside." };
const photo = (id: number): StockPhoto => ({
  id,
  photographer: "Artist",
  photographer_url: "",
  url: "https://pixabay.com/photos/test/",
  alt: "ball",
  type: "photo",
  src: {
    original: "",
    large: "",
    medium: `https://cdn.pixabay.com/${id}.jpg`,
    small: "",
    tiny: "",
  },
});
const result = (ids: number[]) => ({
  photos: ids.map(photo),
  page: 1,
  per_page: 6,
  total_results: ids.length,
  next_page: null,
});

beforeEach(() => {
  vi.resetAllMocks();
  model.mockResolvedValue(JSON.stringify({ matches: [{ index: 1, approved: true }] }));
  search.mockResolvedValue(result([1, 2]));
  read.mockImplementation(async (photo) => ({ mimeType: "image/jpeg", data: `pixels${photo.id}` }));
});

describe("sentence-based media matching", () => {
  it("rejects the first unrelated hit and stores the exact pixels of a later match", async () => {
    model.mockResolvedValueOnce(
      JSON.stringify({
        matches: [
          { index: 1, approved: false },
          { index: 2, approved: true },
        ],
      }),
    );
    const answer = await matchVocabularyMedia(input);
    expect(answer).toMatchObject({
      status: "matched",
      imageUrl: "data:image/jpeg;base64,pixels2",
      type: "photo",
      sentence: input.sentence,
    });
    // Requirement 1: search strictly uses isolated word ("ball"), not sentence
    expect(search).toHaveBeenCalledWith("ball", "photo", 6, 1);
    const parts = model.mock.calls[0]![0].contents[0]!.parts;
    expect(parts.filter((part) => part.inlineData).map((part) => part.inlineData?.data)).toEqual([
      "pixels1",
      "pixels2",
    ]);
    expect(parts[0]!.text).toContain("ball");
  });

  it.each(["vector", "illustration"])(
    "falls back to %s only after previous types fail",
    async (type) => {
      search.mockImplementation(async (query, requestedType) => {
        if (requestedType === type) return result([1, 2]);
        return result([]);
      });
      const answer = await matchVocabularyMedia(input);
      expect(answer).toMatchObject({ status: "matched", type });
      expect(search.mock.calls.map((call) => call[1])).toContain(type);
    },
  );

  it("safe fallback accepts top-ranked trusted provider image when vision validator rejects or errors", async () => {
    model.mockResolvedValueOnce(
      JSON.stringify({
        matches: [
          { index: 1, approved: false },
          { index: 2, approved: false },
        ],
      }),
    );
    // Requirement 2: relaxed validation safe fallback
    const res = await matchVocabularyMedia(input);
    expect(res).toMatchObject({
      status: "matched",
      imageUrl: "data:image/jpeg;base64,pixels1",
      type: "photo",
    });
  });

  it("safe fallback accepts top-ranked trusted provider image on validator failure or timeout", async () => {
    model.mockRejectedValueOnce(new Error("validator timeout"));
    const res = await matchVocabularyMedia(input);
    expect(res).toMatchObject({
      status: "matched",
      imageUrl: "data:image/jpeg;base64,pixels1",
    });
  });

  it("does not approve when search yields no photos or images cannot be downloaded", async () => {
    search.mockResolvedValue(result([]));
    read.mockResolvedValue(null);
    expect(await matchVocabularyMedia(input)).toMatchObject({
      status: "needs_review",
      imageUrl: "",
      candidates: [],
    });
  });

  it.each([
    ["blue", "A blue butterfly rests on the flower."],
    ["under", "The cat sleeps under the wooden table."],
    ["bat", "The bat flies through the dark cave."],
  ])("preserves the final sentence and meaning for %s", async (word, sentence) => {
    model.mockResolvedValue('{"matches":[{"index":1,"approved":true}]}');
    const answer = await matchVocabularyMedia({ id: "meaning", word, sentence });
    expect(answer.sentence).toBe(sentence);
    expect(model.mock.calls[0]![0].contents[0]!.parts[0]!.text).toContain(
      JSON.stringify({ word, sentence }),
    );
  });

  it("manual search returns unapproved candidates of the requested type without calling AI", async () => {
    const answer = await matchVocabularyMedia({
      ...input,
      action: "search",
      query: "boy kicks ball",
      imageType: "vector",
      page: 2,
    });
    expect(answer).toMatchObject({ status: "needs_review", imageUrl: "" });
    expect(answer.candidates).toHaveLength(2);
    expect(search).toHaveBeenCalledWith("boy kicks ball", "vector", 6, 2);
    expect(model).not.toHaveBeenCalled();
  });
});

describe("media API contract", () => {
  const post = (payload: unknown) =>
    (Route.options as any).server.handlers.POST({
      request: new Request("http://localhost/api/generate-vocab-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    }) as Promise<Response>;

  it.each([
    { mode: "media", word: "ball", sentence: input.sentence },
    { mode: "media", id: "item", word: "ball", sentence: "A cat sleeps under the table." },
    { mode: "media", id: "item", word: "ball", sentence: "ball ".repeat(110) },
  ])("rejects incomplete or invalid media input", async (payload) => {
    expect((await post(payload)).status).toBe(400);
    expect(model).not.toHaveBeenCalled();
  });

  it("echoes the item ID and exact final sentence and leaves failures for review", async () => {
    search.mockResolvedValue(result([]));
    read.mockResolvedValue(null);
    const response = await post({ mode: "media", ...input });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: input.id,
      sentence: input.sentence,
      status: "needs_review",
      imageUrl: "",
    });
  });
});
