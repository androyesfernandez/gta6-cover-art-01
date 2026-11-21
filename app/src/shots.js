// Deterministic ?shot= scenes for the screenshots of PUERTO CANDELA Cover
// Studio. Each scene loads fixed samples, fixes the wording and layout,
// paints, then sets window.__shotReady. Cover scenes hide the editor so the
// shot is the exported cover exactly as the app draws it, full-bleed.

import { createEditor, loadSamplePhotos, addStripThumb, setStatus, SAMPLE_PHOTOS } from './editor.js';
import { renderCover } from './cover.js';

export const SHOT_SCENES = {
  keyart: {
    bodyClass: 'shot-cover',
    layoutId: 'keyart',
    title: 'PUERTO CANDELA',
    subtitle: 'SUNSET HEIST',
    grade: 80,
    photos: ['neon', 'boulevard', 'beach', 'pier'],
  },
  editor: {
    bodyClass: 'shot-editor',
    layoutId: 'keyart',
    title: 'PUERTO CANDELA',
    subtitle: 'SUNSET HEIST',
    grade: 75,
    photos: ['boulevard', 'neon', 'pier', 'beach'],
    selected: 1,
  },
  classic: {
    bodyClass: 'shot-cover',
    layoutId: 'classic',
    title: 'PUERTO CANDELA',
    subtitle: 'NEON CONFIDENTIAL',
    grade: 85,
    photos: ['pier', 'beach', 'neon', 'boulevard', 'neon', 'pier'],
  },
  square: {
    bodyClass: 'shot-cover',
    layoutId: 'popout',
    title: 'PUERTO CANDELA',
    subtitle: 'VICE SEASON',
    grade: 70,
    photos: ['beach', 'boulevard', 'pier', 'neon', 'beach'],
  },
};

/** Resolves a sample short name ('neon') to its file under samples/. */
export function sampleFile(shortName) {
  const found = SAMPLE_PHOTOS.find((s) => s.file === `samples/${shortName}.jpg`);
  return found ? found.file : `samples/${shortName}.jpg`;
}

/** Signals the capture script that the scene has painted. */
export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

/** Runs one ?shot= scene: 'keyart' | 'editor' | 'classic' | 'square'. */
export async function runShotScene(shotName, els) {
  const scene = SHOT_SCENES[shotName] ?? SHOT_SCENES.keyart;
  document.body.classList.add(scene.bodyClass);
  const editor = createEditor(els);
  const { state } = editor;
  state.layoutId = scene.layoutId;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.grade = scene.grade / 100;
  els.title.value = scene.title;
  els.subtitle.value = scene.subtitle;
  els.grade.value = String(scene.grade);
  await loadSamplePhotos(state, scene.photos.map(sampleFile));
  if (scene.bodyClass === 'shot-cover') {
    // The exported cover fills the whole frame at the capture size.
    els.canvas.width = window.innerWidth;
    els.canvas.height = window.innerHeight;
    renderCover(els.canvas, state);
  } else {
    scene.photos.forEach((name) => addStripThumb(els, sampleFile(name), name));
    setStatus(els, '4 photos on the cover — panel 2 selected, drag it on the canvas.');
    editor.selected = scene.selected ?? 0;
    editor.redraw();
  }
  markShotReady();
  return editor;
}
