import data from './challenge.json';
import type { Lang } from './site.ts';

export const flagPart1 = 'axiom{p4sh4lk0-';
export const flagPart2 = '1_4m_';

export const flagPart2Encoded = btoa(flagPart2);

export const challenge = data as {
  kdf: { name: string; hash: string; iterations: number; salt: string };
  cipher: { name: string; iv: string; data: string };
  basis: number[][];
  target: number[];
  answerFormat: string;
};

const rows = challenge.basis.map((r) => '  [' + r.map((n) => String(n).padStart(4)).join(' ') + ' ]');

export const challengeText: Record<Lang, { title: string; body: string[]; hint: string; ok: string; bad: string }> = {
  ru: {
    title: 'CVP',
    body: [
      'Строки матрицы B задают решётку в Z^4.',
      ...rows,
      '',
      't = [ ' + challenge.target.join(' ') + ' ]',
      '',
      'Найдите вектор решётки, ближайший к t.',
      'Ответ: четыре целых числа через запятую.',
    ],
    hint: 'Базис плохой намеренно. Начните с редукции.',
    ok: 'Верно. Третья часть флага:',
    bad: 'Не то. Ближайший вектор один, он существует.',
  },
  en: {
    title: 'CVP',
    body: [
      'The rows of B span a lattice in Z^4.',
      ...rows,
      '',
      't = [ ' + challenge.target.join(' ') + ' ]',
      '',
      'Find the lattice vector closest to t.',
      'Answer: four integers, comma separated.',
    ],
    hint: 'The basis is bad on purpose. Reduce it first.',
    ok: 'Correct. Third part of the flag:',
    bad: 'No. The closest vector is unique, and it exists.',
  },
};
