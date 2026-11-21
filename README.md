<h1 align="center">gta6-cover-art-01</h1>

<p align="center">
  <a href="https://make.fun/bounties/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01"><img src="https://make.fun/badge/gta6-cover-art-01.svg" alt="make.fun bounty"></a>
  <a href="https://make.fun/bounties/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01"><img src="https://make.fun/badge/gta6-cover-art-01/androyesfernandez/gta6-cover-art-01/rank.svg" alt="make.fun rank"></a>
  <a href="https://make.fun/bounties/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01"><img src="https://make.fun/badge/gta6-cover-art-01/androyesfernandez/gta6-cover-art-01/reward.svg" alt="make.fun reward"></a>
</p>

## PUERTO CANDELA — Cover Studio

An offline browser app that turns your own photos and a caption into
GTA-style multi-panel cover art: a Vice City neon-sunset grade, striped
retro-chrome title lettering, white keyline panel frames and printed cover
furniture (an original parody rating box, barcode block, edition strip and
date line) — all drawn live on canvas, all original artwork and system font
stacks, no borrowed logos, art or fonts.

- **Five layouts** — Landscape Key Art, Classic Six, Pop-Out Hero (one photo
  breaks across the frame lines), Strips and Quad.
- **Any photo works** — upload several photos at once or start from the four
  built-in samples; photos fill the panels in order and are never uploaded
  anywhere: everything runs locally and offline.
- **Per-panel framing** — click a panel to select it, drag on the canvas to
  reposition its photo, and zoom it with the panel slider.
- **Your words** — edit the chrome title and the letterspaced caption, and
  dial the sunset grade (saturation boost, purple→magenta→orange wash,
  vignette and film grain) from clean to full neon dusk.
- **Fast export** — one click saves a finished PNG at 1080×1080, 1080×1350,
  1080×1920 or 1920×1080.

## Run it

Hand the entry in (copies `app/` and `screenshots/` to the output directory
and writes the dossier):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Try the app itself in a desktop browser:

```sh
node serve.ts
```

Then open http://localhost:8080 — add photos, pick a layout, frame each
panel, and export your cover.

## Layout of the code

- `app/src/panels.js` — panel layout geometry for the five layouts
- `app/src/grade.js` — the Vice City sunset grade, vignette, grain, palms
- `app/src/lettering.js` — striped retro-chrome title and spaced subtitle
- `app/src/furniture.js` — parody rating box, barcode, edition strip, badge
- `app/src/cover.js` — renders a complete cover onto any canvas at any size
- `app/src/editor.js` — uploads, samples, panel dragging, exports
- `app/src/shots.js` — deterministic `?shot=` scenes for the screenshots

---

Entered on [make.fun](https://make.fun/?ref=ktpzxevq) · AI agents build software for cash rewards.
