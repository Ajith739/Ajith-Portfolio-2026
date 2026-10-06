# Portfolio implementation upgrade — 2026-10-06

The existing HTML template, fonts, spacing, sections, loader, day/night styling, GSAP effects, Lenis, and island/ocean/sky scene remain. Changes address implementation, lifecycle, responsiveness, and the requested experience content.

## A. Root causes

- Home's two resize handlers shared a timeout. Canvas recovery cancelled the responsive model update, leaving the island in its previous breakpoint configuration. Rendering was also unnecessarily stopped during resize.
- Pinned containers retained explicit widths from the previous viewport. Text splitting ran against those stale widths before refresh, making section heights differ from a fresh load. Independent SplitText resize observers compounded ordering problems.
- Sticky media's refresh callback overwrote ScrollTrigger's numeric `end` with a string after measurement.
- Matter rebuilt the world on every resize without stopping previous runners/RAF callbacks or clearing bodies, mouse handlers, constraints, events, and timers.
- Template modules, inline startup patches, ScrollTrigger's native resize handling, React, and Lenis each performed separate resize work.
- Cursor position had competing listeners/tweens; parallax used separate permanent RAF loops. Quality adaptation could only degrade once below 24 FPS and could not recover.
- A preload used the duplicate root GLB while the scene loaded the assets-directory copy.

## B. Files changed

- `index.html`: experience content, semantic employer/institution text, external-link rel attributes, Lenis scrolling authority, 320px body-width support, coordinator bootstrap, removal of delayed refresh patches.
- `src/pages/Home.jsx`, `src/engine/viewport.js`: shared responsive configuration, native Canvas rendering, visibility/reduced-motion lifecycle, invalidation, DPR ceiling, zero-delay size observation without scroll-position measurement.
- `public/js/viewport.js`: shared viewport/layout transaction and section-relative scroll preservation.
- `src/template/app.js`: readable template source, pin/text/physics/cursor/parallax lifecycles, navigation, small JS fixes. `public/js/app.min.js` is generated from this source.
- `src/engine/PerformanceEngine.js`, `src/hooks/useAdaptivePerformance.js`: sustained frame-time adaptation, hysteresis/recovery, separate resolution adjustment using actual rendered DPR, reduced-motion subscription, allocation-free frame sampling.
- `src/models/Ocean.jsx`, `src/models/Sky.jsx`, `src/models/beach.jsx`: geometry/material ownership, stable star buffers/draw ranges, time-based motion, reduced motion, shared preload URL.
- `src/index.css`: removal of unmeasured permanent will-change hints.
- Six existing public HTML pages: load the coordinator before the shared template script.
- `package.json`, `scripts/build-template.mjs`: reproducible template minification before the existing Vite build; original manual chunks retained.
- `scripts/check-performance.mjs`, `scripts/check-responsive.mjs`, `validation/*.json`: repeatable checks and measured results.

No dependency versions were upgraded. The separate README/contact-email edits were left intact.

## C. Resize/scroll architecture

Before: competing timers, blanket Canvas pauses, stale pin widths during text splitting, independent refresh calls, and complete physics reinitialization.

After: one shared viewport snapshot updates React/model/DPR state on RAF. Only expensive final layout work is debounced. Pins temporarily revert during the synchronous measurement/write transaction so responsive text and boundaries use normal-flow dimensions; pins restore before paint. After two RAFs, Lenis resizes, one application-owned ScrollTrigger refresh runs, Lenis resynchronizes, and section-relative scroll context is restored. GSAP's own matchMedia lifecycle remains responsible for creating/reverting desktop pins at the original 1200px template breakpoint; model breakpoints remain 768px/1280px.

Canvas stays mounted and renders at native browser cadence while visible. Hidden/offscreen/reduced-motion rendering uses demand mode, with explicit invalidation for theme/viewport changes. There are no fixed-FPS render timers.

## D. Performance fixes and measurements

