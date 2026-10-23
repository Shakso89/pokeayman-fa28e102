// Arcade games hub, lobby helpers and 3-2-1 countdown. Only presentation; game logic stays in index.html.
(function () {
  const GAMES = [
    { fn: 'chooseBaamboozlePowerUps', icon: '🎁', name: 'Surprise Boxes', desc: 'Open mystery boxes full of power-ups, traps and score swaps.', tags: ['1–4 players', 'Class favourite'], accent: 'pink', teacherOnly: true },
    { fn: 'chooseMatchWordCount', icon: '🎯', name: 'Match Words', desc: 'Race to match each word with its picture.', tags: ['1–4 players', 'Fast reflexes'], accent: 'red' },
    { fn: 'chooseMemoryDifficulty', icon: '🧠', name: 'Memory Flip', desc: 'Flip the tiles and find the matching pairs.', tags: ['1–4 players', 'Focus'], accent: 'violet' },
    { fn: 'chooseScrambleWordCount', icon: '🔤', name: 'Unscramble', desc: 'Put the mixed-up letters back in order.', tags: ['1–4 players', 'Spelling'], accent: 'blue' },
    { fn: 'chooseHangmanWordCount', icon: '🎮', name: 'Hangman', desc: 'Guess the secret word letter by letter.', tags: ['1–4 players', 'Classic'], accent: 'yellow' },
    { fn: 'chooseFindMeScore', icon: '🕵️', name: 'Find Me', desc: 'Spot the right word as fast as you can.', tags: ['1–4 players', 'Quick recall'], accent: 'mint' },
    { fn: 'startListenCatch', icon: '🔊', name: 'Listen and Catch', desc: 'Hear a word, catch the right answer, and fill your Catchdex.', tags: ['Solo', 'Listening'], accent: 'violet', proOnly: true },
    { fn: 'startVocabBattle', icon: '⚔️', name: 'Poké Battle', desc: 'Defeat a wild Pokémon and send its reward to your teacher for approval.', tags: ['Solo', 'Teacher-approved reward'], accent: 'red', proOnly: true },
  ];
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
        <rect width="200" height="200" rx="22" fill="url(#cb-cls-wood)"/>
        <rect x="8" y="8" width="184" height="184" rx="16" fill="url(#cb-cls-bg)" stroke="#5c3614" stroke-width="3"/>
        <rect x="15" y="15" width="170" height="170" rx="12" fill="none" stroke="#f3d078" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.75"/>
        <!-- Corner brass school brackets -->
        <path d="M12 30 L12 12 L30 12" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M170 12 L188 12 L188 30" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M12 170 L12 188 L30 188" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M170 188 L188 188 L188 170" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
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
        <path d="M52 126 C34 102 38 66 64 50" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
        <path d="M148 126 C166 102 162 66 136 50" fill="none" stroke="url(#cb-cls-gold)" stroke-width="4" stroke-linecap="round"/>
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
        <rect x="34" y="154" width="132" height="24" rx="8" fill="url(#cb-cls-gold)" stroke="#451a03" stroke-width="2.8"/>
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
      subtitle: 'Safari relic & carved wood',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-jgl-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a2216"/><stop offset="100%" stop-color="#183f2a"/>
          </linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-jgl-bg)"/>
        <polygon points="30,0 55,0 85,82 45,82" fill="#fde047" opacity="0.1"/>
        <path d="M0 0 Q34 18 18 48 L0 48 Z" fill="#1e5638"/><path d="M120 0 Q86 18 102 48 L120 48 Z" fill="#1e5638"/>
        <rect y="68" width="120" height="14" fill="#2c1808"/>
        <rect x="11" y="12" width="98" height="53" rx="5" fill="#143322" stroke="#d99b38" stroke-width="4"/>
        <g transform="translate(20, 21)">
          <rect width="23" height="24" rx="4" fill="#3b1f0b" stroke="#fbbf24" stroke-width="1.5"/>
          <circle cx="11.5" cy="12" r="7" fill="#fef3c7" stroke="#291507" stroke-width="1.4"/>
          <path d="M4.5 12 A7 7 0 0 1 18.5 12 Z" fill="#22c55e"/>
          <circle cx="11.5" cy="12" r="2.3" fill="#fbbf24"/>
        </g>
        <rect x="48.5" y="21" width="23" height="24" rx="4" fill="#dca052" stroke="#3b1f0b" stroke-width="1.8"/>
        <text x="60" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#291507">A</text>
        <rect x="77" y="21" width="23" height="24" rx="4" fill="#b87628" stroke="#3b1f0b" stroke-width="1.8"/>
        <text x="88.5" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#fef3c7">B</text>
        <rect x="24" y="50" width="72" height="8" rx="2.5" fill="#fdf3dc" stroke="#5c340e" stroke-width="1.2"/>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cb-jgl-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a250b"/>
            <stop offset="50%" stop-color="#2e1606"/>
            <stop offset="100%" stop-color="#1c0d03"/>
          </linearGradient>
          <linearGradient id="cb-jgl-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="45%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#92400e"/>
          </linearGradient>
          <radialGradient id="cb-jgl-core" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#1c0d03" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="22" fill="url(#cb-jgl-gold)"/>
        <rect x="7" y="7" width="186" height="186" rx="16" fill="url(#cb-jgl-wood)" stroke="#451a03" stroke-width="3"/>
        <rect x="14" y="14" width="172" height="172" rx="12" fill="url(#cb-jgl-core)" stroke="#d97706" stroke-width="2"/>
        <!-- Carved Wood Grain Planks -->
        <line x1="56" y1="14" x2="56" y2="186" stroke="#140902" stroke-width="2" opacity="0.55"/>
        <line x1="100" y1="14" x2="100" y2="186" stroke="#140902" stroke-width="2" opacity="0.55"/>
        <line x1="144" y1="14" x2="144" y2="186" stroke="#140902" stroke-width="2" opacity="0.55"/>
        <!-- Emerald Corner Gems -->
        <polygon points="26,18 36,26 26,34 18,26" fill="#10b981" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="174,18 182,26 174,34 164,26" fill="#10b981" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="26,166 36,174 26,182 18,174" fill="#10b981" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="174,166 182,174 174,182 164,174" fill="#10b981" stroke="#fef08a" stroke-width="1.8"/>
        <!-- Tropical Jungle Fronds behind Relic Emblem -->
        <path d="M100 94 Q42 52 24 68 Q38 104 100 94 Z" fill="#15803d" stroke="#052e16" stroke-width="2"/>
        <path d="M100 94 Q158 52 176 68 Q162 104 100 94 Z" fill="#15803d" stroke="#052e16" stroke-width="2"/>
        <path d="M100 94 Q48 134 28 122 Q46 92 100 94 Z" fill="#22c55e" stroke="#052e16" stroke-width="2"/>
        <path d="M100 94 Q152 134 172 122 Q154 92 100 94 Z" fill="#22c55e" stroke="#052e16" stroke-width="2"/>
        <path d="M100 94 Q74 30 100 22 Q126 30 100 94 Z" fill="#4ade80" stroke="#052e16" stroke-width="2"/>
        <!-- Golden Temple Halo Ring -->
        <circle cx="100" cy="92" r="50" fill="none" stroke="url(#cb-jgl-gold)" stroke-width="4" stroke-dasharray="10 5"/>
        <!-- Center Ancient Safari Relic Poké-Totem -->
        <circle cx="100" cy="92" r="40" fill="#fef3c7" stroke="#291507" stroke-width="4.5"/>
        <path d="M60 92 A40 40 0 0 1 140 92 Z" fill="#166534"/>
        <!-- Safari Camo Patches -->
        <path d="M74 66 Q88 58 96 70 Q84 78 74 66 Z" fill="#84cc16" opacity="0.85"/>
        <path d="M110 62 Q126 66 128 80 Q112 82 110 62 Z" fill="#eab308" opacity="0.85"/>
        <!-- Golden Equator Band & Glowing Jade Core -->
        <rect x="60" y="87" width="80" height="10" fill="url(#cb-jgl-gold)" stroke="#291507" stroke-width="2.5"/>
        <circle cx="100" cy="92" r="15" fill="url(#cb-jgl-gold)" stroke="#291507" stroke-width="4"/>
        <polygon points="100,81 111,92 100,103 89,92" fill="#10b981" stroke="#064e3b" stroke-width="2"/>
        <circle cx="100" cy="92" r="3.5" fill="#a7f3d0"/>
        <!-- Bottom Carved Temple Banner -->
        <rect x="34" y="152" width="132" height="24" rx="7" fill="url(#cb-jgl-gold)" stroke="#291507" stroke-width="2.8"/>
        <text x="100" y="168.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" letter-spacing="1.4" fill="#291507">SAFARI RELIC</text>
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
        <!-- Left & Right Ancient Carved Poké-Temple Columns -->
        <g opacity="0.88">
          <rect x="0" y="60" width="125" height="840" fill="#1e2d24" stroke="#0d1711" stroke-width="4"/>
          <rect x="18" y="120" width="88" height="110" rx="8" fill="#16231b" stroke="#eab308" stroke-width="2" stroke-opacity="0.45"/>
          <circle cx="62" cy="175" r="26" fill="none" stroke="#34d399" stroke-width="3" opacity="0.55"/>
          <line x1="36" y1="175" x2="88" y2="175" stroke="#34d399" stroke-width="3" opacity="0.55"/>
          <circle cx="62" cy="175" r="8" fill="#fbbf24" opacity="0.7"/>
          <rect x="18" y="270" width="88" height="110" rx="8" fill="#16231b" stroke="#eab308" stroke-width="2" stroke-opacity="0.35"/>
          <rect x="1315" y="60" width="125" height="840" fill="#1e2d24" stroke="#0d1711" stroke-width="4"/>
          <rect x="1334" y="120" width="88" height="110" rx="8" fill="#16231b" stroke="#eab308" stroke-width="2" stroke-opacity="0.45"/>
          <circle cx="1378" cy="175" r="26" fill="none" stroke="#34d399" stroke-width="3" opacity="0.55"/>
          <line x1="1352" y1="175" x2="1404" y2="175" stroke="#34d399" stroke-width="3" opacity="0.55"/>
          <circle cx="1378" cy="175" r="8" fill="#fbbf24" opacity="0.7"/>
        </g>
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
      subtitle: 'Poké Arcade & 3D blocks',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-toy-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#17143a"/><stop offset="100%" stop-color="#312e81"/>
          </linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-toy-bg)"/>
        <rect y="67" width="120" height="15" fill="#1e1b4b"/>
        <line x1="0" y1="67" x2="120" y2="67" stroke="#ec4899" stroke-width="1.5"/>
        <rect x="11" y="12" width="98" height="53" rx="6" fill="#eef2ff" stroke="#6366f1" stroke-width="4"/>
        <g transform="translate(20, 21)">
          <rect width="23" height="24" rx="4.5" fill="#312e81" stroke="#38bdf8" stroke-width="1.5"/>
          <circle cx="11.5" cy="12" r="7" fill="#fff" stroke="#1e1b4b" stroke-width="1.4"/>
          <path d="M4.5 12 A7 7 0 0 1 18.5 12 Z" fill="#38bdf8"/>
          <circle cx="11.5" cy="12" r="2.3" fill="#facc15"/>
        </g>
        <rect x="48.5" y="21" width="23" height="24" rx="4.5" fill="#fb7185" stroke="#9f1239" stroke-width="1.8"/>
        <text x="60" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#ffffff">A</text>
        <rect x="77" y="21" width="23" height="24" rx="4.5" fill="#facc15" stroke="#a16207" stroke-width="1.8"/>
        <text x="88.5" y="37.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" fill="#1e1b4b">B</text>
        <rect x="24" y="50" width="72" height="8" rx="3" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.2"/>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cb-toy-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="50%" stop-color="#312e81"/>
            <stop offset="100%" stop-color="#4c1d95"/>
          </linearGradient>
          <linearGradient id="cb-toy-frame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="50%" stop-color="#818cf8"/>
            <stop offset="100%" stop-color="#f472b6"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#cb-toy-frame)"/>
        <rect x="8" y="8" width="184" height="184" rx="18" fill="url(#cb-toy-bg)" stroke="#1e1b4b" stroke-width="3"/>
        <!-- Holographic Diagonal Sheen & Arcade Grid -->
        <polygon points="8,45 55,8 115,8 8,115" fill="#ffffff" opacity="0.08"/>
        <polygon points="8,140 140,8 175,8 8,175" fill="#38bdf8" opacity="0.07"/>
        <!-- Mini Arcade D-Pad (top-left) & A/B Buttons (top-right) -->
        <g transform="translate(24, 24)" fill="#facc15" stroke="#1e1b4b" stroke-width="2">
          <rect x="8" y="0" width="10" height="26" rx="2"/>
          <rect x="0" y="8" width="26" height="10" rx="2"/>
        </g>
        <g transform="translate(146, 24)">
          <circle cx="8" cy="18" r="7" fill="#fb7185" stroke="#1e1b4b" stroke-width="2"/>
          <circle cx="22" cy="8" r="7" fill="#34d399" stroke="#1e1b4b" stroke-width="2"/>
        </g>
        <!-- Glowing Neon Ring behind Capsule Ball -->
        <circle cx="100" cy="90" r="48" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="12 6" opacity="0.85"/>
        <circle cx="100" cy="90" r="54" fill="none" stroke="#f472b6" stroke-width="2" opacity="0.5"/>
        <!-- 3D Glossy Great-Arcade Capsule Ball -->
        <circle cx="100" cy="90" r="40" fill="#ffffff" stroke="#1e1b4b" stroke-width="4.5"/>
        <path d="M60 90 A40 40 0 0 1 140 90 Z" fill="#2563eb"/>
        <!-- Great Ball Red Stripes -->
        <path d="M68 68 L84 82" stroke="#f43f5e" stroke-width="7" stroke-linecap="round"/>
        <path d="M132 68 L116 82" stroke="#f43f5e" stroke-width="7" stroke-linecap="round"/>
        <!-- Specular Gloss Highlight -->
        <ellipse cx="86" cy="64" rx="12" ry="6" transform="rotate(-25 86 64)" fill="#ffffff" opacity="0.65"/>
        <rect x="60" y="85.5" width="80" height="9" fill="#1e1b4b"/>
        <circle cx="100" cy="90" r="14" fill="#ffffff" stroke="#1e1b4b" stroke-width="4.5"/>
        <polygon points="100,80 103,87 110,87 104.5,91.5 106.5,98.5 100,94 93.5,98.5 95.5,91.5 90,87 97,87" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <!-- Bottom Toybox Arcade Pill Badge -->
        <rect x="32" y="152" width="136" height="24" rx="12" fill="url(#cb-toy-frame)" stroke="#1e1b4b" stroke-width="2.8"/>
        <text x="100" y="168.5" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="900" font-size="13" letter-spacing="1.2" fill="#1e1b4b">POKÉ ARCADE</text>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ga-toy-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#120f2d"/>
            <stop offset="60%" stop-color="#221c5a"/>
            <stop offset="100%" stop-color="#16123d"/>
          </linearGradient>
          <radialGradient id="ga-toy-glow" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.34"/>
            <stop offset="60%" stop-color="#ec4899" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#120f2d" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ga-toy-bg)"/>
        <rect width="1440" height="900" fill="url(#ga-toy-glow)"/>
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
        <rect width="200" height="200" rx="24" fill="url(#cb-hlw-border)"/>
        <!-- Deep Midnight Velvet Core -->
        <rect x="8" y="8" width="184" height="184" rx="18" fill="url(#cb-hlw-bg)" stroke="#090312" stroke-width="3.5"/>
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
        <circle cx="100" cy="104" r="48" fill="url(#cb-hlw-bot)" stroke="#090312" stroke-width="5"/>
        <path d="M52 104 A48 48 0 0 1 148 104 Z" fill="url(#cb-hlw-top)" stroke="#090312" stroke-width="5"/>
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
        btn.setAttribute('aria-checked', String(active));
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
      return `<button type="button" class="ga-theme-card${active ? ' is-selected' : ''}" role="radio" aria-checked="${active}" data-ga-theme-choice="${esc(theme.id)}" title="${esc(theme.name)} — ${esc(theme.subtitle)}">
        <span class="ga-theme-thumb">${theme.thumbSvg}</span>
        <span class="ga-theme-meta">
          <strong class="ga-theme-name">${esc(theme.name)}</strong>
          <small class="ga-theme-sub">${esc(theme.subtitle)}</small>
        </span>
      </button>`;
    }).join('');
  }
  window.renderThemeCardsMarkup = renderThemeCardsMarkup;

  window.pendingChosenGame = null;
  window.arcadeOpen = true;

  window.gaBackToArcade = function () {
    window.arcadeOpen = true;
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaShowListSelection = function (game) {
    if (game) window.pendingChosenGame = game;
    window.arcadeOpen = false;
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
    if (typeof renderGamesList === 'function') renderGamesList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.gaLaunchChosenGame = function (g, list) {
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

  window.gaRenderHub = function (listLabel, isTeacher) {
    const cards = GAMES.filter(g => !(isTeacher ? g.studentOnly : g.teacherOnly)).map(g => {
      const locked = Boolean(g.proOnly && !window.canUseProGames?.());
      const isProListen = g.fn === 'startListenCatch';
      const isProBattle = g.fn === 'startVocabBattle';
      const proCardClass = isProListen ? ' ga-pro ga-pro-listen' : (isProBattle ? ' ga-pro ga-pro-battle' : (g.proOnly ? ' ga-pro' : ''));
      const playText = locked ? (isTeacher ? 'Upgrade to Pro' : 'Locked for class') : 'Choose ▶';
      return `
      <button type="button" class="ga-cart ga-${g.accent}${proCardClass}${locked ? ' ga-pro-locked' : ''}" onclick="${locked ? `window.requireProGame('${esc(g.name)}')` : `window.selectGameToPlay('${g.fn}')`}" aria-disabled="${locked}" aria-label="${locked ? `${g.name}, Pro access required` : `Choose ${g.name}`}" ${locked ? 'title="Pro access required"' : ''}>
        <span class="ga-cart-art" aria-hidden="true"><span>${g.icon}</span></span>
        <span class="ga-cart-body">
          <span class="ga-cart-name">${esc(g.name)}${g.proOnly ? '<span class="ga-pro-badge">👑 PRO</span>' : ''}</span>
          <span class="ga-cart-desc">${esc(g.desc)}</span>
          <span class="ga-cart-tags">${g.tags.map(t => `<span>${esc(t)}</span>`).join('')}</span>
        </span>
        <span class="ga-cart-play">${playText}</span>
      </button>`;
    }).join('');
    return `<section class="ga-hub" aria-label="Game arcade">
      <header class="ga-hub-head">
        <div>
          <span class="ga-hub-kicker">STEP 1</span>
          <h2 class="arena-title text-xl sm:text-2xl font-black text-white">Choose a Game to Play</h2>
          <p class="text-xs text-amber-200/80 mt-1">Select any game below, then pick the vocabulary lists for the game content.</p>
        </div>
      </header>
      <div class="ga-grid" role="group" aria-label="Choose a vocabulary game">${cards}</div>
    </section>`;
  };

  window.gaStudentSetup = function (listName, fnName) {
    const resolvedFnName = fnName || (window.pendingChosenGame ? window.pendingChosenGame.fn : '');
    const game = GAMES.find(item => item.fn === resolvedFnName && !item.teacherOnly);
    if (!game) return;
    if (resolvedFnName === 'startVocabBattle' || resolvedFnName === 'startListenCatch') {
      const area = document.getElementById('student-tab-games');
      if (!area) return;
      area.querySelectorAll(':scope > .game-inline-view').forEach(view => view.remove());
      const hub = area.querySelector(':scope > .glass-container');
      if (hub) hub.hidden = true;
      const selectedThemeId = window.gaGetTheme();
      const selectedTheme = GAME_THEMES.find(t => t.id === selectedThemeId) || GAME_THEMES[0];
      const panel = document.createElement('section');
      panel.className = 'game-inline-view ga-student-setup ga-hub';
      panel.setAttribute('aria-label', `${game.name} visual style and setup`);
      panel.innerHTML = `<header class="ga-hub-head"><h2>${game.icon} ${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header>
        <section class="ga-theme-picker ga-round-setting" aria-label="Visual style">
          <div class="ga-theme-picker-head">
            <h3>Visual style</h3>
            <span class="ga-theme-active-label" aria-live="polite">${esc(selectedTheme.name)} · ${esc(selectedTheme.subtitle)}</span>
          </div>
          <div class="ga-theme-grid" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(selectedTheme.id)}</div>
        </section>
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
          <button type="button" class="btn-primary ga-student-start-btn" style="padding: 0.75rem 1.75rem; font-size: 1rem; font-weight: 800;">Start ${esc(game.name)} →</button>
        </div>`;
      panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
      panel.addEventListener('click', event => {
        const card = event.target.closest('[data-ga-theme-choice]');
        if (card) {
          window.gaSetTheme(card.dataset.gaThemeChoice);
        }
      });
      panel.querySelector('.ga-student-start-btn').addEventListener('click', () => {
        panel.remove();
        if (resolvedFnName === 'startVocabBattle') window.startVocabBattle(listName);
        else window.startListenCatch(listName);
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
    panel.setAttribute('aria-label', `${game.name} word count`);
    panel.innerHTML = `<header class="ga-hub-head"><h2>${game.icon} ${esc(game.name)}</h2><button type="button" class="ga-change-lists" aria-label="Back to game arcade">←</button></header><div class="ga-student-counts" role="group" aria-label="Number of words">${[5, 10, 15].map(count => `<button type="button" class="btn-primary" data-count="${count}" ${words.length < count ? 'disabled' : ''}><strong>${count}</strong><span>words</span></button>`).join('')}</div>`;
    panel.querySelector('.ga-change-lists').addEventListener('click', () => { panel.remove(); if (hub) hub.hidden = false; });
    panel.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
      const count = Number(button.dataset.count);
      pendingGameTimerSeconds = 0;
      pendingGameReward = 0;
      activeGameReward = 0;
      resetGameTurnState();
      panel.remove();
      if (fnName === 'chooseMatchWordCount') openGameMatch(listName, count, 0);
      else if (fnName === 'chooseMemoryDifficulty') openGameMemory(listName, 'easy', 0, count);
      else if (fnName === 'chooseScrambleWordCount') { scrambleSession = null; openGameScramble(listName, count, 0); }
      else if (fnName === 'chooseFindMeScore') openGameFindMe(listName, count, 0);
      else if (fnName === 'chooseHangmanWordCount') openGameHangman(listName, count, 0, 'easy', true);
    }));
    area.appendChild(panel);
  };

  window.gaListStep = function (selector, container, count) {
    if (!selector || !container) return;
    const isArcade = Boolean(window.arcadeOpen);
    selector.hidden = isArcade;
    container.hidden = !isArcade;
    if (isArcade) return;

    selector.querySelectorAll('.ga-continue').forEach(el => el.remove());
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ga-continue';
    const gameName = window.pendingChosenGame ? window.pendingChosenGame.name : 'Game';
    next.disabled = !count;
    next.textContent = count ? `Next: Game Settings for ${gameName} ▶ (${count} list${count === 1 ? '' : 's'})` : `Choose a vocabulary list to play ${gameName} →`;
    next.addEventListener('click', () => {
      if (!selectedGameList.length) { toast('Please choose at least one vocabulary list'); return; }
      if (getGameWords(selectedGameList).length < 2) { toast('Choose lists with at least two words.'); return; }
      window.gaLaunchChosenGame(window.pendingChosenGame, selectedGameList);
    });
    selector.appendChild(next);
  };

  window.gaMountStage = function (view) {
    const board = view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters, .lc-main, .vb-arena, .cdx-main');
    if (!board || view.querySelector('#game-player-list') || (view.classList.contains('ga-stage') && view.querySelector('.ga-stage-controls'))) return;
    view.classList.add('ga-stage');
    view.classList.remove('fixed', 'inset-0', 'bg-black/50', 'bg-black/60', 'z-50', 'p-4');
    const shell = view.querySelector('.memory-game-shell, .cipher-lab-shell, .hangman-game-shell, .match-game-shell, .find-me-game-shell, .surprise-boxes-game, .lc-play, .vb-shell, .vb-arena, .cdx-shell') || (view.matches('.game-popup-modal') ? view.firstElementChild : view.firstElementChild);
    if (!shell) return;
    shell.classList.add('ga-stage-shell');
    let parent = shell.parentElement;
    while (parent && parent !== view) { parent.classList.add('ga-stage-wrapper'); parent = parent.parentElement; }
    const header = view.querySelector('.surprise-boxes-header, .memory-game-header, .cipher-lab-header, .hangman-game-shell > div:first-child, .lc-head, .vb-head, .cdx-head, .sticky.top-0') || shell.firstElementChild;
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
      const close = view.querySelector('#baam-close, #find-me-close, #game-close, #scramble-close, #hangman-close, [data-lc="close"], [data-vb="close"], [data-cdx="close"]') || document.createElement('button');
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
    document.querySelectorAll('body > .ga-stage').forEach(view => { if (!view.querySelector('#baam-board, #find-me-box, #words-grid, #match-board, #memory-grid, #scramble-tiles, #hangman-letters, .lc-main, .vb-arena, .cdx-main')) view.remove(); });
    if (!document.querySelector('.ga-stage') && document.body.classList.contains('ga-playing')) {
      document.body.classList.remove('ga-playing');
      delete document.body.dataset.gaActiveTheme;
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.querySelectorAll('#class-subtab-games > .glass-container, #student-tab-games > .glass-container').forEach(hub => { hub.hidden = false; });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (document.body) observeStages(); else document.addEventListener('DOMContentLoaded', observeStages, { once: true });

  window.gaEnhanceLobby = function (modal, fnName, refresh) {
    if (modal.classList.contains('ga-lobby')) return;
    const resolvedFnName = fnName || (window.pendingChosenGame ? window.pendingChosenGame.fn : '');
    const game = GAMES.find(g => g.fn === resolvedFnName);
    modal.classList.add('ga-lobby');
    const h2 = modal.querySelector('h2');
    if (h2 && game) h2.innerHTML = `<span class="ga-lobby-icon" aria-hidden="true">${game.icon}</span> ${esc(game.name)}`;
    const p = h2?.nextElementSibling;
    if (p && game) p.textContent = 'Round setup';
    const list = modal.querySelector('#game-player-list');
    if (!list) return;
    const checks = [...list.querySelectorAll('.game-player-check')];
    const root = list.parentElement;
    const next = modal.querySelector('#game-players-next');
    const cancel = modal.querySelector('#game-players-cancel');
    const error = modal.querySelector('#game-player-error');
    const requiresTwoPlayers = resolvedFnName === 'chooseBaamboozlePowerUps';
    const isSoloGame = resolvedFnName === 'startListenCatch' || resolvedFnName === 'startVocabBattle';
    const footer = next?.parentElement;
    if (!root || !footer) return;
    const players = document.createElement('section');
    players.className = 'ga-players-section';
    const bar = document.createElement('div');
    bar.className = 'ga-quick';
    if (isSoloGame) {
      bar.innerHTML = `<div class="ga-player-heading"><h3>Player</h3><span class="ga-player-count" aria-live="polite">0 / 1 selected</span></div>
        <div class="ga-pick-tools"><button type="button" data-q="random" aria-label="Pick random student" title="Pick random student">⤨ Random</button><button type="button" data-q="clear" aria-label="Clear player" title="Clear player">×</button></div>`;
    } else {
      bar.innerHTML = `<div class="ga-player-heading"><h3>Players</h3><span class="ga-player-count" aria-live="polite">0 / 4 selected</span></div>
        <div class="ga-pick-tools"><select aria-label="Random player count">${[1, 2, 3, 4].filter(n => n <= checks.length).map(n => `<option value="${n}" ${n === Math.min(2, checks.length) ? 'selected' : ''}>Random ${n}</option>`).join('')}</select><button type="button" data-q="random" aria-label="Pick random players" title="Pick random players">⤨</button><button type="button" data-q="clear" aria-label="Clear players" title="Clear players">×</button></div>`;
    }
    const update = () => {
      const count = checks.filter(c => c.checked).length;
      if (isSoloGame) {
        const sel = checks.find(c => c.checked);
        bar.querySelector('.ga-player-count').textContent = sel ? `1 / 1 selected · ${sel.value}` : `0 / 1 selected · ${checks.length} in class`;
        if (next) next.textContent = sel ? `Start game · ${sel.value} →` : 'Select a student to play →';
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
      bar.querySelector('.ga-player-count').textContent = `${count} / 4 selected · ${checks.length} in class`;
      if (next) next.textContent = count ? `Start game · ${count} player${count === 1 ? '' : 's'} →` : 'Start game →';
      if (requiresTwoPlayers) {
        const blocked = count < 2;
        if (next) {
          next.disabled = blocked;
          next.setAttribute('aria-disabled', String(blocked));
        }
        if (error) {
          error.textContent = blocked ? 'Surprise Boxes needs at least 2 students to start.' : '';
          error.classList.toggle('hidden', !blocked);
        }
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
      const shuffled = [...checks];
      for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      if (isSoloGame) {
        set(q === 'random' && shuffled[0] ? [shuffled[0]] : []);
      } else {
        set(q === 'random' ? shuffled.slice(0, Number(bar.querySelector('select')?.value || 1)) : []);
      }
    });
    list.before(players);
    players.append(bar, list);
    checks.forEach(c => c.addEventListener('change', update));
    const settings = modal.querySelector('.game-settings-grid');
    const options = document.createElement('details');
    options.className = 'ga-round-options';
    options.innerHTML = '<summary><span>Timer & rewards</span><span class="ga-options-summary"></span></summary><div class="ga-options-body"></div>';
    if (settings) {
      settings.classList.add('ga-core-settings');
      settings.querySelectorAll('.game-setting-control').forEach(control => {
        if (!control.querySelector('#shared-winning-score')) options.querySelector('.ga-options-body').appendChild(control);
      });
      if (!settings.children.length) settings.remove();
    }
    // Card count and timer are separate segmented controls, never competing selections.
    modal.querySelectorAll('.shared-baam-count').forEach(button => button.classList.remove('game-timer-option'));
    [...root.children].forEach(el => {
      if (el.querySelector('.memory-level-option, .match-word-count-option, .shared-baam-count') || el === settings) el.classList.add('ga-round-setting');
    });
    if (window.gaIsTeacherThemeEnabled()) {
      const selectedThemeId = window.gaGetTheme();
      const selectedTheme = GAME_THEMES.find(t => t.id === selectedThemeId) || GAME_THEMES[0];
      const themeSection = document.createElement('section');
      themeSection.className = 'ga-theme-picker ga-round-setting';
      themeSection.setAttribute('aria-label', 'Visual style');
      themeSection.innerHTML = `<div class="ga-theme-picker-head">
        <h3>Visual style</h3>
        <span class="ga-theme-active-label" aria-live="polite">${esc(selectedTheme.name)} · ${esc(selectedTheme.subtitle)}</span>
      </div>
      <div class="ga-theme-grid" role="radiogroup" aria-label="Choose visual style">${renderThemeCardsMarkup(selectedTheme.id)}</div>`;
      themeSection.addEventListener('click', event => {
        const card = event.target.closest('[data-ga-theme-choice]');
        if (!card) return;
        window.gaSetTheme(card.dataset.gaThemeChoice);
      });
      footer.before(themeSection);
    }
    if (options.querySelector('.ga-options-body').children.length) footer.before(options);
    const updateOptions = () => {
      const seconds = Number(modal.querySelector('.game-timer-option.is-selected')?.dataset.seconds || 0);
      const reward = Number(modal.querySelector('.game-reward-option.is-selected')?.dataset.reward || 0);
      options.querySelector('.ga-options-summary').textContent = `${seconds ? `${seconds / 60} min` : 'No timer'} · ${reward ? `${reward} coins` : 'No reward'}`;
    };
    modal.addEventListener('click', () => queueMicrotask(updateOptions));
    updateOptions();
    footer.classList.add('ga-lobby-footer');
    if (cancel) {
      cancel.textContent = '← Games';
      footer.prepend(cancel);
      cancel.addEventListener('click', () => { window.gaBackToArcade?.(); });
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
})();
