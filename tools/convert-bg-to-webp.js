// tools/convert-bg-to-webp.js
// 5장 bg.jpg를 WebP로 변환 + JPEG fallback 유지
// 결과: assets/{game}/bg.webp (q=80), 같은 경로에 bg.jpg 보존
//
// 사용법:
//   node tools/convert-bg-to-webp.js
//
// 결과 출력 예:
//   sushi    224 KB → bg.webp  94 KB  (58%↓)
//   ...

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const games = ['cantstop', 'clue', 'monopoly', 'sushi', 'splendor'];
const assetsDir = path.join(__dirname, '..', 'assets');

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;
  for (const g of games) {
    const dir = path.join(assetsDir, g);
    const jpg = path.join(dir, 'bg.jpg');
    const webp = path.join(dir, 'bg.webp');
    if (!fs.existsSync(jpg)) {
      console.log(`SKIP ${g} (no bg.jpg)`);
      continue;
    }
    const before = fs.statSync(jpg).size;
    totalBefore += before;
    await sharp(jpg)
      .webp({ quality: 80, effort: 6 })
      .toFile(webp);
    const after = fs.statSync(webp).size;
    totalAfter += after;
    const pct = Math.round((1 - after / before) * 100);
    const dim = await sharp(jpg).metadata();
    console.log(
      `${g.padEnd(10)} ${(before / 1024).toFixed(0).padStart(4)} KB → ` +
        `bg.webp ${(after / 1024).toFixed(0).padStart(4)} KB  ` +
        `(${pct}↓)  ${dim.width}×${dim.height}`
    );
  }
  console.log(
    `\n=== 합계: ${(totalBefore / 1024).toFixed(0)} KB → ` +
      `${(totalAfter / 1024).toFixed(0)} KB  ` +
      `(${(totalBefore - totalAfter) / 1024 | 0} KB 절감, ` +
      `${Math.round((1 - totalAfter / totalBefore) * 100)}%↓) ===`
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
