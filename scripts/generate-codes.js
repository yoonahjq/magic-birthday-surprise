/**
 * 纯静态方案：生成序列号并写入哈希列表（供前端校验），明文码单独保存给你发客户。
 * 运行：node scripts/generate-codes.js [数量]，如 node scripts/generate-codes.js 100
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HASHES_FILE = path.join(ROOT, 'code-hashes.json');
const CODES_FILE = path.join(ROOT, 'codes.txt');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomPart(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}
function oneCode() {
  return `${randomPart(4)}-${randomPart(4)}-${randomPart(4)}`;
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

const count = parseInt(process.argv[2] || '50', 10);
const existingHashes = (() => {
  try {
    const raw = fs.readFileSync(HASHES_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
})();

const existingSet = new Set(existingHashes);
const newCodes = [];
const newHashes = [];

for (let i = 0; i < count; i++) {
  let c;
  let h;
  do {
    c = oneCode();
    h = sha256Hex(c.toUpperCase());
  } while (existingSet.has(h));
  existingSet.add(h);
  newCodes.push(c);
  newHashes.push(h);
}

const allHashes = [...existingHashes, ...newHashes];
fs.writeFileSync(HASHES_FILE, JSON.stringify(allHashes, null, 2), 'utf8');

const existingLines = (() => {
  try {
    return fs.readFileSync(CODES_FILE, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
})();
fs.writeFileSync(CODES_FILE, [...existingLines, ...newCodes].join('\n') + '\n', 'utf8');

console.log(`已生成 ${count} 个序列号，当前总有效码数：${allHashes.length}`);
console.log(`明文序列号已追加到：codes.txt（请勿提交到 Git，仅自己保存并发给下单用户）`);
console.log(`哈希已写入：code-hashes.json（需提交并重新部署后前端才能校验新码）`);
console.log('新码示例：', newCodes.slice(0, 3).join(', '));
