// Editor wiring for PUERTO CANDELA Cover Studio: uploads, sample strip,
// panel selection and dragging, layout picker, wording, grade and exports.

import { LAYOUTS, getPanelLayout, panelIndexAtPoint, allPanelRects } from './panels.js';
import { createCoverState, panelTransform, renderCover, exportCoverPng } from './cover.js';

export const SAMPLE_PHOTOS = [
  { file: 'samples/boulevard.jpg', label: 'Boulevard' },
  { file: 'samples/pier.jpg', label: 'Pier' },
  { file: 'samples/neon.jpg', label: 'Neon Night' },
  { file: 'samples/beach.jpg', label: 'Sunset Beach' },
];

export const EXPORT_SIZES = [
  { w: 1080, h: 1080, label: 'PNG 1080 × 1080' },
  { w: 1080, h: 1350, label: 'PNG 1080 × 1350' },
  { w: 1080, h: 1920, label: 'PNG 1080 × 1920' },
  { w: 1920, h: 1080, label: 'PNG 1920 × 1080' },
];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Builds the editor around the page's canvas and control elements. */
export function createEditor(els) {
  const state = createCoverState();
  const editor = {
    state,
    selected: 0,
    layout: null,
    redraw() {
      editor.layout = renderCover(els.canvas, state, { highlight: editor.selected });
      els.panelLabel.textContent = describeSelectedPanel(editor);
      syncZoomSlider(editor, els);
    },
  };

  els.upload.addEventListener('change', async () => {
    const files = [...els.upload.files].slice(0, 8);
    for (const file of files) {
      const img = await loadImageElement(URL.createObjectURL(file));
      state.photos.push(img);
      addStripThumb(els, img.src, file.name);
    }
    if (files.length) setStatus(els, `${state.photos.length} photo(s) on the cover — drag a panel to position it.`);
    editor.redraw();
  });

  els.title.addEventListener('input', () => { state.title = els.title.value; editor.redraw(); });
  els.subtitle.addEventListener('input', () => { state.subtitle = els.subtitle.value; editor.redraw(); });
  els.grade.addEventListener('input', () => { state.grade = Number(els.grade.value) / 100; editor.redraw(); });
  els.grain.addEventListener('change', () => { state.grain = els.grain.checked; editor.redraw(); });
  els.badge.addEventListener('change', () => { state.badge = els.badge.checked; editor.redraw(); });

  els.zoom.addEventListener('input', () => {
    const t = panelTransform(state, editor.selected);
    state.transforms.set(editor.selected, { ...t, zoom: Number(els.zoom.value) / 100 });
    editor.redraw();
  });

  buildLayoutPicker(els, state, editor);
  buildSampleStrip(els, state, editor);
  buildExportButtons(els, state);
  attachCanvasPointer(els, state, editor);
  return editor;
}

/** Human label for the selected panel, shown above the zoom slider. */
export function describeSelectedPanel(editor) {
  if (!editor.layout) return 'No panel selected';
  const rects = allPanelRects(editor.layout);
  const isHero = editor.layout.popOut && editor.selected === rects.length - 1;
  return `${isHero ? 'Pop-out hero' : `Panel ${editor.selected + 1}`} of ${rects.length} — drag to move, slide to zoom`;
}

/** Keeps the zoom slider in step with the selected panel's transform. */
export function syncZoomSlider(editor, els) {
  const t = panelTransform(editor.state, editor.selected);
  els.zoom.value = String(Math.round(t.zoom * 100));
}

/** One button per layout; the active one is marked for styling. */
export function buildLayoutPicker(els, state, editor) {
  LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn';
    btn.dataset.layout = layout.id;
    btn.innerHTML = `<strong>${layout.name}</strong><span>${layout.hint}</span>`;
    if (layout.id === state.layoutId) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.layoutId = layout.id;
      state.transforms.clear();
      editor.selected = 0;
      els.layoutPicker.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('active', b === btn));
      editor.redraw();
    });
    els.layoutPicker.appendChild(btn);
  });
}

/** Sample-photo strip: one click adds that photo to the cover. */
export function buildSampleStrip(els, state, editor) {
  SAMPLE_PHOTOS.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample-btn';
    const img = document.createElement('img');
    img.src = sample.file;
    img.alt = sample.label;
    const cap = document.createElement('span');
    cap.textContent = sample.label;
    btn.append(img, cap);
    btn.addEventListener('click', async () => {
      const loaded = await loadImageElement(sample.file);
      state.photos.push(loaded);
      addStripThumb(els, sample.file, sample.label);
      setStatus(els, `${sample.label} added — it fills the next panels.`);
      editor.redraw();
    });
    els.sampleStrip.appendChild(btn);
  });
}

/** Adds a thumbnail of a loaded photo to the "on the cover" strip. */
export function addStripThumb(els, src, label) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = label;
  img.title = label;
  img.className = 'strip-thumb';
  els.photoStrip.appendChild(img);
}

/** The four export buttons, one per common post size. */
export function buildExportButtons(els, state) {
  EXPORT_SIZES.forEach((size) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'export-btn';
    btn.textContent = size.label;
    btn.addEventListener('click', () => {
      exportCoverPng(state, size.w, size.h, `puerto-candela-${size.w}x${size.h}.png`);
      setStatus(els, `Saved puerto-candela-${size.w}x${size.h}.png`);
    });
    els.exportRow.appendChild(btn);
  });
}

/** Click selects a panel; dragging repositions that panel's photo. */
export function attachCanvasPointer(els, state, editor) {
  const canvas = els.canvas;
  let drag = null;
  const toCover = (event) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) / r.width) * canvas.width,
      y: ((event.clientY - r.top) / r.height) * canvas.height,
    };
  };
  canvas.addEventListener('pointerdown', (event) => {
    const p = toCover(event);
    const layout = getPanelLayout(state.layoutId, canvas.width, canvas.height);
    const idx = panelIndexAtPoint(layout, p.x, p.y);
    if (idx >= 0) editor.selected = idx;
    drag = { x: p.x, y: p.y, t: { ...panelTransform(state, editor.selected) } };
    canvas.setPointerCapture(event.pointerId);
    editor.redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const p = toCover(event);
    const dx = drag.t.dx + (p.x - drag.x) / canvas.width;
    const dy = drag.t.dy + (p.y - drag.y) / canvas.height;
    state.transforms.set(editor.selected, { ...drag.t, dx, dy });
    editor.redraw();
  });
  const end = () => { drag = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

/** Writes a short status line under the controls. */
export function setStatus(els, text) {
  if (els.status) els.status.textContent = text;
}

/** Loads the named sample photos into a state, in order. */
export async function loadSamplePhotos(state, files) {
  for (const file of files) {
    state.photos.push(await loadImageElement(file));
  }
}
