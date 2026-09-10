import type { ClientData } from '../lib/clientData.ts';
import { initLattice } from './hero.ts';
import { initTheme } from './theme.ts';
import { createPalette } from './palette.ts';
import { createTerminal } from './terminal.ts';

function payload(): ClientData | null {
  const node = document.getElementById('site-data');
  if (!node?.textContent) return null;
  try {
    return JSON.parse(node.textContent) as ClientData;
  } catch {
    return null;
  }
}

function initCopyButtons(labels: { copy: string; copied: string }) {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    if (!navigator.clipboard) continue;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        button.textContent = labels.copied;
        setTimeout(() => (button.textContent = labels.copy), 1600);
      } catch {

      }
    });
  }
}

const data = payload();

if (data) {
  try {
    initTheme(data.themeLabels);
    initCopyButtons(data.copy);
    initLattice(data.labels);

    if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
      const terminal = createTerminal(data);
      const palette = createPalette(data, () => terminal.open());

      document.getElementById('palette-hint')?.removeAttribute('hidden');

      document.addEventListener('keydown', (ev) => {
        if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
          ev.preventDefault();
          palette.open();
        }
      });
    }
  } catch (err) {

    document.documentElement.classList.remove('js');
    console.error(err);
  }
}
