# Precision Lab · Micrometer Atelier

A browser-local micrometer screw gauge laboratory inspired by the completed Precision Lab Vernier Caliper project. The reference ZIP was inspected; this is a separate application with its own instrument, mechanics, camera and learning interface.

## Open the finished build

The ZIP includes `dist/`, a complete production build. No Node installation or internet access is required to use this build.

**Windows with Python 3 installed:** extract the entire ZIP, open `micrometer-atelier`, and double-click `Start-Micrometer-Lab.cmd`. Keep the console open. The launcher serves the built files only on your own computer at `http://127.0.0.1:8766/`.

**macOS/Linux with Python 3:** run `python3 scripts/serve.py` inside the project directory.

Do not open `dist/index.html` directly through `file://`. ES modules and service workers need HTTP or HTTPS. The small local server is a file server, not an application backend.

## Develop and rebuild

Requirements: Node.js 20.19+ or 22.12+, npm.

```sh
npm ci
npm run develop
```

To check and produce the finished build:

```sh
npm test
npm run build
npm run dev
```

`npm run develop` uses Vite's development server. `npm run dev` previews the production `dist/` directory so offline installation can be checked against the actual build. Runtime assets are all local; package installation is the only step requiring the package registry.

## What works

- A procedurally modeled 0–25 mm outside micrometer in Three.js/React Three Fiber: beveled C frame, fixed anvil, rotating spindle, stationary sleeve, tapered thimble, knurled grips, ratchet and spindle lock.
- A scroll-driven gallery-to-bench transition with physically based metal, local studio-environment reflections, shadows and subtle idle camera motion.
- Orbit, wheel/pinch zoom, front/rear/top presets, independent camera lock, orientation reset and macro targets for sleeve, thimble and spindle. Reset view preserves the measurement.
- Linked screw travel: 0.5 mm per revolution, 50 thimble divisions, 0.01 mm least count. Physical travel remains continuous.
- Constrained placement of copper wire, metal sheet, gauge block and sphere specimens. A placed rigid specimen prevents face penetration.
- Ratchet approach and clutch slip: ratchet rotation can continue after contact while the spindle and thimble stop.
- A sharp vector reading room, using the same physical indication and division map as the 3D instrument. Cylindrical thimble projection, movable 2.7× lens, variable macro magnification, freeze/resume and full screen.
- Signed positive/negative zero error changes the sleeve-zero position and thimble phase without changing the physical measuring gap.
- Manual reading entry, targeted feedback, step-by-step working, guided first measurement and randomized challenges with answers hidden until submission.
- A thread cutaway, interactive part descriptions, an enlarged pitch explorer and zero-error demonstrations.
- Local measurement records and CSV export. No accounts, telemetry, external services or cloud processing.
- A continuous, visible pink sakura shower with depth cues, drifting, rotation, pause/resume, stop and density controls. The reading region has a central exclusion mask. Reduced motion is respected.
- Optional quiet synthesized mechanical audio, enabled only by user interaction.
- An automatic linked SVG fallback when WebGL 2 is unavailable. 3D-only controls are disabled in that mode; measurement and scale functions remain usable.

## Operate the instrument

1. Enter the laboratory and choose a specimen.
2. Place it between the faces; the canonical measuring fixture aligns it to the anvil.
3. Use coarse positioning for a quick opening, the thimble for rotation, or the fine buttons for a division at a time.
4. Drag the thimble vertically; hold Shift for finer movement. Drag the ratchet to drive it through its clutch. Upward drag opens, downward drag closes. Viewed from the ratchet end, clockwise closes and anticlockwise opens.
5. Use **Gently close with ratchet** for an automatic, idealized approach. Click again to pause. At contact, it slips.
6. Inspect the scale and enter your own sleeve, division, signed error and corrected result.
7. Verify, review the working, and export your notebook if useful.

The keyboard-accessible range, one-turn buttons, division buttons and Place object control provide alternatives to dragging. The camera lock and spindle lock have different jobs. The cutaway pauses measuring controls and removes the sleeve/thimble for explanation; reassemble before measuring.

## Scientific model

`src/domain.ts` owns one immutable mechanical snapshot. Its displacement drives the model, vector view, scale microscope, contact solver and answer checker.

