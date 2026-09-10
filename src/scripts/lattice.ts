export type Vec = readonly [number, number];
export interface Basis {
  b1: Vec;
  b2: Vec;
}

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const norm2 = (a: Vec) => dot(a, a);
const norm = (a: Vec) => Math.sqrt(norm2(a));
export const det = (b: Basis) => b.b1[0] * b.b2[1] - b.b1[1] * b.b2[0];

const copy = (b: Basis): Basis => ({ b1: [b.b1[0], b.b1[1]], b2: [b.b2[0], b.b2[1]] });

export function reduceSteps(start: Basis): Basis[] {
  const steps: Basis[] = [copy(start)];
  let b1: Vec = [start.b1[0], start.b1[1]];
  let b2: Vec = [start.b2[0], start.b2[1]];

  for (let guard = 0; guard < 64; guard++) {
    if (norm2(b1) > norm2(b2)) {
      [b1, b2] = [b2, b1];
      steps.push({ b1: [b1[0], b1[1]], b2: [b2[0], b2[1]] });
    }
    const mu = Math.round(dot(b1, b2) / norm2(b1));
    if (mu === 0) break;
    b2 = [b2[0] - mu * b1[0], b2[1] - mu * b1[1]];
    steps.push({ b1: [b1[0], b1[1]], b2: [b2[0], b2[1]] });
  }
  return steps;
}

export function badBasis(): Basis {
  const fallback: Basis = { b1: [3, 1], b2: [2, 1] };
  for (let attempt = 0; attempt < 60; attempt++) {
    let b1: Vec = [1, 0];
    let b2: Vec = [0, 1];
    for (let i = 0; i < 3; i++) {
      const q = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
      if (Math.random() < 0.5) b2 = [b2[0] + q * b1[0], b2[1] + q * b1[1]];
      else b1 = [b1[0] + q * b2[0], b1[1] + q * b2[1]];
    }

    if (b1[0] + b2[0] < 0) {
      b1 = [-b1[0], -b1[1]];
      b2 = [-b2[0], -b2[1]];
    }
    const big = Math.max(...b1.map(Math.abs), ...b2.map(Math.abs));
    const cos = dot(b1, b2) / (norm(b1) * norm(b2));
    if (big >= 2 && big <= 3 && cos > 0.93 && norm(b1) >= 2 && norm(b2) >= 2) return { b1, b2 };
  }
  return fallback;
}

export interface View {
  scale: number;
  ox: number;
  oy: number;
}

export const UNITS_ACROSS = 6.2;

export function heroView(w: number, h: number): View {

  return { scale: Math.min(w, h) / UNITS_ACROSS, ox: w * 0.45, oy: h * 0.5 };
}

function css(el: Element, prop: string): string {
  return getComputedStyle(el).getPropertyValue(prop).trim();
}

function fit(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 4) return;
  const head = Math.min(9, len * 0.35);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
  ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fill();
}

export function drawBackground(canvas: HTMLCanvasElement, basis: Basis) {
  const f = fit(canvas);
  if (!f) return;
  const { ctx, w, h } = f;
  ctx.clearRect(0, 0, w, h);

  const cellRaw = css(document.documentElement, '--cell');
  const scale = parseFloat(cellRaw) || 34;
  const ox = w / 2;
  const oy = h / 2;
  const line = css(document.documentElement, '--lattice-line') || 'rgba(0,0,0,.08)';

  const reach = Math.hypot(w, h) / scale;
  const span = reach * 1.6;
  const area = Math.abs(det(basis));

  ctx.strokeStyle = line;
  ctx.lineWidth = 1;

  const MIN_GAP = 26;
  const family = (along: Vec, across: Vec) => {
    const len = norm(along);
    if (len < 1e-6 || area === 0) return;
    const gapPx = (area / len) * scale;
    const stride = Math.max(1, Math.ceil(MIN_GAP / gapPx));
    const count = Math.ceil(reach / Math.max(0.4, norm(across))) + 2;
    const ux = (along[0] / len) * span;
    const uy = (along[1] / len) * span;
    for (let k = -count; k <= count; k += stride) {
      const cx = across[0] * k;
      const cy = across[1] * k;
      ctx.beginPath();
      ctx.moveTo(ox + (cx - ux) * scale, oy - (cy - uy) * scale);
      ctx.lineTo(ox + (cx + ux) * scale, oy - (cy + uy) * scale);
      ctx.stroke();
    }
  };
  family(basis.b1, basis.b2);
  family(basis.b2, basis.b1);
}

