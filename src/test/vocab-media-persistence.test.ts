import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("public/pokeayman/index.html", "utf8");
const app = window as any;
const reviewed = { vocab_media_policy: "sentence-reviewed-v1" };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  localStorage.clear();
});

describe("reviewed media persistence", () => {
  it("keeps explicit omissions empty through legacy sanitization and rendering helpers", () => {
    app.PERMANENT_VOCAB_WORDS = { ball: "unrelated-legacy-ball.jpg" };
    app.PERMANENT_VOCAB_COVERS = { Actions: "unrelated-legacy-cover.jpg" };
    const start = html.indexOf("window.resolvePermanentVocabCover =");
    new Function(html.slice(start, html.indexOf("</script>", start)))();
    const word = { ...reviewed, type: "vocab_word", vocab_word: "ball", vocab_image: "" };
    const list = {
      ...reviewed,
      type: "vocab_list",
      vocab_list_name: "Actions",
      vocab_cover_image_url: "",
    };
    expect(app.sanitizeRecordImages(word).vocab_image).toBe("");
    expect(app.sanitizeRecordImages(list).vocab_cover_image_url).toBe("");
    expect(app.resolvePermanentVocabImage("", "ball", word)).toBe("");
    expect(app.resolvePermanentVocabCover("", "Actions", list)).toBe("");
    expect(app.resolvePermanentVocabImage("", "ball")).toBe("unrelated-legacy-ball.jpg");
    expect(app.resolvePermanentVocabCover("", "Actions")).toBe("unrelated-legacy-cover.jpg");
  });

  it("never heals a failed reviewed data image into an unrelated stock picture", async () => {
    const fetcher = vi.fn();
    app.pexelsFetch = fetcher;
    const start = html.indexOf("window.resolvePermanentVocabCover =");
    new Function(html.slice(start, html.indexOf("</script>", start)))();
    const img = document.createElement("img");
    img.src = "data:image/png;base64,badimage";
    await app.healBrokenVocabImgElement(img, "ball", false);
    expect(img.hidden).toBe(true);
    expect(img.src).toBe("data:image/png;base64,badimage");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("atomically upserts the complete list and leaves the local snapshot untouched on failure", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("failure", { status: 500 }))
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    const start = html.indexOf("(function () {\n  const key = 'pokeayman-local-preview-v1';");
    // The source may be checked out with either LF or CRLF on Windows.
    const normalized = html.replace(/\r\n/g, "\n");
    const scriptStart =
      start >= 0
        ? start
        : normalized.indexOf("(function () {\n  const key = 'pokeayman-local-preview-v1';");
    const scriptHtml = start >= 0 ? html : normalized;
    expect(scriptStart).toBeGreaterThan(-1);
    new Function(scriptHtml.slice(scriptStart, scriptHtml.indexOf("</script>", scriptStart)))();
    const rows = [
      { __backendId: "list-id", type: "vocab_list", ...reviewed },
      { __backendId: "word-id", type: "vocab_word", ...reviewed },
    ];
    expect((await app.dataSdk.createMany(rows, { notify: false })).isOk).toBe(false);
    expect(app.dataSdk.snapshot()).toEqual([]);
    expect((await app.dataSdk.createMany(rows, { notify: false })).isOk).toBe(true);
    expect(app.dataSdk.snapshot()).toHaveLength(2);
    await app.dataSdk.createMany(rows, { notify: false });
    expect(app.dataSdk.snapshot()).toHaveLength(2);
    const request = fetcher.mock.calls[1]![1];
    expect(JSON.parse(request.body)).toEqual(
      rows.map((row) => ({ id: row.__backendId, data: row })),
    );
    expect(request.headers.Prefer).toContain("resolution=merge-duplicates");
    vi.clearAllTimers();
  });
});
