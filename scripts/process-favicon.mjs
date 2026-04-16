/**
 * 將 app/icon.png 去背並裁成圓形（外側透明），輸出回 app/icon.png。
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconPath = path.join(__dirname, '..', 'app', 'icon.png');

/** 明顯屬於金色標誌、光暈的像素：寧可保留 */
function isForeground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (sat > 0.22 && lum > 62) return true;
  if (r > 102 && r - b > 26 && sat > 0.14) return true;
  if (lum > 148) return true;
  return false;
}

/** 深色底、電路板灰、內凹陰影區 */
function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (max < 84) return true;
  if (lum < 80) return true;
  if (lum < 138 && sat < 0.34) return true;
  return false;
}

function idxAt(width, x, y) {
  return y * width + x;
}

async function main() {
  const { data, info } = await sharp(iconPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) throw new Error('Expected RGBA');

  const src = new Uint8Array(data);

  const cx = width / 2 - 0.5;
  const cy = height / 2 - 0.5;
  const radius = Math.min(width, height) / 2 - 0.5;
  const feather = Math.max(1.5, Math.min(width, height) * 0.008);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = idxAt(width, x, y) * 4;
      const r = src[o];
      const g = src[o + 1];
      const b = src[o + 2];

      let a = src[o + 3];
      if (isBackground(r, g, b) && !isForeground(r, g, b)) a = 0;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let circleA = 1;
      if (dist > radius) circleA = 0;
      else if (dist > radius - feather) circleA = (radius - dist) / feather;

      src[o + 3] = Math.round(a * circleA);
    }
  }

  await sharp(src, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(iconPath);

  console.log('Updated', iconPath, `${width}x${height}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
