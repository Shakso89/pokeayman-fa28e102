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

  it("renders Wordwall layout with picture targets grid and docked word bank tray without Reset or Submit buttons", () => {
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

    // Reset and Submit Answers buttons must be REMOVED (instant automatic submission)
    const submitBtn = modal?.querySelector("#match-submit-btn");
    const resetBtn = modal?.querySelector("#match-reset-btn");
    expect(submitBtn).toBeNull();
    expect(resetBtn).toBeNull();

    // 3 Word Chips in the bank
    const chips = modal?.querySelectorAll(".match-word-chip");
    expect(chips?.length).toBe(3);

    // Chips must NOT have speaker buttons
    const speakerBtns = modal?.querySelectorAll(".match-word-speak-btn");
    expect(speakerBtns?.length).toBe(0);

    modal?.remove();
  });

  it("evaluates matches instantly on drop: locks correct word with checkmark badge", () => {
    app.openGameMatch("Animals", 2);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Target 1
    const target1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    const targetImg1 = target1.querySelector(".match-target-img") as HTMLImageElement;
    const targetWord1 = targetImg1.alt.replace("Picture for ", "");

    // Find the chip with matching word in bank
    const allChips = Array.from(modal.querySelectorAll(".match-word-chip")) as HTMLElement[];
    const matchingChip = allChips.find(c => c.textContent?.includes(targetWord1))!;
    expect(matchingChip).toBeDefined();

    // Tap matching chip
    matchingChip.click();

    // Target card element after tap render
    const currentTarget1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    currentTarget1.click();

    expect(app.playGameSound).toHaveBeenCalledWith("success");
    expect(app.showCorrectAnswerCelebration).toHaveBeenCalled();

    // Target card should be locked and matched
    const updatedTarget1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    expect(updatedTarget1.classList.contains("is-matched")).toBe(true);
    expect(updatedTarget1.querySelector(".match-card-badge.check")).not.toBeNull();
    expect(updatedTarget1.querySelector(".match-placed-chip")).not.toBeNull();

    modal.remove();
  });

  it("evaluates wrong match instantly: plays error sound, shakes card, and returns pill to bank without docking", () => {
    vi.useFakeTimers();
    app.openGameMatch("Animals", 2);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Target 1
    const target1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    const targetImg1 = target1.querySelector(".match-target-img") as HTMLImageElement;
    const targetWord1 = targetImg1.alt.replace("Picture for ", "");

    // Find a non-matching chip
    const allChips = Array.from(modal.querySelectorAll(".match-word-chip")) as HTMLElement[];
    const wrongChip = allChips.find(c => !c.textContent?.includes(targetWord1))!;
    expect(wrongChip).toBeDefined();

    // Tap wrong chip
    wrongChip.click();

    // Target card element after tap render
    const currentTarget1 = modal.querySelector('.match-target-card[data-target-index="0"]') as HTMLElement;
    currentTarget1.click();

    expect(app.playGameSound).toHaveBeenCalledWith("wrong");
    expect(currentTarget1.classList.contains("is-wrong")).toBe(true);

    // Fast-forward timeout for shake recovery
    vi.advanceTimersByTime(700);

    // Slot remains empty, card is not matched
    expect(modal.querySelector('.match-target-card[data-target-index="0"] .match-placed-chip')).toBeNull();
    expect(modal.querySelector('.match-target-card[data-target-index="0"]')?.classList.contains("is-matched")).toBe(false);

    vi.useRealTimers();
    modal.remove();
  });

  it("automatically completes the game and triggers victory celebration when all pairs are matched", () => {
    vi.useFakeTimers();
    app.openGameMatch("Animals", 2);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Match both cards
    for (let i = 0; i < 2; i++) {
      const card = modal.querySelector(`.match-target-card[data-target-index="${i}"]`) as HTMLElement;
      const img = card.querySelector(".match-target-img") as HTMLImageElement;
      const word = img.alt.replace("Picture for ", "");

      const allChips = Array.from(modal.querySelectorAll(".match-word-chip:not(.is-placed)")) as HTMLElement[];
      const chip = allChips.find(c => c.textContent?.includes(word))!;
      chip.click();

      const currentCard = modal.querySelector(`.match-target-card[data-target-index="${i}"]`) as HTMLElement;
      currentCard.click();
    }

    expect(app.playGameSound).toHaveBeenCalledWith("complete");
    vi.advanceTimersByTime(600);
    expect(app.showGameCelebration).toHaveBeenCalledWith(modal, "Perfect match!");

    vi.useRealTimers();
    modal.remove();
  });

  describe("Match Words Settings UI: Capsule Stepper Row Refactor", () => {
    // Extract createWordCountStepper from index.html / games-arcade.js
    const stepperStart = "function createWordCountStepper({ totalWords, initialCount, onChange }) {";
    const stepperEnd = "window.createWordCountStepper = createWordCountStepper;";
    const sStart = html.indexOf(stepperStart);
    const sEnd = html.indexOf(stepperEnd);
    expect(sStart).toBeGreaterThan(-1);
    expect(sEnd).toBeGreaterThan(sStart);

    const stepperCode = html.slice(sStart, sEnd + stepperEnd.length);
    const sandbox = new Function("window", "document", `${stepperCode}`);
    sandbox(window, document);
    const createWordCountStepper = (window as any).createWordCountStepper;

    it("calculates dynamic increments up to maximum words in list and defaults to All", () => {
      let selectedVal = 0;
      const stepper = createWordCountStepper({
        totalWords: 17,
        onChange: (v: number) => { selectedVal = v; }
      });
      const panel = stepper.element;
      expect(panel).not.toBeNull();

      // UI Layout Specs
      expect(panel.className).toContain("ga-word-count-panel");
      expect(panel.className).toContain("bg-[#111928]/80");
      expect(panel.className).toContain("border-slate-800/80");

      // Icon & Title
      const icon = panel.querySelector("svg");
      expect(icon).not.toBeNull();
      const label = panel.querySelector(".font-bold.text-white.text-sm");
      expect(label?.textContent).toBe("Word count");

      // Right side capsule housing
      const housing = panel.querySelector(".bg-\\[\\#0b1120\\]");
      expect(housing).not.toBeNull();

      // Initial value display: All (17)
      const valBadge = panel.querySelector(".ga-word-count-val");
      expect(valBadge?.textContent?.trim()).toBe("All (17)");
      expect(stepper.getValue()).toBe(17);

      // Decrement & Increment buttons
      const decBtn = panel.querySelector(".ga-word-count-dec") as HTMLButtonElement;
      const incBtn = panel.querySelector(".ga-word-count-inc") as HTMLButtonElement;
      expect(decBtn).not.toBeNull();
      expect(incBtn).not.toBeNull();

      // Since we start at the max (17), increment is disabled
      expect(incBtn.disabled).toBe(true);
      expect(decBtn.disabled).toBe(false);

      // Step down: 17 -> 15 words
      decBtn.click();
      expect(valBadge?.textContent?.trim()).toBe("15 words");
      expect(stepper.getValue()).toBe(15);
      expect(selectedVal).toBe(15);
      expect(incBtn.disabled).toBe(false);

      // Step down through options: 15 -> 12 -> 10 -> 8 -> 5
      decBtn.click(); // 12
      expect(valBadge?.textContent?.trim()).toBe("12 words");
      decBtn.click(); // 10
      expect(valBadge?.textContent?.trim()).toBe("10 words");
      decBtn.click(); // 8
      expect(valBadge?.textContent?.trim()).toBe("8 words");
      decBtn.click(); // 5 (min)
      expect(valBadge?.textContent?.trim()).toBe("5 words");
      expect(stepper.getValue()).toBe(5);

      // At min, decrement must be disabled
      expect(decBtn.disabled).toBe(true);

      // Step back up to max
      incBtn.click(); // 8
      incBtn.click(); // 10
      incBtn.click(); // 12
      incBtn.click(); // 15
      incBtn.click(); // 17 (All)
      expect(valBadge?.textContent?.trim()).toBe("All (17)");
      expect(incBtn.disabled).toBe(true);
    });

    it("verifies static 3-button row is replaced with capsule stepper in index.html", () => {
      // Static rectangular buttons must NOT be present in match setup
      expect(html).not.toContain('class="grid grid-cols-3 gap-2" role="group" aria-label="Number of words"');
      // Capsule stepper row must be present
      expect(html).toContain('ga-match-word-count-panel');
      expect(html).toContain('ga-word-count-dec');
      expect(html).toContain('ga-word-count-inc');
      expect(html).toContain('ga-word-count-val');
    });

    it("ensures no duplicate word count row exists in openGamePlayersModal", () => {
      const modalFuncStart = "function openGamePlayersModal(gameType, listName) {";
      const modalFuncEnd = "function openGameScramble(";
      const start = html.indexOf(modalFuncStart);
      const end = html.indexOf(modalFuncEnd, start);
      const openModalCode = html.slice(start, end);

      expect(openModalCode).not.toContain("${isMatchWords ?");
      expect(openModalCode).not.toContain("ga-match-word-count-panel w-full");
    });
  });
});
