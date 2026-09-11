export type Lang = "ru" | "en";

type L<T = string> = Record<Lang, T>;

export const identity = {
  domain: null as string | null,
  email: "pkd12305@gmail.com",
  github: "H1z3-br0",
  telegram: "hize_k",
  pgp: null as null | { fingerprint: string; keyUrl: string },
  ctftimeTeam: { alias: "4x10m", id: 418607 },
};

export const sections = [
  { id: "now", label: { ru: "сейчас", en: "now" } },
  { id: "projects", label: { ru: "проекты", en: "projects" } },
  { id: "stack", label: { ru: "стек", en: "stack" } },
  { id: "writeups", label: { ru: "разборы", en: "writeups" } },
  { id: "contact", label: { ru: "связь", en: "contact" } },
] as const satisfies readonly { id: string; label: L }[];

export type SectionId = (typeof sections)[number]["id"];

export function sectionLabel(id: SectionId, lang: Lang): string {
  return sections.find((s) => s.id === id)!.label[lang];
}

export const name: L = {
  ru: "Hize",
  en: "Hize",
};

export const lead: L = {
  ru: "Ученик СУНЦ МГУ.",
  en: "Student at AESC, Moscow State University.",
};

export const subLead: L = {
  ru: "катаю CTF в команде 4x10m, участвую в bug bounty программах и .",
  en: "CTF with 4x10m, vulnerability hunting in bug bounty.",
};

export const now: L<string[]> = {
  ru: [
    "TODO: заменить своим текстом. Пишу проверку изоморфизма решёток по Плескену–Сувинье на SageMath: класс решётки, LLL и перебор коротких векторов готовы, сейчас — отсечение по fingerprint.",
    "Цель на ближайшее время — стажировка криптографом в «Коде Безопасности».",
  ],
  en: [
    "TODO: replace with your own words. Writing a Plesken–Souvignier lattice isomorphism check in SageMath: the lattice class, LLL and short-vector enumeration are in place; fingerprint pruning is next.",
    "Near-term goal — a cryptographer internship at Code of Security.",
  ],
};

export type Project = {
  id: string;
  tools: string[];
  repo: string | null;
  notation?: string;
  text: L<{
    title: string;
    summary: string;
    task: string;
    approach: string;
    done: string;
  }>;
};

export const projects: Project[] = [
  {
    id: "lattice-isomorphism",
    tools: ["SageMath", "Python"],
    repo: null,
    notation: "Λ₁ ≅ Λ₂ ⟺ ∃U ∈ GL<sub>n</sub>(ℤ) : U<sup>T</sup>G₁U = G₂",
    text: {
      ru: {
        title: "Задача изоморфизма решёток",
        summary:
          "Определяет, задают ли два целочисленных базиса одну и ту же решётку.",
        task: "Даны два базиса. Нужно узнать, существует ли целочисленная замена базиса с определителем ±1, переводящая один в другой и сохраняющая все скалярные произведения. Перебором это не решается: группа GL(n, ℤ) бесконечна.",
        approach:
          "Алгоритм Плескена–Сувинье. Оба базиса LLL-редуцируются, короткие векторы перечисляются по Финке–Посту, кандидаты отсекаются по fingerprint — набору характеристик, инвариантных относительно изометрии, — и изометрия достраивается по одному вектору за раз с возвратом.",
        done: "Готовы класс решётки, LLL-редукция, перебор Финке–Поста и отсечение по fingerprint. Backtracking в работе.",
      },
      en: {
        title: "Lattice isomorphism",
        summary: "Decides whether two integer bases span the same lattice.",
        task: "Given two bases, decide whether some integer change of basis with determinant ±1 maps one onto the other while preserving every inner product. Brute force is not an option: GL(n, ℤ) is infinite.",
        approach:
          "The Plesken–Souvignier algorithm. Both bases are LLL-reduced, short vectors are enumerated by Fincke–Pohst, candidates are pruned by a fingerprint of isometry-invariant characteristics, and the isometry is extended one vector at a time with backtracking.",
        done: "The lattice class, LLL reduction, Fincke–Pohst enumeration and fingerprint pruning are done. Backtracking is in progress.",
      },
    },
  },
  {
    id: "lambda",
    tools: ["Rust"],
    repo: "https://github.com/H1z3-br0/Lambda",
    text: {
      ru: {
        title: "Lambda",
        summary: "Платформа-борда для CTF.",
        task: "TODO: что именно не устраивало в существующих платформах — пара строк от владельца.",
        approach:
          "TODO: устройство — что на Rust, что хранит состояние, как раздаются задания.",
      },
      en: {
        title: "Lambda",
        summary: "A scoreboard platform for CTF.",
        task: "TODO: what was wrong with the existing platforms — a couple of lines from the owner.",
        approach:
          "TODO: architecture — what is in Rust, where state lives, how tasks are served.",
      },
    },
  },
];

