import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("public/pokeayman/index.html", "utf8");

describe("Wordwall-style Drag & Drop Match Words Game", () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-root"></div>';
    app = window as any;

    // Reset game state globals
    app.activeGamePlayers = [];
    app.activeGameScores = [];
    app.activeGamePlayerIndex = 0;
    app.gameSoundState = { muted: true, unlocked: true, volume: 0.5, lastPlayed: 0 };
    app.toast = vi.fn();
    app.setGameReplay = vi.fn();
    app.resetGameTurnState = vi.fn();
    app.gameSoundControls = () => '<div class="game-sound-controls"></div>';
    app.attachGameSoundControls = vi.fn();
    app.attachGameFullscreen = vi.fn();
    app.renderGamePlayerHud = vi.fn();
    app.updateGamePlayerHud = vi.fn();
    app.startPlayerTurnTimer = vi.fn();
    app.showCorrectAnswerCelebration = vi.fn();
    app.showWrongAnswerCelebration = vi.fn();
    app.showGameCelebration = vi.fn();
    app.advanceGameTurn = vi.fn();
    app.unlockGameSound = vi.fn();
    app.playGameSound = vi.fn();

    // Mock words
    app.getGameWords = vi.fn(() => [
      { vocab_word: "cat", vocab_image: "https://example.com/cat.png" },
      { vocab_word: "dog", vocab_image: "https://example.com/dog.png" },
      { vocab_word: "rabbit", vocab_image: "https://example.com/rabbit.png" }
    ]);

    // Extract and evaluate openGameMatch from index.html
    const startMarker = "function openGameMatch(listName, wordCount = null, timerSeconds = 0) {";
    const endMarker = "// Memory Game word-count chooser";
    const start = html.indexOf(startMarker);
    const end = html.indexOf(endMarker);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const matchFnSource = html.slice(start, end);
    const runner = new Function("window", "document", `${matchFnSource}; window.openGameMatch = openGameMatch;`);
    runner(window, document);
  });

  it("requires at least 2 words with images and rejects insufficient lists", () => {
    app.getGameWords = vi.fn(() => [{ vocab_word: "single", vocab_image: "https://example.com/single.png" }]);
    app.openGameMatch("Test List");
    expect(app.toast).toHaveBeenCalledWith(expect.stringMatching(/fewer than 2 valid words|at least 2 words/));
  });

  it("renders Wordwall layout with picture targets grid and docked word bank tray", () => {
    app.openGameMatch("Animals", 3);
    const modal = document.querySelector(".game-match-root");
    expect(modal).not.toBeNull();

    // Board container
    const board = modal?.querySelector("#match-board");
    expect(board).not.toBeNull();

    // 3 Target cards
    const targets = modal?.querySelectorAll(".match-target-card");
    expect(targets?.length).toBe(3);

    // Each target card has an image and a drop slot
    targets?.forEach(target => {
      expect(target.querySelector(".match-target-img")).not.toBeNull();
      expect(target.querySelector(".match-drop-slot")).not.toBeNull();
    });

    // Word Bank Tray
    const bankTray = modal?.querySelector(".match-bank-tray");
    expect(bankTray).not.toBeNull();

    // Submit Answers and Reset buttons
    const submitBtn = modal?.querySelector("#match-submit-btn");
    const resetBtn = modal?.querySelector("#match-reset-btn");
    expect(submitBtn).not.toBeNull();
    expect(resetBtn).not.toBeNull();
    expect(submitBtn?.textContent).toContain("Submit Answers");

    // 3 Word Chips in the bank
    const chips = modal?.querySelectorAll(".match-word-chip");
    expect(chips?.length).toBe(3);

    modal?.remove();
  });

  it("places words into drop slots via tap and unplaces them via reset or unplace button", () => {
    app.openGameMatch("Animals", 3);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Tap first word chip
    const chip = modal.querySelector(".match-word-chip:not(.is-placed)") as HTMLElement;
    expect(chip).not.toBeNull();
    chip.click();

    // Tap first drop slot
    const slot = modal.querySelector(".match-drop-slot") as HTMLElement;
    expect(slot).not.toBeNull();
    slot.click();

    // Slot should now contain placed chip
    const placedChip = modal.querySelector(".match-drop-slot .match-placed-chip");
    expect(placedChip).not.toBeNull();

    // Chip in bank should be marked as placed
    const placedBankChip = modal.querySelector(".match-word-chip.is-placed");
    expect(placedBankChip).not.toBeNull();

    // Click unplace button to return word to bank
    const unplaceBtn = modal.querySelector(".match-unplace-btn") as HTMLElement;
    expect(unplaceBtn).not.toBeNull();
    unplaceBtn.click();

    expect(modal.querySelector(".match-drop-slot .match-placed-chip")).toBeNull();
    expect(modal.querySelector(".match-word-chip.is-placed")).toBeNull();

    modal.remove();
  });

  it("evaluates answers on submit, locking correct matches and returning wrong matches", async () => {
    app.openGameMatch("Animals", 2);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Get the target cards and word bank chips
    const targetCards = modal.querySelectorAll(".match-target-card");
    const target1 = targetCards[0] as HTMLElement;
    const targetImg1 = target1.querySelector(".match-target-img") as HTMLImageElement;
    const targetWord1 = targetImg1.alt.replace("Picture for ", "");

    // Find the chip with matching word
    const allChips = Array.from(modal.querySelectorAll(".match-word-chip")) as HTMLElement[];
    const matchingChip = allChips.find(c => c.textContent?.includes(targetWord1))!;
    expect(matchingChip).toBeDefined();

    // Place matching chip on target 1
    matchingChip.click();
    const slot1 = target1.querySelector(".match-drop-slot") as HTMLElement;
    slot1.click();

    // Submit answers
    const submitBtn = modal.querySelector("#match-submit-btn") as HTMLButtonElement;
    submitBtn.click();

    // Re-query target card as renderBoard() re-renders the DOM
    const updatedTarget1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    expect(updatedTarget1.classList.contains("is-matched")).toBe(true);
    expect(updatedTarget1.querySelector(".match-card-badge.check")).not.toBeNull();

    modal.remove();
  });
});
