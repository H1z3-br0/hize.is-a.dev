import type { ClientData, PaletteItem } from '../lib/clientData.ts';
import { toggleTheme } from './theme.ts';

export function createPalette(data: ClientData, onSecret: () => void) {
  const T = data.shell.strings;

  const dialog = document.createElement('dialog');
  dialog.className = 'palette';
  dialog.setAttribute('aria-label', T.paletteTitle);

  const input = document.createElement('input');
  input.className = 'palette__input';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = T.palettePlaceholder;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-controls', 'palette-list');
  input.setAttribute('aria-autocomplete', 'list');

  const list = document.createElement('ul');
  list.className = 'palette__list';
  list.id = 'palette-list';
  list.setAttribute('role', 'listbox');

  dialog.append(input, list);
  document.body.append(dialog);

  let shown: PaletteItem[] = [];
  let active = 0;

  const score = (item: PaletteItem, q: string) => {
    if (!q) return 0;
    const hay = `${item.label} ${item.hint ?? ''} ${item.group}`.toLowerCase();
    const i = hay.indexOf(q);
    return i < 0 ? -1 : i;
  };

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = data.palette.filter((it) => score(it, q) >= 0).sort((a, b) => score(a, q) - score(b, q));
    active = 0;
    list.replaceChildren();

    if (!shown.length) {
      const empty = document.createElement('li');
      empty.className = 'palette__empty';
      empty.setAttribute('role', 'presentation');
      empty.textContent = T.paletteEmpty;
      list.append(empty);
      input.removeAttribute('aria-activedescendant');
      return;
    }

    let group = '';
    for (const [i, item] of shown.entries()) {
      if (item.group !== group) {
        group = item.group;
        const head = document.createElement('li');
        head.className = 'palette__group';
        head.textContent = group;
        head.setAttribute('role', 'presentation');
        list.append(head);
      }
      const li = document.createElement('li');
      li.className = 'palette__item';
      li.id = `palette-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.dataset.index = String(i);

      const label = document.createElement('span');
      label.className = 'palette__label';
      label.textContent = item.label;
      li.append(label);

      if (item.hint) {
        const hint = document.createElement('span');
        hint.className = 'palette__hint';
        hint.textContent = item.hint;
        li.append(hint);
      }
      list.append(li);
    }
    highlight();
  }

  function highlight() {
    const options = list.querySelectorAll<HTMLLIElement>('.palette__item');
    options.forEach((el) => {
      const i = Number(el.dataset.index);
      const on = i === active;
      el.setAttribute('aria-selected', String(on));
      el.classList.toggle('is-active', on);
      if (on) {
        input.setAttribute('aria-activedescendant', el.id);
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function choose(item: PaletteItem | undefined) {
    if (!item) return;
    dialog.close();
    const a = item.action;
    if (a.type === 'anchor') {
      const target = document.getElementById(a.target);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const focusable = target?.querySelector<HTMLElement>('h2');
      if (focusable) {
        focusable.tabIndex = -1;
        focusable.focus({ preventScroll: true });
      }
    } else if (a.type === 'link' || a.type === 'lang') {
      location.href = a.href;
    } else if (a.type === 'theme') {
      toggleTheme();
    } else if (a.type === 'secret') {
      onSecret();
    }
  }

  input.addEventListener('input', render);

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') {
      active = Math.min(shown.length - 1, active + 1);
      highlight();
      ev.preventDefault();
    } else if (ev.key === 'ArrowUp') {
      active = Math.max(0, active - 1);
      highlight();
      ev.preventDefault();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      choose(shown[active]);
    }
  });

  list.addEventListener('click', (ev) => {
    const li = (ev.target as HTMLElement).closest<HTMLLIElement>('.palette__item');
    if (!li) return;
    choose(shown[Number(li.dataset.index)]);
  });

  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });

  return {
    open() {
      input.value = '';
      render();
      dialog.showModal();
      input.focus();
    },
  };
}
