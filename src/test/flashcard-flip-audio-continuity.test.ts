import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("Flashcard Flip Audio Continuity", () => {
  const root = process.cwd();
  const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");

  it("1. Student flashcard card flip does not stop natural speech audio", () => {
    // Look for flip handler in openStudentVocabularyFlashcards
    expect(indexHtml).toContain("const flip = () => { flipped = !flipped; modal.querySelector('#student-vocab-card-inner').style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'; };");
    // Ensure window.stopNaturalVocabulary is NOT called on card flip
    expect(indexHtml).not.toContain("const flip = () => { window.stopNaturalVocabulary?.(); flipped = !flipped;");
  });

  it("2. Teacher flashcard card flip does not stop natural speech audio", () => {
    // Look for flip handler on card in openFlashcardModal
    expect(indexHtml).toContain("card.addEventListener('click', () => {\n    isFlipped = !isFlipped;\n    inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';\n  });");
    expect(indexHtml).not.toContain("card.addEventListener('click', () => {\n    window.stopNaturalVocabulary?.();\n    isFlipped = !isFlipped;");
  });

  it("3. Prev, Next, and Close handlers still safely stop audio playback when leaving current card", () => {
    expect(indexHtml).toContain("modal.querySelector('#student-vocab-prev').addEventListener('click', () => { window.stopNaturalVocabulary?.();");
    expect(indexHtml).toContain("modal.querySelector('#student-vocab-next').addEventListener('click', () => { window.stopNaturalVocabulary?.();");
    expect(indexHtml).toContain("const closeStudentFlashcards = () => { window.stopNaturalVocabulary?.(); modal.remove();");

    expect(indexHtml).toContain("modal.querySelector('#flashcard-prev').addEventListener('click', () => {\n    window.stopNaturalVocabulary?.();");
    expect(indexHtml).toContain("modal.querySelector('#flashcard-next').addEventListener('click', () => {\n    window.stopNaturalVocabulary?.();");
    expect(indexHtml).toContain("const closeTeacherFlashcards = () => { window.stopNaturalVocabulary?.(); modal.remove();");
  });
});