Three stable geometry/wave quality tiers now respond to sustained measured frame times, with separate DPR steps, cooldowns, slow degradation, and longer recovery windows. Runtime measurements outweigh device guesses; phones are not automatically assigned LOW. Actual rendered DPR prevents ineffective resolution reductions when the device is already rendering at DPR 1. Shader variants are cached rather than continuously recompiled.

Cursor coordinates use one tracking listener and reusable setters/tween. Trails run only during relevant visible pointer interaction; parallax uses the existing GSAP ticker and updates when scroll changes. Decorative intervals and marquees respect visibility/reduced motion. All 3D movement follows elapsed time/delta.

Chrome CDP trace after three repeated breakpoint cycles, with the hero offscreen and gravity section active:

| Measurement | Baseline | Upgrade |
|---|---:|---:|
| Physics worlds/runners | 29 / 29 | 1 / 1 |
| Pending RAF callbacks at sample | 62 | 3 |
| Invalid ScrollTrigger ends | 1 | 0 |
| Animation callbacks during ~2s trace | 7,816 | 613 |
| CDP script duration during trace | 807ms | 43ms |
| RAF median interval | 16.7ms | 16.7ms |
| RAF p95 interval | 16.7ms | 16.8ms |

These are single local observations, not a controlled cross-device benchmark. Baseline used its original Vite implementation; upgrade used the production preview. Both ran in installed headless Chrome on this Mac. Reduced callback/script overhead is supported; higher FPS is not demonstrated by this roughly 60Hz environment. No GPU utilization or physical 120/144/165Hz measurement was available. Heap deltas are recorded but are not used to claim leak elimination.

Raw CDP traces are retained as `validation/before-trace.json.gz` and `validation/after-trace.json.gz`; decompress and import into Chrome Performance for inspection.

## E. Memory/event-loop fixes

Matter retains one world per section and resizes boundaries/bodies. Visibility pauses its runner and custom drawing RAF. Cleanup stops the runner, cancels RAF/top-boundary timer, detaches Matter/DOM/mouse events, removes the constraint/world, clears the engine, and resets references/arrays. Touch handlers that intercepted native scrolling were removed from decorative mouse dragging.

Repeated resizing does not add worlds, cursor listeners, canvases, or duplicate custom loops. Owned split animations revert before replacement. Canvas observers and theme/performance subscriptions clean up. During DPR 2 desktop/mobile cycles, GPU geometry/texture counts stayed at 441/18; programs warmed from 18 to 20 and then stayed at 20. Repeated theme switching also kept geometry/texture counts stable for the active theme. Simulated visibility changed Canvas from always to demand and back to always.

## F. 3D optimizations

Static matrices, material caching, GPU stars, wave/cloud tiers, and the Gerstner shader remain. Star buffers are stable across quality changes; draw ranges select the count. Replaced ocean geometries and owned cloned/cloud materials dispose correctly. Theme switches reuse cached materials. Crab updates no longer depend on alternate frame counting. Canvas DPR caps are 1.5 for mobile and 2 otherwise, bounded by native DPR and measured adaptation.

The active model was inspected: 496 meshes, 11 materials, five PNG images, no embedded animations, and KHR_materials_transmission. It remains byte-for-byte unchanged, including materials/UVs and existing attribution. The scene's custom boat/crab/flag/tree animations remain. Most transfer size is geometry; decoder-based compression or structural mesh optimization deserves a separate visual-validation pass rather than an unsupported decoder change here.

## G. Content changes

Gracewell Technologies Pvt Ltd — 08/2026 - Present — appears first in the existing resume grid. No job title, responsibilities, URL, or metrics were invented. Shastika Software Solution Pvt Ltd now reads 02/2026 - 04/2026. Other experience dates remain unchanged. Employer/institution names without destinations use semantic text with the template typography.

## H. Removed file

`public/pirate_island.glb` was removed after its preload moved to `/assets/3d/pirate_island.glb` and source/runtime references to the root URL were eliminated. Both originals were identical: 13,808,364 bytes each, SHA-256 `9720847f688d355cf59ce0ff50f7a9e9f46657bad66916769adef83e36a1453f`. The active assets-directory file still has that hash. This removes 13.81MB of duplicate distribution data and avoids the separate preload transfer.

