# Class screen refresh
- [x] Organize the vocabulary editor and resolve canonical IDs to saved record IDs for batch renaming; isolated preview tests passed for linked/legacy words, reopening, reload, duplicate rejection, failed save/retry and Enter. Signed-in Cloud writes remain unverified because no matching preview account is available; no user lists changed.
- [x] Apply horizontal Elite Trainer in-class profile and remove profile ±10 controls; verified saved student data, collection/shop/quiz tabs, custom negative amount entry, view-only control hiding, bright/dark modes, champion treatment and 390px layout without changing balances.
- [x] Finish battle stadium, VS, banners, damage, elemental hits, victory, fainting and full-screen Projector; isolated preview battle passed through victory with active audio output, fullscreen enter/exit, compact layout and no runtime errors. Routing test/build passed; saved Pokémon were untouched.
- [ ] Verify battle with a signed-in teacher and assess audible sound quality; blocked because the requesting user has no matching preview account. Isolated preview battle and generated audio output are verified, but real ownership transfers were intentionally not exercised.
- [x] Remove hidden second Teacher Zone delete confirmation and await verified deletion before success; isolated record tests passed for cancel, failure, ownership denial and success timing, with routing test/build passing. Authenticated live deletion remains unverified because preview session minting found no matching account; no saved lists were deleted during testing.
- [x] Restore app scrolling after results and add a persisted reopenable teacher sidebar; actual student scrolling verified after Memory results and Surprise Boxes exit. Sidebar collapse/reopen and reload persistence passed presentation checks; authenticated teacher access remains unverified.
- [x] Separate VB selection from arcade launch and body-mount fullscreen games with shared controls and refreshed Surprise Boxes scores; real student list → Next → Memory → card interaction → result dismissal passed, plus Surprise Boxes opening and compact reveal checks. Existing routing test and build passed; rewards unchanged.
- [x] Simplify pre-game setup into a compact player roster, grouped round settings, expandable timer/rewards and one start action; all six setup control checks passed with sample class players, including independent box counts/timers and narrow layout. Real teacher launch remains unverified because no account matches the requesting user.
- [x] Hide duplicate teacher navigation when the sidebar is visible and add a persistent bright/dark switch; verified toggling, reload persistence, sidebar-width hiding, narrow-screen switch and existing navigation. Teacher presentation checked without a signed-in teacher session; saves and permissions unchanged.
- [x] Collapse Teacher Zone/Admin Hub and add searchable school/class switching; presentation checks passed for search, filters, direct school access, dismissal and preserving Vocabulary. Authenticated teacher checks remain unavailable because the requesting user has no matching preview account; permissions and saves unchanged.
- [x] Replace coin award, deduction and class-gift celebrations with centered animated pop-ups; verified signed amounts, dismissal, compact layout and reduced motion in the live preview. Authenticated teacher awarding remains unverified because no matching preview account was available; saving logic unchanged.
- [x] Remove scrolling from class tabs and student actions.
- [x] Apply selected Elite Trainer Dashboard student cards.
- [x] Check class switching, student profile access and narrow layouts (presentation test; no authenticated data changes).

# Shop refinement
- [x] Combine shop search and sorting; compact rarity filters in both shops.
- [x] Show individual type badges and distinctive Rare / Legendary borders.
- [x] Verify filtering, sorting, pagination and card opening in both shops (presentation checks; purchasing unchanged).

# Shop styling correction
- [x] Select stronger rarity frames with readable filters and restored dual-type gradients.
- [x] Apply the selected styling to both shops and verify appearance and controls (filter, sort, search, pagination and card details; no purchasing changes).

# Collection and student dashboard
- [x] Apply Mythic cards to student, profile and view-only collections, preserving HP and actions.
- [x] Fix student background gaps, empty teacher badge, header spacing and navigation layout.
- [x] Verify real student sign-in, collection details, study, games and logout; check desktop and narrow layouts with no card clipping.

# Collection correction and Pokémon details
- [x] Fix the missed teacher-facing collection so every collection matches the shop.
- [x] Apply selected option 1 silver detailed cards by tier with type backgrounds and remove sound controls.
- [x] Verify actual student collection and shop navigation, classmate collection, and detail cards at full and narrow widths; teacher profile renderer checked without authenticated teacher access.

# Card and global ranking corrections
- [x] Fix staircase Pokémon layout and duplicate rarity badges.
- [x] Give global top-three students consistent unique cards within classes.
- [x] Verify actual student shop, carousel navigation, class cards and narrow-screen layout; teacher class renderer shares the same ranking treatment (teacher session not exercised).

# Student shop controls
- [x] Fix previous/next arrows to step through the current ten Pokémon without changing pages.
- [x] Match search, sorting, rarity filters and carousel controls to the sunny student theme.
- [x] Verify repeated arrow clicks, endpoints, dots and numbered pagination in the student shop.

# Champion cards and elemental collection
- [x] Apply distinctive global medal cards to rosters, both student profile panels and classmate dialogs.
- [x] Restore shared shop type gradients and rarity frames in student collections.
- [x] Verify real student collection, global rankings, classmate profile and narrow layouts; shared teacher roster renderer checked with live leaders, without teacher actions.

# Champion class view
- [x] Apply the existing metallic champion treatment on every assigned and view-only class navigation.
- [x] Verify all three shared class medal cards with live records and student flows; authenticated teacher navigation unavailable because preview sign-in could not be established.

# Natural vocabulary reading
- [x] Replace device speech in both flashcard views with one natural voice for words and sentences.
- [x] Verify real student word/sentence audio streams, cached replay and clear failure messages; teacher buttons use the same reader, but authenticated teacher navigation and subjective audible quality remain unverified.
- [x] Delete the Noah vocabulary list from saved app data and verify removal.
- [x] Redesign the public home page using the shared reference, reinterpreted with Pokémon visuals.

# Details card tier effects
- [x] Keep the gold electric border and its energy filter on legendary details cards only; common, uncommon and rare cards must never show it.
- [x] Verify legendary shows the border, common/uncommon/rare never do, and the border survives repeated tier switches.
