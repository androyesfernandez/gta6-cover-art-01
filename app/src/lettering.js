// Retro chrome lettering for PUERTO CANDELA Cover Studio: striped chrome
// title bands, a dark outline and drop shadow, and a letterspaced subtitle.
// System font stacks only — no shipped or borrowed typefaces.

export const TITLE_FONT_STACK = `'Arial Narrow', 'Liberation Sans Narrow', Impact, 'Franklin Gothic Medium', sans-serif`;
export const SUBTITLE_FONT_STACK = `'Helvetica Neue', Arial, 'Liberation Sans', sans-serif`;

// Horizontal chrome bands, top to bottom: ice, sky, magenta, sunset, gold.
export const CHROME_BANDS = ['#fdfdff', '#bfe9ff', '#5ec8f2', '#e84393', '#ff7a1a', '#ffd23e'];

/** Fits a font size so `text` spans at most `maxWidth` on `ctx`. */
export function fitFontSize(ctx, text, weight, maxWidth, startSize, stack) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${stack}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${stack}`;
  }
  return size;
}

/** Sets letterspacing where the canvas supports it (Chrome does). */
export function setLetterSpacing(ctx, px) {
  try { ctx.letterSpacing = `${px}px`; } catch { /* older canvas: ignore */ }
}

/**
 * Renders the striped chrome fill for `label` onto its own offscreen canvas
 * (bands masked by the glyphs there, never on the cover canvas itself).
 */
export function renderChromeTitleCanvas(label, w, size) {
  const layer = document.createElement('canvas');
  layer.width = Math.ceil(w);
  layer.height = Math.ceil(size * 1.24);
  const lctx = layer.getContext('2d');
  lctx.font = `900 ${size}px ${TITLE_FONT_STACK}`;
  lctx.textAlign = 'center';
  lctx.textBaseline = 'top';
  setLetterSpacing(lctx, size * 0.02);
  CHROME_BANDS.forEach((color, i) => {
    const bandY = (size * 1.06 * i) / CHROME_BANDS.length;
    lctx.fillStyle = color;
    lctx.fillRect(0, bandY, layer.width, size * 1.06 / CHROME_BANDS.length + 2);
  });
  lctx.globalCompositeOperation = 'destination-in';
  lctx.fillStyle = '#ffffff';
  lctx.fillText(label, layer.width / 2, 0);
  setLetterSpacing(lctx, 0);
  return layer;
}

/**
 * Draws the striped chrome title centred at (cx, topY).
 * Returns the y just below the title block.
 */
export function drawStripedChromeTitle(ctx, text, cx, topY, w) {
  const label = (text || 'PUERTO CANDELA').toUpperCase();
  const size = fitFontSize(ctx, label, 900, w * 0.94, w * 0.148, TITLE_FONT_STACK);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  setLetterSpacing(ctx, size * 0.02);
  // Drop shadow, then a heavy dark outline the chrome sits inside.
  ctx.font = `900 ${size}px ${TITLE_FONT_STACK}`;
  ctx.shadowColor = 'rgba(8, 0, 20, 0.65)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.07;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = '#160428';
  ctx.strokeText(label, cx, topY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // The chrome fill itself, pre-masked on its own layer.
  const layer = renderChromeTitleCanvas(label, w, size);
  ctx.drawImage(layer, cx - w / 2, topY);
  // A thin white keyline under the title, like a printed masthead rule.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(cx - w * 0.44, topY + size * 1.14, w * 0.88, Math.max(2, size * 0.03));
  ctx.restore();
  setLetterSpacing(ctx, 0);
  return topY + size * 1.28;
}

/** Draws the letterspaced condensed subtitle centred at (cx, y). */
export function drawSpacedSubtitle(ctx, text, cx, y, w) {
  const label = (text || '').toUpperCase();
  if (!label) return y;
  const size = fitFontSize(ctx, label, 700, w * 0.8, w * 0.042, SUBTITLE_FONT_STACK);
  ctx.save();
  ctx.font = `700 ${size}px ${SUBTITLE_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  setLetterSpacing(ctx, size * 0.42);
  ctx.shadowColor = 'rgba(8, 0, 20, 0.8)';
  ctx.shadowBlur = size * 0.3;
  ctx.fillStyle = '#ffe9f6';
  ctx.fillText(label, cx, y);
  ctx.restore();
  setLetterSpacing(ctx, 0);
  return y + size * 1.5;
}

/** Small corner credit line, e.g. the studio name on the spine edge. */
export function drawCreditLine(ctx, text, x, y, size) {
  ctx.save();
  ctx.font = `600 ${size}px ${SUBTITLE_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setLetterSpacing(ctx, size * 0.18);
  ctx.fillStyle = 'rgba(255, 233, 246, 0.9)';
  ctx.shadowColor = 'rgba(8,0,20,0.7)';
  ctx.shadowBlur = size * 0.4;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
  setLetterSpacing(ctx, 0);
}
