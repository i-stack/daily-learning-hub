import {readdir, readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const key = process.argv[2];
const catalog = JSON.parse(await readFile(new URL('data/catalog.json', root), 'utf8'));
const track = catalog.find(item => item.key === key);

if (!track) {
  throw new Error(`未知专题：${key || '（未提供）'}。用法：npm run progress -- <key>`);
}

const dataDir = new URL(`data/${track.key}/`, root);
const files = (await readdir(dataDir)).filter(file => /^[A-Z]+-D\d{3}\.json$/.test(file));
const prefixes = new Set(files.map(file => file.match(/^([A-Z]+)-D/)[1]));
if (prefixes.size > 1) {
  throw new Error(`${track.key} 存在多个课程 ID 前缀：${[...prefixes].join('、')}`);
}
const prefix = track.prefix ?? [...prefixes][0] ?? track.key.toUpperCase();
if (prefixes.size === 1 && !prefixes.has(prefix)) {
  throw new Error(`${track.key} 的课程 ID 前缀应为 ${prefix}`);
}
const numbers = files.map(file => Number(file.match(/-D(\d{3})\.json$/)[1]));
const current = numbers.length ? Math.max(...numbers) : 0;
const next = current + 1;
const curriculum = track.curriculum
  ? JSON.parse(await readFile(new URL(track.curriculum, dataDir), 'utf8'))
  : null;

console.log(JSON.stringify({
  track: track.title,
  truthSource: `data/${track.key}/*.json`,
  current: current ? `${prefix}-D${String(current).padStart(3, '0')}` : null,
  next: `${prefix}-D${String(next).padStart(3, '0')}`,
  nextTopic: curriculum?.[next - 1] ?? null
}, null, 2));
