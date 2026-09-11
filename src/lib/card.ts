import type { Lang } from '../config/site.ts';
import {
  name, lead, subLead, now, projects, stack, writeups, identity, ui,
  sectionLabel, githubUrl, ctftimeUrl, origin,
} from '../config/site.ts';
import { githubLive } from '../config/live.ts';
import { longDate } from '../config/format.ts';

const NL = String.fromCharCode(10);
const WIDTH = 72;

function wrap(text: string, indent = '', hang = indent): string[] {
  const out: string[] = [];
  let line = indent;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const pad = out.length ? hang : indent;
    if (line.length > pad.length && line.length + 1 + word.length > WIDTH) {
      out.push(line);
      line = hang + word;
    } else {
      line = line.length > pad.length ? `${line} ${word}` : pad + word;
    }
  }
  if (line.trim()) out.push(line);
  return out;
}

function heading(title: string): string[] {
  return ['', title, '-'.repeat(title.length)];
}

const labels = {
  ru: { mail: 'почта', web: 'сайт' },
  en: { mail: 'email', web: 'web' },
} as const;

export function card(lang: Lang): string {
  const t = ui[lang];
  const L = labels[lang];
  const out: string[] = [];

  out.push(name[lang]);
  out.push(...wrap(lead[lang]));
  out.push(...wrap(subLead[lang]));

  out.push(...heading(sectionLabel('now', lang)));
  for (const line of now[lang]) out.push(...wrap(line));
  if (githubLive) {
    out.push(...wrap(t.commitLine(githubLive.repo, longDate(githubLive.date, lang))));
  }

  out.push(...heading(sectionLabel('projects', lang)));
  projects.forEach((p, i) => {
    const c = p.text[lang];
    if (i) out.push('');
    out.push(...wrap(`${i + 1}. ${c.title}`, '', '   '));
    out.push(`   ${p.tools.join(', ')}`);
    out.push(...wrap(c.summary, '   '));
    if (p.repo) out.push(`   ${p.repo}`);
  });

  out.push(...heading(sectionLabel('stack', lang)));
  for (const profile of stack) {
    out.push(profile.label[lang]);
    out.push(...wrap(profile.tools.join(', '), '   '));
  }

  if (writeups.length) {
    out.push(...heading(sectionLabel('writeups', lang)));
    for (const w of [...writeups].sort((a, b) => b.date.localeCompare(a.date))) {
      out.push(`${w.text[lang].title} — ${w.text[lang].event}, ${w.category}, ${w.date}`);
      out.push(`   ${w.url}`);
    }
  }

  out.push(...heading(sectionLabel('contact', lang)));
  const pad = (s: string) => s.padEnd(10);
  out.push(`${pad(L.mail)}${identity.email}`);
  out.push(`${pad('telegram')}@${identity.telegram}`);
  out.push(`${pad('github')}${githubUrl}`);
  out.push(`${pad('ctftime')}${ctftimeUrl}`);
  if (identity.pgp) out.push(`${pad('pgp')}${identity.pgp.fingerprint}`);
  out.push(`${pad(L.web)}${origin}${lang === 'ru' ? '/' : '/en/'}`);

  out.push('');
  out.push(...wrap(t.flagHint));

  out.push('');
  return out.join(NL) + NL;
}
