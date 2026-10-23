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
      subtitle: 'Friendly pumpkins & ghosts',
      thumbSvg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="th-hlw-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5b3aa8"/><stop offset="70%" stop-color="#9a4f9c"/><stop offset="100%" stop-color="#e2768a"/></linearGradient>
          <linearGradient id="th-hlw-pump" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdba74"/><stop offset="60%" stop-color="#fb923c"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
        </defs>
        <rect width="120" height="82" fill="url(#th-hlw-bg)"/>
        <rect x="4" y="4" width="112" height="74" rx="9" fill="none" stroke="#fde68a" stroke-width="2.5"/>
        <circle cx="96" cy="20" r="10" fill="#fde68a"/><circle cx="92" cy="17" r="2" fill="#fbbf24" opacity=".6"/>
        <g fill="#fff7d6"><circle cx="18" cy="16" r="1.4"/><circle cx="34" cy="10" r="1"/><circle cx="62" cy="14" r="1.3"/><circle cx="76" cy="26" r="1"/></g>
        <path d="M0 66 Q30 58 60 63 Q92 57 120 63 L120 82 L0 82 Z" fill="#4c2a7a"/>
        <g transform="translate(42 56)">
          <ellipse cx="0" cy="0" rx="17" ry="14" fill="url(#th-hlw-pump)" stroke="#3b1d5e" stroke-width="2"/>
          <path d="M-7 -13 C-9 -3 -9 6 -6 13 M7 -13 C9 -3 9 6 6 13" stroke="#ea580c" stroke-width="1.4" fill="none"/>
          <path d="M0 -14 C1 -19 5 -20 8 -18" stroke="#65a30d" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <circle cx="-6" cy="-2" r="2.4" fill="#3b1d5e"/><circle cx="6" cy="-2" r="2.4" fill="#3b1d5e"/>
          <circle cx="-5.3" cy="-2.8" r=".8" fill="#fff"/><circle cx="6.7" cy="-2.8" r=".8" fill="#fff"/>
          <path d="M-6 4 Q0 9 6 4" stroke="#3b1d5e" stroke-width="2" fill="none" stroke-linecap="round"/>
          <ellipse cx="-11" cy="3" rx="3" ry="1.8" fill="#f9a8d4" opacity=".7"/><ellipse cx="11" cy="3" rx="3" ry="1.8" fill="#f9a8d4" opacity=".7"/>
        </g>
        <g transform="translate(78 46)">
          <path d="M-11 14 L-11 0 C-11 -9 11 -9 11 0 L11 14 L7 11 L3 14 L-1 11 L-5 14 L-8 11 Z" fill="#ffffff" stroke="#3b1d5e" stroke-width="1.8"/>
          <circle cx="-4" cy="0" r="1.8" fill="#3b1d5e"/><circle cx="4" cy="0" r="1.8" fill="#3b1d5e"/>
          <path d="M-2 4 Q0 6 2 4" stroke="#3b1d5e" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        </g>
        <g transform="translate(100 66)">
          <circle r="7" fill="#fff" stroke="#3b1d5e" stroke-width="1.6"/><path d="M-7 0 A7 7 0 0 1 7 0 Z" fill="#a855f7"/>
          <rect x="-7" y="-1" width="14" height="2" fill="#3b1d5e"/><circle r="2.2" fill="#fff" stroke="#3b1d5e" stroke-width="1.2"/>
        </g>
      </svg>`,
      cardBackSvg: `<svg class="ga-card-back-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="cb-hlw-glow" cx="50%" cy="52%" r="52%">
            <stop offset="0%" stop-color="#fb923c" stop-opacity="0.5"/>
            <stop offset="60%" stop-color="#7c3aed" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#150826" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="cb-hlw-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fb923c"/><stop offset="55%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/>
          </linearGradient>
          <linearGradient id="cb-hlw-pump" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stop-color="#fdba74"/><stop offset="45%" stop-color="#fb923c"/><stop offset="100%" stop-color="#ea580c"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="26" fill="url(#cb-hlw-frame)"/>
        <rect x="8" y="8" width="184" height="184" rx="20" fill="#150826" stroke="#0b0512" stroke-width="3"/>
        <rect x="16" y="16" width="168" height="168" rx="14" fill="none" stroke="#f97316" stroke-width="1.4" opacity="0.55"/>
        <rect x="8" y="8" width="184" height="184" rx="20" fill="url(#cb-hlw-glow)"/>
        <g stroke="#fdf6e8" stroke-width="1.3" stroke-opacity="0.4" fill="none">
          <path d="M18 18 L64 18 M18 18 L18 64 M18 18 L50 50"/>
          <path d="M28 18 Q42 38 18 50 M46 18 Q58 34 26 58"/>
          <path d="M182 182 L136 182 M182 182 L182 136 M182 182 L150 150"/>
          <path d="M172 182 Q158 162 182 150 M154 182 Q142 166 174 142"/>
        </g>
        <g fill="#0d0619">
          <path d="M52 42 L62 37 L60 43 L70 41 L62 50 L50 49 Z"/>
          <path d="M148 46 L156 42 L154 47 L163 45 L157 52 L146 51 Z" transform="scale(0.9) translate(16,2)"/>
        </g>
        <circle cx="100" cy="104" r="62" fill="#f97316" opacity="0.1"/>
        <g transform="translate(100, 108)">
          <ellipse cx="0" cy="8" rx="54" ry="45" fill="url(#cb-hlw-pump)" stroke="#14081f" stroke-width="4"/>
          <path d="M-31 -26 C -39 0 -39 34 -27 48" stroke="#c2410c" stroke-width="3" fill="none" opacity="0.6"/>
          <path d="M31 -26 C 39 0 39 34 27 48" stroke="#c2410c" stroke-width="3" fill="none" opacity="0.6"/>
          <path d="M-12 -32 C -10 0 -10 34 -6 51" stroke="#c2410c" stroke-width="2.4" fill="none" opacity="0.45"/>
          <path d="M12 -32 C 10 0 10 34 6 51" stroke="#c2410c" stroke-width="2.4" fill="none" opacity="0.45"/>
          <path d="M0 -38 C 2 -50 11 -55 20 -51" stroke="#4d7c0f" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M-2 -37 C 3 -49 12 -54 21 -50" stroke="#65a30d" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>
          <ellipse cx="-18" cy="-8" rx="17" ry="11" fill="#fffdf5" opacity="0.24" transform="rotate(-18 -18 -8)"/>
          <path d="M-24 -12 L-8 2 L-26 5 Z" fill="#14081f"/>
          <path d="M24 -12 L8 2 L26 5 Z" fill="#14081f"/>
          <path d="M-26 -11 L-10 1 L-24 3 Z" fill="#fde68a" opacity="0.9" transform="translate(1,1) scale(0.82)"/>
          <path d="M26 -11 L10 1 L24 3 Z" fill="#fde68a" opacity="0.9" transform="translate(-1,1) scale(0.82)"/>
          <polygon points="0,-6 -7,7 7,7" fill="#14081f"/>
          <path d="M-30 16 L-18 8 L-9 18 L0 8 L9 18 L18 8 L30 16 L23 30 L-23 30 Z" fill="#14081f"/>
          <path d="M-20 20 L-14 15 L-8 21 L0 15 L8 21 L14 15 L20 20 L16 26 L-16 26 Z" fill="#fde68a" opacity="0.85"/>
        </g>
      </svg>`,
      backdropSvg: `<svg class="ga-theme-backdrop-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="bg-hlw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2b1a5c"/>
            <stop offset="45%" stop-color="#4a2a86"/>
            <stop offset="78%" stop-color="#7a3f8f"/>
            <stop offset="100%" stop-color="#c2547a"/>
          </linearGradient>
          <radialGradient id="bg-hlw-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.16"/>
            <stop offset="55%" stop-color="#ea580c" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#08040f" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="bg-hlw-moon" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fffdf5"/>
            <stop offset="52%" stop-color="#fde68a"/>
            <stop offset="86%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </radialGradient>
          <linearGradient id="bg-hlw-pump" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stop-color="#fdba74"/>
            <stop offset="45%" stop-color="#fb923c"/>
            <stop offset="100%" stop-color="#e2580c"/>
          </linearGradient>
          <linearGradient id="bg-hlw-ghost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffdf7"/>
            <stop offset="70%" stop-color="#f4ebdc"/>
            <stop offset="100%" stop-color="#ddd0b9"/>
          </linearGradient>
          <g id="bg-hlw-bat">
            <path d="M0 -5 C -5 -11 -14 -13 -21 -10 L -14 -4 L -23 -2 L -12 4 L -19 10 L -7 8 L 0 14 L 7 8 L 19 10 L 12 4 L 23 -2 L 14 -4 L 21 -10 C 14 -13 5 -11 0 -5 Z"/>
            <path d="M-4 -6 L-6 -13 L-1 -8 Z M4 -6 L6 -13 L1 -8 Z"/>
          </g>
          <g id="bg-hlw-ghostart">
            <path d="M0 -46 C -24 -46 -34 -26 -34 -8 L -34 30 C -27 24 -22 34 -15 29 C -8 24 -4 34 0 29 C 4 34 8 24 15 29 C 22 34 27 24 34 30 L 34 -8 C 34 -26 24 -46 0 -46 Z" fill="url(#bg-hlw-ghost)" stroke="#14081f" stroke-width="3.4"/>
            <ellipse cx="-11" cy="-14" rx="5.4" ry="8" fill="#14081f"/>
            <ellipse cx="11" cy="-14" rx="5.4" ry="8" fill="#14081f"/>
            <circle cx="-3" cy="-12" r="1.7" fill="#fffdf7"/><circle cx="19" cy="-12" r="1.7" fill="#fffdf7"/>
            <ellipse cx="-19" cy="-2" rx="6" ry="3.4" fill="#f9a8d4" opacity="0.5"/>
            <ellipse cx="19" cy="-2" rx="6" ry="3.4" fill="#f9a8d4" opacity="0.5"/>
            <path d="M-5 0 Q0 5 5 0" stroke="#14081f" stroke-width="2.8" fill="none" stroke-linecap="round"/>
          </g>
          <g id="bg-hlw-pumpart">
            <ellipse cx="0" cy="6" rx="50" ry="43" fill="url(#bg-hlw-pump)" stroke="#14081f" stroke-width="4"/>
            <path d="M-28 -30 C -36 -4 -36 32 -25 46" stroke="#c2410c" stroke-width="3" fill="none" opacity="0.55"/>
            <path d="M28 -30 C 36 -4 36 32 25 46" stroke="#c2410c" stroke-width="3" fill="none" opacity="0.55"/>
            <path d="M-11 -36 C -9 -4 -9 32 -5 48" stroke="#c2410c" stroke-width="2.4" fill="none" opacity="0.4"/>
            <path d="M11 -36 C 9 -4 9 32 5 48" stroke="#c2410c" stroke-width="2.4" fill="none" opacity="0.4"/>
            <path d="M0 -40 C 2 -52 11 -57 20 -53" stroke="#4d7c0f" stroke-width="7" fill="none" stroke-linecap="round"/>
            <ellipse cx="-17" cy="-9" rx="16" ry="10" fill="#fffdf5" opacity="0.26" transform="rotate(-18 -17 -9)"/>
            <path d="M-22 -11 L-7 2 L-24 5 Z" fill="#14081f"/>
            <path d="M22 -11 L7 2 L24 5 Z" fill="#14081f"/>
            <polygon points="0,-5 -7,7 7,7" fill="#14081f"/>
            <path d="M-27 15 L-16 8 L-8 18 L0 8 L8 18 L16 8 L27 15 L21 28 L-21 28 Z" fill="#14081f"/>
          </g>
        </defs>

        <rect width="1440" height="900" fill="url(#bg-hlw-sky)"/>
        <ellipse cx="1140" cy="220" rx="430" ry="330" fill="url(#bg-hlw-glow)"/>
        <ellipse cx="260" cy="720" rx="300" ry="220" fill="url(#bg-hlw-glow)" opacity="0.35"/>

        <g class="hlw-stars" fill="#fdf6e8">
          <circle cx="180" cy="110" r="1.8" opacity="0.5"/><circle cx="340" cy="70" r="1.4" opacity="0.35"/>
          <circle cx="470" cy="150" r="2" opacity="0.4"/><circle cx="620" cy="60" r="1.3" opacity="0.3"/>
          <circle cx="760" cy="130" r="1.7" opacity="0.45"/><circle cx="880" cy="80" r="1.4" opacity="0.32"/>
          <circle cx="1010" cy="60" r="1.8" opacity="0.4"/><circle cx="1290" cy="90" r="1.5" opacity="0.35"/>
          <circle cx="1360" cy="230" r="1.7" opacity="0.4"/><circle cx="1180" cy="380" r="1.4" opacity="0.3"/>
          <circle cx="700" cy="300" r="1.6" opacity="0.35"/><circle cx="520" cy="420" r="1.3" opacity="0.25"/>
          <circle cx="960" cy="420" r="1.5" opacity="0.25"/><circle cx="240" cy="520" r="1.4" opacity="0.22"/>
        </g>

        <!-- golden moon -->
        <circle class="hlw-moon-glow" cx="1076" cy="198" r="158" fill="#fbbf24" opacity="0.1"/>
        <circle cx="1076" cy="198" r="96" fill="url(#bg-hlw-moon)"/>
        <g fill="#f59e0b" opacity="0.15">
          <circle cx="1044" cy="166" r="13"/><circle cx="1108" cy="206" r="19"/>
          <circle cx="1052" cy="232" r="10"/><circle cx="1116" cy="158" r="7"/>
        </g>
        <!-- bats -->
        <g fill="#0d0619">
          <g class="hlw-bat hlw-bat--1" transform="translate(930 126) scale(0.95)"><g class="hlw-bat-drift"><use class="hlw-bat-flap" href="#bg-hlw-bat"/></g></g>
          <g class="hlw-bat hlw-bat--2" transform="translate(1246 306) scale(0.72)"><g class="hlw-bat-drift"><use class="hlw-bat-flap" href="#bg-hlw-bat"/></g></g>
          <g class="hlw-bat hlw-bat--3" transform="translate(1180 108) scale(0.5)"><g class="hlw-bat-drift"><use class="hlw-bat-flap" href="#bg-hlw-bat"/></g></g>
          <g class="hlw-bat hlw-bat--4" transform="translate(288 210) scale(0.62)"><g class="hlw-bat-drift"><use class="hlw-bat-flap" href="#bg-hlw-bat"/></g></g>
          <g class="hlw-bat hlw-bat--5" transform="translate(200 156) scale(0.42)"><g class="hlw-bat-drift"><use class="hlw-bat-flap" href="#bg-hlw-bat"/></g></g>
        </g>

        <!-- ground -->
        <path d="M0 758 Q 240 726 480 746 Q 760 774 1020 744 Q 1240 720 1440 750 L 1440 900 L 0 900 Z" fill="#3b1f5e"/>
        <path d="M0 826 Q 300 798 620 818 Q 980 844 1440 810 L 1440 900 L 0 900 Z" fill="#2a1546"/>

        <!-- ghosts: trio peeking over the hillside, plus one floating right -->
        <g class="hlw-ghost-slot hlw-ghost--1" transform="translate(392 716) scale(0.62)"><g class="hlw-ghost"><use href="#bg-hlw-ghostart"/></g></g>
        <g class="hlw-ghost-slot hlw-ghost--2" transform="translate(470 700) scale(0.78)"><g class="hlw-ghost"><use href="#bg-hlw-ghostart"/></g></g>
        <g class="hlw-ghost-slot hlw-ghost--3" transform="translate(556 720) scale(0.58)"><g class="hlw-ghost"><use href="#bg-hlw-ghostart"/></g></g>
        <g class="hlw-ghost-slot hlw-ghost--4" transform="translate(1244 500) scale(0.72) rotate(6)"><g class="hlw-ghost"><use href="#bg-hlw-ghostart"/></g></g>

        <!-- lantern branch on the left edge -->
        <g>
          <path d="M-20 336 Q 92 356 196 402 Q 236 420 258 444" stroke="#07020e" stroke-width="11" fill="none" stroke-linecap="round"/>
          <path d="M140 376 Q 152 344 146 318 M206 404 Q 224 380 226 356" stroke="#07020e" stroke-width="6" fill="none" stroke-linecap="round"/>
          <g stroke="#fdf6e8" stroke-opacity="0.35" stroke-width="1.6">
            <path d="M196 402 L196 452"/>
            <path d="M258 444 L258 490"/>
            <path d="M146 318 L146 366"/>
          </g>
          <g class="hlw-lantern-slot hlw-lantern--1" transform="translate(196 476) scale(0.52)">
            <use href="#bg-hlw-pumpart"/>
          </g>
          <g class="hlw-lantern-slot hlw-lantern--2" transform="translate(258 514) scale(0.44)">
            <use href="#bg-hlw-pumpart"/>
          </g>
          <g class="hlw-lantern-slot hlw-lantern--3" transform="translate(146 390) scale(0.38)">
            <use href="#bg-hlw-pumpart"/>
          </g>
        </g>

        <!-- glossy pumpkin totem, bottom-right -->
        <g class="hlw-totem" transform="translate(1204 762) scale(0.92)">
          <ellipse cx="0" cy="34" rx="80" ry="16" fill="#04010a" opacity="0.6"/>
          <use href="#bg-hlw-pumpart" transform="scale(1.02)"/>
          <use href="#bg-hlw-pumpart" transform="translate(4 -52) scale(0.82)"/>
          <use href="#bg-hlw-pumpart" transform="translate(-2 -92) scale(0.62)"/>
        </g>
        <g transform="translate(1052 828) scale(0.66)">
          <use href="#bg-hlw-pumpart"/>
        </g>

        <!-- candy corn trio -->
        <g transform="translate(872 828) scale(1.45)">
          <polygon points="0,-14 12,14 -12,14" fill="#fbbf24" stroke="#14081f" stroke-width="2.2"/>
          <polygon points="0,-14 6,1 -6,1" fill="#fdf6e8" stroke="#14081f" stroke-width="1.5"/>
          <polygon points="-6,1 6,1 12,14 -12,14" fill="#f97316" stroke="#14081f" stroke-width="2.2"/>
        </g>
        <g transform="translate(936 840) scale(1.15)">
          <polygon points="0,-14 12,14 -12,14" fill="#fbbf24" stroke="#14081f" stroke-width="2.6"/>
          <polygon points="0,-14 6,1 -6,1" fill="#fdf6e8" stroke="#14081f" stroke-width="1.8"/>
        </g>
        <g transform="translate(824 846) scale(0.95)">
          <polygon points="0,-14 12,14 -12,14" fill="#f97316" stroke="#14081f" stroke-width="3"/>
        </g>

        <!-- grass tufts -->
        <g stroke="#0a0413" stroke-width="4" fill="none" stroke-linecap="round">
          <path d="M600 830 L594 806 M606 830 L612 804 M612 832 L622 814"/>
          <path d="M980 826 L972 804 M988 826 L996 802"/>
          <path d="M340 812 L332 792 M348 812 L354 790"/>
          <path d="M1290 838 L1282 816 M1298 838 L1304 814"/>
        </g>
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
    if (memoryGrid && !memoryGrid._gaCardBackObserved) {
      memoryGrid._gaCardBackObserved = true;
      new MutationObserver(syncMemoryCardBacks).observe(memoryGrid, { childList: true });
    }
    target.querySelectorAll('[data-ga-theme-choice]').forEach(btn => {
      const active = btn.dataset.gaThemeChoice === theme.id;
      btn.classList.toggle('is-selected', active);
      btn.setAttribute('aria-checked', String(active));
    });
    const btnLabel = target.querySelector('.ga-stage-theme-current');
    if (btnLabel) btnLabel.textContent = theme.name;
    // No synthetic window resize here: it re-ran every game's layout code and caused theme-switch lag.
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
    const shell = view.querySelector('.memory-game-shell, .cipher-lab-shell, .hangman-game-shell, .lc-play, .vb-shell, .vb-arena, .cdx-shell') || (view.matches('.game-popup-modal') ? view.firstElementChild : view.firstElementChild);
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
