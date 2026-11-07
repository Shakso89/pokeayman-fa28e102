import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Match Words Theme-Specific Styling", () => {
  const cssPath = path.resolve(__dirname, "../../public/pokeayman/games-arcade.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const jsPath = path.resolve(__dirname, "../../public/pokeayman/match-words.js");
  const js = fs.readFileSync(jsPath, "utf8");

  it("includes Halloween theme styles for Match Words word bank, chips, ghost, and cards", () => {
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-bank-tray');
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-word-chip');
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-drag-ghost');
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-drop-slot');
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-placed-chip');
    expect(css).toContain('[data-ga-theme="halloween"]:not([data-ga-theme="classic"]) .match-target-card');

    // Halloween word chip uses pumpkin gradient and dark contrast border
    expect(css).toMatch(/\[data-ga-theme="halloween"\][\s\S]*?\.match-word-chip[\s\S]*?#ea580c/);
  });

  it("includes Classroom theme styles for Match Words components", () => {
    expect(css).toContain('[data-ga-theme="classroom"]:not([data-ga-theme="classic"]) .match-bank-tray');
    expect(css).toContain('[data-ga-theme="classroom"]:not([data-ga-theme="classic"]) .match-word-chip');
    expect(css).toContain('[data-ga-theme="classroom"]:not([data-ga-theme="classic"]) .match-drag-ghost');
    expect(css).toContain('[data-ga-theme="classroom"]:not([data-ga-theme="classic"]) .match-drop-slot');
  });

  it("includes Jungle theme styles for Match Words components", () => {
    expect(css).toContain('[data-ga-theme="jungle"]:not([data-ga-theme="classic"]) .match-bank-tray');
    expect(css).toContain('[data-ga-theme="jungle"]:not([data-ga-theme="classic"]) .match-word-chip');
    expect(css).toContain('[data-ga-theme="jungle"]:not([data-ga-theme="classic"]) .match-drag-ghost');
    expect(css).toContain('[data-ga-theme="jungle"]:not([data-ga-theme="classic"]) .match-drop-slot');
  });

  it("includes Toybox theme styles for Match Words components", () => {
    expect(css).toContain('[data-ga-theme="toybox"]:not([data-ga-theme="classic"]) .match-bank-tray');
    expect(css).toContain('[data-ga-theme="toybox"]:not([data-ga-theme="classic"]) .match-word-chip');
    expect(css).toContain('[data-ga-theme="toybox"]:not([data-ga-theme="classic"]) .match-drag-ghost');
    expect(css).toContain('[data-ga-theme="toybox"]:not([data-ga-theme="classic"]) .match-drop-slot');
  });

  it("sets active theme on drag ghost in match-words.js and includes bank icon wrapper", () => {
    expect(js).toContain("match-bank-icon");
    expect(js).toContain("activeTheme");
    expect(js).toContain("ghostEl.setAttribute('data-ga-theme', activeTheme)");
  });
});
