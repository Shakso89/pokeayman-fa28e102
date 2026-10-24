import { readFileSync } from "node:fs";
import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync("public/pokeayman/vocab-list-generator.js", "utf8");
const imageUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const sentence = "The boy kicks the red ball outside.";
const app = window as any;
let fetcher: ReturnType<typeof vi.fn>;
let createMany: ReturnType<typeof vi.fn>;
let deduct: ReturnType<typeof vi.fn>;
let mediaStatus = "matched";

function element(selector: string) {
  return document.querySelector(selector) as HTMLElement;
}
function click(selector: string) {
  fireEvent.click(element(selector));
}
function json(body: any) {
  return Response.json(body);
}
async function generate() {
  fireEvent.input(element("#vocab-gen-text-input"), { target: { value: "ball" } });
  click("#vocab-gen-submit-button");
  await waitFor(() => expect(element("#vocab-gen-review").hidden).toBe(false));
}

beforeEach(() => {
  mediaStatus = "matched";
  document.body.innerHTML =
    '<input id="new-vocab-list-name" value="Actions"><button id="generate-vocab-list-btn">Generate</button>';
  app.getAllTeacherClasses = () => [{ school_name: "School", class_name: "A" }];
  app.getNavClassContext = () => ({ school: "School", className: "A" });
  app.getTeacherCredits = () => 100;
  app.currentTeacher = "Teacher";
  createMany = vi.fn().mockResolvedValue({ isOk: true });
  app.dataSdk = { createMany };
  deduct = vi.fn().mockResolvedValue(true);
  app.deductTeacherCredits = deduct;
  app.logCredit = vi.fn().mockResolvedValue({ isOk: true });
  app.renderVocabLists = vi.fn();
  app.toast = vi.fn();
  fetcher = vi.fn(async (_path: string, options: RequestInit) => {
    const body = JSON.parse(String(options.body));
    if (body.mode === "media") {
      return json({
        id: body.id,
        sentence: body.sentence,
        status: mediaStatus,
        imageUrl: mediaStatus === "matched" ? imageUrl : "",
        type: "vector",
        query: "boy kicking red ball",
        candidates: [
          {
            id: "manual",
            imageUrl,
            type: "vector",
            source: "Artist",
            sourceUrl: "https://pixabay.com/vectors/test/",
          },
        ],
      });
    }
    if (_path === "/api/vocabulary-sentence")
      return json({ sentence: "She throws the ball across the playground." });
    return json({ items: [{ word: "ball", sentence }] });
  });
  vi.stubGlobal("fetch", fetcher);
  // Bind only once in this isolated dialog; mutation-observer behavior is not
  // relevant to the generation/review/save state machine.
  vi.stubGlobal(
    "MutationObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  new Function(source)();
  app.openVocabGenerateModal();
});

afterEach(() => {
  element("#vocab-gen-popup-close")?.click();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("AI vocabulary draft review", () => {
  it("generates the final sentence first and never saves or charges before review", async () => {
    await generate();
    expect(JSON.parse(fetcher.mock.calls[0]![1].body)).toMatchObject({
      mode: "words",
      items: [{ word: "ball", picture: "" }],
    });
    expect(JSON.parse(fetcher.mock.calls[1]![1].body)).toMatchObject({
      mode: "media",
      word: "ball",
      sentence,
    });
    expect(element(".vocab-gen-review-sentence").textContent).toBe(sentence);
    expect(createMany).not.toHaveBeenCalled();
    expect(deduct).not.toHaveBeenCalled();
  });

  it("saves approved pixels and cover once, even after repeated clicks", async () => {
    await generate();
    click("#vocab-gen-save");
    click("#vocab-gen-save");
    await waitFor(() => expect(document.querySelector("#vocab-gen-popup-modal")).toBeNull());
    expect(createMany).toHaveBeenCalledTimes(1);
    const rows = createMany.mock.calls[0]![0];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      vocab_cover_image_url: imageUrl,
      vocab_media_policy: "sentence-reviewed-v1",
    });
    expect(rows[1]).toMatchObject({
      vocab_image: imageUrl,
      vocab_sentence: sentence,
      vocab_media_status: "matched",
    });
    expect(deduct).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("requires explicit confirmation to save an unmatched word without a picture", async () => {
    mediaStatus = "needs_review";
    await generate();
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(true);
    click('[data-action="without"]');
    click("#vocab-gen-save");
    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(1));
    const rows = createMany.mock.calls[0]![0];
    expect(rows[0].vocab_cover_image_url).toBe("");
    expect(rows[1]).toMatchObject({ vocab_image: "", vocab_media_status: "omitted" });
  });

  it("allows a teacher to choose a candidate without claiming AI approval", async () => {
    mediaStatus = "needs_review";
    await generate();
    click('[data-action="choose"]');
    click('[data-action="select"]');
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(false);
    click("#vocab-gen-save");
    await waitFor(() => expect(createMany).toHaveBeenCalledTimes(1));
    expect(createMany.mock.calls[0]![0][1]).toMatchObject({
      vocab_image: imageUrl,
      vocab_media_status: "manual",
    });
  });

  it("invalidates an old picture before a new sentence is written and rematches", async () => {
    await generate();
    let resolveRewrite!: (value: Response) => void;
    fetcher.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveRewrite = resolve;
        }),
    );
    click('[data-action="rewrite"]');
    expect(document.querySelector(".vocab-gen-review-picture img")).toBeNull();
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(true);
    mediaStatus = "needs_review";
    resolveRewrite(json({ sentence: "She throws the ball across the playground." }));
    await waitFor(() =>
      expect(element(".vocab-gen-review-sentence").textContent).toContain("throws"),
    );
    await waitFor(() =>
      expect(element(".vocab-gen-review-item").getAttribute("aria-busy")).toBe("false"),
    );
    expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body).sentence).toContain("throws");
    expect(document.querySelector(".vocab-gen-review-picture img")).toBeNull();
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(true);
  });

  it("supports manual scene searches and picture-type selection", async () => {
    mediaStatus = "needs_review";
    await generate();
    click('[data-action="choose"]');
    fireEvent.input(element('[data-field="query"]'), { target: { value: "boy kicking football" } });
    fireEvent.input(element('[data-field="type"]'), { target: { value: "illustration" } });
    click('[data-action="search"]');
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
    expect(JSON.parse(fetcher.mock.calls[2]![1].body)).toMatchObject({
      mode: "media",
      action: "search",
      query: "boy kicking football",
      imageType: "illustration",
    });
  });

  it("keeps the reviewed draft on failed atomic save and deducts only after a successful retry", async () => {
    createMany.mockResolvedValueOnce({ isOk: false }).mockResolvedValueOnce({ isOk: true });
    await generate();
    click("#vocab-gen-save");
    await waitFor(() => expect(element("#vocab-gen-review-error").hidden).toBe(false));
    expect(deduct).not.toHaveBeenCalled();
    const firstIds = createMany.mock.calls[0]![0].map((row: any) => row.__backendId);
    click("#vocab-gen-save");
    await waitFor(() => expect(deduct).toHaveBeenCalledTimes(1));
    expect(createMany.mock.calls[1]![0].map((row: any) => row.__backendId)).toEqual(firstIds);
  });

  it("retries failed credit updates without creating a second list", async () => {
    deduct.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await generate();
    click("#vocab-gen-save");
    await waitFor(() => expect(element("#vocab-gen-review-error").hidden).toBe(false));
    click("#vocab-gen-save");
    await waitFor(() => expect(document.querySelector("#vocab-gen-popup-modal")).toBeNull());
    expect(createMany).toHaveBeenCalledTimes(1);
    expect(deduct).toHaveBeenCalledTimes(2);
  });

  it("cancels the draft without writes or deductions", async () => {
    await generate();
    click("#vocab-gen-cancel");
    expect(document.querySelector("#vocab-gen-popup-modal")).toBeNull();
    expect(createMany).not.toHaveBeenCalled();
    expect(deduct).not.toHaveBeenCalled();
  });

  it("requires review again if the selected image cannot be displayed", async () => {
    await generate();
    fireEvent.error(element(".vocab-gen-review-picture img"));
    expect(document.querySelector(".vocab-gen-review-picture img")).toBeNull();
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(true);
    expect(createMany).not.toHaveBeenCalled();
  });

  it("ignores late generation responses after cancellation", async () => {
    let complete!: (value: Response) => void;
    fetcher.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    fireEvent.input(element("#vocab-gen-text-input"), { target: { value: "ball" } });
    click("#vocab-gen-submit-button");
    const signal = fetcher.mock.calls[0]![1].signal;
    click("#vocab-gen-popup-close");
    expect(signal.aborted).toBe(true);
    complete(json({ items: [{ word: "ball", sentence }] }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(createMany).not.toHaveBeenCalled();
  });

  it("photo mode uses the same sentence matching and never substitutes the upload", async () => {
    mediaStatus = "needs_review";
    click("#vocab-gen-mode-photo");
    const upload = new File(["uploaded scene"], "scene.png", { type: "image/png" });
    fireEvent.change(element("#vocab-gen-photo-file"), { target: { files: [upload] } });
    await waitFor(() =>
      expect((element("#vocab-gen-submit-button") as HTMLButtonElement).disabled).toBe(false),
    );
    click("#vocab-gen-submit-button");
    await waitFor(() => expect(element("#vocab-gen-review").hidden).toBe(false));
    expect(JSON.parse(fetcher.mock.calls[0]![1].body).mode).toBe("photo");
    expect(JSON.parse(fetcher.mock.calls[1]![1].body)).toMatchObject({ mode: "media", sentence });
    expect(document.querySelector(".vocab-gen-review-picture img")).toBeNull();
    expect((element("#vocab-gen-save") as HTMLButtonElement).disabled).toBe(true);
  });
});
