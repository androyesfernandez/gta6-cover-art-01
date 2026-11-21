// Panel layout geometry for PUERTO CANDELA Cover Studio.
// Every layout returns panel rectangles in cover coordinates plus an optional
// pop-out hero rectangle that is drawn across the frame lines afterwards.

export const KEYLINE = 0.006; // white frame thickness, as a fraction of cover width

/** Layout catalogue: id, display name, and the aspect it suits best. */
export const LAYOUTS = [
  { id: 'keyart', name: 'Landscape Key Art', hint: 'Hero left, story panels right' },
  { id: 'classic', name: 'Classic Six', hint: 'Portrait six-panel grid' },
  { id: 'popout', name: 'Pop-Out Hero', hint: 'One hero breaks the frame' },
  { id: 'strips', name: 'Strips', hint: 'Cinematic horizontal bands' },
  { id: 'quad', name: 'Quad', hint: 'Four equal panels' },
];

/** Splits a span into `count` equal cells separated by `gap`. */
export function splitSpan(start, size, count, gap) {
  const cells = [];
  const cell = (size - gap * (count - 1)) / count;
  for (let i = 0; i < count; i += 1) cells.push({ start: start + i * (cell + gap), size: cell });
  return cells;
}

/** Landscape Key Art: a wide hero panel with a column of three story panels. */
export function layoutKeyArt(w, h, gap) {
  const sideW = w * 0.34;
  const heroW = w - sideW - gap;
  const rows = splitSpan(0, h, 3, gap);
  return {
    panels: [
      { x: 0, y: 0, w: heroW, h, slot: 0 },
      ...rows.map((r, i) => ({ x: heroW + gap, y: r.start, w: sideW, h: r.size, slot: i + 1 })),
    ],
    popOut: null,
  };
}

/** Classic Six: a 2 x 3 portrait grid, the magazine-cover arrangement. */
export function layoutClassicSix(w, h, gap) {
  const cols = splitSpan(0, w, 2, gap);
  const rows = splitSpan(0, h, 3, gap);
  const panels = [];
  rows.forEach((r, ri) => cols.forEach((c, ci) => {
    panels.push({ x: c.start, y: r.start, w: c.size, h: r.size, slot: ri * 2 + ci });
  }));
  return { panels, popOut: null };
}

/** Pop-Out Hero: four background panels and one hero drawn over the frames. */
export function layoutPopOutHero(w, h, gap) {
  const cols = splitSpan(0, w, 2, gap);
  const rows = splitSpan(0, h, 2, gap);
  const panels = [];
  rows.forEach((r, ri) => cols.forEach((c, ci) => {
    panels.push({ x: c.start, y: r.start, w: c.size, h: r.size, slot: ri * 2 + ci + 1 });
  }));
  const heroW = w * 0.62;
  const heroH = h * 1.04;
  return {
    panels,
    popOut: { x: (w - heroW) / 2, y: h - heroH, w: heroW, h: heroH, slot: 0 },
  };
}

/** Strips: three cinematic horizontal bands of unequal height. */
export function layoutStrips(w, h, gap) {
  const weights = [0.42, 0.26, 0.32];
  const panels = [];
  let y = 0;
  weights.forEach((weight, i) => {
    const ph = i === weights.length - 1 ? h - y : Math.round(h * weight) - gap / 2;
    panels.push({ x: 0, y, w, h: ph, slot: i });
    y += ph + gap;
  });
  return { panels, popOut: null };
}

/** Quad: four equal panels in a 2 x 2 grid. */
export function layoutQuad(w, h, gap) {
  const cols = splitSpan(0, w, 2, gap);
  const rows = splitSpan(0, h, 2, gap);
  const panels = [];
  rows.forEach((r, ri) => cols.forEach((c, ci) => {
    panels.push({ x: c.start, y: r.start, w: c.size, h: r.size, slot: ri * 2 + ci });
  }));
  return { panels, popOut: null };
}

const BUILDERS = {
  keyart: layoutKeyArt,
  classic: layoutClassicSix,
  popout: layoutPopOutHero,
  strips: layoutStrips,
  quad: layoutQuad,
};

/** Resolves a layout id to its panel rectangles for a `w` x `h` cover. */
export function getPanelLayout(layoutId, w, h) {
  const build = BUILDERS[layoutId] ?? layoutKeyArt;
  const gap = Math.max(4, Math.round(w * KEYLINE * 2));
  return build(w, h, gap);
}

/** Returns the index of the panel under point (x, y), or -1. Pop-out wins. */
export function panelIndexAtPoint(layout, x, y) {
  const inside = (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  if (layout.popOut && inside(layout.popOut)) return layout.panels.length;
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    if (inside(layout.panels[i])) return i;
  }
  return -1;
}

/** All drawable rectangles of a layout: panels first, pop-out hero last. */
export function allPanelRects(layout) {
  return layout.popOut ? [...layout.panels, layout.popOut] : [...layout.panels];
}
