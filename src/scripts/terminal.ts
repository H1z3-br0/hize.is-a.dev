import type { ClientData } from '../lib/clientData.ts';
import { toggleTheme } from './theme.ts';

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const fill = (tpl: string, value: string) => tpl.replace('{}', value);

export function createTerminal(data: ClientData) {
  const S = data.shell;
  const T = S.strings;

  const dialog = document.createElement('dialog');
  dialog.className = 'shell';
  dialog.setAttribute('aria-label', S.title);

  const log = document.createElement('div');
  log.className = 'shell__log';
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.tabIndex = 0;

  const form = document.createElement('form');
  form.className = 'shell__form';
  form.method = 'dialog';

  const label = document.createElement('label');
  label.className = 'shell__prompt';
  label.htmlFor = 'shell-input';
  label.textContent = '$';

  const input = document.createElement('input');
  input.id = 'shell-input';
  input.className = 'shell__input';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-describedby', 'shell-hint');

  const hint = document.createElement('p');
  hint.id = 'shell-hint';
  hint.className = 'shell__hint';
  hint.textContent = S.hint;

  form.append(label, input);
  dialog.append(log, form, hint);
  document.body.append(dialog);

  const write = (text: string, kind: 'out' | 'cmd' | 'err' | 'ok' = 'out') => {
    const pre = document.createElement('pre');
    pre.className = `shell__line shell__line--${kind}`;
    pre.textContent = text;
    log.append(pre);
    log.scrollTop = log.scrollHeight;
  };

  const commands = ['help', 'whoami', 'ls', 'cat', 'open', 'theme', 'lang', 'clear', './secret'];
  const history: string[] = [];
  let historyAt = 0;

  let pending: ((line: string) => Promise<void> | void) | null = null;

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');

  async function decrypt(answer: string): Promise<string | null> {
    const { kdf, cipher } = data.challenge;
    const base = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(normalize(answer)),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(kdf.salt), iterations: kdf.iterations, hash: kdf.hash },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    try {
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64(cipher.iv) },
        key,
        b64(cipher.data)
      );
      return new TextDecoder().decode(plain);
    } catch {

      return null;
    }
  }

  function askAnswer() {
    write(T.askAnswer);
    pending = async (line) => {
      if (!line.trim()) {
        pending = null;
        write(T.aborted);
        return;
      }
      write(T.solving);
      const part = await decrypt(line);
      if (part === null) {
        write(data.challenge.bad, 'err');
        write(T.askAnswer);
        return;
      }
      pending = null;
      write(`${data.challenge.ok} ${part}`, 'ok');
      write(T.flagNote);
    };
  }

  function secret() {
    write(data.challenge.title, 'ok');
    for (const line of data.challenge.body) write(line);
    write(data.challenge.hint);
    write('');
    askAnswer();
  }

  async function run(raw: string) {
    const line = raw.trim();
    if (!line) return;
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
        for (const l of S.help) write(l);
        return;
      case 'whoami':
        write(S.whoami);
        return;
      case 'ls':
        write(Object.keys(S.files).sort().join('  '));
        return;
      case 'cat': {
        if (!arg) return write(T.catUsage, 'err');
        const file = S.files[arg];
        if (file === undefined) return write(fill(T.noFile, arg), 'err');
        write(file);
        return;
      }
      case 'open': {
        if (!arg) return write(T.openUsage, 'err');
        const section = S.sections.find((s) => s.id === arg || s.label === arg);
        if (!section) return write(fill(T.noSection, arg), 'err');
        write(fill(T.opened, section.label));
        dialog.close();
        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      case 'theme':
        toggleTheme();
        return;
      case 'lang':
        location.href = data.lang === 'ru' ? '/en/' : '/';
        return;
      case 'clear':
        log.replaceChildren();
        return;
      case './secret':
      case 'secret':
        secret();
        return;
      default:
        write(fill(T.unknown, cmd ?? ''), 'err');
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const value = input.value;
    input.value = '';
    if (pending) {
      write(`$ ${value}`, 'cmd');
      await pending(value);
    } else {
      write(`$ ${value}`, 'cmd');
      if (value.trim()) {
        history.push(value);
        historyAt = history.length;
      }
      await run(value);
    }
    log.scrollTop = log.scrollHeight;
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowUp') {
      if (!history.length) return;
      historyAt = Math.max(0, historyAt - 1);
      input.value = history[historyAt] ?? '';
      ev.preventDefault();
    } else if (ev.key === 'ArrowDown') {
      if (!history.length) return;
      historyAt = Math.min(history.length, historyAt + 1);
      input.value = history[historyAt] ?? '';
      ev.preventDefault();
    } else if (ev.key === 'Tab') {
      ev.preventDefault();
      const value = input.value;
      const parts = value.split(/\s+/);
      const last = parts[parts.length - 1] ?? '';
      const pool = parts.length > 1 && parts[0] === 'cat' ? Object.keys(S.files)
        : parts.length > 1 && parts[0] === 'open' ? S.sections.map((s) => s.id)
        : commands;
      const hits = pool.filter((c) => c.startsWith(last));
      if (hits.length === 1) {
        parts[parts.length - 1] = hits[0]!;
        input.value = parts.join(' ') + ' ';
      } else if (hits.length > 1) {
        write(hits.join('  '));
      }
    }
  });

  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    pending = null;
  });

  return {
    open() {
      if (!log.childElementCount) {
        write(`${S.title} — help`, 'ok');
      }
      dialog.showModal();
      input.focus();
    },
  };
}
