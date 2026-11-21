// Vice City sunset grade for PUERTO CANDELA Cover Studio: a per-photo filter
// boost, a purple -> magenta -> orange wash, a vignette and optional grain.

/** Canvas filter string for a photo at grade intensity `t` (0..1). */
export function photoFilterForGrade(t) {
  const saturate = 1 + 0.55 * t;
  const contrast = 1 + 0.22 * t;
  const brightness = 1 + 0.04 * t;
  return `saturate(${saturate.toFixed(3)}) contrast(${contrast.toFixed(3)}) brightness(${brightness.toFixed(3)})`;
}

/** Builds the sunset wash gradient for a rect: dusk purple to neon orange. */
export function sunsetWashGradient(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w * 0.25, y + h);
  g.addColorStop(0, 'rgba(43, 16, 84, 0.55)');
  g.addColorStop(0.38, 'rgba(124, 32, 140, 0.28)');
  g.addColorStop(0.66, 'rgba(232, 54, 132, 0.30)');
  g.addColorStop(1, 'rgba(255, 122, 26, 0.42)');
  return g;
}

/** Paints the sunset wash over a rect, scaled by grade intensity `t`. */
export function applySunsetWash(ctx, x, y, w, h, t) {
  if (t <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, t);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = sunsetWashGradient(ctx, x, y, w, h);
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = sunsetWashGradient(ctx, x, y, w, h);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Darkens the corners of a rect with a soft radial vignette. */
export function applyVignette(ctx, x, y, w, h, strength) {
  if (strength <= 0) return;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  g.addColorStop(0, 'rgba(10, 2, 24, 0)');
  g.addColorStop(1, `rgba(10, 2, 24, ${(0.5 * strength).toFixed(3)})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// A small shared noise tile, drawn once and patterned over the cover for grain.
let grainTile = null;

/** Creates (once) a 128px monochrome noise tile for the film grain pass. */
export function getGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(128, 128);
  let seed = 1234567;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = 96 + (seed % 96);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainTile = tile;
  return tile;
}

/** Overlays film grain on a rect at grade intensity `t`. */
export function applyFilmGrain(ctx, x, y, w, h, t) {
  if (t <= 0.05) return;
  ctx.save();
  ctx.globalAlpha = 0.05 + 0.08 * t;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** A drawn fallback scene for an empty panel: sunset sky, palms, sea band. */
export function drawPlaceholderScene(ctx, x, y, w, h, slot) {
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#2b1054');
  sky.addColorStop(0.55, '#c22a7d');
  sky.addColorStop(1, '#ff8c2e');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 214, 120, 0.9)';
  ctx.beginPath();
  ctx.arc(x + w * (0.3 + 0.14 * (slot % 3)), y + h * 0.62, Math.min(w, h) * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12041f';
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  drawPalmSilhouette(ctx, x + w * 0.16, y + h * 0.8, h * 0.42);
  drawPalmSilhouette(ctx, x + w * 0.86, y + h * 0.82, h * 0.34);
}

/** Draws a simple palm-tree silhouette with its base at (x, y). */
export function drawPalmSilhouette(ctx, x, y, height) {
  ctx.save();
  ctx.strokeStyle = '#12041f';
  ctx.fillStyle = '#12041f';
  ctx.lineWidth = Math.max(2, height * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + height * 0.08, y - height * 0.6, x + height * 0.2, y - height);
  ctx.stroke();
  const topX = x + height * 0.2;
  const topY = y - height;
  for (let i = 0; i < 6; i += 1) {
    const a = Math.PI * (0.08 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * height * 0.3,
      topY - Math.sin(a) * height * 0.22 - height * 0.05,
      topX + Math.cos(a) * height * 0.44,
      topY - Math.sin(a) * height * 0.1 + height * 0.1,
    );
    ctx.stroke();
  }
  ctx.restore();
}
