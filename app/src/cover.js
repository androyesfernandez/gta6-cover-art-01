// Complete cover renderer for PUERTO CANDELA Cover Studio: panels + photos
// with per-panel zoom/offset, the Vice City sunset grade, chrome lettering
// and printed furniture, drawn onto any canvas at any size.

import { getPanelLayout, allPanelRects, KEYLINE } from './panels.js';
import {
  photoFilterForGrade, applySunsetWash, applyVignette, applyFilmGrain, drawPlaceholderScene,
} from './grade.js';
import { drawStripedChromeTitle, drawSpacedSubtitle, drawCreditLine } from './lettering.js';
import {
  drawParodyRatingBox, drawBarcodeBlock, drawEditionStrip, drawDateLine, drawStarburstBadge,
} from './furniture.js';

/** A fresh cover state: photos, per-panel transforms and wording. */
export function createCoverState() {
  return {
    title: 'PUERTO CANDELA',
    subtitle: 'SUNSET HEIST',
    layoutId: 'keyart',
    grade: 0.75,
    grain: true,
    badge: true,
    photos: [], // loaded images, in strip order
    transforms: new Map(), // rect index -> { zoom, dx, dy } in cover fractions
  };
}

/** The transform for one panel rect, defaulting to a centred cover fit. */
export function panelTransform(state, rectIndex) {
  return state.transforms.get(rectIndex) ?? { zoom: 1, dx: 0, dy: 0 };
}

/** Photo assigned to a rect: its slot cycles through the loaded photos. */
export function photoForRect(state, rect) {
  if (!state.photos.length) return null;
  return state.photos[rect.slot % state.photos.length];
}

/** Draws one photo into a rect with cover-fit, zoom and drag offset. */
export function drawPhotoInPanel(ctx, photo, rect, transform, gradeT) {
  const baseScale = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const scale = baseScale * transform.zoom;
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const px = rect.x + (rect.w - pw) / 2 + transform.dx * rect.w;
  const py = rect.y + (rect.h - ph) / 2 + transform.dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = photoFilterForGrade(gradeT);
  ctx.drawImage(photo, px, py, pw, ph);
  ctx.filter = 'none';
  applySunsetWash(ctx, rect.x, rect.y, rect.w, rect.h, gradeT);
  ctx.restore();
}

/** Draws every panel of the layout, then the pop-out hero across the frames. */
export function drawAllPanels(ctx, state, w, h) {
  const layout = getPanelLayout(state.layoutId, w, h);
  const rects = allPanelRects(layout);
  rects.forEach((rect, i) => {
    const photo = photoForRect(state, rect);
    if (photo) {
      drawPhotoInPanel(ctx, photo, rect, panelTransform(state, i), state.grade);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      drawPlaceholderScene(ctx, rect.x, rect.y, rect.w, rect.h, rect.slot);
      applySunsetWash(ctx, rect.x, rect.y, rect.w, rect.h, state.grade * 0.7);
      ctx.restore();
    }
  });
  return layout;
}

/** White keyline frames around every panel, plus the outer cover frame. */
export function drawKeylineFrames(ctx, layout, w, h) {
  const line = Math.max(3, w * KEYLINE);
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = line;
  ctx.shadowColor = 'rgba(10, 0, 24, 0.45)';
  ctx.shadowBlur = line * 0.8;
  allPanelRects(layout).forEach((rect) => {
    ctx.strokeRect(rect.x + line / 2, rect.y + line / 2, rect.w - line, rect.h - line);
  });
  ctx.lineWidth = line * 1.6;
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

/** Highlights the editor's selected panel with a neon outline. */
export function drawSelectionHighlight(ctx, layout, selectedIndex, w) {
  const rects = allPanelRects(layout);
  const rect = rects[selectedIndex];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#22e6ff';
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.setLineDash([w * 0.02, w * 0.012]);
  ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
  ctx.restore();
}

/**
 * Renders a complete cover from `state` onto `canvas` at its own size.
 * `options.highlight` (an editor rect index) draws the selection outline.
 */
export function renderCover(canvas, state, options = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#160428';
  ctx.fillRect(0, 0, w, h);
  const layout = drawAllPanels(ctx, state, w, h);
  drawKeylineFrames(ctx, layout, w, h);
  applyVignette(ctx, 0, 0, w, h, 0.55);
  if (state.grain) applyFilmGrain(ctx, 0, 0, w, h, state.grade);
  // Lettering block across the top: credit line first, then the title.
  const creditSize = Math.max(11, w * 0.015);
  drawCreditLine(ctx, 'Candela Cover Studio', w * 0.035, h * 0.03 + creditSize, creditSize);
  const titleBottom = drawStripedChromeTitle(ctx, state.title, w / 2, h * 0.03 + creditSize * 1.7, w);
  drawSpacedSubtitle(ctx, state.subtitle, w / 2, titleBottom + h * 0.004, w);
  // Furniture along the bottom, above the edition strip.
  const stripH = h * 0.045;
  const boxSize = Math.min(w, h) * 0.115;
  drawParodyRatingBox(ctx, w * 0.032, h - stripH - boxSize * 1.18 - h * 0.025, boxSize);
  const barcodeW = Math.min(w * 0.17, 190);
  drawBarcodeBlock(ctx, w - barcodeW - w * 0.032, h - stripH - barcodeW * 0.42 - h * 0.025, barcodeW, barcodeW * 0.42);
  drawDateLine(ctx, w * 0.032 + boxSize * 1.3, h - stripH - h * 0.012, Math.max(10, w * 0.014));
  if (state.badge) drawStarburstBadge(ctx, w * 0.9, h * 0.3, Math.min(w, h) * 0.062, 'YOUR PHOTOS');
  drawEditionStrip(ctx, w, h, 'Puerto Candela — Sunset Edition');
  if (options.highlight != null && options.highlight >= 0) {
    drawSelectionHighlight(ctx, layout, options.highlight, w);
  }
  return layout;
}

/** Renders the cover onto an offscreen canvas at an export size. */
export function renderCoverAtSize(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas, state);
  return canvas;
}

/** Downloads a PNG of the cover at (w, h) through a temporary link. */
export function exportCoverPng(state, w, h, filename) {
  const canvas = renderCoverAtSize(state, w, h);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}
