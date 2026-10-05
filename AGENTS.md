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
- Class workspace presentation is scoped in `public/pokeayman/class-workspace.css`, with one shared roster-card renderer for assigned and view-only classes. Why: prevents legacy style collisions and keeps the two card views consistent without changing data permissions.
- Shop and collection presentation share `public/pokeayman/shop-workspace.css` and one card renderer, with collection-specific HP and existing actions. Why: keeps elemental backgrounds and rarity frames consistent without changing ownership rules.
- Student dashboard layout fixes are scoped in `public/pokeayman/student-workspace.css`. Why: isolates student layout and background fixes from legacy teacher styles.
- Global rank cards use `rank-workspace.css` and the canonical merged leaderboard identities, with one idempotent crest renderer covering rosters, both profile panels and classmate profile dialogs; run it after each teacher class render, including view-only branches. Why: prevents duplicate badges and keeps medals visible after navigation independently of full-app refreshes.
- Shop species names and types load from a bundled official PokéAPI snapshot before rendering. Why: avoids hundreds of live requests and prevents temporarily mismatched artwork and badges.
- Pokémon details use scoped detail-workspace.css with the shared elemental palette and tier classes; guard asynchronous type updates by selected species. Why: isolates legacy styling and prevents stale species backgrounds.
