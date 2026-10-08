# Show shared vocabulary lists in the class Vocabulary tab

## Problem
A list shared to a class (via "Share to Other Classes") does not appear in that class's Vocabulary tab — the tab shows "No vocabulary lists yet." The students' vocabulary view and the games list picker already include shared lists; only the teacher's class Vocabulary tab misses them.

## Root cause (confirmed)
`renderVocabLists()` in `public/pokeayman/index.html` (line ~15513) filters lists with strict equality:

```js
getVocabLists().filter(l => l.vocab_list_school === navSchool && l.vocab_list_class === navClass)
```

This ignores the `shared_classes` field. The existing helper `vocabListInClass(list, school, cls)` (line ~12251) already checks both the home class and `shared_classes`, and `getVocabLists(school, class)` itself also includes shared classes — but `renderVocabLists` re-filters afterward and drops them.

## Changes (all in public/pokeayman/index.html)

1. **Include shared lists in the class tab**
   - Change the filter in `renderVocabLists()` to `getVocabLists().filter(l => vocabListInClass(l, navSchool, navClass))`.

2. **Mark shared lists clearly**
   - For lists whose home class is not the current class, add a small "Shared from {class}" label on the card so the teacher knows it lives elsewhere.

3. **Safe actions for shared lists**
   - Flashcards and Edit work as today (editing updates the single shared list for every class — intended).
   - The "Remove" button on a shared (not home) list unshares it from the current class only (removes the class from `shared_classes` via the existing share-save path / dataSdk update), instead of deleting the list. The home class keeps the real Delete behavior.

## Verification
- Build check plus a Playwright pass: share a list to a second class, open that class's Vocabulary tab, confirm the card appears with the shared label, flashcards open, and Remove unshares without deleting the list.
