/**
 * 將透明底標誌疊在圓形黑底上，輸出為 app/icon.png（Next.js favicon）。
 * 來源：專案根目錄 Gemini_Generated_Image_a0woc3a0woc3a0wo.png
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourceName = 'Gemini_Generated_Image_a0woc3a0woc3a0wo.png';
const sourcePath = path.join(root, sourceName);
const outPath = path.join(root, 'app', 'icon.png');

/** 輸出邊長（正方形） */
const OUTPUT = 1024;
/** 標誌最大邊 = 圓內接正方形邊長 × 此係數（留金邊） */
const LOGO_FRAC = 0.82;

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error('Missing source:', sourcePath);
    process.exit(1);
  }

  const meta = await sharp(sourcePath).metadata();
  const sw = meta.width ?? OUTPUT;
  const sh = meta.height ?? OUTPUT;

  const diameter = OUTPUT;
  const r = diameter / 2 - 0.5;
  const cx = OUTPUT / 2;
  const cy = OUTPUT / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT}" height="${OUTPUT}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#000000"/>
</svg>`;

  const blackCircle = await sharp(Buffer.from(svg)).png().toBuffer();

  const inscribedSquare = (diameter / 2) * Math.SQRT2;
  const maxLogo = Math.floor(inscribedSquare * LOGO_FRAC);
  const logoBuf = await sharp(sourcePath)
    .resize({
      width: maxLogo,
      height: maxLogo,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: OUTPUT,
      height: OUTPUT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: blackCircle, left: 0, top: 0 },
      { input: logoBuf, gravity: 'center' },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log('Wrote', outPath, `from ${sourceName} (${sw}x${sh})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
