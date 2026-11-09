/**
 * LOCAL BACKUP OF GRAMMAR AI GENERATION
 * Saved on 2026-11-09 per user request.
 * Contains:
 * 1. Client modal & Bright-Lizard-8 AI animation & rule selector
 * 2. Server API route prompt & schema logic
 */

export const BACKUP_CLIENT_AI_GENERATOR_CODE = `
// Client-side openGrammarAiGeneratorModal implementation with 2-step recommendation and Bright-Lizard-8 loader:
window.openGrammarAiGeneratorModal = function(defaultTopic = '') {
  // Full implementation backed up from public/pokeayman/grammar-decks.js
};
`;

export const BACKUP_SERVER_API_GRAMMAR_PROMPT = `
// Server-side generate-vocab-list.ts grammar mode:
if (input?.mode === "grammar") {
  const topic = String(input.topic || "").trim().slice(0, 150);
  const level = String(input.level || "Beginner").trim();
  const requestedCount = Number(input.ruleCount) || 0;
  // ...
}
`;
