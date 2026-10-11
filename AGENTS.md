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

- Teacher sidebar identity stays in teacher-shell.js/.css, using the existing header name/image, a CSS Poké Ball fallback, and measured mobile profile height. Why: maintains avatar synchronization and avoids long-name overlap without changing account logic.
- Hangman keeps eight persistent SVG stages with scoped hangman-animation.css and local miss feedback. Why: each wrong guess visibly draws one new stage without restarting previous strokes or covering the game.
- Bright-mode legacy corrections live in bright-fixes.css/.js with ID-aware full-background overrides and body-scoped derived tokens; computed colours are normalized through a cached canvas. Why: legacy gradients and root-resolved aliases must not keep dark surfaces after the theme switch.
