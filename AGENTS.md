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
- Shop presentation is scoped in `public/pokeayman/shop-workspace.css`, with a shared card renderer for student and teacher-profile shops. Why: keeps type badges and rarity styling consistent without changing purchasing or collection rules.
