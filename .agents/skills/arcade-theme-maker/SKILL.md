---
name: arcade-theme-maker
description: >-
  Comprehensive guide and design framework for creating, styling, and integrating
  bespoke, professional visual themes across all PokéAyman mini-games and stages.
  Use whenever adding, modifying, or auditing themes in the PokéAyman arcade.
---

# PokéAyman Arcade Theme Maker Skill

This skill provides an authoritative, step-by-step engineering and design framework for implementing cohesive, high-end themes for the PokéAyman mini-games suite. It ensures visual consistency, contrast accessibility, responsive geometry, and authentic Pokémon aesthetics.

---

## 1. Theme Architecture Overview

In PokéAyman, a theme is defined through a coordinated system of:
1. **Metadata & Vectors (`GAME_THEMES` in `public/pokeayman/games-arcade.js` — Source of Truth)**:
   - **CRITICAL**: Always edit `GAME_THEMES` and `gaApplyThemeToStage` in `public/pokeayman/games-arcade.js`, then run `node scripts/sync-pokeayman-game-modules.mjs` to sync the inline `<script data-pokeayman-inline="games-arcade">` block into `public/pokeayman/index.html`. Editing `index.html` directly without updating `games-arcade.js` will be overwritten on build!
   - `id`: Unique identifier slug (e.g. `classroom`, `jungle`, `toybox`, `classic`, `halloween`).
   - `name`: Human-readable title displayed in headers and tooltips.
   - `subtitle`: Descriptive one-liner shown in pickers and popovers.
   - `thumbSvg`: 120×82 inline SVG preview card for theme selection grids.
   - `cardBackSvg`: Vector card back artwork for the Memory Flip Card game.
   - `backdropSvg`: Immersive, responsive SVG environment rendered behind stages.

2. **Scoped Theme CSS in `public/pokeayman/games-arcade.css`**:
   - Stage tokens (`--ga-stage-bg`, `--ga-stage-surface`, `--ga-stage-ink`, etc.).
   - Centerpiece frames (Hangman board, Find Me box, Match game, Memory grid).
   - Game player HUD cards (Avatar rings, scores, active turn highlights).
   - Game-specific components (Surprise Boxes 3D gift crates, 4-choice question cards, Unscramble badges).
   - Battle & Arena stages (Listen & Catch, Poké Battle arena frames).

3. **Catchdex Ball Asset Pairing**:
   - Each theme pairs with an authentic Pokémon ball asset from `public/pokeayman/assets/balls/`:
     - Classic / Classroom: `1.png` (Standard Poké Ball)
     - Jungle: `6.png` (Ultra Ball with gold chevron)
     - Toybox: `11.png` (Heavy / Techno Ball with cyan nodes)
     - Halloween: `4.png` (Master Ball with spectral purple/magenta finish)

---

## 2. Core Token Specification

Every theme must define its root color tokens under the stage selector:

```css
html body > .ga-stage[data-ga-theme="<theme-id>"] {
  --ga-stage-bg: #...;        /* Canvas backdrop tone */
  --ga-stage-surface: #...;   /* Card & panel surface */
  --ga-stage-ink: #...;       /* Primary text color (Must pass AAA contrast) */
  --ga-stage-muted: #...;     /* Secondary / helper text */
  --ga-stage-line: #...;      /* Border & divider lines */
  --ga-stage-accent: #...;    /* Primary interactive button & glow accent */
  --ga-stage-chip: #...;      /* Badge / chip pill surface */
}
```

### Contrast & Contrast Safety Rule
- Dark themes must use bright, legible text (`#f8fafc`, `#fef08a`, etc.) with dark text shadows when placed on vibrant backgrounds.
- Avoid low-contrast washed-out pastel buttons; interactive states must feature bold, solid backgrounds and distinct hover glows.

---

## 3. SVG Artwork Specifications

