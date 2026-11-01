import sharp from 'sharp';
import fs from 'node:fs/promises';

async function processSurpriseBoxes() {
  const width = 1024, height = 1024, cx = 512, cy = 512, r = 455;

  // 1. Create a circular mask for the inner medallion
  const circleMaskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" />
    </svg>
  `);

  // Mask the original image to only the circular medallion
  const circleImage = await sharp('public/pokeayman/assets/games/surprise-boxes.jpg')
    .composite([{ input: circleMaskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Cosmic starry twilight background
  const bgSvg = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2e1065" />
          <stop offset="45%" stop-color="#1e1b4b" />
          <stop offset="80%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Outer ambient glow around the medal -->
      <circle cx="${cx}" cy="${cy}" r="460" fill="none" stroke="#ec4899" stroke-width="14" opacity="0.35" filter="url(#glow)" />
      <circle cx="${cx}" cy="${cy}" r="456" fill="none" stroke="#facc15" stroke-width="3" opacity="0.75" />

      <!-- Stardust particles in corners -->
      <circle cx="140" cy="150" r="3" fill="#fde047" opacity="0.8" filter="url(#glow)"/>
      <circle cx="880" cy="160" r="3.5" fill="#38bdf8" opacity="0.8" filter="url(#glow)"/>
      <circle cx="130" cy="870" r="4" fill="#f472b6" opacity="0.75" filter="url(#glow)"/>
      <circle cx="890" cy="860" r="3" fill="#fde047" opacity="0.8" filter="url(#glow)"/>
      <circle cx="210" cy="110" r="2" fill="#fff" opacity="0.6"/>
      <circle cx="810" cy="110" r="2" fill="#fff" opacity="0.6"/>
    </svg>
  `);

  // 3. Ornate golden ribbon banner with "SURPRISE BOXES" text
  const textBannerSvg = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bannerDropShadow">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.9" />
        </filter>
        <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#9333ea" />
          <stop offset="35%" stop-color="#6b21a8" />
          <stop offset="100%" stop-color="#3b0764" />
        </linearGradient>
        <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
        <linearGradient id="textFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="25%" stop-color="#fef08a" />
          <stop offset="65%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>

      <g filter="url(#bannerDropShadow)">
        <!-- Ribbon body -->
        <path d="M 140,845 Q 512,915 884,845 L 896,930 Q 512,1005 128,930 Z"
              fill="url(#ribbonGrad)"
              stroke="url(#goldRim)"
              stroke-width="7"
              stroke-linejoin="round" />

        <!-- Inner golden pinstripe -->
        <path d="M 154,858 Q 512,925 870,858 L 880,918 Q 512,990 144,918 Z"
              fill="none"
              stroke="#fde047"
              stroke-width="2.5"
              opacity="0.75" />

        <!-- Swallowtail ends -->
        <polygon points="105,885 142,845 142,935 105,935" fill="#2e0854" stroke="url(#goldRim)" stroke-width="4" />
        <polygon points="919,885 882,845 882,935 919,935" fill="#2e0854" stroke="url(#goldRim)" stroke-width="4" />

        <!-- Decorative sparkle stars on corners -->
        <text x="180" y="915" font-size="36" fill="#fde047" text-anchor="middle" font-weight="900">✦</text>
        <text x="844" y="915" font-size="36" fill="#fde047" text-anchor="middle" font-weight="900">✦</text>

        <!-- Bold 3D Text: SURPRISE BOXES -->
        <!-- Deep Black Outline -->
        <text x="512" y="918" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="62" letter-spacing="4" fill="#090d16" stroke="#090d16" stroke-width="16" stroke-linejoin="round" text-anchor="middle">
          SURPRISE BOXES
        </text>
        <!-- Blue Outline -->
        <text x="512" y="918" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="62" letter-spacing="4" fill="#3b0764" stroke="#4338ca" stroke-width="8" stroke-linejoin="round" text-anchor="middle">
          SURPRISE BOXES
        </text>
        <!-- Metallic Gradient Fill -->
        <text x="512" y="918" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="62" letter-spacing="4" fill="url(#textFill)" text-anchor="middle">
          SURPRISE BOXES
        </text>
      </g>
    </svg>
  `);

  // Composite: Background -> Masked Circle Art -> Banner Plaque
  const finalBuffer = await sharp(bgSvg)
    .composite([
      { input: circleImage, top: 0, left: 0 },
      { input: textBannerSvg, top: 0, left: 0 }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  await fs.writeFile('public/pokeayman/assets/games/surprise-boxes.jpg', finalBuffer);

  console.log('Successfully composited surprise-boxes.jpg');
}

processSurpriseBoxes().catch(err => {
  console.error(err);
  process.exit(1);
});
