import type { Lang } from '../config/site.ts';
import {
  name, lead, subLead, projects, stack, identity, shellText, ui,
  sectionLabel, visibleSections, githubUrl, telegramUrl, ctftimeUrl, mailto, origin,
} from '../config/site.ts';
import { challenge, challengeText } from '../config/challenge.ts';
import { card } from './card.ts';

const NL = String.fromCharCode(10);

export interface PaletteItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  action:
    | { type: 'anchor'; target: string }
    | { type: 'link'; href: string }
    | { type: 'theme' }
    | { type: 'lang'; href: string }
    | { type: 'secret' };
}

export function clientData(lang: Lang) {
  const t = ui[lang];
  const s = shellText[lang];
  const c = challengeText[lang];

  const shown = visibleSections();

  const palette: PaletteItem[] = [
    ...shown.map((id) => ({
      id: `section-${id}`,
      label: sectionLabel(id, lang),
      group: s.groupSections,
      action: { type: 'anchor' as const, target: id },
    })),
    { id: 'link-github', label: 'GitHub', group: s.groupLinks, hint: identity.github, action: { type: 'link', href: githubUrl } },
    { id: 'link-ctftime', label: 'CTFtime', group: s.groupLinks, hint: identity.ctftimeTeam.alias, action: { type: 'link', href: ctftimeUrl } },
    { id: 'link-telegram', label: 'Telegram', group: s.groupLinks, hint: `@${identity.telegram}`, action: { type: 'link', href: telegramUrl } },
    { id: 'link-mail', label: identity.email, group: s.groupLinks, action: { type: 'link', href: mailto } },
    { id: 'link-card', label: 'card.txt', group: s.groupLinks, action: { type: 'link', href: lang === 'ru' ? '/card.txt' : '/en/card.txt' } },
    { id: 'act-theme', label: t.themeAction, group: s.groupActions, action: { type: 'theme' } },
    { id: 'act-lang', label: t.langSwitch, group: s.groupActions, action: { type: 'lang', href: lang === 'ru' ? '/en/' : '/' } },
    { id: 'act-secret', label: s.secret, group: s.groupActions, hint: s.secretDesc, action: { type: 'secret' } },
  ];

  const projectLines = projects.flatMap((p, i) => {
    const x = p.text[lang];
    return [
      `${i + 1}. ${x.title}  [${p.tools.join(', ')}]`,
      `   ${x.summary}`,
      ...(p.repo ? [`   ${p.repo}`] : []),
    ];
  });

  const stackLines = stack.flatMap((p) => [p.label[lang], `   ${p.tools.join(', ')}`]);

  const files: Record<string, string> = {
    'about.txt': [name[lang], lead[lang], subLead[lang]].join(NL),
    'projects.txt': projectLines.join(NL),
    'stack.txt': stackLines.join(NL),
    'contact.txt': [
      `email     ${identity.email}`,
      `telegram  @${identity.telegram}`,
      `github    ${githubUrl}`,
      `ctftime   ${ctftimeUrl}`,
      ...(identity.pgp ? [`pgp       ${identity.pgp.fingerprint}`] : []),
    ].join(NL),
    'card.txt': card(lang),
    '.flag': s.flagHint.join(NL),
  };

  return {
    lang,
    origin,
    labels: { det: t.det, step: t.step },
    themeLabels: { toDark: t.theme.toDark, toLight: t.theme.toLight },
    copy: { copy: t.copy, copied: t.copied },
    palette,
    shell: {
      title: s.terminalTitle,
      hint: s.hint,
      help: s.help,
      strings: {
        paletteTitle: s.paletteTitle,
        palettePlaceholder: s.palettePlaceholder,
        paletteEmpty: s.paletteEmpty,
        catUsage: s.catUsage,
        openUsage: s.openUsage,
        askAnswer: s.askAnswer,
        solving: s.solving,
        aborted: s.aborted,
        flagNote: s.flagNote,
        unknown: s.unknown('{}'),
        noFile: s.noFile('{}'),
        noSection: s.noSection('{}'),
        opened: s.opened('{}'),
      },
      files,
      sections: shown.map((id) => ({ id, label: sectionLabel(id, lang) })),
      whoami: [name[lang], lead[lang], subLead[lang]].join(NL),
    },
    challenge: {
      ...challenge,
      title: c.title,
      body: c.body,
      hint: c.hint,
      ok: c.ok,
      bad: c.bad,
    },
  };
}

export type ClientData = ReturnType<typeof clientData>;
