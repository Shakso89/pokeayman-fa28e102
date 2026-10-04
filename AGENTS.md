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
- The imported Canva data interface is a browser-local preview adapter, not shared account storage; Canva's private sheet and image assets are not included in an HTML export.
