import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("student dashboard vocabulary list covers", () => {
  it("styles student vocabulary card covers with 16/10 aspect ratio without clamped narrow letterboxing in pages.css", () => {
    const pagesCss = readFileSync("public/pokeayman/pages.css", "utf8");
    expect(pagesCss).toContain(":is(#student-tab-vocabulary, #student-vocabulary-lists) .student-vocab-cover");
    expect(pagesCss).toContain("aspect-ratio: 16 / 10 !important;");
    expect(pagesCss).not.toContain("height: clamp(72px, 12vw, 112px)");
  });

  it("styles student vocabulary card covers with responsive uncropped layout in student-workspace.css", () => {
    const swCss = readFileSync("public/pokeayman/student-workspace.css", "utf8");
    expect(swCss).toContain(":is(#student-tab-vocabulary, #student-vocabulary-lists) .student-vocab-cover");
    expect(swCss).toContain("aspect-ratio: 16 / 10 !important;");
    expect(swCss).toContain("object-fit: cover !important;");
  });

  it("ensures student-tab-vocabulary cards in index.html use auto aspect ratio and uncropped covers", () => {
    const indexHtml = readFileSync("public/pokeayman/index.html", "utf8");
    expect(indexHtml).toContain("#student-tab-vocabulary .vocab-list-card");
    expect(indexHtml).toContain("#student-vocabulary-lists .vocab-list-card");
    expect(indexHtml).toContain("aspect-ratio: 16 / 10 !important;");
  });
});
