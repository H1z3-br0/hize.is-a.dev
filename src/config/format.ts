import type { Lang } from './site.ts';

const locales: Record<Lang, string> = { ru: 'ru-RU', en: 'en-GB' };

export function longDate(iso: string, lang: Lang): string {
  const s = new Intl.DateTimeFormat(locales[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));

  return s.replace(/\s*г\.$/, '');
}