function nodes(basis: Basis, view: View, w: number, h: number): Vec[] {
  const d = det(basis);
  if (d === 0) return [];
  const { b1, b2 } = basis;

  const coords = (sx: number, sy: number) => {
    const x = (sx - view.ox) / view.scale;
    const y = (view.oy - sy) / view.scale;
    return [(x * b2[1] - y * b2[0]) / d, (b1[0] * y - b1[1] * x) / d] as const;
  };
  const corners = [coords(0, 0), coords(w, 0), coords(0, h), coords(w, h)];
  const lo = (k: 0 | 1) => Math.floor(Math.min(...corners.map((c) => c[k]))) - 1;
  const hi = (k: 0 | 1) => Math.ceil(Math.max(...corners.map((c) => c[k]))) + 1;
  const i0 = lo(0);
  const i1 = hi(0);
  const j0 = lo(1);
  const j1 = hi(1);

  if ((i1 - i0 + 1) * (j1 - j0 + 1) > 20000) return [];

  const out: Vec[] = [];
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      out.push([i * b1[0] + j * b2[0], i * b1[1] + j * b2[1]]);
    }
  }
  return out;
}

export function drawHero(canvas: HTMLCanvasElement, basis: Basis, lattice: Basis = basis) {
  const f = fit(canvas);
  if (!f) return;
  const { ctx, w, h } = f;
  ctx.clearRect(0, 0, w, h);

  const root = document.documentElement;
  const dotColor = css(root, '--lattice-dot') || 'rgba(0,0,0,.25)';
  const ink = css(root, '--ink') || '#16283c';
  const ink2 = css(root, '--ink-2') || '#4a5f70';
  const accent = css(root, '--accent') || '#b02334';

  const view = heroView(w, h);
  const px = (v: Vec) => [view.ox + v[0] * view.scale, view.oy - v[1] * view.scale] as const;

  const p0 = px([0, 0]);
  const p1 = px(basis.b1);
  const p2 = px([basis.b1[0] + basis.b2[0], basis.b1[1] + basis.b2[1]]);
  const p3 = px(basis.b2);
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.1;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = dotColor;
  for (const node of nodes(lattice, view, w, h)) {
    const [x, y] = px(node);
    if (x < -4 || y < -4 || x > w + 4 || y > h + 4) continue;
    const origin = node[0] === 0 && node[1] === 0;
    ctx.beginPath();
    ctx.arc(x, y, origin ? 2.4 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const draw = (v: Vec, color: string, label: string) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    const [x, y] = px(v);
    arrow(ctx, p0[0], p0[1], x, y);
    const off = 12;
    const len = Math.hypot(x - p0[0], y - p0[1]) || 1;
    ctx.font = `italic 14px ${css(document.body, 'font-family') || 'serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + ((x - p0[0]) / len) * off, y + ((y - p0[1]) / len) * off);
  };
  draw(basis.b1, ink, 'b₁');
  draw(basis.b2, ink2, 'b₂');
}

export function metrics(basis: Basis, step: number, total: number, labels: { det: string; step: string }) {
  const d = Math.abs(det(basis));
  return (
    `‖b₁‖ ${norm(basis.b1).toFixed(2)}` +
    ` ‖b₂‖ ${norm(basis.b2).toFixed(2)}` +
    ` |${labels.det}| <em>${d}</em>` +
    ` ${labels.step} ${step}/${total}`
  );
}
