import {
  badBasis, det, drawBackground, drawHero, heroView, metrics, reduceSteps,
  type Basis, type Vec,
} from './lattice.ts';

const DURATION = 340;
const PAUSE = 140;

type Labels = { det: string; step: string };

export function initLattice(labels: Labels) {
  const hero = document.getElementById('lattice') as HTMLCanvasElement | null;
  const bg = document.getElementById('bg') as HTMLCanvasElement | null;
  const out = document.getElementById('lattice-metrics');
  const again = document.getElementById('lattice-reduce') as HTMLButtonElement | null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let steps: Basis[] = [];
  let current: Basis = { b1: [1, 0], b2: [0, 1] };

  let lattice: Basis = current;
  let shown = 0;
  let raf = 0;
  let timer = 0;

  const render = () => {
    if (hero) drawHero(hero, current, lattice);
    if (bg) drawBackground(bg, current);
    if (out) out.innerHTML = metrics(current, shown, Math.max(steps.length - 1, 0), labels);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
    raf = 0;
    timer = 0;
  };

  const lerp = (a: Basis, b: Basis, t: number): Basis => ({
    b1: [a.b1[0] + (b.b1[0] - a.b1[0]) * t, a.b1[1] + (b.b1[1] - a.b1[1]) * t],
    b2: [a.b2[0] + (b.b2[0] - a.b2[0]) * t, a.b2[1] + (b.b2[1] - a.b2[1]) * t],
  });

  const isSwap = (a: Basis, b: Basis) =>
    a.b1[0] === b.b2[0] && a.b1[1] === b.b2[1] && a.b2[0] === b.b1[0] && a.b2[1] === b.b1[1];

  function play(index: number) {
    if (index >= steps.length - 1) {
      current = steps[steps.length - 1]!;
      shown = steps.length - 1;
      render();
      return;
    }
    const from = steps[index]!;
    const to = steps[index + 1]!;

    if (isSwap(from, to)) {
      current = to;
      shown = index + 1;
      render();
      timer = window.setTimeout(() => play(index + 1), PAUSE);
      return;
    }

    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);

      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      current = lerp(from, to, e);
      shown = index + (t === 1 ? 1 : 0);
      render();
      if (t < 1) raf = requestAnimationFrame(frame);
      else timer = window.setTimeout(() => play(index + 1), PAUSE);
    };
    raf = requestAnimationFrame(frame);
  }

  function run(basis?: Basis) {
    stop();
    steps = reduceSteps(basis ?? badBasis());
    lattice = steps[0]!;

    if (reduced.matches || document.hidden) {
      current = steps[steps.length - 1]!;
      shown = steps.length - 1;
      render();
      return;
    }
    current = steps[0]!;
    shown = 0;
    render();
    timer = window.setTimeout(() => play(0), PAUSE);
  }

  let dragging: 'b1' | 'b2' | null = null;

  const geometry = () => {
    const rect = hero!.getBoundingClientRect();
    return { rect, ...heroView(rect.width, rect.height) };
  };

  const toScreen = (v: Vec) => {
    const g = geometry();
    return { x: g.ox + v[0] * g.scale, y: g.oy - v[1] * g.scale };
  };

  const pick = (ev: PointerEvent): 'b1' | 'b2' | null => {
    const g = geometry();
    const x = ev.clientX - g.rect.left;
    const y = ev.clientY - g.rect.top;

    const near = (v: Vec) => {
      const p = toScreen(v);
      return Math.hypot(p.x - x, p.y - y) < 22;
    };
    if (near(current.b1)) return 'b1';
    if (near(current.b2)) return 'b2';
    return null;
  };

  if (hero) {
    hero.addEventListener('pointerdown', (ev) => {
      const which = pick(ev);
      if (!which) return;
      stop();
      dragging = which;
      hero.setPointerCapture(ev.pointerId);
      hero.style.cursor = 'grabbing';
      ev.preventDefault();
    });

    hero.addEventListener('pointermove', (ev) => {
      if (!dragging) {
        hero.style.cursor = pick(ev) ? 'grab' : '';
        return;
      }
      const g = geometry();
      const v: Vec = [
        Math.round((ev.clientX - g.rect.left - g.ox) / g.scale),
        Math.round((g.oy - (ev.clientY - g.rect.top)) / g.scale),
      ];
      const next: Basis = dragging === 'b1' ? { b1: v, b2: current.b2 } : { b1: current.b1, b2: v };

      if (det(next) === 0) return;
      current = next;
      lattice = next;
      steps = [current];
      shown = 0;
      render();
    });

    const release = (ev: PointerEvent) => {
      if (!dragging) return;
      dragging = null;
      hero.style.cursor = '';
      if (hero.hasPointerCapture(ev.pointerId)) hero.releasePointerCapture(ev.pointerId);
    };
    hero.addEventListener('pointerup', release);
    hero.addEventListener('pointercancel', release);
  }

  if (again) {
    again.hidden = false;
    again.addEventListener('click', () => run());
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 100);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden || !steps.length || shown >= steps.length - 1) return;
    stop();
    current = steps[steps.length - 1]!;
    shown = steps.length - 1;
    render();
  });

  const themeWatcher = new MutationObserver(render);
  themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

  const start = () => run();
  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            io.disconnect();
            start();
          }
        }
      },
      { threshold: 0.25 }
    );
    io.observe(hero);

    current = { b1: [1, 0], b2: [0, 1] };
    lattice = current;
    if (bg) drawBackground(bg, current);
  } else {
    start();
  }

  return { reduceAgain: () => run() };
}
