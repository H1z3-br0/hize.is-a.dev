type Labels = { toDark: string; toLight: string };

const KEY = 'theme';

export function currentTheme(): 'dark' | 'light' {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark' || explicit === 'light') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(next: 'dark' | 'light') {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {

  }
  document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
}

export function toggleTheme() {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme(labels: Labels) {
  const button = document.getElementById('theme-toggle') as HTMLButtonElement | null;
  if (!button) return;

  const sync = () => {
    const dark = currentTheme() === 'dark';
    button.setAttribute('aria-label', dark ? labels.toLight : labels.toDark);
    button.setAttribute('title', dark ? labels.toLight : labels.toDark);
    button.setAttribute('aria-pressed', String(dark));
  };

  button.hidden = false;
  button.addEventListener('click', toggleTheme);
  document.addEventListener('themechange', sync);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  sync();
}
