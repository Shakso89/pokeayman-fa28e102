import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

describe("Battle Arena Game Module Architecture", () => {
  it("exists as a standalone discrete module in public/pokeayman/battle-arena.js", () => {
    const battlePath = path.resolve(__dirname, "../../public/pokeayman/battle-arena.js");
    expect(fs.existsSync(battlePath)).toBe(true);

    const source = fs.readFileSync(battlePath, "utf8");
    expect(source.length).toBeGreaterThan(1000);
    expect(source).toContain("window.populateBattleSelects = populateBattleSelects;");
    expect(source).toContain("window.resetBattleTabState = resetBattleTabState;");
    expect(source).toContain("window.setupBattle = setupBattle;");
    expect(source).toContain("window.arenaExitProjector = arenaExitProjector;");
  });

  it("is registered in scripts/sync-pokeayman-game-modules.mjs", () => {
    const syncPath = path.resolve(__dirname, "../../scripts/sync-pokeayman-game-modules.mjs");
    const syncSource = fs.readFileSync(syncPath, "utf8");
    expect(syncSource).toContain('"battle-arena"');
  });

  it("is synchronized in public/pokeayman/index.html with data-pokeayman-inline", () => {
    const htmlPath = path.resolve(__dirname, "../../public/pokeayman/index.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    expect(html).toContain('data-pokeayman-inline="battle-arena"');
  });

  it("evaluates without syntax errors in browser environment and binds exports", () => {
    const battlePath = path.resolve(__dirname, "../../public/pokeayman/battle-arena.js");
    const source = fs.readFileSync(battlePath, "utf8");

    // Execute the module in jsdom window
    const execute = new Function(source);
    expect(() => execute()).not.toThrow();

    expect(typeof (window as any).populateBattleSelects).toBe("function");
    expect(typeof (window as any).resetBattleTabState).toBe("function");
    expect(typeof (window as any).setupBattle).toBe("function");
    expect(typeof (window as any).arenaExitProjector).toBe("function");
    expect(typeof (window as any).resetManualBattleStage).toBe("function");
    expect(typeof (window as any).getManualBattleDraft).toBe("function");
  });
});