- Measuring gap: `d` in millimetres, continuous over `[0, 25]`.
- Pitch: `p = 0.5 mm`; divisions: `N = 50`; least count: `p/N = 0.01 mm`.
- Indication: `i = d + e`, where `e` is signed zero error.
- Sleeve reading: `floor(i / p) × p`.
- Thimble division: `(i − sleeve) / LC`.
- Corrected reading: `i − e`.
- Physical spindle angle: `2πd/p`; thimble angle: `2π(d+e)/p`, giving a constant calibration phase offset while retaining linked motion.
- The physical thimble lip is at `9+d`; the sleeve zero engraving is at `9−e`. Their difference is the actual indication.

The mechanical model uses millimetres directly. For negative zero checks, floor-based decomposition handles rollover correctly: −0.02 mm corresponds to division 48, two divisions before zero. No fictitious negative sleeve graduations are printed. A signed negative calibration reading is explained separately from an ordinary positive measurement.

Continuous positions can fall between thimble graduations. The SVG and 3D geometry retain that position. Beginner specimens are generated on the 0.01 mm lattice so genuine exact readings are possible at contact. Quantized estimates do not move the physical model.

The instrument is an **ideal rotating-spindle outside micrometer**, not a digital or 0.001 mm Vernier micrometer. Specimens are rigid and aligned in a constrained fixture. Thermal expansion, backlash, compliance, contact pressure, Hertz deformation, free-body collisions, calibration uncertainty and damage are not simulated. Resolution is distinguished from accuracy. Contact is mathematically exact for the supported canonical shapes.

The visible surfaces use rasterized WebGL physically based rendering, local PMREM studio reflections and shadow maps. This is not real-time ray tracing. No device-specific frame-rate or photorealism claim has been measured. The app targets capable browsers and clamps pixel ratio to control rendering cost. Read `docs/VERIFICATION.md` for the actual validation limits.

## Static hosting and GitHub Pages

The production output uses relative URLs (`base: './'`). It can be deployed at a static root or a repository subpath.

**Ready-to-upload build:** upload the contents *inside* `dist/` to the chosen static web root, so `index.html`, `assets/`, `icon.svg`, `sw.js`, and `offline-manifest.json` sit together. Do not upload the ZIP as a website page.

**GitHub Pages from a branch:** put the contents of `dist/` at the root of a publishing branch (or inside the chosen `/docs` publishing folder), add an empty `.nojekyll` file, and select that branch/folder under **Settings → Pages**. The rest of this project can be kept in your source branch. The existing Vernier repository is not modified by this project.

**Local subpath check:** serve a parent folder containing the `dist` directory and visit `/dist/`, including its trailing slash. All JS, CSS, icons and service-worker assets use relative paths. A host should serve `index.html` as HTML and `.js` as JavaScript.

## Offline

On HTTPS hosting or localhost, click **Make available offline**. The app registers a versioned service worker and verifies that each required runtime asset exists in the cache before displaying **Offline ready**. Keep the initial connection available until that completes. Revisit the same URL without a network connection.

Offline storage is browser-local and can be removed by browser cache cleanup or storage eviction. External reference links require internet; the actual laboratory does not. For a fresh computer without a previous visit, use the supplied build and local launcher.

## Structure

- `src/domain.ts` — screw mechanics, specimens, signed scale mathematics and verification.
- `src/Instrument.tsx` — 3D geometry, materials, camera and instrument dragging.
- `src/Scale.tsx` — calibrated SVG scale, lens and no-WebGL fallback.
- `src/App.tsx` — classroom flows, controls, notebook, challenges and learning sections.
- `src/UI.tsx` — icons, specimen art and sakura.
- `src/platform.ts` — audio, local records, CSV and offline installation.
- `scripts/offline.mjs` — versioned self-contained offline package.
- `scripts/serve.py` — optional standard-library local launcher.
- `tests/domain.test.ts` — meaningful independent scale, mechanics and verification tests.

## References

- Mitutoyo, *Quick Guide to Precision Measuring Instruments — Micrometers*: https://www2.mitutoyo.co.jp/eng/products/menu/QuickGuide_Micrometers.pdf
- RMIT Learning Lab, *Reading a micrometer*: https://learninglab.rmit.edu.au/dlsweb/Toolbox/electrotech/toolbox1204/resources/03workshop/04measuring/06micrometer.htm
- IGNOU BPHCL-132 laboratory manual: https://egyankosh.ac.in/bitstream/123456789/64845/1/BPHCL-132%20E.pdf

Third-party runtime license texts are bundled in `public/third-party-licenses.txt` and the finished build.
