// scripts/optimize-pexels.mjs
//
// One-shot optimizer for the Pexels background image. Reads
// /public/pexels.jpg (6000x4000) and emits responsive webp sizes
// (640/1280/1920/2560w) at quality 80. The 2560w cap covers 2x
// Retina at 1280px CSS width; anything above that is wasted
// bandwidth for a full-viewport background.
//
// Usage: `node scripts/optimize-pexels.mjs`

import sharp from 'sharp';
import { statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const SOURCE = resolve(PUBLIC_DIR, 'pexels.jpg');
const SIZES = [640, 1280, 1920, 2560];
const QUALITY = 80;

async function main() {
  const meta = await sharp(SOURCE).metadata();
  console.log(
    `Source: pexels.jpg  ${meta.width}x${meta.height}  ${meta.format}`
  );
  console.log(
    `Sizes:  ${SIZES.join(' / ')}  webp q${QUALITY}\n`
  );

  for (const width of SIZES) {
    if (width > meta.width) {
      console.log(`  skip ${width}w (larger than source)`);
      continue;
    }
    const out = resolve(PUBLIC_DIR, `pexels-${width}.webp`);
    await sharp(SOURCE)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    const bytes = statSync(out).size;
    const ratio = ((1 - bytes / statSync(SOURCE).size) * 100).toFixed(0);
    console.log(
      `  pexels-${width}.webp  ${(bytes / 1024).toFixed(1).padStart(6)} KB  (-${ratio}% vs source)`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