export type Profile = {
  id: string;
  label: L;
  tools: string[];
  note?: L;
};

export const stack: Profile[] = [
  {
    id: "crypto",
    label: { ru: "криптография", en: "cryptography" },
    tools: ["SageMath", "Magma", "CyberChef"],
  },
  {
    id: "ml",
    label: { ru: "машинное обучение", en: "machine learning" },
    tools: ["PyTorch", "scikit-learn", "pandas", "NumPy", "matplotlib"],
    note: {
      ru: "классический ML и глубокое обучение",
      en: "classical ML and deep learning",
    },
  },
  {
    id: "devops",
    label: { ru: "инфраструктура", en: "infrastructure" },
    tools: ["Docker", "Nginx", "Linux", "Wireshark"],
  },
];

export type Writeup = {
  url: string;
  date: string;
  category: string;
  text: L<{ title: string; event: string }>;
};

export const writeups: Writeup[] = [];

export interface UiStrings {
  latticeLabel: string;
  latticeCaption: string;
  latticeNoscript: string;
  reduceAgain: string;
  det: string;
  step: string;
  expand: string;
  collapse: string;
  code: string;
  contactIntro: string;
  or: string;
  pgpLabel: string;
  copy: string;
  copied: string;
  curlHint: string;
  securityTxt: string;
  flagHint: string;
  theme: { toDark: string; toLight: string };
  themeAction: string;
  langSwitch: string;
  langSwitchShort: string;
  langSwitchLabel: string;
  paletteHint: string;
  commitLine: (repo: string, when: string) => string;
  notFound: { title: string; body: string; home: string };
}

export const ui: Record<Lang, UiStrings> = {
  ru: {
    latticeLabel: "решётка",
    latticeCaption: "Базис решётки ℤ². Векторы можно перетаскивать.",
    latticeNoscript:
      "Здесь интерактивная решётка — она требует JavaScript. Всё остальное на странице работает без него.",
    reduceAgain: "редуцировать заново",
    det: "det",
    step: "шаг",
    expand: "подробнее",
    collapse: "свернуть",
    code: "код",
    contactIntro: "Написать можно на",
    or: "или в",
    pgpLabel: "Отпечаток PGP",
    copy: "скопировать",
    copied: "скопировано",
    curlHint: "Та же визитка в виде текста:",
    securityTxt: "security.txt",
    flagHint: "Где-то здесь спрятан флаг из трёх частей.",
    theme: { toDark: "Включить тёмную тему", toLight: "Включить светлую тему" },
    themeAction: "сменить тему",
    langSwitch: "English",
    langSwitchShort: "EN",
    langSwitchLabel: "Switch to English",
    paletteHint: "Палитра команд —",
    commitLine: (repo, when) => `Последний коммит — в ${repo}, ${when}.`,
    notFound: {
      title: "Такого вектора в решётке нет",
      body: "Страница не найдена. Ближайший узел — начало координат.",
      home: "на главную",
    },
  },
  en: {
    latticeLabel: "lattice",
    latticeCaption: "A basis of the lattice ℤ². The vectors are draggable.",
    latticeNoscript:
      "An interactive lattice lives here; it needs JavaScript. Everything else on the page does not.",
    reduceAgain: "reduce again",
    det: "det",
    step: "step",
    expand: "more",
    collapse: "less",
    code: "code",
    contactIntro: "Reach me at",
    or: "or on",
    pgpLabel: "PGP fingerprint",
    copy: "copy",
    copied: "copied",
    curlHint: "The same card as plain text:",
    securityTxt: "security.txt",
    flagHint: "A flag in three parts is hidden somewhere here.",
    theme: { toDark: "Switch to dark theme", toLight: "Switch to light theme" },
    themeAction: "toggle theme",
    langSwitch: "Русский",
    langSwitchShort: "RU",
    langSwitchLabel: "Переключить на русский",
    paletteHint: "Command palette —",
    commitLine: (repo, when) => `Last commit — in ${repo}, ${when}.`,
    notFound: {
      title: "No such vector in the lattice",
      body: "Page not found. The nearest node is the origin.",
      home: "go home",
    },
  },
};

