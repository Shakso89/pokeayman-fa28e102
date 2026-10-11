# PokéAyman Design System Overhaul (staged)

The brief asks for a full audit, a shared design system, and a refinement of every screen. The app has 24 separate style files and one 18k-line page, so a single pass would be shallow. The work runs in stages, and you review each one before the next starts.

## Stage 1: Audit and foundations (this approval)
- Audit the home page, login screens, teacher dashboard, Teacher Zone, Admin, student dashboard, shop/collection, games and Battle in dark and bright mode, on desktop and on phones. Each problem gets a priority based on usability, hierarchy, consistency and polish.
- Save the audit as a short report in Files so you can read it.
- Create one shared token file with:
  - Colours: navy surfaces (base, raised, elevated, hover, selected), brand yellow and red, success/warning/danger/info, the rarity tiers, and text levels (primary, secondary, muted, disabled). Every colour gets a matching bright-mode value.
  - Type scale: display, h1 to h3, body, small and caption, with one heading font and one body font. The current fonts stay unless the audit finds a problem.
  - Spacing on a 4/8-based scale, plus radius levels (sm, md, lg, pill) and three elevation levels.
  - Motion durations and easing, plus one shared focus ring.
- Map the existing scattered values to the new tokens. Nothing should change visually yet, except where the audit marks a clear bug.

## Stage 2: Shared components
Unify buttons (primary, secondary, ghost, danger, icon), cards, inputs and selects, tabs and segmented controls, badges and chips, popups, toasts and empty states. Each gets proper hover, focus, active and disabled states. Rarity frames, coin celebrations and the holographic cards keep their special treatment on purpose.

## Stage 3: Page-by-page refinement
Go through pages in priority order (teacher dashboard and class, student dashboard, Teacher Zone, games and lobby, shop/collection, Admin, home). Each page gets work on hierarchy, density, alignment and one clear main action.

## Stage 4: Visual QA
Screenshot each page in both themes at phone, tablet and desktop sizes. Then fix contrast (WCAG AA), regressions and leftover one-off styles.

## Preserved
Navy/yellow/red identity, Pokémon artwork, fan gallery, game and battle effects, all data and behaviour, the rules that the word "admin" never appears in popups and that classes are never green.

## Technical details
- New `public/pokeayman/tokens.css`, loaded first in `index.html`. Existing CSS files are refactored to use `var(--pk-*)` tokens instead of raw hex, px and shadow values.
- New `public/pokeayman/components.css` for shared component primitives (stage 2).
- Bright mode overrides only token values under the existing theme class, not each component.
- Each stage gets Playwright screenshots (simulated teacher/student sessions) at 390, 820 and 1440 widths.
- The token rules go into `public/pokeayman/AGENTS.md`.
