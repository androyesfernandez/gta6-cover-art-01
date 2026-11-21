// Cover furniture for PUERTO CANDELA Cover Studio: the small printed matter
// that makes a poster read as a finished game cover. Every mark here is an
// original parody drawn in code — no real rating-board or publisher marks.

/** Original parody rating box ("LC — LEONIDA CLASSIC") at bottom-left. */
export function drawParodyRatingBox(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = '#f7f3ea';
  ctx.strokeStyle = '#14041f';
  ctx.lineWidth = size * 0.045;
  const r = size * 0.06;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size * 1.18, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#14041f';
  ctx.textAlign = 'center';
  ctx.font = `900 ${size * 0.52}px 'Arial Narrow', Impact, sans-serif`;
  ctx.fillText('LC', x + size / 2, y + size * 0.58);
  ctx.font = `700 ${size * 0.115}px Arial, sans-serif`;
  ctx.fillText('LEONIDA', x + size / 2, y + size * 0.82);
  ctx.fillText('CLASSIC', x + size / 2, y + size * 0.97);
  ctx.font = `600 ${size * 0.09}px Arial, sans-serif`;
  ctx.fillText('AGES 18+', x + size / 2, y + size * 1.11);
  ctx.restore();
}

/** Deterministic barcode block at (x, y): bars from a fixed seed pattern. */
export function drawBarcodeBlock(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#f7f3ea';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#14041f';
  let seed = 987654321;
  let bx = x + w * 0.06;
  const bottom = y + h * 0.78;
  while (bx < x + w * 0.92) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const barW = (1 + (seed % 3)) * (w * 0.012);
    if (seed % 3 !== 0) ctx.fillRect(bx, y + h * 0.1, barW, bottom - y - h * 0.1);
    bx += barW + w * 0.012;
  }
  ctx.font = `600 ${h * 0.16}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('8 901214 260606', x + w / 2, y + h * 0.95);
  ctx.restore();
}

/** Edition strip across the very bottom of the cover. */
export function drawEditionStrip(ctx, w, h, text) {
  const stripH = h * 0.045;
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#2b1054');
  g.addColorStop(0.5, '#a1185e');
  g.addColorStop(1, '#ff7a1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, h - stripH, w, stripH);
  ctx.font = `700 ${stripH * 0.44}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${stripH * 0.16}px`; } catch { /* ignore */ }
  ctx.fillStyle = '#ffffff';
  ctx.fillText((text || 'SUNSET EDITION').toUpperCase(), w / 2, h - stripH / 2 + 1);
  ctx.restore();
}

/** Date line printed under the edition strip's left corner. */
export function drawDateLine(ctx, x, y, size) {
  ctx.save();
  ctx.font = `600 ${size}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 233, 246, 0.92)';
  ctx.shadowColor = 'rgba(8,0,20,0.75)';
  ctx.shadowBlur = size * 0.5;
  ctx.fillText('LEONIDA  •  VICE SEASON  •  EST. 2026', x, y);
  ctx.restore();
}

/** "Featuring your photos" starburst badge, drawn top-right when asked. */
export function drawStarburstBadge(ctx, cx, cy, radius, text) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i += 1) {
    const r = i % 2 === 0 ? radius : radius * 0.78;
    const a = (Math.PI * i) / spikes;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd23e';
  ctx.fill();
  ctx.lineWidth = radius * 0.05;
  ctx.strokeStyle = '#14041f';
  ctx.stroke();
  ctx.fillStyle = '#14041f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${radius * 0.34}px 'Arial Narrow', Impact, sans-serif`;
  const words = text.split(' ');
  ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), 0, -radius * 0.18);
  ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), 0, radius * 0.2);
  ctx.restore();
}
