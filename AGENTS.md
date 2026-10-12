<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the uploaded PokéAyman HTML under `public/pokeayman/index.html` and display it from the index route in an iframe; this keeps its large original DOM and scripts isolated from TanStack's React hydration.
- PokéAyman data saves to the shared Cloud table `app_records` (id + jsonb data) via a dataSdk shim in the iframe HTML; localStorage is only an offline cache. Why: keeps the original Canva code unchanged.
- Backend admin roles: user_roles table; admins enter the PokéAyman iframe as the built-in "Ayman" Admin identity (reserved name blocked for non-admins). Why: reuses all existing Admin permission checks unchanged.
- Presentation/layout rules for the iframe app live in `public/pokeayman/AGENTS.md`.
- The home fan gallery is iframe-native in home-hand.js/.css and keeps the existing admin Pokémon configuration; bundled habitat imagery is passed from the index iframe load handler. Why: reproduces the supplied interaction without introducing React into the legacy DOM.
- Home gallery settings keep a separate draft until the existing published-config save succeeds, reuse the hand renderer for preview and use a bundled full species-name snapshot for selection. Why: prevents unsaved/reset changes affecting the public gallery and supports every allowed Pokédex ID.

- Teacher sidebar identity stays in teacher-shell.js/.css, using the existing header name/image, a CSS Poké Ball fallback, and measured mobile profile height; profile page presentation uses workspace-refresh.css shared tokens. Why: maintains avatar synchronization and consistent themed headers/forms without changing account logic.
- Signed-in password changes verify the current credential through Cloud Auth before updateUser and pass current_password; recovery stays separate. Why: enforces credential verification regardless of hosted setting defaults without affecting password resets.
- Hangman keeps eight persistent SVG stages with scoped hangman-animation.css and local miss feedback. Why: each wrong guess visibly draws one new stage without restarting previous strokes or covering the game.
- Bright-mode legacy corrections live in bright-fixes.css/.js with ID-aware full-background overrides and body-scoped derived tokens; computed colours are normalized through a cached canvas. Why: legacy gradients and root-resolved aliases must not keep dark surfaces after the theme switch.

- Vocabulary cards/create row, arcade cards, stadium panels, avatar wardrobe, Quizzes and Admin Hub share workspace-refresh.css loaded after legacy bright corrections. Why: a scoped final presentation layer preserves existing handlers while enforcing both-mode layout and contrast.

- Schedule presentation shares workspace-refresh.css, with one escaped event-card renderer used by the weekly table and cloned agenda; keep original action selectors and save handlers. Why: ensures consistent two-mode colours without duplicating scheduling logic.
- Schedule rendering reads persisted entry colours before legacy colour mappings; explicit group updates synchronise matching entries and bypass automatic palette substitution. Why: keeps picker, cards and legend consistent across saves and reloads.
- Poké Battle effects stay scoped in vocab-battle.js/.css, with battle-instance guarded turn callbacks and HP animation cleanup on exit. Why: attack presentation must not change scoring, claims or leak into a replayed battle.
- Poké Battle resolves owned partners by canonical student identity (name fallback only for legacy unlinked ownership), prefers the owned avatar species, and anchors attacks to both combatants' artwork. Why: shows the correct collection without changing HP, damage or credit rules.
