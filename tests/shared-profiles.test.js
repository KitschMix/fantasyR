const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { suite, test, assertEqual } = require('./runner');

let pass = 0;
let total = 0;

suite('shared-profiles: 캐릭터 원래 이름 유지', () => {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.resolve(__dirname, '../shared-profiles.js'), 'utf8'),
    sandbox,
    { filename: 'shared-profiles.js' }
  );

  const groups = sandbox.window.FANTASY_SHARED_PROFILES.groups;

  total++; test('쉬움 캐릭터는 초상화의 원래 이름을 사용', () => {
    assertEqual(groups.easy.map((profile) => profile.name).join(','), '건일,루나,이지', 'easy names ');
    pass++;
  });

  total++; test('최종보스 캐릭터는 초상화의 원래 이름을 사용', () => {
    assertEqual(groups.boss.map((profile) => profile.name).join(','), '강범례,변판길,제갈혜정', 'boss names ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
