// 일회성 검증: 스시고 고유 카드 종류 + 복사본 수 정리
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'sushi-go.js'), 'utf8');
const m = src.match(/const CARD_DEFS = \[([\s\S]*?)\];/);
const defs = eval('[' + m[1] + ']');
console.log('── 고유 카드 종류 (이미지 필요) ──');
defs.forEach((d, i) => {
  const num = String(i + 1).padStart(2, ' ');
  console.log('  ' + num + '. ' + d.emoji + '  ' + d.name + ' (' + d.type + ') × ' + d.copies + '장');
});
console.log('────────────────────────');
console.log('  합계: ' + defs.reduce((s, d) => s + d.copies, 0) + '장 / ' + defs.length + '종류');