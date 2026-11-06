import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("public/pokeayman/index.html", "utf8");

describe("Match Words Game: Repeated Cards & Free Matching", () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-root"></div>';
    app = window as any;

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

    // 3 available words with images in vocabulary list
    app.getGameWords = vi.fn(() => [
      { vocab_word: "cat", vocab_image: "https://example.com/cat.png" },
      { vocab_word: "dog", vocab_image: "https://example.com/dog.png" },
      { vocab_word: "rabbit", vocab_image: "https://example.com/rabbit.png" }
    ]);

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

  it("repeats vocabulary words evenly when requested card count exceeds words with images in the list", () => {
    // List only has 3 words, but teacher wants 6 cards
    app.openGameMatch("Animals", 6);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    const targets = modal.querySelectorAll(".match-target-card");
    const chips = modal.querySelectorAll(".match-word-chip");

    expect(targets.length).toBe(6);
    expect(chips.length).toBe(6);

    modal.remove();
  });

  it("allows any of the repeated word chips to match any corresponding target picture card", () => {
    vi.useFakeTimers();
    // 3 words repeated across 6 cards
    app.openGameMatch("Animals", 6);
    const modal = document.querySelector(".game-match-root") as HTMLElement;
    expect(modal).not.toBeNull();

    // Match all 6 cards
    for (let i = 0; i < 6; i++) {
      const target = modal.querySelector(`.match-target-card[data-target-index="${i}"]`) as HTMLElement;
      const targetImg = target.querySelector(".match-target-img") as HTMLImageElement;
      const targetWord = targetImg.alt.replace("Picture for ", "").trim().toLowerCase();

      // Find an available (unplaced) chip matching the word
      const availableChips = Array.from(modal.querySelectorAll(".match-word-chip:not(.is-placed)")) as HTMLElement[];
      const chip = availableChips.find(c => c.textContent?.trim().toLowerCase().includes(targetWord))!;
      expect(chip).toBeDefined();

      // Tap chip then tap target card
      chip.click();
      const currentTarget = modal.querySelector(`.match-target-card[data-target-index="${i}"]`) as HTMLElement;
      currentTarget.click();

      // Verify target is marked correct and placed
      const updatedTarget = modal.querySelector(`.match-target-card[data-target-index="${i}"]`) as HTMLElement;
      expect(updatedTarget.classList.contains("is-matched")).toBe(true);
      expect(updatedTarget.querySelector(".match-card-badge.check")).not.toBeNull();
      expect(updatedTarget.querySelector(".match-placed-chip")).not.toBeNull();
    }

    // All 6 pairs are matched, triggers victory celebration
    expect(app.playGameSound).toHaveBeenCalledWith("complete");
    vi.advanceTimersByTime(600);
    expect(app.showGameCelebration).toHaveBeenCalledWith(modal, "Perfect match!");

    vi.useRealTimers();
    modal.remove();
  });

  it("supports stepping beyond available word count with allowRepeat: true in createWordCountStepper", () => {
    const stepperStart = "function createWordCountStepper({ totalWords, initialCount, onChange }) {";
    const stepperEnd = "window.createWordCountStepper = createWordCountStepper;";
    const sStart = html.indexOf(stepperStart);
    const sEnd = html.indexOf(stepperEnd);
    expect(sStart).toBeGreaterThan(-1);

    const stepperCode = html.slice(sStart, sEnd + stepperEnd.length);
    const sandbox = new Function("window", "document", `${stepperCode}`);
    sandbox(window, document);
    const createWordCountStepper = (window as any).createWordCountStepper;

    let selected = 0;
    const stepper = createWordCountStepper({
      totalWords: 4,
      allowRepeat: true,
      onChange: (c: number) => { selected = c; }
    });

    const panel = stepper.element;
    const valBadge = panel.querySelector(".ga-word-count-val");
    const incBtn = panel.querySelector(".ga-word-count-inc") as HTMLButtonElement;
    const decBtn = panel.querySelector(".ga-word-count-dec") as HTMLButtonElement;

    expect(valBadge?.textContent?.trim()).toBe("All (4)");
    expect(stepper.getValue()).toBe(4);
    expect(incBtn.disabled).toBe(false);

    // Increase to 5 cards (repeating words allowed)
    incBtn.click();
    expect(valBadge?.textContent?.trim()).toBe("5 cards");
    expect(selected).toBe(5);

    // Increase to 8 cards
    incBtn.click();
    expect(valBadge?.textContent?.trim()).toBe("8 cards");
    expect(selected).toBe(8);

    // Decrease back to 5 then All (4)
    decBtn.click();
    expect(valBadge?.textContent?.trim()).toBe("5 cards");
    decBtn.click();
    expect(valBadge?.textContent?.trim()).toBe("All (4)");
  });

  it("provides extended timer options up to 15 min for Match Words in gaEnhanceLobby", () => {
    const arcadeJs = readFileSync("public/pokeayman/games-arcade.js", "utf8");
    expect(arcadeJs).toContain("function getStandardTimerOptions");
    expect(arcadeJs).toContain("const timerOptions = getStandardTimerOptions();");
    
    // In index.html, startPlayerTurnTimer formats timer display in MM:SS when >= 60s
    expect(html).toContain("Math.floor(remaining / 60)");
  });
});
