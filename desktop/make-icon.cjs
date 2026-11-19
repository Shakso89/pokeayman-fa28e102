const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, '../public/favicon.png');
const dest = path.join(__dirname, 'icon.png');

sharp(src)
  .resize(512, 512, { kernel: 'lanczos3' })
  .toFile(dest)
  .then(() => {
    console.log('512x512 icon generated at:', dest);
  })
  .catch((err) => {
    console.error('Error creating icon:', err);
    process.exit(1);
  });
