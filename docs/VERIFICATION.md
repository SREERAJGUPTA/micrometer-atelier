# Verification record

## Completed checks

- Production TypeScript check and Vite build pass.
- 15 automated tests pass (13 mechanical/reading tests and 2 offline-worker regression tests). One uses an independent integer-micrometre oracle to check 2,501 physical readings × 21 signed offsets = **52,521 exact cases**. Those cases are internal sweeps, not additional test counts.
- 4,000 seeded specimen cases check determinism, supported range and 0.01 mm lattice compatibility across wire, sphere, sheet and block.
- Fixed examples include 4.55 mm half-step reading; 7.37 mm indication with +0.03 mm error; 7.87 mm indication with −0.02 mm error; closed-face negative rollover; boundaries; continuous off-lattice motion; contact; lock; ratchet slip; and immutable assessed snapshots.
- Browser observations verify cabinet selection, object placement, keyboard contact clamping, linked SVG scale reading, positive zero-error configuration, lock-disabled controls, ratchet-contact feedback, full calculator verification, step-by-step working and frozen-view safeguards.
- The tested browser session measured a 1.76 mm wire, read sleeve 1.50 mm and thimble 29 after +0.03 mm error, and verified a corrected result of 1.76 mm.
- The movable lens was dragged and its actual SVG center changed from 570 to about 678 CSS viewBox units. Negative-zero checking displayed division 48 and an observed −0.02 mm at a physical gap of zero.
- Offline installation was exercised on the production build. After stopping the preview server, the page reloaded from its service-worker cache and an opening-control interaction changed the live reading from 10.37 to 10.38 mm. The initial preview-header Vary matching failure was repaired and rechecked.
- Sakura controls expose pause, resume, complete stop, density and reduced motion.

## Verification limits

The managed preview browser reports that WebGL contexts are disabled. Consequently the automatic vector fallback was observed, rather than the live 3D renderer. **3D appearance, GPU frame time, native canvas dragging, orbit/pinch behavior and device-level 3D performance are not visually verified here.** The 3D module type-checks and builds successfully. This limitation is not reported as a passed 3D test.

The desktop layout was visually inspected. CSS provides tablet/mobile layouts, but real tablet/touch-device acceptance and representative-student classroom usability testing were not performed. No 60 FPS, latency, scientific-instrument calibration accuracy, WCAG-conformance or photorealism percentage is claimed.

Offline package generation verifies a self-contained list of runtime files; a server-stopped browser reload and subsequent instrument interaction were observed. A complete browser-process restart, explicit network-disabled device testing and storage eviction scenarios still require independent acceptance on the target browser. Source references are optional external links and are not part of the offline curriculum.

## Suggested final acceptance on a WebGL-capable device

1. Inspect front, rear, top, spindle, thimble, sleeve and extreme zoom. Check text sharpness at the actual classroom projection size.
2. Rotate the thimble by one complete turn and confirm exactly 0.50 mm of travel. Compare the 3D reference-line division with the vector macroscope.
3. Measure all four specimen families and confirm no face penetration.
4. Close through the ratchet; after contact, confirm that it turns while spindle/thimble stop.
5. Confirm that locking the spindle does not prevent camera inspection. Reset view without changing the gap.
6. Inspect positive and negative zero error, including an empty-face check and subsequent corrected measurement.
7. Freeze the microscope and attempt verification; resume live and submit.
8. Start ordinary and zero-error challenges. Ensure answer summaries remain hidden before submission.
9. Test tablet pinch/orbit, thimble dragging, cancellation and the accessible button alternatives.
10. Cache the production site until Offline ready; disconnect network, close/reopen browser, and visit each learning section.
11. Export CSV and open it in a spreadsheet. Confirm entered and reference values remain distinct.
12. Profile sustained manipulation on the actual school device and reduce pixel ratio/scene complexity if necessary. Keep the mathematical engine unchanged.
