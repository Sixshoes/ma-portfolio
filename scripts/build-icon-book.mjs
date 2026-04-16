/**
 * 將書本圖示去背並輸出為 app/icon.png（透明背景）。
 * 來源：Gemini_Generated_Image_1bc66j1bc66j1bc6.png
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceName = "Gemini_Generated_Image_1bc66j1bc66j1bc6.png";
const sourcePath = path.join(root, sourceName);
const outPath = path.join(root, "app", "icon.png");

const OUTPUT = 1024;
const CONTENT = 0.9; // 保留四周留白，避免 favicon 貼邊。

function idxAt(width, x, y) {
  return y * width + x;
}

function isForegroundCandidate(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const warm = r - b;
  if (lum < 210) return true; // 深色書本、邊框
  if (sat > 0.16) return true; // 較有色彩的區塊
  if (warm > 18 && lum > 70) return true; // 金色描邊與文字
  return false;
}

function findSeed(mask, width, height) {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const maxR = Math.floor(Math.min(width, height) / 2);
  if (mask[idxAt(width, cx, cy)]) return [cx, cy];

  for (let r = 1; r < maxR; r++) {
    for (let dx = -r; dx <= r; dx++) {
      const x1 = cx + dx;
      const y1 = cy - r;
      const y2 = cy + r;
      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height && mask[idxAt(width, x1, y1)]) return [x1, y1];
      if (x1 >= 0 && x1 < width && y2 >= 0 && y2 < height && mask[idxAt(width, x1, y2)]) return [x1, y2];
    }
    for (let dy = -r + 1; dy <= r - 1; dy++) {
      const y1 = cy + dy;
      const x1 = cx - r;
      const x2 = cx + r;
      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height && mask[idxAt(width, x1, y1)]) return [x1, y1];
      if (x2 >= 0 && x2 < width && y1 >= 0 && y1 < height && mask[idxAt(width, x2, y1)]) return [x2, y1];
    }
  }
  return null;
}

function keepMainConnectedComponent(data, width, height) {
  const n = width * height;
  const candidate = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    candidate[i] = isForegroundCandidate(data[o], data[o + 1], data[o + 2]) ? 1 : 0;
  }

  const seed = findSeed(candidate, width, height);
  if (!seed) return new Uint8Array(n);

  const keep = new Uint8Array(n);
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  let qh = 0;
  let qt = 0;

  const push = (x, y) => {
    const i = idxAt(width, x, y);
    if (keep[i] || !candidate[i]) return;
    keep[i] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  };

  push(seed[0], seed[1]);

  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  // 輕微膨脹 1px，避免邊緣被切薄。
  const dilated = new Uint8Array(keep);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = idxAt(width, x, y);
      if (keep[i]) continue;
      if (
        keep[idxAt(width, x - 1, y)] ||
        keep[idxAt(width, x + 1, y)] ||
        keep[idxAt(width, x, y - 1)] ||
        keep[idxAt(width, x, y + 1)] ||
        keep[idxAt(width, x - 1, y - 1)] ||
        keep[idxAt(width, x + 1, y - 1)] ||
        keep[idxAt(width, x - 1, y + 1)] ||
        keep[idxAt(width, x + 1, y + 1)]
      ) {
        dilated[i] = 1;
      }
    }
  }

  return dilated;
}

function applyAlphaFromKeep(data, keep) {
  const n = keep.length;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (!keep[i]) {
      data[o + 3] = 0;
    } else {
      data[o + 3] = 255;
    }
  }
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { width, height, channels } = info;
  if (channels !== 4) throw new Error("Expected RGBA input");

  const pixels = new Uint8Array(data);
  const keepMask = keepMainConnectedComponent(pixels, width, height);
  applyAlphaFromKeep(pixels, keepMask);

  const extracted = await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
  const trimmedMeta = await sharp(extracted).trim().toBuffer({ resolveWithObject: true });

  const fitSize = Math.floor(OUTPUT * CONTENT);
  await sharp({
    create: {
      width: OUTPUT,
      height: OUTPUT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(trimmedMeta.data)
          .resize({
            width: fitSize,
            height: fitSize,
            fit: "inside",
            withoutEnlargement: false,
          })
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`Wrote ${outPath} from ${sourceName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
