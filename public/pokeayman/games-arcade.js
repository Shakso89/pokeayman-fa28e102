// Arcade games hub, lobby helpers and 3-2-1 countdown. Only presentation; game logic stays in index.html.
(function () {
  const GAMES = [
    { fn: 'chooseDotsAndBoxes', icon: '⚄', image: '/pokeayman/assets/games/dots-and-boxes.jpg', name: 'Dots and Boxes', desc: 'Answer vocabulary questions to draw lines, claim boxes, and outsmart your opponent.', tags: ['2-Player', 'Strategy', 'Vocab MCQ'], accent: 'amber' },
    { fn: 'chooseBaamboozlePowerUps', icon: '🎁', image: '/pokeayman/assets/games/surprise-boxes.jpg', name: 'Surprise Boxes', desc: 'Open mystery boxes full of power-ups, traps and score swaps.', tags: ['1–4 players', 'Class favourite'], accent: 'pink' },
    { fn: 'chooseMatchWordCount', icon: '🎯', image: '/pokeayman/assets/games/match-words.jpg', name: 'Match Words', desc: 'Race to match each word with its picture.', tags: ['1–4 players', 'Fast reflexes'], accent: 'red' },
    { fn: 'chooseMemoryDifficulty', icon: '🧠', image: '/pokeayman/assets/games/memory-flip.jpg', name: 'Memory Flip', desc: 'Flip the tiles and find the matching pairs.', tags: ['1–4 players', 'Focus'], accent: 'violet' },
    { fn: 'chooseScrambleWordCount', icon: '🔤', image: '/pokeayman/assets/games/unscramble.jpg', name: 'Unscramble', desc: 'Put the mixed-up letters back in order.', tags: ['1–4 players', 'Spelling'], accent: 'blue' },
    { fn: 'chooseHangmanWordCount', icon: '🎮', image: '/pokeayman/assets/games/hangman.jpg', name: 'Hangman', desc: 'Guess the secret word letter by letter.', tags: ['1–4 players', 'Classic'], accent: 'yellow' },
    { fn: 'chooseCrossword', icon: '▦', image: '/pokeayman/assets/games/crosswords.jpg', name: 'Crosswords', desc: 'Solve vocabulary clues and fill the intersecting word grid.', tags: ['1–4 players', 'Vocabulary'], accent: 'mint' },
    { fn: 'chooseFindMeScore', icon: '🕵️', image: '/pokeayman/assets/games/find-me.jpg', name: 'Find Me', desc: 'Spot the right word as fast as you can.', tags: ['1–4 players', 'Quick recall'], accent: 'mint' },
    { fn: 'startListenCatch', icon: '🔊', image: '/pokeayman/assets/games/listen-catch.jpg', name: 'Listen and Catch', desc: 'Hear a word, catch the right answer, and fill your Catchdex.', tags: ['Solo', 'Listening'], accent: 'violet', proOnly: true },
    { fn: 'startVocabBattle', icon: '⚔️', image: '/pokeayman/assets/games/poke-battle.jpg', name: 'Poké Battle', desc: 'Defeat a wild Pokémon and send its reward to your teacher for approval.', tags: ['Solo', 'Teacher-approved reward'], accent: 'red', proOnly: true },
  ];
  window.GAMES = GAMES;
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  
  function ensureMasterCardBackDefs() {
    if (typeof document === 'undefined' || document.getElementById('ga-card-back-master-defs')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'ga-card-back-master-defs';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    svg.innerHTML = `<defs>
      <!-- Classroom Theme Master Gradients -->
      <radialGradient id="ga-def-cb-cls-bg" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="#356949"/>
        <stop offset="65%" stop-color="#224932"/>
        <stop offset="100%" stop-color="#163322"/>
      </radialGradient>
      <linearGradient id="ga-def-cb-cls-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d49a62"/>
        <stop offset="50%" stop-color="#a86d38"/>
        <stop offset="100%" stop-color="#7c4b1e"/>
      </linearGradient>
      <linearGradient id="ga-def-cb-cls-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <radialGradient id="cb-cls-bg" href="#ga-def-cb-cls-bg"/>
      <linearGradient id="cb-cls-wood" href="#ga-def-cb-cls-wood"/>
      <linearGradient id="cb-cls-gold" href="#ga-def-cb-cls-gold"/>

      <!-- Jungle Theme Master Gradients -->
      <linearGradient id="ga-def-cb-jgl-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#957045"/><stop offset=".5" stop-color="#65492e"/><stop offset="1" stop-color="#3d3023"/></linearGradient>
      <linearGradient id="ga-def-cb-jgl-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bfdf7d"/><stop offset=".55" stop-color="#4b9e58"/><stop offset="1" stop-color="#1d6348"/></linearGradient>
      <linearGradient id="ga-def-cb-jgl-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0a8"/><stop offset=".52" stop-color="#d7b54d"/><stop offset="1" stop-color="#926127"/></linearGradient>
      <radialGradient id="ga-def-cb-jgl-light"><stop stop-color="#9bd978" stop-opacity=".36"/><stop offset="1" stop-color="#12372b" stop-opacity="0"/></radialGradient>
      <linearGradient id="cb-jgl-wood" href="#ga-def-cb-jgl-wood"/>
      <linearGradient id="cb-jgl-leaf" href="#ga-def-cb-jgl-leaf"/>
      <linearGradient id="cb-jgl-gold" href="#ga-def-cb-jgl-gold"/>
      <radialGradient id="cb-jgl-light" href="#ga-def-cb-jgl-light"/>

      <!-- Toybox Theme Master Gradients -->
      <linearGradient id="ga-def-cb-toy-frame" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#43d7d0"/><stop offset=".48" stop-color="#9182ff"/><stop offset="1" stop-color="#fa83ab"/></linearGradient>
      <linearGradient id="ga-def-cb-toy-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4a3b9a"/><stop offset="1" stop-color="#27215e"/></linearGradient>
      <linearGradient id="ga-def-cb-toy-ball" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8ffff"/><stop offset=".48" stop-color="#81e8e8"/><stop offset=".5" stop-color="#f8ffff"/><stop offset="1" stop-color="#bcd2ef"/></linearGradient>
      <linearGradient id="cb-toy-frame" href="#ga-def-cb-toy-frame"/>
      <linearGradient id="cb-toy-bg" href="#ga-def-cb-toy-bg"/>
      <linearGradient id="cb-toy-ball" href="#ga-def-cb-toy-ball"/>

      <!-- Halloween Theme Master Gradients -->
      <linearGradient id="ga-def-cb-hlw-border" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fdba74"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#9a3412"/></linearGradient>
      <radialGradient id="ga-def-cb-hlw-bg" cx="50%" cy="50%" r="65%"><stop offset="0%" stop-color="#3b176b"/><stop offset="60%" stop-color="#1e0b3b"/><stop offset="100%" stop-color="#0d041c"/></radialGradient>
      <linearGradient id="ga-def-cb-hlw-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdba74"/><stop offset="45%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
      <linearGradient id="ga-def-cb-hlw-bot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#581c87"/><stop offset="100%" stop-color="#2e1065"/></linearGradient>
      <linearGradient id="cb-hlw-border" href="#ga-def-cb-hlw-border"/>
      <radialGradient id="cb-hlw-bg" href="#ga-def-cb-hlw-bg"/>
      <linearGradient id="cb-hlw-top" href="#ga-def-cb-hlw-top"/>
      <linearGradient id="cb-hlw-bot" href="#ga-def-cb-hlw-bot"/>
    </defs>`;
    (document.body || document.documentElement).appendChild(svg);
  }
  window.ensureMasterCardBackDefs = ensureMasterCardBackDefs;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureMasterCardBackDefs);
    else ensureMasterCardBackDefs();
  }

  const THEME_STORAGE_KEY = 'pokeayman-game-theme';
  const GAME_THEMES = [
    {
      id: 'classroom',
      name: 'Classroom',
      subtitle: 'Poké Academy & chalkboard',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-cls-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f3dfc1"/><stop offset="100%" stop-color="#ddb888"/>
          </linearGradient>
          <linearGradient id="th-cls-board" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2f5e41"/><stop offset="100%" stop-color="#1b3b28"/>
          </linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-cls-bg)"/>
        <rect y="67" width="120" height="15" fill="#b88652"/>
        <rect y="65" width="120" height="3" fill="#8f6235"/>
        <path d="M0 4 L11 16 L20 4 Z" fill="#e05a47"/><path d="M20 4 L31 15 L40 4 Z" fill="#f5b841"/><path d="M40 4 L50 13 L58 4 Z" fill="#4ea885"/>
        <line x1="100" y1="0" x2="100" y2="15" stroke="#785634" stroke-width="1.2"/><circle cx="100" cy="15" r="5.5" fill="#f59e0b"/><circle cx="98" cy="13.5" r="2" fill="#fef08a"/>
        <rect x="11" y="12" width="98" height="53" rx="5" fill="url(#th-cls-board)" stroke="#9e6736" stroke-width="4"/>
        <rect x="13" y="14" width="94" height="49" rx="3" fill="none" stroke="#d49b62" stroke-width="1"/>
        <g transform="translate(20, 21)">
          <rect width="23" height="24" rx="4" fill="#234832" stroke="#eab308" stroke-width="1.5"/>
          <circle cx="11.5" cy="12" r="7" fill="#fff" stroke="#1e293b" stroke-width="1.4"/>
          <path d="M4.5 12 A7 7 0 0 1 18.5 12 Z" fill="#ef4444"/>
          <line x1="4.5" y1="12" x2="18.5" y2="12" stroke="#1e293b" stroke-width="1.5"/>
          <circle cx="11.5" cy="12" r="2.2" fill="#fff" stroke="#1e293b" stroke-width="1.2"/>
          <polygon points="11.5,2 4,5.5 11.5,8.5 19,5.5" fill="#1e293b"/>
        </g>
        <rect x="48.5" y="21" width="23" height="24" rx="4" fill="#f6e7c8" stroke="#3d2e22" stroke-width="1.8"/>
        <text x="60" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#264e36">A</text>
        <rect x="77" y="21" width="23" height="24" rx="4" fill="#f59e0b" stroke="#3d2e22" stroke-width="1.8"/>
        <text x="88.5" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1e293b">B</text>
        <rect x="24" y="50" width="72" height="8" rx="2.5" fill="#ffffff" stroke="#3d2e22" stroke-width="1.2"/>
        <rect x="76" y="61" width="14" height="3" rx="1" fill="#ffffff"/><rect x="92" y="61" width="10" height="3" rx="1" fill="#facc15"/>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="cb-cls-bg" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stop-color="#356949"/>
            <stop offset="65%" stop-color="#224932"/>
            <stop offset="100%" stop-color="#163322"/>
          </radialGradient>
          <linearGradient id="cb-cls-wood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d49a62"/>
            <stop offset="50%" stop-color="#a86d38"/>
            <stop offset="100%" stop-color="#7c4b1e"/>
          </linearGradient>
          <linearGradient id="cb-cls-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="22" fill="url(#ga-def-cb-cls-wood)"/>
        <rect x="8" y="8" width="184" height="184" rx="16" fill="url(#ga-def-cb-cls-bg)" stroke="#5c3614" stroke-width="3"/>
        <rect x="15" y="15" width="170" height="170" rx="12" fill="none" stroke="#f3d078" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.75"/>
        <!-- Corner brass school brackets -->
        <path d="M12 30 L12 12 L30 12" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M170 12 L188 12 L188 30" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M12 170 L12 188 L30 188" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M170 188 L188 188 L188 170" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <!-- Subtle chalkboard ruled lines & chalk stars -->
        <line x1="26" y1="52" x2="174" y2="52" stroke="#ffffff" stroke-width="1" opacity="0.1"/>
        <line x1="26" y1="100" x2="174" y2="100" stroke="#ffffff" stroke-width="1" opacity="0.1"/>
        <line x1="26" y1="148" x2="174" y2="148" stroke="#ffffff" stroke-width="1" opacity="0.1"/>
        <circle cx="42" cy="42" r="2.2" fill="#fef08a" opacity="0.7"/>
        <circle cx="158" cy="42" r="2.2" fill="#fef08a" opacity="0.7"/>
        <!-- Crossed Classroom Pencils behind emblem -->
        <g transform="rotate(-38 100 96)">
          <rect x="30" y="90" width="140" height="12" rx="2" fill="#fbbf24" stroke="#1e293b" stroke-width="2.2"/>
          <rect x="30" y="90" width="16" height="12" rx="2" fill="#f472b6" stroke="#1e293b" stroke-width="2.2"/>
          <rect x="43" y="90" width="6" height="12" fill="#cbd5e1" stroke="#1e293b" stroke-width="1.8"/>
          <polygon points="170,90 186,96 170,102" fill="#fde68a" stroke="#1e293b" stroke-width="2.2"/>
          <polygon points="180,93.8 186,96 180,98.2" fill="#1e293b"/>
        </g>
        <g transform="rotate(38 100 96)">
          <rect x="30" y="90" width="140" height="12" rx="2" fill="#38bdf8" stroke="#1e293b" stroke-width="2.2"/>
          <rect x="154" y="90" width="16" height="12" rx="2" fill="#f472b6" stroke="#1e293b" stroke-width="2.2"/>
          <rect x="151" y="90" width="6" height="12" fill="#cbd5e1" stroke="#1e293b" stroke-width="1.8"/>
          <polygon points="30,90 14,96 30,102" fill="#fde68a" stroke="#1e293b" stroke-width="2.2"/>
          <polygon points="20,93.8 14,96 20,98.2" fill="#1e293b"/>
        </g>
        <!-- Golden Academy Laurel Wreath -->
        <path d="M52 126 C34 102 38 66 64 50" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M148 126 C166 102 162 66 136 50" fill="none" stroke="url(#ga-def-cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="42" cy="98" rx="8" ry="4" transform="rotate(-50 42 98)" fill="#facc15"/>
        <ellipse cx="44" cy="78" rx="8" ry="4" transform="rotate(-30 44 78)" fill="#facc15"/>
        <ellipse cx="54" cy="60" rx="8" ry="4" transform="rotate(-15 54 60)" fill="#fde047"/>
        <ellipse cx="158" cy="98" rx="8" ry="4" transform="rotate(50 158 98)" fill="#facc15"/>
        <ellipse cx="156" cy="78" rx="8" ry="4" transform="rotate(30 156 78)" fill="#facc15"/>
        <ellipse cx="146" cy="60" rx="8" ry="4" transform="rotate(15 146 60)" fill="#fde047"/>
        <!-- Stacked Academy Books under Pokéball -->
        <rect x="54" y="132" width="92" height="15" rx="4" fill="#2563eb" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="58" y="135" width="80" height="9" rx="2" fill="#fef3c7"/>
        <rect x="48" y="120" width="104" height="14" rx="4" fill="#dc2626" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="54" y="123" width="88" height="8" rx="2" fill="#fffbeb"/>
        <!-- Center Scholar Poké Ball -->
        <circle cx="100" cy="90" r="38" fill="#ffffff" stroke="#1e293b" stroke-width="4.5"/>
        <path d="M62 90 A38 38 0 0 1 138 90 Z" fill="#ef4444"/>
        <path d="M68 76 A30 26 0 0 1 116 60" fill="none" stroke="#fca5a5" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>
        <rect x="62" y="85.5" width="76" height="9" fill="#1e293b"/>
        <circle cx="100" cy="90" r="13" fill="#ffffff" stroke="#1e293b" stroke-width="4.5"/>
        <circle cx="100" cy="90" r="6.5" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Scholar Mortarboard Graduation Cap on the Poké Ball -->
        <path d="M74 58 L74 70 C74 76 126 76 126 70 L126 58 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="100,34 50,52 100,68 150,52" fill="#334155" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="100,38 58,52 100,64 142,52" fill="#1e293b"/>
        <circle cx="100" cy="51" r="4" fill="#facc15"/>
        <path d="M100 51 Q128 56 136 78" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
        <polygon points="136,75 131,88 141,88" fill="#facc15" stroke="#b45309" stroke-width="1"/>
        <!-- Bottom Academy Ribbon Banner -->
        <rect x="34" y="154" width="132" height="24" rx="8" fill="url(#ga-def-cb-cls-gold)" stroke="#451a03" stroke-width="2.8"/>
        <text x="100" y="170.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" letter-spacing="1.2" fill="#1c1917">POKÉ ACADEMY</text>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-cls-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f5e6c8"/>
            <stop offset="68%" stop-color="#e5cba0"/>
            <stop offset="100%" stop-color="#d4b27c"/>
          </linearGradient>
          <linearGradient id="ga-cls-beam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.48"/>
            <stop offset="60%" stop-color="#fef3c7" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#f5e6c8" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="ga-cls-woodfloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#b8844c"/>
            <stop offset="100%" stop-color="#8c5c2b"/>
          </linearGradient>
          <linearGradient id="ga-cls-wainscot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d5a874"/>
            <stop offset="100%" stop-color="#bc8b54"/>
          </linearGradient>
        </defs>
        <!-- Sunlit Classroom Plaster Wall -->
        <rect width="1440" height="900" fill="url(#ga-cls-wall)"/>
        <!-- Window Light Beams from Left -->
        <polygon points="0,0 480,0 920,900 180,900" fill="url(#ga-cls-beam)"/>
        <polygon points="560,0 820,0 1180,900 840,900" fill="url(#ga-cls-beam)" opacity="0.65"/>
        <!-- Wooden Wainscoting Lower Wall Paneling -->
        <rect y="690" width="1440" height="120" fill="url(#ga-cls-wainscot)"/>
        <rect y="682" width="1440" height="12" fill="#a4713e"/>
        <rect y="694" width="1440" height="4" fill="#e8c396" opacity="0.5"/>
        <g stroke="#a37240" stroke-width="2" opacity="0.45">
          <line x1="90" y1="694" x2="90" y2="810"/><line x1="180" y1="694" x2="180" y2="810"/><line x1="270" y1="694" x2="270" y2="810"/>
          <line x1="360" y1="694" x2="360" y2="810"/><line x1="450" y1="694" x2="450" y2="810"/><line x1="540" y1="694" x2="540" y2="810"/>
          <line x1="630" y1="694" x2="630" y2="810"/><line x1="720" y1="694" x2="720" y2="810"/><line x1="810" y1="694" x2="810" y2="810"/>
          <line x1="900" y1="694" x2="900" y2="810"/><line x1="990" y1="694" x2="990" y2="810"/><line x1="1080" y1="694" x2="1080" y2="810"/>
          <line x1="1170" y1="694" x2="1170" y2="810"/><line x1="1260" y1="694" x2="1260" y2="810"/><line x1="1350" y1="694" x2="1350" y2="810"/>
        </g>
        <!-- Hardwood Floor & Baseboard -->
        <rect y="802" width="1440" height="14" fill="#784b20"/>
        <rect y="816" width="1440" height="84" fill="url(#ga-cls-woodfloor)"/>
        <g stroke="#693f18" stroke-width="2" opacity="0.4">
          <line x1="0" y1="842" x2="1440" y2="842"/>
          <line x1="0" y1="870" x2="1440" y2="870"/>
          <line x1="220" y1="816" x2="160" y2="900"/><line x1="520" y1="816" x2="480" y2="900"/>
          <line x1="860" y1="816" x2="880" y2="900"/><line x1="1180" y1="816" x2="1240" y2="900"/>
        </g>
        <!-- Top-Left Festive Classroom Bunting with Poké-crests -->
        <path d="M-10 24 Q210 112 460 -8" fill="none" stroke="#6e4f32" stroke-width="3.5"/>
        <g>
          <polygon points="22,36 60,108 98,54" fill="#e05a47" stroke="#9e3526" stroke-width="2"/>
          <circle cx="60" cy="68" r="7" fill="#fff" opacity="0.85"/>
          <polygon points="114,56 150,124 186,62" fill="#f5b841" stroke="#b87d14" stroke-width="2"/>
          <circle cx="150" cy="80" r="7" fill="#fff" opacity="0.85"/>
          <polygon points="204,64 238,122 272,58" fill="#4ea885" stroke="#2d6e54" stroke-width="2"/>
          <circle cx="238" cy="82" r="7" fill="#fff" opacity="0.85"/>
          <polygon points="290,54 322,106 352,36" fill="#5b8def" stroke="#2c57b5" stroke-width="2"/>
          <polygon points="368,30 398,76 426,10" fill="#ec4899" stroke="#9d174d" stroke-width="2"/>
        </g>
        <!-- Left Wall: Framed Poké-Region World Map -->
        <g transform="translate(26, 175)">
          <rect x="6" y="8" width="224" height="162" rx="10" fill="#000000" opacity="0.16"/>
          <rect width="224" height="162" rx="10" fill="#f8eed9" stroke="#9c6b3b" stroke-width="8"/>
          <rect x="6" y="6" width="212" height="150" rx="6" fill="#d8f0f8" stroke="#c89e6c" stroke-width="2"/>
          <!-- Map Continents -->
          <path d="M22 36 Q56 18 86 44 Q98 78 66 96 Q32 88 22 36 Z" fill="#7bc47f" stroke="#4d9452" stroke-width="2"/>
          <path d="M114 28 Q166 16 196 48 Q204 94 166 124 Q126 112 114 28 Z" fill="#68b88e" stroke="#3e8a63" stroke-width="2"/>
          <path d="M56 112 Q88 104 106 128 Q84 146 52 136 Z" fill="#eab308" opacity="0.75"/>
          <!-- Dotted Trainer Route & Red Poké-Pins -->
          <path d="M56 58 Q96 42 152 68 Q162 96 82 124" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="5 4"/>
          <circle cx="56" cy="58" r="5.5" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
          <circle cx="152" cy="68" r="5.5" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
          <circle cx="82" cy="124" r="5.5" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
          <!-- Compass Rose -->
          <circle cx="34" cy="130" r="13" fill="#fffbeb" stroke="#9c6b3b" stroke-width="1.8"/>
          <polygon points="34,119 37,130 34,141 31,130" fill="#ef4444"/>
          <polygon points="23,130 34,127 45,130 34,133" fill="#9c6b3b"/>
        </g>
        <!-- Left Foreground: Classroom Bookcase, Trophy & Potted Plant -->
        <g transform="translate(24, 535)">
          <!-- Oak Bookcase -->
          <rect x="0" y="75" width="185" height="220" rx="6" fill="#9c6634" stroke="#633d1a" stroke-width="4"/>
          <rect x="12" y="88" width="161" height="84" fill="#6b421d"/>
          <rect x="12" y="184" width="161" height="96" fill="#6b421d"/>
          <!-- Books on Top Shelf -->
          <rect x="20" y="104" width="18" height="68" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
          <rect x="40" y="110" width="22" height="62" rx="2" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.5"/>
          <rect x="64" y="98" width="18" height="74" rx="2" fill="#eab308" stroke="#713f12" stroke-width="1.5"/>
          <rect x="92" y="106" width="20" height="66" rx="2" fill="#10b981" transform="rotate(12 92 172)" stroke="#064e3b" stroke-width="1.5"/>
          <!-- Poké-Trophy on Bookcase -->
          <ellipse cx="48" cy="72" rx="20" ry="5" fill="#451a03"/>
          <rect x="40" y="58" width="16" height="14" fill="#f59e0b"/>
          <path d="M26 24 H70 L62 58 H34 Z" fill="#facc15" stroke="#b45309" stroke-width="2.5"/>
          <circle cx="48" cy="40" r="8" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
          <circle cx="48" cy="40" r="3" fill="#ffffff"/>
          <!-- Lush Potted Sprout -->
          <g transform="translate(115, 0)">
            <polygon points="10,42 58,42 50,76 18,76" fill="#c2593f" stroke="#7c2d12" stroke-width="2.5"/>
            <rect x="6" y="34" width="56" height="10" rx="3" fill="#d96b4f" stroke="#7c2d12" stroke-width="2.5"/>
            <path d="M34 34 Q10 10 4 -12 Q28 -10 34 34 Z" fill="#22c55e" stroke="#14532d" stroke-width="2.2"/>
            <path d="M34 34 Q58 8 68 -14 Q42 -12 34 34 Z" fill="#16a34a" stroke="#14532d" stroke-width="2.2"/>
            <path d="M34 34 Q34 -4 34 -28 Q48 -6 34 34 Z" fill="#4ade80" stroke="#14532d" stroke-width="2.2"/>
          </g>
        </g>
        <!-- Top-Right Hanging Solar & Cosmic Mobile -->
        <g>
          <line x1="1035" y1="0" x2="1035" y2="112" stroke="#6e4f32" stroke-width="2.2"/>
          <circle cx="1035" cy="112" r="16" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5"/>
          <path d="M1025 108 Q1035 100 1044 112 Q1036 122 1025 108 Z" fill="#4ade80"/>
          <line x1="1125" y1="0" x2="1125" y2="165" stroke="#6e4f32" stroke-width="2.5"/>
          <!-- Glowing Solrock-style Sun -->
          <g transform="translate(1125, 165)">
            <circle r="40" fill="#fde047" opacity="0.28"/>
            <polygon points="0,-42 8,-26 -8,-26" fill="#f59e0b"/><polygon points="0,42 8,26 -8,26" fill="#f59e0b"/>
            <polygon points="-42,0 -26,8 -26,-8" fill="#f59e0b"/><polygon points="42,0 26,8 26,-8" fill="#f59e0b"/>
            <polygon points="-30,-30 -14,-22 -22,-14" fill="#f59e0b"/><polygon points="30,-30 14,-22 22,-14" fill="#f59e0b"/>
            <polygon points="-30,30 -14,22 -22,14" fill="#f59e0b"/><polygon points="30,30 14,22 22,14" fill="#f59e0b"/>
            <circle r="28" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
            <circle cx="-8" cy="-8" r="10" fill="#fef08a" opacity="0.65"/>
          </g>
          <line x1="1225" y1="0" x2="1225" y2="96" stroke="#6e4f32" stroke-width="2.2"/>
          <g transform="translate(1225, 96)">
            <ellipse rx="32" ry="9" fill="none" stroke="#eab308" stroke-width="5" transform="rotate(-18)"/>
            <circle r="16" fill="#a855f7" stroke="#581c87" stroke-width="2.5"/>
          </g>
          <line x1="1315" y1="0" x2="1315" y2="142" stroke="#6e4f32" stroke-width="2.2"/>
          <polygon points="1315,124 1320,136 1333,136 1323,144 1327,156 1315,148 1303,156 1307,144 1297,136 1310,136" fill="#facc15" stroke="#b45309" stroke-width="2"/>
        </g>
        <!-- Right Wall: Detailed Cork Bulletin Board with Pinned Poké-Notes -->
        <g transform="translate(1176, 185)">
          <rect x="8" y="10" width="234" height="238" rx="10" fill="#000000" opacity="0.18"/>
          <rect width="234" height="238" rx="10" fill="#c79055" stroke="#8a5624" stroke-width="9"/>
          <rect x="8" y="8" width="218" height="222" rx="5" fill="none" stroke="#e4b680" stroke-width="2"/>
          <!-- Note 1: Pink Polaroid -->
          <g transform="translate(22, 22) rotate(-5)">
            <rect width="78" height="84" rx="4" fill="#fbcfe8" stroke="#be185d" stroke-width="1.8"/>
            <rect x="8" y="10" width="62" height="48" rx="2" fill="#ffffff"/>
            <circle cx="39" cy="34" r="14" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
            <path d="M25 34 A14 14 0 0 0 53 34 Z" fill="#ffffff"/>
            <circle cx="39" cy="34" r="4" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
            <circle cx="39" cy="5" r="4.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
          </g>
          <!-- Note 2: Yellow Pikachu Memo -->
          <g transform="translate(124, 24) rotate(4)">
            <rect width="84" height="82" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8"/>
            <line x1="12" y1="26" x2="72" y2="26" stroke="#a16207" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="12" y1="40" x2="64" y2="40" stroke="#a16207" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="12" y1="54" x2="52" y2="54" stroke="#a16207" stroke-width="2.5" stroke-linecap="round"/>
            <text x="64" y="68" font-family="Outfit,sans-serif" font-weight="900" font-size="16" fill="#ca8a04">★A+</text>
            <circle cx="42" cy="6" r="4.5" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.5"/>
          </g>
          <!-- Note 3: Blue Study Schedule -->
          <g transform="translate(28, 124) rotate(3)">
            <rect width="86" height="82" rx="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.8"/>
            <rect x="12" y="16" width="62" height="12" rx="2" fill="#0284c7" opacity="0.35"/>
            <rect x="12" y="34" width="46" height="8" rx="2" fill="#0284c7" opacity="0.25"/>
            <rect x="12" y="48" width="54" height="8" rx="2" fill="#0284c7" opacity="0.25"/>
            <circle cx="43" cy="6" r="4.5" fill="#22c55e" stroke="#14532d" stroke-width="1.5"/>
          </g>
          <!-- Note 4: Violet Badge Card -->
          <g transform="translate(130, 122) rotate(-4)">
            <rect width="78" height="84" rx="4" fill="#e9d5ff" stroke="#7e22ce" stroke-width="1.8"/>
            <polygon points="39,20 45,34 60,36 49,46 52,61 39,53 26,61 29,46 18,36 33,34" fill="#facc15" stroke="#b45309" stroke-width="1.8"/>
            <circle cx="39" cy="6" r="4.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
          </g>
        </g>
        <!-- Right Foreground: Teacher's Desk with Globe, Books, Poké-Apple & Pencil Cup -->
        <g transform="translate(1070, 480)">
          <!-- 3D Earth Globe on Brass Stand -->
          <g transform="translate(65, 0)">
            <circle cx="52" cy="62" r="46" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
            <path d="M22 42 Q52 24 76 48 Q64 84 30 74 Z" fill="#4ade80"/>
            <path d="M58 72 Q82 68 90 88 Q70 102 54 90 Z" fill="#22c55e"/>
            <path d="M16 102 A56 56 0 0 0 88 22" fill="none" stroke="#b45309" stroke-width="7" stroke-linecap="round"/>
            <rect x="46" y="112" width="12" height="18" fill="#b45309"/>
            <rect x="26" y="126" width="52" height="10" rx="5" fill="#92400e" stroke="#451a03" stroke-width="2"/>
          </g>
          <!-- Stacked Hardcover Books & Shiny Red Poké-Apple -->
          <g transform="translate(185, 78)">
            <rect x="0" y="42" width="110" height="18" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="2.5"/>
            <rect x="6" y="46" width="96" height="10" rx="2" fill="#fef3c7"/>
            <rect x="8" y="24" width="96" height="18" rx="4" fill="#16a34a" stroke="#14532d" stroke-width="2.5"/>
            <rect x="14" y="28" width="84" height="10" rx="2" fill="#fffbeb"/>
            <!-- Apple -->
            <circle cx="56" cy="8" r="16" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.5"/>
            <circle cx="50" cy="3" r="5" fill="#fca5a5" opacity="0.65"/>
            <path d="M56 -8 Q66 -18 74 -10 Q64 -2 56 -8 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.8"/>
          </g>
          <!-- Pencil & Ruler Cup -->
          <g transform="translate(312, 62)">
            <rect x="6" y="10" width="8" height="44" rx="2" fill="#facc15" stroke="#713f12" stroke-width="1.8" transform="rotate(-10 10 32)"/>
            <rect x="18" y="4" width="10" height="50" rx="2" fill="#f97316" stroke="#7c2d12" stroke-width="1.8"/>
            <rect x="30" y="12" width="8" height="42" rx="2" fill="#ec4899" stroke="#831843" stroke-width="1.8" transform="rotate(12 34 32)"/>
            <rect x="0" y="34" width="44" height="42" rx="6" fill="#38bdf8" stroke="#075985" stroke-width="2.5"/>
          </g>
          <!-- Teacher Oak Desk Body -->
          <rect x="0" y="136" width="380" height="18" rx="6" fill="#9c6634" stroke="#5c3614" stroke-width="3"/>
          <rect x="14" y="154" width="356" height="270" fill="#d6cab8" stroke="#8c7f6e" stroke-width="3"/>
          <rect x="34" y="174" width="140" height="54" rx="4" fill="#c4b5a0" stroke="#8c7f6e" stroke-width="2.5"/>
          <circle cx="104" cy="201" r="6" fill="#92400e"/>
          <rect x="34" y="242" width="140" height="68" rx="4" fill="#c4b5a0" stroke="#8c7f6e" stroke-width="2.5"/>
          <circle cx="104" cy="276" r="6" fill="#92400e"/>
        </g>
      </svg>`
    },
    {
      id: 'jungle',
      name: 'Jungle',
      subtitle: 'Rainforest canopy & hidden trails',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-jgl-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#123d2b"/><stop offset="1" stop-color="#071d18"/></linearGradient>
          <linearGradient id="th-jgl-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bf8b49"/><stop offset="1" stop-color="#74451e"/></linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-jgl-bg)"/>
        <circle cx="61" cy="23" r="31" fill="#f5d66e" opacity=".13"/>
        <path d="M0 0Q23 2 41 25L26 31Q13 21 0 22ZM120 0Q97 2 79 25L94 31Q107 21 120 22Z" fill="#2e7a4d"/>
        <path d="M0 0Q31 10 38 43M120 0Q89 10 82 43" fill="none" stroke="#78b65b" stroke-width="2"/>
        <path d="M0 82Q17 53 38 56L23 82ZM120 82Q103 53 82 56L97 82Z" fill="#247349"/>
        <path d="M18 13q11 2 14 13q-11 1-14-13M102 13q-11 2-14 13q11 1 14-13" fill="#52a45d"/>
        <rect x="19" y="30" width="82" height="39" rx="9" fill="url(#th-jgl-wood)" stroke="#3a2819" stroke-width="2"/>
        <rect x="23" y="34" width="74" height="30" rx="6" fill="#173b2a" stroke="#e0bd70" stroke-width="1.5"/>
        <path d="M28 58Q60 51 92 58" fill="none" stroke="#8e6531" stroke-width="2"/>
        <text x="60" y="51" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="14" letter-spacing="1" fill="#fff4cd">JUNGLE</text>
        <circle cx="15" cy="47" r="2" fill="#ffe58a"/><circle cx="15" cy="47" r="5" fill="#ffe58a" opacity=".2"/>
        <circle cx="105" cy="24" r="2" fill="#c8f17b"/><circle cx="105" cy="24" r="5" fill="#c8f17b" opacity=".2"/>
        <path d="M9 74q12-13 20 0M91 74q8-13 20 0" fill="none" stroke="#45a565" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cb-jgl-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#957045"/><stop offset=".5" stop-color="#65492e"/><stop offset="1" stop-color="#3d3023"/></linearGradient>
          <linearGradient id="cb-jgl-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bfdf7d"/><stop offset=".55" stop-color="#4b9e58"/><stop offset="1" stop-color="#1d6348"/></linearGradient>
          <linearGradient id="cb-jgl-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0a8"/><stop offset=".52" stop-color="#d7b54d"/><stop offset="1" stop-color="#926127"/></linearGradient>
          <radialGradient id="cb-jgl-light"><stop stop-color="#9bd978" stop-opacity=".36"/><stop offset="1" stop-color="#12372b" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="200" height="280" rx="22" fill="url(#ga-def-cb-jgl-gold)"/>
        <rect x="7" y="7" width="186" height="266" rx="18" fill="url(#ga-def-cb-jgl-wood)" stroke="#30271c" stroke-width="3"/>
        <path d="M18 20H182M18 260H182" stroke="#f2d479" stroke-width="2" opacity=".6"/>
        <path d="M31 16v248M169 16v248" stroke="#30271c" stroke-width="2" opacity=".55"/>
        <rect x="16" y="20" width="168" height="240" rx="14" fill="#12382d" stroke="#bc9851" stroke-width="2"/>
        <rect x="20" y="24" width="160" height="232" rx="12" fill="url(#ga-def-cb-jgl-light)"/>
        <path d="M20 24Q67 34 82 78Q48 74 20 54ZM180 24Q133 34 118 78Q152 74 180 54Z" fill="url(#ga-def-cb-jgl-leaf)" stroke="#103d2d" stroke-width="2"/>
        <path d="M20 256Q56 220 83 209Q72 241 43 260ZM180 256Q144 220 117 209Q128 241 157 260Z" fill="#368450" stroke="#103d2d" stroke-width="2"/>
        <path d="M27 40Q45 62 70 72M173 40Q155 62 130 72M33 245Q56 225 74 217M167 245Q144 225 126 217" fill="none" stroke="#c7e887" stroke-width="2" opacity=".75"/>
        <path d="M36 85Q100 67 164 85V184Q100 204 36 184Z" fill="#174331" stroke="#987846" stroke-width="3"/>
        <circle cx="100" cy="132" r="56" fill="none" stroke="#e4c75f" stroke-width="3" stroke-dasharray="3 8"/>
        <circle cx="100" cy="132" r="44" fill="#f7f2dd" stroke="#17352b" stroke-width="5"/>
        <path d="M56 132A44 44 0 0 1 144 132Z" fill="#57994c"/>
        <path d="M57 132H143" stroke="#17352b" stroke-width="10"/>
        <circle cx="100" cy="132" r="13" fill="url(#ga-def-cb-jgl-gold)" stroke="#17352b" stroke-width="4"/>
        <circle cx="100" cy="132" r="5" fill="#f5f5d6"/>
        <rect x="45" y="214" width="110" height="31" rx="9" fill="url(#ga-def-cb-jgl-gold)" stroke="#382b1d" stroke-width="3"/>
        <text x="100" y="234" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="12" letter-spacing="1.7" fill="#284331">WILD TRAIL</text>
        <path d="M100 15Q85 29 100 43Q115 29 100 15ZM100 237Q86 249 100 263Q114 249 100 237Z" fill="#65a85c"/>
        <circle cx="28" cy="78" r="3" fill="#f3dc84"/><circle cx="172" cy="78" r="3" fill="#f3dc84"/>
        <circle cx="28" cy="196" r="3" fill="#f3dc84"/><circle cx="172" cy="196" r="3" fill="#f3dc84"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-jgl-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#071a12"/>
            <stop offset="52%" stop-color="#113322"/>
            <stop offset="100%" stop-color="#091f14"/>
          </linearGradient>
          <radialGradient id="ga-jgl-sun" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stop-color="#fde047" stop-opacity="0.34"/>
            <stop offset="50%" stop-color="#34d399" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#071a12" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-jgl-bg)"/>
        <rect width="1440" height="900" fill="url(#ga-jgl-sun)"/>
        <!-- Volumetric Golden Jungle Sunbeams -->
        <polygon points="280,0 480,0 760,900 420,900" fill="#fef08a" opacity="0.06"/>
        <polygon points="680,0 900,0 1180,900 840,900" fill="#fef08a" opacity="0.05"/>
        <!-- Hanging Vines with Glowing Berries -->
        <path d="M185 0 Q150 150 195 290 Q225 380 180 480" fill="none" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
        <circle cx="195" cy="290" r="10" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5"/>
        <circle cx="180" cy="480" r="11" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>
        <path d="M1255 0 Q1290 160 1245 300 Q1215 390 1260 490" fill="none" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
        <circle cx="1245" cy="300" r="10" fill="#fb7185" stroke="#be123c" stroke-width="2.5"/>
        <circle cx="1260" cy="490" r="11" fill="#38bdf8" stroke="#0369a1" stroke-width="2.5"/>
        <!-- Layered Tropical Canopy Fronds (Top, Left, Right, Bottom) -->
        <path d="M0 0 Q220 20 330 175 Q160 200 0 120 Z" fill="#14532d" stroke="#052e16" stroke-width="3"/>
        <path d="M0 85 Q190 135 250 300 Q110 290 0 215 Z" fill="#166534" stroke="#052e16" stroke-width="2.5"/>
        <path d="M1440 0 Q1220 20 1110 175 Q1280 200 1440 120 Z" fill="#14532d" stroke="#052e16" stroke-width="3"/>
        <path d="M1440 85 Q1250 135 1190 300 Q1330 290 1440 215 Z" fill="#166534" stroke="#052e16" stroke-width="2.5"/>
        <!-- Foreground Jungle Ferns & Glowing Fireflies -->
        <path d="M0 900 Q90 680 280 650 Q210 790 130 900 Z" fill="#15803d" stroke="#052e16" stroke-width="3"/>
        <path d="M0 900 Q180 740 370 760 Q280 860 200 900 Z" fill="#22c55e" stroke="#052e16" stroke-width="2.5"/>
        <path d="M1440 900 Q1350 680 1160 650 Q1230 790 1310 900 Z" fill="#15803d" stroke="#052e16" stroke-width="3"/>
        <path d="M1440 900 Q1260 740 1070 760 Q1160 860 1240 900 Z" fill="#22c55e" stroke="#052e16" stroke-width="2.5"/>
        <g fill="#fde047">
          <circle cx="245" cy="440" r="5" opacity="0.9"/><circle cx="245" cy="440" r="14" opacity="0.22"/>
          <circle cx="155" cy="590" r="4" opacity="0.8"/><circle cx="155" cy="590" r="11" opacity="0.2"/>
          <circle cx="1205" cy="460" r="5" opacity="0.9"/><circle cx="1205" cy="460" r="14" opacity="0.22"/>
          <circle cx="1285" cy="610" r="4.5" opacity="0.8"/><circle cx="1285" cy="610" r="12" opacity="0.2"/>
        </g>
      </svg>`
    },
    {
      id: 'toybox',
      name: 'Toybox',
      subtitle: 'Colorful playroom & power-up blocks',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-toy-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8275f7"/><stop offset="1" stop-color="#4438a5"/></linearGradient>
          <linearGradient id="th-toy-panel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffde9"/><stop offset="1" stop-color="#dbeaff"/></linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-toy-bg)"/>
        <circle cx="97" cy="17" r="20" fill="#ffe66f" opacity=".9"/>
        <path d="M0 58Q27 49 54 58T120 56V82H0Z" fill="#27215e"/>
        <path d="M0 68H120" stroke="#f58ac1" stroke-width="2"/>
        <g transform="translate(12 19)">
          <rect x="2" y="3" width="26" height="38" rx="6" fill="#ef5a78" stroke="#44236e" stroke-width="2"/>
          <rect x="7" y="8" width="16" height="27" rx="4" fill="#ff9a9d"/>
          <circle cx="15" cy="21" r="5" fill="#fff2be" stroke="#44236e" stroke-width="1.5"/>
        </g>
        <g transform="translate(39 23)">
          <rect x="0" y="0" width="24" height="24" rx="5" fill="#42d7cf" stroke="#27215e" stroke-width="2"/>
          <rect x="3" y="3" width="18" height="5" rx="2.5" fill="#b6fff0"/>
          <text x="12" y="19" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#173a61">A</text>
        </g>
        <g transform="translate(68 23)">
          <rect x="0" y="0" width="24" height="24" rx="5" fill="#ffd34e" stroke="#27215e" stroke-width="2"/>
          <rect x="3" y="3" width="18" height="5" rx="2.5" fill="#fff2a6"/>
          <text x="12" y="19" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#362869">B</text>
        </g>
        <path d="M101 34l2.7 5.3 5.8.8-4.2 4.1 1 5.8-5.3-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z" fill="#ffe66f" stroke="#3e347d" stroke-width="1.5"/>
        <rect x="25" y="54" width="70" height="10" rx="5" fill="url(#th-toy-panel)" stroke="#25205a" stroke-width="2"/>
        <circle cx="35" cy="59" r="2" fill="#43b9ed"/><circle cx="85" cy="59" r="2" fill="#f26c91"/>
        <path d="M10 12l3 3 3-3M108 58l2 2 2-2" fill="none" stroke="#fff1a5" stroke-width="2"/>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cb-toy-frame" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#43d7d0"/><stop offset=".48" stop-color="#9182ff"/><stop offset="1" stop-color="#fa83ab"/></linearGradient>
          <linearGradient id="cb-toy-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4a3b9a"/><stop offset="1" stop-color="#27215e"/></linearGradient>
          <linearGradient id="cb-toy-ball" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8ffff"/><stop offset=".48" stop-color="#81e8e8"/><stop offset=".5" stop-color="#f8ffff"/><stop offset="1" stop-color="#bcd2ef"/></linearGradient>
        </defs>
        <rect width="200" height="280" rx="24" fill="url(#ga-def-cb-toy-frame)"/>
        <rect x="8" y="8" width="184" height="264" rx="20" fill="url(#ga-def-cb-toy-bg)" stroke="#25205a" stroke-width="3"/>
        <rect x="17" y="18" width="166" height="244" rx="16" fill="none" stroke="#c1f8ef" stroke-width="2" opacity=".78"/>
        <path d="M18 57H182M18 221H182" stroke="#1f194f" stroke-width="2" opacity=".8"/>
        <g opacity=".95">
          <circle cx="34" cy="43" r="5" fill="#ffe66f"/><circle cx="166" cy="42" r="5" fill="#f78bad"/>
          <rect x="151" y="61" width="12" height="12" rx="3" fill="#42d7cf" transform="rotate(18 157 67)"/>
          <path d="M35 222l4 8 9 1-6.5 6 1.5 9-8-4.5-8 4.5 1.5-9-6.5-6 9-1Z" fill="#ffe66f"/>
        </g>
        <g transform="translate(24 88)">
          <rect x="0" y="0" width="30" height="30" rx="7" fill="#f46b8c" stroke="#231d58" stroke-width="3"/>
          <rect x="5" y="5" width="20" height="6" rx="3" fill="#ffd4df"/>
          <circle cx="15" cy="20" r="4" fill="#fff3bd"/>
        </g>
        <g transform="translate(146 89)">
          <rect x="0" y="0" width="30" height="30" rx="7" fill="#ffd34e" stroke="#231d58" stroke-width="3"/>
          <rect x="5" y="5" width="20" height="6" rx="3" fill="#fff2a5"/>
          <path d="M15 15l2.1 4.2 4.6.7-3.3 3.2.8 4.6-4.2-2.2-4.1 2.2.8-4.6-3.4-3.2 4.7-.7Z" fill="#594da0"/>
        </g>
        <circle cx="100" cy="143" r="61" fill="none" stroke="#56e5df" stroke-width="4" stroke-dasharray="8 7"/>
        <circle cx="100" cy="143" r="50" fill="none" stroke="#ffc94f" stroke-width="2.5" opacity=".9"/>
        <circle cx="100" cy="143" r="41" fill="url(#ga-def-cb-toy-ball)" stroke="#211b55" stroke-width="5"/>
        <path d="M59 143A41 41 0 0 1 141 143Z" fill="#fa698c"/>
        <path d="M60 143H140" stroke="#211b55" stroke-width="9"/>
        <circle cx="100" cy="143" r="13" fill="#ffe66f" stroke="#211b55" stroke-width="4"/>
        <circle cx="100" cy="143" r="5" fill="#f9ffff"/>
        <ellipse cx="84" cy="116" rx="13" ry="6" transform="rotate(-28 84 116)" fill="#fff" opacity=".75"/>
        <rect x="34" y="230" width="132" height="25" rx="12" fill="url(#ga-def-cb-toy-frame)" stroke="#211b55" stroke-width="3"/>
        <text x="100" y="247" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="12" letter-spacing="1.5" fill="#211b55">PLAY AGAIN!</text>
        <circle cx="29" cy="72" r="2" fill="#fff"/><circle cx="171" cy="72" r="2" fill="#fff"/>
        <circle cx="28" cy="203" r="2" fill="#fff"/><circle cx="172" cy="203" r="2" fill="#fff"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-toy-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34277f"/>
            <stop offset="60%" stop-color="#5543aa"/>
            <stop offset="100%" stop-color="#211a55"/>
          </linearGradient>
          <radialGradient id="ga-toy-glow" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.34"/>
            <stop offset="60%" stop-color="#ec4899" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#34277f" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-toy-bg)"/>
        <rect width="1440" height="900" fill="url(#ga-toy-glow)"/>
        <!-- Playroom confetti glints along the safe outer edges -->
        <g opacity=".9">
          <path d="M310 92l5 10 11 1-8 7 2 11-10-5-9 5 2-11-8-7 11-1Z" fill="#ffe66f"/>
          <path d="M1110 114l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" fill="#f78bad"/>
          <rect x="420" y="72" width="13" height="13" rx="3" fill="#4de0d5" transform="rotate(18 426 78)"/>
          <rect x="1013" y="82" width="12" height="12" rx="3" fill="#ffd34e" transform="rotate(-16 1019 88)"/>
          <circle cx="520" cy="128" r="4" fill="#fff1a5"/><circle cx="920" cy="105" r="4" fill="#c7f6ff"/>
          <circle cx="1170" cy="260" r="5" fill="#fa83ab"/><circle cx="260" cy="250" r="5" fill="#43d7d0"/>
        </g>
        <!-- Perspective Neon Arcade Grid Floor -->
        <rect y="740" width="1440" height="160" fill="#141036"/>
        <line x1="0" y1="740" x2="1440" y2="740" stroke="#f472b6" stroke-width="3" opacity="0.8"/>
        <g stroke="#6366f1" stroke-width="1.8" opacity="0.4">
          <line x1="0" y1="772" x2="1440" y2="772"/>
          <line x1="0" y1="812" x2="1440" y2="812"/>
          <line x1="0" y1="858" x2="1440" y2="858"/>
          <line x1="720" y1="740" x2="720" y2="900"/>
          <line x1="560" y1="740" x2="360" y2="900"/><line x1="400" y1="740" x2="40" y2="900"/>
          <line x1="880" y1="740" x2="1080" y2="900"/><line x1="1040" y1="740" x2="1400" y2="900"/>
        </g>
        <!-- Left Side: 3D Gachapon Capsule Machine & Isometric Toy Blocks -->
        <g transform="translate(42, 420)">
          <rect x="20" y="160" width="130" height="150" rx="14" fill="#f43f5e" stroke="#881337" stroke-width="4"/>
          <rect x="44" y="230" width="82" height="54" rx="10" fill="#1e1b4b" stroke="#fda4af" stroke-width="2.5"/>
          <circle cx="85" cy="195" r="20" fill="#facc15" stroke="#713f12" stroke-width="3"/>
          <rect x="73" y="190" width="24" height="10" rx="4" fill="#ffffff"/>
          <circle cx="85" cy="95" r="74" fill="#e0f2fe" fill-opacity="0.22" stroke="#38bdf8" stroke-width="5"/>
          <circle cx="60" cy="118" r="18" fill="#fb7185" stroke="#1e1b4b" stroke-width="2.5"/>
          <circle cx="98" cy="124" r="18" fill="#facc15" stroke="#1e1b4b" stroke-width="2.5"/>
          <circle cx="78" cy="92" r="18" fill="#38bdf8" stroke="#1e1b4b" stroke-width="2.5"/>
          <ellipse cx="85" cy="24" rx="42" ry="12" fill="#f43f5e" stroke="#881337" stroke-width="3"/>
        </g>
        <!-- Floating 3D Shaded Toy Cubes & Stars (Left & Right) -->
        <g transform="translate(88, 130)">
          <polygon points="50,0 100,25 50,50 0,25" fill="#fde047"/>
          <polygon points="0,25 50,50 50,105 0,80" fill="#eab308"/>
          <polygon points="100,25 50,50 50,105 100,80" fill="#ca8a04"/>
        </g>
        <g transform="translate(1250, 140)">
          <polygon points="50,0 100,25 50,50 0,25" fill="#7dd3fc"/>
          <polygon points="0,25 50,50 50,105 0,80" fill="#38bdf8"/>
          <polygon points="100,25 50,50 50,105 100,80" fill="#0284c7"/>
        </g>
        <!-- Right Side: 3D Toy Block Stack & Bouncing Poké-Sphere -->
        <g transform="translate(1220, 520)">
          <rect x="10" y="130" width="92" height="92" rx="18" fill="#818cf8" stroke="#312e81" stroke-width="4"/>
          <text x="56" y="190" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="42" fill="#ffffff">★</text>
          <rect x="108" y="150" width="76" height="72" rx="16" fill="#34d399" stroke="#064e3b" stroke-width="4"/>
          <circle cx="88" cy="76" r="44" fill="#ffffff" stroke="#1e1b4b" stroke-width="4"/>
          <path d="M44 76 A44 44 0 0 1 132 76 Z" fill="#ec4899"/>
          <rect x="44" y="71" width="88" height="10" fill="#1e1b4b"/>
          <circle cx="88" cy="76" r="14" fill="#facc15" stroke="#1e1b4b" stroke-width="4"/>
        </g>
      </svg>`
    },
    {
      id: 'halloween',
      name: 'Halloween',
      subtitle: 'Haunted manor & lanterns',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-hlw-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f0720"/>
            <stop offset="55%" stop-color="#26124c"/>
            <stop offset="100%" stop-color="#4c1d95"/>
          </linearGradient>
          <radialGradient id="th-hlw-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="65%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </radialGradient>
          <linearGradient id="th-hlw-pump" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fdba74"/>
            <stop offset="45%" stop-color="#fb923c"/>
            <stop offset="100%" stop-color="#c2410c"/>
          </linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-hlw-bg)"/>
        <rect x="3" y="3" width="114" height="76" rx="8" fill="none" stroke="#f97316" stroke-width="2.5"/>
        <!-- Harvest Moon & Glow -->
        <circle cx="92" cy="24" r="19" fill="#fbbf24" opacity="0.18"/>
        <circle cx="92" cy="24" r="13" fill="url(#th-hlw-moon)"/>
        <!-- Stars -->
        <g fill="#fef08a">
          <circle cx="18" cy="15" r="1.3"/><circle cx="38" cy="11" r="1"/><circle cx="62" cy="16" r="1.4"/>
        </g>
        <!-- Manor Silhouette & Hills -->
        <polygon points="14,62 14,38 22,26 30,38 30,62" fill="#140826"/>
        <polygon points="26,62 26,32 36,18 46,32 46,62" fill="#190b30"/>
        <rect x="33" y="36" width="6" height="9" rx="3" fill="#fde047"/>
        <path d="M0 62 Q34 54 68 60 Q96 55 120 61 L120 82 L0 82 Z" fill="#16092b"/>
        <!-- Carved Jack-o'-Lantern -->
        <g transform="translate(56 57)">
          <ellipse cx="0" cy="0" rx="16" ry="13" fill="url(#th-hlw-pump)" stroke="#090312" stroke-width="2"/>
          <path d="M-6 -12 C-9 -3 -9 6 -5 12 M6 -12 C9 -3 9 6 5 12" stroke="#9a3412" stroke-width="1.3" fill="none"/>
          <path d="M0 -13 C1 -18 5 -19 8 -17" stroke="#22c55e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <polygon points="-8,-4 -2,-1 -9,1" fill="#fef08a"/>
          <polygon points="8,-4 2,-1 9,1" fill="#fef08a"/>
          <path d="M-8 4 L-4 2 L0 5 L4 2 L8 4 L5 8 L-5 8 Z" fill="#fef08a"/>
        </g>
        <!-- Dusk/Master Poké-Orb Accent -->
        <g transform="translate(94 60)">
          <circle r="9" fill="#f8fafc" stroke="#090312" stroke-width="2"/>
          <path d="M-9 0 A9 9 0 0 1 9 0 Z" fill="#7e22ce"/>
          <circle cx="-4.5" cy="-3.5" r="2" fill="#ec4899"/>
          <circle cx="4.5" cy="-3.5" r="2" fill="#ec4899"/>
          <rect x="-9" y="-1.2" width="18" height="2.4" fill="#090312"/>
          <circle r="2.8" fill="#fde047" stroke="#090312" stroke-width="1.5"/>
        </g>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cb-hlw-border" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fdba74"/>
            <stop offset="50%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#9a3412"/>
          </linearGradient>
          <radialGradient id="cb-hlw-bg" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stop-color="#3b176b"/>
            <stop offset="60%" stop-color="#1e0b3b"/>
            <stop offset="100%" stop-color="#0d041c"/>
          </radialGradient>
          <linearGradient id="cb-hlw-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fdba74"/>
            <stop offset="45%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#c2410c"/>
          </linearGradient>
          <linearGradient id="cb-hlw-bot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#581c87"/>
            <stop offset="100%" stop-color="#2e1065"/>
          </linearGradient>
        </defs>
        <!-- Outer Pumpkin-Gold Bezel -->
        <rect width="200" height="200" rx="24" fill="url(#ga-def-cb-hlw-border)"/>
        <!-- Deep Midnight Velvet Core -->
        <rect x="8" y="8" width="184" height="184" rx="18" fill="url(#ga-def-cb-hlw-bg)" stroke="#090312" stroke-width="3.5"/>
        <!-- Inner Ornate Frame & Corner Gems -->
        <rect x="16" y="16" width="168" height="168" rx="13" fill="none" stroke="#fb923c" stroke-width="1.8" stroke-opacity="0.55"/>
        <circle cx="24" cy="24" r="3.5" fill="#fde047"/>
        <circle cx="176" cy="24" r="3.5" fill="#fde047"/>
        <circle cx="24" cy="176" r="3.5" fill="#fde047"/>
        <circle cx="176" cy="176" r="3.5" fill="#fde047"/>
        <!-- Subtle Concentric Web Filigree -->
        <g stroke="#c4b5fd" stroke-width="1.2" opacity="0.18" fill="none">
          <circle cx="100" cy="102" r="76"/>
          <circle cx="100" cy="102" r="64" stroke-dasharray="6 6"/>
          <line x1="100" y1="18" x2="100" y2="186"/>
          <line x1="18" y1="102" x2="182" y2="102"/>
          <line x1="42" y1="44" x2="158" y2="160"/>
          <line x1="158" y1="44" x2="42" y2="160"/>
        </g>
        <!-- Bat Wing Crest Behind Poké-Lantern -->
        <path d="M100 96 C 72 68, 36 66, 18 82 C 30 92, 34 104, 24 114 C 42 112, 54 120, 50 130 C 68 122, 84 126, 100 116 Z" fill="#090312" stroke="#a855f7" stroke-width="2"/>
        <path d="M100 96 C 128 68, 164 66, 182 82 C 170 92, 166 104, 176 114 C 158 112, 146 120, 150 130 C 132 122, 116 126, 100 116 Z" fill="#090312" stroke="#a855f7" stroke-width="2"/>
        <!-- Ambient Aura -->
        <circle cx="100" cy="104" r="56" fill="#f97316" opacity="0.22"/>
        <!-- Emerald Vine Stem -->
        <path d="M98 52 C 99 36, 112 31, 121 37" fill="none" stroke="#090312" stroke-width="9" stroke-linecap="round"/>
        <path d="M98 52 C 99 36, 112 31, 121 37" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/>
        <!-- Center Jack-o'-Lantern Poké-Ball -->
        <circle cx="100" cy="104" r="48" fill="url(#ga-def-cb-hlw-bot)" stroke="#090312" stroke-width="5"/>
        <path d="M52 104 A48 48 0 0 1 148 104 Z" fill="url(#ga-def-cb-hlw-top)" stroke="#090312" stroke-width="5"/>
        <!-- Pumpkin Rib Grooves on Top Half -->
        <path d="M74 60 C 66 76, 66 92, 68 104" fill="none" stroke="#9a3412" stroke-width="2.5" opacity="0.65"/>
        <path d="M126 60 C 134 76, 134 92, 132 104" fill="none" stroke="#9a3412" stroke-width="2.5" opacity="0.65"/>
        <!-- Glowing Jack-o'-Lantern Eyes on Top Half -->
        <polygon points="73,88 87,76 90,91" fill="#090312"/>
        <polygon points="75,87 86,78 88,90" fill="#fef08a"/>
        <polygon points="127,88 113,76 110,91" fill="#090312"/>
        <polygon points="125,87 114,78 112,90" fill="#fef08a"/>
        <!-- Glowing Carved Grin on Bottom Half -->
        <path d="M72 120 L84 114 L92 122 L100 114 L108 122 L116 114 L128 120 L120 134 L108 128 L100 135 L92 128 L80 134 Z" fill="#fef08a" stroke="#090312" stroke-width="2"/>
        <!-- Equator Seam & Glowing Core Button -->
        <path d="M52 104 H148" stroke="#090312" stroke-width="7"/>
        <circle cx="100" cy="104" r="15" fill="#1e0b3b" stroke="#090312" stroke-width="4.5"/>
        <circle cx="100" cy="104" r="8" fill="#fde047"/>
        <circle cx="97" cy="101" r="3" fill="#ffffff"/>
        <!-- Gloss Highlight -->
        <ellipse cx="78" cy="70" rx="11" ry="5" transform="rotate(-28 78 70)" fill="#ffffff" opacity="0.38"/>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <!-- Velvety Midnight Indigo-Violet Sky -->
          <linearGradient id="bg-hlw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b0418"/>
            <stop offset="38%" stop-color="#190b33"/>
            <stop offset="72%" stop-color="#2e1559"/>
            <stop offset="100%" stop-color="#461d7c"/>
          </linearGradient>
          <!-- Luminous Harvest Moon -->
          <radialGradient id="bg-hlw-moon" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stop-color="#fffef5"/>
            <stop offset="55%" stop-color="#fef08a"/>
            <stop offset="85%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </radialGradient>
          <radialGradient id="bg-hlw-moonglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.32"/>
            <stop offset="50%" stop-color="#f97316" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#190b33" stop-opacity="0"/>
          </radialGradient>
          <!-- Mist & Courtyard Gradients -->
          <linearGradient id="bg-hlw-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0"/>
            <stop offset="50%" stop-color="#c084fc" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#3b0764" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="bg-hlw-pump" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stop-color="#fdba74"/>
            <stop offset="45%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#9a3412"/>
          </linearGradient>
          <radialGradient id="bg-hlw-lantern-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.65"/>
            <stop offset="55%" stop-color="#f97316" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
          </radialGradient>
          <!-- Reusable Crisp Bat Silhouette -->
          <g id="bg-hlw-bat">
            <path d="M0 -4 C -6 -12 -16 -14 -26 -9 C -19 -3 -18 2 -24 7 C -15 5 -9 8 -6 14 L 0 9 L 6 14 C 9 8 15 5 24 7 C 18 2 19 -3 26 -9 C 16 -14 6 -12 0 -4 Z"/>
            <polygon points="-4,-4 -6,-11 -1,-6"/>
            <polygon points="4,-4 6,-11 1,-6"/>
          </g>
          <!-- Reusable Carved Jack-o'-Lantern -->
          <g id="bg-hlw-jack">
            <ellipse cx="0" cy="36" rx="54" ry="12" fill="#05020a" opacity="0.55"/>
            <path d="M-2 -34 C 2 -48 12 -52 20 -47" stroke="#15803d" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M-2 -34 C 2 -48 12 -52 20 -47" stroke="#4ade80" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <ellipse cx="0" cy="4" rx="46" ry="36" fill="url(#bg-hlw-pump)" stroke="#090312" stroke-width="4"/>
            <path d="M-24 -26 C -34 -2 -34 24 -22 36" stroke="#7c2d12" stroke-width="2.8" fill="none" opacity="0.6"/>
            <path d="M24 -26 C 34 -2 34 24 22 36" stroke="#7c2d12" stroke-width="2.8" fill="none" opacity="0.6"/>
            <path d="M-9 -31 C -12 -2 -12 24 -7 39" stroke="#7c2d12" stroke-width="2.2" fill="none" opacity="0.45"/>
            <path d="M9 -31 C 12 -2 12 24 7 39" stroke="#7c2d12" stroke-width="2.2" fill="none" opacity="0.45"/>
            <ellipse cx="-16" cy="-10" rx="13" ry="7" fill="#ffffff" opacity="0.22" transform="rotate(-18 -16 -10)"/>
            <!-- Glowing Eyes & Grin -->
            <polygon points="-24,-4 -9,-15 -6,0" fill="#090312"/>
            <polygon points="-22,-5 -10,-13 -8,-1" fill="#fef08a"/>
            <polygon points="24,-4 9,-15 6,0" fill="#090312"/>
            <polygon points="22,-5 10,-13 8,-1" fill="#fef08a"/>
            <polygon points="0,-2 -5,6 5,6" fill="#fef08a" stroke="#090312" stroke-width="1.5"/>
            <path d="M-26 12 L-16 7 L-8 14 L0 7 L8 14 L16 7 L26 12 L19 25 L8 20 L0 26 L-8 20 L-19 25 Z" fill="#090312"/>
            <path d="M-22 13 L-15 9 L-8 15 L0 9 L8 15 L15 9 L22 13 L17 22 L8 18 L0 23 L-8 18 L-17 22 Z" fill="#fde047"/>
          </g>
          <!-- Reusable Hanging Wrought-Iron Lantern -->
          <g id="bg-hlw-lantern">
            <circle cx="0" cy="24" r="46" fill="url(#bg-hlw-lantern-glow)"/>
            <line x1="0" y1="-28" x2="0" y2="0" stroke="#090312" stroke-width="3"/>
            <polygon points="-14,6 14,6 20,14 -20,14" fill="#1e1b4b" stroke="#090312" stroke-width="2.5"/>
            <polygon points="-16,14 16,14 12,40 -12,40" fill="#fef08a" stroke="#090312" stroke-width="3"/>
            <line x1="-6" y1="14" x2="-4" y2="40" stroke="#090312" stroke-width="2"/>
            <line x1="6" y1="14" x2="4" y2="40" stroke="#090312" stroke-width="2"/>
            <polygon points="-14,40 14,40 8,46 -8,46" fill="#1e1b4b" stroke="#090312" stroke-width="2.5"/>
          </g>
        </defs>

        <!-- 1. Sky & Starfield -->
        <rect width="1440" height="900" fill="url(#bg-hlw-sky)"/>
        <g fill="#fef9c3">
          <circle cx="140" cy="88" r="1.8" opacity="0.7"/><circle cx="290" cy="54" r="1.4" opacity="0.5"/>
          <circle cx="460" cy="108" r="2" opacity="0.65"/><circle cx="640" cy="64" r="1.5" opacity="0.45"/>
          <circle cx="820" cy="96" r="1.8" opacity="0.6"/><circle cx="960" cy="52" r="1.4" opacity="0.5"/>
          <circle cx="1310" cy="82" r="2" opacity="0.7"/><circle cx="1380" cy="180" r="1.5" opacity="0.5"/>
          <!-- 4-Point Twinkling Stars -->
          <path d="M370 68 L373 76 L381 79 L373 82 L370 90 L367 82 L359 79 L367 76 Z" opacity="0.75"/>
          <path d="M890 118 L892 124 L898 126 L892 128 L890 134 L888 128 L882 126 L888 124 Z" opacity="0.65"/>
        </g>

        <!-- 2. Giant Harvest Moon (Top Right) -->
        <circle cx="1130" cy="188" r="240" fill="url(#bg-hlw-moonglow)"/>
        <circle cx="1130" cy="188" r="102" fill="url(#bg-hlw-moon)"/>
        <g fill="#d97706" opacity="0.16">
          <circle cx="1095" cy="152" r="16"/><circle cx="1162" cy="204" r="22"/><circle cx="1106" cy="226" r="11"/>
        </g>

        <!-- 3. Distant Haunted Manor & Spires Silhouette -->
        <g fill="#16092c">
          <path d="M0 640 Q 220 575 470 615 Q 740 650 1020 595 Q 1240 560 1440 610 L 1440 900 L 0 900 Z"/>
          <!-- Left Distant Gothic Manor -->
          <g transform="translate(155, 405)">
            <rect x="20" y="95" width="130" height="120"/>
            <polygon points="10,95 85,25 160,95"/>
            <rect x="48" y="35" width="36" height="80"/>
            <polygon points="42,35 66,-18 90,35"/>
            <rect x="115" y="55" width="32" height="75"/>
            <polygon points="110,55 131,12 152,55"/>
            <!-- Glowing Manor Windows -->
            <path d="M58 58 A8 8 0 0 1 74 58 V76 H58 Z" fill="#fde047"/>
            <path d="M125 74 A6 6 0 0 1 137 74 V88 H125 Z" fill="#fb923c"/>
            <rect x="42" y="118" width="16" height="24" rx="2" fill="#fde047" opacity="0.85"/>
            <rect x="74" y="118" width="16" height="24" rx="2" fill="#fde047" opacity="0.85"/>
          </g>
        </g>

        <!-- 4. Atmospheric Lavender Mist Ribbon -->
        <rect x="0" y="540" width="1440" height="160" fill="url(#bg-hlw-mist)"/>

        <!-- 5. Midground Hills & Wrought-Iron Manor Fence -->
        <path d="M0 710 Q 260 660 560 695 Q 880 730 1160 680 Q 1320 655 1440 685 L 1440 900 L 0 900 Z" fill="#120624"/>
        <!-- Left & Right Wrought-Iron Fence Spikes -->
        <g stroke="#090312" stroke-width="4" fill="#1e0d38">
          <rect x="52" y="610" width="18" height="110" rx="2"/>
          <polygon points="48,610 61,590 74,610"/>
          <line x1="70" y1="638" x2="260" y2="652" stroke-width="5"/>
          <line x1="70" y1="686" x2="260" y2="700" stroke-width="5"/>
          <line x1="105" y1="620" x2="105" y2="705"/>
          <line x1="140" y1="623" x2="140" y2="708"/>
          <line x1="175" y1="626" x2="175" y2="710"/>
          <line x1="210" y1="629" x2="210" y2="712"/>
          <rect x="1360" y="600" width="18" height="110" rx="2"/>
          <polygon points="1356,600 1369,580 1382,600"/>
          <line x1="1180" y1="648" x2="1360" y2="630" stroke-width="5"/>
          <line x1="1180" y1="694" x2="1360" y2="678" stroke-width="5"/>
          <line x1="1220" y1="625" x2="1220" y2="705"/>
          <line x1="1265" y1="620" x2="1265" y2="700"/>
          <line x1="1310" y1="615" x2="1310" y2="695"/>
        </g>

        <!-- 6. Framing Twisted Oak Branches & Hanging Iron Lanterns (Left & Right Edges) -->
        <g fill="#070210">
          <!-- Left Ancient Oak Branch -->
          <path d="M-20 180 Q 85 205 185 260 Q 250 295 295 335 L 282 346 Q 225 305 160 278 Q 75 245 -20 235 Z"/>
          <path d="M110 235 Q 145 190 175 165 L 184 174 Q 155 202 128 242 Z"/>
          <!-- Right Ancient Oak Branch -->
          <path d="M1460 220 Q 1345 245 1255 295 Q 1200 325 1165 360 L 1178 370 Q 1225 335 1285 310 Q 1365 280 1460 270 Z"/>
        </g>
        <use href="#bg-hlw-lantern" transform="translate(182, 286) scale(0.95)"/>
        <use href="#bg-hlw-lantern" transform="translate(278, 358) scale(0.76)"/>
        <use href="#bg-hlw-lantern" transform="translate(1258, 322) scale(0.88)"/>

        <!-- 7. Flying Bats Across the Harvest Moon -->
        <g fill="#090312">
          <use href="#bg-hlw-bat" transform="translate(1055, 148) rotate(-14) scale(1.05)"/>
          <use href="#bg-hlw-bat" transform="translate(1185, 122) rotate(12) scale(0.78)"/>
          <use href="#bg-hlw-bat" transform="translate(965, 215) rotate(-8) scale(0.68)"/>
          <use href="#bg-hlw-bat" transform="translate(310, 155) rotate(15) scale(0.82)"/>
          <use href="#bg-hlw-bat" transform="translate(235, 118) rotate(8) scale(0.55)"/>
        </g>

        <!-- 8. Foreground Courtyard & Glowing Jack-o'-Lantern Clusters (Bottom Left & Right) -->
        <path d="M0 785 Q 360 745 720 775 Q 1080 800 1440 760 L 1440 900 L 0 900 Z" fill="#090312"/>
        <!-- Cobblestone Highlights -->
        <g fill="#1e0d38" opacity="0.75">
          <ellipse cx="180" cy="835" rx="38" ry="10"/><ellipse cx="265" cy="852" rx="44" ry="11"/>
          <ellipse cx="1160" cy="842" rx="42" ry="10"/><ellipse cx="1255" cy="825" rx="36" ry="9"/>
        </g>
        <!-- Bottom-Left Pumpkin Cluster -->
        <use href="#bg-hlw-jack" transform="translate(118, 768) rotate(-5) scale(1.08)"/>
        <use href="#bg-hlw-jack" transform="translate(222, 796) rotate(6) scale(0.78)"/>
        <!-- Bottom-Right Pumpkin Cluster -->
        <use href="#bg-hlw-jack" transform="translate(1312, 762) rotate(5) scale(1.12)"/>
        <use href="#bg-hlw-jack" transform="translate(1202, 794) rotate(-6) scale(0.82)"/>
      </svg>`
    },
    {
      id: 'classic',
      name: 'Classic',
      subtitle: 'Default arcade',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="120" height="82" fill="#0b1220"/>
        <g font-family="Outfit,sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">
          <rect x="14" y="8" width="28" height="20" rx="3" fill="#ef4444"/><text x="28" y="22">1</text>
          <rect x="46" y="8" width="28" height="20" rx="3" fill="#3b82f6"/><text x="60" y="22">2</text>
          <rect x="78" y="8" width="28" height="20" rx="3" fill="#8b5cf6"/><text x="92" y="22">3</text>
          <rect x="14" y="31" width="28" height="20" rx="3" fill="#ec4899"/><text x="28" y="45">4</text>
          <rect x="46" y="31" width="28" height="20" rx="3" fill="#f59e0b"/><text x="60" y="45">5</text>
          <rect x="78" y="31" width="28" height="20" rx="3" fill="#06b6d4"/><text x="92" y="45">6</text>
          <rect x="14" y="54" width="28" height="20" rx="3" fill="#dc2626"/><text x="28" y="68">7</text>
          <rect x="46" y="54" width="28" height="20" rx="3" fill="#6366f1"/><text x="60" y="68">8</text>
          <rect x="78" y="54" width="28" height="20" rx="3" fill="#10b981"/><text x="92" y="68">9</text>
        </g>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="200" height="200" rx="22" fill="#1e3a8a"/>
        <rect x="8" y="8" width="184" height="184" rx="16" fill="#0f172a" stroke="#3b82f6" stroke-width="4"/>
        <circle cx="100" cy="100" r="62" fill="#f8fafc" stroke="#0b1220" stroke-width="8"/>
        <path d="M38 100 A62 62 0 0 1 162 100 Z" fill="#ef4444"/>
        <path d="M38 100 H162" stroke="#0b1220" stroke-width="10"/>
        <circle cx="100" cy="100" r="20" fill="#f8fafc" stroke="#0b1220" stroke-width="8"/>
        <circle cx="100" cy="100" r="8" fill="#e2e8f0"/>
        <ellipse cx="78" cy="66" rx="14" ry="7" transform="rotate(-30 78 66)" fill="#ffffff" opacity="0.5"/>
      </svg>`,
      backdropSvg: ''
    }
  ];

  window.gaThemes = GAME_THEMES;
  window.gaIsTeacherThemeEnabled = function () {
    return true;
  };

  window.gaGetTheme = function () {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && GAME_THEMES.some(t => t.id === saved)) return saved;
    } catch (_) {}
    return 'classroom';
  };

  window.gaApplyThemeToStage = function (stage, themeId) {
    const target = stage || document.querySelector('.ga-stage');
    if (!window.gaIsTeacherThemeEnabled()) {
      if (target) {
        delete target.dataset.gaTheme;
        target.querySelector(':scope > .ga-theme-backdrop')?.remove();
      }
      delete document.body.dataset.gaActiveTheme;
      return;
    }
    const resolvedId = GAME_THEMES.some(t => t.id === themeId) ? themeId : window.gaGetTheme();
    const theme = GAME_THEMES.find(t => t.id === resolvedId) || GAME_THEMES[0];
    document.body.dataset.gaActiveTheme = theme.id;
    if (!target) return;
    target.dataset.gaTheme = theme.id;
    let backdrop = target.querySelector(':scope > .ga-theme-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'ga-theme-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      target.prepend(backdrop);
    }
    backdrop.innerHTML = theme.backdropSvg || '';
    backdrop.hidden = !theme.backdropSvg;
    const syncMemoryCardBacks = () => {
      ensureMasterCardBackDefs();
      const currentTheme = GAME_THEMES.find(t => t.id === target.dataset.gaTheme) || theme;
      target.querySelectorAll('.memory-card-front').forEach(front => {
        if (!currentTheme.cardBackSvg) {
          front.querySelector(':scope > .ga-card-back-art')?.remove();
          return;
        }
        let art = front.querySelector(':scope > .ga-card-back-art');
        if (!art) {
          art = document.createElement('div');
          art.className = 'ga-card-back-art';
          art.setAttribute('aria-hidden', 'true');
          front.appendChild(art);
        }
        if (art.dataset.themeId !== currentTheme.id) {
          art.dataset.themeId = currentTheme.id;
          // Parse each theme's SVG once, then clone it (parsing 30 large SVG strings froze theme switches).
          const cache = window.gaCardBackCache || (window.gaCardBackCache = {});
          if (!cache[currentTheme.id]) { const tpl = document.createElement('template'); tpl.innerHTML = currentTheme.cardBackSvg; cache[currentTheme.id] = tpl.content; }
          art.replaceChildren(cache[currentTheme.id].cloneNode(true));
        }
      });
    };
    syncMemoryCardBacks();
    const memoryGrid = target.querySelector('#memory-grid');
    if (memoryGrid) {
      if (!memoryGrid._gaCardBackObserved) {
        memoryGrid._gaCardBackObserved = true;
        new MutationObserver(syncMemoryCardBacks).observe(memoryGrid, { childList: true });
      }
      delete memoryGrid.dataset.fitKey;
    }
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    const ballSrc = theme.id === 'jungle' ? '/pokeayman/assets/balls/6.png' : theme.id === 'toybox' ? '/pokeayman/assets/balls/11.png' : theme.id === 'halloween' ? '/pokeayman/assets/balls/4.png' : '/pokeayman/assets/balls/1.png';
    target.querySelectorAll('.baam-seal-ball').forEach(img => {
      if (img.getAttribute('src') !== ballSrc) img.setAttribute('src', ballSrc);
    });
    target.querySelectorAll('[data-ga-theme-choice]').forEach(btn => {
      const active = btn.dataset.gaThemeChoice === theme.id;
      btn.classList.toggle('is-selected', active);
      btn.setAttribute('aria-checked', String(active));
    });
    const btnLabel = target.querySelector('.ga-stage-theme-current');
    if (btnLabel) btnLabel.textContent = theme.name;
  };

  window.gaSetTheme = function (themeId) {
    const theme = GAME_THEMES.find(t => t.id === themeId) || GAME_THEMES[0];
    try { localStorage.setItem(THEME_STORAGE_KEY, theme.id); } catch (_) {}
    document.querySelectorAll('.ga-theme-picker').forEach(picker => {
      const activeLabel = picker.querySelector('.ga-theme-active-label');
      if (activeLabel) activeLabel.textContent = `${theme.name} · ${theme.subtitle}`;
      picker.querySelectorAll('[data-ga-theme-choice]').forEach(btn => {
        const active = btn.dataset.gaThemeChoice === theme.id;
        btn.classList.toggle('is-selected', active);
        btn.classList.toggle('bg-slate-800/90', active);
        btn.classList.toggle('border-amber-400', active);
        btn.classList.toggle('ring-2', active);
        btn.classList.toggle('ring-amber-400/30', active);
        btn.classList.toggle('bg-slate-900/60', !active);
        btn.classList.toggle('border-slate-800', !active);
        btn.setAttribute('aria-checked', String(active));
        const badge = btn.querySelector('.ga-theme-check-badge');
        if (badge) badge.classList.toggle('hidden', !active);
        const nameEl = btn.querySelector('.ga-theme-card-name');
        if (nameEl) {
          nameEl.classList.toggle('text-amber-300', active);
          nameEl.classList.toggle('text-white', !active);
        }
      });
    });
    document.querySelectorAll('.ga-stage').forEach(stage => {
      window.gaApplyThemeToStage(stage, theme.id);
      stage.querySelectorAll('.ga-stage-theme-current').forEach(el => { el.textContent = theme.name; });
      stage.querySelectorAll('.ga-stage-theme-popover [data-ga-theme-choice]').forEach(btn => {
        const active = btn.dataset.gaThemeChoice === theme.id;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-checked', String(active));
      });
    });
  };

  function renderThemeCardsMarkup(selectedId) {
    return GAME_THEMES.map(theme => {
      const active = theme.id === selectedId;
      const previewContent = theme.previewUrl
        ? `<img src="${theme.previewUrl}" alt="${esc(theme.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">`
        : `<div class="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform">${theme.thumbSvg}</div>`;
      return `<button
        type="button"
        class="ga-theme-card relative rounded-xl border p-2 flex flex-col gap-1.5 text-left transition group ${active ? 'is-selected bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}"
        role="radio"
        aria-checked="${active}"
        data-ga-theme-choice="${esc(theme.id)}"
        title="${esc(theme.name)} — ${esc(theme.subtitle)}"
      >
        <div class="ga-theme-thumb-box relative rounded-lg overflow-hidden h-14 w-full bg-slate-950 flex items-center justify-center">
          ${previewContent}
          <div class="ga-theme-check-badge absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black z-10 ${active ? '' : 'hidden'}">✓</div>
        </div>
        <div>
          <div class="ga-theme-card-name text-xs font-bold ${active ? 'text-amber-300' : 'text-white'} group-hover:text-amber-300 transition-colors truncate">${esc(theme.name)}</div>
          <div class="ga-theme-card-sub text-[10px] text-slate-400 truncate">${esc(theme.subtitle)}</div>
        </div>
      </button>`;
    }).join('');
  }
  window.renderThemeCardsMarkup = renderThemeCardsMarkup;

  function renderThemeFilmstripMarkup(selectedId) {
    return GAME_THEMES.map(th => {
      const isSelected = th.id === selectedId;
      const previewContent = th.previewUrl
        ? `<img src="${th.previewUrl}" alt="${esc(th.name)}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full flex items-center justify-center">${th.thumbSvg}</div>`;
      return `<button
        key="${esc(th.id)}"
        type="button"
        data-ga-theme-choice="${esc(th.id)}"
        role="radio"
        aria-checked="${isSelected}"
        class="ga-theme-card relative flex-none w-[138px] snap-center rounded-2xl border p-2 flex flex-col gap-1.5 text-left transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'is-selected bg-slate-800 border-amber-400 ring-1 ring-amber-400/50 shadow-lg scale-[1.02]'
            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
        }"
      >
        <div class="ga-theme-thumb-box relative rounded-xl overflow-hidden h-20 bg-slate-950 border border-slate-800/50 flex items-center justify-center">
          ${previewContent}
        </div>
        <div class="px-0.5 pb-0.5">
          <div class="text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-white'} truncate">${esc(th.name)}</div>
        </div>
      </button>`;
    }).join('');
  }
  window.renderThemeFilmstripMarkup = renderThemeFilmstripMarkup;

  window.pendingChosenGame = null;
  window.arcadeOpen = true;

  window.gaExitSetupToArcade = function () {
    // 1. Remove all active inline game setup modals and lobbies
    document.querySelectorAll('.game-inline-view, .game-setup-panel, .ga-lobby, .ga-student-setup, .ga-continue-bar').forEach(el => el.remove());

    // 2. Unhide the arcade games hub in both teacher and student dashboard areas
    const teacherArea = document.getElementById('class-subtab-games');
    const studentArea = document.getElementById('student-tab-games');
    const teacherHub = teacherArea?.querySelector(':scope > .glass-container');
    const studentHub = studentArea?.querySelector(':scope > .glass-container');
    if (teacherHub) teacherHub.hidden = false;
    if (studentHub) studentHub.hidden = false;

    // 3. Clear temporary selections and pending game state
    window.pendingChosenGame = null;
    if (typeof selectedGameList !== 'undefined') selectedGameList = [];
    if (typeof selectedGameSession !== 'undefined') selectedGameSession = null;
    if (typeof pendingGamePlayers !== 'undefined') pendingGamePlayers = 0;
    if (typeof activeGamePlayers !== 'undefined') activeGamePlayers = [];
    if (typeof pendingGameTimerSeconds !== 'undefined') pendingGameTimerSeconds = 0;
    if (typeof pendingGameReward !== 'undefined') pendingGameReward = 0;
    if (typeof activeGameReward !== 'undefined') activeGameReward = 0;
    if (typeof activeGameRewardClaimed !== 'undefined') activeGameRewardClaimed = false;
    if (typeof resetGameTurnState === 'function') resetGameTurnState();

    // 4. Default to Class lists for next selection
    if (typeof selectedGameSource !== 'undefined') selectedGameSource = 'class_lists';

    // 5. Open arcade hub and re-render
    window.arcadeOpen = true;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaBackToArcade = window.gaExitSetupToArcade;

  window.gaShowListSelection = function (game) {
    if (game) window.pendingChosenGame = game;
    window.arcadeOpen = false;
    if (typeof selectedGameSource !== 'undefined') selectedGameSource = 'class_lists';
    if (typeof selectedGameList !== 'undefined') selectedGameList = [];
    if (typeof selectedGameSession !== 'undefined') selectedGameSession = null;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.selectGameToPlay = function (fnName) {
    const g = GAMES.find(item => item.fn === fnName);
    if (!g) return;
    const locked = Boolean(g.proOnly && !window.canUseProGames?.());
    if (locked) {
      if (typeof window.requireProGame === 'function') window.requireProGame(g.name);
      else toast(g.name + ' requires Pro access');
      return;
    }
    window.pendingChosenGame = g;
    window.arcadeOpen = false;
    if (typeof selectedGameSource !== 'undefined') selectedGameSource = 'class_lists';
    if (typeof selectedGameList !== 'undefined') selectedGameList = [];
    if (typeof selectedGameSession !== 'undefined') selectedGameSession = null;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaFastLaunchList = function (listRef, ctxSchool, ctxClass) {
    const isMyList = Boolean(listRef && typeof listRef === 'object' && (listRef.vocab_list_id || listRef.__backendId));
    if (!isMyList && ctxSchool && ctxClass) {
      navSchool = ctxSchool;
      navClass = ctxClass;
    }
    const keyOf = item => typeof item === 'object' ? String(item.vocab_list_id || item.__backendId || '') : String(item);
    const key = keyOf(listRef);
    const isSelected = Array.isArray(selectedGameList) && selectedGameList.some(item => keyOf(item) === key);
    if (!isSelected && typeof selectGameList === 'function') {
      selectGameList(listRef);
    }
    if (!selectedGameList.length) { toast('Please choose at least one vocabulary list'); return; }
    if (getGameWords(selectedGameList).length < 2) { toast('Choose lists with at least two words.'); return; }
    window.gaLaunchChosenGame(window.pendingChosenGame, selectedGameList);
  };

  window.gaLaunchChosenGame = function (g, list) {
    document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());
    if (!g) {
      if (GAMES[0]) g = GAMES[0];
      else return;
    }
    const locked = Boolean(g.proOnly && !window.canUseProGames?.());
    if (locked) {
      if (typeof window.requireProGame === 'function') window.requireProGame(g.name);
      else toast(g.name + ' requires Pro access');
      return;
    }
    let fn = window[g.fn];
    if (typeof fn !== 'function') {
      try { fn = eval(g.fn); } catch (e) {}
    }
    if (typeof fn === 'function') {
      chooseGamePlayers(list, fn);
    } else {
      toast('Cannot launch ' + g.name);
    }
  };

  window.initGameDeckCarousel = function (container) {
    const activeContainer = (typeof currentRole !== 'undefined' && currentRole === 'student')
      ? document.getElementById('student-games-options-container')
      : document.getElementById('games-options-container');
    const root = (container && container.querySelector ? (container.matches?.('#game-deck-carousel-root') ? container : container.querySelector('#game-deck-carousel-root')) : null)
      || (activeContainer && activeContainer.querySelector ? activeContainer.querySelector('#game-deck-carousel-root') : null)
      || document.getElementById('game-deck-carousel-root');
    if (!root) return;
    const stage = root.querySelector('#game-deck-cards-stage');
    const prevBtn = root.querySelector('#game-deck-prev');
    const nextBtn = root.querySelector('#game-deck-next');
    const counter = root.querySelector('#game-deck-counter');
    const descEl = root.querySelector('#game-deck-desc');
    const proceedBtn = root.querySelector('#game-deck-proceed');
    const proceedLabel = root.querySelector('#game-deck-proceed-label');
    if (!stage) return;

    const isTeacher = typeof currentRole !== 'undefined' ? currentRole === 'teacher' : true;
    const activeGames = GAMES.filter(g => !(isTeacher ? g.studentOnly : g.teacherOnly));
    if (!activeGames.length) return;

    let activeIndex = typeof window._lastChosenGameIndex === 'number' && window._lastChosenGameIndex >= 0 && window._lastChosenGameIndex < activeGames.length
      ? window._lastChosenGameIndex
      : Math.floor(activeGames.length / 2);

    function update() {
      window._lastChosenGameIndex = activeIndex;
      const currentGame = activeGames[activeIndex] || activeGames[0];
      const locked = Boolean(currentGame.proOnly && !window.canUseProGames?.());

      if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(activeGames.length).padStart(2, '0')}`;
      if (descEl) descEl.textContent = currentGame.desc;
      if (prevBtn) prevBtn.disabled = activeIndex === 0;
      if (nextBtn) nextBtn.disabled = activeIndex === activeGames.length - 1;
      if (proceedLabel) {
        proceedLabel.textContent = locked ? `Unlock ${currentGame.name} (Pro)` : `Select ${currentGame.name} →`;
      }

      stage.querySelectorAll('.game-deck-card-wrapper').forEach((cardEl, index) => {
        const offset = index - activeIndex;
        const absOffset = Math.abs(offset);
        const isCenter = offset === 0;

        // Fanning Math (smooth and always interactive)
        const translateX = offset * 130;
        const translateY = absOffset * 35;
        const rotateZ = offset * 10;
        const scale = isCenter ? 1.15 : Math.max(0.85, 1 - absOffset * 0.05);
        const zIndex = 50 - absOffset;
        const opacity = absOffset > 3 ? 0 : (absOffset === 3 ? 0.35 : (absOffset === 2 ? 0.75 : 1));

        cardEl.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotateZ(${rotateZ}deg)`;
        cardEl.style.zIndex = String(zIndex);
        cardEl.style.opacity = String(opacity);
        cardEl.style.pointerEvents = 'auto';

        const inner = cardEl.querySelector('.game-deck-inner-card');
        const isPro = cardEl.dataset.isPro === 'true';
        if (inner) {
          if (isCenter) {
            if (isPro) {
              inner.classList.add('ga-pro-center');
              inner.style.boxShadow = '0 0 35px rgba(251, 191, 36, 0.5), 0 20px 50px rgba(0, 0, 0, 0.7)';
            } else {
              inner.classList.add('ring-4', 'ring-amber-400');
              inner.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
            }
          } else {
            inner.classList.remove('ga-pro-center', 'ring-4', 'ring-amber-300', 'ring-amber-400');
            inner.style.boxShadow = '';
          }
        }
      });
    }

    stage.innerHTML = activeGames.map((game, index) => {
      const isPro = Boolean(game.proOnly);
      const locked = Boolean(isPro && !window.canUseProGames?.());

      if (isPro) {
        return `<div
        class="game-deck-card-wrapper absolute top-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer origin-bottom select-none"
        data-game-index="${index}"
        data-game-fn="${game.fn}"
        data-is-pro="true"
        role="button"
        tabindex="0"
        aria-label="Select ${esc(game.name)} (Pro Game)"
      >
        <div class="game-deck-inner-card ga-pro-gold-card w-[200px] sm:w-[220px] h-[280px] sm:h-[310px] rounded-xl shadow-2xl flex flex-col p-2.5 transition-all relative overflow-hidden">
          <div class="ga-pro-gold-foil absolute inset-0 pointer-events-none rounded-xl"></div>
          <div class="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-[9px] tracking-wide px-2 py-0.5 rounded-full shadow-[0_2px_10px_rgba(245,158,11,0.5)] border border-yellow-200/60">
            <span class="text-[10px] leading-none">${locked ? '🔒' : '👑'}</span>
            <span>PRO</span>
          </div>
          <div class="w-full text-center pb-1.5 pt-0.5 text-[11px] font-black text-amber-300/90 tracking-widest flex items-center justify-center gap-1">
            <span class="text-amber-400 text-[9px]">★</span>
            <span>#${String(index + 1).padStart(3, '0')}</span>
          </div>
          <div class="w-full flex-1 bg-gradient-to-b from-[#181d2c] to-[#0a0d16] rounded-lg overflow-hidden relative border-2 border-amber-400/50 shadow-[inset_0_0_14px_rgba(251,191,36,0.2)]">
            <img
              src="${game.image || ''}"
              alt="${esc(game.name)}"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="${index === 0 ? 'eager' : 'lazy'}"
              onerror="this.onerror=null;this.src='/pokeayman/assets/avatars/pokeayman-logo.png';"
            />
          </div>
          <div class="w-full text-center pt-3 pb-1 relative z-10">
            <h3 class="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 tracking-tight leading-none truncate px-1 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              ${esc(game.name)}
            </h3>
            <p class="text-[9px] font-black text-amber-400/90 mt-1.5 tracking-[0.25em] uppercase flex items-center justify-center gap-1">
              <span>✦</span>
              <span>POKÉAYMAN PRO</span>
              <span>✦</span>
            </p>
          </div>
        </div>
      </div>`;
      }

      return `<div
        class="game-deck-card-wrapper absolute top-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer origin-bottom select-none"
        data-game-index="${index}"
        data-game-fn="${game.fn}"
        role="button"
        tabindex="0"
        aria-label="Select ${esc(game.name)}"
      >
        <div class="game-deck-inner-card w-[200px] sm:w-[220px] h-[280px] sm:h-[310px] bg-white rounded-xl shadow-2xl flex flex-col p-2.5 transition-all relative">
          <div class="w-full text-center pb-1.5 pt-0.5 text-[11px] font-black text-slate-800 tracking-wider">
            #${String(index + 1).padStart(3, '0')}
          </div>
          <div class="w-full flex-1 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200/50">
            <img
              src="${game.image || ''}"
              alt="${esc(game.name)}"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="${index === 0 ? 'eager' : 'lazy'}"
              onerror="this.onerror=null;this.src='/pokeayman/assets/avatars/pokeayman-logo.png';"
            />
          </div>
          <div class="w-full text-center pt-3 pb-1">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none truncate px-1">
              ${esc(game.name)}
            </h3>
            <p class="text-[9px] font-black text-slate-400 mt-1.5 tracking-[0.2em] uppercase">
              PokéAyman
            </p>
          </div>
        </div>
      </div>`;
    }).join('');

    function launchGameByIndex(targetIndex) {
      const g = activeGames[targetIndex];
      if (!g) return;
      const locked = Boolean(g.proOnly && !window.canUseProGames?.());
      if (locked) {
        if (typeof window.requireProGame === 'function') window.requireProGame(g.name);
        else toast(g.name + ' requires Pro access');
      } else {
        window.selectGameToPlay(g.fn);
      }
    }

    stage.querySelectorAll('.game-deck-card-wrapper').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.gameIndex, 10);
        if (idx === activeIndex) {
          launchGameByIndex(activeIndex);
        } else {
          activeIndex = idx;
          update();
        }
      });

      card.addEventListener('dblclick', () => {
        const idx = parseInt(card.dataset.gameIndex, 10);
        launchGameByIndex(idx);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.dataset.gameIndex, 10);
          launchGameByIndex(idx);
        }
      });
    });

    prevBtn?.addEventListener('click', () => {
      if (activeIndex > 0) {
        activeIndex--;
        update();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (activeIndex < activeGames.length - 1) {
        activeIndex++;
        update();
      }
    });

    proceedBtn?.addEventListener('click', () => {
      launchGameByIndex(activeIndex);
    });

    // Keyboard navigation on stage
    root.tabIndex = 0;
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        e.preventDefault();
        activeIndex--;
        update();
      } else if (e.key === 'ArrowRight' && activeIndex < activeGames.length - 1) {
        e.preventDefault();
        activeIndex++;
        update();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        launchGameByIndex(activeIndex);
      }
    });

    update();
  };

  window.gaRenderHub = function (listLabel, isTeacher) {
    return `<section class="ga-hub overflow-visible" aria-label="Game arcade" style="overflow: visible !important;">
      <div class="w-full flex flex-col items-center justify-center py-6 sm:py-10 overflow-visible" id="game-deck-carousel-root" style="overflow: visible !important;">
        <!-- Step Header -->
        <div class="text-center mb-8 sm:mb-12">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Step 1</span>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">Choose a Game to Play</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Select a game below, then pick the vocabulary lists.</p>
        </div>

        <!-- 3D Fanned Deck Container -->
        <div class="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center game-deck-container overflow-visible" style="perspective: 1200px; overflow: visible !important;" id="game-deck-cards-stage">
        </div>

        <!-- Navigation Controls & Description -->
        <div class="mt-6 max-w-lg w-full flex flex-col items-center px-4">
          <div class="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
            <button 
              type="button"
              id="game-deck-prev" 
              aria-label="Previous game"
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-slate-700 hover:scale-105 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            
            <div class="text-center flex-1 min-w-0">
              <div id="game-deck-counter" class="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                01 / 06
              </div>
              <p id="game-deck-desc" class="text-sm sm:text-base font-medium text-slate-200 min-h-[48px] flex items-center justify-center line-clamp-2">
                Loading...
              </p>
            </div>

            <button 
              type="button"
              id="game-deck-next"
              aria-label="Next game"
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 hover:bg-slate-700 hover:scale-105 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Proceed Button -->
          <button
            type="button"
            id="game-deck-proceed"
            class="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
          >
            <span id="game-deck-proceed-label">Select Game</span>
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
      </div>
    </section>`;
  };

  window.selectedBotDifficulty = window.selectedBotDifficulty || 'normal';

  window.createRobotPlayer = function (difficulty = (window.selectedBotDifficulty || 'normal')) {
    const rawDiff = String(difficulty || 'normal').toLowerCase();
    const diff = ['easy', 'medium', 'hard'].includes(rawDiff) ? (rawDiff === 'medium' ? 'normal' : rawDiff) : (rawDiff === 'normal' ? 'normal' : 'normal');
    return {
      student_name: 'Robot',
      name: 'Robot',
      __backendId: 'bot-robot',
      id: 'bot-robot',
      student_id: 'bot-robot',
      avatar_pokemon_id: 137,
      isBot: true,
      botDifficulty: diff,
      coins: 0
    };
  };

  const renderBotDifficultyPickerMarkup = (selectedDifficulty = (window.selectedBotDifficulty || 'normal')) => {
    const raw = String(selectedDifficulty || '').toLowerCase();
    const currentDiff = raw === 'hard' ? 'hard' : (raw === 'easy' ? 'easy' : 'normal');
    const needleAngle = currentDiff === 'easy' ? -60 : (currentDiff === 'hard' ? 60 : 0);

    const difficulties = [
      {
        id: 'easy', label: 'Easy',
        angle: -60,
        tag: 'ROOKIE · LV.1',
        desc: 'Relaxed & casual',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        activePill: 'bg-emerald-400 text-slate-950 font-black',
        cardActive: 'border-emerald-400 bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50 scale-[1.02]',
        dotColor: 'bg-emerald-400'
      },
      {
        id: 'normal', label: 'Normal',
        angle: 0,
        tag: 'VETERAN · LV.2',
        desc: 'Balanced match',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        activePill: 'bg-amber-400 text-slate-950 font-black',
        cardActive: 'border-amber-400 bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50 scale-[1.02]',
        dotColor: 'bg-amber-400'
      },
      {
        id: 'hard', label: 'Hard',
        angle: 60,
        tag: 'MASTER · LV.3',
        desc: 'Clever & sharp',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
        activePill: 'bg-rose-400 text-slate-950 font-black',
        cardActive: 'border-rose-400 bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/50 scale-[1.02]',
        dotColor: 'bg-rose-400'
      }
    ];

    const currentMeta = difficulties.find(d => d.id === currentDiff) || difficulties[1];

    return `<section class="ga-bot-difficulty-picker ga-round-setting my-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 border border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]" aria-label="Robot opponent difficulty">
      <!-- Cyber HUD Header -->
      <div class="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span>OPPONENT: ROBOT</span>
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </span>
            <span class="text-xs font-black tracking-wide text-white">COMBAT AI LEVEL</span>
          </div>
        </div>
        <div class="ga-bot-difficulty-header-pill flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${currentMeta.badgeBg}">
          <span class="w-2 h-2 rounded-full ${currentMeta.dotColor} shadow-[0_0_6px_currentColor]"></span>
          <span class="ga-bot-difficulty-label">${currentMeta.label}</span>
        </div>
      </div>

      <!-- Speedometer Gauge Meter (Canva-style semi-circle arch) -->
      <div class="ga-speedometer-wrapper w-full max-w-[260px] mx-auto my-2 flex flex-col items-center">
        <svg viewBox="0 0 240 135" class="w-full max-w-[240px] drop-shadow-lg select-none" style="overflow: visible;">
          <defs>
            <linearGradient id="ga-easy-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#15803d" />
              <stop offset="100%" stop-color="#22c55e" />
            </linearGradient>
            <linearGradient id="ga-normal-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#b45309" />
              <stop offset="100%" stop-color="#f59e0b" />
            </linearGradient>
            <linearGradient id="ga-hard-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="100%" stop-color="#b91c1c" />
            </linearGradient>
            <filter id="ga-glow-easy" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#22c55e" flood-opacity="0.9" />
            </filter>
            <filter id="ga-glow-normal" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f59e0b" flood-opacity="0.9" />
            </filter>
            <filter id="ga-glow-hard" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ef4444" flood-opacity="0.9" />
            </filter>
            <filter id="ga-needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
            </filter>
          </defs>

          <!-- Inner Background Plate -->
          <path d="M 62 120 A 58 58 0 0 1 178 120 Z" fill="#0f172a" stroke="#334155" stroke-width="1.5" />

          <!-- Sector: EASY (Left, Green) -->
          <g class="ga-gauge-sector cursor-pointer transition-all duration-300 ${currentDiff === 'easy' ? 'is-active' : 'opacity-40 hover:opacity-85'}" data-difficulty="easy" role="button" aria-label="Easy difficulty" tabindex="0">
            <path d="M 22 120 A 98 98 0 0 1 68.8 36.44 L 89.7 70.55 A 58 58 0 0 0 62 120 Z" fill="url(#ga-easy-grad)" ${currentDiff === 'easy' ? 'filter="url(#ga-glow-easy)"' : ''} stroke="${currentDiff === 'easy' ? '#86efac' : '#1e293b'}" stroke-width="${currentDiff === 'easy' ? '2.5' : '1'}" />
            <text x="52.45" y="81" transform="rotate(-60 52.45 81)" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-weight="900" font-size="10.5" letter-spacing="1">EASY</text>
          </g>

          <!-- Sector: NORMAL (Middle, Yellow/Amber) -->
          <g class="ga-gauge-sector cursor-pointer transition-all duration-300 ${currentDiff === 'normal' ? 'is-active' : 'opacity-40 hover:opacity-85'}" data-difficulty="normal" role="button" aria-label="Normal difficulty" tabindex="0">
            <path d="M 73.24 33.88 A 98 98 0 0 1 166.76 33.88 L 147.68 69.03 A 58 58 0 0 0 92.32 69.03 Z" fill="url(#ga-normal-grad)" ${currentDiff === 'normal' ? 'filter="url(#ga-glow-normal)"' : ''} stroke="${currentDiff === 'normal' ? '#fde047' : '#1e293b'}" stroke-width="${currentDiff === 'normal' ? '2.5' : '1'}" />
            <text x="120" y="44" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-weight="900" font-size="10.5" letter-spacing="1">NORMAL</text>
          </g>

          <!-- Sector: HARD (Right, Red) -->
          <g class="ga-gauge-sector cursor-pointer transition-all duration-300 ${currentDiff === 'hard' ? 'is-active' : 'opacity-40 hover:opacity-85'}" data-difficulty="hard" role="button" aria-label="Hard difficulty" tabindex="0">
            <path d="M 171.2 36.44 A 98 98 0 0 1 218 120 L 178 120 A 58 58 0 0 0 150.3 70.55 Z" fill="url(#ga-hard-grad)" ${currentDiff === 'hard' ? 'filter="url(#ga-glow-hard)"' : ''} stroke="${currentDiff === 'hard' ? '#fca5a5' : '#1e293b'}" stroke-width="${currentDiff === 'hard' ? '2.5' : '1'}" />
            <text x="187.55" y="81" transform="rotate(60 187.55 81)" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-weight="900" font-size="10.5" letter-spacing="1">HARD</text>
          </g>

          <!-- Speedometer Needle -->
          <g class="ga-speedometer-needle pointer-events-none" style="transform-origin: 120px 120px; transform: rotate(${needleAngle}deg); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);" filter="url(#ga-needle-shadow)">
            <polygon points="116,120 118.5,28 121.5,28 124,120" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.2" />
            <line x1="120" y1="118" x2="120" y2="30" stroke="#f8fafc" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="120" cy="120" r="16" fill="#1e293b" stroke="#64748b" stroke-width="2.5" />
            <circle cx="120" cy="120" r="9" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
            <circle cx="120" cy="120" r="3.5" fill="#f8fafc" />
          </g>
        </svg>
      </div>

      <!-- 3 Interactive Difficulty Level Buttons -->
      <div class="grid grid-cols-3 gap-2 sm:gap-2.5 ga-difficulty-radiogroup mt-2" role="radiogroup" aria-label="Robot Difficulty">
        ${difficulties.map(d => {
          const isSelected = d.id === currentDiff;
          const cardClass = isSelected
            ? d.cardActive
            : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300';
          const tagClass = isSelected
            ? d.activePill
            : 'bg-slate-800/80 text-slate-400 border border-slate-700/50';

          return `<button type="button" class="ga-difficulty-choice ${isSelected ? 'is-selected' : ''} group relative p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center text-center cursor-pointer select-none overflow-hidden ${cardClass}" data-difficulty="${d.id}" aria-checked="${isSelected}">
            <div class="w-full flex items-center justify-between mb-1 relative z-10">
              <span class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${tagClass}">
                ${d.tag}
              </span>
              ${isSelected ? `<span class="w-3.5 h-3.5 rounded-full ${d.activePill} text-slate-950 flex items-center justify-center shadow"><svg class="w-2.5 h-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>` : `<span class="w-3.5 h-3.5"></span>`}
            </div>

            <div class="relative z-10 w-full mt-0.5">
              <div class="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                ${d.label}
              </div>
              <div class="text-[9px] text-slate-400 font-medium mt-0.5 truncate" title="${esc(d.desc)}">
                ${d.desc}
              </div>
            </div>
          </button>`;
        }).join('')}
      </div>
    </section>`;
  };

  const attachBotDifficultyListeners = (panel) => {
    panel.querySelectorAll('.ga-difficulty-choice, .ga-gauge-sector').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const diff = btn.dataset.difficulty;
        window.selectedBotDifficulty = diff;
        window.sfx?.play?.('click');

        const parentSection = btn.closest('.ga-bot-difficulty-picker');
        if (parentSection) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = renderBotDifficultyPickerMarkup(diff);
          const newSection = wrapper.firstElementChild;
          parentSection.replaceWith(newSection);
          attachBotDifficultyListeners(newSection);
        }

        if (Array.isArray(activeGamePlayers) && activeGamePlayers[1]?.isBot) {
          activeGamePlayers[1].botDifficulty = diff;
        }

        const robotSlot = document.querySelector('.ga-lineup-stage .p-3.border-cyan-400');
        if (robotSlot) {
          const tag = robotSlot.querySelector('span.text-\\[9px\\]');
          if (tag) tag.textContent = diff.toUpperCase();
        }
        const robotPill = document.querySelector('.ga-pick-robot-btn .ga-robot-pill');
        if (robotPill && window.teacherRobotOpponent) {
          robotPill.textContent = `ON · ${diff === 'hard' ? 'HARD' : (diff === 'easy' ? 'EASY' : 'NORMAL')}`;
        }
      });
    });
  };

  const ensureStudentRobotPlayers = (difficulty) => {
    const diff = difficulty || window.selectedBotDifficulty || 'normal';
    const curName = (typeof currentStudent !== 'undefined' ? currentStudent : '') || 'Player';
    const student = (Array.isArray(activeGamePlayers) && activeGamePlayers[0]) || (typeof getAllStudents === 'function' ? getAllStudents().find(s => s.student_name === curName) : null) || { student_name: curName, avatar_pokemon_id: 25 };
    const robot = window.createRobotPlayer(diff);
    activeGamePlayers = [student, robot];
    pendingGamePlayers = 2;
    activeGameScores = [0, 0];
    activeGamePlayerIndex = 0;
  };

  window.gaStudentSetup = function (listName, fnName) {
    const resolvedFnName = fnName || (window.pendingChosenGame ? window.pendingChosenGame.fn : '');
    const game = GAMES.find(item => item.fn === resolvedFnName && !item.teacherOnly);
    if (!game) return;
    if (resolvedFnName === 'startVocabBattle' || resolvedFnName === 'startListenCatch' || resolvedFnName === 'chooseCrossword') {
      const area = document.getElementById('student-tab-games');
      if (!area) return;
      area.querySelectorAll(':scope > .game-inline-view').forEach(view => view.remove());
      const hub = area.querySelector(':scope > .glass-container');
      if (hub) hub.hidden = true;
      const rawCrosswordCount = resolvedFnName === 'chooseCrossword' ? Math.max(0, Number(window.getCrosswordWordCount?.(listName) || 0)) : 0;
      const CROSSWORD_SAFE_MAX = 12;
      const crosswordWordMax = Math.min(CROSSWORD_SAFE_MAX, Math.max(2, rawCrosswordCount || 2));
      const selectedThemeId = window.gaGetTheme();
      const selectedTheme = GAME_THEMES.find(t => t.id === selectedThemeId) || GAME_THEMES[0];
      const panel = document.createElement('section');
      panel.className = 'game-inline-view ga-student-setup ga-hub';
      panel.setAttribute('aria-label', `${game.name} visual style and setup`);
      const headerIconHtml = game.image ? `<img src="${game.image}" alt="" class="inline-block w-8 h-8 rounded-lg object-cover align-middle mr-2 ring-1 ring-amber-400/40">` : `${game.icon} `;
      panel.innerHTML = `<header class="ga-hub-head"><h2>${headerIconHtml}${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header>
        <section class="ga-theme-picker ga-round-setting" aria-label="Visual style">
          <div class="ga-theme-picker-head">
            <h3>Visual style</h3>
            <span class="ga-theme-active-label" aria-live="polite">${esc(selectedTheme.name)} · ${esc(selectedTheme.subtitle)}</span>
          </div>
          <div class="ga-theme-grid" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(selectedTheme.id)}</div>
        </section>
        ${renderBotDifficultyPickerMarkup(window.selectedBotDifficulty || 'normal')}
        ${resolvedFnName === 'chooseCrossword' ? `<section class="ga-crossword-count" aria-label="Crossword word count"><label for="ga-crossword-word-count">Words in puzzle</label><div class="ga-crossword-count-controls"><input id="ga-crossword-word-count" type="number" min="2" max="${crosswordWordMax}" value="${crosswordWordMax}" inputmode="numeric"><button type="button" id="ga-crossword-play-all">Play ${rawCrosswordCount > CROSSWORD_SAFE_MAX ? `Max (${crosswordWordMax}` : `All (${crosswordWordMax}`} words)</button></div>${rawCrosswordCount > CROSSWORD_SAFE_MAX ? `<p class="ga-crossword-hint text-xs text-amber-300 font-semibold mt-1">Crosswords support up to ${CROSSWORD_SAFE_MAX} words for best board layout.</p>` : ''}</section>` : ''}
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
          <button type="button" class="btn-primary ga-student-start-btn" style="padding: 0.75rem 1.75rem; font-size: 1rem; font-weight: 800;">Start ${esc(game.name)} →</button>
        </div>`;
      panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
      attachBotDifficultyListeners(panel);
      if (resolvedFnName === 'chooseCrossword') {
        const cwInput = panel.querySelector('#ga-crossword-word-count');
        const cwSection = panel.querySelector('.ga-crossword-count');
        if (cwInput && cwSection) {
          const cwPanel = createQuickMousePanel({
            iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
            title: 'Words in puzzle',
            value: crosswordWordMax,
            min: 2,
            max: crosswordWordMax,
            step: 1,
            format: v => `${v} words`,
            onChange: v => {
              cwInput.value = String(v);
              cwInput.dispatchEvent(new Event('input', { bubbles: true }));
              cwInput.setCustomValidity?.('');
            }
          });
          cwInput.style.display = 'none';
          cwPanel.element.appendChild(cwInput);
          if (rawCrosswordCount > CROSSWORD_SAFE_MAX) {
            const hint = document.createElement('p');
            hint.className = 'ga-crossword-hint text-xs text-amber-300 font-semibold mt-1 px-1 text-center';
            hint.textContent = `Crosswords support up to ${CROSSWORD_SAFE_MAX} words for best board layout.`;
            cwPanel.element.appendChild(hint);
          }
          cwSection.replaceWith(cwPanel.element);
        }
      }
      panel.addEventListener('click', event => {
        const card = event.target.closest('[data-ga-theme-choice]');
        if (card) {
          window.gaSetTheme(card.dataset.gaThemeChoice);
        }
      });
      panel.querySelector('.ga-student-start-btn').addEventListener('click', () => {
        const crosswordCountInput = panel.querySelector('#ga-crossword-word-count');
        const crosswordCount = crosswordCountInput ? Number(crosswordCountInput.value) : null;
        if (crosswordCountInput && (!Number.isInteger(crosswordCount) || crosswordCount < 2 || crosswordCount > crosswordWordMax)) { crosswordCountInput.setCustomValidity(`Enter a whole number from 2 to ${crosswordWordMax}.`); crosswordCountInput.reportValidity(); return; }
        panel.remove();
        ensureStudentRobotPlayers(window.selectedBotDifficulty || 'medium');
        if (resolvedFnName === 'startVocabBattle') window.startVocabBattle(listName);
        else if (resolvedFnName === 'startListenCatch') window.startListenCatch(listName);
        else {
          try {
            window.openGameCrossword(listName, 0, crosswordCount);
          } catch (err) {
            console.error('Student crossword launch failed:', err);
            if (typeof window.handleCrosswordFailure === 'function') window.handleCrosswordFailure();
          }
        }
      });
      area.appendChild(panel);
      return;
    }
    const pictured = fnName === 'chooseMatchWordCount' || fnName === 'chooseFindMeScore';
    const words = getGameWords(listName, true).filter(word => String(word.vocab_word || '').trim() && (!pictured || String(word.vocab_image || '').trim()));
    const area = document.getElementById('student-tab-games');
    if (!area) return;
    area.querySelectorAll(':scope > .game-inline-view').forEach(view => view.remove());
    const hub = area.querySelector(':scope > .glass-container');
    if (hub) hub.hidden = true;
    const panel = document.createElement('section');
    panel.className = 'game-inline-view ga-student-setup ga-hub';
    const isBaam = fnName === 'chooseBaamboozlePowerUps';
    const isDots = fnName === 'chooseDotsAndBoxes';
    const counts = isBaam ? [8, 16] : (isDots ? [4, 9] : [5, 10, 15]);
    const unitLabel = isBaam ? 'cards' : (isDots ? 'boxes' : 'words');
    panel.setAttribute('aria-label', `${game.name} ${unitLabel}`);
    const headerIconHtml = game.image ? `<img src="${game.image}" alt="" class="inline-block w-8 h-8 rounded-lg object-cover align-middle mr-2 ring-1 ring-amber-400/40">` : `${game.icon} `;
    panel.innerHTML = `<header class="ga-hub-head"><h2>${headerIconHtml}${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header>
      ${renderBotDifficultyPickerMarkup(window.selectedBotDifficulty || 'normal')}
      <div class="ga-student-counts" role="group" aria-label="Number of ${unitLabel}">${counts.map(count => `<button type="button" class="btn-primary" data-count="${count}" ${(isBaam ? words.length < 1 : (isDots ? words.length < 2 : words.length < count)) ? 'disabled' : ''}><strong>${count}</strong><span>${unitLabel}</span></button>`).join('')}</div>`;
    panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
    attachBotDifficultyListeners(panel);
    panel.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
      const count = Number(button.dataset.count);
      pendingGameTimerSeconds = 0;
      pendingGameReward = 0;
      activeGameReward = 0;
      resetGameTurnState();
      panel.remove();
      ensureStudentRobotPlayers(window.selectedBotDifficulty || 'medium');
      if (fnName === 'chooseMatchWordCount') openGameMatch(listName, count, 0);
      else if (fnName === 'chooseMemoryDifficulty') openGameMemory(listName, 'easy', 0, count);
      else if (fnName === 'chooseScrambleWordCount') { window.scrambleSession = null; (window.openGameScramble || openGameScramble)(listName, count, 0); }
      else if (fnName === 'chooseFindMeScore') openGameFindMe(listName, count, 0);
      else if (fnName === 'chooseHangmanWordCount') openGameHangman(listName, count, 0, 'easy', true);
      else if (fnName === 'chooseBaamboozlePowerUps') openBaamboozle(listName, typeof baamboozlePowerUps !== 'undefined' ? baamboozlePowerUps : [], count);
      else if (fnName === 'chooseDotsAndBoxes') {
        const gridDots = count === 4 ? 3 : (count === 16 ? 5 : 4);
        (window.openGameDotsAndBoxes || openGameDotsAndBoxes)(listName, gridDots, 0);
      }
    }));
    area.appendChild(panel);
  };

  window.gaRemoveContinueBar = function () {
    document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());
  };

  window.gaListStep = function (selector, container, count) {
    if (!selector || !container) return;
    const isArcade = Boolean(window.arcadeOpen);

    if (isArcade) {
      selector.style.setProperty('display', 'none', 'important');
      selector.hidden = true;
      container.style.removeProperty('display');
      container.style.display = 'block';
      container.hidden = false;
      document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());
      return;
    }

    container.style.setProperty('display', 'none', 'important');
    container.hidden = true;
    selector.style.removeProperty('display');
    selector.style.display = 'block';
    selector.hidden = false;

    document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());

    // Only render floating bar if actively selecting vocab for a game and selectedLists.length > 0
    if (!count || count <= 0) {
      return;
    }

    // Verify games tab is currently active and visible, and no modal is open before showing continue bar
    const teacherArea = document.getElementById('class-subtab-games');
    const studentArea = document.getElementById('student-tab-games');
    const viewStudents = document.getElementById('view-students');
    const isTeacherGamesVisible = Boolean(
      teacherArea &&
      !teacherArea.classList.contains('hidden') &&
      !teacherArea.hidden &&
      viewStudents &&
      !viewStudents.classList.contains('hidden') &&
      !viewStudents.hidden
    );
    const isStudentGamesVisible = Boolean(
      studentArea &&
      !studentArea.classList.contains('hidden') &&
      !studentArea.hidden
    );
    const isGamesTabVisible = isTeacherGamesVisible || isStudentGamesVisible;
    const isAnyModalOpen = Boolean(
      document.querySelector(
        '.vocab-word-edit-card, ' +
        '.vocab-editor-overlay:not(.hidden), ' +
        '#edit-word-modal:not(.hidden)'
      )
    );

    if (!isGamesTabVisible || isAnyModalOpen) {
      document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());
      return;
    }

    if (!window.pendingChosenGame && typeof window.GAMES !== 'undefined' && window.GAMES.length) {
      window.pendingChosenGame = window.GAMES[0];
    } else if (!window.pendingChosenGame && typeof GAMES !== 'undefined' && GAMES.length) {
      window.pendingChosenGame = GAMES[0];
    }

    const totalWords = (typeof getGameWords === 'function' && Array.isArray(selectedGameList)) ? getGameWords(selectedGameList).length : 0;
    const gameName = window.pendingChosenGame ? window.pendingChosenGame.name : 'Game';

    const bar = document.createElement('div');
    bar.className = 'ga-continue-bar fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-3xl animate-in slide-in-from-bottom-5 fade-in duration-300';

    bar.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-slate-900 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div>
          <span class="text-white font-bold">${count} list${count > 1 ? 's' : ''} selected</span>
          <span class="text-amber-400/80 text-sm ml-2">(${totalWords} words total)</span>
        </div>
      </div>
      <button
        type="button"
        class="ga-continue px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-400/20 cursor-pointer flex-shrink-0"
        aria-label="Next: Game Settings for ${esc(gameName)}"
      >
        <span>Next: ${esc(gameName)} Setup</span>
        <svg class="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    `;

    const next = bar.querySelector('.ga-continue');
    next.addEventListener('click', () => {
      if (!selectedGameList.length) { toast('Please choose at least one vocabulary list'); return; }
      if (getGameWords(selectedGameList).length < 2) { toast('Choose lists with at least two words.'); return; }
      const targetGame = window.pendingChosenGame || (typeof window.GAMES !== 'undefined' ? window.GAMES[0] : (typeof GAMES !== 'undefined' ? GAMES[0] : null));
      window.gaLaunchChosenGame(targetGame, selectedGameList);
    });

    document.body.appendChild(bar);
  };

  window.gaMountStage = function (view) {
    const board = view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters, #crossword-grid, #dots-board-grid, .dots-arena-layout, .dots-game-shell, .lc-main, .vb-arena, .cdx-main');
    if (!board || view.querySelector('#game-player-list') || (view.classList.contains('ga-stage') && view.querySelector('.ga-stage-controls'))) return;
    view.classList.add('ga-stage');
    view.classList.remove('fixed', 'inset-0', 'bg-black/50', 'bg-black/60', 'z-50', 'p-4');
    const shell = view.querySelector('.memory-game-shell, .cipher-lab-shell, .hangman-game-shell, .match-game-shell, .find-me-game-shell, .crossword-game-shell, .surprise-boxes-game, .dots-game-shell, .lc-play, .vb-shell, .vb-arena, .cdx-shell') || (view.matches('.game-popup-modal') ? view.firstElementChild : view.firstElementChild);
    if (!shell) return;
    shell.classList.add('ga-stage-shell');
    let parent = shell.parentElement;
    while (parent && parent !== view) { parent.classList.add('ga-stage-wrapper'); parent = parent.parentElement; }
    const header = view.querySelector('.surprise-boxes-header, .memory-game-header, .cipher-lab-header, .crossword-header, .dots-header, .hangman-game-shell > div:first-child, .lc-head, .vb-head, .cdx-head, .sticky.top-0') || shell.firstElementChild;
    if (header) {
      header.classList.add('ga-stage-header');
      header.querySelector('[data-games-back]')?.remove();
      header.querySelectorAll('.game-fullscreen-btn').forEach(button => button.remove());
      const controls = document.createElement('div'); controls.className = 'ga-stage-controls';
      if (window.gaIsTeacherThemeEnabled()) {
        const currentThemeId = window.gaGetTheme();
        const currentThemeObj = GAME_THEMES.find(t => t.id === currentThemeId) || GAME_THEMES[0];
        const themeWrap = document.createElement('div');
        themeWrap.className = 'ga-stage-theme-wrap';
        themeWrap.innerHTML = `<button type="button" class="ga-stage-theme-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Change visual style" title="Change visual style"><span aria-hidden="true">🎨</span><span class="ga-stage-theme-current">${esc(currentThemeObj.name)}</span></button>
          <div class="ga-stage-theme-popover" role="dialog" aria-label="Visual style" hidden>
            <div class="ga-stage-theme-popover-head"><strong>Visual style</strong><span>Switch live</span></div>
            <div class="ga-theme-grid ga-theme-grid-compact" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(currentThemeId)}</div>
          </div>`;
        const trigger = themeWrap.querySelector('.ga-stage-theme-btn');
        const popover = themeWrap.querySelector('.ga-stage-theme-popover');
        const setPopoverOpen = open => {
          popover.hidden = !open;
          trigger.setAttribute('aria-expanded', String(open));
          themeWrap.classList.toggle('is-open', open);
        };
        trigger.addEventListener('click', event => {
          event.stopPropagation();
          setPopoverOpen(popover.hidden);
        });
        popover.addEventListener('click', event => {
          event.stopPropagation();
          const card = event.target.closest('[data-ga-theme-choice]');
          if (!card) return;
          window.gaSetTheme(card.dataset.gaThemeChoice);
          setPopoverOpen(false);
        });
        view.addEventListener('click', event => {
          if (!popover.hidden && !themeWrap.contains(event.target)) setPopoverOpen(false);
        });
        controls.appendChild(themeWrap);
      }
      // For Match Words, place density (+ and -) buttons directly next to the theme-changing button
      const matchDensity = view.querySelector('.match-game-density');
      if (matchDensity) {
        controls.appendChild(matchDensity);
      }
      const sound = document.createElement('button'); sound.type = 'button'; sound.className = 'ga-stage-sound';
      const syncSound = () => { const muted = window.pokeSfx?.isMuted() || false; sound.textContent = muted ? '🔇' : '🔊'; sound.setAttribute('aria-label', muted ? 'Turn game sounds on' : 'Turn game sounds off'); sound.title = sound.getAttribute('aria-label'); };
      syncSound(); sound.addEventListener('click', () => {
        window.pokeSfx?.setMuted(!window.pokeSfx.isMuted());
        if (typeof gameSoundState !== 'undefined') gameSoundState.muted = window.pokeSfx?.isMuted() || false;
        const scramble = view.querySelector('#scramble-sound-mute');
        if (scramble && (scramble.textContent.includes('🔇') !== Boolean(window.pokeSfx?.isMuted()))) scramble.click();
        syncSound();
      });
      const expand = document.createElement('button'); expand.type = 'button'; expand.textContent = '⛶'; expand.setAttribute('aria-label', 'Expand to browser fullscreen'); expand.title = 'Browser fullscreen';
      expand.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await view.requestFullscreen(); } catch (_) {} });
      const close = view.querySelector('#baam-close, #find-me-close, #game-close, #scramble-close, #hangman-close, #crossword-close, #dots-close-btn, [data-lc="close"], [data-vb="close"], [data-cdx="close"]') || document.createElement('button');
      close.type = 'button'; close.textContent = '×'; close.classList.add('ga-stage-exit'); close.setAttribute('aria-label', 'Close game'); close.title = 'Close game';
      close.addEventListener('click', event => {
        event.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        window.closeListenCatch?.();
        window.closeVocabBattle?.();
        window.closeCatchdex?.();
        endActiveGames();
      });
      controls.append(sound, expand, close); header.appendChild(controls);
      header.querySelectorAll('.game-sound-controls, #scramble-sound-mute').forEach(node => { node.hidden = true; });
      header.querySelectorAll('.match-game-tools').forEach(tools => { tools.remove(); });
    }
    document.body.appendChild(view);
    document.body.classList.add('ga-playing');
    window.gaApplyThemeToStage(view, window.gaGetTheme());
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Vocabulary game');
    requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); view.querySelector('.ga-stage-exit')?.focus({ preventScroll: true }); });
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector('.ga-stage')) {
      const openPopover = document.querySelector('.ga-stage .ga-stage-theme-popover:not([hidden])');
      if (openPopover) {
        event.preventDefault();
        openPopover.hidden = true;
        const wrap = openPopover.closest('.ga-stage-theme-wrap');
        wrap?.classList.remove('is-open');
        wrap?.querySelector('.ga-stage-theme-btn')?.setAttribute('aria-expanded', 'false');
        return;
      }
      event.preventDefault();
      window.closeListenCatch?.();
      window.closeVocabBattle?.();
      window.closeCatchdex?.();
      endActiveGames();
    }
  });
  const observeStages = () => new MutationObserver(() => {
    document.querySelectorAll('#class-subtab-games > .game-inline-view, #student-tab-games > .game-inline-view').forEach(view => window.gaMountStage(view));
    document.querySelectorAll('body > .ga-stage').forEach(view => { if (!view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters, #crossword-grid, #dots-board-grid, .dots-arena-layout, .dots-game-shell, .lc-main, .vb-arena, .cdx-main')) view.remove(); });
    if (!document.querySelector('.ga-stage') && document.body.classList.contains('ga-playing')) {
      document.body.classList.remove('ga-playing');
      delete document.body.dataset.gaActiveTheme;
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.querySelectorAll('#class-subtab-games > .glass-container, #student-tab-games > .glass-container').forEach(hub => { hub.hidden = false; });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (document.body) observeStages(); else document.addEventListener('DOMContentLoaded', observeStages, { once: true });

  function createWordCountStepper({ totalWords, initialCount, onChange }) {
    const allowRepeat = Boolean(arguments[0]?.allowRepeat);
    const total = Math.max(2, Number(totalWords) || 2);
    const standardSteps = [5, 8, 10, 12, 15, 18, 20, 25, 30];
    const steps = allowRepeat ? standardSteps : standardSteps.filter(n => n < total);
    const options = Array.from(new Set([...steps, total])).sort((a, b) => a - b);
    let currentIndex = options.indexOf(total);
    if (initialCount && options.includes(Number(initialCount))) {
      currentIndex = options.indexOf(Number(initialCount));
    }

    const panel = document.createElement('div');
    panel.className = 'ga-stepper-panel ga-word-count-panel flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800';
    panel.innerHTML = `<div class="flex items-center gap-2.5 text-xs font-bold text-slate-300 min-w-0">
      <span class="text-slate-500 shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
        </svg>
      </span>
      <div class="flex flex-col min-w-0 text-left">
        <span class="truncate">Word count</span>
      </div>
    </div>
    <div class="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 shrink-0">
      <button
        type="button"
        class="ga-stepper-dec ga-word-count-dec w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer"
        aria-label="Decrease word count"
      >
        −
      </button>
      <span class="ga-stepper-label ga-word-count-val px-2 text-xs font-bold text-slate-200 min-w-[70px] text-center select-none truncate">
      </span>
      <button
        type="button"
        class="ga-stepper-inc ga-word-count-inc w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer"
        aria-label="Increase word count"
      >
        +
      </button>
    </div>`;

    const decBtn = panel.querySelector('.ga-word-count-dec');
    const incBtn = panel.querySelector('.ga-word-count-inc');
    const valBadge = panel.querySelector('.ga-word-count-val');

    function update() {
      const count = options[currentIndex];
      if (count === total) {
        valBadge.textContent = `All (${count})`;
      } else if (count > total) {
        valBadge.textContent = `${count} cards`;
      } else {
        valBadge.textContent = `${count} words`;
      }
      valBadge.dataset.value = String(count);
      const atMin = currentIndex <= 0;
      const atMax = currentIndex >= options.length - 1;
      decBtn.disabled = atMin;
      decBtn.setAttribute('aria-disabled', String(atMin));
      incBtn.disabled = atMax;
      incBtn.setAttribute('aria-disabled', String(atMax));
      onChange?.(count);
    }

    decBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        update();
      }
    });

    incBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex < options.length - 1) {
        currentIndex++;
        update();
      }
    });

    update();

    return {
      element: panel,
      getValue: () => options[currentIndex],
      setValue: (val) => {
        const idx = options.indexOf(Number(val));
        if (idx >= 0) {
          currentIndex = idx;
          update();
        }
      }
    };
  }
  window.createWordCountStepper = createWordCountStepper;

  function createCustomStepper({ iconSvg, title, subtitleGetter, options, initialIndex = 0, onChange }) {
    let currentIndex = Math.max(0, Math.min(options.length - 1, initialIndex));
    const panel = document.createElement('div');
    panel.className = 'ga-stepper-panel flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800';

    panel.innerHTML = `<div class="flex items-center gap-2.5 text-xs font-bold text-slate-300 min-w-0">
      <span class="text-slate-500 shrink-0">${iconSvg}</span>
      <div class="flex flex-col min-w-0 text-left">
        <span class="truncate">${esc(title)}</span>
        <span class="ga-stepper-subtitle text-[10px] text-amber-400 font-medium truncate hidden"></span>
      </div>
    </div>
    <div class="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 shrink-0 min-w-[144px] justify-between">
      <button type="button" class="ga-stepper-dec w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer" aria-label="Decrease ${esc(title)}">
        −
      </button>
      <span class="ga-stepper-val min-w-[96px] whitespace-nowrap text-center text-xs font-black text-slate-200 px-1 select-none"></span>
      <button type="button" class="ga-stepper-inc w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer" aria-label="Increase ${esc(title)}">
        +
      </button>
    </div>`;

    const decBtn = panel.querySelector('.ga-stepper-dec');
    const incBtn = panel.querySelector('.ga-stepper-inc');
    const valSpan = panel.querySelector('.ga-stepper-val');
    const subSpan = panel.querySelector('.ga-stepper-subtitle');

    function update() {
      const curOpt = options[currentIndex] || options[0];
      valSpan.textContent = curOpt.label || String(curOpt.value ?? curOpt);
      const subText = subtitleGetter ? subtitleGetter(curOpt, currentIndex) : '';
      if (subText) {
        subSpan.textContent = subText;
        subSpan.classList.remove('hidden');
      } else {
        subSpan.textContent = '';
        subSpan.classList.add('hidden');
      }
      const atMin = currentIndex <= 0;
      const atMax = currentIndex >= options.length - 1;
      decBtn.disabled = atMin;
      decBtn.setAttribute('aria-disabled', String(atMin));
      incBtn.disabled = atMax;
      incBtn.setAttribute('aria-disabled', String(atMax));
      onChange?.(curOpt, currentIndex);
    }

    decBtn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (currentIndex > 0) { currentIndex--; update(); }
    });
    incBtn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (currentIndex < options.length - 1) { currentIndex++; update(); }
    });

    update();
    return {
      element: panel,
      getValue: () => options[currentIndex] || options[0],
      refreshSubtitle: () => {
        const curOpt = options[currentIndex] || options[0];
        const subText = subtitleGetter ? subtitleGetter(curOpt, currentIndex) : '';
        if (subText) {
          subSpan.textContent = subText;
          subSpan.classList.remove('hidden');
        } else {
          subSpan.textContent = '';
          subSpan.classList.add('hidden');
        }
      },
      setValue: val => {
        const idx = options.findIndex(o => (o.value ?? o.level ?? o.seconds ?? o) === val);
        if (idx >= 0) { currentIndex = idx; update(); }
      }
    };
  }

  function createQuickMousePanel({ iconSvg, title, value, min, max, step = 1, format = v => String(v), onChange }) {
    let current = value;
    const panel = document.createElement('div');
    panel.className = 'ga-qpanel flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800';
    panel.innerHTML = `<div class="flex items-center gap-2.5 text-xs font-bold text-slate-300 min-w-0">
      <span class="text-slate-500 shrink-0 ga-qicon">${iconSvg}</span>
      <span class="truncate ga-qlabel">${esc(title)}</span>
    </div>
    <div class="ga-qcounter flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 shrink-0" role="group" aria-label="${esc(title)} counter">
      <button type="button" class="ga-qbtn ga-qbtn-dec w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer" aria-label="Decrease ${esc(title)}">
        −
      </button>
      <span class="ga-qvalue min-w-[70px] text-center text-xs font-black text-slate-200 px-1 select-none"></span>
      <button type="button" class="ga-qbtn ga-qbtn-inc w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded cursor-pointer" aria-label="Increase ${esc(title)}">
        +
      </button>
    </div>`;

    const decBtn = panel.querySelector('.ga-qbtn-dec');
    const incBtn = panel.querySelector('.ga-qbtn-inc');
    const valSpan = panel.querySelector('.ga-qvalue');

    function update() {
      valSpan.textContent = format(current);
      valSpan.classList.toggle('has-value', current > min);
      const atMin = current <= min;
      const atMax = current >= max;
      decBtn.disabled = atMin;
      decBtn.setAttribute('aria-disabled', String(atMin));
      decBtn.classList.toggle('is-disabled', atMin);
      incBtn.disabled = atMax;
      incBtn.setAttribute('aria-disabled', String(atMax));
      incBtn.classList.toggle('is-disabled', atMax);
      panel.dataset.value = String(current);
      onChange?.(current);
    }

    decBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (current > min) {
        current = Math.max(min, current - step);
        update();
      }
    });

    incBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (current < max) {
        current = Math.min(max, current + step);
        update();
      }
    });

    update();
    return {
      element: panel,
      getValue: () => current,
      setValue: v => { current = Math.min(max, Math.max(min, v)); update(); }
    };
  }

  function getStandardTimerOptions() {
    const options = [
      { seconds: 0, label: 'No timer' },
      { seconds: 30, label: '30 sec' },
      { seconds: 45, label: '45 sec' }
    ];
    for (let m = 1; m <= 15; m++) {
      options.push({ seconds: m * 60, label: `${m} min` });
    }
    return options;
  }

  window.gaEnhanceLobby = function (modal, fnName, refresh) {
    if (modal.classList.contains('ga-lobby')) return;
    const resolvedFnName = fnName || (window.pendingChosenGame ? window.pendingChosenGame.fn : '') || modal.dataset.gaGameFn || '';
    const game = GAMES.find(g => g.fn === resolvedFnName || g.name === resolvedFnName || (window.pendingChosenGame && g.fn === window.pendingChosenGame.fn)) || window.pendingChosenGame;
    modal.classList.add('ga-lobby');

    const isSurpriseBoxesGame = resolvedFnName === 'chooseBaamboozlePowerUps' ||
      resolvedFnName === 'openBaamboozle' ||
      resolvedFnName === 'surprise_boxes' ||
      resolvedFnName === 'Surprise Boxes' ||
      modal.dataset.gaGameFn === 'chooseBaamboozlePowerUps' ||
      (modal.dataset.gaGameName && modal.dataset.gaGameName.toLowerCase().includes('surprise')) ||
      modal.querySelector('.shared-baam-count, #shared-baam-powerups') !== null ||
      Boolean(game && (game.fn === 'chooseBaamboozlePowerUps' || (game.name && game.name.toLowerCase().includes('surprise')))) ||
      Boolean(window.pendingChosenGame && (window.pendingChosenGame.fn === 'chooseBaamboozlePowerUps' || (window.pendingChosenGame.name && window.pendingChosenGame.name.toLowerCase().includes('surprise')) || window.pendingChosenGame.id === 'surprise_boxes'));

    document.querySelectorAll('.ga-continue-bar').forEach(el => el.remove());
    const existingOldClose = modal.querySelector('.ga-lobby-close, .ga-lobby-close-btn');
    if (existingOldClose) existingOldClose.remove();

    let headerRow = modal.querySelector('.ga-lobby-header');
    if (!headerRow) {
      headerRow = document.createElement('div');
      headerRow.className = 'ga-lobby-header flex items-center justify-between mb-6';
      headerRow.innerHTML = `
        <h2 class="text-3xl font-black text-white tracking-tight">${esc(game ? game.name : 'Game Setup')}</h2>
        <button type="button" class="ga-lobby-close-btn p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer" aria-label="Close setup and return to games">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;
      headerRow.querySelector('.ga-lobby-close-btn')?.addEventListener('click', () => window.gaExitSetupToArcade?.());

      const oldH2 = modal.querySelector('h2');
      if (oldH2) {
        const oldP = oldH2.nextElementSibling;
        if (oldP && oldP.tagName.toLowerCase() === 'p') oldP.style.display = 'none';
        oldH2.replaceWith(headerRow);
      } else {
        modal.prepend(headerRow);
      }
    }

    const list = modal.querySelector('#game-player-list');
    if (!list) return;
    const checks = [...list.querySelectorAll('.game-player-check')];
    const root = list.parentElement;
    const next = modal.querySelector('#game-players-next');
    const cancel = modal.querySelector('#game-players-cancel');
    const error = modal.querySelector('#game-player-error');
    const requiresTwoPlayers = isSurpriseBoxesGame;
    const isDotsAndBoxes = resolvedFnName === 'chooseDotsAndBoxes';
    const isSoloGame = resolvedFnName === 'startListenCatch' || resolvedFnName === 'startVocabBattle';
    const footer = next?.parentElement;
    if (!root || !footer) return;

    const players = document.createElement('section');
    players.className = 'ga-players-section flex-1 flex flex-col gap-4';
    const bar = document.createElement('div');
    bar.className = 'ga-players-bar flex flex-wrap items-center justify-between gap-2.5 w-full';

    const maxAllowed = isSoloGame ? 1 : (isDotsAndBoxes ? 2 : 4);
    bar.innerHTML = `
      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Select Players
        </h3>
        <span class="ga-player-count text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap" aria-live="polite">0 / ${maxAllowed} selected</span>
        <span class="text-[11px] text-slate-500 font-medium whitespace-nowrap">· ${checks.length} in class</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${!isSoloGame ? `<button type="button" data-q="robot" class="ga-pick-robot-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition text-xs font-bold cursor-pointer ${
          window.teacherRobotOpponent
            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40'
            : 'border-slate-700/50 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }" aria-pressed="${Boolean(window.teacherRobotOpponent)}" title="Play vs Robot Opponent">
          <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          <span>vs Robot</span>
          <span class="ga-robot-pill text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
            window.teacherRobotOpponent ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
          }">${window.teacherRobotOpponent ? 'ON' : 'OFF'}</span>
        </button>` : ''}
        <button type="button" data-q="clear" class="ga-pick-clear-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-bold cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>Clear</span>
        </button>
        <button type="button" data-q="random" class="ga-pick-random-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-bold cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.5-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
          <span>Random</span>
        </button>
      </div>
    `;

    // Active slots
    const lineupStage = document.createElement('div');
    lineupStage.className = `ga-lineup-stage grid gap-2 sm:gap-3 ${maxAllowed === 2 ? 'grid-cols-2' : (maxAllowed === 1 ? 'grid-cols-1' : 'grid-cols-4')}`;

    const renderLineup = () => {
      const checkedBoxes = checks.filter(c => c.checked);
      lineupStage.innerHTML = '';
      const isRobot = Boolean(window.teacherRobotOpponent && !isSoloGame);
      const robotSlotIdx = (isRobot && checkedBoxes.length <= 1) ? 1 : -1;

      for (let i = 0; i < maxAllowed; i++) {
        const chk = checkedBoxes[i];
        const slot = document.createElement('div');
        const pNum = i + 1;
        if (chk) {
          const card = chk.closest('.game-player-card-option');
          const imgEl = card?.querySelector('img, svg');
          const imgSrc = imgEl?.tagName?.toLowerCase() === 'img' ? imgEl.src : '';
          slot.className = 'p-3 rounded-2xl bg-slate-800 border border-amber-400 ring-1 ring-amber-400/20 flex flex-col items-center justify-center gap-2 relative h-[88px] cursor-pointer hover:border-amber-300 transition group';
          slot.innerHTML = `
            <span class="absolute top-1 left-2 text-[9px] font-black text-amber-400 uppercase">P${pNum}</span>
            <img src="${imgSrc || '/placeholder.svg'}" class="w-10 h-10 object-contain drop-shadow" alt="${esc(chk.value)}" />
            <span class="text-xs font-bold text-amber-400 truncate w-full text-center">${esc(chk.value)}</span>
          `;
          slot.addEventListener('click', (e) => {
            e.stopPropagation();
            chk.checked = false;
            refresh?.();
            update();
          });
        } else if (i === robotSlotIdx) {
          const diff = window.selectedBotDifficulty || 'normal';
          const diffLabel = diff === 'hard' ? 'Hard' : (diff === 'easy' ? 'Easy' : 'Normal');
          slot.className = 'p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400 ring-1 ring-cyan-400/40 flex flex-col items-center justify-center gap-1.5 relative h-[88px] cursor-pointer hover:border-cyan-300 transition group';
          slot.innerHTML = `
            <span class="absolute top-1 left-2 text-[9px] font-black text-cyan-300 uppercase">P2</span>
            <div class="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 drop-shadow">
              <svg class="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
            </div>
            <span class="text-xs font-black text-cyan-200 truncate w-full text-center">Robot</span>
            <span class="text-[9px] font-extrabold text-cyan-300/80 uppercase tracking-wider">${esc(diffLabel)}</span>
          `;
          slot.title = 'Robot Opponent. Click to disable.';
          slot.addEventListener('click', (e) => {
            e.stopPropagation();
            window.teacherRobotOpponent = false;
            update();
          });
        } else {
          slot.className = 'p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center gap-2 h-[88px]';
          slot.innerHTML = `
            <svg class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span class="text-[10px] font-bold text-slate-600 truncate w-full text-center">P${pNum}</span>
          `;
        }
        lineupStage.appendChild(slot);
      }

      // Update student cards with player badges
      checks.forEach(c => {
        const card = c.closest('.game-player-card-option');
        if (!card) return;
        const playerIdx = checkedBoxes.indexOf(c);
        const isSelected = playerIdx >= 0;
        card.className = `game-player-card-option p-3 rounded-2xl border transition flex flex-col items-center gap-2 active:scale-95 cursor-pointer ${
          isSelected
            ? 'bg-slate-800/80 border-indigo-500/50 opacity-50 is-selected'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
        }`;
        let badge = card.querySelector('.ga-player-badge');
        if (isSelected) {
          const pNum = playerIdx + 1;
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'ga-player-badge absolute top-1 left-2 text-[9px] font-black text-indigo-300 uppercase';
            card.prepend(badge);
          }
          badge.textContent = `P${pNum}`;
        } else {
          if (badge) badge.remove();
        }
      });
    };

    const clearBtn = bar.querySelector('.ga-pick-clear-btn');
    const countBadge = bar.querySelector('.ga-player-count');
    const update = () => {
      const count = checks.filter(c => c.checked).length;
      const isRobot = Boolean(window.teacherRobotOpponent && !isSoloGame);

      const robotBtn = bar.querySelector('.ga-pick-robot-btn');
      const robotPill = bar.querySelector('.ga-robot-pill');
      if (robotBtn) {
        robotBtn.setAttribute('aria-pressed', String(isRobot));
        robotBtn.className = `ga-pick-robot-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition text-xs font-bold cursor-pointer ${
          isRobot
            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40'
            : 'border-slate-700/50 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`;
      }
      if (robotPill) {
        robotPill.className = `ga-robot-pill text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
          isRobot ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
        }`;
        robotPill.textContent = isRobot ? 'ON' : 'OFF';
      }

      let botDiffPanel = players.querySelector('.ga-teacher-bot-difficulty');
      if (isRobot) {
        if (!botDiffPanel) {
          botDiffPanel = document.createElement('div');
          botDiffPanel.className = 'ga-teacher-bot-difficulty mt-1';
          lineupStage.after(botDiffPanel);
        }
        botDiffPanel.innerHTML = renderBotDifficultyPickerMarkup(window.selectedBotDifficulty || 'normal');
        attachBotDifficultyListeners(botDiffPanel);
        botDiffPanel.querySelectorAll('.ga-difficulty-choice').forEach(btn => {
          btn.addEventListener('click', () => {
            renderLineup();
          });
        });
      } else {
        if (botDiffPanel) botDiffPanel.remove();
      }

      renderLineup();
      if (countBadge) {
        if (isRobot && count === 1) {
          countBadge.textContent = '1 student + Robot (AI)';
        } else if (isRobot && count === 0) {
          countBadge.textContent = `0 / ${maxAllowed} (vs Robot)`;
        } else {
          countBadge.textContent = `${count} / ${maxAllowed} selected`;
        }
      }
      if (isSoloGame) {
        const sel = checks.find(c => c.checked);
        const blocked = !sel;
        if (next) {
          next.disabled = blocked;
          next.setAttribute('aria-disabled', String(blocked));
        }
        if (error) {
          error.textContent = blocked ? 'Select a student to play.' : '';
          error.classList.toggle('hidden', !blocked);
        }
        return;
      }
      if (isDotsAndBoxes) {
        const blocked = (isRobot && count === 1) ? false : (count !== 2);
        if (next) {
          next.disabled = blocked;
          next.setAttribute('aria-disabled', String(blocked));
        }
        if (error) {
          error.textContent = blocked ? 'Dots and Boxes requires exactly 2 students (or 1 student vs Robot) to start.' : '';
          error.classList.toggle('hidden', !blocked);
        }
        return;
      }
      if (requiresTwoPlayers) {
        const blocked = (isRobot && count === 1) ? false : (count < 2);
        if (next) {
          next.disabled = blocked;
          next.setAttribute('aria-disabled', String(blocked));
        }
        if (error) {
          error.textContent = blocked ? 'Surprise Boxes needs at least 2 students (or 1 student vs Robot) to start.' : '';
          error.classList.toggle('hidden', !blocked);
        }
        return;
      }
      const blocked = count === 0;
      if (next) {
        next.disabled = blocked;
        next.setAttribute('aria-disabled', String(blocked));
      }
      if (error) {
        error.textContent = blocked ? 'Select at least one student.' : '';
        error.classList.toggle('hidden', !blocked);
      }
    };
    const set = picks => {
      checks.forEach(c => {
        c.disabled = false;
        c.checked = picks.includes(c);
      });
      refresh?.();
      update();
    };
    if (isSoloGame) {
      checks.forEach(c => {
        c.addEventListener('change', () => {
          if (c.checked) {
            checks.forEach(other => { if (other !== c) other.checked = false; });
            refresh?.();
            update();
          }
        });
      });
      if (!checks.some(c => c.checked) && checks[0]) {
        checks[0].checked = true;
      }
    }
    bar.addEventListener('click', e => {
      const q = e.target.closest('button')?.dataset.q; if (!q) return;
      if (q === 'robot') {
        window.teacherRobotOpponent = !window.teacherRobotOpponent;
        update();
        return;
      }
      if (q === 'clear') {
        set([]);
        return;
      }
      const shuffled = [...checks];
      for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      if (isSoloGame) {
        set(q === 'random' && shuffled[0] ? [shuffled[0]] : []);
      } else if (window.teacherRobotOpponent) {
        set(q === 'random' && shuffled[0] ? [shuffled[0]] : []);
      } else {
        set(q === 'random' ? shuffled.slice(0, maxAllowed) : []);
      }
    });
    list.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mt-2 overflow-y-auto max-h-[240px] pr-2 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]';
    list.before(players);
    players.append(bar, lineupStage, list);
    checks.forEach(c => c.addEventListener('change', () => {
      refresh?.();
      update();
    }));

    const existingScoreInput = modal.querySelector('#shared-winning-score');
    const isScrambleOrFindMe = resolvedFnName === 'chooseScrambleWordCount' || resolvedFnName === 'chooseFindMeScore' || (window.pendingChosenGame && (window.pendingChosenGame.fn === 'chooseScrambleWordCount' || window.pendingChosenGame.fn === 'chooseFindMeScore'));
    const hasPointsToWin = !!existingScoreInput || isScrambleOrFindMe;

    modal.querySelectorAll('.shared-baam-count').forEach(button => button.classList.remove('game-timer-option'));

    const setupLayout = document.createElement('div');
    setupLayout.className = 'ga-setup-layout flex flex-col lg:flex-row gap-8';

    const setupLeft = document.createElement('div');
    setupLeft.className = 'ga-setup-left flex-1 flex flex-col gap-4';
    setupLeft.appendChild(players);

    const setupRight = document.createElement('div');
    setupRight.className = 'ga-setup-right w-full lg:w-[400px] flex flex-col gap-8';

    const paramsSection = document.createElement('section');
    paramsSection.className = 'ga-params-section';
    paramsSection.setAttribute('aria-label', 'Game parameters');

    // Words in puzzle (Top for Crossword)
    const existingCrosswordSection = root.querySelector('.ga-crossword-count') || modal.querySelector('.ga-crossword-count');
    const existingCrosswordInput = existingCrosswordSection?.querySelector('#crossword-word-count, #ga-crossword-word-count') || modal.querySelector('#crossword-word-count, #ga-crossword-word-count');
    if (existingCrosswordInput) {
      const CROSSWORD_SAFE_MAX = 12;
      const rawMax = Math.max(2, Number(existingCrosswordInput.max || 10));
      const cwMin = Math.max(2, Number(existingCrosswordInput.min || 2));
      const cwMax = Math.min(CROSSWORD_SAFE_MAX, rawMax);
      const cwInitial = Math.max(cwMin, Math.min(cwMax, Number(existingCrosswordInput.value || cwMax)));
      const crosswordPanel = createQuickMousePanel({
        iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
        title: 'Words in puzzle',
        value: cwInitial,
        min: cwMin,
        max: cwMax,
        step: 1,
        format: v => `${v} words`,
        onChange: v => {
          existingCrosswordInput.value = String(v);
          existingCrosswordInput.dispatchEvent(new Event('input', { bubbles: true }));
          existingCrosswordInput.dispatchEvent(new Event('change', { bubbles: true }));
          existingCrosswordInput.setCustomValidity?.('');
          modal.dataset.gaCrosswordCount = String(v);
        }
      });
      existingCrosswordInput.style.display = 'none';
      crosswordPanel.element.appendChild(existingCrosswordInput);
      if (rawMax > CROSSWORD_SAFE_MAX) {
        const hint = document.createElement('p');
        hint.className = 'ga-crossword-hint text-xs text-amber-300 font-semibold mt-1 px-1 text-center';
        hint.textContent = `Crosswords support up to ${CROSSWORD_SAFE_MAX} words for best board layout.`;
        crosswordPanel.element.appendChild(hint);
      }
      if (existingCrosswordSection) existingCrosswordSection.remove();
      modal.dataset.gaCrosswordCount = String(crosswordPanel.getValue());
      paramsSection.appendChild(crosswordPanel.element);
    }

    // Collect other game-specific controls if any
    const gameSpecificControls = [...root.children].filter(el =>
      !el.matches('.ga-crossword-count') &&
      el.querySelector('.memory-level-option, .match-word-count-option, .shared-baam-count')
    );

    const isMemoryGame = resolvedFnName === 'chooseMemoryDifficulty';
    const isMatchGame = resolvedFnName === 'chooseMatchWordCount';
    if (isMemoryGame) {
      const existingMemoryCtrl = gameSpecificControls.find(el => el.querySelector('.memory-level-option'));
      if (existingMemoryCtrl) {
        existingMemoryCtrl.remove();
        const idx = gameSpecificControls.indexOf(existingMemoryCtrl);
        if (idx >= 0) gameSpecificControls.splice(idx, 1);
      }

      const activeListName = modal.dataset.gaListName || '';
      const memoryWords = typeof getGameWords === 'function' ? getGameWords(activeListName).filter(w => w && String(w.vocab_word || '').trim()) : [];
      const vocabWordCount = memoryWords.length;

      const gridIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`;

      const gridStepper = createCustomStepper({
        iconSvg: gridIcon,
        title: 'Grid size',
        subtitleGetter: (opt) => {
          const needed = Math.max(0, opt.pairs - vocabWordCount);
          if (needed > 0) {
            return `${vocabWordCount} words + ${needed} mystery pair${needed === 1 ? '' : 's'}`;
          }
          return `${opt.pairs} words`;
        },
        options: [
          { level: 'easy', pairs: 5, label: 'Easy · 10 cards' },
          { level: 'medium', pairs: 9, label: 'Medium · 18 cards' },
          { level: 'hard', pairs: 15, label: 'Hard · 30 cards' }
        ],
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaMemoryDifficulty = opt.level;
          window.selectedMemoryDifficulty = opt.level;
          modal.querySelectorAll('.memory-level-option').forEach(btn => {
            const active = btn.dataset.level === opt.level;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
        }
      });
      modal.dataset.gaMemoryDifficulty = 'easy';
      window.selectedMemoryDifficulty = 'easy';
      paramsSection.appendChild(gridStepper.element);

      const coinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`;
      const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : 20;
      const rewardMax = (availableCredits === Infinity || !Number.isFinite(availableCredits)) ? 100 : Math.max(0, Math.floor(availableCredits / 10) * 10);
      const coinOptions = [{ value: 0, label: 'No coins' }];
      for (let c = 10; c <= Math.max(20, rewardMax); c += 10) {
        coinOptions.push({ value: c, label: `${c} coins` });
      }

      const rewardStepper = createCustomStepper({
        iconSvg: coinIcon,
        title: 'Winner reward coins',
        options: coinOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaRewardCoins = String(opt.value);
          window.pendingGameReward = opt.value;
          modal.querySelectorAll('.game-reward-option').forEach(btn => {
            const active = Number(btn.dataset.reward || 0) === opt.value;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-checked', String(active));
          });
        }
      });
      modal.dataset.gaRewardCoins = '0';
      window.pendingGameReward = 0;
      paramsSection.appendChild(rewardStepper.element);

      const timerIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
      const timerOptions = getStandardTimerOptions();

      const timerStepper = createCustomStepper({
        iconSvg: timerIcon,
        title: 'Timer',
        options: timerOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaTimerSeconds = String(opt.seconds);
          window.pendingGameTimerSeconds = opt.seconds;
          modal.querySelectorAll('.game-timer-option').forEach(btn => {
            const active = Number(btn.dataset.seconds || 0) === opt.seconds;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
          gridStepper.refreshSubtitle?.();
        }
      });
      modal.dataset.gaTimerSeconds = '0';
      window.pendingGameTimerSeconds = 0;
      paramsSection.appendChild(timerStepper.element);
    } else if (isMatchGame) {
      const existingMatchCtrl = gameSpecificControls.find(el => el.querySelector('.match-word-count-option, .ga-match-word-count-panel, .ga-word-count-panel'));
      if (existingMatchCtrl) {
        existingMatchCtrl.remove();
        const idx = gameSpecificControls.indexOf(existingMatchCtrl);
        if (idx >= 0) gameSpecificControls.splice(idx, 1);
      }
      modal.querySelectorAll('.match-word-count-option, .ga-match-word-count-panel').forEach(el => {
        const parent = el.closest('.mb-4, fieldset, .ga-round-setting') || el;
        if (parent) parent.remove();
      });

      const activeListName = modal.dataset.gaListName || '';
      const matchWords = typeof getGameWords === 'function' ? getGameWords(activeListName, true).filter(w => w && w.vocab_image && String(w.vocab_image).trim()) : [];
      const totalWords = matchWords.length || Number(modal.dataset.gaTotalMatchWords || 0) || 0;

      const wordCountStepper = createWordCountStepper({
        totalWords,
        allowRepeat: true,
        initialCount: modal.dataset.gaMatchWordCount ? Number(modal.dataset.gaMatchWordCount) : totalWords,
        onChange: (count) => {
          modal.dataset.gaMatchWordCount = String(count);
          window.selectedMatchWordCount = count;
        }
      });
      const initialWordCount = wordCountStepper.getValue();
      modal.dataset.gaMatchWordCount = String(initialWordCount);
      window.selectedMatchWordCount = initialWordCount;
      paramsSection.appendChild(wordCountStepper.element);

      const coinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`;
      const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : 20;
      const rewardMax = (availableCredits === Infinity || !Number.isFinite(availableCredits)) ? 100 : Math.max(0, Math.floor(availableCredits / 5) * 5);
      const coinOptions = [{ value: 0, label: 'No coins' }];
      for (let c = 5; c <= Math.max(20, rewardMax); c += 5) {
        coinOptions.push({ value: c, label: `${c} coins` });
      }

      const rewardStepper = createCustomStepper({
        iconSvg: coinIcon,
        title: 'Winner reward coins',
        options: coinOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaRewardCoins = String(opt.value);
          window.pendingGameReward = opt.value;
          modal.querySelectorAll('.game-reward-option').forEach(btn => {
            const active = Number(btn.dataset.reward || 0) === opt.value;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-checked', String(active));
          });
        }
      });
      modal.dataset.gaRewardCoins = '0';
      window.pendingGameReward = 0;
      paramsSection.appendChild(rewardStepper.element);

      const timerIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
      const timerOptions = getStandardTimerOptions();

      const timerStepper = createCustomStepper({
        iconSvg: timerIcon,
        title: 'Timer',
        options: timerOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaTimerSeconds = String(opt.seconds);
          window.pendingGameTimerSeconds = opt.seconds;
          modal.querySelectorAll('.game-timer-option').forEach(btn => {
            const active = Number(btn.dataset.seconds || 0) === opt.seconds;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
        }
      });
      modal.dataset.gaTimerSeconds = '0';
      window.pendingGameTimerSeconds = 0;
      paramsSection.appendChild(timerStepper.element);
    } else if (resolvedFnName === 'chooseDotsAndBoxes') {
      const gridIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`;
      const gridStepper = createCustomStepper({
        iconSvg: gridIcon,
        title: 'Grid size',
        options: [
          { dots: 4, label: '4×4 dots · 9 boxes' },
          { dots: 3, label: '3×3 dots · 4 boxes' },
          { dots: 5, label: '5×5 dots · 16 boxes' }
        ],
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaGridDots = String(opt.dots);
          window.selectedDotsAndBoxesGrid = opt.dots;
        }
      });
      modal.dataset.gaGridDots = '4';
      window.selectedDotsAndBoxesGrid = 4;
      paramsSection.appendChild(gridStepper.element);

      const coinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`;
      const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : 20;
      const rewardMax = (availableCredits === Infinity || !Number.isFinite(availableCredits)) ? 100 : Math.max(0, Math.floor(availableCredits / 5) * 5);
      const coinOptions = [{ value: 0, label: 'No coins' }];
      for (let c = 5; c <= Math.max(20, rewardMax); c += 5) {
        coinOptions.push({ value: c, label: `${c} coins` });
      }

      const rewardStepper = createCustomStepper({
        iconSvg: coinIcon,
        title: 'Winner reward coins',
        options: coinOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaRewardCoins = String(opt.value);
          window.pendingGameReward = opt.value;
          modal.querySelectorAll('.game-reward-option').forEach(btn => {
            const active = Number(btn.dataset.reward || 0) === opt.value;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-checked', String(active));
          });
        }
      });
      modal.dataset.gaRewardCoins = '0';
      window.pendingGameReward = 0;
      paramsSection.appendChild(rewardStepper.element);

      const timerIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
      const timerOptions = getStandardTimerOptions();

      const timerStepper = createCustomStepper({
        iconSvg: timerIcon,
        title: 'Timer',
        options: timerOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaTimerSeconds = String(opt.seconds);
          window.pendingGameTimerSeconds = opt.seconds;
          modal.querySelectorAll('.game-timer-option').forEach(btn => {
            const active = Number(btn.dataset.seconds || 0) === opt.seconds;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
        }
      });
      modal.dataset.gaTimerSeconds = '0';
      window.pendingGameTimerSeconds = 0;
      paramsSection.appendChild(timerStepper.element);
    } else if (isSurpriseBoxesGame) {
      if (window.selectedBaamPowerupsEnabled === undefined) {
        window.selectedBaamPowerupsEnabled = true;
      }
      const existingPowerupCheckbox = modal.querySelector('#shared-baam-powerups');
      const initialPowerupsEnabled = modal.dataset.gaBaamPowerups !== undefined
        ? modal.dataset.gaBaamPowerups === 'true'
        : (existingPowerupCheckbox ? existingPowerupCheckbox.checked : (window.selectedBaamPowerupsEnabled ?? true));

      const existingBaamCtrl = gameSpecificControls.find(el => el.querySelector('.shared-baam-count'));
      if (existingBaamCtrl) {
        existingBaamCtrl.remove();
        const idx = gameSpecificControls.indexOf(existingBaamCtrl);
        if (idx >= 0) gameSpecificControls.splice(idx, 1);
      }
      modal.querySelectorAll('.shared-baam-count').forEach(el => {
        const parent = el.closest('.mb-4, fieldset, .ga-round-setting') || el;
        if (parent) parent.remove();
      });

      const cardsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`;
      const cardsStepper = createCustomStepper({
        iconSvg: cardsIcon,
        title: 'Number of cards',
        options: [
          { count: 8, label: '8 cards' },
          { count: 18, label: '18 cards' },
          { count: 24, label: '24 cards' }
        ],
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaBaamCardCount = String(opt.count);
          window.selectedBaamCardCount = opt.count;
        }
      });
      modal.dataset.gaBaamCardCount = '8';
      window.selectedBaamCardCount = 8;
      paramsSection.appendChild(cardsStepper.element);

      // Enable surprise boxes toggle & stepper (Enabled / Disabled)
      const powerupIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
      let syncPowerupSwitch = null;
      const powerupStepper = createCustomStepper({
        iconSvg: powerupIcon,
        title: 'Enable surprise boxes',
        subtitleGetter: (opt) => opt.value ? 'Power-ups, traps and score swaps' : 'Vocabulary questions only',
        options: [
          { value: false, label: 'Disabled' },
          { value: true, label: 'Enabled' }
        ],
        initialIndex: initialPowerupsEnabled ? 1 : 0,
        onChange: (opt) => {
          modal.dataset.gaBaamPowerups = String(opt.value);
          window.selectedBaamPowerupsEnabled = opt.value;
          let check = modal.querySelector('#shared-baam-powerups');
          if (!check) {
            check = document.createElement('input');
            check.type = 'checkbox';
            check.id = 'shared-baam-powerups';
            check.className = 'sr-only';
            modal.appendChild(check);
          }
          check.checked = opt.value;
          if (typeof syncPowerupSwitch === 'function') {
            syncPowerupSwitch(opt.value);
          }
        }
      });
      modal.dataset.gaBaamPowerups = String(initialPowerupsEnabled);
      window.selectedBaamPowerupsEnabled = initialPowerupsEnabled;
      let check = modal.querySelector('#shared-baam-powerups');
      if (!check) {
        check = document.createElement('input');
        check.type = 'checkbox';
        check.id = 'shared-baam-powerups';
        check.className = 'sr-only';
        modal.appendChild(check);
      }
      check.checked = initialPowerupsEnabled;

      // Replace right-side controls with the White Elephant 70 switch and status badge, aligned to 136px
      const rightCtrl = powerupStepper.element.querySelector('.ga-stepper-panel > div:last-child');
      if (rightCtrl) {
        rightCtrl.className = 'ga-powerups-ctrl flex items-center justify-between w-[136px] min-w-[136px] max-w-[136px] h-9 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 shrink-0 select-none cursor-pointer box-border';
        rightCtrl.innerHTML = `
          <span class="ga-stepper-val text-xs font-black tracking-wide ${initialPowerupsEnabled ? 'text-emerald-400' : 'text-rose-400'} select-none" title="Click to toggle surprise boxes">${initialPowerupsEnabled ? 'Enabled' : 'Disabled'}</span>
          <label class="uiverse-white-elephant relative inline-flex items-center cursor-pointer select-none" data-testid="surprise-powerups-toggle" role="switch" aria-checked="${initialPowerupsEnabled}" aria-label="Enable surprise boxes" title="Toggle surprise boxes">
            <input type="checkbox" class="sr-only" ${initialPowerupsEnabled ? 'checked' : ''} />
            <div class="uiverse-elephant-track"></div>
          </label>
        `;

        const chk = rightCtrl.querySelector('input[type="checkbox"]');
        const toggleLabel = rightCtrl.querySelector('.uiverse-white-elephant');
        const valSpan = rightCtrl.querySelector('.ga-stepper-val');

        const updateElephantUI = (val) => {
          if (chk) chk.checked = val;
          if (toggleLabel) toggleLabel.setAttribute('aria-checked', String(val));
          if (valSpan) {
            valSpan.textContent = val ? 'Enabled' : 'Disabled';
            valSpan.className = `ga-stepper-val text-xs font-black tracking-wide ${val ? 'text-emerald-400' : 'text-rose-400'} select-none`;
          }
        };

        const handleToggle = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const cur = powerupStepper.getValue();
          powerupStepper.setValue(!cur.value);
        };

        rightCtrl.addEventListener('click', handleToggle);

        syncPowerupSwitch = (val) => {
          updateElephantUI(val);
        };
      }
      powerupStepper.element.dataset.testid = 'surprise-powerups-stepper';
      paramsSection.appendChild(powerupStepper.element);

      const coinIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>`;
      const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : 20;
      const rewardMax = (availableCredits === Infinity || !Number.isFinite(availableCredits)) ? 100 : Math.max(0, Math.floor(availableCredits / 5) * 5);
      const coinOptions = [{ value: 0, label: 'No coins' }];
      for (let c = 5; c <= Math.max(20, rewardMax); c += 5) {
        coinOptions.push({ value: c, label: `${c} coins` });
      }

      const rewardStepper = createCustomStepper({
        iconSvg: coinIcon,
        title: 'Winner reward coins',
        options: coinOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaRewardCoins = String(opt.value);
          window.pendingGameReward = opt.value;
          modal.querySelectorAll('.game-reward-option').forEach(btn => {
            const active = Number(btn.dataset.reward || 0) === opt.value;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-checked', String(active));
          });
        }
      });
      modal.dataset.gaRewardCoins = '0';
      window.pendingGameReward = 0;
      paramsSection.appendChild(rewardStepper.element);

      const timerIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
      const timerOptions = getStandardTimerOptions();

      const timerStepper = createCustomStepper({
        iconSvg: timerIcon,
        title: 'Timer',
        options: timerOptions,
        initialIndex: 0,
        onChange: (opt) => {
          modal.dataset.gaTimerSeconds = String(opt.seconds);
          window.pendingGameTimerSeconds = opt.seconds;
          modal.querySelectorAll('.game-timer-option').forEach(btn => {
            const active = Number(btn.dataset.seconds || 0) === opt.seconds;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
        }
      });
      modal.dataset.gaTimerSeconds = '0';
      window.pendingGameTimerSeconds = 0;
      paramsSection.appendChild(timerStepper.element);
    } else {
      gameSpecificControls.forEach(ctrl => {
        ctrl.classList.add('ga-round-setting', 'ga-game-specific-rule');
        paramsSection.appendChild(ctrl);
      });

      // Points to win (Top)
      if (hasPointsToWin) {
        const initialScore = Number(existingScoreInput?.value || 5) || 5;
        const pointsPanel = createQuickMousePanel({
          iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
          title: 'Points to win',
          value: Math.max(1, Math.min(20, initialScore)),
          min: 1,
          max: 20,
          step: 1,
          format: v => `${v} pts`,
          onChange: v => {
            if (existingScoreInput) {
              existingScoreInput.value = String(v);
              existingScoreInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            modal.dataset.gaWinningScore = String(v);
          }
        });
        if (existingScoreInput) {
          existingScoreInput.style.display = 'none';
          pointsPanel.element.appendChild(existingScoreInput);
        }
        modal.dataset.gaWinningScore = String(pointsPanel.getValue());
        paramsSection.appendChild(pointsPanel.element);
      }

      // Winner reward coins (Middle)
      const availableCredits = typeof getTeacherCredits === 'function' ? getTeacherCredits() : 20;
      const rewardMax = (availableCredits === Infinity || !Number.isFinite(availableCredits)) ? 100 : Math.max(0, Math.floor(availableCredits / 5) * 5);
      const rewardPanel = createQuickMousePanel({
        iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h6a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3h6"/></svg>',
        title: 'Winner reward coins',
        value: 0,
        min: 0,
        max: rewardMax,
        step: 5,
        format: v => v === 0 ? 'No coins' : `${v} coins`,
        onChange: v => {
          modal.dataset.gaRewardCoins = String(v);
          modal.querySelectorAll('.game-reward-option').forEach(btn => {
            const active = Number(btn.dataset.reward || 0) === v;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-checked', String(active));
          });
        }
      });
      modal.dataset.gaRewardCoins = '0';
      paramsSection.appendChild(rewardPanel.element);

      // Timer (Bottom)
      const timerPanel = createQuickMousePanel({
        iconSvg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
        title: 'Timer',
        value: 0,
        min: 0,
        max: 15,
        step: 1,
        format: v => v === 0 ? 'No timer' : `${v} min`,
        onChange: v => {
          const seconds = v * 60;
          modal.dataset.gaTimerSeconds = String(seconds);
          modal.querySelectorAll('.game-timer-option').forEach(btn => {
            const active = Number(btn.dataset.seconds || 0) === seconds;
            btn.classList.toggle('is-selected', active);
            btn.setAttribute('aria-pressed', String(active));
          });
        }
      });
      modal.dataset.gaTimerSeconds = '0';
      paramsSection.appendChild(timerPanel.element);
    }

    // Right column: Match Rules section + Visual Style horizontal filmstrip
    const matchRulesSection = document.createElement('div');
    matchRulesSection.className = 'flex flex-col gap-4';
    matchRulesSection.innerHTML = `<h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Match Rules</h3>`;
    matchRulesSection.appendChild(paramsSection);
    setupRight.appendChild(matchRulesSection);

    if (window.gaIsTeacherThemeEnabled()) {
      let currentThemeId = window.gaGetTheme();
      let currentThemeIndex = GAME_THEMES.findIndex(t => t.id === currentThemeId);
      if (currentThemeIndex === -1) currentThemeIndex = 0;
      currentThemeId = GAME_THEMES[currentThemeIndex].id;

      const themeSection = document.createElement('div');
      themeSection.className = 'ga-theme-picker flex flex-col gap-3';
      themeSection.setAttribute('aria-label', 'Visual style');
      themeSection.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Visual Style</h3>
            <span class="ga-theme-badge text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">${esc(GAME_THEMES[currentThemeIndex].name)} (${currentThemeIndex + 1}/${GAME_THEMES.length})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" class="ga-theme-prev p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="Previous theme" title="Previous theme">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button type="button" class="ga-theme-next p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" aria-label="Next theme" title="Next theme">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
        <div class="relative w-full group">
          <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none"></div>
          <div class="ga-theme-filmstrip flex gap-3 overflow-x-auto pb-3 pt-1 px-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none]" role="radiogroup" aria-label="Choose visual style">
            ${renderThemeFilmstripMarkup(currentThemeId)}
          </div>
        </div>
      `;

      const filmstrip = themeSection.querySelector('.ga-theme-filmstrip');
      const prevBtn = themeSection.querySelector('.ga-theme-prev');
      const nextBtn = themeSection.querySelector('.ga-theme-next');
      const badge = themeSection.querySelector('.ga-theme-badge');

      function syncTheme(index, scroll = true) {
        if (index < 0) index = 0;
        if (index >= GAME_THEMES.length) index = GAME_THEMES.length - 1;
        currentThemeIndex = index;
        const targetTheme = GAME_THEMES[currentThemeIndex];
        currentThemeId = targetTheme.id;
        window.gaSetTheme(currentThemeId);

        if (badge) badge.textContent = `${targetTheme.name} (${currentThemeIndex + 1}/${GAME_THEMES.length})`;
        if (prevBtn) prevBtn.disabled = currentThemeIndex === 0;
        if (nextBtn) nextBtn.disabled = currentThemeIndex === GAME_THEMES.length - 1;

        if (filmstrip) {
          filmstrip.innerHTML = renderThemeFilmstripMarkup(currentThemeId);
          if (scroll) {
            const activeCard = filmstrip.querySelector(`[data-ga-theme-choice="${currentThemeId}"]`);
            if (activeCard) {
              activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          }
        }
      }

      prevBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentThemeIndex > 0) syncTheme(currentThemeIndex - 1);
      });

      nextBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentThemeIndex < GAME_THEMES.length - 1) syncTheme(currentThemeIndex + 1);
      });

      // Mouse wheel support - spin like a wheel through themes
      let lastWheelTime = 0;
      filmstrip?.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastWheelTime < 160) return;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 5) return;
        lastWheelTime = now;
        if (delta > 0 && currentThemeIndex < GAME_THEMES.length - 1) {
          syncTheme(currentThemeIndex + 1);
        } else if (delta < 0 && currentThemeIndex > 0) {
          syncTheme(currentThemeIndex - 1);
        }
      }, { passive: false });

      filmstrip?.addEventListener('click', (e) => {
        const card = e.target.closest('[data-ga-theme-choice]');
        if (!card) return;
        const choiceId = card.dataset.gaThemeChoice;
        const newIdx = GAME_THEMES.findIndex(t => t.id === choiceId);
        if (newIdx !== -1) syncTheme(newIdx);
      });

      // Initial scroll to selected theme
      setTimeout(() => {
        const activeCard = filmstrip?.querySelector(`[data-ga-theme-choice="${currentThemeId}"]`);
        activeCard?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
        if (prevBtn) prevBtn.disabled = currentThemeIndex === 0;
        if (nextBtn) nextBtn.disabled = currentThemeIndex === GAME_THEMES.length - 1;
      }, 50);

      setupRight.appendChild(themeSection);
    }

    setupLayout.append(setupLeft, setupRight);

    const oldSettings = modal.querySelector('.game-settings-grid');
    if (oldSettings) oldSettings.remove();

    if (error && error.parentElement === root) {
      error.before(setupLayout);
    } else if (footer && footer.parentElement === root) {
      footer.before(setupLayout);
    } else {
      root.appendChild(setupLayout);
    }

    footer.className = 'ga-lobby-footer mt-6 flex justify-between items-center pt-6 border-t border-slate-800/80 w-full';
    if (cancel) {
      cancel.className = 'px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer';
      cancel.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg><span>Back</span>`;
      footer.prepend(cancel);
      cancel.addEventListener('click', () => { window.gaExitSetupToArcade?.(); });
    }
    if (next) {
      next.className = 'px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm transition flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer';
      next.innerHTML = `<span>START GAME</span><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }

    error?.setAttribute('role', 'alert');
    update();
  };

  window.gaCountdown = function (players, firstIndex, start, avatar) {
    const sfx = window.pokeSfx;
    const ov = document.createElement('div');
    ov.className = 'ga-countdown';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-live', 'assertive');
    const first = players[firstIndex];
    ov.innerHTML = `<div class="ga-cd-stage">
      <div class="ga-cd-players">${players.map((pl, i) => `<div class="ga-cd-player ${i === firstIndex ? 'is-first' : ''}" style="--i:${i}">${avatar(pl, 'ga-cd-avatar')}<span>${esc(pl.student_name)}</span></div>`).join('<b class="ga-cd-vs">VS</b>')}</div>
      <p class="ga-cd-first">${esc(first.student_name)} goes first!</p>
      <div class="ga-cd-num" aria-label="Countdown">3</div>
      <button type="button" class="ga-cd-skip">Skip</button></div>`;
    document.body.appendChild(ov);
    const num = ov.querySelector('.ga-cd-num');
    let n = 3, done = false;
    const finish = () => { if (done) return; done = true; clearInterval(t); ov.remove(); start(); };
    sfx?.play('vs');
    const t = setInterval(() => {
      n -= 1;
      if (n > 0) { num.textContent = n; sfx?.play('click'); }
      else if (n === 0) { num.textContent = 'GO!'; num.classList.add('is-go'); sfx?.play('fanfare'); }
      else finish();
      num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    }, 850);
    ov.querySelector('.ga-cd-skip').addEventListener('click', finish);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(finish, 900);
  };

  // Automatic cleanup observer: ensures .ga-continue-bar is immediately removed whenever leaving the games tab or opening modals
  if (typeof window !== 'undefined' && !window._gaContinueBarObserverInitialized) {
    window._gaContinueBarObserverInitialized = true;
    const pruneFloatingBars = () => {
      const bars = document.querySelectorAll('.ga-continue-bar');
      if (!bars.length) return;
      const teacherArea = document.getElementById('class-subtab-games');
      const studentArea = document.getElementById('student-tab-games');
      const viewStudents = document.getElementById('view-students');
      const isTeacherGamesVisible = Boolean(
        teacherArea &&
        !teacherArea.classList.contains('hidden') &&
        !teacherArea.hidden &&
        viewStudents &&
        !viewStudents.classList.contains('hidden') &&
        !viewStudents.hidden &&
        (teacherArea.offsetParent !== null || teacherArea.getClientRects().length > 0)
      );
      const isStudentGamesVisible = Boolean(
        studentArea &&
        !studentArea.classList.contains('hidden') &&
        !studentArea.hidden &&
        (studentArea.offsetParent !== null || studentArea.getClientRects().length > 0)
      );
      const isModalOpen = Boolean(
        document.querySelector(
          '.vocab-word-edit-card, ' +
          '.vocab-editor-overlay:not(.hidden), ' +
          '#edit-word-modal:not(.hidden)'
        )
      );
      if ((!isTeacherGamesVisible && !isStudentGamesVisible) || isModalOpen) {
        bars.forEach(el => el.remove());
      }
    };

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.body) {
      const observer = new MutationObserver(() => pruneFloatingBars());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden']
      });
    }

    document.addEventListener('click', (event) => {
      const target = event.target.closest('button, [role="tab"], a');
      if (!target) return;
      const isGamesBtn = target.matches('.student-dashboard-tab[data-tab="games"], .class-view-tab[data-classtab="games"]');
      const isNavigation = target.matches(
        '.student-dashboard-tab, .student-nav-group-button, .class-view-tab, .profile-tab-btn, .quiz-sub-tab, .admin-sub-tab, .users-subtab, .tab-btn, [role="tab"], [data-tab], [data-classtab]'
      );
      const isModalTrigger = target.matches('[data-edit-word], [data-delete-word], #open-create-vocab-list, .vocab-add-word-btn, .ts-btn');
      if ((isNavigation && !isGamesBtn) || isModalTrigger) {
        pruneFloatingBars();
      }
    }, true);
  }
})();
