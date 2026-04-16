/**
 * Gemini_Generated_Image_ak2jodak2jodak2j.png：
 * 中央裁切正方形 → 圓內非金色區改為純黑、保留金邊與圖示；圓外透明 → app/icon.png
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sourceName = 'Gemini_Generated_Image_ak2jodak2jodak2j.png';
const sourcePath = path.join(root, sourceName);
const outPath = path.join(root, 'app', 'icon.png');

const OUTPUT = 1024;
/** 圓半徑 = (OUTPUT/2) × 此係數；略小於 1 可裁掉裁切後四角的黑布料，只留金邊圓章 */
const RADIUS_FRAC = 0.88;

function idxAt(width, x, y) {
  return y * width + x;
}

/** 金色／金屬高光：保留；其餘（霧面灰底等）在圓內改純黑 */
function isForeground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (sat > 0.14 && lum > 42) return true;
  if (r > 82 && r - b > 14 && sat > 0.07) return true;
  if (lum > 118) return true;
  return false;
}

function applyCircleTransparentOutsideBlackInside(data, width, height) {
  const cx = width / 2 - 0.5;
  const cy = height / 2 - 0.5;
  const radius = (Math.min(width, height) / 2) * RADIUS_FRAC;
  const feather = Math.max(1.5, Math.min(width, height) * 0.006);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = idxAt(width, x, y) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let a = 255;
      if (dist > radius) a = 0;
      else if (dist > radius - feather) a = Math.round((255 * (radius - dist)) / feather);

      if (a === 0) {
        data[o] = 0;
        data[o + 1] = 0;
        data[o + 2] = 0;
        data[o + 3] = 0;
        continue;
      }

      let r = data[o];
      let g = data[o + 1];
      let b = data[o + 2];
      if (dist <= radius && !isForeground(r, g, b)) {
        r = 0;
        g = 0;
        b = 0;
      }

      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = a;
    }
  }
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error('Missing source:', sourcePath);
    process.exit(1);
  }

  const meta = await sharp(sourcePath).metadata();
  const w = meta.width ?? OUTPUT;
  const h = meta.height ?? OUTPUT;
  const side = Math.min(w, h);
  const left = Math.floor((w - side) / 2);
  const top = Math.floor((h - side) / 2);

  const { data, info } = await sharp(sourcePath)
    .extract({ left, top, width: side, height: side })
    .resize(OUTPUT, OUTPUT, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) throw new Error('Expected RGBA');

  const px = new Uint8Array(data);
  applyCircleTransparentOutsideBlackInside(px, OUTPUT, OUTPUT);

  await sharp(px, { raw: { width: OUTPUT, height: OUTPUT, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log('Wrote', outPath, `from ${sourceName} (${w}x${h}, crop ${side}, RADIUS_FRAC=${RADIUS_FRAC})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
