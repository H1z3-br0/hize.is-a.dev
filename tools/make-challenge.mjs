import { writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';

const [answer, part3] = process.argv.slice(2);
if (!answer || !part3) {
  console.error('usage: node tools/make-challenge.mjs <answer> <flag-part-3>');
  process.exit(1);
}

const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, '');

const ITERATIONS = 310_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalize(answer)), 'PBKDF2', false, [
  'deriveKey',
]);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  base,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);
const ct = new Uint8Array(
  await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(part3))
);

const b64 = (u8) => Buffer.from(u8).toString('base64');

const challenge = {
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: b64(salt) },
  cipher: { name: 'AES-GCM', iv: b64(iv), data: b64(ct) },

  basis: [
    [10, -33, -7, 16],
    [1, 12, 2, -1],
    [9, 14, 13, 52],
    [-15, -15, -24, -92],
  ],
  target: [43, 99, -11, 68],
  answerFormat: 'x,y,z,w',
};

await writeFile('src/config/challenge.json', JSON.stringify(challenge, null, 2) + String.fromCharCode(10));
console.log('src/config/challenge.json записан; ответ нигде не сохранён');
