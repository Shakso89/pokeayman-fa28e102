// Generate Android mipmap icons from the desktop PokéAyman icon
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const source = path.resolve(__dirname, '..', 'desktop/icon.png');
const resDir = path.resolve(__dirname, '..', 'android/app/src/main/res');

const sizes = {
  'mipmap-mdpi':    { launcher: 48,  foreground: 108 },
  'mipmap-hdpi':    { launcher: 72,  foreground: 162 },
  'mipmap-xhdpi':   { launcher: 96,  foreground: 216 },
  'mipmap-xxhdpi':  { launcher: 144, foreground: 324 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432 },
};

async function generate() {
  for (const [folder, dims] of Object.entries(sizes)) {
    const dir = path.join(resDir, folder);
    fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png - standard square icon
    await sharp(source)
      .resize(dims.launcher, dims.launcher, { fit: 'contain', background: { r: 10, g: 15, b: 29, alpha: 1 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png - same image, Android rounds it via mask
    await sharp(source)
      .resize(dims.launcher, dims.launcher, { fit: 'contain', background: { r: 10, g: 15, b: 29, alpha: 1 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png - adaptive icon foreground (larger canvas with padding)
    await sharp(source)
      .resize(Math.round(dims.foreground * 0.6), Math.round(dims.foreground * 0.6), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round(dims.foreground * 0.2),
        bottom: Math.round(dims.foreground * 0.2),
        left: Math.round(dims.foreground * 0.2),
        right: Math.round(dims.foreground * 0.2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(dims.foreground, dims.foreground)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${folder}: ${dims.launcher}px launcher, ${dims.foreground}px foreground`);
  }
  console.log('Done! All Android icons generated.');
}

generate().catch(err => { console.error(err); process.exit(1); });