export interface ShellStrings {
  paletteTitle: string;
  palettePlaceholder: string;
  paletteEmpty: string;
  groupSections: string;
  groupLinks: string;
  groupActions: string;
  secret: string;
  secretDesc: string;
  terminalTitle: string;
  hint: string;
  unknown: (cmd: string) => string;
  noFile: (file: string) => string;
  catUsage: string;
  openUsage: string;
  noSection: (name: string) => string;
  opened: (name: string) => string;
  help: string[];
  askAnswer: string;
  solving: string;
  aborted: string;
  flagNote: string;
  flagHint: string[];
}

export const shellText: Record<Lang, ShellStrings> = {
  ru: {
    paletteTitle: "Палитра команд",
    palettePlaceholder: "Раздел, ссылка или команда",
    paletteEmpty: "Ничего не найдено",
    groupSections: "Разделы",
    groupLinks: "Ссылки",
    groupActions: "Действия",
    secret: "./secret",
    secretDesc: "терминал",
    terminalTitle: "terminal",
    hint: "Стрелки — история, Tab — дополнение, Esc — закрыть.",
    unknown: (cmd) => `${cmd}: команда не найдена. help — список команд.`,
    noFile: (file) => `${file}: нет такого файла`,
    catUsage: "cat: укажите файл. ls — что есть.",
    openUsage: "open: укажите раздел.",
    noSection: (name) => `${name}: нет такого раздела`,
    opened: (name) => `перехожу к разделу «${name}»`,
    help: [
      "help            список команд",
      "whoami          кто это",
      "ls              файлы",
      "cat <файл>      показать файл",
      "open <раздел>   перейти к разделу страницы",
      "theme           переключить тему",
      "lang            сменить язык",
      "clear           очистить",
      "./secret        задача",
    ],
    askAnswer: "Ответ (или пустая строка — выйти):",
    solving: "проверяю…",
    aborted: "отменено",
    flagNote: "Это одна из трёх частей. Остальные две лежат на сайте.",
    flagHint: [
      "Флаг собран из трёх частей.",
      "Первая — в разметке страницы.",
      "Вторая — там, где сайт объясняется с роботами.",
      "Третья — здесь, после ./secret.",
    ],
  },
  en: {
    paletteTitle: "Command palette",
    palettePlaceholder: "Section, link or command",
    paletteEmpty: "Nothing found",
    groupSections: "Sections",
    groupLinks: "Links",
    groupActions: "Actions",
    secret: "./secret",
    secretDesc: "terminal",
    terminalTitle: "terminal",
    hint: "Arrows — history, Tab — completion, Esc — close.",
    unknown: (cmd) => `${cmd}: command not found. Try help.`,
    noFile: (file) => `${file}: no such file`,
    catUsage: "cat: name a file. ls lists them.",
    openUsage: "open: name a section.",
    noSection: (name) => `${name}: no such section`,
    opened: (name) => `jumping to “${name}”`,
    help: [
      "help            list commands",
      "whoami          who this is",
      "ls              files",
      "cat <file>      print a file",
      "open <section>  jump to a section of the page",
      "theme           toggle theme",
      "lang            switch language",
      "clear           clear the screen",
      "./secret        the task",
    ],
    askAnswer: "Answer (empty line to quit):",
    solving: "checking…",
    aborted: "aborted",
    flagNote: "This is one of three parts. The other two are on the site.",
    flagHint: [
      "The flag comes in three parts.",
      "The first is in the page markup.",
      "The second is where the site talks to robots.",
      "The third is here, after ./secret.",
    ],
  },
};

export const origin = identity.domain
  ? `https://${identity.domain}`
  : "http://localhost:4321";
export const bareHost = identity.domain ?? "localhost:4321";
export const githubUrl = `https://github.com/${identity.github}`;
export const telegramUrl = `https://t.me/${identity.telegram}`;
export const mailto = `mailto:${identity.email}`;
export const ctftimeUrl = `https://ctftime.org/team/${identity.ctftimeTeam.id}`;

export function visibleSections(): SectionId[] {
  return sections
    .filter((s) => (s.id === "writeups" ? writeups.length > 0 : true))
    .map((s) => s.id);
}