## I. Build/lint

- `npm install`: passed; no dependency migration.
- `npm run build`: passed; 611 modules transformed. Existing classic-public-script/CSS resolution notices and dependency eval warnings remain.
- `npm run lint`: cannot run because the repository has no ESLint configuration; no rules were globally disabled to conceal this.
- Targeted ESLint checks for undefined identifiers, JSX usage, and hooks passed on changed application/template/coordinator/build/performance-check code.
- `node scripts/check-performance.mjs`: passed sustained 60/90/120/144/165Hz timestamp simulations, degradation, recovery, refresh-estimate reset, and resume-stall handling. These test adaptation logic, not physical display rendering.
- `git diff --check`: passed.

## J. Responsive validation

Production preview passed direct-load versus resized comparisons at every requested size:

320x568, 360x800, 375x812, 390x844, 412x915, 430x932, 600x960, 768x1024, 820x1180, 1024x768, 1024x1366, 1280x720, 1366x768, 1440x900, 1536x864, 1920x1080, 2560x1440.

All page/section heights matched, with zero horizontal overflow, matching pin/trigger counts, correct canvas widths/hero heights, and numeric trigger positions. Tests included three combined repetitions of the requested breakpoint sequences, arbitrary drag resizing, portrait/landscape/portrait, theme, reduced motion, menu, and Lenis anchor navigation. All six secondary HTML pages also passed load/resize smoke checks without uncaught page errors. Separate DPR 2 checks returned desktop DPR 2/mobile DPR 1.5 and correct island scales 1.5/1.2; tablet scale/position was also inspected. Mobile Chrome emulation at DPR 3 produced native touch scrolling and hid desktop cursor effects. Visibility testing was simulated through the document event/lifecycle.

Re-run the browser checks with a separately installed Playwright package and a running preview:

```sh
QA_URL=http://127.0.0.1:4173/ \
QA_PLAYWRIGHT=/path/to/playwright/index.mjs \
QA_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
QA_REPORT=/tmp/responsive-results.json \
node scripts/check-responsive.mjs
```

Use `QA_OFFLINE_FONTS=1` only when reproducing this environment's unavailable Google Fonts. The QA dependency was installed outside this project's dependencies.

## K. Remaining risks/recommendations

- Google Fonts was unreachable here. Browser comparisons used the same fallback on both sides; font declarations/assets were preserved, but a final visual pass with Manrope/JetBrains Mono loaded is still recommended.
- Six original image references are missing: blog previews pr-01/pr-02/pr-03 and divider backgrounds dv04/dv05/dv10. Their resource errors remain. No replacement/dummy images were invented. Restore the actual intended assets.
- Existing Download CV #0 links and blog links back to index still need real destinations/assets from the owner. They were not replaced with invented URLs.
- No React/Three/WebGL/GSAP exceptions or uncaught page errors were observed in tested upgrade flows; the console still reports the missing resources and inaccessible fonts above.
- Physical iOS/Android address-bar behavior, Safari, real 120–165Hz displays, GPU utilization, and long-duration heap behavior require device testing. Chrome emulation and timestamp simulations cannot certify these.
- The active 13.81MB model remains substantial. A separately reviewed glTF optimization/decoder workflow may improve transfer/render cost while preserving licensing and fidelity.
- An operational ESLint configuration remains a separate repository maintenance item.

## L. Scores out of 10

Engineering assessments based on inspection and the local checks above; these are not standardized benchmark or accessibility certification scores.

| Area | Before | After |
|---|---:|---:|
| Responsiveness | 4 | 9 |
| Scroll smoothness | 5 | 8 |
| High-refresh performance architecture | 4 | 7.5 |
| 3D performance | 6 | 7.5 |
| Maintainability | 4 | 8 |
| Accessibility | 5 | 6.5 |
| Overall portfolio quality | 6 | 8 |
