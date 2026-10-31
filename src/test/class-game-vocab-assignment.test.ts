import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  fetchClassActiveGameVocabListIds,
  updateClassActiveGameVocabListIds,
  fetchStudentEnrolledClasses,
} from "@/lib/class-students";

describe("Teacher Game Vocabulary Assignment & Multi-Class Student Dashboard Isolation", () => {
  const root = process.cwd();

  it("1. Database Schema Migration includes active_game_vocab_list_ids column on classes table", () => {
    const migration = readFileSync(
      path.join(root, "supabase", "migrations", "20261031170000_add_active_game_vocab_list_ids_to_classes.sql"),
      "utf8"
    );
    expect(migration).toContain("ALTER TABLE public.classes");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS active_game_vocab_list_ids UUID[] DEFAULT '{}'");

    const types = readFileSync(path.join(root, "src", "integrations", "supabase", "types.ts"), "utf8");
    expect(types).toContain("active_game_vocab_list_ids: string[] | null");
  });

  it("2. Teacher Class Management contains Game Access toggle control and isolates updates per class with pure vector icons", () => {
    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    expect(indexHtml).toContain("handleToggleGameAccess");
    expect(indexHtml).toContain("Game: ${isGameActive ? 'ON' : 'OFF'}");
    expect(indexHtml).toContain("toDeterministicUuid");
    expect(indexHtml).toContain("active_game_vocab_list_ids: dbPayload");
    expect(indexHtml).toContain(".eq('id', resolvedClassId)");
    expect(indexHtml).toContain("vocab-game-pill");
    expect(indexHtml).toContain("vocab-flashcard-pill");
    expect(indexHtml).toContain("open-cover-vocab-btn");
  });

  it("3. Student UI Games Tab renders multi-class grouped view and strictly filters by active assignments", () => {
    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    // Multi-class group header and active game count
    expect(indexHtml).toContain("activeLists.length === 1 ? 'game' : 'games'");
    // Strict active assignment filter
    expect(indexHtml).toContain("isVocabListGameActive(list, cls.school_name, cls.class_name)");
    // Empty state per class
    expect(indexHtml).toContain("No vocabulary lists are currently active for games in this class.");
    // Selection interaction
    expect(indexHtml).toContain("handleStudentSelectGameList");
  });

  it("4. Student UI Study Tab provides unrestricted flashcard access grouped by class", () => {
    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    expect(indexHtml).toContain("function renderStudentVocabulary()");
    expect(indexHtml).toContain("openStudentVocabularyFlashcards");
    // Ensure all lists are grouped by class in Study tab without active_game_vocab_list_ids filter
    expect(indexHtml).toContain("data-study-class=");
    expect(indexHtml).toContain("classLists.length === 1 ? 'list' : 'lists'");
  });

  it("5. Class helper functions handle active game vocab list queries and updates", async () => {
    const mockClassId = "c1111111-1111-1111-1111-111111111111";
    const mockListIds = [
      "a2222222-2222-2222-2222-222222222222",
      "b3333333-3333-3333-3333-333333333333",
    ];

    expect(typeof fetchClassActiveGameVocabListIds).toBe("function");
    expect(typeof updateClassActiveGameVocabListIds).toBe("function");
    expect(typeof fetchStudentEnrolledClasses).toBe("function");

    // Empty classId safety
    const emptyResult = await fetchClassActiveGameVocabListIds("");
    expect(emptyResult).toEqual([]);

    const emptyStudent = await fetchStudentEnrolledClasses("");
    expect(emptyStudent).toBeNull();
  });

  it("6. Game setup vocabulary picker removes irrelevant Listen and Catch banner across game flows", () => {
    const indexHtml = readFileSync(path.join(root, "public", "pokeayman", "index.html"), "utf8");
    expect(indexHtml).not.toContain("ga-listen-quickplay");
    expect(indexHtml).not.toContain("Uses all vocabulary lists in the selected class automatically.");
  });
});
