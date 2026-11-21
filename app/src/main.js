// Entry point for PUERTO CANDELA Cover Studio: builds the editor, preloads
// two samples so the first paint is already a cover, and hands ?shot= URLs
// to the deterministic screenshot scenes in ./shots.js.

import { createEditor, loadSamplePhotos } from './editor.js';
import { runShotScene } from './shots.js';

/** Collects the page elements the editor wires up, by id. */
export function collectEditorElements() {
  const byId = (id) => document.getElementById(id);
  return {
    canvas: byId('cover'),
    upload: byId('photo-upload'),
    title: byId('cover-title'),
    subtitle: byId('cover-subtitle'),
    grade: byId('grade-range'),
    grain: byId('grain-toggle'),
    badge: byId('badge-toggle'),
    zoom: byId('zoom-range'),
    panelLabel: byId('panel-label'),
    layoutPicker: byId('layout-picker'),
    sampleStrip: byId('sample-strip'),
    photoStrip: byId('photo-strip'),
    exportRow: byId('export-row'),
    status: byId('status'),
  };
}

/** Starts the app: a ?shot= scene when asked, otherwise the live editor. */
export async function startStudio() {
  const els = collectEditorElements();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShotScene(shot, els);
    return;
  }
  const editor = createEditor(els);
  await loadSamplePhotos(editor.state, ['samples/neon.jpg', 'samples/boulevard.jpg', 'samples/pier.jpg']);
  editor.redraw();
}

startStudio();
