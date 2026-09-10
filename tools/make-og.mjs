import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { name, lead, subLead } from '../src/config/site.ts';

const W = 1200;
const H = 630;
const PAPER = '#E9EEF0';
const INK = '#16283C';
const INK2 = '#4A5F70';
const RULE = '#C4D3D9';
const ACCENT = '#B02334';

const cell = 64;
const ox = 792;
const oy = 232;
const px = (i, j) => [ox + i * cell, oy - j * cell];

const dots = [];
for (let i = -14; i <= 14; i++) {
  for (let j = -14; j <= 14; j++) {
    const [x, y] = px(i, j);
    if (x < -10 || y < -10 || x > W + 10 || y > H + 10) continue;
    dots.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="${INK2}" opacity=".42"/>`);
  }
}

const [x0, y0] = px(0, 0);
const [x1, y1] = px(1, 0);
const [x2, y2] = px(0, 1);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const serif = "Times New Roman, Times, Nimbus Roman, Liberation Serif, serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <g stroke="${RULE}" stroke-width="1" opacity=".7">
    ${Array.from({ length: Math.ceil(W / cell) + 2 }, (_, i) => { const x = ox % cell + (i - 1) * cell; return `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`; }).join('')}
    ${Array.from({ length: Math.ceil(H / cell) + 2 }, (_, i) => { const y = oy % cell + (i - 1) * cell; return `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`; }).join('')}
  </g>
  ${dots.join('')}
  <rect x="${x0}" y="${y2}" width="${cell}" height="${cell}" fill="${ACCENT}" opacity=".14"/>
  <g stroke-width="3" stroke-linecap="round" fill="none">
    <line x1="${x0}" y1="${y0}" x2="${x1 - 9}" y2="${y1}" stroke="${INK}"/>
    <polygon points="${x1},${y1} ${x1 - 13},${y1 - 6} ${x1 - 13},${y1 + 6}" fill="${INK}" stroke="none"/>
    <line x1="${x0}" y1="${y0}" x2="${x2}" y2="${y2 + 9}" stroke="${INK2}"/>
    <polygon points="${x2},${y2} ${x2 - 6},${y2 + 13} ${x2 + 6},${y2 + 13}" fill="${INK2}" stroke="none"/>
  </g>
  <text x="${x1 + 26}" y="${y0 - cell / 2 + 9}" font-family="${serif}" font-size="26" font-style="italic" fill="${ACCENT}">|det| = 1</text>

  <text x="80" y="470" font-family="${serif}" font-size="76" fill="${INK}">${esc(name.ru)}</text>
  <text x="80" y="524" font-family="${serif}" font-size="30" fill="${INK}">${esc(lead.ru)}</text>
  <text x="80" y="566" font-family="${serif}" font-size="26" fill="${INK2}">${esc(subLead.ru)}</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile('public/og.png', png);
console.log(`public/og.png — ${png.length} байт`);