### A. Preview Thumbnail (`thumbSvg`)
- **Dimensions**: `viewBox="0 0 120 82"`.
- **Purpose**: Rendered in `.ga-theme-card` inside the lobby visual style picker and the in-game live switcher popover.
- **Composition**: Mini scenic background, themed game board frame, and 2–3 iconic themed elements (e.g. chalkboard cards, jungle vines, cyber blocks, jack-o'-lanterns).

### B. Memory Card Back (`cardBackSvg`)
- **Dimensions**: `viewBox="0 0 200 280"` with `preserveAspectRatio="xMidYMid slice"`.
- **Purpose**: Rendered on the back face of every card in the Flip Card (Memory) game.
- **Composition**:
  - Outer border with theme-specific corner filigree/brackets.
  - Inner cosmic, texture, or woodgrain gradient.
  - Centered Pokéball with theme-specific styling and orbital energy rings.
  - Crisp contrast so symbols stand out in any card grid density.

### C. Atmospheric Backdrop (`backdropSvg`)
- **Dimensions**: Responsive SVG with `preserveAspectRatio="xMidYMid slice"`.
- **Placement**: Mounted inside `.ga-theme-backdrop` behind the gameplay arena.
- **Composition**:
  - Distant horizon elements (celestial bodies, mountains, silhouetted architecture).
  - Mid-ground atmospheric silhouettes (trees, banners, neon scaffolding).
  - Ambient particles (spores, embers, stars, bats, ghost wisps).
  - Foreground corner anchors keeping the central viewport clear for game boards.

---

## 4. Mini-Game Scoped Matrix Checklist

When building or updating a theme, the following game components must be styled in `games-arcade.css`:

### 1. Game Header & HUD
- `.ga-stage-header` and `.ga-stage-theme-btn`.
- `.game-player-card`: Inactive state vs `.is-active` state.
- `.game-player-turn` and turn badges.
- Player score value and timer track.

### 2. Centerpiece Boards & Panels
Centerpiece panels must receive 3D frames matching the theme's core material:
```css
html body > .ga-stage[data-ga-theme="<theme-id>"] #hangman-drawing-panel,
html body > .ga-stage[data-ga-theme="<theme-id>"] #hangman-content,
html body > .ga-stage[data-ga-theme="<theme-id>"] #find-me-box,
html body > .ga-stage[data-ga-theme="<theme-id>"] .match-game-board,
html body > .ga-stage[data-ga-theme="<theme-id>"] .memory-game-grid {
  /* 3D layered borders, shadows, and interior backdrop */
}
```
*Note: `#baam-board` must NOT have borders or padding added to its container, as Surprise Boxes manages its own 1.25:1 grid constraints.*

### 3. Surprise Boxes (BAAM) Overhaul Rules
- **Locked Aspect Ratio**: Boxes must always maintain `aspect-ratio: 1.25 / 1 !important;`.
- **Box Body (`.baam-box-body`)**: Bespoke physical texture (e.g. wood planks, carved stone, mecha plates, haunted Jack-o'-lantern).
- **Box Lid (`.baam-box-lid`)**: Themed canopy with custom lid attachments (`::before` / `::after` for hinges, tendrils, antennas, or bat wings).
- **Poké Ball Seal (`.baam-box-seal`)**: Houses the Catchdex Pokémon ball image with a glowing themed bezel.
- **Number Badge (`.baam-box-num`)**: Styled as an authentic physical tag (brass locker plate, runic medallion, HUD digital badge, carved tombstone).
- **4-Choice Question Cards**:
  - Question card panel: Theme-matching textured modal.
  - Vocabulary choices (`.baam-choice-btn`): Themed borders, active hover states, and clear badge numbers (`.baam-choice-badge`).
  - Answer status pill (`#baam-answer-status`): Clear success/error contrast.

### 4. Listen & Catch & Poké Battle
- Stage containers: `html body > .ga-stage[data-ga-theme="<theme-id>"].lc-stage` and `.vb-stage`.
- Arena battle ground styling, card selectors, battle HUD cards.

---

## 5. Verification & QA Protocol

Always execute the following verification pipeline before publishing a theme:
1. **Module Sync**: Run `node scripts/sync-pokeayman-game-modules.mjs` to ensure iframe assets and host modules match.
2. **Unit Tests**: Run `npx vitest run` to verify app routing and component integrity.
3. **Production Build**: Run `npm run build` to confirm SSR, client, and Nitro workers build without errors.
4. **Live Switch Test**: Verify theme switching works seamlessly both before game start (lobby) and during active gameplay (header popover).
